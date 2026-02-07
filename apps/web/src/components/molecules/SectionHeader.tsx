'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface SectionHeaderProps {
    title: string;
    description?: string;
    children?: React.ReactNode;
    className?: string;
}

export function SectionHeader({
    title,
    description,
    children,
    className
}: SectionHeaderProps) {
    return (
        <div className={cn("flex flex-col md:flex-row md:items-center justify-between gap-6", className)}>
            <div className="flex items-start justify-between w-full md:w-auto gap-4">
                <div className="flex-1 min-w-0">
                    <h1 className="text-2xl md:text-3xl font-black text-[var(--text)] leading-tight break-words">
                        {title}
                    </h1>
                    {description && (
                        <p className="text-[var(--text)]/40 mt-1 text-sm md:text-base font-medium">
                            {description}
                        </p>
                    )}
                </div>
                {/* Mobile-only slot */}
                <div className="md:hidden flex items-center gap-2 shrink-0">
                    {children}
                </div>
            </div>

            <div className="hidden md:flex items-center gap-3">
                {children}
            </div>
        </div>
    );
}
