
'use client';

import {
    ShoppingCart,
    Loader2,
    CheckCircle2,
    XCircle,
    Clock,
    ExternalLink,
    Eye,
    X,
    Calendar,
    Hash,
    User,
    Phone,
    Package
} from 'lucide-react';
import { useStore } from '@/contexts/StoreContext';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { formatCurrency, cn } from '@/lib/utils';

export default function OrdersPage() {
    const { activeStore } = useStore();
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [updatingId, setUpdatingId] = useState<string | null>(null);
    const [loadingStatus, setLoadingStatus] = useState<string | null>(null);
    const [selectedOrder, setSelectedOrder] = useState<any>(null);

    const loadOrders = async () => {
        if (!activeStore) return;
        setLoading(true);
        try {
            const data = await api.getOrders(activeStore.id);
            setOrders(data);
        } catch (err) {
            console.error('Error loading orders:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadOrders();
    }, [activeStore]);

    const handleUpdateStatus = async (orderId: string, newStatus: string) => {
        setUpdatingId(orderId);
        setLoadingStatus(newStatus);
        try {
            await api.updateOrderStatus(orderId, newStatus);

            // Update orders list locally
            setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));

            // Update selected order if it's the one being modified
            if (selectedOrder?.id === orderId) {
                setSelectedOrder((prev: any) => ({ ...prev, status: newStatus }));
            }
        } catch (err: any) {
            alert(err.message || 'Error al actualizar el estado del pedido');
        } finally {
            setUpdatingId(null);
            setLoadingStatus(null);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
                <p className="text-gray-500 font-medium">Cargando pedidos...</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 pb-12">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-gray-900">Pedidos</h1>
                    <p className="text-gray-500 mt-1">Gestiona las ventas y estados de tus órdenes.</p>
                </div>
            </div>

            <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
                {orders.length === 0 ? (
                    <div className="p-20 text-center flex flex-col items-center justify-center gap-6">
                        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center text-gray-300">
                            <ShoppingCart className="w-10 h-10" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-gray-900">Aún no hay pedidos</h3>
                            <p className="text-gray-500 mt-1">Aquí aparecerán los pedidos que tus clientes hagan por WhatsApp.</p>
                        </div>
                    </div>
                ) : (
                    <div className="p-4 md:p-0">
                        {/* Desktop Table View */}
                        <div className="hidden md:block overflow-x-auto">
                            <table className="w-full text-left font-sans">
                                <thead>
                                    <tr className="bg-gray-50/50 text-gray-400 text-[10px] font-black uppercase tracking-widest border-b border-gray-50">
                                        <th className="px-8 py-5">Orden</th>
                                        <th className="px-8 py-5">Fecha</th>
                                        <th className="px-8 py-5">Cliente</th>
                                        <th className="px-8 py-5 text-right">Total</th>
                                        <th className="px-8 py-5">Estado</th>
                                        <th className="px-8 py-5 text-right">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50 uppercase">
                                    {orders.map((order) => (
                                        <tr key={order.id} className="hover:bg-gray-50/50 transition-colors group">
                                            <td className="px-8 py-6">
                                                <span className="font-black text-blue-600 text-sm">#{order.id.slice(0, 8)}</span>
                                            </td>
                                            <td className="px-8 py-6">
                                                <p className="text-xs font-bold text-gray-900">{new Date(order.createdAt).toLocaleDateString()}</p>
                                                <p className="text-[10px] text-gray-400 font-medium">{new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                            </td>
                                            <td className="px-8 py-6">
                                                <p className="font-bold text-gray-900 truncate max-w-[150px]">{order.customerName}</p>
                                            </td>
                                            <td className="px-8 py-6 text-right font-black text-gray-900">{formatCurrency(order.total)}</td>
                                            <td className="px-8 py-6">
                                                <span className={cn(
                                                    "px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider inline-flex items-center gap-2",
                                                    order.status === 'PENDING' && "bg-orange-100 text-orange-700",
                                                    order.status === 'COMPLETED' && "bg-green-100 text-green-700",
                                                    order.status === 'CANCELLED' && "bg-red-100 text-red-700"
                                                )}>
                                                    {order.status === 'PENDING' && <Clock className="w-3 h-3" />}
                                                    {order.status === 'COMPLETED' && <CheckCircle2 className="w-3 h-3" />}
                                                    {order.status === 'CANCELLED' && <XCircle className="w-3 h-3" />}
                                                    {order.status === 'PENDING' ? 'Pendiente' : order.status === 'COMPLETED' ? 'Completado' : 'Cancelado'}
                                                </span>
                                            </td>
                                            <td className="px-8 py-6 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => setSelectedOrder(order)}
                                                        className="p-2 bg-gray-50 text-gray-400 rounded-xl hover:bg-white hover:text-blue-600 hover:shadow-md transition-all active:scale-95 border border-transparent hover:border-blue-100"
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                    </button>
                                                    <a
                                                        href={`https://wa.me/${order.customerPhone.replace(/\D/g, '')}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="p-2 bg-green-50 text-green-600 rounded-xl hover:bg-green-600 hover:text-white transition-all active:scale-95"
                                                    >
                                                        <ExternalLink className="w-4 h-4" />
                                                    </a>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile Card View */}
                        <div className="md:hidden space-y-4 p-4">
                            {orders.map((order) => (
                                <div key={order.id} className="bg-white border border-gray-100 rounded-3xl p-6 space-y-4 shadow-sm active:scale-[0.98] transition-all" onClick={() => setSelectedOrder(order)}>
                                    <div className="flex justify-between items-start">
                                        <div className="space-y-1">
                                            <span className="font-black text-blue-600 text-[10px] uppercase tracking-widest">#{order.id.slice(0, 8)}</span>
                                            <p className="font-black text-gray-900 text-sm">{order.customerName}</p>
                                        </div>
                                        <span className={cn(
                                            "px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest inline-flex items-center gap-1.5",
                                            order.status === 'PENDING' && "bg-orange-100 text-orange-700",
                                            order.status === 'COMPLETED' && "bg-green-100 text-green-700",
                                            order.status === 'CANCELLED' && "bg-red-100 text-red-700"
                                        )}>
                                            {order.status === 'PENDING' ? 'Pendiente' : order.status === 'COMPLETED' ? 'Completado' : 'Cancelado'}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center pt-2">
                                        <div className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">
                                            {new Date(order.createdAt).toLocaleDateString()} • {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                        <div className="font-black text-gray-900 text-base">
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
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                        {/* Modal Header */}
                        <div className="p-8 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-blue-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-blue-100">
                                    <ShoppingCart className="w-6 h-6" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tight">Detalles del Pedido</h2>
                                    <p className="text-gray-400 font-bold text-xs uppercase tracking-widest mt-0.5">ID: #{selectedOrder.id.slice(0, 12)}</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setSelectedOrder(null)}
                                className="p-3 hover:bg-white rounded-2xl transition-all border border-transparent hover:border-gray-100 hover:shadow-sm"
                            >
                                <X className="w-6 h-6 text-gray-400" />
                            </button>
                        </div>

                        <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8 max-h-[60vh] overflow-y-auto custom-scrollbar">
                            {/* Left Column: Customer & Order Info */}
                            <div className="space-y-6">
                                <div className="space-y-4">
                                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600">Información del Cliente</h3>
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-3 bg-gray-50 p-4 rounded-2xl">
                                            <User className="w-4 h-4 text-gray-400" />
                                            <div>
                                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">Nombre</p>
                                                <p className="font-black text-gray-900">{selectedOrder.customerName}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 bg-gray-50 p-4 rounded-2xl">
                                            <Phone className="w-4 h-4 text-gray-400" />
                                            <div>
                                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">Teléfono</p>
                                                <p className="font-black text-gray-900">{selectedOrder.customerPhone}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-purple-600">Detalles de Envío</h3>
                                    <div className="flex items-center gap-3 bg-gray-50 p-4 rounded-2xl">
                                        <Calendar className="w-4 h-4 text-gray-400" />
                                        <div>
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">Fecha y Hora</p>
                                            <p className="font-black text-gray-900">{new Date(selectedOrder.createdAt).toLocaleString()}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Right Column: Items Summary */}
                            <div className="space-y-6">
                                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-600">Resumen de Productos</h3>
                                <div className="space-y-2 border border-gray-50 rounded-3xl p-4 bg-gray-50/30">
                                    {selectedOrder.items?.map((item: any, i: number) => (
                                        <div key={i} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-[10px] font-black text-gray-400 border border-gray-100">
                                                    {item.quantity}x
                                                </div>
                                                <p className="font-bold text-gray-900 text-sm">{item.productName || 'Producto'}</p>
                                            </div>
                                            <p className="font-black text-gray-900 text-sm">{formatCurrency(item.price * item.quantity)}</p>
                                        </div>
                                    ))}
                                    <div className="pt-4 flex justify-between items-center">
                                        <span className="text-sm font-black text-gray-400 uppercase">Total</span>
                                        <span className="text-2xl font-black text-blue-600">{formatCurrency(selectedOrder.total)}</span>
                                    </div>
                                </div>

                                {/* Status Controls */}
                                <div className="space-y-4 pt-4">
                                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 px-1">Estado del Pedido</h3>

                                    {selectedOrder.status === 'PENDING' ? (
                                        <div className="grid grid-cols-2 gap-3">
                                            <button
                                                disabled={updatingId === selectedOrder.id}
                                                onClick={() => handleUpdateStatus(selectedOrder.id, 'COMPLETED')}
                                                className="flex items-center justify-center gap-2 py-3.5 px-4 rounded-2xl font-black text-xs transition-all active:scale-95 shadow-sm bg-green-50 text-green-600 hover:bg-green-100 disabled:opacity-50"
                                            >
                                                {loadingStatus === 'COMPLETED' ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                                                Completar
                                            </button>
                                            <button
                                                disabled={updatingId === selectedOrder.id}
                                                onClick={() => handleUpdateStatus(selectedOrder.id, 'CANCELLED')}
                                                className="flex items-center justify-center gap-2 py-3.5 px-4 rounded-2xl font-black text-xs transition-all active:scale-95 shadow-sm bg-red-50 text-red-600 hover:bg-red-100 disabled:opacity-50"
                                            >
                                                {loadingStatus === 'CANCELLED' ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
                                                Cancelar
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            <div className={cn(
                                                "flex items-center justify-center gap-3 py-4 rounded-2xl font-black text-xs uppercase tracking-widest border-2",
                                                selectedOrder.status === 'COMPLETED' ? "bg-green-50 border-green-100 text-green-700" : "bg-red-50 border-red-100 text-red-700"
                                            )}>
                                                {selectedOrder.status === 'COMPLETED' ? <CheckCircle2 className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                                                {selectedOrder.status === 'COMPLETED' ? 'Pedido Completado' : 'Pedido Cancelado'}
                                            </div>

                                            <button
                                                disabled={updatingId === selectedOrder.id}
                                                onClick={() => handleUpdateStatus(selectedOrder.id, 'PENDING')}
                                                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-[10px] uppercase tracking-wider text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-all active:scale-95 border border-dashed border-gray-200 hover:border-blue-200"
                                            >
                                                {loadingStatus === 'PENDING' ? <Loader2 className="w-3 h-3 animate-spin" /> : <Clock className="w-3 h-3" />}
                                                Regresar a Pendiente (Deshacer)
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="p-8 bg-gray-50/50 border-t border-gray-100 flex items-center justify-between">
                            <button
                                onClick={() => setSelectedOrder(null)}
                                className="px-6 py-3 rounded-xl font-bold text-gray-400 hover:bg-white transition-all border border-transparent hover:border-gray-100"
                            >
                                Cerrar
                            </button>
                            <a
                                href={`https://wa.me/${selectedOrder.customerPhone.replace(/\D/g, '')}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 bg-[#25D366] text-white px-8 py-3 rounded-2xl font-black text-sm hover:scale-105 transition-all shadow-lg shadow-green-100"
                            >
                                <ExternalLink className="w-4 h-4" />
                                Hablar por WhatsApp
                            </a>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
