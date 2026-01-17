'use client';

import { useState } from 'react';
import { User, Loader2, CheckCircle2, AlertCircle, Store as StoreIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Modular Components
import { ProfileTab } from '@/features/settings/ProfileTab';
import { StoreTab } from '@/features/settings/StoreTab';
import { TabSelector } from '@/components/molecules/TabSelector';

// Hooks
import { useProfileSettings } from '@/hooks/useProfileSettings';
import { useStoreSettings } from '@/hooks/useStoreSettings';

export default function SettingsPage() {
    const [activeSection, setActiveSection] = useState<'profile' | 'store'>('profile');

    // Hooks manage their own loading/success/error state
    const profile = useProfileSettings();
    const store = useStoreSettings();

    // Combined loading check
    if (profile.state.loading && store.state.loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 animate-spin text-[var(--primary)]" />
            </div>
        );
    }

    // Determine which status to show based on active section
    const currentError = activeSection === 'profile' ? profile.state.error : store.state.error;
    const currentSuccess = activeSection === 'profile' ? profile.state.success : store.state.success;

    const tabOptions = [
        { id: 'profile' as const, label: 'Mi Perfil', icon: User },
        { id: 'store' as const, label: 'Mi Tienda', icon: StoreIcon }
    ];

    return (
        <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="flex flex-col gap-2">
                <div className="flex items-center gap-3">
                    <h1 className="text-3xl font-black text-[var(--text)] tracking-tighter italic">Ajustes</h1>
                    <div className="h-2 w-2 rounded-full bg-[var(--primary)] animate-pulse" />
                </div>
                <p className="text-[var(--text)]/40 font-bold uppercase tracking-[0.2em] text-[10px]">Configuración Global de tu Negocio</p>
            </div>

            {/* Premium Tab Selector */}
            <TabSelector
                options={tabOptions}
                activeTab={activeSection}
                onTabChange={setActiveSection}
                variant="premium"
            />

            {/* Messages */}
            <AnimatePresence mode="wait">
                {currentError && (
                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="p-5 bg-red-50 text-red-600 rounded-[2rem] border border-red-100 flex items-center gap-4 font-black text-sm shadow-xl shadow-red-500/5">
                        <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center flex-shrink-0">
                            <AlertCircle className="w-5 h-5" />
                        </div>
                        {currentError}
                    </motion.div>
                )}
                {currentSuccess && (
                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="p-5 bg-green-50 text-green-600 rounded-[2rem] border border-green-100 flex items-center gap-4 font-black text-sm shadow-xl shadow-green-500/5">
                        <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center flex-shrink-0">
                            <CheckCircle2 className="w-5 h-5" />
                        </div>
                        {currentSuccess}
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence mode="wait">
                {activeSection === 'profile' ? (
                    <ProfileTab key="profile" hook={profile} />
                ) : (
                    <StoreTab key="store" hook={store} />
                )}
            </AnimatePresence>
        </div>
    );
}
