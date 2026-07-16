import {
  Injectable,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../core/prisma/prisma.module';
import { RedisService } from '../../core/cache/redis.service';
import { hashCacheKey } from '../../core/cache/cache.util';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Prisma } from '@repo/database';
interface ProductVariantInput {
  id?: string;
  name: string;
  price?: number | string | Prisma.Decimal;
  stock: number;
  sku?: string;
  image?: string;
  useParentPrice?: boolean;
  useParentStock?: boolean;
  trackInventory?: boolean;
  images?: string[];
}

@Injectable()
export class ProductsService {
  constructor(
    private prisma: PrismaService,
    private cache: RedisService,
  ) {}

  async create(userId: string, createProductDto: CreateProductDto) {
    // Verify store ownership
    const store = await this.prisma.withRetry(() =>
      this.prisma.store.findUnique({
        where: { id: createProductDto.storeId },
      }),
    );

    if (!store) throw new NotFoundException('Store not found');
    if (store.userId !== userId)
      throw new ForbiddenException('You do not own this store');

    // Freemium Limit Check
    if (store.planType === 'FREE') {
      const productCount = await this.prisma.product.count({
        where: { storeId: createProductDto.storeId },
      });
      if (productCount >= 10) {
        throw new ForbiddenException(
          'Límite de 10 productos alcanzado en el plan Gratis. Actualiza a Pro para productos ilimitados.',
        );
      }
    }

    const { stock, sku, trackInventory, ...rest } = createProductDto;
    const generatedSku = this.generateSku(sku);

    const product = await this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const data: Prisma.ProductUncheckedCreateInput = {
        name: rest.name,
        description: rest.description,
        price: rest.price,
        discountPrice: rest.discountPrice,
        images: rest.images,
        sku: generatedSku,
        isActive: rest.isActive ?? true,
        trackInventory: trackInventory ?? true,
        storeId: rest.storeId,
        categoryId: rest.categoryId,
      };

      if (rest.baseVariantName) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        (data as any).baseVariantName = rest.baseVariantName;
      }

      const product = await tx.product.create({
        data,
      });

      if (rest.variants && rest.variants.length > 0) {
        await this.syncProductVariants(tx, product.id, rest.variants);
      }

      if (stock !== undefined) {
        await tx.inventory.create({
          data: {
            productId: product.id,
            stock: stock || 0,
          },
        });
      }

      return tx.product.findUnique({
        where: { id: product.id },
        include: { inventory: true, variants: true },
      });
    });

    await this.invalidateCatalogCaches(createProductDto.storeId);
    return product;
  }

  async updateStock(productId: string, userId: string, stock: number) {
    const product = await this.prisma.withRetry(() =>
      this.prisma.product.findUnique({
        where: { id: productId },
        include: { store: true },
      }),
    );
    if (!product) throw new NotFoundException('Product not found');
    if (product.store.userId !== userId)
      throw new ForbiddenException('You do not own this product');

    const result = await this.prisma.inventory.upsert({
      where: { productId },
      create: { productId, stock },
      update: { stock },
    });

    await this.invalidateCatalogCaches(product.store.id);
    return result;
  }

  async findAllByStore(storeId: string, onlyActive = false) {
    const where: Prisma.ProductWhereInput = { storeId };
    if (onlyActive) {
      where.isActive = true;
    }

    return this.prisma.withRetry(() =>
      this.prisma.product.findMany({
        where,
        include: { inventory: true, variants: true },
        orderBy: { createdAt: 'desc' },
      }),
    );
  }

  async findForMarketplace(filters: any) {
    const { category, q, ofertas } = filters;
    const cacheKey = await this.marketplaceCacheKey(filters);

    return this.cache.getOrSetJson(cacheKey, 180, async () => {
      const whereClause: any = {
        isActive: true,
        store: {
          isPublic: true,
        },
        AND: [
          {
            OR: [
              { trackInventory: false },
              { inventory: { stock: { gt: 0 } } },
              {
                variants: {
                  some: {
                    OR: [{ trackInventory: false }, { stock: { gt: 0 } }],
                  },
                },
              },
            ],
          },
        ],
      };

      if (ofertas === 'true') {
        (whereClause.AND as Prisma.ProductWhereInput[]).push({
          OR: [
            { discountPrice: { not: null } },
            {
              store: {
                globalDiscountActive: true,
                globalDiscountPercentage: { gt: 0 },
              },
            },
          ],
        });
      }

      if (category && category !== 'ofertas') {
        whereClause.store = {
          isPublic: true,
          marketplaceCategory: category,
        };
      }

      if (q) {
        const terms = q.split(/\s+/).filter(Boolean);
        if (terms.length > 0) {
          terms.forEach((term: string) => {
            (whereClause.AND as Prisma.ProductWhereInput[]).push({
              OR: [
                { name: { contains: term, mode: 'insensitive' } },
                { description: { contains: term, mode: 'insensitive' } },
                { store: { name: { contains: term, mode: 'insensitive' } } },
              ],
            });
          });
        }
      }

      const products = await this.prisma.withRetry(() =>
        this.prisma.product.findMany({
          where: whereClause,
          include: {
            store: {
              select: {
                name: true,
                slug: true,
                logoUrl: true,
                city: true,
                marketplaceCategory: true,
                globalDiscountActive: true,
                globalDiscountPercentage: true,
              },
            },
            inventory: true,
            variants: true,
          },
          orderBy: { createdAt: 'desc' },
          take: 1000,
        } as any),
      );

      return products.map((product) => {
        let discountPrice = product.discountPrice;
        const store = (product as any).store;
        if (
          store &&
          store.globalDiscountActive &&
          store.globalDiscountPercentage > 0 &&
          product.price
        ) {
          const globalDiscounted =
            Number(product.price) * (1 - store.globalDiscountPercentage / 100);
          if (!discountPrice || globalDiscounted < Number(discountPrice)) {
            discountPrice = new Prisma.Decimal(globalDiscounted) as any;
          }
        }
        return {
          ...product,
          discountPrice,
        };
      });
    });
  }

  async findOne(id: string) {
    const product = await this.prisma.withRetry(() =>
      this.prisma.product.findUnique({
        where: { id },
        include: { store: true, inventory: true, variants: true },
      }),
    );

    if (!product) return null;

    let discountPrice = product.discountPrice;
    const store = (product as any).store;
    if (store && store.globalDiscountActive && store.globalDiscountPercentage > 0 && product.price) {
      const globalDiscounted = Number(product.price) * (1 - store.globalDiscountPercentage / 100);
      if (!discountPrice || globalDiscounted < Number(discountPrice)) {
        discountPrice = new Prisma.Decimal(globalDiscounted) as any;
      }
    }

    return {
      ...product,
      discountPrice
    };
  }

  async update(id: string, userId: string, updateProductDto: UpdateProductDto) {
    const product = await this.prisma.withRetry(() =>
      this.prisma.product.findUnique({
        where: { id },
        include: { store: true },
      }),
    );
    if (!product) throw new NotFoundException('Product not found');
    if (product.store.userId !== userId)
      throw new ForbiddenException('You do not own this product');

    const { stock, sku, trackInventory, ...productData } = updateProductDto;

    const finalSku = this.generateSku(sku, product.sku || undefined);

    const updated = await this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      if (stock !== undefined) {
        await tx.inventory.upsert({
          where: { productId: id },
          create: { productId: id, stock },
          update: { stock },
        });
      }

      if (productData.variants) {
        await this.syncProductVariants(tx, id, productData.variants);
      }

      const data: Prisma.ProductUncheckedUpdateInput = {
        name: productData.name,
        description: productData.description,
        price: productData.price,
        discountPrice: productData.discountPrice,
        images: productData.images,
        sku: finalSku,
        isActive: productData.isActive,
        trackInventory:
          trackInventory !== undefined ? trackInventory : undefined,
        categoryId: productData.categoryId,
      };

      if (productData.baseVariantName) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        (data as any).baseVariantName = productData.baseVariantName;
      }

      return tx.product.update({
        where: { id },
        data,
        include: { inventory: true, variants: true },
      });
    });

    await this.invalidateCatalogCaches(product.store.id);
    return updated;
  }

  async remove(id: string, userId: string) {
    const product = await this.prisma.withRetry(() =>
      this.prisma.product.findUnique({
        where: { id },
        include: { store: true },
      }),
    );
    if (!product) throw new NotFoundException('Product not found');
    if (product.store.userId !== userId)
      throw new ForbiddenException('You do not own this product');

    const result = await this.prisma.product.delete({ where: { id } });
    await this.invalidateCatalogCaches(product.store.id);
    return result;
  }

  private generateSku(sku?: string, currentSku?: string): string {
    const finalSku = sku && sku.trim().length > 0 ? sku.trim() : currentSku;
    if (!finalSku || finalSku.trim().length === 0) {
      return `SKU-${Math.random().toString(36).substr(2, 8).toUpperCase()}`;
    }
    return finalSku;
  }

  private async syncProductVariants(
    tx: Prisma.TransactionClient,
    productId: string,
    variants: ProductVariantInput[],
  ) {
    const variantIdsToKeep = variants
      .filter((v) => v.id)
      .map((v) => v.id as string);

    await tx.productVariant.deleteMany({
      where: {
        productId,
        id: { notIn: variantIdsToKeep },
      },
    });

    for (const v of variants) {
      const data: Prisma.ProductVariantUncheckedCreateInput = {
        productId,
        name: v.name,
        price: v.price as Prisma.Decimal | number | undefined,
        stock: v.stock,
        sku: v.sku,
        image: v.image,
        useParentPrice: v.useParentPrice ?? false,
        useParentStock: v.useParentStock ?? false,
        images: v.images ?? [],
      };

      if (v.trackInventory !== undefined) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        (data as any).trackInventory = v.trackInventory;
      }

      if (v.id) {
        await tx.productVariant.update({
          where: { id: v.id },
          data,
        });
      } else {
        await tx.productVariant.create({
          data,
        });
      }
    }
  }

  private async invalidateCatalogCaches(storeId: string) {
    const store = await this.prisma.store.findUnique({
      where: { id: storeId },
      select: { slug: true },
    });

    if (store?.slug) {
      await this.cache.del(`publicStore:${store.slug}`, `publicStorePage:${store.slug}`);
    }

    await this.cache.incr(this.marketplaceVersionKey());
  }

  private marketplaceVersionKey() {
    return 'cache:marketplace:version';
  }

  private async marketplaceVersion() {
    const version = await this.cache.get<string>(this.marketplaceVersionKey());
    return version || '1';
  }

  private async marketplaceCacheKey(filters: Record<string, unknown>) {
    const version = await this.marketplaceVersion();
    return `marketplace:products:v${version}:${hashCacheKey('products', filters)}`;
  }
}
