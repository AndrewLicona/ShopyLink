'use client';

import { CalendarDays } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DateInputProps {
    value: string;
    onChange: (value: string) => void;
    label: string;
    min?: string;
    max?: string;
    className?: string;
}

export function DateInput({ value, onChange, label, min, max, className }: DateInputProps) {
    return <span className={cn('relative block min-w-0', className)}><input type="date" aria-label={label} value={value} min={min} max={max} onChange={event => onChange(event.target.value)} className="styled-date-input block min-h-11 w-full min-w-0 rounded-xl border border-[var(--border)] bg-[var(--bg)] py-2.5 pl-2.5 pr-10 text-xs font-semibold sm:text-sm text-[var(--text)] outline-none transition-colors hover:border-[var(--primary)]/50 focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20" /><CalendarDays aria-hidden="true" className="styled-date-icon pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--primary)]" /></span>;
}
