'use client';

import { useEffect, useState } from 'react';
import { api } from '@/services/api';
import { Bell, Info, TriangleAlert, AlertCircle, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Broadcast {
    id: string;
    title: string;
    content: string;
    type: 'INFO' | 'WARNING' | 'PROMOTION' | 'SUCCESS';
    createdAt: string;
    expiresAt?: string | null;
}

type BroadcastStyle = { bg: string; text: string; iconColor: string; icon: React.ReactNode };

const TYPE_STYLES: Record<'INFO' | 'WARNING' | 'PROMOTION' | 'SUCCESS', BroadcastStyle> = {
    INFO: { bg: 'bg-blue-50 border-blue-200', text: 'text-blue-900', iconColor: 'text-blue-500', icon: <Info className="w-5 h-5" /> },
    WARNING: { bg: 'bg-amber-50 border-amber-200', text: 'text-amber-900', iconColor: 'text-amber-500', icon: <TriangleAlert className="w-5 h-5" /> },
    PROMOTION: { bg: 'bg-indigo-50 border-indigo-200', text: 'text-indigo-900', iconColor: 'text-indigo-500', icon: <Bell className="w-5 h-5" /> },
    SUCCESS: { bg: 'bg-emerald-50 border-emerald-200', text: 'text-emerald-900', iconColor: 'text-emerald-600', icon: <AlertCircle className="w-5 h-5" /> },
};

export default function BroadcastsPage() {
    const [broadcasts, setBroadcasts] = useState<Broadcast[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        (api as any).getActiveBroadcasts()
            .then((data: Broadcast[]) => setBroadcasts(Array.isArray(data) ? data : []))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    return (
        <div className="max-w-2xl space-y-6">
            <div>
                <h1 className="text-2xl font-black text-[var(--text)] tracking-tight">Comunicados</h1>
                <p className="text-sm font-medium text-[var(--text)]/40 mt-1">Mensajes activos del sistema.</p>
            </div>

            {loading && (
                <div className="space-y-3">
                    {[1, 2].map(i => (
                        <div key={i} className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-5 animate-pulse">
                            <div className="h-4 bg-[var(--secondary)] rounded w-1/3 mb-3" />
                            <div className="h-3 bg-[var(--secondary)] rounded w-2/3" />
                        </div>
                    ))}
                </div>
            )}

            {!loading && broadcasts.length === 0 && (
                <div className="flex flex-col items-center justify-center py-24 text-center">
                    <div className="w-16 h-16 bg-[var(--secondary)] rounded-2xl flex items-center justify-center mb-4">
                        <Bell className="w-8 h-8 text-[var(--text)]/20" />
                    </div>
                    <p className="font-black text-[var(--text)]/30 text-sm uppercase tracking-widest">Sin comunicados activos</p>
                </div>
            )}

            {!loading && broadcasts.map(b => {
                const s = TYPE_STYLES[b.type] ?? TYPE_STYLES['INFO'];
                return (
                    <div key={b.id} className={cn('border rounded-2xl p-5 space-y-2', s.bg)}>
                        <div className="flex items-center gap-3">
                            <span className={s.iconColor}>{s.icon}</span>
                            <span className={cn('font-black text-sm uppercase tracking-tight', s.text)}>{b.title}</span>
                        </div>
                        <p className={cn('text-sm font-medium leading-relaxed pl-8', s.text, 'opacity-80')}>{b.content}</p>
                        <div className={cn('flex items-center gap-1 pl-8 text-[10px] font-bold opacity-40', s.text)}>
                            <Clock className="w-3 h-3" />
                            {new Date(b.createdAt).toLocaleDateString('es', { day: '2-digit', month: 'short', year: 'numeric' })}
                            {b.expiresAt && ` · Vence ${new Date(b.expiresAt).toLocaleDateString('es', { day: '2-digit', month: 'short' })}`}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
