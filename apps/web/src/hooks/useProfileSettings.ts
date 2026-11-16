'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';
import { storage } from '@/lib/storage';

export function useProfileSettings() {
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState(false);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [success, setSuccess] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [lastAction, setLastAction] = useState<'profile' | 'avatar' | 'password' | null>(null);

    // Profile State
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [username, setUsername] = useState('');
    const [avatarUrl, setAvatarUrl] = useState('');

    // Password State
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    useEffect(() => {
        const loadUser = async () => {
            try {
                const supabase = createClient();
                const { data: { session }, error: sessionError } = await supabase.auth.getSession();
                if (sessionError) throw sessionError;
                if (!session) throw new Error('No se encontró una sesión activa.');
                setEmail(session.user.email || '');
                setFullName(session.user.user_metadata?.full_name || '');
                setUsername(session.user.user_metadata?.username || '');
                setAvatarUrl(session.user.user_metadata?.avatar_url || '');
                if (!session.user.user_metadata?.username) {
                    const { data: userData } = await supabase.from('User').select('username').eq('id', session.user.id).single();
                    if (userData?.username) setUsername(userData.username);
                }
            } catch (err) {
                setLoadError(true);
                setError(err instanceof Error ? err.message : 'No se pudo cargar el perfil.');
                setLastAction('profile');
            } finally { setLoading(false); }
        };
        loadUser();
    }, []);

    const handleUpdateProfile = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (saving || uploading) return;
        setLastAction('profile');
        setSaving(true);
        setError(null);
        setSuccess(null);

        try {
            const supabase = createClient();
            const { data: currentUser, error: userError } = await supabase.auth.getUser();
            if (userError) throw userError;
            const emailChanged = email.trim() !== currentUser.user?.email;
            const { error: updateError } = await supabase.auth.updateUser({
                email: emailChanged ? email.trim() : undefined,
                data: {
                    full_name: fullName,
                    avatar_url: avatarUrl
                }
            });

            if (updateError) throw updateError;
            setSuccess(emailChanged ? 'Perfil actualizado. Revisa tu correo para confirmar el cambio de dirección si se solicita.' : 'Perfil actualizado con éxito.');
        } catch (err: unknown) {
            setError((err as Error)?.message || 'Error al actualizar el perfil.');
        } finally {
            setSaving(false);
        }
    };

    const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        e.target.value = '';
        if (!file || uploading || saving) return;
        setLastAction('avatar');
        setUploading(true);
        setError(null);
        setSuccess(null);
        try {
            const supabase = createClient();
            const url = await storage.uploadImage(file, 'avatars');
            const { error: updateError } = await supabase.auth.updateUser({ data: { avatar_url: url } });
            if (updateError) throw updateError;
            setAvatarUrl(url);
            setSuccess('Foto de perfil actualizada.');
        } catch (err: unknown) {
            setError((err as Error)?.message || 'Error al subir la foto.');
        } finally { setUploading(false); }
    };

    const handleRemoveAvatar = async () => {
        if (uploading || saving) return;
        setLastAction('avatar');
        setUploading(true);
        setError(null);
        setSuccess(null);
        try {
            const supabase = createClient();
            const { error: updateError } = await supabase.auth.updateUser({ data: { avatar_url: '' } });
            if (updateError) throw updateError;
            setAvatarUrl('');
            setSuccess('Foto de perfil eliminada.');
        } catch (err: unknown) {
            setError((err as Error)?.message || 'Error al eliminar la foto.');
        } finally { setUploading(false); }
    };

    const handleChangePassword = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (saving || uploading) return;
        setLastAction('password');
        setError(null);
        setSuccess(null);
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
            setError((err as Error)?.message || 'Error al cambiar la contraseña.');
        } finally {
            setSaving(false);
        }
    };

    return {
        state: {
            loading, loadError, saving, uploading, success, error, lastAction,
            fullName, email, username, avatarUrl,
            newPassword, confirmPassword, showNewPassword, showConfirmPassword
        },
        actions: {
            setFullName,
            setEmail,
            setAvatarUrl,
            setNewPassword,
            setConfirmPassword,
            setShowNewPassword,
            setShowConfirmPassword,
            handleUpdateProfile,
            handleAvatarUpload,
            handleRemoveAvatar,
            handleChangePassword,
            setError,
            setSuccess
        }
    };
}
