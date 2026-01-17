import { Metadata } from 'next';
import { api } from '@/services/api';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const resolvedParams = await params;
    const store = await api.getStoreBySlug(resolvedParams.slug, { cache: 'no-store' }).catch(() => null);

    if (!store) {
        return {
            title: 'Tienda no encontrada | ShopyLink',
        };
    }

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
            images: store.logoUrl ? [{ url: store.logoUrl }] : [],
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
    const store = await api.getStoreBySlug(resolvedParams.slug, { cache: 'no-store' }).catch(() => null);

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
