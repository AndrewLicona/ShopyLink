import { LoadingState } from '@/components/atoms/LoadingState';

export default function ProductsLoading() {
    return <LoadingState message="Cargando catálogo..." fullPage />;
}
