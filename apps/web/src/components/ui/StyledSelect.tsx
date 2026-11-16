'use client';

import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Check, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface SelectOption { value: string; label: string }
interface StyledSelectProps {
    value: string;
    onChange: (value: string) => void;
    options: SelectOption[];
    label: string;
    className?: string;
    disabled?: boolean;
}

/** Selector con navegación por teclado y menú adaptado al espacio disponible. */
export function StyledSelect({ value, onChange, options, label, className, disabled = false }: StyledSelectProps) {
    const [open, setOpen] = useState(false);
    const [active, setActive] = useState(0);
    const [placement, setPlacement] = useState<{ top: number; left: number; width: number; maxHeight: number; theme?: string; mode?: string } | null>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);
    const listRef = useRef<HTMLDivElement>(null);
    const listId = useId();
    const selectedIndex = options.findIndex(option => option.value === value);
    const selected = options[selectedIndex];
    const updatePosition = useCallback(() => {
        const button = buttonRef.current;
        if (!button) return;
        const rect = button.getBoundingClientRect();
        const availableBelow = window.innerHeight - rect.bottom - 12;
        const availableAbove = rect.top - 12;
        const desired = Math.min(300, options.length * 44 + 12);
        const above = availableBelow < Math.min(desired, 180) && availableAbove > availableBelow;
        const maxHeight = Math.max(80, Math.min(desired, above ? availableAbove : availableBelow));
        const width = Math.min(Math.max(rect.width, 220), window.innerWidth - 24);
        const theme = button.closest('[data-theme]')?.getAttribute('data-theme') || undefined;
        const mode = button.closest('[data-mode]')?.getAttribute('data-mode') || undefined;
        setPlacement({ top: above ? Math.max(8, rect.top - maxHeight - 6) : rect.bottom + 6, left: Math.max(12, Math.min(rect.left, window.innerWidth - width - 12)), width, maxHeight, theme, mode });
    }, [options.length]);
    useEffect(() => {
        if (!open) return;
        updatePosition();
        const outside = (event: PointerEvent) => {
            const target = event.target as Node;
            if (!buttonRef.current?.contains(target) && !listRef.current?.contains(target)) setOpen(false);
        };
        document.addEventListener('pointerdown', outside);
        window.addEventListener('resize', updatePosition);
        document.addEventListener('scroll', updatePosition, true);
        return () => { document.removeEventListener('pointerdown', outside); window.removeEventListener('resize', updatePosition); document.removeEventListener('scroll', updatePosition, true); };
    }, [open, updatePosition]);
    useEffect(() => {
        if (!open) return;
        const item = listRef.current?.querySelector<HTMLElement>(`[data-option-index="${active}"]`);
        item?.scrollIntoView({ block: 'nearest' });
    }, [active, open]);
    const show = () => { setActive(Math.max(0, selectedIndex)); setOpen(true); };
    const choose = (index: number) => {
        const option = options[index];
        if (option) onChange(option.value);
        setOpen(false);
        buttonRef.current?.focus();
    };
    const onKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
        if (event.key === 'Escape' && open) { event.preventDefault(); setOpen(false); }
        else if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
            event.preventDefault();
            if (!open) show();
            else setActive(index => Math.max(0, Math.min(options.length - 1, index + (event.key === 'ArrowDown' ? 1 : -1))));
        } else if (event.key === 'Home' && open) { event.preventDefault(); setActive(0); }
        else if (event.key === 'End' && open) { event.preventDefault(); setActive(options.length - 1); }
        else if ((event.key === 'Enter' || event.key === ' ') && open) { event.preventDefault(); choose(active); }
        else if (event.key === 'Tab') setOpen(false);
    };
    return <>
        <button ref={buttonRef} type="button" role="combobox" aria-label={label} aria-expanded={open} aria-controls={open ? listId : undefined} aria-activedescendant={open ? `${listId}-${active}` : undefined} aria-haspopup="listbox" disabled={disabled} onClick={() => open ? setOpen(false) : show()} onKeyDown={onKeyDown} className={cn('flex min-h-11 w-full min-w-0 items-center justify-between gap-3 rounded-xl border border-[var(--border)] bg-[var(--bg)] px-4 py-3 text-left text-sm font-bold text-[var(--text)] outline-none transition-colors hover:border-[var(--primary)]/50 focus-visible:border-[var(--primary)] focus-visible:ring-2 focus-visible:ring-[var(--primary)]/20 disabled:opacity-50', className)}><span className="truncate">{selected?.label || 'Selecciona una opción'}</span><ChevronDown aria-hidden="true" className={cn('h-4 w-4 shrink-0 text-[var(--text)]/45 transition-transform', open && 'rotate-180')} /></button>
        {open && placement && createPortal(<div ref={listRef} id={listId} role="listbox" aria-label={label} data-theme={placement.theme} data-mode={placement.mode} style={{ position: 'fixed', top: placement.top, left: placement.left, width: placement.width, maxHeight: placement.maxHeight }} className="z-[250] overflow-y-auto rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-1.5 text-[var(--text)] shadow-xl">{options.map((option, index) => <div key={option.value} id={`${listId}-${index}`} data-option-index={index} role="option" aria-selected={option.value === value} onPointerMove={() => setActive(index)} onClick={() => choose(index)} className={cn('flex min-h-10 cursor-pointer items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-sm', index === active ? 'bg-[var(--primary)]/10 text-[var(--primary)]' : 'text-[var(--text)]/75', option.value === value && 'font-bold')}><span className="min-w-0 break-words">{option.label}</span>{option.value === value && <Check className="h-4 w-4 shrink-0" />}</div>)}</div>, document.body)}
    </>;
}
