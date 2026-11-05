import { Metadata } from 'next';
import TiendasClient from './TiendasClient';

export const metadata: Metadata = {
    title: 'Tiendas | Marketplace ShopyLink',
    description: 'Directorio de tiendas publicadas en el marketplace de ShopyLink.',
};

export default function TiendasPage() {
    return <TiendasClient />;
}
