
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';

@Injectable()
export class OrdersService {
    constructor(private prisma: PrismaClient) { }

    async create(createOrderDto: CreateOrderDto) {
        const { storeId, items, customerName, customerPhone } = createOrderDto;

        // 1. Verify Store exists
        const store = await this.prisma.store.findUnique({ where: { id: storeId } });
        if (!store) throw new NotFoundException('Store not found');

        // 2. Fetch products and validate stock
        const productIds = items.map((i) => i.productId);
        const products = await this.prisma.product.findMany({
            where: { id: { in: productIds }, storeId },
            include: { inventory: true },
        });

        if (products.length !== productIds.length) {
            throw new BadRequestException('Some products were not found in this store');
        }

        let total = 0;
        const orderItemsData: { productId: string; productName: string; quantity: number; price: number }[] = [];

        // 3. Calculate total and prepare items
        for (const itemDto of items) {
            const product = products.find((p: any) => p.id === itemDto.productId);
            if (!product) continue; // Should not happen due to check above

            // Check stock if inventory exists
            if (product.inventory && product.inventory.stock < itemDto.quantity) {
                throw new BadRequestException(`Insufficient stock for product: ${product.name}`);
            }

            const price = Number(product.discountPrice ?? product.price);
            total += price * itemDto.quantity;

            orderItemsData.push({
                productId: product.id,
                productName: product.name,
                quantity: itemDto.quantity,
                price: price,
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
                        create: orderItemsData
                    }
                },
                include: { items: true }
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
                        data: { stock: { decrement: item.quantity } }
                    });
                }
            }

            return newOrder;
        });

        // 5. Generate WhatsApp Link
        const waLink = this.generateWhatsAppLink(store.description, order); // using store description or just generic

        return { ...order, whatsappLink: waLink };
    }

    private generateWhatsAppLink(storeName: string | null, order: any) {
        // Basic formatting
        const phone = order.customerPhone.replace(/\D/g, '');
        // Actually we send the link TO the store owner usually, but here checking out via WhatsApp 
        // means the customer clicks a link to send a message TO the store owner.
        // But the requirement says "WhatsApp checkout". Usually this means:
        // 1. Customer fills cart.
        // 2. Clicks "Order".
        // 3. System saves order as PENDING.
        // 4. System redirects customer to WhatsApp with the order details to invoke the chat with Store Owner.

        // Wait, do we have the Store Owner's phone? The Store model doesn't have a phone field in the schema I see.
        // I only see `User` which has email. 
        // I should probably add `phone` to `Store` or `User` to make this realistic.
        // For now, I will assume the customerPhone is just stored, and I'll return a link that might be intended for the store owner IF I knew their number.

        // Let's assume for MVP we return the order details text so the frontend can build the link 
        // OR we just return the text.

        const itemsList = order.items.map((i: any) => `${i.quantity}x ${i.productName}`).join('\n');
        const text = `Hola, quiero confirmar mi pedido #${order.id.slice(0, 8)}\n\n${itemsList}\n\nTotal: $${order.total}`;
        return `https://wa.me/?text=${encodeURIComponent(text)}`; // No phone number yet
    }

    async findAllByStore(storeId: string, userId: string) {
        const store = await this.prisma.store.findUnique({ where: { id: storeId } });
        if (!store || store.userId !== userId) throw new NotFoundException('Store not found or access denied');

        return this.prisma.order.findMany({
            where: { storeId },
            include: { items: true },
            orderBy: { createdAt: 'desc' },
        });
    }

    async findOne(id: string, userId: string) {
        const order = await this.prisma.order.findUnique({
            where: { id },
            include: { items: true, store: true }
        });
        if (!order) throw new NotFoundException('Order not found');
        if (order.store.userId !== userId) throw new NotFoundException('Access denied');
        return order;
    }

    async updateStatus(id: string, userId: string, updateOrderStatusDto: UpdateOrderStatusDto) {
        const order = await this.prisma.order.findUnique({
            where: { id },
            include: { store: true }
        });
        if (!order) throw new NotFoundException('Order not found');
        if (order.store.userId !== userId) throw new NotFoundException('Access denied');

        return this.prisma.order.update({
            where: { id },
            data: { status: updateOrderStatusDto.status }
        });
    }
}
