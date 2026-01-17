import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../core/prisma/prisma.module';
import { CreateCategoryDto } from './dto/create-category.dto';

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, createCategoryDto: CreateCategoryDto) {
    // Verify store ownership
    const store = await this.prisma.store.findUnique({
      where: { id: createCategoryDto.storeId },
    });

    if (!store) throw new NotFoundException('Store not found');
    if (store.userId !== userId)
      throw new ForbiddenException('You do not own this store');

    return this.prisma.category.create({
      data: createCategoryDto,
    });
  }

  async findAllByStore(storeId: string) {
    return this.prisma.category.findMany({
      where: { storeId },
      include: {
        _count: {
          select: { products: true },
        },
      },
    });
  }

  async remove(userId: string, id: string) {
    const category = await this.prisma.category.findUnique({
      where: { id },
      include: { store: true },
    });

    if (!category) throw new NotFoundException('Category not found');
    if (category.store.userId !== userId)
      throw new ForbiddenException('You do not own this store');

    return this.prisma.category.delete({
      where: { id },
    });
  }
}
