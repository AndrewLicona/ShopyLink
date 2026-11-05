'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect, Suspense, useCallback, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Search, ArrowLeft, Loader2 } from 'lucide-react';
import { api } from '@/services/api';
import { Product } from '@/types/types';
import { MarketplaceProductCard } from '@/features/marketplace/MarketplaceProductCard';

const PAGE_SIZE = 40;

function SearchResults() {
    const searchParams = useSearchParams();
    const query = searchParams.get('q') || '';

    const [inputValue, setInputValue] = useState(query);
    const [results, setResults] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [hasMore, setHasMore] = useState(false);
    const [offset, setOffset] = useState(0);
    const [searched, setSearched] = useState(false);
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Sync external query changes (e.g. browser back / forward)
    useEffect(() => {
        setInputValue(query);
    }, [query]);

    // Server-side search with debounce — the whole catalogue is never downloaded.
    const runSearch = useCallback(async (term: string, startOffset = 0) => {
        if (!term.trim()) {
            setResults([]);
            setSearched(false);
            setHasMore(false);
            setOffset(0);
            setLoading(false);
            return;
        }

        if (startOffset === 0) setLoading(true);
        else setLoadingMore(true);

        try {
            const data = (await api.getMarketplaceProducts({
                q: term.trim(),
                limit: PAGE_SIZE,
                offset: startOffset,
            })) as Product[];

            setResults((prev) => {
                if (startOffset === 0) return data;
                const seen = new Set(prev.map((p) => p.id));
                return [...prev, ...data.filter((p) => !seen.has(p.id))];
            });
            setOffset(startOffset + data.length);
            setHasMore(data.length === PAGE_SIZE);
            setSearched(true);
        } catch (error) {
            console.error('Error fetching search results:', error);
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    }, []);

    useEffect(() => {
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
            runSearch(inputValue, 0);
        }, 350);

        return () => {
            if (debounceRef.current) clearTimeout(debounceRef.current);
        };
    }, [inputValue, runSearch]);

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

    const loadMore = () => runSearch(inputValue, offset);

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

            <div className="mb-12 relative max-w-3xl">
                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                    <Search className="h-6 w-6 text-gray-400" />
                </div>
                <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    className="block w-full pl-14 pr-4 py-5 bg-white border-2 border-gray-100 rounded-[2rem] text-lg shadow-sm placeholder-gray-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none font-bold text-gray-900"
                    placeholder="Buscar productos por nombre, descripción o tienda..."
                    autoFocus
                />
            </div>

            {loading ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="bg-white border border-gray-100 rounded-3xl h-64 animate-pulse"></div>
                    ))}
                </div>
            ) : results.length > 0 ? (
                <>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                        {results.map((product, i) => (
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
                                {loadingMore ? 'Cargando...' : 'Cargar más resultados'}
                            </button>
                        </div>
                    )}
                </>
            ) : searched ? (
                <div className="text-center py-20 bg-white rounded-[3rem] border-2 border-dashed border-gray-200 shadow-sm">
                    <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-2xl font-black text-gray-900 mb-2">No encontramos nada</h3>
                    <p className="text-gray-500 font-medium">No hay productos que coincidan con "{inputValue}". Intenta con otras palabras clave.</p>
                </div>
            ) : null}
        </div>
    );
}

export default function MarketplaceSearchPage() {
    return (
        <Suspense fallback={<div className="p-20 text-center"><div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div></div>}>
            <SearchResults />
        </Suspense>
    );
}
