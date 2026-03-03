'use client';

import React from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCardProps {
    icon: LucideIcon;
    label: string;
    value: string | number;
    statusLabel?: string;
    color?: 'primary' | 'orange' | 'green' | 'red' | 'teal';
    className?: string;
}

export function StatCard({
    icon: Icon,
    label,
    value,
    statusLabel = 'Normal',
    color = 'primary',
    className
}: StatCardProps) {
    const variants = {
        primary: 'bg-[#1e293b] text-white', // Dark Slate
        teal: 'bg-[#064e3b] text-white', // Deep Teal (Gallagher style)
        green: 'bg-[#064e3b] text-white',
        orange: 'bg-[#7c2d12] text-white', // Deep Orange
        red: 'bg-[#7f1d1d] text-white',
    };

    const statusColors = {
        primary: 'bg-blue-400/20 text-blue-300',
        teal: 'bg-emerald-400/20 text-emerald-300',
        green: 'bg-emerald-400/20 text-emerald-300',
        orange: 'bg-orange-400/20 text-orange-300',
        red: 'bg-rose-400/20 text-rose-300',
    };

    return (
        <div className={cn(
            "p-5 md:p-6 rounded-2xl shadow-sm flex flex-col justify-between transition-all group min-h-[120px] md:min-h-[140px] relative overflow-hidden",
            variants[color],
            className
        )}>
            {/* Background Pattern/Glow */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-white/10 transition-colors" />

            <div className="flex justify-between items-start z-10">
                <div className="p-2 rounded-lg bg-white/10 shrink-0">
                    <Icon className="w-4 h-4 md:w-5 md:h-5 text-white/80" />
                </div>
                <span className={cn(
                    "text-[8px] md:text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md",
                    statusColors[color]
                )}>
                    {statusLabel}
                </span>
            </div>

            <div className="mt-4 z-10">
                <p className="text-white/60 text-[10px] md:text-xs font-black uppercase tracking-widest mb-1">
                    {label}
                </p>
                <div className="flex items-baseline gap-2">
                    <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight">
                        {value}
                    </h2>
                </div>
            </div>
        </div>
    );
}
