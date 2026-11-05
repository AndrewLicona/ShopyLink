'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search } from 'lucide-react';

export function MarketplaceSearchBar() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const initialQuery = searchParams.get('q') || '';

    const [query, setQuery] = useState(initialQuery);
    const debounceTimeout = useRef<NodeJS.Timeout | null>(null);

    // Sync input with URL if it changes externally
    useEffect(() => {
        const urlQuery = searchParams.get('q');
        if (urlQuery !== null && urlQuery !== query) {
            setQuery(urlQuery);
        }
    }, [searchParams, query]);

    const handleSearch = (newQuery: string) => {
        setQuery(newQuery);

        if (debounceTimeout.current) {
            clearTimeout(debounceTimeout.current);
        }

        debounceTimeout.current = setTimeout(() => {
            if (newQuery.trim()) {
                router.push(`/marketplace/search?q=${encodeURIComponent(newQuery.trim())}`);
            } else {
                router.push('/marketplace');
            }
        }, 400); // 400ms debounce
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
        if (query.trim()) {
            router.push(`/marketplace/search?q=${encodeURIComponent(query.trim())}`);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="group relative flex w-full items-center">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                <Search className="h-4.5 w-4.5 text-gray-400 transition-colors group-focus-within:text-blue-600" />
            </div>
            <input
                type="text"
                value={query}
                onChange={(e) => handleSearch(e.target.value)}
                className="h-11 w-full rounded-2xl border border-gray-200 bg-gray-50 pl-11 pr-24 text-sm font-medium text-gray-900 outline-none transition-all placeholder:font-normal placeholder:text-gray-400 hover:border-gray-300 focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                placeholder="Buscar productos o tiendas..."
                aria-label="Buscar en el marketplace"
            />
            <button
                type="submit"
                className="absolute right-1.5 flex h-8 items-center justify-center rounded-xl bg-blue-600 px-4 text-xs font-black text-white shadow-sm transition-all hover:bg-blue-700 active:scale-95"
            >
                Buscar
            </button>
        </form>
    );
}
