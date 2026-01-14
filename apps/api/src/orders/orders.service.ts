import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaClient) { }

  async create(createOrderDto: CreateOrderDto) {
    const { storeId, items, customerName, customerPhone } = createOrderDto;

    // 1. Verify Store exists
    const store = await this.prisma.store.findUnique({
      where: { id: storeId },
    });
    if (!store) throw new NotFoundException('Store not found');

    // 2. Fetch products and validate stock
    const productIds = items.map((i) => i.productId);
    const products = await this.prisma.product.findMany({
      where: { id: { in: productIds }, storeId },
      include: { inventory: true },
    });

    if (products.length !== productIds.length) {
      throw new BadRequestException(
        'Some products were not found in this store',
      );
    }

    let total = 0;
    const orderItemsData: {
      productId: string;
      productName: string;
      quantity: number;
      price: number;
      sku?: string;
    }[] = [];

    // 3. Calculate total and prepare items
    for (const itemDto of items) {
      const product = products.find((p: any) => p.id === itemDto.productId);
      if (!product) continue; // Should not happen due to check above

      // Check stock if inventory exists
      if (product.inventory && product.inventory.stock < itemDto.quantity) {
        throw new BadRequestException(
          `Insufficient stock for product: ${product.name}`,
        );
      }

      const price = Number(product.discountPrice ?? product.price);
      total += price * itemDto.quantity;

      orderItemsData.push({
        productId: product.id,
        productName: product.name,
        quantity: itemDto.quantity,
        price: price,
        sku: (product as any).sku,
      });
    }

    // 4. Transaction: Create Order, Items, and Update Inventory
    const order = await this.prisma.$transaction(async (tx: PrismaClient) => {
      // Create Order
      const newOrder = await tx.order.create({
        data: {
          storeId,
          customerName,
          customerPhone,
          total,
          status: 'PENDING',
          items: {
            create: orderItemsData,
          },
        },
        include: { items: true },
      });

      // Decrement Stock
      for (const item of items) {
        // We only decrement if inventory record exists.
        // If no inventory record, we assume infinite stock or managed elsewhere?
        // For now, let's assume if inventory exists we update it.
        const product = products.find((p: any) => p.id === item.productId);
        if (product?.inventory) {
          await tx.inventory.update({
            where: { productId: item.productId },
            data: { stock: { decrement: item.quantity } },
          });
        }
      }

      return newOrder;
    });

    // 5. Generate WhatsApp Link
    // We cast store to any because Typescript doesn't know about the new field yet until we regenerate client
    const waLink = this.generateWhatsAppLink(
      store.name,
      order,
      (store as any).whatsappNumber,
    );

    return { ...order, whatsappLink: waLink };
  }

  private formatCurrency(value: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(value);
  }

  private generateWhatsAppLink(
    storeName: string | null,
    order: any,
    whatsappNumber: string | null,
  ) {
    // Basic formatting
    const phone = whatsappNumber ? whatsappNumber.replace(/\D/g, '') : '';

    // Bulleted list with formatted prices and SKU
    const itemsList = order.items
      .map(
        (i: any) =>
          `• ${i.quantity}x ${i.productName}${i.sku ? ` [${i.sku}]` : ''} (${this.formatCurrency(i.price)})`,
      )
      .join('\n');

    const dashboardLink = `https://shopylink.andrewlamaquina.my/dashboard/orders?id=${order.id}`;

    const text = `Hola *${storeName || 'Tienda'}*.\n\n` +
      `Mi nombre es *${order.customerName}*.\n` +
      `Quiero confirmar mi pedido *#${order.id.slice(0, 8)}*\n\n` +
      `📦 *DETALLE:*\n${itemsList}\n\n` +
      `💰 *TOTAL: ${this.formatCurrency(order.total)}*\n\n` +
      `-------------------\n` +
      `⚠️ *Nota para el cliente:* No modifiques este mensaje para asegurar la validez de tu pedido.\n\n` +
      `🔗 *Verificar en Dashboard (Solo dueño):*\n${dashboardLink}`;

    const baseUrl = phone ? `https://wa.me/${phone}` : `https://wa.me/`;
    return `${baseUrl}?text=${encodeURIComponent(text)}`;
  }

  async findAllByStore(storeId: string, userId: string) {
    const store = await this.prisma.store.findUnique({
      where: { id: storeId },
    });
    if (!store || store.userId !== userId)
      throw new NotFoundException('Store not found or access denied');

    return this.prisma.order.findMany({
      where: { storeId },
      include: { items: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, userId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: { items: true, store: true },
    });
    if (!order) throw new NotFoundException('Order not found');
    if (order.store.userId !== userId)
      throw new NotFoundException('Access denied');
    return order;
  }

  async updateStatus(
    id: string,
    userId: string,
    updateOrderStatusDto: UpdateOrderStatusDto,
  ) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: { store: true, items: true },
    });
    if (!order) throw new NotFoundException('Order not found');
    if (order.store.userId !== userId)
      throw new NotFoundException('Access denied');

    const oldStatus = order.status;
    const newStatus = updateOrderStatusDto.status;

    if (oldStatus === newStatus) return order;

    return this.prisma.$transaction(async (tx: any) => {
      // 1. Logic to return stock if moving from [PENDING, COMPLETED] to CANCELLED
      if (newStatus === 'CANCELLED' && oldStatus !== 'CANCELLED') {
        for (const item of order.items) {
          await tx.inventory.update({
            where: { productId: item.productId },
            data: { stock: { increment: item.quantity } },
          });
        }
      }

      // 2. Logic to deduct stock if moving from CANCELLED to [PENDING, COMPLETED]
      if (oldStatus === 'CANCELLED' && newStatus !== 'CANCELLED') {
        for (const item of order.items) {
          const inventory = await tx.inventory.findUnique({
            where: { productId: item.productId },
          });

          if (inventory && inventory.stock < item.quantity) {
            throw new BadRequestException(
              `No hay suficiente stock para restaurar el producto: ${item.productName}`,
            );
          }

          if (inventory) {
            await tx.inventory.update({
              where: { productId: item.productId },
              data: { stock: { decrement: item.quantity } },
            });
          }
        }
      }

      // 3. Update Status
      return tx.order.update({
        where: { id },
        data: { status: newStatus },
      });
    });
  }
}
