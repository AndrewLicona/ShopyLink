'use client';

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import {
    X,
    ShoppingCart,
    Plus,
    Minus,
    ChevronLeft,
    ChevronRight,
    ShoppingBag,
    Share2,
    Check,
    AlertCircle
} from 'lucide-react';
import { cn, formatCurrency } from '@/lib/utils';
import type { Product, Category, Store } from '@/lib/types';

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
    cartItems
}: ProductModalProps) {
    const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);
    const [localQuantities, setLocalQuantities] = useState<Record<string, number>>({});
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [isCopied, setIsCopied] = useState(false);
    const [showManualShare, setShowManualShare] = useState(false);
    const [stockAlert, setStockAlert] = useState<{ show: boolean, message: string }>({ show: false, message: '' });
    const touchStartX = useRef<number | null>(null);

    // Get current quantity for the active selection
    const currentQty = localQuantities[selectedVariantId || 'base'] || 1;

    const setQty = (val: number) => {
        setLocalQuantities(prev => ({
            ...prev,
            [selectedVariantId || 'base']: val
        }));
    };

    // Reset local state when product changes (new modal view)
    useEffect(() => {
        if (selectedProduct) {
            setSelectedVariantId(null);
            setCurrentImageIndex(0);
            setLocalQuantities({});
        }
    }, [selectedProduct]);

    if (!selectedProduct || !isOpen) return null;

    // Get count already in cart
    const inCartQty = cartItems.find(
        item => item.id === selectedProduct.id &&
            (item.variantId === (selectedVariantId || undefined))
    )?.quantity || 0;



    const showMessage = (msg: string) => {
        setStockAlert({ show: true, message: msg });
        setTimeout(() => setStockAlert({ show: false, message: '' }), 3000);
    };

    const getEffectivePrice = () => {
        const variant = selectedProduct.variants?.find(v => v.id === selectedVariantId);
        let price = Number(selectedProduct.discountPrice || selectedProduct.price);
        if (variant) {
            price = variant.useParentPrice
                ? Number(selectedProduct.discountPrice || selectedProduct.price)
                : Number(variant.price);
        }
        return price;
    };

    const getFinalEntries = () => {
        const entries = { ...localQuantities };
        const currentKey = selectedVariantId || 'base';
        if (entries[currentKey] === undefined) {
            entries[currentKey] = 1;
        }
        return Object.entries(entries).filter(([, qty]) => qty > 0);
    };

    const handleAddToCart = () => {
        const entries = getFinalEntries();
        entries.forEach(([key, qty]) => {
            const vId = key === 'base' ? null : key;
            onAddToCart(selectedProduct, qty, vId);
        });
        onClose();
    };

    // Calculate total session price
    const getTotalSessionPrice = () => {
        const entries = getFinalEntries();

        return entries.reduce((total, [key, qty]) => {
            const vId = key === 'base' ? null : key;
            const v = selectedProduct.variants?.find(v => v.id === vId);
            let price = Number(selectedProduct.discountPrice || selectedProduct.price);
            if (v) {
                price = v.useParentPrice
                    ? Number(selectedProduct.discountPrice || selectedProduct.price)
                    : Number(v.price);
            }
            return total + (price * qty);
        }, 0);
    };

    const finalEntriesCount = getFinalEntries().length;

    const variant = selectedProduct.variants?.find(v => v.id === selectedVariantId);
    const displayImages = (variant?.images && variant.images.length > 0)
        ? variant.images
        : (selectedProduct.images || []);

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
            {/* Stock Alert Overlay */}
            {stockAlert.show && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-[var(--surface)] px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 border border-orange-500/20 animate-in zoom-in-95">
                        <AlertCircle className="w-5 h-5 text-orange-500" />
                        <p className="text-sm font-bold text-[var(--text)]">{stockAlert.message}</p>
                    </div>
                </div>
            )}

            <div className="bg-[var(--bg)] w-full md:max-w-4xl h-auto max-h-[90vh] rounded-[2rem] md:rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col md:grid md:grid-cols-2 md:border border-[var(--border)] relative">
                {/* Header for Mobile: Close */}
                <div className="md:hidden absolute top-4 right-4 z-50">
                    <button
                        onClick={onClose}
                        className="w-10 h-10 bg-[var(--bg)]/80 backdrop-blur-xl rounded-full flex items-center justify-center shadow-xl text-[var(--text)] border border-[var(--border)] active:scale-90 transition-all"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Left Side: Images Gallery */}
                <div className="w-full h-auto md:h-full bg-white flex items-center justify-center relative aspect-square md:aspect-[4/5] overflow-hidden">
                    {displayImages.length === 0 ? (
                        <div className="h-full flex items-center justify-center text-gray-200">
                            <ShoppingBag className="w-20 h-20" />
                        </div>
                    ) : (
                        <div
                            className="w-full h-full relative group touch-pan-y"
                            onTouchStart={(e) => {
                                const touch = e.touches[0];
                                if (touch) touchStartX.current = touch.clientX;
                            }}
                            onTouchEnd={(e) => {
                                if (touchStartX.current === null) return;
                                const touchEndX = e.changedTouches[0]?.clientX;
                                if (touchEndX === undefined) return;
                                const diff = touchStartX.current - touchEndX;
                                if (Math.abs(diff) > 50) {
                                    if (diff > 0) {
                                        setCurrentImageIndex(prev => (prev === displayImages.length - 1 ? 0 : prev + 1));
                                    } else {
                                        setCurrentImageIndex(prev => (prev === 0 ? displayImages.length - 1 : prev - 1));
                                    }
                                }
                                touchStartX.current = null;
                            }}
                        >
                            <Image
                                src={displayImages[currentImageIndex] || displayImages[0] || ''}
                                alt={selectedProduct.name}
                                fill
                                className="object-cover"
                                priority
                                sizes="(max-width: 768px) 100vw, 40vw"
                            />

                            {displayImages.length > 1 && (
                                <>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); setCurrentImageIndex(prev => (prev === 0 ? displayImages.length - 1 : prev - 1)) }}
                                        className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-[var(--bg)]/40 hover:bg-[var(--bg)]/90 backdrop-blur-sm rounded-full flex items-center justify-center text-[var(--text)] transition-all active:scale-90 border border-[var(--border)] opacity-0 md:opacity-100 group-hover:opacity-100 z-10"
                                    >
                                        <ChevronLeft className="w-5 h-5" />
                                    </button>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); setCurrentImageIndex(prev => (prev === displayImages.length - 1 ? 0 : prev + 1)) }}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-[var(--bg)]/40 hover:bg-[var(--bg)]/90 backdrop-blur-sm rounded-full flex items-center justify-center text-[var(--text)] transition-all active:scale-90 border border-[var(--border)] opacity-0 md:opacity-100 group-hover:opacity-100 z-10"
                                    >
                                        <ChevronRight className="w-5 h-5" />
                                    </button>
                                    <div className="absolute top-4 left-4 bg-black/20 backdrop-blur-md text-white px-3 py-1 rounded-full text-[9px] font-black tracking-widest uppercase border border-white/10 z-10">
                                        {currentImageIndex + 1} / {displayImages.length}
                                    </div>
                                </>
                            )}

                            {displayImages.length > 1 && (
                                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1 z-10">
                                    {displayImages.map((_: string, idx: number) => (
                                        <button
                                            key={idx}
                                            onClick={() => setCurrentImageIndex(idx)}
                                            className={`h-1 rounded-full transition-all duration-300 ${idx === currentImageIndex ? 'bg-[var(--primary)] w-6' : 'bg-[var(--secondary)] w-1'}`}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Right Side: Details */}
                <div className="w-full p-6 sm:p-8 flex flex-col h-full overflow-y-auto custom-scrollbar bg-[var(--bg)] border-t md:border-t-0 md:border-l border-[var(--border)]">
                    <div className="flex items-center justify-end gap-2 mb-4">
                        <button
                            onClick={async () => {
                                const url = `${window.location.origin}${window.location.pathname}?p=${selectedProduct.id}`;
                                const shareData = {
                                    title: selectedProduct.name,
                                    text: `¡Mira este producto en ${store?.name || 'nuestra tienda'}!`,
                                    url: url,
                                };

                                if (navigator.share && navigator.canShare?.(shareData)) {
                                    try {
                                        await navigator.share(shareData);
                                        return;
                                    } catch (err) {
                                        console.debug('Native share failed', err);
                                    }
                                }

                                try {
                                    await navigator.clipboard.writeText(url);
                                    setIsCopied(true);
                                    setTimeout(() => setIsCopied(false), 2000);
                                } catch {
                                    setShowManualShare(true);
                                }
                            }}
                            className={cn(
                                "flex items-center gap-2 px-4 py-2 rounded-2xl font-black text-xs uppercase tracking-widest transition-all active:scale-95 relative",
                                isCopied ? "bg-green-500 text-white" : "bg-[var(--secondary)] text-[var(--text)]/40 hover:text-[var(--text)] border border-[var(--border)]"
                            )}
                        >
                            {isCopied ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
                            {isCopied ? 'Copiado' : 'Compartir'}

                            {showManualShare && !isCopied && (
                                <div className="absolute top-full right-0 mt-2 w-64 bg-[var(--bg)] rounded-2xl shadow-2xl border border-[var(--border)] p-4 z-50 animate-in fade-in zoom-in-95 duration-200">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-[10px] font-black text-[var(--text)]/40 uppercase tracking-widest">Enlace</span>
                                        <button onClick={(e) => { e.stopPropagation(); setShowManualShare(false); }} className="text-gray-400">
                                            <X className="w-3 h-3" />
                                        </button>
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <input
                                            readOnly
                                            value={`${window.location.origin}${window.location.pathname}?p=${selectedProduct.id}`}
                                            className="w-full bg-[var(--secondary)] border border-[var(--border)] rounded-xl px-3 py-2 text-[10px] font-mono text-[var(--text)] focus:outline-none mb-1"
                                            onClick={(e) => (e.target as HTMLInputElement).select()}
                                        />
                                    </div>
                                </div>
                            )}
                        </button>
                        <button
                            onClick={onClose}
                            className="hidden md:flex w-12 h-12 bg-[var(--secondary)] hover:bg-[var(--bg)] border border-[var(--border)] rounded-2xl items-center justify-center text-[var(--text)]/40 hover:text-[var(--text)] transition-all active:scale-95"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    <div className="flex-1 space-y-6">
                        <div className="space-y-6">
                            <div className="space-y-4">
                                <div className="flex items-center gap-2">
                                    {selectedProduct.sku && (
                                        <span className="bg-[var(--primary)] text-[var(--primary-foreground)] px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-widest">
                                            #{selectedProduct.sku}
                                        </span>
                                    )}
                                    {selectedProduct.categoryId && (
                                        <span className="text-[var(--primary)] font-black text-[10px] uppercase tracking-[0.2em]">
                                            {categories.find(c => c.id === selectedProduct.categoryId)?.name}
                                        </span>
                                    )}
                                </div>
                                <div className="space-y-1">
                                    <h2 className="text-2xl sm:text-3xl font-black text-[var(--text)] leading-tight tracking-tight">
                                        {selectedProduct.name}
                                    </h2>
                                    <div className="flex items-center gap-4">
                                        {(() => {
                                            const price = selectedProduct.price;
                                            const discountPrice = selectedProduct.discountPrice;
                                            const effectivePrice = getEffectivePrice();

                                            if (discountPrice && !selectedVariantId) {
                                                return (
                                                    <>
                                                        <span className="text-2xl font-black text-green-600">
                                                            {formatCurrency(discountPrice)}
                                                        </span>
                                                        <span className="text-xl font-bold text-gray-400 line-through decoration-red-500/50">
                                                            {formatCurrency(price)}
                                                        </span>
                                                    </>
                                                );
                                            }
                                            return (
                                                <p className="text-2xl font-black text-[var(--primary)]">
                                                    {formatCurrency(effectivePrice)}
                                                </p>
                                            );
                                        })()}
                                    </div>
                                </div>
                            </div>

                            {/* Variant Selector */}
                            {selectedProduct.variants && selectedProduct.variants.length > 0 && (
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2">
                                        <div className="w-1 h-4 bg-[var(--primary)] rounded-full"></div>
                                        <h3 className="text-xs font-black uppercase tracking-widest text-[var(--text)]">Opciones</h3>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        <button
                                            onClick={() => {
                                                setSelectedVariantId(null);
                                            }}
                                            className={cn(
                                                "px-4 py-2 rounded-xl text-sm font-bold border-2 transition-all duration-200",
                                                !selectedVariantId
                                                    ? "bg-[var(--primary)] border-[var(--primary)] text-[var(--primary-foreground)] shadow-lg shadow-[var(--primary)]/20 scale-105"
                                                    : "bg-[var(--secondary)] border-transparent text-[var(--text)] hover:border-[var(--border)]"
                                            )}
                                        >
                                            Principal
                                        </button>
                                        {selectedProduct.variants.map((v) => (
                                            <button
                                                key={v.id}
                                                onClick={() => {
                                                    setSelectedVariantId(v.id);
                                                }}
                                                className={cn(
                                                    "px-4 py-2 rounded-xl text-sm font-bold border-2 transition-all duration-200",
                                                    selectedVariantId === v.id
                                                        ? "bg-[var(--primary)] border-[var(--primary)] text-[var(--primary-foreground)] shadow-lg shadow-[var(--primary)]/20 scale-105"
                                                        : "bg-[var(--secondary)] border-transparent text-[var(--text)] hover:border-[var(--border)]"
                                                )}
                                            >
                                                {v.name}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {selectedProduct.description && (
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2">
                                        <div className="w-1 h-4 bg-[var(--primary)] rounded-full"></div>
                                        <h3 className="text-xs font-black uppercase tracking-widest text-[var(--text)]">Descripción</h3>
                                    </div>
                                    <p className="text-[var(--text)]/60 font-medium leading-relaxed text-base sm:text-lg italic">
                                        {selectedProduct.description}
                                    </p>
                                </div>
                            )}

                            <div className="flex items-center justify-between p-6 bg-[var(--secondary)] rounded-[2.5rem] border border-[var(--border)]">
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black text-[var(--text)]/40 uppercase tracking-widest">
                                        {selectedProduct.trackInventory ? 'Disponibilidad' : 'Status'}
                                    </p>
                                    <div className="flex items-center gap-2">
                                        <div className={cn("w-2 h-2 rounded-full animate-pulse", selectedProduct.trackInventory ? "bg-green-500" : "bg-blue-500")}></div>
                                        <p className="font-black text-[var(--text)]">
                                            {(() => {
                                                if (!selectedProduct.trackInventory) return "Disponible por pedido";
                                                const variantStock = selectedProduct.variants?.find(v => v.id === selectedVariantId);
                                                if (variantStock && !variantStock.useParentStock) {
                                                    return `${variantStock.stock} unidades`;
                                                }
                                                return `${selectedProduct.inventory?.stock ?? '0'} unidades`;
                                            })()}
                                        </p>
                                    </div>
                                    {inCartQty > 0 && (
                                        <p className="text-[9px] font-bold text-green-600 mt-1 uppercase tracking-tighter">
                                            Ya tienes {inCartQty} en el carrito
                                        </p>
                                    )}
                                </div>
                                <div className="flex items-center gap-5 bg-[var(--surface)] p-2 rounded-2xl shadow-sm border border-[var(--border)]">
                                    <button
                                        onClick={() => setQty(Math.max(1, currentQty - 1))}
                                        className="w-10 h-10 md:w-12 md:h-10 flex items-center justify-center rounded-xl bg-[var(--secondary)] hover:bg-[var(--border)] text-[var(--text)] transition-all active:scale-90 border border-[var(--border)]/50"
                                    >
                                        <Minus className="w-4 h-4 md:w-5 md:h-5" />
                                    </button>
                                    <span className="w-6 md:w-8 text-center font-black text-xl md:text-2xl text-[var(--surface-text)]">{currentQty}</span>
                                    <button
                                        onClick={() => {
                                            if (!selectedProduct.trackInventory) {
                                                setQty(currentQty + 1);
                                                return;
                                            }
                                            const v = selectedProduct.variants?.find(v => v.id === selectedVariantId);
                                            const available = (v && !v.useParentStock)
                                                ? v.stock
                                                : (selectedProduct.inventory?.stock ?? 0);
                                            if (currentQty < available) {
                                                setQty(currentQty + 1);
                                            } else {
                                                showMessage(`Solo hay ${available} disponibles.`);
                                            }
                                        }}
                                        className="w-10 h-10 md:w-12 md:h-10 flex items-center justify-center rounded-xl bg-[var(--secondary)] hover:bg-[var(--border)] text-[var(--text)] transition-all active:scale-90 border border-[var(--border)]/50"
                                    >
                                        <Plus className="w-4 h-4 md:w-5 md:h-5" />
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="pt-6 mt-auto">
                            <button
                                onClick={handleAddToCart}
                                className="w-full bg-[var(--primary)] text-[var(--primary-foreground)] py-4 md:py-5 rounded-2xl md:rounded-[2rem] font-black text-lg md:text-xl flex items-center justify-center gap-3 hover:scale-[1.02] transition-all shadow-xl active:scale-[0.98]"
                            >
                                <ShoppingCart className="w-5 h-5 md:w-6 md:h-6" />
                                Añadir {finalEntriesCount > 1 ? `(${finalEntriesCount} tipos)` : ''} • {formatCurrency(getTotalSessionPrice())}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
