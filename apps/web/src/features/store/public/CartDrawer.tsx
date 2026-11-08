'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ShoppingBag, X, Minus, Plus, MessageCircle, Loader2, Store as StoreIcon, Trash2 } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import { useCart } from '@/contexts/CartContext';

interface CartItem {
    id: string;
    quantity: number;
    name: string;
    price: number;
    image?: string;
    variantId?: string;
    variantName?: string;
}

interface CartDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    cart: CartItem[];
    cartTotal: number;
    isCreatingOrder: boolean;
    /** id of the store being viewed — used to spot items from other stores */
    storeId: string;
    onUpdateQuantity: (id: string, delta: number, variantId?: string) => void;
    onCheckout: () => void;
    /** País de la tienda: define la moneda de los precios. */
    country?: string | null;
}

export function CartDrawer({
    isOpen,
    onClose,
    cart,
    cartTotal,
    isCreatingOrder,
    storeId,
    onUpdateQuantity,
    onCheckout,
    country
}: CartDrawerProps) {
    const { groups, clearAll } = useCart();

    if (!isOpen) return null;

    // Items that belong to other stores. They stay in the global cart and are
    // ordered together from the marketplace checkout, so we warn the shopper
    // instead of silently dropping them.
    const otherGroups = groups.filter((group) => group.storeId !== storeId);
    const otherItems = otherGroups.reduce((acc, group) => acc + group.count, 0);

    return (
        <div className="fixed inset-0 z-[100] flex justify-end">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
            <div className="relative w-full max-w-md bg-[var(--bg)] h-full shadow-2xl flex flex-col text-[var(--text)]">
                <div className="p-6 border-b border-[var(--border)] flex items-center justify-between">
                    <h2 className="text-2xl font-black">Tu Pedido</h2>
                    <button
                        onClick={onClose}
                        className="w-10 h-10 flex items-center justify-center bg-[var(--bg)] border border-[var(--border)] rounded-xl text-[var(--text)]/40 hover:text-[var(--text)] hover:bg-[var(--surface)] hover:shadow-[var(--shadow)] transition-all active:scale-90"
                        aria-label="Cerrar carrito"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {cart.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-center text-gray-400">
                            <div className="w-20 h-20 bg-[var(--secondary)] rounded-full flex items-center justify-center mb-4 text-[var(--text)]/40">
                                <ShoppingBag className="w-10 h-10" />
                            </div>
                            <p className="text-sm font-bold">Tu carrito está vacío</p>
                        </div>
                    ) : (
                        cart.map((item) => (
                            <div key={item.id + (item.variantId || '')} className="flex gap-4">
                                <div className="w-16 h-16 bg-[var(--secondary)] rounded-2xl flex items-center justify-center overflow-hidden border border-[var(--border)] relative">
                                    {item.image ? (
                                        <Image
                                            src={item.image}
                                            alt={item.name}
                                            fill
                                            className="object-cover"
                                            sizes="64px"
                                        />
                                    ) : (
                                        <ShoppingBag className="w-6 h-6 text-gray-200" />
                                    )}
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-bold text-sm line-clamp-1">{item.name}</h4>
                                    {item.variantName && (
                                        <p className="text-[10px] text-[var(--text)]/40 font-bold uppercase tracking-widest">{item.variantName}</p>
                                    )}
                                    <p className="text-[var(--primary)] font-black text-xs">{formatPrice(item.price, country)}</p>
                                    <div className="flex items-center gap-3 mt-2">
                                        <button
                                            onClick={() => onUpdateQuantity(item.id, -1, item.variantId)}
                                            className="p-1 border border-[var(--border)] rounded-lg hover:bg-[var(--secondary)] text-[var(--text)]/50 active:scale-90 transition-all"
                                            aria-label="Restar unidad"
                                        >
                                            <Minus className="w-4 h-4" />
                                        </button>
                                        <span className="font-black text-xs w-4 text-center">{item.quantity}</span>
                                        <button
                                            onClick={() => onUpdateQuantity(item.id, 1, item.variantId)}
                                            className="p-1 border border-[var(--border)] rounded-lg hover:bg-[var(--secondary)] text-[var(--text)]/50 active:scale-90 transition-all"
                                            aria-label="Sumar unidad"
                                        >
                                            <Plus className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="font-black text-sm">{formatPrice(item.price * item.quantity, country)}</p>
                                </div>
                            </div>
                        ))
                    )}

                    {cart.length > 0 && otherItems > 0 && (
                        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
                            <p className="flex items-center gap-2 text-xs font-black text-amber-900">
                                <StoreIcon className="w-4 h-4 shrink-0" />
                                Tu carrito tiene {otherItems}{' '}
                                {otherItems === 1 ? 'producto más' : 'productos más'}
                            </p>
                            <p className="mt-1.5 text-[11px] font-medium leading-relaxed text-amber-800">
                                Pertenecen a otras tiendas del marketplace. Se piden por
                                separado, asi que envialos desde el marketplace para incluirlo
                                todo.
                            </p>
                            <Link
                                href="/marketplace/checkout"
                                className="mt-3 inline-flex items-center gap-1.5 rounded-xl bg-amber-500 px-3.5 py-2 text-[11px] font-black text-white transition-colors hover:bg-amber-600 active:scale-95"
                            >
                                Ver el carrito completo
                            </Link>
                        </div>
                    )}
                </div>

                {cart.length > 0 && (
                    <div className="p-6 border-t border-[var(--border)] space-y-4">
                        <div className="flex justify-between items-center text-xl font-black">
                            <span>Total:</span>
                            <span className="text-[var(--primary)]">{formatPrice(cartTotal, country)}</span>
                        </div>
                        <button
                            onClick={onCheckout}
                            disabled={isCreatingOrder}
                            className="w-full bg-[#25D366] text-white py-5 rounded-[2rem] font-black text-lg flex items-center justify-center gap-3 hover:scale-[1.02] transition-all shadow-xl shadow-green-500/10 disabled:opacity-50"
                        >
                            {isCreatingOrder ? (
                                <Loader2 className="w-6 h-6 animate-spin" />
                            ) : (
                                <>
                                    <MessageCircle className="w-6 h-6" />
                                    Enviar pedido por WhatsApp
                                </>
                            )}
                        </button>
                        <button
                            onClick={() => clearAll()}
                            className="w-full rounded-xl py-2 text-[11px] font-bold text-[var(--text)]/40 transition-colors hover:bg-[var(--secondary)] hover:text-red-500"
                        >
                            <Trash2 className="mr-1.5 inline h-3.5 w-3.5" />
                            Vaciar todo el carrito
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
