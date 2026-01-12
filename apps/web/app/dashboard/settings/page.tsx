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
    X, // Added X import
    X as CloseIcon,
    ArrowLeft
} from 'lucide-react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { createClient } from '@/lib/supabase';
import { storage } from '@/lib/storage';

import { useStore } from '@/contexts/StoreContext';

export default function SettingsPage() {
    const { activeStore, refreshStores } = useStore();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Form state
    const [name, setName] = useState('');
    const [slug, setSlug] = useState('');
    const [hasManuallyEditedSlug, setHasManuallyEditedSlug] = useState(false);
    const [whatsapp, setWhatsapp] = useState('');
    const [logoUrl, setLogoUrl] = useState('');

    const router = useRouter();

    useEffect(() => {
        if (activeStore) {
            setName(activeStore.name);
            setSlug(activeStore.slug);
            setWhatsapp(activeStore.whatsappNumber || '');
            setLogoUrl(activeStore.logoUrl || '');
            setLoading(false);
        }
    }, [activeStore]);

    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newName = e.target.value;
        setName(newName);

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
            });
            await refreshStores();
            setSuccess(true);
            window.scrollTo({ top: 0, behavior: 'smooth' });
            setTimeout(() => setSuccess(false), 3000);
        } catch (err: any) {
            setError(err.message || 'Error al actualizar la tienda');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
                <p className="text-gray-500 font-medium">Cargando configuración...</p>
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
                    <div>
                        <h1 className="text-3xl font-black text-gray-900">Configuración</h1>
                        <p className="text-gray-500 mt-1">Personaliza los detalles de tu tienda.</p>
                    </div>
                </div>
                {success && (
                    <div className="flex items-center gap-2 bg-green-50 text-green-600 px-4 py-2 rounded-xl text-sm font-bold border border-green-100 animate-in fade-in slide-in-from-top-2">
                        <CheckCircle2 className="w-4 h-4" />
                        ¡Cambios guardados!
                    </div>
                )}
            </div>

            <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
                <form onSubmit={handleUpdateStore} className="p-8 md:p-12 space-y-10">
                    {error && (
                        <div className="p-4 bg-red-50 text-red-600 text-sm rounded-2xl border border-red-100 italic">
                            {error}
                        </div>
                    )}

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                        {/* Basic Info */}
                        <div className="lg:col-span-12 xl:col-span-7 space-y-8">
                            <h3 className="text-sm font-black uppercase tracking-widest text-blue-600">Información Básica</h3>

                            <div className="grid grid-cols-1 gap-6">
                                {/* Store Info */}
                                <div className="space-y-6">
                                    <div>
                                        <label className="text-sm font-bold text-gray-700 mb-2 block px-1">Nombre de la tienda</label>
                                        <input
                                            type="text"
                                            className="w-full px-5 py-4 rounded-2xl border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-bold text-gray-900 bg-white"
                                            value={name}
                                            onChange={handleNameChange}
                                        />
                                    </div>

                                    <div>
                                        <label className="text-sm font-bold text-gray-700 mb-2 block px-1">Enlace de tu tienda</label>
                                        <div className="flex items-center w-full px-5 py-4 rounded-2xl border-2 border-gray-200 focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-500/10 bg-white transition-all overflow-hidden">
                                            <span className="text-gray-400 font-bold text-sm whitespace-nowrap shrink-0">shopylink.com/</span>
                                            <input
                                                type="text"
                                                className="flex-1 ml-1 outline-none font-black text-gray-900 bg-transparent text-sm min-w-0"
                                                value={slug}
                                                onChange={handleSlugChange}
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="text-sm font-bold text-gray-700 mb-2 block px-1 text-[#25D366]">WhatsApp para pedidos</label>
                                        <input
                                            type="tel"
                                            className="w-full px-5 py-4 rounded-2xl border-2 border-gray-200 focus:border-[#25D366] focus:ring-4 focus:ring-[#25D366]/10 outline-none transition-all font-bold text-gray-900 bg-white"
                                            placeholder="+57 300 000 000"
                                            value={whatsapp}
                                            onChange={(e) => setWhatsapp(e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Branding */}
                        <div className="lg:col-span-12 xl:col-span-5 space-y-8">
                            <h3 className="text-sm font-black uppercase tracking-widest text-purple-600">Identidad Visual</h3>

                            <div className="space-y-6">
                                <label className="text-sm font-bold text-gray-700 mb-2 block px-1">
                                    Logo de la Tienda
                                </label>

                                <div className="p-8 border-2 border-dashed border-gray-200 rounded-[2.5rem] bg-gray-50/50 flex flex-col items-center justify-center gap-6 relative group/logo transition-colors hover:border-blue-200">
                                    <div className="w-32 h-32 md:w-40 md:h-40 bg-white rounded-[2rem] shadow-sm border border-gray-200 flex items-center justify-center text-6xl overflow-hidden relative">
                                        {logoUrl ? (
                                            <>
                                                <img src={logoUrl} alt="Logo" className="w-full h-full object-contain" />
                                                <button
                                                    type="button"
                                                    onClick={() => setLogoUrl('')}
                                                    className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-xl opacity-0 group-hover/logo:opacity-100 transition-opacity shadow-lg"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </>
                                        ) : (
                                            <Store className="w-16 h-16 text-gray-200" />
                                        )}
                                        {uploading && (
                                            <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center">
                                                <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="w-full max-w-[200px]">
                                        <label className="flex items-center justify-center gap-2 w-full py-4 bg-white border-2 border-gray-200 rounded-2xl font-bold text-sm text-gray-600 cursor-pointer hover:bg-gray-50 active:scale-95 transition-all shadow-sm">
                                            <Upload className="w-4 h-4" />
                                            {logoUrl ? 'Cambiar Logo' : 'Subir Logo'}
                                            <input type="file" className="hidden" accept="image/*" onChange={handleLogoUpload} disabled={uploading} />
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="pt-8 border-t border-gray-50 flex justify-end">
                        <button
                            type="submit"
                            disabled={saving}
                            className="w-full md:w-auto bg-blue-600 text-white px-10 py-5 rounded-[2rem] font-black text-xl hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 active:scale-[0.98] flex items-center justify-center gap-3 disabled:opacity-50"
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
