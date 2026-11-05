'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, Plus, Search, ShoppingBag } from 'lucide-react';
import { MarketplaceSearchBar } from '@/components/molecules/MarketplaceSearchBar';
import { MarketplaceCartButton } from '@/components/molecules/MarketplaceCartButton';
import { MarketplaceCategoryMenu } from './MarketplaceCategoryMenu';
import { MarketplaceMobileNav } from './MarketplaceMobileNav';
import { api } from '@/services/api';

/**
 * Marketplace header.
 *
 * Deliberately rendered without `backdrop-filter`: any ancestor with a filter
 * becomes the containing block for `position: fixed` children, which is what
 * used to collapse the cart drawer inside the header box.
 */
export function MarketplaceHeader() {
    const pathname = usePathname();
    const [categories, setCategories] = useState<string[]>([]);
    const [mobileNavOpen, setMobileNavOpen] = useState(false);

    useEffect(() => {
        let active = true;
        api
            .getActiveMarketplaceCategories()
            .then((data) => {
                if (active && Array.isArray(data)) setCategories(data);
            })
            .catch(() => {
                if (active) setCategories([]);
            });
        return () => {
            active = false;
        };
    }, []);

    const isActive = (href: string) =>
        href === '/marketplace' ? pathname === href : pathname.startsWith(href);

    const navLinks = [
        { href: '/marketplace', label: 'Inicio' },
        { href: '/marketplace/tiendas', label: 'Tiendas' },
        { href: '/marketplace/ofertas', label: 'Ofertas' },
    ];

    return (
        <>
            <header className="sticky top-0 z-50 border-b border-gray-200 bg-white">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex h-16 items-center gap-3 lg:h-[72px] lg:gap-6">
                        {/* Brand */}
                        <Link
                            href="/marketplace"
                            className="group flex shrink-0 items-center gap-2.5"
                        >
                            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-600/25 transition-transform duration-300 group-hover:scale-105">
                                <ShoppingBag className="h-5 w-5" />
                            </span>
                            <span className="flex flex-col leading-none">
                                <span className="text-lg font-black tracking-tight text-gray-900">
                                    ShopyLink
                                </span>
                                <span className="mt-1 hidden text-[10px] font-bold uppercase tracking-[0.2em] text-blue-600 sm:inline">
                                    Marketplace
                                </span>
                            </span>
                        </Link>

                        {/* Primary navigation (desktop) */}
                        <nav className="hidden items-center gap-1 lg:flex">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className={`rounded-xl px-3 py-2 text-sm font-bold transition-colors ${
                                        isActive(link.href)
                                            ? 'bg-blue-50 text-blue-700'
                                            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                                    }`}
                                >
                                    {link.label}
                                </Link>
                            ))}
                            <MarketplaceCategoryMenu categories={categories} />
                        </nav>

                        {/* Search (desktop) */}
                        <div className="ml-auto hidden min-w-0 flex-1 justify-end lg:flex">
                            <div className="w-full max-w-lg">
                                <Suspense
                                    fallback={
                                        <div className="h-11 animate-pulse rounded-2xl bg-gray-100" />
                                    }
                                >
                                    <MarketplaceSearchBar />
                                </Suspense>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="ml-auto flex shrink-0 items-center gap-2 lg:ml-0 lg:gap-3">
                            <button
                                type="button"
                                onClick={() => setMobileNavOpen(true)}
                                className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 text-gray-500 transition-all hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600 active:scale-95 lg:hidden"
                                aria-label="Abrir búsqueda y menú"
                            >
                                <Search className="h-[18px] w-[18px]" />
                            </button>

                            <MarketplaceCartButton />

                            <Link
                                href="/login"
                                className="hidden items-center gap-2 rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-bold text-gray-700 transition-all hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 active:scale-95 sm:flex"
                            >
                                <Plus className="h-4 w-4" />
                                Crear tienda
                            </Link>

                            <Link
                                href="/dashboard"
                                className="flex items-center gap-2 rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-bold text-white transition-all hover:bg-gray-800 active:scale-95"
                            >
                                <span className="hidden sm:inline">Mi panel</span>
                                <span className="sm:hidden">Panel</span>
                            </Link>

                            <button
                                type="button"
                                onClick={() => setMobileNavOpen(true)}
                                className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 text-gray-500 transition-all hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600 active:scale-95 lg:hidden"
                                aria-label="Abrir menú"
                            >
                                <Menu className="h-5 w-5" />
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <MarketplaceMobileNav
                isOpen={mobileNavOpen}
                onClose={() => setMobileNavOpen(false)}
                categories={categories}
            />
        </>
    );
}
