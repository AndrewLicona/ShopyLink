'use client';

import { useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import {
    ShoppingBag,
    X,
    Minus,
    Plus,
    Trash2,
    Store as StoreIcon,
    ArrowRight,
    PackageOpen,
} from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { formatCurrency } from '@/lib/utils';
import { Overlay } from '@/components/molecules/Overlay';

/**
 * Marketplace cart drawer.
 *
 * The global cart can hold items from several stores at once, so the drawer
 * groups them by store. Each group becomes its own order at checkout.
 *
 * It is rendered through a portal because the marketplace header uses
 * `backdrop-blur-md`, which would otherwise trap the `position: fixed` panel
 * inside the header box.
 */
export function MarketplaceCartDrawer({
    isOpen,
    onClose,
}: {
    isOpen: boolean;
    onClose: () => void;
}) {
    const router = useRouter();
    const { groups, total, count, setQuantity, removeItem, clearAll, hydrated } = useCart();

    // The panel is a side column over a transparent backdrop, so the catalogue
    // behind it must stay scrollable and usable while the cart is open.

    // Close with ESC.
    useEffect(() => {
        if (!isOpen) return;
        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, [isOpen, onClose]);

    const handleCheckout = () => {
        onClose();
        router.push('/marketplace/checkout');
    };

    const storeCount = groups.length;

    return (
        <Overlay>
            <AnimatePresence>
                {isOpen && (
                    <div className="fixed inset-0 z-[100] flex justify-end">
                        {/* Transparent backdrop: the catalogue stays visible and
                            clickable behind the cart, so the shopper can keep
                            browsing while the order is open on the side.
                            Closed with the X button or the ESC key. */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            onClick={onClose}
                            className="pointer-events-none absolute inset-0 bg-transparent"
                        />

                        <motion.aside
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 30, stiffness: 320 }}
                            className="relative flex h-full w-full max-w-[420px] flex-col border-l border-gray-100 bg-white shadow-[-24px_0_70px_-20px_rgba(15,23,42,0.22)]"
                            role="dialog"
                            aria-modal="true"
                            aria-label="Tu pedido"
                        >
                            {/* Header */}
                            <header className="shrink-0 border-b border-gray-100 bg-white/95 px-5 pb-5 pt-6 backdrop-blur-sm">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="min-w-0">
                                        <div className="flex items-center gap-2.5">
                                            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-600/25">
                                                <ShoppingBag className="h-4.5 w-4.5" />
                                            </span>
                                            <h2 className="text-xl font-black tracking-tight text-gray-900">
                                                Tu pedido
                                            </h2>
                                        </div>
                                        <p className="mt-2 text-[11px] font-bold uppercase tracking-widest text-gray-400">
                                            {count} {count === 1 ? 'producto' : 'productos'}
                                            {storeCount > 1 && ` · ${storeCount} tiendas`}
                                        </p>
                                    </div>
                                    <button
                                        onClick={onClose}
                                        className="-mr-1 -mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-400 transition-all hover:bg-gray-50 hover:text-gray-900 active:scale-90"
                                        aria-label="Cerrar carrito"
                                    >
                                        <X className="h-5 w-5" />
                                    </button>
                                </div>
                            </header>

                            {/* Items */}
                            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-5">
                                {!hydrated ? (
                                    <div className="space-y-4">
                                        {[1, 2, 3].map((i) => (
                                            <div key={i} className="h-24 animate-pulse rounded-2xl bg-gray-100" />
                                        ))}
                                    </div>
                                ) : groups.length === 0 ? (
                                    <div className="flex h-full flex-col items-center justify-center text-center">
                                        <div className="relative mb-6">
                                            <div className="absolute inset-0 -z-10 animate-ping rounded-full bg-blue-100 opacity-60" />
                                            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-blue-50 to-indigo-50 text-blue-300">
                                                <PackageOpen className="h-11 w-11" />
                                            </div>
                                        </div>
                                        <p className="text-base font-black text-gray-900">
                                            Tu carrito está vacío
                                        </p>
                                        <p className="mt-2 max-w-[240px] text-xs font-medium leading-relaxed text-gray-400">
                                            Explora el marketplace y agrega productos de distintas
                                            tiendas. Agrupamos todo en un solo pedido.
                                        </p>
                                        <button
                                            onClick={onClose}
                                            className="mt-7 rounded-xl bg-gray-900 px-6 py-3 text-xs font-black text-white transition-all hover:bg-gray-800 active:scale-95"
                                        >
                                            Explorar productos
                                        </button>
                                    </div>
                                ) : (
                                    <div className="space-y-5">
                                        {groups.map((group) => (
                                            <section
                                                key={group.storeId}
                                                className="overflow-hidden rounded-2xl border border-gray-100 bg-gray-50/60"
                                            >
                                                {/* Store header */}
                                                <div className="flex items-center gap-3 border-b border-gray-100 bg-white px-4 py-3">
                                                    <span className="relative flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-blue-50 text-blue-600 ring-1 ring-blue-100">
                                                        {group.storeLogoUrl ? (
                                                            <Image
                                                                src={group.storeLogoUrl}
                                                                alt={group.storeName}
                                                                fill
                                                                className="object-contain p-1"
                                                                sizes="36px"
                                                            />
                                                        ) : (
                                                            <StoreIcon className="h-4 w-4" />
                                                        )}
                                                    </span>
                                                    <div className="min-w-0 flex-1">
                                                        <Link
                                                            href={`/marketplace/tienda/${group.storeSlug}`}
                                                            onClick={onClose}
                                                            className="block truncate text-sm font-black text-gray-900 transition-colors hover:text-blue-600"
                                                        >
                                                            {group.storeName}
                                                        </Link>
                                                        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                                                            {group.items.length}{' '}
                                                            {group.items.length === 1 ? 'producto' : 'productos'}
                                                        </p>
                                                    </div>
                                                    <span className="shrink-0 text-sm font-black text-gray-900">
                                                        {formatCurrency(group.total)}
                                                    </span>
                                                </div>

                                                {/* Group items */}
                                                <ul className="divide-y divide-gray-100 bg-white">
                                                    {group.items.map((item) => (
                                                        <li
                                                            key={item.id + (item.variantId || '')}
                                                            className="flex gap-3 p-4"
                                                        >
                                                            <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-gray-100 ring-1 ring-gray-100">
                                                                {item.image ? (
                                                                    <Image
                                                                        src={item.image}
                                                                        alt={item.name}
                                                                        fill
                                                                        className="object-cover"
                                                                        sizes="64px"
                                                                    />
                                                                ) : (
                                                                    <div className="flex h-full w-full items-center justify-center text-gray-300">
                                                                        <ShoppingBag className="h-5 w-5" />
                                                                    </div>
                                                                )}
                                                            </div>

                                                            <div className="flex min-w-0 flex-1 flex-col">
                                                                <p className="line-clamp-2 text-[13px] font-bold leading-snug text-gray-900">
                                                                    {item.name}
                                                                </p>
                                                                {item.variantName && (
                                                                    <p className="mt-0.5 text-[10px] font-bold uppercase tracking-widest text-gray-400">
                                                                        {item.variantName}
                                                                    </p>
                                                                )}
                                                                <div className="mt-auto flex items-center justify-between gap-2 pt-2">
                                                                    <div className="flex items-center gap-1 rounded-lg border border-gray-200 bg-gray-50 p-0.5">
                                                                        <button
                                                                            onClick={() =>
                                                                                setQuantity(
                                                                                    item.id,
                                                                                    item.variantId,
                                                                                    item.quantity - 1,
                                                                                )
                                                                            }
                                                                            className="flex h-6 w-6 items-center justify-center rounded-md text-gray-500 transition-all hover:bg-white hover:text-gray-900 hover:shadow-sm active:scale-90"
                                                                            aria-label="Restar unidad"
                                                                        >
                                                                            <Minus className="h-3 w-3" />
                                                                        </button>
                                                                        <span className="w-5 text-center text-xs font-black text-gray-900">
                                                                            {item.quantity}
                                                                        </span>
                                                                        <button
                                                                            onClick={() =>
                                                                                setQuantity(
                                                                                    item.id,
                                                                                    item.variantId,
                                                                                    item.quantity + 1,
                                                                                )
                                                                            }
                                                                            className="flex h-6 w-6 items-center justify-center rounded-md text-gray-500 transition-all hover:bg-white hover:text-gray-900 hover:shadow-sm active:scale-90"
                                                                            aria-label="Sumar unidad"
                                                                        >
                                                                            <Plus className="h-3 w-3" />
                                                                        </button>
                                                                    </div>
                                                                    <span className="text-[13px] font-black text-gray-900">
                                                                        {formatCurrency(
                                                                            item.price * item.quantity,
                                                                        )}
                                                                    </span>
                                                                </div>
                                                            </div>

                                                            <button
                                                                onClick={() =>
                                                                    removeItem(item.id, item.variantId)
                                                                }
                                                                className="h-fit shrink-0 rounded-lg p-1.5 text-gray-300 transition-all hover:bg-red-50 hover:text-red-500 active:scale-90"
                                                                aria-label="Quitar producto"
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </button>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </section>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Footer */}
                            {groups.length > 0 && (
                                <footer className="shrink-0 border-t border-gray-100 bg-white px-5 pb-6 pt-5">
                                    <div className="flex items-end justify-between gap-4">
                                        <div>
                                            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                                                Total estimado
                                            </p>
                                            <p className="mt-0.5 text-[11px] font-medium text-gray-400">
                                                {storeCount}{' '}
                                                {storeCount === 1 ? 'pedido' : 'pedidos'} · sin
                                                cobro online
                                            </p>
                                        </div>
                                        <p className="text-3xl font-black tracking-tight text-gray-900">
                                            {formatCurrency(total)}
                                        </p>
                                    </div>

                                    <button
                                        onClick={handleCheckout}
                                        className="group mt-5 flex w-full items-center justify-center gap-2.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 py-4 text-[15px] font-black text-white shadow-xl shadow-blue-600/25 transition-all hover:shadow-2xl hover:shadow-blue-600/35 active:scale-[0.98]"
                                    >
                                        Finalizar pedido
                                        <ArrowRight className="h-4.5 w-4.5 transition-transform group-hover:translate-x-1" />
                                    </button>

                                    <button
                                        onClick={() => clearAll()}
                                        className="mt-3 w-full rounded-xl py-2 text-xs font-bold text-gray-400 transition-colors hover:bg-gray-50 hover:text-red-500"
                                    >
                                        Vaciar carrito
                                    </button>

                                    <p className="mt-1 text-center text-[11px] font-medium leading-relaxed text-gray-400">
                                        Se creará un pedido por tienda. Recibirás un mensaje de
                                        WhatsApp por cada comercio.
                                    </p>
                                </footer>
                            )}
                        </motion.aside>
                    </div>
                )}
            </AnimatePresence>
        </Overlay>
    );
}
