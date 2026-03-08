
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    Package,
    ShoppingCart,
    Settings,
    LogOut,
    Menu,
    ExternalLink,
    Plus,
    X as CloseIcon,
    ShieldAlert
} from 'lucide-react';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { StoreProvider, useStore } from '@/contexts/StoreContext';
import { cn } from '@/lib/utils';
import { StoreSwitcher } from '@/components/molecules/StoreSwitcher';
import { SidebarNav } from './components/SidebarNav';
import { DashboardSkeleton } from './components/DashboardSkeleton';
import { api } from '@/services/api';
import { AlertSystem } from '@/components/molecules/AlertSystem';

function DashboardContent({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();
    const { stores, activeStore, setActiveStoreById, loading: storeLoading, error: storeError } = useStore();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isSwitcherOpen, setIsSwitcherOpen] = useState(false);
    const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
    const [mounted, setMounted] = useState(false);
    const [userName, setUserName] = useState('');
    const [userAvatar, setUserAvatar] = useState('');
    const [userRole, setUserRole] = useState('USER');

    useEffect(() => { setMounted(true); }, []);
    useEffect(() => { setIsMobileMenuOpen(false); }, [pathname]);

    const handleConfirmLogout = async () => {
        const supabase = createClient();
        await supabase.auth.signOut();
        localStorage.clear();
        window.location.href = '/login';
    };

    useEffect(() => {
        const checkSession = async () => {
            if (storeLoading) return;
            const supabase = createClient();
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) { window.location.href = '/login'; return; }
            setUserName(session.user.user_metadata?.full_name || '');
            setUserAvatar(session.user.user_metadata?.avatar_url || '');
            if (stores.length === 0 && !storeLoading && !storeError) router.push('/setup');

            // Fetch real role
            try {
                const profile = await api.getProfile();
                if (profile) setUserRole(profile.role);
            } catch (err) {
                console.error('Failed to fetch profile role:', err);
            }
        };
        checkSession();
    }, [stores.length, storeLoading, storeError, router]);

    useEffect(() => {
        if (activeStore && activeStore.mode && activeStore.theme) {
            localStorage.setItem('shopy-mode', activeStore.mode);
            localStorage.setItem('shopy-theme', activeStore.theme);
        }
    }, [activeStore]);

    const menuItems = [
        { icon: LayoutDashboard, label: 'Panel', href: '/dashboard' },
        { icon: Package, label: 'Productos', href: '/dashboard/products' },
        { icon: ShoppingCart, label: 'Pedidos', href: '/dashboard/orders' },
        { icon: Settings, label: 'Ajustes', href: '/dashboard/settings' },
    ];

    if (storeLoading) return <DashboardSkeleton />;

    if (storeError) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-[var(--bg)] p-4 text-center space-y-4">
                <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mb-2"><LogOut className="w-8 h-8" /></div>
                <h2 className="text-xl font-black text-[var(--text)]">Algo salió mal</h2>
                <p className="text-[var(--text)]/60 max-w-xs text-sm font-medium">{storeError === 'Request timeout' ? 'El servidor tardó mucho en responder.' : storeError}</p>
                <button onClick={() => window.location.reload()} className="px-6 py-3 bg-[var(--primary)] text-white rounded-xl font-bold hover:opacity-90 transition-all active:scale-95 shadow-lg shadow-[var(--primary)]/20">Reintentar conexión</button>
            </div>
        );
    }

    if (stores.length === 0) return null;

    return (
        <div
            data-theme={mounted && activeStore?.applyThemeToDashboard ? activeStore.theme : 'classic'}
            data-mode={mounted && activeStore?.applyThemeToDashboard ? activeStore.mode : 'light'}
            className="flex min-h-screen bg-[var(--bg)] text-[var(--text)] transition-colors duration-300"
        >
            {/* Mobile Header */}
            <header className="md:hidden fixed top-0 left-0 right-0 h-16 bg-[var(--bg)] border-b border-[var(--border)] z-50 px-4 flex items-center justify-between transition-colors">
                <StoreSwitcher
                    stores={stores}
                    activeStore={activeStore}
                    setActiveStoreById={setActiveStoreById}
                    isOpen={isSwitcherOpen}
                    setIsOpen={setIsSwitcherOpen}
                    variant="mobile"
                />

                <div className="flex items-center gap-3">
                    <div className="flex flex-col items-end">
                        <span className="text-[11px] font-black text-[var(--text)] truncate max-w-[100px] leading-tight">{userName.split(' ')[0] || 'Hola'}</span>
                        <span className="text-[8px] font-bold text-[var(--text)]/30 uppercase tracking-tighter leading-tight">Pro Partner</span>
                    </div>
                    <div className="w-9 h-9 rounded-full bg-[var(--primary)] text-white flex items-center justify-center font-black text-xs shadow-md overflow-hidden ring-2 ring-[var(--surface)]">
                        {userAvatar ? <Image src={userAvatar} alt="Avatar" width={36} height={36} className="object-cover" /> : userName?.[0] || 'U'}
                    </div>
                    <button onClick={() => setIsMobileMenuOpen(true)} className="w-10 h-10 flex items-center justify-center text-[var(--text)]/40 hover:bg-[var(--secondary)] rounded-xl border border-[var(--border)] ml-1"><Menu className="w-5 h-5" /></button>
                </div>
            </header>

            {/* Bottom Nav (Mobile) */}
            <nav className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 w-[min(90%,400px)] h-16 bg-[var(--bg)]/70 backdrop-blur-2xl border border-[var(--border)] shadow-[0_20px_40px_-10px_rgba(0,0,0,0.1)] z-[50] rounded-[2rem] flex items-center justify-around px-2 overflow-hidden ring-1 ring-black/[0.03]">
                {menuItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;
                    return (
                        <Link key={item.href} href={item.href} className={cn("flex flex-col items-center justify-center p-2 rounded-2xl transition-all relative", isActive ? "text-[var(--primary)] scale-105" : "text-[var(--text)]/40 hover:text-[var(--text)]")}>
                            <Icon className={cn("w-6 h-6", isActive ? "stroke-[2.5]" : "stroke-[1.5]")} />
                            {isActive && <span className="absolute -bottom-1 w-1.5 h-1.5 bg-[var(--primary)] rounded-full shadow-[0_0_8px_var(--primary)]" />}
                        </Link>
                    );
                })}
            </nav>


            {/* Sidebar */}
            <aside className={cn("fixed inset-y-0 left-0 w-64 bg-[var(--bg)]/60 backdrop-blur-2xl border-r border-[var(--border)] z-[60] transition-transform duration-300 md:translate-x-0", isMobileMenuOpen ? "translate-x-0" : "-translate-x-full")}>
                <div className="flex flex-col h-full p-6 pt-10 md:pt-6">
                    <div className="md:hidden flex items-center justify-between mb-8">
                        <div className="flex items-center gap-2">
                            <Image src="/favicon.svg" alt="ShopyLinks" width={24} height={24} className="contrast-125" style={{ filter: 'var(--text-filter, none)' }} />
                            <span className="font-extrabold text-[var(--text)] tracking-tight">ShopyLinks</span>
                        </div>
                        <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 hover:bg-[var(--secondary)] rounded-xl"><CloseIcon className="w-5 h-5 text-[var(--text)]/40" /></button>
                    </div>

                    <StoreSwitcher
                        stores={stores}
                        activeStore={activeStore}
                        setActiveStoreById={setActiveStoreById}
                        isOpen={isSwitcherOpen}
                        setIsOpen={setIsSwitcherOpen}
                        className="mb-10 hidden md:block"
                    />

                    <div className="mb-6 px-2 py-3 flex items-center gap-3 bg-[var(--surface)] border border-[var(--border)] rounded-2xl shadow-sm">
                        <div className="w-8 h-8 rounded-full bg-[var(--primary)] text-white flex items-center justify-center font-black text-xs shadow-lg overflow-hidden">
                            {userAvatar ? <Image src={userAvatar} alt="Avatar" width={32} height={32} className="object-cover" /> : userName?.[0] || 'U'}
                        </div>
                        <div className="flex flex-col min-w-0">
                            <span className="text-[10px] font-bold text-[var(--text)]/30 uppercase tracking-[0.2em]">Bienvenido</span>
                            <span className="text-sm font-black text-[var(--text)] truncate">{userName || 'Usuario'}</span>
                        </div>
                    </div>

                    <SidebarNav items={menuItems} pathname={pathname} onCloseMobile={() => setIsMobileMenuOpen(false)} />

                    <div className="mt-auto space-y-2 pt-6 border-t border-[var(--border)]">
                        <Link href={activeStore?.slug ? `/${activeStore.slug}` : '#'} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-black text-[var(--primary)] hover:bg-[var(--primary)]/5 transition-all w-full text-left">
                            <ExternalLink className="w-5 h-5" />
                            <span>Ver mi tienda</span>
                        </Link>
                        {userRole === 'SUPER_ADMIN' && (
                            <Link href="/admin" className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-black text-indigo-600 bg-indigo-50 hover:bg-indigo-100 transition-all w-full text-left border border-indigo-100 mb-2">
                                <ShieldAlert className="w-5 h-5" />
                                <span>Panel Admin</span>
                            </Link>
                        )}
                        <button onClick={() => setIsLogoutModalOpen(true)} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-black text-red-500/60 hover:bg-red-500/5 hover:text-red-500 transition-all active:scale-95"><LogOut className="w-5 h-5" />Cerrar Sesión</button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 min-w-0 pt-16 md:pt-0 pb-28 md:pb-0 md:ml-64">
                <div className="p-4 md:p-8">
                    <AlertSystem />
                    {children}
                </div>
            </main>

            {isMobileMenuOpen && <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 md:hidden" onClick={() => setIsMobileMenuOpen(false)} />}

            {/* Logout Modal */}
            {isLogoutModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-[var(--surface)] w-full max-w-sm rounded-[2.5rem] shadow-[var(--shadow-strong)] overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="p-8 space-y-6 text-center flex flex-col items-center">
                            <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-2xl flex items-center justify-center"><LogOut className="w-8 h-8" /></div>
                            <div className="space-y-2">
                                <h2 className="text-xl font-black text-[var(--text)] uppercase tracking-tight">¿Cerrar Sesión?</h2>
                                <p className="text-[var(--text)]/40 font-bold text-xs">¿Estás seguro que deseas salir de tu cuenta?</p>
                            </div>
                            <div className="grid grid-cols-2 gap-3 w-full">
                                <button onClick={() => setIsLogoutModalOpen(false)} className="py-3.5 px-4 rounded-2xl font-black text-xs transition-all active:scale-95 bg-[var(--bg)] text-[var(--text)]/40 border border-[var(--border)] hover:bg-[var(--secondary)]">Cancelar</button>
                                <button onClick={handleConfirmLogout} className="py-3.5 px-4 rounded-2xl font-black text-xs transition-all active:scale-95 bg-red-500 text-white shadow-lg shadow-red-500/20 hover:scale-[1.02]">Cerrar Sesión</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}


export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    return (
        <StoreProvider>
            <DashboardContent>
                {children}
            </DashboardContent>
        </StoreProvider>
    );
}




