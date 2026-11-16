'use client';

import {
    Store as StoreIcon,
    TrendingUp,
    ShoppingCart
} from 'lucide-react';
import { formatAmount } from '@/lib/utils';

interface Stats {
    totalStores: number;
    newStoresLast7Days: number;
    proStores: number;
    totalUsers: number;
    totalRevenue: number;
    avgOrderValue: number;
    conversionRate: number;
    totalOrders: number;
}

export function KPISection({ stats }: { stats: Stats }) {
    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
            <div className="bg-white p-3 sm:p-4 md:p-6 rounded-2xl md:rounded-3xl border border-slate-200 shadow-sm flex items-start justify-between gap-1 min-w-0">
                <div className="min-w-0">
                    <p className="text-[10px] md:text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">Tiendas</p>
                    <h3 className="text-lg sm:text-xl md:text-3xl font-black break-words text-slate-800">{stats.totalStores}</h3>
                    <p className="text-[10px] text-emerald-600 font-bold mt-1 flex items-center gap-1">
                        +{stats.newStoresLast7Days} <span className="text-slate-400">7d</span>
                    </p>
                </div>
                <div className="hidden min-[380px]:flex shrink-0 w-9 h-9 md:w-12 md:h-12 bg-indigo-50 text-indigo-600 rounded-xl md:rounded-2xl flex items-center justify-center">
                    <StoreIcon className="w-5 h-5 md:w-6 md:h-6" />
                </div>
            </div>

            <div className="bg-white p-3 sm:p-4 md:p-6 rounded-2xl md:rounded-3xl border border-slate-200 shadow-sm flex items-start justify-between gap-1 min-w-0">
                <div className="min-w-0">
                    <p className="text-[10px] md:text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">Conversión</p>
                    <h3 className="text-lg sm:text-xl md:text-3xl font-black break-words text-blue-600 font-tabular-nums">{stats.conversionRate}%</h3>
                    <p className="text-[10px] text-slate-400 font-bold mt-1">{stats.proStores} PRO</p>
                </div>
                <div className="hidden min-[380px]:flex shrink-0 w-9 h-9 md:w-12 md:h-12 bg-blue-50 text-blue-600 rounded-xl md:rounded-2xl flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 md:w-6 md:h-6" />
                </div>
            </div>

            <div className="bg-white p-3 sm:p-4 md:p-6 rounded-2xl md:rounded-3xl border border-slate-200 shadow-sm flex items-start justify-between gap-1 min-w-0">
                <div className="min-w-0">
                    <p className="text-[10px] md:text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">Ticket Prom.</p>
                    <h3 className="text-lg sm:text-xl md:text-3xl font-black break-words text-emerald-600 font-tabular-nums">{formatAmount(stats.avgOrderValue || 0)}</h3>
                    <p className="text-[10px] text-slate-400 font-bold mt-1">{stats.totalOrders} órdenes · moneda mixta</p>
                </div>
                <div className="hidden min-[380px]:flex shrink-0 w-9 h-9 md:w-12 md:h-12 bg-emerald-50 text-emerald-600 rounded-xl md:rounded-2xl flex items-center justify-center">
                    <ShoppingCart className="w-5 h-5 md:w-6 md:h-6" />
                </div>
            </div>

            <div className="bg-white p-3 sm:p-4 md:p-6 rounded-2xl md:rounded-3xl border border-slate-200 shadow-sm flex items-start justify-between gap-1 min-w-0">
                <div className="min-w-0">
                    <p className="text-[10px] md:text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">Ventas Totales</p>
                    <h3 className="text-lg sm:text-xl md:text-3xl font-black break-words text-indigo-600 font-tabular-nums">{formatAmount(stats.totalRevenue || 0)}</h3>
                    <p className="text-[10px] text-slate-400 font-bold mt-1">Acumulado · moneda mixta</p>
                </div>
                <div className="hidden min-[380px]:flex shrink-0 w-9 h-9 md:w-12 md:h-12 bg-indigo-50 text-indigo-600 rounded-xl md:rounded-2xl flex items-center justify-center">
                    <ShoppingCart className="w-5 h-5 md:w-6 md:h-6" />
                </div>
            </div>
        </div>
    );
}
