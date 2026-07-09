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
        if (searchParams.get('q') !== query && searchParams.get('q') !== null) {
            setQuery(searchParams.get('q') || '');
        }
    }, [searchParams]);

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
        <form onSubmit={handleSubmit} className="relative group flex-1">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
            </div>
            <input
                type="text"
                value={query}
                onChange={(e) => handleSearch(e.target.value)}
                className="block w-full pl-11 pr-4 py-3 bg-gray-100 border-transparent rounded-2xl text-sm placeholder-gray-500 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 transition-all outline-none font-medium"
                placeholder="Buscar tiendas, productos, categorías..."
            />
            <div className="absolute inset-y-0 right-0 pr-2 flex items-center">
                <button type="submit" className="px-4 py-1.5 bg-blue-600 text-white text-xs font-bold rounded-xl hover:bg-blue-700 transition-colors">
                    Buscar
                </button>
            </div>
        </form>
    );
}
