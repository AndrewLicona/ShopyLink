'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowDownToLine, ArrowRight, Check, CircleDollarSign, ExternalLink, Package, Plus, Share2, ShoppingBag, TrendingUp } from 'lucide-react';
import { formatCurrency, formatPrice, getCurrencyForCountry } from '@/lib/utils';
import { useDashboard } from '@/hooks/useDashboard';
import { LoadingState } from '@/components/atoms/LoadingState';
import { SalesChart } from '@/components/molecules/SalesChart';
import { pdfService } from '@/services/pdf.service';

export default function DashboardPage() {
    const { state, actions } = useDashboard();
    const { stats, recentOrders, analytics, topProducts, loading, error, copied, storeName, activeStore } = state;
    const [exporting, setExporting] = useState(false);
    const [exportError, setExportError] = useState(false);
    const country = activeStore?.country;

    const exportCatalog = async () => {
        if (!activeStore || exporting) return;
        setExportError(false);
        setExporting(true);
        try { await pdfService.generateCatalogPDF(activeStore, state.products, state.categories); }
        catch (err) { console.error('Error exporting catalog:', err); setExportError(true); }
        finally { setExporting(false); }
    };

    if (loading) return <LoadingState message="Cargando tus datos..." fullPage />;
    if (error) return <div role="alert" className="mx-auto max-w-lg rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-8 text-center"><h1 className="text-xl font-black">No pudimos cargar tu panel</h1><p className="mt-2 text-sm text-[var(--text)]/60">Comprueba tu conexión e inténtalo de nuevo.</p><button onClick={actions.retry} className="mt-5 rounded-xl bg-[var(--primary)] px-5 py-3 text-sm font-bold text-[var(--bg)]">Reintentar</button></div>;

    const cards = [
        { label: 'Ventas de hoy', value: formatPrice(stats.todaySales, country), currency: getCurrencyForCountry(country).code, detail: 'Pedidos completados hoy', icon: CircleDollarSign, tone: 'text-emerald-600 bg-emerald-500/10' },
        { label: 'Pedidos pendientes', value: stats.pendingOrders, detail: 'Por gestionar', icon: ShoppingBag, tone: 'text-orange-600 bg-orange-500/10', href: '/dashboard/orders' },
        { label: 'Productos', value: stats.totalProducts, detail: 'En tu catálogo', icon: Package, tone: 'text-blue-600 bg-blue-500/10', href: '/dashboard/products' },
        { label: 'Ventas acumuladas', value: formatPrice(stats.totalSales, country), currency: getCurrencyForCountry(country).code, detail: 'Pedidos completados', icon: TrendingUp, tone: 'text-purple-600 bg-purple-500/10' },
    ];

    return (
        <div className="mx-auto max-w-[1500px] space-y-5 pb-4 md:space-y-7">
            <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 py-4 sm:px-5">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="min-w-0"><p className="text-[10px] font-bold uppercase tracking-widest text-[var(--primary)]">Panel de control</p><h1 className="mt-1 break-words text-xl font-black tracking-tight text-[var(--text)] sm:text-2xl">Hola, {storeName}</h1><p className="mt-1 text-xs text-[var(--text)]/55">Tu tienda de un vistazo.</p></div>
                    <div className="grid grid-cols-3 gap-2 sm:flex sm:flex-wrap">
                        <Link href="/dashboard/products?action=new" aria-label="Crear nuevo producto" className="inline-flex min-h-11 min-w-0 items-center justify-center gap-1.5 rounded-xl bg-[var(--primary)] px-2 py-2 text-xs font-bold text-[var(--bg)] transition-opacity hover:opacity-90 sm:px-4 sm:text-sm"><Plus className="h-4 w-4 shrink-0" /><span className="sm:hidden">Producto</span><span className="hidden sm:inline">Nuevo producto</span></Link>
                        <button onClick={actions.handleShare} className="inline-flex min-h-11 min-w-0 items-center justify-center gap-1.5 rounded-xl border border-[var(--border)] bg-[var(--bg)] px-2 py-2 text-xs font-bold text-[var(--text)] hover:bg-[var(--secondary)] sm:px-4 sm:text-sm">{copied ? <Check className="h-4 w-4 shrink-0" /> : <Share2 className="h-4 w-4 shrink-0" />}{copied ? 'Copiado' : 'Compartir'}</button>
                        <button onClick={exportCatalog} disabled={exporting || !activeStore} className="inline-flex min-h-11 min-w-0 items-center justify-center gap-1.5 rounded-xl border border-[var(--border)] bg-[var(--bg)] px-2 py-2 text-xs font-bold text-[var(--text)] hover:bg-[var(--secondary)] disabled:opacity-50 sm:px-4 sm:text-sm"><ArrowDownToLine className="h-4 w-4 shrink-0" /><span className="sm:hidden">{exporting ? 'Creando…' : 'PDF'}</span><span className="hidden sm:inline">{exporting ? 'Preparando…' : 'Catálogo PDF'}</span></button>
                    </div>
                </div>
                {exportError && <p role="alert" className="mt-3 text-sm font-bold text-red-500">No se pudo generar el catálogo. Inténtalo de nuevo.</p>}
            </section>

            <section aria-label="Resumen de tu tienda" className="grid grid-cols-2 gap-3 xl:grid-cols-4">
                {cards.map(({ label, value, currency, detail, icon: Icon, tone, href }) => {
                    const content = <><div className="flex items-start justify-between gap-2"><span className={`inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg sm:h-10 sm:w-10 ${tone}`}><Icon className="h-4 w-4 sm:h-5 sm:w-5" /></span>{href ? <ArrowRight className="h-4 w-4 text-[var(--text)]/30" /> : currency && <span className="rounded-md bg-[var(--secondary)] px-1.5 py-1 text-[10px] font-bold text-[var(--text)]/55">{currency}</span>}</div><p className="mt-2 text-xs font-semibold text-[var(--text)]/60 sm:mt-3">{label}</p><p className="mt-1 break-words text-base font-black leading-tight tracking-tight text-[var(--text)] sm:text-2xl">{value}</p><p className="mt-1 text-[11px] leading-snug text-[var(--text)]/50 sm:text-xs">{detail}</p></>;
                    return href ? <Link href={href} key={label} className="relative min-w-0 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-3 transition duration-200 hover:z-10 hover:border-[var(--primary)]/40 hover:shadow-lg motion-safe:hover:-translate-y-1 motion-safe:hover:scale-[1.02] focus-visible:outline-2 focus-visible:outline-[var(--primary)] sm:p-5">{content}</Link> : <div key={label} className="relative min-w-0 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-3 transition duration-200 hover:z-10 hover:shadow-lg motion-safe:hover:-translate-y-1 motion-safe:hover:scale-[1.02] sm:p-5">{content}</div>;
                })}
            </section>

            <div className="grid gap-4 xl:grid-cols-3">
                <section className="min-w-0 rounded-3xl border border-[var(--border)] bg-[var(--surface)] xl:col-span-2">
                    <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[var(--border)] p-5 sm:p-6"><div><p className="text-[11px] font-bold uppercase tracking-widest text-[var(--primary)]">Tu rendimiento</p><h2 className="mt-1 text-lg font-black text-[var(--text)]">Ventas de la semana</h2><p className="mt-1 text-xs text-[var(--text)]/50">Total de pedidos completados durante los últimos 7 días.</p></div><span className="rounded-full bg-[var(--secondary)] px-3 py-1.5 text-xs font-bold text-[var(--text)]/60">Últimos 7 días</span></div>
                    <div className="h-56 sm:h-64"><SalesChart data={analytics} hideHeader country={country} /></div>
                </section>
                <section className="min-w-0 rounded-3xl border border-[var(--border)] bg-[var(--surface)]"><div className="border-b border-[var(--border)] p-5 sm:p-6"><p className="text-[11px] font-bold uppercase tracking-widest text-[var(--primary)]">Tu catálogo</p><h2 className="mt-1 text-lg font-black text-[var(--text)]">Más vendidos</h2><p className="mt-1 text-xs text-[var(--text)]/50">Unidades en pedidos completados.</p></div>
                    {topProducts.length ? <div className="space-y-5 p-5 sm:p-6">{topProducts.map((product, index) => <div key={`${product.name}-${index}`}><div className="flex items-center justify-between gap-3 text-sm"><span className="min-w-0 truncate font-bold text-[var(--text)]">{product.name}</span><span className="shrink-0 text-xs font-bold text-[var(--text)]/50">{product.quantity} uds.</span></div><div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[var(--secondary)]"><div className="h-full rounded-full bg-[var(--primary)]" style={{width: `${Math.min(100, Math.max(3, product.percentage))}%`}} /></div></div>)}</div> : <div className="p-8 text-center text-sm leading-relaxed text-[var(--text)]/50">Aquí verás tus productos más vendidos cuando completes pedidos.</div>}
                </section>
            </div>
            <section className="overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--surface)]"><div className="flex items-center justify-between gap-3 border-b border-[var(--border)] p-5 sm:p-6"><div><p className="text-[11px] font-bold uppercase tracking-widest text-[var(--primary)]">Actividad reciente</p><h2 className="mt-1 text-lg font-black text-[var(--text)]">Últimos pedidos</h2></div><Link href="/dashboard/orders" className="inline-flex shrink-0 items-center gap-1 text-xs font-bold text-[var(--primary)]">Ver pedidos <ArrowRight className="h-4 w-4" /></Link></div>
                {recentOrders.length ? <div className="divide-y divide-[var(--border)]">{recentOrders.map(order => <Link href={`/dashboard/orders?id=${order.id}`} key={order.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 transition hover:bg-[var(--secondary)]/40 sm:px-6"><div className="min-w-0"><p className="truncate text-sm font-bold text-[var(--text)]">{order.customerName}</p><p className="mt-1 text-xs text-[var(--text)]/50">#{order.id.slice(0, 8)} · {new Date(order.createdAt).toLocaleDateString('es-CO')}</p></div><div className="text-right"><p className="text-sm font-black text-[var(--text)]">{formatCurrency(Number(order.total), country)}</p><p className="mt-1 text-xs text-[var(--text)]/50">{order.status === 'COMPLETED' ? 'Completado' : order.status === 'PENDING' ? 'Pendiente' : order.status === 'CONFIRMED' ? 'Confirmado' : 'Cancelado'}</p></div></Link>)}</div> : <div className="p-8 text-center text-sm text-[var(--text)]/50">Cuando recibas pedidos, aparecerán aquí.</div>}
            </section>
            {activeStore?.slug && <Link href={`/${activeStore.slug}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm font-bold text-[var(--primary)] hover:underline">Visitar mi tienda <ExternalLink className="h-4 w-4" /></Link>}
        </div>
    );
}
