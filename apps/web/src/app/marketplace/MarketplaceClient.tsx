'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Star, ShoppingBag, ArrowRight, TrendingUp, Search, Flame, Loader2, Store as StoreIcon } from 'lucide-react';
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
    const [stores, setStores] = useState<Store[]>([]);
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
                const [storesData, productsData, activeCategoriesIds, offersCheck] = await Promise.all([
                    api.getMarketplaceStores(),
                    api.getMarketplaceProducts(params),
                    api.getActiveMarketplaceCategories(),
                    api.getMarketplaceProducts({ ofertas: 'true', limit: '1' })
                ]);
                setStores(storesData);
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

    const featuredStores = stores.filter(s => s.featured).slice(0, 3); // Max 3 featured stores
    const spotlightStores = featuredStores.length > 0 ? featuredStores : stores.slice(0, 3);
    const hasFeatured = featuredStores.length > 0;

    return (
        <div className="pb-24">
            {/* Hero Section */}
            <section className="relative overflow-hidden bg-gradient-to-br from-blue-950 via-indigo-900 to-violet-900 text-white min-h-[420px] md:min-h-[520px] lg:min-h-[600px] flex items-center">
                {/* Background decorations */}
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute -top-40 -right-40 w-[600px] h-[600px] bg-blue-500/20 rounded-full blur-3xl" />
                    <div className="absolute -bottom-20 -left-20 w-[400px] h-[400px] bg-violet-500/20 rounded-full blur-3xl" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-600/10 rounded-full blur-3xl" />
                    {/* Floating orbs */}
                    <motion.div
                        animate={{ y: [0, -20, 0], rotate: [0, 180, 360] }}
                        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
                        className="absolute top-16 right-[15%] w-6 h-6 bg-cyan-400/50 rounded-full blur-sm"
                    />
                    <motion.div
                        animate={{ y: [0, 20, 0], x: [0, 10, 0] }}
                        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
                        className="absolute bottom-20 right-[25%] w-4 h-4 bg-violet-400/50 rounded-full blur-sm"
                    />
                    <motion.div
                        animate={{ y: [0, -15, 0], x: [0, -10, 0] }}
                        transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
                        className="absolute top-1/3 left-[10%] w-5 h-5 bg-blue-300/40 rounded-full blur-sm"
                    />
                    {/* Grid pattern */}
                    <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center py-20 w-full">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7 }}
                    >
                        {/* Badge */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                            className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 px-4 py-2 rounded-full text-sm font-bold text-blue-200 mb-8"
                        >
                            <StoreIcon className="w-4 h-4 text-cyan-300" />
                            El marketplace de emprendedores
                        </motion.div>

                        <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black mb-6 tracking-tight leading-[1.05]">
                            Encuentra lo que
                            <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-blue-300 to-violet-400">
                                buscas, cerca de ti
                            </span>
                        </h1>
                        <p className="text-lg md:text-xl text-blue-200 max-w-2xl mx-auto font-medium mb-10 leading-relaxed">
                            Descubre miles de productos de los mejores negocios locales.
                            <br className="hidden sm:block" />
                            Compra directamente, apoya a los emprendedores.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <Link
                                href="/marketplace/search"
                                className="group flex items-center gap-3 bg-white text-blue-900 px-8 py-4 rounded-2xl font-black text-lg hover:bg-blue-50 transition-all hover:scale-105 active:scale-95 shadow-[0_0_60px_rgba(255,255,255,0.25)] w-full sm:w-auto justify-center"
                            >
                                <Search className="w-5 h-5" />
                                Buscar Productos
                                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </Link>
                            <Link
                                href="/login"
                                className="group flex items-center justify-center gap-2 bg-white/10 backdrop-blur-md border border-white/25 text-white px-8 py-4 rounded-2xl font-bold text-lg hover:bg-white/20 transition-all w-full sm:w-auto"
                            >
                                Vender Aquí
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
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
                                className={`flex items-center gap-1.5 px-5 py-2 rounded-full font-bold text-sm whitespace-nowrap transition-all ${
                                    activeCategory === cat.id
                                        ? cat.id === 'ofertas'
                                            ? 'bg-amber-500 text-white shadow-md shadow-amber-500/30'
                                            : 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                                        : cat.id === 'ofertas'
                                            ? 'bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200'
                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                            >
                                {cat.id === 'ofertas' && (
                                    <Flame className={`w-4 h-4 ${activeCategory === cat.id ? 'text-white fill-white' : 'text-amber-500 fill-amber-500/20'}`} />
                                )}
                                {cat.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16 space-y-24">
                
                {/* Stores */}
                {spotlightStores.length > 0 && (
                    <section>
                        <div className="mb-8 flex items-end justify-between gap-4">
                            <div>
                                <h2 className="flex items-center gap-3 text-3xl font-black text-gray-900">
                                    <Star className="h-8 w-8 fill-yellow-500 text-yellow-500" />
                                    {hasFeatured ? 'Tiendas Destacadas' : 'Tiendas del Marketplace'}
                                </h2>
                                <p className="mt-2 font-medium text-gray-500">
                                    {hasFeatured
                                        ? 'Marcas recomendadas en esta categoria'
                                        : 'Comercios que ya venden dentro de ShopyLink'}
                                </p>
                            </div>
                            <Link
                                href="/marketplace/tiendas"
                                className="hidden shrink-0 items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-bold text-gray-700 transition-all hover:border-blue-200 hover:text-blue-700 sm:flex"
                            >
                                Ver todas
                                <ArrowRight className="h-4 w-4" />
                            </Link>
                        </div>

                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {spotlightStores.map((store, i) => (
                                <MarketplaceStoreCard key={store.id} store={store} index={i} />
                            ))}
                        </div>
                    </section>
                )}

                {/* Products Feed */}
                <section>
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h2 className="text-3xl font-black text-gray-900 flex items-center gap-3">
                                <TrendingUp className="w-8 h-8 text-blue-600" />
                                Productos Populares
                            </h2>
                            <p className="text-gray-500 font-medium mt-2">Lo más nuevo y buscado</p>
                        </div>
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
