'use client';

import { useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase';
import { Mail, Lock, Loader2, Eye, EyeOff, User } from 'lucide-react';
import { api } from '@/lib/api';

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

        let loginEmail = email;

        // Si no tiene @, asumimos que es un nombre de usuario
        if (!email.includes('@')) {
            try {
                const response = await api.resolveUsername(email);
                loginEmail = response.email;
            } catch (err: any) {
                setError('Nombre de usuario no encontrado.');
                setLoading(false);
                return;
            }
        }

        const supabase = createClient();
        const { error } = await supabase.auth.signInWithPassword({
            email: loginEmail,
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
        } catch (err: any) {
            setError(err.message || 'Error al reenviar el enlace.');
        } finally {
            setResending(false);
        }
    };

    return (
        <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px]">
            <div className="w-full max-w-sm space-y-8 bg-white p-8 rounded-3xl shadow-2xl shadow-gray-200/50 border border-gray-100">
                <div className="space-y-2 text-center">
                    <div className="flex items-center justify-center gap-2 mb-6">
                        <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-blue-500/20 ring-4 ring-blue-50">
                            <img src="/favicon.svg" alt="Logo" className="w-8 h-8 brightness-0 invert" />
                        </div>
                        <span className="text-2xl font-black tracking-tighter">Shopy<span className="text-blue-600">Link</span></span>
                    </div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight italic">¡Hola de nuevo!</h1>
                    <p className="text-gray-500 font-medium">Inicia sesión en tu panel de control</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-6">
                    <div className="space-y-4">
                        {error && (
                            <div className="p-4 bg-red-50 text-red-600 text-sm rounded-xl border border-red-100 font-bold flex flex-col gap-3">
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
                            <label className="block text-sm font-medium text-gray-700 mb-1">Correo o Usuario</label>
                            <div className="relative">
                                {email.includes('@') ? (
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                                ) : (
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                                )}
                                <input
                                    type="text"
                                    required
                                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 bg-gray-50/30 focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none text-gray-900 placeholder:text-gray-400"
                                    placeholder="tu@email.com o usuario"
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
                            <div className="flex justify-end mt-2">
                                <Link href="/forgot-password" className="text-xs font-bold text-gray-400 hover:text-blue-600 transition-colors">
                                    ¿Olvidaste tu contraseña?
                                </Link>
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
