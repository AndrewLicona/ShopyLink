'use client';

import { Clock, Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { DayKey } from '@/lib/businessHours';

export interface BusinessHoursValue {
    [key: string]: { open: string; close: string } | null;
}

const DAYS: { key: DayKey; label: string; short: string }[] = [
    { key: 'mon', label: 'Lunes', short: 'Lun' },
    { key: 'tue', label: 'Martes', short: 'Mar' },
    { key: 'wed', label: 'Miércoles', short: 'Mié' },
    { key: 'thu', label: 'Jueves', short: 'Jue' },
    { key: 'fri', label: 'Viernes', short: 'Vie' },
    { key: 'sat', label: 'Sábado', short: 'Sáb' },
    { key: 'sun', label: 'Domingo', short: 'Dom' },
];

const DEFAULT_OPEN = '08:00';
const DEFAULT_CLOSE = '18:00';

/**
 * Editor of the weekly opening hours.
 *
 * A day with no entry means "closed". Leaving the whole week empty means the
 * store did not configure a schedule, which the storefront interprets as
 * "always open" (no badge restriction).
 */
export function BusinessHoursEditor({
    value,
    onChange,
}: {
    value: BusinessHoursValue;
    onChange: (next: BusinessHoursValue) => void;
}) {
    const isOpen = (key: string) => Boolean(value?.[key]);

    const toggleDay = (key: DayKey) => {
        const next = { ...(value || {}) };
        if (next[key]) {
            next[key] = null;
        } else {
            next[key] = { open: DEFAULT_OPEN, close: DEFAULT_CLOSE };
        }
        onChange(next);
    };

    const setTime = (key: DayKey, field: 'open' | 'close', time: string) => {
        const next = { ...(value || {}) };
        const current = next[key] || { open: DEFAULT_OPEN, close: DEFAULT_CLOSE };
        next[key] = { ...current, [field]: time };
        onChange(next);
    };

    const copyToAll = () => {
        const source = Object.entries(value || {}).find(([, v]) => v)?.[1];
        const template = source || { open: DEFAULT_OPEN, close: DEFAULT_CLOSE };
        const next: BusinessHoursValue = {};
        DAYS.forEach((day) => {
            next[day.key] = { ...template };
        });
        onChange(next);
    };

    const clearAll = () => onChange({});

    const configuredDays = DAYS.filter((day) => isOpen(day.key)).length;

    return (
        <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 sm:gap-4">
                <div className="min-w-0">
                    <label className="text-sm font-bold text-[var(--text)]/60 mb-1 block px-1 flex items-center gap-2">
                        <Clock className="w-4 h-4 text-[var(--primary)]" />
                        Horario de atención
                    </label>
                    <p className="text-xs font-bold text-[var(--text)]/40 px-1">
                        {configuredDays === 0
                            ? 'Sin configurar: tu tienda se muestra siempre como abierta.'
                            : `${configuredDays} ${configuredDays === 1 ? 'día abierto' : 'días abiertos'}.`}
                    </p>
                </div>
                <div className="flex gap-4 shrink-0">
                    <button
                        type="button"
                        onClick={copyToAll}
                        className="text-xs font-bold text-[var(--primary)] hover:opacity-70 transition-opacity"
                    >
                        Copiar a todos
                    </button>
                    <button
                        type="button"
                        onClick={clearAll}
                        className="text-xs font-bold text-[var(--text)]/30 hover:text-red-500 transition-colors"
                    >
                        Limpiar
                    </button>
                </div>
            </div>

            <div className="space-y-2">
                {DAYS.map((day) => {
                    const hours = value?.[day.key];
                    const open = Boolean(hours);

                    return (
                        <div
                            key={day.key}
                            className={cn(
                                'flex flex-col sm:flex-row sm:items-center gap-3 p-3 rounded-2xl border-2 transition-all',
                                open
                                    ? 'border-[var(--primary)]/30 bg-[var(--primary)]/5'
                                    : 'border-[var(--border)] bg-[var(--surface)]',
                            )}
                        >
                            <div className="flex items-center gap-3 min-w-0">
                                <button
                                    type="button"
                                    onClick={() => toggleDay(day.key)}
                                    className={cn(
                                        'w-11 h-11 rounded-xl flex items-center justify-center font-black text-xs shrink-0 transition-all active:scale-90',
                                        open
                                            ? 'bg-[var(--primary)] text-white'
                                            : 'bg-[var(--secondary)] text-[var(--text)]/30',
                                    )}
                                    aria-label={open ? `Cerrar ${day.label}` : `Abrir ${day.label}`}
                                >
                                    {day.short}
                                </button>

                                <span className="sm:hidden font-black text-sm text-[var(--text)]">
                                    {day.label}
                                </span>
                            </div>

                            {open ? (
                                <div className="flex flex-col sm:flex-row sm:items-center gap-2 flex-1 min-w-0">
                                    <input
                                        type="time"
                                        value={hours?.open || DEFAULT_OPEN}
                                        onChange={(e) => setTime(day.key, 'open', e.target.value)}
                                        aria-label={`Hora de apertura del ${day.label}`}
                                        className="w-full min-w-0 px-3 py-2.5 rounded-xl border-2 border-[var(--border)] bg-[var(--bg)] text-sm font-bold text-[var(--text)] focus:border-[var(--primary)] focus:ring-4 focus:ring-[var(--primary)]/10 outline-none transition-all"
                                    />
                                    <span className="hidden sm:inline text-xs font-black text-[var(--text)]/30">a</span>
                                    <input
                                        type="time"
                                        value={hours?.close || DEFAULT_CLOSE}
                                        onChange={(e) => setTime(day.key, 'close', e.target.value)}
                                        aria-label={`Hora de cierre del ${day.label}`}
                                        className="w-full min-w-0 px-3 py-2.5 rounded-xl border-2 border-[var(--border)] bg-[var(--bg)] text-sm font-bold text-[var(--text)] focus:border-[var(--primary)] focus:ring-4 focus:ring-[var(--primary)]/10 outline-none transition-all"
                                    />
                                </div>
                            ) : (
                                <div className="flex-1 flex items-center gap-2 text-[var(--text)]/30">
                                    <X className="w-4 h-4 shrink-0" />
                                    <span className="text-xs font-bold">Cerrado</span>
                                </div>
                            )}

                            {open && (
                                <Check className="w-4 h-4 text-[var(--primary)] shrink-0 hidden sm:block" />
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
