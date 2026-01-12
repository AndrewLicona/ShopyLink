
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShoppingBag, ArrowRight, Store, MessageCircle, Globe, Loader2, Image as ImageIcon, Plus as PlusIcon, Upload, X as CloseIcon } from 'lucide-react';
import { api } from '@/lib/api';
import { storage } from '@/lib/storage';

export default function SetupPage() {
    const [name, setName] = useState('');
    const [slug, setSlug] = useState('');
    const [hasManuallyEditedSlug, setHasManuallyEditedSlug] = useState(false);
    const [whatsapp, setWhatsapp] = useState('');
    const [logoUrl, setLogoUrl] = useState('');
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

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
        const value = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-');
        setSlug(value);
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
            setError('Error al subir el logo. Asegúrate de que el bucket existe.');
        } finally {
            setUploading(false);
        }
    };

    const handleCreateStore = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            await api.createStore({
                name,
                slug,
                whatsappNumber: whatsapp,
                logoUrl: logoUrl || undefined
            });
            router.push('/dashboard');
        } catch (err: any) {
            setError(err.message || 'Error al crear la tienda');
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
            <div className="max-w-xl w-full">
                {/* Progress Header */}
                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl shadow-xl shadow-blue-100 mb-6 group transition-transform hover:scale-110">
                        <ShoppingBag className="text-white w-8 h-8" />
                    </div>
                    <h1 className="text-3xl font-black text-gray-900">Configura tu tienda</h1>
                    <p className="text-gray-500 mt-2">Danos los detalles básicos para empezar a vender.</p>
                </div>

                <div className="bg-white rounded-[2.5rem] shadow-xl shadow-gray-200/50 border border-gray-100 p-8 md:p-12">
                    <form onSubmit={handleCreateStore} className="space-y-8">
                        {error && (
                            <div className="p-4 bg-red-50 text-red-600 text-sm rounded-2xl border border-red-100 animate-shake">
                                {error}
                            </div>
                        )}

                        <div className="space-y-6">
                            {/* Store Name */}
                            <div>
                                <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-3 px-1">
                                    <Store className="w-4 h-4 text-blue-500" />
                                    Nombre de la tienda
                                </label>
                                <input
                                    type="text"
                                    required
                                    className="w-full px-5 py-4 rounded-2xl border-2 border-gray-200 bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none text-lg font-bold text-gray-900 placeholder:text-gray-400"
                                    placeholder="Mi Tienda Increíble"
                                    value={name}
                                    onChange={handleNameChange}
                                />
                            </div>

                            {/* Store Slug */}
                            <div>
                                <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-3 px-1">
                                    <Globe className="w-4 h-4 text-blue-500" />
                                    Tu dirección web
                                </label>
                                <div className="flex items-center w-full px-5 py-4 rounded-2xl border-2 border-gray-200 focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-500/10 bg-white transition-all overflow-hidden">
                                    <span className="text-gray-400 font-bold text-sm whitespace-nowrap">shopylink.com/</span>
                                    <input
                                        type="text" required
                                        className="flex-1 ml-1 outline-none font-black text-gray-900 bg-transparent text-sm"
                                        value={slug} onChange={handleSlugChange}
                                    />
                                </div>
                                <p className="mt-2 text-[10px] text-gray-400 px-1 font-bold uppercase tracking-wider">Solo letras minúsculas, números y guiones.</p>
                            </div>

                            {/* WhatsApp */}
                            <div>
                                <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-3 px-1">
                                    <MessageCircle className="w-4 h-4 text-[#25D366]" />
                                    WhatsApp para pedidos
                                </label>
                                <input
                                    type="tel"
                                    required
                                    className="w-full px-5 py-4 rounded-2xl border-2 border-gray-200 bg-white focus:ring-4 focus:ring-[#25D366]/10 focus:border-[#25D366] transition-all outline-none text-lg font-bold text-gray-900 placeholder:text-gray-400"
                                    placeholder="+57 300 000 000"
                                    value={whatsapp}
                                    onChange={(e) => setWhatsapp(e.target.value)}
                                />
                                <p className="mt-2 text-[10px] text-gray-400 px-1 font-bold uppercase tracking-wider">Incluye el código de país (ej. +57, +34, +1).</p>
                            </div>

                            {/* Logo Upload */}
                            <div className="pt-2">
                                <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-3 px-1">
                                    <ImageIcon className="w-4 h-4 text-purple-500" />
                                    Logo de la tienda
                                </label>

                                <div className="flex flex-col items-center gap-6 p-8 border-2 border-dashed border-gray-200 rounded-[2.5rem] bg-gray-50/50 hover:border-blue-200 transition-colors group/upload relative">
                                    <div className="w-24 h-24 bg-white rounded-3xl shadow-sm border border-gray-200 flex items-center justify-center text-4xl overflow-hidden relative">
                                        {logoUrl ? (
                                            <>
                                                <img src={logoUrl} alt="Logo" className="w-full h-full object-contain" />
                                                <button
                                                    type="button"
                                                    onClick={() => setLogoUrl('')}
                                                    className="absolute top-1 right-1 p-1.5 bg-red-500 text-white rounded-lg opacity-0 group-hover/upload:opacity-100 transition-opacity shadow-lg"
                                                >
                                                    <CloseIcon className="w-3 h-3" />
                                                </button>
                                            </>
                                        ) : (
                                            <ImageIcon className="w-10 h-10 text-gray-200" />
                                        )}
                                        {uploading && (
                                            <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center">
                                                <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="w-full">
                                        <label className="flex items-center justify-center gap-2 w-full py-4 bg-white border-2 border-gray-200 rounded-2xl font-bold text-sm text-gray-600 cursor-pointer hover:bg-gray-50 active:scale-95 transition-all text-center shadow-sm">
                                            <Upload className="w-4 h-4" />
                                            {logoUrl ? 'Cambiar Logo' : 'Subir Logo'}
                                            <input type="file" className="hidden" accept="image/*" onChange={handleLogoUpload} disabled={uploading} />
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-blue-600 text-white py-5 rounded-[2rem] font-black text-xl hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 active:scale-[0.98] flex items-center justify-center gap-3 disabled:opacity-50 disabled:scale-100"
                        >
                            {loading ? (
                                <Loader2 className="w-6 h-6 animate-spin" />
                            ) : (
                                <>
                                    Comenzar mi tienda
                                    <ArrowRight className="w-6 h-6" />
                                </>
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}

function Plus({ className }: { className?: string }) {
    return (
        <svg fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className={className}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
    )
}
