export interface Store {
    id: string;
    name: string;
    slug: string;
    logoUrl?: string | null;
    primaryColor?: string | null;
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

export interface Product {
    id: string;
    name: string;
    description?: string | null;
    price: number;
    discountPrice?: number | null;
    images?: string[];
    isActive: boolean;
    sku?: string | null;
    storeId: string;
    categoryId?: string | null;
    trackInventory: boolean;
    inventory?: Inventory | null;
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
