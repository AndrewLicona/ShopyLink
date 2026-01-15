import {
  Injectable,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.module';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Prisma } from '@repo/database';

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
    // Generate SKU if not provided
    const generatedSku =
      sku && sku.trim().length > 0
        ? sku.trim()
        : `SKU-${Math.random().toString(36).substr(2, 8).toUpperCase()}`;

    return this.prisma.$transaction(async (tx: any) => {
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

      // Handle Variants (Smart Sync)
      if (rest.variants && rest.variants.length > 0) {
        await tx.productVariant.createMany({
          data: rest.variants.map((v) => ({
            productId: product.id,
            name: v.name,
            price: v.price,
            stock: v.stock,
            sku: v.sku,
            image: v.image,
            useParentPrice: v.useParentPrice ?? false,
            useParentStock: v.useParentStock ?? false,
            images: v.images ?? [],
          })),
        });

        // If variants are used, we might want to sum up stock for the main product
        // or just rely on variants. For now, let's keep main stock separate or aggregated?
        // Typically if variants exist, main stock is just a cache or ignored.
        // Let's create an inventory record for the main product anyway (as total or default).
        // If user sets stock on main product AND variants, it's ambiguous.
        // Assuming if variants exist, main stock input is ignored or represents "general" stock.
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
        include: { inventory: true, variants: true } as any,
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

    // Usamos el SKU proporcionado o el actual, o generamos uno si no existe ninguno
    let finalSku = sku && sku.trim().length > 0 ? sku.trim() : product.sku;
    if (!finalSku || finalSku.trim().length === 0) {
      finalSku = `SKU-${Math.random().toString(36).substr(2, 8).toUpperCase()}`;
    }

    return this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      if (stock !== undefined) {
        await tx.inventory.upsert({
          where: { productId: id },
          create: { productId: id, stock },
          update: { stock },
        });
      }

      /* Variant Logic: Sync (Delete missing, Update existing, Create new) */
      if (productData.variants) {
        // 1. Get IDs of variants to keep (those that already have an ID)
        const variantIdsToKeep = productData.variants
          .filter((v) => v.id)
          .map((v) => v.id as string);

        // 2. Delete variants not in the list
        await tx.productVariant.deleteMany({
          where: {
            productId: id,
            id: { notIn: variantIdsToKeep },
          },
        });

        // 3. Upsert (Update or Create)
        for (const v of productData.variants) {
          if (v.id) {
            // Update existing
            await tx.productVariant.update({
              where: { id: v.id },
              data: {
                name: v.name,
                price: v.price,
                stock: v.stock,
                sku: v.sku,
                image: v.image,
                useParentPrice: v.useParentPrice ?? false,
                useParentStock: v.useParentStock ?? false,
                images: v.images ?? [],
              },
            });
          } else {
            // Create new
            await tx.productVariant.create({
              data: {
                productId: id,
                name: v.name,
                price: v.price,
                stock: v.stock,
                sku: v.sku,
                image: v.image,
                useParentPrice: v.useParentPrice ?? false,
                useParentStock: v.useParentStock ?? false,
                images: v.images ?? [],
              },
            });
          }
        }
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
        include: { inventory: true, variants: true } as any,
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
}
