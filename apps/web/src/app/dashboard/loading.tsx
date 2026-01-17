export default function DashboardLoading() {
    return (
        <div className="space-y-6 md:space-y-10 animate-pulse">
            {/* Header Skeleton */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-2">
                <div className="space-y-2">
                    <div className="h-8 w-64 bg-[var(--secondary)] rounded-xl"></div>
                    <div className="h-4 w-48 bg-[var(--secondary)] rounded-lg"></div>
                </div>
                <div className="w-full md:w-44 h-14 bg-[var(--secondary)] rounded-2xl"></div>
            </div>

            {/* Stats Grid Skeleton */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="bg-[var(--surface)] p-6 rounded-[2rem] border border-[var(--border)] space-y-4">
                        <div className="flex justify-between items-center">
                            <div className="w-12 h-12 bg-[var(--secondary)] rounded-2xl"></div>
                            <div className="w-16 h-4 bg-[var(--secondary)] rounded-lg"></div>
                        </div>
                        <div className="space-y-2">
                            <div className="h-3 w-24 bg-[var(--secondary)] rounded-md"></div>
                            <div className="h-8 w-32 bg-[var(--secondary)] rounded-xl"></div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Table Skeleton */}
            <div className="bg-[var(--surface)] rounded-[2.5rem] border border-[var(--border)] overflow-hidden">
                <div className="p-6 md:p-8 border-b border-[var(--border)] flex items-center justify-between">
                    <div className="h-6 w-40 bg-[var(--secondary)] rounded-lg"></div>
                    <div className="h-4 w-24 bg-[var(--secondary)] rounded-md"></div>
                </div>
                <div className="p-8 space-y-6">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="flex items-center justify-between py-2 border-b border-[var(--border)] last:border-0">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-[var(--secondary)] rounded-lg"></div>
                                <div className="space-y-2">
                                    <div className="h-4 w-32 bg-[var(--secondary)] rounded-md"></div>
                                    <div className="h-3 w-20 bg-[var(--secondary)] rounded-md"></div>
                                </div>
                            </div>
                            <div className="w-24 h-6 bg-[var(--secondary)] rounded-xl"></div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}




