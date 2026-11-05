'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, ShoppingBag, Loader2 } from 'lucide-react';
import { api } from '@/services/api';
import { Product } from '@/types/types';
import { MarketplaceProductCard } from '@/features/marketplace/MarketplaceProductCard';

const PAGE_SIZE = 40;

export default function CategoryClient() {
    const params = useParams();
    // In Next.js router, param might be URI encoded
    const rawCategory = params.categoria as string;
    const category = decodeURIComponent(rawCategory);
    const isOffers = category.toLowerCase() === 'ofertas';

    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [hasMore, setHasMore] = useState(false);
    const [offset, setOffset] = useState(0);

    const fetchResults = useCallback(async () => {
        setLoading(true);
        try {
            const filter: Record<string, string | number> = isOffers
                ? { ofertas: 'true', limit: PAGE_SIZE, offset: 0 }
                : { category, limit: PAGE_SIZE, offset: 0 };
            const data = (await api.getMarketplaceProducts(filter)) as Product[];
            setProducts(data);
            setOffset(data.length);
            setHasMore(data.length === PAGE_SIZE);
        } catch (error) {
            console.error('Error fetching category results:', error);
        } finally {
            setLoading(false);
        }
    }, [category, isOffers]);

    useEffect(() => {
        if (category) {
            fetchResults();
        }
    }, [category, fetchResults]);

    const loadMore = async () => {
        setLoadingMore(true);
        try {
            const filter: Record<string, string | number> = isOffers
                ? { ofertas: 'true', limit: PAGE_SIZE, offset }
                : { category, limit: PAGE_SIZE, offset };
            const data = (await api.getMarketplaceProducts(filter)) as Product[];
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pb-24">
            <div className="mb-12 flex items-center gap-4">
                <Link href="/marketplace" className="w-10 h-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:text-blue-600 hover:border-blue-600 transition-colors shadow-sm">
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <div>
                    <h1 className="text-3xl font-black text-gray-900 capitalize">
                        {isOffers ? 'Ofertas' : category}
                    </h1>
                    <p className="text-gray-500 font-medium mt-1">
                        {isOffers
                            ? 'Productos con descuento activo en este momento'
                            : `Descubre los mejores productos en la categoría ${category}`}
                    </p>
                </div>
            </div>

            {loading ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="bg-white border border-gray-100 rounded-3xl h-64 animate-pulse"></div>
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
                <div className="text-center py-20 bg-white rounded-[3rem] border-2 border-dashed border-gray-200 shadow-sm">
                    <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-2xl font-black text-gray-900 mb-2">No hay productos aquí</h3>
                    <p className="text-gray-500 font-medium">
                        {isOffers
                            ? 'No hay ofertas activas en este momento.'
                            : `Aún no hay productos en la categoría "${category}".`}
                    </p>
                    <Link href="/marketplace" className="mt-6 inline-block bg-blue-600 text-white px-6 py-3 rounded-2xl font-bold hover:bg-blue-700 transition-colors">
                        Explorar todo
                    </Link>
                </div>
            )}
        </div>
    );
}
