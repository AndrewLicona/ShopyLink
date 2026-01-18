'use client';

import { X, Plus, Trash2 } from 'lucide-react';
import { useProducts } from '@/hooks/useProducts';

interface CategoryModalProps {
    hook: ReturnType<typeof useProducts>;
}

export function CategoryModal({ hook }: CategoryModalProps) {
    const { state, actions } = hook;

    if (!state.isCatModalOpen) return null;

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
            <div className="bg-[var(--surface)] w-full max-w-md rounded-[2.5rem] md:rounded-[3rem] shadow-[var(--shadow-strong)] overflow-hidden animate-in zoom-in-95 duration-300 ring-1 ring-black/5">
                <div className="p-6 md:p-10 space-y-6 md:space-y-8">
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <h2 className="text-xl md:text-2xl font-black text-[var(--text)] leading-tight">Categorías</h2>
                            <p className="text-[var(--text)]/40 font-bold text-[10px] md:text-xs uppercase tracking-widest">Organiza tu catálogo</p>
                        </div>
                        <button
                            onClick={() => actions.setIsCatModalOpen(false)}
                            className="p-3 bg-[var(--secondary)] hover:bg-[var(--secondary)]/80 rounded-2xl transition-all active:scale-90"
                        >
                            <X className="w-5 h-5 text-[var(--text)]/40" />
                        </button>
                    </div>

                    <form onSubmit={actions.handleCreateCategory} className="flex gap-2">
                        <input
                            type="text"
                            placeholder="Ej: Accesorios, Ropa..."
                            className="flex-1 px-5 py-4 rounded-2xl border-2 border-[var(--border)] focus:border-[var(--primary)] outline-none font-bold text-[var(--text)] bg-[var(--bg)] transition-all placeholder:text-[var(--text)]/30 text-sm md:text-base"
                            value={state.form.newCatName}
                            onChange={(e) => actions.setNewCatName(e.target.value)}
                        />
                        <button
                            type="submit"
                            disabled={!state.form.newCatName.trim()}
                            className="bg-[var(--primary)] text-[var(--primary-foreground)] px-5 rounded-2xl font-black hover:opacity-95 transition-all active:scale-90 disabled:opacity-30 disabled:grayscale"
                        >
                            <Plus className="w-6 h-6" />
                        </button>
                    </form>

                    <div className="space-y-3 max-h-[350px] overflow-y-auto custom-scrollbar pr-2 -mr-2">
                        {state.categories.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 text-center gap-4 opacity-40">
                                <div className="w-16 h-16 bg-[var(--secondary)] rounded-full flex items-center justify-center">
                                    <Plus className="w-8 h-8" />
                                </div>
                                <p className="font-bold text-sm max-w-[200px]">Crea categorías para organizar tu tienda.</p>
                            </div>
                        ) : (
                            state.categories.map(cat => (
                                <div key={cat.id} className="flex items-center justify-between p-4 bg-[var(--secondary)]/40 rounded-2xl group transition-all hover:bg-[var(--surface)] hover:ring-2 hover:ring-[var(--primary)]/20 shadow-sm border border-black/[0.03]">
                                    <span className="font-black text-[var(--text)] text-sm md:text-base">{cat.name}</span>
                                    <button
                                        onClick={() => actions.setConfirmModal({ show: true, type: 'category', id: cat.id, name: cat.name })}
                                        className="p-2.5 text-[var(--text)]/20 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all active:scale-90"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
