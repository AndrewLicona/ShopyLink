import { Suspense } from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { Search, ShoppingBag, MapPin, Store } from 'lucide-react';
import { MarketplaceSearchBar } from '@/components/molecules/MarketplaceSearchBar';

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
        <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
            <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-20 gap-8">
                        {/* Logo */}
                        <Link href="/marketplace" className="flex items-center gap-2 group shrink-0">
                            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center transform group-hover:scale-105 transition-all shadow-lg shadow-blue-600/20">
                                <ShoppingBag className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <span className="font-black text-xl tracking-tight text-gray-900 block leading-none">ShopyLink</span>
                                <span className="font-bold text-[10px] uppercase tracking-widest text-blue-600">Marketplace</span>
                            </div>
                        </Link>

                        {/* Search Bar (Desktop) */}
                        <div className="hidden md:block flex-1 max-w-2xl">
                            <Suspense fallback={<div className="h-12 bg-gray-100 rounded-2xl animate-pulse" />}>
                                <MarketplaceSearchBar />
                            </Suspense>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-4 shrink-0">
                            <Link href="/login" className="hidden sm:flex items-center gap-2 text-sm font-bold text-gray-600 hover:text-gray-900 transition-colors">
                                Crear Tienda
                            </Link>
                            <Link href="/dashboard" className="flex items-center gap-2 bg-gray-900 text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-gray-800 transition-all hover:scale-105 active:scale-95 shadow-md">
                                <Store className="w-4 h-4" />
                                <span className="hidden sm:inline">Mi Panel</span>
                            </Link>
                        </div>
                    </div>
                </div>
            </header>

            <main className="flex-1">
                {children}
            </main>

            <footer className="bg-white border-t border-gray-100 py-12 mt-auto">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <p className="text-sm font-bold text-gray-400">
                        &copy; {new Date().getFullYear()} ShopyLink. Todos los derechos reservados.
                    </p>
                </div>
            </footer>
        </div>
    );
}
