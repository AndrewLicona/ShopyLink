'use client';

import Image from 'next/image';
import { Package, Edit2, Trash2, Loader2, Image as ImageIcon } from 'lucide-react';
import { formatCurrency, cn } from '@/lib/utils';
import { useProducts } from '@/hooks/useProducts';

interface ProductGridProps {
    hook: ReturnType<typeof useProducts>;
}

export function ProductGrid({ hook }: ProductGridProps) {
    const { state, actions } = hook;

    if (state.products.length === 0) {
        return (
            <div className="bg-[var(--surface)] rounded-[2.5rem] p-16 text-center border border-[var(--border)] border-dashed">
                <div className="w-20 h-20 bg-[var(--secondary)] rounded-full flex items-center justify-center mx-auto mb-6">
                    <Package className="w-10 h-10 text-[var(--text)]/20" />
                </div>
                <h3 className="text-xl font-bold text-[var(--text)]">Sin resultados</h3>
                <p className="text-[var(--text)]/40 mt-2">Intenta cambiar la búsqueda o categoría.</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
            {state.products.map((product) => (
                <div key={product.id} className="bg-[var(--surface)] rounded-xl p-3 border border-[var(--border)] shadow-[var(--shadow)] hover:shadow-[var(--shadow-strong)] transition-all flex flex-col group relative">
                    <div className="aspect-square bg-[var(--bg)] rounded-lg flex items-center justify-center relative overflow-hidden">
                        {product.images?.[0] ? (
                            <Image
                                src={product.images[0]}
                                alt={product.name}
                                fill
                                className="object-cover transition-transform group-hover:scale-105"
                                sizes="(max-width: 768px) 50vw, 25vw"
                            />
                        ) : (
                            <ImageIcon className="w-8 h-8 text-[var(--text)]/10" />
                        )}

                        {product.discountPrice && product.discountPrice > 0 && (
                            <div className="absolute top-2 left-2 z-10 bg-red-500 text-white px-2 py-1 rounded-xl text-[8px] font-black uppercase tracking-widest shadow-xl animate-pulse">
                                Oferta
                            </div>
                        )}

                        <div className="absolute top-2 right-2 flex flex-col gap-1 md:opacity-0 group-hover:opacity-100 transition-opacity z-20">
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    actions.openEditModal(product);
                                }}
                                className="p-2.5 bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border border-[var(--border)] text-[var(--text)] active:scale-90 transition-all"
                            >
                                <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    actions.setConfirmModal({
                                        show: true,
                                        type: 'product',
                                        id: product.id,
                                        name: product.name,
                                        isPaused: !product.isActive
                                    });
                                }}
                                className="p-2.5 bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border border-[var(--border)] text-red-500 active:scale-90 transition-all"
                            >
                                {state.deletingId === product.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                            </button>
                        </div>

                        <div className="absolute bottom-2 left-2 flex flex-col gap-1">
                            {product.sku && (
                                <span className="bg-black/90 backdrop-blur-sm text-white px-2 py-0.5 rounded-lg text-[7px] font-black uppercase tracking-widest border border-white/10">
                                    #{product.sku}
                                </span>
                            )}
                            {product.categoryId && (
                                <span className="bg-[var(--primary)]/90 backdrop-blur-sm text-[var(--bg)] px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-tighter">
                                    {state.categories.find(c => c.id === product.categoryId)?.name}
                                </span>
                            )}
                            <span className={cn(
                                "px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-tighter self-start shadow-sm",
                                product.isActive ? "bg-green-500/90 text-white" : "bg-gray-500/90 text-white"
                            )}>
                                {product.isActive ? 'Activo' : 'Pausa'}
                            </span>
                        </div>
                    </div>

                    <div className="mt-3 flex-1 flex flex-col px-1 pb-1">
                        <div className="flex flex-col">
                            <h3 className="text-sm font-black text-[var(--text)] truncate">{product.name}</h3>
                            <div className="flex items-center gap-2 mt-1">
                                {product.discountPrice && product.discountPrice > 0 ? (
                                    <>
                                        <span className="text-base font-black text-red-500">
                                            {formatCurrency(product.discountPrice)}
                                        </span>
                                        <span className="text-xs font-bold text-[var(--text)]/30 line-through">
                                            {product.price != null ? formatCurrency(product.price) : ''}
                                        </span>
                                    </>
                                ) : (
                                    <span className="text-base font-black text-[var(--primary)]">
                                        {product.price != null ? formatCurrency(product.price) : 'Consultar'}
                                    </span>
                                )}
                            </div>
                        </div>

                        <div className="mt-3 flex items-center justify-between">
                            <span className={cn(
                                "text-[9px] font-black uppercase tracking-widest",
                                !product.trackInventory ? "text-blue-500" :
                                    (product.inventory?.stock ?? 0) === 0 ? "text-red-500" :
                                        (product.inventory?.stock ?? 0) <= 5 ? "text-orange-500" :
                                            "text-[var(--text)]/30"
                            )}>
                                {!product.trackInventory ? 'Bajo Pedido' :
                                    (product.inventory?.stock ?? 0) === 0 ? 'Sin Stock' :
                                        `Stock: ${product.inventory?.stock}`}
                            </span>
                            <button onClick={() => actions.handleToggleStatus(product)} className="w-4 h-4 rounded-full bg-[var(--secondary)] flex items-center justify-center hover:bg-[var(--primary)]/10 transition-colors">
                                <div className={cn("w-1.5 h-1.5 rounded-full", product.isActive ? "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]" : "bg-gray-400")} />
                            </button>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
