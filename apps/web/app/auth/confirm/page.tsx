
'use client';

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import { Loader2 } from 'lucide-react';

function ConfirmContent() {
    const router = useRouter();
    const searchParams = useSearchParams();

    useEffect(() => {
        const token_hash = searchParams.get('token_hash');
        const type = searchParams.get('type');
        const code = searchParams.get('code');
        const supabase = createClient();

        console.log('Confirming auth...', { hasToken: !!token_hash, hasCode: !!code, type });

        if (token_hash && type) {
            supabase.auth.verifyOtp({
                token_hash,
                type: type as any,
            }).then(({ error }) => {
                if (error) {
                    console.error('Verify OTP error:', error);
                    window.location.href = `/login?error=${encodeURIComponent('El enlace ha expirado o no es válido')}`;
                } else {
                    window.location.href = '/dashboard';
                }
            });
        } else if (code) {
            supabase.auth.exchangeCodeForSession(code).then(({ error }) => {
                if (error) {
                    console.error('Exchange code error:', error);
                    window.location.href = `/login?error=${encodeURIComponent('Error al confirmar el código')}`;
                } else {
                    window.location.href = '/dashboard';
                }
            });
        } else {
            // Check if there are error fragments in hash (Client side only)
            const hash = window.location.hash;
            if (hash.includes('error=')) {
                window.location.href = `/login?error=Invalid link or expired`;
            } else {
                // If nothing, just wait a bit or redirect to login
                const timeout = setTimeout(() => {
                    window.location.href = '/login';
                }, 3000);
                return () => clearTimeout(timeout);
            }
        }
    }, [searchParams]);

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 gap-4">
            <div className="w-16 h-16 bg-blue-600/10 rounded-2xl flex items-center justify-center mb-4">
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Verificando tu cuenta</h2>
            <p className="text-gray-500 font-medium">Esto solo tomará un momento...</p>
        </div>
    );
}

export default function ConfirmPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            </div>
        }>
            <ConfirmContent />
        </Suspense>
    );
}
