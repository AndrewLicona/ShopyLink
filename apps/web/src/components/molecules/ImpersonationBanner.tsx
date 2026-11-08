'use client';

import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { UserCheck, LogOut, ShieldAlert } from 'lucide-react';

/**
 * Banda de "modo suplantación".
 *
 * Va fijada totalmente arriba (fixed) y publica su altura real en la variable
 * CSS `--impersonation-banner-h`. Los headers del panel (dashboard y admin)
 * la usan como offset, así que en móvil la banda ya no tapa el logo, el
 * buscador ni el menú.
 */
export default function ImpersonationBanner() {
    const router = useRouter();
    const pathname = usePathname();
    const [isImpersonating, setIsImpersonating] = useState(false);
    const bannerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const token = localStorage.getItem('impersonation_token');
        setIsImpersonating(!!token);

        // Listen for storage changes in case of logout
        const handleStorage = () => {
            setIsImpersonating(!!localStorage.getItem('impersonation_token'));
        };
        window.addEventListener('storage', handleStorage);
        return () => window.removeEventListener('storage', handleStorage);
    }, []);

    // Only show banner in admin or dashboard areas
    const isVisibleRoute = pathname.startsWith('/dashboard') || pathname.startsWith('/admin');

    // Publica la altura de la banda para que los headers se corran.
    useLayoutEffect(() => {
        const root = document.documentElement;

        if (!isImpersonating || !isVisibleRoute) {
            root.style.removeProperty('--impersonation-banner-h');
            return;
        }

        const update = () => {
            const height = bannerRef.current?.offsetHeight ?? 0;
            root.style.setProperty('--impersonation-banner-h', `${height}px`);
        };

        update();
        const observer = new ResizeObserver(update);
        if (bannerRef.current) observer.observe(bannerRef.current);
        window.addEventListener('resize', update);

        return () => {
            observer.disconnect();
            window.removeEventListener('resize', update);
            root.style.removeProperty('--impersonation-banner-h');
        };
    }, [isImpersonating, isVisibleRoute]);

    const stopImpersonating = () => {
        localStorage.removeItem('impersonation_token');
        localStorage.removeItem('impersonated_user_id');
        setIsImpersonating(false);
        router.push('/admin');
        window.location.reload(); // Force refresh to clear headers in api.ts
    };

    if (!isImpersonating || !isVisibleRoute) return null;

    return (
        <div
            ref={bannerRef}
            className="fixed top-0 inset-x-0 z-[100] bg-indigo-600 text-white px-3 md:px-4 py-2 flex items-center justify-between gap-2 shadow-lg animate-in slide-in-from-top duration-300"
        >
            <div className="flex items-center gap-2 md:gap-3 min-w-0">
                <div className="bg-white/20 p-1.5 rounded-lg hidden md:block shrink-0">
                    <UserCheck className="w-4 h-4 text-white" />
                </div>
                <div className="flex flex-col md:flex-row md:items-center gap-0.5 md:gap-2 min-w-0">
                    <span className="text-[9px] md:text-xs font-black uppercase tracking-widest bg-white/20 px-1.5 py-0.5 rounded shrink-0 self-start">
                        Modo Suplantación
                    </span>
                    <span className="text-[11px] md:text-sm font-bold truncate">
                        Estás viendo la plataforma como este usuario
                    </span>
                </div>
            </div>
            <button
                onClick={stopImpersonating}
                className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-2.5 md:px-3 py-1.5 rounded-xl text-[11px] md:text-xs font-black transition-all shadow-sm active:scale-95 shrink-0"
            >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Finalizar Sesión</span>
                <span className="md:hidden">Salir</span>
            </button>
        </div>
    );
}
