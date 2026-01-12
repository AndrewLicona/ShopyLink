import { Injectable, ConflictException } from '@nestjs/common';

// Actually in my PrismaModule I exported PrismaClient directly but widely it's better to wrap it or use it directly.
// In PrismaModule I exported PrismaClient as provider.
// Let's use @Inject('PRISMA_CLIENT') or just extend standard pattern if I had one.
// Wait, I created PrismaModule extending PrismaClient. So I can Inject PismaClient directly?
// In Step 385 I did: provide: PrismaClient, useClass: PrismaClient.
// So I can inject PrismaClient.

import { PrismaClient } from '@prisma/client';
import { CreateStoreDto } from './dto/create-store.dto';
import { UpdateStoreDto } from './dto/update-store.dto';

@Injectable()
export class StoresService {
  constructor(private prisma: PrismaClient) {}

  async create(
    userId: string,
    userEmail: string,
    createStoreDto: CreateStoreDto,
  ) {
    // Check if slug exists
    const existing = await this.prisma.store.findUnique({
      where: { slug: createStoreDto.slug },
    });
    if (existing) {
      throw new ConflictException('Store identifier (slug) already exists');
    }

    // Upsert User to ensure local DB record exists
    // We assume userId comes from Supabase Auth (UUID)
    const user = await this.prisma.user.upsert({
      where: { id: userId },
      update: { email: userEmail },
      create: {
        id: userId,
        email: userEmail,
      },
    });

    return this.prisma.store.create({
      data: {
        ...createStoreDto,
        userId: user.id,
      },
    });
  }

  async findAllByUser(userId: string) {
    return this.prisma.store.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOneByUser(userId: string) {
    return this.prisma.store.findFirst({
      where: { userId },
    });
  }

  async findOneBySlug(slug: string) {
    return this.prisma.store.findUnique({
      where: { slug },
      include: {
        categories: true,
      },
    });
  }

  async update(id: string, userId: string, updateStoreDto: UpdateStoreDto) {
    try {
      return await this.prisma.store.update({
        where: { id, userId }, // Ensure ownership
        data: updateStoreDto,
      });
    } catch (error) {
      console.error('Prisma Update Error:', error);
      throw error;
    }
  }
}
