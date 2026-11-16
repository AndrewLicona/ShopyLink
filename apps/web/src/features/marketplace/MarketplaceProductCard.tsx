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
import { StoreLogo } from '@/components/atoms/StoreLogo';
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
 * Tarjeta de producto del marketplace.
 *
 * La comparten el feed del marketplace, las páginas de categoría y la búsqueda,
 * así que el comportamiento del carrito es idéntico en todas partes.
 *
 * Notas de diseño:
 * - La imagen mantiene una superficie limpia (sin fondo desenfocado) para que los
 *   afiches de catálogo sigan nitidos en lugar de verse embarrados.
 * - En móvil la tarjeta se compacta: imagen cuadrada, tipografía y espaciados
 *   más pequeños y la acción de carrito sigue siendo un botón tactile de 40px.
 * - La tienda se identifica con SU logo real (no un icono genérico): el marco
 *   redondeado recorta el arte cuadrado, así no se ven las esquinas.
 * - Los badges se apilan en una esquina y nunca se solapan con el precio.
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
    const originalPrice = Number(product.price);
    const discountedPrice = Number(product.discountPrice);
    const discountPercent = originalPrice > 0 && discountedPrice > 0 && discountedPrice < originalPrice
        ? Math.round((1 - discountedPrice / originalPrice) * 100)
        : 0;

    const handleAdd = (event: React.MouseEvent) => {
        event.preventDefault();
        event.stopPropagation();

        // Nunca se pasa del stock disponible: el pedido se rechazaría después.
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
                className="group relative flex h-full min-w-0 flex-col overflow-hidden rounded-2xl bg-white shadow-[0_2px_12px_rgba(15,23,42,0.05)] ring-1 ring-slate-200/80 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_30px_rgba(15,23,42,0.12)] hover:ring-blue-200"
            >
                {/* Imagen + acciones. El enlace solo envuelve la imagen para que el
                    botón del carrito siga siendo un hermano válido (sin anidar
                    elementos interactivos). */}
                <div className="relative aspect-square w-full overflow-hidden border-b border-slate-100 bg-[#f7f8fa] sm:aspect-[4/5]">
                    <Link
                        href={`/marketplace/producto/${product.id}`}
                        className="absolute inset-0 flex items-center justify-center"
                        aria-label={`Ver ${product.name}`}
                    >
                        {imageUrl ? (
                            /* <img> a propósito: las imágenes de producto pueden
                               venir de cualquier URL del comercio, no solo de los
                               hosts permitidos en next.config.js remotePatterns. */
                            /* eslint-disable-next-line @next/next/no-img-element */
                            <img
                                src={imageUrl}
                                alt={product.name}
                                loading="lazy"
                                className="h-full w-full object-contain p-2.5 transition-transform duration-500 group-hover:scale-[1.02] sm:p-4"
                            />
                        ) : (
                            <div className="flex h-full w-full items-center justify-center">
                                <ShoppingBag className="h-9 w-9 text-gray-300" />
                            </div>
                        )}
                    </Link>

                    {/* Badges — apilados arriba a la izquierda, nunca sobre el precio */}
                    <div className="pointer-events-none absolute left-2.5 top-2.5 flex flex-col items-start gap-1.5 sm:left-3 sm:top-3">
                        {product.discountPrice && (
                            <span className="inline-flex items-center gap-1 rounded-lg bg-rose-600 px-2 py-1 text-[9px] font-black uppercase tracking-wide text-white shadow-sm sm:text-[10px]">
                                <Tag className="h-2.5 w-2.5" />
                                {discountPercent > 0 ? `-${discountPercent}%` : 'Oferta'}
                            </span>
                        )}
                        {service && (
                            <span className="rounded-lg bg-violet-500 px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wider text-white shadow-md shadow-violet-500/30 sm:px-2 sm:py-1">
                                Servicio
                            </span>
                        )}
                        {!service && !available && (
                            <span className="rounded-lg bg-amber-500 px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wider text-white shadow-md shadow-amber-500/30 sm:px-2 sm:py-1">
                                Por encargo
                            </span>
                        )}
                    </div>

                    {/* Aviso de stock */}
                    {notice && (
                        <div className="pointer-events-none absolute right-2.5 top-2.5 z-20 max-w-[85%] rounded-lg bg-red-500 px-2 py-1 text-[10px] font-black uppercase tracking-wider text-white shadow-lg sm:right-3 sm:top-3">
                            {notice}
                        </div>
                    )}

                    {/* Acción de carrito — compacta, sobre la esquina inferior derecha */}
                    <div className="absolute bottom-2.5 right-2.5 z-10 sm:bottom-3 sm:right-3">
                        {service ? (
                            whatsappHref ? (
                                <a
                                    href={whatsappHref}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex h-10 w-10 items-center justify-center rounded-full bg-green-500 text-white shadow-lg shadow-green-500/30 transition-all hover:scale-110 hover:bg-green-600 active:scale-95 sm:h-11 sm:w-11"
                                    aria-label={`Consultar ${product.name} por WhatsApp`}
                                    title="Consultar por WhatsApp"
                                >
                                    <MessageCircle className="h-5 w-5" />
                                </a>
                            ) : (
                                <Link
                                    href={`/marketplace/tienda/${store?.slug ?? ''}`}
                                    className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-900 text-white shadow-lg transition-all hover:scale-110 active:scale-95 sm:h-11 sm:w-11"
                                    aria-label="Ver en la tienda"
                                    title="Ver en la tienda"
                                >
                                    <StoreIcon className="h-5 w-5" />
                                </Link>
                            )
                        ) : !available ? (
                            <Link
                                href={`/marketplace/producto/${product.id}`}
                                className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-gray-400 shadow-lg shadow-gray-900/10 ring-1 ring-gray-200 transition-all hover:scale-110 hover:bg-gray-50 hover:text-gray-700 active:scale-95 sm:h-11 sm:w-11"
                                aria-label={`Pedir ${product.name} por encargo`}
                                title="Pedir por encargo"
                            >
                                <Clock className="h-5 w-5" />
                            </Link>
                        ) : (
                            <button
                                onClick={handleAdd}
                                className={`flex h-10 w-10 items-center justify-center rounded-full shadow-lg transition-all active:scale-95 sm:h-11 sm:w-11 ${
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

                {/* Cuerpo */}
                <div className="flex min-w-0 flex-1 flex-col px-3 pb-3 pt-3 sm:px-4 sm:pb-4 sm:pt-3.5">
                    {/* Tienda — logo real en un marco redondeado, sin esquinas a la vista */}
                    <div className="mb-2 flex min-w-0 items-center gap-1.5">
                        <StoreLogo
                            src={store?.logoUrl}
                            alt={store?.name || 'Tienda'}
                            widthClass="w-5"
                            maxHeightClass="max-h-5"
                            className="bg-gray-100 ring-1 ring-gray-200"
                            sizes="20px"
                            fallback={
                                <div className="flex h-full w-full items-center justify-center text-gray-400">
                                    <StoreIcon className="h-3 w-3" />
                                </div>
                            }
                        />
                        {store?.slug ? <Link href={`/marketplace/tienda/${store.slug}`} className="min-w-0 truncate text-[10px] font-bold text-slate-500 transition-colors hover:text-blue-600 sm:text-xs">{store.name}</Link> : <span className="min-w-0 truncate text-[10px] font-bold text-slate-500 sm:text-xs">{store?.name || 'Tienda'}</span>}
                    </div>

                    <h3 className="line-clamp-2 text-[13px] font-bold leading-snug text-slate-900 sm:mb-2 sm:text-[15px]">
                        <Link href={`/marketplace/producto/${product.id}`} className="transition-colors hover:text-blue-600 focus-visible:outline-2 focus-visible:outline-blue-600">{product.name}</Link>
                    </h3>

                    <div className="mt-auto flex flex-wrap items-baseline gap-x-2 gap-y-1 pt-3">
                        {service ? (
                            /* Los servicios cotizan su precio por modality:
                               "Desde $ X COP", "$ X COP / hr" o "A convenir". */
                            <span className="text-[15px] font-black tracking-tight text-gray-900 sm:text-[17px]">
                                {getServicePriceLabel(
                                    price != null ? Number(price) : null,
                                    product.pricingMode,
                                    store?.country,
                                )}
                            </span>
                        ) : price == null ? (
                            <span className="rounded-lg bg-blue-50 px-2 py-1 text-[10px] font-black text-blue-600 sm:text-xs">
                                Precio a consultar
                            </span>
                        ) : (
                            <>
                                {pricingLabel && (
                                    <span className="rounded-lg bg-violet-50 px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wider text-violet-600 sm:px-2">
                                        {pricingLabel}
                                    </span>
                                )}
                                <span className={`text-[15px] font-black tracking-tight sm:text-[17px] ${discountPercent > 0 ? 'text-rose-700' : 'text-slate-900'}`}>
                                    {formatCurrency(Number(price), store?.country)}
                                </span>
                                {pricingSuffix && (
                                    <span className="text-[10px] font-bold text-gray-400 sm:text-[11px]">
                                        {pricingSuffix}
                                    </span>
                                )}
                                {product.discountPrice && (
                                    <span className="text-[10px] font-bold text-gray-400 line-through sm:text-[11px]">
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
