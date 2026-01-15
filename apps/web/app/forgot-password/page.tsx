'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Mail, ArrowLeft, Loader2, CheckCircle2 } from 'lucide-react';
import { createClient } from '@/lib/supabase';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleReset = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const supabase = createClient();
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/auth/confirm?type=recovery`,
        });

        if (error) {
            setError('No pudimos enviar el enlace. Verifica tu correo.');
            setLoading(false);
        } else {
            setSent(true);
        }
    };

    if (sent) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center p-6">
                <div className="w-full max-w-sm text-center space-y-6">
                    <div className="w-20 h-20 bg-green-50 text-green-600 rounded-[2rem] flex items-center justify-center mx-auto shadow-inner">
                        <CheckCircle2 size={40} />
                    </div>
                    <div className="space-y-2">
                        <h1 className="text-2xl font-black text-gray-900">Correo enviado</h1>
                        <p className="text-gray-500 font-medium">
                            Hemos enviado un enlace de recuperación a <strong>{email}</strong>. Revisa tu bandeja de entrada.
                        </p>
                    </div>
                    <Link
                        href="/login"
                        className="inline-flex items-center gap-2 text-blue-600 font-bold hover:text-blue-700 transition-colors"
                    >
                        <ArrowLeft size={20} />
                        Volver al inicio de sesión
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6">
            <div className="w-full max-w-sm space-y-8">
                <div className="space-y-2 text-center md:text-left">
                    <Link href="/login" className="inline-flex items-center gap-2 text-gray-400 hover:text-blue-600 transition-colors mb-4 group">
                        <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                        <span className="text-sm font-bold">Volver</span>
                    </Link>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight">Recuperar contraseña</h1>
                    <p className="text-gray-500 font-medium">
                        Ingresa tu correo y te enviaremos un enlace para restablecer tu contraseña.
                    </p>
                </div>

                <form onSubmit={handleReset} className="space-y-6">
                    {error && (
                        <div className="p-4 bg-red-50 text-red-600 text-sm rounded-xl border border-red-100 font-bold">
                            {error}
                        </div>
                    )}

                    <div className="space-y-2">
                        <label className="text-xs font-black uppercase tracking-widest text-gray-400 px-1">Email</label>
                        <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="email"
                                required
                                className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-gray-100 focus:border-blue-600 outline-none transition-all font-bold text-gray-900 placeholder:text-gray-300 bg-gray-50/50 focus:bg-white"
                                placeholder="tu@email.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black text-lg hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/20 active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : "Enviar enlace"}
                    </button>
                </form>
            </div>
        </div>
    );
}
