'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface ToggleSwitchProps {
    checked: boolean;
    onChange: (next: boolean) => void;
    /** Texto accesible: describe qué activa el switch. */
    label: string;
    className?: string;
}

/**
 * Interruptor (switch) único del panel.
 *
 * Antes cada sección tenía su propia versión (w-12/h-7, w-14/h-8, w-12/h-6.5)
 * y en móvil el texto largo aplastaba el control. Este átomo tiene siempre el
 * mismo tamaño, nunca se encoge (`shrink-0`) y expone el estado con
 * `role="switch"` para lectores de pantalla.
 */
export function ToggleSwitch({ checked, onChange, label, className }: ToggleSwitchProps) {
    return (
        <button
            type="button"
            role="switch"
            aria-checked={checked}
            aria-label={label}
            onClick={(e) => {
                // La card que envuelve este botón también es clicable: sin esto
                // el cambio se aplicaría dos veces.
                e.stopPropagation();
                onChange(!checked);
            }}
            className={cn(
                'relative shrink-0 w-14 h-8 rounded-full p-1 border border-black/5 shadow-inner transition-colors duration-300',
                checked ? 'bg-[var(--primary)]' : 'bg-[var(--border)]',
                className
            )}
        >
            <span
                className={cn(
                    'block w-6 h-6 rounded-full bg-white shadow-md transition-transform duration-300 ease-out',
                    checked ? 'translate-x-6' : 'translate-x-0'
                )}
            />
        </button>
    );
}
