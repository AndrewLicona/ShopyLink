
import { createClient } from '@/lib/supabase';
import { Product, Store, Order, Category } from '@/types/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

async function fetchWithAuth(endpoint: string, options: RequestInit = {}) {
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...((options.headers as Record<string, string>) || {}),
    };

    if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout

    try {
        const res = await fetch(`${API_URL}${endpoint}`, {
            ...options,
            headers,
            signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!res.ok) {
            const errorData = await res.json().catch(() => ({}));
            throw new Error(errorData.message || `API Error: ${res.status} ${res.statusText}`);
        }

        return res.json();
    } catch (error: unknown) {
        clearTimeout(timeoutId);
        if ((error as Error).name === 'AbortError') {
            throw new Error('Request timeout');
        }
        throw error;
    }
}

export const api = {
    // Stores
    getStores: () => fetchWithAuth('/stores'),
    getStore: (id: string, options?: RequestInit) => fetchWithAuth(`/stores/${id}`, options),
    getStoreBySlug: (slug: string, options?: RequestInit) => fetchWithAuth(`/stores/${slug}`, options),
    updateStore: (id: string, data: Partial<Store>) => fetchWithAuth(`/stores/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
    }),
    createStore: (data: Partial<Store>) => fetchWithAuth('/stores', {
        method: 'POST',
        body: JSON.stringify(data),
    }),
    deleteStore: (id: string) => fetchWithAuth(`/stores/${id}`, {
        method: 'DELETE',
    }),

    // Products
    getProducts: (storeId: string, params?: Record<string, string>, options?: RequestInit) => {
        const query = new URLSearchParams({ storeId, ...params }).toString();
        return fetchWithAuth(`/products?${query}`, options);
    },
    getProduct: (id: string, options?: RequestInit) => fetchWithAuth(`/products/${id}`, options),
    createProduct: (data: Partial<Product>) => fetchWithAuth('/products', {
        method: 'POST',
        body: JSON.stringify(data),
    }),
    updateProduct: (id: string, data: Partial<Product>) => fetchWithAuth(`/products/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
    }),
    deleteProduct: (id: string) => fetchWithAuth(`/products/${id}`, {
        method: 'DELETE',
    }),

    // Categories
    getCategories: (storeId: string) => fetchWithAuth(`/categories?storeId=${storeId}`),
    createCategory: (data: Partial<Category>) => fetchWithAuth('/categories', {
        method: 'POST',
        body: JSON.stringify(data),
    }),
    deleteCategory: (id: string) => fetchWithAuth(`/categories/${id}`, {
        method: 'DELETE',
    }),

    // Orders
    getOrders: (storeId: string) => fetchWithAuth(`/orders?storeId=${storeId}`),
    createOrder: (data: Partial<Order>) => fetchWithAuth('/orders', {
        method: 'POST',
        body: JSON.stringify(data),
    }),
    updateOrderStatus: (id: string, status: string) => fetchWithAuth(`/orders/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
    }),

    // Auth
    resolveUsername: (username: string) => fetchWithAuth(`/auth/resolve-username/${username}`),
};
