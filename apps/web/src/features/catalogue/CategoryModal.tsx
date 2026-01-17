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
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <div className="bg-[var(--surface)] w-full max-w-md rounded-[2.5rem] shadow-[var(--shadow-strong)] overflow-hidden p-8 space-y-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-black text-[var(--text)]">Categorías</h2>
                    <button onClick={() => actions.setIsCatModalOpen(false)} className="p-2 hover:bg-[var(--secondary)] rounded-xl transition-colors">
                        <X className="w-5 h-5 text-[var(--text)]/40" />
                    </button>
                </div>

                <form onSubmit={actions.handleCreateCategory} className="flex gap-2">
                    <input
                        type="text"
                        placeholder="Nueva categoría..."
                        className="flex-1 px-5 py-3 rounded-2xl border-2 border-[var(--border)] focus:border-[var(--primary)] outline-none font-bold text-[var(--text)] bg-[var(--bg)]"
                        value={state.form.newCatName}
                        onChange={(e) => actions.setNewCatName(e.target.value)}
                    />
                    <button type="submit" className="bg-[var(--primary)] text-[var(--bg)] px-4 rounded-2xl font-black hover:opacity-90 transition-all">
                        <Plus className="w-5 h-5" />
                    </button>
                </form>

                <div className="space-y-2 max-h-[300px] overflow-y-auto custom-scrollbar">
                    {state.categories.length === 0 ? (
                        <p className="text-center text-[var(--text)]/30 font-medium py-8">Crea categorías para organizar tu tienda.</p>
                    ) : (
                        state.categories.map(cat => (
                            <div key={cat.id} className="flex items-center justify-between p-4 bg-[var(--secondary)]/50 rounded-2xl group transition-all hover:bg-[var(--surface)] hover:ring-2 hover:ring-[var(--primary)]/20">
                                <span className="font-black text-[var(--text)]">{cat.name}</span>
                                <button onClick={() => actions.setConfirmModal({ show: true, type: 'category', id: cat.id, name: cat.name })} className="p-2 text-[var(--text)]/30 hover:text-red-500 transition-colors">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
