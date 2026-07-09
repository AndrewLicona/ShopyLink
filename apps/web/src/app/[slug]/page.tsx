import { StoreView } from './StoreView';
import { api } from '@/services/api';
import { Metadata } from 'next';
import type { Product, Category } from '@/types/types';
import { StoreNotFound } from '@/features/store/public/StoreNotFound';
import { formatCurrency } from '@/lib/utils';

import { getAbsoluteUrl } from '@/lib/utils';

export async function generateMetadata({ params, searchParams }: {
    params: Promise<{ slug: string }>,
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}): Promise<Metadata> {
    const { slug } = await params;
    const { p: productId } = await searchParams;

    try {
        const store = await api.getStoreBySlug(slug, { next: { revalidate: 60 } });

        if (typeof productId === 'string') {
            try {
                const product = await api.getProduct(productId, { next: { revalidate: 60 } });
                if (product) {
                    const price = Number(product.price);
                    const discountPrice = product.discountPrice ? Number(product.discountPrice) : null;

                    let title = `${product.name} | ${store.name}`;
                    let description = product.description || `Mira ${product.name} en ${store.name} y haz tu pedido por WhatsApp.`;

                    if (discountPrice && discountPrice < price) {
                        title = `${product.name} - ${formatCurrency(discountPrice)} (Antes ${formatCurrency(price)}) | ${store.name}`;
                        description = `¡En oferta! ${product.name} por solo ${formatCurrency(discountPrice)}. ${description}`;
                    } else if (price > 0) {
                        title = `${product.name} - ${formatCurrency(price)} | ${store.name}`;
                        description = `${product.name} por ${formatCurrency(price)}. ${description}`;
                    }

                    const absoluteImage = product.images?.[0] ? getAbsoluteUrl(product.images[0]) : getAbsoluteUrl(store.logoUrl);

                    return {
                        title,
                        description,
                        openGraph: {
                            title,
                            images: absoluteImage ? [{ url: absoluteImage }] : [],
                        }
                    };
                }

            } catch (err) {
                console.error('Error fetching product metadata:', err);
            }
        }

        // Si no hay producto, retornamos undefined para que use el de layout.tsx
        return {};
    } catch {
        return {};
    }
}

export default async function StorePage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;

    try {
        // Fetch store by slug (public endpoint) - Server side
        const storeData = await api.getStoreBySlug(slug, {
            next: { revalidate: 60 }
        });

        // Fetch products, categories and banners - Server side
        const [productsData, categoriesData, bannersData] = await Promise.all([
            api.getProducts(storeData.id, { onlyActive: 'true' }, { next: { revalidate: 60 } }),
            api.getCategories(storeData.id),
            api.getBanners(storeData.id, true).catch(() => [])
        ]);

        const activeProducts = productsData.filter((p: Product) => {
            if (!p.isActive) return false;

            // Si el producto no trackea inventario, siempre es visible
            if (p.trackInventory === false) return true;

            // Si tiene variantes, verificar disponibilidad granular
            if (p.variants && p.variants.length > 0) {
                // El producto es visible si el base tiene stock O alguna variante tiene stock
                const isBaseAvailable = (p.inventory?.stock ?? 0) > 0;

                const hasAvailableVariant = p.variants.some(v => {
                    // Una variante es visible si no trackea stock OR (tiene stock > 0)
                    if (v.trackInventory === false) return true;

                    const stock = v.useParentStock ? (p.inventory?.stock ?? 0) : (v.stock ?? 0);
                    return stock > 0;
                });

                return isBaseAvailable || hasAvailableVariant;
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
                banners={bannersData}
            />
        );

    } catch (err: unknown) {
        if (err instanceof Error && !err.message.includes('Store not found')) {
            console.error('Error loading store on server:', err);
        }
        return <StoreNotFound />;
    }
}
