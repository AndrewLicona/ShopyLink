'use client';

import { X, Plus, DollarSign, LayoutGrid, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { useProducts } from '@/hooks/useProducts';
import { cn } from '@/lib/utils';

interface ProductFormModalProps {
    hook: ReturnType<typeof useProducts>;
}

export function ProductFormModal({ hook }: ProductFormModalProps) {
    const { state, actions } = hook;
    const { form } = state;

    if (!state.isModalOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center sm:p-4 bg-black/40 backdrop-blur-sm">
            <div className="bg-[var(--surface)] w-full h-full sm:h-[90vh] sm:w-[95vw] max-w-7xl sm:rounded-[2.5rem] shadow-[var(--shadow-strong)] overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col">
                <div className="p-8 border-b border-[var(--border)] flex items-center justify-between">
                    <h2 className="text-2xl font-black text-[var(--text)]">{state.editingProduct ? 'Editar' : 'Nuevo'} Producto</h2>
                    <button onClick={() => actions.setIsModalOpen(false)} className="p-2 hover:bg-[var(--secondary)] rounded-xl transition-colors">
                        <X className="w-6 h-6 text-[var(--text)]/40" />
                    </button>
                </div>

                <form onSubmit={actions.handleSaveProduct} className="p-4 sm:p-8 space-y-6 flex-1 overflow-y-auto custom-scrollbar">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Left Side: General Info */}
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase tracking-wider text-[var(--text)]/40 px-1">Nombre</label>
                                <input
                                    type="text" required value={form.name} onChange={(e) => actions.setName(e.target.value)}
                                    className="w-full px-5 py-3 rounded-2xl border-2 border-[var(--border)] focus:border-[var(--primary)] focus:ring-4 focus:ring-[var(--primary)]/10 outline-none transition-all font-bold text-[var(--text)] bg-[var(--bg)]"
                                    placeholder="Ej: Café Late"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between px-1">
                                        <label className="text-xs font-black uppercase tracking-wider text-[var(--text)]/40">Precio</label>
                                        <button
                                            type="button"
                                            onClick={() => actions.setHasPrice(!form.hasPrice)}
                                            className={cn(
                                                "relative w-8 h-5 rounded-full transition-all",
                                                form.hasPrice ? "bg-[var(--primary)]" : "bg-[var(--border)]"
                                            )}
                                        >
                                            <div className={cn("absolute top-1 left-1 w-3 h-3 bg-white rounded-full transition-all shadow-sm", form.hasPrice ? "translate-x-3" : "translate-x-0")} />
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
                                                "w-full pl-8 pr-5 py-3 rounded-2xl border-2 outline-none transition-all font-bold bg-[var(--bg)]",
                                                form.hasPrice
                                                    ? "border-[var(--border)] focus:border-[var(--primary)] text-[var(--text)]"
                                                    : "border-[var(--border)]/50 text-[var(--text)]/30 cursor-not-allowed opacity-50"
                                            )}
                                            placeholder={form.hasPrice ? "0" : "Consultar"}
                                        />
                                    </div>
                                    {!form.hasPrice && <p className="text-[10px] text-[var(--text)]/40 px-1">Se mostrará &quot;Consultar Precio&quot;</p>}
                                </div>
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between px-1">
                                        <label className="text-xs font-black uppercase tracking-wider text-[var(--text)]/40">Stock Global</label>
                                        <button
                                            type="button"
                                            onClick={() => actions.setTrackInventory(!form.trackInventory)}
                                            className={cn(
                                                "relative w-8 h-5 rounded-full transition-all",
                                                form.trackInventory ? "bg-[var(--primary)]" : "bg-[var(--border)]"
                                            )}
                                        >
                                            <div className={cn("absolute top-1 left-1 w-3 h-3 bg-white rounded-full transition-all shadow-sm", form.trackInventory ? "translate-x-3" : "translate-x-0")} />
                                        </button>
                                    </div>
                                    <input
                                        type="number" value={form.stock} onChange={(e) => actions.setStock(e.target.value)}
                                        disabled={!form.trackInventory}
                                        className={cn(
                                            "w-full px-5 py-3 rounded-2xl border-2 outline-none transition-all font-bold bg-[var(--bg)]",
                                            form.trackInventory
                                                ? "border-[var(--border)] focus:border-[var(--primary)] text-[var(--text)]"
                                                : "border-[var(--border)]/50 text-[var(--text)]/30 cursor-not-allowed opacity-50"
                                        )}
                                        placeholder={form.trackInventory ? "99" : "Infinito"}
                                    />
                                    {!form.trackInventory && <p className="text-[10px] text-[var(--text)]/40 px-1">Stock ilimitado (siempre disponible)</p>}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase tracking-wider text-green-500 px-1 flex items-center gap-1">
                                    <DollarSign className="w-3 h-3" /> Precio Oferta
                                </label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-green-500/40 font-bold">$</span>
                                    <input
                                        type="number"
                                        value={form.discountPrice}
                                        onChange={(e) => actions.setDiscountPrice(e.target.value)}
                                        disabled={!form.hasPrice}
                                        className={cn(
                                            "w-full pl-8 pr-5 py-3 rounded-2xl border-2 outline-none transition-all font-bold bg-green-500/5 text-green-500",
                                            form.hasPrice
                                                ? "border-green-500/20 focus:border-green-500"
                                                : "border-[var(--border)]/50 text-[var(--text)]/30 cursor-not-allowed opacity-50"
                                        )}
                                        placeholder="0 (Opcional)"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase tracking-wider text-[var(--text)]/40 px-1">Descripción</label>
                                <textarea
                                    value={form.description} onChange={(e) => actions.setDescription(e.target.value)}
                                    className="w-full px-5 py-3 rounded-2xl border-2 border-[var(--border)] focus:border-[var(--primary)] outline-none transition-all font-bold text-[var(--text)] bg-[var(--bg)] h-32 resize-none"
                                    placeholder="Describe tu producto..."
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase tracking-wider text-[var(--text)]/40 px-1">Categoría</label>
                                <select
                                    value={form.categoryId} onChange={(e) => actions.setCategoryId(e.target.value)}
                                    className="w-full px-5 py-3 rounded-2xl border-2 border-[var(--border)] focus:border-[var(--primary)] outline-none font-bold text-[var(--text)] bg-[var(--bg)]"
                                >
                                    <option value="">Seleccionar categoría</option>
                                    {state.categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                            </div>
                        </div>

                        {/* Right Side: Media & Variants */}
                        <div className="space-y-6">
                            <div className="space-y-4">
                                <label className="text-xs font-black uppercase tracking-wider text-[var(--text)]/40 px-1">Imágenes del Producto (Max 5)</label>
                                <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                                    {form.imageUrls.map((url, i) => (
                                        <div key={i} className="aspect-square relative rounded-xl overflow-hidden group border-2 border-[var(--border)]">
                                            <Image src={url} alt="Prod" fill className="object-cover" />
                                            <button
                                                type="button" onClick={() => actions.removeImage(i)}
                                                className="absolute inset-0 bg-red-500/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <X className="w-5 h-5" />
                                            </button>
                                        </div>
                                    ))}
                                    {form.imageUrls.length < 5 && (
                                        <label className="aspect-square flex flex-col items-center justify-center gap-2 border-2 border-dashed border-[var(--border)] rounded-xl hover:border-[var(--primary)] transition-all cursor-pointer bg-[var(--bg)] group">
                                            <input type="file" multiple accept="image/*" onChange={actions.handleProductImageUpload} className="hidden" />
                                            <div className="p-2 bg-[var(--secondary)] rounded-lg group-hover:bg-[var(--primary)]/10 transition-colors">
                                                <Plus className="w-5 h-5 text-[var(--text)]/40 group-hover:text-[var(--primary)]" />
                                            </div>
                                            <span className="text-[8px] font-black uppercase text-[var(--text)]/20">Añadir</span>
                                        </label>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-4 pt-4 border-t border-[var(--border)]">
                                <div className="flex items-center justify-between bg-[var(--secondary)]/30 p-4 rounded-2xl">
                                    <div className="flex items-center gap-3">
                                        <LayoutGrid className="w-5 h-5 text-[var(--primary)]" />
                                        <div>
                                            <p className="font-bold text-sm text-[var(--text)]">Variantes de Producto</p>
                                            <p className="text-[10px] text-[var(--text)]/40">Tallas, colores, etc.</p>
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => actions.setHasVariants(!form.hasVariants)}
                                        className={cn(
                                            "w-12 h-7 rounded-full transition-all relative",
                                            form.hasVariants ? "bg-[var(--primary)]" : "bg-[var(--border)]"
                                        )}
                                    >
                                        <div className={cn("absolute top-1 left-1 w-5 h-5 bg-white rounded-full transition-all", form.hasVariants ? "translate-x-5" : "translate-x-0")} />
                                    </button>
                                </div>

                                {form.hasVariants && (
                                    <div className="space-y-4 bg-[var(--secondary)]/10 p-4 rounded-2xl">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-wider text-[var(--text)]/40 px-1">Nombre de variante principal</label>
                                            <input
                                                type="text"
                                                value={form.baseVariantName}
                                                onChange={(e) => actions.setBaseVariantName(e.target.value)}
                                                className="w-full px-5 py-3 rounded-2xl border-2 border-[var(--border)] focus:border-[var(--primary)] outline-none transition-all font-bold text-[var(--text)] bg-[var(--bg)]"
                                                placeholder="Ej: 500 gramos"
                                            />
                                            <p className="text-[10px] text-[var(--text)]/40 px-1">Es el nombre que tendrá la opción base del producto.</p>
                                        </div>

                                        <div className="space-y-3 max-h-[300px] overflow-y-auto custom-scrollbar pt-2 border-t border-[var(--border)]/50">
                                            <div className="flex justify-between items-center px-1">
                                                <span className="text-[10px] font-black uppercase tracking-widest text-[var(--text)]/40">Variantes ({form.variants.length})</span>
                                                <button
                                                    type="button"
                                                    onClick={() => actions.setVariants([...form.variants, { name: '', price: null, stock: 0, useParentPrice: true, useParentStock: true, trackInventory: true, images: [] }])}
                                                    className="text-[10px] font-black text-[var(--primary)] hover:underline"
                                                >
                                                    + Añadir
                                                </button>
                                            </div>
                                            {form.variants.map((v, idx) => (
                                                <div key={idx} className="bg-[var(--surface)] p-4 rounded-xl border-2 border-[var(--border)] shadow-sm space-y-4">
                                                    <div className="flex gap-2 items-start">
                                                        <div className="flex-1">
                                                            <label className="text-[10px] font-black uppercase tracking-wider text-[var(--text)]/40 px-1">Nombre Variante</label>
                                                            <input
                                                                placeholder="Ej: Rojo / XL"
                                                                value={v.name}
                                                                onChange={(e) => {
                                                                    const next = [...form.variants];
                                                                    next[idx] = { ...next[idx], name: e.target.value };
                                                                    actions.setVariants(next);
                                                                }}
                                                                className="w-full px-3 py-2 rounded-lg border-2 border-[var(--border)] focus:border-[var(--primary)] text-sm font-bold bg-[var(--bg)] outline-none"
                                                            />
                                                        </div>
                                                        <button
                                                            type="button"
                                                            onClick={() => actions.setVariants(form.variants.filter((_, i) => i !== idx))}
                                                            className="mt-6 p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-100"
                                                        >
                                                            <X className="w-5 h-5" />
                                                        </button>
                                                    </div>

                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                        <div className="space-y-2">
                                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-1">
                                                                <label className="text-[10px] font-black uppercase tracking-wider text-[var(--text)]/40">Precio</label>
                                                                <div className="grid grid-cols-3 sm:flex gap-1 bg-[var(--secondary)] rounded-lg p-1 w-full sm:w-auto">
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => {
                                                                            const next = [...form.variants];
                                                                            next[idx] = { ...next[idx], useParentPrice: true };
                                                                            actions.setVariants(next);
                                                                        }}
                                                                        className={cn(
                                                                            "px-2 py-1.5 sm:py-0.5 text-[10px] font-bold rounded-md transition-all flex items-center justify-center",
                                                                            v.useParentPrice ? "bg-white shadow-sm text-[var(--text)]" : "text-[var(--text)]/40 hover:text-[var(--text)]/60"
                                                                        )}
                                                                    >
                                                                        GLOBAL
                                                                    </button>
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => {
                                                                            const next = [...form.variants];
                                                                            next[idx] = { ...next[idx], useParentPrice: false, price: v.price ?? 0 };
                                                                            actions.setVariants(next);
                                                                        }}
                                                                        className={cn(
                                                                            "px-2 py-1.5 sm:py-0.5 text-[10px] font-bold rounded-md transition-all flex items-center justify-center",
                                                                            !v.useParentPrice && v.price !== null ? "bg-white shadow-sm text-[var(--text)]" : "text-[var(--text)]/40 hover:text-[var(--text)]/60"
                                                                        )}
                                                                    >
                                                                        PROPIO
                                                                    </button>
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => {
                                                                            const next = [...form.variants];
                                                                            next[idx] = { ...next[idx], useParentPrice: false, price: null };
                                                                            actions.setVariants(next);
                                                                        }}
                                                                        className={cn(
                                                                            "px-2 py-1.5 sm:py-0.5 text-[10px] font-bold rounded-md transition-all flex items-center justify-center",
                                                                            !v.useParentPrice && v.price === null ? "bg-[var(--primary)] text-white shadow-sm" : "text-[var(--text)]/40 hover:text-[var(--text)]/60"
                                                                        )}
                                                                    >
                                                                        CONSULTAR
                                                                    </button>
                                                                </div>
                                                            </div>

                                                            {(!v.useParentPrice && v.price === null) ? (
                                                                <div className="w-full px-3 py-2 rounded-lg border-2 border-[var(--primary)]/20 bg-[var(--primary)]/5 text-[var(--primary)] text-xs font-bold flex items-center gap-2">
                                                                    <span>💬 Consultar precio</span>
                                                                </div>
                                                            ) : (
                                                                <input
                                                                    type="number"
                                                                    placeholder={v.useParentPrice ? "Heredado del producto" : "0.00"}
                                                                    disabled={v.useParentPrice}
                                                                    value={v.useParentPrice ? '' : (v.price ?? '')}
                                                                    onChange={(e) => {
                                                                        const next = [...form.variants];
                                                                        next[idx] = { ...next[idx], price: parseFloat(e.target.value) };
                                                                        actions.setVariants(next);
                                                                    }}
                                                                    className={cn(
                                                                        "w-full px-3 py-2 rounded-lg border-2 outline-none text-sm font-bold bg-[var(--bg)] transition-all",
                                                                        v.useParentPrice
                                                                            ? "border-[var(--border)]/50 opacity-50 cursor-not-allowed"
                                                                            : "border-[var(--border)] focus:border-[var(--primary)]"
                                                                    )}
                                                                />
                                                            )}
                                                        </div>

                                                        <div className="space-y-2">
                                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-1">
                                                                <label className="text-[10px] font-black uppercase tracking-wider text-[var(--text)]/40">Stock</label>
                                                                <div className="grid grid-cols-3 sm:flex gap-1 bg-[var(--secondary)] rounded-lg p-1 w-full sm:w-auto">
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => {
                                                                            const next = [...form.variants];
                                                                            next[idx] = { ...next[idx], useParentStock: true, trackInventory: true };
                                                                            actions.setVariants(next);
                                                                        }}
                                                                        className={cn(
                                                                            "px-2 py-1.5 sm:py-0.5 text-[10px] font-bold rounded-md transition-all flex items-center justify-center",
                                                                            v.useParentStock ? "bg-white shadow-sm text-[var(--text)]" : "text-[var(--text)]/40 hover:text-[var(--text)]/60"
                                                                        )}
                                                                    >
                                                                        GLOBAL
                                                                    </button>
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => {
                                                                            const next = [...form.variants];
                                                                            next[idx] = { ...next[idx], useParentStock: false, trackInventory: true };
                                                                            actions.setVariants(next);
                                                                        }}
                                                                        className={cn(
                                                                            "px-2 py-1.5 sm:py-0.5 text-[10px] font-bold rounded-md transition-all flex items-center justify-center",
                                                                            (!v.useParentStock && v.trackInventory) ? "bg-[var(--primary)] text-white shadow-sm" : "text-[var(--text)]/40 hover:text-[var(--text)]/60"
                                                                        )}
                                                                    >
                                                                        PROPIO
                                                                    </button>
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => {
                                                                            const next = [...form.variants];
                                                                            next[idx] = { ...next[idx], useParentStock: false, trackInventory: false };
                                                                            actions.setVariants(next);
                                                                        }}
                                                                        className={cn(
                                                                            "px-2 py-1.5 sm:py-0.5 text-[10px] font-bold rounded-md transition-all flex items-center justify-center",
                                                                            !v.trackInventory ? "bg-red-500 text-white shadow-sm" : "text-[var(--text)]/40 hover:text-[var(--text)]/60"
                                                                        )}
                                                                    >
                                                                        OFF
                                                                    </button>
                                                                </div>
                                                            </div>
                                                            <input
                                                                type="number"
                                                                placeholder={!v.trackInventory ? "Sin límite (Stock apagado)" : (v.useParentStock ? "Heredado del producto" : "0")}
                                                                disabled={v.useParentStock || !v.trackInventory}
                                                                value={(!v.trackInventory || v.useParentStock) ? '' : (v.stock ?? '')}
                                                                onChange={(e) => {
                                                                    const next = [...form.variants];
                                                                    next[idx] = { ...next[idx], stock: parseInt(e.target.value) };
                                                                    actions.setVariants(next);
                                                                }}
                                                                className={cn(
                                                                    "w-full px-3 py-2 rounded-lg border-2 outline-none text-sm font-bold bg-[var(--bg)] transition-all",
                                                                    (v.useParentStock || !v.trackInventory)
                                                                        ? "border-[var(--border)]/50 opacity-50 cursor-not-allowed"
                                                                        : "border-[var(--border)] focus:border-[var(--primary)]"
                                                                )}
                                                            />
                                                        </div>
                                                    </div>

                                                    {/* Variant Images */}
                                                    <div className="pt-2 border-t border-[var(--border)]/50">
                                                        <label className="text-[10px] font-black uppercase tracking-wider text-[var(--text)]/40 px-1 mb-2 block">Imágenes (Max 2)</label>
                                                        <div className="flex gap-2">
                                                            {(v.images || []).map((url, imgIdx) => (
                                                                <div key={imgIdx} className="w-16 h-16 relative rounded-lg overflow-hidden border border-[var(--border)] group">
                                                                    <Image src={url} alt="Var" fill className="object-cover" />
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => actions.removeVariantImage(idx, imgIdx)}
                                                                        className="absolute inset-0 bg-red-500/80 text-white opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all"
                                                                    >
                                                                        <X className="w-4 h-4" />
                                                                    </button>
                                                                </div>
                                                            ))}
                                                            {(!v.images || v.images.length < 2) && (
                                                                <label className="w-16 h-16 rounded-lg border-2 border-dashed border-[var(--border)] hover:border-[var(--primary)] flex items-center justify-center cursor-pointer transition-colors bg-[var(--bg)]">
                                                                    <input
                                                                        type="file"
                                                                        accept="image/*"
                                                                        multiple
                                                                        className="hidden"
                                                                        onChange={(e) => actions.handleVariantImageUpload(e, idx)}
                                                                    />
                                                                    <Plus className="w-5 h-5 text-[var(--text)]/20" />
                                                                </label>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-6 border-t border-[var(--border)]">
                        <button
                            type="button" onClick={() => actions.setIsModalOpen(false)}
                            className="px-8 py-4 rounded-2xl font-black text-[var(--text)]/40 hover:bg-[var(--secondary)] transition-all"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit" disabled={state.creating}
                            className="px-10 py-4 bg-[var(--primary)] text-white rounded-2xl font-black hover:opacity-90 transition-all flex items-center gap-2 shadow-xl"
                        >
                            {state.creating ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
                            {state.editingProduct ? 'Guardar Cambios' : 'Crear Producto'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
