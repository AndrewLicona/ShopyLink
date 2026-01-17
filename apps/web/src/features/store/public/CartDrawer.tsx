'use client';

import Image from 'next/image';
import { ShoppingBag, X, Minus, Plus, MessageCircle, Loader2 } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

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
    onUpdateQuantity: (id: string, delta: number, variantId?: string) => void;
    onCheckout: () => void;
}

export function CartDrawer({
    isOpen,
    onClose,
    cart,
    cartTotal,
    isCreatingOrder,
    onUpdateQuantity,
    onCheckout
}: CartDrawerProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex justify-end">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
            <div className="relative w-full max-w-md bg-[var(--bg)] h-full shadow-2xl flex flex-col text-[var(--text)]">
                <div className="p-6 border-b border-[var(--border)] flex items-center justify-between">
                    <h2 className="text-2xl font-black">Tu Pedido</h2>
                    <button
                        onClick={onClose}
                        className="w-10 h-10 flex items-center justify-center bg-[var(--bg)] border border-[var(--border)] rounded-xl text-[var(--text)]/40 hover:text-[var(--text)] hover:bg-[var(--surface)] hover:shadow-[var(--shadow)] transition-all active:scale-90"
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
                                    <p className="text-[var(--primary)] font-black text-xs">{formatCurrency(item.price)}</p>
                                    <div className="flex items-center gap-3 mt-2">
                                        <button
                                            onClick={() => onUpdateQuantity(item.id, -1, item.variantId)}
                                            className="p-1 border border-[var(--border)] rounded-lg hover:bg-[var(--secondary)] text-[var(--text)]/50 active:scale-90 transition-all"
                                        >
                                            <Minus className="w-4 h-4" />
                                        </button>
                                        <span className="font-black text-xs w-4 text-center">{item.quantity}</span>
                                        <button
                                            onClick={() => onUpdateQuantity(item.id, 1, item.variantId)}
                                            className="p-1 border border-[var(--border)] rounded-lg hover:bg-[var(--secondary)] text-[var(--text)]/50 active:scale-90 transition-all"
                                        >
                                            <Plus className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="font-black text-sm">{formatCurrency(item.price * item.quantity)}</p>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {cart.length > 0 && (
                    <div className="p-6 border-t border-[var(--border)] space-y-4">
                        <div className="flex justify-between items-center text-xl font-black">
                            <span>Total:</span>
                            <span className="text-[var(--primary)]">{formatCurrency(cartTotal)}</span>
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
                    </div>
                )}
            </div>
        </div>
    );
}
