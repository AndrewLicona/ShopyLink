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
    /**
     * `rounded` (por defecto) es un cuadro con esquinas suaves; `circle` es un
     * medallón. El círculo recorta el arte cuadrado del logo, que es lo que se
     * veía "rústico" pegado a un borde recto.
     */
    shape?: 'rounded' | 'circle';
    /**
     * `cover` (por defecto) hace que el logo llene el marco y sus esquinas
     * queden recortadas por el redondeo. `contain` lo deja entrar completo
     * dejando aire alrededor.
     */
    fit?: 'cover' | 'contain';
}

/** Fuera de este rango el logo se deforma o el marco queda rarísimo. */
const RATIO_MIN = 0.6;
const RATIO_MAX = 2.2;

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
    shape = 'rounded',
    fit = 'cover',
}: StoreLogoProps) {
    // null = aún no se conoce la proporción; 1 = cuadrado por defecto.
    const [ratio, setRatio] = useState<number | null>(null);

    const shapeClass = shape === 'circle' ? 'rounded-full' : 'rounded-2xl';

    if (!src) {
        return (
            <div
                className={cn(
                    'relative shrink-0 overflow-hidden',
                    shapeClass,
                    widthClass,
                    maxHeightClass,
                    className,
                )}
            >
                {fallback}
            </div>
        );
    }

    // Un logo muy horizontal o muy vertical no entra cómodo en el marco: se
    // deja "contain" con aire para que no le corten nada importante.
    const extremo = ratio !== null && (ratio > RATIO_MAX || ratio < RATIO_MIN);
    const encuadre = fit === 'contain' || extremo ? 'object-contain p-1' : 'object-cover';
    const proporcion = ratio
        ? String(Math.min(Math.max(ratio, RATIO_MIN), RATIO_MAX))
        : '1 / 1';

    // En medallón el marco siempre es cuadrado: si tomara la proporción del
    // logo, un nombre horizontal quedaría en una elipse con los extremos
    // recortados. El logo entra completo y la circunferencia se encarga de
    // quitarle las esquinas al arte cuadrado.
    const esMedallon = shape === 'circle';

    return (
        <div
            className={cn(
                'relative shrink-0 overflow-hidden',
                shapeClass,
                widthClass,
                maxHeightClass,
                className,
            )}
            // Antes de cargar la imagen se usa la proporción cuadrada (la más
            // común) para que el marco no mida 0 de alto ni dé un salto.
            style={{ aspectRatio: esMedallon ? '1 / 1' : proporcion }}
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
                className={cn(esMedallon ? 'object-contain p-1' : encuadre, imageClassName)}
            />
        </div>
    );
}
