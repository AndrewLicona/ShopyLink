'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { ToggleSwitch } from '@/components/atoms/ToggleSwitch';

interface ToggleCardProps {
    icon: React.ElementType;
    title: string;
    description?: string;
    checked: boolean;
    onChange: (next: boolean) => void;
    /** `compact` para cards pequeñas (auto-generar enlace). */
    compact?: boolean;
    children?: React.ReactNode;
}

/**
 * Card de configuración con icono, texto y switch.
 *
 * En móvil el switch baja a su propia línea (como en Apariencia, que ya se ve
 * bien) para que el texto largo no lo aplaste; desde `sm` vuelve a la misma
 * línea y el switch queda a la derecha.
 */
export function ToggleCard({
    icon: Icon,
    title,
    description,
    checked,
    onChange,
    compact = false,
    children,
}: ToggleCardProps) {
    return (
        <div
            onClick={() => onChange(!checked)}
            className={cn(
                'group cursor-pointer relative overflow-hidden transition-all',
                'rounded-3xl border-2',
                compact ? 'p-4' : 'p-4 md:p-6',
                checked
                    ? 'border-[var(--primary)] bg-[var(--primary)]/5 shadow-md shadow-[var(--primary)]/10'
                    : 'border-[var(--border)] bg-[var(--surface)]'
            )}
        >
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 md:gap-4 relative z-10">
                <div className="flex items-center gap-3 md:gap-4 min-w-0">
                    <div
                        className={cn(
                            'rounded-2xl flex items-center justify-center transition-all shrink-0',
                            compact ? 'w-10 h-10' : 'w-10 h-10 md:w-12 md:h-12',
                            checked
                                ? 'bg-[var(--primary)] text-white scale-105 shadow-lg'
                                : 'bg-[var(--secondary)] text-[var(--text)]/20'
                        )}
                    >
                        <Icon className={compact ? 'w-5 h-5' : 'w-5 h-5 md:w-6 md:h-6'} />
                    </div>

                    <div className="min-w-0 space-y-0.5 md:space-y-1">
                        <p
                            className={cn(
                                'font-black transition-colors leading-tight',
                                compact ? 'text-sm' : 'text-sm md:text-base',
                                checked ? 'text-[var(--text)]' : 'text-[var(--text)]/40'
                            )}
                        >
                            {title}
                        </p>
                        {description && (
                            <p className="text-[10px] md:text-xs font-bold uppercase tracking-wider text-[var(--text)]/30 leading-snug">
                                {description}
                            </p>
                        )}
                    </div>
                </div>

                <div className="w-full sm:w-auto flex justify-end shrink-0">
                    <ToggleSwitch checked={checked} onChange={onChange} label={title} />
                </div>
            </div>

            {children}
        </div>
    );
}
