
import { createClient } from './supabase';

const API_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

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
        const errorData = await response.json().catch(() => ({ message: 'An error occurred' }));
        console.error('API Error Response:', errorData);

        // NestJS often wraps the error message in an 'error' object or 'message' field
        let errorMessage = 'An error occurred';

        if (errorData.error && typeof errorData.error === 'object') {
            errorMessage = errorData.error.message || errorData.message || errorMessage;
        } else if (errorData.message) {
            errorMessage = Array.isArray(errorData.message) ? errorData.message[0] : errorData.message;
        }

        throw new Error(errorMessage);
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
