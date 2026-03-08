'use client';

import { useEffect, useState } from 'react';
import { api } from '@/services/api';
import {
    Info,
    AlertTriangle,
    X,
    Megaphone,
    CheckCircle2,
    Sparkles
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Broadcast {
    id: string;
    title: string;
    content: string;
    type: 'INFO' | 'WARNING' | 'PROMOTION' | 'SUCCESS';
}

export function AlertSystem() {
    const [broadcasts, setBroadcasts] = useState<Broadcast[]>([]);
    const [hidden, setHidden] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBroadcasts = async () => {
            try {
                const data = await api.getActiveBroadcasts();
                setBroadcasts(data || []);
            } catch (err) {
                console.error('Failed to fetch broadcasts:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchBroadcasts();

        // Refresh every 5 minutes
        const interval = setInterval(fetchBroadcasts, 5 * 60 * 1000);
        return () => clearInterval(interval);
    }, []);

    const visibleBroadcasts = broadcasts.filter(b => !hidden.includes(b.id));

    if (visibleBroadcasts.length === 0) return null;

    const getIcon = (type: string) => {
        switch (type) {
            case 'WARNING': return <AlertTriangle className="w-5 h-5" />;
            case 'PROMOTION': return <Sparkles className="w-5 h-5" />;
            case 'SUCCESS': return <CheckCircle2 className="w-5 h-5" />;
            default: return <Info className="w-5 h-5" />;
        }
    };

    const getTypeStyles = (type: string) => {
        switch (type) {
            case 'WARNING': return "bg-amber-50 border-amber-200 text-amber-900";
            case 'PROMOTION': return "bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-600/20";
            case 'SUCCESS': return "bg-emerald-50 border-emerald-200 text-emerald-900";
            default: return "bg-blue-50 border-blue-200 text-blue-900";
        }
    };

    return (
        <div className="flex flex-col gap-3 mb-6 animate-in fade-in slide-in-from-top-4 duration-500">
            {visibleBroadcasts.map((broadcast) => (
                <div
                    key={broadcast.id}
                    className={cn(
                        "relative group p-4 rounded-2xl border flex items-start gap-4 transition-all hover:scale-[1.01]",
                        getTypeStyles(broadcast.type)
                    )}
                >
                    <div className={cn(
                        "shrink-0 w-10 h-10 rounded-xl flex items-center justify-center",
                        broadcast.type === 'PROMOTION' ? "bg-white/20 text-white" : "bg-white shadow-sm"
                    )}>
                        {getIcon(broadcast.type)}
                    </div>

                    <div className="flex-1 pt-0.5">
                        <h4 className="font-extrabold text-sm mb-1 uppercase tracking-tight flex items-center gap-2">
                            {broadcast.title}
                        </h4>
                        <p className={cn(
                            "text-sm font-medium leading-relaxed",
                            broadcast.type === 'PROMOTION' ? "text-indigo-50" : "opacity-80"
                        )}>
                            {broadcast.content}
                        </p>
                    </div>

                    <button
                        onClick={() => setHidden([...hidden, broadcast.id])}
                        className={cn(
                            "p-2 rounded-lg transition-all opacity-0 group-hover:opacity-100",
                            broadcast.type === 'PROMOTION' ? "hover:bg-white/10 text-white/50 hover:text-white" : "hover:bg-slate-900/5 text-slate-400 hover:text-slate-600"
                        )}
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            ))}
        </div>
    );
}
