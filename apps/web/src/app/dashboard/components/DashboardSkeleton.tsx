'use client';

import React from 'react';

export function DashboardSkeleton() {
    return (
        <div className="flex min-h-screen bg-[var(--bg)] animate-pulse">
            {/* Sidebar Skeleton */}
            <aside className="hidden md:flex flex-col w-64 p-6 border-r border-[var(--border)] h-screen">
                <div className="h-8 w-32 bg-[var(--secondary)] rounded-xl mb-12" />
                <div className="h-14 w-full bg-[var(--surface)] border border-[var(--border)] rounded-2xl mb-8" />
                <div className="space-y-4">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="h-10 w-full bg-[var(--secondary)] rounded-xl opacity-50" />
                    ))}
                </div>
            </aside>

            {/* Main Content Skeleton */}
            <main className="flex-1 p-4 md:p-8 space-y-8">
                {/* Header Skeleton */}
                <div className="flex justify-between items-center mb-10">
                    <div className="space-y-2">
                        <div className="h-8 w-48 bg-[var(--secondary)] rounded-xl" />
                        <div className="h-4 w-32 bg-[var(--secondary)] rounded-lg opacity-40" />
                    </div>
                    <div className="h-12 w-32 bg-[var(--primary)] rounded-xl opacity-20" />
                </div>

                {/* KPI Cards Skeleton */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="h-32 bg-[var(--surface)] border border-[var(--border)] rounded-2xl" />
                    ))}
                </div>

                {/* Charts Area Skeleton */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 h-[350px] bg-[var(--surface)] border border-[var(--border)] rounded-2xl" />
                    <div className="h-[350px] bg-[var(--surface)] border border-[var(--border)] rounded-2xl" />
                </div>
            </main>
        </div>
    );
}
