import { Package, Plus, Search } from 'lucide-react';

export default function ProductsLoading() {
    return (
        <div className="space-y-8 pb-12 animate-pulse">
            {/* Header Skeleton */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-2">
                    <div className="h-8 w-48 bg-[var(--secondary)] rounded-xl"></div>
                    <div className="h-4 w-64 bg-[var(--secondary)] rounded-lg"></div>
                </div>
                <div className="flex gap-2">
                    <div className="w-28 h-12 bg-[var(--secondary)] rounded-2xl"></div>
                    <div className="w-28 h-12 bg-[var(--secondary)] rounded-2xl"></div>
                </div>
            </div>

            {/* Filters Skeleton */}
            <div className="space-y-6">
                <div className="h-10 w-48 bg-[var(--secondary)] rounded-2xl"></div>
                <div className="h-16 w-full bg-[var(--secondary)] rounded-3xl"></div>
            </div>

            {/* Grid Skeleton */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                    <div key={i} className="bg-[var(--surface)] rounded-[2rem] p-3 border border-[var(--border)] h-[300px] flex flex-col gap-4">
                        <div className="aspect-square bg-[var(--secondary)] rounded-[1.5rem]"></div>
                        <div className="space-y-3 px-1">
                            <div className="h-4 w-3/4 bg-[var(--secondary)] rounded-md"></div>
                            <div className="h-5 w-1/2 bg-[var(--secondary)] rounded-md"></div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
