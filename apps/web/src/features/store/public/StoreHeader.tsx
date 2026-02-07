'use client';

import Image from 'next/image';
import { ShoppingBag } from 'lucide-react';
import type { Store } from '@/types/types';

interface StoreHeaderProps {
    store: Store;
    cartCount: number;
    onOpenCart: () => void;
}

export function StoreHeader({ store, cartCount, onOpenCart }: StoreHeaderProps) {
    return (
        <header className="bg-[var(--bg)] border-b border-[var(--border)] sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-20">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-transparent rounded-xl overflow-hidden shadow-sm flex items-center justify-center border border-transparent relative">
                            {store?.logoUrl ? (
                                <Image
                                    src={store.logoUrl}
                                    alt={store.name}
                                    fill
                                    className="object-contain"
                                    sizes="40px"
                                />
                            ) : '🏪'}
                        </div>
                        <div>
                            <h1 className="text-xl font-black text-[var(--text)] uppercase tracking-tight leading-tight">
                                {store?.name || 'Cargando...'}
                            </h1>
                            <p className="text-[10px] text-green-600 font-black uppercase tracking-widest flex items-center gap-1">
                                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]"></span>
                                Abierto ahora
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={onOpenCart}
                            className="relative p-3 bg-[var(--primary)] text-[var(--bg)] rounded-2xl hover:scale-105 transition-all active:scale-95"
                        >
                            <ShoppingBag className="w-5 h-5" />
                            {cartCount > 0 && (
                                <span className="absolute -top-1 -right-1 bg-[var(--text)] text-[var(--bg)] text-[9px] font-black w-5 h-5 flex items-center justify-center rounded-full border-2 border-[var(--bg)]">
                                    {cartCount}
                                </span>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </header>
    );
}
