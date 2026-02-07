'use client';

import {
    CheckCircle2,
    XCircle,
    Clock,
    Loader2,
    X,
    Calendar,
    User,
    ShoppingCart,
    Search
} from 'lucide-react';
import { useOrders } from '@/hooks/useOrders';
import { cn, formatCurrency } from '@/lib/utils';
import { LoadingState } from '@/components/atoms/LoadingState';
import { SectionHeader } from '@/components/molecules/SectionHeader';
import { Button } from '@/components/atoms/Button';
import { StatusBadge } from '@/components/atoms/StatusBadge';
import Link from 'next/link';
import type { Order } from '@/types/types';

export default function OrdersPage() {
    const { state, actions } = useOrders();
    const { orders, loading, selectedOrder, updatingId, loadingStatus, searchTerm, statusFilter } = state;
    const { setSearchTerm, setStatusFilter, setSelectedOrder, handleUpdateStatus } = actions;

    if (loading) {
        return <LoadingState message="Cargando pedidos..." fullPage />;
    }

    return (
        <div className="space-y-6 md:space-y-10 pb-20">
            {/* Header */}
            <SectionHeader
                title="Pedidos"
                description="Gestiona las ventas de tu tienda"
            >
                <Link href="/dashboard" className="hidden md:block">
                    <Button variant="secondary">
                        Ir al Inicio
                    </Button>
                </Link>
            </SectionHeader>

            {/* Filters bar */}
            <div className="flex flex-col gap-3 md:gap-4">
                <div className="relative group">
                    <Search className="absolute left-4 md:left-5 top-1/2 -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-[var(--text)]/20 group-focus-within:text-[var(--primary)] transition-colors" />
                    <input
                        type="text"
                        placeholder="Buscar por cliente o ID..."
                        className="w-full pl-11 md:pl-14 pr-6 py-3 md:py-4 rounded-xl md:rounded-2xl bg-[var(--surface)] border border-[var(--border)] focus:border-[var(--primary)] outline-none transition-all font-bold text-sm md:text-base text-[var(--text)] shadow-sm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="bg-[var(--surface)] border border-[var(--border)] p-1 rounded-xl md:rounded-2xl flex w-full h-[50px] md:h-[60px] items-stretch">
                    {([
                        { id: 'all', label: 'Todos' },
                        { id: 'PENDING', label: 'Pendientes' },
                        { id: 'COMPLETED', label: 'Listos' },
                        { id: 'CANCELLED', label: 'Canc.' }
                    ] as const).map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setStatusFilter(tab.id)}
                            className={cn(
                                "flex-1 px-4 md:px-6 rounded-lg md:rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center",
                                statusFilter === tab.id ? "bg-[var(--text)] text-white shadow-lg" : "text-[var(--text)]/40 hover:text-[var(--text)]"
                            )}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="bg-[var(--surface)] rounded-[2rem] md:rounded-[2.5rem] shadow-[var(--shadow)] border border-[var(--border)] overflow-hidden">
                {orders.length === 0 ? (
                    <div className="p-12 md:p-20 text-center flex flex-col items-center justify-center gap-6">
                        <div className="w-16 h-16 md:w-20 md:h-20 bg-[var(--bg)] rounded-full flex items-center justify-center text-[var(--text)]/20">
                            <ShoppingCart className="w-8 h-8 md:w-10 md:h-10" />
                        </div>
                        <div>
                            <h3 className="text-lg md:text-xl font-bold text-[var(--text)]">No se encontraron pedidos</h3>
                            <p className="text-sm text-[var(--text)]/40 mt-1">Intenta con otros filtros o términos de búsqueda.</p>
                        </div>
                    </div>
                ) : (
                    <div className="p-2 md:p-0">
                        {/* Desktop Table View */}
                        <div className="hidden md:block overflow-x-auto">
                            <table className="w-full text-left font-sans">
                                <thead>
                                    <tr className="bg-[var(--bg)] text-[var(--text)]/60 text-[10px] font-black uppercase tracking-widest border-b border-[var(--border)]">
                                        <th className="px-8 py-5">Orden</th>
                                        <th className="px-8 py-5">Fecha</th>
                                        <th className="px-8 py-5">Cliente</th>
                                        <th className="px-8 py-5 text-right">Total</th>
                                        <th className="px-8 py-5 text-center">Estado</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[var(--border)]">
                                    {orders.map((order: Order) => (
                                        <tr
                                            key={order.id}
                                            className="hover:bg-[var(--secondary)]/50 transition-colors group cursor-pointer"
                                            onClick={() => setSelectedOrder(order)}
                                        >
                                            <td className="px-8 py-6">
                                                <span className="font-black text-[var(--primary)] text-sm uppercase">#{order.id.slice(0, 8)}</span>
                                            </td>
                                            <td className="px-8 py-6">
                                                <p className="text-xs font-bold text-[var(--text)]">{new Date(order.createdAt).toLocaleDateString()}</p>
                                                <p className="text-[10px] text-[var(--text)]/40 font-medium uppercase">{new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                            </td>
                                            <td className="px-8 py-6">
                                                <p className="font-bold text-[var(--text)] truncate max-w-[150px]">{order.customerName}</p>
                                            </td>
                                            <td className="px-8 py-6 text-right font-black text-[var(--text)]">{formatCurrency(order.total)}</td>
                                            <td className="px-8 py-6 text-center">
                                                <StatusBadge status={order.status.toLowerCase() as any} />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile Card View */}
                        <div className="md:hidden space-y-2 p-2">
                            {orders.map((order: Order) => (
                                <div
                                    key={order.id}
                                    className="bg-[var(--surface)] border border-[var(--border)] rounded-[1.5rem] p-4 space-y-3 shadow-sm active:scale-[0.98] transition-all cursor-pointer"
                                    onClick={() => setSelectedOrder(order)}
                                >
                                    <div className="flex justify-between items-start">
                                        <div className="space-y-0.5 min-w-0 flex-1">
                                            <span className="font-black text-[var(--primary)] text-[8px] uppercase tracking-widest">#{order.id.slice(0, 8)}</span>
                                            <p className="font-black text-[var(--text)] text-sm leading-tight truncate">{order.customerName}</p>
                                        </div>
                                        <StatusBadge status={order.status.toLowerCase() as any} className="scale-75 origin-top-right shrink-0" />
                                    </div>
                                    <div className="flex justify-between items-end">
                                        <div className="text-[9px] text-[var(--text)]/40 font-bold uppercase tracking-tight">
                                            {new Date(order.createdAt).toLocaleDateString()} • {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                        <div className="font-black text-[var(--text)] text-base">
                                            {formatCurrency(order.total)}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Order Details Modal */}
            {selectedOrder && (
                <div className="fixed inset-0 z-[150] flex items-center justify-center sm:p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-[var(--surface)] w-full h-full sm:h-[90vh] sm:w-[95vw] max-w-5xl sm:rounded-[2.5rem] shadow-[var(--shadow-strong)] overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col">
                        {/* Modal Header */}
                        <div className="p-6 md:p-8 border-b border-[var(--border)] flex items-center justify-between bg-[var(--bg)]/30 shrink-0">
                            <div className="flex items-center gap-3 md:gap-4">
                                <div className="w-10 h-10 md:w-12 md:h-12 bg-[var(--primary)] text-[var(--bg)] rounded-xl md:rounded-2xl flex items-center justify-center shadow-[var(--shadow)]">
                                    <ShoppingCart className="w-5 h-5 md:w-6 md:h-6" />
                                </div>
                                <div>
                                    <h2 className="text-xl md:text-2xl font-black text-[var(--text)] uppercase tracking-tight">Detalles del Pedido</h2>
                                    <p className="text-[var(--text)]/30 font-bold text-[10px] md:text-xs uppercase tracking-widest mt-0.5">ID: #{selectedOrder.id.slice(0, 12)}</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setSelectedOrder(null)}
                                className="p-2 md:p-3 hover:bg-[var(--secondary)] rounded-xl md:rounded-2xl transition-all border border-transparent hover:border-[var(--border)]"
                            >
                                <X className="w-5 h-5 md:w-6 md:h-6 text-[var(--text)]/30" />
                            </button>
                        </div>

                        <div className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 flex-1 overflow-y-auto custom-scrollbar">
                            {/* Left Column: Customer & Order Info */}
                            <div className="space-y-6">
                                <div className="space-y-4">
                                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--primary)]">Información del Cliente</h3>
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-3 bg-[var(--secondary)]/30 p-4 rounded-2xl">
                                            <User className="w-4 h-4 text-[var(--text)]/30" />
                                            <div>
                                                <p className="text-[10px] font-black text-[var(--text)]/30 uppercase tracking-tighter">Nombre</p>
                                                <p className="font-black text-[var(--text)]">{selectedOrder.customerName}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--primary)] opacity-70">Detalles de Envío</h3>
                                    <div className="flex items-center gap-3 bg-[var(--secondary)]/30 p-4 rounded-2xl">
                                        <Calendar className="w-4 h-4 text-[var(--text)]/30" />
                                        <div>
                                            <p className="text-[10px] font-black text-[var(--text)]/30 uppercase tracking-tighter">Fecha y Hora</p>
                                            <p className="font-black text-[var(--text)]">{new Date(selectedOrder.createdAt).toLocaleString()}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Right Column: Items Summary */}
                            <div className="space-y-6">
                                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--primary)] opacity-80">Resumen de Productos</h3>
                                <div className="space-y-2 border border-[var(--border)] rounded-3xl p-4 bg-[var(--bg)]/30">
                                    {selectedOrder.items?.map((item: { quantity: number; productName: string; price: number }, i: number) => (
                                        <div key={i} className="flex items-center justify-between py-2 border-b border-[var(--border)] last:border-0">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 bg-[var(--surface)] rounded-lg flex items-center justify-center text-[10px] font-black text-[var(--text)]/30 border border-[var(--border)]">
                                                    {item.quantity}x
                                                </div>
                                                <p className="font-bold text-[var(--text)] text-sm">{item.productName || 'Producto'}</p>
                                            </div>
                                            <p className="font-black text-[var(--text)] text-sm">{formatCurrency(item.price * item.quantity)}</p>
                                        </div>
                                    ))}
                                    <div className="pt-4 flex justify-between items-center">
                                        <span className="text-sm font-black text-[var(--text)]/30 uppercase">Total</span>
                                        <span className="text-2xl font-black text-[var(--primary)]">{formatCurrency(selectedOrder.total)}</span>
                                    </div>
                                </div>

                                {/* Status Controls */}
                                <div className="space-y-4 pt-4">
                                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text)]/20 px-1">Estado del Pedido</h3>

                                    {selectedOrder.status === 'PENDING' ? (
                                        <div className="grid grid-cols-2 gap-3">
                                            <button
                                                disabled={updatingId === selectedOrder.id}
                                                onClick={() => handleUpdateStatus(selectedOrder.id, 'COMPLETED')}
                                                className="flex items-center justify-center gap-2 py-3.5 px-4 rounded-2xl font-black text-xs transition-all active:scale-95 shadow-[var(--shadow)] bg-green-500/10 text-green-600 hover:bg-green-500/20 disabled:opacity-50"
                                            >
                                                {loadingStatus === 'COMPLETED' ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                                                Completar
                                            </button>
                                            <button
                                                disabled={updatingId === selectedOrder.id}
                                                onClick={() => handleUpdateStatus(selectedOrder.id, 'CANCELLED')}
                                                className="flex items-center justify-center gap-2 py-3.5 px-4 rounded-2xl font-black text-xs transition-all active:scale-95 shadow-[var(--shadow)] bg-red-500/10 text-red-600 hover:bg-red-500/20 disabled:opacity-50"
                                            >
                                                {loadingStatus === 'CANCELLED' ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
                                                Cancelar
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            <div className={cn(
                                                "flex items-center justify-center gap-3 py-4 rounded-2xl font-black text-xs uppercase tracking-widest border-2",
                                                selectedOrder.status === 'COMPLETED' ? "bg-green-500/10 border-green-500/20 text-green-700" : "bg-red-500/10 border-red-500/20 text-red-700"
                                            )}>
                                                {selectedOrder.status === 'COMPLETED' ? <CheckCircle2 className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                                                {selectedOrder.status === 'COMPLETED' ? 'Pedido Completado' : 'Pedido Cancelado'}
                                            </div>

                                            <button
                                                disabled={updatingId === selectedOrder.id}
                                                onClick={() => handleUpdateStatus(selectedOrder.id, 'PENDING')}
                                                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-[10px] uppercase tracking-wider text-[var(--text)]/30 hover:text-[var(--primary)] hover:bg-[var(--primary)]/10 transition-all active:scale-95 border border-dashed border-[var(--border)]"
                                            >
                                                {loadingStatus === 'PENDING' ? <Loader2 className="w-3 h-3 animate-spin" /> : <Clock className="w-3 h-3" />}
                                                Regresar a Pendiente
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="p-6 md:p-8 bg-[var(--bg)]/30 border-t border-[var(--border)] flex items-center justify-between shrink-0">
                            <button
                                onClick={() => setSelectedOrder(null)}
                                className="px-6 py-3 rounded-xl font-bold text-[var(--text)]/30 hover:bg-[var(--surface)] transition-all border border-transparent hover:border-[var(--border)]"
                            >
                                Cerrar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}




