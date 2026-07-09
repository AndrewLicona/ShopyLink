import {
  Injectable,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../core/prisma/prisma.module';
import { CreateBannerDto } from './dto/create-banner.dto';

@Injectable()
export class BannersService {
  constructor(private prisma: PrismaService) {}

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

    return this.prisma.withRetry(() =>
      this.prisma.storeBanner.create({
        data: {
          ...rest,
          startsAt: startsAt ? new Date(startsAt) : null,
          endsAt: endsAt ? new Date(endsAt) : null,
        },
      }),
    );
  }

  async findAll(storeId: string, onlyActive = false) {
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
    updateBannerDto: Partial<CreateBannerDto>,
  ) {
    const banner = await this.findOne(id);
    await this.verifyStoreOwnership(banner.storeId, userId);

    const { startsAt, endsAt, ...rest } = updateBannerDto;

    const data: any = { ...rest };
    if (startsAt !== undefined) {
      data.startsAt = startsAt ? new Date(startsAt) : null;
    }
    if (endsAt !== undefined) {
      data.endsAt = endsAt ? new Date(endsAt) : null;
    }

    return this.prisma.withRetry(() =>
      this.prisma.storeBanner.update({
        where: { id },
        data,
      }),
    );
  }

  async remove(id: string, userId: string) {
    const banner = await this.findOne(id);
    await this.verifyStoreOwnership(banner.storeId, userId);

    return this.prisma.withRetry(() =>
      this.prisma.storeBanner.delete({
        where: { id },
      }),
    );
  }
}
