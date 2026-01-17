import { StoreView } from './StoreView';
import { api } from '@/services/api';
import { Metadata } from 'next';
import type { Product, Category } from '@/types/types';
import { StoreNotFound } from '@/features/store/public/StoreNotFound';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const { slug } = await params;
    try {
        const store = await api.getStoreBySlug(slug, { next: { revalidate: 60 } });
        return {
            title: `${store.name} | Catálogo Virtual`,
            description: `Mira el catálogo de ${store.name} y haz tu pedido por WhatsApp.`,
            openGraph: {
                images: store.logoUrl ? [store.logoUrl] : [],
            }
        };
    } catch {
        return { title: 'ShopyLink' };
    }
}

export default async function StorePage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;

    try {
        // Fetch store by slug (public endpoint) - Server side
        const storeData = await api.getStoreBySlug(slug, {
            cache: 'no-store'
        });

        // Fetch products and categories - Server side
        const [productsData, categoriesData] = await Promise.all([
            api.getProducts(storeData.id, { cache: 'no-store' }),
            api.getCategories(storeData.id)
        ]);

        const activeProducts = productsData.filter((p: Product) => {
            if (!p.isActive) return false;

            // Si el producto no trackea inventario, siempre es visible
            if (p.trackInventory === false) return true;

            // Si tiene variantes, verificar disponibilidad granular
            if (p.variants && p.variants.length > 0) {
                return p.variants.some(v => {
                    // Una variante es visible si no trackea stock OR (tiene stock > 0)
                    if (v.trackInventory === false) return true;

                    const stock = v.useParentStock ? (p.inventory?.stock ?? 0) : (v.stock ?? 0);
                    return stock > 0;
                });
            }

            // Producto simple: debe tener stock > 0
            return (p.inventory?.stock ?? 0) > 0;
        });

        // Filter categories: Only show categories that have at least one active product
        const activeCategoryIds = new Set(activeProducts.map((p: Product) => p.categoryId));
        const visibleCategories = categoriesData.filter((c: Category) => activeCategoryIds.has(c.id));

        return (
            <StoreView
                store={storeData}
                products={activeProducts}
                categories={visibleCategories}
            />
        );

    } catch (err: unknown) {
        if (err instanceof Error && !err.message.includes('Store not found')) {
            console.error('Error loading store on server:', err);
        }
        return <StoreNotFound />;
    }
}
