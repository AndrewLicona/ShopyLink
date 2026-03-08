'use client';

import {
    Store as StoreIcon,
    TrendingUp,
    ShoppingCart,
    Users as UsersIcon
} from 'lucide-react';

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
            <div className="bg-white p-4 md:p-6 rounded-2xl md:rounded-3xl border border-slate-200 shadow-sm flex items-center justify-between">
                <div>
                    <p className="text-[10px] md:text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">Tiendas</p>
                    <h3 className="text-xl md:text-3xl font-black text-slate-800">{stats.totalStores}</h3>
                    <p className="text-[10px] text-emerald-600 font-bold mt-1 flex items-center gap-1">
                        +{stats.newStoresLast7Days} <span className="text-slate-400">7d</span>
                    </p>
                </div>
                <div className="w-10 h-10 md:w-12 md:h-12 bg-indigo-50 text-indigo-600 rounded-xl md:rounded-2xl flex items-center justify-center">
                    <StoreIcon className="w-5 h-5 md:w-6 md:h-6" />
                </div>
            </div>

            <div className="bg-white p-4 md:p-6 rounded-2xl md:rounded-3xl border border-slate-200 shadow-sm flex items-center justify-between">
                <div>
                    <p className="text-[10px] md:text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">Conversión</p>
                    <h3 className="text-xl md:text-3xl font-black text-blue-600 font-tabular-nums">{stats.conversionRate}%</h3>
                    <p className="text-[10px] text-slate-400 font-bold mt-1">{stats.proStores} PRO</p>
                </div>
                <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-50 text-blue-600 rounded-xl md:rounded-2xl flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 md:w-6 md:h-6" />
                </div>
            </div>

            <div className="bg-white p-4 md:p-6 rounded-2xl md:rounded-3xl border border-slate-200 shadow-sm flex items-center justify-between">
                <div>
                    <p className="text-[10px] md:text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">Ticket Prom.</p>
                    <h3 className="text-xl md:text-3xl font-black text-emerald-600 font-tabular-nums">${stats.avgOrderValue?.toFixed(0)}</h3>
                    <p className="text-[10px] text-slate-400 font-bold mt-1">{stats.totalOrders} órdenes</p>
                </div>
                <div className="w-10 h-10 md:w-12 md:h-12 bg-emerald-50 text-emerald-600 rounded-xl md:rounded-2xl flex items-center justify-center">
                    <ShoppingCart className="w-5 h-5 md:w-6 md:h-6" />
                </div>
            </div>

            <div className="bg-white p-4 md:p-6 rounded-2xl md:rounded-3xl border border-slate-200 shadow-sm flex items-center justify-between">
                <div>
                    <p className="text-[10px] md:text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">Ventas Totales</p>
                    <h3 className="text-xl md:text-3xl font-black text-indigo-600 font-tabular-nums">${stats.totalRevenue?.toLocaleString()}</h3>
                    <p className="text-[10px] text-slate-400 font-bold mt-1">Acumulado</p>
                </div>
                <div className="w-10 h-10 md:w-12 md:h-12 bg-indigo-50 text-indigo-600 rounded-xl md:rounded-2xl flex items-center justify-center">
                    <ShoppingCart className="w-5 h-5 md:w-6 md:h-6" />
                </div>
            </div>
        </div>
    );
}
