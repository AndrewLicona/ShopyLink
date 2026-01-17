import {
  Injectable,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../core/prisma/prisma.module';
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
  constructor(private prisma: PrismaService) {}

  async create(userId: string, createProductDto: CreateProductDto) {
    // Verify store ownership
    const store = await this.prisma.store.findUnique({
      where: { id: createProductDto.storeId },
    });

    if (!store) throw new NotFoundException('Store not found');
    if (store.userId !== userId)
      throw new ForbiddenException('You do not own this store');

    const { stock, sku, trackInventory, ...rest } = createProductDto;
    const generatedSku = this.generateSku(sku);

    return this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const product = await tx.product.create({
        data: {
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
        },
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
  }

  async updateStock(productId: string, userId: string, stock: number) {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
      include: { store: true },
    });
    if (!product) throw new NotFoundException('Product not found');
    if (product.store.userId !== userId)
      throw new ForbiddenException('You do not own this product');

    return this.prisma.inventory.upsert({
      where: { productId },
      create: { productId, stock },
      update: { stock },
    });
  }

  async findAllByStore(storeId: string) {
    return this.prisma.product.findMany({
      where: { storeId },
      include: { inventory: true, variants: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    return this.prisma.product.findUnique({ where: { id } });
  }

  async update(id: string, userId: string, updateProductDto: UpdateProductDto) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: { store: true },
    });
    if (!product) throw new NotFoundException('Product not found');
    if (product.store.userId !== userId)
      throw new ForbiddenException('You do not own this product');

    const { stock, sku, trackInventory, ...productData } = updateProductDto;

    const finalSku = this.generateSku(sku, product.sku || undefined);

    return this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
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

      return tx.product.update({
        where: { id },
        data: {
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
        },
        include: { inventory: true, variants: true },
      });
    });
  }

  async remove(id: string, userId: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: { store: true },
    });
    if (!product) throw new NotFoundException('Product not found');
    if (product.store.userId !== userId)
      throw new ForbiddenException('You do not own this product');

    return this.prisma.product.delete({ where: { id } });
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
        trackInventory: v.trackInventory ?? true,
        images: v.images ?? [],
      };

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
}
