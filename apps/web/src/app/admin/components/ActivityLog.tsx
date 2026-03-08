'use client';

import {
    ShoppingCart,
    User,
    ShieldCheck,
    Store as StoreIcon,
    UserCheck
} from 'lucide-react';
import { cn } from '@/lib/utils';
import React from 'react';

export interface AdminLog {
    id: string;
    action: string;
    details: string | null;
    createdAt: string;
    admin: {
        email: string;
    } | null;
}

interface ActivityLogProps {
    logs: AdminLog[];
}

export function ActivityLog({ logs }: ActivityLogProps) {
    const formatLogDetails = (action: string, detailsStr: string | null) => {
        if (!detailsStr) return 'Sin detalles disponibles';
        try {
            const details = JSON.parse(detailsStr);
            if (action === 'UPDATE_STORE_ADMIN') {
                const changes = details.changes || {};
                const changeLabels = Object.entries(changes)
                    .map(([key, value]) => `${key}: ${value}`)
                    .join(', ');

                return (
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <StoreIcon className="w-4 h-4 text-emerald-500" />
                            <p className="text-sm font-bold text-slate-700">
                                Actualizada tienda <span className="text-indigo-600">"{details.storeName}"</span>
                            </p>
                        </div>
                        {changeLabels && (
                            <div className="flex flex-wrap gap-2">
                                <span className="text-[10px] font-black uppercase text-slate-400">Cambios:</span>
                                <span className="text-[10px] font-bold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-md border border-emerald-100">
                                    {changeLabels}
                                </span>
                            </div>
                        )}
                    </div>
                );
            }
            if (action === 'IMPERSONATE_USER') {
                return (
                    <div className="flex items-center gap-2">
                        <UserCheck className="w-4 h-4 text-blue-500" />
                        <p className="text-sm font-bold text-slate-700">Inicio de suplantación de usuario</p>
                    </div>
                );
            }
            return <p className="text-sm text-slate-600 break-words font-medium">{detailsStr}</p>;
        } catch (e) {
            return <p className="text-sm text-slate-600 break-words font-medium">{detailsStr}</p>;
        }
    };

    return (
        <div className="p-4 md:p-8 space-y-4 max-h-[700px] overflow-y-auto custom-scrollbar">
            {logs.map((log) => (
                <div key={log.id} className="group relative flex items-start gap-4 p-4 rounded-2xl border border-slate-100 bg-white hover:border-indigo-100 transition-all shadow-sm">
                    <div className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border shadow-sm transition-colors",
                        log.action.includes('CREATE') ? "bg-emerald-50 border-emerald-100 text-emerald-600" :
                            log.action.includes('UPDATE') ? "bg-blue-50 border-blue-100 text-blue-600" :
                                log.action.includes('DELETE') ? "bg-red-50 border-red-100 text-red-600" :
                                    "bg-slate-50 border-slate-100 text-slate-600"
                    )}>
                        {log.action.includes('STORE') ? <ShoppingCart className="w-5 h-5" /> :
                            log.action.includes('USER') ? <User className="w-5 h-5" /> :
                                <ShieldCheck className="w-5 h-5" />}
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-4">
                            <div className="flex-1">
                                {formatLogDetails(log.action, log.details)}
                            </div>
                            <span className="text-[10px] font-black text-slate-400 whitespace-nowrap uppercase tracking-tighter">
                                {new Date(log.createdAt).toLocaleDateString()} {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{log.admin?.email || 'Sistema'}</span>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
