
import { createClient } from './supabase';

const API_URL = '/api-proxy';

export async function fetchWithAuth(endpoint: string, options: RequestInit = {}) {
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();

    const headers = {
        'Content-Type': 'application/json',
        ...(session?.access_token ? { 'Authorization': `Bearer ${session.access_token}` } : {}),
        ...options.headers,
    };

    const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers,
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'An error occurred' }));
        throw new Error(error.message || response.statusText);
    }

    return response.json();
}

// API Methods
export const api = {
    // Stores
    getStores: () => fetchWithAuth('/stores'),
    getStoreByUserId: (userId: string) => fetchWithAuth(`/stores/user/${userId}`),
    createStore: (data: any) => fetchWithAuth('/stores', {
        method: 'POST',
        body: JSON.stringify(data),
    }),
    updateStore: (id: string, data: any) => fetchWithAuth(`/stores/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
    }),

    // Products
    getProducts: (storeId: string) => fetchWithAuth(`/products?storeId=${storeId}`),
    createProduct: (data: any) => fetchWithAuth('/products', {
        method: 'POST',
        body: JSON.stringify(data),
    }),
    updateProduct: (id: string, data: any) => fetchWithAuth(`/products/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
    }),
    deleteProduct: (id: string) => fetchWithAuth(`/products/${id}`, {
        method: 'DELETE',
    }),

    // Categories
    getCategories: (storeId: string) => fetchWithAuth(`/categories?storeId=${storeId}`),
    createCategory: (data: any) => fetchWithAuth('/categories', {
        method: 'POST',
        body: JSON.stringify(data),
    }),
    deleteCategory: (id: string) => fetchWithAuth(`/categories/${id}`, {
        method: 'DELETE',
    }),

    // Orders
    getOrders: (storeId: string) => fetchWithAuth(`/orders?storeId=${storeId}`),
    createOrder: (data: any) => fetchWithAuth('/orders', {
        method: 'POST',
        body: JSON.stringify(data),
    }),
    updateOrderStatus: (id: string, status: string) => fetchWithAuth(`/orders/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
    }),
};
