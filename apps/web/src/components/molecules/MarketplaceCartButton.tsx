'use client';

import { useState } from 'react';
import { ShoppingBag } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { MarketplaceCartDrawer } from '@/features/marketplace/MarketplaceCartDrawer';

/** Cart trigger for the Marketplace header (opens the global multi-store drawer). */
export function MarketplaceCartButton() {
    const [isOpen, setIsOpen] = useState(false);
    const { count, hydrated } = useCart();

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="relative p-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-all active:scale-95"
                aria-label="Abrir carrito"
            >
                <ShoppingBag className="w-5 h-5" />
                {hydrated && count > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 bg-blue-600 text-white text-[10px] font-black min-w-5 h-5 px-1 flex items-center justify-center rounded-full border-2 border-white shadow-md">
                        {count}
                    </span>
                )}
            </button>

            <MarketplaceCartDrawer isOpen={isOpen} onClose={() => setIsOpen(false)} />
        </>
    );
}
