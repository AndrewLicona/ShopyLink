'use client';

import { useState, useEffect } from 'react';
import { api } from '@/services/api';
import { useStore } from '@/contexts/StoreContext';
import { storage } from '@/lib/storage';
import { generateSlug } from '@/lib/utils';

export function useStoreSettings() {
    const { activeStore, refreshStores } = useStore();

    // Status State
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [success, setSuccess] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    // Form State
    const [name, setName] = useState('');
    const [slug, setSlug] = useState('');
    const [autoGenerateSlug, setAutoGenerateSlug] = useState(true);
    const [whatsapp, setWhatsapp] = useState('');
    const [logoUrl, setLogoUrl] = useState('');

    // Social Media
    const [instagramUrl, setInstagramUrl] = useState('');
    const [facebookUrl, setFacebookUrl] = useState('');
    const [tiktokUrl, setTiktokUrl] = useState('');
    const [twitterUrl, setTwitterUrl] = useState('');
    const [pinterestUrl, setPinterestUrl] = useState('');
    const [youtubeUrl, setYoutubeUrl] = useState('');

    // Delivery
    const [deliveryEnabled, setDeliveryEnabled] = useState(true);
    const [deliveryPrice, setDeliveryPrice] = useState('Gratis');

    // Appearance
    const [theme, setTheme] = useState('classic');
    const [mode, setMode] = useState('light');
    const [applyToDashboard, setApplyToDashboard] = useState(false);

    // Deletion
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deleteConfirmationName, setDeleteConfirmationName] = useState('');
    const [deleting, setDeleting] = useState(false);

    const [suggestedSlug, setSuggestedSlug] = useState<string | null>(null);

    // Initialize state from activeStore
    useEffect(() => {
        if (activeStore) {
            setName(activeStore.name || '');
            setSlug(activeStore.slug || '');
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
            setDeliveryEnabled(activeStore.deliveryEnabled ?? true);
            setDeliveryPrice(activeStore.deliveryPrice || 'Gratis');
            setLoading(false);
        }
    }, [activeStore]);

    const handleUpdateStore = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!activeStore) return;

        setSaving(true);
        setError(null);
        setSuccess(null);

        try {
            await api.updateStore(activeStore.id, {
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
                applyThemeToDashboard: applyToDashboard,
                deliveryEnabled,
                deliveryPrice
            });
            await refreshStores();
            setSuccess('Tienda actualizada con éxito.');
            setTimeout(() => setSuccess(null), 3000);
        } catch (err: any) {
            console.error('Update Store Error:', err);
            const message = err?.message || 'Error al actualizar la tienda';
            setError(message);
            if (message.includes('uso') || message.includes('already in use')) {
                setSuggestedSlug(`${slug}-${Math.floor(Math.random() * 90) + 10}`);
            }
        } finally {
            setSaving(false);
        }
    };

    const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        setError(null);
        try {
            const url = await storage.uploadImage(file, 'logos');
            setLogoUrl(url);
            setSuccess('Logo subido correctamente.');
        } catch (err: any) {
            setError('Error al subir el logo.');
            console.error(err);
        } finally {
            setUploading(false);
        }
    };

    const handleDeleteStore = async () => {
        if (!activeStore || deleteConfirmationName !== activeStore.name) return;

        setDeleting(true);
        try {
            await api.deleteStore(activeStore.id);
            await refreshStores();
            window.location.href = '/dashboard';
        } catch (err) {
            console.error('Delete Store Error:', err);
            setError('Error al eliminar la tienda');
            setIsDeleteModalOpen(false);
        } finally {
            setDeleting(false);
        }
    };

    const handleNameChange = (newName: string) => {
        setName(newName);
        if (autoGenerateSlug) {
            setSlug(generateSlug(newName));
        }
    };

    return {
        state: {
            loading, saving, uploading, success, error,
            name, slug, autoGenerateSlug, whatsapp, logoUrl,
            instagramUrl, facebookUrl, tiktokUrl, twitterUrl, pinterestUrl, youtubeUrl,
            deliveryEnabled, deliveryPrice,
            theme, mode, applyToDashboard,
            isDeleteModalOpen, deleteConfirmationName, deleting,
            suggestedSlug
        },
        actions: {
            setName: handleNameChange,
            setSlug,
            setAutoGenerateSlug,
            setWhatsapp,
            setLogoUrl,
            setInstagramUrl,
            setFacebookUrl,
            setTiktokUrl,
            setTwitterUrl,
            setPinterestUrl,
            setYoutubeUrl,
            setDeliveryEnabled,
            setDeliveryPrice,
            setTheme,
            setMode,
            setApplyToDashboard,
            setIsDeleteModalOpen,
            setDeleteConfirmationName,
            setSuggestedSlug,
            handleUpdateStore,
            handleLogoUpload,
            handleDeleteStore
        }
    };
}
