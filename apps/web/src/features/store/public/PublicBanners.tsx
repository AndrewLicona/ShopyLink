'use client';

import { useEffect, useRef } from 'react';
import { StoreBanner, Store } from '@/types/types';
import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { ChevronRight } from 'lucide-react';

interface PublicBannersProps {
    banners: StoreBanner[];
    position: 'HERO' | 'TOP_BAR' | 'BETWEEN_PRODUCTS';
    store?: Store;
}

export function PublicBanners({ banners, position, store }: PublicBannersProps) {
    const carouselRef = useRef<HTMLDivElement>(null);
    
    // Filtrar banners por la posición solicitada
    const filteredBanners = banners.filter(b => b.position === position && b.isActive);

    useEffect(() => {
        if (!carouselRef.current || filteredBanners.length <= 1) return;
        const interval = setInterval(() => {
            const el = carouselRef.current;
            if (el) {
                const maxScrollLeft = el.scrollWidth - el.clientWidth;
                // Pequeño margen de error (10px) para diferentes pantallas
                if (el.scrollLeft >= maxScrollLeft - 10) {
                    el.scrollTo({ left: 0, behavior: 'smooth' });
                } else {
                    el.scrollBy({ left: el.clientWidth, behavior: 'smooth' });
                }
            }
        }, 3000);
        return () => clearInterval(interval);
    }, [filteredBanners.length]);

    if (filteredBanners.length === 0) return null;

    // TOP_BAR: Barra de anuncio superior delgada (Carrusel auto-deslizable)
    if (position === 'TOP_BAR') {
        return (
            <div className="relative w-full overflow-hidden bg-[var(--primary)] text-[var(--bg)] text-xs font-black tracking-wide text-center group">
                <div 
                    ref={carouselRef}
                    className="flex w-full overflow-x-auto snap-x snap-mandatory scroll-smooth [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
                >
                    {filteredBanners.map(banner => {
                        const content = (
                            <div className="py-2.5 px-4 flex items-center justify-center gap-2 select-none w-full shrink-0 snap-center">
                                <span className="truncate">
                                    {banner.title} {banner.subtitle ? `| ${banner.subtitle}` : ''}
                                </span>
                                {banner.linkUrl && <ChevronRight className="w-3.5 h-3.5 shrink-0 opacity-80" />}
                            </div>
                        );

                        if (banner.linkUrl) {
                            return (
                                <Link key={banner.id} href={banner.linkUrl} className="w-full shrink-0 snap-center block hover:opacity-95 transition-opacity">
                                    {content}
                                </Link>
                            );
                        }

                        return <div key={banner.id} className="w-full shrink-0 snap-center">{content}</div>;
                    })}
                </div>
            </div>
        );
    }

    // HERO: Banner principal grande
    if (position === 'HERO') {
        return (
            <div className="relative w-full rounded-[2rem] overflow-hidden group">
                {/* Contenedor del Carrusel (CSS Snap Scroll) */}
                <div 
                    ref={carouselRef}
                    className="flex w-full overflow-x-auto snap-x snap-mandatory scroll-smooth [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
                >
                    {filteredBanners.map((banner) => {
                        const content = (
                            <div 
                                className="w-full shrink-0 snap-center aspect-[16/7] md:aspect-[21/7] relative bg-[var(--secondary)] overflow-hidden"
                            >
                                {/* Background Image */}
                                {banner.imageUrl ? (
                                    <Image
                                        src={banner.imageUrl}
                                        alt={banner.title || 'Oferta especial'}
                                        fill
                                        className="object-cover transition-transform duration-700"
                                        priority
                                    />
                                ) : (
                                    <div className="w-full h-full bg-gradient-to-br from-[var(--primary)]/20 to-[var(--primary)]/5 flex flex-col items-center justify-center p-4 text-center select-none">
                                         <span className="text-xl md:text-3xl font-black text-[var(--primary)] uppercase tracking-widest opacity-30">
                                            Sin Imagen
                                         </span>
                                    </div>
                                )}
                                
                                {/* Overlay Gradient for Text Contrast */}
                                {(banner.title || banner.subtitle) && (
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent flex flex-col justify-end p-6 md:p-8 text-white select-none">
                                        <div className="max-w-xl space-y-1">
                                            <h2 className="text-xl md:text-3xl font-black uppercase tracking-tight leading-none drop-shadow-sm">
                                                {banner.title}
                                            </h2>
                                            {banner.subtitle && (
                                                <p className="text-xs md:text-sm font-medium opacity-90 leading-tight drop-shadow-sm">
                                                    {banner.subtitle}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        );

                        return (
                            <div key={banner.id} className="w-full shrink-0">
                                {banner.linkUrl ? (
                                    <Link href={banner.linkUrl} className="block active:scale-98 transition-transform">
                                        {content}
                                    </Link>
                                ) : (
                                    content
                                )}
                            </div>
                        );
                    })}
                </div>
                
                {/* Indicadores del Carrusel (Solo si hay más de 1) */}
                {filteredBanners.length > 1 && (
                    <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 pointer-events-none">
                        {filteredBanners.map((_, i) => (
                            <div key={i} className="w-2 h-2 rounded-full bg-white/50 backdrop-blur-sm" />
                        ))}
                    </div>
                )}
            </div>
        );
    }

    // BETWEEN_PRODUCTS: Banner intercalado
    if (position === 'BETWEEN_PRODUCTS') {
        const banner = filteredBanners[0]; // Mostrar el más reciente
        if (!banner) return null;

        const content = (
            <div 
                className="w-full aspect-[4/1] md:aspect-[8/1] rounded-[2rem] overflow-hidden relative bg-[var(--secondary)] border border-[var(--border)] group my-8"
            >
                {banner.imageUrl ? (
                    <Image
                        src={banner.imageUrl}
                        alt={banner.title || "Publicidad interna"}
                        fill
                        className="object-cover group-hover:scale-[1.01] transition-transform duration-700"
                    />
                ) : (
                    <div className="w-full h-full bg-gradient-to-br from-[var(--primary)]/20 to-[var(--primary)]/5 flex flex-col items-center justify-center p-4 text-center select-none">
                         <span className="text-xl md:text-2xl font-black text-[var(--primary)] uppercase tracking-widest opacity-30">
                            {banner.title || "Anuncio"}
                         </span>
                    </div>
                )}
            </div>
        );

        if (banner.linkUrl) {
            return (
                <Link href={banner.linkUrl} className="block active:scale-98 transition-transform">
                    {content}
                </Link>
            );
        }

        return content;
    }

    return null;
}
