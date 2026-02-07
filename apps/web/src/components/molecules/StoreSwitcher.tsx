'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronDown, PlusCircle, Link as LinkIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Store } from '@/types/types';

interface StoreSwitcherProps {
    stores: Store[];
    activeStore: Store | null;
    setActiveStoreById: (id: string) => void;
    isOpen: boolean;
    setIsOpen: (open: boolean) => void;
    className?: string;
    variant?: 'mobile' | 'desktop';
}

export function StoreSwitcher({
    stores,
    activeStore,
    setActiveStoreById,
    isOpen,
    setIsOpen,
    className,
    variant = 'desktop'
}: StoreSwitcherProps) {
    return (
        <div className={cn("relative", className)}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    "flex items-center gap-2.5 p-1 rounded-2xl bg-[var(--surface)] border border-[var(--border)] shadow-sm active:scale-95 transition-all",
                    variant === 'mobile' ? "pr-3" : "w-full p-2 hover:bg-[var(--secondary)] border-transparent"
                )}
            >
                <div className={cn(
                    "rounded-xl overflow-hidden relative border border-[var(--border)] bg-[var(--bg)] shadow-inner shrink-0",
                    variant === 'mobile' ? "w-9 h-9" : "w-10 h-10"
                )}>
                    {activeStore?.logoUrl ? (
                        <Image
                            src={activeStore.logoUrl}
                            alt="Logo"
                            fill
                            className="object-contain p-1.5"
                            sizes={variant === 'mobile' ? "36px" : "40px"}
                        />
                    ) : (
                        <div className="w-full h-full bg-[var(--primary)]/10 flex items-center justify-center text-[var(--primary)] font-black text-xs">
                            {activeStore?.name?.[0] || 'T'}
                        </div>
                    )}
                </div>
                <div className="flex flex-col items-start gap-0 flex-1 min-w-0">
                    <span className={cn(
                        "font-black text-[var(--text)] leading-none truncate",
                        variant === 'mobile' ? "text-[10px] max-w-[80px]" : "text-sm"
                    )}>
                        {activeStore?.name || 'Mi Tienda'}
                    </span>
                    <span className={cn(
                        "font-bold text-[var(--text)]/30 uppercase tracking-tighter",
                        variant === 'mobile' ? "text-[8px]" : "text-[10px] tracking-widest mt-1"
                    )}>
                        {variant === 'mobile' ? 'Cambiar' : 'Gestionar'}
                    </span>
                </div>
                <ChevronDown className={cn("text-[var(--text)]/30 shrink-0", variant === 'mobile' ? "w-3.5 h-3.5" : "w-4 h-4")} />
            </button>

            {isOpen && (
                <>
                    <div className="fixed inset-0 z-[60]" onClick={() => setIsOpen(false)} />
                    <div className={cn(
                        "absolute mt-2 bg-[var(--bg)] rounded-2xl shadow-xl border border-[var(--border)] z-[70] py-2 animate-in fade-in slide-in-from-top-2",
                        variant === 'mobile' ? "top-full left-0 w-64" : "top-full left-0 right-0 z-[110]"
                    )}>
                        <div className="px-4 py-2 text-[10px] font-bold text-[var(--text)]/40 uppercase tracking-widest">Mis Tiendas</div>
                        <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
                            {stores.map(s => (
                                <button
                                    key={s.id}
                                    onClick={() => {
                                        setActiveStoreById(s.id);
                                        setIsOpen(false);
                                    }}
                                    className={cn(
                                        "w-full flex items-center gap-3 px-4 py-3 hover:bg-[var(--secondary)] transition-colors text-left",
                                        activeStore?.id === s.id ? "bg-[var(--primary)]/10" : ""
                                    )}
                                >
                                    <div className="w-8 h-8 rounded-lg overflow-hidden border border-[var(--border)] bg-[var(--bg)] relative">
                                        {s.logoUrl ? (
                                            <Image src={s.logoUrl} alt={s.name} fill className="object-contain" sizes="32px" />
                                        ) : (
                                            <div className="w-full h-full bg-[var(--primary)]/10 flex items-center justify-center text-[var(--primary)] font-bold text-xs">{s.name[0]}</div>
                                        )}
                                    </div>
                                    <span className={cn("text-sm font-bold", activeStore?.id === s.id ? "text-[var(--primary)]" : "text-[var(--text)]")}>{s.name}</span>
                                </button>
                            ))}
                        </div>
                        <div className="h-px bg-[var(--border)] my-2" />
                        <Link
                            href="/setup"
                            className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-[var(--text)] hover:bg-[var(--secondary)]"
                            onClick={() => setIsOpen(false)}
                        >
                            <PlusCircle className="w-5 h-5 text-[var(--primary)]" />
                            Nueva Tienda
                        </Link>
                    </div>
                </>
            )}
        </div>
    );
}
