'use client';

import { useEffect, useState } from 'react';
import { api } from '@/services/api';
import { AlertCircle, Bell, Info, TriangleAlert, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Broadcast {
    id: string;
    title: string;
    message: string;
    type: 'INFO' | 'WARNING' | 'MAINTENANCE' | 'PROMO';
}

export default function GlobalBroadcasts() {
    const [broadcasts, setBroadcasts] = useState<Broadcast[]>([]);
    const [dismissed, setDismissed] = useState<string[]>([]);

    useEffect(() => {
        const fetchBroadcasts = async () => {
            try {
                // We need to add this method to api.ts
                const data = await (api as any).getActiveBroadcasts();
                setBroadcasts(data);
            } catch (err) {
                console.error('Error fetching broadcasts:', err);
            }
        };

        fetchBroadcasts();
        // Poll every 5 minutes
        const interval = setInterval(fetchBroadcasts, 5 * 60 * 1000);
        return () => clearInterval(interval);
    }, []);

    const handleDismiss = (id: string) => {
        setDismissed(prev => [...prev, id]);
    };

    const activeBroadcasts = broadcasts.filter(b => !dismissed.includes(b.id));

    if (activeBroadcasts.length === 0) return null;

    return (
        <div className="fixed bottom-4 left-4 right-4 z-[9998] md:left-auto md:right-8 md:bottom-8 md:max-w-md space-y-3 pointer-events-none">
            {activeBroadcasts.map(broadcast => (
                <div
                    key={broadcast.id}
                    className={cn(
                        "pointer-events-auto p-4 rounded-2xl border shadow-2xl animate-in slide-in-from-right duration-500 flex gap-4 relative overflow-hidden",
                        broadcast.type === 'WARNING' ? "bg-amber-50 border-amber-200 text-amber-900" :
                            broadcast.type === 'MAINTENANCE' ? "bg-red-50 border-red-200 text-red-900" :
                                broadcast.type === 'PROMO' ? "bg-indigo-600 border-indigo-700 text-white" :
                                    "bg-white border-slate-200 text-slate-900"
                    )}
                >
                    <div className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                        broadcast.type === 'PROMO' ? "bg-white/20" : "bg-white shadow-sm"
                    )}>
                        {broadcast.type === 'WARNING' ? <TriangleAlert className="w-5 h-5 text-amber-600" /> :
                            broadcast.type === 'MAINTENANCE' ? <AlertCircle className="w-5 h-5 text-red-600" /> :
                                broadcast.type === 'PROMO' ? <Bell className="w-5 h-5 text-white" /> :
                                    <Info className="w-5 h-5 text-indigo-600" />}
                    </div>
                    <div className="flex-1 pr-6">
                        <h4 className="font-black text-sm mb-1">{broadcast.title}</h4>
                        <p className="text-xs font-medium opacity-80 leading-relaxed">{broadcast.message}</p>
                    </div>
                    <button
                        onClick={() => handleDismiss(broadcast.id)}
                        className="absolute top-3 right-3 p-1 hover:bg-black/5 rounded-lg transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>
                    {broadcast.type === 'PROMO' && (
                        <div className="absolute -right-4 -bottom-4 w-16 h-16 bg-white/10 rounded-full blur-xl" />
                    )}
                </div>
            ))}
        </div>
    );
}
