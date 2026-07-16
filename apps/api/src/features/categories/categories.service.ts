import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../core/prisma/prisma.module';
import { RedisService } from '../../core/cache/redis.service';
import { CreateCategoryDto } from './dto/create-category.dto';

@Injectable()
export class CategoriesService {
  constructor(
    private prisma: PrismaService,
    private cache: RedisService,
  ) {}

  async create(userId: string, createCategoryDto: CreateCategoryDto) {
    // Verify store ownership
    const store = await this.prisma.withRetry(() =>
      this.prisma.store.findUnique({
        where: { id: createCategoryDto.storeId },
      }),
    );

    if (!store) throw new NotFoundException('Store not found');
    if (store.userId !== userId)
      throw new ForbiddenException('You do not own this store');

    const category = await this.prisma.category.create({
      data: createCategoryDto,
    });

    await this.invalidateStoreCaches(createCategoryDto.storeId);
    return category;
  }

  async findAllByStore(storeId: string) {
    return this.prisma.withRetry(() =>
      this.prisma.category.findMany({
        where: { storeId },
        include: {
          _count: {
            select: { products: true },
          },
        },
      }),
    );
  }

  async remove(userId: string, id: string) {
    const category = await this.prisma.withRetry(() =>
      this.prisma.category.findUnique({
        where: { id },
        include: { store: true },
      }),
    );

    if (!category) throw new NotFoundException('Category not found');
    if (category.store.userId !== userId)
      throw new ForbiddenException('You do not own this store');

    const removed = await this.prisma.category.delete({
      where: { id },
    });

    await this.invalidateStoreCaches(category.storeId);
    return removed;
  }

  private async invalidateStoreCaches(storeId: string) {
    const store = await this.prisma.store.findUnique({
      where: { id: storeId },
      select: { slug: true },
    });

    if (store?.slug) {
      await this.cache.del(`publicStore:${store.slug}`, `publicStorePage:${store.slug}`);
    }

    await this.cache.incr('cache:marketplace:version');
  }
}
