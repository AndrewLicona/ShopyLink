
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    Package,
    ShoppingCart,
    Settings,
    LogOut,
    ShoppingBag,
    ExternalLink,
    ChevronDown,
    PlusCircle,
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
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        setIsMobileMenuOpen(false);
    }, [pathname]);

    const handleLogout = async () => {
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
                <div className="relative">
                    <button
                        onClick={() => setIsSwitcherOpen(!isSwitcherOpen)}
                        className="flex items-center gap-3 active:scale-95 transition-all text-left"
                    >
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center overflow-hidden shadow-[var(--shadow)] border border-transparent bg-[var(--surface)] relative">
                            {activeStore?.logoUrl ? (
                                <Image
                                    src={activeStore.logoUrl}
                                    alt="Logo"
                                    fill
                                    className="object-contain"
                                    sizes="36px"
                                />
                            ) : (
                                <div className="w-full h-full bg-[var(--primary)] flex items-center justify-center">
                                    <ShoppingBag className="text-[var(--bg)] w-5 h-5" />
                                </div>
                            )}
                        </div>
                        <div className="flex flex-col">
                            <span className="text-sm font-black text-[var(--text)] leading-none truncate max-w-[120px]">{activeStore?.name || 'ShopyLink'}</span>
                            <div className="flex items-center gap-1 mt-0.5">
                                <span className="text-[10px] font-bold text-[var(--primary)] uppercase tracking-widest">Cambiar</span>
                                <ChevronDown className="w-2.5 h-2.5 text-[var(--primary)]/60" />
                            </div>
                        </div>
                    </button>

                    {/* Mobile Switcher Dropdown */}
                    {isSwitcherOpen && (
                        <>
                            <div className="fixed inset-0 z-40" onClick={() => setIsSwitcherOpen(false)} />
                            <div className="absolute top-full left-0 mt-2 w-64 bg-[var(--bg)] rounded-2xl shadow-xl border border-[var(--border)] z-50 py-2 animate-in fade-in slide-in-from-top-2">
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

                <button
                    onClick={() => setIsMobileMenuOpen(true)}
                    className="w-10 h-10 flex items-center justify-center text-[var(--text)]/40 hover:bg-[var(--secondary)] rounded-xl transition-colors border border-[var(--border)]"
                >
                    <Settings className="w-5 h-5" />
                </button>
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
                    onClick={handleLogout}
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
                            <div className="w-8 h-8 bg-[var(--primary)] rounded-lg flex items-center justify-center">
                                <ShoppingBag className="text-[var(--bg)] w-4 h-4" />
                            </div>
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
                                        className="object-contain"
                                        sizes="40px"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-[var(--primary)] flex items-center justify-center">
                                        <ShoppingBag className="text-[var(--bg)] w-6 h-6" />
                                    </div>
                                )}
                            </div>
                            <div className="flex-1 text-left min-w-0">
                                <p className="text-sm font-black text-[var(--text)] leading-none truncate">{activeStore?.name || 'ShopyLink'}</p>
                                <p className="text-[10px] font-bold text-[var(--primary)] uppercase tracking-widest mt-1">Dashboard</p>
                            </div>
                            <ChevronDown className="w-4 h-4 text-[var(--text)]/40" />
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

                    <nav className="flex-1 space-y-1 overflow-y-auto custom-scrollbar pr-1">
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

                    <div className="mt-auto space-y-1 pt-6 border-t border-[var(--border)]">
                        <Link
                            href={activeStore?.slug ? `/${activeStore.slug}` : '#'}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-[var(--text)]/40 hover:bg-[var(--secondary)] hover:text-[var(--text)] transition-all border-none bg-transparent active:scale-95 text-left w-full"
                        >
                            <ExternalLink className="w-5 h-5 text-[var(--text)]/30" />
                            <span>Ver mi tienda</span>
                        </Link>
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-500 hover:bg-red-500/10 transition-all active:scale-95"
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
