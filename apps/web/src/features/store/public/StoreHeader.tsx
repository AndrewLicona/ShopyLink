import Image from 'next/image';
import { ShoppingBag, MapPin, ExternalLink, Store as StoreIcon } from 'lucide-react';
import type { Store } from '@/types/types';
import { isStoreOpen } from '@/lib/businessHours';

interface StoreHeaderProps {
    store: Store;
    cartCount: number;
    onOpenCart: () => void;
}

export function StoreHeader({ store, cartCount, onOpenCart }: StoreHeaderProps) {
    const open = isStoreOpen(store?.businessHours);

    return (
        <header className="bg-[var(--bg)] border-b border-[var(--border)] sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between min-h-20 py-3 gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                        <div className="w-12 h-12 bg-[var(--surface)] rounded-2xl overflow-hidden shadow-sm flex items-center justify-center border border-[var(--border)] relative shrink-0">
                            {store?.logoUrl ? (
                                <Image
                                    src={store.logoUrl}
                                    alt={store.name}
                                    fill
                                    className="object-contain"
                                    sizes="48px"
                                />
                            ) : (
                                <StoreIcon className="w-5 h-5 text-[var(--text)]/30" />
                            )}
                        </div>
                        <div className="min-w-0">
                            <h1 className="text-lg sm:text-xl font-black text-[var(--text)] uppercase tracking-tight leading-tight truncate">
                                {store?.name || 'Cargando...'}
                            </h1>
                            <div className="flex items-center gap-2 flex-wrap mt-0.5">
                                <p className={`text-[10px] font-black uppercase tracking-widest flex items-center gap-1 ${open ? 'text-green-600' : 'text-gray-400'}`}>
                                    <span className={`w-1.5 h-1.5 rounded-full ${open ? 'bg-green-500' : 'bg-gray-400'}`} />
                                    {open ? 'Abierto ahora' : 'Cerrado'}
                                </p>
                                {store?.referenceLocation && (
                                    <span className="text-[10px] text-[var(--text)]/60 font-medium flex items-center gap-1 truncate max-w-[200px] sm:max-w-xs">
                                        <MapPin className="w-3 h-3 shrink-0 text-[var(--primary)]" />
                                        {store.mapsUrl ? (
                                            <a
                                                href={store.mapsUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="underline hover:text-[var(--primary)] transition-colors flex items-center gap-0.5 truncate"
                                            >
                                                <span className="truncate">{store.referenceLocation}</span>
                                                <ExternalLink className="w-2.5 h-2.5 shrink-0" />
                                            </a>
                                        ) : (
                                            <span className="truncate">{store.referenceLocation}</span>
                                        )}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                        <button
                            onClick={onOpenCart}
                            className="relative p-3 bg-[var(--primary)] text-[var(--bg)] rounded-2xl hover:scale-105 transition-all active:scale-95 shadow-md shadow-[var(--primary)]/20"
                            aria-label="Abrir carrito"
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
