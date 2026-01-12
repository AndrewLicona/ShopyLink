import { Metadata } from 'next';

export const dynamic = 'force-dynamic';

async function getStoreData(slug: string) {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/stores/${slug}`, { cache: 'no-store' });
    if (!res.ok) return null;
    return res.json();
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const resolvedParams = await params;
    const store = await getStoreData(resolvedParams.slug);

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
                { url: store.logoUrl || '/favicon.ico' }
            ],
            shortcut: store.logoUrl || '/favicon.ico',
            apple: store.logoUrl || '/favicon.ico',
        },
        openGraph: {
            title: store.name,
            description: store.description,
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
    const store = await getStoreData(resolvedParams.slug);

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
