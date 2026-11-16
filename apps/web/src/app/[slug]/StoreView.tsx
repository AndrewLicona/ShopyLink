'use client';

import { ShoppingBag } from 'lucide-react';
import { StoreFooter } from '@/features/store/StoreFooter';
import { ProductModal } from '@/features/product/ProductModal';
import { useStoreView } from '@/hooks/useStoreView';
import type { Store, Product, Category, StoreBanner } from '@/types/types';
import { useMemo } from 'react';

// Modular Components
import { StoreHeader } from '@/features/store/public/StoreHeader';
import { CategoryBar } from '@/features/store/public/CategoryBar';
import { PublicProductGrid } from '@/features/store/public/PublicProductGrid';
import { CartDrawer } from '@/features/store/public/CartDrawer';
import { OrderModals } from '@/features/store/public/OrderModals';
import { DiscountsSection } from '@/features/store/public/DiscountsSection';
import { AdBanner } from '@/components/molecules/AdBanner';
import { PublicBanners } from '@/features/store/public/PublicBanners';

interface StoreViewProps {
    store: Store;
    products: Product[];
    categories: Category[];
    banners: StoreBanner[];
}

export function StoreView({ store, products: rawProducts, categories, banners = [] }: StoreViewProps) {
    const products = useMemo(() => {
        return rawProducts.map(product => {
            let discountPrice = product.discountPrice;
            if (store.globalDiscountActive && store.globalDiscountPercentage && store.globalDiscountPercentage > 0 && product.price) {
                const globalDiscounted = Number(product.price) * (1 - store.globalDiscountPercentage / 100);
                if (!discountPrice || globalDiscounted < Number(discountPrice)) {
                    discountPrice = globalDiscounted;
                }
            }
            return {
                ...product,
                discountPrice: discountPrice ? Number(discountPrice) : null
            };
        });
    }, [rawProducts, store.globalDiscountActive, store.globalDiscountPercentage]);

    const { state, actions } = useStoreView(store, products);

    return (
        <div className="min-h-screen bg-[var(--bg)] text-[var(--text)] flex flex-col pb-20">
            <PublicBanners banners={banners} position="TOP_BAR" />
            
            <StoreHeader
                store={store}
                cartCount={state.cartCount}
                onOpenCart={() => actions.setIsCartOpen(true)}
            />

            <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-5 sm:py-8 space-y-6 sm:space-y-8">
                <PublicBanners banners={banners} position="HERO" />
                
                {/* Pestañas para alternar Productos vs Servicios si el comercio ofrece ambos */}
                {state.showTypeTabs && (
                    <div className="flex items-center gap-2 border-b border-[var(--border)] pb-2 overflow-x-auto">
                        <button
                            onClick={() => actions.setItemTypeFilter('all')}
                            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap ${
                                state.itemTypeFilter === 'all'
                                    ? 'bg-[var(--primary)] text-[var(--bg)] shadow-md shadow-[var(--primary)]/20'
                                    : 'text-[var(--text)]/60 hover:text-[var(--text)] hover:bg-[var(--secondary)]'
                            }`}
                        >
                            Todo
                        </button>
                        <button
                            onClick={() => actions.setItemTypeFilter('product')}
                            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap ${
                                state.itemTypeFilter === 'product'
                                    ? 'bg-[var(--primary)] text-[var(--bg)] shadow-md shadow-[var(--primary)]/20'
                                    : 'text-[var(--text)]/60 hover:text-[var(--text)] hover:bg-[var(--secondary)]'
                            }`}
                        >
                            Productos
                        </button>
                        <button
                            onClick={() => actions.setItemTypeFilter('service')}
                            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap ${
                                state.itemTypeFilter === 'service'
                                    ? 'bg-[var(--primary)] text-[var(--bg)] shadow-md shadow-[var(--primary)]/20'
                                    : 'text-[var(--text)]/60 hover:text-[var(--text)] hover:bg-[var(--secondary)]'
                            }`}
                        >
                            Servicios
                        </button>
                    </div>
                )}

                <CategoryBar
                    categories={categories}
                    activeCategory={state.categoryFilter}
                    onSelectCategory={actions.setCategoryFilter}
                    searchTerm={state.searchTerm}
                    onSearchChange={actions.setSearchTerm}
                />

                <DiscountsSection
                    products={state.filteredProducts}
                    categories={categories}
                    onProductClick={actions.setSelectedProduct}
                    categoryFilter={state.categoryFilter}
                    searchTerm={state.searchTerm}
                    country={store.country}
                    onViewAllDiscounts={() => {
                        actions.setCategoryFilter('all');
                        actions.setSearchTerm('');
                    }}
                />

                <div className="flex flex-wrap items-end justify-between gap-2 border-b border-[var(--border)] pb-3">
                    <div><p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--primary)]">Explora nuestra tienda</p><h2 className="mt-1 text-xl font-black tracking-tight text-[var(--text)] sm:text-2xl">{state.itemTypeFilter === 'service' ? 'Servicios' : state.itemTypeFilter === 'product' ? 'Productos' : 'Nuestro catálogo'}</h2></div>
                    <span aria-live="polite" className="text-xs font-semibold text-[var(--text)]/55">{state.filteredProducts.length} {state.filteredProducts.length === 1 ? 'resultado' : 'resultados'}</span>
                </div>

                <PublicProductGrid
                    products={state.filteredProducts}
                    categories={categories}
                    cart={state.cart}
                    onProductClick={actions.setSelectedProduct}
                    onAddToCart={actions.addToCart}
                    searchTerm={state.searchTerm}
                    bannerNode={<PublicBanners banners={banners} position="BETWEEN_PRODUCTS" />}
                    whatsappNumber={store.whatsappNumber}
                    storeName={store.name}
                    country={store.country}
                    onClearFilters={() => { actions.setSearchTerm(''); actions.setCategoryFilter('all'); actions.setItemTypeFilter('all'); }}
                    hasActiveFilters={Boolean(state.searchTerm.trim()) || state.categoryFilter !== 'all' || state.itemTypeFilter !== 'all'}
                />

                <AdBanner planType={store.planType} />
            </main>

            <StoreFooter store={store} />

            <CartDrawer
                isOpen={state.isCartOpen}
                onClose={() => actions.setIsCartOpen(false)}
                cart={state.cart}
                cartTotal={state.cartTotal}
                isCreatingOrder={state.isCreatingOrder}
                storeId={store.id}
                onUpdateQuantity={actions.updateQuantity}
                onCheckout={actions.handleWhatsAppCheckout}
                country={store.country}
            />

            {/* Floating Cart Button */}
            {state.cart.length > 0 && !state.isCartOpen && (
                <button
                    onClick={() => actions.setIsCartOpen(true)}
                    className="fixed bottom-[max(1rem,env(safe-area-inset-bottom))] right-4 bg-[var(--primary)] text-[var(--bg)] px-4 py-3 rounded-full font-black text-xs sm:text-sm flex items-center gap-2 shadow-xl shadow-[var(--primary)]/30 animate-in slide-in-from-bottom-5 duration-300 active:scale-95 z-60 hover:scale-105 transition-all"
                >
                    <ShoppingBag className="w-4 h-4" />
                    <span className="whitespace-nowrap">Ver pedido · {state.cartCount}</span>
                </button>
            )}

            <OrderModals
                store={store}
                showNameModal={state.showNameModal}
                setShowNameModal={actions.setShowNameModal}
                customerName={state.customerName}
                setCustomerName={actions.setCustomerName}
                customerAddress={state.customerAddress}
                setCustomerAddress={actions.setCustomerAddress}
                deliveryMethod={state.deliveryMethod}
                setDeliveryMethod={actions.setDeliveryMethod}
                isCreatingOrder={state.isCreatingOrder}
                onConfirmOrder={actions.handleConfirmOrder}
                stockAlert={state.stockAlert}
                onCloseStockAlert={() => actions.setStockAlert({ show: false, message: '' })}
            />

            <ProductModal
                product={state.selectedProduct}
                isOpen={!!state.selectedProduct}
                onClose={() => actions.setSelectedProduct(null)}
                onAddToCart={actions.handleAddToCart}
                categories={categories}
                store={store}
                cartItems={state.cart}
            />
        </div>
    );
}
