'use client';

import Link from 'next/link';
import { ShoppingBag } from 'lucide-react';

export function StoreNotFound() {
    return (
        <div className="min-h-screen bg-[var(--bg)] flex flex-col items-center justify-center p-4">
            <div className="max-w-md w-full bg-[var(--surface)] rounded-[3rem] p-12 shadow-[var(--shadow-strong)] flex flex-col items-center text-center space-y-8 animate-in fade-in zoom-in-95 duration-500">
                <div className="w-32 h-32 bg-[var(--secondary)] rounded-[2.5rem] flex items-center justify-center text-[var(--text)]/20 shadow-inner">
                    <ShoppingBag className="w-16 h-16" />
                </div>

                <div className="space-y-4">
                    <h1 className="text-4xl font-black text-[var(--text)] leading-tight">
                        ¡Ups! Esta tienda no está disponible
                    </h1>
                    <p className="text-[var(--text)]/40 font-bold text-sm leading-relaxed max-w-xs mx-auto">
                        El enlace que seguiste no parece ser correcto o la tienda ha cambiado de dirección.
                    </p>
                </div>

                <div className="w-full flex flex-col gap-3">
                    <button
                        onClick={() => window.location.reload()}
                        className="w-full bg-[var(--primary)] text-[var(--primary-foreground)] py-5 rounded-[2rem] font-black text-lg shadow-xl shadow-[var(--primary)]/20 hover:scale-[1.02] transition-all active:scale-95 flex items-center justify-center gap-2"
                    >
                        Recargar Página
                    </button>

                    <div className="flex flex-col sm:flex-row gap-3">
                        <Link
                            href="/landing"
                            className="flex-1 bg-[var(--secondary)] text-[var(--text)] py-5 rounded-[2rem] font-black text-lg hover:bg-[var(--secondary)]/80 transition-all active:scale-95 flex items-center justify-center"
                        >
                            Ir al Inicio
                        </Link>
                        <Link
                            href="/signup"
                            className="flex-1 bg-[var(--bg)] text-[var(--text)] border border-[var(--border)] py-5 rounded-[2rem] font-black text-lg hover:bg-[var(--secondary)] transition-all active:scale-95 flex items-center justify-center"
                        >
                            Crear mi Tienda
                        </Link>
                    </div>
                </div>

                <p className="text-[10px] text-[var(--text)]/20 font-black uppercase tracking-widest pt-4">
                    Verifica el link e intenta de nuevo
                </p>
            </div>
        </div>
    );
}
