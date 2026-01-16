
'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';
import { User, Loader2, CheckCircle2, AlertCircle, Store as StoreIcon } from 'lucide-react';
import { useStore } from '@/contexts/StoreContext';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

// Modular Components
import { ProfileTab } from './components/ProfileTab';
import { StoreTab } from './components/StoreTab';

export default function SettingsPage() {
    const { activeStore, refreshStores } = useStore();
    const [activeTab, setActiveTab] = useState<'profile' | 'store'>('profile');

    // Profile State
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [username, setUsername] = useState('');
    const [avatarUrl, setAvatarUrl] = useState('');

    // Password State
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // Store State
    const [storeName, setStoreName] = useState('');
    const [storeSlug, setStoreSlug] = useState('');
    const [hasManuallyEditedSlug, setHasManuallyEditedSlug] = useState(false);
    const [suggestedSlug, setSuggestedSlug] = useState<string | null>(null);
    const [storeLogo, setStoreLogo] = useState('');
    const [whatsapp, setWhatsapp] = useState('');


    // Social Media States
    const [instagram, setInstagram] = useState('');
    const [facebook, setFacebook] = useState('');
    const [tiktok, setTiktok] = useState('');
    const [twitter, setTwitter] = useState('');
    const [pinterest, setPinterest] = useState('');
    const [youtube, setYoutube] = useState('');

    // Delivery States
    const [deliveryEnabled, setDeliveryEnabled] = useState(true);
    const [deliveryPrice, setDeliveryPrice] = useState('0');

    // Appearance
    const [theme, setTheme] = useState('classic');
    const [mode, setMode] = useState('light');
    const [applyToDashboard, setApplyToDashboard] = useState(false);

    // Deletion State
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deleteConfirmationName, setDeleteConfirmationName] = useState('');
    const [deleting, setDeleting] = useState(false);

    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    useEffect(() => {
        const loadUser = async () => {
            const supabase = createClient();
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
                setEmail(session.user.email || '');
                setFullName(session.user.user_metadata?.full_name || '');
                setUsername(session.user.user_metadata?.username || '');
                setAvatarUrl(session.user.user_metadata?.avatar_url || '');

                if (!session.user.user_metadata?.username) {
                    const { data: userData } = await supabase
                        .from('User')
                        .select('username')
                        .eq('id', session.user.id)
                        .single();
                    if (userData?.username) setUsername(userData.username);
                }
            }

            if (activeStore) {
                setStoreName(activeStore.name || '');
                setStoreSlug(activeStore.slug || '');
                setStoreLogo(activeStore.logoUrl || '');
                setWhatsapp(activeStore.whatsappNumber || '');

                setInstagram(activeStore.instagramUrl || '');
                setFacebook(activeStore.facebookUrl || '');
                setTiktok(activeStore.tiktokUrl || '');
                setTwitter(activeStore.twitterUrl || '');
                setPinterest(activeStore.pinterestUrl || '');
                setYoutube(activeStore.youtubeUrl || '');
                setTheme(activeStore.theme || 'classic');
                setMode(activeStore.mode || 'light');
                setApplyToDashboard(activeStore.applyThemeToDashboard || false);
                setDeliveryEnabled(activeStore.deliveryEnabled ?? true);
                setDeliveryPrice(activeStore.deliveryPrice || 'Gratis');
            }

            setLoading(false);
        };
        loadUser();
    }, [activeStore]);

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setError(null);
        setSuccess(null);

        try {
            const supabase = createClient();
            const { error: updateError } = await supabase.auth.updateUser({
                email: email !== (await supabase.auth.getUser()).data.user?.email ? email : undefined,
                data: {
                    full_name: fullName,
                    avatar_url: avatarUrl
                }
            });

            if (updateError) throw updateError;
            setSuccess('Perfil actualizado con éxito.');
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Error al actualizar el perfil.');
        } finally {
            setSaving(false);
        }
    };

    const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploading(true);
        setError(null);

        try {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('No se encontró el usuario');

            const fileExt = file.name.split('.').pop();
            const fileName = `${user.id}-${Math.random()}.${fileExt}`;
            const filePath = `avatars/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('shopy-images')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('shopy-images')
                .getPublicUrl(filePath);

            setAvatarUrl(publicUrl);
            await supabase.auth.updateUser({ data: { avatar_url: publicUrl } });
            setSuccess('Avatar actualizado con éxito.');
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Error al subir el avatar.');
        } finally {
            setUploading(false);
        }
    };

    const handleNameChange = (newName: string) => {
        setStoreName(newName);
        setSuggestedSlug(null);

        if (!hasManuallyEditedSlug) {
            const newSlug = newName
                .toLowerCase()
                .normalize("NFD")
                .replace(/[\u0300-\u036f]/g, "")
                .replace(/[^a-z0-9]/g, '-')
                .replace(/-+/g, '-')
                .replace(/^-|-$/g, '');
            setStoreSlug(newSlug);
        }
    };

    const handleUpdateStore = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!activeStore) return;
        setSaving(true);
        setError(null);
        setSuccess(null);

        try {
            await api.updateStore(activeStore.id, {
                name: storeName,
                slug: storeSlug,
                logoUrl: storeLogo,
                whatsappNumber: whatsapp,

                instagramUrl: instagram,
                facebookUrl: facebook,
                tiktokUrl: tiktok,
                twitterUrl: twitter,
                pinterestUrl: pinterest,
                youtubeUrl: youtube,
                theme: theme,
                mode: mode,
                applyThemeToDashboard: applyToDashboard,
                deliveryEnabled: deliveryEnabled,
                deliveryPrice: deliveryPrice
            });
            await refreshStores();
            setSuccess('Tienda actualizada con éxito.');
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Error al actualizar la tienda.';
            setError(message);
            if (message.includes('uso') || message.includes('already in use')) {
                const suggestion = `${storeSlug}-${Math.floor(Math.random() * 90) + 10}`;
                setSuggestedSlug(suggestion);
            }
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteStore = async () => {
        if (!activeStore || deleteConfirmationName !== activeStore.name) return;

        setDeleting(true);
        try {
            await api.deleteStore(activeStore.id);
            await refreshStores();
            window.location.href = '/dashboard';
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Error al eliminar la tienda.');
            setIsDeleteModalOpen(false);
        } finally {
            setDeleting(false);
        }
    };

    const handleStoreLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !activeStore) return;
        setUploading(true);
        setError(null);

        try {
            const supabase = createClient();
            const fileExt = file.name.split('.').pop();
            const fileName = `store-${activeStore.id}-${Math.random()}.${fileExt}`;
            const filePath = `stores/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('shopy-images')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('shopy-images')
                .getPublicUrl(filePath);

            setStoreLogo(publicUrl);
            setSuccess('Logo subido. No olvides guardar los cambios.');
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Error al subir el logo.');
        } finally {
            setUploading(false);
        }
    };

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            setError('Las contraseñas no coinciden.');
            return;
        }
        if (newPassword.length < 8) {
            setError('La contraseña debe tener al menos 8 caracteres.');
            return;
        }

        setSaving(true);
        setError(null);
        setSuccess(null);

        try {
            const supabase = createClient();
            const { error: updateError } = await supabase.auth.updateUser({ password: newPassword });
            if (updateError) throw updateError;
            setSuccess('Contraseña actualizada con éxito.');
            setNewPassword('');
            setConfirmPassword('');
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Error al cambiar la contraseña.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 animate-spin text-[var(--primary)]" />
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header Improved */}
            <div className="flex flex-col gap-2">
                <div className="flex items-center gap-3">
                    <h1 className="text-3xl font-black text-[var(--text)] tracking-tighter italic">Ajustes</h1>
                    <div className="h-2 w-2 rounded-full bg-[var(--primary)] animate-pulse" />
                </div>
                <p className="text-[var(--text)]/40 font-bold uppercase tracking-[0.2em] text-[10px]">Configuración Global de tu Negocio</p>
            </div>

            {/* Premium Tabs */}
            <div className="flex p-1.5 bg-[var(--surface)] border border-[var(--border)] rounded-[1.5rem] w-fit shadow-sm relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-r from-[var(--primary)]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                <button
                    onClick={() => setActiveTab('profile')}
                    className={cn(
                        "flex items-center gap-2.5 px-8 py-3 rounded-[1.1rem] font-black text-sm transition-all relative z-10",
                        activeTab === 'profile'
                            ? "bg-[var(--bg)] text-[var(--primary)] shadow-sm border border-[var(--border)] scale-[1.02]"
                            : "text-[var(--text)]/40 hover:text-[var(--text)]/60 hover:bg-[var(--bg)]/50"
                    )}
                >
                    <User className={cn("w-4 h-4 transition-transform", activeTab === 'profile' && "scale-110")} />
                    <span>Mi Perfil</span>
                </button>
                <button
                    onClick={() => setActiveTab('store')}
                    className={cn(
                        "flex items-center gap-2.5 px-8 py-3 rounded-[1.1rem] font-black text-sm transition-all relative z-10",
                        activeTab === 'store'
                            ? "bg-[var(--bg)] text-[var(--primary)] shadow-sm border border-[var(--border)] scale-[1.02]"
                            : "text-[var(--text)]/40 hover:text-[var(--text)]/60 hover:bg-[var(--bg)]/50"
                    )}
                >
                    <StoreIcon className={cn("w-4 h-4 transition-transform", activeTab === 'store' && "scale-110")} />
                    <span>Mi Tienda</span>
                </button>
            </div>

            {/* Messages */}
            <AnimatePresence mode="wait">
                {error && (
                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="p-5 bg-red-50 text-red-600 rounded-[2rem] border border-red-100 flex items-center gap-4 font-black text-sm shadow-xl shadow-red-500/5">
                        <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center flex-shrink-0">
                            <AlertCircle className="w-5 h-5" />
                        </div>
                        {error}
                    </motion.div>
                )}
                {success && (
                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="p-5 bg-green-50 text-green-600 rounded-[2rem] border border-green-100 flex items-center gap-4 font-black text-sm shadow-xl shadow-green-500/5">
                        <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center flex-shrink-0">
                            <CheckCircle2 className="w-5 h-5" />
                        </div>
                        {success}
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence mode="wait">
                {activeTab === 'profile' ? (
                    <ProfileTab
                        fullName={fullName} setFullName={setFullName}
                        email={email} setEmail={setEmail}
                        username={username}
                        avatarUrl={avatarUrl}
                        uploading={uploading}
                        saving={saving}
                        handleAvatarUpload={handleAvatarUpload}
                        handleUpdateProfile={handleUpdateProfile}
                        newPassword={newPassword} setNewPassword={setNewPassword}
                        confirmPassword={confirmPassword} setConfirmPassword={setConfirmPassword}
                        showNewPassword={showNewPassword} setShowNewPassword={setShowNewPassword}
                        showConfirmPassword={showConfirmPassword} setShowConfirmPassword={setShowConfirmPassword}
                        handleChangePassword={handleChangePassword}
                    />
                ) : (
                    <StoreTab
                        storeName={storeName} setStoreName={handleNameChange}
                        storeSlug={storeSlug} setStoreSlug={(val) => { setStoreSlug(val); setHasManuallyEditedSlug(true); }}
                        suggestedSlug={suggestedSlug} setSuggestedSlug={setSuggestedSlug}
                        storeLogo={storeLogo}
                        whatsapp={whatsapp} setWhatsapp={setWhatsapp}
                        instagram={instagram} setInstagram={setInstagram}
                        facebook={facebook} setFacebook={setFacebook}
                        tiktok={tiktok} setTiktok={setTiktok}
                        twitter={twitter} setTwitter={setTwitter}
                        pinterest={pinterest} setPinterest={setPinterest}
                        youtube={youtube} setYoutube={setYoutube}
                        theme={theme} setTheme={setTheme}
                        mode={mode} setMode={setMode}
                        applyToDashboard={applyToDashboard} setApplyToDashboard={setApplyToDashboard}
                        deliveryEnabled={deliveryEnabled} setDeliveryEnabled={setDeliveryEnabled}
                        deliveryPrice={deliveryPrice} setDeliveryPrice={setDeliveryPrice}
                        saving={saving} uploading={uploading}
                        handleUpdateStore={handleUpdateStore}
                        handleStoreLogoUpload={handleStoreLogoUpload}
                        isDeleteModalOpen={isDeleteModalOpen} setIsDeleteModalOpen={setIsDeleteModalOpen}
                        deleteConfirmationName={deleteConfirmationName} setDeleteConfirmationName={setDeleteConfirmationName}
                        deleting={deleting} handleDeleteStore={handleDeleteStore}
                        activeStoreName={activeStore?.name || ''}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}
