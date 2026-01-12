'use client';

import {
    TrendingUp,
    Clock,
    AlertCircle,
    Plus,
    MoreVertical,
    ShoppingBag,
    Loader2
} from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { formatCurrency } from '@/lib/utils';
import { useStore } from '@/contexts/StoreContext';

export default function DashboardPage() {
    const { activeStore } = useStore();
    const [stats, setStats] = useState<any[]>([]);
    const [recentOrders, setRecentOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const storeName = activeStore?.name || 'Tu Tienda';

    useEffect(() => {
        const loadDashboardData = async () => {
            if (!activeStore) return;

            setLoading(true);
            try {
                // Fetch products/orders for the specific active store
                const [products, orders] = await Promise.all([
                    api.getProducts(activeStore.id),
                    api.getOrders(activeStore.id)
                ]);

                setRecentOrders(orders.slice(0, 5));

                setStats([
                    {
                        label: 'Ventas Totales',
                        value: formatCurrency(orders.filter((o: any) => o.status === 'COMPLETED').reduce((acc: number, o: any) => acc + Number(o.total), 0)),
                        change: 'Consolidado',
                        icon: TrendingUp,
                        color: 'text-blue-600',
                        bg: 'bg-blue-50'
                    },
                    {
                        label: 'Pedidos Pendientes',
                        value: orders.filter((o: any) => o.status === 'PENDING').length.toString(),
                        change: 'Actualizado',
                        icon: Clock,
                        color: 'text-orange-600',
                        bg: 'bg-orange-50'
                    },
                    {
                        label: 'Productos Activos',
                        value: products.length.toString(),
                        change: 'En catálogo',
                        icon: ShoppingBag,
                        color: 'text-purple-600',
                        bg: 'bg-purple-50'
                    },
                ]);
            } catch (err) {
                console.error('Error loading dashboard:', err);
            } finally {
                setLoading(false);
            }
        };

        loadDashboardData();
    }, [activeStore]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
                <p className="text-gray-500 font-medium">Cargando tus datos...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 md:space-y-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-2">
                <div>
                    <h1 className="text-2xl md:text-3xl font-black text-gray-900 leading-tight">
                        Bienvenido, <span className="text-blue-600">{storeName}</span>
                    </h1>
                    <p className="text-gray-500 mt-1 text-sm md:text-base">Resumen de actividad de hoy.</p>
                </div>
                <Link
                    href="/dashboard/products?action=new"
                    className="w-full md:w-auto inline-flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-4 md:py-3 rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 active:scale-95"
                >
                    <Plus className="w-5 h-5" />
                    Nuevo Producto
                </Link>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {stats.map((stat, i) => {
                    const Icon = stat.icon;
                    return (
                        <div key={i} className="bg-white p-5 md:p-6 rounded-[2rem] shadow-sm border border-gray-100 hover:shadow-xl hover:shadow-gray-200/50 transition-all group">
                            <div className="flex items-center justify-between mb-3 md:mb-4">
                                <div className={cn(stat.bg, "p-3 md:p-4 rounded-2xl group-hover:scale-110 transition-transform")}>
                                    <Icon className={cn("w-5 h-5 md:w-6 md:h-6", stat.color)} />
                                </div>
                                <span className={cn("text-[10px] md:text-xs font-black uppercase tracking-wider", stat.color)}>
                                    {stat.change}
                                </span>
                            </div>
                            <div>
                                <p className="text-[10px] md:text-sm font-bold text-gray-400 uppercase tracking-widest leading-none">{stat.label}</p>
                                <p className="text-2xl md:text-3xl font-black text-gray-900 mt-1.5 md:mt-1">{stat.value}</p>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Recent Orders Section */}
            <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 md:p-8 border-b border-gray-50 flex items-center justify-between">
                    <h3 className="text-xl font-black text-gray-900">Ventas Recientes</h3>
                    <button className="text-sm font-black text-blue-600 hover:text-blue-700">Ver historial</button>
                </div>

                {recentOrders.length === 0 ? (
                    <div className="p-12 text-center flex flex-col items-center justify-center gap-4">
                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center text-gray-300">
                            <ShoppingBag className="w-8 h-8" />
                        </div>
                        <p className="text-gray-500 font-medium">Aún no tienes pedidos registrados.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="hidden md:table-header-group">
                                <tr className="bg-gray-50/50 text-gray-400 text-xs font-black uppercase tracking-widest">
                                    <th className="px-8 py-4">Orden</th>
                                    <th className="px-8 py-4">Cliente</th>
                                    <th className="px-8 py-4 text-right">Total</th>
                                    <th className="px-8 py-4">Estado</th>
                                    <th className="px-8 py-4"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {recentOrders.map((order, i) => (
                                    <tr key={i} className="hover:bg-gray-50/30 transition-colors group flex flex-col md:table-row p-6 md:p-0">
                                        <td className="md:px-8 md:py-5 font-black text-blue-600 text-sm md:text-base">
                                            #{order.id.slice(0, 8)}
                                        </td>
                                        <td className="mt-1 md:mt-0 md:px-8 md:py-5 text-gray-900 font-bold">
                                            {order.customerName}
                                            <div className="md:hidden text-xs text-gray-400 font-medium">{new Date(order.createdAt).toLocaleDateString()}</div>
                                        </td>
                                        <td className="mt-2 md:mt-0 md:px-8 md:py-5 text-gray-900 font-black text-lg md:text-base md:text-right">
                                            ${Number(order.total).toFixed(2)}
                                        </td>
                                        <td className="mt-4 md:mt-0 md:px-8 md:py-5">
                                            <span className={cn(
                                                "px-4 py-2 md:py-1 rounded-xl text-[10px] md:text-xs font-black uppercase tracking-wider inline-flex",
                                                order.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                                                    order.status === 'PENDING' ? 'bg-orange-100 text-orange-700' :
                                                        'bg-red-100 text-red-700'
                                            )}>
                                                {order.status}
                                            </span>
                                        </td>
                                        <td className="hidden md:table-cell px-8 py-5 text-right">
                                            <button className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-400">
                                                <MoreVertical className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}

function cn(...inputs: any[]) {
    return inputs.filter(Boolean).join(' ');
}
