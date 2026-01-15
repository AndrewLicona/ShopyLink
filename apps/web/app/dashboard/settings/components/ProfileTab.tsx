
'use client';

import { useState, useEffect } from 'react';

import Image from 'next/image';
import { User, Mail, Lock, Loader2, ShieldCheck, Camera, Eye, EyeOff, Globe, Save } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface ProfileTabProps {
    fullName: string;
    setFullName: (val: string) => void;
    email: string;
    setEmail: (val: string) => void;
    username: string;
    avatarUrl: string;
    uploading: boolean;
    saving: boolean;
    handleAvatarUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleUpdateProfile: (e: React.FormEvent) => void;
    newPassword: string;
    setNewPassword: (val: string) => void;
    confirmPassword: string;
    setConfirmPassword: (val: string) => void;
    showNewPassword: boolean;
    setShowNewPassword: (val: boolean) => void;
    showConfirmPassword: boolean;
    setShowConfirmPassword: (val: boolean) => void;
    handleChangePassword: (e: React.FormEvent) => void;
}



export function ProfileTab({
    fullName, setFullName,
    email, setEmail,
    username,
    avatarUrl,
    uploading,
    saving,
    handleAvatarUpload,
    handleUpdateProfile,
    newPassword, setNewPassword,
    confirmPassword, setConfirmPassword,
    showNewPassword, setShowNewPassword,
    showConfirmPassword, setShowConfirmPassword,
    handleChangePassword
}: ProfileTabProps) {
    const [strength, setStrength] = useState(0);
    const [requirements, setRequirements] = useState({
        length: false,
        uppercase: false,
        number: false,
        special: false
    });

    useEffect(() => {
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
        checkPassword(newPassword);
    }, [newPassword]);

    return (
        <motion.div key="profile" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-8">
                {/* Personal Info */}
                <section className="bg-[var(--bg)] border border-[var(--border)] rounded-[3rem] p-10 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--primary)]/5 rounded-full -mr-32 -mt-32 blur-3xl pointer-events-none" />

                    <div className="flex items-center gap-4 mb-10">
                        <div className="w-12 h-12 bg-[var(--primary)]/10 text-[var(--primary)] rounded-2xl flex items-center justify-center">
                            <User className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-[var(--text)] tracking-tight">Información Personal</h2>
                            <p className="text-xs font-bold text-[var(--text)]/40 uppercase tracking-widest">Tus datos de acceso y perfil</p>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-10 mb-12 pb-10 border-b border-[var(--border)]">
                        <div className="relative group">
                            <div className="w-32 h-32 rounded-[2.5rem] bg-gradient-to-br from-[var(--primary)] to-[var(--primary)]/80 text-white flex items-center justify-center font-black text-4xl uppercase shadow-2xl relative overflow-hidden ring-8 ring-[var(--surface)] group-hover:scale-105 transition-all">
                                {avatarUrl ? <Image src={avatarUrl} alt="Avatar" width={128} height={128} className="object-cover" /> : fullName?.[0] || 'U'}
                                {uploading && <div className="absolute inset-0 bg-black/40 flex items-center justify-center backdrop-blur-sm"><Loader2 className="w-8 h-8 animate-spin text-white" /></div>}
                            </div>
                            <label className="absolute -bottom-3 -right-3 w-12 h-12 bg-[var(--bg)] border-2 border-[var(--border)] rounded-2xl flex items-center justify-center text-[var(--text)]/60 cursor-pointer hover:bg-[var(--primary)] hover:text-white transition-all shadow-xl group-active:scale-90">
                                <Camera className="w-6 h-6" />
                                <input type="file" className="hidden" accept="image/*" onChange={handleAvatarUpload} disabled={uploading} />
                            </label>
                        </div>
                        <div className="flex flex-col items-center sm:items-start space-y-2">
                            <span className="px-3 py-1 bg-[var(--primary)]/10 text-[var(--primary)] rounded-full text-[10px] font-black uppercase tracking-widest">Cuenta Activa</span>
                            <h3 className="text-2xl font-black text-[var(--text)] tracking-tight">{fullName || 'Configura tu nombre'}</h3>
                            <p className="text-sm font-bold text-[var(--text)]/60">ID: @{username || 'usuario'}</p>
                        </div>
                    </div>

                    <form onSubmit={handleUpdateProfile} className="space-y-8">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                            <div className="space-y-3">
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text)]/40 ml-1">Nombre Completo</label>
                                <input type="text" required className="w-full px-6 py-5 rounded-3xl bg-[var(--surface)] border border-[var(--border)] focus:bg-[var(--bg)] focus:ring-4 focus:ring-[var(--primary)]/5 outline-none text-[var(--text)] font-bold transition-all placeholder:text-[var(--text)]/20" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Ej: Andrew Licona" />
                            </div>
                            <div className="space-y-3">
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text)]/40 ml-1">Correo Electrónico</label>
                                <div className="relative group">
                                    <Mail className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text)]/20 group-focus-within:text-[var(--primary)] transition-colors" />
                                    <input type="email" required className="w-full pl-14 pr-6 py-5 rounded-3xl bg-[var(--surface)] border border-[var(--border)] focus:bg-[var(--bg)] focus:ring-4 focus:ring-[var(--primary)]/5 outline-none text-[var(--text)] font-bold transition-all" value={email} onChange={(e) => setEmail(e.target.value)} />
                                </div>
                            </div>
                        </div>
                        <div className="flex justify-end pt-4">
                            <button type="submit" disabled={saving} className="bg-[var(--primary)] text-white px-10 py-5 rounded-3xl font-black hover:scale-105 active:scale-95 transition-all outline-none shadow-xl shadow-[var(--primary)]/20 flex items-center gap-3 disabled:opacity-50">
                                {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                                <span>Guardar Perfil</span>
                            </button>
                        </div>
                    </form>
                </section>

                {/* Security Section */}
                {/* Security Section */}
                <section className="bg-[var(--bg)] border border-[var(--border)] rounded-[3rem] p-10 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-64 h-64 bg-orange-500/5 rounded-full -ml-32 -mt-32 blur-3xl pointer-events-none" />

                    <div className="flex items-center gap-4 mb-10">
                        <div className="w-12 h-12 bg-orange-500/10 text-orange-500 rounded-2xl flex items-center justify-center">
                            <ShieldCheck className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-[var(--text)] tracking-tight">Seguridad</h2>
                            <p className="text-xs font-bold text-[var(--text)]/40 uppercase tracking-widest">Protege tu acceso a la plataforma</p>
                        </div>
                    </div>

                    <form onSubmit={handleChangePassword} className="space-y-8">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                            <div className="space-y-3">
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text)]/40 ml-1">Nueva Contraseña</label>
                                <div className="relative group">
                                    <Lock className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text)]/20 group-focus-within:text-orange-500 transition-colors" />
                                    <input type={showNewPassword ? "text" : "password"} className="w-full pl-14 pr-16 py-5 rounded-3xl bg-[var(--surface)] border border-[var(--border)] focus:bg-[var(--bg)] focus:ring-4 focus:ring-orange-500/5 outline-none text-[var(--text)] font-bold transition-all placeholder:text-[var(--text)]/20" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Min. 8 caracteres" />
                                    <button type="button" onClick={() => setShowNewPassword(!showNewPassword)} className="absolute right-6 top-1/2 -translate-y-1/2 text-[var(--text)]/20 hover:text-orange-500 transition-colors">
                                        {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>
                            </div>
                            <div className="space-y-3">
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text)]/40 ml-1">Confirmar Nueva Contraseña</label>
                                <div className="relative group">
                                    <Lock className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text)]/20 group-focus-within:text-orange-500 transition-colors" />
                                    <input type={showConfirmPassword ? "text" : "password"} className="w-full pl-14 pr-16 py-5 rounded-3xl bg-[var(--surface)] border border-[var(--border)] focus:bg-[var(--bg)] focus:ring-4 focus:ring-orange-500/5 outline-none text-[var(--text)] font-bold transition-all placeholder:text-[var(--text)]/20" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Repite la contraseña" />
                                    <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-6 top-1/2 -translate-y-1/2 text-[var(--text)]/20 hover:text-orange-500 transition-colors">
                                        {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Password Strength Meter */}
                        {newPassword.length > 0 && (
                            <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-300 col-span-1 sm:col-span-2">
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
                                    <div className={cn("flex items-center gap-1.5 transition-colors", requirements.length ? "text-green-600" : "text-[var(--text)]/40")}>
                                        <div className={cn("w-1 h-1 rounded-full", requirements.length ? "bg-green-600" : "bg-gray-300")} />
                                        8+ Caracteres
                                    </div>
                                    <div className={cn("flex items-center gap-1.5 transition-colors", requirements.uppercase ? "text-green-600" : "text-[var(--text)]/40")}>
                                        <div className={cn("w-1 h-1 rounded-full", requirements.uppercase ? "bg-green-600" : "bg-gray-300")} />
                                        Mayúscula
                                    </div>
                                    <div className={cn("flex items-center gap-1.5 transition-colors", requirements.number ? "text-green-600" : "text-[var(--text)]/40")}>
                                        <div className={cn("w-1 h-1 rounded-full", requirements.number ? "bg-green-600" : "bg-gray-300")} />
                                        Número
                                    </div>
                                    <div className={cn("flex items-center gap-1.5 transition-colors", requirements.special ? "text-green-600" : "text-[var(--text)]/40")}>
                                        <div className={cn("w-1 h-1 rounded-full", requirements.special ? "bg-green-600" : "bg-gray-300")} />
                                        Símbolo (!@#)
                                    </div>
                                </div>
                            </div>
                        )}
                        <div className="flex justify-end pt-4">
                            <button type="submit" disabled={saving || !newPassword || strength < 75 || newPassword !== confirmPassword} className="bg-orange-600 text-white px-10 py-5 rounded-3xl font-black hover:scale-105 active:scale-95 transition-all outline-none shadow-xl shadow-orange-600/20 flex items-center gap-3 disabled:opacity-30 disabled:scale-100 disabled:cursor-not-allowed">
                                {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <ShieldCheck className="w-5 h-5" />}
                                <span>Actualizar Seguridad</span>
                            </button>
                        </div>
                    </form>
                </section>
            </div>

            {/* Sidebar Info Profile */}
            <div className="space-y-6">
                <div className="bg-indigo-600 rounded-[3rem] p-8 text-white shadow-2xl relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />
                    <div className="relative z-10 space-y-6">
                        <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center">
                            <Globe className="w-7 h-7" />
                        </div>
                        <h3 className="text-xl font-black leading-tight tracking-tight">Tu Cuenta es el Motor de Shopy</h3>
                        <p className="text-sm font-bold text-white/70 leading-relaxed">
                            Mantener tus datos actualizados nos ayuda a brindarte una mejor experiencia y seguridad en tus transacciones.
                        </p>
                        <div className="pt-4 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white/40">
                            <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
                            Sincronizado con Supabase
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
