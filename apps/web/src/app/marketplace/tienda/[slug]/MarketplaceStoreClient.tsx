'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, ArrowUpRight, MapPin, MessageCircle, Search, ShoppingBag, Store as StoreIcon, X } from 'lucide-react';
import { api } from '@/services/api';
import type { Category, Product, Store } from '@/types/types';
import { LoadingState } from '@/components/atoms/LoadingState';
import { StoreLogo } from '@/components/atoms/StoreLogo';
import { MarketplaceProductCard } from '@/features/marketplace/MarketplaceProductCard';

export default function MarketplaceStoreClient() {
    const params = useParams();
    const slug = params.slug as string;
    const [store, setStore] = useState<Store | null>(null);
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [query, setQuery] = useState('');
    const [category, setCategory] = useState('all');

    useEffect(() => {
        let active = true;
        const fetchStore = async () => {
            try {
                const data = await api.getPublicStorePage(slug);
                if (!active) return;
                setStore(data.store);
                setCategories(data.categories || data.store?.categories || []);
                setProducts(((data.products || []) as Product[]).map((product) => ({ ...product, store: data.store })));
                if (data.store?.id) api.incrementStoreView(data.store.id).catch(console.error);
            } catch (error) {
                console.error('Error fetching store:', error);
            } finally {
                if (active) setLoading(false);
            }
        };
        if (slug) fetchStore();
        return () => { active = false; };
    }, [slug]);

    const visibleCategories = useMemo(() => categories.filter((item) => products.some((product) => product.categoryId === item.id)), [categories, products]);
    const filteredProducts = useMemo(() => {
        const search = query.trim().toLocaleLowerCase('es');
        return products.filter((product) =>
            (category === 'all' || product.categoryId === category) &&
            (!search || `${product.name} ${product.description || ''}`.toLocaleLowerCase('es').includes(search)),
        );
    }, [products, query, category]);

    if (loading) return <LoadingState message="Cargando tienda..." fullPage />;

    if (!store) {
        return (
            <div className="flex min-h-[65vh] flex-col items-center justify-center bg-slate-50 px-5 text-center">
                <StoreIcon className="mb-5 h-14 w-14 text-slate-300" />
                <h1 className="text-2xl font-black text-slate-900">No pudimos cargar esta tienda</h1>
                <p className="mt-3 max-w-md text-sm leading-6 text-slate-500">Comprueba la dirección o vuelve a intentarlo en unos momentos.</p>
                <Link href="/marketplace" className="mt-6 rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white hover:bg-blue-700">Volver al marketplace</Link>
            </div>
        );
    }

    const location = [store.city, store.country].filter(Boolean).join(', ');
    const whatsapp = store.whatsappNumber?.replace(/[^0-9]/g, '');

    return (
        <main className="min-h-screen bg-[#f7f8fb] pb-24 text-slate-900">
            <div className="relative overflow-hidden bg-[#14234a]">
                <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-br from-[#15264f] via-[#1e3a78] to-[#3767e8]" />
                <div aria-hidden="true" className="absolute -right-16 -top-40 h-80 w-80 rounded-full border-[50px] border-white/[0.04] sm:right-12" />
                <div className="relative mx-auto max-w-7xl px-4 pb-14 pt-5 sm:px-6 sm:pb-16 sm:pt-7 lg:px-8">
                    <Link href="/marketplace/tiendas" className="inline-flex items-center gap-2 text-xs font-bold text-blue-100 transition-colors hover:text-white sm:text-sm">
                        <ArrowLeft className="h-4 w-4" /> Explorar tiendas
                    </Link>
                    <p className="mt-7 text-[10px] font-bold uppercase tracking-[0.2em] text-blue-200 sm:mt-8">Marketplace / Tienda</p>
                    <p className="mt-2 text-xl font-bold tracking-tight text-white sm:text-2xl">Descubre {store.name}</p>
                </div>
            </div>

            <div className="relative mx-auto -mt-8 max-w-7xl px-4 sm:px-6 lg:px-8">
                <section aria-label="Información de la tienda" className="rounded-2xl border border-slate-100 bg-white p-4 shadow-[0_12px_35px_-20px_rgba(15,23,42,0.24)] sm:rounded-3xl sm:p-6">
                    <div className="flex flex-wrap items-start gap-4 sm:gap-5 lg:flex-nowrap lg:items-center">
                        <StoreLogo src={store.logoUrl} alt={store.name} widthClass="w-16 sm:w-20" maxHeightClass="max-h-20" className="aspect-square rounded-2xl bg-slate-100 ring-1 ring-slate-100" sizes="80px" fallback={<div className="flex h-full w-full items-center justify-center text-slate-400"><StoreIcon className="h-8 w-8" /></div>} />
                        <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                                <h1 className="break-words text-xl font-black tracking-tight sm:text-2xl">{store.name}</h1>
                                {store.featured && <span className="rounded-full bg-amber-50 px-2.5 py-1 text-[10px] font-bold text-amber-700">Tienda destacada</span>}
                            </div>
                            {store.description && <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500">{store.description}</p>}
                            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs font-medium text-slate-500 sm:text-sm">
                                {location && <span className="inline-flex items-center gap-1.5"><MapPin className="h-4 w-4 text-slate-400" />{location}</span>}
                                <span className="inline-flex items-center gap-1.5"><ShoppingBag className="h-4 w-4 text-slate-400" />{products.length} {products.length === 1 ? 'producto' : 'productos'}</span>
                            </div>
                        </div>
                        <div className="flex w-full flex-wrap gap-2 lg:w-auto lg:shrink-0">
                            <Link href={`/${store.slug}`} className="inline-flex min-h-11 flex-1 items-center justify-center gap-1.5 whitespace-nowrap rounded-xl bg-blue-600 px-3 py-2.5 text-sm font-bold text-white transition-colors hover:bg-blue-700 sm:flex-none sm:px-4">Visitar tienda <ArrowUpRight className="h-4 w-4 shrink-0" /></Link>
                            {whatsapp && <a href={`https://wa.me/${whatsapp}`} target="_blank" rel="noreferrer" className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm font-bold text-emerald-700 transition-colors hover:bg-emerald-100 sm:flex-none"><MessageCircle className="h-4 w-4" /> WhatsApp</a>}
                        </div>
                    </div>
                    {store.tags && store.tags.length > 0 && <div className="mt-4 flex flex-wrap gap-2 border-t border-slate-100 pt-4">{store.tags.map((tag, i) => <span key={`${tag}-${i}`} className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">{tag}</span>)}</div>}
                </section>

                <section className="mt-8 sm:mt-10" aria-labelledby="catalog-title">
                    <div className="flex flex-wrap items-end justify-between gap-4">
                        <div><p className="text-[10px] font-bold uppercase tracking-[0.18em] text-blue-600">Explora la tienda</p><h2 id="catalog-title" className="mt-1 text-2xl font-black tracking-tight sm:text-3xl">Su catálogo</h2><p className="mt-1 text-sm text-slate-500">Encuentra los productos de {store.name} en un solo lugar.</p></div>
                        <span className="text-sm font-semibold text-slate-500" aria-live="polite">{filteredProducts.length} {filteredProducts.length === 1 ? 'resultado' : 'resultados'}</span>
                    </div>

                    {products.length > 0 && <div className="mt-5 space-y-3 rounded-2xl border border-slate-200/80 bg-white p-3 sm:p-4">
                        <div className="relative max-w-md"><Search aria-hidden="true" className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><input value={query} onChange={(event) => setQuery(event.target.value)} aria-label="Buscar productos en esta tienda" placeholder="Buscar en esta tienda..." className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-10 text-sm text-slate-900 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100" />{query && <button type="button" onClick={() => setQuery('')} aria-label="Borrar búsqueda" className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-200 hover:text-slate-700"><X className="h-4 w-4" /></button>}</div>
                        {visibleCategories.length > 0 && <div aria-label="Filtrar por categoría" className="flex flex-wrap gap-2"><button type="button" onClick={() => setCategory('all')} aria-pressed={category === 'all'} className={`rounded-lg px-3 py-2 text-xs font-bold transition-colors ${category === 'all' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>Todos</button>{visibleCategories.map((item) => <button key={item.id} type="button" onClick={() => setCategory(item.id)} aria-pressed={category === item.id} className={`rounded-lg px-3 py-2 text-xs font-bold transition-colors ${category === item.id ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>{item.name}</button>)}</div>}
                    </div>}

                    {filteredProducts.length > 0 ? <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4 xl:grid-cols-5">{filteredProducts.map((product, index) => <MarketplaceProductCard key={product.id} product={product} index={index} />)}</div> : <div className="mt-5 rounded-2xl border border-dashed border-slate-200 bg-white px-5 py-12 text-center"><ShoppingBag className="mx-auto h-9 w-9 text-slate-300" /><p className="mt-3 font-bold text-slate-700">{products.length ? 'No encontramos productos' : 'Esta tienda aún no tiene productos'}</p><p className="mt-1 text-sm text-slate-500">{products.length ? 'Prueba con otra búsqueda o categoría.' : 'Vuelve más tarde para descubrir su catálogo.'}</p>{products.length > 0 && <button type="button" onClick={() => { setQuery(''); setCategory('all'); }} className="mt-4 text-sm font-bold text-blue-600 hover:text-blue-700">Limpiar filtros</button>}</div>}
                </section>
            </div>
        </main>
    );
}
