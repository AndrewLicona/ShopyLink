'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, Loader2, ShoppingBag, TicketPercent } from 'lucide-react';
import { api } from '@/services/api';
import type { Product } from '@/types/types';
import { MarketplaceProductCard } from '@/features/marketplace/MarketplaceProductCard';

const PAGE_SIZE = 40;

export default function CategoryClient() {
    const params = useParams();
    const category = decodeURIComponent(params.categoria as string);
    const isOffers = category.toLowerCase() === 'ofertas';
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [error, setError] = useState(false);
    const [moreError, setMoreError] = useState(false);
    const [hasMore, setHasMore] = useState(false);
    const [offset, setOffset] = useState(0);
    const [attempt, setAttempt] = useState(0);
    const requestId = useRef(0);

    useEffect(() => {
        const requests = requestId;
        const current = ++requests.current;
        setLoading(true);
        setLoadingMore(false);
        setError(false);
        setMoreError(false);
        const filter: Record<string, string | number> = isOffers ? { ofertas: 'true', limit: PAGE_SIZE, offset: 0 } : { category, limit: PAGE_SIZE, offset: 0 };
        api.getMarketplaceProducts(filter).then((data: Product[]) => {
            if (current !== requestId.current) return;
            setProducts(data);
            setOffset(data.length);
            setHasMore(data.length === PAGE_SIZE);
        }).catch((err) => {
            console.error('Error fetching category results:', err);
            if (current === requestId.current) setError(true);
        }).finally(() => {
            if (current === requestId.current) setLoading(false);
        });
        return () => { requests.current++; };
    }, [category, isOffers, attempt]);

    const loadMore = async () => {
        const current = requestId.current;
        setLoadingMore(true);
        setMoreError(false);
        try {
            const filter: Record<string, string | number> = isOffers ? { ofertas: 'true', limit: PAGE_SIZE, offset } : { category, limit: PAGE_SIZE, offset };
            const data: Product[] = await api.getMarketplaceProducts(filter);
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

    return (
        <div className="min-h-screen bg-[#f7f8fb] pb-24">
            <div className="mx-auto max-w-7xl px-4 pt-4 sm:px-6 sm:pt-6 lg:px-8">
                <section className="relative overflow-hidden rounded-2xl bg-[#14234a] px-5 py-6 text-white sm:rounded-3xl sm:px-9 sm:py-8">
                    <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-br from-[#14234a] via-[#203f80] to-[#3767e8]" />
                    <div aria-hidden="true" className="absolute -right-10 -top-32 h-72 w-72 rounded-full border-[45px] border-white/[0.06]" />
                    <div className="relative">
                        <Link href="/marketplace" className="inline-flex items-center gap-2 text-xs font-bold text-blue-100 hover:text-white sm:text-sm"><ArrowLeft className="h-4 w-4" /> Volver al marketplace</Link>
                        <div className="mt-6 flex items-start gap-3 sm:items-center sm:gap-4">
                            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/15 text-blue-100 sm:h-14 sm:w-14">{isOffers ? <TicketPercent className="h-6 w-6" /> : <ShoppingBag className="h-6 w-6" />}</span>
                            <div><p className="text-[10px] font-bold uppercase tracking-[0.18em] text-blue-200">Explora el marketplace</p><h1 className="mt-1 text-2xl font-black tracking-tight sm:text-4xl">{isOffers ? 'Ofertas para descubrir' : category}</h1><p className="mt-1 text-sm leading-6 text-blue-100">{isOffers ? 'Encuentra productos con descuento de nuestras tiendas.' : `Explora los productos de ${category}.`}</p></div>
                        </div>
                    </div>
                </section>

                <section aria-labelledby="results-title" className="mt-8 sm:mt-10">
                    <div className="flex flex-wrap items-end justify-between gap-3"><div><p className="text-[10px] font-bold uppercase tracking-[0.18em] text-blue-600">{isOffers ? 'Precios especiales' : 'Descubre más'}</p><h2 id="results-title" className="mt-1 text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">{isOffers ? 'Ofertas disponibles' : 'Productos'}</h2><p className="mt-1 text-sm text-slate-500">{isOffers ? 'Descubre los descuentos activos en el marketplace.' : 'Encuentra productos de nuestras tiendas.'}</p></div>{!loading && !error && <span aria-live="polite" className="text-sm font-semibold text-slate-500">{products.length} {products.length === 1 ? 'producto' : 'productos'}{hasMore ? ' mostrados' : ''}</span>}</div>
                    {loading ? <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-5">{Array.from({ length: 5 }, (_, i) => <div key={i} className="h-64 animate-pulse rounded-2xl bg-slate-200/60" />)}</div> : error ? <div role="alert" className="mt-5 rounded-2xl border border-slate-200 bg-white px-5 py-12 text-center"><p className="font-bold text-slate-800">No pudimos cargar los productos</p><p className="mt-1 text-sm text-slate-500">Inténtalo de nuevo en unos momentos.</p><button onClick={() => setAttempt((value) => value + 1)} className="mt-4 text-sm font-bold text-blue-600">Volver a intentar</button></div> : products.length ? <><div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 lg:gap-5 xl:grid-cols-5">{products.map((product, index) => <MarketplaceProductCard key={product.id} product={product} index={index} />)}</div>{hasMore && <div className="mt-8 text-center">{moreError && <p role="alert" className="mb-3 text-sm text-red-600">No pudimos cargar más productos. Inténtalo de nuevo.</p>}<button onClick={loadMore} disabled={loadingMore} className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white hover:bg-blue-700 disabled:opacity-60">{loadingMore && <Loader2 className="h-4 w-4 animate-spin" />}{loadingMore ? 'Cargando...' : 'Cargar más productos'}</button></div>}</> : <div className="mt-5 rounded-2xl border border-dashed border-slate-200 bg-white px-5 py-12 text-center"><ShoppingBag className="mx-auto h-9 w-9 text-slate-300" /><h3 className="mt-3 font-bold text-slate-700">{isOffers ? 'Aún no hay ofertas activas' : 'Aún no hay productos aquí'}</h3><p className="mt-1 text-sm text-slate-500">{isOffers ? 'Vuelve más tarde para descubrir nuevos descuentos.' : 'Explora las demás categorías del marketplace.'}</p><Link href="/marketplace#catalogo" className="mt-4 inline-flex items-center gap-1.5 text-sm font-bold text-blue-600 hover:text-blue-700">Explorar productos <ArrowRight className="h-4 w-4" /></Link></div>}
                </section>
            </div>
        </div>
    );
}
