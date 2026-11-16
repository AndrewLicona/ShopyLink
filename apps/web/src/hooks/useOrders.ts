'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { api } from '@/services/api';
import { useStore } from '@/contexts/StoreContext';
import type { Order } from '@/types/types';

export function useOrders() {
    const { activeStore } = useStore();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState(false);
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');
    const [updatingId, setUpdatingId] = useState<string | null>(null);
    const [loadingStatus, setLoadingStatus] = useState<string | null>(null);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const searchParams = useSearchParams();

    const loadOrders = useCallback(async () => {
        if (!activeStore) return [];
        setLoading(true);
        setLoadError(false);
        try {
            const data = await api.getOrders(activeStore.id);
            setOrders(data);
            return data;
        } catch (err: unknown) {
            console.error('Error loading orders:', err);
            setLoadError(true);
            return [];
        } finally {
            setLoading(false);
        }
    }, [activeStore]);

    useEffect(() => {
        const initOrders = async () => {
            const data = await loadOrders();
            const orderId = searchParams.get('id');
            if (orderId && Array.isArray(data) && data.length > 0) {
                const found = data.find((o: Order) => o.id === orderId);
                if (found) setSelectedOrder(found);
            }
        };
        initOrders();
    }, [loadOrders, searchParams]);

    const filteredOrders = orders.filter(order => {
        const query = searchTerm.trim().toLocaleLowerCase();
        const matchesSearch = !query || [order.customerName, order.id, order.customerPhone || '', ...(order.items || []).flatMap(item => [item.productName, item.variantName || '', item.sku || ''])].some(value => value.toLocaleLowerCase().includes(query));
        const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
        const date = new Date(order.createdAt);
        const localDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
        return matchesSearch && matchesStatus && (!dateFrom || localDate >= dateFrom) && (!dateTo || localDate <= dateTo);
    });

    const handleUpdateStatus = async (orderId: string, newStatus: Order['status']) => {
        setUpdatingId(orderId);
        setLoadingStatus(newStatus);
        try {
            await api.updateOrderStatus(orderId, newStatus);

            setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));

            if (selectedOrder?.id === orderId) {
                setSelectedOrder((prev) => prev ? ({ ...prev, status: newStatus }) : null);
            }
            return { success: true };
        } catch (err: unknown) {
            const error = err as { message?: string };
            return { success: false, error: error.message || 'Error al actualizar el estado del pedido' };
        } finally {
            setUpdatingId(null);
            setLoadingStatus(null);
        }
    };

    return {
        state: {
            orders: filteredOrders,
            allOrders: orders,
            loading,
            loadError,
            dateFrom,
            dateTo,
            updatingId,
            loadingStatus,
            selectedOrder,
            searchTerm,
            statusFilter,
            activeStore
        },
        actions: {
            setDateFrom,
            setDateTo,
            setSelectedOrder,
            setSearchTerm,
            setStatusFilter,
            handleUpdateStatus,
            refreshOrders: loadOrders
        }
    };
}
