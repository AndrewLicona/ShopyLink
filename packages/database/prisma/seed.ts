import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Starting seed...');

    const stores = await ensureDemoStores();
    console.log(`Found ${stores.length} demo stores`);

    // Store 1: Fashion Store
    await seedFashionStore(prisma, stores[0].id);

    // Store 2: Electronics Store
    await seedElectronicsStore(prisma, stores[1].id);

    // Store 3: Food Store
    await seedFoodStore(prisma, stores[2].id);

    console.log('✅ Seed completed!');
}

async function ensureDemoStores() {
    const existingStores = await prisma.store.findMany({
        orderBy: { createdAt: 'asc' },
    });

    if (existingStores.length >= 3) {
        return existingStores.slice(0, 3);
    }

    const owners = await Promise.all([
        prisma.user.upsert({
            where: { email: 'andrew@shopylink.local' },
            update: { name: 'Andrew Licona', role: 'SUPER_ADMIN' },
            create: {
                email: 'andrew@shopylink.local',
                name: 'Andrew Licona',
                role: 'SUPER_ADMIN',
            },
        }),
        prisma.user.upsert({
            where: { email: 'fashion@shopylink.local' },
            update: { name: 'Fashion Owner', role: 'USER' },
            create: {
                email: 'fashion@shopylink.local',
                name: 'Fashion Owner',
                role: 'USER',
            },
        }),
        prisma.user.upsert({
            where: { email: 'tech@shopylink.local' },
            update: { name: 'Tech Owner', role: 'USER' },
            create: {
                email: 'tech@shopylink.local',
                name: 'Tech Owner',
                role: 'USER',
            },
        }),
        prisma.user.upsert({
            where: { email: 'food@shopylink.local' },
            update: { name: 'Food Owner', role: 'USER' },
            create: {
                email: 'food@shopylink.local',
                name: 'Food Owner',
                role: 'USER',
            },
        }),
    ]);

    const stores = await Promise.all([
        prisma.store.upsert({
            where: { slug: 'moda-urbana' },
            update: {
                name: 'Moda Urbana',
                description: 'Tienda demo de ropa y accesorios',
                userId: owners[1].id,
                logoUrl:
                    'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=400',
                marketplaceCategory: 'Ropa',
                city: 'Bogota',
                country: 'CO',
                tags: ['moda', 'ropa', 'accesorios'],
                featured: true,
                isPublic: true,
            },
            create: {
                name: 'Moda Urbana',
                slug: 'moda-urbana',
                description: 'Tienda demo de ropa y accesorios',
                userId: owners[1].id,
                logoUrl:
                    'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=400',
                marketplaceCategory: 'Ropa',
                city: 'Bogota',
                country: 'CO',
                tags: ['moda', 'ropa', 'accesorios'],
                featured: true,
                isPublic: true,
                planType: 'FREE',
            },
        }),
        prisma.store.upsert({
            where: { slug: 'tecnologia-al-dia' },
            update: {
                name: 'Tecnologia al Dia',
                description: 'Tienda demo de tecnologia y gadgets',
                userId: owners[2].id,
                logoUrl:
                    'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400',
                marketplaceCategory: 'Tecnologia',
                city: 'Medellin',
                country: 'CO',
                tags: ['tech', 'gadgets', 'electronica'],
                featured: true,
                isPublic: true,
            },
            create: {
                name: 'Tecnologia al Dia',
                slug: 'tecnologia-al-dia',
                description: 'Tienda demo de tecnologia y gadgets',
                userId: owners[2].id,
                logoUrl:
                    'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400',
                marketplaceCategory: 'Tecnologia',
                city: 'Medellin',
                country: 'CO',
                tags: ['tech', 'gadgets', 'electronica'],
                featured: true,
                isPublic: true,
                planType: 'PRO',
            },
        }),
        prisma.store.upsert({
            where: { slug: 'sabor-casero' },
            update: {
                name: 'Sabor Casero',
                description: 'Tienda demo de comidas y bebidas',
                userId: owners[3].id,
                logoUrl:
                    'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400',
                marketplaceCategory: 'Comida',
                city: 'Cali',
                country: 'CO',
                tags: ['comida', 'bebidas', 'snacks'],
                featured: false,
                isPublic: true,
            },
            create: {
                name: 'Sabor Casero',
                slug: 'sabor-casero',
                description: 'Tienda demo de comidas y bebidas',
                userId: owners[3].id,
                logoUrl:
                    'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400',
                marketplaceCategory: 'Comida',
                city: 'Cali',
                country: 'CO',
                tags: ['comida', 'bebidas', 'snacks'],
                featured: false,
                isPublic: true,
                planType: 'FREE',
            },
        }),
    ]);

    return stores;
}

async function seedFashionStore(prisma: PrismaClient, storeId: string) {
    console.log('\n👕 Seeding Fashion Store...');

    // Categories
    const categories = await Promise.all([
        prisma.category.upsert({
            where: { storeId_slug: { storeId, slug: 'camisetas' } },
            update: {},
            create: { name: 'Camisetas', slug: 'camisetas', storeId },
        }),
        prisma.category.upsert({
            where: { storeId_slug: { storeId, slug: 'pantalones' } },
            update: {},
            create: { name: 'Pantalones', slug: 'pantalones', storeId },
        }),
        prisma.category.upsert({
            where: { storeId_slug: { storeId, slug: 'zapatos' } },
            update: {},
            create: { name: 'Zapatos', slug: 'zapatos', storeId },
        }),
        prisma.category.upsert({
            where: { storeId_slug: { storeId, slug: 'accesorios' } },
            update: {},
            create: { name: 'Accesorios', slug: 'accesorios', storeId },
        }),
    ]);

    // Products with inventory
    const products = [
        // Camisetas
        {
            name: 'Camiseta Básica Blanca',
            description: 'Camiseta de algodón 100% suave y cómoda',
            price: 25000,
            sku: 'CAM-BAS-WHT-001',
            categoryId: categories[0].id,
            stock: 50,
        },
        {
            name: 'Camiseta Negra Premium',
            description: 'Camiseta de algodón premium con corte moderno',
            price: 35000,
            discountPrice: 28000,
            sku: 'CAM-PREM-BLK-001',
            categoryId: categories[0].id,
            stock: 30,
        },
        {
            name: 'Camiseta Estampada',
            description: 'Diseño exclusivo con estampado artístico',
            price: 40000,
            sku: 'CAM-EST-001',
            categoryId: categories[0].id,
            stock: 20,
        },
        {
            name: 'Camiseta Deportiva',
            description: 'Tela transpirable ideal para ejercicio',
            price: 45000,
            discountPrice: 38000,
            sku: 'CAM-DEP-001',
            categoryId: categories[0].id,
            stock: 40,
        },
        {
            name: 'Camiseta Polo',
            description: 'Elegante polo para ocasiones casuales',
            price: 50000,
            sku: 'CAM-POLO-001',
            categoryId: categories[0].id,
            stock: 25,
        },
        // Pantalones
        {
            name: 'Jean Clásico Azul',
            description: 'Jean de mezclilla resistente y cómodo',
            price: 80000,
            sku: 'PAN-JEAN-BLU-001',
            categoryId: categories[1].id,
            stock: 35,
        },
        {
            name: 'Pantalón Chino Beige',
            description: 'Pantalón elegante para uso diario',
            price: 75000,
            discountPrice: 60000,
            sku: 'PAN-CHI-BEI-001',
            categoryId: categories[1].id,
            stock: 28,
        },
        {
            name: 'Pantalón Deportivo',
            description: 'Cómodo y flexible para actividades físicas',
            price: 55000,
            sku: 'PAN-DEP-001',
            categoryId: categories[1].id,
            stock: 45,
        },
        {
            name: 'Short Casual',
            description: 'Perfecto para clima cálido',
            price: 45000,
            sku: 'PAN-SHO-001',
            categoryId: categories[1].id,
            stock: 30,
        },
        {
            name: 'Pantalón Formal Negro',
            description: 'Elegante para ocasiones especiales',
            price: 90000,
            discountPrice: 75000,
            sku: 'PAN-FOR-BLK-001',
            categoryId: categories[1].id,
            stock: 20,
        },
        // Zapatos
        {
            name: 'Zapatillas Deportivas',
            description: 'Comodidad y estilo para tu día a día',
            price: 120000,
            sku: 'ZAP-DEP-001',
            categoryId: categories[2].id,
            stock: 25,
        },
        {
            name: 'Zapatos Casuales',
            description: 'Versátiles y cómodos',
            price: 95000,
            discountPrice: 80000,
            sku: 'ZAP-CAS-001',
            categoryId: categories[2].id,
            stock: 30,
        },
        {
            name: 'Botas de Cuero',
            description: 'Resistentes y elegantes',
            price: 150000,
            sku: 'ZAP-BOT-001',
            categoryId: categories[2].id,
            stock: 15,
        },
        {
            name: 'Sandalias de Verano',
            description: 'Frescas y cómodas',
            price: 40000,
            sku: 'ZAP-SAN-001',
            categoryId: categories[2].id,
            stock: 40,
        },
        {
            name: 'Zapatos Formales',
            description: 'Perfectos para eventos especiales',
            price: 130000,
            discountPrice: 110000,
            sku: 'ZAP-FOR-001',
            categoryId: categories[2].id,
            stock: 18,
        },
        // Accesorios
        {
            name: 'Gorra Deportiva',
            description: 'Protección solar con estilo',
            price: 25000,
            sku: 'ACC-GOR-001',
            categoryId: categories[3].id,
            stock: 50,
        },
        {
            name: 'Cinturón de Cuero',
            description: 'Accesorio elegante y duradero',
            price: 35000,
            discountPrice: 28000,
            sku: 'ACC-CIN-001',
            categoryId: categories[3].id,
            stock: 35,
        },
        {
            name: 'Mochila Urbana',
            description: 'Espaciosa y resistente',
            price: 80000,
            sku: 'ACC-MOC-001',
            categoryId: categories[3].id,
            stock: 20,
        },
        {
            name: 'Gafas de Sol',
            description: 'Protección UV con diseño moderno',
            price: 60000,
            sku: 'ACC-GAF-001',
            categoryId: categories[3].id,
            stock: 30,
        },
        {
            name: 'Reloj Deportivo',
            description: 'Resistente al agua',
            price: 120000,
            discountPrice: 95000,
            sku: 'ACC-REL-001',
            categoryId: categories[3].id,
            stock: 15,
        },
    ];

    // Create products with inventory
    for (const productData of products) {
        const { stock, ...productInfo } = productData;

        // Check if product exists
        const existingProduct = await prisma.product.findFirst({
            where: {
                storeId,
                sku: productInfo.sku,
            },
        });

        const product = existingProduct
            ? existingProduct
            : await prisma.product.create({
                data: {
                    ...productInfo,
                    storeId,
                    images: [`https://images.unsplash.com/photo-${Math.random().toString(36).substring(7)}?w=500`],
                },
            });

        // Create or update inventory
        await prisma.inventory.upsert({
            where: { productId: product.id },
            update: { stock },
            create: { productId: product.id, stock },
        });
    }

    console.log('✅ Fashion store seeded');
}

async function seedElectronicsStore(prisma: PrismaClient, storeId: string) {
    console.log('\n📱 Seeding Electronics Store...');

    // Categories
    const categories = await Promise.all([
        prisma.category.upsert({
            where: { storeId_slug: { storeId, slug: 'smartphones' } },
            update: {},
            create: { name: 'Smartphones', slug: 'smartphones', storeId },
        }),
        prisma.category.upsert({
            where: { storeId_slug: { storeId, slug: 'laptops' } },
            update: {},
            create: { name: 'Laptops', slug: 'laptops', storeId },
        }),
        prisma.category.upsert({
            where: { storeId_slug: { storeId, slug: 'audio' } },
            update: {},
            create: { name: 'Audio', slug: 'audio', storeId },
        }),
        prisma.category.upsert({
            where: { storeId_slug: { storeId, slug: 'accesorios-tech' } },
            update: {},
            create: { name: 'Accesorios Tech', slug: 'accesorios-tech', storeId },
        }),
    ]);

    const products = [
        // Smartphones
        {
            name: 'Smartphone Pro Max',
            description: 'Última generación con cámara de 108MP',
            price: 2500000,
            sku: 'PHONE-PRO-001',
            categoryId: categories[0].id,
            stock: 15,
        },
        {
            name: 'Smartphone Lite',
            description: 'Rendimiento excepcional a precio accesible',
            price: 800000,
            discountPrice: 700000,
            sku: 'PHONE-LITE-001',
            categoryId: categories[0].id,
            stock: 30,
        },
        // Add more products here following the same pattern...
    ];

    for (const productData of products) {
        const { stock, ...productInfo } = productData;

        const existingProduct = await prisma.product.findFirst({
            where: {
                storeId,
                sku: productInfo.sku,
            },
        });

        const product = existingProduct
            ? existingProduct
            : await prisma.product.create({
                data: {
                    ...productInfo,
                    storeId,
                    images: [`https://images.unsplash.com/photo-${Math.random().toString(36).substring(7)}?w=500`],
                },
            });

        await prisma.inventory.upsert({
            where: { productId: product.id },
            update: { stock },
            create: { productId: product.id, stock },
        });
    }

    console.log('✅ Electronics store seeded');
}

async function seedFoodStore(prisma: PrismaClient, storeId: string) {
    console.log('\n🍕 Seeding Food Store...');

    // Categories
    const categories = await Promise.all([
        prisma.category.upsert({
            where: { storeId_slug: { storeId, slug: 'bebidas' } },
            update: {},
            create: { name: 'Bebidas', slug: 'bebidas', storeId },
        }),
        prisma.category.upsert({
            where: { storeId_slug: { storeId, slug: 'snacks' } },
            update: {},
            create: { name: 'Snacks', slug: 'snacks', storeId },
        }),
        prisma.category.upsert({
            where: { storeId_slug: { storeId, slug: 'comidas' } },
            update: {},
            create: { name: 'Comidas', slug: 'comidas', storeId },
        }),
        prisma.category.upsert({
            where: { storeId_slug: { storeId, slug: 'postres' } },
            update: {},
            create: { name: 'Postres', slug: 'postres', storeId },
        }),
    ]);

    const products = [
        // Bebidas
        {
            name: 'Coca-Cola 1.5L',
            description: 'Refresco clásico',
            price: 5000,
            sku: 'BEB-COC-001',
            categoryId: categories[0].id,
            stock: 100,
        },
        {
            name: 'Jugo de Naranja Natural',
            description: '100% natural, sin azúcar añadida',
            price: 8000,
            discountPrice: 6500,
            sku: 'BEB-JUG-001',
            categoryId: categories[0].id,
            stock: 50,
        },
        // Add more products here following the same pattern...
    ];

    for (const productData of products) {
        const { stock, ...productInfo } = productData;

        const existingProduct = await prisma.product.findFirst({
            where: {
                storeId,
                sku: productInfo.sku,
            },
        });

        const product = existingProduct
            ? existingProduct
            : await prisma.product.create({
                data: {
                    ...productInfo,
                    storeId,
                    images: [`https://images.unsplash.com/photo-${Math.random().toString(36).substring(7)}?w=500`],
                },
            });

        await prisma.inventory.upsert({
            where: { productId: product.id },
            update: { stock },
            create: { productId: product.id, stock },
        });
    }

    console.log('✅ Food store seeded');
}

main()
    .catch((e) => {
        console.error('❌ Error seeding:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
