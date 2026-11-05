'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShoppingBag, X, Minus, Plus, Trash2, Store as StoreIcon, ArrowRight } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { formatCurrency } from '@/lib/utils';

/**
 * Marketplace cart drawer.
 *
 * The global cart can hold items from several stores at once, so the drawer
 * groups them by store. Each group becomes its own order at checkout.
 */
export function MarketplaceCartDrawer({
    isOpen,
    onClose,
}: {
    isOpen: boolean;
    onClose: () => void;
}) {
    const router = useRouter();
    const { groups, total, count, setQuantity, removeItem, hydrated } = useCart();

    if (!isOpen) return null;

    const handleCheckout = () => {
        onClose();
        router.push('/marketplace/checkout');
    };

    return (
        <div className="fixed inset-0 z-[100] flex justify-end">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
            <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col">
                <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-black text-gray-900">Tu Pedido</h2>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-0.5">
                            {count} {count === 1 ? 'producto' : 'productos'}
                            {groups.length > 1 ? ` · ${groups.length} tiendas` : ''}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-10 h-10 flex items-center justify-center bg-gray-50 border border-gray-100 rounded-xl text-gray-400 hover:text-gray-900 hover:bg-gray-100 transition-all active:scale-90"
                        aria-label="Cerrar carrito"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {!hydrated ? (
                        <div className="h-40 bg-gray-100 rounded-2xl animate-pulse" />
                    ) : groups.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-center text-gray-400">
                            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4 text-gray-300">
                                <ShoppingBag className="w-10 h-10" />
                            </div>
                            <p className="text-sm font-black text-gray-600">Tu carrito está vacío</p>
                            <p className="text-xs font-medium mt-1 max-w-[220px]">
                                Explora el marketplace y agrega productos de distintas tiendas.
                            </p>
                            <button
                                onClick={onClose}
                                className="mt-5 bg-blue-600 text-white px-5 py-3 rounded-xl font-black text-xs hover:bg-blue-700 transition-colors"
                            >
                                Explorar productos
                            </button>
                        </div>
                    ) : (
                        groups.map((group) => (
                            <div key={group.storeId} className="space-y-4">
                                <div className="flex items-center justify-between gap-3 pb-2 border-b border-gray-100">
                                    <Link
                                        href={`/marketplace/tienda/${group.storeSlug}`}
                                        onClick={onClose}
                                        className="flex items-center gap-2 min-w-0 group"
                                    >
                                        <StoreIcon className="w-4 h-4 text-blue-600 shrink-0" />
                                        <span className="font-black text-sm text-gray-900 truncate group-hover:text-blue-600 transition-colors">
                                            {group.storeName}
                                        </span>
                                    </Link>
                                    <span className="font-black text-sm text-gray-900 shrink-0">
                                        {formatCurrency(group.total)}
                                    </span>
                                </div>

                                {group.items.map((item) => (
                                    <div key={item.id + (item.variantId || '')} className="flex gap-3">
                                        <div className="w-14 h-14 bg-gray-50 rounded-xl flex items-center justify-center overflow-hidden border border-gray-100 relative shrink-0">
                                            {item.image ? (
                                                <Image
                                                    src={item.image}
                                                    alt={item.name}
                                                    fill
                                                    className="object-cover"
                                                    sizes="56px"
                                                />
                                            ) : (
                                                <ShoppingBag className="w-5 h-5 text-gray-300" />
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-bold text-sm text-gray-900 line-clamp-1">
                                                {item.name}
                                            </h4>
                                            {item.variantName && (
                                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                                                    {item.variantName}
                                                </p>
                                            )}
                                            <p className="text-blue-600 font-black text-xs">
                                                {formatCurrency(item.price)}
                                            </p>
                                            <div className="flex items-center gap-3 mt-1.5">
                                                <button
                                                    onClick={() => setQuantity(item.id, item.variantId, item.quantity - 1)}
                                                    className="p-1 border border-gray-200 rounded-lg hover:bg-gray-100 text-gray-500 active:scale-90 transition-all"
                                                    aria-label="Restar unidad"
                                                >
                                                    <Minus className="w-3.5 h-3.5" />
                                                </button>
                                                <span className="font-black text-xs w-4 text-center text-gray-900">
                                                    {item.quantity}
                                                </span>
                                                <button
                                                    onClick={() => setQuantity(item.id, item.variantId, item.quantity + 1)}
                                                    className="p-1 border border-gray-200 rounded-lg hover:bg-gray-100 text-gray-500 active:scale-90 transition-all"
                                                    aria-label="Sumar unidad"
                                                >
                                                    <Plus className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end justify-between">
                                            <button
                                                onClick={() => removeItem(item.id, item.variantId)}
                                                className="text-gray-300 hover:text-red-500 transition-colors"
                                                aria-label="Quitar producto"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                            <p className="font-black text-sm text-gray-900">
                                                {formatCurrency(item.price * item.quantity)}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ))
                    )}
                </div>

                {groups.length > 0 && (
                    <div className="p-6 border-t border-gray-100 space-y-4">
                        <div className="flex justify-between items-center text-xl font-black text-gray-900">
                            <span>Total:</span>
                            <span className="text-blue-600">{formatCurrency(total)}</span>
                        </div>
                        <p className="text-[11px] font-medium text-gray-400 text-center leading-relaxed">
                            Se generará un pedido por tienda. Recibirás un mensaje de WhatsApp por cada comercio.
                        </p>
                        <button
                            onClick={handleCheckout}
                            className="w-full bg-blue-600 text-white py-5 rounded-2xl font-black text-lg flex items-center justify-center gap-3 hover:bg-blue-700 transition-all active:scale-95 shadow-xl shadow-blue-600/20"
                        >
                            Finalizar pedido
                            <ArrowRight className="w-5 h-5" />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
