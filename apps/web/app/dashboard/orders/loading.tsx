import { ShoppingCart } from 'lucide-react';

export default function OrdersLoading() {
    return (
        <div className="space-y-8 pb-12 animate-pulse">
            {/* Header Skeleton */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-2">
                    <div className="h-8 w-48 bg-[var(--secondary)] rounded-xl"></div>
                    <div className="h-4 w-64 bg-[var(--secondary)] rounded-lg"></div>
                </div>
            </div>

            {/* Table Skeleton */}
            <div className="bg-[var(--surface)] rounded-[2.5rem] border border-[var(--border)] overflow-hidden">
                <div className="hidden md:block">
                    <div className="h-12 w-full bg-[var(--bg)] border-b border-[var(--border)]"></div>
                    {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="flex items-center justify-between px-8 py-6 border-b border-[var(--border)] last:border-0">
                            <div className="flex items-center gap-12">
                                <div className="h-4 w-16 bg-[var(--secondary)] rounded-md"></div>
                                <div className="space-y-2">
                                    <div className="h-4 w-24 bg-[var(--secondary)] rounded-md"></div>
                                    <div className="h-3 w-16 bg-[var(--secondary)] rounded-md"></div>
                                </div>
                                <div className="space-y-2">
                                    <div className="h-4 w-32 bg-[var(--secondary)] rounded-md"></div>
                                    <div className="h-3 w-20 bg-[var(--secondary)] rounded-md"></div>
                                </div>
                            </div>
                            <div className="flex items-center gap-8">
                                <div className="h-6 w-20 bg-[var(--secondary)] rounded-xl"></div>
                                <div className="h-6 w-24 bg-[var(--secondary)] rounded-xl"></div>
                                <div className="h-8 w-8 bg-[var(--secondary)] rounded-lg"></div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Mobile Skeleton */}
                <div className="md:hidden p-4 space-y-4">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="bg-[var(--surface)] border border-[var(--border)] rounded-3xl p-6 h-36"></div>
                    ))}
                </div>
            </div>
        </div>
    );
}
