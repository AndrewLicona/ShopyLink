import { LoadingState } from '@/components/atoms/LoadingState';

export default function Loading() {
    return <div className="min-h-screen bg-[var(--bg)]"><LoadingState message="Preparando la tienda..." className="min-h-screen" /></div>;
}
