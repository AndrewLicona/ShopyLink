// Update: Force Refresh Verification
'use client';

import {
    ShoppingBag,
    MessageCircle,
    Plus,
    Minus,
    Search,
    Loader2,
    X,
    AlertCircle,
} from 'lucide-react';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { StoreFooter } from '@/components/StoreFooter';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useState, useEffect, useRef } from 'react';
import { api } from '@/lib/api';
import { formatCurrency } from '@/lib/utils';
import { ProductModal } from '@/components/ProductModal';
import type { Store, Product, Category } from '@/lib/types';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface StoreViewProps {
    store: Store;
    products: Product[];
    categories: Category[];
}

export function StoreView({ store, products: initialProducts, categories }: StoreViewProps) {
    const products = initialProducts;
    const [cart, setCart] = useState<{ id: string, quantity: number, name: string, price: number, image?: string, variantId?: string, variantName?: string }[]>([]);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const searchParams = useSearchParams();

    const [isCreatingOrder, setIsCreatingOrder] = useState(false);
    const [showNameModal, setShowNameModal] = useState(false);
    const [customerName, setCustomerName] = useState('');
    const [customerAddress, setCustomerAddress] = useState('');
    const [deliveryMethod, setDeliveryMethod] = useState<'delivery' | 'pickup'>('delivery');
    const [stockAlert, setStockAlert] = useState<{ show: boolean, message: string }>({ show: false, message: '' });

    const showMessage = (msg: string) => {
        setStockAlert({ show: true, message: msg });
        setTimeout(() => setStockAlert({ show: false, message: '' }), 3000);
    };

    const openProductModal = (product: Product) => {
        setSelectedProduct(product);
    };

    const handleAddToCart = (product: Product, quantity: number, variantId?: string | null) => {
        let finalPrice = Number(product.discountPrice || product.price);
        let finalStock = product.inventory?.stock ?? 0;
        let variantName: string | undefined = undefined;

        if (product.variants && product.variants.length > 0) {
            const variant = product.variants.find(v => v.id === variantId);
            if (variant) {
                finalPrice = variant.useParentPrice
                    ? Number(product.discountPrice || product.price)
                    : Number(variant.price);

                finalStock = variant.useParentStock
                    ? (product.inventory?.stock ?? 0)
                    : variant.stock;

                variantName = variant.name;
            }
        }

        const trackStock = product.trackInventory;

        setCart(prev => {
            const existing = prev.find(item => item.id === product.id && item.variantId === variantId);
            const currentQty = existing ? existing.quantity : 0;
            const newTotalQty = currentQty + quantity;

            if (trackStock && newTotalQty > finalStock) {
                showMessage(`¡Lo sentimos! Solo hay ${finalStock} unidades disponibles.`);
                return prev;
            }

            if (existing) {
                return prev.map(item => (item.id === product.id && item.variantId === variantId)
                    ? { ...item, quantity: newTotalQty }
                    : item
                );
            }

            const variant = product.variants?.find(v => v.id === variantId);
            const itemImage = (variant?.images && variant.images.length > 0)
                ? variant.images[0]
                : (product.images?.[0]);

            return [...prev, {
                id: product.id,
                quantity: quantity,
                name: product.name,
                price: finalPrice,
                image: itemImage,
                variantId: variantId || undefined,
                variantName
            }];
        });
    };

    // Auto-open product modal from URL ?p=productId
    useEffect(() => {
        if (products.length > 0) {
            const productId = searchParams.get('p');
            if (productId) {
                const product = products.find(p => p.id === productId);
                if (product) {
                    setSelectedProduct(product);
                }
            }
        }
    }, [products, searchParams]);

    const addToCart = (product: Product) => {
        // Find if any variant of this product is already in the cart
        const existingItem = cart.find(item => item.id === product.id);

        if (existingItem) {
            updateQuantity(product.id, 1, existingItem.variantId);
            return;
        }

        // If not in cart, add it immediately (the first variant if any, or base product)
        const firstVariantId = product.variants?.[0]?.id;
        handleAddToCart(product, 1, firstVariantId || null);
    };

    const updateQuantity = (id: string, delta: number, variantId?: string) => {
        setCart(prev => prev.map(item => {
            if (item.id === id && item.variantId === variantId) {
                const product = products.find(p => p.id === id);
                let availableStock = product?.inventory?.stock ?? 0;
                let trackStock = product?.trackInventory;

                if (product?.variants && variantId) {
                    const v = product.variants.find(v => v.id === variantId);
                    if (v) {
                        availableStock = v.useParentStock ? (product.inventory?.stock ?? 0) : v.stock;
                    }
                }

                const newQty = Math.max(0, item.quantity + delta);

                if (product && trackStock && newQty > availableStock) {
                    showMessage(`Solo hay ${availableStock} disponibles.`);
                    return item;
                }
                return { ...item, quantity: newQty };
            }
            return item;
        }).filter(item => item.quantity > 0));
    };

    const filteredProducts = products.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = categoryFilter === 'all' || p.categoryId === categoryFilter;
        const hasStock = !p.trackInventory || (p.inventory && p.inventory.stock > 0);
        return matchesSearch && matchesCategory && hasStock;
    });

    const cartTotal = cart.reduce((total, item) => {
        return total + item.price * item.quantity;
    }, 0);

    const handleConfirmOrder = async () => {
        if (!customerName.trim()) {
            showMessage('Por favor, ingresa tu nombre para continuar.');
            return;
        }

        setShowNameModal(false);
        setIsCreatingOrder(true);
        try {
            // Determine final address based on delivery method
            let finalAddress: string | undefined = undefined;
            if (store.deliveryEnabled && deliveryMethod === 'delivery') {
                finalAddress = customerAddress.trim() || undefined;
            }

            const orderData = {
                storeId: store.id,
                customerName,
                customerAddress: finalAddress,
                items: cart.map(item => ({
                    productId: item.id,
                    quantity: item.quantity,
                    variantId: item.variantId
                }))
            };

            const response = await api.createOrder(orderData);

            if (response.whatsappLink) {
                // Detect if mobile device
                const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

                if (isMobile) {
                    window.location.href = response.whatsappLink;
                } else {
                    window.open(response.whatsappLink, '_blank');
                }

                setCart([]);
                setIsCartOpen(false);
                // We'd ideally refresh products here, but since it's now a server component, 
                // we'll rely on the redirect or manual refresh for now.
                // In a real app, router.refresh() would work.
            }
        } catch (err: unknown) {
            const error = err as { message?: string };
            console.error('Error creating order:', error);
            if (error.message?.includes('Insufficient stock')) {
                const productName = error.message.split(': ')[1] || 'un producto';
                showMessage(`¡Lo sentimos! No hay suficiente stock disponible para: ${productName}. Por favor, reduce la cantidad e intenta de nuevo.`);
            } else {
                showMessage('Hubo un error al procesar tu pedido. Por favor intenta de nuevo.');
            }
        } finally {
            setIsCreatingOrder(false);
        }
    };

    const handleWhatsAppCheckout = () => {
        if (!store?.id) return;
        if (cart.length === 0) return;
        setShowNameModal(true);
    };



    return (
        <div className="min-h-screen bg-[var(--bg)] text-[var(--text)] flex flex-col pb-20">
            {/* Store Header */}
            <header className="bg-[var(--bg)] border-b border-[var(--border)] sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-20">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-transparent rounded-xl overflow-hidden shadow-sm flex items-center justify-center border border-transparent relative">
                                {store?.logoUrl ? (
                                    <Image
                                        src={store.logoUrl}
                                        alt={store.name}
                                        fill
                                        className="object-contain"
                                        sizes="40px"
                                    />
                                ) : '🏪'}
                            </div>
                            <div>
                                <h1 className="text-xl font-black text-[var(--text)] uppercase tracking-tight leading-tight">
                                    {store?.name || 'Cargando...'}
                                </h1>
                                <p className="text-[10px] text-green-600 font-black uppercase tracking-widest flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]"></span>
                                    Abierto ahora
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setIsCartOpen(true)}
                                className="relative p-3 bg-[var(--primary)] text-[var(--bg)] rounded-2xl hover:scale-105 transition-all active:scale-95"
                            >
                                <ShoppingBag className="w-5 h-5" />
                                {cart.length > 0 && (
                                    <span className="absolute -top-1 -right-1 bg-[var(--text)] text-[var(--bg)] text-[9px] font-black w-5 h-5 flex items-center justify-center rounded-full border-2 border-[var(--bg)]">
                                        {cart.reduce((a, b) => a + b.quantity, 0)}
                                    </span>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Catalog */}
            <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
                {/* Search Bar */}
                <div className="mb-6 relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Buscar producto..."
                        className="w-full pl-12 pr-4 py-4 rounded-3xl bg-[var(--bg)] border border-[var(--border)] shadow-sm focus:ring-2 focus:ring-[var(--primary)]/20 outline-none text-[var(--text)] font-bold"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                {/* Categories Bar */}
                <div className="flex gap-2 overflow-x-auto pb-8 scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
                    <button
                        onClick={() => setCategoryFilter('all')}
                        className={`px-6 py-2.5 rounded-2xl text-xs font-black uppercase tracking-widest whitespace-nowrap transition-all shadow-sm ${categoryFilter === 'all'
                            ? 'bg-[var(--primary)] text-[var(--bg)] shadow-[var(--primary)]/10 shadow-lg'
                            : 'bg-[var(--bg)] text-[var(--text)]/60 border border-[var(--border)] hover:text-[var(--text)] hover:bg-[var(--secondary)]'
                            }`}
                    >
                        Todo
                    </button>
                    {categories.map((cat) => (
                        <button
                            key={cat.id}
                            onClick={() => setCategoryFilter(cat.id)}
                            className={`px-6 py-2.5 rounded-2xl text-xs font-black uppercase tracking-widest whitespace-nowrap transition-all shadow-sm ${categoryFilter === cat.id
                                ? 'bg-[var(--primary)] text-[var(--bg)] shadow-[var(--primary)]/10 shadow-lg'
                                : 'bg-[var(--bg)] text-[var(--text)]/60 border border-[var(--border)] hover:text-[var(--text)] hover:bg-[var(--secondary)]'
                                }`}
                        >
                            {cat.name}
                        </button>
                    ))}
                </div>

                {/* Product Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                    {filteredProducts.length > 0 ? (
                        filteredProducts.map((product) => (
                            <div
                                key={product.id}
                                onClick={() => openProductModal(product)}
                                className="bg-[var(--bg)] rounded-[2rem] p-3 border border-[var(--border)] hover:border-[var(--primary)]/50 hover:shadow-xl transition-all group flex flex-col relative cursor-pointer"
                            >
                                <div className="aspect-square bg-[var(--secondary)] rounded-[1.5rem] flex items-center justify-center relative overflow-hidden">
                                    {product.images?.[0] ? (
                                        <Image
                                            src={product.images[0]}
                                            alt={product.name}
                                            fill
                                            className="object-cover transition-transform group-hover:scale-110 duration-500"
                                            sizes="(max-width: 768px) 50vw, 25vw"
                                        />
                                    ) : (
                                        <ShoppingBag className="w-8 h-8 text-gray-200" />
                                    )}

                                    {product.discountPrice && (
                                        <div className="absolute top-2 right-2">
                                            <span className="bg-green-500 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg">
                                                Oferta
                                            </span>
                                        </div>
                                    )}

                                    {product.categoryId && (
                                        <div className="absolute top-2 left-2">
                                            <span className="bg-[var(--surface)]/90 backdrop-blur-sm text-[var(--text)] px-2 py-1 rounded-lg text-[8px] font-black uppercase tracking-tighter shadow-sm border border-[var(--border)]">
                                                {categories.find(c => c.id === product.categoryId)?.name}
                                            </span>
                                        </div>
                                    )}
                                </div>
                                <div className="mt-4 flex-1 flex flex-col px-1">
                                    <h3 className="text-sm font-black text-[var(--text)] line-clamp-1">{product.name}</h3>
                                    <div className="mt-auto pt-3 flex items-center justify-between gap-2">
                                        <div className="flex flex-col">
                                            {product.discountPrice ? (
                                                <>
                                                    <span className="text-[10px] font-bold text-[var(--text)]/40 line-through decoration-red-500/50">
                                                        {formatCurrency(product.price)}
                                                    </span>
                                                    <span className="text-base font-black text-green-500">
                                                        {formatCurrency(product.discountPrice)}
                                                    </span>
                                                </>
                                            ) : (
                                                <span className="text-base font-black text-[var(--primary)]">
                                                    {formatCurrency(product.price)}
                                                </span>
                                            )}
                                        </div>
                                        <div
                                            className="relative z-[50]"
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            <button
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    addToCart(product);
                                                }}
                                                className="w-10 h-10 bg-[var(--primary)] text-white rounded-xl flex items-center justify-center hover:scale-110 shadow-lg active:scale-90 transition-all cursor-pointer"
                                            >
                                                <Plus className="w-5 h-5" />
                                                {(() => {
                                                    const quantity = cart.find(item => item.id === product.id)?.quantity;
                                                    return quantity && quantity > 0 ? (
                                                        <span className="absolute -top-2 -right-2 bg-[var(--text)] text-[var(--bg)] text-[9px] font-black w-5 h-5 flex items-center justify-center rounded-full border-2 border-[var(--bg)] animate-in zoom-in-50">
                                                            {quantity}
                                                        </span>
                                                    ) : null;
                                                })()}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="col-span-full flex flex-col items-center justify-center py-20 text-center space-y-4">
                            <div className="w-24 h-24 bg-[var(--secondary)] rounded-full flex items-center justify-center mb-4 text-[var(--text)]/20 animate-pulse">
                                <Search className="w-10 h-10" />
                            </div>
                            <h3 className="text-xl font-black text-[var(--text)]">No encontramos productos</h3>
                            <p className="text-[var(--text)]/60 max-w-xs mx-auto">
                                {searchTerm
                                    ? `No hay resultados para "${searchTerm}"`
                                    : "Esta categoría aún no tiene productos disponibles."}
                            </p>
                        </div>
                    )}
                </div>
            </main>

            {/* Footer */}
            {store && <StoreFooter store={store} />}

            {/* Cart Sidebar */}
            {isCartOpen && (
                <div className="fixed inset-0 z-50 flex justify-end">
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsCartOpen(false)} />
                    <div className="relative w-full max-w-md bg-[var(--bg)] h-full shadow-2xl flex flex-col text-[var(--text)]">
                        <div className="p-6 border-b border-[var(--border)] flex items-center justify-between">
                            <h2 className="text-2xl font-black">Tu Pedido</h2>
                            <button
                                onClick={() => setIsCartOpen(false)}
                                className="w-10 h-10 flex items-center justify-center bg-[var(--bg)] border border-[var(--border)] rounded-xl text-[var(--text)]/40 hover:text-[var(--text)] hover:bg-[var(--surface)] hover:shadow-[var(--shadow)] transition-all active:scale-90"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 space-y-6">
                            {cart.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-center text-gray-400">
                                    <div className="w-20 h-20 bg-[var(--secondary)] rounded-full flex items-center justify-center mb-4 text-[var(--text)]/40">
                                        <ShoppingBag className="w-10 h-10" />
                                    </div>
                                    <p className="text-sm font-bold">Tu carrito está vacío</p>
                                </div>
                            ) : (
                                cart.map((item) => (
                                    <div key={item.id + (item.variantId || '')} className="flex gap-4">
                                        <div className="w-16 h-16 bg-[var(--secondary)] rounded-2xl flex items-center justify-center overflow-hidden border border-[var(--border)] relative">
                                            {item.image ? (
                                                <Image
                                                    src={item.image}
                                                    alt={item.name}
                                                    fill
                                                    className="object-cover"
                                                    sizes="64px"
                                                />
                                            ) : (
                                                <ShoppingBag className="w-6 h-6 text-gray-200" />
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="font-bold text-sm line-clamp-1">{item.name}</h4>
                                            {item.variantName && (
                                                <p className="text-[10px] text-[var(--text)]/40 font-bold uppercase tracking-widest">{item.variantName}</p>
                                            )}
                                            <p className="text-[var(--primary)] font-black text-xs">{formatCurrency(item.price)}</p>
                                            <div className="flex items-center gap-3 mt-2">
                                                <button
                                                    onClick={() => updateQuantity(item.id, -1, item.variantId)}
                                                    className="p-1 border border-[var(--border)] rounded-lg hover:bg-[var(--secondary)] text-[var(--text)]/50 active:scale-90 transition-all"
                                                >
                                                    <Minus className="w-4 h-4" />
                                                </button>
                                                <span className="font-black text-xs w-4 text-center">{item.quantity}</span>
                                                <button
                                                    onClick={() => updateQuantity(item.id, 1, item.variantId)}
                                                    className="p-1 border border-[var(--border)] rounded-lg hover:bg-[var(--secondary)] text-[var(--text)]/50 active:scale-90 transition-all"
                                                >
                                                    <Plus className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-black text-sm">{formatCurrency(item.price * item.quantity)}</p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {cart.length > 0 && (
                            <div className="p-6 border-t border-[var(--border)] space-y-4">
                                <div className="flex justify-between items-center text-xl font-black">
                                    <span>Total:</span>
                                    <span className="text-[var(--primary)]">{formatCurrency(cartTotal)}</span>
                                </div>
                                <button
                                    onClick={handleWhatsAppCheckout}
                                    disabled={isCreatingOrder}
                                    className="w-full bg-[#25D366] text-white py-5 rounded-[2rem] font-black text-lg flex items-center justify-center gap-3 hover:scale-[1.02] transition-all shadow-xl shadow-green-500/10 disabled:opacity-50"
                                >
                                    {isCreatingOrder ? (
                                        <Loader2 className="w-6 h-6 animate-spin" />
                                    ) : (
                                        <>
                                            <MessageCircle className="w-6 h-6" />
                                            Enviar pedido por WhatsApp
                                        </>
                                    )}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Floating Mobile Cart Button */}
            {cart.length > 0 && !isCartOpen && (
                <button
                    onClick={() => setIsCartOpen(true)}
                    className="md:hidden fixed bottom-10 left-1/2 -translate-x-1/2 bg-black text-white px-8 py-4 rounded-full font-black text-sm flex items-center gap-3 shadow-2xl shadow-black/20 animate-in slide-in-from-bottom-5 duration-300 active:scale-95"
                >
                    <ShoppingBag className="w-5 h-5" />
                    Ver Pedido ({cart.reduce((a, b) => a + b.quantity, 0)})
                </button>
            )}

            {/* Name Modal */}
            {showNameModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="bg-[var(--surface)] w-full max-w-sm rounded-[3rem] shadow-[var(--shadow-strong)] overflow-hidden animate-in zoom-in-95 duration-300 ring-1 ring-black/5">
                        <div className="p-8 space-y-8">
                            <div className="flex flex-col items-center text-center gap-4">
                                <div className="w-20 h-20 bg-[var(--primary)]/10 text-[var(--primary)] rounded-[2rem] flex items-center justify-center shadow-inner">
                                    <ShoppingBag className="w-10 h-10" />
                                </div>
                                <div className="space-y-2">
                                    <h2 className="text-2xl font-black text-[var(--text)] leading-tight">¿Cómo te llamas?</h2>
                                    <p className="text-[var(--text)]/40 font-bold text-xs uppercase tracking-widest">Para identificar tu pedido</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="relative group">
                                    <input
                                        type="text"
                                        placeholder="Tu nombre completo"
                                        autoFocus
                                        value={customerName}
                                        onChange={(e) => setCustomerName(e.target.value)}
                                        className="w-full px-6 py-5 rounded-[1.5rem] bg-[var(--secondary)] border-2 border-transparent focus:border-[var(--primary)]/20 focus:bg-[var(--bg)] outline-none text-[var(--text)] font-bold transition-all text-center placeholder:text-[var(--text)]/30"
                                    />
                                </div>

                                {store.deliveryEnabled && (
                                    <div className="space-y-4">
                                        {/* Delivery Method Toggle */}
                                        <div className="flex p-1 bg-[var(--secondary)] rounded-[1.5rem] relative">
                                            <button
                                                type="button"
                                                onClick={() => setDeliveryMethod('delivery')}
                                                className={cn(
                                                    "flex-1 py-3 px-4 rounded-[1.2rem] text-xs sm:text-sm font-black transition-all duration-300 z-10",
                                                    deliveryMethod === 'delivery'
                                                        ? "bg-[var(--primary)] text-[var(--primary-foreground)] shadow-lg scale-100"
                                                        : "text-[var(--text)]/40 hover:text-[var(--text)]/60"
                                                )}
                                            >
                                                Domicilio
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setDeliveryMethod('pickup')}
                                                className={cn(
                                                    "flex-1 py-3 px-4 rounded-[1.2rem] text-xs sm:text-sm font-black transition-all duration-300 z-10",
                                                    deliveryMethod === 'pickup'
                                                        ? "bg-[var(--primary)] text-[var(--primary-foreground)] shadow-lg scale-100"
                                                        : "text-[var(--text)]/40 hover:text-[var(--text)]/60"
                                                )}
                                            >
                                                Retirar en Tienda
                                            </button>
                                        </div>

                                        {/* Address Input - Animated visibility */}
                                        <div className={cn(
                                            "space-y-4 transition-all duration-300 overflow-hidden",
                                            deliveryMethod === 'delivery' ? "opacity-100 max-h-[200px]" : "opacity-0 max-h-0"
                                        )}>
                                            <div className="relative">
                                                <input
                                                    type="text"
                                                    placeholder="Dirección de envío (Opcional)"
                                                    value={customerAddress}
                                                    onChange={(e) => setCustomerAddress(e.target.value)}
                                                    className="w-full px-6 py-5 rounded-[1.5rem] bg-[var(--secondary)] border-2 border-transparent focus:border-[var(--primary)]/20 focus:bg-[var(--bg)] outline-none text-[var(--text)] font-bold transition-all text-center placeholder:text-[var(--text)]/30"
                                                />
                                            </div>

                                            <div className="flex items-center justify-center gap-2 mt-1">
                                                <div className="h-px bg-[var(--border)] flex-1" />
                                                <span className="text-[10px] bg-blue-50 text-blue-600 px-3 py-1 rounded-full font-black uppercase tracking-widest border border-blue-100 italic">
                                                    Delivery: {store.deliveryPrice || 'Gratis'}
                                                </span>
                                                <div className="h-px bg-[var(--border)] flex-1" />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <button
                                    onClick={handleConfirmOrder}
                                    disabled={!customerName.trim() || isCreatingOrder}
                                    className="w-full bg-[var(--primary)] text-[var(--primary-foreground)] py-5 rounded-[2rem] font-black text-lg flex items-center justify-center gap-3 hover:scale-[1.02] transition-all shadow-xl shadow-[var(--primary)]/10 disabled:opacity-50 disabled:bg-[var(--secondary)] disabled:text-[var(--text)]/40 disabled:shadow-none active:scale-95"
                                >
                                    {isCreatingOrder ? (
                                        <Loader2 className="w-6 h-6 animate-spin" />
                                    ) : (
                                        "Confirmar Pedido"
                                    )}
                                </button>

                                <button
                                    onClick={() => setShowNameModal(false)}
                                    className="w-full text-[var(--text)]/40 font-bold text-sm py-2 hover:text-[var(--text)] transition-colors"
                                >
                                    Cancelar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )
            }

            {/* Stock Alert Modal */}
            {
                stockAlert.show && (
                    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
                        <div className="bg-[var(--surface)] w-full max-w-sm rounded-[3rem] shadow-[var(--shadow-strong)] overflow-hidden animate-in zoom-in-95 duration-300 ring-1 ring-black/5">
                            <div className="p-8 space-y-6">
                                <div className="flex flex-col items-center text-center gap-4">
                                    <div className="w-20 h-20 bg-orange-500/10 text-orange-500 rounded-[2rem] flex items-center justify-center shadow-inner">
                                        <AlertCircle className="w-10 h-10" />
                                    </div>
                                    <div className="space-y-2">
                                        <h2 className="text-2xl font-black leading-tight">¡Lo sentimos!</h2>
                                        <p className="text-[var(--text)]/60 font-bold text-sm">{stockAlert.message}</p>
                                    </div>
                                </div>

                                <button
                                    onClick={() => setStockAlert({ show: false, message: '' })}
                                    className="w-full bg-[var(--text)] text-[var(--bg)] py-5 rounded-[2rem] font-black text-lg flex items-center justify-center gap-3 hover:scale-[1.02] transition-all active:scale-95"
                                >
                                    Entendido
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* Product Detail Modal */}
            <ProductModal
                product={selectedProduct}
                isOpen={!!selectedProduct}
                onClose={() => setSelectedProduct(null)}
                onAddToCart={handleAddToCart}
                categories={categories}
                store={store}
            />
        </div>
    );
}
