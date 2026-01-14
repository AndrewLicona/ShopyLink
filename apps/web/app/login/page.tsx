
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase';
import { Mail, Lock, Loader2, Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [resending, setResending] = useState(false);
    const [resendSuccess, setResendSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const getErrorMessage = (message: string) => {
        if (message.includes('Invalid login credentials')) {
            return 'Correo o contraseña incorrectos. Verifica tus datos e intenta de nuevo.';
        }
        if (message.includes('Email not confirmed')) {
            return 'Tu correo electrónico aún no ha sido verificado. Revisa tu bandeja de entrada o solicita un nuevo enlace.';
        }
        if (message.includes('User not found')) {
            return 'No encontramos ninguna cuenta asociada a este correo.';
        }
        return message;
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setResendSuccess(false);

        const supabase = createClient();
        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            setError(getErrorMessage(error.message));
            setLoading(false);
        } else {
            window.location.href = '/dashboard';
        }
    };

    const handleResendLink = async () => {
        setResending(true);
        setError(null);
        try {
            const supabase = createClient();
            const { error } = await supabase.auth.resend({
                type: 'signup',
                email: email,
                options: {
                    emailRedirectTo: `${window.location.origin}/dashboard`
                }
            });

            if (error) throw error;
            setResendSuccess(true);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error al reenviar el correo');
        } finally {
            setResending(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-3xl shadow-xl border border-gray-100">
                <div className="text-center">
                    <Link href="/" className="inline-flex items-center gap-2 mb-6 group">
                        <div className="w-12 h-12 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </div>
                        <span className="text-2xl font-black tracking-tight bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">ShopyLink</span>
                    </Link>
                    <h2 className="text-3xl font-extrabold text-gray-900">Bienvenido de nuevo</h2>
                    <p className="mt-2 text-gray-500">Ingresa a tu cuenta para gestionar tu tienda</p>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleLogin}>
                    <div className="space-y-4">
                        {error && (
                            <div className="p-4 bg-red-50 text-red-600 text-sm rounded-xl border border-red-100 italic space-y-3">
                                <p>{error}</p>
                                {error.includes('verificado') && (
                                    <button
                                        type="button"
                                        onClick={handleResendLink}
                                        disabled={resending}
                                        className="text-xs font-black uppercase tracking-widest bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-all disabled:opacity-50"
                                    >
                                        {resending ? 'Enviando...' : 'Reenviar enlace de confirmación'}
                                    </button>
                                )}
                            </div>
                        )}

                        {resendSuccess && (
                            <div className="p-4 bg-green-50 text-green-600 text-sm rounded-xl border border-green-100 font-bold">
                                Enlace enviado con éxito. Revisa tu correo.
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    type="email"
                                    required
                                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 bg-gray-50/30 focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none text-gray-900 placeholder:text-gray-400"
                                    placeholder="tu@email.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    required
                                    className="w-full pl-10 pr-12 py-3 rounded-xl border border-gray-200 bg-gray-50/30 focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none text-gray-900 placeholder:text-gray-400"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-1"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50 disabled:scale-100"
                    >
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Iniciar Sesión"}
                    </button>
                </form>

                <p className="text-center text-sm text-gray-500">
                    ¿No tienes una cuenta?{" "}
                    <Link href="/signup" className="font-bold text-blue-600 hover:text-blue-700">
                        Regístrate gratis
                    </Link>
                </p>
            </div>
        </div>
    );
}
