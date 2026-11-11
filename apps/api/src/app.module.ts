import {
  Module,
  MiddlewareConsumer,
  RequestMethod,
  NestModule,
  ExecutionContext,
} from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './core/auth/auth.module';
import { PrismaModule } from './core/prisma/prisma.module';
import { StoresModule } from './features/stores/stores.module';
import { ProductsModule } from './features/products/products.module';
import { OrdersModule } from './features/orders/orders.module';
import { CategoriesModule } from './features/categories/categories.module';
import { ProxyCompatibilityMiddleware } from './core/common/proxy.middleware';
import { MailingModule } from './core/mailing/mailing.module';
import { AdminLogsModule } from './core/admin-logs/admin-logs.module';
import { BroadcastsModule } from './features/broadcasts/broadcasts.module';
import { BannersModule } from './features/banners/banners.module';
import { APP_GUARD } from '@nestjs/core';
import { ImpersonationGuard } from './core/auth/impersonation.guard';
import { CacheModule } from './core/cache/cache.module';
import { ThrottlerModule, ThrottlerGuard, normalizeIp } from '@nestjs/throttler';
import { StorageModule } from './core/storage/storage.module';
import { isInternalRequest } from './core/common/client-ip.util';
import { Request } from 'express';

/** Ventana de conteo del throttle en milisegundos (1 minuto). */
export const THROTTLE_TTL_MS = 60_000;

/**
 * Limite para el trafico que llega por nginx (visitantes reales). El contador
 * vive por IP gracias a `trust proxy` + `X-Forwarded-For`, asi que cada
 * visitante tiene su propio presupuesto.
 */
export const THROTTLE_EXTERNAL_LIMIT = 60;

/**
 * El render SSR del contenedor web llama a la API por la red interna. Todas
 * esas peticiones salen desde la misma IP del contenedor, asi que comparten
 * presupuesto: sin este margen el catalogo se cae cuando entran varias
 * visitas al mismo tiempo.
 */
export const THROTTLE_INTERNAL_LIMIT = 3_000;

function isInternal(context: ExecutionContext): boolean {
  return isInternalRequest(context.switchToHttp().getRequest<Request>());
}

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([
      {
        name: 'default',
        ttl: THROTTLE_TTL_MS,
        limit: (context: ExecutionContext) =>
          isInternal(context) ? THROTTLE_INTERNAL_LIMIT : THROTTLE_EXTERNAL_LIMIT,
        getTracker: (req: Record<string, any>) => {
          if (isInternalRequest(req as Request)) return 'internal';
          return normalizeIp(req.ip) || req.socket?.remoteAddress || 'unknown';
        },
      },
    ]),
    AuthModule,
    PrismaModule,
    StoresModule,
    ProductsModule,
    OrdersModule,
    CategoriesModule,
    MailingModule,
    AdminLogsModule,
    BroadcastsModule,
    BannersModule,
    CacheModule,
    StorageModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ImpersonationGuard,
    },
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(ProxyCompatibilityMiddleware)
      .forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}
