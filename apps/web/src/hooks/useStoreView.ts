'use client';

import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { api } from '@/services/api';
import { useCart } from '@/contexts/CartContext';
import type { Store, Product } from '@/types/types';

/**
 * State for a public store page.
 *
 * The cart itself lives in the global `CartContext` (persisted in localStorage
 * and shared with the Marketplace). This hook only exposes the slice of that
 * cart that belongs to the current store.
 */
export function useStoreView(store: Store, initialProducts: Product[]) {
    const {
        items: cartItems,
        addItem,
        setQuantity,
        clearStore,
    } = useCart();

    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [itemTypeFilter, setItemTypeFilter] = useState<'all' | 'product' | 'service'>('all');
    const [searchTerm, setSearchTerm] = useState('');

    const searchParams = useSearchParams();

    // Sync URL when product is selected
    useEffect(() => {
        const currentParams = new URLSearchParams(window.location.search);
        if (selectedProduct) {
            currentParams.set('p', selectedProduct.id);
        } else {
            currentParams.delete('p');
        }
        const newSearch = currentParams.toString();
        const newUrl = `${window.location.pathname}${newSearch ? `?${newSearch}` : ''}`;
        window.history.replaceState(null, '', newUrl);
    }, [selectedProduct]);

    const [isCreatingOrder, setIsCreatingOrder] = useState(false);
    const [showNameModal, setShowNameModal] = useState(false);
    const [customerName, setCustomerName] = useState('');
    const [customerAddress, setCustomerAddress] = useState('');
    const [deliveryMethod, setDeliveryMethod] = useState<'delivery' | 'pickup'>('delivery');
    const [stockAlert, setStockAlert] = useState<{ show: boolean, message: string }>({ show: false, message: '' });

    // Only the items of the store currently being viewed.
    const cart = useMemo(
        () => cartItems.filter((item) => item.storeId === store.id),
        [cartItems, store.id],
    );

    const showMessage = (msg: string) => {
        setStockAlert({ show: true, message: msg });
        setTimeout(() => setStockAlert({ show: false, message: '' }), 3000);
    };

    const handleAddToCart = (product: Product, quantity: number, variantId?: string | null) => {
        // `null` and `undefined` both mean "no variant". Normalising here keeps the
        // cart free of duplicate lines for the same product.
        const normalizedVariantId = variantId ?? undefined;

        let finalPrice = Number(product.discountPrice || product.price);
        let finalStock = product.inventory?.stock ?? 0;
        let variantName: string | undefined = undefined;

        const variant = product.variants?.find((v) => v.id === normalizedVariantId);

        if (variant) {
            finalPrice = variant.useParentPrice
                ? Number(product.discountPrice || product.price)
                : Number(variant.price);

            finalStock = variant.useParentStock
                ? (product.inventory?.stock ?? 0)
                : variant.stock;

            variantName = variant.name;
        }

        const trackStock = product.trackInventory !== false && variant?.trackInventory !== false;

        const existing = cart.find(
            (item) => item.id === product.id && item.variantId === normalizedVariantId,
        );
        const currentQty = existing ? existing.quantity : 0;
        const newTotalQty = currentQty + quantity;

        if (trackStock && newTotalQty > finalStock) {
            showMessage(`¡Lo sentimos! Solo hay ${finalStock} unidades disponibles.`);
            return;
        }

        const itemImage = (variant?.images && variant.images.length > 0)
            ? variant.images[0]
            : (product.images?.[0]);

        addItem({
            id: product.id,
            name: product.name,
            price: finalPrice,
            image: itemImage,
            variantId: normalizedVariantId,
            variantName,
            storeId: store.id,
            storeName: store.name,
            storeSlug: store.slug,
            storeLogoUrl: store.logoUrl || undefined,
            itemType: product.itemType,
            quantity,
        });
    };

    const addToCart = (product: Product) => {
        const principalItem = cart.find(item => item.id === product.id && !item.variantId);
        if (principalItem) {
            updateQuantity(product.id, 1, undefined);
            return;
        }

        handleAddToCart(product, 1, null);
    };

    const updateQuantity = (id: string, delta: number, variantId?: string) => {
        const normalizedVariantId = variantId ?? undefined;
        const item = cart.find(
            (i) => i.id === id && i.variantId === normalizedVariantId,
        );
        if (!item) return;

        const product = initialProducts.find((p) => p.id === id);
        let availableStock = product?.inventory?.stock ?? 0;
        const v = product?.variants?.find((v) => v.id === normalizedVariantId);
        const trackStock = product?.trackInventory !== false && v?.trackInventory !== false;

        if (product?.variants && normalizedVariantId) {
            const vv = product.variants.find((v) => v.id === normalizedVariantId);
            if (vv) {
                availableStock = vv.useParentStock
                    ? (product.inventory?.stock ?? 0)
                    : vv.stock;
            }
        }

        const newQty = Math.max(0, item.quantity + delta);

        if (product && trackStock && newQty > availableStock) {
            showMessage(`Solo hay ${availableStock} disponibles.`);
            return;
        }

        setQuantity(id, normalizedVariantId, newQty);
    };

    const hasProducts = useMemo(() => initialProducts.some(p => !p.itemType || p.itemType === 'product'), [initialProducts]);
    const hasServices = useMemo(() => initialProducts.some(p => p.itemType === 'service'), [initialProducts]);
    const showTypeTabs = hasProducts && hasServices;

    const filteredProducts = useMemo(() => {
        return initialProducts.filter(p => {
            const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesCategory = categoryFilter === 'all' || p.categoryId === categoryFilter;
            const matchesType = itemTypeFilter === 'all' || (p.itemType || 'product') === itemTypeFilter;
            return matchesSearch && matchesCategory && matchesType;
        });
    }, [initialProducts, searchTerm, categoryFilter, itemTypeFilter]);

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

        // Detect mobile before the async call to decide if we need to pre-open a window
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        const pcWindow = !isMobile ? window.open('about:blank', '_blank') : null;

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
                }))
            };

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const response = await api.createOrder(orderData as any);

            if (response.whatsappLink) {
                if (isMobile) {
                    window.location.href = response.whatsappLink;
                } else if (pcWindow) {
                    pcWindow.location.href = response.whatsappLink;
                    pcWindow.focus();
                } else {
                    // Fallback if pcWindow was somehow blocked or null
                    window.open(response.whatsappLink, '_blank');
                }

                clearStore(store.id);
                setIsCartOpen(false);
            }
        } catch (err: unknown) {
            console.error('Error creating order:', err);
            if (pcWindow) pcWindow.close(); // Close the blank window on error

            let message = 'Hubo un error al procesar tu pedido. Por favor intenta de nuevo.';

            if (err instanceof Error) {
                if (err.message.includes('Insufficient stock')) {
                    const productName = err.message.split(': ')[1] || 'un producto';
                    message = `¡Lo sentimos! No hay suficiente stock disponible para: ${productName}. Por favor, reduce la cantidad e intenta de nuevo.`;
                } else {
                    message = err.message;
                }
            }

            showMessage(message);
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
            itemTypeFilter,
            hasProducts,
            hasServices,
            showTypeTabs,
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
            setSelectedProduct,
            setIsCartOpen,
            setCategoryFilter,
            setItemTypeFilter,
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
