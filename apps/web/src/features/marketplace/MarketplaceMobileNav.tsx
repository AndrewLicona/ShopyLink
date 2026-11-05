'use client';

import { Suspense, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { LayoutGrid, Store, Tag, TicketPercent, X } from 'lucide-react';
import { MarketplaceSearchBar } from '@/components/molecules/MarketplaceSearchBar';
import { Overlay } from '@/components/molecules/Overlay';

/**
 * Slide-in navigation for small screens.
 *
 * It is rendered through a portal so the panel is never clipped by the
 * sticky header, and it locks the page scroll while it is open.
 */
export function MarketplaceMobileNav({
    isOpen,
    onClose,
    categories,
}: {
    isOpen: boolean;
    onClose: () => void;
    categories: string[];
}) {
    const pathname = usePathname();

    useEffect(() => {
        if (!isOpen) return;
        const previous = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = previous;
        };
    }, [isOpen]);

    useEffect(() => {
        if (!isOpen) return;
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]);

    const links = [
        { href: '/marketplace', label: 'Inicio', icon: LayoutGrid },
        { href: '/marketplace/tiendas', label: 'Tiendas', icon: Store },
        { href: '/marketplace/ofertas', label: 'Ofertas', icon: TicketPercent },
    ];

    const isActive = (href: string) =>
        href === '/marketplace' ? pathname === href : pathname.startsWith(href);

    return (
        <Overlay>
            <AnimatePresence>
                {isOpen && (
                    <div className="fixed inset-0 z-[95] lg:hidden">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            onClick={onClose}
                            className="absolute inset-0 bg-gray-950/40 backdrop-blur-[2px]"
                        />

                        <motion.aside
                            initial={{ x: '-100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '-100%' }}
                            transition={{ type: 'spring', damping: 32, stiffness: 320 }}
                            className="absolute inset-y-0 left-0 flex w-[86%] max-w-sm flex-col bg-white shadow-2xl"
                            role="dialog"
                            aria-modal="true"
                            aria-label="Menú de navegación"
                        >
                            <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
                                <span className="text-sm font-black uppercase tracking-widest text-gray-900">
                                    Navegación
                                </span>
                                <button
                                    onClick={onClose}
                                    className="flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200 text-gray-400 transition-all hover:bg-gray-50 hover:text-gray-900 active:scale-90"
                                    aria-label="Cerrar menú"
                                >
                                    <X className="h-4.5 w-4.5" />
                                </button>
                            </div>

                            <div className="border-b border-gray-100 px-5 py-4">
                                <Suspense
                                    fallback={
                                        <div className="h-11 animate-pulse rounded-2xl bg-gray-100" />
                                    }
                                >
                                    <MarketplaceSearchBar />
                                </Suspense>
                            </div>

                            <nav className="flex-1 overflow-y-auto px-3 py-4">
                                <ul className="space-y-1">
                                    {links.map((link) => (
                                        <li key={link.href}>
                                            <Link
                                                href={link.href}
                                                onClick={onClose}
                                                className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-bold transition-colors ${
                                                    isActive(link.href)
                                                        ? 'bg-blue-50 text-blue-700'
                                                        : 'text-gray-700 hover:bg-gray-50'
                                                }`}
                                            >
                                                <link.icon className="h-4.5 w-4.5" />
                                                {link.label}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>

                                {categories.length > 0 && (
                                    <>
                                        <p className="px-3 pb-2 pt-6 text-[10px] font-black uppercase tracking-widest text-gray-400">
                                            Categorías
                                        </p>
                                        <ul className="space-y-1">
                                            {categories.map((category) => (
                                                <li key={category}>
                                                    <Link
                                                        href={`/marketplace/${encodeURIComponent(category)}`}
                                                        onClick={onClose}
                                                        className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-900"
                                                    >
                                                        <Tag className="h-4 w-4 text-gray-400" />
                                                        <span className="truncate">{category}</span>
                                                    </Link>
                                                </li>
                                            ))}
                                        </ul>
                                    </>
                                )}
                            </nav>

                            <div className="space-y-2 border-t border-gray-100 p-4">
                                <Link
                                    href="/dashboard"
                                    onClick={onClose}
                                    className="flex w-full items-center justify-center rounded-xl bg-gray-900 py-3 text-sm font-black text-white transition-all hover:bg-gray-800 active:scale-[0.98]"
                                >
                                    Mi panel
                                </Link>
                                <Link
                                    href="/login"
                                    onClick={onClose}
                                    className="flex w-full items-center justify-center rounded-xl border border-gray-200 py-3 text-sm font-black text-gray-700 transition-all hover:bg-gray-50 active:scale-[0.98]"
                                >
                                    Crear mi tienda
                                </Link>
                            </div>
                        </motion.aside>
                    </div>
                )}
            </AnimatePresence>
        </Overlay>
    );
}
