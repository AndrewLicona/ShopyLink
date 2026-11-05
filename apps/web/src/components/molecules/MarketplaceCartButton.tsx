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
                className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 text-gray-600 transition-all hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600 active:scale-95"
                aria-label="Abrir carrito"
            >
                <ShoppingBag className="h-[18px] w-[18px]" />
                {hydrated && count > 0 && (
                    <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-blue-600 px-1 text-[10px] font-black text-white shadow-md ring-2 ring-white">
                        {count}
                    </span>
                )}
            </button>

            <MarketplaceCartDrawer isOpen={isOpen} onClose={() => setIsOpen(false)} />
        </>
    );
}
