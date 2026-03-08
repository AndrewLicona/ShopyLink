'use client';

import {
    Loader2,
    Mail,
    Copy,
    ArrowRightCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';

export interface AdminUser {
    id: string;
    email: string;
    name: string | null;
    role: string;
    createdAt: string;
    _count: {
        stores: number;
    };
}

interface UserGridProps {
    users: AdminUser[];
    onImpersonate: (userId: string) => void;
    onCopy: (text: string) => void;
    updating: string | null;
}

export function UserGrid({ users, onImpersonate, onCopy, updating }: UserGridProps) {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 p-4 md:p-6">
            {users.map(user => (
                <div key={user.id} className="bg-white border border-slate-100 rounded-3xl p-5 space-y-5 hover:shadow-xl hover:shadow-indigo-500/5 transition-all group">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-black text-xl shadow-sm group-hover:bg-indigo-600 group-hover:text-white transition-all">
                                {user.name ? user.name[0] : 'U'}
                            </div>
                            <div>
                                <p className="font-extrabold text-slate-900 leading-tight">{user.name || 'Usuario'}</p>
                                <div className="flex items-center gap-1 mt-1">
                                    <span className={cn(
                                        "text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border",
                                        user.role === 'SUPER_ADMIN' ? "bg-indigo-50 text-indigo-700 border-indigo-100" : "bg-slate-50 text-slate-500 border-slate-100"
                                    )}>
                                        {user.role}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-2xl font-black text-slate-800 leading-none">{user._count.stores}</p>
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-tighter mt-1">Tiendas</p>
                        </div>
                    </div>

                    <div className="bg-slate-50/50 rounded-2xl p-4 flex items-center justify-between border border-slate-100/50 group-hover:bg-indigo-50/30 transition-colors">
                        <div className="flex items-center gap-2 overflow-hidden">
                            <Mail className="w-4 h-4 text-slate-300 shrink-0" />
                            <span className="text-sm font-bold text-slate-600 truncate">{user.email}</span>
                        </div>
                        <button onClick={() => onCopy(user.email)} className="p-1.5 text-slate-300 hover:text-indigo-600 hover:bg-white rounded-lg transition-all shadow-sm">
                            <Copy className="w-3.5 h-3.5" />
                        </button>
                    </div>

                    <div className="flex gap-2">
                        <button
                            onClick={() => onImpersonate(user.id)}
                            disabled={updating === user.id}
                            className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black text-sm shadow-lg shadow-indigo-600/20 hover:bg-indigo-700 transition-all active:scale-95 flex items-center justify-center gap-2 group/btn"
                        >
                            {updating === user.id ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                                <>
                                    <ArrowRightCircle className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
                                    Suplantar Usuario
                                </>
                            )}
                        </button>
                    </div>

                    <div className="flex items-center justify-center">
                        <span className="text-[10px] font-bold text-slate-300 italic">Registrado el {new Date(user.createdAt).toLocaleDateString()}</span>
                    </div>
                </div>
            ))}
        </div>
    );
}
