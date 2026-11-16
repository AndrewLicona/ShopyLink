'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Compass, Loader2, Search, ShoppingBag, Store, TicketPercent } from 'lucide-react';
import { api } from '@/services/api';
import type { Product } from '@/types/types';
import { MarketplaceProductCard } from '@/features/marketplace/MarketplaceProductCard';

const PAGE_SIZE = 40;
const allCategories = [
    { id: 'Ropa', label: 'Ropa y Moda' }, { id: 'Comida', label: 'Comida' },
    { id: 'Tecnología', label: 'Tecnología' }, { id: 'Hogar', label: 'Hogar' },
    { id: 'Salud', label: 'Salud y Belleza' }, { id: 'Muebles', label: 'Muebles' },
    { id: 'Perfumería', label: 'Perfumería' }, { id: 'Joyería', label: 'Joyería' },
    { id: 'Personalizados', label: 'Personalizados' }, { id: 'Sublimación', label: 'Sublimación' },
    { id: 'Deportes', label: 'Deportes' }, { id: 'Servicios', label: 'Servicios' },
];

export default function MarketplaceClient() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [error, setError] = useState(false);
    const [moreError, setMoreError] = useState(false);
    const [hasMore, setHasMore] = useState(false);
    const [offset, setOffset] = useState(0);
    const [activeCategory, setActiveCategory] = useState('all');
    const [categories, setCategories] = useState<typeof allCategories>([]);
    const [hasOffers, setHasOffers] = useState(false);
    const [attempt, setAttempt] = useState(0);
    const requestId = useRef(0);

    useEffect(() => {
        let active = true;
        api.getActiveMarketplaceCategories().then((ids) => {
            if (active) setCategories(allCategories.filter((item) => ids.includes(item.id)));
        }).catch(console.error);
        api.getMarketplaceProducts({ ofertas: 'true', limit: 1 }).then((data) => {
            if (active) setHasOffers(data.length > 0);
        }).catch(console.error);
        return () => { active = false; };
    }, []);

    const buildParams = useCallback((extra: Record<string, string | number> = {}) => ({
        ...extra,
        ...(activeCategory === 'ofertas' ? { ofertas: 'true' } : activeCategory !== 'all' ? { category: activeCategory } : {}),
    }), [activeCategory]);

    useEffect(() => {
        const requests = requestId;
        const current = ++requests.current;
        setLoading(true);
        setLoadingMore(false);
        setError(false);
        setMoreError(false);
        api.getMarketplaceProducts(buildParams({ limit: PAGE_SIZE, offset: 0 })).then((data: Product[]) => {
            if (current !== requestId.current) return;
            setProducts(data);
            setOffset(data.length);
            setHasMore(data.length === PAGE_SIZE);
        }).catch((err) => {
            console.error('Error fetching marketplace products:', err);
            if (current === requestId.current) setError(true);
        }).finally(() => {
            if (current === requestId.current) setLoading(false);
        });
        return () => { requests.current++; };
    }, [buildParams, attempt]);

    const loadMore = async () => {
        const current = requestId.current;
        setLoadingMore(true);
        setMoreError(false);
        try {
            const data: Product[] = await api.getMarketplaceProducts(buildParams({ limit: PAGE_SIZE, offset }));
            if (current !== requestId.current) return;
            setProducts((prev) => {
                const seen = new Set(prev.map((product) => product.id));
                return [...prev, ...data.filter((product) => !seen.has(product.id))];
            });
            setOffset((prev) => prev + data.length);
            setHasMore(data.length === PAGE_SIZE);
        } catch (err) {
            console.error('Error loading more products:', err);
            if (current === requestId.current) setMoreError(true);
        } finally {
            if (current === requestId.current) setLoadingMore(false);
        }
    };

    const filters = [{ id: 'all', label: 'Todo' }, ...(hasOffers ? [{ id: 'ofertas', label: 'Ofertas' }] : []), ...categories];
    const activeLabel = filters.find((item) => item.id === activeCategory)?.label || 'Productos';

    return (
        <div className="bg-[#f7f8fb] pb-24">
            <section className="mx-auto max-w-7xl px-4 pt-4 sm:px-6 sm:pt-6 lg:px-8">
                <div className="relative overflow-hidden rounded-2xl bg-[#14234a] px-5 py-7 text-white sm:rounded-3xl sm:px-9 sm:py-9 lg:px-12 lg:py-11">
                    <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-br from-[#14234a] via-[#203f80] to-[#3767e8]" />
                    <div aria-hidden="true" className="absolute -right-16 -top-32 h-72 w-72 rounded-full border-[48px] border-white/[0.06] sm:h-96 sm:w-96" />
                    <div className="relative flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
                        <div className="max-w-2xl">
                            <p className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-blue-200"><Compass className="h-4 w-4" /> Marketplace de emprendedores</p>
                            <h1 className="mt-3 text-balance text-3xl font-black leading-[1.12] tracking-tight sm:text-4xl lg:text-5xl">Descubre algo bueno <span className="text-blue-200">cerca de ti.</span></h1>
                            <p className="mt-3 max-w-lg text-sm leading-6 text-blue-100 sm:text-base">Encuentra productos y conoce los negocios que hay detrás de cada tienda.</p>
                            <div className="mt-5 flex flex-wrap gap-2.5">
                                <a href="#catalogo" className="inline-flex min-h-11 items-center justify-center gap-1.5 whitespace-nowrap rounded-xl bg-white px-3 py-2.5 text-xs font-bold text-blue-900 transition hover:bg-blue-50 sm:gap-2 sm:px-4 sm:text-sm">Explorar productos <ArrowRight className="h-4 w-4" /></a>
                                <Link href="/marketplace/search" className="inline-flex min-h-11 items-center justify-center gap-1.5 whitespace-nowrap rounded-xl border border-white/25 bg-white/10 px-3 py-2.5 text-xs font-bold text-white transition hover:bg-white/20 sm:gap-2 sm:px-4 sm:text-sm"><Search className="h-4 w-4" /> Buscar</Link>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2 sm:max-w-md lg:w-80 lg:shrink-0">
                            <Link href="/marketplace/tiendas" className="group rounded-xl border border-white/15 bg-white/10 p-3.5 transition hover:bg-white/20"><Store className="h-5 w-5 text-blue-200" /><span className="mt-2 flex items-center justify-between gap-1 text-sm font-bold">Tiendas <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" /></span><span className="mt-0.5 block text-xs text-blue-100">Conoce negocios</span></Link>
                            <Link href="/marketplace/ofertas" className="group rounded-xl border border-white/15 bg-white/10 p-3.5 transition hover:bg-white/20"><TicketPercent className="h-5 w-5 text-blue-200" /><span className="mt-2 flex items-center justify-between gap-1 text-sm font-bold">Ofertas <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" /></span><span className="mt-0.5 block text-xs text-blue-100">Ver descuentos</span></Link>
                        </div>
                    </div>
                </div>
            </section>

            <section id="catalogo" aria-labelledby="catalog-title" className="mx-auto mt-8 max-w-7xl scroll-mt-24 px-4 sm:mt-10 sm:px-6 lg:px-8">
                <div className="flex flex-wrap items-end justify-between gap-3">
                    <div><p className="text-[10px] font-bold uppercase tracking-[0.18em] text-blue-600">Explora el marketplace</p><h2 id="catalog-title" className="mt-1 text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">{activeCategory === 'all' ? 'Descubre productos' : activeLabel}</h2><p className="mt-1 text-sm text-slate-500">Productos y servicios de nuestras tiendas.</p></div>
                    {!loading && !error && <span aria-live="polite" className="text-xs font-semibold text-slate-500 sm:text-sm">{products.length} {products.length === 1 ? 'producto' : 'productos'}{hasMore ? ' mostrados' : ''}</span>}
                </div>
                <div role="group" aria-label="Filtrar productos por categoría" className="mt-5 flex flex-nowrap gap-2 overflow-x-auto overscroll-x-contain rounded-2xl border border-slate-200/80 bg-white p-2.5 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden sm:p-3">
                    {filters.map((item) => <button key={item.id} type="button" onClick={() => setActiveCategory(item.id)} aria-pressed={activeCategory === item.id} className={`inline-flex min-h-10 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-xl px-3.5 py-2 text-xs font-bold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 sm:text-sm ${item.id === 'ofertas' ? activeCategory === item.id ? 'bg-rose-600 text-white' : 'bg-rose-50 text-rose-700 hover:bg-rose-100' : activeCategory === item.id ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>{item.id === 'ofertas' && <TicketPercent aria-hidden="true" className="h-4 w-4" />}{item.label}</button>)}
                </div>
                {loading ? <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-5">{Array.from({ length: 10 }, (_, i) => <div key={i} className="h-64 animate-pulse rounded-2xl bg-slate-200/60" />)}</div> : error ? <div role="alert" className="mt-5 rounded-2xl border border-slate-200 bg-white px-5 py-12 text-center"><p className="font-bold text-slate-800">No pudimos cargar los productos</p><p className="mt-1 text-sm text-slate-500">Inténtalo de nuevo en unos momentos.</p><button onClick={() => setAttempt((value) => value + 1)} className="mt-4 text-sm font-bold text-blue-600">Volver a intentar</button></div> : products.length ? <><div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 lg:gap-5 xl:grid-cols-5">{products.map((product, index) => <MarketplaceProductCard key={product.id} product={product} index={index} />)}</div>{hasMore && <div className="mt-8 text-center">{moreError && <p role="alert" className="mb-3 text-sm text-red-600">No pudimos cargar más productos. Inténtalo de nuevo.</p>}<button onClick={loadMore} disabled={loadingMore} className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-blue-700 disabled:opacity-60">{loadingMore && <Loader2 className="h-4 w-4 animate-spin" />}{loadingMore ? 'Cargando...' : 'Cargar más productos'}</button></div>}</> : <div className="mt-5 rounded-2xl border border-dashed border-slate-200 bg-white px-5 py-12 text-center"><ShoppingBag className="mx-auto h-9 w-9 text-slate-300" /><h3 className="mt-3 font-bold text-slate-700">No encontramos productos</h3><p className="mt-1 text-sm text-slate-500">Prueba explorando otra categoría.</p>{activeCategory !== 'all' && <button onClick={() => setActiveCategory('all')} className="mt-4 text-sm font-bold text-blue-600">Ver todos los productos</button>}</div>}
            </section>
        </div>
    );
}
