'use client';

import React, { useState, useEffect } from 'react';
import {
    X,
    ShoppingCart,
    Share2,
    Check,
    AlertCircle,
    MessageCircle
} from 'lucide-react';
import { cn, formatCurrency } from '@/lib/utils';
import type { Product, Category, Store, ProductVariant } from '@/types/types';
import { ProductImageGallery } from './components/ProductImageGallery';
import { VariantSelector } from './components/VariantSelector';

interface ProductModalProps {
    product: Product | null;
    isOpen: boolean;
    onClose: () => void;
    onAddToCart: (product: Product, quantity: number, variantId?: string | null) => void;
    categories: Category[];
    store: Store | null;
    cartItems: { id: string, quantity: number, variantId?: string }[];
}

export function ProductModal({
    product: selectedProduct,
    isOpen,
    onClose,
    onAddToCart,
    categories,
    store,
}: ProductModalProps) {
    const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);
    const [localQuantities, setLocalQuantities] = useState<Record<string, number>>({});
    const [isCopied, setIsCopied] = useState(false);
    const [showManualShare, setShowManualShare] = useState(false);
    const [stockAlert, setStockAlert] = useState<{ show: boolean, message: string }>({ show: false, message: '' });

    const currentQty = localQuantities[selectedVariantId || 'base'] || 1;

    useEffect(() => {
        if (selectedProduct) {
            const principalInStock = !selectedProduct.trackInventory || (selectedProduct.inventory?.stock ?? 0) > 0;
            if (!principalInStock && selectedProduct.variants && selectedProduct.variants.length > 0) {
                const firstAvailable = selectedProduct.variants.find(v => {
                    if (v.trackInventory === false) return true;
                    const stock = v.useParentStock ? (selectedProduct.inventory?.stock ?? 0) : (v.stock ?? 0);
                    return stock > 0;
                });
                setSelectedVariantId(firstAvailable?.id || null);
            } else {
                setSelectedVariantId(null);
            }
            setLocalQuantities({});
        }
    }, [selectedProduct]);

    if (!selectedProduct || !isOpen) return null;

    const showMessage = (msg: string) => {
        setStockAlert({ show: true, message: msg });
        setTimeout(() => setStockAlert({ show: false, message: '' }), 3000);
    };

    const getEffectivePrice = (): number | null => {
        const variant = selectedProduct.variants?.find(v => v.id === selectedVariantId);
        let price: number | null = selectedProduct.discountPrice ?? selectedProduct.price ?? null;
        if (variant && !variant.useParentPrice) {
            price = variant.price !== null ? Number(variant.price) : null;
        }
        return price;
    };

    const getFinalEntries = () => {
        const entries = { ...localQuantities };
        const currentKey = selectedVariantId || 'base';
        if (entries[currentKey] === undefined) entries[currentKey] = 1;
        return Object.entries(entries).filter(([, qty]) => qty > 0);
    };

    const handleAddToCart = () => {
        getFinalEntries().forEach(([key, qty]) => {
            onAddToCart(selectedProduct, qty, key === 'base' ? null : key);
        });
        onClose();
    };

    const getTotalPrice = () => {
        return getFinalEntries().reduce((total, [key, qty]) => {
            const vId = key === 'base' ? null : key;
            const v = selectedProduct.variants?.find((v: ProductVariant) => v.id === vId);
            let price = selectedProduct.discountPrice ?? selectedProduct.price ?? null;
            if (v && !v.useParentPrice) price = v.price;
            return total + ((price ?? 0) * qty);
        }, 0);
    };

    const variant = selectedProduct.variants?.find(v => v.id === selectedVariantId);
    const displayImages = (variant?.images && variant.images.length > 0) ? variant.images : (selectedProduct.images || []);

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center sm:p-6 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
            {stockAlert.show && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-[var(--surface)] px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 border border-orange-500/20 animate-in zoom-in-95">
                        <AlertCircle className="w-5 h-5 text-orange-500" />
                        <p className="text-sm font-bold text-[var(--text)]">{stockAlert.message}</p>
                    </div>
                </div>
            )}

            <div className="bg-white w-full h-full sm:h-fit md:max-w-4xl max-h-[100dvh] md:max-h-[85vh] sm:rounded-xl rounded-none shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col md:grid md:grid-cols-2 md:border border-[var(--border)] relative self-center">
                <div className="md:hidden absolute top-4 right-4 z-50">
                    <button onClick={onClose} className="w-10 h-10 bg-[var(--bg)]/80 backdrop-blur-xl rounded-full flex items-center justify-center shadow-xl text-[var(--text)] border border-[var(--border)] active:scale-90 transition-all">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <ProductImageGallery images={displayImages} productName={selectedProduct.name} />

                <div className="w-full flex-1 flex flex-col min-h-0 bg-white border-t md:border-t-0 md:border-l border-[var(--border)] max-h-none md:max-h-[85vh]">
                    <div className="flex items-center justify-end gap-2 p-4 sm:p-5 pb-1 shrink-0">
                        <button
                            onClick={async () => {
                                const url = `${window.location.origin}${window.location.pathname}?p=${selectedProduct.id}`;
                                try {
                                    if (navigator.share) await navigator.share({ title: selectedProduct.name, url });
                                    else {
                                        await navigator.clipboard.writeText(url);
                                        setIsCopied(true);
                                        setTimeout(() => setIsCopied(false), 2000);
                                    }
                                } catch { setShowManualShare(true); }
                            }}
                            className={cn(
                                "flex items-center gap-2 px-4 py-2 rounded-2xl font-black text-xs uppercase tracking-widest transition-all active:scale-95 relative",
                                isCopied ? "bg-green-500 text-white" : "bg-[var(--secondary)] text-[var(--text)]/40 hover:text-[var(--text)] border border-[var(--border)]"
                            )}
                        >
                            {isCopied ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
                            {isCopied ? 'Copiado' : 'Compartir'}
                        </button>
                        <button onClick={onClose} className="hidden md:flex w-12 h-12 bg-[var(--secondary)] hover:bg-[var(--bg)] border border-[var(--border)] rounded-2xl items-center justify-center text-[var(--text)]/40 hover:text-[var(--text)] transition-all active:scale-95">
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto custom-scrollbar p-5 sm:p-7 pt-0 space-y-5">
                        <div className="space-y-4">
                            <div className="flex items-center gap-2">
                                {selectedProduct.sku && <span className="bg-[var(--primary)] text-[var(--primary-foreground)] px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-widest">#{selectedProduct.sku}</span>}
                                {selectedProduct.categoryId && <span className="text-[var(--primary)] font-black text-[10px] uppercase tracking-[0.2em]">{categories.find(c => c.id === selectedProduct.categoryId)?.name}</span>}
                            </div>
                            <div className="space-y-1">
                                <h2 className="text-2xl sm:text-3xl font-black text-[var(--text)] leading-tight tracking-tight break-words">{selectedProduct.name}</h2>
                                <div className="flex items-center gap-4">
                                    {(() => {
                                        const effectivePrice = getEffectivePrice();
                                        if (effectivePrice === null) return <p className="text-2xl font-black text-blue-600">Consultar Precio</p>;
                                        return <p className="text-2xl font-black text-[var(--primary)]">{formatCurrency(effectivePrice)}</p>;
                                    })()}
                                </div>
                            </div>
                        </div>

                        <VariantSelector
                            product={selectedProduct}
                            selectedVariantId={selectedVariantId}
                            onSelectVariant={setSelectedVariantId}
                            quantity={currentQty}
                            onQuantityChange={(val) => setLocalQuantities(prev => ({ ...prev, [selectedVariantId || 'base']: val }))}
                            onShowMessage={showMessage}
                        />

                        {selectedProduct.description && (
                            <div className="space-y-4 px-2">
                                <div className="flex items-center gap-2">
                                    <div className="w-1 h-3 bg-[var(--primary)] rounded-full"></div>
                                    <h3 className="text-[10px] font-black uppercase tracking-widest text-[var(--text)]/50">Detalles</h3>
                                </div>
                                <p className="text-[var(--text)]/70 font-medium leading-relaxed text-sm break-words whitespace-pre-line">{selectedProduct.description}</p>
                            </div>
                        )}
                    </div>

                    <div className="p-5 sm:p-7 pt-3 mt-auto border-t border-[var(--border)] bg-[var(--bg)]/80 backdrop-blur-sm z-10">
                        {getEffectivePrice() === null ? (
                            <a
                                href={`https://wa.me/${store?.whatsappNumber?.replace(/\D/g, '')}?text=${encodeURIComponent(`Hola, me interesa: ${selectedProduct.name}\n${window.location.origin}${window.location.pathname}?p=${selectedProduct.id}`)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full bg-green-500 text-white py-4 md:py-5 rounded-2xl md:rounded-[2rem] font-black text-lg md:text-xl flex items-center justify-center gap-3 hover:bg-green-600 hover:scale-[1.02] transition-all shadow-xl active:scale-[0.98]"
                            >
                                <MessageCircle className="w-5 h-5 md:w-6 md:h-6" />
                                Consultar por WhatsApp
                            </a>
                        ) : (
                            <button
                                onClick={handleAddToCart}
                                className="w-full bg-[var(--primary)] text-[var(--primary-foreground)] py-4 md:py-5 rounded-2xl md:rounded-[2rem] font-black text-lg md:text-xl flex items-center justify-center gap-3 hover:scale-[1.02] transition-all shadow-xl active:scale-[0.98]"
                            >
                                <ShoppingCart className="w-5 h-5 md:w-6 md:h-6" />
                                Añadir • {formatCurrency(getTotalPrice())}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}




