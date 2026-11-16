'use client';

import { useState, useEffect, useCallback } from 'react';
import { api } from '@/services/api';
import { storage } from '@/lib/storage';
import { useStore } from '@/contexts/StoreContext';
import type { StoreBanner } from '@/types/types';

export function useBanners() {
    const { activeStore } = useStore();
    const storeId = activeStore?.id;

    const [banners, setBanners] = useState<StoreBanner[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState(false);
    const [busyId, setBusyId] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    
    // Modal states
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingBanner, setEditingBanner] = useState<StoreBanner | null>(null);
    const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
    const [errorAlert, setErrorAlert] = useState<{ show: boolean, title: string, message: string }>({ 
        show: false, 
        title: '', 
        message: '' 
    });

    // Form states
    const [title, setTitle] = useState('');
    const [subtitle, setSubtitle] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [linkUrl, setLinkUrl] = useState('');
    const [position, setPosition] = useState<'HERO' | 'TOP_BAR' | 'FLOATING' | 'BETWEEN_PRODUCTS'>('HERO');
    const [isActive, setIsActive] = useState(true);
    const [focalPoint, setFocalPoint] = useState('center');
    const [startsAt, setStartsAt] = useState('');
    const [endsAt, setEndsAt] = useState('');

    const fetchBanners = useCallback(async () => {
        if (!storeId) return;
        setLoading(true);
        setLoadError(false);
        try {
            const data = await api.getBanners(storeId, false);
            setBanners(data);
        } catch (err: unknown) {
            console.error('Error fetching banners:', err);
            setLoadError(true);
            setErrorAlert({
                show: true,
                title: 'Error de carga',
                message: (err as Error)?.message || 'No se pudieron cargar los banners.'
            });
        } finally {
            setLoading(false);
        }
    }, [storeId]);

    useEffect(() => {
        if (storeId) {
            fetchBanners();
        }
    }, [storeId, fetchBanners]);

    // Handle open modal for new
    const handleOpenNewModal = () => {
        setEditingBanner(null);
        setTitle('');
        setSubtitle('');
        setImageUrl('');
        setLinkUrl('');
        setPosition('HERO');
        setIsActive(true);
        setFocalPoint('center');
        setStartsAt('');
        setEndsAt('');
        setIsModalOpen(true);
    };

    // Handle open modal for edit
    const handleOpenEditModal = (banner: StoreBanner) => {
        setEditingBanner(banner);
        setTitle(banner.title || '');
        setSubtitle(banner.subtitle || '');
        setImageUrl(banner.imageUrl || '');
        setLinkUrl(banner.linkUrl || '');
        setPosition(banner.position);
        setIsActive(banner.isActive);
        setFocalPoint(banner.focalPoint || 'center');
        const localDate = (value?: string | null) => { if (!value) return ''; const date = new Date(value); if (date.getUTCHours() === 0 && date.getUTCMinutes() === 0 && date.getUTCSeconds() === 0 && date.getUTCMilliseconds() === 0) return date.toISOString().slice(0, 10); return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`; };
        setStartsAt(localDate(banner.startsAt));
        setEndsAt(localDate(banner.endsAt));
        setIsModalOpen(true);
    };

    // Handle Image Upload
    const handleImageUpload = async (file: File) => {
        if (!storeId) return;
        setUploading(true);
        try {
            const publicUrl = await storage.uploadImage(file, `banners/${storeId}`);
            setImageUrl(publicUrl);
        } catch (err: unknown) {
            console.error('Error uploading image:', err);
            setErrorAlert({
                show: true,
                title: 'Error de subida',
                message: (err as Error)?.message || 'Error al subir la imagen a Supabase Storage.'
            });
        } finally {
            setUploading(false);
        }
    };

    // Save Banner (Create or Update)
    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!storeId) return;
        if (uploading || saving) return;
        const showValidation = (message: string) => setErrorAlert({ show: true, title: 'Revisa el banner', message });
        if (!imageUrl && position !== 'TOP_BAR') { showValidation('Añade una imagen para este tipo de banner.'); return; }
        if (position === 'TOP_BAR' && !title.trim() && !subtitle.trim()) { showValidation('Añade un título o subtítulo para la barra superior.'); return; }
        if (startsAt && endsAt && startsAt > endsAt) { showValidation('La fecha final debe ser igual o posterior a la fecha inicial.'); return; }
        const link = linkUrl.trim();
        if (link) {
            try { if (!link.startsWith('/') || link.startsWith('//')) { const parsed = new URL(link); if (!['http:', 'https:'].includes(parsed.protocol)) throw new Error(); } }
            catch { showValidation('Usa un enlace que empiece por https://, http:// o una ruta interna con /.'); return; }
        }

        setSaving(true);
        const data = {
            storeId,
            title: title.trim() || null,
            subtitle: subtitle.trim() || null,
            imageUrl: imageUrl || null,
            linkUrl: linkUrl.trim() || null,
            position,
            isActive,
            focalPoint,
            startsAt: startsAt ? new Date(`${startsAt}T00:00:00`).toISOString() : null,
            endsAt: endsAt ? new Date(`${endsAt}T23:59:59.999`).toISOString() : null,
        };

        try {
            if (editingBanner) {
                await api.updateBanner(editingBanner.id, data);
            } else {
                await api.createBanner(data);
            }
            setIsModalOpen(false);
            fetchBanners();
        } catch (err: unknown) {
            console.error('Error saving banner:', err);
            setErrorAlert({
                show: true,
                title: 'Error al guardar',
                message: (err as Error)?.message || 'No se pudo guardar el banner.'
            });
        } finally {
            setSaving(false);
        }
    };

    // Toggle Active Status
    const handleToggleActive = async (banner: StoreBanner) => {
        if (busyId) return;
        setBusyId(banner.id);
        try {
            // Optimistic update
            setBanners(prev => prev.map(b => b.id === banner.id ? { ...b, isActive: !b.isActive } : b));
            await api.updateBanner(banner.id, { isActive: !banner.isActive });
        } catch (err: unknown) {
            console.error('Error toggling banner status:', err);
            setBanners(prev => prev.map(b => b.id === banner.id ? { ...b, isActive: banner.isActive } : b));
            setErrorAlert({ show: true, title: 'Error al cambiar estado', message: (err as Error)?.message || 'No se pudo cambiar el estado del banner.' });
        } finally { setBusyId(null); }
    };

    // Delete Banner
    const handleDelete = async () => {
        if (!confirmDeleteId || busyId) return;
        setBusyId(confirmDeleteId);
        try {
            await api.deleteBanner(confirmDeleteId);
            setConfirmDeleteId(null);
            fetchBanners();
        } catch (err: unknown) {
            console.error('Error deleting banner:', err);
            setErrorAlert({
                show: true,
                title: 'Error al eliminar',
                message: (err as Error)?.message || 'No se pudo eliminar el banner.'
            });
        } finally { setBusyId(null); }
    };

    return {
        state: {
            banners,
            loading,
            loadError,
            busyId,
            saving,
            uploading,
            isModalOpen,
            editingBanner,
            confirmDeleteId,
            errorAlert,
            form: {
                title,
                subtitle,
                imageUrl,
                linkUrl,
                position,
                isActive,
                focalPoint,
                startsAt,
                endsAt,
            }
        },
        actions: {
            fetchBanners,
            setIsModalOpen,
            setConfirmDeleteId,
            setErrorAlert,
            setTitle,
            setSubtitle,
            setImageUrl,
            setLinkUrl,
            setPosition,
            setIsActive,
            setFocalPoint,
            setStartsAt,
            setEndsAt,
            handleOpenNewModal,
            handleOpenEditModal,
            handleImageUpload,
            handleSave,
            handleToggleActive,
            handleDelete,
        }
    };
}
