'use client';

import {
    ArrowRight,
    ZapIcon
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export default function SimplifiedLanding() {
    return (
        <div className="min-h-screen bg-white text-gray-900 selection:bg-blue-600 selection:text-white flex flex-col">
            {/* Header / Navbar */}
            <header className="fixed top-0 left-0 right-0 h-20 bg-white/80 backdrop-blur-md z-50 px-6 border-b border-gray-50">
                <div className="max-w-7xl mx-auto h-full flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2 group">
                        <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-blue-50 group-hover:bg-blue-100 transition-colors">
                            <Image src="/favicon.svg" alt="ShopyLink Logo" width={28} height={28} />
                        </div>
                        <span className="text-xl font-black tracking-tighter">Shopy<span className="text-blue-600">Link</span></span>
                    </Link>

                    <Link href="/login" className="text-sm font-black uppercase tracking-widest text-gray-400 hover:text-blue-600 transition-colors">
                        Iniciar Sesión
                    </Link>
                </div>
            </header>

            {/* Hero Section */}
            <section className="relative pt-32 pb-12 flex-1 flex flex-col items-center justify-center overflow-hidden px-6">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] pointer-events-none opacity-40">
                    <div className="absolute top-10 left-1/4 w-64 h-64 bg-blue-400 rounded-full mix-blend-multiply filter blur-[100px] animate-blob"></div>
                    <div className="absolute top-10 right-1/4 w-64 h-64 bg-purple-400 rounded-full mix-blend-multiply filter blur-[100px] animate-blob animation-delay-2000"></div>
                </div>

                <div className="relative text-center max-w-lg mx-auto">
                    <div className="flex flex-col items-center justify-center gap-4 mb-8">
                        <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center shadow-2xl shadow-blue-500/10 border border-blue-50 ring-8 ring-blue-50/50">
                            <Image src="/favicon.svg" alt="ShopyLink" width={40} height={40} />
                        </div>
                    </div>

                    <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-600 px-4 py-2 rounded-full mb-6">
                        <ZapIcon size={14} fill="currentColor" />
                        <span className="text-[10px] font-black uppercase tracking-[0.15em]">Tienda en WhatsApp en minutos</span>
                    </div>

                    <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-tight mb-6 bg-gradient-to-b from-gray-900 to-gray-600 bg-clip-text text-transparent">
                        Vende por WhatsApp <br />
                        <span className="text-blue-600">sin complicaciones</span>
                    </h1>

                    <p className="text-lg text-gray-500 mb-10 leading-relaxed font-medium">
                        La forma más rápida de digitalizar tu catálogo y recibir pedidos directamente en tu móvil.
                    </p>

                    <div className="flex flex-col gap-4 w-full max-w-xs mx-auto">
                        <Link href="/signup" className="w-full bg-blue-600 text-white px-8 py-5 rounded-[2rem] font-black text-lg hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/25 active:scale-95 flex items-center justify-center gap-3">
                            Empezar Gratis
                            <ArrowRight size={20} />
                        </Link>
                        <Link href="/login" className="w-full bg-white text-gray-900 border-2 border-gray-100 px-8 py-5 rounded-[2rem] font-black text-lg hover:bg-gray-50 transition-all active:scale-95 flex items-center justify-center">
                            Iniciar Sesión
                        </Link>
                    </div>
                </div>
            </section>

            {/* Basic Footer */}
            <footer className="py-10 px-6 border-t border-gray-100 bg-gray-50 mt-auto">
                <div className="max-w-lg mx-auto text-center space-y-4">
                    <p className="text-gray-400 text-xs font-black uppercase tracking-widest">&copy; 2026 ShopyLink • Todos los derechos reservados</p>

                </div>
            </footer>
        </div>
    );
}




