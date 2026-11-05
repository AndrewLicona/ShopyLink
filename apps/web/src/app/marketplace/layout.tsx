import { Metadata } from 'next';
import { MarketplaceHeader } from '@/features/marketplace/MarketplaceHeader';

export const metadata: Metadata = {
    title: 'Marketplace | ShopyLink',
    description: 'Descubre las mejores tiendas, productos y ofertas en el marketplace oficial de ShopyLink.',
};

export default function MarketplaceLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex min-h-screen flex-col bg-gray-50 font-sans">
            <MarketplaceHeader />

            <main className="flex-1">{children}</main>

            <footer className="mt-auto border-t border-gray-200 bg-white">
                <div className="mx-auto max-w-7xl px-4 py-10 text-center sm:px-6 lg:px-8">
                    <p className="text-sm font-bold text-gray-400">
                        &copy; {new Date().getFullYear()} ShopyLink. Todos los derechos reservados.
                    </p>
                </div>
            </footer>
        </div>
    );
}
