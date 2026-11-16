'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, Minus, PackageOpen, Plus, ShoppingBag, Store as StoreIcon, Trash2, X } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { formatCurrency, getCurrencyForCountry } from '@/lib/utils';
import { StoreLogo } from '@/components/atoms/StoreLogo';
import { Overlay } from '@/components/molecules/Overlay';

export function MarketplaceCartDrawer({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
    const router = useRouter();
    const { groups, total, count, setQuantity, removeItem, clearAll, hydrated } = useCart();
    const [confirmClear, setConfirmClear] = useState(false);
    const panelRef = useRef<HTMLElement>(null);
    const closeRef = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        if (!isOpen) return;
        const previouslyFocused = document.activeElement instanceof HTMLElement ? document.activeElement : null;
        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        closeRef.current?.focus();
        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') { onClose(); return; }
            if (event.key !== 'Tab' || !panelRef.current) return;
            const focusable = Array.from(panelRef.current.querySelectorAll<HTMLElement>('a[href], button:not(:disabled), [tabindex]:not([tabindex="-1"])'));
            if (!focusable.length) return;
            const first = focusable[0];
            const last = focusable[focusable.length - 1];
            if (!first || !last) return;
            if (event.shiftKey && (document.activeElement === first || !panelRef.current.contains(document.activeElement))) { event.preventDefault(); last.focus(); }
            else if (!event.shiftKey && (document.activeElement === last || !panelRef.current.contains(document.activeElement))) { event.preventDefault(); first.focus(); }
        };
        window.addEventListener('keydown', onKeyDown);
        return () => {
            window.removeEventListener('keydown', onKeyDown);
            document.body.style.overflow = previousOverflow;
            previouslyFocused?.focus();
        };
    }, [isOpen, onClose]);

    useEffect(() => { if (!isOpen) setConfirmClear(false); }, [isOpen]);

    const storeCount = groups.length;
    const multiCurrency = new Set(groups.map((group) => getCurrencyForCountry(group.storeCountry).code)).size > 1;

    return (
        <Overlay>
            <AnimatePresence>
                {isOpen && <div className="fixed inset-0 z-[100] flex justify-end">
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-slate-950/40" aria-hidden="true" />
                    <motion.aside ref={panelRef} initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 30, stiffness: 320 }} className="relative flex h-[100dvh] w-full max-w-[460px] flex-col bg-[#f7f8fb] shadow-[-18px_0_60px_rgba(15,23,42,0.2)]" role="dialog" aria-modal="true" aria-labelledby="marketplace-cart-title">
                        <header className="shrink-0 border-b border-slate-100 bg-white px-4 py-4 sm:px-6 sm:py-5">
                            <div className="flex items-center gap-3"><span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600"><ShoppingBag className="h-5 w-5" /></span><div className="min-w-0 flex-1"><h2 id="marketplace-cart-title" className="text-xl font-black tracking-tight text-slate-900">Tu carrito</h2><p className="mt-0.5 text-xs font-medium text-slate-500">{hydrated ? `${count} ${count === 1 ? 'producto' : 'productos'}${storeCount ? ` · ${storeCount} ${storeCount === 1 ? 'tienda' : 'tiendas'}` : ''}` : 'Cargando productos...'}</p></div><button ref={closeRef} type="button" onClick={onClose} aria-label="Cerrar carrito" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 text-slate-500 transition hover:bg-slate-50 hover:text-slate-900"><X className="h-5 w-5" /></button></div>
                        </header>

                        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-5 sm:px-6">
                            {!hydrated ? <div className="space-y-3" role="status" aria-label="Cargando carrito">{[1, 2, 3].map((item) => <div key={item} className="h-24 animate-pulse rounded-2xl bg-slate-200/60" />)}</div> : groups.length === 0 ? <div className="flex min-h-full flex-col items-center justify-center py-10 text-center"><span className="flex h-20 w-20 items-center justify-center rounded-3xl bg-blue-50 text-blue-500"><PackageOpen className="h-10 w-10" /></span><h3 className="mt-5 text-lg font-black text-slate-900">Tu carrito está vacío</h3><p className="mt-2 max-w-[260px] text-sm leading-6 text-slate-500">Descubre productos de diferentes tiendas y agrégalos aquí.</p><Link href="/marketplace#catalogo" onClick={onClose} className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-bold text-white transition hover:bg-blue-700">Explorar productos <ArrowRight className="h-4 w-4" /></Link></div> : <div className="space-y-4">
                                {storeCount > 1 && <p className="rounded-xl border border-blue-100 bg-blue-50 px-3.5 py-3 text-xs leading-5 text-blue-800">Al continuar, tendrás un pedido separado para cada tienda.</p>}
                                {groups.map((group) => <section key={group.storeId} className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
                                    <div className="flex items-center gap-3 border-b border-slate-100 bg-slate-50/70 px-3.5 py-3 sm:px-4"><StoreLogo src={group.storeLogoUrl} alt={group.storeName} widthClass="w-10" maxHeightClass="max-h-10" className="aspect-square shrink-0 bg-white ring-1 ring-slate-200" sizes="40px" fallback={<div className="flex h-full w-full items-center justify-center text-slate-400"><StoreIcon className="h-5 w-5" /></div>} /><div className="min-w-0 flex-1">{group.storeSlug ? <Link href={`/marketplace/tienda/${group.storeSlug}`} onClick={onClose} className="block truncate text-sm font-bold text-slate-900 hover:text-blue-600">{group.storeName}</Link> : <p className="truncate text-sm font-bold text-slate-900">{group.storeName}</p>}<p className="mt-0.5 text-xs text-slate-500">{group.count} {group.count === 1 ? 'unidad' : 'unidades'}</p></div><div className="min-w-0 text-right"><p className="text-[10px] font-semibold text-slate-400">Subtotal</p><p className="break-words text-xs font-black text-slate-900 sm:text-sm">{formatCurrency(group.total, group.storeCountry)}</p></div></div>
                                    <ul className="divide-y divide-slate-100">{group.items.map((item) => <li key={item.id + (item.variantId || '')} className="flex gap-3 p-3.5 sm:p-4"><Link href={`/marketplace/producto/${item.id}`} onClick={onClose} aria-label={`Ver ${item.name}`} className="flex h-[72px] w-[72px] shrink-0 items-center justify-center overflow-hidden rounded-xl bg-slate-50 ring-1 ring-slate-100">{item.image ? <Image src={item.image} alt="" width={72} height={72} unoptimized className="h-full w-full object-contain p-1" /> : <ShoppingBag className="h-6 w-6 text-slate-300" />}</Link><div className="min-w-0 flex-1"><div className="flex items-start justify-between gap-2"><div className="min-w-0"><Link href={`/marketplace/producto/${item.id}`} onClick={onClose} className="line-clamp-2 text-sm font-bold leading-snug text-slate-900 hover:text-blue-600">{item.name}</Link>{item.variantName && <p className="mt-1 text-xs text-slate-500">{item.variantName}</p>}<p className="mt-1 text-xs text-slate-500">{formatCurrency(item.price, group.storeCountry)} / unidad</p></div><button type="button" onClick={() => removeItem(item.id, item.variantId)} aria-label={`Quitar ${item.name}${item.variantName ? `, ${item.variantName}` : ''}`} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-400 transition hover:bg-red-50 hover:text-red-600"><Trash2 className="h-4 w-4" /></button></div><div className="mt-3 flex flex-wrap items-center justify-between gap-2"><div className="inline-flex items-center rounded-xl border border-slate-200 bg-slate-50"><button type="button" onClick={() => setQuantity(item.id, item.variantId, item.quantity - 1)} aria-label={`Restar una unidad de ${item.name}`} className="flex h-9 w-9 items-center justify-center rounded-l-xl text-slate-600 hover:bg-slate-200"><Minus className="h-4 w-4" /></button><span className="min-w-7 text-center text-sm font-bold text-slate-900" aria-label={`Cantidad: ${item.quantity}`}>{item.quantity}</span><button type="button" onClick={() => setQuantity(item.id, item.variantId, item.quantity + 1)} aria-label={`Sumar una unidad de ${item.name}`} className="flex h-9 w-9 items-center justify-center rounded-r-xl text-slate-600 hover:bg-slate-200"><Plus className="h-4 w-4" /></button></div><span className="text-sm font-black text-slate-900">{formatCurrency(item.price * item.quantity, group.storeCountry)}</span></div></div></li>)}</ul>
                                </section>)}
                                <div className="flex justify-end">{confirmClear ? <div className="flex flex-wrap items-center justify-end gap-3 text-xs"><span className="font-semibold text-slate-600">¿Vaciar todo el carrito?</span><button type="button" onClick={() => setConfirmClear(false)} className="font-bold text-slate-600 hover:text-slate-900">Cancelar</button><button type="button" onClick={() => { clearAll(); setConfirmClear(false); }} className="font-bold text-red-600 hover:text-red-700">Sí, vaciar</button></div> : <button type="button" onClick={() => setConfirmClear(true)} className="inline-flex min-h-10 items-center gap-1.5 rounded-lg px-2 text-xs font-bold text-slate-500 hover:bg-red-50 hover:text-red-600"><Trash2 className="h-4 w-4" /> Vaciar carrito</button>}</div>
                            </div>}
                        </div>

                        {hydrated && groups.length > 0 && <footer className="shrink-0 border-t border-slate-200 bg-white px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-4 sm:px-6"><div className="flex items-start justify-between gap-3"><div className="min-w-0"><p className="text-sm font-bold text-slate-700">{multiCurrency ? 'Subtotal por tienda' : 'Total estimado'}</p><p className="mt-1 text-xs leading-5 text-slate-500">{multiCurrency ? 'Consulta cada moneda en el resumen.' : 'Envío sujeto a las condiciones de la tienda.'}</p></div>{!multiCurrency && <p className="shrink-0 whitespace-nowrap text-right text-lg font-black tracking-tight text-slate-900 sm:text-2xl">{formatCurrency(total, groups[0]?.storeCountry)}</p>}</div><button type="button" onClick={() => { onClose(); router.push('/marketplace/checkout'); }} className="mt-4 flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 text-sm font-bold text-white transition hover:bg-blue-700">Continuar pedido <ArrowRight className="h-4 w-4" /></button><p className="mt-2 text-center text-[11px] leading-4 text-slate-500">Revisarás tus datos antes de confirmar {storeCount === 1 ? 'el pedido' : 'los pedidos'}.</p></footer>}
                    </motion.aside>
                </div>}
            </AnimatePresence>
        </Overlay>
    );
}
