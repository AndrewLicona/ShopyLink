'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Search, Loader2, ShoppingBag, Store as StoreIcon } from 'lucide-react';
import { api } from '@/services/api';
import { Product, Store } from '@/types/types';
import { MarketplaceProductCard } from '@/features/marketplace/MarketplaceProductCard';
import { MarketplaceStoreCard } from '@/features/marketplace/MarketplaceStoreCard';

const PAGE_SIZE = 40;

const allCategories = [
    { id: 'all', label: 'Todo' },
    { id: 'ofertas', label: 'Ofertas' },
    { id: 'Ropa', label: 'Ropa y Moda' },
    { id: 'Comida', label: 'Comida' },
    { id: 'Tecnología', label: 'Tecnología' },
    { id: 'Hogar', label: 'Hogar' },
    { id: 'Salud', label: 'Salud y Belleza' },
    { id: 'Muebles', label: 'Muebles' },
    { id: 'Perfumería', label: 'Perfumería' },
    { id: 'Joyería', label: 'Joyería' },
    { id: 'Personalizados', label: 'Personalizados' },
    { id: 'Sublimación', label: 'Sublimación' },
    { id: 'Deportes', label: 'Deportes' },
    { id: 'Servicios', label: 'Servicios' },
];

export default function MarketplaceClient() {
    const [products, setProducts] = useState<Product[]>([]);
    const [stores, setStores] = useState<Store[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [hasMore, setHasMore] = useState(false);
    const [offset, setOffset] = useState(0);
    const [activeCategory, setActiveCategory] = useState<string>('all');
    const [activeCategories, setActiveCategories] = useState<{ id: string, label: string }[]>([]);

    const buildParams = useCallback((extra: Record<string, string | number> = {}) => {
        const params: Record<string, string | number> = { ...extra };
        if (activeCategory !== 'all') {
            if (activeCategory === 'ofertas') {
                params.ofertas = 'true';
            } else {
                params.category = activeCategory;
            }
        }
        return params;
    }, [activeCategory]);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const params = buildParams({ limit: PAGE_SIZE, offset: 0 });
                const [productsData, storesData, activeCategoriesIds, offersCheck] = await Promise.all([
                    api.getMarketplaceProducts(params),
                    api.getMarketplaceStores(),
                    api.getActiveMarketplaceCategories(),
                    api.getMarketplaceProducts({ ofertas: 'true', limit: '1' })
                ]);
                setProducts(productsData);
                setStores((storesData as Store[]) || []);
                setOffset(productsData.length);
                setHasMore(productsData.length === PAGE_SIZE);

                const hasOffers = offersCheck && offersCheck.length > 0;

                const filtered = allCategories.filter(c => {
                    if (c.id === 'all') return true;
                    if (c.id === 'ofertas') return hasOffers;
                    return activeCategoriesIds.includes(c.id);
                });
                setActiveCategories(filtered);
            } catch (error) {
                console.error('Error fetching marketplace data:', error);
                setActiveCategories([{ id: 'all', label: 'Todo' }]);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [buildParams]);

    const loadMore = async () => {
        setLoadingMore(true);
        try {
            const data = (await api.getMarketplaceProducts(
                buildParams({ limit: PAGE_SIZE, offset }),
            )) as Product[];
            setProducts((prev) => {
                const seen = new Set(prev.map((p) => p.id));
                return [...prev, ...data.filter((p) => !seen.has(p.id))];
            });
            setOffset((prev) => prev + data.length);
            setHasMore(data.length === PAGE_SIZE);
        } catch (error) {
            console.error('Error loading more products:', error);
        } finally {
            setLoadingMore(false);
        }
    };

    const featuredStores = stores.slice(0, 8);
    // Total real de productos publicados: la suma del catálogo de cada tienda.
    const totalProducts = stores.reduce((acc, s) => acc + (s._count?.products ?? 0), 0);

    return (
        <div className="pb-24">
            {/* Hero — fondo claro, un solo acento y mucho aire */}
            <section className="relative overflow-hidden border-b border-gray-200 bg-white">
                <div
                    aria-hidden
                    className="pointer-events-none absolute -right-40 -top-56 h-[520px] w-[520px] rounded-full bg-blue-600/[0.07] blur-3xl"
                />
                <div
                    aria-hidden
                    className="pointer-events-none absolute -left-32 bottom-[-280px] h-[460px] w-[460px] rounded-full bg-indigo-500/[0.05] blur-3xl"
                />

                <div className="relative mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
                    <motion.div
                        initial={{ opacity: 0, y: 18 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, ease: 'easeOut' }}
                        className="max-w-3xl"
                    >
                        <span className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-gray-50 px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider text-gray-500">
                            <StoreIcon className="h-3.5 w-3.5 text-gray-400" />
                            Marketplace de emprendedores
                        </span>

                        <h1 className="mt-6 text-4xl font-black leading-[1.08] tracking-tight text-gray-900 sm:text-5xl lg:text-6xl">
                            Encuentra lo que buscas,
                            <br />
                            <span className="text-blue-600">cerca de ti</span>
                        </h1>

                        <p className="mt-6 max-w-xl text-base leading-relaxed text-gray-500 sm:text-lg">
                            Productos de negocios locales de tu ciudad. Compra
                            directamente y apoya a los emprendedores.
                        </p>

                        <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                            <Link
                                href="/marketplace/search"
                                className="group inline-flex items-center justify-center gap-2.5 rounded-xl bg-gray-900 px-7 py-4 text-sm font-black text-white transition-all hover:bg-gray-800 active:scale-[0.98]"
                            >
                                <Search className="h-4.5 w-4.5" />
                                Buscar productos
                                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                            </Link>
                            <Link
                                href="/login"
                                className="group inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-7 py-4 text-sm font-black text-gray-700 transition-all hover:border-gray-300 hover:bg-gray-50 active:scale-[0.98]"
                            >
                                Vender aquí
                                <ArrowRight className="h-4 w-4 text-gray-400 transition-transform group-hover:translate-x-0.5" />
                            </Link>
                        </div>

                        {/* Cifras reales del marketplace, no promesas genéricas */}
                        {!loading && (
                            <dl className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-4 sm:gap-x-10">
                                <div>
                                    <dt className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
                                        Tiendas
                                    </dt>
                                    <dd className="mt-0.5 text-2xl font-black tracking-tight text-gray-900">
                                        {stores.length}
                                    </dd>
                                </div>
                                <div>
                                    <dt className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
                                        Productos
                                    </dt>
                                    <dd className="mt-0.5 text-2xl font-black tracking-tight text-gray-900">
                                        {totalProducts}
                                    </dd>
                                </div>
                                <div>
                                    <dt className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
                                        Categorías
                                    </dt>
                                    <dd className="mt-0.5 text-2xl font-black tracking-tight text-gray-900">
                                        {Math.max(activeCategories.length - 1, 0)}
                                    </dd>
                                </div>
                            </dl>
                        )}
                    </motion.div>
                </div>
            </section>

            {/* Barra de categorías */}
            <div className="sticky top-16 z-40 border-b border-gray-100 bg-white/90 backdrop-blur-md lg:top-[72px]">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center gap-2 overflow-x-auto py-3 hide-scrollbar sm:py-4">
                        {activeCategories.map((cat) => (
                            <button
                                key={cat.id}
                                onClick={() => setActiveCategory(cat.id)}
                                className={`px-4 py-2 rounded-full font-bold text-sm whitespace-nowrap transition-all sm:px-5 ${
                                    activeCategory === cat.id
                                        ? 'bg-gray-900 text-white shadow-sm'
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                            >
                                {cat.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 space-y-16 sm:mt-16 sm:space-y-24">

                {/* Tiendas destacadas */}
                {featuredStores.length > 0 && (
                    <section>
                        <div className="mb-6 flex items-end justify-between gap-4 sm:mb-8">
                            <div>
                                <h2 className="text-2xl font-black tracking-tight text-gray-900 sm:text-3xl">
                                    Tiendas destacadas
                                </h2>
                                <p className="text-gray-500 font-medium mt-1.5 sm:mt-2">
                                    Emprendimientos que ya están en el marketplace
                                </p>
                            </div>
                            <Link
                                href="/marketplace/tiendas"
                                className="group hidden shrink-0 items-center gap-1.5 text-sm font-black text-blue-600 transition-colors hover:text-blue-700 sm:inline-flex"
                            >
                                Ver todas
                                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                            </Link>
                        </div>

                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4">
                            {featuredStores.map((store, i) => (
                                <MarketplaceStoreCard key={store.id} store={store} index={i} />
                            ))}
                        </div>
                    </section>
                )}

                {/* Feed de productos */}
                <section>
                    <div className="mb-6 flex items-end justify-between gap-4 sm:mb-8">
                        <div>
                            <h2 className="text-2xl font-black tracking-tight text-gray-900 sm:text-3xl">
                                {activeCategory === 'all'
                                    ? 'Productos populares'
                                    : activeCategory === 'ofertas'
                                        ? 'Ofertas'
                                        : activeCategories.find((c) => c.id === activeCategory)?.label || 'Productos'}
                            </h2>
                            <p className="text-gray-500 font-medium mt-1.5 sm:mt-2">
                                Lo más nuevo y buscado del marketplace
                            </p>
                        </div>
                        {!loading && products.length > 0 && (
                            <span className="hidden shrink-0 rounded-full bg-gray-100 px-3 py-1 text-xs font-bold text-gray-500 sm:inline-flex">
                                {products.length}+ productos
                            </span>
                        )}
                    </div>

                    {loading ? (
                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 lg:gap-5 xl:grid-cols-5">
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
                                <div key={i} className="bg-gray-100 rounded-2xl h-64 animate-pulse"></div>
                            ))}
                        </div>
                    ) : products.length > 0 ? (
                        <>
                            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 lg:gap-5 xl:grid-cols-5">
                                {products.map((product, i) => (
                                    <MarketplaceProductCard key={product.id} product={product} index={i} />
                                ))}
                            </div>

                            {hasMore && (
                                <div className="flex justify-center mt-10 sm:mt-12">
                                    <button
                                        onClick={loadMore}
                                        disabled={loadingMore}
                                        className="bg-blue-600 text-white px-6 py-3.5 rounded-2xl font-black text-sm hover:bg-blue-700 transition-all active:scale-95 disabled:opacity-60 disabled:active:scale-100 flex items-center gap-3 shadow-lg shadow-blue-600/20 sm:px-8 sm:py-4"
                                    >
                                        {loadingMore && <Loader2 className="w-4 h-4 animate-spin" />}
                                        {loadingMore ? 'Cargando...' : 'Cargar más productos'}
                                    </button>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="text-center py-16 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200 sm:py-20">
                            <ShoppingBag className="w-14 h-14 text-gray-300 mx-auto mb-4 sm:w-16 sm:h-16" />
                            <h3 className="text-lg font-black text-gray-900 sm:text-xl">No encontramos productos</h3>
                            <p className="text-gray-500 mt-2">Intenta explorar otra categoría.</p>
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
}
