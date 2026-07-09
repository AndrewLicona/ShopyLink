'use client';

import { useState } from 'react';
import Image from 'next/image';
import {
    Store as StoreIcon, Camera, Globe, Palette, Instagram, Facebook as FacebookIcon,
    Smartphone, Loader2, Save, Twitter,
    Youtube, Truck, DollarSign, ShoppingBag, MapPin, Search, Trash2, Percent, Info
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

const marketplaceCategories = [
    { value: 'Ropa', label: 'Ropa y Moda' },
    { value: 'Comida', label: 'Comida y Restaurantes' },
    { value: 'Tecnología', label: 'Tecnología y Gadgets' },
    { value: 'Hogar', label: 'Hogar y Decoración' },
    { value: 'Salud', label: 'Salud y Belleza' },
    { value: 'Muebles', label: 'Muebles' },
    { value: 'Perfumería', label: 'Perfumería' },
    { value: 'Joyería', label: 'Joyería' },
    { value: 'Personalizados', label: 'Personalizados' },
    { value: 'Sublimación', label: 'Sublimación' },
    { value: 'Deportes', label: 'Deportes' },
    { value: 'Servicios', label: 'Servicios Profesionales' },
    { value: 'Otros', label: 'Otros' },
];

export function StoreTab({ hook }: StoreTabProps) {
    const { state, actions } = hook;
    const [innerTab, setInnerTab] = useState<'info' | 'marketplace' | 'social' | 'appearance' | 'promotions'>('info');
    const [isCategoryOpen, setIsCategoryOpen] = useState(false);

    const subTabs = [
        { id: 'info' as const, label: 'TIENDA & BRANDING', icon: StoreIcon },
        { id: 'marketplace' as const, label: 'MARKETPLACE', icon: ShoppingBag, color: 'blue-500' },
        { id: 'social' as const, label: 'REDES SOCIALES', icon: Globe, color: 'pink-600' },
        { id: 'appearance' as const, label: 'APARIENCIA', icon: Palette, color: 'yellow-500' },
        { id: 'promotions' as const, label: 'PROMOCIONES', icon: Percent, color: 'red-500' }
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
                                            <span className="text-[var(--text)]/40 font-bold text-sm whitespace-nowrap shrink-0">shopylinks.shop/</span>
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
                                    <div className="flex items-center gap-2 w-full max-w-[200px]">
                                        <label className="flex-1 flex items-center justify-center gap-2 py-4 bg-[var(--surface)] border-2 border-[var(--border)] rounded-2xl font-bold text-sm text-[var(--text)]/60 cursor-pointer hover:bg-[var(--secondary)] active:scale-95 transition-all shadow-[var(--shadow)]">
                                            <Camera className="w-4 h-4" />
                                            {state.logoUrl ? 'Cambiar' : 'Subir Logo'}
                                            <input type="file" className="hidden" accept="image/*" onChange={actions.handleLogoUpload} disabled={state.uploading} />
                                        </label>
                                        {state.logoUrl && (
                                            <button
                                                type="button"
                                                onClick={() => actions.setLogoUrl('')}
                                                className="w-14 h-14 bg-red-500 text-white rounded-2xl flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-all flex-shrink-0"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* MARKETPLACE TAB */}
                    {innerTab === 'marketplace' && (
                        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                            <h3 className="text-sm font-black uppercase tracking-widest text-blue-600">Marketplace Público</h3>
                            <div className="grid grid-cols-1 gap-6">
                                <div
                                    onClick={() => actions.setIsPublic(!state.isPublic)}
                                    className={cn("group cursor-pointer p-6 rounded-3xl border-2 transition-all relative overflow-hidden", state.isPublic ? "border-[var(--primary)] bg-[var(--primary)]/5 shadow-md shadow-[var(--primary)]/10" : "border-[var(--border)] bg-[var(--surface)]")}
                                >
                                    <div className="flex items-center justify-between relative z-10">
                                        <div className="flex items-center gap-4">
                                            <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center transition-all", state.isPublic ? "bg-[var(--primary)] text-white scale-110 shadow-lg" : "bg-[var(--secondary)] text-[var(--text)]/20")}>
                                                <Globe className="w-6 h-6" />
                                            </div>
                                            <div className="space-y-1">
                                                <p className={cn("font-black text-base transition-colors", state.isPublic ? "text-[var(--text)]" : "text-[var(--text)]/40")}>Visibilidad en Marketplace</p>
                                                <p className="text-xs text-[var(--text)]/30 font-bold uppercase">Aparecer en el directorio público</p>
                                            </div>
                                        </div>
                                        <div className={cn("w-14 h-8 rounded-full transition-all flex items-center px-1", state.isPublic ? "bg-[var(--primary)]" : "bg-[var(--border)]")}>
                                            <div className={cn("w-6 h-6 rounded-full bg-white shadow-xl transition-all transform", state.isPublic ? "translate-x-6 scale-90" : "translate-x-0 scale-75")} />
                                        </div>
                                    </div>
                                </div>

                                {state.isPublic && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 p-6 rounded-3xl bg-[var(--bg)] border-2 border-dashed border-[var(--border)] animate-in fade-in slide-in-from-top-4">
                                        <div>
                                            <label className="text-sm font-bold text-[var(--text)]/60 mb-2 block px-1 flex items-center gap-2">
                                                Categoría principal
                                            </label>
                                            <div className="relative">
                                                <button
                                                    type="button"
                                                    onClick={() => setIsCategoryOpen(!isCategoryOpen)}
                                                    className="w-full px-5 py-4 rounded-2xl border-2 border-[var(--border)] focus:border-[var(--primary)] focus:ring-4 focus:ring-[var(--primary)]/10 outline-none transition-all font-bold text-[var(--text)] bg-[var(--surface)] text-left flex justify-between items-center"
                                                >
                                                    <span>
                                                        {marketplaceCategories.find(c => c.value === state.marketplaceCategory)?.label || 'Selecciona una categoría'}
                                                    </span>
                                                    <svg className={`w-5 h-5 text-[var(--text)]/40 transition-transform ${isCategoryOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                                </button>

                                                {isCategoryOpen && (
                                                    <>
                                                        <div 
                                                            className="fixed inset-0 z-40" 
                                                            onClick={() => setIsCategoryOpen(false)}
                                                        />
                                                        <motion.div 
                                                            initial={{ opacity: 0, y: -10 }}
                                                            animate={{ opacity: 1, y: 0 }}
                                                            exit={{ opacity: 0, y: -10 }}
                                                            className="absolute top-full left-0 right-0 mt-2 z-50 bg-[var(--surface)] border-2 border-[var(--border)] rounded-2xl shadow-xl shadow-[var(--primary)]/10 overflow-hidden"
                                                        >
                                                            <div className="max-h-60 overflow-y-auto hide-scrollbar py-2">
                                                                <button
                                                                    type="button"
                                                                    onClick={() => {
                                                                        actions.setMarketplaceCategory('');
                                                                        setIsCategoryOpen(false);
                                                                    }}
                                                                    className={`w-full px-5 py-3 text-left hover:bg-[var(--primary)]/5 transition-colors font-bold ${!state.marketplaceCategory ? 'text-[var(--primary)] bg-[var(--primary)]/5' : 'text-[var(--text)]/70'}`}
                                                                >
                                                                    Quitar categoría
                                                                </button>
                                                                {marketplaceCategories.map((category) => (
                                                                    <button
                                                                        key={category.value}
                                                                        type="button"
                                                                        onClick={() => {
                                                                            actions.setMarketplaceCategory(category.value);
                                                                            setIsCategoryOpen(false);
                                                                        }}
                                                                        className={`w-full px-5 py-3 text-left hover:bg-[var(--primary)]/5 transition-colors font-bold ${state.marketplaceCategory === category.value ? 'text-[var(--primary)] bg-[var(--primary)]/5' : 'text-[var(--text)]'}`}
                                                                    >
                                                                        {category.label}
                                                                    </button>
                                                                ))}
                                                            </div>
                                                        </motion.div>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-sm font-bold text-[var(--text)]/60 mb-2 block px-1 flex items-center gap-2">
                                                <MapPin className="w-4 h-4" /> Ciudad
                                            </label>
                                            <input
                                                type="text"
                                                className="w-full px-5 py-4 rounded-2xl border-2 border-[var(--border)] focus:border-[var(--primary)] focus:ring-4 focus:ring-[var(--primary)]/10 outline-none transition-all font-bold text-[var(--text)] bg-[var(--surface)]"
                                                placeholder="Ej: CDMX, Bogotá, Madrid..."
                                                value={state.city}
                                                onChange={(e) => actions.setCity(e.target.value)}
                                            />
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="text-sm font-bold text-[var(--text)]/60 mb-2 block px-1 flex items-center gap-2">
                                                <Search className="w-4 h-4" /> Tags de Búsqueda (separados por coma)
                                            </label>
                                            <input
                                                type="text"
                                                className="w-full px-5 py-4 rounded-2xl border-2 border-[var(--border)] focus:border-[var(--primary)] focus:ring-4 focus:ring-[var(--primary)]/10 outline-none transition-all font-bold text-[var(--text)] bg-[var(--surface)]"
                                                placeholder="Ej: vegano, zapatos, envíos rápidos..."
                                                value={state.tags.join(', ')}
                                                onChange={(e) => actions.setTags(e.target.value.split(',').map(t => t.trim()).filter(Boolean))}
                                            />
                                        </div>
                                    </div>
                                )}
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
                    
                    {/* PROMOTIONS TAB */}
                    {innerTab === 'promotions' && (
                        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                            <h3 className="text-sm font-black uppercase tracking-widest text-red-500">Descuentos y Promociones</h3>
                            <div className="bg-[var(--bg)] rounded-3xl p-6 border-2 border-[var(--border)] space-y-6">
                                <div className="flex items-center justify-between">
                                    <div className="space-y-1">
                                        <h4 className="font-black text-sm text-[var(--text)]">Descuento Global en toda la Tienda</h4>
                                        <p className="text-xs text-[var(--text)]/60">Aplica un porcentaje de descuento masivo a todos los productos del catálogo.</p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => actions.setGlobalDiscountActive(!state.globalDiscountActive)}
                                        className={cn(
                                            "relative w-12 h-6.5 rounded-full border border-black/5 shadow-inner transition-colors",
                                            state.globalDiscountActive ? "bg-[var(--primary)]" : "bg-[var(--border)]"
                                        )}
                                    >
                                        <div className={cn("absolute top-0.75 left-0.75 w-5 h-5 bg-white rounded-full transition-transform shadow-md", state.globalDiscountActive ? "translate-x-5.5" : "translate-x-0")} />
                                    </button>
                                </div>

                                {state.globalDiscountActive && (
                                    <div className="space-y-4 pt-4 border-t border-[var(--border)] animate-in fade-in slide-in-from-top-2 duration-300">
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-[var(--text)]/60 block">Porcentaje de Descuento (%)</label>
                                            <div className="relative max-w-[200px]">
                                                <input
                                                    type="number"
                                                    min="1"
                                                    max="99"
                                                    required
                                                    value={state.globalDiscountPercentage || ''}
                                                    onChange={(e) => {
                                                        const val = parseInt(e.target.value) || 0;
                                                        actions.setGlobalDiscountPercentage(Math.min(99, Math.max(0, val)));
                                                    }}
                                                    className="w-full pl-5 pr-10 py-3.5 rounded-2xl border-2 border-[var(--border)] focus:border-[var(--primary)] outline-none font-bold text-[var(--text)] bg-[var(--bg)]"
                                                    placeholder="Ej: 15"
                                                />
                                                <span className="absolute right-4 top-1/2 -translate-y-1/2 font-black text-sm text-[var(--text)]/40">%</span>
                                            </div>
                                        </div>

                                        <div className="p-4 rounded-2xl bg-blue-500/5 border border-blue-500/10 text-blue-600 flex items-start gap-3">
                                            <Info className="w-5 h-5 shrink-0 mt-0.5" />
                                            <div className="space-y-1">
                                                <h5 className="text-xs font-black uppercase tracking-wider">Regla de Aplicación ("El descuento mayor manda")</h5>
                                                <p className="text-[10px] font-bold leading-relaxed text-blue-600/70">
                                                    Si un producto ya cuenta con una oferta individual configurada (ej. 30% OFF) y el descuento global de la tienda es menor (ej. 15% OFF), se mantendrá el 30% OFF porque beneficia más al comprador. Si el descuento global es mayor, se aplicará el descuento global para garantizar la mejor oferta al cliente.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}
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
