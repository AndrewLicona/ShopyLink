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
                <div className="flex flex-col md:flex-row items-end md:items-center gap-3 w-full justify-end">
                    {/* Indicador de límite para Plan FREE */}
                    {hook.state.activeStore?.planType === 'FREE' && (
                        <div className="bg-[var(--surface)] border border-[var(--border)] px-4 py-2 rounded-2xl flex flex-col items-end hidden md:flex">
                            <span className="text-[10px] font-black uppercase tracking-widest text-[var(--text)]/40 mb-1">
                                Límite Plan Gratis
                            </span>
                            <div className="flex items-center justify-between w-full gap-3">
                                <div className="h-1.5 w-24 bg-[var(--text)]/10 rounded-full overflow-hidden">
                                    <div
                                        className={cn("h-full rounded-full transition-all", hook.state.allProducts.length >= 10 ? 'bg-red-500' : 'bg-[var(--primary)]')}
                                        style={{ width: `${Math.min((hook.state.allProducts.length / 10) * 100, 100)}%` }}
                                    />
                                </div>
                                <span className={cn("text-xs font-black", hook.state.allProducts.length >= 10 ? 'text-red-500' : 'text-[var(--text)]')}>
                                    {hook.state.allProducts.length}/10
                                </span>
                            </div>
                        </div>
                    )}

                    <div className="flex items-center gap-2">
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
                    </div>
                </div>
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
                                    state.statusTab === tab ? "bg-[var(--primary)] text-[var(--bg)] shadow-lg" : "text-[var(--text)]/40 hover:text-[var(--text)] font-bold"
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
            {/* Upgrade Modal */}
            {hook.state.upgradeModalOpen && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-[var(--surface)] w-full max-w-sm rounded-[2.5rem] p-8 shadow-[var(--shadow-strong)] animate-in zoom-in-95 text-center relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500"></div>
                        <button onClick={() => actions.setUpgradeModalOpen(false)} className="absolute top-4 right-4 p-2 text-[var(--text)]/40 hover:bg-[var(--secondary)] rounded-xl transition-colors">
                            <X className="w-5 h-5" />
                        </button>

                        <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-orange-500/20">
                            <AlertCircle className="w-8 h-8 text-white" />
                        </div>
                        <h3 className="text-2xl font-black text-[var(--text)] mb-2">¡Límite Alcanzado!</h3>
                        <p className="text-[var(--text)]/60 font-medium mb-6 text-sm">
                            Tu tienda está creciendo muy rápido. En el plan gratuito puedes tener hasta 10 productos.
                        </p>

                        <div className="bg-[var(--secondary)]/50 rounded-2xl p-4 mb-8 text-left border border-[var(--border)]">
                            <h4 className="font-bold text-sm mb-2 text-[var(--text)]">Mejora a Pro (20k COP/mes) y obtén:</h4>
                            <ul className="text-xs space-y-2 text-[var(--text)]/70 font-medium">
                                <li className="flex items-center gap-2">✨ Productos ilimitados</li>
                                <li className="flex items-center gap-2">🚀 Catálogo libre de anuncios</li>
                                <li className="flex items-center gap-2">📞 Soporte prioritario por WhatsApp</li>
                            </ul>
                        </div>

                        <Button
                            variant="primary"
                            onClick={() => {
                                actions.setUpgradeModalOpen(false);
                                // Here we can redirect to a payment page or open a WhatsApp link
                                window.open(`https://wa.me/573000000000?text=Hola,%20quiero%20mejorar%20la%20tienda%20${hook.state.activeStore?.name}%20al%20Plan%20Pro`, '_blank');
                            }}
                            className="w-full py-4 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 shadow-xl shadow-orange-500/20 text-white border-0"
                        >
                            Mejorar a Plan Pro Ahora
                        </Button>
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
