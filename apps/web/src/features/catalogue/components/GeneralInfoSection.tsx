'use client';

import React from 'react';
import { DollarSign } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useProducts } from '@/hooks/useProducts';

interface GeneralInfoSectionProps {
    form: ReturnType<typeof useProducts>['state']['form'];
    actions: ReturnType<typeof useProducts>['actions'];
    categories: ReturnType<typeof useProducts>['state']['categories'];
}

export function GeneralInfoSection({ form, actions, categories }: GeneralInfoSectionProps) {
    return (
        <div className="space-y-6">
            <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-wider text-[var(--text)]/40 px-1">Nombre del Producto</label>
                <input
                    type="text" required value={form.name} onChange={(e) => actions.setName(e.target.value)}
                    className="w-full px-5 py-3.5 rounded-2xl border-2 border-[var(--border)] focus:border-[var(--primary)] focus:ring-4 focus:ring-[var(--primary)]/10 outline-none transition-all font-bold text-[var(--text)] bg-[var(--bg)]"
                    placeholder="Ej: Café Late Especial"
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <div className="flex items-center justify-between px-1">
                        <label className="text-[10px] font-black uppercase tracking-wider text-[var(--text)]/40">Precio</label>
                        <button
                            type="button"
                            onClick={() => actions.setHasPrice(!form.hasPrice)}
                            className={cn(
                                "relative w-8 h-4.5 rounded-full transition-all",
                                form.hasPrice ? "bg-[var(--primary)]" : "bg-[var(--border)]"
                            )}
                        >
                            <div className={cn("absolute top-0.75 left-0.75 w-3 h-3 bg-white rounded-full transition-all shadow-sm", form.hasPrice ? "translate-x-3.5" : "translate-x-0")} />
                        </button>
                    </div>
                    <div className="relative">
                        <span className={cn("absolute left-4 top-1/2 -translate-y-1/2 font-bold transition-colors", form.hasPrice ? "text-[var(--text)]/40" : "text-[var(--text)]/20")}>$</span>
                        <input
                            type="number"
                            value={form.price}
                            onChange={(e) => actions.setPrice(e.target.value)}
                            disabled={!form.hasPrice}
                            className={cn(
                                "w-full pl-8 pr-5 py-3.5 rounded-2xl border-2 outline-none transition-all font-bold bg-[var(--bg)]",
                                form.hasPrice
                                    ? "border-[var(--border)] focus:border-[var(--primary)] text-[var(--text)]"
                                    : "border-[var(--border)]/50 text-[var(--text)]/30 cursor-not-allowed opacity-50 shadow-inner"
                            )}
                            placeholder={form.hasPrice ? "0.00" : "Consultar"}
                        />
                    </div>
                </div>
                <div className="space-y-2">
                    <div className="flex items-center justify-between px-1">
                        <label className="text-[10px] font-black uppercase tracking-wider text-[var(--text)]/40">Stock Global</label>
                        <button
                            type="button"
                            onClick={() => actions.setTrackInventory(!form.trackInventory)}
                            className={cn(
                                "relative w-8 h-4.5 rounded-full transition-all",
                                form.trackInventory ? "bg-[var(--primary)]" : "bg-[var(--border)]"
                            )}
                        >
                            <div className={cn("absolute top-0.75 left-0.75 w-3 h-3 bg-white rounded-full transition-all shadow-sm", form.trackInventory ? "translate-x-3.5" : "translate-x-0")} />
                        </button>
                    </div>
                    <input
                        type="number" value={form.stock} onChange={(e) => actions.setStock(e.target.value)}
                        disabled={!form.trackInventory}
                        className={cn(
                            "w-full px-5 py-3.5 rounded-2xl border-2 outline-none transition-all font-bold bg-[var(--bg)]",
                            form.trackInventory
                                ? "border-[var(--border)] focus:border-[var(--primary)] text-[var(--text)]"
                                : "border-[var(--border)]/50 text-[var(--text)]/30 cursor-not-allowed opacity-50 shadow-inner"
                        )}
                        placeholder={form.trackInventory ? "99" : "∞"}
                    />
                </div>
            </div>

            <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-wider text-green-500 px-1 flex items-center gap-1.5">
                    <DollarSign className="w-3.5 h-3.5" /> Precio Oferta (Opcional)
                </label>
                <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-green-500/40 font-bold">$</span>
                    <input
                        type="number"
                        value={form.discountPrice}
                        onChange={(e) => actions.setDiscountPrice(e.target.value)}
                        disabled={!form.hasPrice}
                        className={cn(
                            "w-full pl-8 pr-5 py-3.5 rounded-2xl border-2 outline-none transition-all font-bold bg-green-500/5 text-green-500",
                            form.hasPrice
                                ? "border-green-500/20 focus:border-green-500"
                                : "border-[var(--border)]/50 text-[var(--text)]/30 cursor-not-allowed opacity-50"
                        )}
                        placeholder="Precio rebajado..."
                    />
                </div>
            </div>

            <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-wider text-[var(--text)]/40 px-1">Descripción</label>
                <textarea
                    value={form.description} onChange={(e) => actions.setDescription(e.target.value)}
                    className="w-full px-5 py-3.5 rounded-2xl border-2 border-[var(--border)] focus:border-[var(--primary)] outline-none transition-all font-bold text-[var(--text)] bg-[var(--bg)] h-32 resize-none"
                    placeholder="Describe las características principales..."
                />
            </div>

            <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-wider text-[var(--text)]/40 px-1">Categoría</label>
                <select
                    value={form.categoryId} onChange={(e) => actions.setCategoryId(e.target.value)}
                    className="w-full px-5 py-3.5 rounded-2xl border-2 border-[var(--border)] focus:border-[var(--primary)] outline-none font-bold text-[var(--text)] bg-[var(--bg)] appearance-none cursor-pointer"
                >
                    <option value="">Sin categoría</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
            </div>
        </div>
    );
}
