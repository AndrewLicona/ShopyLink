'use client';

import React, {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
} from 'react';

/**
 * Unified shopping cart shared by the Marketplace and every public store.
 *
 * A single cart can hold products coming from DIFFERENT stores. Because the
 * `Order` model belongs to exactly one store, the checkout splits the cart into
 * one order per store (see /marketplace/checkout).
 *
 * The cart is persisted in localStorage so it survives page reloads and
 * navigation between the marketplace and individual stores.
 */

export interface CartItem {
    /** product id */
    id: string;
    quantity: number;
    name: string;
    price: number;
    image?: string;
    variantId?: string;
    variantName?: string;
    /** store scope — every item belongs to exactly one store */
    storeId: string;
    storeName: string;
    storeSlug: string;
    storeLogoUrl?: string;
    itemType?: 'product' | 'service';
}

export interface CartStoreGroup {
    storeId: string;
    storeName: string;
    storeSlug: string;
    storeLogoUrl?: string;
    items: CartItem[];
    total: number;
    count: number;
}

export type NewCartItem = Omit<CartItem, 'quantity'> & { quantity?: number };

interface CartContextType {
    items: CartItem[];
    groups: CartStoreGroup[];
    total: number;
    count: number;
    /** false while the cart is being restored from localStorage */
    hydrated: boolean;
    addItem: (item: NewCartItem) => void;
    removeItem: (productId: string, variantId?: string) => void;
    setQuantity: (
        productId: string,
        variantId: string | undefined,
        quantity: number,
    ) => void;
    clearStore: (storeId: string) => void;
    clearAll: () => void;
}

const STORAGE_KEY = 'shopylink:cart:v1';

const CartContext = createContext<CartContextType | undefined>(undefined);

/** `undefined` and `null` must be treated as the same "no variant" key. */
const normalizeVariantId = (variantId?: string | null): string | undefined =>
    variantId ?? undefined;

const isCartItem = (value: unknown): value is CartItem => {
    if (!value || typeof value !== 'object') return false;
    const item = value as Record<string, unknown>;
    return (
        typeof item.id === 'string' &&
        typeof item.quantity === 'number' &&
        item.quantity > 0 &&
        typeof item.name === 'string' &&
        typeof item.price === 'number' &&
        typeof item.storeId === 'string'
    );
};

function readStoredCart(): CartItem[] {
    if (typeof window === 'undefined') return [];
    try {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        if (!raw) return [];
        const parsed: unknown = JSON.parse(raw);
        if (!Array.isArray(parsed)) return [];
        return parsed
            .filter(isCartItem)
            .map((item) => ({
                ...item,
                variantId: normalizeVariantId(item.variantId),
            }));
    } catch {
        return [];
    }
}

export function CartProvider({ children }: { children: React.ReactNode }) {
    const [items, setItems] = useState<CartItem[]>([]);
    const [hydrated, setHydrated] = useState(false);

    // Restore the cart on the client only, to keep SSR markup deterministic.
    useEffect(() => {
        setItems(readStoredCart());
        setHydrated(true);
    }, []);

    // Keep other open tabs in sync: the marketplace and the individual stores
    // are often open side by side, and the cart lives in localStorage.
    useEffect(() => {
        const handleStorage = (event: StorageEvent) => {
            if (event.key !== STORAGE_KEY) return;
            setItems(readStoredCart());
        };

        window.addEventListener('storage', handleStorage);
        return () => window.removeEventListener('storage', handleStorage);
    }, []);

    // Persist every change once the initial restore has happened.
    useEffect(() => {
        if (!hydrated) return;
        try {
            window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
        } catch {
            // Storage full or blocked (private mode) — the cart still works in memory.
        }
    }, [items, hydrated]);

    const addItem = useCallback((newItem: NewCartItem) => {
        const variantId = normalizeVariantId(newItem.variantId);
        const quantity = newItem.quantity ?? 1;

        setItems((prev) => {
            const index = prev.findIndex(
                (item) => item.id === newItem.id && item.variantId === variantId,
            );

            if (index === -1) {
                return [
                    ...prev,
                    { ...newItem, variantId, quantity },
                ];
            }

            const next = prev.map((item, i) =>
                i === index
                    ? {
                        ...item,
                        quantity: item.quantity + quantity,
                        // Refresh the snapshot data (price/name/image may have changed).
                        price: newItem.price,
                        name: newItem.name,
                        image: newItem.image,
                        variantName: newItem.variantName,
                        storeName: newItem.storeName,
                        storeSlug: newItem.storeSlug,
                        storeLogoUrl: newItem.storeLogoUrl,
                    }
                    : item,
            );
            return next;
        });
    }, []);

    const removeItem = useCallback((productId: string, variantId?: string) => {
        const normalized = normalizeVariantId(variantId);
        setItems((prev) =>
            prev.filter(
                (item) => !(item.id === productId && item.variantId === normalized),
            ),
        );
    }, []);

    const setQuantity = useCallback(
        (productId: string, variantId: string | undefined, quantity: number) => {
            const normalized = normalizeVariantId(variantId);
            setItems((prev) =>
                prev
                    .map((item) =>
                        item.id === productId && item.variantId === normalized
                            ? { ...item, quantity }
                            : item,
                    )
                    .filter((item) => item.quantity > 0),
            );
        },
        [],
    );

    const clearStore = useCallback((storeId: string) => {
        setItems((prev) => prev.filter((item) => item.storeId !== storeId));
    }, []);

    const clearAll = useCallback(() => setItems([]), []);

    const groups = useMemo<CartStoreGroup[]>(() => {
        const byStore = new Map<string, CartStoreGroup>();

        for (const item of items) {
            let group = byStore.get(item.storeId);
            if (!group) {
                group = {
                    storeId: item.storeId,
                    storeName: item.storeName,
                    storeSlug: item.storeSlug,
                    storeLogoUrl: item.storeLogoUrl,
                    items: [],
                    total: 0,
                    count: 0,
                };
                byStore.set(item.storeId, group);
            }
            group.items.push(item);
            group.total += item.price * item.quantity;
            group.count += item.quantity;
        }

        return Array.from(byStore.values());
    }, [items]);

    const total = useMemo(
        () => groups.reduce((acc, group) => acc + group.total, 0),
        [groups],
    );

    const count = useMemo(
        () => groups.reduce((acc, group) => acc + group.count, 0),
        [groups],
    );

    const value = useMemo(
        () => ({
            items,
            groups,
            total,
            count,
            hydrated,
            addItem,
            removeItem,
            setQuantity,
            clearStore,
            clearAll,
        }),
        [
            items,
            groups,
            total,
            count,
            hydrated,
            addItem,
            removeItem,
            setQuantity,
            clearStore,
            clearAll,
        ],
    );

    return (
        <CartContext.Provider value={value}>{children}</CartContext.Provider>
    );
}

export function useCart(): CartContextType {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
}

/** Convenience hook: the slice of the global cart that belongs to one store. */
export function useStoreCart(storeId: string | undefined) {
    const { items, groups, hydrated } = useCart();

    return useMemo(() => {
        const storeItems = storeId
            ? items.filter((item) => item.storeId === storeId)
            : [];
        const group = groups.find((g) => g.storeId === storeId);

        return {
            items: storeItems,
            // When the store has no items the slice must be empty — falling back to
            // the global total would show the shopper the wrong amount.
            total: group?.total ?? 0,
            count: group?.count ?? 0,
            hydrated,
        };
    }, [items, groups, storeId, hydrated]);
}
