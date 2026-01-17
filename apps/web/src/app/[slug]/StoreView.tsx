'use client';

import { ShoppingBag } from 'lucide-react';
import { StoreFooter } from '@/features/store/StoreFooter';
import { ProductModal } from '@/features/product/ProductModal';
import { useStoreView } from '@/hooks/useStoreView';
import type { Store, Product, Category } from '@/types/types';

// Modular Components
import { StoreHeader } from '@/features/store/public/StoreHeader';
import { CategoryBar } from '@/features/store/public/CategoryBar';
import { PublicProductGrid } from '@/features/store/public/PublicProductGrid';
import { CartDrawer } from '@/features/store/public/CartDrawer';
import { OrderModals } from '@/features/store/public/OrderModals';

interface StoreViewProps {
    store: Store;
    products: Product[];
    categories: Category[];
}

export function StoreView({ store, products, categories }: StoreViewProps) {
    const { state, actions } = useStoreView(store, products);

    return (
        <div className="min-h-screen bg-[var(--bg)] text-[var(--text)] flex flex-col pb-20">
            <StoreHeader
                store={store}
                cartCount={state.cartCount}
                onOpenCart={() => actions.setIsCartOpen(true)}
            />

            <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
                <CategoryBar
                    categories={categories}
                    activeCategory={state.categoryFilter}
                    onSelectCategory={actions.setCategoryFilter}
                    searchTerm={state.searchTerm}
                    onSearchChange={actions.setSearchTerm}
                />

                <PublicProductGrid
                    products={state.filteredProducts}
                    categories={categories}
                    cart={state.cart}
                    onProductClick={actions.setSelectedProduct}
                    onAddToCart={actions.addToCart}
                    searchTerm={state.searchTerm}
                />
            </main>

            <StoreFooter store={store} />

            <CartDrawer
                isOpen={state.isCartOpen}
                onClose={() => actions.setIsCartOpen(false)}
                cart={state.cart}
                cartTotal={state.cartTotal}
                isCreatingOrder={state.isCreatingOrder}
                onUpdateQuantity={actions.updateQuantity}
                onCheckout={actions.handleWhatsAppCheckout}
            />

            {/* Floating Cart Button */}
            {state.cart.length > 0 && !state.isCartOpen && (
                <button
                    onClick={() => actions.setIsCartOpen(true)}
                    className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-[var(--primary)] text-[var(--bg)] px-8 py-4 rounded-full font-black text-sm flex items-center gap-3 shadow-2xl shadow-[var(--primary)]/30 animate-in slide-in-from-bottom-5 duration-300 active:scale-95 z-50 hover:scale-105 transition-all"
                >
                    <ShoppingBag className="w-5 h-5" />
                    Ver Pedido ({state.cartCount})
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
