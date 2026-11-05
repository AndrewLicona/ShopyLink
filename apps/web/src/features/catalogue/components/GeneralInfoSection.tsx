'use client';

import React from 'react';
import { DollarSign, Package, Wrench } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useProducts } from '@/hooks/useProducts';
import { PriceInput } from '@/components/ui/PriceInput';

interface GeneralInfoSectionProps {
    form: ReturnType<typeof useProducts>['state']['form'];
    actions: ReturnType<typeof useProducts>['actions'];
    categories: ReturnType<typeof useProducts>['state']['categories'];
}

export function GeneralInfoSection({ form, actions, categories }: GeneralInfoSectionProps) {
    const isService = form.itemType === 'service';

    return (
        <div className="space-y-6">
            {/* Selector de Tipo: Producto vs Servicio */}
            <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-wider text-[var(--text)]/40 px-1">
                    Tipo de Publicación
                </label>
                <div className="grid grid-cols-2 gap-3 p-1.5 bg-[var(--surface)] border-2 border-[var(--border)] rounded-2xl">
                    <button
                        type="button"
                        onClick={() => actions.setItemType('product')}
                        className={cn(
                            "flex items-center justify-center gap-2 py-3 rounded-xl font-black text-xs transition-all",
                            !isService
                                ? "bg-[var(--primary)] text-[var(--bg)] shadow-md shadow-[var(--primary)]/20"
                                : "text-[var(--text)]/60 hover:text-[var(--text)]"
                        )}
                    >
                        <Package className="w-4 h-4" />
                        <span>Producto Físico</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => actions.setItemType('service')}
                        className={cn(
                            "flex items-center justify-center gap-2 py-3 rounded-xl font-black text-xs transition-all",
                            isService
                                ? "bg-[var(--primary)] text-[var(--bg)] shadow-md shadow-[var(--primary)]/20"
                                : "text-[var(--text)]/60 hover:text-[var(--text)]"
                        )}
                    >
                        <Wrench className="w-4 h-4" />
                        <span>Servicio / Oficio</span>
                    </button>
                </div>
            </div>

            {/* Modalidad de precio para servicios */}
            {isService && (
                <div className="space-y-2 animate-in fade-in slide-in-from-top-1">
                    <label className="text-[10px] font-black uppercase tracking-wider text-[var(--text)]/40 px-1">
                        Modalidad de Precio del Servicio
                    </label>
                    <select
                        value={form.pricingMode || 'fixed'}
                        onChange={(e) => actions.setPricingMode(e.target.value as any)}
                        className="w-full px-5 py-3.5 rounded-2xl border-2 border-[var(--border)] focus:border-[var(--primary)] outline-none font-bold text-[var(--text)] bg-[var(--bg)] appearance-none cursor-pointer"
                    >
                        <option value="fixed">Precio fijo (Ej: $50.000)</option>
                        <option value="from">Desde / A partir de (Ej: Desde $30.000)</option>
                        <option value="hourly">Tarifa por hora (Ej: $25.000 / hora)</option>
                        <option value="quote">A convenir / Por cotización (Sin precio fijo)</option>
                    </select>
                </div>
            )}

            <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-wider text-[var(--text)]/40 px-1">
                    {isService ? 'Nombre del Servicio' : 'Nombre del Producto'}
                </label>
                <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => actions.setName(e.target.value)}
                    className="w-full px-5 py-3.5 rounded-2xl border-2 border-[var(--border)] focus:border-[var(--primary)] focus:ring-4 focus:ring-[var(--primary)]/10 outline-none transition-all font-bold text-[var(--text)] bg-[var(--bg)]"
                    placeholder={isService ? "Ej: Reparación de Celulares / Manicura Express" : "Ej: Café Late Especial"}
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <div className="flex items-center justify-between px-1">
                        <label className="text-[10px] font-black uppercase tracking-wider text-[var(--text)]/40">
                            {isService && form.pricingMode === 'quote' ? 'Precio (A convenir)' : 'Precio'}
                        </label>
                        {(!isService || form.pricingMode !== 'quote') && (
                            <button
                                type="button"
                                onClick={() => actions.setHasPrice(!form.hasPrice)}
                                className={cn(
                                    "relative w-8 h-4.5 rounded-full transition-all border border-black/5 shadow-inner",
                                    form.hasPrice ? "bg-[var(--primary)]" : "bg-[var(--border)]"
                                )}
                            >
                                <div className={cn("absolute top-0.75 left-0.75 w-3 h-3 bg-white rounded-full transition-all shadow-md", form.hasPrice ? "translate-x-3.5" : "translate-x-0")} />
                            </button>
                        )}
                    </div>
                    <div className="relative">
                        <PriceInput
                            value={form.price}
                            onChange={(val) => actions.setPrice(val)}
                            disabled={!form.hasPrice || (isService && form.pricingMode === 'quote')}
                            icon="$"
                            className={cn(
                                "bg-[var(--bg)]",
                                form.hasPrice && (!isService || form.pricingMode !== 'quote')
                                    ? "border-[var(--border)] focus:border-[var(--primary)] text-[var(--text)]"
                                    : "border-[var(--border)]/50 text-[var(--text)]/30 cursor-not-allowed opacity-50 shadow-inner"
                            )}
                            placeholder={isService && form.pricingMode === 'quote' ? "A convenir" : form.hasPrice ? "0.00" : "Consultar"}
                        />
                    </div>
                </div>

                {!isService ? (
                    <div className="space-y-2">
                        <div className="flex items-center justify-between px-1">
                            <label className="text-[10px] font-black uppercase tracking-wider text-[var(--text)]/40">Stock Global</label>
                            <button
                                type="button"
                                onClick={() => actions.setTrackInventory(!form.trackInventory)}
                                className={cn(
                                    "relative w-8 h-4.5 rounded-full transition-all border border-black/5 shadow-inner",
                                    form.trackInventory ? "bg-[var(--primary)]" : "bg-[var(--border)]"
                                )}
                            >
                                <div className={cn("absolute top-0.75 left-0.75 w-3 h-3 bg-white rounded-full transition-all shadow-md", form.trackInventory ? "translate-x-3.5" : "translate-x-0")} />
                            </button>
                        </div>
                        <input
                            type="number"
                            value={form.stock}
                            onChange={(e) => actions.setStock(e.target.value)}
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
                ) : (
                    <div className="space-y-2 flex flex-col justify-end">
                        <div className="p-3 bg-[var(--surface)] border border-[var(--border)] rounded-2xl text-[11px] text-[var(--text)]/50 font-bold">
                            Los servicios no controlan inventario físico; se coordinan directo por WhatsApp.
                        </div>
                    </div>
                )}
            </div>

            {!isService && (
                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-wider text-green-500 px-1 flex items-center gap-1.5">
                        <DollarSign className="w-3.5 h-3.5" /> Precio Oferta (Opcional)
                    </label>
                    <div className="relative">
                        <PriceInput
                            value={form.discountPrice}
                            onChange={(val) => actions.setDiscountPrice(val)}
                            disabled={!form.hasPrice}
                            icon="$"
                            className={cn(
                                "bg-green-500/5 text-green-500",
                                form.hasPrice
                                    ? "border-green-500/20 focus:border-green-500"
                                    : "border-[var(--border)]/50 text-[var(--text)]/30 cursor-not-allowed opacity-50"
                            )}
                            placeholder="Precio rebajado..."
                        />
                    </div>
                </div>
            )}

            <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-wider text-[var(--text)]/40 px-1">Descripción</label>
                <textarea
                    value={form.description}
                    onChange={(e) => actions.setDescription(e.target.value)}
                    className="w-full px-5 py-3.5 rounded-2xl border-2 border-[var(--border)] focus:border-[var(--primary)] outline-none transition-all font-bold text-[var(--text)] bg-[var(--bg)] h-32 resize-none"
                    placeholder={isService ? "Describe qué incluye el servicio, horarios de atención o cobertura..." : "Describe las características principales..."}
                />
            </div>

            <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-wider text-[var(--text)]/40 px-1">Categoría</label>
                <select
                    value={form.categoryId}
                    onChange={(e) => actions.setCategoryId(e.target.value)}
                    className="w-full px-5 py-3.5 rounded-2xl border-2 border-[var(--border)] focus:border-[var(--primary)] outline-none font-bold text-[var(--text)] bg-[var(--bg)] appearance-none cursor-pointer"
                >
                    <option value="">Sin categoría</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
            </div>
        </div>
    );
}
