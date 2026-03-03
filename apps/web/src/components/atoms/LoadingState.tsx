'use client';

import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LoadingStateProps {
    message?: string;
    fullPage?: boolean;
    className?: string;
}

export function LoadingState({
    message = 'Cargando datos...',
    fullPage = false,
    className
}: LoadingStateProps) {
    const containerClasses = cn(
        "flex flex-col items-center justify-center gap-4",
        fullPage ? "min-h-[80vh]" : "py-12 md:py-20",
        className
    );

    return (
        <div className={containerClasses}>
            <div className="relative p-8 rounded-[2rem] bg-[var(--surface)] border border-[var(--border)] shadow-[var(--shadow)] flex flex-col items-center gap-6">
                <div className="relative">
                    <Loader2 className="w-12 h-12 text-[var(--primary)] animate-spin" strokeWidth={3} />
                    <div className="absolute inset-0 bg-[var(--primary)]/20 blur-2xl rounded-full animate-pulse" />
                </div>
                <div className="space-y-1 text-center">
                    <p className="text-[var(--text)] font-black text-xs uppercase tracking-[0.2em]">{message}</p>
                    <p className="text-[var(--text)]/20 font-bold text-[8px] uppercase tracking-widest">ShopyLinks Platform</p>
                </div>
            </div>
        </div>
    );
}
