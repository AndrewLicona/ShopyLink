'use client';

import { useEffect, useState } from 'react';
import { api } from '@/services/api';
import { Store } from '@/types/types';
import { Loader2, Search, Store as StoreIcon, Users, Activity, Megaphone, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { copyToClipboard } from '@/lib/clipboard';

interface AdminStore extends Store {
    planType: 'FREE' | 'PRO';
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

import { KPISection } from './components/KPISection';
import { StoreGrid } from './components/StoreGrid';
import { UserGrid, type AdminUser } from './components/UserGrid';
import { ActivityLog, type AdminLog } from './components/ActivityLog';
import { BroadcastManager, type AdminBroadcast } from './components/BroadcastManager';

export default function AdminDashboard() {
    const [stores, setStores] = useState<AdminStore[]>([]);
    const [users, setUsers] = useState<AdminUser[]>([]);
    const [logs, setLogs] = useState<AdminLog[]>([]);
    const [broadcasts, setBroadcasts] = useState<AdminBroadcast[]>([]);
    const [stats, setStats] = useState({
        totalStores: 0,
        totalUsers: 0,
        proStores: 0,
        totalProducts: 0,
        totalOrders: 0,
        totalRevenue: 0,
        avgOrderValue: 0,
        conversionRate: 0,
        newStoresLast7Days: 0,
    });
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState(false);
    const [actionError, setActionError] = useState('');
    const [updating, setUpdating] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'stores' | 'users' | 'activity' | 'broadcasts'>('stores');
    const [searchTerm, setSearchTerm] = useState('');

    const [newBroadcast, setNewBroadcast] = useState({
        title: '',
        content: '',
        type: 'INFO' as 'INFO' | 'WARNING' | 'PROMOTION' | 'SUCCESS',
        expiresAt: ''
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            setLoadError(false);
            const [storesData, usersData, metricsData, logsData, broadcastData] = await Promise.all([
                api.getAllStoresAsAdmin(),
                api.getAllUsersAsAdmin(),
                api.getAdminMetrics(),
                api.getAdminLogs(),
                api.getActiveBroadcasts()
            ]);
            setStores(storesData);
            setUsers(usersData);
            setStats(metricsData);
            setLogs(logsData || []);
            setBroadcasts(broadcastData || []);
        } catch (error) {
            console.error('Error loading admin data:', error);
            setLoadError(true);
        } finally {
            setLoading(false);
        }
    };

    const handleImpersonate = async (userId: string) => {
        try {
            setUpdating(userId);
            const res = await api.impersonate(userId);
            if (res.token) {
                localStorage.setItem('impersonation_token', res.token);
                localStorage.setItem('impersonated_user_id', userId);
                window.location.href = '/dashboard';
            }
        } catch (err) {
            console.error('Impersonate failed:', err);
            setActionError('No se pudo acceder a la cuenta. Inténtalo de nuevo.');
        } finally {
            setUpdating(null);
        }
    };

    const handleUpdatePlan = async (id: string, planType: 'FREE' | 'PRO') => {
        try {
            setUpdating(id);
            await api.updateStoreAsAdmin(id, { planType });
            await loadData();
        } catch (error) {
            console.error('Failed to update plan:', error);
            setActionError('No se pudo actualizar el plan. Inténtalo de nuevo.');
        } finally {
            setUpdating(null);
        }
    };

    const handleDeactivateBroadcast = async (id: string) => {
        try {
            await api.deactivateBroadcast(id);
            await loadData();
        } catch (error) {
            console.error('Failed to deactivate broadcast:', error);
            setActionError('No se pudo desactivar el comunicado.');
        }
    };

    const handleCreateBroadcast = async () => {
        if (!newBroadcast.title || !newBroadcast.content) {
            alert('Título y mensaje son obligatorios');
            return;
        }

        try {
            setUpdating('new-broadcast');
            await api.createBroadcast(newBroadcast);
            setNewBroadcast({
                title: '',
                content: '',
                type: 'INFO',
                expiresAt: ''
            });
            await loadData();
        } catch (error) {
            console.error('Failed to create broadcast:', error);
            setActionError('No se pudo publicar el comunicado.');
        } finally {
            setUpdating(null);
        }
    };

    const handleCopy = (text: string) => {
        copyToClipboard(text);
    };

    const filteredStores = stores.filter(s =>
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.slug.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.admin?.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredUsers = users.filter(u =>
        u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (u.name && u.name.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    if (loading && stores.length === 0 && users.length === 0) {
        return (
            <div className="flex flex-col justify-center items-center min-h-[50vh] gap-4">
                <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
                <p className="text-slate-400 font-medium text-sm">Cargando datos maestros...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 md:space-y-8 animate-in fade-in duration-500 pb-20">
            <div className="flex flex-wrap items-end justify-between gap-3">
                <div><p className="text-xs font-bold uppercase tracking-[0.16em] text-indigo-600">Administración</p><h1 className="mt-1 text-2xl sm:text-3xl font-black tracking-tight text-slate-900">Resumen de la plataforma</h1><p className="mt-1 text-sm text-slate-500">Gestiona tiendas, usuarios y comunicados desde un solo lugar.</p></div>
                <button type="button" onClick={loadData} disabled={loading} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-50"><RefreshCw className={cn('h-4 w-4', loading && 'animate-spin')} /> Actualizar</button>
            </div>
            {actionError && <div role="alert" className="flex items-center justify-between gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"><span>{actionError}</span><button onClick={() => setActionError('')} className="font-bold">Cerrar</button></div>}
            {loadError && <div role="alert" className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 flex flex-wrap items-center justify-between gap-3"><span>No se pudieron cargar los datos del panel.</span><button onClick={loadData} className="font-bold underline">Reintentar</button></div>}
            <KPISection stats={stats} />

            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden min-h-[360px]">
                <div className="p-4 md:p-6 border-b border-slate-100 space-y-4">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                        <nav aria-label="Secciones de administración" className="grid w-full grid-cols-2 gap-1 rounded-2xl bg-slate-100 p-1 sm:grid-cols-4 md:w-auto">
                            {([
                                { id: 'stores', label: 'Tiendas', icon: StoreIcon },
                                { id: 'users', label: 'Usuarios', icon: Users },
                                { id: 'activity', label: 'Actividad', icon: Activity },
                                { id: 'broadcasts', label: 'Comunicados', icon: Megaphone },
                            ] as const).map(({ id, label, icon: Icon }) => (
                                <button key={id} type="button" onClick={() => setActiveTab(id)} aria-current={activeTab === id ? 'page' : undefined}
                                    className={cn('flex min-h-11 min-w-0 items-center justify-center gap-2 rounded-xl px-2 py-2.5 text-xs font-bold transition-colors sm:px-4', activeTab === id ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500 hover:bg-white/60 hover:text-slate-800')}>
                                    <Icon aria-hidden="true" className="h-4 w-4 shrink-0" /><span>{label}</span>
                                </button>
                            ))}
                        </nav>
                        {(activeTab === 'stores' || activeTab === 'users') && <div className="relative w-full md:w-auto">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                type="text"
                                aria-label={activeTab === 'stores' ? 'Buscar tiendas' : 'Buscar usuarios'}
                                placeholder={
                                    activeTab === 'stores' ? "Buscar tienda, link o email..." :
                                        activeTab === 'users' ? "Buscar por nombre o email..." :
                                            "Filtrar lista..."
                                }
                                className="w-full md:w-80 pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-slate-300"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>}
                    </div>
                </div>

                <div>
                    {activeTab === 'stores' ? (
                        <StoreGrid
                            stores={filteredStores}
                            onUpdatePlan={handleUpdatePlan}
                            updating={updating}
                        />
                    ) : activeTab === 'users' ? (
                        <UserGrid
                            users={filteredUsers}
                            onImpersonate={handleImpersonate}
                            onCopy={handleCopy}
                            updating={updating}
                        />
                    ) : activeTab === 'activity' ? (
                        <ActivityLog logs={logs} />
                    ) : (
                        <BroadcastManager
                            broadcasts={broadcasts}
                            newBroadcast={newBroadcast}
                            onNewBroadcastChange={setNewBroadcast}
                            onCreateBroadcast={handleCreateBroadcast}
                            onDeactivateBroadcast={handleDeactivateBroadcast}
                            updating={updating}
                        />
                    )}

                    {((activeTab === 'stores' && filteredStores.length === 0) || (activeTab === 'users' && filteredUsers.length === 0)) && (
                        <div className="py-32 flex flex-col items-center justify-center text-center px-4">
                            <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-6 border-2 border-dashed border-slate-200">
                                <Search className="w-10 h-10 text-slate-200" />
                            </div>
                            <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">Sin resultados</h3>
                            <p className="text-slate-400 text-sm max-w-xs mx-auto font-medium">No encontramos resultados{searchTerm ? <> para &ldquo;{searchTerm}&rdquo;</> : null}.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
