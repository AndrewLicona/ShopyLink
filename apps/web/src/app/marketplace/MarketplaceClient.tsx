'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Search, Loader2, ShoppingBag, Store as StoreIcon } from 'lucide-react';
import { api } from '@/services/api';
import { Product } from '@/types/types';
import { MarketplaceProductCard } from '@/features/marketplace/MarketplaceProductCard';

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
                const [productsData, activeCategoriesIds, offersCheck] = await Promise.all([
                    api.getMarketplaceProducts(params),
                    api.getActiveMarketplaceCategories(),
                    api.getMarketplaceProducts({ ofertas: 'true', limit: '1' })
                ]);
                setProducts(productsData);
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

    return (
        <div className="pb-24">
            {/* Hero Section — minimalista: fondo claro, un solo acento y mucho aire */}
            <section className="relative overflow-hidden border-b border-gray-200 bg-white">
                <div
                    aria-hidden
                    className="pointer-events-none absolute -right-40 -top-56 h-[520px] w-[520px] rounded-full bg-blue-600/[0.07] blur-3xl"
                />
                <div
                    aria-hidden
                    className="pointer-events-none absolute -left-32 bottom-[-280px] h-[460px] w-[460px] rounded-full bg-indigo-500/[0.05] blur-3xl"
                />

                <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-28">
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
                            Miles de productos de los mejores negocios locales. Compra
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
                    </motion.div>
                </div>
            </section>

            {/* Categories Sticky Bar */}
            <div className="sticky top-16 z-40 border-b border-gray-100 bg-white/90 backdrop-blur-md lg:top-[72px]">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center gap-2 overflow-x-auto py-4 hide-scrollbar">
                        {activeCategories.map((cat) => (
                            <button
                                key={cat.id}
                                onClick={() => setActiveCategory(cat.id)}
                                className={`px-5 py-2 rounded-full font-bold text-sm whitespace-nowrap transition-all ${
                                    activeCategory === cat.id
                                        ? 'bg-gray-900 text-white'
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                            >
                                {cat.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16 space-y-24">

                {/* Products Feed */}
                <section>
                    <div className="mb-8">
                        <h2 className="text-3xl font-black text-gray-900">
                            Productos Populares
                        </h2>
                        <p className="text-gray-500 font-medium mt-2">Lo más nuevo y buscado</p>
                    </div>

                    {loading ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
                                <div key={i} className="bg-gray-100 rounded-2xl h-64 animate-pulse"></div>
                            ))}
                        </div>
                    ) : products.length > 0 ? (
                        <>
                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                                {products.map((product, i) => (
                                    <MarketplaceProductCard key={product.id} product={product} index={i} />
                                ))}
                            </div>

                            {hasMore && (
                                <div className="flex justify-center mt-12">
                                    <button
                                        onClick={loadMore}
                                        disabled={loadingMore}
                                        className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-black text-sm hover:bg-blue-700 transition-all active:scale-95 disabled:opacity-60 disabled:active:scale-100 flex items-center gap-3 shadow-lg shadow-blue-600/20"
                                    >
                                        {loadingMore && <Loader2 className="w-4 h-4 animate-spin" />}
                                        {loadingMore ? 'Cargando...' : 'Cargar más productos'}
                                    </button>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="text-center py-20 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
                            <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-xl font-black text-gray-900">No encontramos productos</h3>
                            <p className="text-gray-500 mt-2">Intenta explorar otra categoría.</p>
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
}
