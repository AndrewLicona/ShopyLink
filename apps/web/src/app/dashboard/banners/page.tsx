'use client';

import { useBanners } from '@/hooks/useBanners';
import { 
    Plus, 
    Trash2, 
    Edit3, 
    Eye, 
    Upload, 
    Loader2, 
    Calendar,
    Link as LinkIcon, 
    ToggleLeft, 
    ToggleRight, 
    X,
    Laptop,
    Smartphone,
    Info
} from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/atoms/Button';
import { LoadingState } from '@/components/atoms/LoadingState';
import { SectionHeader } from '@/components/molecules/SectionHeader';

export default function BannersPage() {
    const { state, actions } = useBanners();
    const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile'>('desktop');

    if (state.loading) {
        return <LoadingState message="Cargando banners..." fullPage />;
    }

    return (
        <div className="space-y-8 pb-20">
            {/* Header */}
            <SectionHeader
                title="Banners"
                description="Personaliza tu tienda con banners decorativos o de ofertas"
            >
                <Button
                    variant="primary"
                    onClick={actions.handleOpenNewModal}
                    className="p-3 md:px-6 md:py-3 rounded-2xl"
                    leftIcon={<Plus className="w-6 h-6 md:w-5 md:h-5" />}
                >
                    Nuevo Banner
                </Button>
            </SectionHeader>

            {/* Listado de Banners */}
            {state.banners.length === 0 ? (
                <div className="bg-[var(--surface)] border border-[var(--border)] p-12 text-center rounded-[2rem] flex flex-col items-center justify-center space-y-4">
                    <div className="w-16 h-16 bg-[var(--primary)]/5 rounded-2xl flex items-center justify-center text-[var(--primary)]">
                        <Eye className="w-8 h-8" />
                    </div>
                    <div className="space-y-1">
                        <h3 className="text-lg font-black text-[var(--text)]">Sin banners creados</h3>
                        <p className="text-sm font-medium text-[var(--text)]/40 max-w-xs">
                            Crea banners decorativos, informativos o de ofertas para darle identidad a tu tienda.
                        </p>
                    </div>
                    <Button variant="secondary" onClick={actions.handleOpenNewModal} className="rounded-xl px-5 py-2.5">
                        Crear mi primer banner
                    </Button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {state.banners.map((banner) => (
                        <div 
                            key={banner.id} 
                            className="bg-[var(--surface)]/60 backdrop-blur-xl border border-[var(--border)] rounded-3xl overflow-hidden flex flex-col group shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:border-[var(--primary)]/20 transition-all duration-500"
                        >
                            {/* Card Image */}
                            <div className="aspect-[21/9] w-full relative bg-[var(--secondary)] overflow-hidden flex items-center justify-center p-4">
                                {banner.imageUrl ? (
                                    <Image
                                        src={banner.imageUrl}
                                        alt={banner.title || 'Banner'}
                                        fill
                                        className="object-cover group-hover:scale-105 transition-transform duration-700"
                                    />
                                ) : (
                                    <div className="w-full h-full rounded-2xl bg-gradient-to-br from-[var(--primary)]/10 to-transparent border border-[var(--primary)]/10 flex flex-col items-center justify-center text-center select-none shadow-inner">
                                        <span className="text-[10px] font-black text-[var(--primary)] uppercase tracking-widest bg-white/50 backdrop-blur-sm px-3 py-1 rounded-full">
                                            {banner.title || 'Banner de Anuncio'}
                                        </span>
                                    </div>
                                )}
                                <div className="absolute top-3 left-3 bg-black/80 backdrop-blur-xl px-3 py-1.5 rounded-full text-[9px] font-black uppercase text-white tracking-widest shadow-xl flex items-center gap-1.5">
                                    <div className={cn("w-1.5 h-1.5 rounded-full", banner.isActive ? "bg-green-400" : "bg-white/40")} />
                                    {banner.position.replace('_', ' ')}
                                </div>
                            </div>

                            {/* Card Content */}
                            <div className="p-5 flex-1 flex flex-col justify-between space-y-5">
                                <div className="space-y-1.5">
                                    <h4 className="font-black text-[15px] text-[var(--text)] leading-tight truncate tracking-tight">
                                        {banner.title || <span className="opacity-30 italic font-medium">Sin título</span>}
                                    </h4>
                                    <p className="text-xs font-medium text-[var(--text)]/50 truncate">
                                        {banner.subtitle || <span className="opacity-30 italic">Sin subtítulo</span>}
                                    </p>
                                </div>

                                <div className="flex items-center justify-between pt-4 border-t border-[var(--border)]/60">
                                    {/* Quick Toggle Status */}
                                    <button 
                                        onClick={() => actions.handleToggleActive(banner)}
                                        className="flex items-center gap-2 group/toggle"
                                    >
                                        <div className={cn(
                                            "w-10 h-5 rounded-full p-0.5 transition-colors duration-300",
                                            banner.isActive ? "bg-[var(--primary)]" : "bg-[var(--text)]/10"
                                        )}>
                                            <div className={cn(
                                                "w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-300",
                                                banner.isActive ? "translate-x-5" : "translate-x-0"
                                            )} />
                                        </div>
                                        <span className="text-[10px] font-black uppercase tracking-wider text-[var(--text)]/40 group-hover/toggle:text-[var(--text)] transition-colors">
                                            {banner.isActive ? 'Público' : 'Oculto'}
                                        </span>
                                    </button>

                                    {/* Action Buttons */}
                                    <div className="flex items-center gap-1">
                                        <button 
                                            onClick={() => actions.handleOpenEditModal(banner)}
                                            className="w-8 h-8 flex items-center justify-center hover:bg-[var(--primary)]/10 rounded-full text-[var(--text)]/40 hover:text-[var(--primary)] transition-all duration-300"
                                            aria-label="Editar"
                                        >
                                            <Edit3 className="w-4 h-4" />
                                        </button>
                                        <button 
                                            onClick={() => actions.setConfirmDeleteId(banner.id)}
                                            className="w-8 h-8 flex items-center justify-center hover:bg-red-500/10 rounded-full text-red-500/50 hover:text-red-500 transition-all duration-300"
                                            aria-label="Eliminar"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal de Creación / Edición */}
            {state.isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm overflow-y-auto">
                    <div className="bg-[var(--surface)] w-full max-w-4xl rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[90vh] animate-in zoom-in-95 duration-200">
                        {/* Formulario */}
                        <form onSubmit={actions.handleSave} className="flex-1 p-6 md:p-8 overflow-y-auto space-y-6">
                            <div className="flex justify-between items-center pb-2 border-b border-[var(--border)]">
                                <h3 className="text-xl font-black text-[var(--text)] uppercase tracking-tight">
                                    {state.editingBanner ? 'Editar Banner' : 'Nuevo Banner'}
                                </h3>
                                <button 
                                    type="button" 
                                    onClick={() => actions.setIsModalOpen(false)}
                                    className="p-2 hover:bg-[var(--secondary)] rounded-xl transition-colors text-[var(--text)]/40"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="space-y-4">
                                {/* Position Selector */}
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text)]/40">Posición en Tienda</label>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                        {[
                                            { id: 'HERO', label: 'HERO', desc: 'Banner principal' },
                                            { id: 'TOP_BAR', label: 'TOP BAR', desc: 'Barra superior' },
                                            { id: 'BETWEEN_PRODUCTS', label: 'INTERCALADO', desc: 'Entre secciones' },
                                        ].map((opt) => (
                                            <button
                                                key={opt.id}
                                                type="button"
                                                onClick={() => actions.setPosition(opt.id as any)}
                                                className={cn(
                                                    "p-3 rounded-2xl border text-left transition-all duration-300 relative overflow-hidden",
                                                    state.form.position === opt.id 
                                                        ? "bg-[var(--primary)]/10 border-[var(--primary)] shadow-sm" 
                                                        : "bg-[var(--bg)] border-[var(--border)] hover:border-[var(--primary)]/30 hover:bg-[var(--primary)]/5"
                                                )}
                                            >
                                                <div className="flex items-center gap-2 mb-0.5 relative z-10">
                                                    <div className={cn("w-2 h-2 rounded-full transition-colors", state.form.position === opt.id ? "bg-[var(--primary)]" : "bg-[var(--text)]/20")} />
                                                    <span className={cn("font-black text-xs transition-colors", state.form.position === opt.id ? "text-[var(--primary)]" : "text-[var(--text)]")}>
                                                        {opt.label}
                                                    </span>
                                                </div>
                                                <span className="text-[10px] font-medium text-[var(--text)]/50 pl-4 block relative z-10">{opt.desc}</span>
                                                {state.form.position === opt.id && (
                                                    <div className="absolute top-0 right-0 w-16 h-16 bg-[var(--primary)]/5 rounded-full blur-xl -mr-8 -mt-8" />
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Text Fields (For all positions) */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text)]/40">Título (Opcional)</label>
                                            <input
                                                type="text"
                                                placeholder="Ej. Colección de Verano"
                                                className="w-full px-4 py-3 rounded-2xl bg-[var(--bg)] border border-[var(--border)] font-bold text-sm text-[var(--text)] focus:border-[var(--primary)] outline-none"
                                                value={state.form.title}
                                                onChange={(e) => actions.setTitle(e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text)]/40">Subtítulo (Opcional)</label>
                                            <input
                                                type="text"
                                                placeholder="Ej. Hasta 50% de descuento"
                                                className="w-full px-4 py-3 rounded-2xl bg-[var(--bg)] border border-[var(--border)] font-bold text-sm text-[var(--text)] focus:border-[var(--primary)] outline-none"
                                                value={state.form.subtitle}
                                                onChange={(e) => actions.setSubtitle(e.target.value)}
                                            />
                                        </div>
                                    </div>


                                {/* Image Upload */}
                                {state.form.position !== 'TOP_BAR' && (
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text)]/40">Imagen de Banner (Obligatorio para {state.form.position})</label>
                                        
                                        <label className="group relative w-full h-32 flex flex-col items-center justify-center gap-2 rounded-3xl border-2 border-dashed border-[var(--border)] hover:border-[var(--primary)] hover:bg-[var(--primary)]/5 transition-all cursor-pointer overflow-hidden bg-[var(--bg)]">
                                            <input
                                                type="file"
                                                accept="image/*"
                                                className="hidden"
                                                onChange={(e) => {
                                                    const file = e.target.files?.[0];
                                                    if (file) actions.handleImageUpload(file);
                                                }}
                                                disabled={state.uploading}
                                            />
                                            
                                            {state.form.imageUrl ? (
                                                <>
                                                    <Image src={state.form.imageUrl} alt="Banner subido" fill className="object-cover opacity-60 group-hover:opacity-40 transition-opacity" />
                                                    <div className="absolute inset-0 flex items-center justify-center flex-col z-10 opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-md">
                                                        <Upload className="w-6 h-6 text-white mb-1" />
                                                        <span className="text-xs font-bold text-white">Cambiar imagen</span>
                                                    </div>
                                                </>
                                            ) : state.uploading ? (
                                                <div className="flex flex-col items-center text-[var(--primary)]">
                                                    <Loader2 className="w-6 h-6 animate-spin mb-2" />
                                                    <span className="text-xs font-bold">Subiendo...</span>
                                                </div>
                                            ) : (
                                                <>
                                                    <div className="w-10 h-10 rounded-full bg-[var(--primary)]/10 flex items-center justify-center text-[var(--primary)] group-hover:scale-110 transition-transform">
                                                        <Upload className="w-5 h-5" />
                                                    </div>
                                                    <span className="text-xs font-bold text-[var(--text)]/60">Haz click para subir una imagen</span>
                                                </>
                                            )}
                                        </label>

                                        <div className="p-4 rounded-2xl bg-blue-500/5 border border-blue-500/10 text-blue-600 space-y-2 mt-3">
                                            <div className="flex items-center gap-2">
                                                <Info className="w-4 h-4 shrink-0" />
                                                <span className="text-xs font-black uppercase tracking-wider">Recomendación para {state.form.position}</span>
                                            </div>
                                            {state.form.position === 'HERO' ? (
                                                <div className="space-y-1 text-blue-600/70">
                                                    <p className="text-[10px] font-bold leading-relaxed">
                                                        El banner Hero ocupa todo el ancho de la tienda. Para que se vea nítido en PC y móvil usa:
                                                    </p>
                                                    <ul className="text-[10px] font-bold space-y-0.5 pl-3 list-disc">
                                                        <li><span className="text-blue-600">Tamaño ideal:</span> 1920 × 800 px  o  1200 × 500 px</li>
                                                        <li><span className="text-blue-600">Relación de aspecto:</span> ~16:6.5 (panorámico)</li>
                                                        <li><span className="text-blue-600">Peso máximo:</span> 500 KB — usa WebP o JPG comprimido</li>
                                                    </ul>
                                                </div>
                                            ) : (
                                                <div className="space-y-1 text-blue-600/70">
                                                    <p className="text-[10px] font-bold leading-relaxed">
                                                        El banner intercalado aparece entre las secciones de productos. Para que se vea bien en PC y móvil usa:
                                                    </p>
                                                    <ul className="text-[10px] font-bold space-y-0.5 pl-3 list-disc">
                                                        <li><span className="text-blue-600">Tamaño ideal:</span> 1920 × 600 px  o  1200 × 375 px</li>
                                                        <li><span className="text-blue-600">Relación de aspecto:</span> ~16:5 (muy panorámico)</li>
                                                        <li><span className="text-blue-600">Peso máximo:</span> 300 KB — usa WebP o JPG comprimido</li>
                                                    </ul>
                                                    <p className="text-[10px] font-bold text-blue-500/60 italic mt-1">
                                                        💡 El texto del título se superpone en la parte izquierda de la imagen.
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Link CTA */}
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text)]/40 flex items-center gap-1">
                                        <LinkIcon className="w-3.5 h-3.5" />
                                        Enlace de Acción (CTA - Opcional)
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="Ej. /dashboard/products o enlace externo"
                                        className="w-full px-4 py-3 rounded-2xl bg-[var(--bg)] border border-[var(--border)] font-bold text-sm text-[var(--text)] focus:border-[var(--primary)] outline-none"
                                        value={state.form.linkUrl}
                                        onChange={(e) => actions.setLinkUrl(e.target.value)}
                                    />
                                </div>

                                {/* Dates & Status */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text)]/40 flex items-center gap-1">
                                            <Calendar className="w-3.5 h-3.5" />
                                            Vigencia Desde (Opcional)
                                        </label>
                                        <input
                                            type="date"
                                            className="w-full px-4 py-3 rounded-2xl bg-[var(--bg)] border border-[var(--border)] font-bold text-sm text-[var(--text)] focus:border-[var(--primary)] outline-none"
                                            value={state.form.startsAt}
                                            onChange={(e) => actions.setStartsAt(e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text)]/40 flex items-center gap-1">
                                            <Calendar className="w-3.5 h-3.5" />
                                            Vigencia Hasta (Opcional)
                                        </label>
                                        <input
                                            type="date"
                                            className="w-full px-4 py-3 rounded-2xl bg-[var(--bg)] border border-[var(--border)] font-bold text-sm text-[var(--text)] focus:border-[var(--primary)] outline-none"
                                            value={state.form.endsAt}
                                            onChange={(e) => actions.setEndsAt(e.target.value)}
                                        />
                                    </div>
                                </div>

                                {/* Active Toggle */}
                                <div className="flex items-center gap-3 pt-2">
                                    <button
                                        type="button"
                                        onClick={() => actions.setIsActive(!state.form.isActive)}
                                        className="text-[var(--primary)]"
                                    >
                                        {state.form.isActive ? (
                                            <ToggleRight className="w-8 h-8 text-green-500" />
                                        ) : (
                                            <ToggleLeft className="w-8 h-8 text-[var(--text)]/30" />
                                        )}
                                    </button>
                                    <span className="text-xs font-black text-[var(--text)]/60">
                                        Mostrar inmediatamente en la tienda pública
                                    </span>
                                </div>
                            </div>

                            {/* Submit Buttons */}
                            <div className="flex gap-3 pt-4 border-t border-[var(--border)]">
                                <Button 
                                    type="button" 
                                    variant="secondary" 
                                    onClick={() => actions.setIsModalOpen(false)}
                                    className="flex-1 rounded-2xl py-3.5"
                                >
                                    Cancelar
                                </Button>
                                <Button 
                                    type="submit" 
                                    variant="primary" 
                                    disabled={state.saving || (state.form.position !== 'TOP_BAR' && !state.form.imageUrl)}
                                    className="flex-1 rounded-2xl py-3.5"
                                    leftIcon={state.saving ? <Loader2 className="w-5 h-5 animate-spin" /> : undefined}
                                >
                                    {state.editingBanner ? 'Actualizar' : 'Crear'}
                                </Button>
                            </div>
                        </form>

                        {/* Columna de Preview Visual (Fase 7 Real-time Preview) */}
                        <div className="flex w-full md:w-[350px] bg-[var(--secondary)] md:border-l border-t md:border-t-0 border-[var(--border)] p-6 flex-col space-y-6">
                            <div className="flex justify-between items-center border-b border-[var(--border)]/60 pb-3">
                                <h4 className="font-black text-xs uppercase tracking-widest text-[var(--text)]/60">
                                    Preview en Vivo
                                </h4>
                                <div className="flex bg-[var(--surface)] border border-[var(--border)] p-0.5 rounded-lg">
                                    <button 
                                        type="button" 
                                        onClick={() => setPreviewMode('desktop')}
                                        className={cn("p-1 rounded-md transition-all", previewMode === 'desktop' ? 'bg-[var(--primary)] text-white' : 'text-[var(--text)]/40 hover:text-[var(--text)]')}
                                    >
                                        <Laptop className="w-3.5 h-3.5" />
                                    </button>
                                    <button 
                                        type="button" 
                                        onClick={() => setPreviewMode('mobile')}
                                        className={cn("p-1 rounded-md transition-all", previewMode === 'mobile' ? 'bg-[var(--primary)] text-white' : 'text-[var(--text)]/40 hover:text-[var(--text)]')}
                                    >
                                        <Smartphone className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            </div>

                            {/* Simulated Device Frame */}
                            <div className="flex-1 flex items-center justify-center">
                                <div className={cn(
                                    "bg-[var(--surface)] border border-[var(--border)] rounded-2xl shadow-lg overflow-hidden flex flex-col relative transition-all duration-300",
                                    previewMode === 'mobile' ? 'w-[200px] h-[350px]' : 'w-full h-[220px]'
                                )}>
                                    {/* Mock Header */}
                                    <div className="bg-[var(--surface)] border-b border-[var(--border)]/40 p-2.5 flex justify-between items-center shrink-0">
                                        <div className="w-12 h-2.5 bg-[var(--text)]/10 rounded-full" />
                                        <div className="w-4 h-4 bg-[var(--primary)]/10 rounded-full" />
                                    </div>

                                    {/* Simulated Content Area */}
                                    <div className="flex-1 p-3 overflow-y-auto custom-scrollbar space-y-3 bg-[var(--bg)]">
                                        {/* TOP_BAR Preview */}
                                        {state.form.position === 'TOP_BAR' && (
                                            <div className="bg-[var(--primary)] text-white text-[7px] font-black text-center py-1.5 px-2 rounded-lg leading-tight shadow-sm select-none">
                                                {state.form.title || 'TEXTO DE ANUNCIO'}
                                                {state.form.subtitle && <span className="block opacity-80 text-[6px] font-medium mt-0.5">{state.form.subtitle}</span>}
                                            </div>
                                        )}

                                        {/* HERO Preview */}
                                        {state.form.position === 'HERO' && (
                                            <div className={cn(
                                                "w-full rounded-xl relative overflow-hidden bg-[var(--secondary)] flex items-center justify-center",
                                                previewMode === 'mobile' ? 'aspect-[16/7]' : 'aspect-[21/9]'
                                            )}>
                                                {state.form.imageUrl ? (
                                                    <Image
                                                        src={state.form.imageUrl}
                                                        alt="Preview"
                                                        fill
                                                        className="object-cover"
                                                    />
                                                ) : (
                                                    <div className="text-[8px] text-[var(--text)]/30 font-bold uppercase">Sin Imagen</div>
                                                )}
                                                <div className="absolute inset-0 bg-black/35 flex flex-col justify-end p-2 text-white">
                                                    <p className={cn(
                                                        "font-black truncate leading-none mb-0.5",
                                                        previewMode === 'mobile' ? 'text-[6px]' : 'text-[8px]'
                                                    )}>{state.form.title || 'Título de Oferta'}</p>
                                                    <p className={cn(
                                                        "font-medium opacity-80 truncate leading-none",
                                                        previewMode === 'mobile' ? 'text-[4.5px]' : 'text-[6px]'
                                                    )}>{state.form.subtitle || 'Detalle del banner decorativo'}</p>
                                                </div>
                                            </div>
                                        )}

                                        {/* Mock Category Bar */}
                                        <div className="flex gap-1.5 py-1">
                                            <div className="w-10 h-3 bg-[var(--primary)]/20 rounded-md shrink-0" />
                                            <div className="w-8 h-3 bg-[var(--text)]/5 rounded-md shrink-0" />
                                            <div className="w-12 h-3 bg-[var(--text)]/5 rounded-md shrink-0" />
                                        </div>

                                        {/* Mock Grid */}
                                        <div className="grid grid-cols-2 gap-2">
                                            <div className="aspect-[4/5] bg-[var(--surface)] border border-[var(--border)] rounded-xl p-1.5 flex flex-col justify-between">
                                                <div className="w-full aspect-square bg-[var(--secondary)] rounded-lg" />
                                                <div className="space-y-1 mt-1">
                                                    <div className="w-3/4 h-1.5 bg-[var(--text)]/10 rounded-full" />
                                                    <div className="w-1/2 h-1.5 bg-[var(--primary)]/20 rounded-full" />
                                                </div>
                                            </div>

                                            {/* BETWEEN_PRODUCTS Preview */}
                                            {state.form.position === 'BETWEEN_PRODUCTS' ? (
                                                <div className="col-span-2 aspect-[4/1] w-full rounded-xl relative overflow-hidden bg-[var(--secondary)] flex items-center justify-center">
                                                    {state.form.imageUrl ? (
                                                        <Image
                                                            src={state.form.imageUrl}
                                                            alt="Preview"
                                                            fill
                                                            className="object-cover"
                                                        />
                                                    ) : (
                                                        <div className="text-[8px] text-[var(--text)]/30 font-bold uppercase">Banner Central</div>
                                                    )}
                                                </div>
                                            ) : (
                                                <div className="aspect-[4/5] bg-[var(--surface)] border border-[var(--border)] rounded-xl p-1.5 flex flex-col justify-between">
                                                    <div className="w-full aspect-square bg-[var(--secondary)] rounded-lg" />
                                                    <div className="space-y-1 mt-1">
                                                        <div className="w-3/4 h-1.5 bg-[var(--text)]/10 rounded-full" />
                                                        <div className="w-1/2 h-1.5 bg-[var(--primary)]/20 rounded-full" />
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de Confirmación de Eliminación */}
            {state.confirmDeleteId && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-[var(--surface)] w-full max-w-sm rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="p-8 space-y-6 text-center flex flex-col items-center">
                            <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-2xl flex items-center justify-center">
                                <Trash2 className="w-8 h-8" />
                            </div>
                            <div className="space-y-2">
                                <h2 className="text-xl font-black text-[var(--text)] uppercase tracking-tight">¿Eliminar Banner?</h2>
                                <p className="text-[var(--text)]/40 font-bold text-xs">Esta acción es permanente y quitará el banner de la tienda.</p>
                            </div>
                            <div className="grid grid-cols-2 gap-3 w-full">
                                <button 
                                    onClick={() => actions.setConfirmDeleteId(null)} 
                                    className="py-3.5 px-4 rounded-2xl font-black text-xs transition-all active:scale-95 bg-[var(--bg)] text-[var(--text)]/40 border border-[var(--border)] hover:bg-[var(--secondary)]"
                                >
                                    Cancelar
                                </button>
                                <button 
                                    onClick={actions.handleDelete} 
                                    className="py-3.5 px-4 rounded-2xl font-black text-xs transition-all active:scale-95 bg-red-500 text-white shadow-lg shadow-red-500/20 hover:scale-[1.02]"
                                >
                                    Eliminar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
