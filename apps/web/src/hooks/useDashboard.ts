'use client';

import { useState, useEffect } from 'react';
import { TrendingUp, Clock, ShoppingBag } from 'lucide-react';
import { api } from '@/services/api';
import { formatCurrency } from '@/lib/utils';
import { useStore } from '@/contexts/StoreContext';
import { copyToClipboard } from '@/lib/clipboard';
import type { Order, Product } from '@/types/types';

export function useDashboard() {
    const { activeStore } = useStore();
    const [stats, setStats] = useState<{ label: string, value: string, change: string, icon: React.ElementType, color: string, bg: string }[]>([]);
    const [recentOrders, setRecentOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [copied, setCopied] = useState(false);

    const storeName = activeStore?.name || 'Tu Tienda';
    const storeUrl = activeStore?.slug
        ? `${typeof window !== 'undefined' ? window.location.origin : ''}/${activeStore.slug}`
        : '';

    const handleCopyLink = async () => {
        if (!storeUrl) return false;
        const success = await copyToClipboard(storeUrl);
        if (success) {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
            return true;
        }
        return false;
    };

    const handleShare = async () => {
        if (!storeUrl) return;

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
                    await handleCopyLink();
                }
            }
        } else {
            await handleCopyLink();
        }
    };

    useEffect(() => {
        const loadDashboardData = async () => {
            if (!activeStore) return;

            setLoading(true);
            try {
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

    return {
        state: {
            stats,
            recentOrders,
            loading,
            copied,
            storeName,
            storeUrl,
            activeStore
        },
        actions: {
            handleCopyLink,
            handleShare
        }
    };
}
