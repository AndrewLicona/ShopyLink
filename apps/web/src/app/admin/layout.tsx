'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import { api } from '@/services/api';
import { ShieldAlert, Loader2 } from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [authorized, setAuthorized] = useState(false);
    const [currentEmail, setCurrentEmail] = useState('');

    useEffect(() => {
        const checkAdmin = async () => {
            try {
                const supabase = createClient();
                const { data: { session }, error: sessionError } = await supabase.auth.getSession();

                if (sessionError || !session) {
                    router.push('/login');
                    return;
                }

                // Call API to get real role from DB
                const profile = await api.getProfile();

                if (profile && profile.role === 'SUPER_ADMIN') {
                    setAuthorized(true);
                } else {
                    setCurrentEmail(profile?.email || session.user.email || '');
                    console.warn(`User ${profile?.email} is not an authorized SUPER_ADMIN.`);
                }
            } catch (err) {
                console.error('CheckAdmin crash:', err);
            } finally {
                setLoading(false);
            }
        };

        checkAdmin();
    }, [router]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[var(--bg)] text-[var(--text)]">
                <Loader2 className="w-10 h-10 animate-spin text-[var(--primary)]" />
            </div>
        );
    }

    if (!authorized) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-[var(--bg)] text-[var(--text)] p-4 text-center">
                <ShieldAlert className="w-16 h-16 text-red-500 mb-4" />
                <h1 className="text-2xl font-black">Acceso Denegado</h1>
                <p className="text-[var(--text)]/60 max-w-md mx-auto mt-2">
                    Tu cuenta <span className="font-bold text-[var(--text)]">{currentEmail}</span> no tiene permisos de Super Administrador.
                </p>
                <div className="mt-8 p-4 bg-indigo-50 border border-indigo-100 rounded-2xl text-indigo-800 text-sm">
                    <p className="font-bold mb-1">¿Cómo solucionar esto?</p>
                    Contacta al administrador para que te asigne el rol <code className="bg-indigo-100 px-1 rounded">SUPER_ADMIN</code> en la base de datos o asegúrate de que tu email esté en la lista permitida del servidor.
                </div>
                <button onClick={() => router.push('/dashboard')} className="mt-6 text-[var(--primary)] font-bold hover:underline">Volver al Dashboard</button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F8FAFC] text-slate-900">
            {/* Simple Admin Navbar */}
            <header className="bg-white border-b border-slate-200 h-16 flex items-center px-4 md:px-8 justify-between sticky top-0 z-50">
                <div className="flex items-center gap-2">
                    <ShieldAlert className="w-5 h-5 md:w-6 md:h-6 text-indigo-600" />
                    <span className="font-black text-lg md:text-xl tracking-tight text-slate-900">Shopy<span className="text-indigo-600 md:inline hidden">Admin</span><span className="text-indigo-600 md:hidden ml-1">Admin</span></span>
                </div>
                <div className="flex items-center gap-2 md:gap-4">
                    <span className="text-[10px] md:text-sm font-bold bg-indigo-50 text-indigo-700 px-2 md:px-3 py-1 rounded-full uppercase tracking-wider">SuperAdmin</span>
                    <button onClick={() => router.push('/dashboard')} className="text-[10px] md:text-sm font-bold text-slate-500 hover:text-slate-900 transition-colors bg-slate-100 px-2 md:px-0 md:bg-transparent py-1.5 md:py-0 rounded-lg">Salir</button>
                </div>
            </header>
            <main className="max-w-7xl mx-auto p-4 md:p-8">
                {children}
            </main>
        </div>
    );
}
