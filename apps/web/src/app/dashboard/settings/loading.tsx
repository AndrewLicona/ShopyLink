export default function SettingsLoading() {
    return (
        <div className="max-w-5xl mx-auto space-y-8 pb-20 animate-pulse">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white rounded-2xl border border-gray-100"></div>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[var(--secondary)] rounded-full"></div>
                        <div className="space-y-2">
                            <div className="h-8 w-48 bg-[var(--secondary)] rounded-xl"></div>
                            <div className="h-4 w-64 bg-[var(--secondary)] rounded-lg"></div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs Skeleton */}
            <div className="flex flex-col sm:flex-row gap-2 border-b border-gray-200 mb-8">
                <div className="h-14 w-44 bg-[var(--secondary)] rounded-t-2xl"></div>
                <div className="h-14 w-44 bg-[var(--secondary)] rounded-t-2xl"></div>
                <div className="h-14 w-44 bg-[var(--secondary)] rounded-t-2xl"></div>
            </div>

            {/* Form Skeleton */}
            <div className="bg-[var(--surface)] rounded-[2.5rem] border border-[var(--border)] p-8 md:p-12 space-y-10">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                    <div className="lg:col-span-7 space-y-8">
                        <div className="h-4 w-32 bg-[var(--secondary)] rounded-md"></div>
                        <div className="space-y-6">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="space-y-2">
                                    <div className="h-4 w-24 bg-[var(--secondary)] rounded-md"></div>
                                    <div className="h-14 w-full bg-[var(--secondary)] rounded-2xl"></div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="lg:col-span-5 space-y-8">
                        <div className="h-4 w-32 bg-[var(--secondary)] rounded-md"></div>
                        <div className="p-8 border-2 border-dashed border-[var(--border)] rounded-[2.5rem] bg-[var(--secondary)]/30 flex flex-col items-center gap-6">
                            <div className="w-40 h-40 bg-[var(--surface)] rounded-[2rem]"></div>
                            <div className="w-40 h-14 bg-[var(--surface)] rounded-2xl"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}




