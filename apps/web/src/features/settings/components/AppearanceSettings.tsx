'use client';

import React from 'react';
import { Sun, Moon, Palette, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AppearanceSettingsProps {
    theme: string;
    mode: string;
    applyToDashboard: boolean;
    onThemeChange: (theme: string) => void;
    onModeChange: (mode: string) => void;
    onApplyToDashboardChange: (apply: boolean) => void;
}

export function AppearanceSettings({
    theme,
    mode,
    applyToDashboard,
    onThemeChange,
    onModeChange,
    onApplyToDashboardChange
}: AppearanceSettingsProps) {
    const themes = [
        { id: 'classic', name: 'Classic', desc: 'Profesional', colors: ['#2563eb', '#ffffff'] },
        { id: 'fresh', name: 'Fresh', desc: 'Natural', colors: ['#10b981', '#ffffff'] },
        { id: 'modern', name: 'Modern', desc: 'Elegante', colors: ['#6366f1', '#ffffff'] },
        { id: 'minimal', name: 'Minimal', desc: 'Simple', colors: ['#18181b', '#ffffff'] },
        { id: 'gold', name: 'Gold', desc: 'Premium', colors: ['#d4af37', '#111827'] },
        { id: 'pastel', name: 'Pastel', desc: 'Suave', colors: ['#f8bbd0', '#ffffff'] },
        { id: 'lilac', name: 'Lilac', desc: 'Dulce', colors: ['#d1c4e9', '#ffffff'] },
        { id: 'sunset', name: 'Sunset', desc: 'Cálido', colors: ['#f97316', '#ffffff'] },
        { id: 'ocean', name: 'Ocean', desc: 'Fresco', colors: ['#06b6d4', '#ffffff'] },
        { id: 'berry', name: 'Berry', desc: 'Vibrante', colors: ['#db2777', '#ffffff'] },
        { id: 'forest', name: 'Forest', desc: 'Orgánico', colors: ['#059669', '#ffffff'] },
        { id: 'corporate', name: 'Corp', desc: 'Serio', colors: ['#475569', '#ffffff'] },
        { id: 'gray', name: 'Gray', desc: 'Neutro', colors: ['#9ca3af', '#ffffff'] },
        { id: 'dark-gray', name: 'Dark Gray', desc: 'Sobrio', colors: ['#4b5563', '#ffffff'] },
    ];

    const modes = [
        { id: 'light', icon: Sun, label: 'CLARO', cls: 'border-yellow-500 bg-yellow-50/10 text-yellow-600' },
        { id: 'beige', label: 'BEIGE', cls: 'border-[#d2b48c] bg-[#f5f5dc] text-[#4a3728]' },
        { id: 'gray', label: 'GRIS', cls: 'border-gray-400 bg-gray-100 text-gray-700' },
        { id: 'dark', icon: Moon, label: 'OSCURO', cls: 'border-gray-900 bg-gray-900 text-white' },
        { id: 'dark-gray', label: 'D-GRIS', cls: 'border-slate-600 bg-slate-700 text-slate-100' },
        { id: 'dark-blue', label: 'D-AZUL', cls: 'border-blue-900 bg-blue-950 text-blue-100' },
    ];

    return (
        <div className="space-y-12">
            <div className="space-y-8">
                <h3 className="text-sm font-black uppercase tracking-widest text-yellow-500">Diseño y Colores</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4">
                    {themes.map((t) => (
                        <button
                            key={t.id}
                            type="button"
                            onClick={() => onThemeChange(t.id)}
                            className={cn(
                                "p-4 rounded-3xl border-2 transition-all text-left flex flex-col gap-4",
                                theme === t.id ? 'border-[var(--primary)] bg-[var(--primary)]/5 ring-4 ring-[var(--primary)]/5 shadow-lg' : 'border-[var(--border)] bg-[var(--surface)] hover:border-[var(--text)]/10'
                            )}
                        >
                            <div className="flex gap-1">{t.colors.map((c, i) => <div key={i} className="w-5 h-5 rounded-full shadow-inner border border-black/5" style={{ backgroundColor: c }} />)}</div>
                            <div><p className="font-black text-sm text-[var(--text)]">{t.name}</p><p className="text-[10px] text-[var(--text)]/40 font-bold uppercase">{t.desc}</p></div>
                        </button>
                    ))}
                </div>
            </div>

            <div className="space-y-6">
                <div className="flex items-center justify-between px-1">
                    <h3 className="text-sm font-black uppercase tracking-widest text-purple-600">Modo de Visualización</h3>
                    <div className="flex gap-2 text-[8px] font-black uppercase tracking-widest opacity-20">
                        <span>3 Claros</span>
                        <span>•</span>
                        <span>3 Oscuros</span>
                    </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
                    {modes.map(m => (
                        <button key={m.id} type="button" onClick={() => onModeChange(m.id)} className={cn("p-6 rounded-2xl border-2 flex flex-col items-center justify-center gap-2 transition-all", mode === m.id ? m.cls : 'border-[var(--border)] text-[var(--text)]/40 hover:border-[var(--text)]/10 shadow-sm')}>
                            {m.icon ? <m.icon className="w-6 h-6" /> : <div className="w-6 h-6 rounded-full border-2 border-current opacity-50" />}
                            <span className="font-black text-[10px] tracking-widest">{m.label}</span>
                        </button>
                    ))}
                </div>
            </div>

            <div className="pt-6 border-t border-[var(--border)]">
                <div
                    onClick={() => onApplyToDashboardChange(!applyToDashboard)}
                    className={cn(
                        "group cursor-pointer p-4 md:p-6 rounded-3xl border-2 transition-all relative overflow-hidden",
                        applyToDashboard
                            ? "border-[var(--primary)] bg-[var(--primary)]/5 shadow-md shadow-[var(--primary)]/10"
                            : "border-[var(--border)] bg-[var(--surface)]"
                    )}
                >
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
                        <div className="flex items-center gap-3 md:gap-4">
                            <div className={cn(
                                "w-10 h-10 md:w-12 md:h-12 rounded-2xl flex items-center justify-center transition-all",
                                applyToDashboard ? "bg-[var(--primary)] text-white scale-110 shadow-lg" : "bg-[var(--secondary)] text-[var(--text)]/20"
                            )}>
                                <Palette className="w-5 h-5 md:w-6 md:h-6" />
                            </div>
                            <div className="space-y-0.5 md:space-y-1">
                                <p className={cn("font-black text-sm md:text-base transition-colors", applyToDashboard ? "text-[var(--text)]" : "text-[var(--text)]/40")}>
                                    Aplicar tema al Dashboard
                                </p>
                                <p className="text-[10px] md:text-xs text-[var(--text)]/30 font-bold uppercase tracking-wider">
                                    Personaliza tu panel de control
                                </p>
                            </div>
                        </div>
                        <div className="w-full sm:w-auto flex justify-end">
                            <div className={cn("w-14 h-8 rounded-full transition-all flex items-center px-1", applyToDashboard ? "bg-[var(--primary)]" : "bg-[var(--border)]")}>
                                <div className={cn("w-6 h-6 rounded-full bg-white shadow-xl transition-all transform", applyToDashboard ? "translate-x-6 scale-90" : "translate-x-0 scale-75")} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
