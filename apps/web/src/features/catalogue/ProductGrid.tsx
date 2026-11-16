'use client';

import Image from 'next/image';
import { Package, Pencil, Trash2, Loader2, Image as ImageIcon, Pause, Play } from 'lucide-react';
import { formatCurrency, cn } from '@/lib/utils';
import { useProducts } from '@/hooks/useProducts';

interface ProductGridProps { hook: ReturnType<typeof useProducts> }

export function ProductGrid({ hook }: ProductGridProps) {
    const { state, actions } = hook;
    const country = state.activeStore?.country;

    if (state.products.length === 0) return (
        <div className="rounded-3xl border border-dashed border-[var(--border)] bg-[var(--surface)] px-5 py-16 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--secondary)]"><Package className="h-6 w-6 text-[var(--text)]/40" /></div>
            <h2 className="mt-4 text-lg font-black text-[var(--text)]">No hay productos en esta vista</h2>
            <p className="mx-auto mt-2 max-w-sm text-sm text-[var(--text)]/50">Prueba otra búsqueda o filtro, o añade un nuevo producto.</p>
            <button onClick={actions.openCreateModal} className="mt-5 rounded-xl bg-[var(--primary)] px-4 py-3 text-sm font-bold text-[var(--bg)]">Añadir producto</button>
        </div>
    );

    return (
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-4 md:gap-5">
            {state.products.map(product => {
                const category = state.categories.find(c => c.id === product.categoryId)?.name;
                const imageUrl = product.images?.find(Boolean) || product.variants?.flatMap(variant => variant.images || []).find(Boolean);
                return (
                    <article key={product.id} className="group flex min-w-0 flex-col rounded-xl border border-[var(--border)] bg-[var(--surface)] p-2.5 shadow-[var(--shadow)] transition-shadow hover:shadow-[var(--shadow-strong)] sm:p-3">
                        <div className="relative aspect-square overflow-hidden rounded-lg bg-[var(--bg)]">
                            {imageUrl ? <Image src={imageUrl} alt={product.name} fill className="object-contain" sizes="(max-width: 768px) 50vw, (max-width: 1280px) 33vw, 25vw" /> : <div className="flex h-full items-center justify-center"><ImageIcon className="h-8 w-8 text-[var(--text)]/20" /></div>}
                            {product.discountPrice != null && product.discountPrice > 0 && <span className="absolute left-2 top-2 rounded-lg bg-rose-500 px-2 py-1 text-[9px] font-black uppercase text-white shadow-sm">Oferta</span>}
                            <div className="absolute right-2 top-2 z-10 flex flex-col gap-1.5">
                                <button type="button" onClick={() => actions.openEditModal(product)} aria-label={`Editar ${product.name}`} className="flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--surface)]/95 text-[var(--text)]/70 shadow-md backdrop-blur-sm transition-colors hover:text-[var(--primary)]"><Pencil className="h-4 w-4" /></button>
                                <button type="button" onClick={() => actions.setConfirmModal({ show: true, type: 'product', id: product.id, name: product.name, isPaused: !product.isActive })} aria-label={`Eliminar ${product.name}`} disabled={state.deletingId === product.id} className="flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--surface)]/95 text-red-500 shadow-md backdrop-blur-sm hover:bg-red-50 disabled:opacity-50">{state.deletingId === product.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}</button>
                            </div>
                            <div className="absolute bottom-2 left-2 flex max-w-[calc(100%-1rem)] flex-col items-start gap-1">
                                {product.sku && <span className="max-w-full truncate rounded-md bg-black/85 px-2 py-1 text-[8px] font-black uppercase tracking-wide text-white">#{product.sku}</span>}
                                {category && <span className="max-w-full truncate rounded-md bg-[var(--primary)] px-2 py-1 text-[8px] font-black uppercase text-[var(--bg)]">{category}</span>}
                                <span className={cn('rounded-md px-2 py-1 text-[8px] font-black uppercase shadow-sm', product.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600')}>{product.isActive ? 'Activo' : 'Pausado'}</span>
                            </div>
                        </div>
                        <div className="flex flex-1 flex-col px-0.5 pt-3">
                            <h3 className="truncate text-sm font-black text-[var(--text)]" title={product.name}>{product.name}</h3>
                            <div className="mt-1 flex flex-wrap items-baseline gap-x-2"><span className={cn('break-words text-sm font-black sm:text-base', product.discountPrice != null && product.discountPrice > 0 ? 'text-red-500' : 'text-[var(--primary)]')}>{product.discountPrice != null && product.discountPrice > 0 ? formatCurrency(product.discountPrice, country) : product.price != null ? formatCurrency(product.price, country) : 'Consultar'}</span>{product.discountPrice != null && product.discountPrice > 0 && product.price != null && <span className="text-xs text-[var(--text)]/40 line-through">{formatCurrency(product.price, country)}</span>}</div>
                            <p className="mt-2 text-[10px] font-bold uppercase tracking-wide text-[var(--text)]/45">{product.variants?.length ? `${product.variants.length} ${product.variants.length === 1 ? 'variante' : 'variantes'}` : !product.trackInventory ? 'Sin control de stock' : `Stock: ${product.inventory?.stock ?? 0}`}</p>
                            <button type="button" onClick={() => actions.handleToggleStatus(product)} aria-label={`${product.isActive ? 'Pausar' : 'Activar'} ${product.name}`} className="mt-3 flex min-h-10 w-full items-center justify-center gap-1.5 rounded-xl bg-[var(--secondary)] px-2 text-xs font-bold text-[var(--text)]/70 transition-colors hover:bg-[var(--primary)]/10 hover:text-[var(--primary)]">{product.isActive ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}{product.isActive ? 'Pausar' : 'Activar'}</button>
                        </div>
                    </article>
                );
            })}
        </div>
    );
}
