import { Metadata } from 'next';
import CheckoutClient from './CheckoutClient';

export const metadata: Metadata = {
    title: 'Finalizar pedido | ShopyLink',
    description: 'Confirma tu pedido en el marketplace de ShopyLink',
};

export default function MarketplaceCheckoutPage() {
    return <CheckoutClient />;
}
