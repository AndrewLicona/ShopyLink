'use client';

import { X, CheckCircle2 } from 'lucide-react';
import { useProducts } from '@/hooks/useProducts';
import { GeneralInfoSection } from './components/GeneralInfoSection';
import { MediaUploadSection } from './components/MediaUploadSection';
import { VariantsSection } from './components/VariantsSection';
import { Button } from '@/components/atoms/Button';

interface ProductFormModalProps {
    hook: ReturnType<typeof useProducts>;
}

export function ProductFormModal({ hook }: ProductFormModalProps) {
    const { state, actions } = hook;
    const { form } = state;

    if (!state.isModalOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center sm:p-4 bg-black/40 backdrop-blur-sm">
            <div className="bg-[var(--surface)] w-full h-full sm:h-[90vh] sm:w-[95vw] max-w-7xl sm:rounded-[2.5rem] shadow-[var(--shadow-strong)] overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col">
                {/* Modal Header */}
                <div className="p-6 md:p-8 border-b border-[var(--border)] flex items-center justify-between bg-[var(--surface)] z-20">
                    <div>
                        <h2 className="text-xl md:text-2xl font-black text-[var(--text)]">
                            {state.editingProduct ? 'Editar' : 'Nuevo'} Producto
                        </h2>
                        <p className="text-[10px] md:text-xs font-medium text-[var(--text)]/40 mt-0.5">
                            Completa los detalles de tu producto.
                        </p>
                    </div>
                    <button
                        onClick={() => actions.setIsModalOpen(false)}
                        className="p-2 hover:bg-[var(--secondary)] rounded-xl transition-colors"
                    >
                        <X className="w-6 h-6 text-[var(--text)]/40" />
                    </button>
                </div>

                <form
                    id="product-form"
                    onSubmit={actions.handleSaveProduct}
                    className="p-5 sm:p-8 space-y-6 flex-1 overflow-y-auto custom-scrollbar pb-32"
                >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Left Side: General Info */}
                        <GeneralInfoSection
                            form={form}
                            actions={actions}
                            categories={state.categories}
                        />

                        {/* Right Side: Media & Variants */}
                        <div className="space-y-8">
                            <MediaUploadSection
                                imageUrls={form.imageUrls}
                                actions={actions}
                            />

                            <VariantsSection
                                form={form}
                                actions={actions}
                            />
                        </div>
                    </div>
                </form>

                {/* Sticky Footer */}
                <div className="p-6 md:p-8 bg-[var(--surface)] border-t border-[var(--border)] flex flex-row items-center justify-end gap-3 z-30 shadow-[0_-20px_40px_rgba(0,0,0,0.04)] sm:static fixed bottom-0 left-0 right-0">
                    <Button
                        variant="ghost"
                        onClick={() => actions.setIsModalOpen(false)}
                        className="flex-1 sm:flex-none order-2 sm:order-1"
                    >
                        Cancelar
                    </Button>
                    <Button
                        form="product-form"
                        type="submit"
                        isLoading={state.creating}
                        leftIcon={!state.creating && <CheckCircle2 className="w-5 h-5 md:w-6 md:h-6" />}
                        className="flex-[2] sm:flex-none order-1 sm:order-2 px-8 py-4 md:px-12"
                    >
                        {state.editingProduct ? 'Guardar Cambios' : 'Crear Producto'}
                    </Button>
                </div>
            </div>
        </div>
    );
}
