'use client';

import React from 'react';
import { X, Plus } from 'lucide-react';
import Image from 'next/image';
import { useProducts } from '@/hooks/useProducts';

interface MediaUploadSectionProps {
    imageUrls: string[];
    actions: ReturnType<typeof useProducts>['actions'];
}

import { AlertCircle } from 'lucide-react';

export function MediaUploadSection({ imageUrls, actions }: MediaUploadSectionProps) {
    return (
        <div className="space-y-4">
            <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-4 flex gap-3 text-blue-800">
                <AlertCircle className="w-5 h-5 shrink-0 text-blue-500" />
                <div className="space-y-1">
                    <p className="text-sm font-bold">Recomendación para Redes Sociales</p>
                    <p className="text-xs font-medium opacity-80 leading-relaxed">
                        Para que tus productos se vean perfectos al compartirlos por WhatsApp o Facebook, usa imágenes <strong>cuadradas (ej. 600x600px)</strong> o rectangulares panorámicas (ej. 1200x630px) que pesen menos de 300KB. Imágenes muy alargadas o pesadas podrían no mostrarse en el enlace.
                    </p>
                </div>
            </div>

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
