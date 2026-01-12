import {
  Injectable,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaClient) {}

  async create(userId: string, createProductDto: CreateProductDto) {
    // Verify store ownership
    const store = await this.prisma.store.findUnique({
      where: { id: createProductDto.storeId },
    });

    if (!store) throw new NotFoundException('Store not found');
    if (store.userId !== userId)
      throw new ForbiddenException('You do not own this store');

    const { stock, sku, ...rest } = createProductDto;
    // Generate SKU if not provided
    const generatedSku =
      sku && sku.trim().length > 0
        ? sku.trim()
        : `SKU-${Math.random().toString(36).substr(2, 8).toUpperCase()}`;
    const productData = { ...rest, sku: generatedSku };

    return this.prisma.$transaction(async (tx: any) => {
      const product = await tx.product.create({
        data: productData,
      });

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
        include: { inventory: true },
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
      include: { inventory: true },
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

    const { stock, sku, ...productData } = updateProductDto;

    // Si el producto no tiene SKU, generamos uno automáticamente
    let finalSku = product.sku;
    if (!finalSku || finalSku.trim().length === 0) {
      finalSku = `SKU-${Math.random().toString(36).substr(2, 8).toUpperCase()}`;
    }

    return this.prisma.$transaction(async (tx: any) => {
      if (stock !== undefined) {
        await tx.inventory.upsert({
          where: { productId: id },
          create: { productId: id, stock },
          update: { stock },
        });
      }

      return tx.product.update({
        where: { id },
        data: { ...productData, sku: finalSku },
        include: { inventory: true },
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
