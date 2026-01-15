'use client';

import { useState } from 'react';
import Image from 'next/image';
import {
    Store as StoreIcon, Camera, Globe, Palette, Instagram, Facebook as FacebookIcon,
    Smartphone, MessageCircle, Loader2, Save, CheckCircle2, X, Twitter,
    Youtube, Trash2, AlertTriangle, Truck, DollarSign, Sun, Moon,
    LayoutTemplate
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { PhoneInput } from '@/components/PhoneInput';

interface StoreTabProps {
    storeName: string;
    setStoreName: (val: string) => void;
    storeSlug: string;
    setStoreSlug: (val: string) => void;
    suggestedSlug: string | null;
    setSuggestedSlug: (val: string | null) => void;
    storeLogo: string;
    whatsapp: string;
    setWhatsapp: (val: string) => void;
    instagram: string;
    setInstagram: (val: string) => void;
    facebook: string;
    setFacebook: (val: string) => void;
    tiktok: string;
    setTiktok: (val: string) => void;
    twitter: string;
    setTwitter: (val: string) => void;
    pinterest: string;
    setPinterest: (val: string) => void;
    youtube: string;
    setYoutube: (val: string) => void;
    theme: string;
    setTheme: (val: string) => void;
    mode: string;
    setMode: (val: string) => void;
    applyToDashboard: boolean;
    setApplyToDashboard: (val: boolean) => void;
    deliveryEnabled: boolean;
    setDeliveryEnabled: (val: boolean) => void;
    deliveryPrice: string;
    setDeliveryPrice: (val: string) => void;
    saving: boolean;
    uploading: boolean;
    handleUpdateStore: (e: React.FormEvent) => void;
    handleStoreLogoUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
    isDeleteModalOpen: boolean;
    setIsDeleteModalOpen: (val: boolean) => void;
    deleteConfirmationName: string;
    setDeleteConfirmationName: (val: string) => void;
    deleting: boolean;
    handleDeleteStore: () => void;
    activeStoreName: string;
}

export function StoreTab({
    storeName, setStoreName,
    storeSlug, setStoreSlug,
    suggestedSlug, setSuggestedSlug,
    storeLogo,
    whatsapp, setWhatsapp,
    instagram, setInstagram,
    facebook, setFacebook,
    tiktok, setTiktok,
    twitter, setTwitter,
    pinterest, setPinterest,
    youtube, setYoutube,
    theme, setTheme,
    mode, setMode,
    applyToDashboard, setApplyToDashboard,
    deliveryEnabled, setDeliveryEnabled,
    deliveryPrice, setDeliveryPrice,
    saving, uploading,
    handleUpdateStore,
    handleStoreLogoUpload,
    isDeleteModalOpen, setIsDeleteModalOpen,
    deleteConfirmationName, setDeleteConfirmationName,
    deleting, handleDeleteStore,
    activeStoreName
}: StoreTabProps) {
    const [activeTab, setActiveTab] = useState<'info' | 'social' | 'appearance'>('info');

    return (
        <motion.div key="store" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="pb-20">
            {/* Tabs Selector */}
            <div className="flex flex-col sm:flex-row sm:border-b sm:border-gray-200 mb-8 gap-2 sm:gap-0">
                <button
                    onClick={() => setActiveTab('info')}
                    type="button"
                    className={cn(
                        "px-6 py-4 text-sm font-black transition-all duration-300 flex items-center justify-center sm:justify-start gap-3 rounded-2xl sm:rounded-none sm:rounded-t-2xl sm:border-b-4",
                        activeTab === 'info'
                            ? "bg-[var(--primary)] text-[var(--primary-foreground)] shadow-lg shadow-[var(--primary)]/20 sm:shadow-none sm:bg-[var(--primary)]/5 sm:text-[var(--primary)] sm:border-[var(--primary)]"
                            : "bg-[var(--surface)] text-[var(--text)]/60 border border-[var(--border)] sm:border-0 sm:border-transparent sm:bg-transparent hover:bg-[var(--secondary)] sm:hover:bg-[var(--primary)]/5 hover:text-[var(--text)]"
                    )}
                >
                    <StoreIcon className="w-5 h-5 sm:w-4 sm:h-4" />
                    TIENDA & BRANDING
                </button>
                <button
                    onClick={() => setActiveTab('social')}
                    type="button"
                    className={cn(
                        "px-6 py-4 text-sm font-black transition-all duration-300 flex items-center justify-center sm:justify-start gap-3 rounded-2xl sm:rounded-none sm:rounded-t-2xl sm:border-b-4",
                        activeTab === 'social'
                            ? "bg-pink-600 text-white shadow-lg shadow-pink-600/20 sm:shadow-none sm:bg-pink-50/50 sm:text-pink-600 sm:border-pink-600"
                            : "bg-[var(--surface)] text-[var(--text)]/60 border border-[var(--border)] sm:border-0 sm:border-transparent sm:bg-transparent hover:bg-[var(--secondary)] sm:hover:bg-pink-50/50 hover:text-[var(--text)]"
                    )}
                >
                    <Globe className="w-5 h-5 sm:w-4 sm:h-4" />
                    REDES SOCIALES
                </button>
                <button
                    onClick={() => setActiveTab('appearance')}
                    type="button"
                    className={cn(
                        "px-6 py-4 text-sm font-black transition-all duration-300 flex items-center justify-center sm:justify-start gap-3 rounded-2xl sm:rounded-none sm:rounded-t-2xl sm:border-b-4",
                        activeTab === 'appearance'
                            ? "bg-yellow-500 text-white shadow-lg shadow-yellow-500/20 sm:shadow-none sm:bg-yellow-50/50 sm:text-yellow-500 sm:border-yellow-500"
                            : "bg-[var(--surface)] text-[var(--text)]/60 border border-[var(--border)] sm:border-0 sm:border-transparent sm:bg-transparent hover:bg-[var(--secondary)] sm:hover:bg-yellow-50/50 hover:text-[var(--text)]"
                    )}
                >
                    <Palette className="w-5 h-5 sm:w-4 sm:h-4" />
                    APARIENCIA
                </button>
            </div>

            <div className="bg-[var(--surface)] rounded-[2.5rem] shadow-[var(--shadow)] border border-[var(--border)] overflow-hidden">
                <form onSubmit={handleUpdateStore} className="p-8 md:p-12 space-y-10">
                    {/* Content */}
                    {activeTab === 'info' && (
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 animate-in fade-in slide-in-from-left-4 duration-500">
                            {/* Basic Info */}
                            <div className="lg:col-span-12 xl:col-span-7 space-y-8">
                                <h3 className="text-sm font-black uppercase tracking-widest text-blue-600">Información Básica</h3>

                                <div className="grid grid-cols-1 gap-6">
                                    <div>
                                        <label className="text-sm font-bold text-[var(--text)]/60 mb-2 block px-1">Nombre de la tienda</label>
                                        <input
                                            type="text"
                                            className="w-full px-5 py-4 rounded-2xl border-2 border-[var(--border)] focus:border-[var(--primary)] focus:ring-4 focus:ring-[var(--primary)]/10 outline-none transition-all font-bold text-[var(--text)] bg-[var(--bg)]"
                                            value={storeName}
                                            onChange={(e) => setStoreName(e.target.value)}
                                        />
                                    </div>

                                    <div>
                                        <label className="text-sm font-bold text-[var(--text)]/60 mb-2 block px-1">Enlace de tu tienda</label>
                                        <div className="flex items-center w-full px-5 py-4 rounded-2xl border-2 border-[var(--border)] focus-within:border-[var(--primary)] focus-within:ring-4 focus-within:ring-[var(--primary)]/10 bg-[var(--bg)] transition-all overflow-hidden">
                                            <span className="text-[var(--text)]/40 font-bold text-sm whitespace-nowrap shrink-0">shopylink.com/</span>
                                            <input
                                                type="text"
                                                className="flex-1 ml-1 outline-none font-black text-[var(--text)] bg-transparent text-sm min-w-0"
                                                value={storeSlug}
                                                onChange={(e) => setStoreSlug(e.target.value)}
                                            />
                                        </div>
                                        {suggestedSlug && (
                                            <div className="mt-3 p-3 bg-blue-50 border border-blue-100 rounded-xl flex items-center justify-between animate-in fade-in slide-in-from-top-1">
                                                <p className="text-xs font-bold text-blue-700">
                                                    Sugerencia: <span className="underline">{suggestedSlug}</span>
                                                </p>
                                                <button
                                                    type="button"
                                                    onClick={() => setSuggestedSlug(null)}
                                                    className="text-[10px] font-black bg-blue-600 text-white px-3 py-1.5 rounded-lg uppercase tracking-widest hover:bg-blue-700 transition-colors"
                                                >
                                                    Usar esta
                                                </button>
                                            </div>
                                        )}
                                    </div>

                                    <div>
                                        <PhoneInput
                                            label="WhatsApp para pedidos"
                                            value={whatsapp}
                                            onChange={setWhatsapp}
                                            placeholder="300 123 4567"
                                            className="font-bold"
                                        />
                                    </div>

                                    {/* Delivery Options */}
                                    <div className="pt-4 border-t border-[var(--border)]">
                                        <div
                                            onClick={() => setDeliveryEnabled(!deliveryEnabled)}
                                            className={cn(
                                                "group cursor-pointer p-6 rounded-3xl border-2 transition-all duration-300 relative overflow-hidden",
                                                deliveryEnabled
                                                    ? "border-[var(--primary)] bg-[var(--primary)]/5 shadow-md shadow-[var(--primary)]/10"
                                                    : "border-[var(--border)] bg-[var(--surface)] hover:border-[var(--text)]/10"
                                            )}
                                        >
                                            {/* Accent background for active state */}
                                            {deliveryEnabled && (
                                                <div className="absolute top-0 right-0 p-3 opacity-10">
                                                    <Truck className="w-24 h-24 text-[var(--primary)] rotate-12 translate-x-4 translate-y--4" />
                                                </div>
                                            )}

                                            <div className="flex items-center justify-between relative z-10">
                                                <div className="flex items-center gap-4">
                                                    <div className={cn(
                                                        "w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500",
                                                        deliveryEnabled ? "bg-[var(--primary)] text-white scale-110 shadow-lg" : "bg-[var(--secondary)] text-[var(--text)]/20"
                                                    )}>
                                                        <Truck className="w-6 h-6" />
                                                    </div>
                                                    <div className="space-y-1">
                                                        <p className={cn(
                                                            "font-black text-base transition-colors",
                                                            deliveryEnabled ? "text-[var(--text)]" : "text-[var(--text)]/40"
                                                        )}>Activar Delivery</p>
                                                        <p className="text-xs text-[var(--text)]/30 font-bold uppercase tracking-wider">Permitir envios a domicilio</p>
                                                    </div>
                                                </div>

                                                <div className={cn(
                                                    "w-14 h-8 rounded-full transition-all duration-500 flex items-center px-1",
                                                    deliveryEnabled ? "bg-[var(--primary)] shadow-inner" : "bg-[var(--border)]"
                                                )}>
                                                    <div className={cn(
                                                        "w-6 h-6 rounded-full bg-white shadow-xl transition-all duration-500 transform",
                                                        deliveryEnabled ? "translate-x-6 scale-90" : "translate-x-0 scale-75"
                                                    )} />
                                                </div>
                                            </div>

                                            <p className="mt-4 text-[10px] text-[var(--text)]/40 font-bold uppercase tracking-[0.15em] border-t border-[var(--border)] pt-4 group-hover:text-[var(--text)]/60 transition-colors">
                                                {deliveryEnabled ? 'Los clientes podrán dejar su dirección y GPS' : 'Solo venta con retiro en local o acuerdo previo'}
                                            </p>
                                        </div>

                                        {deliveryEnabled && (
                                            <div className="mt-6 p-6 rounded-3xl bg-[var(--bg)] border-2 border-dashed border-[var(--border)] animate-in fade-in slide-in-from-top-4 duration-500">
                                                <div className="flex items-center gap-2 mb-3">
                                                    <div className="w-8 h-8 rounded-lg bg-[var(--primary)]/10 flex items-center justify-center">
                                                        <DollarSign className="w-4 h-4 text-[var(--primary)]" />
                                                    </div>
                                                    <label className="text-sm font-black text-[var(--text)] uppercase tracking-widest">Costo de Envío</label>
                                                </div>
                                                <input
                                                    type="text"
                                                    className="w-full px-6 py-4 rounded-2xl border-2 border-[var(--border)] focus:border-[var(--primary)] focus:ring-8 focus:ring-[var(--primary)]/5 outline-none transition-all font-black text-lg text-[var(--text)] bg-[var(--surface)] shadow-sm"
                                                    placeholder="Ej: Gratis, Q 10.00, A convenir"
                                                    value={deliveryPrice}
                                                    onChange={(e) => setDeliveryPrice(e.target.value)}
                                                />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Branding */}
                            <div className="lg:col-span-12 xl:col-span-5 space-y-8">
                                <h3 className="text-sm font-black uppercase tracking-widest text-purple-600">Identidad Visual</h3>

                                <div className="space-y-6">
                                    <label className="text-sm font-bold text-[var(--text)]/60 mb-2 block px-1">
                                        Logo de la Tienda
                                    </label>

                                    <div className="p-8 border-2 border-dashed border-[var(--border)] rounded-[2.5rem] bg-[var(--secondary)]/30 flex flex-col items-center justify-center gap-6 relative group/logo transition-colors hover:border-[var(--primary)]/40">
                                        <div className="w-32 h-32 md:w-40 md:h-40 bg-[var(--surface)] rounded-[2rem] shadow-[var(--shadow)] border border-[var(--border)] flex items-center justify-center text-6xl overflow-hidden relative">
                                            {storeLogo ? (
                                                <Image
                                                    src={storeLogo}
                                                    alt="Logo"
                                                    fill
                                                    className="object-contain"
                                                />
                                            ) : (
                                                <StoreIcon className="w-16 h-16 text-[var(--text)]/20" />
                                            )}
                                        </div>
                                        <div className="w-full max-w-[200px]">
                                            <label className="flex items-center justify-center gap-2 w-full py-4 bg-[var(--surface)] border-2 border-[var(--border)] rounded-2xl font-bold text-sm text-[var(--text)]/60 cursor-pointer hover:bg-[var(--secondary)] active:scale-95 transition-all shadow-[var(--shadow)]">
                                                <Camera className="w-4 h-4" />
                                                {storeLogo ? 'Cambiar Logo' : 'Subir Logo'}
                                                <input type="file" className="hidden" accept="image/*" onChange={handleStoreLogoUpload} disabled={uploading} />
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'social' && (
                        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                            <h3 className="text-sm font-black uppercase tracking-widest text-pink-600">Redes Sociales</h3>
                            <p className="text-[var(--text)]/60 text-sm">Conecta tus redes sociales para que aparezcan en el footer de tu tienda.</p>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="text-sm font-bold text-[var(--text)]/60 mb-2 block px-1 flex items-center gap-2"><Instagram className="w-4 h-4" /> Instagram</label>
                                    <input type="url" className="w-full px-5 py-4 rounded-2xl border-2 border-[var(--border)] focus:border-pink-500 focus:ring-4 focus:ring-pink-500/10 outline-none transition-all font-medium text-[var(--text)] bg-[var(--bg)]" placeholder="https://instagram.com/tu_usuario" value={instagram} onChange={(e) => setInstagram(e.target.value)} />
                                </div>
                                <div>
                                    <label className="text-sm font-bold text-[var(--text)]/60 mb-2 block px-1 flex items-center gap-2"><FacebookIcon className="w-4 h-4" /> Facebook</label>
                                    <input type="url" className="w-full px-5 py-4 rounded-2xl border-2 border-[var(--border)] focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 outline-none transition-all font-medium text-[var(--text)] bg-[var(--bg)]" placeholder="https://facebook.com/tu_pagina" value={facebook} onChange={(e) => setFacebook(e.target.value)} />
                                </div>
                                <div>
                                    <label className="text-sm font-bold text-[var(--text)]/60 mb-2 block px-1 flex items-center gap-2"><Smartphone className="w-4 h-4" /> TikTok</label>
                                    <input type="url" className="w-full px-5 py-4 rounded-2xl border-2 border-[var(--border)] focus:border-gray-900 focus:ring-4 focus:ring-gray-900/10 outline-none transition-all font-medium text-[var(--text)] bg-[var(--bg)]" placeholder="https://tiktok.com/@tu_usuario" value={tiktok} onChange={(e) => setTiktok(e.target.value)} />
                                </div>
                                <div>
                                    <label className="text-sm font-bold text-[var(--text)]/60 mb-2 block px-1 flex items-center gap-2"><Twitter className="w-4 h-4" /> Twitter / X</label>
                                    <input type="url" className="w-full px-5 py-4 rounded-2xl border-2 border-[var(--border)] focus:border-gray-900 focus:ring-4 focus:ring-gray-900/10 outline-none transition-all font-medium text-[var(--text)] bg-[var(--bg)]" placeholder="https://twitter.com/tu_usuario" value={twitter} onChange={(e) => setTwitter(e.target.value)} />
                                </div>
                                <div>
                                    <label className="text-sm font-bold text-[var(--text)]/60 mb-2 block px-1">Pinterest</label>
                                    <input type="url" className="w-full px-5 py-4 rounded-2xl border-2 border-[var(--border)] focus:border-red-600 focus:ring-4 focus:ring-red-600/10 outline-none transition-all font-medium text-[var(--text)] bg-[var(--bg)]" placeholder="https://pinterest.com/tu_usuario" value={pinterest} onChange={(e) => setPinterest(e.target.value)} />
                                </div>
                                <div>
                                    <label className="text-sm font-bold text-[var(--text)]/60 mb-2 block px-1 flex items-center gap-2"><Youtube className="w-4 h-4" /> YouTube</label>
                                    <input type="url" className="w-full px-5 py-4 rounded-2xl border-2 border-[var(--border)] focus:border-red-600 focus:ring-4 focus:ring-red-600/10 outline-none transition-all font-medium text-[var(--text)] bg-[var(--bg)]" placeholder="https://youtube.com/@tu_canal" value={youtube} onChange={(e) => setYoutube(e.target.value)} />
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'appearance' && (
                        <div className="max-w-4xl mx-auto space-y-12 animate-in fade-in slide-in-from-right-4 duration-500">
                            {/* Theme Selection */}
                            <div className="space-y-8">
                                <h3 className="text-sm font-black uppercase tracking-widest text-yellow-500">Diseño y Colores</h3>

                                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4">
                                    {[
                                        { id: 'classic', name: 'Classic', desc: 'Profesional & Azul', colors: ['#2563eb', '#ffffff'] },
                                        { id: 'fresh', name: 'Fresh', desc: 'Natural & Verde', colors: ['#10b981', '#ffffff'] },
                                        { id: 'modern', name: 'Modern', desc: 'Elegante & Indigo', colors: ['#6366f1', '#ffffff'] },
                                        { id: 'minimal', name: 'Minimal', desc: 'Simple & Negro', colors: ['#27272a', '#ffffff'] },
                                        { id: 'gold', name: 'Gold', desc: 'Premium & Oro', colors: ['#d4af37', '#111827'] },
                                        { id: 'sunset', name: 'Sunset', desc: 'Cálido & Naranja', colors: ['#f97316', '#fff7ed'] },
                                        { id: 'ocean', name: 'Ocean', desc: 'Fresco & Cyan', colors: ['#06b6d4', '#ecfeff'] },
                                        { id: 'berry', name: 'Berry', desc: 'Vibrante & Rosa', colors: ['#db2777', '#fdf2f8'] },
                                        { id: 'forest', name: 'Forest', desc: 'Sereno & Bosque', colors: ['#059669', '#ecfdf5'] },
                                        { id: 'corporate', name: 'Corporate', desc: 'Serio & Gris', colors: ['#475569', '#f8fafc'] },
                                    ].map((t) => (
                                        <button
                                            key={t.id}
                                            type="button"
                                            onClick={() => setTheme(t.id)}
                                            className={cn(
                                                "p-3 md:p-4 rounded-2xl md:rounded-3xl border-2 transition-all text-left flex flex-col gap-3 md:gap-4",
                                                theme === t.id
                                                    ? 'border-[var(--primary)] bg-[var(--primary)]/5 ring-4 ring-[var(--primary)]/5 shadow-[var(--shadow-strong)]'
                                                    : 'border-[var(--border)] hover:border-[var(--text)]/10 bg-[var(--surface)]'
                                            )}
                                        >
                                            <div className="flex gap-1">
                                                {t.colors.map((c, i) => (
                                                    <div key={i} className="w-5 h-5 md:w-6 md:h-6 rounded-full shadow-inner" style={{ backgroundColor: c }} />
                                                ))}
                                            </div>
                                            <div>
                                                <p className="font-black text-xs md:text-sm text-[var(--text)]">{t.name}</p>
                                                <p className="text-[9px] md:text-[10px] text-[var(--text)]/40 font-bold uppercase leading-tight">{t.desc}</p>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Mode Selection */}
                            <div className="space-y-6">
                                <h3 className="text-sm font-black uppercase tracking-widest text-[var(--text)]">Modo de Visualización</h3>
                                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4">
                                    <button
                                        type="button"
                                        onClick={() => setMode('light')}
                                        className={cn(
                                            "p-4 md:p-6 rounded-2xl border-2 flex flex-col items-center justify-center gap-2 transition-all",
                                            mode === 'light'
                                                ? 'border-yellow-500 bg-yellow-50/10 text-yellow-600'
                                                : 'border-[var(--border)] text-[var(--text)]/40 hover:border-[var(--border)]'
                                        )}
                                    >
                                        <Sun className="w-5 h-5 md:w-6 md:h-6" />
                                        <span className="font-black text-[9px] md:text-[10px] tracking-widest">CLARO</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setMode('dark')}
                                        className={cn(
                                            "p-4 md:p-6 rounded-2xl border-2 flex flex-col items-center justify-center gap-2 transition-all",
                                            mode === 'dark'
                                                ? 'border-gray-900 bg-gray-900 text-white'
                                                : 'border-[var(--border)] text-[var(--text)]/40 hover:border-[var(--border)]'
                                        )}
                                    >
                                        <Moon className="w-5 h-5 md:w-6 md:h-6" />
                                        <span className="font-black text-[9px] md:text-[10px] tracking-widest">OSCURO</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setMode('beige')}
                                        className={cn(
                                            "p-4 md:p-6 rounded-2xl border-2 flex flex-col items-center justify-center gap-2 transition-all",
                                            mode === 'beige'
                                                ? 'border-[#d2b48c] bg-[#f5f5dc] text-[#4a3728]'
                                                : 'border-[var(--border)] text-[var(--text)]/40 hover:border-[var(--border)]'
                                        )}
                                    >
                                        <div className="w-5 h-5 md:w-6 md:h-6 rounded-full bg-[#f5f5dc] border border-[#d2b48c]" />
                                        <span className="font-black text-[9px] md:text-[10px] tracking-widest">BEIGE</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setMode('gray')}
                                        className={cn(
                                            "p-4 md:p-6 rounded-2xl border-2 flex flex-col items-center justify-center gap-2 transition-all",
                                            mode === 'gray'
                                                ? 'border-gray-400 bg-gray-100 text-gray-700'
                                                : 'border-[var(--border)] text-[var(--text)]/40 hover:border-[var(--border)]'
                                        )}
                                    >
                                        <div className="w-5 h-5 md:w-6 md:h-6 rounded-full bg-gray-100 border border-gray-300" />
                                        <span className="font-black text-[9px] md:text-[10px] tracking-widest uppercase text-center leading-tight">Gris<br className="hidden sm:inline" /> Claro</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setMode('dark-gray')}
                                        className={cn(
                                            "p-4 md:p-6 rounded-2xl border-2 flex flex-col items-center justify-center gap-2 transition-all",
                                            mode === 'dark-gray'
                                                ? 'border-gray-600 bg-gray-700 text-gray-100'
                                                : 'border-[var(--border)] text-[var(--text)]/40 hover:border-[var(--border)]'
                                        )}
                                    >
                                        <div className="w-5 h-5 md:w-6 md:h-6 rounded-full bg-gray-700 border border-gray-500" />
                                        <span className="font-black text-[9px] md:text-[10px] tracking-widest uppercase text-center leading-tight">Gris<br />Oscuro</span>
                                    </button>
                                </div>
                            </div>

                            {/* Dashboard Sync */}
                            <div className="space-y-6">
                                <h3 className="text-sm font-black uppercase tracking-widest text-[var(--primary)]">Sincronización de Interfaz</h3>
                                <div
                                    onClick={() => setApplyToDashboard(!applyToDashboard)}
                                    className={`p-6 rounded-[2rem] border-2 transition-all cursor-pointer flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between ${applyToDashboard ? 'border-[var(--primary)] bg-[var(--primary)]/10' : 'border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow)]'
                                        }`}
                                >
                                    <div className="space-y-1">
                                        <p className="font-black text-[var(--text)]">Aplicar tema a mi Dashboard</p>
                                        <p className="text-xs text-[var(--text)]/40 font-medium italic">Si lo activas, tu panel de administración usará los mismos colores que tu tienda.</p>
                                    </div>
                                    <div className={`w-14 h-8 rounded-full transition-all flex items-center px-1 ${applyToDashboard ? 'bg-[var(--primary)]' : 'bg-[var(--secondary)]'}`}>
                                        <div className={`w-6 h-6 rounded-full bg-[var(--bg)] shadow-sm transition-all transform ${applyToDashboard ? 'translate-x-6' : 'translate-x-0'}`} />
                                    </div>
                                </div>
                            </div>

                            {/* Live Preview */}
                            <div className="p-8 bg-[var(--secondary)]/30 rounded-[2.5rem] border border-[var(--border)] space-y-6 shadow-inner">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text)]/40">Previsualización rápida</h3>
                                    <div className="flex gap-1">
                                        <div className="w-2 h-2 rounded-full bg-red-400" />
                                        <div className="w-2 h-2 rounded-full bg-yellow-400" />
                                        <div className="w-2 h-2 rounded-full bg-green-400" />
                                    </div>
                                </div>

                                <div
                                    data-theme={theme}
                                    data-mode={mode}
                                    className="rounded-[2rem] overflow-hidden border border-[var(--border)] shadow-[var(--shadow-strong)] bg-[var(--bg)] transition-all duration-300"
                                >
                                    <div className="p-6 border-b border-[var(--border)] flex items-center justify-between bg-[var(--bg)]">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-lg bg-[var(--secondary)] border border-[var(--border)]" />
                                            <div className="w-20 h-3 bg-[var(--text)]/20 rounded-full" />
                                        </div>
                                        <div className="w-10 h-10 rounded-xl bg-[var(--primary)]" />
                                    </div>
                                    <div className="p-6 space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            {[1, 2].map(i => (
                                                <div key={i} className="p-3 rounded-2xl border border-[var(--border)] space-y-2">
                                                    <div className="aspect-square bg-[var(--secondary)] rounded-xl" />
                                                    <div className="w-full h-2 bg-[var(--text)]/20 rounded-full" />
                                                    <div className="w-1/2 h-2 bg-[var(--primary)]/40 rounded-full" />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                <p className="text-center text-[10px] text-[var(--text)]/40 font-bold uppercase tracking-widest">
                                    Esta es una vista previa de cómo se verá tu catálogo
                                </p>
                            </div>
                        </div>
                    )}

                    <div className="pt-8 border-t border-[var(--border)] flex justify-end">
                        <button
                            type="submit"
                            disabled={saving}
                            className="bg-[var(--primary)] text-[var(--bg)] px-10 py-5 rounded-[2rem] font-black text-xl hover:opacity-90 transition-all shadow-[var(--shadow-strong)] active:scale-[0.98] flex items-center justify-center gap-3 disabled:opacity-50"
                        >
                            {saving ? (
                                <Loader2 className="w-6 h-6 animate-spin" />
                            ) : (
                                <>
                                    <Save className="w-6 h-6" />
                                    Guardar Cambios
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>

            {/* Danger Zone - Only visible in Info tab based on old design preference, or usually at bottom. Putting in Info for now as it fits 'Settings' */}
            {activeTab === 'info' && (
                <div className="mt-8 bg-red-50/50 rounded-[2.5rem] border border-red-100/50 overflow-hidden animate-in fade-in slide-in-from-bottom-4">
                    <div className="p-8 md:p-12 space-y-8">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-red-500/10 text-red-600 rounded-2xl flex items-center justify-center">
                                <AlertTriangle className="w-6 h-6" />
                            </div>
                            <div>
                                <h2 className="text-xl font-black text-red-600 uppercase tracking-tight">Zona de Peligro</h2>
                                <p className="text-red-500/60 font-medium text-sm">Acciones irreversibles para tu tienda.</p>
                            </div>
                        </div>

                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 p-6 rounded-3xl bg-white/50 border border-red-100">
                            <div className="space-y-1">
                                <p className="font-black text-gray-900">Eliminar esta tienda</p>
                                <p className="text-xs text-red-500/60 font-bold uppercase tracking-tight">
                                    Esta acción borrará todos los productos, categorías y pedidos permanentemente.
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsDeleteModalOpen(true)}
                                className="bg-red-500 text-white px-8 py-3.5 rounded-2xl font-black text-sm hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-red-500/20"
                            >
                                Eliminar Tienda
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {isDeleteModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-[var(--surface)] w-full max-w-md rounded-[3rem] shadow-[var(--shadow-strong)] overflow-hidden animate-in zoom-in-95 duration-200 border border-[var(--border)]">
                        <div className="p-10 space-y-8 text-center">
                            <div className="flex flex-col items-center gap-4">
                                <div className="w-20 h-20 bg-red-500/10 text-red-500 rounded-[2rem] flex items-center justify-center">
                                    <Trash2 className="w-10 h-10" />
                                </div>
                                <div className="space-y-2">
                                    <h2 className="text-2xl font-black text-[var(--text)] uppercase tracking-tight">¿Estás seguro?</h2>
                                    <p className="text-[var(--text)]/40 font-bold text-sm">
                                        Esta acción es irreversible. Se eliminarán todos los datos asociados a la tienda <span className="text-[var(--text)]">&quot;{activeStoreName}&quot;</span>.
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-4 text-left">
                                <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text)]/40 px-1">
                                    Escribe el nombre de la tienda para confirmar:
                                </label>
                                <input
                                    type="text"
                                    placeholder={activeStoreName}
                                    value={deleteConfirmationName}
                                    onChange={(e) => setDeleteConfirmationName(e.target.value)}
                                    className="w-full px-6 py-4 rounded-2xl border-2 border-[var(--border)] focus:border-red-500 focus:ring-4 focus:ring-red-500/10 outline-none transition-all font-bold text-[var(--text)] bg-[var(--bg)]"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsDeleteModalOpen(false);
                                        setDeleteConfirmationName('');
                                    }}
                                    className="py-4 px-6 rounded-2xl font-black text-sm transition-all active:scale-95 bg-[var(--bg)] text-[var(--text)]/40 border border-[var(--border)] hover:bg-[var(--secondary)]"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="button"
                                    onClick={handleDeleteStore}
                                    disabled={deleteConfirmationName !== activeStoreName || deleting}
                                    className="py-4 px-6 rounded-2xl font-black text-sm transition-all active:scale-95 bg-red-500 text-white shadow-lg shadow-red-500/20 enabled:hover:scale-[1.02] disabled:opacity-30 disabled:grayscale"
                                >
                                    {deleting ? (
                                        <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                                    ) : (
                                        'Eliminar Tienda'
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </motion.div>
    );
}
