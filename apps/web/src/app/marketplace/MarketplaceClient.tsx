'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Store as StoreIcon, Star, MapPin, Eye, ShoppingBag, ArrowRight, TrendingUp } from 'lucide-react';
import { api } from '@/services/api';
import { Product, Store } from '@/types/types';
import { formatCurrency } from '@/lib/utils';

const allCategories = [
    { id: 'all', label: 'Todo' },
    { id: 'ofertas', label: 'Ofertas 🔥' },
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
    const [activeCategory, setActiveCategory] = useState<string>('all');
    const [activeCategories, setActiveCategories] = useState<{ id: string, label: string }[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const params: Record<string, string> = {};
                if (activeCategory !== 'all') {
                    if (activeCategory === 'ofertas') {
                        params.ofertas = 'true';
                    } else {
                        params.category = activeCategory;
                    }
                }
                const [storesData, productsData, activeCategoriesIds] = await Promise.all([
                    api.getMarketplaceStores({ ...params, featured: 'true' }),
                    api.getMarketplaceProducts(params),
                    api.getActiveMarketplaceCategories()
                ]);
                setStores(storesData);
                setProducts(productsData);

                const filtered = allCategories.filter(c => 
                    c.id === 'all' || c.id === 'ofertas' || activeCategoriesIds.includes(c.id)
                );
                setActiveCategories(filtered);
            } catch (error) {
                console.error('Error fetching marketplace data:', error);
                setActiveCategories([{ id: 'all', label: 'Todo' }]);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [activeCategory]);

    const featuredStores = stores.filter(s => s.featured).slice(0, 3); // Max 3 featured stores

    return (
        <div className="pb-24">
            {/* Hero Section */}
            <section className="relative overflow-hidden bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900 text-white py-24 lg:py-32">
                <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-white/10 to-transparent skew-x-12 transform origin-top"></div>
                
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tight leading-tight">
                            Encuentra lo que buscas <br className="hidden md:block" />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">cerca de ti</span>
                        </h1>
                        <p className="text-lg md:text-xl text-blue-100 max-w-2xl mx-auto font-medium mb-10 leading-relaxed">
                            Descubre miles de productos de los mejores negocios locales. Compra directamente, apoya a los emprendedores.
                        </p>
                        
                        <div className="flex flex-wrap items-center justify-center gap-4">
                            <Link href="/marketplace/search" className="bg-white text-blue-900 px-8 py-4 rounded-2xl font-black text-lg hover:bg-blue-50 transition-all hover:scale-105 active:scale-95 shadow-[0_0_40px_rgba(255,255,255,0.3)]">
                                Buscar Productos
                            </Link>
                            <Link href="/login" className="bg-white/10 backdrop-blur-md border border-white/20 text-white px-8 py-4 rounded-2xl font-bold text-lg hover:bg-white/20 transition-all">
                                Vender Aquí
                            </Link>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Categories Sticky Bar */}
            <div className="sticky top-20 z-40 bg-white/80 backdrop-blur-md border-b border-gray-100 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center gap-2 overflow-x-auto py-4 hide-scrollbar">
                        {activeCategories.map((cat) => (
                            <button
                                key={cat.id}
                                onClick={() => setActiveCategory(cat.id)}
                                className={`px-5 py-2 rounded-full font-bold text-sm whitespace-nowrap transition-all ${
                                    activeCategory === cat.id
                                        ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
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
                
                {/* Featured Stores */}
                {featuredStores.length > 0 && (
                    <section>
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h2 className="text-3xl font-black text-gray-900 flex items-center gap-3">
                                    <Star className="w-8 h-8 text-yellow-500 fill-yellow-500" />
                                    Tiendas Destacadas
                                </h2>
                                <p className="text-gray-500 font-medium mt-2">Marcas recomendadas en esta categoría</p>
                            </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {featuredStores.map((store, i) => (
                                <StoreCard key={store.id} store={store} index={i} featured />
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
                        <Link href="/marketplace/search" className="hidden sm:flex items-center gap-2 text-blue-600 font-bold hover:text-blue-700 transition-colors">
                            Ver más <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>

                    {loading ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
                                <div key={i} className="bg-gray-100 rounded-3xl h-64 animate-pulse"></div>
                            ))}
                        </div>
                    ) : products.length > 0 ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                            {products.map((product, i) => (
                                <ProductCard key={product.id} product={product} index={i} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-20 bg-gray-50 rounded-[3rem] border-2 border-dashed border-gray-200">
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

function ProductCard({ product, index }: { product: Product, index: number }) {
    const imageUrl = product.images?.[0] || product.variants?.[0]?.images?.[0];
    
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05, duration: 0.4 }}
        >
            {/* Link to the product detail page within the marketplace */}
            <Link href={`/marketplace/producto/${product.id}`} className="block group h-full">
                <div className={`relative h-full bg-white rounded-3xl shadow-sm overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 flex flex-col ${product.discountPrice ? 'border-2 border-emerald-500 hover:border-emerald-400' : 'border border-gray-100 hover:border-blue-100'}`}>
                    <div className="h-40 sm:h-48 w-full relative bg-gray-50 flex items-center justify-center overflow-hidden">
                        {imageUrl ? (
                            <Image src={imageUrl} alt={product.name} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                        ) : (
                            <ShoppingBag className="w-8 h-8 text-gray-300" />
                        )}
                        {product.discountPrice && (
                            <div className="absolute top-3 left-3 bg-emerald-500 text-white px-2 py-1 rounded-lg text-[10px] font-black shadow-md z-10 uppercase tracking-wide">
                                Oferta
                            </div>
                        )}
                    </div>
                    
                    <div className="p-4 flex-1 flex flex-col">
                        <div className="text-[10px] font-black text-blue-500 mb-1.5 uppercase tracking-wider flex items-center gap-1">
                            <StoreIcon className="w-3 h-3" />
                            <span className="truncate">{product.store?.name || 'Tienda'}</span>
                        </div>
                        <h3 className="text-sm font-black text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2 leading-snug mb-3">
                            {product.name}
                        </h3>
                        <div className="flex items-center gap-2 mb-4">
                            {(!product.discountPrice && !product.price) ? (
                                <span className="text-sm font-black text-blue-600 bg-blue-50 px-2 py-1 rounded-lg">Precio a consultar</span>
                            ) : (
                                <>
                                    <span className="text-xl font-black text-gray-900">
                                        {formatCurrency(product.discountPrice || product.price || 0)}
                                    </span>
                                    {product.discountPrice && (
                                        <span className="text-sm font-bold text-gray-400 line-through">
                                            {formatCurrency(product.price || 0)}
                                        </span>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </Link>
        </motion.div>
    );
}

function StoreCard({ store, index, featured = false }: { store: Store, index: number, featured?: boolean }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.5 }}
        >
            <Link href={`/marketplace/tienda/${store.slug}`} className="block group h-full">
                <div className={`relative h-full bg-white rounded-3xl overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 ${featured ? 'border-2 border-yellow-400 shadow-xl' : 'border border-gray-100 shadow-sm'}`}>
                    
                    {/* Cover Background */}
                    <div className={`h-32 w-full relative ${featured ? 'bg-gradient-to-r from-yellow-400 to-orange-500' : 'bg-gradient-to-br from-blue-100 to-indigo-100'}`}>
                        {featured && (
                            <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full flex items-center gap-1 shadow-sm">
                                <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                                <span className="text-[10px] font-black text-yellow-700 uppercase tracking-wider">Destacada</span>
                            </div>
                        )}
                    </div>

                    <div className="p-6 pt-0 relative">
                        {/* Logo */}
                        <div className="w-20 h-20 rounded-2xl bg-white shadow-md border-4 border-white flex items-center justify-center overflow-hidden -mt-10 relative z-10 mx-auto group-hover:scale-105 transition-transform">
                            {store.logoUrl ? (
                                <Image src={store.logoUrl} alt={store.name} fill className="object-contain p-2" />
                            ) : (
                                <StoreIcon className="w-8 h-8 text-gray-300" />
                            )}
                        </div>

                        <div className="text-center mt-4">
                            <h3 className="text-lg font-black text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                                {store.name}
                            </h3>
                            <p className="text-sm text-gray-500 font-medium mt-1 line-clamp-1">
                                {store.marketplaceCategory || 'Variedades'}
                            </p>
                        </div>

                        <div className="flex items-center justify-center gap-4 mt-6 text-xs font-bold text-gray-500">
                            {store.city && (
                                <div className="flex items-center gap-1 bg-gray-50 px-3 py-1.5 rounded-lg">
                                    <MapPin className="w-3 h-3 text-blue-500" />
                                    {store.city}
                                </div>
                            )}
                        </div>

                        {store.tags && store.tags.length > 0 && (
                            <div className="flex flex-wrap items-center justify-center gap-2 mt-4">
                                {store.tags.slice(0, 3).map((tag, i) => (
                                    <span key={i} className="px-2.5 py-1 bg-gray-50 text-gray-500 rounded-lg text-[10px] font-bold uppercase tracking-wider">
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </Link>
        </motion.div>
    );
}
