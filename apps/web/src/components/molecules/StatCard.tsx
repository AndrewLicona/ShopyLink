'use client';

import React from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCardProps {
    icon: LucideIcon;
    label: string;
    value: string | number;
    trend?: string;
    color?: 'primary' | 'orange' | 'green' | 'red';
    className?: string;
}

export function StatCard({
    icon: Icon,
    label,
    value,
    trend,
    color = 'primary',
    className
}: StatCardProps) {
    const colors = {
        primary: 'bg-blue-500/10 text-blue-600',
        orange: 'bg-orange-500/10 text-orange-600',
        green: 'bg-green-500/10 text-green-600',
        red: 'bg-red-500/10 text-red-600',
    };

    return (
        <div className={cn(
            "p-5 md:p-6 bg-white border border-[var(--border)] rounded-[2.5rem] shadow-sm flex items-center gap-5 hover:shadow-md transition-all group min-w-0",
            className
        )}>
            <div className={cn("p-4 rounded-full shrink-0 group-hover:scale-110 transition-transform shadow-sm", colors[color])}>
                <Icon className="w-6 h-6 md:w-7 md:h-7" />
            </div>
            <div className="flex flex-col min-w-0 pr-2">
                <p className="text-[var(--text)]/40 text-[10px] md:text-xs font-black uppercase tracking-widest truncate mb-1">
                    {label}
                </p>
                <p className="text-xl md:text-2xl font-black text-[var(--text)] tracking-tight whitespace-nowrap">
                    {value}
                </p>
            </div>
        </div>
    );
}
