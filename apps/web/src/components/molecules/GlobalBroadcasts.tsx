'use client';

import { useEffect, useState, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import { api } from '@/services/api';
import { AlertCircle, Bell, Info, TriangleAlert, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Broadcast {
    id: string;
    title: string;
    content: string;
    type: 'INFO' | 'WARNING' | 'PROMOTION' | 'SUCCESS';
}

const TYPE_CONFIG: Record<string, { bg: string; text: string; icon: string }> = {
    WARNING: { bg: 'bg-amber-50  border-b border-amber-200', text: 'text-amber-800', icon: 'text-amber-500' },
    PROMOTION: { bg: 'bg-indigo-50 border-b border-indigo-200', text: 'text-indigo-800', icon: 'text-indigo-500' },
    SUCCESS: { bg: 'bg-emerald-50 border-b border-emerald-200', text: 'text-emerald-800', icon: 'text-emerald-600' },
    INFO: { bg: 'bg-blue-50   border-b border-blue-200', text: 'text-blue-800', icon: 'text-blue-500' },
};

const TYPE_ICONS: Record<string, React.ReactNode> = {
    WARNING: <TriangleAlert className="w-4 h-4 shrink-0" />,
    PROMOTION: <Bell className="w-4 h-4 shrink-0" />,
    SUCCESS: <Info className="w-4 h-4 shrink-0" />,
    INFO: <Info className="w-4 h-4 shrink-0" />,
};

const INTERVAL_MS = 8000;

export default function GlobalBroadcasts() {
    const pathname = usePathname();
    const [broadcasts, setBroadcasts] = useState<Broadcast[]>([]);
    const [index, setIndex] = useState(0);
    const [dismissed, setDismissed] = useState(false);

    useEffect(() => {
        const fetch = async () => {
            try {
                const data = await (api as any).getActiveBroadcasts();
                if (Array.isArray(data) && data.length > 0) {
                    setBroadcasts(data);
                }
            } catch (err) {
                console.error('Error fetching broadcasts:', err);
            }
        };
        fetch();
        const poll = setInterval(fetch, 5 * 60 * 1000);
        return () => clearInterval(poll);
    }, []);

    // Auto-rotate
    useEffect(() => {
        if (broadcasts.length <= 1) return;
        const timer = setInterval(() => {
            setIndex(i => (i + 1) % broadcasts.length);
        }, INTERVAL_MS);
        return () => clearInterval(timer);
    }, [broadcasts.length]);

    const prev = useCallback(() => setIndex(i => (i - 1 + broadcasts.length) % broadcasts.length), [broadcasts.length]);
    const next = useCallback(() => setIndex(i => (i + 1) % broadcasts.length), [broadcasts.length]);

    // Don't show banner on the broadcasts page itself (would duplicate content)
    if (pathname === '/dashboard/broadcasts') return null;
    if (dismissed || broadcasts.length === 0) return null;

    const current = broadcasts[index];
    if (!current) return null;
    const cfg = TYPE_CONFIG[current.type] ?? TYPE_CONFIG['INFO']!;

    return (
        <div className={cn(
            'relative flex items-center gap-3 px-4 py-2.5 text-sm font-medium animate-in slide-in-from-top duration-300',
            cfg.bg, cfg.text
        )}>
            {/* Icon */}
            <span className={cfg.icon}>{TYPE_ICONS[current.type]}</span>

            {/* Content */}
            <div className="flex-1 min-w-0 flex items-center gap-2 truncate">
                {current.title && (
                    <span className="font-black shrink-0">{current.title}:</span>
                )}
                <span className="opacity-90 truncate">{current.content}</span>
            </div>

            {/* Pagination controls */}
            {broadcasts.length > 1 && (
                <div className="flex items-center gap-1 shrink-0">
                    <button onClick={prev} className="p-1 hover:bg-black/5 rounded-lg transition-colors" aria-label="Anterior">
                        <ChevronLeft className="w-4 h-4" />
                    </button>
                    <span className="text-[11px] font-black opacity-50 tabular-nums">
                        {index + 1}/{broadcasts.length}
                    </span>
                    <button onClick={next} className="p-1 hover:bg-black/5 rounded-lg transition-colors" aria-label="Siguiente">
                        <ChevronRight className="w-4 h-4" />
                    </button>
                </div>
            )}

            <button
                onClick={() => setDismissed(true)}
                className="shrink-0 p-1 hover:bg-black/10 rounded-lg transition-colors opacity-50 hover:opacity-100"
                aria-label="Cerrar"
            >
                <X className="w-4 h-4" />
            </button>
        </div>
    );
}
