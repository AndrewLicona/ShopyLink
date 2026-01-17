'use client';

import { Search } from 'lucide-react';
import type { Category } from '@/types/types';

interface CategoryBarProps {
    categories: Category[];
    activeCategory: string;
    onSelectCategory: (id: string) => void;
    searchTerm: string;
    onSearchChange: (term: string) => void;
}

export function CategoryBar({
    categories,
    activeCategory,
    onSelectCategory,
    searchTerm,
    onSearchChange
}: CategoryBarProps) {
    return (
        <div className="space-y-6">
            {/* Search Bar */}
            <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                    type="text"
                    placeholder="Buscar producto..."
                    className="w-full pl-12 pr-4 py-4 rounded-3xl bg-[var(--bg)] border border-[var(--border)] shadow-sm focus:ring-2 focus:ring-[var(--primary)]/20 outline-none text-[var(--text)] font-bold"
                    value={searchTerm}
                    onChange={(e) => onSearchChange(e.target.value)}
                />
            </div>

            {/* Categories Bar */}
            <div className="flex gap-2 overflow-x-auto pb-8 scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
                <button
                    onClick={() => onSelectCategory('all')}
                    className={`px-6 py-2.5 rounded-2xl text-xs font-black uppercase tracking-widest whitespace-nowrap transition-all shadow-sm ${activeCategory === 'all'
                        ? 'bg-[var(--primary)] text-[var(--bg)] shadow-[var(--primary)]/10 shadow-lg'
                        : 'bg-[var(--bg)] text-[var(--text)]/60 border border-[var(--border)] hover:text-[var(--text)] hover:bg-[var(--secondary)]'
                        }`}
                >
                    Todo
                </button>
                {categories.map((cat) => (
                    <button
                        key={cat.id}
                        onClick={() => onSelectCategory(cat.id)}
                        className={`px-6 py-2.5 rounded-2xl text-xs font-black uppercase tracking-widest whitespace-nowrap transition-all shadow-sm ${activeCategory === cat.id
                            ? 'bg-[var(--primary)] text-[var(--bg)] shadow-[var(--primary)]/10 shadow-lg'
                            : 'bg-[var(--bg)] text-[var(--text)]/60 border border-[var(--border)] hover:text-[var(--text)] hover:bg-[var(--secondary)]'
                            }`}
                    >
                        {cat.name}
                    </button>
                ))}
            </div>
        </div>
    );
}
