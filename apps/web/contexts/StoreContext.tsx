
'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '@/lib/api';

interface Store {
    id: string;
    name: string;
    slug: string;
    logoUrl?: string;
    whatsappNumber?: string;
    instagramUrl?: string;
    facebookUrl?: string;
    tiktokUrl?: string;
    twitterUrl?: string;
    pinterestUrl?: string;
    youtubeUrl?: string;
    theme?: string;
    mode?: string;
    applyThemeToDashboard?: boolean;
}

interface StoreContextType {
    stores: Store[];
    activeStore: Store | null;
    setActiveStoreById: (id: string) => void;
    loading: boolean;
    error: string | null;
    refreshStores: () => Promise<void>;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export function StoreProvider({ children }: { children: React.ReactNode }) {
    const [stores, setStores] = useState<Store[]>([]);
    const [activeStore, setActiveStore] = useState<Store | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const refreshStores = async () => {
        try {
            setError(null);
            const data = await api.getStores();
            setStores(data);

            // Selection logic
            const savedStoreId = localStorage.getItem('activeStoreId');
            if (savedStoreId) {
                const found = data.find((s: Store) => s.id === savedStoreId);
                if (found) {
                    setActiveStore(found);
                } else if (data.length > 0) {
                    setActiveStore(data[0]);
                }
            } else if (data.length > 0) {
                setActiveStore(data[0]);
            }
        } catch (err: any) {
            console.error('Error fetching stores:', err);
            setError(err.message || 'Error fetching stores');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        refreshStores();
    }, []);

    const setActiveStoreById = (id: string) => {
        const found = stores.find(s => s.id === id);
        if (found) {
            setActiveStore(found);
            localStorage.setItem('activeStoreId', id);
        }
    };

    return (
        <StoreContext.Provider value={{ stores, activeStore, setActiveStoreById, loading, error, refreshStores }}>
            {children}
        </StoreContext.Provider>
    );
}

export function useStore() {
    const context = useContext(StoreContext);
    if (context === undefined) {
        throw new Error('useStore must be used within a StoreProvider');
    }
    return context;
}
