'use client';

import { LoadingState } from '@/components/atoms/LoadingState';

export function DashboardSkeleton() {
    return <div className="min-h-screen bg-[var(--bg)]"><LoadingState message="Preparando tu panel..." className="min-h-screen" /></div>;
}
