'use client';

import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface TabOption<T extends string> {
    id: T;
    label: string;
    icon: LucideIcon;
    color?: string; // Optional custom color for active state (e.g., pink-600)
}

interface TabSelectorProps<T extends string> {
    options: TabOption<T>[];
    activeTab: T;
    onTabChange: (id: T) => void;
    className?: string;
    variant?: 'standard' | 'premium';
}

export function TabSelector<T extends string>({
    options,
    activeTab,
    onTabChange,
    className,
    variant = 'standard'
}: TabSelectorProps<T>) {
    if (variant === 'premium') {
        return (
            <div className={cn("flex p-1.5 bg-[var(--surface)] border border-[var(--border)] rounded-[1.5rem] w-fit shadow-sm relative overflow-hidden group", className)}>
                {options.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => onTabChange(tab.id)}
                        className={cn(
                            "flex items-center gap-2.5 px-8 py-3 rounded-[1.1rem] font-black text-sm transition-all relative z-10",
                            activeTab === tab.id
                                ? "bg-[var(--bg)] text-[var(--primary)] shadow-sm border border-[var(--border)] scale-[1.02]"
                                : "text-[var(--text)]/40 hover:text-[var(--text)]/60 hover:bg-[var(--bg)]/50"
                        )}
                    >
                        <tab.icon className={cn("w-4 h-4 transition-transform", activeTab === tab.id && "scale-110")} />
                        <span>{tab.label}</span>
                    </button>
                ))}
            </div>
        );
    }

    return (
        <div className={cn("flex flex-col sm:flex-row sm:border-b sm:border-gray-200 mb-8 gap-2 sm:gap-0", className)}>
            {options.map((tab) => (
                <button
                    key={tab.id}
                    onClick={() => onTabChange(tab.id)}
                    type="button"
                    className={cn(
                        "px-6 py-4 text-sm font-black transition-all duration-300 flex items-center justify-center sm:justify-start gap-3 rounded-2xl sm:rounded-none sm:rounded-t-2xl sm:border-b-4",
                        activeTab === tab.id
                            ? tab.color
                                ? `bg-${tab.color}/10 text-${tab.color} border-${tab.color} sm:bg-${tab.color}/5`
                                : "bg-[var(--primary)] text-[var(--primary-foreground)] shadow-lg shadow-[var(--primary)]/20 sm:shadow-none sm:bg-[var(--primary)]/5 sm:text-[var(--primary)] sm:border-[var(--primary)]"
                            : "bg-[var(--surface)] text-[var(--text)]/60 border border-[var(--border)] sm:border-0 sm:border-transparent sm:bg-transparent hover:bg-[var(--secondary)] sm:hover:bg-[var(--primary)]/5 hover:text-[var(--text)]"
                    )}
                >
                    <tab.icon className="w-5 h-5 sm:w-4 sm:h-4" />
                    {tab.label.toUpperCase()}
                </button>
            ))}
        </div>
    );
}
