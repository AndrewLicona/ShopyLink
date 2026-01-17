'use client';

import { Camera, Loader2, Save, User as UserIcon, Lock, Eye, EyeOff } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { useProfileSettings } from '@/hooks/useProfileSettings';

interface ProfileTabProps {
    hook: ReturnType<typeof useProfileSettings>;
}

export function ProfileTab({ hook }: ProfileTabProps) {
    const { state, actions } = hook;

    return (
        <motion.div key="profile" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-8 pb-20">
            <div className="bg-[var(--surface)] rounded-[2.5rem] shadow-[var(--shadow)] border border-[var(--border)] overflow-hidden">
                <form onSubmit={actions.handleUpdateProfile} className="p-8 md:p-12 space-y-12">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                        {/* Avatar Column */}
                        <div className="lg:col-span-4 flex flex-col items-center gap-6">
                            <div className="relative group/avatar cursor-pointer">
                                <div className="w-40 h-40 md:w-52 md:h-52 bg-[var(--bg)] rounded-[3.5rem] shadow-[var(--shadow)] border-4 border-[var(--border)] overflow-hidden flex items-center justify-center transition-all group-hover/avatar:border-[var(--primary)]/40">
                                    {state.avatarUrl ? (
                                        <Image src={state.avatarUrl} alt="Avatar" fill className="object-cover" />
                                    ) : (
                                        <UserIcon className="w-20 h-20 text-[var(--text)]/10" />
                                    )}
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/avatar:opacity-100 transition-opacity flex items-center justify-center">
                                        <Camera className="w-10 h-10 text-white" />
                                    </div>
                                </div>
                                <label className="absolute -bottom-2 -right-2 w-14 h-14 bg-[var(--primary)] text-white rounded-2xl shadow-[var(--shadow-strong)] flex items-center justify-center cursor-pointer hover:scale-110 active:scale-90 transition-all border-4 border-[var(--surface)]">
                                    <Camera className="w-6 h-6" />
                                    <input type="file" className="hidden" accept="image/*" onChange={actions.handleAvatarUpload} disabled={state.uploading} />
                                </label>
                            </div>
                            <div className="text-center space-y-1">
                                <p className="font-black text-xl text-[var(--text)]">@{state.username}</p>
                                <p className="text-xs text-[var(--text)]/40 font-bold uppercase tracking-widest italic">Usuario Verificado</p>
                            </div>
                        </div>

                        {/* Basic Info Column */}
                        <div className="lg:col-span-8 space-y-8">
                            <h3 className="text-sm font-black uppercase tracking-[0.2em] text-[var(--primary)] px-1 flex items-center gap-2">
                                <UserIcon className="w-4 h-4" /> Información de Cuenta
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase tracking-widest text-[var(--text)]/40 px-1">Nombre Completo</label>
                                    <input
                                        type="text"
                                        className="w-full px-6 py-4 rounded-2xl border-2 border-[var(--border)] focus:border-[var(--primary)] outline-none transition-all font-bold text-[var(--text)] bg-[var(--bg)]"
                                        value={state.fullName}
                                        onChange={(e) => actions.setFullName(e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2 opacity-60">
                                    <label className="text-xs font-black uppercase tracking-widest text-[var(--text)]/40 px-1">Nombre de Usuario (No editable)</label>
                                    <div className="w-full px-6 py-4 rounded-2xl border-2 border-[var(--border)] font-bold text-[var(--text)]/60 bg-[var(--bg)] bg-opacity-50">
                                        {state.username}
                                    </div>
                                </div>
                                <div className="space-y-2 md:col-span-2">
                                    <label className="text-xs font-black uppercase tracking-widest text-[var(--text)]/40 px-1">Correo Electrónico</label>
                                    <input
                                        type="email"
                                        className="w-full px-6 py-4 rounded-2xl border-2 border-[var(--border)] focus:border-[var(--primary)] outline-none transition-all font-bold text-[var(--text)] bg-[var(--bg)]"
                                        value={state.email}
                                        onChange={(e) => actions.setEmail(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="flex justify-end pt-4">
                                <button type="submit" disabled={state.saving} className="bg-[var(--primary)] text-[var(--bg)] px-8 py-4 rounded-2xl font-black text-sm hover:opacity-90 active:scale-95 disabled:opacity-50 transition-all flex items-center gap-2 shadow-lg shadow-[var(--primary)]/20">
                                    {state.saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Save className="w-4 h-4" /> Guardar Perfil</>}
                                </button>
                            </div>
                        </div>
                    </div>
                </form>
            </div>

            {/* Password Section */}
            <div className="bg-[var(--surface)] rounded-[2.5rem] shadow-[var(--shadow)] border border-[var(--border)] overflow-hidden">
                <form onSubmit={actions.handleChangePassword} className="p-8 md:p-12 space-y-8">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="space-y-1">
                            <h3 className="text-xl font-black text-[var(--text)] uppercase tracking-tighter italic flex items-center gap-2">
                                <Lock className="w-5 h-5 text-red-500" /> Seguridad
                            </h3>
                            <p className="text-sm text-[var(--text)]/40 font-medium">Actualiza tu contraseña para mantener tu cuenta segura.</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2 relative">
                            <label className="text-xs font-black uppercase tracking-widest text-[var(--text)]/40 px-1">Nueva Contraseña</label>
                            <div className="relative">
                                <input
                                    type={state.showNewPassword ? "text" : "password"}
                                    className={cn(
                                        "w-full pl-6 pr-14 py-4 rounded-2xl border-2 outline-none transition-all font-bold text-[var(--text)] bg-[var(--bg)]",
                                        state.newPassword && state.newPassword.length < 8 ? "border-red-500/50" : "border-[var(--border)] focus:border-[var(--primary)]"
                                    )}
                                    value={state.newPassword}
                                    onChange={(e) => actions.setNewPassword(e.target.value)}
                                />
                                <button type="button" onClick={() => actions.setShowNewPassword(!state.showNewPassword)} className="absolute right-5 top-1/2 -translate-y-1/2 text-[var(--text)]/20 hover:text-[var(--text)]/40 transition-colors">
                                    {state.showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>
                        <div className="space-y-2 relative">
                            <label className="text-xs font-black uppercase tracking-widest text-[var(--text)]/40 px-1">Confirmar Contraseña</label>
                            <div className="relative">
                                <input
                                    type={state.showConfirmPassword ? "text" : "password"}
                                    className={cn(
                                        "w-full pl-6 pr-14 py-4 rounded-2xl border-2 outline-none transition-all font-bold text-[var(--text)] bg-[var(--bg)]",
                                        state.confirmPassword && state.newPassword !== state.confirmPassword ? "border-red-500/50" : "border-[var(--border)] focus:border-[var(--primary)]"
                                    )}
                                    value={state.confirmPassword}
                                    onChange={(e) => actions.setConfirmPassword(e.target.value)}
                                />
                                <button type="button" onClick={() => actions.setShowConfirmPassword(!state.showConfirmPassword)} className="absolute right-5 top-1/2 -translate-y-1/2 text-[var(--text)]/20 hover:text-[var(--text)]/40 transition-colors">
                                    {state.showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Password Strength and Requirements */}
                    {state.newPassword && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                            {/* Strength Meter */}
                            <div className="space-y-1.5">
                                <div className="flex justify-between items-center px-1">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-[var(--text)]/40">Seguridad</span>
                                    <span className={cn(
                                        "text-[10px] font-black uppercase tracking-widest",
                                        (() => {
                                            const pass = state.newPassword;
                                            const score = [
                                                pass.length >= 8,
                                                /[A-Z]/.test(pass),
                                                /[0-9]/.test(pass),
                                                /[^A-Za-z0-9]/.test(pass)
                                            ].filter(Boolean).length;
                                            if (score <= 1) return "text-red-500";
                                            if (score === 2) return "text-amber-500";
                                            if (score === 3) return "text-blue-500";
                                            return "text-green-500";
                                        })()
                                    )}>
                                        {(() => {
                                            const pass = state.newPassword;
                                            const score = [
                                                pass.length >= 8,
                                                /[A-Z]/.test(pass),
                                                /[0-9]/.test(pass),
                                                /[^A-Za-z0-9]/.test(pass)
                                            ].filter(Boolean).length;
                                            if (score <= 1) return "Débil";
                                            if (score === 2) return "Media";
                                            if (score === 3) return "Segura";
                                            return "Muy Segura";
                                        })()}
                                    </span>
                                </div>
                                <div className="h-1.5 w-full bg-[var(--border)] rounded-full overflow-hidden">
                                    <div
                                        className="h-full transition-all duration-500"
                                        style={{
                                            width: `${([
                                                state.newPassword.length >= 8,
                                                /[A-Z]/.test(state.newPassword),
                                                /[0-9]/.test(state.newPassword),
                                                /[^A-Za-z0-9]/.test(state.newPassword)
                                            ].filter(Boolean).length) * 25}%`,
                                            backgroundColor: (() => {
                                                const score = [
                                                    state.newPassword.length >= 8,
                                                    /[A-Z]/.test(state.newPassword),
                                                    /[0-9]/.test(state.newPassword),
                                                    /[^A-Za-z0-9]/.test(state.newPassword)
                                                ].filter(Boolean).length;
                                                if (score <= 1) return '#ef4444';
                                                if (score === 2) return '#f59e0b';
                                                if (score === 3) return '#3b82f6';
                                                return '#22c55e';
                                            })()
                                        }}
                                    />
                                </div>
                            </div>

                            {/* Requirements Grid */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 px-1">
                                {[
                                    { label: '8+ Caracteres', check: state.newPassword.length >= 8 },
                                    { label: 'Mayúscula', check: /[A-Z]/.test(state.newPassword) },
                                    { label: 'Número', check: /[0-9]/.test(state.newPassword) },
                                    { label: 'Símbolo (!@#)', check: /[^A-Za-z0-9]/.test(state.newPassword) },
                                ].map((req, i) => (
                                    <div key={i} className="flex items-center gap-2">
                                        <div className={cn(
                                            "w-4 h-4 rounded-full flex items-center justify-center border-2 transition-all shrink-0",
                                            req.check ? "bg-green-500 border-green-500 text-white" : "border-[var(--border)] bg-transparent"
                                        )}>
                                            {req.check && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                                        </div>
                                        <span className={cn(
                                            "text-[9px] font-black uppercase tracking-widest transition-colors",
                                            req.check ? "text-green-500" : "text-[var(--text)]/30"
                                        )}>
                                            {req.label}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            {/* Match Check */}
                            <div className="pt-2 border-t border-[var(--border)] mt-2">
                                <div className="flex items-center gap-2">
                                    <div className={cn(
                                        "w-4 h-4 rounded-full flex items-center justify-center border-2 transition-all",
                                        state.confirmPassword && state.newPassword === state.confirmPassword ? "bg-green-500 border-green-500 text-white" : "border-[var(--border)] bg-transparent"
                                    )}>
                                        {state.confirmPassword && state.newPassword === state.confirmPassword && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                                    </div>
                                    <span className={cn(
                                        "text-[9px] font-black uppercase tracking-widest transition-colors",
                                        state.confirmPassword && state.newPassword === state.confirmPassword ? "text-green-500" : "text-[var(--text)]/30"
                                    )}>
                                        Las contraseñas coinciden
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="flex justify-end pt-4">
                        <button
                            type="submit"
                            disabled={
                                state.saving ||
                                !state.newPassword ||
                                state.newPassword !== state.confirmPassword ||
                                [
                                    state.newPassword.length >= 8,
                                    /[A-Z]/.test(state.newPassword),
                                    /[0-9]/.test(state.newPassword),
                                    /[^A-Za-z0-9]/.test(state.newPassword)
                                ].filter(Boolean).length < 3
                            }
                            className="bg-red-500 text-white px-8 py-4 rounded-2xl font-black text-sm hover:opacity-90 active:scale-95 disabled:opacity-30 transition-all flex items-center gap-2 shadow-lg shadow-red-500/20"
                        >
                            {state.saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Lock className="w-4 h-4" /> Cambiar Contraseña</>}
                        </button>
                    </div>
                </form>
            </div>
        </motion.div>
    );
}
