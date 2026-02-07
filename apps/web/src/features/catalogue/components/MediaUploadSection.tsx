'use client';

import React from 'react';
import { X, Plus } from 'lucide-react';
import Image from 'next/image';
import { useProducts } from '@/hooks/useProducts';

interface MediaUploadSectionProps {
    imageUrls: string[];
    actions: ReturnType<typeof useProducts>['actions'];
}

export function MediaUploadSection({ imageUrls, actions }: MediaUploadSectionProps) {
    return (
        <div className="space-y-4">
            <label className="text-[10px] font-black uppercase tracking-wider text-[var(--text)]/40 px-1">Imágenes del Producto (Max 5)</label>
            <div className="flex flex-wrap gap-3">
                {imageUrls.map((url, i) => (
                    <div key={url + i} className="w-24 h-24 relative rounded-2xl overflow-hidden group border-2 border-[var(--border)] shadow-sm">
                        <Image src={url} alt={`Priview ${i}`} fill className="object-cover" />
                        <button
                            type="button" onClick={() => actions.removeImage(i)}
                            className="absolute inset-0 bg-red-500/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>
                ))}
                {imageUrls.length < 5 && (
                    <label className="w-24 h-24 flex flex-col items-center justify-center gap-2 border-2 border-dashed border-[var(--border)] rounded-2xl hover:border-[var(--primary)] transition-all cursor-pointer bg-[var(--secondary)]/10 group">
                        <input type="file" multiple accept="image/*" onChange={actions.handleProductImageUpload} className="hidden" />
                        <Plus className="w-6 h-6 text-[var(--text)]/20 group-hover:text-[var(--primary)] transition-colors" />
                        <span className="text-[8px] font-black uppercase text-[var(--text)]/30 tracking-widest">Subir</span>
                    </label>
                )}
            </div>
        </div>
    );
}
