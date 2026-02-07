'use client';

import {
    Plus,
    ShoppingBag,
    Share2,
    Check,
    DollarSign,
    Package
} from 'lucide-react';
import Link from 'next/link';
import { formatCurrency, cn } from '@/lib/utils';
import { useDashboard } from '@/hooks/useDashboard';
import { LoadingState } from '@/components/atoms/LoadingState';
import { SectionHeader } from '@/components/molecules/SectionHeader';
import { StatCard } from '@/components/molecules/StatCard';
import { Button } from '@/components/atoms/Button';

export default function DashboardPage() {
    const { state, actions } = useDashboard();
    const { stats, recentOrders, loading, copied, storeName } = state;

    if (loading) {
        return <LoadingState message="Cargando tus datos..." fullPage />;
    }

    return (
        <div className="space-y-6 md:space-y-10">
            {/* Header */}
            <SectionHeader
                title={storeName}
                description="Resumen de actividad de hoy."
            >
                {/* Mobile actions are handled inside SectionHeader */}
                <Link href="/dashboard/products?action=new">
                    <Button variant="primary" size="md" className="p-3 rounded-2xl">
                        <Plus className="w-6 h-6" />
                    </Button>
                </Link>

                <Button
                    variant="secondary"
                    onClick={actions.handleShare}
                    className="p-3 md:p-3.5 rounded-2xl"
                    aria-label="Compartir tienda"
                >
                    {copied ? <Check className="w-5 h-5 text-green-500" /> : <Share2 className="w-5 h-5 text-[var(--text)]/60" />}
                </Button>
                <Link href="/dashboard/products?action=new" className="hidden md:block">
                    <Button leftIcon={<Plus className="w-5 h-5" />}>
                        Nuevo Producto
                    </Button>
                </Link>
            </SectionHeader>

            {/* Stats Grid - Pill Format */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-5">
                <StatCard
                    icon={DollarSign}
                    label="Ventas Hoy"
                    value={formatCurrency(stats.todaySales)}
                    color="primary"
                />
                <StatCard
                    icon={ShoppingBag}
                    label="Pedidos Pend."
                    value={stats.pendingOrders}
                    color="orange"
                />
                <StatCard
                    icon={Package}
                    label="Productos"
                    value={stats.totalProducts}
                    color="green"
                />
                <StatCard
                    icon={DollarSign}
                    label="Ventas Totales"
                    value={formatCurrency(stats.totalSales || 0)}
                    color="red"
                />
            </div>

            {/* Recent Orders Section */}
            <div className="bg-[var(--surface)] rounded-[2.5rem] shadow-[var(--shadow)] border border-[var(--border)] overflow-hidden">
                <div className="p-6 md:p-8 border-b border-[var(--border)] flex items-center justify-between">
                    <h3 className="text-xl font-black text-[var(--text)]">Ventas Recientes</h3>
                    <Link
                        href="/dashboard/orders"
                        className="text-sm font-black text-[var(--primary)] hover:opacity-80 hover:bg-[var(--primary)]/10 px-4 py-2 rounded-xl transition-all"
                    >
                        Ver historial
                    </Link>
                </div>

                {recentOrders.length === 0 ? (
                    <div className="p-12 text-center flex flex-col items-center justify-center gap-4">
                        <div className="w-16 h-16 bg-[var(--bg)] rounded-full flex items-center justify-center text-[var(--text)]/20">
                            <ShoppingBag className="w-8 h-8" />
                        </div>
                        <p className="text-[var(--text)]/40 font-medium">Aún no tienes pedidos registrados.</p>
                    </div>
                ) : (
                    <div className="overflow-hidden">
                        {/* Desktop Table */}
                        <div className="hidden md:block">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="bg-[var(--bg)] text-[var(--text)]/60 text-[10px] font-black uppercase tracking-widest border-b border-[var(--border)]">
                                        <th className="px-8 py-5">Orden</th>
                                        <th className="px-8 py-5">Cliente</th>
                                        <th className="px-8 py-5 text-right">Total</th>
                                        <th className="px-8 py-5">Estado</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[var(--border)] uppercase">
                                    {recentOrders.map((order, i) => (
                                        <tr key={i} className="hover:bg-[var(--secondary)] transition-colors group">
                                            <td className="px-8 py-5 font-black text-[var(--primary)] text-sm">
                                                #{order.id.slice(0, 8)}
                                            </td>
                                            <td className="px-8 py-5">
                                                <p className="text-[var(--text)] font-bold">{order.customerName}</p>
                                                <p className="text-[10px] text-[var(--text)]/40 font-medium">{new Date(order.createdAt).toLocaleDateString()}</p>
                                            </td>
                                            <td className="px-8 py-5 text-[var(--text)] font-black text-right">
                                                {formatCurrency(order.total)}
                                            </td>
                                            <td className="px-8 py-5">
                                                <span className={cn(
                                                    "px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider inline-flex",
                                                    order.status === 'COMPLETED' ? 'bg-green-500/10 text-green-600' :
                                                        order.status === 'PENDING' ? 'bg-orange-500/10 text-orange-600' :
                                                            'bg-red-500/10 text-red-600'
                                                )}>
                                                    {order.status === 'COMPLETED' ? 'Completado' : order.status === 'PENDING' ? 'Pendiente' : 'Cancelado'}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile List View */}
                        <div className="md:hidden divide-y divide-[var(--border)]">
                            {recentOrders.map((order, i) => (
                                <div key={i} className="p-4 space-y-2 active:bg-[var(--secondary)]/50 transition-colors">
                                    <div className="flex justify-between items-start">
                                        <div className="space-y-0.5">
                                            <span className="text-[8px] font-black text-[var(--primary)] uppercase tracking-widest">#{order.id.slice(0, 8)}</span>
                                            <p className="text-sm font-bold text-[var(--text)] leading-tight">{order.customerName}</p>
                                        </div>
                                        <span className={cn(
                                            "px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-wider",
                                            order.status === 'COMPLETED' ? 'bg-green-500/10 text-green-600' :
                                                order.status === 'PENDING' ? 'bg-orange-500/10 text-orange-600' :
                                                    'bg-red-500/10 text-red-600'
                                        )}>
                                            {order.status === 'COMPLETED' ? 'Hecho' : order.status === 'PENDING' ? 'Pend' : 'Canc'}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-[9px] text-[var(--text)]/40 font-medium">{new Date(order.createdAt).toLocaleDateString()}</span>
                                        <span className="text-base font-black text-[var(--text)]">{formatCurrency(order.total)}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}





