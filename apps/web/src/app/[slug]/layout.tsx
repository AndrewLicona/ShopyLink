import { Metadata } from 'next';
import { api } from '@/services/api';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const resolvedParams = await params;
    const store = await api.getStoreBySlug(resolvedParams.slug, { next: { revalidate: 300 } }).catch(() => null);

    if (!store) {
        return {
            title: 'Tienda no encontrada | ShopyLinks',
        };
    }

    // Imagen de compartir: la ruta /og/<slug> compone un 1200x630 con el
    // logo y la paleta de la tienda. El logo crudo es cuadrado y WhatsApp lo
    // recortaba hasta hacerlo irreconocible.
    // Ojo: la ruta vive fuera de /api porque nginx manda todo /api al
    // contenedor de la API y una ruta de Next bajo /api nunca llegaba aqui.
    const ogImage = `${process.env.NEXT_PUBLIC_FRONTEND_URL || 'https://shopylinks.shop'}/og/${resolvedParams.slug}`;

    return {
        title: `${store.name} | Catálogo Virtual`,
        description: store.description || `Bienvenido a ${store.name}. Explora nuestros productos y haz tu pedido por WhatsApp.`,
        icons: {
            icon: [
                { url: store.logoUrl ?? '/favicon.ico' }
            ],
            shortcut: store.logoUrl ?? '/favicon.ico',
            apple: store.logoUrl ?? '/favicon.ico',
        },
        openGraph: {
            title: store.name,
            description: store.description ?? undefined,
            images: [{ url: ogImage, alt: store.name, width: 1200, height: 630 }],
        },
    };
}

export default async function StoreLayout({
    children,
    params,
}: {
    children: React.ReactNode;
    params: Promise<{ slug: string }>;
}) {
    const resolvedParams = await params;
    const store = await api.getStoreBySlug(resolvedParams.slug, { next: { revalidate: 300 } }).catch(() => null);

    return (
        <div
            data-theme={store?.theme || 'classic'}
            data-mode={store?.mode || 'light'}
            className="min-h-screen bg-[var(--bg)] text-[var(--text)] transition-colors duration-300"
        >
            {children}
        </div>
    );
}
