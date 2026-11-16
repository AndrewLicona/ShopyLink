'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
    X,
    ShoppingCart,
    Share2,
    Check,
    AlertCircle,
    MessageCircle
} from 'lucide-react';
import { cn, formatPrice } from '@/lib/utils';
import { getServicePriceLabel } from '@/lib/pricing';
import { buildWhatsAppLink } from '@/lib/whatsapp';
import type { Product, Category, Store } from '@/types/types';
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
    cartItems,
}: ProductModalProps) {
    const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);
    const country = store?.country;
    const [quantity, setQuantity] = useState(1);
    const [isCopied, setIsCopied] = useState(false);
    const [showManualShare, setShowManualShare] = useState(false);
    const closeHandler = useRef(onClose);
    const closeButton = useRef<HTMLButtonElement>(null);
    const desktopCloseButton = useRef<HTMLButtonElement>(null);
    const modalRef = useRef<HTMLDivElement>(null);

    const [stockAlert, setStockAlert] = useState<{ show: boolean, message: string }>({ show: false, message: '' });

    useEffect(() => { closeHandler.current = onClose; }, [onClose]);
    useEffect(() => {
        if (!isOpen) return;
        const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
        const overflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        (closeButton.current?.getClientRects().length ? closeButton.current : desktopCloseButton.current)?.focus();
        const handleKey = (event: KeyboardEvent) => {
            if (event.key === 'Escape') { closeHandler.current(); return; }
            if (event.key !== 'Tab' || !modalRef.current) return;
            const controls = Array.from(modalRef.current.querySelectorAll<HTMLElement>('a[href], button:not(:disabled), input:not(:disabled), [tabindex]:not([tabindex="-1"])')).filter(element => element.getClientRects().length > 0);
            const first = controls[0];
            const last = controls[controls.length - 1];
            if (!first || !last) return;
            if (event.shiftKey && (document.activeElement === first || !modalRef.current.contains(document.activeElement))) { event.preventDefault(); last.focus(); }
            else if (!event.shiftKey && (document.activeElement === last || !modalRef.current.contains(document.activeElement))) { event.preventDefault(); first.focus(); }
        };
        window.addEventListener('keydown', handleKey);
        return () => { document.body.style.overflow = overflow; window.removeEventListener('keydown', handleKey); previousFocus?.focus(); };
    }, [isOpen]);

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
            setQuantity(1);
            setIsCopied(false);
            setShowManualShare(false);
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

    const variant = selectedProduct.variants?.find(v => v.id === selectedVariantId);
    const tracked = selectedProduct.trackInventory !== false && variant?.trackInventory !== false;
    const availableStock = !tracked ? Infinity : variant && !variant.useParentStock ? variant.stock : (selectedProduct.inventory?.stock ?? 0);
    const inCart = cartItems.filter(item => {
        if (item.id !== selectedProduct.id) return false;
        if (selectedVariantId && variant && !variant.useParentStock) return item.variantId === selectedVariantId;
        if (!item.variantId) return true;
        return Boolean(selectedProduct.variants?.find(option => option.id === item.variantId)?.useParentStock);
    }).reduce((total, item) => total + item.quantity, 0);

    const handleAddToCart = () => {
        if (quantity + inCart > availableStock) {
            showMessage(inCart > 0 ? `Ya tienes ${inCart} en tu carrito. Hay ${availableStock} disponibles.` : `Hay ${availableStock} disponibles.`);
            return;
        }
        onAddToCart(selectedProduct, quantity, selectedVariantId);
        onClose();
    };
    const displayImages = (variant?.images && variant.images.length > 0) ? variant.images : (selectedProduct.images || []);

    // Services are an inquiry: no variants, no stock and no quantity picker.
    const isService = selectedProduct.itemType === 'service';
    const serviceWhatsAppHref = isService && store?.whatsappNumber
        ? buildWhatsAppLink({
            phone: store.whatsappNumber,
            type: 'service',
            name: selectedProduct.name,
            storeName: store.name,
        })
        : null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center sm:p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300" role="dialog" aria-modal="true" aria-labelledby="product-modal-title">
            {stockAlert.show && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-[var(--surface)] px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 border border-orange-500/20 animate-in zoom-in-95">
                        <AlertCircle className="w-5 h-5 text-orange-500" />
                        <p className="text-sm font-bold text-[var(--text)]">{stockAlert.message}</p>
                    </div>
                </div>
            )}

            <div ref={modalRef} className="bg-[var(--surface)] w-full h-[100dvh] sm:h-fit md:max-w-4xl max-h-[100dvh] md:max-h-[88dvh] sm:rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col md:grid md:grid-cols-2 md:border border-[var(--border)] relative self-center">
                <div className="md:hidden absolute top-4 right-4 z-50">
                    <button ref={closeButton} onClick={onClose} aria-label="Cerrar detalle del producto" className="w-10 h-10 bg-[var(--bg)]/90 backdrop-blur-xl rounded-full flex items-center justify-center shadow-xl text-[var(--text)] border border-[var(--border)] active:scale-90 transition-all">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <ProductImageGallery key={`${selectedProduct.id}-${selectedVariantId || 'base'}`} images={displayImages} productName={selectedProduct.name} />

                <div className="w-full flex-1 flex flex-col min-h-0 bg-[var(--surface)] border-t md:border-t-0 md:border-l border-[var(--border)] max-h-none md:max-h-[85vh]">
                    <div className="flex items-center justify-end gap-2 p-4 sm:p-5 pb-1 shrink-0">
                        <button
                            onClick={async () => {
                                const frontendUrl = process.env.NEXT_PUBLIC_FRONTEND_URL || window.location.origin;
                                const url = `${frontendUrl}${window.location.pathname}?p=${selectedProduct.id}`;
                                try {
                                    if (navigator.share) await navigator.share({ title: selectedProduct.name, url });
                                    else {
                                        await navigator.clipboard.writeText(url);
                                        setIsCopied(true);
                                        setTimeout(() => setIsCopied(false), 2000);
                                    }
                                } catch (error) {
                                    if (!(error instanceof Error && error.name === 'AbortError')) setShowManualShare(true);
                                }
                            }}
                            className={cn(
                                "flex items-center gap-2 px-4 py-2 rounded-2xl font-black text-xs uppercase tracking-widest transition-all active:scale-95 relative",
                                isCopied ? "bg-green-500 text-white" : "bg-[var(--secondary)] text-[var(--text)]/40 hover:text-[var(--text)] border border-[var(--border)]"
                            )}
                        >
                            {isCopied ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
                            {isCopied ? 'Copiado' : 'Compartir'}
                        </button>
                        <button ref={desktopCloseButton} onClick={onClose} aria-label="Cerrar detalle del producto" className="hidden md:flex w-10 h-10 bg-[var(--secondary)] hover:bg-[var(--bg)] border border-[var(--border)] rounded-xl items-center justify-center text-[var(--text)]/60 hover:text-[var(--text)] transition-all active:scale-95">
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto custom-scrollbar p-5 sm:p-7 pt-0 space-y-5">
                        {showManualShare && <div role="status" className="rounded-xl border border-[var(--border)] bg-[var(--bg)] p-3"><p className="mb-2 text-xs font-bold text-[var(--text)]">Copia este enlace para compartirlo</p><input aria-label="Enlace del producto" readOnly onFocus={(event) => event.currentTarget.select()} value={`${process.env.NEXT_PUBLIC_FRONTEND_URL || (typeof window !== 'undefined' ? window.location.origin : '')}${typeof window !== 'undefined' ? window.location.pathname : ''}?p=${selectedProduct.id}`} className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-xs text-[var(--text)]" /></div>}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2">
                                {selectedProduct.sku && <span className="bg-[var(--primary)] text-[var(--primary-foreground)] px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-widest">#{selectedProduct.sku}</span>}
                                {selectedProduct.categoryId && <span className="text-[var(--primary)] font-black text-[10px] uppercase tracking-[0.2em]">{categories.find(c => c.id === selectedProduct.categoryId)?.name}</span>}
                            </div>
                            <div className="space-y-1">
                                <h2 id="product-modal-title" className="text-xl sm:text-3xl font-black text-[var(--text)] leading-tight tracking-tight break-words">{selectedProduct.name}</h2>
                                <div className="flex items-center gap-4">
                                    {isService ? (
                                        <p className="text-2xl font-black text-[var(--primary)]">
                                            {getServicePriceLabel(
                                                selectedProduct.price != null ? Number(selectedProduct.price) : null,
                                                selectedProduct.pricingMode,
                                                country,
                                                false,
                                            )}
                                        </p>
                                    ) : (() => {
                                        const effectivePrice = getEffectivePrice();
                                        if (effectivePrice === null) return <p className="text-2xl font-black text-blue-600">Consultar Precio</p>;
                                        return <p className="text-2xl font-black text-[var(--primary)]">{formatPrice(effectivePrice, country)}</p>;
                                    })()}
                                </div>
                            </div>
                        </div>

                        {!isService && (
                            <VariantSelector
                                product={selectedProduct}
                                selectedVariantId={selectedVariantId}
                                onSelectVariant={(id) => { setSelectedVariantId(id); setQuantity(1); }}
                                quantity={quantity}
                                onQuantityChange={setQuantity}
                                onShowMessage={showMessage}
                                inCart={inCart}
                            />
                        )}

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

                    <div className="p-4 sm:p-6 pb-[max(1rem,env(safe-area-inset-bottom))] mt-auto border-t border-[var(--border)] bg-[var(--surface)] z-10">
                        {isService ? (
                            serviceWhatsAppHref ? (
                                <a
                                    href={serviceWhatsAppHref}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-full bg-green-500 text-white py-4 md:py-5 rounded-2xl md:rounded-[2rem] font-black text-lg md:text-xl flex items-center justify-center gap-3 hover:bg-green-600 hover:scale-[1.02] transition-all shadow-xl active:scale-[0.98]"
                                >
                                    <MessageCircle className="w-5 h-5 md:w-6 md:h-6" />
                                    Consultar por WhatsApp
                                </a>
                            ) : (
                                <p className="w-full text-center text-sm font-bold text-[var(--text)]/50 py-4">
                                    Esta tienda no tiene un número de WhatsApp configurado.
                                </p>
                            )
                        ) : getEffectivePrice() === null || availableStock <= 0 ? store?.whatsappNumber ? (
                            <a
                                href={`https://wa.me/${store?.whatsappNumber?.replace(/\D/g, '')}?text=${encodeURIComponent(`Hola, me interesa: ${selectedProduct.name}\n${process.env.NEXT_PUBLIC_FRONTEND_URL || (typeof window !== 'undefined' ? window.location.origin : '')}${window.location.pathname}?p=${selectedProduct.id}`)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full bg-green-500 text-white py-4 md:py-5 rounded-2xl md:rounded-[2rem] font-black text-lg md:text-xl flex items-center justify-center gap-3 hover:bg-green-600 hover:scale-[1.02] transition-all shadow-xl active:scale-[0.98]"
                            >
                                <MessageCircle className="w-5 h-5 md:w-6 md:h-6" />
                                Consultar por WhatsApp
                            </a>
                        ) : <p className="w-full text-center text-sm font-bold text-[var(--text)]/60 py-4">{availableStock <= 0 ? 'Producto no disponible por el momento.' : 'Consulta el precio con la tienda.'}</p> : (
                            <button
                                onClick={handleAddToCart}
                                className="w-full min-h-12 bg-[var(--primary)] text-[var(--primary-foreground)] px-4 py-3 rounded-xl font-bold text-sm sm:text-base flex items-center justify-center gap-2 hover:opacity-90 transition-all shadow-lg active:scale-[0.98]"
                            >
                                <ShoppingCart className="w-5 h-5 md:w-6 md:h-6" />
                                Añadir al pedido · {formatPrice((getEffectivePrice() ?? 0) * quantity, country)}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}




