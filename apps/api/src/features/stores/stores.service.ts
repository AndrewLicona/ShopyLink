import {
  Injectable,
  ConflictException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';

// Actually in my PrismaModule I exported PrismaClient directly but widely it's better to wrap it or use it directly.
// In PrismaModule I exported PrismaClient as provider.
// Let's use @Inject('PRISMA_CLIENT') or just extend standard pattern if I had one.
// Wait, I created PrismaModule extending PrismaClient. So I can Inject PismaClient directly?
// In Step 385 I did: provide: PrismaClient, useClass: PrismaClient.
// So I can inject PrismaClient.

import { PrismaService } from '../../core/prisma/prisma.module';
import { CreateStoreDto } from './dto/create-store.dto';
import { UpdateStoreDto } from './dto/update-store.dto';
import { encrypt, decrypt } from '../../core/common/encryption.util';

@Injectable()
export class StoresService {
  constructor(private prisma: PrismaService) { }

  async create(
    userId: string,
    userEmail: string,
    createStoreDto: CreateStoreDto,
  ) {
    await this.checkSlugAvailability(createStoreDto.slug);

    // Upsert User to ensure local DB record exists
    // We assume userId comes from Supabase Auth (UUID)
    const user = await this.withRetry(() =>
      this.prisma.user.upsert({
        where: { id: userId },
        update: { email: userEmail },
        create: {
          id: userId,
          email: userEmail,
        },
      }),
    );

    const data = {
      ...createStoreDto,
      userId: user.id,
    };

    if (data.whatsappNumber) {
      data.whatsappNumber = encrypt(data.whatsappNumber);
    }

    const store = await this.withRetry(() =>
      this.prisma.store.create({
        data,
      }),
    );

    return this.decryptStore(store);
  }

  private decryptStore<T>(store: T): T {
    if (!store) return store;

    const s = store as Record<string, unknown>;
    if (typeof s.whatsappNumber === 'string') {
      s.whatsappNumber = decrypt(s.whatsappNumber);
    }
    return store;
  }

  async findAllByUser(userId: string) {
    const stores = await this.withRetry(() =>
      this.prisma.store.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
      }),
    );
    return stores.map((store) => this.decryptStore(store));
  }

  async findOneByUser(userId: string) {
    const store = await this.withRetry(() =>
      this.prisma.store.findFirst({
        where: { userId },
      }),
    );
    return this.decryptStore(store);
  }

  async findOneBySlug(slug: string) {
    return this.withRetry(() =>
      this.prisma.store.findUnique({
        where: { slug },
        include: {
          categories: true,
        },
      }),
    ).then((store) => this.decryptStore(store));
  }

  private async withRetry<T>(
    operation: () => Promise<T>,
    retries = 3,
    delay = 500,
  ): Promise<T> {
    try {
      return await operation();
    } catch (error) {
      const isNetworkError =
        error instanceof Error &&
        (error.message.includes('EAI_AGAIN') ||
          error.message.includes('Can\'t reach database server') ||
          error.message.includes('Timed out'));

      if (isNetworkError && retries > 0) {
        console.warn(
          `Database operation failed (retrying ${retries} more times):`,
          error.message,
        );
        await new Promise((resolve) => setTimeout(resolve, delay));
        return this.withRetry(operation, retries - 1, delay * 2);
      }
      throw error;
    }
  }

  async update(id: string, userId: string, updateStoreDto: UpdateStoreDto) {
    if (updateStoreDto.slug) {
      await this.checkSlugAvailability(updateStoreDto.slug, id);
    }

    const data = { ...updateStoreDto };
    if (data.whatsappNumber) {
      data.whatsappNumber = encrypt(data.whatsappNumber);
    }

    try {
      const store = await this.prisma.store.update({
        where: { id, userId }, // Ensure ownership
        data,
      });
      return this.decryptStore(store);
    } catch (error) {
      console.error('Prisma Update Error:', error);
      throw error;
    }
  }

  async remove(id: string, userId: string) {
    // Delete store - cascading deletes in DB should handle relations
    return this.prisma.store.delete({
      where: { id, userId },
    });
  }

  private async checkSlugAvailability(slug: string, excludeId?: string) {
    const existing = await this.withRetry(() =>
      this.prisma.store.findUnique({
        where: { slug },
      }),
    );

    if (existing && existing.id !== excludeId) {
      throw new ConflictException(
        'Este identificador de tienda (link) ya está en uso',
      );
    }
  }

  private async ensureStoreOwnership(id: string, userId: string) {
    const store = await this.withRetry(() =>
      this.prisma.store.findUnique({
        where: { id },
      }),
    );

    if (!store) throw new NotFoundException('Store not found');
    if (store.userId !== userId) {
      throw new ForbiddenException('You do not own this store');
    }
    return store;
  }
}
