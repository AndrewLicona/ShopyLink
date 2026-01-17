'use client';

import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { api } from '@/services/api';
import type { Store, Product } from '@/types/types';

interface CartItem {
    id: string;
    quantity: number;
    name: string;
    price: number;
    image?: string;
    variantId?: string;
    variantName?: string;
}

export function useStoreView(store: Store, initialProducts: Product[]) {
    const [cart, setCart] = useState<CartItem[]>([]);
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

        const variant = product.variants?.find(v => v.id === variantId);
        const trackStock = product.trackInventory !== false && variant?.trackInventory !== false;

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

    const addToCart = (product: Product) => {
        const baseItem = cart.find(item => item.id === product.id && !item.variantId);
        if (baseItem) {
            updateQuantity(product.id, 1, undefined);
            return;
        }

        const existingItem = cart.find(item => item.id === product.id);
        if (existingItem) {
            updateQuantity(product.id, 1, existingItem.variantId);
            return;
        }

        const firstVariantId = product.variants?.[0]?.id;
        handleAddToCart(product, 1, firstVariantId || null);
    };

    const updateQuantity = (id: string, delta: number, variantId?: string) => {
        setCart(prev => prev.map(item => {
            if (item.id === id && item.variantId === variantId) {
                const product = initialProducts.find(p => p.id === id);
                let availableStock = product?.inventory?.stock ?? 0;
                const v = product?.variants?.find(v => v.id === variantId);
                const trackStock = product?.trackInventory !== false && v?.trackInventory !== false;

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

    const filteredProducts = useMemo(() => {
        return initialProducts.filter(p => {
            const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesCategory = categoryFilter === 'all' || p.categoryId === categoryFilter;
            return matchesSearch && matchesCategory;
        });
    }, [initialProducts, searchTerm, categoryFilter]);

    const cartTotal = useMemo(() => {
        return cart.reduce((total, item) => total + item.price * item.quantity, 0);
    }, [cart]);

    const cartCount = useMemo(() => {
        return cart.reduce((a, b) => a + b.quantity, 0);
    }, [cart]);

    // Order Logic
    const handleConfirmOrder = async () => {
        if (!customerName.trim()) {
            showMessage('Por favor, ingresa tu nombre para continuar.');
            return;
        }

        setShowNameModal(false);
        setIsCreatingOrder(true);
        try {
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
                    variantId: item.variantId,
                    productName: item.name,
                    price: item.price
                }))
            };

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const response = await api.createOrder(orderData as any);

            if (response.whatsappLink) {
                const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
                if (isMobile) {
                    window.location.href = response.whatsappLink;
                } else {
                    window.open(response.whatsappLink, '_blank');
                }

                setCart([]);
                setIsCartOpen(false);
            }
        } catch (err: unknown) {
            console.error('Error creating order:', err);
            if (err instanceof Error && err.message?.includes('Insufficient stock')) {
                const productName = err.message.split(': ')[1] || 'un producto';
                showMessage(`¡Lo sentimos! No hay suficiente stock disponible para: ${productName}. Por favor, reduce la cantidad e intenta de nuevo.`);
            } else {
                showMessage('Hubo un error al procesar tu pedido. Por favor intenta de nuevo.');
            }
        } finally {
            setIsCreatingOrder(false);
        }
    };

    const handleWhatsAppCheckout = () => {
        if (!store?.id || cart.length === 0) return;
        setShowNameModal(true);
    };

    // Auto-open product modal from URL ?p=productId
    useEffect(() => {
        if (initialProducts.length > 0) {
            const productId = searchParams.get('p');
            if (productId) {
                const product = initialProducts.find(p => p.id === productId);
                if (product) {
                    setSelectedProduct(product);
                }
            }
        }
    }, [initialProducts, searchParams]);

    return {
        state: {
            cart,
            selectedProduct,
            isCartOpen,
            categoryFilter,
            searchTerm,
            isCreatingOrder,
            showNameModal,
            customerName,
            customerAddress,
            deliveryMethod,
            stockAlert,
            filteredProducts,
            cartTotal,
            cartCount
        },
        actions: {
            setCart,
            setSelectedProduct,
            setIsCartOpen,
            setCategoryFilter,
            setSearchTerm,
            setCustomerName,
            setCustomerAddress,
            setDeliveryMethod,
            setStockAlert,
            setShowNameModal,
            handleAddToCart,
            addToCart,
            updateQuantity,
            handleConfirmOrder,
            handleWhatsAppCheckout,
            showMessage
        }
    };
}
