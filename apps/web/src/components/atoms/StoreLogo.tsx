'use client';

import { useState } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface StoreLogoProps {
    src?: string | null;
    alt: string;
    /**
     * Clase de Tailwind con el ANCHO del marco (p. ej. `w-12`). La altura se
     * calcula sola con la proporción real de la imagen.
     */
    widthClass?: string;
    /** Tope de altura del marco, para logos muy verticales. */
    maxHeightClass?: string;
    /** Clases extra del marco. */
    className?: string;
    /** Clases extra de la imagen. */
    imageClassName?: string;
    sizes?: string;
    priority?: boolean;
    /** Se muestra cuando la tienda no tiene logo. */
    fallback?: React.ReactNode;
}

/**
 * Logo de la tienda que respeta su proporción real.
 *
 * Antes cada sitio tenía su propio marco cuadrado fijo con `object-contain`:
 * cuando el logo no era cuadrado (horizontal, con aire a los lados) sobraba
 * espacio en blanco y se veía "hueco". Aquí el marco adopta la proporción de la
 * imagen, así el logo llena su espacio sin deformarse ni recortarse.
 *
 * Antes de que la imagen cargue se usa un marco cuadrado (la proporción más
 * común), lo que evita saltos de maquetación.
 */
export function StoreLogo({
    src,
    alt,
    widthClass = 'w-12',
    maxHeightClass = 'max-h-12',
    className,
    imageClassName,
    sizes = '96px',
    priority = false,
    fallback,
}: StoreLogoProps) {
    // null = aún no se conoce la proporción; 1 = cuadrado por defecto.
    const [ratio, setRatio] = useState<number | null>(null);

    if (!src) {
        return <div className={cn(widthClass, maxHeightClass, className)}>{fallback}</div>;
    }

    return (
        <div
            className={cn('relative shrink-0 overflow-hidden', widthClass, maxHeightClass, className)}
            // Antes de cargar la imagen se usa la proporción cuadrada (la más
            // común) para que el marco no mida 0 de alto ni dé un salto.
            style={{ aspectRatio: ratio ? String(ratio) : '1 / 1' }}
        >
            <Image
                src={src}
                alt={alt}
                fill
                priority={priority}
                sizes={sizes}
                onLoad={(e) => {
                    const img = e.currentTarget;
                    if (img.naturalWidth && img.naturalHeight) {
                        setRatio(img.naturalWidth / img.naturalHeight);
                    }
                }}
                className={cn('object-contain', imageClassName)}
            />
        </div>
    );
}
