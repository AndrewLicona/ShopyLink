'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import QRCode from 'qrcode';
import { Download, Printer, QrCode, Loader2, Lightbulb, MapPin, Store as StoreIcon } from 'lucide-react';
import { useStore } from '@/contexts/StoreContext';
import { renderPosterToPng } from '@/lib/poster';

/** Skeleton HTML of the print window: only the poster image is printed. */
const PRINT_DOCUMENT = `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="utf-8" />
<title>Afiche QR</title>
<style>
    @page { size: A4 portrait; margin: 8mm; }
    html, body { margin: 0; padding: 0; background: #fff; }
    img {
        display: block;
        width: 100%;
        height: auto;
        max-height: 268mm;
        object-fit: contain;
        margin: 0 auto;
        break-inside: avoid;
        page-break-inside: avoid;
    }
</style>
</head>
<body><img id="poster" alt="Afiche QR de la tienda" /></body>
</html>`;

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
    const [isPrinting, setIsPrinting] = useState(false);

    const posterOptions = () => ({
        storeName: activeStore?.name || 'Mi Tienda',
        storeUrl,
        referenceLocation: activeStore?.referenceLocation,
        logoUrl: activeStore?.logoUrl,
    });

    const handleDownload = async () => {
        if (!activeStore) return;
        setIsDownloading(true);
        try {
            const dataUrl = await renderPosterToPng(posterOptions());
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

    /**
     * Imprime el afiche completo en una sola hoja.
     *
     * Se genera el mismo PNG que se descarga y se imprime en una ventana
     * aislada con `@page A4 portrait`, así el resultado es idéntico al
     * afiche y nunca se corta entre dos páginas.
     */
    const handlePrint = async () => {
        if (!activeStore) return;

        // Se abre la ventana de inmediato (dentro del clic del usuario) para
        // no ser bloqueada por el navegador durante el render del afiche.
        const printWindow = window.open('', '_blank', 'width=900,height=1200');
        if (!printWindow) {
            // Popup bloqueado: usamos la impresión directa del DOM.
            window.print();
            return;
        }

        setIsPrinting(true);
        try {
            printWindow.document.write(PRINT_DOCUMENT);
            printWindow.document.close();

            const dataUrl = await renderPosterToPng(posterOptions());
            const img = printWindow.document.getElementById('poster') as HTMLImageElement | null;
            if (!img) throw new Error('No se pudo preparar el afiche para imprimir.');

            img.src = dataUrl;
            await img.decode().catch(() => undefined);

            printWindow.focus();
            printWindow.print();
            printWindow.close();
        } catch (error) {
            console.error('Error printing poster:', error);
            printWindow.close();
            alert('No se pudo preparar la impresión. Intenta de nuevo.');
        } finally {
            setIsPrinting(false);
        }
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
                    @page { size: A4 portrait; margin: 8mm; }
                    html, body {
                        height: 100%;
                        overflow: hidden !important;
                        background: white !important;
                        margin: 0 !important;
                        padding: 0 !important;
                    }
                    /* Ocultar toda la interfaz del dashboard al imprimir */
                    body * { visibility: hidden !important; }
                    #qr-printable-area, #qr-printable-area * { visibility: visible !important; }
                    #qr-printable-area {
                        position: fixed !important;
                        inset: 0 !important;
                        display: flex !important;
                        justify-content: center !important;
                        align-items: center !important;
                        width: 100% !important;
                        height: 100% !important;
                        padding: 0 !important;
                        margin: 0 !important;
                    }
                    #qr-poster {
                        width: 100% !important;
                        max-width: 190mm !important;
                        max-height: 265mm !important;
                        box-shadow: none !important;
                        border-color: #e2e8f0 !important;
                        break-inside: avoid !important;
                        page-break-inside: avoid !important;
                    }
                    .no-print { display: none !important; }
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

                <div className="flex items-center gap-2">
                    <button
                        onClick={handlePrint}
                        disabled={!isReady || isPrinting}
                        title="Imprimir"
                        aria-label="Imprimir afiche"
                        className="flex items-center justify-center p-3.5 bg-[var(--surface)] border-2 border-[var(--border)] rounded-2xl text-[var(--text)] hover:bg-[var(--secondary)] transition-all active:scale-95 disabled:opacity-50 shadow-sm"
                    >
                        {isPrinting ? (
                            <Loader2 className="w-5 h-5 animate-spin text-[var(--primary)]" />
                        ) : (
                            <Printer className="w-5 h-5 text-[var(--primary)]" />
                        )}
                    </button>
                    <button
                        onClick={handleDownload}
                        disabled={!isReady || isDownloading}
                        title="Descargar"
                        aria-label="Descargar afiche PNG"
                        className="flex items-center justify-center p-3.5 bg-[var(--primary)] text-[var(--bg)] rounded-2xl hover:opacity-90 transition-all active:scale-95 disabled:opacity-50 shadow-lg shadow-[var(--primary)]/20"
                    >
                        {isDownloading ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            <Download className="w-5 h-5" />
                        )}
                    </button>
                </div>
            </div>

            {/* Vista previa del afiche de mostrador */}
            <div id="qr-printable-area" className="flex justify-center items-center py-4">
                <div id="qr-poster" className="w-full max-w-md bg-white text-slate-900 rounded-[2.5rem] shadow-2xl border-4 border-slate-100 p-8 sm:p-10 flex flex-col items-center text-center space-y-6 relative overflow-hidden">
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
                    <li>El botón de imprimir genera el afiche completo en una sola hoja tamaño carta/A4.</li>
                    <li>El botón de descargar guarda la imagen del afiche completo en PNG, lista para compartir o para tus diseños.</li>
                    <li>Imprímelo en papel tamaño carta o cartulina e insértalo en un portafiches de acrílico en el mostrador.</li>
                    <li>Tus clientes no necesitan descargar ninguna app extra; la cámara del celular abre el catálogo de inmediato.</li>
                </ul>
            </div>
        </div>
    );
}
