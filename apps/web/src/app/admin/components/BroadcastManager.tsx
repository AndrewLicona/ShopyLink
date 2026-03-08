'use client';

import {
    Megaphone,
    Bell,
    X,
    Clock,
    Loader2,
    TriangleAlert
} from 'lucide-react';
import { cn } from '@/lib/utils';
import React, { useState } from 'react';

export interface AdminBroadcast {
    id: string;
    title: string;
    content: string;
    type: 'INFO' | 'WARNING' | 'PROMOTION' | 'SUCCESS';
    isActive: boolean;
    expiresAt: string | null;
    createdAt: string;
}

interface BroadcastManagerProps {
    broadcasts: AdminBroadcast[];
    newBroadcast: {
        title: string;
        content: string;
        type: 'INFO' | 'WARNING' | 'PROMOTION' | 'SUCCESS';
        expiresAt: string;
    };
    onNewBroadcastChange: (data: any) => void;
    onCreateBroadcast: () => void;
    onDeactivateBroadcast: (id: string) => void;
    updating: string | null;
}

export function BroadcastManager({
    broadcasts,
    newBroadcast,
    onNewBroadcastChange,
    onCreateBroadcast,
    onDeactivateBroadcast,
    updating
}: BroadcastManagerProps) {
    const [confirmDeactivateId, setConfirmDeactivateId] = useState<string | null>(null);

    const handleConfirmDeactivate = () => {
        if (confirmDeactivateId) {
            onDeactivateBroadcast(confirmDeactivateId);
            setConfirmDeactivateId(null);
        }
    };

    const broadcastToDeactivate = broadcasts.find(b => b.id === confirmDeactivateId);

    return (
        <div className="p-4 md:p-8 space-y-8">
            {/* Create Broadcast Form */}
            <div className="bg-slate-50 rounded-3xl p-6 border border-slate-200">
                <h4 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <Megaphone className="w-5 h-5 text-indigo-600" /> Nuevo Comunicado
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-4">
                        <input
                            type="text"
                            placeholder="Título del comunicado"
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-bold focus:ring-2 focus:ring-indigo-500/20 outline-none"
                            value={newBroadcast.title}
                            onChange={e => onNewBroadcastChange({ ...newBroadcast, title: e.target.value })}
                        />
                        <textarea
                            placeholder="Mensaje para todos los usuarios..."
                            rows={4}
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-medium focus:ring-2 focus:ring-indigo-500/20 outline-none resize-none"
                            value={newBroadcast.content}
                            onChange={e => onNewBroadcastChange({ ...newBroadcast, content: e.target.value })}
                        />
                    </div>
                    <div className="space-y-4">
                        <div className="flex gap-2">
                            {(['INFO', 'WARNING', 'PROMOTION', 'SUCCESS'] as const).map(type => (
                                <button
                                    key={type}
                                    onClick={() => onNewBroadcastChange({ ...newBroadcast, type })}
                                    className={cn(
                                        "flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all",
                                        newBroadcast.type === type
                                            ? "bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-600/20"
                                            : "bg-white text-slate-400 border-slate-200 hover:border-slate-300"
                                    )}
                                >
                                    {type}
                                </button>
                            ))}
                        </div>
                        <div className="space-y-1">
                            <p className="text-[10px] font-black text-slate-400 uppercase ml-1">Vence el (opcional)</p>
                            <input
                                type="datetime-local"
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-bold focus:ring-2 focus:ring-indigo-500/20 outline-none"
                                value={newBroadcast.expiresAt}
                                onChange={e => onNewBroadcastChange({ ...newBroadcast, expiresAt: e.target.value })}
                            />
                        </div>
                        <button
                            onClick={onCreateBroadcast}
                            disabled={updating === 'new-broadcast'}
                            className="w-full py-4 bg-slate-900 text-white rounded-xl font-black text-sm hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
                        >
                            {updating === 'new-broadcast' ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Publicar Comunicado'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Active Broadcasts List */}
            <div className="space-y-4">
                <h4 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
                    <Bell className="w-5 h-5 text-indigo-600" /> Comunicados Activos
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {broadcasts.map(broadcast => (
                        <div key={broadcast.id} className="bg-white border border-slate-200 rounded-3xl p-5 relative group overflow-hidden">
                            <div className={cn(
                                "absolute top-0 right-0 w-32 h-32 -mr-16 -mt-16 rounded-full opacity-5 transition-transform group-hover:scale-110",
                                broadcast.type === 'INFO' ? "bg-blue-500" :
                                    broadcast.type === 'WARNING' ? "bg-amber-500" :
                                        broadcast.type === 'PROMOTION' ? "bg-indigo-500" : "bg-emerald-500"
                            )} />

                            <div className="flex justify-between items-start relative mb-3">
                                <span className={cn(
                                    "px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border",
                                    broadcast.type === 'INFO' ? "bg-blue-50 text-blue-700 border-blue-100" :
                                        broadcast.type === 'WARNING' ? "bg-amber-50 text-amber-700 border-amber-100" :
                                            broadcast.type === 'PROMOTION' ? "bg-indigo-50 text-indigo-700 border-indigo-100" : "bg-emerald-50 text-emerald-700 border-emerald-100"
                                )}>
                                    {broadcast.type}
                                </span>
                                <button
                                    onClick={() => setConfirmDeactivateId(broadcast.id)}
                                    className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                            <h5 className="font-extrabold text-slate-900 mb-1">{broadcast.title}</h5>
                            <p className="text-sm text-slate-500 font-medium mb-4 line-clamp-2">{broadcast.content}</p>

                            <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-100">
                                <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400">
                                    <Clock className="w-3.5 h-3.5" />
                                    {new Date(broadcast.createdAt).toLocaleDateString()}
                                </div>
                                {broadcast.expiresAt && (
                                    <div className="text-[10px] font-black text-red-500 uppercase tracking-tighter">
                                        Vence: {new Date(broadcast.expiresAt).toLocaleDateString()}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                    {broadcasts.length === 0 && (
                        <div className="col-span-full py-12 text-center bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
                            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">No hay comunicados activos</p>
                        </div>
                    )}
                </div>
            </div>
            {/* Deactivate Confirmation Modal */}
            {confirmDeactivateId && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setConfirmDeactivateId(null)} />
                    <div className="bg-white rounded-[32px] w-full max-w-sm p-8 shadow-2xl relative z-10 animate-in zoom-in-95 duration-300 border border-slate-100">
                        <button
                            onClick={() => setConfirmDeactivateId(null)}
                            className="absolute top-6 right-6 p-2 text-slate-300 hover:text-slate-500 hover:bg-slate-50 rounded-xl transition-all"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <div className="w-16 h-16 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mb-6">
                            <TriangleAlert className="w-8 h-8" />
                        </div>

                        <h3 className="text-2xl font-black text-slate-900 tracking-tight leading-tight mb-2">
                            ¿Desactivar comunicado?
                        </h3>
                        {broadcastToDeactivate && (
                            <p className="text-slate-500 font-medium text-sm leading-relaxed mb-8">
                                Estás a punto de desactivar <span className="text-slate-900 font-bold">"{broadcastToDeactivate.title}"</span>. Ya no será visible para los usuarios.
                            </p>
                        )}

                        <div className="flex flex-col gap-3">
                            <button
                                onClick={handleConfirmDeactivate}
                                className="w-full py-4 rounded-2xl font-black text-sm transition-all active:scale-95 shadow-xl shadow-red-600/10 bg-red-600 text-white hover:bg-red-700"
                            >
                                Confirmar Desactivación
                            </button>
                            <button
                                onClick={() => setConfirmDeactivateId(null)}
                                className="w-full py-4 bg-white text-slate-400 rounded-2xl font-black text-sm hover:text-slate-600 hover:bg-slate-50 transition-all"
                            >
                                Cancelar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
