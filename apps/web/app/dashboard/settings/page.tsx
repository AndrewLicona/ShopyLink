'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
    Store,
    MessageCircle,
    Globe,
    Loader2,
    Image as ImageIcon,
    Save,
    CheckCircle2,
    Upload,
    X,
    X as CloseIcon,
    ArrowLeft,
    Palette,
    Moon,
    Sun
} from 'lucide-react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { createClient } from '@/lib/supabase';
import Image from 'next/image';
import { storage } from '@/lib/storage';
import { PhoneInput } from '@/components/PhoneInput';

import { useStore } from '@/contexts/StoreContext';
import { ConnectivityIcon } from '@/components/ConnectivityIcon';

export default function SettingsPage() {
    const { activeStore, refreshStores } = useStore();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [suggestedSlug, setSuggestedSlug] = useState<string | null>(null);

    // Form state
    const [name, setName] = useState('');
    const [slug, setSlug] = useState('');
    const [hasManuallyEditedSlug, setHasManuallyEditedSlug] = useState(false);
    const [whatsapp, setWhatsapp] = useState('');
    const [logoUrl, setLogoUrl] = useState('');
    const [instagramUrl, setInstagramUrl] = useState('');
    const [facebookUrl, setFacebookUrl] = useState('');
    const [tiktokUrl, setTiktokUrl] = useState('');
    const [twitterUrl, setTwitterUrl] = useState('');
    const [pinterestUrl, setPinterestUrl] = useState('');
    const [youtubeUrl, setYoutubeUrl] = useState('');
    const [theme, setTheme] = useState('classic');
    const [mode, setMode] = useState('light');
    const [applyToDashboard, setApplyToDashboard] = useState(false);
    const [activeTab, setActiveTab] = useState<'info' | 'social' | 'appearance'>('info');

    const router = useRouter();

    useEffect(() => {
        if (activeStore) {
            setName(activeStore.name);
            setSlug(activeStore.slug);
            setWhatsapp(activeStore.whatsappNumber || '');
            setLogoUrl(activeStore.logoUrl || '');
            setInstagramUrl(activeStore.instagramUrl || '');
            setFacebookUrl(activeStore.facebookUrl || '');
            setTiktokUrl(activeStore.tiktokUrl || '');
            setTwitterUrl(activeStore.twitterUrl || '');
            setPinterestUrl(activeStore.pinterestUrl || '');
            setYoutubeUrl(activeStore.youtubeUrl || '');
            setTheme(activeStore.theme || 'classic');
            setMode(activeStore.mode || 'light');
            setApplyToDashboard(activeStore.applyThemeToDashboard || false);
            setLoading(false);
        }
    }, [activeStore]);

    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newName = e.target.value;
        setName(newName);
        setSuggestedSlug(null);

        // Auto-slug if not touched
        if (!hasManuallyEditedSlug) {
            const newSlug = newName
                .toLowerCase()
                .normalize("NFD")
                .replace(/[\u0300-\u036f]/g, "")
                .replace(/[^a-z0-9]/g, '-')
                .replace(/-+/g, '-')
                .replace(/^-|-$/g, '');
            setSlug(newSlug);
        }
    };

    const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setHasManuallyEditedSlug(true);
        setSuggestedSlug(null);
        setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'));
    };

    const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        setError(null);
        try {
            const url = await storage.uploadImage(file, 'logos');
            setLogoUrl(url);
        } catch (err: any) {
            setError('Error al subir el logo. Asegúrate de que el bucket existe en Supabase.');
            console.error(err);
        } finally {
            setUploading(false);
        }
    };

    const handleUpdateStore = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!activeStore) return;
        setSaving(true);
        setError(null);
        setSuccess(false);

        try {
            await api.updateStore(activeStore!.id, {
                name,
                slug,
                whatsappNumber: whatsapp,
                logoUrl,
                instagramUrl,
                facebookUrl,
                tiktokUrl,
                twitterUrl,
                pinterestUrl,
                youtubeUrl,
                theme,
                mode,
                applyThemeToDashboard: applyToDashboard
            });
            await refreshStores();
            setSuccess(true);
            window.scrollTo({ top: 0, behavior: 'smooth' });
            setTimeout(() => setSuccess(false), 3000);
        } catch (err: any) {
            console.error('Update Store Error:', err);
            setError(err.message || 'Error al actualizar la tienda');

            if (err.message?.includes('uso') || err.message?.includes('already in use')) {
                const suggestion = `${slug}-${Math.floor(Math.random() * 90) + 10}`;
                setSuggestedSlug(suggestion);
            }
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <Loader2 className="w-10 h-10 text-[var(--primary)] animate-spin" />
                <p className="text-[var(--text)]/60 font-medium">Cargando configuración...</p>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto space-y-8 pb-20">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Link
                        href="/dashboard"
                        className="p-3 bg-white rounded-2xl border border-gray-100 text-gray-400 hover:text-gray-900 hover:shadow-md transition-all active:scale-95"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div className="flex items-center gap-3">
                        <ConnectivityIcon className="w-10 h-10" />
                        <div>
                            <h1 className="text-3xl font-black text-[var(--text)]">Configuración</h1>
                            <p className="text-[var(--text)]/60 mt-1">Personaliza los detalles de tu tienda.</p>
                        </div>
                    </div>
                    {success && (
                        <div className="flex items-center gap-2 bg-green-50 text-green-600 px-4 py-2 rounded-xl text-sm font-bold border border-green-100 animate-in fade-in slide-in-from-top-2">
                            <CheckCircle2 className="w-4 h-4" />
                            ¡Cambios guardados!
                        </div>
                    )}
                </div>
            </div>

            {/* Tabs Selector */}
            <div className="flex flex-col sm:flex-row sm:border-b sm:border-gray-200 mb-8 gap-2 sm:gap-0">
                <button
                    onClick={() => setActiveTab('info')}
                    className={`px-6 py-4 text-sm font-black transition-all duration-300 flex items-center justify-center sm:justify-start gap-3 rounded-2xl sm:rounded-none sm:rounded-t-2xl sm:border-b-4 ${activeTab === 'info'
                        ? "bg-[var(--primary)] text-[var(--primary-foreground)] shadow-lg shadow-[var(--primary)]/20 sm:shadow-none sm:bg-[var(--primary)]/5 sm:text-[var(--primary)] sm:border-[var(--primary)]"
                        : "bg-[var(--surface)] text-[var(--text)]/60 border border-[var(--border)] sm:border-0 sm:border-transparent sm:bg-transparent hover:bg-[var(--secondary)] sm:hover:bg-[var(--primary)]/5 hover:text-[var(--text)]"
                        }`}
                >
                    <Store className="w-5 h-5 sm:w-4 sm:h-4" />
                    TIENDA & BRANDING
                </button>
                <button
                    onClick={() => setActiveTab('social')}
                    className={`px-6 py-4 text-sm font-black transition-all duration-300 flex items-center justify-center sm:justify-start gap-3 rounded-2xl sm:rounded-none sm:rounded-t-2xl sm:border-b-4 ${activeTab === 'social'
                        ? "bg-pink-600 text-white shadow-lg shadow-pink-600/20 sm:shadow-none sm:bg-pink-50/50 sm:text-pink-600 sm:border-pink-600"
                        : "bg-[var(--surface)] text-[var(--text)]/60 border border-[var(--border)] sm:border-0 sm:border-transparent sm:bg-transparent hover:bg-[var(--secondary)] sm:hover:bg-pink-50/50 hover:text-[var(--text)]"
                        }`}
                >
                    <Globe className="w-5 h-5 sm:w-4 sm:h-4" />
                    REDES SOCIALES
                </button>
                <button
                    onClick={() => setActiveTab('appearance')}
                    className={`px-6 py-4 text-sm font-black transition-all duration-300 flex items-center justify-center sm:justify-start gap-3 rounded-2xl sm:rounded-none sm:rounded-t-2xl sm:border-b-4 ${activeTab === 'appearance'
                        ? "bg-yellow-500 text-white shadow-lg shadow-yellow-500/20 sm:shadow-none sm:bg-yellow-50/50 sm:text-yellow-500 sm:border-yellow-500"
                        : "bg-[var(--surface)] text-[var(--text)]/60 border border-[var(--border)] sm:border-0 sm:border-transparent sm:bg-transparent hover:bg-[var(--secondary)] sm:hover:bg-yellow-50/50 hover:text-[var(--text)]"
                        }`}
                >
                    <Palette className="w-5 h-5 sm:w-4 sm:h-4" />
                    APARIENCIA
                </button>
            </div>

            <div className="bg-[var(--surface)] rounded-[2.5rem] shadow-[var(--shadow)] border border-[var(--border)] overflow-hidden">
                <form onSubmit={handleUpdateStore} className="p-8 md:p-12 space-y-10">
                    {error && (
                        <div className="p-4 bg-red-50 text-red-600 text-sm rounded-2xl border border-red-100 italic">
                            {error}
                        </div>
                    )}

                    {activeTab === 'info' ? (
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
                                            value={name}
                                            onChange={handleNameChange}
                                        />
                                    </div>

                                    <div>
                                        <label className="text-sm font-bold text-[var(--text)]/60 mb-2 block px-1">Enlace de tu tienda</label>
                                        <div className="flex items-center w-full px-5 py-4 rounded-2xl border-2 border-[var(--border)] focus-within:border-[var(--primary)] focus-within:ring-4 focus-within:ring-[var(--primary)]/10 bg-[var(--bg)] transition-all overflow-hidden">
                                            <span className="text-[var(--text)]/40 font-bold text-sm whitespace-nowrap shrink-0">shopylink.com/</span>
                                            <input
                                                type="text"
                                                className="flex-1 ml-1 outline-none font-black text-[var(--text)] bg-transparent text-sm min-w-0"
                                                value={slug}
                                                onChange={handleSlugChange}
                                            />
                                        </div>
                                        {suggestedSlug && (
                                            <div className="mt-3 p-3 bg-blue-50 border border-blue-100 rounded-xl flex items-center justify-between animate-in fade-in slide-in-from-top-1">
                                                <p className="text-xs font-bold text-blue-700">
                                                    Sugerencia: <span className="underline">{suggestedSlug}</span>
                                                </p>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setSlug(suggestedSlug);
                                                        setSuggestedSlug(null);
                                                        setError(null);
                                                    }}
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
                                            {logoUrl ? (
                                                <>
                                                    <Image
                                                        src={logoUrl}
                                                        alt="Logo"
                                                        fill
                                                        className="object-contain"
                                                        sizes="(max-width: 768px) 128px, 160px"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => setLogoUrl('')}
                                                        className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-xl opacity-0 group-hover/logo:opacity-100 transition-opacity shadow-lg z-10"
                                                    >
                                                        <X className="w-4 h-4" />
                                                    </button>
                                                </>
                                            ) : (
                                                <Store className="w-16 h-16 text-[var(--text)]/20" />
                                            )}
                                            {uploading && (
                                                <div className="absolute inset-0 bg-[var(--surface)]/80 backdrop-blur-sm flex items-center justify-center">
                                                    <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="w-full max-w-[200px]">
                                            <label className="flex items-center justify-center gap-2 w-full py-4 bg-[var(--surface)] border-2 border-[var(--border)] rounded-2xl font-bold text-sm text-[var(--text)]/60 cursor-pointer hover:bg-[var(--secondary)] active:scale-95 transition-all shadow-[var(--shadow)]">
                                                <Upload className="w-4 h-4" />
                                                {logoUrl ? 'Cambiar Logo' : 'Subir Logo'}
                                                <input type="file" className="hidden" accept="image/*" onChange={handleLogoUpload} disabled={uploading} />
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : activeTab === 'social' ? (
                        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                            <h3 className="text-sm font-black uppercase tracking-widest text-pink-600">Redes Sociales</h3>
                            <p className="text-[var(--text)]/60 text-sm">Conecta tus redes sociales para que aparezcan en el footer de tu tienda.</p>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="text-sm font-bold text-[var(--text)]/60 mb-2 block px-1">Instagram</label>
                                    <input type="url" className="w-full px-5 py-4 rounded-2xl border-2 border-[var(--border)] focus:border-pink-500 focus:ring-4 focus:ring-pink-500/10 outline-none transition-all font-medium text-[var(--text)] bg-[var(--bg)]" placeholder="https://instagram.com/tu_usuario" value={instagramUrl} onChange={(e) => setInstagramUrl(e.target.value)} />
                                </div>
                                <div>
                                    <label className="text-sm font-bold text-[var(--text)]/60 mb-2 block px-1">Facebook</label>
                                    <input type="url" className="w-full px-5 py-4 rounded-2xl border-2 border-[var(--border)] focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 outline-none transition-all font-medium text-[var(--text)] bg-[var(--bg)]" placeholder="https://facebook.com/tu_pagina" value={facebookUrl} onChange={(e) => setFacebookUrl(e.target.value)} />
                                </div>
                                <div>
                                    <label className="text-sm font-bold text-[var(--text)]/60 mb-2 block px-1">TikTok</label>
                                    <input type="url" className="w-full px-5 py-4 rounded-2xl border-2 border-[var(--border)] focus:border-gray-900 focus:ring-4 focus:ring-gray-900/10 outline-none transition-all font-medium text-[var(--text)] bg-[var(--bg)]" placeholder="https://tiktok.com/@tu_usuario" value={tiktokUrl} onChange={(e) => setTiktokUrl(e.target.value)} />
                                </div>
                                <div>
                                    <label className="text-sm font-bold text-[var(--text)]/60 mb-2 block px-1">Twitter / X</label>
                                    <input type="url" className="w-full px-5 py-4 rounded-2xl border-2 border-[var(--border)] focus:border-gray-900 focus:ring-4 focus:ring-gray-900/10 outline-none transition-all font-medium text-[var(--text)] bg-[var(--bg)]" placeholder="https://twitter.com/tu_usuario" value={twitterUrl} onChange={(e) => setTwitterUrl(e.target.value)} />
                                </div>
                                <div>
                                    <label className="text-sm font-bold text-[var(--text)]/60 mb-2 block px-1">Pinterest</label>
                                    <input type="url" className="w-full px-5 py-4 rounded-2xl border-2 border-[var(--border)] focus:border-red-600 focus:ring-4 focus:ring-red-600/10 outline-none transition-all font-medium text-[var(--text)] bg-[var(--bg)]" placeholder="https://pinterest.com/tu_usuario" value={pinterestUrl} onChange={(e) => setPinterestUrl(e.target.value)} />
                                </div>
                                <div>
                                    <label className="text-sm font-bold text-[var(--text)]/60 mb-2 block px-1">YouTube</label>
                                    <input type="url" className="w-full px-5 py-4 rounded-2xl border-2 border-[var(--border)] focus:border-red-600 focus:ring-4 focus:ring-red-600/10 outline-none transition-all font-medium text-[var(--text)] bg-[var(--bg)]" placeholder="https://youtube.com/@tu_canal" value={youtubeUrl} onChange={(e) => setYoutubeUrl(e.target.value)} />
                                </div>
                            </div>
                        </div>
                    ) : (
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
                                        { id: 'pastel', name: 'Pastel', desc: 'Suave & Rosa', colors: ['#f8bbd0', '#fdf2f8'] },
                                        { id: 'lilac', name: 'Lilac', desc: 'Dulce & Lavanda', colors: ['#d1c4e9', '#f3e5f5'] },
                                        { id: 'gray', name: 'Gris', desc: 'Neutro & Claro', colors: ['#9ca3af', '#f3f4f6'] },
                                        { id: 'dark-gray', name: 'Antracita', desc: 'Profundo & Serio', colors: ['#4b5563', '#1f2937'] },
                                    ].map((t) => (
                                        <button
                                            key={t.id}
                                            type="button"
                                            onClick={() => setTheme(t.id)}
                                            className={`p-3 md:p-4 rounded-2xl md:rounded-3xl border-2 transition-all text-left flex flex-col gap-3 md:gap-4 ${theme === t.id
                                                ? 'border-[var(--primary)] bg-[var(--primary)]/5 ring-4 ring-[var(--primary)]/5 shadow-[var(--shadow-strong)]'
                                                : 'border-[var(--border)] hover:border-[var(--text)]/10 bg-[var(--surface)]'
                                                }`}
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
                                        className={`p-4 md:p-6 rounded-2xl border-2 flex flex-col items-center justify-center gap-2 transition-all ${mode === 'light'
                                            ? 'border-yellow-500 bg-yellow-50/10 text-yellow-600'
                                            : 'border-[var(--border)] text-[var(--text)]/40 hover:border-[var(--border)]'
                                            }`}
                                    >
                                        <Sun className="w-5 h-5 md:w-6 md:h-6" />
                                        <span className="font-black text-[9px] md:text-[10px] tracking-widest">CLARO</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setMode('dark')}
                                        className={`p-4 md:p-6 rounded-2xl border-2 flex flex-col items-center justify-center gap-2 transition-all ${mode === 'dark'
                                            ? 'border-gray-900 bg-gray-900 text-white'
                                            : 'border-[var(--border)] text-[var(--text)]/40 hover:border-[var(--border)]'
                                            }`}
                                    >
                                        <Moon className="w-5 h-5 md:w-6 md:h-6" />
                                        <span className="font-black text-[9px] md:text-[10px] tracking-widest">OSCURO</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setMode('beige')}
                                        className={`p-4 md:p-6 rounded-2xl border-2 flex flex-col items-center justify-center gap-2 transition-all ${mode === 'beige'
                                            ? 'border-[#d2b48c] bg-[#f5f5dc] text-[#4a3728]'
                                            : 'border-[var(--border)] text-[var(--text)]/40 hover:border-[var(--border)]'
                                            }`}
                                    >
                                        <div className="w-5 h-5 md:w-6 md:h-6 rounded-full bg-[#f5f5dc] border border-[#d2b48c]" />
                                        <span className="font-black text-[9px] md:text-[10px] tracking-widest">BEIGE</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setMode('gray')}
                                        className={`p-4 md:p-6 rounded-2xl border-2 flex flex-col items-center justify-center gap-2 transition-all ${mode === 'gray'
                                            ? 'border-gray-400 bg-gray-100 text-gray-700'
                                            : 'border-[var(--border)] text-[var(--text)]/40 hover:border-[var(--border)]'
                                            }`}
                                    >
                                        <div className="w-5 h-5 md:w-6 md:h-6 rounded-full bg-gray-100 border border-gray-300" />
                                        <span className="font-black text-[9px] md:text-[10px] tracking-widest uppercase text-center leading-tight">Gris<br className="hidden sm:inline" /> Claro</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setMode('dark-gray')}
                                        className={`p-4 md:p-6 rounded-2xl border-2 flex flex-col items-center justify-center gap-2 transition-all ${mode === 'dark-gray'
                                            ? 'border-gray-600 bg-gray-700 text-gray-100'
                                            : 'border-[var(--border)] text-[var(--text)]/40 hover:border-[var(--border)]'
                                            }`}
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
                            className="w-full md:w-auto bg-[var(--primary)] text-[var(--bg)] px-10 py-5 rounded-[2rem] font-black text-xl hover:opacity-90 transition-all shadow-[var(--shadow-strong)] active:scale-[0.98] flex items-center justify-center gap-3 disabled:opacity-50"
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
        </div>
    );
}
