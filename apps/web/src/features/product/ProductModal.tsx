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
    AlertCircle,
    MessageCircle
} from 'lucide-react';
import { cn, formatCurrency } from '@/lib/utils';
import type { Product, Category, Store } from '@/types/types';

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

    const getEffectivePrice = (): number | null => {
        const variant = selectedProduct.variants?.find(v => v.id === selectedVariantId);

        // Caso base: Precio del producto padre (puede ser null)
        let price: number | null = selectedProduct.discountPrice ?? selectedProduct.price ?? null;

        if (variant) {
            // Si usa precio padre, mantenemos el precio base calculado arriba
            // Si NO usa precio padre, usamos el precio de la variante (que puede ser null -> Consultar)
            if (!variant.useParentPrice) {
                price = variant.price !== null ? Number(variant.price) : null;
            }
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

            // Precio base (puede ser null)
            let price = selectedProduct.discountPrice ?? selectedProduct.price ?? null;

            if (v) {
                // Si la variante tiene precio propio
                if (!v.useParentPrice) {
                    price = v.price; // puede ser null
                }
                // Si useParentPrice es true, se mantiene el precio base calculado arriba
            }

            // Si el precio final es null, asumimos 0 para no romper el cálculo, 
            // aunque idealmente esta función no se usaría visualmente si es "Consultar"
            return total + ((price ?? 0) * qty);
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

            {/* Modal Container: Fixed height to force internal scrolling */}
            <div className="bg-[var(--bg)] w-full md:max-w-4xl h-[90vh] md:h-[85vh] rounded-[2rem] md:rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col md:grid md:grid-cols-2 md:border border-[var(--border)] relative">
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
                <div className="w-full h-64 md:h-full shrink-0 bg-white flex items-center justify-center relative md:aspect-[4/5] overflow-hidden">
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
                            {/* Ambient Blur Background (Fills whitespace) */}
                            <Image
                                src={displayImages[currentImageIndex] || displayImages[0] || ''}
                                alt="Ambient Background"
                                fill
                                className="object-cover scale-10"
                                priority
                            />

                            {/* Main Image */}
                            <Image
                                src={displayImages[currentImageIndex] || displayImages[0] || ''}
                                alt={selectedProduct.name}
                                fill
                                className="object-cover relative z-10"
                                priority
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
                <div className="w-full flex flex-col flex-1 md:h-full min-h-0 bg-[var(--bg)] border-t md:border-t-0 md:border-l border-[var(--border)]">
                    {/* Header: Share & Close (Fixed at top of details) */}
                    <div className="flex items-center justify-end gap-2 p-4 sm:p-6 pb-2 shrink-0">
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

                    {/* Scrollable Content */}
                    <div className="flex-1 overflow-y-auto custom-scrollbar p-6 sm:p-8 pt-0 space-y-6">
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
                                <h2 className="text-2xl sm:text-3xl font-black text-[var(--text)] leading-tight tracking-tight break-words">
                                    {selectedProduct.name}
                                </h2>
                                <div className="flex items-center gap-4">
                                    {(() => {
                                        const price = selectedProduct.price;
                                        const discountPrice = selectedProduct.discountPrice;
                                        const effectivePrice = getEffectivePrice();

                                        // Si no hay precio efectivo (es null) -> Mostrar "Consultar Precio" en azul
                                        if (effectivePrice === null) {
                                            return (
                                                <p className="text-2xl font-black text-blue-600">
                                                    Consultar Precio
                                                </p>
                                            );
                                        }

                                        // Si hay descuento y no hay variante seleccionada (caso simple)
                                        // TODO: Podríamos refinar esto para variantes también si tienen descuento propio (futura mejora)
                                        if (discountPrice && !selectedVariantId) {
                                            return (
                                                <>
                                                    <span className="text-2xl font-black text-green-600">
                                                        {formatCurrency(discountPrice)}
                                                    </span>
                                                    <span className="text-xl font-bold text-gray-400 line-through decoration-red-500/50">
                                                        {formatCurrency(price ?? 0)}
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

                        {/* Minimalist Stock & Quantity Selector (Moved Up) */}
                        <div className="bg-[var(--secondary)]/50 p-4 rounded-[2rem] flex items-center justify-between border border-[var(--border)]/50">
                            <div className="pl-2">
                                <p className="text-[9px] font-black text-[var(--text)]/30 uppercase tracking-[0.2em] mb-1">
                                    {selectedProduct.trackInventory ? 'Disponibilidad' : 'Estado'}
                                </p>
                                <div className="flex items-center gap-2">
                                    <div className={cn("w-2 h-2 rounded-full", selectedProduct.trackInventory ? "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]" : "bg-blue-500")}></div>
                                    <p className="font-black text-sm text-[var(--text)]">
                                        {(() => {
                                            if (!selectedProduct.trackInventory) return "Disponible";
                                            const variantStock = selectedProduct.variants?.find(v => v.id === selectedVariantId);
                                            if (variantStock && !variantStock.useParentStock) {
                                                return `${variantStock.stock} unid.`;
                                            }
                                            return `${selectedProduct.inventory?.stock ?? '0'} unid.`;
                                        })()}
                                    </p>
                                </div>
                            </div>

                            <div className="bg-[var(--bg)] p-1.5 rounded-full shadow-sm border border-[var(--border)]/50 flex items-center gap-3">
                                <button
                                    onClick={() => setQty(Math.max(1, currentQty - 1))}
                                    className="w-8 h-8 flex items-center justify-center rounded-full bg-[var(--secondary)] hover:bg-[var(--border)] text-[var(--text)] transition-all active:scale-90"
                                >
                                    <Minus className="w-3 h-3" />
                                </button>
                                <span className="w-4 text-center font-black text-lg text-[var(--text)]">{currentQty}</span>
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
                                            showMessage(`Máx ${available}`);
                                        }
                                    }}
                                    className="w-8 h-8 flex items-center justify-center rounded-full bg-[var(--secondary)] hover:bg-[var(--border)] text-[var(--text)] transition-all active:scale-90"
                                >
                                    <Plus className="w-3 h-3" />
                                </button>
                            </div>
                        </div>

                        {selectedProduct.description && (
                            <div className="space-y-4 px-2">
                                <div className="flex items-center gap-2">
                                    <div className="w-1 h-3 bg-[var(--primary)] rounded-full"></div>
                                    <h3 className="text-[10px] font-black uppercase tracking-widest text-[var(--text)]/50">Detalles</h3>
                                </div>
                                <p className="text-[var(--text)]/70 font-medium leading-relaxed text-sm break-words whitespace-pre-line">
                                    {selectedProduct.description}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Footer Action Button (Fixed by Flex) */}
                    <div className="p-6 pt-4 mt-auto border-t border-[var(--border)] bg-[var(--bg)]/80 backdrop-blur-sm z-10">
                        {getEffectivePrice() === null ? (
                            <a
                                href={(() => {
                                    const variant = selectedProduct.variants?.find(v => v.id === selectedVariantId);
                                    const sku = variant?.sku || selectedProduct.sku;
                                    const url = typeof window !== 'undefined' ? `${window.location.origin}${window.location.pathname}?p=${selectedProduct.id}` : '';

                                    let message = `Hola, me interesa saber el precio de: *${selectedProduct.name}*`;
                                    if (variant) message += ` (${variant.name})`;
                                    if (sku) message += `\nCódigo: ${sku}`;
                                    message += `\nVer aquí: ${url}`;

                                    return `https://wa.me/${store?.whatsappNumber?.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
                                })()}
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
                                Añadir {finalEntriesCount > 1 ? `(${finalEntriesCount} tipos)` : ''} • {formatCurrency(getTotalSessionPrice())}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}




