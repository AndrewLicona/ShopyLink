'use client';

import React from 'react';
import { X, Plus, LayoutGrid, CheckCircle2, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { useProducts } from '@/hooks/useProducts';

interface VariantsSectionProps {
    form: ReturnType<typeof useProducts>['state']['form'];
    actions: ReturnType<typeof useProducts>['actions'];
}

export function VariantsSection({ form, actions }: VariantsSectionProps) {
    return (
        <div className="space-y-4 pt-6 border-t border-[var(--border)]">
            <div className="flex items-center justify-between bg-[var(--secondary)]/20 p-5 rounded-3xl border border-[var(--border)]/50">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-[var(--primary)]/10 rounded-2xl">
                        <LayoutGrid className="w-5 h-5 text-[var(--primary)]" />
                    </div>
                    <div>
                        <p className="font-black text-sm text-[var(--text)] leading-tight">Variantes</p>
                        <p className="text-[10px] text-[var(--text)]/40 font-medium mt-0.5 whitespace-nowrap">Tallas, colores, materiales...</p>
                    </div>
                </div>
                <button
                    type="button"
                    onClick={() => actions.setHasVariants(!form.hasVariants)}
                    className={cn(
                        "w-12 h-6.5 rounded-full transition-all relative border border-black/5 shadow-inner",
                        form.hasVariants ? "bg-[var(--primary)]" : "bg-[var(--border)]"
                    )}
                >
                    <div className={cn("absolute top-0.75 left-0.75 w-5 h-5 bg-white rounded-full transition-all shadow-md", form.hasVariants ? "translate-x-5.5" : "translate-x-0")} />
                </button>
            </div>

            {form.hasVariants && (
                <div className="space-y-6 animate-in slide-in-from-top-2 duration-300">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-wider text-[var(--text)]/40 px-1">Nombre Opción Base</label>
                        <input
                            type="text"
                            value={form.baseVariantName}
                            onChange={(e) => actions.setBaseVariantName(e.target.value)}
                            className="w-full px-5 py-3.5 rounded-2xl border-2 border-[var(--border)] focus:border-[var(--primary)] outline-none transition-all font-bold text-[var(--text)] bg-[var(--bg)]"
                            placeholder="Ej: Original / Regular"
                        />
                    </div>

                    <div className="space-y-4 pt-2">
                        <div className="flex justify-between items-center px-1">
                            <span className="text-[10px] font-black uppercase tracking-widest text-[var(--text)]/40">Otras Variantes ({form.variants.length})</span>
                            <button
                                type="button"
                                onClick={() => actions.setVariants([...form.variants, { name: '', price: null, stock: 0, useParentPrice: true, useParentStock: true, trackInventory: true, images: [] }])}
                                className="bg-[var(--primary)] text-white px-3 py-1.5 rounded-xl font-black text-[9px] uppercase tracking-widest shadow-lg shadow-[var(--primary)]/10 active:scale-95 transition-all"
                            >
                                + Añadir Opción
                            </button>
                        </div>

                        <div className="space-y-4 max-h-[400px] overflow-y-auto custom-scrollbar pr-2 -mr-2">
                            {form.variants.map((v, idx) => (
                                <div key={idx} className="bg-[var(--surface)] p-5 rounded-3xl border-2 border-[var(--border)] shadow-sm space-y-6 relative overflow-hidden group/var">
                                    <div className="flex gap-4 items-start">
                                        <div className="flex-1">
                                            <label className="text-[10px] font-black uppercase tracking-wider text-[var(--text)]/40 px-1">Nombre Variante</label>
                                            <input
                                                placeholder="Ej: Rojo / XL / 1kg"
                                                value={v.name}
                                                onChange={(e) => {
                                                    const next = [...form.variants];
                                                    next[idx] = { ...next[idx], name: e.target.value };
                                                    actions.setVariants(next);
                                                }}
                                                className="w-full px-4 py-2.5 rounded-xl border-2 border-[var(--border)] focus:border-[var(--primary)] text-sm font-bold bg-[var(--bg)] outline-none"
                                            />
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => actions.setVariants(form.variants.filter((_, i) => i !== idx))}
                                            className="mt-6 p-2.5 text-red-500 hover:bg-red-50 rounded-xl transition-all border border-transparent hover:border-red-100 active:scale-90"
                                        >
                                            <X className="w-5 h-5" />
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black uppercase tracking-wider text-[var(--text)]/40 px-1">Precio</label>
                                            <div className="flex bg-[var(--secondary)]/50 rounded-xl p-1 shadow-inner overflow-x-auto no-scrollbar">
                                                {(['GLOBAL', 'PROPIO', 'CONSULTAR'] as const).map((type) => {
                                                    const isActive = (type === 'GLOBAL' && v.useParentPrice) ||
                                                        (type === 'PROPIO' && !v.useParentPrice && v.price !== null) ||
                                                        (type === 'CONSULTAR' && !v.useParentPrice && v.price === null);
                                                    return (
                                                        <button
                                                            key={type}
                                                            type="button"
                                                            onClick={() => {
                                                                const next = [...form.variants];
                                                                const useParent = type === 'GLOBAL';
                                                                const price = type === 'PROPIO' ? (v.price ?? 0) : null;
                                                                next[idx] = { ...next[idx], useParentPrice: useParent, price };
                                                                actions.setVariants(next);
                                                            }}
                                                            className={cn(
                                                                "flex-1 min-w-[60px] px-2 py-1.5 text-[8px] font-black uppercase tracking-widest rounded-lg transition-all",
                                                                isActive
                                                                    ? "bg-white text-[var(--text)] shadow-sm"
                                                                    : "text-[var(--text)]/30 hover:text-[var(--text)]/50 font-bold"
                                                            )}
                                                        >
                                                            {type}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                            {!(v.useParentPrice || v.price === null) && (
                                                <div className="relative">
                                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text)]/20 font-bold text-xs">$</span>
                                                    <input
                                                        type="number"
                                                        value={v.price ?? ''}
                                                        onChange={(e) => {
                                                            const next = [...form.variants];
                                                            next[idx] = { ...next[idx], price: parseFloat(e.target.value) };
                                                            actions.setVariants(next);
                                                        }}
                                                        className="w-full pl-7 pr-3 py-2 rounded-lg border-2 border-[var(--border)] focus:border-[var(--primary)] text-xs font-bold bg-[var(--bg)] outline-none"
                                                    />
                                                </div>
                                            )}
                                            {!v.useParentPrice && v.price === null && (
                                                <div className="py-2 px-3 rounded-lg bg-[var(--primary)]/5 border border-[var(--primary)]/10 text-[var(--primary)] font-bold text-[10px] flex items-center gap-2">
                                                    <CheckCircle2 className="w-3 h-3" /> Consultar Precio
                                                </div>
                                            )}
                                        </div>

                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black uppercase tracking-wider text-[var(--text)]/40 px-1">Stock</label>
                                            <div className="flex bg-[var(--secondary)]/50 rounded-xl p-1 shadow-inner overflow-x-auto no-scrollbar">
                                                {(['GLOBAL', 'PROPIO', 'OFF'] as const).map((type) => {
                                                    const isActive = (type === 'GLOBAL' && v.useParentStock) ||
                                                        (type === 'PROPIO' && !v.useParentStock && v.trackInventory) ||
                                                        (type === 'OFF' && !v.trackInventory);
                                                    return (
                                                        <button
                                                            key={type}
                                                            type="button"
                                                            onClick={() => {
                                                                const next = [...form.variants];
                                                                const useParent = type === 'GLOBAL';
                                                                const track = type !== 'OFF';
                                                                next[idx] = { ...next[idx], useParentStock: useParent, trackInventory: track };
                                                                actions.setVariants(next);
                                                            }}
                                                            className={cn(
                                                                "flex-1 min-w-[60px] px-2 py-1.5 text-[8px] font-black uppercase tracking-widest rounded-lg transition-all",
                                                                isActive
                                                                    ? "bg-white text-[var(--text)] shadow-sm"
                                                                    : "text-[var(--text)]/30 hover:text-[var(--text)]/50 font-bold"
                                                            )}
                                                        >
                                                            {type}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                            {v.trackInventory && !v.useParentStock && (
                                                <input
                                                    type="number"
                                                    value={v.stock ?? ''}
                                                    onChange={(e) => {
                                                        const next = [...form.variants];
                                                        next[idx] = { ...next[idx], stock: parseInt(e.target.value) };
                                                        actions.setVariants(next);
                                                    }}
                                                    className="w-full px-3 py-2 rounded-lg border-2 border-[var(--border)] focus:border-[var(--primary)] text-xs font-bold bg-[var(--bg)] outline-none"
                                                    placeholder="Stock para esta variante"
                                                />
                                            )}
                                            {!v.trackInventory && (
                                                <div className="py-2 px-3 rounded-lg bg-[var(--secondary)] border border-[var(--border)] text-[var(--text)]/40 font-bold text-[10px] flex items-center gap-2">
                                                    <Loader2 className="w-3 h-3" /> Stock Ilimitado
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Variant Images */}
                                    <div className="pt-4 border-t border-[var(--border)]/50">
                                        <label className="text-[10px] font-black uppercase tracking-wider text-[var(--text)]/40 px-1 mb-2 block">Miniaturas (Max 2)</label>
                                        <div className="flex gap-2">
                                            {(v.images || []).map((url, imgIdx) => (
                                                <div key={url + imgIdx} className="w-14 h-14 relative rounded-xl overflow-hidden border border-[var(--border)] group/img shadow-sm">
                                                    <Image src={url} alt={`Var ${imgIdx}`} fill className="object-cover" />
                                                    <button
                                                        type="button"
                                                        onClick={() => actions.removeVariantImage(idx, imgIdx)}
                                                        className="absolute inset-0 bg-red-500/80 text-white opacity-0 group/img:hover:opacity-100 flex items-center justify-center transition-all"
                                                    >
                                                        <X className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            ))}
                                            {(!v.images || v.images.length < 2) && (
                                                <label className="w-14 h-14 rounded-xl border-2 border-dashed border-[var(--border)] hover:border-[var(--primary)] flex items-center justify-center cursor-pointer transition-all bg-[var(--bg)] group/add">
                                                    <input
                                                        type="file" accept="image/*" multiple className="hidden"
                                                        onChange={(e) => actions.handleVariantImageUpload(e, idx)}
                                                    />
                                                    <Plus className="w-4 h-4 text-[var(--text)]/20 group-hover/add:text-[var(--primary)]" />
                                                </label>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
