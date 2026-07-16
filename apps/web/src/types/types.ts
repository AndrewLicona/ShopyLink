export interface Store {
    id: string;
    name: string;
    slug: string;
    autoGenerateSlug?: boolean;
    logoUrl?: string | null;
    bannerUrl?: string | null;
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
    planType?: 'FREE' | 'PRO';
    
    // Marketplace metadata
    isPublic?: boolean;
    marketplaceCategory?: string | null;
    city?: string | null;
    country?: string | null;
    tags?: string[];
    featured?: boolean;
    viewCount?: number;
    orderCount?: number;
    globalDiscountActive?: boolean;
    globalDiscountPercentage?: number;
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
    trackInventory?: boolean;
    images?: string[];  // max 2
}

export interface Product {
    id: string;
    name: string;
    baseVariantName?: string | null;
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
    store?: Store;
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
    completedAt?: string | null;
    updatedAt: string;
    items: OrderItem[];
}

export interface StoreBanner {
    id: string;
    storeId: string;
    title?: string | null;
    subtitle?: string | null;
    imageUrl?: string | null;
    linkUrl?: string | null;
    position: 'HERO' | 'TOP_BAR' | 'FLOATING' | 'BETWEEN_PRODUCTS';
    isActive: boolean;
    startsAt?: string | null;
    endsAt?: string | null;
    createdAt: string;
    updatedAt: string;
}


