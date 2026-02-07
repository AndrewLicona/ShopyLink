'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success';
    size?: 'sm' | 'md' | 'lg' | 'xl';
    isLoading?: boolean;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
}

export function Button({
    className,
    variant = 'primary',
    size = 'md',
    isLoading,
    leftIcon,
    rightIcon,
    children,
    disabled,
    ...props
}: ButtonProps) {
    const variants = {
        primary: 'bg-[var(--primary)] text-white shadow-lg shadow-[var(--primary)]/10 hover:opacity-90 active:scale-95',
        secondary: 'bg-[var(--secondary)] text-[var(--text)]/60 hover:bg-[var(--secondary)]/80 hover:text-[var(--primary)] active:scale-95',
        outline: 'bg-transparent border border-[var(--border)] text-[var(--text)]/60 hover:border-[var(--primary)] hover:text-[var(--primary)] active:scale-95',
        ghost: 'bg-transparent text-[var(--text)]/40 hover:bg-[var(--secondary)] hover:text-[var(--text)] active:scale-95',
        danger: 'bg-red-500/10 text-red-600 hover:bg-red-500/20 active:scale-95',
        success: 'bg-green-500/10 text-green-600 hover:bg-green-500/20 active:scale-95',
    };

    const sizes = {
        sm: 'px-4 py-2 text-[10px] rounded-xl',
        md: 'px-6 py-3 text-xs rounded-2xl',
        lg: 'px-8 py-4 text-sm rounded-2xl',
        xl: 'px-10 py-5 text-base rounded-[2rem]',
    };

    return (
        <button
            className={cn(
                'inline-flex items-center justify-center gap-2 font-black uppercase tracking-widest transition-all disabled:opacity-50 disabled:pointer-events-none outline-none',
                variants[variant],
                sizes[size],
                className
            )}
            disabled={disabled || isLoading}
            {...props}
        >
            {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin text-current" />
            ) : (
                <>
                    {leftIcon && <span className="shrink-0">{leftIcon}</span>}
                    {children}
                    {rightIcon && <span className="shrink-0">{rightIcon}</span>}
                </>
            )}
        </button>
    );
}
