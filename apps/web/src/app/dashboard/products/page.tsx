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
    Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { LoadingState } from '@/components/atoms/LoadingState';
import { Button } from '@/components/atoms/Button';
import { SectionHeader } from '@/components/molecules/SectionHeader';

function ProductsContent() {
    const hook = useProducts();
    const { state, actions } = hook;

    if (state.loading) {
        return <LoadingState message="Cargando catálogo..." fullPage />;
    }

    return (
        <div className="space-y-8 pb-20">
            {/* Header */}
            <SectionHeader
                title="Catálogo"
                description="Gestiona tus productos"
            >
                <Button
                    variant="secondary"
                    onClick={() => actions.setIsCatModalOpen(true)}
                    className="p-3 md:p-3.5 rounded-2xl"
                    aria-label="Gestionar Categorías"
                >
                    <Settings2 className="w-5 h-5" />
                </Button>
                <Button
                    variant="primary"
                    onClick={actions.openCreateModal}
                    className="p-3 md:px-6 md:py-3 rounded-2xl"
                    leftIcon={<Plus className="w-6 h-6 md:w-5 md:h-5" />}
                >
                    <span className="hidden md:inline">Nuevo Producto</span>
                </Button>
            </SectionHeader>

            {/* Filters bar */}
            <div className="flex flex-col gap-3 md:gap-4">
                <div className="relative group">
                    <Search className="absolute left-4 md:left-5 top-1/2 -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-[var(--text)]/20 group-focus-within:text-[var(--primary)] transition-colors" />
                    <input
                        type="text"
                        placeholder="Buscar productos..."
                        className="w-full pl-11 md:pl-14 pr-6 py-3 md:py-4 rounded-xl md:rounded-2xl bg-[var(--surface)] border border-[var(--border)] focus:border-[var(--primary)] outline-none transition-all font-bold text-sm md:text-base text-[var(--text)] shadow-sm"
                        value={state.searchTerm}
                        onChange={(e) => actions.setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex flex-col sm:flex-row gap-2 md:gap-3">
                    <select
                        className="flex-1 px-4 md:px-6 py-3 md:py-4 rounded-xl md:rounded-2xl bg-[var(--surface)] border border-[var(--border)] font-bold text-sm md:text-base text-[var(--text)] outline-none focus:border-[var(--primary)] cursor-pointer appearance-none"
                        value={state.categoryFilter}
                        onChange={(e) => actions.setCategoryFilter(e.target.value)}
                    >
                        <option value="all">Categorías</option>
                        {state.categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>

                    <div className="bg-[var(--surface)] border border-[var(--border)] p-1 rounded-xl md:rounded-2xl flex w-full sm:w-auto h-[50px] md:h-[60px] items-stretch">
                        {(['active', 'paused'] as const).map((tab) => (
                            <button
                                key={tab}
                                onClick={() => actions.setStatusTab(tab)}
                                className={cn(
                                    "flex-1 sm:w-40 px-4 md:px-6 rounded-lg md:rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center",
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
                            <Button
                                variant="ghost"
                                onClick={() => actions.setConfirmModal(prev => ({ ...prev, show: false }))}
                                className="flex-1 py-4"
                            >
                                Cancelar
                            </Button>
                            <Button
                                variant="primary"
                                onClick={actions.confirmDeleteAction}
                                className="flex-1 py-4 bg-red-500 shadow-red-500/10 hover:bg-red-600"
                            >
                                Eliminar
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Simple Alert */}
            {state.errorAlert.show && (
                <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[200] animate-in slide-in-from-bottom-5">
                    <div className="bg-red-600 text-white px-8 py-5 rounded-[2rem] shadow-2xl flex items-center gap-4 border border-white/10 backdrop-blur-md">
                        <AlertCircle className="w-6 h-6" />
                        <div className="text-left">
                            <p className="font-black text-xs uppercase tracking-widest opacity-60 leading-none mb-1">{state.errorAlert.title}</p>
                            <p className="text-sm font-bold">{state.errorAlert.message}</p>
                        </div>
                        <button onClick={() => actions.setErrorAlert(prev => ({ ...prev, show: false }))} className="ml-4 p-2 hover:bg-white/10 rounded-xl transition-colors">
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
