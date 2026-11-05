'use client';

import { useEffect, useMemo, useState } from 'react';
import { Store as StoreIcon } from 'lucide-react';
import { api } from '@/services/api';
import { Store } from '@/types/types';
import { MarketplaceStoreCard } from '@/features/marketplace/MarketplaceStoreCard';

export default function TiendasClient() {
    const [stores, setStores] = useState<Store[]>([]);
    const [loading, setLoading] = useState(true);
    const [query, setQuery] = useState('');

    useEffect(() => {
        let active = true;

        const fetchStores = async () => {
            setLoading(true);
            try {
                const data = (await api.getMarketplaceStores()) as Store[];
                if (active) setStores(Array.isArray(data) ? data : []);
            } catch (error) {
                console.error('Error fetching marketplace stores:', error);
            } finally {
                if (active) setLoading(false);
            }
        };

        fetchStores();

        return () => {
            active = false;
        };
    }, []);

    const filtered = useMemo(() => {
        const term = query.trim().toLowerCase();
        if (!term) return stores;
        return stores.filter((store) =>
            [store.name, store.marketplaceCategory, store.city, ...(store.tags ?? [])]
                .filter(Boolean)
                .some((field) => String(field).toLowerCase().includes(term)),
        );
    }, [stores, query]);

    return (
        <div className="mx-auto max-w-7xl px-4 py-12 pb-24 sm:px-6 lg:px-8">
            <header className="mb-10 max-w-2xl">
                <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-600">
                    Directorio
                </p>
                <h1 className="mt-3 text-3xl font-black tracking-tight text-gray-900 sm:text-4xl">
                    Tiendas del marketplace
                </h1>
                <p className="mt-3 text-sm font-medium leading-relaxed text-gray-500">
                    Todos los comercios publicados en ShopyLink. Entra a cada tienda para ver su
                    catalogo y pedir por WhatsApp.
                </p>
            </header>

            <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
                <input
                    type="text"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Filtrar por nombre, categoria o ciudad..."
                    aria-label="Filtrar tiendas"
                    className="h-11 w-full max-w-sm rounded-2xl border border-gray-200 bg-white px-4 text-sm font-medium text-gray-900 outline-none transition-all placeholder:font-normal placeholder:text-gray-400 focus:border-blue-300 focus:ring-4 focus:ring-blue-500/10"
                />
                <p className="text-sm font-bold text-gray-400">
                    {loading
                        ? 'Cargando...'
                        : `${filtered.length} ${filtered.length === 1 ? 'tienda' : 'tiendas'}`}
                </p>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {[1, 2, 3].map((item) => (
                        <div key={item} className="h-80 animate-pulse rounded-3xl bg-gray-100" />
                    ))}
                </div>
            ) : filtered.length > 0 ? (
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {filtered.map((store, index) => (
                        <MarketplaceStoreCard key={store.id} store={store} index={index} />
                    ))}
                </div>
            ) : (
                <div className="rounded-3xl border-2 border-dashed border-gray-200 bg-white px-6 py-20 text-center">
                    <StoreIcon className="mx-auto mb-4 h-14 w-14 text-gray-300" />
                    <h2 className="text-xl font-black text-gray-900">
                        {query ? 'Ninguna tienda coincide' : 'Aun no hay tiendas publicadas'}
                    </h2>
                    <p className="mt-2 text-sm font-medium text-gray-500">
                        {query
                            ? 'Prueba con otro nombre, categoria o ciudad.'
                            : 'Publica tu tienda para aparecer en el marketplace.'}
                    </p>
                </div>
            )}
        </div>
    );
}
