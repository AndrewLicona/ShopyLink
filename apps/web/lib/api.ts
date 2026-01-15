
import { createClient } from './supabase';
import type { Store, Product, Category, Order } from './types';

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

export interface CreateOrderDto {
    storeId: string;
    customerName: string;
    customerPhone?: string | null;
    customerAddress?: string;
    items: {
        productId: string;
        quantity: number;
    }[];
}

// API Methods
export const api = {
    // Stores
    getStores: (): Promise<Store[]> => fetchWithAuth('/stores'),
    getStoreByUserId: (userId: string): Promise<Store> => fetchWithAuth(`/stores/user/${userId}`),
    createStore: (data: Partial<Store>) => fetchWithAuth('/stores', {
        method: 'POST',
        body: JSON.stringify(data),
    }),
    updateStore: (id: string, data: Partial<Store>) => fetchWithAuth(`/stores/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
    }),
    deleteStore: (id: string) => fetchWithAuth(`/stores/${id}`, {
        method: 'DELETE',
    }),

    // Products
    getProducts: (storeId: string): Promise<Product[]> => fetchWithAuth(`/products?storeId=${storeId}`),
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
    getCategories: (storeId: string): Promise<Category[]> => fetchWithAuth(`/categories?storeId=${storeId}`),
    createCategory: (data: Partial<Category>) => fetchWithAuth('/categories', {
        method: 'POST',
        body: JSON.stringify(data),
    }),
    deleteCategory: (id: string) => fetchWithAuth(`/categories/${id}`, {
        method: 'DELETE',
    }),

    // Orders
    getOrders: (storeId: string): Promise<Order[]> => fetchWithAuth(`/orders?storeId=${storeId}`),
    createOrder: (data: CreateOrderDto) => fetchWithAuth('/orders', {
        method: 'POST',
        body: JSON.stringify(data),
    }),
    updateOrderStatus: (id: string, status: string) => fetchWithAuth(`/orders/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
    }),

    // Auth
    resolveUsername: (username: string): Promise<{ email: string }> => fetchWithAuth(`/auth/resolve-username/${username}`),
};
