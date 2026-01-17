

export default function Loading() {
    return (
        <div className="min-h-screen bg-[var(--bg)] text-[var(--text)] flex flex-col pb-20 animate-pulse">
            {/* Store Header Skeleton */}
            <header className="bg-[var(--bg)] border-b border-[var(--border)] sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-20">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-[var(--secondary)] rounded-xl"></div>
                            <div className="space-y-2">
                                <div className="h-4 w-32 bg-[var(--secondary)] rounded-md"></div>
                                <div className="h-2 w-20 bg-[var(--secondary)] rounded-md"></div>
                            </div>
                        </div>
                        <div className="w-11 h-11 bg-[var(--secondary)] rounded-2xl"></div>
                    </div>
                </div>
            </header>

            {/* Catalog Skeleton */}
            <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
                {/* Search Bar Skeleton */}
                <div className="mb-6 relative">
                    <div className="w-full h-14 bg-[var(--secondary)] rounded-3xl"></div>
                </div>

                {/* Categories Bar Skeleton */}
                <div className="flex gap-2 overflow-x-auto pb-8 -mx-4 px-4">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="h-10 w-24 bg-[var(--secondary)] rounded-2xl flex-shrink-0"></div>
                    ))}
                </div>

                {/* Product Grid Skeleton */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                        <div key={i} className="bg-[var(--bg)] rounded-[2.5rem] p-3 border border-[var(--border)] flex flex-col gap-4">
                            <div className="aspect-square bg-[var(--secondary)] rounded-[2rem]"></div>
                            <div className="space-y-4 px-1 pb-2">
                                <div className="h-4 w-3/4 bg-[var(--secondary)] rounded-md"></div>
                                <div className="flex justify-between items-center gap-2">
                                    <div className="h-6 w-1/2 bg-[var(--secondary)] rounded-md"></div>
                                    <div className="w-9 h-9 bg-[var(--secondary)] rounded-xl"></div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </main>
        </div>
    );
}
