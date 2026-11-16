import { Module } from '@nestjs/common';
import { SuperAdminGuard } from '../../core/auth/super-admin.guard';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';

@Module({
  controllers: [ProductsController],
  providers: [ProductsService, SuperAdminGuard],
})
export class ProductsModule {}
