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
import { MailingService } from '../../core/mailing/mailing.service';
import { AdminLogsService } from '../../core/admin-logs/admin-logs.service';
import { RedisService } from '../../core/cache/redis.service';
import { hashCacheKey } from '../../core/cache/cache.util';
import { CreateStoreDto } from './dto/create-store.dto';
import { UpdateStoreDto } from './dto/update-store.dto';
import { encrypt, decrypt } from '../../core/common/encryption.util';
import { Store } from '@prisma/client';

@Injectable()
export class StoresService {
  constructor(
    private prisma: PrismaService,
    private mailing: MailingService,
    private adminLogs: AdminLogsService,
    private cache: RedisService,
  ) {}

  async create(
    userId: string,
    userEmail: string,
    createStoreDto: CreateStoreDto,
  ) {
    await this.checkSlugAvailability(createStoreDto.slug);

    // For more security, we check if the user is a super admin
    const adminEmails = process.env.SUPER_ADMIN_EMAILS
      ? process.env.SUPER_ADMIN_EMAILS.split(',').map((e) =>
          e.trim().toLowerCase(),
        )
      : ['andrewlicona1@gmail.com'];

    const role = adminEmails.includes(userEmail.toLowerCase())
      ? 'SUPER_ADMIN'
      : 'USER';

    const user = await this.prisma.withRetry(() =>
      this.prisma.user.upsert({
        where: { id: userId },
        update: { email: userEmail, role: role as any },
        create: {
          id: userId,
          email: userEmail,
          role: role as any,
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

    const store = await this.prisma.withRetry(() =>
      this.prisma.store.create({
        data,
      }),
    );

    await this.invalidateStoreCachesBySlug(store.slug);
    await this.bumpMarketplaceVersion();

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
    const stores = await this.prisma.withRetry(() =>
      this.prisma.store.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
      }),
    );
    return stores.map((store) => this.decryptStore(store));
  }

  async findAllAsAdmin() {
    const stores = await this.prisma.withRetry(() =>
      this.prisma.store.findMany({
        include: {
          user: {
            select: { email: true, name: true },
          },
          _count: {
            select: { products: true, orders: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
    );
    return stores.map((store) => this.decryptStore(store));
  }

  async findAllUsersAsAdmin() {
    return this.prisma.withRetry(() =>
      this.prisma.user.findMany({
        include: {
          _count: {
            select: { stores: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
    );
  }

  async findUserById(id: string) {
    return this.prisma.withRetry(() =>
      this.prisma.user.findUnique({
        where: { id },
      }),
    );
  }

  async findOneByUser(userId: string) {
    const store = await this.prisma.withRetry(() =>
      this.prisma.store.findFirst({
        where: { userId },
      }),
    );
    return this.decryptStore(store);
  }

  async findOneBySlug(slug: string) {
    const cacheKey = this.publicStoreKey(slug);

    return this.cache.getOrSetJson(cacheKey, 300, async () => {
      const store = await this.prisma.withRetry(() =>
        this.prisma.store.findUnique({
          where: { slug },
          include: {
            categories: true,
          },
        }),
      );

      return this.decryptStore(store);
    });
  }

  async findForMarketplace(filters: any) {
    const { category, city, q, featured } = filters;
    const cacheKey = await this.marketplaceStoresKey(filters);

    return this.cache.getOrSetJson(cacheKey, 180, async () => {
      const whereClause: any = {
        isPublic: true,
        products: {
          some: { isActive: true },
        },
      };

      if (category) whereClause.marketplaceCategory = category;
      if (city) whereClause.city = city;
      if (featured) whereClause.featured = true;
      if (q) {
        whereClause.name = { contains: q, mode: 'insensitive' };
      }

      const stores = await this.prisma.withRetry(() =>
        this.prisma.store.findMany({
          where: whereClause,
          orderBy: [
            { featured: 'desc' },
            { orderCount: 'desc' },
            { viewCount: 'desc' },
          ],
          include: {
            _count: {
              select: { products: true },
            },
          },
        }),
      );

      return stores.map((store) => this.decryptStore(store));
    });
  }

  async getActiveMarketplaceCategories() {
    const cacheKey = await this.marketplaceCategoriesKey();

    return this.cache.getOrSetJson(cacheKey, 600, async () => {
      const stores = await this.prisma.withRetry(() =>
        this.prisma.store.findMany({
          where: {
            isPublic: true,
            marketplaceCategory: { not: null },
            products: {
              some: { isActive: true },
            },
          },
          select: { marketplaceCategory: true },
          distinct: ['marketplaceCategory'],
        }),
      );
      return stores
        .map((s) => s.marketplaceCategory)
        .filter((c): c is string => !!c);
    });
  }

  async incrementViewCount(id: string) {
    try {
      const store = await this.prisma.withRetry(() =>
        this.prisma.store.update({
          where: { id },
          data: {
            viewCount: {
              increment: 1,
            },
          },
        }),
      );
      return { success: true, viewCount: store.viewCount };
    } catch (e) {
      // Ignore if store doesn't exist
      return { success: false };
    }
  }

  async update(id: string, userId: string, updateStoreDto: UpdateStoreDto) {
    const previousStore = await this.ensureStoreOwnership(id, userId);

    if (updateStoreDto.slug) {
      await this.checkSlugAvailability(updateStoreDto.slug, id);
    }

    const data = { ...updateStoreDto };
    if (data.whatsappNumber) {
      data.whatsappNumber = encrypt(data.whatsappNumber);
    }

    try {
      const store = await this.prisma.store.update({
        where: { id },
        data,
      });
      await this.invalidateStoreCachesBySlug(previousStore.slug);
      await this.invalidateStoreCachesBySlug(store.slug);
      await this.bumpMarketplaceVersion();
      return this.decryptStore(store);
    } catch (error) {
      console.error('Prisma Update Error:', error);
      throw error;
    }
  }

  async getMetrics() {
    const [
      totalStores,
      totalUsers,
      proStores,
      totalProducts,
      totalOrders,
      totalAmountAgg,
    ] = await Promise.all([
      this.prisma.store.count(),
      this.prisma.user.count(),
      this.prisma.store.count({ where: { planType: 'PRO' } }),
      this.prisma.product.count(),
      this.prisma.order.count(),
      this.prisma.order.aggregate({
        _sum: {
          total: true,
        },
      }),
    ]);

    const totalRevenue = (totalAmountAgg._sum.total as any)?.toNumber() || 0;
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    const conversionRate =
      totalStores > 0 ? (proStores / totalStores) * 100 : 0;

    // Get stores created in the last 7 days
    const last7Days = new Date();
    last7Days.setDate(last7Days.getDate() - 7);

    const newStoresLast7Days = await this.prisma.store.count({
      where: { createdAt: { gte: last7Days } },
    });

    return {
      totalStores,
      totalUsers,
      proStores,
      totalProducts,
      totalOrders,
      totalRevenue,
      avgOrderValue,
      conversionRate: parseFloat(conversionRate.toFixed(1)),
      newStoresLast7Days,
    };
  }

  async updateAsAdmin(
    adminId: string,
    id: string,
    updateStoreDto: Partial<Store>,
  ) {
    const previousStore = await this.prisma.store.findUnique({
      where: { id },
    });

    if (updateStoreDto.slug) {
      await this.checkSlugAvailability(updateStoreDto.slug, id);
    }

    const data = { ...updateStoreDto };
    if (data.whatsappNumber) {
      data.whatsappNumber = encrypt(data.whatsappNumber);
    }

    try {
      const store = await this.prisma.store.update({
        where: { id }, // No ownership check
        data,
        include: { user: true },
      });

      // Notify Admin via Email
      const planChange = updateStoreDto.planType
        ? `Cambió de plan a <b>${updateStoreDto.planType}</b>`
        : '';
      await this.mailing.sendAdminNotification(
        'Tienda Actualizada por Administrador',
        `La tienda <b>${store.name}</b> (slug: ${store.slug}) ha sido actualizada. 
         <br>${planChange}
         <br>Dueño (Email): ${store.user.email}
         <br>ID de Tienda: ${store.id}`,
      );

      // Record Audit Log
      await this.adminLogs.log(
        adminId,
        'UPDATE_STORE_ADMIN',
        'STORE',
        store.id,
        {
          storeName: store.name,
          slug: store.slug,
          changes: updateStoreDto,
        },
      );

      if (previousStore?.slug) {
        await this.invalidateStoreCachesBySlug(previousStore.slug);
      }
      await this.invalidateStoreCachesBySlug(store.slug);
      await this.bumpMarketplaceVersion();

      return this.decryptStore(store);
    } catch (error) {
      console.error('Prisma Admin Update Error:', error);
      throw error;
    }
  }

  async remove(id: string, userId: string) {
    const store = await this.ensureStoreOwnership(id, userId);

    await this.prisma.store.delete({
      where: { id },
    });

    await this.invalidateStoreCachesBySlug(store.slug);
    await this.bumpMarketplaceVersion();

    return store;
  }

  private async checkSlugAvailability(slug: string, excludeId?: string) {
    const existing = await this.prisma.withRetry(() =>
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
    const store = await this.prisma.withRetry(() =>
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

  async getPublicStorePage(slug: string) {
    const cacheKey = this.publicStorePageKey(slug);

    return this.cache.getOrSetJson(cacheKey, 120, async () => {
      const store = await this.prisma.withRetry(() =>
        this.prisma.store.findUnique({
          where: { slug },
          include: {
            categories: true,
          },
        }),
      );

      if (!store) {
        return null;
      }

      const [products, banners] = await Promise.all([
        this.prisma.withRetry(() =>
          this.prisma.product.findMany({
            where: {
              storeId: store.id,
              isActive: true,
            },
            include: {
              inventory: true,
              variants: true,
            },
            orderBy: { createdAt: 'desc' },
          }),
        ),
        this.prisma.withRetry(() =>
          this.prisma.storeBanner.findMany({
            where: {
              storeId: store.id,
              isActive: true,
            },
            orderBy: { createdAt: 'desc' },
          }),
        ),
      ]);

      const activeProducts = this.filterVisibleProducts(products as any);
      const activeCategoryIds = new Set(activeProducts.map((p: any) => p.categoryId));
      const visibleCategories = store.categories.filter((c) =>
        activeCategoryIds.has(c.id),
      );

      return {
        store: this.decryptStore(store),
        products: activeProducts,
        categories: visibleCategories,
        banners,
      };
    });
  }

  private filterVisibleProducts(products: any[]) {
    return products.filter((p) => {
      if (!p.isActive) return false;
      if (p.trackInventory === false) return true;

      if (p.variants && p.variants.length > 0) {
        const isBaseAvailable = (p.inventory?.stock ?? 0) > 0;
        const hasAvailableVariant = p.variants.some((v: any) => {
          if (v.trackInventory === false) return true;

          const stock = v.useParentStock ? (p.inventory?.stock ?? 0) : (v.stock ?? 0);
          return stock > 0;
        });

        return isBaseAvailable || hasAvailableVariant;
      }

      return (p.inventory?.stock ?? 0) > 0;
    });
  }

  private publicStoreKey(slug: string) {
    return `publicStore:${slug}`;
  }

  private publicStorePageKey(slug: string) {
    return `publicStorePage:${slug}`;
  }

  private marketplaceVersionKey() {
    return 'cache:marketplace:version';
  }

  private async marketplaceVersion() {
    const version = await this.cache.get<string>(this.marketplaceVersionKey());
    return version || '1';
  }

  private async bumpMarketplaceVersion() {
    await this.cache.incr(this.marketplaceVersionKey());
  }

  private async invalidateStoreCachesBySlug(slug: string) {
    await this.cache.del(this.publicStoreKey(slug), this.publicStorePageKey(slug));
  }

  private async marketplaceStoresKey(filters: Record<string, unknown>) {
    const version = await this.marketplaceVersion();
    return `marketplace:stores:v${version}:${hashCacheKey('stores', filters)}`;
  }

  private async marketplaceCategoriesKey() {
    const version = await this.marketplaceVersion();
    return `marketplace:categories:v${version}`;
  }
}
