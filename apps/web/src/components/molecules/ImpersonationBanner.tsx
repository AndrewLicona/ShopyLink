'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { UserCheck, LogOut, ShieldAlert } from 'lucide-react';

export default function ImpersonationBanner() {
    const router = useRouter();
    const pathname = usePathname();
    const [isImpersonating, setIsImpersonating] = useState(false);

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

    const stopImpersonating = () => {
        localStorage.removeItem('impersonation_token');
        localStorage.removeItem('impersonated_user_id');
        setIsImpersonating(false);
        router.push('/admin');
        window.location.reload(); // Force refresh to clear headers in api.ts
    };

    // Only show banner in admin or dashboard areas
    const isVisibleRoute = pathname.startsWith('/dashboard') || pathname.startsWith('/admin');
    if (!isImpersonating || !isVisibleRoute) return null;

    return (
        <div className="bg-indigo-600 text-white px-4 py-2 flex items-center justify-between sticky top-0 z-[9999] shadow-lg animate-in slide-in-from-top duration-300">
            <div className="flex items-center gap-2 md:gap-3">
                <div className="bg-white/20 p-1.5 rounded-lg hidden md:block">
                    <UserCheck className="w-4 h-4 text-white" />
                </div>
                <div className="flex flex-col md:flex-row md:items-center gap-0 md:gap-2">
                    <span className="text-[10px] md:text-xs font-black uppercase tracking-widest bg-white/20 px-1.5 py-0.5 rounded">Modo Suplantación</span>
                    <span className="text-xs md:text-sm font-bold truncate max-w-[150px] md:max-w-none">Estás viendo la plataforma como este usuario</span>
                </div>
            </div>
            <button
                onClick={stopImpersonating}
                className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded-xl text-xs font-black transition-all shadow-sm active:scale-95"
            >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Finalizar Sesión</span>
                <span className="md:hidden">Salir</span>
            </button>
        </div>
    );
}
