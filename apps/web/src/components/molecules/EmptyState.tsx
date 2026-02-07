'use client';

import React from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
    icon: LucideIcon;
    title: string;
    description: string;
    children?: React.ReactNode;
    className?: string;
}

export function EmptyState({
    icon: Icon,
    title,
    description,
    children,
    className
}: EmptyStateProps) {
    return (
        <div className={cn("p-12 md:p-20 text-center flex flex-col items-center justify-center gap-6", className)}>
            <div className="w-16 md:w-20 h-16 md:h-20 bg-[var(--bg)] rounded-full flex items-center justify-center text-[var(--text)]/20 shadow-inner">
                <Icon className="w-8 md:w-10 h-8 md:h-10" />
            </div>
            <div className="max-w-xs mx-auto">
                <h3 className="text-lg md:text-xl font-bold text-[var(--text)]">{title}</h3>
                <p className="text-[var(--text)]/40 mt-2 text-sm md:text-base font-medium">
                    {description}
                </p>
            </div>
            {children && (
                <div className="mt-2">
                    {children}
                </div>
            )}
        </div>
    );
}
