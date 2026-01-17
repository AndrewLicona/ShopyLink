'use client';

import { ShoppingBag, Loader2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Store } from '@/types/types';

interface OrderModalsProps {
    store: Store;
    showNameModal: boolean;
    setShowNameModal: (show: boolean) => void;
    customerName: string;
    setCustomerName: (name: string) => void;
    customerAddress: string;
    setCustomerAddress: (address: string) => void;
    deliveryMethod: 'delivery' | 'pickup';
    setDeliveryMethod: (method: 'delivery' | 'pickup') => void;
    isCreatingOrder: boolean;
    onConfirmOrder: () => void;
    stockAlert: { show: boolean, message: string };
    onCloseStockAlert: () => void;
}

export function OrderModals({
    store,
    showNameModal,
    setShowNameModal,
    customerName,
    setCustomerName,
    customerAddress,
    setCustomerAddress,
    deliveryMethod,
    setDeliveryMethod,
    isCreatingOrder,
    onConfirmOrder,
    stockAlert,
    onCloseStockAlert
}: OrderModalsProps) {
    return (
        <>
            {/* Name Modal */}
            {showNameModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="bg-[var(--surface)] w-full max-w-sm rounded-[3rem] shadow-[var(--shadow-strong)] overflow-hidden animate-in zoom-in-95 duration-300 ring-1 ring-black/5">
                        <div className="p-8 space-y-8">
                            <div className="flex flex-col items-center text-center gap-4">
                                <div className="w-20 h-20 bg-[var(--primary)]/10 text-[var(--primary)] rounded-[2rem] flex items-center justify-center shadow-inner">
                                    <ShoppingBag className="w-10 h-10" />
                                </div>
                                <div className="space-y-2">
                                    <h2 className="text-2xl font-black text-[var(--text)] leading-tight">¿Cómo te llamas?</h2>
                                    <p className="text-[var(--text)]/40 font-bold text-xs uppercase tracking-widest">Para identificar tu pedido</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="relative group">
                                    <input
                                        type="text"
                                        placeholder="Tu nombre completo"
                                        autoFocus
                                        value={customerName}
                                        onChange={(e) => setCustomerName(e.target.value)}
                                        className="w-full px-6 py-5 rounded-[1.5rem] bg-[var(--secondary)] border-2 border-transparent focus:border-[var(--primary)]/20 focus:bg-[var(--bg)] outline-none text-[var(--text)] font-bold transition-all text-center placeholder:text-[var(--text)]/30"
                                    />
                                </div>

                                {store.deliveryEnabled && (
                                    <div className="space-y-4">
                                        {/* Delivery Method Toggle */}
                                        <div className="flex p-1 bg-[var(--secondary)] rounded-[1.5rem] relative">
                                            <button
                                                type="button"
                                                onClick={() => setDeliveryMethod('delivery')}
                                                className={cn(
                                                    "flex-1 py-3 px-4 rounded-[1.2rem] text-xs sm:text-sm font-black transition-all duration-300 z-10",
                                                    deliveryMethod === 'delivery'
                                                        ? "bg-[var(--primary)] text-[var(--primary-foreground)] shadow-lg scale-100"
                                                        : "text-[var(--text)]/40 hover:text-[var(--text)]/60"
                                                )}
                                            >
                                                Domicilio
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setDeliveryMethod('pickup')}
                                                className={cn(
                                                    "flex-1 py-3 px-4 rounded-[1.2rem] text-xs sm:text-sm font-black transition-all duration-300 z-10",
                                                    deliveryMethod === 'pickup'
                                                        ? "bg-[var(--primary)] text-[var(--primary-foreground)] shadow-lg scale-100"
                                                        : "text-[var(--text)]/40 hover:text-[var(--text)]/60"
                                                )}
                                            >
                                                Retirar en Tienda
                                            </button>
                                        </div>

                                        {/* Address Input - Animated visibility */}
                                        <div className={cn(
                                            "space-y-4 transition-all duration-300 overflow-hidden",
                                            deliveryMethod === 'delivery' ? "opacity-100 max-h-[200px]" : "opacity-0 max-h-0"
                                        )}>
                                            <div className="relative">
                                                <input
                                                    type="text"
                                                    placeholder="Dirección de envío (Opcional)"
                                                    value={customerAddress}
                                                    onChange={(e) => setCustomerAddress(e.target.value)}
                                                    className="w-full px-6 py-5 rounded-[1.5rem] bg-[var(--secondary)] border-2 border-transparent focus:border-[var(--primary)]/20 focus:bg-[var(--bg)] outline-none text-[var(--text)] font-bold transition-all text-center placeholder:text-[var(--text)]/30"
                                                />
                                            </div>

                                            <div className="flex items-center justify-center gap-2 mt-1">
                                                <div className="h-px bg-[var(--border)] flex-1" />
                                                <span className="text-[10px] bg-blue-50 text-blue-600 px-3 py-1 rounded-full font-black uppercase tracking-widest border border-blue-100 italic">
                                                    Delivery: {store.deliveryPrice || 'Gratis'}
                                                </span>
                                                <div className="h-px bg-[var(--border)] flex-1" />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <button
                                    onClick={onConfirmOrder}
                                    disabled={!customerName.trim() || isCreatingOrder}
                                    className="w-full bg-[var(--primary)] text-[var(--primary-foreground)] py-5 rounded-[2rem] font-black text-lg flex items-center justify-center gap-3 hover:scale-[1.02] transition-all shadow-xl shadow-[var(--primary)]/10 disabled:opacity-50 disabled:bg-[var(--secondary)] disabled:text-[var(--text)]/40 disabled:shadow-none active:scale-95"
                                >
                                    {isCreatingOrder ? (
                                        <Loader2 className="w-6 h-6 animate-spin" />
                                    ) : (
                                        "Confirmar Pedido"
                                    )}
                                </button>

                                <button
                                    onClick={() => setShowNameModal(false)}
                                    className="w-full text-[var(--text)]/40 font-bold text-sm py-2 hover:text-[var(--text)] transition-colors"
                                >
                                    Cancelar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Stock Alert Modal */}
            {stockAlert.show && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="bg-[var(--surface)] w-full max-w-sm rounded-[3rem] shadow-[var(--shadow-strong)] overflow-hidden animate-in zoom-in-95 duration-300 ring-1 ring-black/5">
                        <div className="p-8 space-y-6">
                            <div className="flex flex-col items-center text-center gap-4">
                                <div className="w-20 h-20 bg-orange-500/10 text-orange-500 rounded-[2rem] flex items-center justify-center shadow-inner">
                                    <AlertCircle className="w-10 h-10" />
                                </div>
                                <div className="space-y-2">
                                    <h2 className="text-2xl font-black leading-tight">¡Lo sentimos!</h2>
                                    <p className="text-[var(--text)]/60 font-bold text-sm">{stockAlert.message}</p>
                                </div>
                            </div>

                            <button
                                onClick={onCloseStockAlert}
                                className="w-full bg-[var(--text)] text-[var(--bg)] py-5 rounded-[2rem] font-black text-lg flex items-center justify-center gap-3 hover:scale-[1.02] transition-all active:scale-95"
                            >
                                Entendido
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
