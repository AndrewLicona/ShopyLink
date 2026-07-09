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
    const [startsAt, setStartsAt] = useState('');
    const [endsAt, setEndsAt] = useState('');

    const fetchBanners = useCallback(async () => {
        if (!storeId) return;
        setLoading(true);
        try {
            const data = await api.getBanners(storeId, false);
            setBanners(data);
        } catch (err: any) {
            console.error('Error fetching banners:', err);
            setErrorAlert({
                show: true,
                title: 'Error de carga',
                message: err.message || 'No se pudieron cargar los banners.'
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
        setStartsAt((banner.startsAt ? new Date(banner.startsAt).toISOString().split('T')[0] : '') || '');
        setEndsAt((banner.endsAt ? new Date(banner.endsAt).toISOString().split('T')[0] : '') || '');
        setIsModalOpen(true);
    };

    // Handle Image Upload
    const handleImageUpload = async (file: File) => {
        if (!storeId) return;
        setUploading(true);
        try {
            const publicUrl = await storage.uploadImage(file, `banners/${storeId}`);
            setImageUrl(publicUrl);
        } catch (err: any) {
            console.error('Error uploading image:', err);
            setErrorAlert({
                show: true,
                title: 'Error de subida',
                message: err.message || 'Error al subir la imagen a Supabase Storage.'
            });
        } finally {
            setUploading(false);
        }
    };

    // Save Banner (Create or Update)
    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!storeId) return;
        if (!imageUrl && position !== 'TOP_BAR') return;

        setSaving(true);
        const data = {
            storeId,
            title: title || null,
            subtitle: subtitle || null,
            imageUrl: imageUrl || null,
            linkUrl: linkUrl || null,
            position,
            isActive,
            startsAt: startsAt ? new Date(startsAt).toISOString() : null,
            endsAt: endsAt ? new Date(endsAt).toISOString() : null,
        };

        try {
            if (editingBanner) {
                await api.updateBanner(editingBanner.id, data);
            } else {
                await api.createBanner(data);
            }
            setIsModalOpen(false);
            fetchBanners();
        } catch (err: any) {
            console.error('Error saving banner:', err);
            setErrorAlert({
                show: true,
                title: 'Error al guardar',
                message: err.message || 'No se pudo guardar el banner.'
            });
        } finally {
            setSaving(false);
        }
    };

    // Toggle Active Status
    const handleToggleActive = async (banner: StoreBanner) => {
        try {
            // Optimistic update
            setBanners(prev => prev.map(b => b.id === banner.id ? { ...b, isActive: !b.isActive } : b));
            await api.updateBanner(banner.id, { isActive: !banner.isActive });
        } catch (err: any) {
            console.error('Error toggling banner status:', err);
            // Revert state
            fetchBanners();
        }
    };

    // Delete Banner
    const handleDelete = async () => {
        if (!confirmDeleteId) return;
        try {
            await api.deleteBanner(confirmDeleteId);
            setConfirmDeleteId(null);
            fetchBanners();
        } catch (err: any) {
            console.error('Error deleting banner:', err);
            setErrorAlert({
                show: true,
                title: 'Error al eliminar',
                message: err.message || 'No se pudo eliminar el banner.'
            });
        }
    };

    return {
        state: {
            banners,
            loading,
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
                startsAt,
                endsAt,
            }
        },
        actions: {
            setIsModalOpen,
            setConfirmDeleteId,
            setErrorAlert,
            setTitle,
            setSubtitle,
            setImageUrl,
            setLinkUrl,
            setPosition,
            setIsActive,
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
