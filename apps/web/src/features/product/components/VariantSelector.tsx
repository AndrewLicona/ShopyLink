'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Minus, Plus } from 'lucide-react';
import type { Product, ProductVariant } from '@/types/types';

interface VariantSelectorProps {
    product: Product;
    selectedVariantId: string | null;
    onSelectVariant: (id: string | null) => void;
    quantity: number;
    onQuantityChange: (qty: number) => void;
    onShowMessage: (msg: string) => void;
}

export function VariantSelector({
    product,
    selectedVariantId,
    onSelectVariant,
    quantity,
    onQuantityChange,
    onShowMessage
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
        <div className="space-y-6">
            {/* Variants */}
            {product.variants && product.variants.length > 0 && (
                <div className="space-y-4">
                    <div className="flex items-center gap-2">
                        <div className="w-1 h-4 bg-[var(--primary)] rounded-full"></div>
                        <h3 className="text-xs font-black uppercase tracking-widest text-[var(--text)]">Opciones</h3>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {(!product.trackInventory || (product.inventory?.stock ?? 0) > 0) && (
                            <button
                                onClick={() => onSelectVariant(null)}
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
            <div className="bg-[var(--secondary)]/50 p-4 rounded-[2rem] flex items-center justify-between border border-[var(--border)]/50">
                <div className="pl-2">
                    <p className="text-[9px] font-black text-[var(--text)]/30 uppercase tracking-[0.2em] mb-1">
                        {product.trackInventory ? 'Disponibilidad' : 'Estado'}
                    </p>
                    <div className="flex items-center gap-2">
                        <div className={cn("w-2 h-2 rounded-full", product.trackInventory ? "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]" : "bg-blue-500")}></div>
                        <p className="font-black text-sm text-[var(--text)]">
                            {availableStock === Infinity ? "Disponible" : `${availableStock} unid.`}
                        </p>
                    </div>
                </div>

                <div className="bg-[var(--bg)] p-1.5 rounded-full shadow-sm border border-[var(--border)]/50 flex items-center gap-3">
                    <button
                        onClick={() => onQuantityChange(Math.max(1, quantity - 1))}
                        className="w-8 h-8 flex items-center justify-center rounded-full bg-[var(--secondary)] hover:bg-[var(--border)] text-[var(--text)] transition-all active:scale-90"
                    >
                        <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-4 text-center font-black text-lg text-[var(--text)]">{quantity}</span>
                    <button
                        onClick={() => {
                            if (quantity < availableStock) {
                                onQuantityChange(quantity + 1);
                            } else {
                                onShowMessage(`Máx ${availableStock}`);
                            }
                        }}
                        className="w-8 h-8 flex items-center justify-center rounded-full bg-[var(--secondary)] hover:bg-[var(--border)] text-[var(--text)] transition-all active:scale-90"
                    >
                        <Plus className="w-3 h-3" />
                    </button>
                </div>
            </div>
        </div>
    );
}
