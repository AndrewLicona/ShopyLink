'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';
import { storage } from '@/lib/storage';

export function useProfileSettings() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [success, setSuccess] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

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
            setLoading(false);
        };
        loadUser();
    }, []);

    const handleUpdateProfile = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
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
            setTimeout(() => setSuccess(null), 3000);
        } catch (err: any) {
            setError(err?.message || 'Error al actualizar el perfil.');
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
            const url = await storage.uploadImage(file, 'avatars');
            setAvatarUrl(url);
            await supabase.auth.updateUser({ data: { avatar_url: url } });
            setSuccess('Avatar subido correctamente.');
        } catch (err: any) {
            setError(err?.message || 'Error al subir el avatar.');
        } finally {
            setUploading(false);
        }
    };

    const handleChangePassword = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
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
        } catch (err: any) {
            setError(err?.message || 'Error al cambiar la contraseña.');
        } finally {
            setSaving(false);
        }
    };

    return {
        state: {
            loading, saving, uploading, success, error,
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
            handleChangePassword,
            setError,
            setSuccess
        }
    };
}
