'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowUpRight, MapPin, Store as StoreIcon } from 'lucide-react';
import { StoreLogo } from '@/components/atoms/StoreLogo';
import { Store } from '@/types/types';

/**
 * Tarjeta de tienda del marketplace (listado de tiendas).
 *
 * El logo es el protagonista: entra con `object-cover` en un marco redondeado
 * para que el arte cuadrado llene el marco y sus esquinas queden recortadas.
 * Sin banner ni badges de color: la ficha es sobria y el logo hace el trabajo.
 */
export function MarketplaceStoreCard({
    store,
    index = 0,
}: {
    store: Store;
    index?: number;
}) {
    const productCount = store._count?.products;

    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: Math.min(index, 6) * 0.06, duration: 0.4 }}
            className="h-full"
        >
            <Link
                href={`/marketplace/tienda/${store.slug}`}
                className="group flex h-full min-w-0 items-center gap-3.5 rounded-2xl bg-white p-4 shadow-[0_2px_12px_rgba(15,23,42,0.05)] ring-1 ring-slate-200/80 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:ring-blue-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 sm:gap-4 sm:p-5"
            >
                {/* Logo */}
                <StoreLogo
                    src={store.logoUrl}
                    alt={store.name}
                    widthClass="w-14 sm:w-16"
                    maxHeightClass="max-h-16"
                    className="aspect-square shrink-0 bg-gray-50 ring-1 ring-gray-200"
                    imageClassName="transition-transform duration-500 group-hover:scale-105"
                    sizes="64px"
                    fallback={
                        <div className="flex h-full w-full items-center justify-center text-gray-300">
                            <StoreIcon className="h-6 w-6" />
                        </div>
                    }
                />

                {/* Cuerpo */}
                <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                        <h3 className="min-w-0 truncate text-sm font-black leading-tight text-gray-900 transition-colors group-hover:text-blue-600 sm:text-[15px]">
                            {store.name}
                        </h3>
                        <ArrowUpRight className="h-4 w-4 shrink-0 text-gray-300 transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-blue-500" />
                    </div>

                    <p className="mt-0.5 truncate text-[10px] font-bold uppercase tracking-wider text-gray-400 sm:text-[11px]">
                        {store.marketplaceCategory || 'Variedades'}
                    </p>

                    <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[11px] font-semibold text-gray-500 sm:mt-3 sm:text-xs">
                        {store.city && (
                            <span className="inline-flex items-center gap-1">
                                <MapPin className="h-3.5 w-3.5 text-gray-300" />
                                {store.city.trim()}
                            </span>
                        )}
                        {productCount != null && <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-700 sm:text-[11px]">
                            {productCount} {productCount === 1 ? 'producto' : 'productos'}
                        </span>}
                    </div>
                </div>
            </Link>
        </motion.div>
    );
}
