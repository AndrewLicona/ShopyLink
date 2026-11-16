'use client';

export const dynamic = 'force-dynamic';

import { Suspense, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, Loader2, Search, ShoppingBag, Store as StoreIcon, X } from 'lucide-react';
import { api } from '@/services/api';
import type { Product, Store } from '@/types/types';
import { LoadingState } from '@/components/atoms/LoadingState';
import { MarketplaceProductCard } from '@/features/marketplace/MarketplaceProductCard';
import { MarketplaceStoreCard } from '@/features/marketplace/MarketplaceStoreCard';

const PAGE_SIZE = 40;

function SearchResults() {
    const searchParams = useSearchParams();
    const query = searchParams.get('q') || '';
    const [inputValue, setInputValue] = useState(query);
    const [products, setProducts] = useState<Product[]>([]);
    const [stores, setStores] = useState<Store[]>([]);
    const [loading, setLoading] = useState(Boolean(query.trim()));
    const [loadingMore, setLoadingMore] = useState(false);
    const [productError, setProductError] = useState(false);
    const [storeError, setStoreError] = useState(false);
    const [moreError, setMoreError] = useState(false);
    const [hasMore, setHasMore] = useState(false);
    const [offset, setOffset] = useState(0);
    const [attempt, setAttempt] = useState(0);
    const requestId = useRef(0);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        setInputValue((previous) => previous.trim() === query.trim() ? previous : query);
    }, [query]);

    useEffect(() => {
        const requests = requestId;
        const current = ++requests.current;
        const term = inputValue.trim();
        setProducts([]);
        setStores([]);
        setHasMore(false);
        setOffset(0);
        setLoadingMore(false);
        setProductError(false);
        setStoreError(false);
        setMoreError(false);
        if (!term) {
            setLoading(false);
            return () => { requests.current++; };
        }
        setLoading(true);
        const timer = setTimeout(async () => {
            const [productResult, storeResult] = await Promise.allSettled([
                api.getMarketplaceProducts({ q: term, limit: PAGE_SIZE, offset: 0 }),
                api.getMarketplaceStores({ q: term }),
            ]);
            if (current !== requests.current) return;
            if (productResult.status === 'fulfilled') {
                const data: Product[] = productResult.value;
                setProducts(data);
                setOffset(data.length);
                setHasMore(data.length === PAGE_SIZE);
            } else {
                console.error('Error fetching search products:', productResult.reason);
                setProductError(true);
            }
            if (storeResult.status === 'fulfilled') setStores(storeResult.value);
            else {
                console.error('Error fetching search stores:', storeResult.reason);
                setStoreError(true);
            }
            setLoading(false);
        }, 350);
        return () => { clearTimeout(timer); requests.current++; };
    }, [inputValue, attempt]);

    const handleSearchChange = (value: string) => {
        requestId.current++;
        setInputValue(value);
        const params = new URLSearchParams(window.location.search);
        if (value.trim()) params.set('q', value.trim());
        else params.delete('q');
        const search = params.toString();
        window.history.replaceState(null, '', `${window.location.pathname}${search ? `?${search}` : ''}`);
    };

    const loadMore = async () => {
        const current = requestId.current;
        setLoadingMore(true);
        setMoreError(false);
        try {
            const data: Product[] = await api.getMarketplaceProducts({ q: inputValue.trim(), limit: PAGE_SIZE, offset });
            if (current !== requestId.current) return;
            setProducts((previous) => {
                const seen = new Set(previous.map((product) => product.id));
                return [...previous, ...data.filter((product) => !seen.has(product.id))];
            });
            setOffset((previous) => previous + data.length);
            setHasMore(data.length === PAGE_SIZE);
        } catch (error) {
            console.error('Error loading more results:', error);
            if (current === requestId.current) setMoreError(true);
        } finally {
            if (current === requestId.current) setLoadingMore(false);
        }
    };

    const term = inputValue.trim();
    const clearSearch = () => { handleSearchChange(''); inputRef.current?.focus(); };

    return (
        <div className="min-h-[70vh] bg-[#f7f8fb] pb-24">
            <div className="mx-auto max-w-7xl px-4 pt-4 sm:px-6 sm:pt-6 lg:px-8">
                <section className="relative overflow-hidden rounded-2xl bg-[#14234a] px-5 py-6 text-white sm:rounded-3xl sm:px-9 sm:py-8">
                    <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-br from-[#14234a] via-[#203f80] to-[#3767e8]" />
                    <div aria-hidden="true" className="absolute -right-10 -top-32 h-72 w-72 rounded-full border-[45px] border-white/[0.06]" />
                    <div className="relative">
                        <Link href="/marketplace" className="inline-flex items-center gap-2 text-xs font-bold text-blue-100 transition hover:text-white sm:text-sm"><ArrowLeft className="h-4 w-4" /> Volver al marketplace</Link>
                        <div className="mt-5 max-w-2xl sm:mt-6"><p className="text-[10px] font-bold uppercase tracking-[0.18em] text-blue-200">Explora el marketplace</p><h1 className="mt-1 text-2xl font-black tracking-tight sm:text-4xl">Encuentra lo que buscas</h1><p className="mt-2 text-sm leading-6 text-blue-100">Busca productos o tiendas y descubre algo nuevo.</p></div>
                        <div className="relative mt-5 max-w-2xl"><Search aria-hidden="true" className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" /><input ref={inputRef} type="search" value={inputValue} onChange={(event) => handleSearchChange(event.target.value)} aria-label="Buscar productos o tiendas" placeholder="Busca un producto o tienda..." className="h-12 w-full rounded-xl border border-white bg-white pl-12 pr-12 text-sm font-medium text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:ring-4 focus:ring-blue-300/40 [&::-webkit-search-cancel-button]:hidden sm:h-14 sm:text-base" />{inputValue && <button type="button" onClick={clearSearch} aria-label="Borrar búsqueda" className="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700"><X className="h-5 w-5" /></button>}</div>
                        <p className="mt-2 text-xs text-blue-100/85">Los resultados aparecen mientras escribes.</p>
                    </div>
                </section>

                {!term ? <section className="mt-8 rounded-2xl border border-slate-200/80 bg-white p-5 sm:mt-10 sm:p-8"><div className="flex items-start gap-4"><span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600"><Search className="h-5 w-5" /></span><div><h2 className="text-lg font-black text-slate-900">¿Qué te gustaría encontrar?</h2><p className="mt-1 text-sm leading-6 text-slate-500">Escribe el nombre de un producto, una descripción o el nombre de una tienda.</p><div className="mt-4 flex flex-wrap gap-2"><Link href="/marketplace#catalogo" className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-blue-50 px-3.5 text-sm font-bold text-blue-700 hover:bg-blue-100"><ShoppingBag className="h-4 w-4" /> Explorar productos</Link><Link href="/marketplace/tiendas" className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-slate-100 px-3.5 text-sm font-bold text-slate-700 hover:bg-slate-200"><StoreIcon className="h-4 w-4" /> Ver tiendas</Link></div></div></div></section> : loading ? <div role="status" aria-live="polite" className="mt-8"><p className="mb-4 text-sm font-semibold text-slate-500">Buscando productos y tiendas...</p><div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-5">{Array.from({ length: 5 }, (_, i) => <div key={i} className="h-64 animate-pulse rounded-2xl bg-slate-200/60" />)}</div></div> : <div className="mt-8 space-y-8 sm:mt-10 sm:space-y-10">
                    <div aria-live="polite"><p className="text-[10px] font-bold uppercase tracking-[0.18em] text-blue-600">Tu búsqueda</p><h2 className="mt-1 break-words text-xl font-black tracking-tight text-slate-900 sm:text-2xl">Resultados para «{term}»</h2></div>
                    {(storeError || productError) && <div role="alert" className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900"><p>No pudimos cargar {storeError && productError ? 'los resultados' : storeError ? 'las tiendas' : 'los productos'}. <button type="button" onClick={() => setAttempt((value) => value + 1)} className="font-bold underline underline-offset-2">Volver a intentar</button></p></div>}
                    {stores.length > 0 && <section aria-labelledby="stores-title"><div className="mb-4 flex items-baseline justify-between gap-3"><h3 id="stores-title" className="text-lg font-black text-slate-900 sm:text-xl">Tiendas</h3><span className="text-sm font-semibold text-slate-500">{stores.length} {stores.length === 1 ? 'tienda' : 'tiendas'}</span></div><div className="grid gap-3 sm:gap-4 md:grid-cols-2 lg:grid-cols-3">{stores.map((store, index) => <MarketplaceStoreCard key={store.id} store={store} index={index} />)}</div></section>}
                    {products.length > 0 && <section aria-labelledby="products-title"><div className="mb-4 flex items-baseline justify-between gap-3"><h3 id="products-title" className="text-lg font-black text-slate-900 sm:text-xl">Productos</h3><span className="text-sm font-semibold text-slate-500">{products.length} {products.length === 1 ? 'producto' : 'productos'}{hasMore ? ' mostrados' : ''}</span></div><div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 lg:gap-5 xl:grid-cols-5">{products.map((product, index) => <MarketplaceProductCard key={product.id} product={product} index={index} />)}</div>{hasMore && <div className="mt-8 text-center">{moreError && <p role="alert" className="mb-3 text-sm text-red-600">No pudimos cargar más resultados. Inténtalo de nuevo.</p>}<button type="button" onClick={loadMore} disabled={loadingMore} className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white hover:bg-blue-700 disabled:opacity-60">{loadingMore && <Loader2 className="h-4 w-4 animate-spin" />}{loadingMore ? 'Cargando...' : 'Cargar más productos'}</button></div>}</section>}
                    {!productError && !storeError && products.length === 0 && stores.length === 0 && <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-5 py-12 text-center"><Search className="mx-auto h-9 w-9 text-slate-300" /><h3 className="mt-3 font-bold text-slate-700">No encontramos coincidencias</h3><p className="mx-auto mt-1 max-w-md text-sm leading-6 text-slate-500">Prueba con otra palabra o revisa cómo la escribiste.</p><Link href="/marketplace#catalogo" className="mt-4 inline-flex items-center gap-1.5 text-sm font-bold text-blue-600 hover:text-blue-700">Explorar productos <ArrowRight className="h-4 w-4" /></Link></div>}
                </div>}
            </div>
        </div>
    );
}

export default function MarketplaceSearchPage() {
    return <Suspense fallback={<LoadingState message="Cargando búsqueda..." fullPage />}><SearchResults /></Suspense>;
}
