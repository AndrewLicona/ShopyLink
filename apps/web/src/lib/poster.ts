'use client';

import QRCode from 'qrcode';

export interface PosterOptions {
    storeName: string;
    storeUrl: string;
    referenceLocation?: string | null;
    logoUrl?: string | null;
    /** Brand colour, e.g. "#2563eb" */
    primaryColor?: string | null;
}

/** Loads an image, optionally with CORS enabled so the canvas stays exportable. */
function loadImage(src: string, crossOrigin = false): Promise<HTMLImageElement | null> {
    return new Promise((resolve) => {
        const img = new Image();
        if (crossOrigin) img.crossOrigin = 'anonymous';
        img.onload = () => resolve(img);
        img.onerror = () => resolve(null);
        img.src = src;
    });
}

function hexToRgb(hex: string): [number, number, number] {
    const clean = hex.replace('#', '');
    const full = clean.length === 3 ? clean.split('').map((c) => c + c).join('') : clean;
    const int = parseInt(full, 16);
    if (Number.isNaN(int)) return [37, 99, 235];
    return [(int >> 16) & 255, (int >> 8) & 255, int & 255];
}

/** Splits a text into lines that fit the given width. */
function wrapText(
    ctx: CanvasRenderingContext2D,
    text: string,
    maxWidth: number,
): string[] {
    const words = text.split(/\s+/);
    const lines: string[] = [];
    let current = '';

    for (const word of words) {
        const candidate = current ? `${current} ${word}` : word;
        if (ctx.measureText(candidate).width > maxWidth && current) {
            lines.push(current);
            current = word;
        } else {
            current = candidate;
        }
    }
    if (current) lines.push(current);
    return lines;
}

function drawRoundedRect(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    radius: number,
) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
}

/**
 * Renders the full counter poster (not only the QR) into a PNG data URL.
 *
 * The QR is generated at high resolution so it stays scannable after printing.
 * If the logo cannot be loaded with CORS headers the poster is rendered without
 * it instead of failing, so the export always succeeds.
 */
export async function renderPosterToPng(options: PosterOptions): Promise<string> {
    const W = 1080;
    const H = 1350;
    const canvas = document.createElement('canvas');
    canvas.width = W;
    canvas.height = H;

    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('No se pudo crear el lienzo del afiche');

    const [pr, pg, pb] = hexToRgb(options.primaryColor || '#2563eb');

    // Background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, W, H);

    // Top accent bar
    const gradient = ctx.createLinearGradient(0, 0, W, 0);
    gradient.addColorStop(0, '#34d399');
    gradient.addColorStop(0.5, `rgb(${pr}, ${pg}, ${pb})`);
    gradient.addColorStop(1, '#10b981');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, W, 26);

    let cursorY = 150;

    // Logo
    if (options.logoUrl) {
        const logo = await loadImage(options.logoUrl, true);
        if (logo) {
            const box = 200;
            ctx.save();
            ctx.fillStyle = '#f8fafc';
            ctx.strokeStyle = '#e2e8f0';
            ctx.lineWidth = 4;
            drawRoundedRect(ctx, (W - box) / 2, cursorY - 20, box, box, 48);
            ctx.fill();
            ctx.stroke();
            ctx.clip();
            const scale = Math.min(box / logo.width, box / logo.height) * 0.78;
            const lw = logo.width * scale;
            const lh = logo.height * scale;
            ctx.drawImage(logo, (W - lw) / 2, cursorY - 20 + (box - lh) / 2, lw, lh);
            ctx.restore();
        }
    }

    cursorY += 230;

    // Store name
    ctx.fillStyle = '#0f172a';
    ctx.font = '900 68px Inter, Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    const nameLines = wrapText(ctx, options.storeName.toUpperCase(), W - 160);
    nameLines.forEach((line) => {
        ctx.fillText(line, W / 2, cursorY);
        cursorY += 76;
    });

    // Reference location
    if (options.referenceLocation) {
        cursorY += 10;
        ctx.fillStyle = '#64748b';
        ctx.font = '700 34px Inter, Arial, sans-serif';
        ctx.fillText(`📍 ${options.referenceLocation}`, W / 2, cursorY);
        cursorY += 60;
    }

    cursorY += 30;

    // QR code
    const QR_SIZE = 640;
    const qrDataUrl = await buildQrDataUrl(options.storeUrl, QR_SIZE);
    const qrImage = await loadImage(qrDataUrl);
    if (qrImage) {
        ctx.save();
        ctx.fillStyle = '#ffffff';
        ctx.strokeStyle = '#e2e8f0';
        ctx.lineWidth = 4;
        drawRoundedRect(ctx, (W - QR_SIZE) / 2 - 24, cursorY - 24, QR_SIZE + 48, QR_SIZE + 48, 36);
        ctx.fill();
        ctx.stroke();
        ctx.drawImage(qrImage, (W - QR_SIZE) / 2, cursorY);
        ctx.restore();
        cursorY += QR_SIZE + 70;
    }

    // Call to action
    ctx.fillStyle = '#0f172a';
    ctx.font = '900 40px Inter, Arial, sans-serif';
    const ctaLines = wrapText(
        ctx,
        'Escanea aquí para ver todo nuestro catálogo y pedir por WhatsApp',
        W - 200,
    );
    ctaLines.forEach((line) => {
        ctx.fillText(line, W / 2, cursorY);
        cursorY += 50;
    });

    cursorY += 24;

    // URL
    ctx.fillStyle = '#94a3b8';
    ctx.font = '600 26px ui-monospace, Menlo, monospace';
    ctx.fillText(options.storeUrl, W / 2, cursorY);
    cursorY += 60;

    // WhatsApp badge
    ctx.save();
    ctx.fillStyle = '#ecfdf5';
    ctx.strokeStyle = '#a7f3d0';
    ctx.lineWidth = 3;
    drawRoundedRect(ctx, W / 2 - 250, cursorY, 500, 76, 38);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#047857';
    ctx.font = '900 30px Inter, Arial, sans-serif';
    ctx.textBaseline = 'middle';
    ctx.fillText('Pedidos y consultas directas', W / 2, cursorY + 38);
    ctx.restore();

    return canvas.toDataURL('image/png');
}

async function buildQrDataUrl(text: string, size: number): Promise<string> {
    return QRCode.toDataURL(text, {
        width: size,
        margin: 2,
        color: { dark: '#0f172a', light: '#ffffff' },
    });
}
