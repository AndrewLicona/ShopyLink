'use client';

import React, { useState, useRef } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, ShoppingBag, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProductImageGalleryProps {
    images: string[];
    productName: string;
}

export function ProductImageGallery({ images, productName }: ProductImageGalleryProps) {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [showLightbox, setShowLightbox] = useState(false);
    const touchStartX = useRef<number | null>(null);

    if (images.length === 0) {
        return (
            <div className="aspect-square flex items-center justify-center text-gray-100 bg-white">
                <ShoppingBag className="w-20 h-20" />
            </div>
        );
    }

    const handleTouchStart = (e: React.TouchEvent) => {
        if (e.touches[0]) {
            touchStartX.current = e.touches[0].clientX;
        }
    };

    const handleTouchEnd = (e: React.TouchEvent) => {
        if (touchStartX.current === null || !e.changedTouches[0]) return;
        const touchEndX = e.changedTouches[0].clientX;
        const diff = touchStartX.current - touchEndX;
        if (Math.abs(diff) > 50) {
            if (diff > 0) {
                setCurrentImageIndex(prev => (prev === images.length - 1 ? 0 : prev + 1));
            } else {
                setCurrentImageIndex(prev => (prev === 0 ? images.length - 1 : prev - 1));
            }
        }
        touchStartX.current = null;
    };

    return (
        <div className="w-full h-auto flex flex-col bg-white overflow-hidden shrink-0">
            <div className="aspect-square relative w-full overflow-hidden group touch-pan-y">
                <div
                    className="w-full h-full relative"
                    onTouchStart={handleTouchStart}
                    onTouchEnd={handleTouchEnd}
                >
                    <Image
                        src={images[currentImageIndex] ?? images[0] ?? ''}
                        alt={productName}
                        fill
                        className="object-contain relative z-10 cursor-zoom-in transition-transform active:scale-95"
                        priority
                        onClick={() => setShowLightbox(true)}
                    />

                    {images.length > 1 && (
                        <>
                            <button
                                onClick={(e) => { e.stopPropagation(); setCurrentImageIndex(prev => (prev === 0 ? images.length - 1 : prev - 1)) }}
                                className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/50 hover:bg-black/70 backdrop-blur-md rounded-full flex items-center justify-center text-white transition-all active:scale-90 border border-white/20 opacity-0 md:opacity-100 group-hover:opacity-100 z-20"
                            >
                                <ChevronLeft className="w-6 h-6" />
                            </button>
                            <button
                                onClick={(e) => { e.stopPropagation(); setCurrentImageIndex(prev => (prev === images.length - 1 ? 0 : prev + 1)) }}
                                className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/50 hover:bg-black/70 backdrop-blur-md rounded-full flex items-center justify-center text-white transition-all active:scale-90 border border-white/20 opacity-0 md:opacity-100 group-hover:opacity-100 z-20"
                            >
                                <ChevronRight className="w-6 h-6" />
                            </button>
                            <div className="absolute top-4 left-4 bg-black/50 backdrop-blur-md text-white px-3 py-1 rounded-full text-[9px] font-black tracking-widest uppercase border border-white/20 z-20">
                                {currentImageIndex + 1} / {images.length}
                            </div>
                        </>
                    )}
                </div>
            </div>

            {images.length > 1 && (
                <div className="flex gap-2 p-3 overflow-x-auto scrollbar-hide bg-gray-50 dark:bg-black/40 border-t border-[var(--border)] scroll-smooth shrink-0">
                    {images.map((img, idx) => (
                        <button
                            key={idx}
                            onClick={() => setCurrentImageIndex(idx)}
                            className={cn(
                                "relative w-16 h-16 rounded-lg overflow-hidden border-2 transition-all flex-shrink-0 active:scale-90",
                                idx === currentImageIndex
                                    ? "border-[var(--primary)] shadow-lg"
                                    : "border-transparent opacity-60 hover:opacity-100"
                            )}
                        >
                            <Image
                                src={img}
                                alt={`Thumbnail ${idx + 1}`}
                                fill
                                className="object-cover"
                                sizes="64px"
                            />
                        </button>
                    ))}
                </div>
            )}

            {/* Lightbox */}
            {showLightbox && (
                <div
                    className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-xl flex flex-col items-center justify-center animate-in fade-in duration-300"
                    onClick={() => setShowLightbox(false)}
                >
                    <button
                        onClick={() => setShowLightbox(false)}
                        className="absolute top-6 right-6 w-12 h-12 bg-black/60 hover:bg-black/80 rounded-full flex items-center justify-center text-white transition-all z-50 border border-white/20"
                    >
                        <X className="w-6 h-6" />
                    </button>

                    <div className="relative w-full h-full p-4 md:p-12 flex items-center justify-center">
                        <Image
                            src={images[currentImageIndex] ?? images[0] ?? ''}
                            alt={productName}
                            width={1200}
                            height={1200}
                            className="max-w-full max-h-full object-contain shadow-2xl animate-in zoom-in-95 duration-500"
                            priority
                            onClick={(e) => e.stopPropagation()}
                        />
                    </div>

                    {images.length > 1 && (
                        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-6">
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setCurrentImageIndex(prev => (prev === 0 ? images.length - 1 : prev - 1))
                                }}
                                className="w-12 h-12 bg-black/60 hover:bg-black/80 rounded-full flex items-center justify-center text-white border border-white/20 transition-all active:scale-90"
                            >
                                <ChevronLeft className="w-6 h-6" />
                            </button>
                            <span className="text-white font-black text-sm tracking-widest uppercase bg-black/40 px-4 py-2 rounded-full backdrop-blur-md">
                                {currentImageIndex + 1} / {images.length}
                            </span>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setCurrentImageIndex(prev => (prev === images.length - 1 ? 0 : prev + 1))
                                }}
                                className="w-12 h-12 bg-black/60 hover:bg-black/80 rounded-full flex items-center justify-center text-white border border-white/20 transition-all active:scale-90"
                            >
                                <ChevronRight className="w-6 h-6" />
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
