import { StoreView } from './StoreView';
import { api } from '@/services/api';
import { Metadata } from 'next';
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
        const store = await api.getStoreBySlug(slug, { next: { revalidate: 300 } });

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
        const publicPage = await api.getPublicStorePage(slug, {
            next: { revalidate: 120 }
        });

        return (
            <StoreView
                store={publicPage.store}
                products={publicPage.products}
                categories={publicPage.categories}
                banners={publicPage.banners}
            />
        );

    } catch (err: unknown) {
        if (err instanceof Error && !err.message.includes('Store not found')) {
            console.error('Error loading store on server:', err);
        }
        return <StoreNotFound />;
    }
}
