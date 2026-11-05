'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import QRCode from 'qrcode';
import { Download, Printer, QrCode, Loader2, Lightbulb, MapPin, Store as StoreIcon } from 'lucide-react';
import { useStore } from '@/contexts/StoreContext';
import { renderPosterToPng } from '@/lib/poster';

export default function QRPosterPage() {
    const { activeStore } = useStore();
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isReady, setIsReady] = useState(false);

    const storeUrl = activeStore?.slug
        ? `${process.env.NEXT_PUBLIC_FRONTEND_URL || 'https://shopylinks.shop'}/${activeStore.slug}`
        : '';

    useEffect(() => {
        if (!storeUrl || !canvasRef.current) return;
        setIsReady(false);
        QRCode.toCanvas(canvasRef.current, storeUrl, {
            width: 280,
            margin: 2,
            color: {
                dark: '#0f172a',
                light: '#ffffff',
            },
        })
            .then(() => setIsReady(true))
            .catch(console.error);
    }, [storeUrl]);

    const [isDownloading, setIsDownloading] = useState(false);

    const handleDownload = async () => {
        if (!activeStore) return;
        setIsDownloading(true);
        try {
            const dataUrl = await renderPosterToPng({
                storeName: activeStore.name,
                storeUrl,
                referenceLocation: activeStore.referenceLocation,
                logoUrl: activeStore.logoUrl,
            });
            const link = document.createElement('a');
            link.download = `afiche-qr-${activeStore.slug || 'tienda'}.png`;
            link.href = dataUrl;
            link.click();
        } catch (error) {
            console.error('Error generating poster:', error);
            alert('No se pudo generar el afiche. Intenta de nuevo.');
        } finally {
            setIsDownloading(false);
        }
    };

    const handlePrint = () => {
        window.print();
    };

    if (!activeStore) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 animate-spin text-[var(--primary)]" />
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-16">
            <style jsx global>{`
                @media print {
                    /* Ocultar toda la interfaz del dashboard al imprimir */
                    header, aside, nav, button, .no-print {
                        display: none !important;
                    }
                    body {
                        background: white !important;
                        margin: 0 !important;
                        padding: 0 !important;
                    }
                    #qr-printable-area {
                        display: flex !important;
                        justify-content: center !important;
                        align-items: center !important;
                        min-height: 100vh !important;
                        box-shadow: none !important;
                        border: none !important;
                    }
                }
            `}</style>

            {/* Encabezado */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print">
                <div>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[var(--primary)]/10 text-[var(--primary)] rounded-2xl flex items-center justify-center">
                            <QrCode className="w-5 h-5" />
                        </div>
                        <h1 className="text-3xl font-black text-[var(--text)] tracking-tight">QR de Mostrador</h1>
                    </div>
                    <p className="text-[var(--text)]/50 text-xs font-bold uppercase tracking-widest mt-1">
                        Material físico imprimible para tu negocio o punto de venta
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={handlePrint}
                        disabled={!isReady}
                        className="flex items-center gap-2 px-5 py-3 bg-[var(--surface)] border-2 border-[var(--border)] rounded-2xl font-black text-xs text-[var(--text)] hover:bg-[var(--secondary)] transition-all active:scale-95 disabled:opacity-50 shadow-sm"
                    >
                        <Printer className="w-4 h-4 text-[var(--primary)]" />
                        Imprimir Afiche
                    </button>
                    <button
                        onClick={handleDownload}
                        disabled={!isReady || isDownloading}
                        className="flex items-center gap-2 px-6 py-3 bg-[var(--primary)] text-[var(--bg)] rounded-2xl font-black text-xs hover:opacity-90 transition-all active:scale-95 disabled:opacity-50 shadow-lg shadow-[var(--primary)]/20"
                    >
                        {isDownloading ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <Download className="w-4 h-4" />
                        )}
                        {isDownloading ? 'Generando...' : 'Descargar afiche PNG'}
                    </button>
                </div>
            </div>

            {/* Vista previa del afiche de mostrador */}
            <div id="qr-printable-area" className="flex justify-center items-center py-4">
                <div className="w-full max-w-md bg-white text-slate-900 rounded-[2.5rem] shadow-2xl border-4 border-slate-100 p-8 sm:p-10 flex flex-col items-center text-center space-y-6 relative overflow-hidden">
                    {/* Acento superior decorativo */}
                    <div className="absolute top-0 left-0 right-0 h-3 bg-gradient-to-r from-emerald-400 via-[var(--primary)] to-emerald-500" />

                    {/* Logo de la tienda */}
                    <div className="w-24 h-24 rounded-3xl bg-slate-50 border-2 border-slate-200/80 shadow-md flex items-center justify-center overflow-hidden relative mt-2">
                        {activeStore.logoUrl ? (
                            <Image
                                src={activeStore.logoUrl}
                                alt={activeStore.name}
                                fill
                                className="object-contain p-2"
                                sizes="96px"
                            />
                        ) : (
                            <StoreIcon className="w-10 h-10 text-slate-400" />
                        )}
                    </div>

                    {/* Nombre y referencia */}
                    <div className="space-y-1 max-w-xs">
                        <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight leading-tight">
                            {activeStore.name}
                        </h2>
                        {activeStore.referenceLocation && (
                            <p className="text-xs text-slate-500 font-bold">
                                <MapPin className="inline w-3.5 h-3.5 -mt-0.5" /> {activeStore.referenceLocation}
                            </p>
                        )}
                    </div>

                    {/* Contenedor del QR */}
                    <div className="p-4 bg-white rounded-3xl border-2 border-slate-200 shadow-inner flex items-center justify-center">
                        <canvas ref={canvasRef} className="rounded-xl" />
                    </div>

                    {/* Mensaje de llamado a la acción */}
                    <div className="space-y-2 max-w-xs">
                        <p className="text-base font-black text-slate-900 leading-snug">
                            Escanea aquí para ver todo nuestro catálogo y pedir por WhatsApp
                        </p>
                        <p className="text-[11px] text-slate-400 font-mono tracking-tight break-all">
                            {storeUrl}
                        </p>
                    </div>

                    {/* Badge de WhatsApp */}
                    <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-50 border border-emerald-200 rounded-full text-emerald-700 font-black text-xs shadow-sm">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        Pedidos y consultas directas
                    </div>
                </div>
            </div>

            {/* Tips de uso */}
            <div className="bg-[var(--surface)] p-6 rounded-3xl border border-[var(--border)] space-y-3 no-print">
                <div className="flex items-center gap-2 text-[var(--primary)] font-black text-sm">
                    <Lightbulb className="w-4 h-4" />
                    <span>Consejos para tu punto de venta</span>
                </div>
                <ul className="text-xs text-[var(--text)]/60 font-bold space-y-1.5 list-disc list-inside">
                    <li>Imprime en papel tamaño carta o cartulina e insértalo en un portafiches de acrílico en el mostrador.</li>
                    <li>Tus clientes no necesitan descargar ninguna app extra; la cámara del celular abre el catálogo de inmediato.</li>
                    <li>Los pedidos y consultas llegarán a tu WhatsApp con el producto y precio ya preconfigurados.</li>
                </ul>
            </div>
        </div>
    );
}

