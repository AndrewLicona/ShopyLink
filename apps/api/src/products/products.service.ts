
import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService {
    constructor(private prisma: PrismaClient) { }

    async create(userId: string, createProductDto: CreateProductDto) {
        // Verify store ownership
        const store = await this.prisma.store.findUnique({
            where: { id: createProductDto.storeId },
        });

        if (!store) throw new NotFoundException('Store not found');
        if (store.userId !== userId) throw new ForbiddenException('You do not own this store');

        return this.prisma.product.create({
            data: {
                ...createProductDto,
                inventory: createProductDto.stock ? {
                    create: { stock: createProductDto.stock }
                } : undefined
            },
            include: { inventory: true }
        });
    }

    async updateStock(productId: string, userId: string, stock: number) {
        const product = await this.prisma.product.findUnique({ where: { id: productId }, include: { store: true } });
        if (!product) throw new NotFoundException('Product not found');
        if (product.store.userId !== userId) throw new ForbiddenException('You do not own this product');

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
        const product = await this.prisma.product.findUnique({ where: { id }, include: { store: true } });
        if (!product) throw new NotFoundException('Product not found');
        if (product.store.userId !== userId) throw new ForbiddenException('You do not own this product');

        return this.prisma.product.update({
            where: { id },
            data: updateProductDto,
        });
    }

    async remove(id: string, userId: string) {
        const product = await this.prisma.product.findUnique({ where: { id }, include: { store: true } });
        if (!product) throw new NotFoundException('Product not found');
        if (product.store.userId !== userId) throw new ForbiddenException('You do not own this product');

        return this.prisma.product.delete({ where: { id } });
    }
}
