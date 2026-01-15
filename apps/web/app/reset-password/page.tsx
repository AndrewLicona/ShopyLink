'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, Loader2, CheckCircle2, Eye, EyeOff } from 'lucide-react';
import { createClient } from '@/lib/supabase';

export default function ResetPasswordPage() {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const handleReset = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setError('Las contraseñas no coinciden.');
            return;
        }

        setLoading(true);
        setError(null);

        const supabase = createClient();
        const { error } = await supabase.auth.updateUser({
            password: password
        });

        if (error) {
            setError('Error al actualizar la contraseña. El enlace puede haber expirado.');
            setLoading(false);
        } else {
            setSuccess(true);
            setTimeout(() => {
                router.push('/login');
            }, 3000);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center p-6">
                <div className="w-full max-w-sm text-center space-y-6">
                    <div className="w-20 h-20 bg-green-50 text-green-600 rounded-[2rem] flex items-center justify-center mx-auto shadow-inner">
                        <CheckCircle2 size={40} />
                    </div>
                    <div className="space-y-2">
                        <h1 className="text-2xl font-black text-gray-900">¡Contraseña actualizada!</h1>
                        <p className="text-gray-500 font-medium">
                            Tu contraseña ha sido cambiada con éxito. Redirigiendo al inicio de sesión...
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6">
            <div className="w-full max-w-sm space-y-8">
                <div className="space-y-2 text-center md:text-left">
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight">Nueva contraseña</h1>
                    <p className="text-gray-500 font-medium">
                        Ingresa tu nueva contraseña para recuperar el acceso a tu cuenta.
                    </p>
                </div>

                <form onSubmit={handleReset} className="space-y-6">
                    {error && (
                        <div className="p-4 bg-red-50 text-red-600 text-sm rounded-xl border border-red-100 font-bold">
                            {error}
                        </div>
                    )}

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-xs font-black uppercase tracking-widest text-gray-400 px-1">Nueva Contraseña</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    required
                                    className="w-full pl-12 pr-12 py-4 rounded-2xl border-2 border-gray-100 focus:border-blue-600 outline-none transition-all font-bold text-gray-900 placeholder:text-gray-300 bg-gray-50/50 focus:bg-white"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-black uppercase tracking-widest text-gray-400 px-1">Confirmar Contraseña</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    required
                                    className="w-full pl-12 pr-12 py-4 rounded-2xl border-2 border-gray-100 focus:border-blue-600 outline-none transition-all font-bold text-gray-900 placeholder:text-gray-300 bg-gray-50/50 focus:bg-white"
                                    placeholder="••••••••"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black text-lg hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/20 active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : "Actualizar contraseña"}
                    </button>
                </form>
            </div>
        </div>
    );
}
