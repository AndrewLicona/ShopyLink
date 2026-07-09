
import { createClient } from '@/lib/supabase';
import { Product, Store, Order, Category, StoreBanner } from '@/types/types';

const isServer = typeof window === 'undefined';
const API_URL = isServer
    ? (process.env.INTERNAL_API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3001')
    : (process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3001');

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

    if (!isServer) {
        const impersonationToken = localStorage.getItem('impersonation_token');
        if (impersonationToken) {
            headers['X-Impersonate-Token'] = impersonationToken;
        }
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
    getMarketplaceStores: (params?: Record<string, string>) => {
        const query = new URLSearchParams(params || {}).toString();
        return fetchWithAuth(`/stores/marketplace/public?${query}`);
    },
    getActiveMarketplaceCategories: (): Promise<string[]> => fetchWithAuth('/stores/marketplace/categories'),
    incrementStoreView: (storeId: string) => fetchWithAuth(`/stores/${storeId}/view`, { method: 'POST' }),
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

    // Admin
    getAllStoresAsAdmin: () => fetchWithAuth('/stores/admin/all'),
    getAdminMetrics: () => fetchWithAuth('/stores/admin/metrics'),
    getAllUsersAsAdmin: () => fetchWithAuth('/stores/admin/users'),
    updateStoreAsAdmin: (id: string, data: Partial<Store>) => fetchWithAuth(`/stores/admin/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
    }),
    impersonate: (userId: string) => fetchWithAuth(`/stores/admin/impersonate/${userId}`, {
        method: 'POST',
    }),
    getActiveBroadcasts: () => fetchWithAuth('/broadcasts/active'),
    createBroadcast: (data: { title: string; content: string; type: string; expiresAt?: string }) => fetchWithAuth('/broadcasts', {
        method: 'POST',
        body: JSON.stringify(data),
    }),
    deactivateBroadcast: (id: string) => fetchWithAuth(`/broadcasts/${id}/deactivate`, {
        method: 'PATCH',
    }),
    getAdminLogs: () => fetchWithAuth('/admin/logs'),

    // Banners
    getBanners: (storeId: string, onlyActive?: boolean) => {
        const url = onlyActive 
            ? `/banners?storeId=${storeId}&onlyActive=true` 
            : `/banners/admin?storeId=${storeId}`;
        return fetchWithAuth(url);
    },
    createBanner: (data: Partial<StoreBanner>) => fetchWithAuth('/banners', {
        method: 'POST',
        body: JSON.stringify(data),
    }),
    updateBanner: (id: string, data: Partial<StoreBanner>) => fetchWithAuth(`/banners/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
    }),
    deleteBanner: (id: string) => fetchWithAuth(`/banners/${id}`, {
        method: 'DELETE',
    }),

    // Products
    getProducts: (storeId: string, params?: Record<string, string>, options?: RequestInit) => {
        const query = new URLSearchParams({ storeId, ...params }).toString();
        return fetchWithAuth(`/products?${query}`, options);
    },
    getMarketplaceProducts: (params?: Record<string, string>) => {
        const query = new URLSearchParams(params || {}).toString();
        return fetchWithAuth(`/products/marketplace/public?${query}`);
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
    getProfile: () => fetchWithAuth('/auth/profile'),
};
