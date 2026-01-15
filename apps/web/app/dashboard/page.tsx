'use client';

import {
    TrendingUp,
    Clock,
    Plus,
    ShoppingBag,
    Loader2,
    Copy,
    ExternalLink,
    Share2,
    Check
} from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { formatCurrency, cn } from '@/lib/utils';
import { useStore } from '@/contexts/StoreContext';
import { copyToClipboard } from '@/lib/clipboard';
import type { Order, Product } from '@/lib/types';
export default function DashboardPage() {
    const { activeStore } = useStore();
    const [stats, setStats] = useState<{ label: string, value: string, change: string, icon: React.ElementType, color: string, bg: string }[]>([]);
    const [recentOrders, setRecentOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [copied, setCopied] = useState(false);
    const storeName = activeStore?.name || 'Tu Tienda';

    // Construir la URL completa de la tienda pública
    const storeUrl = activeStore?.slug
        ? `${typeof window !== 'undefined' ? window.location.origin : ''}/${activeStore.slug}`
        : '';

    const handleCopyLink = async () => {
        if (!storeUrl) {
            alert('Aún estamos cargando los datos de tu tienda. Por favor, espera un momento.');
            return;
        }
        const success = await copyToClipboard(storeUrl);
        if (success) {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } else {
            alert('Enlace: ' + storeUrl);
        }
    };

    const handleShare = async () => {
        if (!storeUrl) {
            alert('Aún estamos cargando los datos de tu tienda.');
            return;
        }

        if (navigator.share && window.isSecureContext) {
            try {
                await navigator.share({
                    title: storeName,
                    text: `¡Mira mi tienda en ShopyLink!`,
                    url: storeUrl,
                });
            } catch (err) {
                if ((err as Error).name !== 'AbortError') {
                    console.error('Error al compartir:', err);
                    handleCopyLink();
                }
            }
        } else {
            handleCopyLink();
        }
    };

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
                        value: formatCurrency(orders.filter((o: Order) => o.status === 'COMPLETED').reduce((acc: number, o: Order) => acc + Number(o.total), 0)),
                        change: 'Consolidado',
                        icon: TrendingUp,
                        color: 'text-[var(--primary)]',
                        bg: 'bg-[var(--primary)]/10'
                    },
                    {
                        label: 'Pedidos Pendientes',
                        value: orders.filter((o: Order) => o.status === 'PENDING').length.toString(),
                        change: 'Actualizado',
                        icon: Clock,
                        color: 'text-orange-500',
                        bg: 'bg-orange-500/10'
                    },
                    {
                        label: 'Productos Activos',
                        value: (products as Product[]).length.toString(),
                        change: 'En catálogo',
                        icon: ShoppingBag,
                        color: 'text-[var(--primary)]',
                        bg: 'bg-[var(--primary)]/5'
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
                <Loader2 className="w-10 h-10 text-[var(--primary)] animate-spin" />
                <p className="text-[var(--text)]/40 font-medium">Cargando tus datos...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 md:space-y-10">
            {/* Header with Title and Subtle Share Button */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 md:mb-12">
                <div>
                    <h1 className="text-2xl md:text-3xl font-black text-[var(--text)] leading-tight">
                        Hola, <span className="text-[var(--primary)]">{storeName}</span>
                    </h1>
                    <p className="text-[var(--text)]/40 mt-1 text-sm md:text-base font-medium">Resumen de actividad de hoy.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={handleShare}
                        className={cn(
                            "flex-1 md:flex-none inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl font-black text-xs transition-all active:scale-95 border shadow-sm",
                            copied
                                ? "bg-green-500 text-white border-green-500"
                                : "bg-[var(--surface)] text-[var(--text)] border-[var(--border)] hover:bg-[var(--secondary)]"
                        )}
                    >
                        {copied ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
                        {copied ? 'Copiado' : 'Compartir Enlace'}
                    </button>
                    <Link
                        href="/dashboard/products?action=new"
                        className="p-3.5 bg-[var(--primary)] text-[var(--primary-foreground)] rounded-2xl hover:opacity-90 transition-all active:scale-95 shadow-lg shadow-[var(--primary)]/10"
                        title="Nuevo Producto"
                    >
                        <Plus className="w-6 h-6" />
                    </Link>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {stats.map((stat, i) => {
                    const Icon = stat.icon;
                    return (
                        <div key={i} className="bg-[var(--surface)] p-5 md:p-6 rounded-[2rem] shadow-[var(--shadow)] border border-[var(--border)] hover:shadow-[var(--shadow-strong)] transition-all group">
                            <div className="flex items-center justify-between mb-3 md:mb-4">
                                <div className={cn(stat.bg, "p-3 md:p-4 rounded-2xl group-hover:scale-110 transition-transform")}>
                                    <Icon className={cn("w-5 h-5 md:w-6 md:h-6", stat.color)} />
                                </div>
                                <span className={cn("text-[10px] md:text-xs font-black uppercase tracking-wider", stat.color)}>
                                    {stat.change}
                                </span>
                            </div>
                            <div>
                                <p className="text-[10px] md:text-sm font-bold text-[var(--text)]/40 uppercase tracking-widest leading-none">{stat.label}</p>
                                <p className="text-2xl md:text-3xl font-black text-[var(--text)] mt-1.5 md:mt-1">{stat.value}</p>
                            </div>
                        </div>
                    );
                })}
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
                                <div key={i} className="p-6 space-y-3">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <span className="text-[10px] font-black text-[var(--primary)] uppercase tracking-widest">#{order.id.slice(0, 8)}</span>
                                            <p className="text-sm font-bold text-[var(--text)]">{order.customerName}</p>
                                        </div>
                                        <span className={cn(
                                            "px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider",
                                            order.status === 'COMPLETED' ? 'bg-green-500/10 text-green-600' :
                                                order.status === 'PENDING' ? 'bg-orange-500/10 text-orange-600' :
                                                    'bg-red-500/10 text-red-600'
                                        )}>
                                            {order.status === 'COMPLETED' ? 'Completado' : order.status === 'PENDING' ? 'Pendiente' : 'Cancelado'}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-end">
                                        <span className="text-[10px] text-[var(--text)]/40 font-medium">{new Date(order.createdAt).toLocaleDateString()}</span>
                                        <span className="text-lg font-black text-[var(--text)]">{formatCurrency(order.total)}</span>
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

