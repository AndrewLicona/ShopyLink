'use client';

import QRCode from 'qrcode';

export interface PosterOptions {
    storeName: string;
    storeUrl: string;
    referenceLocation?: string | null;
    logoUrl?: string | null;
}

/* Layout constants (px on a 1080px wide poster) */
const W = 1080;
const PAD = 70;
const ACCENT_H = 26;
const LOGO_BOX = 190;
const QR_SIZE = 560;
const QR_PADDING = 26;
const BADGE_H = 76;
const BADGE_W = 520;

const NAME_FONT = '900 72px Inter, Arial, sans-serif';
const NAME_LINE_H = 86;
const REF_FONT = '700 34px Inter, Arial, sans-serif';
const REF_LINE_H = 46;
const CTA_FONT = '900 40px Inter, Arial, sans-serif';
const CTA_LINE_H = 52;
const URL_FONT = '600 26px ui-monospace, Menlo, monospace';
const URL_LINE_H = 36;

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
    const words = text.split(/\s+/).filter(Boolean);
    if (words.length === 0) return [];
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

function createContext(width: number, height: number): CanvasRenderingContext2D {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('No se pudo crear el lienzo del afiche');
    return ctx;
}

/**
 * Renders the full counter poster (not only the QR) into a PNG data URL.
 *
 * The canvas height is calculated from the real content, so nothing is ever
 * cut off (logo, nombre, QR, mensaje, URL y badge de WhatsApp).
 * The QR is generated at high resolution so it stays scannable after printing.
 * If the logo cannot be loaded with CORS headers the poster is rendered without
 * it instead of failing, so the export always succeeds.
 */
export async function renderPosterToPng(options: PosterOptions): Promise<string> {
    const contentWidth = W - PAD * 2;

    // --- 1. Medición del contenido (para calcular el alto real) ---
    const measure = createContext(10, 10);

    measure.font = NAME_FONT;
    const nameLines = wrapText(measure, options.storeName.toUpperCase(), contentWidth);

    measure.font = REF_FONT;
    const refLines = options.referenceLocation
        ? wrapText(measure, options.referenceLocation, contentWidth)
        : [];

    measure.font = CTA_FONT;
    const ctaLines = wrapText(
        measure,
        'Escanea aquí para ver todo nuestro catálogo y pedir por WhatsApp',
        contentWidth,
    );

    // --- 2. Alto total del afiche ---
    let height = ACCENT_H;                     // barra superior
    height += 46;                              // respiro superior
    height += LOGO_BOX;                        // logo
    height += 46;                              // respiro
    height += nameLines.length * NAME_LINE_H;  // nombre
    if (refLines.length) {
        height += 12 + refLines.length * REF_LINE_H;
    }
    height += 40;                              // respiro
    height += QR_SIZE + QR_PADDING * 2;        // marco + QR
    height += 48;                              // respiro
    height += ctaLines.length * CTA_LINE_H;    // mensaje
    height += 16;
    height += URL_LINE_H;                      // url
    height += 24;
    height += BADGE_H;                         // badge whatsapp
    height += 56;                              // respiro inferior

    // --- 3. Dibujo ---
    const ctx = createContext(W, height);
    const [pr, pg, pb] = hexToRgb('#2563eb');

    // Fondo
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, W, height);

    // Top accent bar
    const gradient = ctx.createLinearGradient(0, 0, W, 0);
    gradient.addColorStop(0, '#34d399');
    gradient.addColorStop(0.5, `rgb(${pr}, ${pg}, ${pb})`);
    gradient.addColorStop(1, '#10b981');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, W, ACCENT_H);

    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';

    let cursorY = ACCENT_H + 46;

    // Logo
    if (options.logoUrl) {
        const logo = await loadImage(options.logoUrl, true);
        if (logo) {
            ctx.save();
            ctx.fillStyle = '#f8fafc';
            ctx.strokeStyle = '#e2e8f0';
            ctx.lineWidth = 4;
            drawRoundedRect(ctx, (W - LOGO_BOX) / 2, cursorY, LOGO_BOX, LOGO_BOX, 44);
            ctx.fill();
            ctx.stroke();
            ctx.clip();
            const scale = Math.min(LOGO_BOX / logo.width, LOGO_BOX / logo.height) * 0.78;
            const lw = logo.width * scale;
            const lh = logo.height * scale;
            ctx.drawImage(logo, (W - lw) / 2, cursorY + (LOGO_BOX - lh) / 2, lw, lh);
            ctx.restore();
        }
    }
    cursorY += LOGO_BOX + 46;

    // Store name
    ctx.fillStyle = '#0f172a';
    ctx.font = NAME_FONT;
    nameLines.forEach((line) => {
        ctx.fillText(line, W / 2, cursorY);
        cursorY += NAME_LINE_H;
    });

    // Reference location
    if (refLines.length) {
        cursorY += 12;
        ctx.fillStyle = '#64748b';
        ctx.font = REF_FONT;
        refLines.forEach((line) => {
            ctx.fillText(line, W / 2, cursorY);
            cursorY += REF_LINE_H;
        });
    }

    cursorY += 40;

    // QR code
    const qrDataUrl = await buildQrDataUrl(options.storeUrl, QR_SIZE);
    const qrImage = await loadImage(qrDataUrl);
    if (qrImage) {
        ctx.save();
        ctx.fillStyle = '#ffffff';
        ctx.strokeStyle = '#e2e8f0';
        ctx.lineWidth = 4;
        drawRoundedRect(
            ctx,
            (W - QR_SIZE) / 2 - QR_PADDING,
            cursorY - QR_PADDING,
            QR_SIZE + QR_PADDING * 2,
            QR_SIZE + QR_PADDING * 2,
            36,
        );
        ctx.fill();
        ctx.stroke();
        ctx.drawImage(qrImage, (W - QR_SIZE) / 2, cursorY);
        ctx.restore();
    }
    cursorY += QR_SIZE + QR_PADDING * 2 + 48;

    // Call to action
    ctx.fillStyle = '#0f172a';
    ctx.font = CTA_FONT;
    ctaLines.forEach((line) => {
        ctx.fillText(line, W / 2, cursorY);
        cursorY += CTA_LINE_H;
    });

    cursorY += 16;

    // URL
    ctx.fillStyle = '#94a3b8';
    ctx.font = URL_FONT;
    ctx.fillText(options.storeUrl, W / 2, cursorY);
    cursorY += URL_LINE_H + 24;

    // WhatsApp badge
    ctx.save();
    ctx.fillStyle = '#ecfdf5';
    ctx.strokeStyle = '#a7f3d0';
    ctx.lineWidth = 3;
    drawRoundedRect(ctx, W / 2 - BADGE_W / 2, cursorY, BADGE_W, BADGE_H, BADGE_H / 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#047857';
    ctx.font = '900 30px Inter, Arial, sans-serif';
    ctx.textBaseline = 'middle';
    ctx.fillText('Pedidos y consultas directas', W / 2, cursorY + BADGE_H / 2);
    ctx.restore();

    return ctx.canvas.toDataURL('image/png');
}

async function buildQrDataUrl(text: string, size: number): Promise<string> {
    return QRCode.toDataURL(text, {
        width: size,
        margin: 2,
        color: { dark: '#0f172a', light: '#ffffff' },
    });
}
