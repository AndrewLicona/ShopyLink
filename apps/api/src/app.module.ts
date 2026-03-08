import {
  Module,
  MiddlewareConsumer,
  RequestMethod,
  NestModule,
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
import { APP_GUARD } from '@nestjs/core';
import { ImpersonationGuard } from './core/auth/impersonation.guard';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    AuthModule,
    PrismaModule,
    StoresModule,
    ProductsModule,
    OrdersModule,
    CategoriesModule,
    MailingModule,
    AdminLogsModule,
    BroadcastsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ImpersonationGuard,
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
