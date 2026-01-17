
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
    ChevronDown,
    ExternalLink,
    PlusCircle,
    Link as LinkIcon,
    X as CloseIcon
} from 'lucide-react';
import Image from 'next/image';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { StoreProvider, useStore } from '@/contexts/StoreContext';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

function DashboardContent({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();
    const { stores, activeStore, setActiveStoreById, loading: storeLoading } = useStore();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isSwitcherOpen, setIsSwitcherOpen] = useState(false);
    const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
    const [mounted, setMounted] = useState(false);
    const [userName, setUserName] = useState('');
    const [userAvatar, setUserAvatar] = useState('');

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        setIsMobileMenuOpen(false);
    }, [pathname]);

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

            if (!session) {
                window.location.href = '/login';
                return;
            }

            setUserName(session.user.user_metadata?.full_name || '');
            setUserAvatar(session.user.user_metadata?.avatar_url || '');

            if (stores.length === 0 && !storeLoading) {
                router.push('/setup');
            }
        };

        checkSession();
    }, [stores.length, storeLoading, router]);

    const menuItems = [
        { icon: LayoutDashboard, label: 'Panel', href: '/dashboard' },
        { icon: Package, label: 'Productos', href: '/dashboard/products' },
        { icon: ShoppingCart, label: 'Pedidos', href: '/dashboard/orders' },
        { icon: Settings, label: 'Ajustes', href: '/dashboard/settings' },
    ];

    if (storeLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[var(--bg)] text-[var(--text)]/40 font-medium">
                Cargando panel...
            </div>
        );
    }

    if (stores.length === 0) {
        return null;
    }

    return (
        <div
            data-theme={mounted && activeStore?.applyThemeToDashboard ? activeStore.theme : 'classic'}
            data-mode={mounted && activeStore?.applyThemeToDashboard ? activeStore.mode : 'light'}
            className="flex min-h-screen bg-[var(--bg)] text-[var(--text)] transition-colors duration-300"
        >
            {/* Mobile Header */}
            <header className="md:hidden fixed top-0 left-0 right-0 h-16 bg-[var(--bg)] border-b border-[var(--border)] z-50 px-4 flex items-center justify-between transition-colors">
                {/* Store Switcher */}
                <div className="flex items-center gap-2 relative">
                    <button
                        onClick={() => setIsSwitcherOpen(!isSwitcherOpen)}
                        className="flex items-center gap-2 p-1.5 rounded-xl bg-[var(--surface)] border border-[var(--border)] shadow-sm active:scale-95 transition-all"
                    >
                        <div className="w-7 h-7 rounded-lg overflow-hidden relative border border-[var(--border)] bg-[var(--bg)]">
                            {activeStore?.logoUrl ? (
                                <Image
                                    src={activeStore.logoUrl}
                                    alt="Logo"
                                    fill
                                    className="object-contain p-1"
                                    sizes="28px"
                                />
                            ) : (
                                <div className="w-full h-full bg-[var(--primary)]/10 flex items-center justify-center text-[var(--primary)] font-bold text-[10px]">
                                    {activeStore?.name?.[0] || 'T'}
                                </div>
                            )}
                        </div>
                        <ChevronDown className="w-3 h-3 text-[var(--text)]/40" />
                    </button>

                    {isSwitcherOpen && (
                        <>
                            <div className="fixed inset-0 z-[60]" onClick={() => setIsSwitcherOpen(false)} />
                            <div className="absolute top-full left-0 mt-2 w-64 bg-[var(--bg)] rounded-2xl shadow-xl border border-[var(--border)] z-[70] py-2 animate-in fade-in slide-in-from-top-2">
                                <div className="px-4 py-2 text-[10px] font-bold text-[var(--text)]/40 uppercase tracking-widest">Mis Tiendas</div>
                                {stores.map(s => (
                                    <button
                                        key={s.id}
                                        onClick={() => {
                                            setActiveStoreById(s.id);
                                            setIsSwitcherOpen(false);
                                        }}
                                        className={cn(
                                            "w-full flex items-center gap-3 px-4 py-3 hover:bg-[var(--secondary)] transition-colors text-left",
                                            activeStore?.id === s.id ? "bg-[var(--primary)]/10" : ""
                                        )}
                                    >
                                        <div className="w-8 h-8 rounded-lg overflow-hidden border border-[var(--border)] bg-[var(--bg)] relative">
                                            {s.logoUrl ? (
                                                <Image src={s.logoUrl} alt={s.name} fill className="object-contain" sizes="32px" />
                                            ) : (
                                                <div className="w-full h-full bg-[var(--primary)]/10 flex items-center justify-center text-[var(--primary)] font-bold text-xs">{s.name[0]}</div>
                                            )}
                                        </div>
                                        <span className={cn("text-sm font-bold", activeStore?.id === s.id ? "text-[var(--primary)]" : "text-[var(--text)]")}>{s.name}</span>
                                    </button>
                                ))}
                                <div className="h-px bg-[var(--border)] my-2" />
                                <Link
                                    href="/setup"
                                    className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-[var(--text)] hover:bg-[var(--secondary)]"
                                >
                                    <PlusCircle className="w-5 h-5 text-[var(--primary)]" />
                                    Nueva Tienda
                                </Link>
                            </div>
                        </>
                    )}
                </div>

                {/* User Profile (Mobile Header) */}
                <div className="flex items-center gap-3">
                    <div className="flex flex-col items-end">
                        <span className="text-[11px] font-black text-[var(--text)] truncate max-w-[100px] leading-tight">
                            {userName.split(' ')[0] || 'Hola'}
                        </span>
                        <span className="text-[8px] font-bold text-[var(--text)]/30 uppercase tracking-tighter leading-tight">Pro Partner</span>
                    </div>
                    <div className="w-9 h-9 rounded-full bg-[var(--primary)] text-white flex items-center justify-center font-black text-xs uppercase shadow-md overflow-hidden ring-2 ring-[var(--surface)]">
                        {userAvatar ? (
                            <Image src={userAvatar} alt="Avatar" width={36} height={36} className="object-cover" />
                        ) : (
                            userName?.[0] || 'U'
                        )}
                    </div>
                    <button
                        onClick={() => setIsMobileMenuOpen(true)}
                        className="w-10 h-10 flex items-center justify-center text-[var(--text)]/40 hover:bg-[var(--secondary)] rounded-xl transition-colors border border-[var(--border)] ml-1"
                    >
                        <Menu className="w-5 h-5" />
                    </button>
                </div>
            </header>

            {/* Bottom Navigation (Mobile) */}
            <nav className="md:hidden fixed bottom-6 left-4 right-4 h-16 bg-[var(--bg)]/80 backdrop-blur-xl border border-[var(--border)] shadow-[var(--shadow-strong)] z-50 rounded-[2rem] flex items-center justify-around px-2 overflow-hidden ring-1 ring-[var(--text)]/5">
                {menuItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex flex-col items-center justify-center p-2 rounded-2xl transition-all duration-300 relative",
                                isActive ? "text-[var(--primary)] scale-105" : "text-[var(--text)]/40 hover:text-[var(--text)]"
                            )}
                        >
                            <Icon className={cn("w-6 h-6", isActive ? "stroke-[2.5]" : "stroke-[1.5]")} />
                            {isActive && (
                                <span className="absolute -bottom-1 w-1 h-1 bg-[var(--primary)] rounded-full" />
                            )}
                        </Link>
                    );
                })}
                <button
                    onClick={() => setIsLogoutModalOpen(true)}
                    className="flex flex-col items-center justify-center p-2 rounded-2xl text-red-500/60 hover:text-red-500 transition-all"
                >
                    <LogOut className="w-6 h-6 stroke-[1.5]" />
                </button>
            </nav>

            {/* Sidebar (Desktop + Mobile Drawer) */}
            <aside className={cn(
                "fixed inset-y-0 left-0 w-64 bg-[var(--bg)] border-r border-[var(--border)] z-[60] transition-transform duration-300 md:translate-x-0",
                isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
            )}>
                <div className="flex flex-col h-full p-6 pt-10 md:pt-6">
                    {/* Drawer Header (Mobile) */}
                    <div className="md:hidden flex items-center justify-between mb-8">
                        <div className="flex items-center gap-2">
                            <Image
                                src="/favicon.svg"
                                alt="ShopyLink"
                                width={24}
                                height={24}
                                className="contrast-125"
                                style={{ filter: 'var(--text-filter, none)' }}
                            />
                            <span className="font-extrabold text-[var(--text)] tracking-tight">ShopyLink</span>
                        </div>
                        <button
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="p-2 hover:bg-[var(--secondary)] rounded-xl"
                        >
                            <CloseIcon className="w-5 h-5 text-[var(--text)]/40" />
                        </button>
                    </div>


                    {/* Desktop Switcher */}
                    <div className="hidden md:block relative mb-10">
                        <button
                            onClick={() => setIsSwitcherOpen(!isSwitcherOpen)}
                            className="w-full flex items-center gap-3 p-2 rounded-2xl hover:bg-[var(--secondary)] transition-all border border-transparent active:scale-95"
                        >
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center overflow-hidden border border-transparent shadow-[var(--shadow)] bg-[var(--surface)] relative">
                                {activeStore?.logoUrl ? (
                                    <Image
                                        src={activeStore.logoUrl}
                                        alt="Logo"
                                        fill
                                        className="object-contain p-1.5"
                                        sizes="40px"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-[var(--primary)]/10 flex items-center justify-center">
                                        <LinkIcon className="text-[var(--primary)] w-5 h-5" />
                                    </div>
                                )}
                            </div>
                            <div className="flex-1 text-left min-w-0">
                                <p className="text-sm font-black text-[var(--text)] leading-none truncate">{activeStore?.name || 'Mi Tienda'}</p>
                                <p className="text-[10px] font-bold text-[var(--text)]/30 uppercase tracking-widest mt-1">Gestionar</p>
                            </div>
                            <ChevronDown className="w-4 h-4 text-[var(--text)]/30" />
                        </button>

                        {isSwitcherOpen && (
                            <>
                                <div className="fixed inset-0 z-[70]" onClick={() => setIsSwitcherOpen(false)} />
                                <div className="absolute top-full left-0 right-0 mt-2 bg-[var(--bg)] rounded-2xl shadow-2xl border border-[var(--border)] z-[80] py-2 animate-in fade-in slide-in-from-top-2">
                                    <div className="px-4 py-2 text-[10px] font-bold text-[var(--text)]/40 uppercase tracking-widest">Mis Tiendas</div>
                                    {stores.map(s => (
                                        <button
                                            key={s.id}
                                            onClick={() => {
                                                setActiveStoreById(s.id);
                                                setIsSwitcherOpen(false);
                                            }}
                                            className={cn(
                                                "w-full flex items-center gap-3 px-4 py-3 hover:bg-[var(--secondary)] transition-colors text-left",
                                                activeStore?.id === s.id ? "bg-[var(--primary)]/10" : ""
                                            )}
                                        >
                                            <div className="w-8 h-8 rounded-lg overflow-hidden border border-[var(--border)] bg-[var(--bg)] relative">
                                                {s.logoUrl ? (
                                                    <Image src={s.logoUrl} alt={s.name} fill className="object-contain" sizes="32px" />
                                                ) : (
                                                    <div className="w-full h-full bg-[var(--primary)]/10 flex items-center justify-center text-[var(--primary)] font-bold text-xs">{s.name[0]}</div>
                                                )}
                                            </div>
                                            <span className={cn("text-sm font-bold", activeStore?.id === s.id ? "text-[var(--primary)]" : "text-[var(--text)]")}>{s.name}</span>
                                        </button>
                                    ))}
                                    <div className="h-px bg-[var(--border)] my-2" />
                                    <Link
                                        href="/setup"
                                        className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-[var(--text)] hover:bg-[var(--secondary)]"
                                    >
                                        <PlusCircle className="w-5 h-5 text-[var(--primary)]" />
                                        Nueva Tienda
                                    </Link>
                                </div>
                            </>
                        )}
                    </div>

                    {/* User Profile Info - Now common for Mobile and Desktop sidebars */}
                    <div className="mb-6 px-2 py-3 flex items-center gap-3 bg-[var(--surface)] border border-[var(--border)] rounded-2xl shadow-sm">
                        <div className="w-8 h-8 rounded-full bg-[var(--primary)] text-white flex items-center justify-center font-black text-xs uppercase shadow-lg overflow-hidden">
                            {userAvatar ? (
                                <Image src={userAvatar} alt="Avatar" width={32} height={32} className="object-cover" />
                            ) : (
                                userName?.[0] || 'U'
                            )}
                        </div>
                        <div className="flex flex-col min-w-0">
                            <span className="text-[10px] font-bold text-[var(--text)]/30 uppercase tracking-[0.2em]">Bienvenido</span>
                            <span className="text-sm font-black text-[var(--text)] truncate">{userName || 'Usuario'}</span>
                        </div>
                    </div>

                    <nav className="flex-1 space-y-1 overflow-y-auto custom-scrollbar pr-1">
                        <div className="px-4 py-2 text-[10px] font-bold text-[var(--text)]/20 uppercase tracking-[0.2em] mb-2">Menú Principal</div>
                        {menuItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = pathname === item.href;
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={cn(
                                        "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all group",
                                        isActive
                                            ? "bg-[var(--primary)]/10 text-[var(--primary)]"
                                            : "text-[var(--text)]/60 hover:bg-[var(--secondary)] hover:text-[var(--text)]"
                                    )}
                                >
                                    <Icon className={cn("w-5 h-5", isActive ? "text-[var(--primary)]" : "text-[var(--text)]/40 group-hover:text-[var(--text)]/60")} />
                                    {item.label}
                                </Link>
                            );
                        })}
                    </nav>

                    <div className="mt-auto space-y-2 pt-6 border-t border-[var(--border)]">

                        <Link
                            href={activeStore?.slug ? `/${activeStore.slug}` : '#'}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-black text-[var(--primary)] hover:bg-[var(--primary)]/5 transition-all w-full text-left"
                        >
                            <ExternalLink className="w-5 h-5" />
                            <span>Ver mi tienda</span>
                        </Link>

                        <button
                            onClick={() => setIsLogoutModalOpen(true)}
                            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-black text-red-500/60 hover:bg-red-500/5 hover:text-red-500 transition-all active:scale-95"
                        >
                            <LogOut className="w-5 h-5" />
                            Cerrar Sesión
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 min-w-0 pt-16 md:pt-0 pb-28 md:pb-0 md:ml-64">
                <div className="p-4 md:p-8">
                    {children}
                </div>
            </main>

            {/* Backdrop for mobile */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 md:hidden"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}
            {/* Logout Confirmation Modal */}
            {isLogoutModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-[var(--surface)] w-full max-w-sm rounded-[2.5rem] shadow-[var(--shadow-strong)] overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="p-8 space-y-6">
                            <div className="flex flex-col items-center text-center gap-4">
                                <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-2xl flex items-center justify-center">
                                    <LogOut className="w-8 h-8" />
                                </div>
                                <div className="space-y-2">
                                    <h2 className="text-xl font-black text-[var(--text)] uppercase tracking-tight">¿Cerrar Sesión?</h2>
                                    <p className="text-[var(--text)]/40 font-bold text-xs">¿Estás seguro que deseas salir de tu cuenta?</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    onClick={() => setIsLogoutModalOpen(false)}
                                    className="py-3.5 px-4 rounded-2xl font-black text-xs transition-all active:scale-95 bg-[var(--bg)] text-[var(--text)]/40 border border-[var(--border)] hover:bg-[var(--secondary)]"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={handleConfirmLogout}
                                    className="py-3.5 px-4 rounded-2xl font-black text-xs transition-all active:scale-95 bg-red-500 text-white shadow-lg shadow-red-500/20 hover:scale-[1.02]"
                                >
                                    Cerrar Sesión
                                </button>
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




