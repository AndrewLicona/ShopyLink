import { Suspense } from 'react';
import ProductDetailClient from './ProductDetailClient';

export const metadata = {
    title: 'Producto | ShopyLink',
    description: 'Detalles del producto en ShopyLink Marketplace',
};

export default function MarketplaceProductPage() {
    return (
        <Suspense fallback={<div className="p-20 text-center"><div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div></div>}>
            <ProductDetailClient />
        </Suspense>
    );
}
