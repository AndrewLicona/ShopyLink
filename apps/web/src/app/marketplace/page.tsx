import { Metadata } from 'next';
import MarketplaceClient from './MarketplaceClient';

export const metadata: Metadata = {
    title: 'Marketplace - ShopyLink',
    description: 'Encuentra los mejores productos locales en el marketplace de ShopyLink',
};

export default function MarketplacePage() {
    return (
        <MarketplaceClient />
    );
}
