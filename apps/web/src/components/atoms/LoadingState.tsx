'use client';

import Image from 'next/image';
import { cn } from '@/lib/utils';

interface LoadingStateProps {
    message?: string;
    fullPage?: boolean;
    className?: string;
}

/** The original favicon is stacked in depth to form the animated 3D mark. */
export function LoadingState({ message = 'Cargando...', fullPage = false, className }: LoadingStateProps) {
    return (
        <div role="status" aria-live="polite" className={cn('flex flex-col items-center justify-center gap-4 px-5 text-center', fullPage ? 'min-h-[75vh]' : 'py-16', className)}>
            <div className="brand-loader-scene" aria-hidden="true">
                <div className="brand-loader-glow" />
                <div className="brand-loader-object">
                    {Array.from({ length: 10 }, (_, index) => (
                        <Image key={index} src="/favicon.svg" alt="" width={112} height={112} draggable={false} className="brand-loader-layer" style={{ transform: `translateZ(${-10 + index}px)`, filter: `brightness(${0.36 + index * 0.035})` }} />
                    ))}
                    <Image src="/favicon.svg" alt="" width={112} height={112} draggable={false} className="brand-loader-face" />
                </div>
            </div>
            <div className="space-y-1"><p className="text-sm font-black tracking-tight text-[var(--text)]">{message}</p><p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[var(--text)]/45">ShopyLinks</p></div>
        </div>
    );
}
