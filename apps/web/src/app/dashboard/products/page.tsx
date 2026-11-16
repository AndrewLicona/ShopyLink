'use client';

import { Suspense, useEffect, useState } from 'react';

import { api } from '@/services/api';
import { StyledSelect } from '@/components/ui/StyledSelect';
import { useProducts } from '@/hooks/useProducts';
import { CategoryModal } from '@/features/catalogue/CategoryModal';
import { ProductGrid } from '@/features/catalogue/ProductGrid';
import { ProductFormModal } from '@/features/catalogue/ProductFormModal';
import { BulkProductUploadModal } from '@/features/products/BulkProductUploadModal';

import {
    Plus,
    Search,
    Settings2,
    AlertCircle,
    X,
    Loader2,
    PackageCheck,
    Megaphone,
    MessageCircle,
    FileSpreadsheet,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { LoadingState } from '@/components/atoms/LoadingState';
import { Button } from '@/components/atoms/Button';

function ProductsContent() {
    const hook = useProducts();
    const { state, actions } = hook;
    const [isSuperAdmin, setIsSuperAdmin] = useState(false);
    useEffect(() => { api.getProfile().then(profile => setIsSuperAdmin(profile?.role === 'SUPER_ADMIN')).catch(() => setIsSuperAdmin(false)); }, []);
    const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);

    if (state.loading) {
        return <LoadingState message="Cargando catálogo..." fullPage />;
    }

    return (
        <div className="mx-auto max-w-[1500px] space-y-5 pb-10 md:space-y-6">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                <div><p className="text-[11px] font-black uppercase tracking-[0.18em] text-[var(--primary)]">Tu tienda</p><h1 className="mt-2 text-3xl font-black tracking-tight text-[var(--text)] sm:text-4xl">Catálogo</h1><p className="mt-2 text-sm text-[var(--text)]/55">Organiza tus productos y mantén tu tienda al día.</p></div>
                <div className="flex flex-wrap gap-2">
                    <Button variant="secondary" onClick={() => actions.setIsCatModalOpen(true)} className="min-h-11 rounded-xl px-4 py-3" leftIcon={<Settings2 className="h-4 w-4" />}>Categorías</Button>
                    {isSuperAdmin && <Button variant="secondary" onClick={() => setIsBulkModalOpen(true)} className="min-h-11 rounded-xl px-4 py-3" leftIcon={<FileSpreadsheet className="h-4 w-4" />}>Carga masiva</Button>}
                    <Button variant="primary" onClick={actions.openCreateModal} className="min-h-11 flex-1 rounded-xl px-4 py-3 sm:flex-none" leftIcon={<Plus className="h-4 w-4" />}>Nuevo producto</Button>
                </div>
            </div>

            <div className="grid grid-cols-3 gap-2 sm:gap-3">
                <div className="min-w-0 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-3 sm:p-4"><p className="text-xs text-[var(--text)]/50">Total</p><p className="mt-1 text-xl font-black text-[var(--text)]">{state.allProducts.length}</p></div>
                <div className="min-w-0 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-3 sm:p-4"><p className="text-xs text-[var(--text)]/50">En venta</p><p className="mt-1 text-xl font-black text-emerald-600">{state.allProducts.filter(product => product.isActive).length}</p></div>
                <div className="min-w-0 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-3 sm:p-4"><p className="text-xs text-[var(--text)]/50">Pausados</p><p className="mt-1 text-xl font-black text-[var(--text)]">{state.allProducts.filter(product => !product.isActive).length}</p></div>
            </div>
            {state.activeStore?.planType === 'FREE' && <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-xs"><span className="font-bold text-[var(--text)]">Plan gratis</span><div className="h-1.5 min-w-20 flex-1 overflow-hidden rounded-full bg-[var(--secondary)]"><div className="h-full rounded-full bg-[var(--primary)]" style={{width: `${Math.min(state.allProducts.length * 10, 100)}%`}} /></div><span className="font-bold text-[var(--text)]/60">{state.allProducts.length} de 10 productos</span></div>}

            <div className="space-y-3 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-3 sm:p-4">
                <div className="flex flex-col gap-3 lg:flex-row">
                    <div className="relative flex-1"><Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text)]/40" /><input type="search" aria-label="Buscar productos" placeholder="Buscar productos..." className="min-h-11 w-full rounded-xl border border-[var(--border)] bg-[var(--bg)] py-3 pl-11 pr-4 text-sm text-[var(--text)] outline-none focus:border-[var(--primary)]" value={state.searchTerm} onChange={e => actions.setSearchTerm(e.target.value)} /></div>
                    <div className="w-full lg:w-52"><StyledSelect label="Filtrar por categoría" value={state.categoryFilter} onChange={actions.setCategoryFilter} options={[{ value: 'all', label: 'Todas las categorías' }, ...state.categories.map(category => ({ value: category.id, label: category.name }))]} /></div>
                    <div aria-label="Estado de productos" className="grid grid-cols-2 gap-1 rounded-xl bg-[var(--secondary)] p-1 lg:min-w-60">{(['active', 'paused'] as const).map(tab => <button type="button" key={tab} onClick={() => actions.setStatusTab(tab)} aria-pressed={state.statusTab === tab} className={cn('min-h-10 rounded-lg px-4 text-xs font-bold transition-colors', state.statusTab === tab ? 'bg-[var(--surface)] text-[var(--text)] shadow-sm' : 'text-[var(--text)]/50 hover:text-[var(--text)]')}>{tab === 'active' ? 'En venta' : 'Pausados'}</button>)}</div>
                </div>
                <p className="px-1 text-xs text-[var(--text)]/50">{state.products.length} {state.products.length === 1 ? 'producto' : 'productos'} en esta vista</p>
            </div>

            {/* Grid */}
            <ProductGrid hook={hook} />

            {/* Modals */}
            <ProductFormModal hook={hook} />
            <CategoryModal hook={hook} />
            {isSuperAdmin && hook.state.activeStore && (
                <BulkProductUploadModal
                    isOpen={isBulkModalOpen}
                    onClose={() => setIsBulkModalOpen(false)}
                    storeId={hook.state.activeStore.id}
                    categories={state.categories}
                    existingProducts={state.allProducts}
                    onSuccess={() => actions.loadData()}
                />
            )}

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
                                <li className="flex items-center gap-2"><PackageCheck className="w-4 h-4 shrink-0" /> Productos ilimitados</li>
                                <li className="flex items-center gap-2"><Megaphone className="w-4 h-4 shrink-0" /> Catálogo libre de anuncios</li>
                                <li className="flex items-center gap-2"><MessageCircle className="w-4 h-4 shrink-0" /> Soporte prioritario por WhatsApp</li>
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
