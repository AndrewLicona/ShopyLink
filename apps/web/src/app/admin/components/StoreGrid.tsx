'use client';

import Link from 'next/link';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import React, { useState } from 'react';
import {
    Loader2,
    ArrowRight,
    Store as StoreIcon,
    ExternalLink,
    ShieldCheck,
    Zap,
    AlertTriangle,
    X
} from 'lucide-react';

export interface AdminStore {
    id: string;
    name: string;
    slug: string;
    planType: string;
    logoUrl?: string | null;
    admin: {
        email: string;
        name: string | null;
    };
    _count: {
        products: number;
        orders: number;
    };
}

interface StoreGridProps {
    stores: AdminStore[];
    onUpdatePlan: (storeId: string, plan: 'FREE' | 'PRO') => void;
    updating: string | null;
}

export function StoreGrid({ stores, onUpdatePlan, updating }: StoreGridProps) {
    const [selectedStore, setSelectedStore] = useState<{ id: string, name: string, targetPlan: 'FREE' | 'PRO' } | null>(null);

    const handleConfirmUpdate = () => {
        if (selectedStore) {
            onUpdatePlan(selectedStore.id, selectedStore.targetPlan);
            setSelectedStore(null);
        }
    };

    return (
        <>
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 p-4 md:p-6">
                {stores.map(store => (
                    <div key={store.id} className="bg-white border border-slate-100 rounded-3xl p-5 space-y-4 hover:shadow-xl hover:shadow-indigo-500/5 transition-all group relative overflow-hidden">
                        {/* Background decoration */}
                        <div className={cn(
                            "absolute top-0 right-0 w-32 h-32 -mr-16 -mt-16 rounded-full opacity-5 transition-transform group-hover:scale-110",
                            store.planType === 'PRO' ? "bg-indigo-500" : "bg-slate-500"
                        )} />

                        <div className="flex items-start justify-between relative">
                            <div className="flex items-center gap-3">
                                <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center font-black text-xl text-indigo-600 shadow-sm overflow-hidden group-hover:border-indigo-100 transition-colors">
                                    {store.logoUrl ? (
                                        <Image
                                            src={store.logoUrl}
                                            alt={store.name}
                                            width={56}
                                            height={56}
                                            className="object-cover w-full h-full"
                                        />
                                    ) : (
                                        store.name[0]
                                    )}
                                </div>
                                <div>
                                    <p className="font-extrabold text-slate-900 leading-tight truncate max-w-[150px]">{store.name}</p>
                                    <p className="text-[10px] font-bold text-slate-400 capitalize mt-0.5">/{store.slug}</p>
                                </div>
                            </div>
                            <span className={cn(
                                "text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border shrink-0",
                                store.planType === 'PRO'
                                    ? "bg-indigo-50 text-indigo-700 border-indigo-100 shadow-sm shadow-indigo-100/50"
                                    : "bg-slate-50 text-slate-500 border-slate-100"
                            )}>
                                {store.planType}
                            </span>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                            <div className="bg-slate-50/50 p-3 rounded-2xl border border-slate-100/50">
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-tighter mb-1">Productos</p>
                                <p className="text-xl font-black text-slate-800 leading-none">{store._count.products}</p>
                            </div>
                            <div className="bg-slate-50/50 p-3 rounded-2xl border border-slate-100/50">
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-tighter mb-1">Pedidos</p>
                                <p className="text-xl font-black text-slate-800 leading-none">{store._count.orders}</p>
                            </div>
                        </div>

                        <div className="flex gap-2">
                            <button
                                onClick={() => setSelectedStore({ id: store.id, name: store.name, targetPlan: 'PRO' })}
                                disabled={updating === store.id || store.planType === 'PRO'}
                                className={cn(
                                    "flex-1 py-4 rounded-2xl font-black text-sm transition-all active:scale-95 flex items-center justify-center gap-2",
                                    store.planType === 'PRO'
                                        ? "bg-indigo-100 text-indigo-400 cursor-not-allowed"
                                        : "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20 hover:bg-indigo-700"
                                )}
                            >
                                <Zap className="w-4 h-4" />
                                Hacer PRO
                            </button>
                            <button
                                onClick={() => setSelectedStore({ id: store.id, name: store.name, targetPlan: 'FREE' })}
                                disabled={updating === store.id || store.planType === 'FREE'}
                                className={cn(
                                    "flex-1 py-4 rounded-2xl font-black text-sm transition-all active:scale-95 flex items-center justify-center gap-2",
                                    store.planType === 'FREE'
                                        ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                                        : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
                                )}
                            >
                                <ShieldCheck className="w-4 h-4" />
                                Hacer FREE
                            </button>
                        </div>

                        <div className="flex gap-2">
                            <Link
                                href={`/${store.slug}`}
                                target="_blank"
                                className="flex-1 py-4 bg-slate-900 text-white rounded-2xl font-black text-sm shadow-lg shadow-slate-900/10 hover:bg-slate-800 transition-all active:scale-95 flex items-center justify-center gap-2"
                            >
                                <ExternalLink className="w-5 h-5" />
                                Ver Tienda
                            </Link>
                        </div>
                    </div>
                ))}
            </div>

            {/* Plan Update Modal */}
            {selectedStore && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setSelectedStore(null)} />
                    <div className="bg-white rounded-[32px] w-full max-w-sm p-8 shadow-2xl relative z-10 animate-in zoom-in-95 duration-300 border border-slate-100">
                        <button
                            onClick={() => setSelectedStore(null)}
                            className="absolute top-6 right-6 p-2 text-slate-300 hover:text-slate-500 hover:bg-slate-50 rounded-xl transition-all"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <div className={cn(
                            "w-16 h-16 rounded-2xl flex items-center justify-center mb-6",
                            selectedStore.targetPlan === 'PRO' ? "bg-indigo-50 text-indigo-600" : "bg-amber-50 text-amber-600"
                        )}>
                            {selectedStore.targetPlan === 'PRO' ? <Zap className="w-8 h-8" /> : <AlertTriangle className="w-8 h-8" />}
                        </div>

                        <h3 className="text-2xl font-black text-slate-900 tracking-tight leading-tight mb-2">
                            ¿Cambiar plan a {selectedStore.targetPlan}?
                        </h3>
                        <p className="text-slate-500 font-medium text-sm leading-relaxed mb-8">
                            Estás a punto de cambiar la tienda <span className="text-slate-900 font-bold">"{selectedStore.name}"</span> al plan <span className={cn("font-black", selectedStore.targetPlan === 'PRO' ? "text-indigo-600" : "text-amber-600")}>{selectedStore.targetPlan}</span>.
                        </p>

                        <div className="flex flex-col gap-3">
                            <button
                                onClick={handleConfirmUpdate}
                                className={cn(
                                    "w-full py-4 rounded-2xl font-black text-sm transition-all active:scale-95 shadow-xl shadow-indigo-600/10",
                                    selectedStore.targetPlan === 'PRO' ? "bg-indigo-600 text-white hover:bg-indigo-700" : "bg-slate-900 text-white hover:bg-slate-800"
                                )}
                            >
                                Confirmar Cambio
                            </button>
                            <button
                                onClick={() => setSelectedStore(null)}
                                className="w-full py-4 bg-white text-slate-400 rounded-2xl font-black text-sm hover:text-slate-600 hover:bg-slate-50 transition-all"
                            >
                                Cancelar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
