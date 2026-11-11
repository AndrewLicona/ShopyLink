import {
  Injectable,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../core/prisma/prisma.module';
import { RedisService } from '../../core/cache/redis.service';
import { StorageService } from '../../core/storage/storage.service';
import { CreateBannerDto } from './dto/create-banner.dto';
import { UpdateBannerDto } from './dto/update-banner.dto';

/**
 * Campos que un PATCH puede tocar. `storeId` queda fuera a proposito: mover
 * un banner a otra tienda exigiria verificar la propiedad del destino.
 */
const UPDATABLE_BANNER_FIELDS = [
  'title',
  'subtitle',
  'imageUrl',
  'linkUrl',
  'position',
  'isActive',
  'focalPoint',
] as const;

@Injectable()
export class BannersService {
  constructor(
    private prisma: PrismaService,
    private cache: RedisService,
    private storage: StorageService,
  ) {}

  private async verifyStoreOwnership(storeId: string, userId: string) {
    const store = await this.prisma.withRetry(() =>
      this.prisma.store.findUnique({
        where: { id: storeId },
      }),
    );

    if (!store) {
      throw new NotFoundException('Store not found');
    }

    if (store.userId !== userId) {
      throw new ForbiddenException('You do not own this store');
    }

    return store;
  }

  async create(userId: string, createBannerDto: CreateBannerDto) {
    await this.verifyStoreOwnership(createBannerDto.storeId, userId);

    const { startsAt, endsAt, ...rest } = createBannerDto;

    const banner = await this.prisma.withRetry(() =>
      this.prisma.storeBanner.create({
        data: {
          ...rest,
          startsAt: startsAt ? new Date(startsAt) : null,
          endsAt: endsAt ? new Date(endsAt) : null,
        },
      }),
    );

    await this.invalidateStoreCaches(createBannerDto.storeId);
    return banner;
  }

  async findAll(storeId: string, onlyActive = false, userId?: string) {
    if (!onlyActive) {
      if (!userId) {
        throw new ForbiddenException('User authentication required to view inactive banners');
      }
      await this.verifyStoreOwnership(storeId, userId);
    }

    const where: any = { storeId };

    if (onlyActive) {
      const now = new Date();
      where.isActive = true;
      where.OR = [
        {
          startsAt: null,
          endsAt: null,
        },
        {
          startsAt: { lte: now },
          endsAt: { gte: now },
        },
        {
          startsAt: { lte: now },
          endsAt: null,
        },
      ];
    }

    return this.prisma.withRetry(() =>
      this.prisma.storeBanner.findMany({
        where,
        orderBy: { createdAt: 'desc' },
      }),
    );
  }

  async findOne(id: string) {
    const banner = await this.prisma.withRetry(() =>
      this.prisma.storeBanner.findUnique({
        where: { id },
      }),
    );

    if (!banner) {
      throw new NotFoundException('Banner not found');
    }

    return banner;
  }

  async update(
    id: string,
    userId: string,
    updateBannerDto: UpdateBannerDto,
  ) {
    const banner = await this.findOne(id);
    await this.verifyStoreOwnership(banner.storeId, userId);

    // Solo se escriben los campos declarados en la lista: nada de asignacion
    // masiva. `storeId` no esta en la lista a proposito (el banner no cambia
    // de tienda con un PATCH).
    const data: any = {};
    for (const key of UPDATABLE_BANNER_FIELDS) {
      const value = updateBannerDto[key];
      if (value !== undefined) {
        data[key] = value;
      }
    }

    const { startsAt, endsAt } = updateBannerDto;
    if (startsAt !== undefined) {
      data.startsAt = startsAt ? new Date(startsAt) : null;
    }
    if (endsAt !== undefined) {
      data.endsAt = endsAt ? new Date(endsAt) : null;
    }

    const updated = await this.prisma.withRetry(() =>
      this.prisma.storeBanner.update({
        where: { id },
        data,
      }),
    );

    // Garbage collection: delete old image if a new one was provided
    if (
      updateBannerDto.imageUrl &&
      banner.imageUrl &&
      updateBannerDto.imageUrl !== banner.imageUrl
    ) {
      await this.storage.deleteFileByUrl(banner.imageUrl);
    }

    await this.invalidateStoreCaches(banner.storeId);
    return updated;
  }

  async remove(id: string, userId: string) {
    const banner = await this.findOne(id);
    await this.verifyStoreOwnership(banner.storeId, userId);

    const removed = await this.prisma.withRetry(() =>
      this.prisma.storeBanner.delete({
        where: { id },
      }),
    );

    // Garbage collection: remove banner image from Supabase Storage
    if (banner.imageUrl) {
      await this.storage.deleteFileByUrl(banner.imageUrl);
    }

    await this.invalidateStoreCaches(banner.storeId);
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
