import { LoadingState } from '@/components/atoms/LoadingState';

export default function OrdersLoading() {
    return <LoadingState message="Cargando pedidos..." fullPage />;
}
