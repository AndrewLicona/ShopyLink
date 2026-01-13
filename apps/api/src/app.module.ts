import { Module, MiddlewareConsumer, RequestMethod, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './common/prisma/prisma.module';
import { StoresModule } from './stores/stores.module';
import { ProductsModule } from './products/products.module';
import { OrdersModule } from './orders/orders.module';
import { CategoriesModule } from './categories/categories.module';
import { ProxyCompatibilityMiddleware } from './proxy.middleware';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    AuthModule,
    PrismaModule,
    StoresModule,
    ProductsModule,
    OrdersModule,
    CategoriesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(ProxyCompatibilityMiddleware)
      .forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}
