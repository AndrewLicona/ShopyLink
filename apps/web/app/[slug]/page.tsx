'use client';

import {
    ShoppingBag,
    MessageCircle,
    ShoppingCart,
    Plus,
    Minus,
    Search,
    ChevronRight,
    Loader2,
    Clock,
    X,
    Filter,
    AlertCircle
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { formatCurrency } from '@/lib/utils';

export default function StorePage({ params }: { params: any }) {
    const [store, setStore] = useState<any>(null);
    const [products, setProducts] = useState<any[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [cart, setCart] = useState<{ id: string, quantity: number, name: string, price: number, image?: string }[]>([]);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const loadStoreData = async () => {
            try {
                const resolvedParams = await params;
                const slug = resolvedParams.slug;

                // Fetch store by slug (public endpoint)
                const storeData = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/stores/${slug}`).then(res => res.json());
                setStore(storeData);

                // Fetch products and categories
                if (storeData.id) {
                    const [productsData, categoriesData] = await Promise.all([
                        api.getProducts(storeData.id),
                        api.getCategories(storeData.id)
                    ]);
                    setProducts(productsData.filter((p: any) => p.isActive));
                    setCategories(categoriesData);
                }
            } catch (err) {
                console.error('Error loading store:', err);
            } finally {
                setLoading(false);
            }
        };
        loadStoreData();
    }, [params]);

    const addToCart = (product: any) => {
        setCart(prev => {
            const existing = prev.find(item => item.id === product.id);
            const availableStock = product.inventory?.stock ?? 0;
            if (existing) {
                if (availableStock !== null && existing.quantity >= availableStock) {
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
                const newQty = Math.max(0, item.quantity + delta);
                if (product && availableStock !== null && newQty > availableStock) {
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
        // Visibility logic: Active AND has stock (if stock is managed)
        const hasStock = p.inventory?.stock === null || p.inventory?.stock === undefined || p.inventory.stock > 0;
        return matchesSearch && matchesCategory && hasStock;
    });

    const cartTotal = cart.reduce((total, item) => {
        return total + item.price * item.quantity;
    }, 0);

    const [isCreatingOrder, setIsCreatingOrder] = useState(false);
    const [showNameModal, setShowNameModal] = useState(false);
    const [customerName, setCustomerName] = useState('');
    const [stockAlert, setStockAlert] = useState<{ show: boolean, message: string }>({ show: false, message: '' });

    const showMessage = (msg: string) => {
        setStockAlert({ show: true, message: msg });
    };

    const handleConfirmOrder = async () => {
        if (!customerName.trim()) {
            alert('Por favor, ingresa tu nombre');
            return;
        }

        setShowNameModal(false);
        setIsCreatingOrder(true);
        try {
            const orderData = {
                storeId: store.id,
                customerName,
                customerPhone: 'Pendiente', // This will be obtained via WhatsApp conversation
                items: cart.map(item => ({
                    productId: item.id,
                    quantity: item.quantity
                }))
            };

            const response = await api.createOrder(orderData);

            // The backend returns a pre-formatted whatsappLink
            if (response.whatsappLink) {
                window.open(response.whatsappLink, '_blank');
                setCart([]); // Clear cart after success
                setIsCartOpen(false);
            }
        } catch (err: any) {
            console.error('Error creating order:', err);
            if (err.message?.includes('Insufficient stock')) {
                const productName = err.message.split(': ')[1] || 'un producto';
                alert(`¡Lo sentimos! No hay suficiente stock disponible para: ${productName}. Por favor, reduce la cantidad e intenta de nuevo.`);
            } else {
                alert('Hubo un error al procesar tu pedido. Por favor intenta de nuevo.');
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

    if (loading) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col pb-20">
            {/* Store Header */}
            <header className="bg-white border-b border-gray-100 sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-20">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-transparent rounded-xl overflow-hidden shadow-sm flex items-center justify-center border border-gray-50">
                                {store?.logoUrl ? <img src={store.logoUrl} className="w-full h-full object-contain" /> : '🏪'}
                            </div>
                            <div>
                                <h1 className="text-xl font-black text-gray-900 uppercase tracking-tight leading-tight">
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
                                className="relative p-3 bg-black text-white rounded-2xl hover:scale-105 transition-all active:scale-95"
                            >
                                <ShoppingBag className="w-5 h-5" />
                                {cart.length > 0 && (
                                    <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-[9px] font-black w-5 h-5 flex items-center justify-center rounded-full border-2 border-white">
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
                        className="w-full pl-12 pr-4 py-4 rounded-3xl bg-white border-none shadow-sm focus:ring-2 focus:ring-blue-500/20 outline-none text-gray-900 font-bold"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                {/* Categories Bar */}
                <div className="flex gap-2 overflow-x-auto pb-8 scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
                    <button
                        onClick={() => setCategoryFilter('all')}
                        className={`px-6 py-2.5 rounded-2xl text-xs font-black uppercase tracking-widest whitespace-nowrap transition-all shadow-sm ${categoryFilter === 'all'
                            ? 'bg-blue-600 text-white shadow-blue-100 shadow-lg'
                            : 'bg-white text-gray-400 hover:text-gray-900 hover:bg-gray-50'
                            }`}
                    >
                        Todo
                    </button>
                    {categories.map((cat) => (
                        <button
                            key={cat.id}
                            onClick={() => setCategoryFilter(cat.id)}
                            className={`px-6 py-2.5 rounded-2xl text-xs font-black uppercase tracking-widest whitespace-nowrap transition-all shadow-sm ${categoryFilter === cat.id
                                ? 'bg-blue-600 text-white shadow-blue-100 shadow-lg'
                                : 'bg-white text-gray-400 hover:text-gray-900 hover:bg-gray-50'
                                }`}
                        >
                            {cat.name}
                        </button>
                    ))}
                </div>

                {/* Product Grid - New Compact Layout */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                    {filteredProducts.map((product) => (
                        <div key={product.id} className="bg-white rounded-[2rem] p-3 border border-transparent hover:border-blue-100 hover:shadow-xl transition-all group flex flex-col relative">
                            <div className="aspect-square bg-gray-50 rounded-[1.5rem] flex items-center justify-center relative overflow-hidden">
                                {product.images?.[0] ? (
                                    <img src={product.images[0]} className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-500" />
                                ) : (
                                    <ShoppingBag className="w-8 h-8 text-gray-200" />
                                )}

                                {product.categoryId && (
                                    <div className="absolute top-2 left-2">
                                        <span className="bg-white/90 backdrop-blur-sm text-gray-900 px-2 py-1 rounded-lg text-[8px] font-black uppercase tracking-tighter shadow-sm border border-gray-100">
                                            {categories.find(c => c.id === product.categoryId)?.name}
                                        </span>
                                    </div>
                                )}
                            </div>
                            <div className="mt-4 flex-1 flex flex-col px-1">
                                <h3 className="text-sm font-black text-gray-900 line-clamp-1">{product.name}</h3>
                                <div className="mt-auto pt-3 flex items-center justify-between">
                                    <span className="text-base font-black text-blue-600">{formatCurrency(product.price)}</span>
                                    <button
                                        onClick={() => addToCart(product)}
                                        className="w-9 h-9 bg-black text-white rounded-xl flex items-center justify-center hover:bg-blue-600 transition-all shadow-lg active:scale-90"
                                    >
                                        <Plus className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </main>

            {/* Cart Sidebar (Drawer) */}
            {isCartOpen && (
                <div className="fixed inset-0 z-50 flex justify-end">
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsCartOpen(false)} />
                    <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col">
                        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                            <h2 className="text-2xl font-black text-gray-900">Tu Pedido</h2>
                            <button
                                onClick={() => setIsCartOpen(false)}
                                className="w-10 h-10 flex items-center justify-center bg-gray-50 border border-gray-100 rounded-xl text-gray-400 hover:text-gray-900 hover:bg-white hover:shadow-md transition-all active:scale-90"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 space-y-6">
                            {cart.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-center text-gray-400">
                                    <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                                        <ShoppingBag className="w-10 h-10" />
                                    </div>
                                    <p className="text-sm font-bold">Tu carrito está vacío</p>
                                </div>
                            ) : (
                                cart.map((item) => {
                                    return (
                                        <div key={item.id} className="flex gap-4">
                                            <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center overflow-hidden border border-gray-100">
                                                {item.image ? (
                                                    <img src={item.image} className="w-full h-full object-cover" />
                                                ) : (
                                                    <ShoppingBag className="w-6 h-6 text-gray-200" />
                                                )}
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="font-bold text-gray-900 text-sm line-clamp-1">{item.name}</h4>
                                                <p className="text-blue-600 font-black text-xs">{formatCurrency(item.price)}</p>
                                                <div className="flex items-center gap-3 mt-2">
                                                    <button
                                                        onClick={() => updateQuantity(item.id, -1)}
                                                        className="p-1 border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-500 active:scale-90 transition-all"
                                                    >
                                                        <Minus className="w-4 h-4" />
                                                    </button>
                                                    <span className="font-black text-gray-900 text-xs w-4 text-center">{item.quantity}</span>
                                                    <button
                                                        onClick={() => updateQuantity(item.id, 1)}
                                                        className="p-1 border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-500 active:scale-90 transition-all"
                                                    >
                                                        <Plus className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-black text-gray-900 text-sm">{formatCurrency(item.price * item.quantity)}</p>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>


                        {cart.length > 0 && (
                            <div className="p-6 border-t border-gray-100 space-y-4">
                                <div className="flex justify-between items-center text-xl font-black text-gray-900">
                                    <span>Total:</span>
                                    <span className="text-blue-600">{formatCurrency(cartTotal)}</span>
                                </div>
                                <button
                                    onClick={handleWhatsAppCheckout}
                                    disabled={isCreatingOrder}
                                    className="w-full bg-[#25D366] text-white py-5 rounded-[2rem] font-black text-lg flex items-center justify-center gap-3 hover:scale-[1.02] transition-all shadow-xl shadow-green-100 disabled:opacity-50"
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

            {/* Stylish Name Modal */}
            {showNameModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="bg-white w-full max-w-sm rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 ring-1 ring-black/5">
                        <div className="p-8 space-y-8">
                            <div className="flex flex-col items-center text-center gap-4">
                                <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-[2rem] flex items-center justify-center shadow-inner">
                                    <ShoppingBag className="w-10 h-10" />
                                </div>
                                <div className="space-y-2">
                                    <h2 className="text-2xl font-black text-gray-900 leading-tight">¿Cómo te llamas?</h2>
                                    <p className="text-gray-400 font-bold text-xs uppercase tracking-widest">Para identificar tu pedido</p>
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
                                        onKeyDown={(e) => e.key === 'Enter' && handleConfirmOrder()}
                                        className="w-full px-6 py-5 rounded-[1.5rem] bg-gray-50 border-2 border-transparent focus:border-blue-500/20 focus:bg-white outline-none text-gray-900 font-bold transition-all text-center placeholder:text-gray-300"
                                    />
                                </div>

                                <button
                                    onClick={handleConfirmOrder}
                                    disabled={!customerName.trim() || isCreatingOrder}
                                    className="w-full bg-blue-600 text-white py-5 rounded-[2rem] font-black text-lg flex items-center justify-center gap-3 hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 disabled:opacity-50 disabled:bg-gray-100 disabled:text-gray-400 disabled:shadow-none active:scale-95"
                                >
                                    {isCreatingOrder ? (
                                        <Loader2 className="w-6 h-6 animate-spin" />
                                    ) : (
                                        "Confirmar Pedido"
                                    )}
                                </button>

                                <button
                                    onClick={() => setShowNameModal(false)}
                                    className="w-full text-gray-400 font-bold text-sm py-2 hover:text-gray-600 transition-colors"
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
                    <div className="bg-white w-full max-w-sm rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 ring-1 ring-black/5">
                        <div className="p-8 space-y-6">
                            <div className="flex flex-col items-center text-center gap-4">
                                <div className="w-20 h-20 bg-orange-50 text-orange-600 rounded-[2rem] flex items-center justify-center shadow-inner">
                                    <AlertCircle className="w-10 h-10" />
                                </div>
                                <div className="space-y-2">
                                    <h2 className="text-2xl font-black text-gray-900 leading-tight">¡Lo sentimos!</h2>
                                    <p className="text-gray-500 font-bold text-sm">{stockAlert.message}</p>
                                </div>
                            </div>

                            <button
                                onClick={() => setStockAlert({ show: false, message: '' })}
                                className="w-full bg-gray-900 text-white py-5 rounded-[2rem] font-black text-lg flex items-center justify-center gap-3 hover:bg-black transition-all active:scale-95"
                            >
                                Entendido
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
