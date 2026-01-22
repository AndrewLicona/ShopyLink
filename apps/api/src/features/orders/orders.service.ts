import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../core/prisma/prisma.module';
import { OrderStatus } from '@repo/database';
import { createHash } from 'crypto';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { decrypt } from '../../core/common/encryption.util';
import {
  Prisma,
  Product,
  Inventory,
  ProductVariant,
  OrderItem,
} from '@repo/database';

type ProductWithDetails = Product & {
  inventory: Inventory | null;
  variants: ProductVariant[];
};

interface StoreWithDetails {
  id: string;
  name: string | null;
  whatsappNumber?: string | null;
  slug?: string;
}

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService) { }

  async create(createOrderDto: CreateOrderDto) {
    const { storeId, items, customerName, customerPhone, customerAddress } =
      createOrderDto;

    // 1. Verify Store exists
    const store = (await this.prisma.withRetry(() =>
      this.prisma.store.findUnique({
        where: { id: storeId },
      }),
    )) as StoreWithDetails | null;
    if (!store) throw new NotFoundException('Store not found');

    // 2. Fetch products and validate stock/items
    const products = await this.validateOrderItems(storeId, items);

    // 3. Prepare order items and calculate total
    const { total, orderItemsData } = this.calculateOrderData(products, items);

    // 4. Create Order
    const order = await this.prisma.$transaction(
      async (tx: Prisma.TransactionClient) => {
        const hashedPhone = customerPhone
          ? createHash('sha256').update(customerPhone).digest('hex')
          : null;

        const newOrder = await tx.order.create({
          data: {
            storeId,
            customerName,
            customerPhone: hashedPhone,
            customerAddress,
            total,
            status: 'PENDING',
            items: {
              create: orderItemsData,
            },
          },
          include: { items: true },
        });

        return newOrder as typeof newOrder & { items: OrderItem[] };
      },
    );

    // 5. Generate WhatsApp Link
    const decryptedWhatsapp = store.whatsappNumber
      ? decrypt(store.whatsappNumber)
      : null;

    const waLink = this.generateWhatsAppLink(
      store.name || 'Tienda',
      order,
      decryptedWhatsapp,
    );

    return { ...order, whatsappLink: waLink };
  }

  private async validateOrderItems(
    storeId: string,
    items: CreateOrderDto['items'],
  ): Promise<ProductWithDetails[]> {
    const productIds = items.map((i) => i.productId);
    const uniqueProductIds: string[] = [...new Set(productIds)];
    const products = (await this.prisma.withRetry(() =>
      this.prisma.product.findMany({
        where: { id: { in: uniqueProductIds }, storeId },
        include: { inventory: true, variants: true },
      }),
    )) as ProductWithDetails[];

    if (products.length !== uniqueProductIds.length) {
      throw new BadRequestException(
        'Some products were not found in this store',
      );
    }

    return products;
  }

  private calculateOrderData(
    products: ProductWithDetails[],
    items: CreateOrderDto['items'],
  ) {
    let total = 0;
    const orderItemsData: any[] = [];

    for (const itemDto of items) {
      const product = products.find((p) => p.id === itemDto.productId);
      if (!product) continue;

      let price = Number(product.discountPrice ?? product.price);
      let sku = product.sku;
      let variantName: string | undefined = undefined;

      if (itemDto.variantId) {
        const variant = product.variants.find(
          (v) => v.id === itemDto.variantId,
        );
        if (!variant)
          throw new BadRequestException(
            `Variant not found for product: ${product.name}`,
          );

        if (variant.price) {
          price = Number(variant.price);
        }

        // Check if variant tracks inventory
        if (product.trackInventory && variant.trackInventory) {
          const effectiveStock = variant.useParentStock
            ? product.inventory?.stock ?? 0
            : variant.stock;

          if (effectiveStock < itemDto.quantity) {
            throw new BadRequestException(
              `Insufficient stock for product variant: ${product.name} - ${variant.name}`,
            );
          }
        }

        sku = variant.sku || sku;
        variantName = variant.name;
      } else {
        if (
          product.trackInventory &&
          product.inventory &&
          product.inventory.stock < itemDto.quantity
        ) {
          throw new BadRequestException(
            `Insufficient stock for product: ${product.name}`,
          );
        }
      }

      total += price * itemDto.quantity;

      orderItemsData.push({
        productId: product.id,
        productName: product.name,
        quantity: itemDto.quantity,
        price,
        sku: sku ?? undefined,
        variantId: itemDto.variantId,
        variantName,
      });
    }

    return { total, orderItemsData };
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
    storeName: string,
    order: {
      id: string;
      customerName: string;
      customerAddress?: string | null;
      total: Prisma.Decimal | number;
      items: OrderItem[];
    },
    whatsappNumber: string | null,
  ) {
    const phone = whatsappNumber ? whatsappNumber.replace(/\D/g, '') : '';

    const itemsList = order.items
      .map(
        (i) =>
          `• ${i.quantity}x ${i.productName}${i.sku ? ` [${i.sku}]` : ''} (${this.formatCurrency(Number(i.price))})`,
      )
      .join('\n');

    const frontendUrl =
      process.env.FRONTEND_URL || 'https://shopylink.andrewlamaquina.my';
    const dashboardLink = `${frontendUrl}/dashboard/orders?id=${order.id}`;

    const text =
      `Hola *${storeName}*.\n\n` +
      `Mi nombre es *${order.customerName}*.\n\n` +
      (order.customerAddress
        ? `📍 *ENTREGA EN:* ${order.customerAddress}\n`
        : '') +
      `Quiero confirmar mi pedido *#${order.id.slice(0, 8)}*\n\n` +
      `📦 *DETALLE:*\n${itemsList}\n\n` +
      `💰 *TOTAL: ${this.formatCurrency(Number(order.total))}*\n\n` +
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

    return this.prisma.withRetry(() =>
      this.prisma.order.findMany({
        where: { storeId },
        include: { items: true },
        orderBy: { createdAt: 'desc' },
      }),
    );
  }

  async findOne(id: string, userId: string) {
    const order = await this.prisma.withRetry(() =>
      this.prisma.order.findUnique({
        where: { id },
        include: { items: true, store: true },
      }),
    );
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
    const order = await this.prisma.withRetry(() =>
      this.prisma.order.findUnique({
        where: { id },
        include: { store: true, items: true },
      }),
    );
    if (!order) throw new NotFoundException('Order not found');
    if (order.store.userId !== userId)
      throw new NotFoundException('Access denied');

    const oldStatus = order.status;
    const newStatus = updateOrderStatusDto.status as unknown as OrderStatus;

    if (oldStatus === newStatus) return order;

    return this.prisma.$transaction(async (tx: PrismaService) => {
      // 1. DEDUCT STOCK if moving to COMPLETED
      if (
        newStatus === OrderStatus.COMPLETED &&
        oldStatus !== OrderStatus.COMPLETED
      ) {
        for (const item of order.items) {
          if (item.variantId) {
            const variant = await tx.productVariant.findUnique({
              where: { id: item.variantId },
              include: { product: { include: { inventory: true } } },
            });

            if (variant && variant.trackInventory) {
              if (variant.useParentStock) {
                const product = variant.product;
                if (product?.trackInventory && product?.inventory) {
                  if (product.inventory.stock < item.quantity) {
                    throw new BadRequestException(
                      `No hay suficiente stock para el producto: ${product.name}`,
                    );
                  }
                  await tx.inventory.update({
                    where: { productId: product.id },
                    data: { stock: { decrement: item.quantity } },
                  });
                }
              } else {
                if (variant.stock < item.quantity) {
                  throw new BadRequestException(
                    `No hay suficiente stock para la variante: ${item.productName} - ${variant.name}`,
                  );
                }
                await tx.productVariant.update({
                  where: { id: item.variantId },
                  data: { stock: { decrement: item.quantity } },
                });
              }
            }
          } else if (item.productId) {
            const product = await tx.product.findUnique({
              where: { id: item.productId },
              include: { inventory: true },
            });

            if (product?.trackInventory && product?.inventory) {
              if (product.inventory.stock < item.quantity) {
                throw new BadRequestException(
                  `No hay suficiente stock para el producto: ${product.name}`,
                );
              }

              await tx.inventory.update({
                where: { productId: product.id },
                data: { stock: { decrement: item.quantity } },
              });
            }
          }
        }
      }

      // 2. RESTORE STOCK if moving AWAY from COMPLETED
      if (
        oldStatus === OrderStatus.COMPLETED &&
        newStatus !== OrderStatus.COMPLETED
      ) {
        for (const item of order.items) {
          if (item.variantId) {
            const variant = await tx.productVariant.findUnique({
              where: { id: item.variantId },
              include: { product: true },
            });

            if (variant && variant.trackInventory) {
              if (variant.useParentStock) {
                const product = variant.product;
                if (product?.trackInventory) {
                  await tx.inventory.update({
                    where: { productId: product.id },
                    data: { stock: { increment: item.quantity } },
                  });
                }
              } else {
                await tx.productVariant.update({
                  where: { id: item.variantId },
                  data: { stock: { increment: item.quantity } },
                });
              }
            }
          } else if (item.productId) {
            const product = await tx.product.findUnique({
              where: { id: item.productId },
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
      }

      // 3. Update Status
      return tx.order.update({
        where: { id },
        data: { status: newStatus },
      });
    });
  }
}
