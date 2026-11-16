'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import QRCode from 'qrcode';
import { Check, Copy, Download, ExternalLink, ImageDown, Lightbulb, Loader2, Printer, QrCode, Store as StoreIcon } from 'lucide-react';
import { useStore } from '@/contexts/StoreContext';
import { copyToClipboard } from '@/lib/clipboard';
import { renderPosterToPng } from '@/lib/poster';

const PRINT_DOCUMENT = `<!DOCTYPE html><html lang="es"><head><meta charset="utf-8" /><title>Afiche QR</title><style>@page { size: A4 portrait; margin: 8mm; } html, body { margin: 0; padding: 0; background: #fff; } img { display: block; width: 100%; height: auto; max-height: 264mm; object-fit: contain; margin: 0 auto; break-inside: avoid; page-break-inside: avoid; }</style></head><body><img id="poster" alt="Afiche QR de la tienda" /></body></html>`;

export default function QRPosterPage() {
    const { activeStore } = useStore();
    const [poster, setPoster] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [isPrinting, setIsPrinting] = useState(false);
    const [isDownloadingQr, setIsDownloadingQr] = useState(false);
    const [copied, setCopied] = useState(false);
    const [notice, setNotice] = useState('');
    const [error, setError] = useState('');
    const [retryKey, setRetryKey] = useState(0);

    const storeUrl = activeStore?.slug ? `${(process.env.NEXT_PUBLIC_FRONTEND_URL || 'https://shopylinks.shop').replace(/\/$/, '')}/${activeStore.slug}` : '';
    const isLocalUrl = /^https?:\/\/(?:localhost|127\.0\.0\.1|\[::1\])(?::\d+)?(?:\/|$)/i.test(storeUrl);
    const storeName = activeStore?.name || 'Mi tienda';
    const logoUrl = activeStore?.logoUrl;
    const referenceLocation = activeStore?.referenceLocation;
    const theme = activeStore?.theme;

    useEffect(() => {
        let cancelled = false;
        if (!storeUrl) { setPoster(''); return; }
        setPoster('');
        setError('');
        setNotice('');
        setCopied(false);
        setIsGenerating(true);
        renderPosterToPng({ storeName, storeUrl, referenceLocation, logoUrl, theme })
            .then(data => { if (!cancelled) setPoster(data); })
            .catch(err => { if (!cancelled) { console.error('Error generating poster:', err); setError('No pudimos generar la vista previa. Inténtalo de nuevo.'); } })
            .finally(() => { if (!cancelled) setIsGenerating(false); });
        return () => { cancelled = true; };
    }, [storeUrl, storeName, referenceLocation, logoUrl, theme, retryKey]);

    const downloadFile = (dataUrl: string, filename: string) => {
        const link = document.createElement('a');
        link.download = filename;
        link.href = dataUrl;
        link.click();
    };
    const handleDownloadPoster = () => {
        if (!poster || !activeStore) return;
        setError('');
        downloadFile(poster, `afiche-qr-${activeStore.slug || 'tienda'}.png`);
        setNotice('El afiche está listo para descargar.');
    };
    const handleDownloadQr = async () => {
        if (!storeUrl || !activeStore || isDownloadingQr) return;
        setIsDownloadingQr(true);
        setError('');
        setNotice('');
        try {
            const qr = await QRCode.toDataURL(storeUrl, { width: 1024, margin: 4, errorCorrectionLevel: 'M', color: { dark: '#0f172a', light: '#ffffff' } });
            downloadFile(qr, `codigo-qr-${activeStore.slug || 'tienda'}.png`);
            setNotice('El código QR está listo para descargar.');
        } catch (err) {
            console.error('Error generating QR:', err);
            setError('No pudimos generar el código QR. Inténtalo de nuevo.');
        } finally { setIsDownloadingQr(false); }
    };
    const handleCopy = async () => {
        setError('');
        setNotice('');
        if (await copyToClipboard(storeUrl)) { setCopied(true); setNotice('Enlace copiado.'); }
        else { setCopied(false); setError('No pudimos copiar el enlace. Puedes seleccionarlo y copiarlo manualmente.'); }
    };
    const handlePrint = async () => {
        if (!poster || isPrinting) return;
        setError('');
        setNotice('');
        const printWindow = window.open('', '_blank', 'width=900,height=1200');
        if (!printWindow) { setError('El navegador bloqueó la ventana de impresión. Permite las ventanas emergentes o descarga el afiche.'); return; }
        setIsPrinting(true);
        try {
            printWindow.document.write(PRINT_DOCUMENT);
            printWindow.document.close();
            const img = printWindow.document.getElementById('poster') as HTMLImageElement | null;
            if (!img) throw new Error('No se pudo preparar la impresión.');
            img.src = poster;
            await img.decode();
            printWindow.focus();
            printWindow.print();
            printWindow.close();
        } catch (err) {
            console.error('Error printing poster:', err);
            printWindow.close();
            setError('No pudimos preparar la impresión. Inténtalo de nuevo o descarga el afiche.');
        } finally { setIsPrinting(false); }
    };

    if (!activeStore) return <div className="flex min-h-[300px] items-center justify-center text-[var(--primary)]"><Loader2 className="h-8 w-8 animate-spin" /><span className="sr-only">Cargando tienda</span></div>;
    if (!storeUrl) return <div role="alert" className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6"><h1 className="text-xl font-black text-[var(--text)]">Tu tienda necesita un enlace</h1><p className="mt-2 text-sm text-[var(--text)]/60">Configura el enlace de tu tienda para generar su código QR.</p><Link href="/dashboard/settings" className="mt-4 inline-flex rounded-xl bg-[var(--primary)] px-4 py-3 text-sm font-bold text-[var(--bg)]">Ir a ajustes</Link></div>;

    return <div className="mx-auto max-w-6xl space-y-6 pb-8">
        <div className="flex flex-col gap-2"><p className="text-[11px] font-black uppercase tracking-[0.18em] text-[var(--primary)]">Comparte tu tienda</p><h1 className="text-3xl font-black tracking-tight text-[var(--text)] sm:text-4xl">Código QR</h1><p className="max-w-2xl text-sm leading-relaxed text-[var(--text)]/55">Lleva a tus clientes directamente a tu catálogo desde el mostrador, una tarjeta o tus redes.</p></div>
        {isLocalUrl && <div role="status" className="rounded-2xl border border-amber-500/25 bg-amber-500/5 p-4 text-sm leading-relaxed text-amber-700"><strong>QR de prueba:</strong> este enlace apunta a localhost. Otros dispositivos no podrán abrirlo; configura la URL pública de la tienda antes de imprimirlo o compartirlo.</div>}
        {error && <div role="alert" className="rounded-2xl border border-red-500/20 bg-red-500/5 p-4 text-sm font-bold text-red-600">{error}{!poster && !isGenerating && <button onClick={() => setRetryKey(value => value + 1)} className="ml-2 underline">Reintentar</button>}</div>}
        {notice && <div role="status" className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4 text-sm font-bold text-emerald-700">{notice}</div>}
        <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(320px,0.9fr)] lg:gap-6">
            <section className="min-w-0 overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--surface)]"><div className="flex items-center justify-between gap-3 border-b border-[var(--border)] p-5"><div><h2 className="text-base font-black text-[var(--text)]">Vista previa del afiche</h2><p className="mt-1 text-xs text-[var(--text)]/50">Así se verá al descargarlo o imprimirlo.</p></div><span className="rounded-full bg-[var(--secondary)] px-3 py-1 text-[10px] font-bold text-[var(--text)]/50">PNG</span></div><div className="flex min-h-64 items-center justify-center bg-[var(--secondary)]/40 p-4 sm:p-6">{poster ? <div className="w-full max-w-[360px] overflow-hidden shadow-lg"><Image src={poster} alt={`Afiche con el código QR de ${storeName}`} width={1080} height={1500} unoptimized className="h-auto w-full" /></div> : <div className="flex min-h-64 flex-col items-center justify-center gap-3 text-center text-sm text-[var(--text)]/50">{isGenerating ? <><Loader2 className="h-7 w-7 animate-spin text-[var(--primary)]" /> Preparando tu afiche…</> : <><QrCode className="h-7 w-7" /> La vista previa no está disponible.</>}</div>}</div></section>
            <div className="space-y-4"><section className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-5 sm:p-6"><div className="flex items-start gap-3"><div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[var(--primary)]/10 text-[var(--primary)]"><StoreIcon className="h-5 w-5" /></div><div className="min-w-0"><h2 className="text-base font-black text-[var(--text)]">{storeName}</h2><p className="mt-1 text-xs leading-relaxed text-[var(--text)]/50">El código abre el enlace público de esta tienda.</p></div></div><div className="mt-5 rounded-2xl border border-[var(--border)] bg-[var(--bg)] p-3"><p className="text-[10px] font-bold uppercase tracking-wider text-[var(--text)]/45">Enlace de tu tienda</p><p className="mt-1 break-all text-sm font-bold text-[var(--text)]">{storeUrl}</p><div className="mt-3 flex flex-wrap gap-2"><button type="button" onClick={() => void handleCopy()} className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-[var(--secondary)] px-3 text-xs font-bold text-[var(--text)] hover:opacity-80">{copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}{copied ? 'Copiado' : 'Copiar enlace'}</button><a href={storeUrl} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-10 items-center gap-2 rounded-xl px-3 text-xs font-bold text-[var(--primary)] hover:bg-[var(--secondary)]"><ExternalLink className="h-4 w-4" /> Abrir tienda</a></div></div></section>
            <section className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-5 sm:p-6"><h2 className="text-base font-black text-[var(--text)]">Descargar o imprimir</h2><p className="mt-1 text-xs leading-relaxed text-[var(--text)]/50">Elige el formato que necesitas para compartir tu tienda.</p><div className="mt-4 space-y-2"><button type="button" onClick={handleDownloadPoster} disabled={!poster} className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[var(--primary)] px-4 text-sm font-bold text-[var(--bg)] hover:opacity-90 disabled:opacity-50"><Download className="h-4 w-4" /> Descargar afiche PNG</button><div className="grid grid-cols-1 gap-2 sm:grid-cols-2"><button type="button" onClick={handlePrint} disabled={!poster || isPrinting} className="flex min-h-11 items-center justify-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--bg)] px-3 text-xs font-bold text-[var(--text)] hover:bg-[var(--secondary)] disabled:opacity-50">{isPrinting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Printer className="h-4 w-4" />} Imprimir afiche</button><button type="button" onClick={() => void handleDownloadQr()} disabled={isDownloadingQr} className="flex min-h-11 items-center justify-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--bg)] px-3 text-xs font-bold text-[var(--text)] hover:bg-[var(--secondary)] disabled:opacity-50">{isDownloadingQr ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImageDown className="h-4 w-4" />} Descargar solo QR</button></div></div></section>
            <section className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-5 sm:p-6"><h2 className="flex items-center gap-2 text-sm font-black text-[var(--text)]"><Lightbulb className="h-4 w-4 text-[var(--primary)]" /> Consejos de uso</h2><ul className="mt-3 space-y-2 text-xs leading-relaxed text-[var(--text)]/60"><li>Coloca el afiche en un lugar visible y bien iluminado.</li><li>Prueba el código con la cámara de tu celular antes de imprimir varias copias.</li><li>Si cambias el enlace de tu tienda, descarga e imprime un QR nuevo.</li></ul></section></div>
        </div>
    </div>;
}
