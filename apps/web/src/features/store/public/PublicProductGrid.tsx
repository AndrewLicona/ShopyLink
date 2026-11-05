'use client';
import React from 'react';

import Image from 'next/image';
import { ShoppingBag, Search, Plus, MessageCircle } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { buildWhatsAppLink } from '@/lib/whatsapp';
import { isProductAvailable } from '@/lib/pricing';
import type { Product, Category } from '@/types/types';

interface PublicProductGridProps {
    products: Product[];
    categories: Category[];
    cart: { id: string, quantity: number }[];
    onProductClick: (product: Product) => void;
    onAddToCart: (product: Product) => void;
    searchTerm: string;
    bannerNode?: React.ReactNode;
    whatsappNumber?: string | null;
}

function ServicePriceLabel({ price, pricingMode }: { price?: number | null; pricingMode?: string | null }) {
    if (pricingMode === 'quote' || (price == null && pricingMode !== 'from' && pricingMode !== 'hourly')) {
        return <span className="text-base font-black text-[var(--primary)]">A convenir</span>;
    }
    if (pricingMode === 'from' && price != null) {
        return <span className="text-base font-black text-[var(--primary)]">Desde {formatCurrency(price)}</span>;
    }
    if (pricingMode === 'hourly' && price != null) {
        return <span className="text-base font-black text-[var(--primary)]">{formatCurrency(price)}/hora</span>;
    }
    if (price != null) {
        return <span className="text-base font-black text-[var(--primary)]">{formatCurrency(price)}</span>;
    }
    return <span className="text-base font-black text-[var(--primary)]">A convenir</span>;
}

function PricingModeBadge({ pricingMode }: { pricingMode?: string | null }) {
    const labels: Record<string, string> = {
        from: 'Desde',
        hourly: 'Por hora',
        quote: 'A convenir',
        fixed: 'Precio fijo',
    };
    const label = pricingMode ? labels[pricingMode] : null;
    if (!label) return null;
    return (
        <span className="inline-block bg-[var(--surface)] border border-[var(--border)] text-[var(--text)]/70 text-[9px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-md mt-1">
            {label}
        </span>
    );
}

export function PublicProductGrid({
    products,
    categories,
    cart,
    onProductClick,
    onAddToCart,
    searchTerm,
    bannerNode,
    whatsappNumber,
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
            {products.map((product, index) => (
                <React.Fragment key={product.id}>
                    {product.itemType === 'service' ? (
                        /* ── SERVICE CARD ── */
                        <div className="bg-[var(--bg)] rounded-xl p-3 border border-[var(--border)] hover:border-[var(--primary)]/50 hover:shadow-xl transition-all group flex flex-col relative">
                            <div className="aspect-square bg-[var(--secondary)]/30 flex items-center justify-center relative overflow-hidden rounded-lg">
                                {product.images?.[0] ? (
                                    <>
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
                                            priority={index === 0}
                                            className="object-cover relative z-10"
                                            sizes="(max-width: 768px) 50vw, 25vw"
                                        />
                                    </>
                                ) : (
                                    <MessageCircle className="w-8 h-8 text-gray-200" />
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
                                <PricingModeBadge pricingMode={product.pricingMode} />
                                <div className="mt-auto pt-3">
                                    <ServicePriceLabel price={product.price} pricingMode={product.pricingMode} />
                                    {whatsappNumber && (
                                        <a
                                            href={buildWhatsAppLink({
                                                phone: whatsappNumber,
                                                type: 'service',
                                                name: product.name,
                                                price: product.price,
                                                pricingMode: product.pricingMode,
                                            })}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            onClick={e => e.stopPropagation()}
                                            className="mt-3 w-full flex items-center justify-center gap-2 py-2 rounded-xl text-white text-xs font-bold transition-opacity hover:opacity-90"
                                            style={{ backgroundColor: '#25D366' }}
                                        >
                                            <MessageCircle className="w-4 h-4" />
                                            Consultar por WhatsApp
                                        </a>
                                    )}
                                </div>
                            </div>
                        </div>
                    ) : (
                        /* ── PRODUCT CARD ── */
                        <div
                            onClick={() => onProductClick(product)}
                            className="bg-[var(--bg)] rounded-xl p-3 border border-[var(--border)] hover:border-[var(--primary)]/50 hover:shadow-xl transition-all group flex flex-col relative cursor-pointer"
                        >
                        <div className="aspect-square bg-[var(--secondary)]/30 flex items-center justify-center relative overflow-hidden rounded-lg">
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
                                        priority={index === 0}
                                        className="object-cover relative z-10"
                                        sizes="(max-width: 768px) 50vw, 25vw"
                                    />
                                </>
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
                                    {/* Availability badge */}
                                    {isProductAvailable(product) ? (
                                        <span className="inline-block text-[9px] font-bold text-green-600 mt-1">
                                            ✓ Disponible
                                        </span>
                                    ) : (
                                        <span className="inline-block text-[9px] font-bold text-amber-500 mt-1">
                                            Por encargo
                                        </span>
                                    )}
                                </div>
                                {(product.price !== null && product.price !== undefined) && (
                                    <div
                                        className="relative z-10"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        {isProductAvailable(product) ? (
                                            <button
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    onAddToCart(product);
                                                }}
                                                className="w-10 h-10 bg-[var(--primary)] text-white rounded-xl flex items-center justify-center hover:scale-110 shadow-lg active:scale-90 transition-all cursor-pointer"
                                                aria-label={`Agregar ${product.name} al carrito`}
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
                                        ) : whatsappNumber ? (
                                            // Out of stock: the customer requests it via WhatsApp.
                                            <a
                                                href={buildWhatsAppLink({
                                                    phone: whatsappNumber,
                                                    type: 'product',
                                                    name: product.name,
                                                    price: product.price != null ? Number(product.price) : null,
                                                })}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                onClick={(e) => e.stopPropagation()}
                                                className="w-10 h-10 bg-amber-500 text-white rounded-xl flex items-center justify-center hover:scale-110 shadow-lg active:scale-90 transition-all cursor-pointer"
                                                aria-label={`Pedir ${product.name} por encargo`}
                                                title="Pedir por encargo"
                                            >
                                                <MessageCircle className="w-5 h-5" />
                                            </a>
                                        ) : (
                                            <button
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    onProductClick(product);
                                                }}
                                                className="w-10 h-10 bg-amber-500 text-white rounded-xl flex items-center justify-center hover:scale-110 shadow-lg active:scale-90 transition-all cursor-pointer"
                                                aria-label={`Ver ${product.name}`}
                                                title="Pedir por encargo"
                                            >
                                                <MessageCircle className="w-5 h-5" />
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                    )}

                    {/* Render intermediate banner after 4 products (1 row on desktop, 2 rows on mobile) */}
                    {index === 3 && bannerNode && (
                            <div className="col-span-2 lg:col-span-4 w-full">
                                {bannerNode}
                            </div>
                        )}
                </React.Fragment>
            ))}
        </div>
    );
}
