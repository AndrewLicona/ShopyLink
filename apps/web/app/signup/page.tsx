
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase';
import { Mail, Lock, Loader2, User, Eye, EyeOff, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

export default function SignupPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [name, setName] = useState('');
    const [username, setUsername] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showSuccess, setShowSuccess] = useState(false);
    const [strength, setStrength] = useState(0);
    const [requirements, setRequirements] = useState({
        length: false,
        uppercase: false,
        number: false,
        special: false
    });

    const checkPassword = (pass: string) => {
        const reqs = {
            length: pass.length >= 8,
            uppercase: /[A-Z]/.test(pass),
            number: /[0-9]/.test(pass),
            special: /[^A-Za-z0-9]/.test(pass)
        };
        setRequirements(reqs);

        let score = 0;
        if (pass.length > 0) {
            if (reqs.length) score += 25;
            if (reqs.uppercase) score += 25;
            if (reqs.number) score += 25;
            if (reqs.special) score += 25;
        }
        setStrength(score);
    };

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();

        if (strength < 75) {
            setError('Por favor, crea una contraseña más segura (al menos 3 requisitos)');
            return;
        }

        setLoading(true);
        setError(null);

        const supabase = createClient();
        const { error: signUpError } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: name,
                    username: username.toLowerCase().trim()
                },
                emailRedirectTo: `${window.location.origin}/auth/confirm`
            }
        });

        if (signUpError) {
            setError(signUpError.message);
            setLoading(false);
        } else {
            setShowSuccess(true);
            setLoading(false);
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
                    <h2 className="text-3xl font-extrabold text-gray-900">Empezar ahora</h2>
                    <p className="mt-2 text-gray-500">Crea tu cuenta y lanza tu tienda hoy</p>
                </div>

                <form className="mt-8 space-y-4" onSubmit={handleSignup}>
                    {error && (
                        <div className="p-4 bg-red-50 text-red-600 text-sm rounded-xl border border-red-100 italic">
                            {error}
                        </div>
                    )}

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre Completo</label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    type="text"
                                    required
                                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 bg-gray-50/30 focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none text-gray-900 placeholder:text-gray-400"
                                    placeholder="Tu nombre"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                />
                            </div>
                        </div>



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
                                    onChange={(e) => {
                                        setEmail(e.target.value);
                                        setUsername(e.target.value.split('@')[0] || '');
                                    }}
                                />
                                {email && (
                                    <p className="mt-1 text-[10px] text-gray-400 font-bold uppercase tracking-wider ml-1">
                                        Tu nombre de usuario será: <span className="text-blue-500">@{email.split('@')[0]}</span>
                                    </p>
                                )}
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
                                    placeholder="Mínimo 8 caracteres"
                                    value={password}
                                    onChange={(e) => {
                                        setPassword(e.target.value);
                                        checkPassword(e.target.value);
                                    }}
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


                        {/* Password Strength Meter */}
                        {password.length > 0 && (
                            <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
                                <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{
                                            width: `${strength}%`,
                                            backgroundColor: strength <= 25 ? '#ef4444' : strength <= 50 ? '#f59e0b' : strength <= 75 ? '#3b82f6' : '#22c55e'
                                        }}
                                        className="h-full transition-all"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-2 text-[10px] font-bold uppercase tracking-wider">
                                    <div className={cn("flex items-center gap-1.5 transition-colors", requirements.length ? "text-green-600" : "text-gray-400")}>
                                        <div className={cn("w-1 h-1 rounded-full", requirements.length ? "bg-green-600" : "bg-gray-300")} />
                                        8+ Caracteres
                                    </div>
                                    <div className={cn("flex items-center gap-1.5 transition-colors", requirements.uppercase ? "text-green-600" : "text-gray-400")}>
                                        <div className={cn("w-1 h-1 rounded-full", requirements.uppercase ? "bg-green-600" : "bg-gray-300")} />
                                        Mayúscula
                                    </div>
                                    <div className={cn("flex items-center gap-1.5 transition-colors", requirements.number ? "text-green-600" : "text-gray-400")}>
                                        <div className={cn("w-1 h-1 rounded-full", requirements.number ? "bg-green-600" : "bg-gray-300")} />
                                        Número
                                    </div>
                                    <div className={cn("flex items-center gap-1.5 transition-colors", requirements.special ? "text-green-600" : "text-gray-400")}>
                                        <div className={cn("w-1 h-1 rounded-full", requirements.special ? "bg-green-600" : "bg-gray-300")} />
                                        Símbolo (!@#)
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full mt-6 bg-blue-600 text-white py-4 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50 disabled:scale-100"
                    >
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Crear cuenta"}
                    </button>
                </form>

                <p className="text-center text-sm text-gray-500">
                    ¿Ya tienes una cuenta?{" "}
                    <Link href="/login" className="font-bold text-blue-600 hover:text-blue-700">
                        Inicia sesión
                    </Link>
                </p>
            </div >
            {/* Success Modal */}
            <AnimatePresence>
                {
                    showSuccess && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="absolute inset-0 bg-blue-900/40 backdrop-blur-sm"
                                onClick={() => window.location.href = '/login'}
                            />
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                                animate={{ scale: 1, opacity: 1, y: 0 }}
                                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                                className="bg-white w-full max-w-sm rounded-[2.5rem] p-10 shadow-2xl relative border border-white/20 text-center space-y-6"
                            >
                                <div className="w-20 h-20 bg-green-100 text-green-600 rounded-3xl flex items-center justify-center mx-auto shadow-inner">
                                    <CheckCircle2 className="w-10 h-10" />
                                </div>

                                <div className="space-y-2">
                                    <h3 className="text-2xl font-black text-gray-900">¡Casi listo!</h3>
                                    <p className="text-gray-500 font-medium leading-relaxed">
                                        Hemos enviado un enlace de confirmación a <span className="text-blue-600 font-bold">{email}</span>.
                                        Por favor, revísalo para activar tu cuenta.
                                    </p>
                                </div>

                                <button
                                    onClick={() => window.location.href = '/login'}
                                    className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20 active:scale-95"
                                >
                                    Ir al Login
                                </button>

                                <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">
                                    ShopyLink Security • Supabase Auth
                                </p>
                            </motion.div>
                        </div>
                    )
                }
            </AnimatePresence >
        </div >
    );
}
