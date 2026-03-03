'use client';

import {
    Plus,
    ShoppingBag,
    Share2,
    Check,
    DollarSign,
    Package,
    FileDown
} from 'lucide-react';
import Link from 'next/link';
import { formatCurrency, cn } from '@/lib/utils';
import { useDashboard } from '@/hooks/useDashboard';
import { LoadingState } from '@/components/atoms/LoadingState';
import { SectionHeader } from '@/components/molecules/SectionHeader';
import { StatCard } from '@/components/molecules/StatCard';
import { SalesChart } from '@/components/molecules/SalesChart';
import { Button } from '@/components/atoms/Button';
import { pdfService } from '@/services/pdf.service';

export default function DashboardPage() {
    const { state, actions } = useDashboard();
    const { stats, recentOrders, analytics, topProducts, loading, copied, storeName, activeStore } = state;

    // Simulate Gallagher-style data
    const firstName = storeName.split(' ')[0] || 'Cliente';


    const getInitials = (name: string) => {
        return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
    };

    const getAvatarColor = (name: string) => {
        const colors = [
            'bg-blue-500', 'bg-purple-500', 'bg-pink-500',
            'bg-indigo-500', 'bg-cyan-500', 'bg-teal-500',
            'bg-orange-500', 'bg-rose-500'
        ];
        let hash = 0;
        for (let i = 0; i < name.length; i++) {
            hash = name.charCodeAt(i) + ((hash << 5) - hash);
        }
        return colors[Math.abs(hash) % colors.length];
    };

    if (loading) {
        return <LoadingState message="Cargando tus datos..." fullPage />;
    }

    return (
        <div className="space-y-4 md:space-y-6 lg:h-[calc(100vh-4rem)] lg:flex lg:flex-col lg:overflow-hidden">
            {/* Premium Header Gallagher Style */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 md:gap-6">
                <div className="space-y-1">
                    <h1 className="text-3xl md:text-4xl font-black text-[var(--text)] tracking-tight">
                        ¡Hola, {firstName}!
                    </h1>
                    <p className="text-[var(--text)]/40 font-medium text-sm">
                        ¿Qué vamos a vender hoy en <span className="text-[var(--primary)] font-black">{storeName}</span>?
                    </p>
                </div>

                <div className="flex items-center gap-2">


                    <div className="flex items-center gap-2">
                        <Button
                            variant="secondary"
                            onClick={() => {
                                if (activeStore) {
                                    pdfService.generateCatalogPDF(
                                        activeStore,
                                        state.products,
                                        state.categories
                                    );
                                }
                            }}
                            className="p-3 rounded-2xl flex items-center gap-2 bg-[var(--surface)] border border-[var(--border)]"
                            aria-label="Descargar Catálogo PDF"
                        >
                            <FileDown className="w-5 h-5 text-[var(--text)]/60" />
                        </Button>

                        <Link href="/dashboard/products?action=new">
                            <Button
                                variant="primary"
                                leftIcon={<Plus className="w-5 h-5" />}
                                className="px-5 py-3 rounded-2xl"
                            >
                                <span className="hidden md:inline">Nuevo Producto</span>
                            </Button>
                        </Link>

                        <Button
                            variant="secondary"
                            onClick={actions.handleShare}
                            className="p-3 rounded-2xl bg-[var(--surface)] border border-[var(--border)]"
                            aria-label="Compartir tienda"
                        >
                            {copied ? <Check className="w-5 h-5 text-green-500" /> : <Share2 className="w-5 h-5 text-[var(--text)]/60" />}
                        </Button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
                <StatCard
                    icon={Package}
                    label="Inventario"
                    value={stats.totalProducts}
                    color="teal"
                    statusLabel="Activo"
                />
                <StatCard
                    icon={ShoppingBag}
                    label="Pedidos"
                    value={stats.pendingOrders}
                    color="orange"
                    statusLabel={stats.pendingOrders > 5 ? 'Crítico' : 'Normal'}
                />
                <StatCard
                    icon={DollarSign}
                    label="Ventas Hoy"
                    value={formatCurrency(stats.todaySales)}
                    color="green"
                    statusLabel="Creciendo"
                />
                <StatCard
                    icon={DollarSign}
                    label="Ventas (Tot)"
                    value={formatCurrency(stats.totalSales || 0)}
                    color="primary"
                    statusLabel="Estable"
                />
            </div>

            {/* Analytics, Top Products & Recent Orders - 3 Column Layout for PC */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 md:gap-5 flex-1 min-h-0">
                {/* Chart - Spans 2 columns */}
                <div className="lg:col-span-2 h-full bg-[var(--surface)] rounded-2xl shadow-sm border border-[var(--border)] overflow-hidden flex flex-col">
                    <div className="p-4 md:p-5 border-b border-[var(--border)] shrink-0">
                        <h3 className="text-base font-black text-[var(--text)]">Rendimiento Semanal</h3>
                        <p className="text-[10px] font-medium text-[var(--text)]/40">Distribución de ventas en los últimos 7 días</p>
                    </div>
                    <div className="flex-1 min-h-0 bg-white/[0.02]">
                        <SalesChart data={analytics} hideHeader />
                    </div>
                </div>

                {/* Top Products - Spans 1 column */}
                <div className="bg-[var(--surface)] rounded-2xl shadow-sm border border-[var(--border)] overflow-hidden flex flex-col h-full lg:max-h-full">
                    <div className="p-4 md:p-5 border-b border-[var(--border)] shrink-0">
                        <h3 className="text-base font-black text-[var(--text)]">Más Vendidos</h3>
                        <p className="text-[10px] font-medium text-[var(--text)]/40">Tus productos estrella por unidades</p>
                    </div>
                    <div className="flex-1 overflow-y-auto custom-scrollbar">
                        {topProducts.length === 0 ? (
                            <div className="p-8 text-center flex flex-col items-center justify-center gap-3 h-full text-[var(--text)]/20">
                                <Package className="w-5 h-5" />
                                <p className="text-[9px] font-medium">Sin datos.</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-[var(--border)]">
                                {topProducts.map((p, i) => (
                                    <div key={i} className="p-3.5 space-y-2">
                                        <div className="flex justify-between items-center">
                                            <p className="text-xs font-black text-[var(--text)] truncate pr-2 leading-none">{p.name}</p>
                                            <span className="text-[11px] font-black text-[var(--primary)] shrink-0">{p.quantity} <span className="text-[8px] opacity-40">Uds</span></span>
                                        </div>
                                        <div className="w-full bg-[var(--bg)] h-2 rounded-full overflow-hidden border border-[var(--border)]/30">
                                            <div
                                                className="bg-gradient-to-r from-[var(--primary)]/60 to-[var(--primary)] h-full rounded-full transition-all duration-700 ease-out"
                                                style={{ width: `${Math.max(5, p.percentage)}%` }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Recent Sales - Spans 1 column */}
                <div className="bg-[var(--surface)] rounded-2xl shadow-sm border border-[var(--border)] overflow-hidden flex flex-col h-full lg:max-h-full">
                    <div className="p-4 md:p-5 border-b border-[var(--border)] shrink-0 flex items-center justify-between">
                        <div>
                            <h3 className="text-base font-black text-[var(--text)]">Ventas Recientes</h3>
                            <p className="text-[10px] font-medium text-[var(--text)]/40">Últimos pedidos realizados</p>
                        </div>
                        <Link
                            href="/dashboard/orders"
                            className="text-[9px] font-black text-[var(--primary)] hover:opacity-80 hover:bg-[var(--primary)]/10 px-2 py-1 rounded-md transition-all shrink-0"
                        >
                            Historial
                        </Link>
                    </div>

                    <div className="flex-1 overflow-y-auto custom-scrollbar">
                        {recentOrders.length === 0 ? (
                            <div className="p-8 text-center flex flex-col items-center justify-center gap-3 h-full">
                                <div className="w-10 h-10 bg-[var(--bg)] rounded-full flex items-center justify-center text-[var(--text)]/20">
                                    <ShoppingBag className="w-5 h-5" />
                                </div>
                                <p className="text-[9px] text-[var(--text)]/40 font-medium tracking-tight">Sin pedidos.</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-[var(--border)]">
                                {recentOrders.map((order, i) => {
                                    const productCount = order.items?.reduce((acc, item) => acc + item.quantity, 0) || 0;
                                    return (
                                        <div key={i} className="p-3.5 space-y-1.5 active:bg-[var(--secondary)]/50 transition-colors group">
                                            <div className="flex justify-between items-start">
                                                <div className="flex items-center gap-3">
                                                    <div className={cn(
                                                        "w-8 h-8 rounded-xl flex items-center justify-center text-[10px] font-black text-white shadow-sm shrink-0",
                                                        getAvatarColor(order.customerName)
                                                    )}>
                                                        {getInitials(order.customerName)}
                                                    </div>
                                                    <div className="space-y-0.5 text-left">
                                                        <span className="text-[7px] font-black text-[var(--primary)] uppercase tracking-widest block leading-none">#{order.id.slice(0, 8)}</span>
                                                        <p className="text-xs font-bold text-[var(--text)] leading-none">{order.customerName}</p>
                                                    </div>
                                                </div>
                                                <span className={cn(
                                                    "px-2 py-0.5 rounded-lg text-[7px] font-black uppercase tracking-wider flex items-center gap-1",
                                                    order.status === 'COMPLETED' ? 'bg-green-500/10 text-green-600' :
                                                        order.status === 'PENDING' ? 'bg-orange-500/10 text-orange-600' :
                                                            'bg-red-500/10 text-red-600'
                                                )}>
                                                    {order.status === 'PENDING' && (
                                                        <span className="w-1 h-1 bg-orange-500 rounded-full animate-pulse" />
                                                    )}
                                                    {order.status === 'COMPLETED' ? 'Hecho' : 'Pend'}
                                                </span>
                                            </div>
                                            <div className="flex justify-between items-center pl-11">
                                                <span className="text-[9px] text-[var(--text)]/40 font-medium">{new Date(order.createdAt).toLocaleDateString()}</span>
                                                <span className="text-xs font-black text-[var(--text)]">{productCount} {productCount === 1 ? 'Prod.' : 'Prods.'}</span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}





