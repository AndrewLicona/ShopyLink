'use client';

import { useEffect, useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { Calendar, CheckCircle2, Clock, Loader2, MapPin, MessageCircle, Phone, PhoneCall, Search, ShoppingCart, User, X, XCircle } from 'lucide-react';
import { DateInput } from '@/components/ui/DateInput';
import { useOrders } from '@/hooks/useOrders';
import { cn, formatCurrency } from '@/lib/utils';
import { LoadingState } from '@/components/atoms/LoadingState';
import { StatusBadge } from '@/components/atoms/StatusBadge';
import type { Order } from '@/types/types';

type OrderStatus = Order['status'];
const tabs: { id: 'all' | OrderStatus; label: string }[] = [
    { id: 'all', label: 'Todos' }, { id: 'PENDING', label: 'Pendientes' },
    { id: 'CONFIRMED', label: 'Confirmados' }, { id: 'COMPLETED', label: 'Listos' },
    { id: 'CANCELLED', label: 'Cancelados' },
];
const badgeStatus: Record<OrderStatus, 'pending' | 'confirmed' | 'completed' | 'cancelled'> = {
    PENDING: 'pending', CONFIRMED: 'confirmed', COMPLETED: 'completed', CANCELLED: 'cancelled',
};
const statusLabel: Record<OrderStatus, string> = {
    PENDING: 'Pendiente', CONFIRMED: 'Confirmado', COMPLETED: 'Completado', CANCELLED: 'Cancelado',
};

export default function OrdersPage() {
    const { state, actions } = useOrders();
    const { orders, allOrders, loading, loadError, selectedOrder, updatingId, loadingStatus, searchTerm, statusFilter, dateFrom, dateTo, activeStore } = state;
    const { setSearchTerm, setStatusFilter, setSelectedOrder, setDateFrom, setDateTo, handleUpdateStatus } = actions;
    const [message, setMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null);
    const country = activeStore?.country;

    useEffect(() => {
        if (!selectedOrder) return;
        const close = (event: KeyboardEvent) => { if (event.key === 'Escape' && !updatingId) setSelectedOrder(null); };
        window.addEventListener('keydown', close);
        return () => window.removeEventListener('keydown', close);
    }, [selectedOrder, updatingId, setSelectedOrder]);

    const openOrder = (order: Order) => { setMessage(null); setSelectedOrder(order); };
    const changeStatus = async (status: OrderStatus) => {
        if (!selectedOrder) return;
        setMessage(null);
        const result = await handleUpdateStatus(selectedOrder.id, status);
        setMessage(result.success ? { type: 'success', text: `Pedido actualizado a ${statusLabel[status].toLowerCase()}.` } : { type: 'error', text: result.error || 'No se pudo actualizar el pedido.' });
    };

    if (loading) return <LoadingState message="Cargando pedidos..." fullPage />;
    if (loadError) return <div role="alert" className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-8 text-center"><h1 className="text-xl font-black text-[var(--text)]">No pudimos cargar los pedidos</h1><p className="mt-2 text-sm text-[var(--text)]/60">Comprueba tu conexión e inténtalo de nuevo.</p><button onClick={() => void actions.refreshOrders()} className="mt-5 rounded-xl bg-[var(--primary)] px-5 py-3 text-sm font-bold text-[var(--bg)]">Reintentar</button></div>;

    return (
        <div className="space-y-6 pb-20 md:space-y-8">
            <div><h1 className="text-2xl font-black text-[var(--text)] md:text-3xl">Pedidos</h1><p className="mt-1 text-sm text-[var(--text)]/55">Gestiona las ventas de tu tienda</p></div>
            <div className="space-y-3">
                <div className="relative"><Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text)]/40" /><input type="search" aria-label="Buscar pedidos" placeholder="Buscar cliente, teléfono, producto o ID..." className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] py-3.5 pl-11 pr-4 text-sm font-bold text-[var(--text)] outline-none focus:border-[var(--primary)]" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} /></div>
                <div aria-label="Filtrar por estado" className="grid grid-cols-2 gap-1 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-1 sm:grid-cols-5">{tabs.map(tab => {
                    const count = tab.id === 'all' ? allOrders.length : allOrders.filter(order => order.status === tab.id).length;
                    return <button type="button" key={tab.id} aria-pressed={statusFilter === tab.id} onClick={() => setStatusFilter(tab.id)} className={cn('flex min-h-10 min-w-0 items-center justify-center gap-1 rounded-xl px-1 py-2 text-[11px] font-bold transition-colors sm:text-xs', statusFilter === tab.id ? 'bg-[var(--primary)] text-[var(--bg)]' : 'text-[var(--text)]/55 hover:bg-[var(--secondary)]')}>{tab.label} <span className="opacity-70">{count}</span></button>;
                })}</div>
                <div className="flex flex-wrap items-end gap-3 rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3"><label className="min-w-[130px] flex-1 text-xs font-bold text-[var(--text)]/60 sm:flex-none">Desde<DateInput label="Desde" value={dateFrom} max={dateTo || undefined} onChange={setDateFrom} className="mt-1" /></label><label className="min-w-[130px] flex-1 text-xs font-bold text-[var(--text)]/60 sm:flex-none">Hasta<DateInput label="Hasta" value={dateTo} min={dateFrom || undefined} onChange={setDateTo} className="mt-1" /></label>{(dateFrom || dateTo) && <button type="button" onClick={() => { setDateFrom(''); setDateTo(''); }} className="min-h-10 text-xs font-bold text-[var(--primary)]">Limpiar fechas</button>}<span className="ml-auto text-xs text-[var(--text)]/50">{orders.length} {orders.length === 1 ? 'pedido' : 'pedidos'}</span></div>
            </div>
            <div className="overflow-hidden rounded-[2rem] border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow)]">
                {orders.length === 0 ? <div className="flex flex-col items-center justify-center gap-4 p-12 text-center md:p-20"><div className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--bg)] text-[var(--text)]/25"><ShoppingCart className="h-8 w-8" /></div><div><h2 className="text-lg font-bold text-[var(--text)]">No se encontraron pedidos</h2><p className="mt-1 text-sm text-[var(--text)]/50">{allOrders.length ? 'Prueba otros filtros o términos de búsqueda.' : 'Cuando recibas pedidos aparecerán aquí.'}</p></div></div> : <div className="grid grid-cols-1 gap-3 p-4 md:gap-4 md:p-6 lg:grid-cols-2">{orders.map(order => {
                    const quantity = order.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;
                    return <button type="button" key={order.id} onClick={() => openOrder(order)} className="group w-full rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-4 text-left shadow-sm transition-all hover:border-[var(--primary)]/40 hover:shadow-md focus-visible:outline-2 focus-visible:outline-[var(--primary)] sm:p-5"><div className="flex items-start justify-between gap-3"><div className="min-w-0"><span className="text-[10px] font-black uppercase tracking-widest text-[var(--primary)]">#{order.id.slice(0, 8)}</span><h2 className="mt-1 truncate text-base font-black text-[var(--text)]">{order.customerName}</h2></div><StatusBadge status={badgeStatus[order.status]} /></div><div className="mt-4 flex items-end justify-between gap-3 border-t border-dashed border-[var(--border)] pt-3"><div className="min-w-0 text-xs text-[var(--text)]/60"><p>{quantity} {quantity === 1 ? 'unidad' : 'unidades'} · {formatDistanceToNow(new Date(order.createdAt), { addSuffix: true, locale: es })}</p><p className="mt-1">{new Date(order.createdAt).toLocaleString('es-CO', { dateStyle: 'medium', timeStyle: 'short' })}</p></div><p className="shrink-0 text-right text-base font-black text-[var(--text)] sm:text-lg">{formatCurrency(order.total, country)}</p></div></button>;
                })}</div>}
            </div>

            {selectedOrder && <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/40 backdrop-blur-sm sm:p-4"><div role="dialog" aria-modal="true" aria-labelledby="order-detail-title" className="flex h-full w-full max-w-5xl flex-col overflow-hidden bg-[var(--surface)] shadow-[var(--shadow-strong)] sm:h-auto sm:max-h-[90vh] sm:rounded-[2.5rem]">
                <div className="flex shrink-0 items-center justify-between gap-3 border-b border-[var(--border)] bg-[var(--bg)]/30 p-4 sm:p-6"><div className="min-w-0"><h2 id="order-detail-title" className="text-xl font-black text-[var(--text)]">Detalles del pedido</h2><p className="mt-1 text-xs font-bold text-[var(--text)]/50">#{selectedOrder.id.slice(0, 12)} · {new Date(selectedOrder.createdAt).toLocaleString('es-CO', { dateStyle: 'medium', timeStyle: 'short' })}</p></div><button type="button" onClick={() => setSelectedOrder(null)} aria-label="Cerrar detalles del pedido" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-[var(--text)]/50 hover:bg-[var(--secondary)]"><X className="h-5 w-5" /></button></div>
                <div className="grid flex-1 grid-cols-1 gap-6 overflow-y-auto p-4 sm:p-6 md:grid-cols-2 md:gap-8">
                    <div className="space-y-5"><section className="space-y-3"><h3 className="text-xs font-black uppercase tracking-widest text-[var(--primary)]">Cliente</h3><div className="flex items-start gap-3 rounded-2xl bg-[var(--secondary)]/30 p-4"><User className="mt-0.5 h-4 w-4 shrink-0 text-[var(--text)]/40" /><div className="min-w-0"><p className="text-xs text-[var(--text)]/50">Nombre</p><p className="break-words font-bold text-[var(--text)]">{selectedOrder.customerName}</p></div></div>
                        {selectedOrder.customerPhone && <div className="rounded-2xl bg-[var(--secondary)]/30 p-4"><div className="flex items-start gap-3"><Phone className="mt-0.5 h-4 w-4 shrink-0 text-[var(--text)]/40" /><div className="min-w-0"><p className="text-xs text-[var(--text)]/50">Teléfono</p><p className="break-all font-bold text-[var(--text)]">{selectedOrder.customerPhone}</p></div></div><div className="mt-3 grid grid-cols-2 gap-2"><a href={`tel:${selectedOrder.customerPhone}`} aria-label={`Llamar a ${selectedOrder.customerName}`} className="flex min-h-10 items-center justify-center gap-2 rounded-xl bg-[var(--primary)]/10 px-2 text-xs font-bold text-[var(--primary)]"><PhoneCall className="h-4 w-4" /> Llamar</a><a href={`https://wa.me/${selectedOrder.customerPhone.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" aria-label={`Escribir a ${selectedOrder.customerName} por WhatsApp`} className="flex min-h-10 items-center justify-center gap-2 rounded-xl bg-green-500/10 px-2 text-xs font-bold text-green-600"><MessageCircle className="h-4 w-4" /> WhatsApp</a></div></div>}
                    </section><section className="space-y-3"><h3 className="text-xs font-black uppercase tracking-widest text-[var(--primary)]">Entrega</h3><div className="flex items-start gap-3 rounded-2xl bg-[var(--secondary)]/30 p-4"><MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[var(--text)]/40" /><div className="min-w-0"><p className="text-xs text-[var(--text)]/50">Dirección</p><p className="break-words text-sm font-bold text-[var(--text)]">{selectedOrder.customerAddress || 'No indicada'}</p></div></div><div className="flex items-start gap-3 rounded-2xl bg-[var(--secondary)]/30 p-4"><Calendar className="mt-0.5 h-4 w-4 shrink-0 text-[var(--text)]/40" /><div><p className="text-xs text-[var(--text)]/50">Fecha del pedido</p><p className="text-sm font-bold text-[var(--text)]">{new Date(selectedOrder.createdAt).toLocaleString('es-CO', { dateStyle: 'medium', timeStyle: 'short' })}</p></div></div></section></div>
                    <div className="space-y-5"><section className="space-y-3"><h3 className="text-xs font-black uppercase tracking-widest text-[var(--primary)]">Productos</h3><div className="rounded-2xl border border-[var(--border)] bg-[var(--bg)]/30 p-4"><div className="divide-y divide-[var(--border)]">{selectedOrder.items?.map((item, index) => <div key={item.id || index} className="flex items-start justify-between gap-3 py-3 first:pt-0"><div className="min-w-0"><p className="break-words text-sm font-bold text-[var(--text)]">{item.quantity} × {item.productName || 'Producto'}</p>{item.variantName && <p className="mt-1 break-words text-xs text-[var(--text)]/60">Variante: {item.variantName}</p>}{item.sku && <p className="mt-1 break-all text-xs text-[var(--text)]/45">SKU: {item.sku}</p>}</div><p className="shrink-0 text-sm font-black text-[var(--text)]">{formatCurrency(Number(item.price) * item.quantity, country)}</p></div>)}</div><div className="flex items-center justify-between gap-3 border-t border-[var(--border)] pt-4"><span className="text-sm font-bold text-[var(--text)]/55">Total</span><span className="text-xl font-black text-[var(--primary)]">{formatCurrency(selectedOrder.total, country)}</span></div></div></section>
                        <section className="space-y-3"><div className="flex items-center justify-between gap-3"><h3 className="text-xs font-black uppercase tracking-widest text-[var(--text)]/50">Estado del pedido</h3><StatusBadge status={badgeStatus[selectedOrder.status]} /></div>
                            {(selectedOrder.status === 'PENDING' || selectedOrder.status === 'CONFIRMED') ? <><p className="text-xs leading-relaxed text-[var(--text)]/55">Al completar el pedido, se descuenta el inventario de los productos que lo controlan.</p><div className="grid grid-cols-2 gap-2"><button disabled={!!updatingId} onClick={() => void changeStatus('COMPLETED')} className="flex min-h-11 items-center justify-center gap-2 rounded-xl bg-green-500/10 px-2 text-xs font-bold text-green-600 disabled:opacity-50">{loadingStatus === 'COMPLETED' ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />} Completar</button><button disabled={!!updatingId} onClick={() => void changeStatus('CANCELLED')} className="flex min-h-11 items-center justify-center gap-2 rounded-xl bg-red-500/10 px-2 text-xs font-bold text-red-600 disabled:opacity-50">{loadingStatus === 'CANCELLED' ? <Loader2 className="h-4 w-4 animate-spin" /> : <XCircle className="h-4 w-4" />} Cancelar</button></div></> : <><p className="text-xs leading-relaxed text-[var(--text)]/55">{selectedOrder.status === 'COMPLETED' ? 'Al regresar a pendiente, el sistema intentará restablecer el inventario descontado.' : 'Puedes regresar este pedido a pendiente para gestionarlo de nuevo.'}</p><button disabled={!!updatingId} onClick={() => void changeStatus('PENDING')} className="flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-dashed border-[var(--border)] text-xs font-bold text-[var(--text)]/60 hover:text-[var(--primary)] disabled:opacity-50">{loadingStatus === 'PENDING' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Clock className="h-4 w-4" />} Regresar a pendiente</button></>}
                            {message && <p role={message.type === 'error' ? 'alert' : 'status'} className={cn('rounded-xl p-3 text-xs font-bold', message.type === 'error' ? 'bg-red-500/10 text-red-600' : 'bg-green-500/10 text-green-700')}>{message.text}</p>}
                        </section>
                    </div>
                </div>
                <div className="shrink-0 border-t border-[var(--border)] bg-[var(--bg)]/30 p-4 sm:p-5"><button onClick={() => setSelectedOrder(null)} className="min-h-11 rounded-xl px-5 text-sm font-bold text-[var(--text)]/60 hover:bg-[var(--secondary)]">Cerrar</button></div>
            </div></div>}
        </div>
    );
}
