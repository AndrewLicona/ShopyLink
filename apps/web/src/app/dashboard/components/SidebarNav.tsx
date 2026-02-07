'use client';

import React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';

interface SidebarNavProps {
    items: {
        icon: LucideIcon;
        label: string;
        href: string;
    }[];
    pathname: string;
    onCloseMobile?: () => void;
}

export function SidebarNav({ items, pathname, onCloseMobile }: SidebarNavProps) {
    return (
        <nav className="flex-1 space-y-1 overflow-y-auto custom-scrollbar pr-1">
            <div className="px-4 py-2 text-[10px] font-bold text-[var(--text)]/20 uppercase tracking-[0.2em] mb-2">Menú Principal</div>
            {items.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                    <Link
                        key={item.href}
                        href={item.href}
                        onClick={onCloseMobile}
                        className={cn(
                            "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all group",
                            isActive
                                ? "bg-[var(--primary)]/10 text-[var(--primary)]"
                                : "text-[var(--text)]/60 hover:bg-[var(--secondary)] hover:text-[var(--text)]"
                        )}
                    >
                        <Icon className={cn("w-5 h-5", isActive ? "text-[var(--primary)]" : "text-[var(--text)]/40 group-hover:text-[var(--text)]/60")} />
                        {item.label}
                    </Link>
                );
            })}
        </nav>
    );
}
