export interface Store {
    id: string;
    name: string;
    slug: string;
    autoGenerateSlug?: boolean;
    logoUrl?: string | null;
    primaryColor?: string | null;
    description?: string | null;
    whatsappNumber?: string | null;
    instagramUrl?: string | null;
    facebookUrl?: string | null;
    tiktokUrl?: string | null;
    twitterUrl?: string | null;
    pinterestUrl?: string | null;
    youtubeUrl?: string | null;
    theme?: string | null;
    mode?: string | null;
    applyThemeToDashboard?: boolean;
    deliveryEnabled: boolean;
    deliveryPrice?: string | null;
    userId: string;
}

export interface Category {
    id: string;
    name: string;
    slug: string;
    storeId: string;
}

export interface Inventory {
    productId: string;
    stock: number;
}

export interface ProductVariant {
    id: string;
    name: string;
    price: number | null;
    stock: number;
    sku?: string | null;
    productId: string;
    // Nuevos campos Phase 56
    useParentPrice?: boolean;
    useParentStock?: boolean;
    images?: string[];  // max 2
}

export interface Product {
    id: string;
    name: string;
    description?: string | null;
    price?: number | null;
    discountPrice?: number | null;
    images?: string[];
    isActive: boolean;
    sku?: string | null;
    storeId: string;
    categoryId?: string | null;
    trackInventory: boolean;
    inventory?: Inventory | null;
    variants?: ProductVariant[];
}

export interface OrderItem {
    id: string;
    productId: string;
    productName: string;
    quantity: number;
    price: number;
    sku?: string | null;
}

export interface Order {
    id: string;
    customerName: string;
    customerPhone?: string | null;
    total: number;
    status: 'PENDING' | 'COMPLETED' | 'CANCELLED';
    createdAt: string;
    items: OrderItem[];
}

