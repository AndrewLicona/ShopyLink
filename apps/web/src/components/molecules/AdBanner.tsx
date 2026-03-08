'use client';

import React from 'react';
import Link from 'next/link';
import { ExternalLink } from 'lucide-react';

interface AdBannerProps {
    planType?: 'FREE' | 'PRO';
}

/**
 * AdBanner Component
 * Solo se renderiza si el plan de la tienda es FREE.
 * Actualmente funciona como branding cruzado para ShopyLinks.
 * Futuro: Integración con Google AdSense.
 */
export const AdBanner: React.FC<AdBannerProps> = ({ planType }) => {
    if (planType === 'PRO') return null;

    return (
        <div className="w-full max-w-2xl mx-auto my-12 px-4">
            <Link
                href="/"
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full bg-gradient-to-r from-[var(--surface)] to-[var(--bg)] border border-[var(--border)] rounded-2xl p-4 shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5 group overflow-hidden relative"
            >
                {/* Decorative background element */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--primary)]/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/4 group-hover:bg-[var(--primary)]/10 transition-colors"></div>

                <div className="flex items-center justify-between gap-4 relative z-10">
                    <div className="flex flex-col">
                        <span className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-[var(--text)]/40 mb-1">
                            Patrocinado
                        </span>
                        <h4 className="text-sm sm:text-base font-bold text-[var(--text)] leading-tight">
                            ¿Tienes un negocio? Crea tu tienda online gratis
                        </h4>
                        <p className="text-xs sm:text-sm font-medium text-[var(--text)]/60 mt-1">
                            Vende por WhatsApp en menos de 5 minutos con ShopyLinks.
                        </p>
                    </div>

                    <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 bg-[var(--primary)] text-white rounded-xl flex items-center justify-center shadow-lg shadow-[var(--primary)]/20 group-hover:scale-110 transition-transform">
                        <ExternalLink className="w-5 h-5 sm:w-6 sm:h-6" />
                    </div>
                </div>
            </Link>
        </div>
    );
};
