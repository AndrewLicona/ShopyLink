'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { MapPin, Star, Store as StoreIcon } from 'lucide-react';
import { Store } from '@/types/types';

/**
 * Store card used across the marketplace (home feed and the stores listing).
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
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: Math.min(index, 6) * 0.06, duration: 0.45 }}
            className="h-full"
        >
            <Link
                href={`/marketplace/tienda/${store.slug}`}
                className="group flex h-full flex-col overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-900/5"
            >
                {/* Cover */}
                <div className="relative aspect-[16/9] w-full shrink-0 overflow-hidden bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-600">
                    {store.bannerUrl ? (
                        <Image
                            src={store.bannerUrl}
                            alt={`Banner de ${store.name}`}
                            fill
                            className="object-cover transition-transform duration-700 group-hover:scale-105"
                            sizes="(max-width: 768px) 100vw, 33vw"
                        />
                    ) : (
                        /* No banner: clean branded cover, the logo lives in the body */
                        <div
                            aria-hidden
                            className="absolute inset-0 opacity-[0.12]"
                            style={{
                                backgroundImage:
                                    'radial-gradient(circle, white 1.5px, transparent 1.5px)',
                                backgroundSize: '22px 22px',
                            }}
                        />
                    )}

                    {store.featured && (
                        <span className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-white/95 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-amber-600 shadow-sm">
                            <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
                            Destacada
                        </span>
                    )}
                </div>

                {/* Body */}
                <div className="flex flex-1 flex-col px-5 pb-5">
                    <div className="relative -mt-8 mb-3 h-16 w-16 shrink-0 overflow-hidden rounded-2xl border-4 border-white bg-white shadow-md">
                        {store.logoUrl ? (
                            <Image
                                src={store.logoUrl}
                                alt={store.name}
                                fill
                                className="object-contain p-1.5"
                                sizes="64px"
                            />
                        ) : (
                            <div className="flex h-full w-full items-center justify-center text-gray-300">
                                <StoreIcon className="h-6 w-6" />
                            </div>
                        )}
                    </div>

                    <h3 className="truncate text-base font-black text-gray-900 transition-colors group-hover:text-blue-600">
                        {store.name}
                    </h3>

                    <p className="mt-1 truncate text-xs font-bold uppercase tracking-wider text-gray-400">
                        {store.marketplaceCategory || 'Variedades'}
                    </p>

                    <div className="mt-4 flex flex-wrap items-center gap-2">
                        {store.city && (
                            <span className="inline-flex items-center gap-1.5 rounded-lg bg-gray-100 px-2.5 py-1 text-[11px] font-bold text-gray-600">
                                <MapPin className="h-3 w-3 text-blue-500" />
                                {store.city.trim()}
                            </span>
                        )}
                        <span className="inline-flex items-center gap-1.5 rounded-lg bg-blue-50 px-2.5 py-1 text-[11px] font-bold text-blue-700">
                            {productCount}{' '}
                            {productCount === 1 ? 'producto' : 'productos'}
                        </span>
                    </div>

                    {store.tags && store.tags.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-1.5">
                            {store.tags.slice(0, 3).map((tag, tagIndex) => (
                                <span
                                    key={`${tag}-${tagIndex}`}
                                    className="rounded-md bg-gray-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-gray-500"
                                >
                                    {tag}
                                </span>
                            ))}
                        </div>
                    )}
                </div>
            </Link>
        </motion.div>
    );
}
