'use client';

import { useState } from 'react';

import Image from 'next/image';
import {
    Store as StoreIcon, Camera, Globe, Palette, Instagram, Facebook as FacebookIcon,
    Smartphone, Loader2, Save, Twitter,
    Youtube, Truck, DollarSign, ShoppingBag, MapPin, Search, Trash2, Percent, Info
} from 'lucide-react';
import { motion } from 'framer-motion';
import { cn, COUNTRY_OPTIONS, getCurrencyForCountry } from '@/lib/utils';
import { StyledSelect } from '@/components/ui/StyledSelect';
import { PhoneInput } from '@/components/atoms/PhoneInput';
import { ToggleCard } from '@/components/molecules/ToggleCard';
import { DangerZone } from '@/components/molecules/DangerZone';
import { ImageCropperModal } from '@/components/molecules/ImageCropperModal';
import { useStoreSettings } from '@/hooks/useStoreSettings';
import { AppearanceSettings } from './components/AppearanceSettings';
import { BusinessHoursEditor } from './components/BusinessHoursEditor';

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
    // La moneda se deriva del país elegido por el dueño de la tienda.
    const currencyLabel = getCurrencyForCountry(state.country).code;

    const subTabs = [
        { id: 'info' as const, label: 'Datos de tienda', icon: StoreIcon },
        { id: 'marketplace' as const, label: 'Marketplace', icon: ShoppingBag, color: 'blue-500' },
        { id: 'social' as const, label: 'Redes sociales', icon: Globe, color: 'pink-600' },
        { id: 'appearance' as const, label: 'Apariencia', icon: Palette, color: 'yellow-500' },
        { id: 'promotions' as const, label: 'Promociones', icon: Percent, color: 'red-500' }
    ];

    return (
        <motion.div key="store" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="pb-20 space-y-6">
            {/* Logo crop modal */}
            {state.cropImageSrc && (
                <ImageCropperModal
                    imageSrc={state.cropImageSrc}
                    onCropComplete={actions.handleLogoCropDone}
                    onClose={actions.handleLogoCropClose}
                    aspectRatio={1}
                />
            )}
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 sm:p-5">
                <div className="flex flex-wrap items-center justify-between gap-3"><div className="min-w-0"><p className="text-xs font-bold uppercase tracking-widest text-[var(--primary)]">Configuración de tienda</p><h2 className="mt-1 truncate text-lg font-black text-[var(--text)]">{state.savedStoreName || 'Mi tienda'}</h2><p className="mt-1 text-xs text-[var(--text)]/50">Los cambios se aplican a la tienda seleccionada.</p></div><a href={`/${state.savedSlug}`} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-[var(--border)] px-3 text-xs font-bold text-[var(--primary)] hover:bg-[var(--secondary)]"><Globe className="h-4 w-4" /> Ver tienda</a></div>
            </div>
            <nav aria-label="Secciones de mi tienda" className="grid grid-cols-2 gap-1 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-1 sm:grid-cols-3 lg:grid-cols-5">
                {subTabs.map(tab => <button key={tab.id} type="button" onClick={() => setInnerTab(tab.id)} aria-pressed={innerTab === tab.id} className={cn('flex min-h-11 min-w-0 items-center justify-center gap-2 rounded-xl px-2 py-2 text-xs font-bold transition-colors', innerTab === tab.id ? 'bg-[var(--primary)] text-[var(--bg)]' : 'text-[var(--text)]/55 hover:bg-[var(--secondary)]')}><tab.icon className="h-4 w-4 shrink-0" /><span>{tab.label}</span></button>)}
            </nav>

            <div className="bg-[var(--surface)] rounded-3xl shadow-[var(--shadow)] border border-[var(--border)] overflow-hidden">
                <form onSubmit={actions.handleUpdateStore} className="p-4 sm:p-6 lg:p-8 space-y-8">
                    {/* INFO TAB */}
                    {innerTab === 'info' && (
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-7 lg:gap-10 animate-in fade-in slide-in-from-left-4 duration-500">
                            <div className="lg:col-span-12 xl:col-span-7 space-y-6">
                                <div><h3 className="text-lg font-black text-[var(--text)]">Información de tu tienda</h3><p className="mt-1 text-sm text-[var(--text)]/50">Datos que tus clientes usan para conocerte y contactarte.</p></div>
                                <div className="grid grid-cols-1 gap-6">
                                    <div>
                                        <label htmlFor="store-name" className="text-sm font-bold text-[var(--text)]/60 mb-2 block px-1">Nombre de la tienda</label>
                                        <input
                                            id="store-name"
                                            type="text"
                                            required
                                            className="w-full px-5 py-4 rounded-2xl border-2 border-[var(--border)] focus:border-[var(--primary)] focus:ring-4 focus:ring-[var(--primary)]/10 outline-none transition-all font-bold text-[var(--text)] bg-[var(--bg)]"
                                            value={state.name}
                                            onChange={(e) => actions.setName(e.target.value)}
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="store-description" className="text-sm font-bold text-[var(--text)]/60 mb-2 block px-1">Descripción <span className="font-normal">(opcional)</span></label>
                                        <textarea id="store-description" rows={3} className="w-full resize-y rounded-2xl border-2 border-[var(--border)] bg-[var(--bg)] px-5 py-4 text-sm font-medium text-[var(--text)] outline-none focus:border-[var(--primary)]" placeholder="Cuéntales a tus clientes qué hace especial a tu tienda." value={state.description} onChange={e => actions.setDescription(e.target.value)} />
                                    </div>
                                    <div>
                                        <label htmlFor="store-slug" className="text-sm font-bold text-[var(--text)]/60 mb-2 block px-1">Enlace de tu tienda</label>
                                        <div className="flex items-center w-full px-5 py-4 rounded-2xl border-2 border-[var(--border)] focus-within:border-[var(--primary)] focus-within:ring-4 focus-within:ring-[var(--primary)]/10 bg-[var(--bg)] transition-all overflow-hidden">
                                            <span className="text-[var(--text)]/40 font-bold text-sm whitespace-nowrap shrink-0">shopylinks.shop/</span>
                                            <input
                                                id="store-slug"
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
                                                    onClick={() => { if (state.suggestedSlug) { actions.setAutoGenerateSlug(false); actions.setSlug(state.suggestedSlug); actions.setSuggestedSlug(null); } }}
                                                    className="text-[10px] font-black bg-blue-600 text-white px-3 py-1.5 rounded-lg uppercase tracking-widest hover:bg-blue-700"
                                                >
                                                    Usar esta
                                                </button>
                                            </div>
                                        )}
                                        {state.slug !== state.savedSlug && <p className="mt-2 text-xs font-medium leading-relaxed text-amber-600">Al guardar cambiará el enlace público. Los enlaces anteriores podrían dejar de funcionar.</p>}
                                        <div className="mt-3">
                                            <ToggleCard
                                                icon={Globe}
                                                title="Auto-generar enlace"
                                                description={state.autoGenerateSlug ? 'Enlace automático del nombre' : 'Edita manualmente'}
                                                checked={state.autoGenerateSlug}
                                                onChange={actions.setAutoGenerateSlug}
                                                compact
                                            />
                                        </div>
                                    </div>

                                    <PhoneInput label="WhatsApp pedidos" preferredCountry={state.country} value={state.whatsapp} onChange={actions.setWhatsapp} placeholder="300 123 4567" />

                                    {/* Referencia Local */}
                                    <div className="space-y-4 pt-4 border-t border-[var(--border)]">
                                        <div>
                                            <label htmlFor="store-location" className="text-sm font-bold text-[var(--text)]/60 mb-2 block px-1 flex items-center gap-2">
                                                <MapPin className="w-4 h-4 text-[var(--primary)]" />
                                                Referencia de ubicación local
                                            </label>
                                            <input
                                                type="text"
                                                className="w-full px-5 py-4 rounded-2xl border-2 border-[var(--border)] focus:border-[var(--primary)] focus:ring-4 focus:ring-[var(--primary)]/10 outline-none transition-all font-bold text-[var(--text)] bg-[var(--bg)]"
                                                id="store-location"
                                                placeholder="Ej: A 2 cuadras de la plaza principal"
                                                value={state.referenceLocation}
                                                onChange={(e) => actions.setReferenceLocation(e.target.value)}
                                            />
                                        </div>
                                        <div>
                                            <label htmlFor="store-maps" className="text-sm font-bold text-[var(--text)]/60 mb-2 block px-1">
                                                Enlace a Google Maps (opcional)
                                            </label>
                                            <input
                                                type="url"
                                                className="w-full px-5 py-4 rounded-2xl border-2 border-[var(--border)] focus:border-[var(--primary)] focus:ring-4 focus:ring-[var(--primary)]/10 outline-none transition-all font-medium text-[var(--text)] bg-[var(--bg)]"
                                                id="store-maps"
                                                placeholder="https://maps.google.com/..."
                                                value={state.mapsUrl}
                                                onChange={(e) => actions.setMapsUrl(e.target.value)}
                                            />
                                        </div>
                                    </div>

                                    {/* Horario de atención */}
                                    <div className="pt-4 border-t border-[var(--border)]">
                                        <BusinessHoursEditor
                                            value={state.businessHours}
                                            onChange={actions.setBusinessHours}
                                        />
                                    </div>

                                    <div className="pt-4 border-t border-[var(--border)]">
                                        <ToggleCard
                                            icon={Truck}
                                            title="Activar Delivery"
                                            description="Permitir envíos a domicilio"
                                            checked={state.deliveryEnabled}
                                            onChange={actions.setDeliveryEnabled}
                                        />

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
                                <div><h3 className="text-lg font-black text-[var(--text)]">Logo de tu tienda</h3><p className="mt-1 text-sm text-[var(--text)]/50">Se mostrará en tu tienda y en el marketplace.</p></div>
                                <div className="p-5 sm:p-8 border-2 border-dashed border-[var(--border)] rounded-3xl bg-[var(--secondary)]/30 flex flex-col items-center justify-center gap-6 relative group/logo">
                                    <div className="w-32 h-32 md:w-40 md:h-40 bg-[var(--surface)] rounded-[2rem] shadow-[var(--shadow)] border border-[var(--border)] flex items-center justify-center overflow-hidden relative">
                                        {state.logoUrl ? (
                                            <Image src={state.logoUrl} alt="Logo" fill className="object-contain p-3" />
                                        ) : (
                                            <StoreIcon className="w-16 h-16 text-[var(--text)]/20" />
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2 w-full max-w-[200px]">
                                        <label className="flex-1 flex items-center justify-center gap-2 py-4 bg-[var(--surface)] border-2 border-[var(--border)] rounded-2xl font-bold text-sm text-[var(--text)]/60 cursor-pointer hover:bg-[var(--secondary)] active:scale-95 transition-all shadow-[var(--shadow)]">
                                            <Camera className="w-4 h-4" />
                                            {state.uploading ? 'Subiendo…' : state.logoUrl ? 'Cambiar logo' : 'Subir logo'}
                                            <input type="file" className="hidden" accept="image/*" onChange={actions.handleLogoFileSelect} disabled={state.uploading} />
                                        </label>
                                        {state.logoUrl && (
                                            <button
                                                type="button"
                                                onClick={() => actions.setLogoUrl('')}
                                                aria-label="Quitar logo"
                                                disabled={state.uploading}
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
                                <ToggleCard
                                    icon={Globe}
                                    title="Visibilidad en Marketplace"
                                    description="Aparecer en el directorio público"
                                    checked={state.isPublic}
                                    onChange={actions.setIsPublic}
                                />

                                {state.isPublic && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 p-6 rounded-3xl bg-[var(--bg)] border-2 border-dashed border-[var(--border)] animate-in fade-in slide-in-from-top-4">
                                        <div>
                                            <label className="text-sm font-bold text-[var(--text)]/60 mb-2 block px-1 flex items-center gap-2">
                                                Categoría principal
                                            </label>
                                            <StyledSelect label="Categoría principal" value={state.marketplaceCategory} onChange={actions.setMarketplaceCategory} options={[{ value: '', label: 'Sin categoría' }, ...marketplaceCategories]} />
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
                                        <div>
                                            <label className="text-sm font-bold text-[var(--text)]/60 mb-2 block px-1 flex items-center gap-2">
                                                <Globe className="w-4 h-4" /> País
                                                <span className="text-[10px] font-black uppercase tracking-widest text-[var(--primary)] bg-[var(--primary)]/10 px-2 py-0.5 rounded-full">
                                                    {currencyLabel}
                                                </span>
                                            </label>
                                            <StyledSelect label="País de la tienda" value={state.country} onChange={actions.setCountry} options={COUNTRY_OPTIONS.map(option => ({ value: option.code, label: `${option.name} (${getCurrencyForCountry(option.code).code})` }))} />
                                            <p className="text-[11px] font-medium text-[var(--text)]/40 mt-2 px-1">
                                                Tus precios se muestran en la moneda de este país.
                                            </p>
                                        </div>
                                        <div className="md:col-span-2">
                                            <label htmlFor="store-tags" className="text-sm font-bold text-[var(--text)]/60 mb-2 block px-1 flex items-center gap-2">
                                                <Search className="w-4 h-4" /> Etiquetas de búsqueda (separados por coma)
                                            </label>
                                            <input
                                                type="text"
                                                className="w-full px-5 py-4 rounded-2xl border-2 border-[var(--border)] focus:border-[var(--primary)] focus:ring-4 focus:ring-[var(--primary)]/10 outline-none transition-all font-bold text-[var(--text)] bg-[var(--surface)]"
                                                id="store-tags"
                                                placeholder="Ej: vegano, zapatos, envíos rápidos..."
                                                value={state.tagsText}
                                                onChange={(e) => actions.setTagsText(e.target.value)}
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
                            <div className="bg-[var(--bg)] rounded-3xl p-4 md:p-6 border-2 border-[var(--border)] space-y-6">
                                <ToggleCard
                                    icon={Percent}
                                    title="Descuento Global en toda la Tienda"
                                    description="Aplica un porcentaje de descuento masivo a todos los productos del catálogo."
                                    checked={state.globalDiscountActive}
                                    onChange={actions.setGlobalDiscountActive}
                                />

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
                                                <h5 className="text-xs font-black uppercase tracking-wider">Regla de Aplicación (&quot;El descuento mayor manda&quot;)</h5>
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

                    {(state.error || state.success) && <div role={state.error ? 'alert' : 'status'} className={cn('rounded-2xl border p-4 text-sm font-bold', state.error ? 'border-red-500/20 bg-red-500/5 text-red-600' : 'border-green-500/20 bg-green-500/5 text-green-700')}>{state.error || state.success}</div>}
                    <div className="flex flex-col gap-3 border-t border-[var(--border)] pt-5 sm:flex-row sm:items-center sm:justify-between">
                        <p className="text-xs leading-relaxed text-[var(--text)]/50">Los ajustes de todas las secciones se guardan juntos.</p>
                        <button
                            type="submit"
                            disabled={state.saving || state.uploading}
                            className="bg-[var(--primary)] text-[var(--bg)] px-6 py-3.5 rounded-xl font-bold text-sm hover:opacity-90 transition-all shadow-lg active:scale-95 flex items-center gap-3 disabled:opacity-50"
                        >
                            {state.saving ? <Loader2 className="w-6 h-6 animate-spin" /> : <><Save className="w-4 h-4" /> Guardar cambios</>}
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
                    itemName={state.savedStoreName}
                    onDelete={actions.handleDeleteStore}
                />
            )}
        </motion.div>
    );
}
