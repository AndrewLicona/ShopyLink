'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ShoppingBag, Store as StoreIcon, Plus, Check, MessageCircle, Clock } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { formatCurrency } from '@/lib/utils';
import { buildWhatsAppLink } from '@/lib/whatsapp';
import {
    getPricingLabel,
    getPricingSuffix,
    isProductAvailable,
    isService,
} from '@/lib/pricing';
import type { Product } from '@/types/types';

/**
 * Marketplace product card.
 *
 * Shared by the marketplace feed, the category pages and the search page so the
 * "add to cart" behaviour is identical everywhere.
 */
export function MarketplaceProductCard({
    product,
    index = 0,
}: {
    product: Product;
    index?: number;
}) {
    const { addItem } = useCart();
    const [justAdded, setJustAdded] = useState(false);

    const imageUrl = product.images?.[0] || product.variants?.[0]?.images?.[0];
    const service = isService(product);
    const available = isProductAvailable(product);
    const pricingLabel = getPricingLabel(product.pricingMode);
    const pricingSuffix = getPricingSuffix(product.pricingMode);

    const price = product.discountPrice || product.price;
    const store = product.store;

    const handleAdd = (event: React.MouseEvent) => {
        event.preventDefault();
        event.stopPropagation();

        addItem({
            id: product.id,
            name: product.name,
            price: Number(price ?? 0),
            image: imageUrl,
            storeId: product.storeId,
            storeName: store?.name || 'Tienda',
            storeSlug: store?.slug || '',
            itemType: product.itemType || 'product',
            quantity: 1,
        });

        setJustAdded(true);
        setTimeout(() => setJustAdded(false), 1400);
    };

    const whatsappHref = store?.whatsappNumber
        ? buildWhatsAppLink({
            phone: store.whatsappNumber,
            type: 'service',
            name: product.name,
            price: price != null ? Number(price) : null,
            pricingMode: product.pricingMode,
        })
        : null;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: Math.min(index, 12) * 0.05, duration: 0.4 }}
            className="h-full"
        >
            <div
                className={`relative h-full bg-white rounded-2xl shadow-sm overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 flex flex-col ${
                    product.discountPrice
                        ? 'border-2 border-emerald-500 hover:border-emerald-400'
                        : 'border border-gray-100 hover:border-blue-200'
                }`}
            >
                <Link
                    href={`/marketplace/producto/${product.id}`}
                    className="block group flex-1 flex flex-col"
                >
                    <div className="w-full relative aspect-square bg-white flex items-center justify-center overflow-hidden">
                        {imageUrl ? (
                            <>
                                {/* Plain <img> on purpose: marketplace product images can
                                    come from any merchant-hosted URL, not only the hosts
                                    whitelisted in next.config.js remotePatterns. */}
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src={imageUrl}
                                    alt=""
                                    aria-hidden="true"
                                    className="absolute inset-0 w-full h-full object-cover blur-xl opacity-30 scale-110"
                                />
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src={imageUrl}
                                    alt={product.name}
                                    className="relative z-10 w-full h-full object-contain p-2 group-hover:scale-105 transition-transform duration-500"
                                />
                            </>
                        ) : (
                            <div className="relative z-10 py-16">
                                <ShoppingBag className="w-8 h-8 text-gray-200" />
                            </div>
                        )}

                        {product.discountPrice && (
                            <div className="absolute top-3 left-3 bg-emerald-500 text-white px-2 py-1 rounded-lg text-[10px] font-black shadow-md z-20 uppercase tracking-wide">
                                Oferta
                            </div>
                        )}

                        {service && (
                            <div className="absolute top-3 right-3 bg-violet-500 text-white px-2 py-1 rounded-lg text-[10px] font-black shadow-md z-20 uppercase tracking-wide">
                                Servicio
                            </div>
                        )}

                        {!service && !available && (
                            <div className="absolute bottom-3 left-3 bg-amber-500 text-white px-2 py-1 rounded-lg text-[10px] font-black shadow-md z-20 uppercase tracking-wide">
                                Por encargo
                            </div>
                        )}
                    </div>

                    <div className="p-4 flex-1 flex flex-col">
                        <div className="text-[10px] font-black text-blue-600 mb-1.5 uppercase tracking-wider flex items-center gap-1">
                            <StoreIcon className="w-3 h-3" />
                            <span className="truncate">{store?.name || 'Tienda'}</span>
                        </div>

                        <h3 className="text-sm font-black text-gray-900 group-hover:text-blue-600 transition-colors leading-snug mb-3">
                            {product.name}
                        </h3>

                        <div className="flex items-center gap-2 mb-4 mt-auto flex-wrap">
                            {price == null ? (
                                <span className="text-sm font-black text-blue-600 bg-blue-50 px-2 py-1 rounded-lg">
                                    Precio a consultar
                                </span>
                            ) : (
                                <>
                                    {pricingLabel && (
                                        <span className="text-[10px] font-black text-violet-600 bg-violet-50 px-2 py-1 rounded-lg uppercase tracking-wide">
                                            {pricingLabel}
                                        </span>
                                    )}
                                    <span className="text-xl font-black text-gray-900">
                                        {formatCurrency(Number(price))}
                                    </span>
                                    {pricingSuffix && (
                                        <span className="text-xs font-bold text-gray-400">
                                            {pricingSuffix}
                                        </span>
                                    )}
                                    {product.discountPrice && (
                                        <span className="text-sm font-bold text-gray-400 line-through">
                                            {formatCurrency(product.price || 0)}
                                        </span>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </Link>

                {/* Action — kept outside the Link so it never triggers navigation */}
                <div className="px-4 pb-4">
                    {service ? (
                        whatsappHref ? (
                            <a
                                href={whatsappHref}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full flex items-center justify-center gap-2 bg-green-500 text-white py-3 rounded-xl font-black text-xs hover:bg-green-600 transition-all active:scale-95"
                            >
                                <MessageCircle className="w-4 h-4" />
                                Consultar por WhatsApp
                            </a>
                        ) : (
                            <Link
                                href={`/marketplace/tienda/${store?.slug ?? ''}`}
                                className="w-full flex items-center justify-center gap-2 bg-gray-100 text-gray-700 py-3 rounded-xl font-black text-xs hover:bg-gray-200 transition-all active:scale-95"
                            >
                                <StoreIcon className="w-4 h-4" />
                                Ver en la tienda
                            </Link>
                        )
                    ) : !available ? (
                        <Link
                            href={`/marketplace/producto/${product.id}`}
                            className="w-full flex items-center justify-center gap-2 bg-amber-50 text-amber-700 border border-amber-200 py-3 rounded-xl font-black text-xs hover:bg-amber-100 transition-all active:scale-95"
                        >
                            <Clock className="w-4 h-4" />
                            Pedir por encargo
                        </Link>
                    ) : (
                        <button
                            onClick={handleAdd}
                            className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-black text-xs transition-all active:scale-95 ${
                                justAdded
                                    ? 'bg-emerald-500 text-white'
                                    : 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-600/20'
                            }`}
                            aria-label={`Agregar ${product.name} al carrito`}
                        >
                            {justAdded ? (
                                <>
                                    <Check className="w-4 h-4" />
                                    Agregado
                                </>
                            ) : (
                                <>
                                    <Plus className="w-4 h-4" />
                                    Agregar al carrito
                                </>
                            )}
                        </button>
                    )}
                </div>
            </div>
        </motion.div>
    );
}
