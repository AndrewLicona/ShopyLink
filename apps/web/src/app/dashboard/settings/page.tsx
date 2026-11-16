'use client';

import { useState } from 'react';
import { User, Loader2, CheckCircle2, AlertCircle, Store as StoreIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Modular Components
import { ProfileTab } from '@/features/settings/ProfileTab';
import { StoreTab } from '@/features/settings/StoreTab';
import { cn } from '@/lib/utils';

// Hooks
import { useProfileSettings } from '@/hooks/useProfileSettings';
import { useStoreSettings } from '@/hooks/useStoreSettings';

export default function SettingsPage() {
    const [activeSection, setActiveSection] = useState<'profile' | 'store'>('store');

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
        { id: 'profile' as const, label: 'Mi perfil', icon: User },
        { id: 'store' as const, label: 'Mi tienda', icon: StoreIcon }
    ];

    return (
        <div className="max-w-6xl mx-auto space-y-5 sm:space-y-7 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div><p className="text-[11px] font-black uppercase tracking-[0.18em] text-[var(--primary)]">Tu espacio</p><h1 className="mt-2 text-3xl font-black tracking-tight text-[var(--text)] sm:text-4xl">Ajustes</h1><p className="mt-2 text-sm leading-relaxed text-[var(--text)]/55">Administra los datos de tu tienda y de tu cuenta.</p></div>
            <nav aria-label="Secciones de ajustes" className="grid grid-cols-2 gap-1 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-1 sm:w-fit sm:min-w-80">
                {tabOptions.map(tab => <button key={tab.id} type="button" onClick={() => setActiveSection(tab.id)} aria-pressed={activeSection === tab.id} className={cn('flex min-h-11 items-center justify-center gap-2 rounded-xl px-4 text-sm font-bold transition-colors', activeSection === tab.id ? 'bg-[var(--primary)] text-[var(--bg)]' : 'text-[var(--text)]/55 hover:bg-[var(--secondary)]')}><tab.icon className="h-4 w-4" />{tab.label}</button>)}
            </nav>

            {/* Messages */}
            <AnimatePresence mode="wait">
                {currentError && (
                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} role="alert" className="p-4 bg-red-50 text-red-600 rounded-[2rem] border border-red-100 flex items-center gap-4 font-black text-sm shadow-xl shadow-red-500/5">
                        <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center flex-shrink-0">
                            <AlertCircle className="w-5 h-5" />
                        </div>
                        {currentError}
                    </motion.div>
                )}
                {currentSuccess && (
                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} role="status" className="p-4 bg-green-50 text-green-600 rounded-[2rem] border border-green-100 flex items-center gap-4 font-black text-sm shadow-xl shadow-green-500/5">
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
