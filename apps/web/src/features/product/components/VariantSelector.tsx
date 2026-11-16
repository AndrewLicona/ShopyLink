'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Minus, Plus } from 'lucide-react';
import type { Product } from '@/types/types';

interface VariantSelectorProps {
    product: Product;
    selectedVariantId: string | null;
    onSelectVariant: (id: string | null) => void;
    quantity: number;
    onQuantityChange: (qty: number) => void;
    onShowMessage: (msg: string) => void;
    inCart?: number;
}

export function VariantSelector({
    product,
    selectedVariantId,
    onSelectVariant,
    quantity,
    onQuantityChange,
    onShowMessage,
    inCart = 0,
}: VariantSelectorProps) {
    const activeVariant = product.variants?.find(v => v.id === selectedVariantId);

    const getAvailableStock = () => {
        if (!product.trackInventory) return Infinity;
        if (activeVariant && activeVariant.trackInventory === false) return Infinity;
        return (activeVariant && !activeVariant.useParentStock)
            ? activeVariant.stock
            : (product.inventory?.stock ?? 0);
    };

    const availableStock = getAvailableStock();

    return (
        <div className="space-y-4">
            {/* Variants */}
            {product.variants && product.variants.length > 0 && (
                <div className="space-y-3">
                    <div className="flex items-center gap-2">
                        <div className="w-1 h-4 bg-[var(--primary)] rounded-full"></div>
                        <h3 className="text-xs font-black uppercase tracking-widest text-[var(--text)]">Opciones</h3>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {(!product.trackInventory || (product.inventory?.stock ?? 0) > 0) && (
                            <button
                                onClick={() => onSelectVariant(null)}
                                aria-pressed={!selectedVariantId}
                                className={cn(
                                    "px-4 py-2 rounded-xl text-sm font-bold border-2 transition-all duration-200",
                                    !selectedVariantId
                                        ? "bg-[var(--primary)] border-[var(--primary)] text-[var(--primary-foreground)] shadow-lg shadow-[var(--primary)]/20 scale-105"
                                        : "bg-[var(--secondary)] border-transparent text-[var(--text)] hover:border-[var(--border)]"
                                )}
                            >
                                {product.baseVariantName || 'Principal'}
                            </button>
                        )}
                        {product.variants
                            .filter(v => {
                                if (product.trackInventory === false) return true;
                                if (v.trackInventory === false) return true;
                                if (v.useParentStock) return (product.inventory?.stock ?? 0) > 0;
                                return v.stock > 0;
                            })
                            .map((v) => (
                                <button
                                    key={v.id}
                                    onClick={() => onSelectVariant(v.id)}
                                    aria-pressed={selectedVariantId === v.id}
                                    className={cn(
                                        "px-4 py-2 rounded-xl text-sm font-bold border-2 transition-all duration-200",
                                        selectedVariantId === v.id
                                            ? "bg-[var(--primary)] border-[var(--primary)] text-[var(--primary-foreground)] shadow-lg shadow-[var(--primary)]/20 scale-105"
                                            : "bg-[var(--secondary)] border-transparent text-[var(--text)] hover:border-[var(--border)]"
                                    )}
                                >
                                    {v.name}
                                </button>
                            ))}
                    </div>
                </div>
            )}

            {/* Quantity Selector */}
            <div className="bg-[var(--secondary)]/40 p-3 sm:p-4 rounded-2xl flex flex-wrap gap-3 items-center justify-between border border-[var(--border)]">
                <div>
                    <p className="text-[10px] font-bold text-[var(--text)]/55 uppercase tracking-wider mb-1">
                        {product.trackInventory ? 'Disponibilidad' : 'Estado'}
                    </p>
                    <div className="flex items-center gap-2">
                        <div className={cn("w-2 h-2 rounded-full", availableStock > 0 ? "bg-green-500" : "bg-amber-500")}></div>
                        <p className="font-black text-sm text-[var(--text)]">
                            {availableStock === Infinity ? 'Disponible' : availableStock > 0 ? `${availableStock} disponibles` : 'Por encargo'}
                        </p>
                    </div>
                </div>

                <div className="bg-[var(--bg)] p-1 rounded-xl shadow-sm border border-[var(--border)] flex items-center gap-2">
                    <button
                        onClick={() => onQuantityChange(Math.max(1, quantity - 1))}
                        aria-label="Restar una unidad"
                        disabled={quantity <= 1}
                        className="w-9 h-9 flex items-center justify-center rounded-lg bg-[var(--secondary)] hover:bg-[var(--border)] text-[var(--text)] transition-all active:scale-90 disabled:opacity-40"
                    >
                        <Minus className="w-3 h-3" />
                    </button>
                    <span aria-label={`Cantidad: ${quantity}`} className="min-w-6 text-center font-black text-base text-[var(--text)]">{quantity}</span>
                    <button
                        onClick={() => {
                            if (quantity + inCart < availableStock) {
                                onQuantityChange(quantity + 1);
                            } else {
                                onShowMessage(inCart > 0 ? `Ya tienes ${inCart} en tu carrito. Hay ${availableStock} disponibles.` : `Hay ${availableStock} disponibles.`);
                            }
                        }}
                        aria-label="Sumar una unidad"
                        disabled={availableStock <= 0}
                        className="w-9 h-9 flex items-center justify-center rounded-lg bg-[var(--secondary)] hover:bg-[var(--border)] text-[var(--text)] transition-all active:scale-90 disabled:opacity-40"
                    >
                        <Plus className="w-3 h-3" />
                    </button>
                </div>
            </div>
        </div>
    );
}
