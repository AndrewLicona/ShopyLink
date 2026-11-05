'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { MapPin, Store as StoreIcon } from 'lucide-react';
import { Store } from '@/types/types';

/**
 * Store card used across the marketplace (stores listing).
 *
 * Minimal by design: only the store logo identifies the business, no cover
 * banner and no coloured badges.
 */
export function MarketplaceStoreCard({
    store,
    index = 0,
}: {
    store: Store;
    index?: number;
}) {
    const productCount = store._count?.products ?? 0;

    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: Math.min(index, 6) * 0.06, duration: 0.4 }}
            className="h-full"
        >
            <Link
                href={`/marketplace/tienda/${store.slug}`}
                className="group flex h-full items-start gap-4 rounded-2xl border border-gray-200 bg-white p-5 transition-all duration-300 hover:border-gray-300 hover:shadow-lg hover:shadow-gray-900/5"
            >
                {/* Logo */}
                <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-2xl border border-gray-100 bg-gray-50">
                    {store.logoUrl ? (
                        <Image
                            src={store.logoUrl}
                            alt={store.name}
                            fill
                            className="object-contain p-1.5 transition-transform duration-500 group-hover:scale-105"
                            sizes="56px"
                        />
                    ) : (
                        <div className="flex h-full w-full items-center justify-center text-gray-300">
                            <StoreIcon className="h-6 w-6" />
                        </div>
                    )}
                </div>

                {/* Body */}
                <div className="min-w-0 flex-1">
                    <h3 className="truncate text-[15px] font-black text-gray-900 transition-colors group-hover:text-gray-600">
                        {store.name}
                    </h3>

                    <p className="mt-0.5 truncate text-[11px] font-bold uppercase tracking-wider text-gray-400">
                        {store.marketplaceCategory || 'Variedades'}
                    </p>

                    <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-semibold text-gray-500">
                        {store.city && (
                            <span className="inline-flex items-center gap-1">
                                <MapPin className="h-3.5 w-3.5 text-gray-300" />
                                {store.city.trim()}
                            </span>
                        )}
                        <span className="text-gray-300">·</span>
                        <span>
                            {productCount} {productCount === 1 ? 'producto' : 'productos'}
                        </span>
                    </div>
                </div>
            </Link>
        </motion.div>
    );
}
