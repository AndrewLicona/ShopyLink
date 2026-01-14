import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.module';
import { OrderStatus } from '@prisma/client';
import { createHash } from 'crypto';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { decrypt } from '../common/encryption.util';

interface StoreWithDetails {
  id: string;
  name: string | null;
  whatsappNumber?: string | null;
  slug?: string;
}

interface ProductWithInventory {
  id: string;
  name: string;
  price: any;
  discountPrice?: any;
  sku?: string | null;
  trackInventory: boolean;
  inventory?: {
    stock: number;
  } | null;
}

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService) { }

  async create(createOrderDto: CreateOrderDto) {
    const { storeId, items, customerName, customerPhone } = createOrderDto;

    // 1. Verify Store exists
    const store = (await this.prisma.store.findUnique({
      where: { id: storeId },
    })) as StoreWithDetails | null;
    if (!store) throw new NotFoundException('Store not found');

    // 2. Fetch products and validate stock
    const productIds = items.map((i) => i.productId);
    const products = (await this.prisma.product.findMany({
      where: { id: { in: productIds }, storeId },
      include: { inventory: true },
    })) as ProductWithInventory[];

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
      const product = products.find((p) => p.id === itemDto.productId);
      if (!product) continue; // Should not happen due to check above

      // Check stock if inventory exists AND tracking is enabled
      if (
        product.trackInventory &&
        product.inventory &&
        product.inventory.stock < itemDto.quantity
      ) {
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
        sku: product.sku ?? undefined,
      });
    }

    // 4. Transaction: Create Order, Items, and Update Inventory
    const order = await this.prisma.$transaction(async (tx: PrismaService) => {
      const hashedPhone = customerPhone
        ? createHash('sha256').update(customerPhone).digest('hex')
        : null;

      // Create Order
      const newOrder = await tx.order.create({
        data: {
          storeId,
          customerName,
          customerPhone: hashedPhone,
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
        // We only decrement if inventory record exists AND tracking is enabled.
        const product = products.find((p) => p.id === item.productId);
        if (product?.trackInventory && product?.inventory) {
          await tx.inventory.update({
            where: { productId: item.productId },
            data: { stock: { decrement: item.quantity } },
          });
        }
      }

      return newOrder;
    });

    // 5. Generate WhatsApp Link
    const orderForWhatsApp = {
      id: order.id,
      customerName: order.customerName,
      total: Number(order.total),
      items: (order.items || []).map((i) => ({
        quantity: i.quantity,
        productName: i.productName,
        sku: i.sku || null,
        price: Number(i.price),
      })),
    };

    const decryptedWhatsapp = store.whatsappNumber
      ? decrypt(store.whatsappNumber)
      : null;
    const waLink = this.generateWhatsAppLink(
      store.name,
      orderForWhatsApp,
      decryptedWhatsapp,
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
    order: {
      id: string;
      customerName: string;
      total: number;
      items: {
        quantity: number;
        productName: string;
        sku?: string | null;
        price: number;
      }[];
    },
    whatsappNumber: string | null,
  ) {
    // Basic formatting
    const phone = whatsappNumber ? whatsappNumber.replace(/\D/g, '') : '';

    // Bulleted list with formatted prices and SKU
    const itemsList = order.items
      .map(
        (i) =>
          `• ${i.quantity}x ${i.productName}${i.sku ? ` [${i.sku}]` : ''} (${this.formatCurrency(Number(i.price))})`,
      )
      .join('\n');

    const dashboardLink = `https://shopylink.andrewlamaquina.my/dashboard/orders?id=${order.id}`;

    const text =
      `Hola *${storeName || 'Tienda'}*.\n\n` +
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
    const newStatus = updateOrderStatusDto.status as unknown as OrderStatus;

    if (oldStatus === newStatus) return order;

    return this.prisma.$transaction(async (tx: PrismaService) => {
      // 1. Logic to return stock if moving from [PENDING, COMPLETED] to CANCELLED
      if (
        newStatus === OrderStatus.CANCELLED &&
        oldStatus !== OrderStatus.CANCELLED
      ) {
        for (const item of order.items) {
          // Check if product exists and has inventory tracking
          const product = await tx.product.findUnique({
            where: { id: item.productId || undefined },
            include: { inventory: true },
          });

          if (product?.trackInventory && product?.inventory) {
            await tx.inventory.update({
              where: { productId: product.id },
              data: { stock: { increment: item.quantity } },
            });
          }
        }
      }

      // 2. Logic to deduct stock if moving from CANCELLED to [PENDING, COMPLETED]
      if (
        oldStatus === OrderStatus.CANCELLED &&
        newStatus !== OrderStatus.CANCELLED
      ) {
        for (const item of order.items) {
          const product = await tx.product.findUnique({
            where: { id: item.productId || undefined },
            include: { inventory: true },
          });

          if (product?.trackInventory && product?.inventory) {
            if (product.inventory.stock < item.quantity) {
              throw new BadRequestException(
                `No hay suficiente stock para restaurar el producto: ${item.productName}`,
              );
            }

            await tx.inventory.update({
              where: { productId: product.id },
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
