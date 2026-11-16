import 'reflect-metadata';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { GUARDS_METADATA } from '@nestjs/common/constants';
import { ProductsController } from '../products/products.controller';
import { SuperAdminGuard } from '../../core/auth/super-admin.guard';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrdersService } from './orders.service';

describe('Protecciones de pedidos y carga masiva', () => {
  it('exige superadministrador para la carga masiva', () => {
    const guards = Reflect.getMetadata(GUARDS_METADATA, ProductsController.prototype.createBulk);
    expect(guards).toContain(SuperAdminGuard);
  });

  it('rechaza un pedido sin productos', async () => {
    const dto = plainToInstance(CreateOrderDto, {
      customerName: 'Cliente', storeId: 'f2d8dcd8-6d40-4d9c-9751-471e30d670cb', items: [],
    });
    expect((await validate(dto)).some(error => error.property === 'items')).toBe(true);
  });

  it('respeta el precio del producto cuando la variante lo hereda', () => {
    const service = new OrdersService({} as never, {} as never);
    const product = {
      id: 'product', name: 'Camisa', price: 100, discountPrice: 80,
      trackInventory: false, sku: null, store: {}, inventory: null,
      variants: [{ id: 'variant', name: 'M', price: 120, useParentPrice: true }],
    };
    const result = (service as any).calculateOrderData([product], [{ productId: 'product', variantId: 'variant', quantity: 2 }]);
    expect(result.total).toBe(160);
    expect(result.orderItemsData[0].price).toBe(80);
  });
});
