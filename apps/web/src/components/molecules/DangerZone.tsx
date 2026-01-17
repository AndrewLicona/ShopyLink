'use client';

import { useState } from 'react';
import { AlertTriangle, Trash2, Loader2 } from 'lucide-react';

interface DangerZoneProps {
    title: string;
    description: string;
    actionLabel: string;
    confirmationTitle: string;
    confirmationDescription: string;
    itemName: string;
    onDelete: () => Promise<void>;
}

export function DangerZone({
    title,
    description,
    actionLabel,
    confirmationTitle,
    confirmationDescription,
    itemName,
    onDelete
}: DangerZoneProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [confirmName, setConfirmName] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleDelete = async () => {
        if (confirmName !== itemName) return;
        setIsLoading(true);
        try {
            await onDelete();
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="mt-8 bg-red-50/50 rounded-[2.5rem] border border-red-100/50 overflow-hidden animate-in fade-in slide-in-from-bottom-4">
            <div className="p-8 md:p-12 space-y-8">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-red-500/10 text-red-600 rounded-2xl flex items-center justify-center">
                        <AlertTriangle className="w-6 h-6" />
                    </div>
                    <div>
                        <h2 className="text-xl font-black text-red-600 uppercase tracking-tight">{title}</h2>
                        <p className="text-red-500/60 font-medium text-sm">{description}</p>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 p-6 rounded-3xl bg-white/50 border border-red-100">
                    <div className="space-y-1">
                        <p className="font-black text-gray-900">{actionLabel}</p>
                        <p className="text-xs text-red-500/60 font-bold uppercase tracking-tight">
                            {confirmationDescription}
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={() => setIsOpen(true)}
                        className="bg-red-500 text-white px-8 py-3.5 rounded-2xl font-black text-sm hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-red-500/20"
                    >
                        {actionLabel}
                    </button>
                </div>
            </div>

            {/* Confirmation Modal */}
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-[var(--surface)] w-full max-w-md rounded-[3rem] shadow-[var(--shadow-strong)] overflow-hidden animate-in zoom-in-95 duration-200 border border-[var(--border)]">
                        <div className="p-10 space-y-8 text-center">
                            <div className="flex flex-col items-center gap-4">
                                <div className="w-20 h-20 bg-red-500/10 text-red-600 rounded-[2rem] flex items-center justify-center">
                                    <Trash2 className="w-10 h-10" />
                                </div>
                                <div className="space-y-2">
                                    <h2 className="text-2xl font-black text-[var(--text)] uppercase tracking-tight">{confirmationTitle}</h2>
                                    <p className="text-[var(--text)]/40 font-bold text-sm">
                                        Esta acción es irreversible. Se eliminarán los datos de <span className="text-[var(--text)]">&quot;{itemName}&quot;</span>.
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-4 text-left">
                                <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text)]/40 px-1">
                                    Escribe el nombre para confirmar:
                                </label>
                                <input
                                    type="text"
                                    placeholder={itemName}
                                    value={confirmName}
                                    onChange={(e) => setConfirmName(e.target.value)}
                                    className="w-full px-6 py-4 rounded-2xl border-2 border-[var(--border)] focus:border-red-500 focus:ring-4 focus:ring-red-500/10 outline-none transition-all font-bold text-[var(--text)] bg-[var(--bg)]"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsOpen(false);
                                        setConfirmName('');
                                    }}
                                    className="py-4 px-6 rounded-2xl font-black text-sm transition-all active:scale-95 bg-[var(--bg)] text-[var(--text)]/40 border border-[var(--border)] hover:bg-[var(--secondary)]"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="button"
                                    onClick={handleDelete}
                                    disabled={confirmName !== itemName || isLoading}
                                    className="py-4 px-6 rounded-2xl font-black text-sm transition-all active:scale-95 bg-red-500 text-white shadow-lg shadow-red-500/20 enabled:hover:scale-[1.02] disabled:opacity-30 disabled:grayscale"
                                >
                                    {isLoading ? (
                                        <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                                    ) : (
                                        'Confirmar'
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
