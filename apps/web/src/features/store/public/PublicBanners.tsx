'use client';

import { useEffect, useRef } from 'react';
import { StoreBanner } from '@/types/types';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

interface PublicBannersProps {
    banners: StoreBanner[];
    position: 'HERO' | 'TOP_BAR' | 'BETWEEN_PRODUCTS';
}

/**
 * Imagen del banner sin recortes en móvil.
 *
 * En pantallas pequeñas la imagen se muestra completa (`object-contain`) sobre
 * un fondo desenfocado de la misma imagen, de modo que nunca se cortan los
 * bordes ni el logo de la promoción. A partir de `sm` se usa `object-cover`
 * para aprovechar el formato panorámico en tablet y escritorio.
 */
function BannerMedia({
    src,
    alt,
    priority = false,
    sizes = '100vw',
}: {
    src: string;
    alt: string;
    priority?: boolean;
    sizes?: string;
}) {
    return (
        <>
            {/* Fondo desenfocado: rellena el espacio sobrante en móvil */}
            <div className="absolute inset-0 sm:hidden overflow-hidden">
                <Image
                    src={src}
                    alt=""
                    fill
                    aria-hidden
                    sizes={sizes}
                    className="object-cover scale-110 blur-xl opacity-50"
                />
            </div>
            {/* Imagen real: completa en móvil, panorámica en escritorio */}
            <Image
                src={src}
                alt={alt}
                fill
                priority={priority}
                sizes={sizes}
                className="object-contain sm:object-cover transition-transform duration-700"
            />
        </>
    );
}

export function PublicBanners({ banners, position }: PublicBannersProps) {
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
                                className="w-full shrink-0 snap-center relative bg-[var(--secondary)] overflow-hidden h-[220px] sm:h-[320px] md:h-[400px] lg:h-[520px]"
                            >
                                {/* Background Image */}
                                {banner.imageUrl ? (
                                    <BannerMedia
                                        src={banner.imageUrl}
                                        alt={banner.title || 'Oferta especial'}
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
        const banner = filteredBanners[0];
        if (!banner) return null;

        const content = (
            <div 
                className="w-full rounded-3xl overflow-hidden relative bg-[var(--secondary)] border border-[var(--border)] group my-8 shadow-sm h-[200px] sm:h-[210px] md:h-[240px] lg:h-[280px]"
            >
                {banner.imageUrl ? (
                    <>
                        <BannerMedia
                            src={banner.imageUrl}
                            alt={banner.title || 'Promoción'}
                            sizes="(min-width: 1024px) 1200px, 100vw"
                        />
                        {/* Gradient overlay solo cuando hay texto */}
                        {(banner.title || banner.subtitle) && (
                            <div className="absolute inset-0 bg-gradient-to-r from-black/55 via-black/20 to-transparent" />
                        )}
                        {/* Contenido de texto */}
                        {(banner.title || banner.subtitle || banner.linkUrl) && (
                            <div className="absolute inset-0 flex flex-col justify-center px-6 md:px-10 select-none">
                                <div className="max-w-lg space-y-1.5">
                                    {banner.title && (
                                        <h3 className="text-base sm:text-xl md:text-2xl font-black text-white uppercase tracking-tight leading-tight drop-shadow-md">
                                            {banner.title}
                                        </h3>
                                    )}
                                    {banner.subtitle && (
                                        <p className="text-xs sm:text-sm font-semibold text-white/85 leading-relaxed drop-shadow-sm">
                                            {banner.subtitle}
                                        </p>
                                    )}
                                    {banner.linkUrl && (
                                        <div className="mt-3 inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-sm hover:bg-white/30 border border-white/30 text-white text-[11px] font-black uppercase tracking-widest px-4 py-2 rounded-full transition-all duration-200 group-hover:scale-105">
                                            Ver más
                                            <ChevronRight className="w-3.5 h-3.5" />
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </>
                ) : (
                    /* Fallback sin imagen: degradado de tema con texto centrado */
                    <div className="w-full h-full bg-gradient-to-r from-[var(--primary)]/15 via-[var(--primary)]/8 to-[var(--primary)]/3 flex flex-col items-center justify-center p-6 text-center select-none gap-2">
                        {banner.title && (
                            <span className="text-lg md:text-2xl font-black text-[var(--primary)] uppercase tracking-widest">
                                {banner.title}
                            </span>
                        )}
                        {banner.subtitle && (
                            <span className="text-sm font-semibold text-[var(--primary)]/60">
                                {banner.subtitle}
                            </span>
                        )}
                        {!banner.title && !banner.subtitle && (
                            <span className="text-xl font-black text-[var(--primary)]/25 uppercase tracking-widest">Anuncio</span>
                        )}
                    </div>
                )}
            </div>
        );

        if (banner.linkUrl) {
            return (
                <Link href={banner.linkUrl} className="block transition-transform hover:scale-[1.005] active:scale-[0.998]">
                    {content}
                </Link>
            );
        }

        return content;
    }

    return null;
}
