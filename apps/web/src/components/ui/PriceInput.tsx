'use client';

import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface PriceInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange'> {
    value: string | number;
    onChange: (val: string) => void;
    icon?: React.ReactNode;
}

export function PriceInput({ value, onChange, icon, className, ...props }: PriceInputProps) {
    const [displayValue, setDisplayValue] = useState('');

    useEffect(() => {
        if (value === null || value === undefined || value === '') {
            setDisplayValue('');
            return;
        }
        // Solo para seteo inicial desde estado global
        const numericStr = String(value).replace(/\D/g, '');
        if (numericStr) {
            setDisplayValue(Number(numericStr).toLocaleString('es-CO'));
        } else {
            setDisplayValue('');
        }
    }, [value]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const raw = e.target.value.replace(/\D/g, '');
        if (raw === '') {
            onChange('');
            setDisplayValue('');
        } else {
            onChange(raw);
            setDisplayValue(Number(raw).toLocaleString('es-CO'));
        }
    };

    return (
        <div className="relative">
            {icon && (
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text)]/40 font-bold z-10 pointer-events-none">
                    {icon}
                </span>
            )}
            <input
                {...props}
                type="text"
                inputMode="numeric"
                value={displayValue}
                onChange={handleChange}
                className={cn(
                    "w-full pr-5 py-3.5 rounded-2xl border-2 outline-none transition-all font-bold",
                    icon ? "pl-8" : "pl-5",
                    className
                )}
            />
        </div>
    );
}
