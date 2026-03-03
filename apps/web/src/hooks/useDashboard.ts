'use client';

import { useState, useEffect } from 'react';
import { api } from '@/services/api';
import { useStore } from '@/contexts/StoreContext';
import { copyToClipboard } from '@/lib/clipboard';
import type { Order, Product, Category } from '@/types/types';

export function useDashboard() {
    const { activeStore } = useStore();
    const [stats, setStats] = useState({
        todaySales: 0,
        todayOrders: 0,
        totalProducts: 0,
        pendingOrders: 0,
        totalOrders: 0,
        totalSales: 0
    });
    const [recentOrders, setRecentOrders] = useState<Order[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [analytics, setAnalytics] = useState<{ date: string, amount: number }[]>([]);
    const [topProducts, setTopProducts] = useState<{ name: string, quantity: number, percentage: number }[]>([]);
    const [loading, setLoading] = useState(true);
    const [copied, setCopied] = useState(false);

    const frontendUrl = process.env.NEXT_PUBLIC_FRONTEND_URL || (typeof window !== 'undefined' ? window.location.origin : '');
    const storeName = activeStore?.name || 'Tu Tienda';
    const storeUrl = activeStore?.slug
        ? `${frontendUrl}/${activeStore.slug}`
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
                    title: storeName as string,
                    text: `¡Mira mi tienda en ShopyLinks!`,
                    url: storeUrl as string,
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
                const [productsData, ordersData, categoriesData] = await Promise.all([
                    api.getProducts(activeStore.id),
                    api.getOrders(activeStore.id),
                    api.getCategories(activeStore.id)
                ]);

                setProducts(productsData);
                setCategories(categoriesData);
                setRecentOrders(ordersData.slice(0, 5));

                const todayStr = new Date().toLocaleDateString('en-CA');
                const orders = ordersData;

                const todayOrders = orders.filter((o: Order) => {
                    const orderDate = new Date(o.createdAt);
                    const orderDateStr = orderDate.toLocaleDateString('en-CA');
                    return orderDateStr === todayStr;
                });

                const completedOrders = orders.filter((o: Order) => o.status === 'COMPLETED');

                const todaySales = completedOrders
                    .filter((o: Order) => {
                        const compDateStr = new Date(o.completedAt || o.updatedAt).toLocaleDateString('en-CA');
                        return compDateStr === todayStr;
                    })
                    .reduce((acc: number, o: Order) => acc + Number(o.total || 0), 0);

                const totalSales = completedOrders
                    .reduce((acc: number, o: Order) => acc + Number(o.total || 0), 0);

                setStats({
                    todaySales,
                    todayOrders: todayOrders.length,
                    totalProducts: productsData.length,
                    pendingOrders: orders.filter((o: Order) => o.status === 'PENDING').length,
                    totalOrders: orders.length,
                    totalSales
                });

                // Generate last 7 days analytics (precise date logic)
                const last7Days = Array.from({ length: 7 }, (_, i) => {
                    const d = new Date();
                    d.setDate(d.getDate() - (6 - i)); // From 6 days ago to today
                    return d.toLocaleDateString('en-CA');
                });

                const chartData = last7Days.map(dateStr => {
                    const daySales = completedOrders
                        .filter((o: Order) => {
                            const compDateStr = new Date(o.completedAt || o.updatedAt).toLocaleDateString('en-CA');
                            return compDateStr === dateStr;
                        })
                        .reduce((acc: number, o: Order) => acc + Number(o.total || 0), 0);

                    return {
                        date: dateStr!,
                        amount: daySales as number
                    };
                });

                setAnalytics(chartData);

                // Top Products Logic
                const productSales: Record<string, number> = {};
                let totalQty = 0;
                orders.forEach((o: Order) => {
                    o.items?.forEach(item => {
                        productSales[item.productName] = (productSales[item.productName] || 0) + item.quantity;
                        totalQty += item.quantity;
                    });
                });

                const sortedProducts = Object.entries(productSales)
                    .map(([name, quantity]) => ({
                        name,
                        quantity,
                        percentage: totalQty > 0 ? (quantity / totalQty) * 100 : 0
                    }))
                    .sort((a, b) => b.quantity - a.quantity)
                    .slice(0, 5);

                setTopProducts(sortedProducts);
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
            products,
            categories,
            analytics,
            topProducts,
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
