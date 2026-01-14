'use client';

import {
    ShoppingBag,
    MessageCircle,
    ShoppingCart,
    Plus,
    Minus,
    Search,
    ChevronRight,
    ChevronLeft,
    Loader2,
    X,
    AlertCircle,
    Share2,
    Check
} from 'lucide-react';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { StoreFooter } from '@/components/StoreFooter';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useState, useEffect, useRef } from 'react';
import { api } from '@/lib/api';
import { formatCurrency } from '@/lib/utils';
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
    const [cart, setCart] = useState<{ id: string, quantity: number, name: string, price: number, image?: string }[]>([]);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [isCopied, setIsCopied] = useState(false);
    const [showManualShare, setShowManualShare] = useState(false);
    const searchParams = useSearchParams();

    const [isCreatingOrder, setIsCreatingOrder] = useState(false);
    const [showNameModal, setShowNameModal] = useState(false);
    const [customerName, setCustomerName] = useState('');
    const [stockAlert, setStockAlert] = useState<{ show: boolean, message: string }>({ show: false, message: '' });
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [modalQuantity, setModalQuantity] = useState(1);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const touchStartX = useRef<number | null>(null);

    const showMessage = (msg: string) => {
        setStockAlert({ show: true, message: msg });
    };

    const openProductModal = (product: Product) => {
        setSelectedProduct(product);
        setModalQuantity(1);
        setCurrentImageIndex(0);
    };

    const handleAddToCartFromModal = () => {
        if (!selectedProduct) return;

        const availableStock = selectedProduct.inventory?.stock ?? 0;
        const trackStock = selectedProduct.trackInventory;

        setCart(prev => {
            const existing = prev.find(item => item.id === selectedProduct.id);
            const currentQty = existing ? existing.quantity : 0;
            const newTotalQty = currentQty + modalQuantity;

            if (trackStock && newTotalQty > availableStock) {
                showMessage(`¡Lo sentimos! Solo hay ${availableStock} unidades disponibles en total.`);
                return prev;
            }

            if (existing) {
                return prev.map(item => item.id === selectedProduct.id ? { ...item, quantity: newTotalQty } : item);
            }

            return [...prev, {
                id: selectedProduct.id,
                quantity: modalQuantity,
                name: selectedProduct.name,
                price: Number(selectedProduct.price),
                image: selectedProduct.images?.[0]
            }];
        });

        setSelectedProduct(null);
    };

    // Auto-open product modal from URL ?p=productId
    useEffect(() => {
        if (products.length > 0) {
            const productId = searchParams.get('p');
            if (productId) {
                const product = products.find(p => p.id === productId);
                if (product) {
                    setSelectedProduct(product);
                    setModalQuantity(1);
                    setCurrentImageIndex(0);
                }
            }
        }
    }, [products, searchParams]);

    const addToCart = (product: Product) => {
        setCart(prev => {
            const existing = prev.find(item => item.id === product.id);
            const availableStock = product.inventory?.stock ?? 0;
            const trackStock = product.trackInventory;

            if (existing) {
                if (trackStock && existing.quantity >= availableStock) {
                    showMessage(`¡Lo sentimos! Solo hay ${availableStock} unidades disponibles.`);
                    return prev;
                }
                return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
            }
            return [...prev, {
                id: product.id,
                quantity: 1,
                name: product.name,
                price: Number(product.price),
                image: product.images?.[0]
            }];
        });
    };

    const updateQuantity = (id: string, delta: number) => {
        setCart(prev => prev.map(item => {
            if (item.id === id) {
                const product = products.find(p => p.id === id);
                const availableStock = product?.inventory?.stock ?? 0;
                const trackStock = product?.trackInventory;
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
            const orderData = {
                storeId: store.id,
                customerName,
                items: cart.map(item => ({
                    productId: item.id,
                    quantity: item.quantity
                }))
            };

            const response = await api.createOrder(orderData);

            if (response.whatsappLink) {
                window.location.href = response.whatsappLink;
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
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                addToCart(product);
                                            }}
                                            className="w-9 h-9 bg-[var(--primary)] text-[var(--primary-foreground)] rounded-xl flex items-center justify-center hover:scale-105 transition-all shadow-lg active:scale-90 flex-shrink-0 relative"
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
                                    <div key={item.id} className="flex gap-4">
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
                                            <p className="text-[var(--primary)] font-black text-xs">{formatCurrency(item.price)}</p>
                                            <div className="flex items-center gap-3 mt-2">
                                                <button
                                                    onClick={() => updateQuantity(item.id, -1)}
                                                    className="p-1 border border-[var(--border)] rounded-lg hover:bg-[var(--secondary)] text-[var(--text)]/50 active:scale-90 transition-all"
                                                >
                                                    <Minus className="w-4 h-4" />
                                                </button>
                                                <span className="font-black text-xs w-4 text-center">{item.quantity}</span>
                                                <button
                                                    onClick={() => updateQuantity(item.id, 1)}
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
            )}

            {/* Stock Alert Modal */}
            {stockAlert.show && (
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
            )}

            {/* Product Detail Modal */}
            {selectedProduct && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="bg-[var(--bg)] w-full max-w-4xl rounded-[2.5rem] sm:rounded-[3.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col md:flex-row max-h-[90vh] border border-[var(--border)]">
                        {/* Header for Mobile: Close */}
                        <div className="md:hidden absolute top-4 right-4 z-50">
                            <button
                                onClick={() => setSelectedProduct(null)}
                                className="w-10 h-10 bg-[var(--bg)]/80 backdrop-blur-xl rounded-full flex items-center justify-center shadow-xl text-[var(--text)] border border-[var(--border)] active:scale-90 transition-all"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Left Side: Images Gallery */}
                        <div className="w-full md:w-[55%] bg-[var(--secondary)] flex items-center justify-center relative aspect-[4/5] md:aspect-auto overflow-hidden">
                            {selectedProduct.images && selectedProduct.images.length > 0 ? (
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
                                                setCurrentImageIndex(prev => (prev === (selectedProduct.images?.length || 0) - 1 ? 0 : prev + 1));
                                            } else {
                                                setCurrentImageIndex(prev => (prev === 0 ? (selectedProduct.images?.length || 0) - 1 : prev - 1));
                                            }
                                        }
                                        touchStartX.current = null;
                                    }}
                                >
                                    <Image
                                        src={selectedProduct.images?.[currentImageIndex] || ''}
                                        alt={selectedProduct.name}
                                        fill
                                        className="object-contain md:object-cover"
                                        priority
                                        sizes="(max-width: 768px) 100vw, 55vw"
                                    />

                                    {selectedProduct.images && selectedProduct.images.length > 1 && (
                                        <>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); setCurrentImageIndex(prev => (prev === 0 ? (selectedProduct.images?.length || 0) - 1 : prev - 1)) }}
                                                className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-[var(--bg)]/40 hover:bg-[var(--bg)]/90 backdrop-blur-sm rounded-full flex items-center justify-center text-[var(--text)] transition-all active:scale-90 border border-[var(--border)] opacity-0 md:opacity-100 group-hover:opacity-100 z-10"
                                            >
                                                <ChevronLeft className="w-5 h-5" />
                                            </button>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); setCurrentImageIndex(prev => (prev === (selectedProduct.images?.length || 0) - 1 ? 0 : prev + 1)) }}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-[var(--bg)]/40 hover:bg-[var(--bg)]/90 backdrop-blur-sm rounded-full flex items-center justify-center text-[var(--text)] transition-all active:scale-90 border border-[var(--border)] opacity-0 md:opacity-100 group-hover:opacity-100 z-10"
                                            >
                                                <ChevronRight className="w-5 h-5" />
                                            </button>
                                            <div className="absolute top-4 left-4 bg-black/20 backdrop-blur-md text-white px-3 py-1 rounded-full text-[9px] font-black tracking-widest uppercase border border-white/10 z-10">
                                                {currentImageIndex + 1} / {selectedProduct.images?.length}
                                            </div>
                                        </>
                                    )}

                                    {selectedProduct.images && selectedProduct.images.length > 1 && (
                                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1 z-10">
                                            {selectedProduct.images.map((_: string, idx: number) => (
                                                <button
                                                    key={idx}
                                                    onClick={() => setCurrentImageIndex(idx)}
                                                    className={`h-1 rounded-full transition-all duration-300 ${idx === currentImageIndex ? 'bg-[var(--primary)] w-6' : 'bg-[var(--secondary)] w-1'}`}
                                                />
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="h-full flex items-center justify-center text-gray-200">
                                    <ShoppingBag className="w-20 h-20" />
                                </div>
                            )}
                        </div>

                        {/* Right Side: Details */}
                        <div className="w-full md:w-1/2 p-8 sm:p-12 flex flex-col h-full overflow-y-auto custom-scrollbar bg-[var(--bg)]">
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
                                    onClick={() => setSelectedProduct(null)}
                                    className="hidden md:flex w-12 h-12 bg-[var(--secondary)] hover:bg-[var(--bg)] border border-[var(--border)] rounded-2xl items-center justify-center text-[var(--text)]/40 hover:text-[var(--text)] transition-all active:scale-95"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            <div className="flex-1 space-y-6">
                                <div className="space-y-2">
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
                                        <h2 className="text-3xl sm:text-5xl font-black text-[var(--text)] leading-tight tracking-tight">
                                            {selectedProduct.name}
                                        </h2>
                                        <div className="flex items-center gap-4">
                                            {selectedProduct.discountPrice ? (
                                                <>
                                                    <span className="text-4xl font-black text-green-600">
                                                        {formatCurrency(selectedProduct.discountPrice)}
                                                    </span>
                                                    <span className="text-xl font-bold text-gray-400 line-through decoration-red-500/50">
                                                        {formatCurrency(selectedProduct.price)}
                                                    </span>
                                                </>
                                            ) : (
                                                <p className="text-4xl font-black text-[var(--primary)]">
                                                    {formatCurrency(selectedProduct.price)}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex items-center gap-2">
                                        <div className="w-1 h-4 bg-[var(--primary)] rounded-full"></div>
                                        <h3 className="text-xs font-black uppercase tracking-widest text-[var(--text)]">Descripción</h3>
                                    </div>
                                    <p className="text-[var(--text)]/60 font-medium leading-relaxed text-base sm:text-lg italic text-[var(--text)]">
                                        {selectedProduct.description || 'Este producto no tiene una descripción detallada.'}
                                    </p>
                                </div>

                                {selectedProduct.trackInventory && (
                                    <div className="flex items-center justify-between p-6 bg-[var(--secondary)] rounded-[2.5rem] border border-[var(--border)]">
                                        <div className="space-y-1">
                                            <p className="text-[10px] font-black text-[var(--text)]/40 uppercase tracking-widest">Disponibilidad</p>
                                            <div className="flex items-center gap-2">
                                                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                                                <p className="font-black text-[var(--text)]">
                                                    {selectedProduct.inventory?.stock ?? '0'} unidades
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-5 bg-[var(--surface)] p-2 rounded-2xl shadow-sm border border-[var(--border)]">
                                            <button
                                                onClick={() => setModalQuantity(Math.max(1, modalQuantity - 1))}
                                                className="w-10 h-10 md:w-12 md:h-10 flex items-center justify-center rounded-xl bg-[var(--secondary)] hover:bg-[var(--border)] text-[var(--text)] transition-all active:scale-90 border border-[var(--border)]/50"
                                            >
                                                <Minus className="w-4 h-4 md:w-5 md:h-5" />
                                            </button>
                                            <span className="w-6 md:w-8 text-center font-black text-xl md:text-2xl text-[var(--surface-text)]">{modalQuantity}</span>
                                            <button
                                                onClick={() => {
                                                    const available = selectedProduct.inventory?.stock ?? 0;
                                                    if (modalQuantity < available) {
                                                        setModalQuantity(modalQuantity + 1);
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
                                )}

                                {!selectedProduct.trackInventory && (
                                    <div className="flex items-center justify-between p-6 bg-[var(--secondary)] rounded-[2.5rem] border border-[var(--border)]">
                                        <div className="space-y-1">
                                            <p className="text-[10px] font-black text-[var(--text)]/40 uppercase tracking-widest">Status</p>
                                            <div className="flex items-center gap-2">
                                                <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
                                                <p className="font-black text-[var(--text)]">Disponible por pedido</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-5 bg-[var(--surface)] p-2 rounded-2xl shadow-sm border border-[var(--border)]">
                                            <button
                                                onClick={() => setModalQuantity(Math.max(1, modalQuantity - 1))}
                                                className="w-10 h-10 md:w-12 md:h-10 flex items-center justify-center rounded-xl bg-[var(--secondary)] hover:bg-[var(--border)] text-[var(--text)] transition-all active:scale-90 border border-[var(--border)]/50"
                                            >
                                                <Minus className="w-4 h-4 md:w-5 md:h-5" />
                                            </button>
                                            <span className="w-6 md:w-8 text-center font-black text-xl md:text-2xl text-[var(--surface-text)]">{modalQuantity}</span>
                                            <button
                                                onClick={() => setModalQuantity(modalQuantity + 1)}
                                                className="w-10 h-10 md:w-12 md:h-10 flex items-center justify-center rounded-xl bg-[var(--secondary)] hover:bg-[var(--border)] text-[var(--text)] transition-all active:scale-90 border border-[var(--border)]/50"
                                            >
                                                <Plus className="w-4 h-4 md:w-5 md:h-5" />
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="pt-6 mt-auto">
                                <button
                                    onClick={handleAddToCartFromModal}
                                    className="w-full bg-[var(--primary)] text-[var(--primary-foreground)] py-4 md:py-5 rounded-2xl md:rounded-[2rem] font-black text-lg md:text-xl flex items-center justify-center gap-3 hover:scale-[1.02] transition-all shadow-xl active:scale-[0.98]"
                                >
                                    <ShoppingCart className="w-5 h-5 md:w-6 md:h-6" />
                                    Añadir • {formatCurrency((Number(selectedProduct.discountPrice || selectedProduct.price)) * modalQuantity)}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
