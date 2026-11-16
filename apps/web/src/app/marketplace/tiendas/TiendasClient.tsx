'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Search, Store as StoreIcon, X } from 'lucide-react';
import { api } from '@/services/api';
import type { Store } from '@/types/types';
import { MarketplaceStoreCard } from '@/features/marketplace/MarketplaceStoreCard';

const normalize = (value: string) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('es');

export default function TiendasClient() {
    const [stores, setStores] = useState<Store[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [attempt, setAttempt] = useState(0);
    const [query, setQuery] = useState('');
    const [category, setCategory] = useState('all');
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        let active = true;
        setLoading(true);
        setError(false);
        api.getMarketplaceStores().then((data: Store[]) => {
            if (active) setStores(Array.isArray(data) ? data : []);
        }).catch((err) => {
            console.error('Error fetching marketplace stores:', err);
            if (active) setError(true);
        }).finally(() => {
            if (active) setLoading(false);
        });
        return () => { active = false; };
    }, [attempt]);

    const categories = useMemo(() => Array.from(new Set(stores.map((store) => store.marketplaceCategory?.trim()).filter((value): value is string => Boolean(value)))).sort((a, b) => a.localeCompare(b, 'es')), [stores]);
    const filtered = useMemo(() => {
        const term = normalize(query.trim());
        return stores.filter((store) => {
            const matchesCategory = category === 'all' || store.marketplaceCategory?.trim() === category;
            return matchesCategory && (!term || [store.name, store.marketplaceCategory, store.city, ...(store.tags ?? [])].some((field) => field && normalize(field).includes(term)));
        });
    }, [stores, query, category]);

    const clearFilters = () => { setQuery(''); setCategory('all'); };

    return (
        <div className="min-h-[70vh] bg-[#f7f8fb] pb-24">
            <div className="mx-auto max-w-7xl px-4 pt-4 sm:px-6 sm:pt-6 lg:px-8">
                <header className="relative overflow-hidden rounded-2xl bg-[#14234a] px-5 py-6 text-white sm:rounded-3xl sm:px-9 sm:py-8">
                    <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-br from-[#14234a] via-[#203f80] to-[#3767e8]" />
                    <div aria-hidden="true" className="absolute -right-10 -top-32 h-72 w-72 rounded-full border-[45px] border-white/[0.06]" />
                    <div className="relative">
                        <Link href="/marketplace" className="inline-flex items-center gap-2 text-xs font-bold text-blue-100 transition hover:text-white sm:text-sm"><ArrowLeft className="h-4 w-4" /> Volver al marketplace</Link>
                        <div className="mt-6 flex items-start gap-3 sm:items-center sm:gap-4"><span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/15 text-blue-100 sm:h-14 sm:w-14"><StoreIcon className="h-6 w-6" /></span><div><p className="text-[10px] font-bold uppercase tracking-[0.18em] text-blue-200">Directorio de tiendas</p><h1 className="mt-1 text-2xl font-black tracking-tight sm:text-4xl">Encuentra tu próxima tienda</h1><p className="mt-1 max-w-xl text-sm leading-6 text-blue-100">Conoce los negocios del marketplace y explora sus productos.</p></div></div>
                    </div>
                </header>

                <section aria-labelledby="directory-title" className="mt-8 sm:mt-10">
                    <div className="flex flex-wrap items-end justify-between gap-3"><div><p className="text-[10px] font-bold uppercase tracking-[0.18em] text-blue-600">Descubre negocios</p><h2 id="directory-title" className="mt-1 text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">Explora las tiendas</h2><p className="mt-1 text-sm text-slate-500">Busca por nombre, categoría o ciudad.</p></div>{!loading && !error && <span aria-live="polite" className="text-sm font-semibold text-slate-500">{filtered.length} {filtered.length === 1 ? 'tienda' : 'tiendas'}</span>}</div>

                    <div className="mt-5 space-y-3 rounded-2xl border border-slate-200/80 bg-white p-3 sm:p-4">
                        <div className="relative max-w-md"><Search aria-hidden="true" className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><input ref={inputRef} type="search" value={query} onChange={(event) => setQuery(event.target.value)} aria-label="Buscar tiendas por nombre, categoría o ciudad" placeholder="Buscar tiendas..." className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-10 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100 [&::-webkit-search-cancel-button]:hidden" />{query && <button type="button" onClick={() => { setQuery(''); inputRef.current?.focus(); }} aria-label="Borrar búsqueda" className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-200 hover:text-slate-700"><X className="h-4 w-4" /></button>}</div>
                        {categories.length > 0 && <div role="group" aria-label="Filtrar tiendas por categoría" className="flex gap-2 overflow-x-auto overscroll-x-contain [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"><button type="button" onClick={() => setCategory('all')} aria-pressed={category === 'all'} className={`min-h-10 shrink-0 whitespace-nowrap rounded-xl px-3.5 text-xs font-bold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 sm:text-sm ${category === 'all' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>Todas</button>{categories.map((item) => <button key={item} type="button" onClick={() => setCategory(item)} aria-pressed={category === item} className={`min-h-10 shrink-0 whitespace-nowrap rounded-xl px-3.5 text-xs font-bold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 sm:text-sm ${category === item ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>{item}</button>)}</div>}
                    </div>

                    {loading ? <div role="status" aria-label="Cargando tiendas" className="mt-5 grid gap-3 sm:gap-4 md:grid-cols-2 lg:grid-cols-3">{Array.from({ length: 3 }, (_, i) => <div key={i} className="h-28 animate-pulse rounded-2xl bg-slate-200/60" />)}</div> : error ? <div role="alert" className="mt-5 rounded-2xl border border-slate-200 bg-white px-5 py-12 text-center"><p className="font-bold text-slate-800">No pudimos cargar las tiendas</p><p className="mt-1 text-sm text-slate-500">Inténtalo de nuevo en unos momentos.</p><button type="button" onClick={() => setAttempt((value) => value + 1)} className="mt-4 text-sm font-bold text-blue-600">Volver a intentar</button></div> : filtered.length > 0 ? <div className="mt-5 grid gap-3 sm:gap-4 md:grid-cols-2 lg:grid-cols-3">{filtered.map((store, index) => <MarketplaceStoreCard key={store.id} store={store} index={index} />)}</div> : <div className="mt-5 rounded-2xl border border-dashed border-slate-200 bg-white px-5 py-12 text-center"><StoreIcon className="mx-auto h-9 w-9 text-slate-300" /><h3 className="mt-3 font-bold text-slate-700">{query.trim() || category !== 'all' ? 'No encontramos tiendas' : 'Aún no hay tiendas disponibles'}</h3><p className="mt-1 text-sm text-slate-500">{query.trim() || category !== 'all' ? 'Prueba con otra búsqueda o categoría.' : 'Vuelve más tarde para descubrir nuevos negocios.'}</p>{(query.trim() || category !== 'all') && <button type="button" onClick={clearFilters} className="mt-4 text-sm font-bold text-blue-600 hover:text-blue-700">Limpiar filtros</button>}</div>}
                </section>
            </div>
        </div>
    );
}
