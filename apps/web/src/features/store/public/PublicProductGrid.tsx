'use client';

import Image from 'next/image';
import { ShoppingBag, Search, Plus } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import type { Product, Category } from '@/types/types';

interface PublicProductGridProps {
    products: Product[];
    categories: Category[];
    cart: { id: string, quantity: number }[];
    onProductClick: (product: Product) => void;
    onAddToCart: (product: Product) => void;
    searchTerm: string;
}

export function PublicProductGrid({
    products,
    categories,
    cart,
    onProductClick,
    onAddToCart,
    searchTerm
}: PublicProductGridProps) {
    if (products.length === 0) {
        return (
            <div className="col-span-full flex flex-col items-center justify-center py-20 text-center space-y-4">
                <div className="w-24 h-24 bg-[var(--secondary)] rounded-full flex items-center justify-center mb-4 text-[var(--text)]/20 animate-pulse">
                    <Search className="w-10 h-10" />
                </div>
                <h3 className="text-xl font-black text-[var(--text)]">No encontramos productos</h3>
                <p className="text-[var(--text)]/60 max-w-xs mx-auto">
                    {searchTerm
                        ? `No hay resultados para "${searchTerm}"`
                        : "Esta categoría aún no tiene productos disponibles."}
                </p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {products.map((product) => (
                <div
                    key={product.id}
                    onClick={() => onProductClick(product)}
                    className="bg-[var(--bg)] rounded-[2rem] p-3 border border-[var(--border)] hover:border-[var(--primary)]/50 hover:shadow-xl transition-all group flex flex-col relative cursor-pointer"
                >
                    <div className="aspect-square bg-[var(--secondary)] rounded-[1.5rem] flex items-center justify-center relative overflow-hidden">
                        {product.images?.[0] ? (
                            <Image
                                src={product.images[0]}
                                alt={product.name}
                                fill
                                className="object-cover transition-transform group-hover:scale-110 duration-500"
                                sizes="(max-width: 768px) 50vw, 25vw"
                            />
                        ) : (
                            <ShoppingBag className="w-8 h-8 text-gray-200" />
                        )}

                        {product.discountPrice && product.price && (
                            <div className="absolute top-2 right-2 sm:flex sm:flex-col sm:gap-1.5 sm:items-end">
                                <div className="bg-green-500/90 backdrop-blur-md text-white px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-[0_4px_12px_rgba(34,197,94,0.3)] animate-in fade-in zoom-in duration-500">
                                    Oferta
                                </div>
                                {(() => {
                                    const saved = Math.round(((Number(product.price) - Number(product.discountPrice)) / Number(product.price)) * 100);
                                    return saved > 0 ? (
                                        <div className="hidden sm:block bg-[var(--text)]/90 backdrop-blur-md text-[var(--bg)] px-2 py-1 rounded-lg text-[10px] font-black shadow-lg animate-in slide-in-from-right-full duration-700">
                                            -{saved}%
                                        </div>
                                    ) : null;
                                })()}
                            </div>
                        )}

                        {product.categoryId && (
                            <div className="absolute top-2 left-2">
                                <span className="bg-[var(--surface)]/90 backdrop-blur-sm text-[var(--text)] px-2 py-1 rounded-lg text-[8px] font-black uppercase tracking-tighter shadow-sm border border-[var(--border)]">
                                    {categories.find(c => c.id === product.categoryId)?.name}
                                </span>
                            </div>
                        )}
                    </div>
                    <div className="mt-4 flex-1 flex flex-col px-1">
                        <h3 className="text-sm font-black text-[var(--text)] line-clamp-1">{product.name}</h3>
                        <div className="mt-auto pt-3 flex items-center justify-between gap-2">
                            <div className="flex flex-col">
                                {product.price === null || product.price === undefined ? (
                                    <span className="text-sm font-black text-blue-500 uppercase tracking-wide">
                                        Consultar Precio
                                    </span>
                                ) : product.discountPrice ? (
                                    <>
                                        <span className="text-[10px] font-bold text-[var(--text)]/40 line-through decoration-red-500/50">
                                            {formatCurrency(product.price)}
                                        </span>
                                        <span className="text-base font-black text-green-500">
                                            {formatCurrency(product.discountPrice)}
                                        </span>
                                        {(() => {
                                            const saved = Math.round(((Number(product.price) - Number(product.discountPrice)) / Number(product.price)) * 100);
                                            return saved > 0 ? (
                                                <span className="sm:hidden inline-block text-[10px] font-black text-white bg-green-500 px-2 py-0.5 rounded-md mt-1">
                                                    -{saved}% OFF
                                                </span>
                                            ) : null;
                                        })()}
                                    </>
                                ) : (
                                    <span className="text-base font-black text-[var(--primary)]">
                                        {formatCurrency(product.price)}
                                    </span>
                                )}
                            </div>
                            {(product.price !== null && product.price !== undefined) && (
                                <div
                                    className="relative z-[50]"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <button
                                        onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            onAddToCart(product);
                                        }}
                                        className="w-10 h-10 bg-[var(--primary)] text-white rounded-xl flex items-center justify-center hover:scale-110 shadow-lg active:scale-90 transition-all cursor-pointer"
                                    >
                                        <Plus className="w-5 h-5" />
                                        {(() => {
                                            const totalQty = cart
                                                .filter(item => item.id === product.id)
                                                .reduce((sum, item) => sum + item.quantity, 0);
                                            return totalQty > 0 ? (
                                                <span className="absolute -top-2 -right-2 bg-[var(--text)] text-[var(--bg)] text-[9px] font-black w-5 h-5 flex items-center justify-center rounded-full border-2 border-[var(--bg)] animate-in zoom-in-50">
                                                    {totalQty}
                                                </span>
                                            ) : null;
                                        })()}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
