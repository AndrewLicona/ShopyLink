'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
    ShoppingBag,
    Store as StoreIcon,
    Plus,
    Check,
    MessageCircle,
    Clock,
    Tag,
} from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { formatCurrency } from '@/lib/utils';
import { buildWhatsAppLink } from '@/lib/whatsapp';
import {
    getPricingLabel,
    getPricingSuffix,
    getServicePriceLabel,
    isProductAvailable,
    isService,
    getAvailableStock,
} from '@/lib/pricing';
import type { Product } from '@/types/types';

/**
 * Marketplace product card.
 *
 * Shared by the marketplace feed, the category pages and the search page so the
 * "add to cart" behaviour is identical everywhere.
 *
 * Design notes:
 * - The image keeps a clean surface (no blurred backdrop) so catalogue posters
 *   stay crisp instead of turning muddy.
 * - The cart action is a compact circular button over the image instead of a
 *   full-width solid bar: a grid of solid blue buttons used to dominate the
 *   whole feed and made it look like a wall of CTAs.
 * - Badges are stacked in a single corner and never overlap the price.
 */
export function MarketplaceProductCard({
    product,
    index = 0,
}: {
    product: Product;
    index?: number;
}) {
    const { addItem, items } = useCart();
    const [justAdded, setJustAdded] = useState(false);
    const [notice, setNotice] = useState<string | null>(null);

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

        // Never go over the available stock: the order would be rejected later.
        const available = getAvailableStock(product);
        if (available !== null) {
            const inCart = items
                .filter((item) => item.id === product.id)
                .reduce((acc, item) => acc + item.quantity, 0);

            if (inCart + 1 > available) {
                setNotice(
                    available === 0
                        ? 'Producto agotado'
                        : `Solo quedan ${available} disponibles`,
                );
                setTimeout(() => setNotice(null), 2600);
                return;
            }
        }

        addItem({
            id: product.id,
            name: product.name,
            price: Number(price ?? 0),
            image: imageUrl,
            storeId: product.storeId,
            storeName: store?.name || 'Tienda',
            storeSlug: store?.slug || '',
            storeLogoUrl: store?.logoUrl || undefined,
            storeCountry: store?.country || undefined,
            itemType: product.itemType || 'product',
            quantity: 1,
        });

        setJustAdded(true);
        setTimeout(() => setJustAdded(false), 1600);
    };

    const whatsappHref = store?.whatsappNumber
        ? buildWhatsAppLink({
            phone: store.whatsappNumber,
            type: 'service',
            name: product.name,
            storeName: store?.name,
        })
        : null;

    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: Math.min(index, 10) * 0.04, duration: 0.35 }}
            className="h-full"
        >
            <article
                className={`group relative flex h-full flex-col overflow-hidden rounded-2xl bg-white shadow-sm ring-1 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:ring-transparent ${
                    product.discountPrice ? 'ring-emerald-200' : 'ring-gray-100'
                }`}
            >
                {/* Image + overlay actions. The link only wraps the image so the
                    cart button stays a valid sibling (no nested interactives). */}
                <div className="relative aspect-[4/5] w-full overflow-hidden bg-gradient-to-b from-gray-50 to-white">
                    <Link
                        href={`/marketplace/producto/${product.id}`}
                        className="absolute inset-0 flex items-center justify-center"
                    >
                        {imageUrl ? (
                            /* Plain <img> on purpose: marketplace product images can
                               come from any merchant-hosted URL, not only the hosts
                               whitelisted in next.config.js remotePatterns. */
                            /* eslint-disable-next-line @next/next/no-img-element */
                            <img
                                src={imageUrl}
                                alt={product.name}
                                loading="lazy"
                                className="h-full w-full object-contain p-3 transition-transform duration-500 group-hover:scale-[1.04]"
                            />
                        ) : (
                            <div className="flex h-full w-full items-center justify-center">
                                <ShoppingBag className="h-9 w-9 text-gray-200" />
                            </div>
                        )}
                    </Link>

                    {/* Badges — stacked top-left, never over the price */}
                    <div className="pointer-events-none absolute left-3 top-3 flex flex-col items-start gap-1.5">
                        {product.discountPrice && (
                            <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-500 px-2 py-1 text-[9px] font-black uppercase tracking-wider text-white shadow-md shadow-emerald-500/30">
                                <Tag className="h-2.5 w-2.5" />
                                Oferta
                            </span>
                        )}
                        {service && (
                            <span className="rounded-lg bg-violet-500 px-2 py-1 text-[9px] font-black uppercase tracking-wider text-white shadow-md shadow-violet-500/30">
                                Servicio
                            </span>
                        )}
                        {!service && !available && (
                            <span className="rounded-lg bg-amber-500 px-2 py-1 text-[9px] font-black uppercase tracking-wider text-white shadow-md shadow-amber-500/30">
                                Por encargo
                            </span>
                        )}
                    </div>

                    {/* Stock notice */}
                    {notice && (
                        <div className="pointer-events-none absolute right-3 top-3 z-20 rounded-lg bg-red-500 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-white shadow-lg">
                            {notice}
                        </div>
                    )}

                    {/* Cart action — compact, over the bottom-right of the image */}
                    <div className="absolute bottom-3 right-3 z-10">
                        {service ? (
                            whatsappHref ? (
                                <a
                                    href={whatsappHref}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex h-11 w-11 items-center justify-center rounded-full bg-green-500 text-white shadow-lg shadow-green-500/30 transition-all hover:scale-110 hover:bg-green-600 active:scale-95"
                                    aria-label={`Consultar ${product.name} por WhatsApp`}
                                    title="Consultar por WhatsApp"
                                >
                                    <MessageCircle className="h-5 w-5" />
                                </a>
                            ) : (
                                <Link
                                    href={`/marketplace/tienda/${store?.slug ?? ''}`}
                                    className="flex h-11 w-11 items-center justify-center rounded-full bg-gray-900 text-white shadow-lg transition-all hover:scale-110 active:scale-95"
                                    aria-label="Ver en la tienda"
                                    title="Ver en la tienda"
                                >
                                    <StoreIcon className="h-5 w-5" />
                                </Link>
                            )
                        ) : !available ? (
                            <Link
                                href={`/marketplace/producto/${product.id}`}
                                className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-gray-400 shadow-lg shadow-gray-900/10 ring-1 ring-gray-200 transition-all hover:scale-110 hover:bg-gray-50 hover:text-gray-700 active:scale-95"
                                aria-label={`Pedir ${product.name} por encargo`}
                                title="Pedir por encargo"
                            >
                                <Clock className="h-5 w-5" />
                            </Link>
                        ) : (
                            <button
                                onClick={handleAdd}
                                className={`flex h-11 w-11 items-center justify-center rounded-full shadow-lg transition-all active:scale-95 ${
                                    justAdded
                                        ? 'bg-emerald-500 text-white shadow-emerald-500/30'
                                        : 'bg-white text-gray-900 shadow-gray-900/10 ring-1 ring-gray-200 hover:bg-blue-600 hover:text-white hover:ring-blue-600'
                                }`}
                                aria-label={`Agregar ${product.name} al carrito`}
                                title="Agregar al carrito"
                            >
                                {justAdded ? (
                                    <Check className="h-5 w-5" />
                                ) : (
                                    <Plus className="h-5 w-5" />
                                )}
                            </button>
                        )}
                    </div>
                </div>

                {/* Body */}
                <div className="flex flex-1 flex-col px-4 pb-4 pt-3.5">
                    <div className="mb-1.5 flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-blue-600">
                        <StoreIcon className="h-3 w-3 shrink-0" />
                        <span className="truncate">{store?.name || 'Tienda'}</span>
                    </div>

                    <h3 className="mb-3 line-clamp-2 text-[13px] font-bold leading-snug text-gray-900 transition-colors group-hover:text-blue-600">
                        {product.name}
                    </h3>

                    <div className="mt-auto flex flex-wrap items-baseline gap-x-2 gap-y-1">
                        {service ? (
                            /* Services quote their price by mode: "Desde $ X COP",
                               "$ X COP / hr" or "A convenir". */
                            <span className="text-[17px] font-black tracking-tight text-gray-900">
                                {getServicePriceLabel(
                                    price != null ? Number(price) : null,
                                    product.pricingMode,
                                    store?.country,
                                )}
                            </span>
                        ) : price == null ? (
                            <span className="rounded-lg bg-blue-50 px-2 py-1 text-xs font-black text-blue-600">
                                Precio a consultar
                            </span>
                        ) : (
                            <>
                                {pricingLabel && (
                                    <span className="rounded-lg bg-violet-50 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-violet-600">
                                        {pricingLabel}
                                    </span>
                                )}
                                <span className="text-[17px] font-black tracking-tight text-gray-900">
                                    {formatCurrency(Number(price), store?.country)}
                                </span>
                                {pricingSuffix && (
                                    <span className="text-[11px] font-bold text-gray-400">
                                        {pricingSuffix}
                                    </span>
                                )}
                                {product.discountPrice && (
                                    <span className="text-[11px] font-bold text-gray-400 line-through">
                                        {formatCurrency(product.price || 0, store?.country)}
                                    </span>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </article>
        </motion.div>
    );
}
