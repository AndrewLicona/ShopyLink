'use client';

import Image from 'next/image';
import { ShoppingBag, Tag, ChevronRight } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import type { Product, Category } from '@/types/types';

interface DiscountsSectionProps {
    products: Product[];
    categories: Category[];
    onProductClick: (product: Product) => void;
    categoryFilter?: string;
    searchTerm?: string;
    onViewAllDiscounts?: () => void;
}

export function DiscountsSection({
    products,
    categories,
    onProductClick,
    categoryFilter = 'all',
    searchTerm = '',
    onViewAllDiscounts
}: DiscountsSectionProps) {
    // Filter products with discounts
    let discountedProducts = products.filter(p => p.discountPrice && p.price);

    // Apply category filter
    if (categoryFilter && categoryFilter !== 'all') {
        discountedProducts = discountedProducts.filter(p => p.categoryId === categoryFilter);
    }

    // Apply search filter
    if (searchTerm.trim()) {
        const search = searchTerm.toLowerCase();
        discountedProducts = discountedProducts.filter(p =>
            p.name.toLowerCase().includes(search) ||
            p.description?.toLowerCase().includes(search)
        );
    }

    if (discountedProducts.length === 0) {
        return null;
    }

    return (
        <div className="mb-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center shadow-lg shadow-green-500/20">
                        <Tag className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h2 className="text-xl font-black text-[var(--text)]">
                            {categoryFilter !== 'all' || searchTerm ? 'Ofertas Filtradas' : 'Ofertas Especiales'}
                        </h2>
                        <p className="text-xs text-[var(--text)]/60 font-medium">
                            {discountedProducts.length > 0 ? (
                                <>¡Ahorra hasta {Math.max(...discountedProducts.map(p => {
                                    const saved = Math.round(((Number(p.price) - Number(p.discountPrice)) / Number(p.price)) * 100);
                                    return saved;
                                }))}% en productos seleccionados!</>
                            ) : (
                                'No hay ofertas en esta categoría'
                            )}
                        </p>
                    </div>
                </div>
                <button
                    onClick={onViewAllDiscounts}
                    className="hidden sm:flex items-center gap-1 text-xs font-bold text-green-500 hover:text-green-600 transition-colors px-3 py-2 rounded-xl hover:bg-green-50 dark:hover:bg-green-950/20"
                >
                    Ver todas
                    <ChevronRight className="w-4 h-4" />
                </button>
            </div>

            {/* Horizontal scroll grid */}
            <div className="overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide">
                <div className="flex gap-4 min-w-max">
                    {discountedProducts.map((product) => {
                        const savedPercent = Math.round(((Number(product.price!) - Number(product.discountPrice!)) / Number(product.price!)) * 100);

                        return (
                            <div
                                key={product.id}
                                onClick={() => onProductClick(product)}
                                className="w-[160px] sm:w-[200px] bg-gradient-to-br from-green-50 to-white dark:from-green-950/20 dark:to-[var(--bg)] rounded-xl p-3 border-2 border-green-500/30 hover:border-green-500 hover:shadow-xl hover:shadow-green-500/10 transition-all group cursor-pointer flex-shrink-0"
                            >
                                {/* Image */}
                                <div className="aspect-square bg-white dark:bg-[var(--secondary)]/30 flex items-center justify-center relative overflow-hidden mb-3 rounded-lg">
                                    {product.images?.[0] ? (
                                        <>
                                            {/* Ambient Blur Background */}
                                            <Image
                                                src={product.images[0]}
                                                alt="Background"
                                                fill
                                                className="object-cover blur-2xl scale-110 opacity-30"
                                                sizes="100px"
                                            />
                                            <Image
                                                src={product.images[0]}
                                                alt={product.name}
                                                fill
                                                className="object-cover relative z-10"
                                                sizes="200px"
                                            />
                                        </>
                                    ) : (
                                        <ShoppingBag className="w-8 h-8 text-gray-200" />
                                    )}

                                    {/* Discount badge */}
                                    <div className="absolute top-2 right-2">
                                        <div className="bg-green-500 text-white px-2 py-1 rounded-lg text-[10px] font-black shadow-lg">
                                            -{savedPercent}%
                                        </div>
                                    </div>

                                    {/* Category badge */}
                                    {product.categoryId && (
                                        <div className="absolute bottom-2 left-2">
                                            <span className="bg-white/90 backdrop-blur-sm text-[var(--text)] px-2 py-0.5 rounded-md text-[8px] font-black uppercase shadow-sm">
                                                {categories.find(c => c.id === product.categoryId)?.name}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {/* Info */}
                                <div className="space-y-2">
                                    <h3 className="text-xs font-black text-[var(--text)] line-clamp-1">
                                        {product.name}
                                    </h3>

                                    <div className="flex flex-col gap-1">
                                        <span className="text-[10px] font-bold text-[var(--text)]/40 line-through">
                                            {formatCurrency(product.price!)}
                                        </span>
                                        <div className="flex items-baseline gap-2">
                                            <span className="text-lg font-black text-green-500">
                                                {formatCurrency(product.discountPrice!)}
                                            </span>
                                        </div>
                                        <div className="text-[9px] font-black text-white bg-green-500 px-2 py-1 rounded-md inline-block w-fit">
                                            Ahorras {formatCurrency(Number(product.price!) - Number(product.discountPrice!))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Mobile indicator */}
            <div className="sm:hidden flex items-center justify-center gap-1 text-xs font-bold text-green-500 mt-2">
                {discountedProducts.length} ofertas disponibles
            </div>
        </div>
    );
}
