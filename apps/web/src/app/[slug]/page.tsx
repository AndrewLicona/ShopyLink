import { StoreView } from './StoreView';
import { api } from '@/services/api';
import { Metadata } from 'next';
import { StoreNotFound } from '@/features/store/public/StoreNotFound';
import { formatPrice } from '@/lib/utils';

import { getAbsoluteUrl } from '@/lib/utils';

export async function generateMetadata({ params, searchParams }: {
    params: Promise<{ slug: string }>,
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}): Promise<Metadata> {
    const { slug } = await params;
    const { p: productId } = await searchParams;

    try {
        const store = await api.getStoreBySlug(slug, { next: { revalidate: 300 } });
        const storeUrl = `${process.env.NEXT_PUBLIC_FRONTEND_URL || 'https://shopylinks.shop'}/${slug}`;

        // Imagen para la vista previa al compartir (WhatsApp, etc.): primero el
        // logo de la tienda y, si no hay, el primer banner.
        const shareImage =
            getAbsoluteUrl(store.logoUrl) || getAbsoluteUrl(store.bannerUrl) || null;

        // La imagen OG generada por la ruta /og/<slug>: 1200x630 con el
        // logo centrado y la paleta de la tienda. Es la que WhatsApp sabe
        // mostrar bien (el logo crudo es cuadrado y salía recortado).
        // Va fuera de /api porque nginx manda todo /api al contenedor de la API.
        const ogImage = `${process.env.NEXT_PUBLIC_FRONTEND_URL || 'https://shopylinks.shop'}/og/${slug}`;

        const storeDescription =
            store.description ||
            [
                store.name,
                store.referenceLocation ? `en ${store.referenceLocation}` : '',
                'Catálogo digital y pedidos por WhatsApp.',
            ]
                .filter(Boolean)
                .join(' · ');

        if (typeof productId === 'string') {
            try {
                const product = await api.getProduct(productId, { next: { revalidate: 60 } });
                if (product) {
                    const price = Number(product.price);
                    const discountPrice = product.discountPrice ? Number(product.discountPrice) : null;

                    let title = `${product.name} | ${store.name}`;
                    let description = product.description || `Mira ${product.name} en ${store.name} y haz tu pedido por WhatsApp.`;

                    if (discountPrice && discountPrice < price) {
                        title = `${product.name} - ${formatPrice(discountPrice, store.country)} (Antes ${formatPrice(price, store.country)}) | ${store.name}`;
                        description = `¡En oferta! ${product.name} por solo ${formatPrice(discountPrice, store.country)}. ${description}`;
                    } else if (price > 0) {
                        title = `${product.name} - ${formatPrice(price, store.country)} | ${store.name}`;
                        description = `${product.name} por ${formatPrice(price, store.country)}. ${description}`;
                    }

                    const absoluteImage =
                        getAbsoluteUrl(product.images?.[0]) || shareImage;

                    return {
                        title,
                        description,
                        alternates: { canonical: `${storeUrl}?p=${productId}` },
                        openGraph: {
                            title,
                            description,
                            type: 'website',
                            url: `${storeUrl}?p=${productId}`,
                            images: absoluteImage
                                ? [{ url: absoluteImage, alt: product.name, width: 1200, height: 630 }]
                                : [],
                        },
                        twitter: {
                            card: 'summary_large_image',
                            title,
                            description,
                            images: absoluteImage ? [absoluteImage] : [],
                        },
                    };
                }

            } catch (err) {
                console.error('Error fetching product metadata:', err);
            }
        }

        // La página de la tienda también necesita metadata: sin esto, al
        // compartir el enlace por WhatsApp no se veía ni el logo ni el nombre.
        return {
            title: `${store.name} | Catálogo`,
            description: storeDescription,
            alternates: { canonical: storeUrl },
            openGraph: {
                title: `${store.name} | Catálogo`,
                description: storeDescription,
                type: 'website',
                url: storeUrl,
                images: [{ url: ogImage, alt: store.name, width: 1200, height: 630 }],
            },
            twitter: {
                card: 'summary_large_image',
                title: `${store.name} | Catálogo`,
                description: storeDescription,
                images: [ogImage],
            },
        };
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
