'use client';

import { useState } from 'react';
import Image from 'next/image';
import {
    Store as StoreIcon, Camera, Globe, Palette, Instagram, Facebook as FacebookIcon,
    Smartphone, Loader2, Save, Twitter,
    Youtube, Truck, DollarSign
} from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { PhoneInput } from '@/components/atoms/PhoneInput';
import { TabSelector } from '@/components/molecules/TabSelector';
import { DangerZone } from '@/components/molecules/DangerZone';
import { useStoreSettings } from '@/hooks/useStoreSettings';
import { AppearanceSettings } from './components/AppearanceSettings';

interface StoreTabProps {
    hook: ReturnType<typeof useStoreSettings>;
}

export function StoreTab({ hook }: StoreTabProps) {
    const { state, actions } = hook;
    const [innerTab, setInnerTab] = useState<'info' | 'social' | 'appearance'>('info');

    const subTabs = [
        { id: 'info' as const, label: 'TIENDA & BRANDING', icon: StoreIcon },
        { id: 'social' as const, label: 'REDES SOCIALES', icon: Globe, color: 'pink-600' },
        { id: 'appearance' as const, label: 'APARIENCIA', icon: Palette, color: 'yellow-500' }
    ];

    return (
        <motion.div key="store" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="pb-20 space-y-6">
            <TabSelector
                options={subTabs}
                activeTab={innerTab}
                onTabChange={setInnerTab}
            />

            <div className="bg-[var(--surface)] rounded-[2.5rem] shadow-[var(--shadow)] border border-[var(--border)] overflow-hidden">
                <form onSubmit={actions.handleUpdateStore} className="p-8 md:p-12 space-y-10">
                    {/* INFO TAB */}
                    {innerTab === 'info' && (
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 animate-in fade-in slide-in-from-left-4 duration-500">
                            <div className="lg:col-span-12 xl:col-span-7 space-y-8">
                                <h3 className="text-sm font-black uppercase tracking-widest text-blue-600">Información Básica</h3>
                                <div className="grid grid-cols-1 gap-6">
                                    <div>
                                        <label className="text-sm font-bold text-[var(--text)]/60 mb-2 block px-1">Nombre de la tienda</label>
                                        <input
                                            type="text"
                                            className="w-full px-5 py-4 rounded-2xl border-2 border-[var(--border)] focus:border-[var(--primary)] focus:ring-4 focus:ring-[var(--primary)]/10 outline-none transition-all font-bold text-[var(--text)] bg-[var(--bg)]"
                                            value={state.name}
                                            onChange={(e) => actions.setName(e.target.value)}
                                        />
                                    </div>

                                    <div>
                                        <label className="text-sm font-bold text-[var(--text)]/60 mb-2 block px-1">Enlace de tu tienda</label>
                                        <div className="flex items-center w-full px-5 py-4 rounded-2xl border-2 border-[var(--border)] focus-within:border-[var(--primary)] focus-within:ring-4 focus-within:ring-[var(--primary)]/10 bg-[var(--bg)] transition-all overflow-hidden">
                                            <span className="text-[var(--text)]/40 font-bold text-sm whitespace-nowrap shrink-0">shopylink.com/</span>
                                            <input
                                                type="text"
                                                className="flex-1 ml-1 outline-none font-black text-[var(--text)] bg-transparent text-sm min-w-0"
                                                value={state.slug}
                                                onChange={(e) => actions.setSlug(e.target.value)}
                                                disabled={state.autoGenerateSlug}
                                            />
                                        </div>
                                        {state.suggestedSlug && (
                                            <div className="mt-3 p-3 bg-blue-50 border border-blue-100 rounded-xl flex items-center justify-between animate-in fade-in slide-in-from-top-1">
                                                <p className="text-xs font-bold text-blue-700">Sugerencia: <span className="underline">{state.suggestedSlug}</span></p>
                                                <button
                                                    type="button"
                                                    onClick={() => actions.setSuggestedSlug(null)}
                                                    className="text-[10px] font-black bg-blue-600 text-white px-3 py-1.5 rounded-lg uppercase tracking-widest hover:bg-blue-700"
                                                >
                                                    Usar esta
                                                </button>
                                            </div>
                                        )}
                                        <div
                                            onClick={() => actions.setAutoGenerateSlug(!state.autoGenerateSlug)}
                                            className={cn("mt-3 cursor-pointer p-4 rounded-2xl border-2 transition-all", state.autoGenerateSlug ? "border-[var(--primary)] bg-[var(--primary)]/5" : "border-[var(--border)] bg-[var(--surface)]")}
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", state.autoGenerateSlug ? "bg-[var(--primary)] text-white" : "bg-[var(--secondary)] text-[var(--text)]/20")}>
                                                        <Globe className="w-5 h-5" />
                                                    </div>
                                                    <div>
                                                        <p className={cn("font-black text-sm", state.autoGenerateSlug ? "text-[var(--text)]" : "text-[var(--text)]/40")}>Auto-generar enlace</p>
                                                        <p className="text-xs text-[var(--text)]/30 font-bold">{state.autoGenerateSlug ? 'Enlace automático del nombre' : 'Edita manualmente'}</p>
                                                    </div>
                                                </div>
                                                <div className={cn("w-12 h-7 rounded-full flex items-center px-1 transition-all", state.autoGenerateSlug ? "bg-[var(--primary)]" : "bg-[var(--border)]")}>
                                                    <div className={cn("w-5 h-5 rounded-full bg-white shadow-sm transition-all transform", state.autoGenerateSlug ? "translate-x-5" : "translate-x-0")} />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <PhoneInput label="WhatsApp pedidos" value={state.whatsapp} onChange={actions.setWhatsapp} placeholder="300 123 4567" />

                                    <div className="pt-4 border-t border-[var(--border)]">
                                        <div
                                            onClick={() => actions.setDeliveryEnabled(!state.deliveryEnabled)}
                                            className={cn("group cursor-pointer p-6 rounded-3xl border-2 transition-all relative overflow-hidden", state.deliveryEnabled ? "border-[var(--primary)] bg-[var(--primary)]/5 shadow-md shadow-[var(--primary)]/10" : "border-[var(--border)] bg-[var(--surface)]")}
                                        >
                                            <div className="flex items-center justify-between relative z-10">
                                                <div className="flex items-center gap-4">
                                                    <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center transition-all", state.deliveryEnabled ? "bg-[var(--primary)] text-white scale-110 shadow-lg" : "bg-[var(--secondary)] text-[var(--text)]/20")}>
                                                        <Truck className="w-6 h-6" />
                                                    </div>
                                                    <div className="space-y-1">
                                                        <p className={cn("font-black text-base transition-colors", state.deliveryEnabled ? "text-[var(--text)]" : "text-[var(--text)]/40")}>Activar Delivery</p>
                                                        <p className="text-xs text-[var(--text)]/30 font-bold uppercase">Permitir envíos a domicilio</p>
                                                    </div>
                                                </div>
                                                <div className={cn("w-14 h-8 rounded-full transition-all flex items-center px-1", state.deliveryEnabled ? "bg-[var(--primary)]" : "bg-[var(--border)]")}>
                                                    <div className={cn("w-6 h-6 rounded-full bg-white shadow-xl transition-all transform", state.deliveryEnabled ? "translate-x-6 scale-90" : "translate-x-0 scale-75")} />
                                                </div>
                                            </div>
                                        </div>

                                        {state.deliveryEnabled && (
                                            <div className="mt-6 p-6 rounded-3xl bg-[var(--bg)] border-2 border-dashed border-[var(--border)] animate-in fade-in slide-in-from-top-4">
                                                <div className="flex items-center gap-2 mb-3">
                                                    <DollarSign className="w-4 h-4 text-[var(--primary)]" />
                                                    <label className="text-sm font-black text-[var(--text)] uppercase tracking-widest">Costo de Envío</label>
                                                </div>
                                                <input
                                                    type="text"
                                                    className="w-full px-6 py-4 rounded-2xl border-2 border-[var(--border)] focus:border-[var(--primary)] focus:ring-8 focus:ring-[var(--primary)]/5 outline-none transition-all font-black text-lg text-[var(--text)] bg-[var(--surface)]"
                                                    placeholder="Ej: Gratis, Q 10.00"
                                                    value={state.deliveryPrice}
                                                    onChange={(e) => actions.setDeliveryPrice(e.target.value)}
                                                />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Branding */}
                            <div className="lg:col-span-12 xl:col-span-5 space-y-8">
                                <h3 className="text-sm font-black uppercase tracking-widest text-purple-600">Identidad Visual</h3>
                                <div className="p-8 border-2 border-dashed border-[var(--border)] rounded-[2.5rem] bg-[var(--secondary)]/30 flex flex-col items-center justify-center gap-6 relative group/logo">
                                    <div className="w-32 h-32 md:w-40 md:h-40 bg-[var(--surface)] rounded-[2rem] shadow-[var(--shadow)] border border-[var(--border)] flex items-center justify-center overflow-hidden relative">
                                        {state.logoUrl ? (
                                            <Image src={state.logoUrl} alt="Logo" fill className="object-contain" />
                                        ) : (
                                            <StoreIcon className="w-16 h-16 text-[var(--text)]/20" />
                                        )}
                                    </div>
                                    <label className="flex items-center justify-center gap-2 w-full max-w-[200px] py-4 bg-[var(--surface)] border-2 border-[var(--border)] rounded-2xl font-bold text-sm text-[var(--text)]/60 cursor-pointer hover:bg-[var(--secondary)] active:scale-95 transition-all shadow-[var(--shadow)]">
                                        <Camera className="w-4 h-4" />
                                        {state.logoUrl ? 'Cambiar Logo' : 'Subir Logo'}
                                        <input type="file" className="hidden" accept="image/*" onChange={actions.handleLogoUpload} disabled={state.uploading} />
                                    </label>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* SOCIAL TAB */}
                    {innerTab === 'social' && (
                        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                            <h3 className="text-sm font-black uppercase tracking-widest text-pink-600">Redes Sociales</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {[
                                    { icon: Instagram, label: 'Instagram', value: state.instagramUrl, setter: actions.setInstagramUrl, placeholder: 'https://instagram.com/...' },
                                    { icon: FacebookIcon, label: 'Facebook', value: state.facebookUrl, setter: actions.setFacebookUrl, placeholder: 'https://facebook.com/...' },
                                    { icon: Smartphone, label: 'TikTok', value: state.tiktokUrl, setter: actions.setTiktokUrl, placeholder: 'https://tiktok.com/@...' },
                                    { icon: Twitter, label: 'Twitter / X', value: state.twitterUrl, setter: actions.setTwitterUrl, placeholder: 'https://twitter.com/...' },
                                    { icon: Globe, label: 'Pinterest', value: state.pinterestUrl, setter: actions.setPinterestUrl, placeholder: 'https://pinterest.com/...' },
                                    { icon: Youtube, label: 'YouTube', value: state.youtubeUrl, setter: actions.setYoutubeUrl, placeholder: 'https://youtube.com/@...' },
                                ].map((social, i) => (
                                    <div key={i}>
                                        <label className="text-sm font-bold text-[var(--text)]/60 mb-2 block px-1 flex items-center gap-2"><social.icon className="w-4 h-4" /> {social.label}</label>
                                        <input type="url" className="w-full px-5 py-4 rounded-2xl border-2 border-[var(--border)] focus:border-[var(--primary)] focus:ring-4 focus:ring-[var(--primary)]/10 outline-none transition-all font-medium text-[var(--text)] bg-[var(--bg)]" placeholder={social.placeholder} value={social.value} onChange={(e) => social.setter(e.target.value)} />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* APPEARANCE TAB */}
                    {innerTab === 'appearance' && (
                        <div className="max-w-4xl mx-auto space-y-12 animate-in fade-in slide-in-from-right-4 duration-500">
                            <AppearanceSettings
                                theme={state.theme}
                                mode={state.mode}
                                applyToDashboard={state.applyToDashboard}
                                onThemeChange={actions.setTheme}
                                onModeChange={actions.setMode}
                                onApplyToDashboardChange={actions.setApplyToDashboard}
                            />

                            {/* Minimalist Reference Preview (At bottom) */}
                            <div className="pt-12 border-t border-[var(--border)] flex flex-col items-center">
                                <div
                                    className="w-full max-w-[600px] bg-[var(--surface)] rounded-[2.5rem] p-8 shadow-2xl border border-[var(--border)] relative transition-all duration-700"
                                    data-theme={state.theme}
                                    data-mode={state.mode}
                                >
                                    {/* Mockup Header */}
                                    <div className="flex items-center justify-between mb-8 px-2">
                                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text)]/20">Previsualización Rápida</span>
                                        <div className="flex gap-1.5 leading-none">
                                            <div className="w-2.5 h-2.5 rounded-full bg-red-400/50" />
                                            <div className="w-2.5 h-2.5 rounded-full bg-yellow-400/50" />
                                            <div className="w-2.5 h-2.5 rounded-full bg-green-400/50" />
                                        </div>
                                    </div>

                                    {/* Browser Window Mockup */}
                                    <div className="bg-[var(--bg)] rounded-[2rem] border-2 border-[var(--border)] overflow-hidden shadow-sm aspect-[4/3] md:aspect-video flex flex-col transition-colors duration-500">
                                        {/* Browser Nav */}
                                        <div className="h-14 border-b border-[var(--border)] flex items-center justify-between px-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-8 h-8 rounded-lg bg-[var(--primary)] shadow-lg shadow-[var(--primary)]/20 flex items-center justify-center">
                                                    <div className="w-4 h-4 rounded-full bg-white/20" />
                                                </div>
                                                <div className="w-24 h-2.5 rounded-full bg-[var(--text)]/10" />
                                            </div>
                                            <div className="w-8 h-8 rounded-full bg-[var(--surface)] border border-[var(--border)] shadow-sm" />
                                        </div>

                                        {/* Browser Grid */}
                                        <div className="flex-1 p-6 grid grid-cols-2 gap-4">
                                            <div className="rounded-2xl border-2 border-[var(--border)] bg-[var(--surface)] flex flex-col p-3 gap-3 shadow-sm hover:scale-[1.02] transition-transform">
                                                <div className="flex-1 rounded-xl bg-[var(--secondary)] relative overflow-hidden">
                                                    <div className="absolute inset-0 bg-gradient-to-br from-[var(--primary)]/40 to-transparent opacity-30" />
                                                </div>
                                                <div className="space-y-2">
                                                    <div className="h-2 w-full bg-[var(--text)]/10 rounded-full" />
                                                    <div className="h-2 w-2/3 bg-[var(--primary)]/30 rounded-full" />
                                                </div>
                                            </div>
                                            <div className="rounded-2xl border-2 border-[var(--border)] bg-[var(--surface)] flex flex-col p-3 gap-3 shadow-sm hover:scale-[1.02] transition-transform">
                                                <div className="flex-1 rounded-xl bg-[var(--secondary)] relative overflow-hidden">
                                                    <div className="absolute inset-0 bg-gradient-to-br from-[var(--primary)]/40 to-transparent opacity-30" />
                                                </div>
                                                <div className="space-y-2">
                                                    <div className="h-2 w-full bg-[var(--text)]/10 rounded-full" />
                                                    <div className="h-2 w-2/3 bg-[var(--primary)]/30 rounded-full" />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Floating Action Button Mockup */}
                                        <div className="absolute bottom-20 right-12 w-12 h-12 rounded-2xl bg-[var(--primary)] shadow-xl shadow-[var(--primary)]/40 flex items-center justify-center animate-bounce">
                                            <div className="w-5 h-1 bg-white/40 rounded-full" />
                                        </div>
                                    </div>

                                    {/* Bottom Caption */}
                                    <p className="mt-8 text-center text-[9px] font-black uppercase tracking-[0.3em] text-[var(--text)]/20">
                                        Esta es una vista previa de cómo se verá tu catálogo
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="pt-8 border-t border-[var(--border)] flex justify-end">
                        <button
                            type="submit"
                            disabled={state.saving}
                            className="bg-[var(--primary)] text-[var(--bg)] px-10 py-5 rounded-[2rem] font-black text-xl hover:opacity-90 transition-all shadow-lg active:scale-95 flex items-center gap-3 disabled:opacity-50"
                        >
                            {state.saving ? <Loader2 className="w-6 h-6 animate-spin" /> : <><Save className="w-6 h-6" /> Guardar Cambios</>}
                        </button>
                    </div>
                </form>
            </div>

            {innerTab === 'info' && (
                <DangerZone
                    title="Zona de Peligro"
                    description="Acciones irreversibles para tu tienda."
                    actionLabel="Eliminar Tienda"
                    confirmationTitle="¿Estás seguro?"
                    confirmationDescription="Borrará todos los productos, categorías y pedidos permanentemente."
                    itemName={state.name}
                    onDelete={actions.handleDeleteStore}
                />
            )}
        </motion.div>
    );
}
