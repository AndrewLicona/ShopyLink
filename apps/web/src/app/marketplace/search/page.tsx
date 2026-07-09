'use client';

import { useState, useEffect, Suspense, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Store as StoreIcon, Search, ShoppingBag, ArrowLeft } from 'lucide-react';
import { api } from '@/services/api';
import { Product } from '@/types/types';
import { formatCurrency } from '@/lib/utils';

function SearchResults() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const query = searchParams.get('q') || '';
    
    const [allProducts, setAllProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [inputValue, setInputValue] = useState(query);

    // Sync external query changes
    useEffect(() => {
        if (query !== inputValue) {
            setInputValue(query);
        }
    }, [query]);

    // Fetch all products ONCE
    useEffect(() => {
        const fetchAll = async () => {
            setLoading(true);
            try {
                const data = await api.getMarketplaceProducts();
                setAllProducts(data);
            } catch (error) {
                console.error('Error fetching search results:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchAll();
    }, []);

    // Filter client-side instantly
    const filteredProducts = useMemo(() => {
        if (!inputValue.trim()) return [];
        const terms = inputValue.toLowerCase().split(/\s+/).filter(Boolean);
        return allProducts.filter(p => {
            return terms.every(term => 
                p.name.toLowerCase().includes(term) ||
                (p.description && p.description.toLowerCase().includes(term)) ||
                (p.store?.name && p.store.name.toLowerCase().includes(term))
            );
        });
    }, [allProducts, inputValue]);

    const handleSearchChange = (newVal: string) => {
        setInputValue(newVal);
        // Silently update URL without triggering Next.js re-fetch
        const currentParams = new URLSearchParams(window.location.search);
        if (newVal.trim()) {
            currentParams.set('q', newVal.trim());
        } else {
            currentParams.delete('q');
        }
        const newSearch = currentParams.toString();
        const newUrl = `${window.location.pathname}${newSearch ? `?${newSearch}` : ''}`;
        window.history.replaceState(null, '', newUrl);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Since it's instant, we don't need to do anything on submit
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pb-24">
            <div className="mb-8 flex items-center gap-4">
                <Link href="/marketplace" className="w-10 h-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:text-blue-600 hover:border-blue-600 transition-colors shadow-sm">
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <div>
                    <h1 className="text-3xl font-black text-gray-900">
                        Resultados de búsqueda
                    </h1>
                    <p className="text-gray-500 font-medium mt-1">
                        {inputValue ? (
                            <>Buscando: <span className="text-blue-600 font-bold">"{inputValue}"</span></>
                        ) : (
                            'Ingresa un término de búsqueda para encontrar productos'
                        )}
                    </p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="mb-12 relative max-w-3xl">
                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                    <Search className="h-6 w-6 text-gray-400" />
                </div>
                <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    className="block w-full pl-14 pr-4 py-5 bg-white border-2 border-gray-100 rounded-[2rem] text-lg shadow-sm placeholder-gray-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none font-bold text-gray-900"
                    placeholder="Buscar productos por nombre, etiquetas, categoría..."
                />
                <div className="absolute inset-y-0 right-3 flex items-center">
                    <button type="button" onClick={handleSubmit} className="px-6 py-3 bg-blue-600 text-white font-black rounded-[1.5rem] hover:bg-blue-700 transition-colors shadow-md shadow-blue-600/20 active:scale-95">
                        Buscar
                    </button>
                </div>
            </form>

            {loading ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="bg-white border border-gray-100 rounded-3xl h-64 animate-pulse"></div>
                    ))}
                </div>
            ) : filteredProducts.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                    {filteredProducts.map((product, i) => (
                        <ProductCard key={product.id} product={product} index={i} />
                    ))}
                </div>
            ) : inputValue ? (
                <div className="text-center py-20 bg-white rounded-[3rem] border-2 border-dashed border-gray-200 shadow-sm">
                    <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-2xl font-black text-gray-900 mb-2">No encontramos nada</h3>
                    <p className="text-gray-500 font-medium">No hay productos que coincidan con "{inputValue}". Intenta con otras palabras clave.</p>
                </div>
            ) : null}
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

export default function MarketplaceSearchPage() {
    return (
        <Suspense fallback={<div className="p-20 text-center"><div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div></div>}>
            <SearchResults />
        </Suspense>
    );
}
