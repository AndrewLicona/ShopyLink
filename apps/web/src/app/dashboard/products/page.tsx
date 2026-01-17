'use client';

import { Suspense } from 'react';
import { useProducts } from '@/hooks/useProducts';
import { CategoryModal } from '@/features/catalogue/CategoryModal';
import { ProductGrid } from '@/features/catalogue/ProductGrid';
import { ProductFormModal } from '@/features/catalogue/ProductFormModal';
import {
    Plus,
    Search,
    Settings2,
    AlertCircle,
    X,
    Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';

function ProductsContent() {
    const hook = useProducts();
    const { state, actions } = hook;

    if (state.loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <Loader2 className="w-10 h-10 text-[var(--primary)] animate-spin" />
                <p className="text-[var(--text)]/40 font-medium">Cargando catálogo...</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black text-[var(--text)]">Catálogo</h1>
                    <p className="text-[var(--text)]/40 mt-1 font-medium">Gestiona tus productos y existencias.</p>
                </div>
                <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                    <button
                        onClick={() => actions.setIsCatModalOpen(true)}
                        className="p-4 bg-[var(--surface)] text-[var(--text)]/60 rounded-2xl hover:bg-[var(--secondary)] hover:text-[var(--primary)] border border-[var(--border)] transition-all active:scale-95 shrink-0"
                        title="Gestionar Categorías"
                    >
                        <Settings2 className="w-5 h-5" />
                    </button>
                    <button
                        onClick={actions.openCreateModal}
                        className="flex-1 md:flex-none inline-flex items-center justify-center gap-2 px-6 md:px-8 py-4 bg-[var(--primary)] text-white rounded-2xl font-black transition-all active:scale-95 shadow-xl shadow-[var(--primary)]/10 text-sm md:text-base whitespace-nowrap"
                    >
                        <Plus className="w-5 h-5" />
                        Nuevo Producto
                    </button>
                </div>
            </div>

            {/* Filters bar */}
            <div className="flex flex-col gap-4">
                <div className="relative group">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text)]/20 group-focus-within:text-[var(--primary)] transition-colors" />
                    <input
                        type="text"
                        placeholder="Buscar por nombre o descripción..."
                        className="w-full pl-14 pr-6 py-4 rounded-2xl bg-[var(--surface)] border border-[var(--border)] focus:border-[var(--primary)] outline-none transition-all font-medium text-[var(--text)] shadow-sm"
                        value={state.searchTerm}
                        onChange={(e) => actions.setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                    <select
                        className="flex-1 px-6 py-4 rounded-2xl bg-[var(--surface)] border border-[var(--border)] font-bold text-[var(--text)] outline-none focus:border-[var(--primary)] cursor-pointer appearance-none"
                        value={state.categoryFilter}
                        onChange={(e) => actions.setCategoryFilter(e.target.value)}
                    >
                        <option value="all">Todas las categorías</option>
                        {state.categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>

                    <div className="bg-[var(--surface)] border border-[var(--border)] p-1 rounded-2xl flex w-full sm:w-auto h-[60px] items-stretch">
                        {(['active', 'paused'] as const).map((tab) => (
                            <button
                                key={tab}
                                onClick={() => actions.setStatusTab(tab)}
                                className={cn(
                                    "flex-1 sm:w-40 px-6 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center",
                                    state.statusTab === tab ? "bg-[var(--text)] text-white shadow-lg" : "text-[var(--text)]/40 hover:text-[var(--text)]"
                                )}
                            >
                                {tab === 'active' ? 'En venta' : 'Pausados'}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Grid */}
            <ProductGrid hook={hook} />

            {/* Modals */}
            <ProductFormModal hook={hook} />
            <CategoryModal hook={hook} />

            {/* Confirmation Modal */}
            {state.confirmModal.show && (
                <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-[var(--surface)] w-full max-w-sm rounded-[2.5rem] p-8 shadow-[var(--shadow-strong)] animate-in zoom-in-95 text-center">
                        <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                            <AlertCircle className="w-8 h-8 text-red-500" />
                        </div>
                        <h3 className="text-xl font-black text-[var(--text)] mb-2">¿Estás seguro?</h3>
                        <p className="text-[var(--text)]/40 font-medium mb-8">
                            Se eliminará <span className="text-[var(--text)] font-bold">&quot;{state.confirmModal.name}&quot;</span> permanentemente.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => actions.setConfirmModal(prev => ({ ...prev, show: false }))}
                                className="flex-1 py-4 px-6 rounded-2xl font-black text-[var(--text)]/40 hover:bg-[var(--secondary)] transition-all"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={actions.confirmDeleteAction}
                                className="flex-1 py-4 px-6 bg-red-500 text-white rounded-2xl font-black hover:bg-red-600 transition-all shadow-lg shadow-red-500/10"
                            >
                                Eliminar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Simple Alert */}
            {state.errorAlert.show && (
                <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[200] animate-in slide-in-from-bottom-5">
                    <div className="bg-red-500 text-white px-8 py-4 rounded-2xl shadow-2xl flex items-center gap-4">
                        <AlertCircle className="w-6 h-6" />
                        <div className="text-left">
                            <p className="font-black text-sm uppercase tracking-widest">{state.errorAlert.title}</p>
                            <p className="text-xs font-bold opacity-80">{state.errorAlert.message}</p>
                        </div>
                        <button onClick={() => actions.setErrorAlert(prev => ({ ...prev, show: false }))} className="ml-4 p-1 hover:bg-white/10 rounded-lg">
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default function ProductsPage() {
    return (
        <Suspense fallback={
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="w-10 h-10 text-[var(--primary)] animate-spin" />
            </div>
        }>
            <ProductsContent />
        </Suspense>
    );
}
