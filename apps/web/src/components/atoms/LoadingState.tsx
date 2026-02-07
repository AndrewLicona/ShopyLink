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
            <div className="relative">
                <Loader2 className="w-10 h-10 text-[var(--primary)] animate-spin" />
                <div className="absolute inset-0 bg-[var(--primary)]/10 blur-xl rounded-full animate-pulse" />
            </div>
            <p className="text-[var(--text)]/40 font-bold text-xs md:text-sm uppercase tracking-widest">{message}</p>
        </div>
    );
}
