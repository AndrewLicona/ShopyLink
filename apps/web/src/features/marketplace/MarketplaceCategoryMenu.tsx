'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { ChevronDown, LayoutGrid, Tag } from 'lucide-react';

/**
 * Categories dropdown for the marketplace navigation.
 *
 * The list comes from the marketplace categories endpoint, so only categories
 * that actually have published products are shown.
 */
export function MarketplaceCategoryMenu({ categories }: { categories: string[] }) {
    const [open, setOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!open) return;

        const handlePointerDown = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setOpen(false);
            }
        };
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') setOpen(false);
        };

        document.addEventListener('mousedown', handlePointerDown);
        document.addEventListener('keydown', handleKeyDown);

        return () => {
            document.removeEventListener('mousedown', handlePointerDown);
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [open]);

    if (categories.length === 0) return null;

    return (
        <div className="relative" ref={containerRef}>
            <button
                type="button"
                onClick={() => setOpen((prev) => !prev)}
                aria-expanded={open}
                aria-haspopup="true"
                className={`flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-bold transition-colors ${
                    open
                        ? 'bg-gray-100 text-gray-900'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
            >
                <LayoutGrid className="h-4 w-4" />
                Categorías
                <ChevronDown
                    className={`h-3.5 w-3.5 transition-transform duration-200 ${
                        open ? 'rotate-180' : ''
                    }`}
                />
            </button>

            {open && (
                <div className="absolute left-0 top-full z-50 mt-2 w-64 overflow-hidden rounded-2xl border border-gray-100 bg-white p-2 shadow-xl shadow-gray-900/10">
                    <p className="px-3 pb-2 pt-1.5 text-[10px] font-black uppercase tracking-widest text-gray-400">
                        Explorar por categoría
                    </p>
                    {categories.map((category) => (
                        <Link
                            key={category}
                            href={`/marketplace/${encodeURIComponent(category)}`}
                            onClick={() => setOpen(false)}
                            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold text-gray-700 transition-colors hover:bg-blue-50 hover:text-blue-700"
                        >
                            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-500 transition-colors group-hover:text-blue-600">
                                <Tag className="h-3.5 w-3.5" />
                            </span>
                            <span className="truncate">{category}</span>
                        </Link>
                    ))}
                    <div className="my-1 h-px bg-gray-100" />
                    <Link
                        href="/marketplace/search"
                        onClick={() => setOpen(false)}
                        className="block rounded-xl px-3 py-2.5 text-center text-xs font-black uppercase tracking-wider text-blue-600 transition-colors hover:bg-blue-50"
                    >
                        Ver todos los productos
                    </Link>
                </div>
            )}
        </div>
    );
}
