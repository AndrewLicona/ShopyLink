'use client';

import QRCode from 'qrcode';
import { getThemePrimary } from '@/lib/theme';

export interface PosterOptions {
    storeName: string;
    storeUrl: string;
    referenceLocation?: string | null;
    logoUrl?: string | null;
    /** Tema de la tienda: define el color de acento del afiche. */
    theme?: string | null;
}

/* ---------- Medidas del afiche (escala 1080px) ---------- */
const W = 1080;
const PAD = 84;
const RADIUS = 74;          // rounded-[2.5rem] de la vista web
const BORDER = 10;          // border-4 slate-100
const ACCENT_H = 26;        // barra superior de color
const LOGO_BOX = 232;       // w-24 h-24
const LOGO_RADIUS = 58;     // rounded-3xl
const QR_SIZE = 520;
const QR_PADDING = 38;      // p-4
const QR_RADIUS = 58;       // rounded-3xl
const BADGE_H = 76;
const BADGE_RADIUS = BADGE_H / 2;

/* ---------- Paleta (es la misma de la vista web) ---------- */
const COLORS = {
    page: '#f1f5f9',
    card: '#ffffff',
    cardBorder: '#f1f5f9',
    slate900: '#0f172a',
    slate500: '#64748b',
    slate400: '#94a3b8',
    slate200: '#e2e8f0',
    slate50: '#f8fafc',
    emerald400: '#34d399',
    emerald500: '#10b981',
    emerald50: '#ecfdf5',
    emerald200: '#a7f3d0',
    emerald700: '#047857',
};

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
    const r = Math.min(radius, width / 2, height / 2);
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + width - r, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + r);
    ctx.lineTo(x + width, y + height - r);
    ctx.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
    ctx.lineTo(x + r, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
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
 * Renders the counter poster exactly like the preview shown in the dashboard:
 * white card with rounded corners and a soft shadow, the colored top accent,
 * the logo inside its rounded frame, the QR inside its rounded frame, and the
 * WhatsApp pill at the bottom.
 *
 * The canvas height is calculated from the real content, so nothing is ever
 * cut off. The QR is generated at high resolution so it stays scannable.
 */
export async function renderPosterToPng(options: PosterOptions): Promise<string> {
    const contentWidth = W - PAD * 2;
    const primary = getThemePrimary(options.theme);

    /* ---------- 1. Medición del contenido ---------- */
    const measure = createContext(10, 10);

    measure.font = '900 60px Inter, Arial, sans-serif';
    const nameLines = wrapText(measure, options.storeName.toUpperCase(), contentWidth);

    measure.font = '700 30px Inter, Arial, sans-serif';
    const refLines = options.referenceLocation
        ? wrapText(measure, options.referenceLocation, contentWidth - 40)
        : [];

    measure.font = '900 38px Inter, Arial, sans-serif';
    const ctaLines = wrapText(
        measure,
        'Escanea aquí para ver todo nuestro catálogo y pedir por WhatsApp',
        contentWidth - 40,
    );

    /* ---------- 2. Alto total ---------- */
    let height = BORDER * 2;
    height += 44;                            // respiro tras el borde
    height += ACCENT_H;                      // barra de acento
    height += 52;                            // respiro
    height += LOGO_BOX;                      // logo
    height += 44;                            // respiro
    height += nameLines.length * 72;         // nombre
    if (refLines.length) {
        height += 16 + refLines.length * 40;
    }
    height += 48;                            // respiro
    height += QR_SIZE + QR_PADDING * 2;      // marco + QR
    height += 48;                            // respiro
    height += ctaLines.length * 48;          // mensaje
    height += 20;
    height += 34;                            // url
    height += 30;
    height += BADGE_H;                       // badge whatsapp
    height += 48;                            // respiro inferior

    /* ---------- 3. Lienzo ---------- */
    const ctx = createContext(W, height);

    // Fondo de la página (como la card flotando sobre el fondo del dashboard)
    ctx.fillStyle = COLORS.page;
    ctx.fillRect(0, 0, W, height);

    // Sombra suave de la card
    ctx.save();
    ctx.shadowColor = 'rgba(15, 23, 42, 0.18)';
    ctx.shadowBlur = 48;
    ctx.shadowOffsetY = 18;
    ctx.fillStyle = COLORS.card;
    drawRoundedRect(ctx, BORDER, BORDER, W - BORDER * 2, height - BORDER * 2, RADIUS);
    ctx.fill();
    ctx.restore();

    // Borde claro de la card
    ctx.strokeStyle = COLORS.cardBorder;
    ctx.lineWidth = BORDER;
    drawRoundedRect(ctx, BORDER, BORDER, W - BORDER * 2, height - BORDER * 2, RADIUS);
    ctx.stroke();

    // Recorte interior: todo lo que se dibuja dentro de la card redondeada
    ctx.save();
    drawRoundedRect(ctx, BORDER, BORDER, W - BORDER * 2, height - BORDER * 2, RADIUS);
    ctx.clip();

    // Barra superior con el degradado del tema (como en la web)
    const gradient = ctx.createLinearGradient(BORDER, 0, W - BORDER, 0);
    gradient.addColorStop(0, COLORS.emerald400);
    gradient.addColorStop(0.5, primary);
    gradient.addColorStop(1, COLORS.emerald500);
    ctx.fillStyle = gradient;
    ctx.fillRect(BORDER, BORDER, W - BORDER * 2, ACCENT_H);

    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';

    let cursorY = BORDER + ACCENT_H + 52;

    /* ---------- Logo ---------- */
    if (options.logoUrl) {
        const logo = await loadImage(options.logoUrl, true);
        if (logo) {
            // El marco se adapta a la proporción real del logo: los logos
            // cuadrados llenan el medallón y los rectangulares (horizontales)
            // ya no quedan con franjas vacías a los lados. El alto se mantiene
            // para que la maqueta del afiche no cambie.
            const ratio = logo.width / logo.height;
            const boxH = LOGO_BOX;
            const boxW = Math.round(LOGO_BOX * Math.min(Math.max(ratio, 0.72), 1.8));
            const boxX = (W - boxW) / 2;
            const boxY = cursorY;
            const radius = Math.min(LOGO_RADIUS, boxH / 2, boxW / 2);
            // Medallón: sombra suave + base blanca
            ctx.save();
            ctx.shadowColor = 'rgba(15, 23, 42, 0.16)';
            ctx.shadowBlur = 34;
            ctx.shadowOffsetY = 12;
            ctx.fillStyle = COLORS.card;
            drawRoundedRect(ctx, boxX, boxY, boxW, boxH, radius);
            ctx.fill();
            ctx.restore();

            // Anillo con el degradado del tema
            const ring = ctx.createLinearGradient(boxX, boxY, boxX + boxW, boxY + boxH);
            ring.addColorStop(0, COLORS.emerald400);
            ring.addColorStop(0.5, primary);
            ring.addColorStop(1, COLORS.emerald500);
            ctx.save();
            ctx.strokeStyle = ring;
            ctx.lineWidth = 9;
            drawRoundedRect(
                ctx,
                boxX + 5,
                boxY + 5,
                boxW - 10,
                boxH - 10,
                Math.max(radius - 5, 12)
            );
            ctx.stroke();
            ctx.restore();

            // El logo va centrado con aire: nunca se corta ni toca el borde
            ctx.save();
            ctx.fillStyle = COLORS.card;
            drawRoundedRect(ctx, boxX, boxY, boxW, boxH, radius);
            ctx.fill();
            ctx.clip();
            // 0.86 deja un margen justo: el logo llena el marco sin pegarse.
            const scale = Math.min((boxW - 44) / logo.width, (boxH - 44) / logo.height);
            const lw = logo.width * scale;
            const lh = logo.height * scale;
            ctx.drawImage(logo, (W - lw) / 2, boxY + (boxH - lh) / 2, lw, lh);
            ctx.restore();
        }
    }
    cursorY += LOGO_BOX + 44;

    /* ---------- Nombre ---------- */
    ctx.fillStyle = COLORS.slate900;
    ctx.font = '900 60px Inter, Arial, sans-serif';
    nameLines.forEach((line) => {
        ctx.fillText(line, W / 2, cursorY);
        cursorY += 72;
    });

    /* ---------- Referencia (con pin) ---------- */
    if (refLines.length) {
        cursorY += 16;
        ctx.fillStyle = COLORS.slate500;
        ctx.font = '700 30px Inter, Arial, sans-serif';
        refLines.forEach((line) => {
            ctx.fillText(line, W / 2, cursorY);
            cursorY += 40;
        });
    }

    cursorY += 48;

    /* ---------- QR ---------- */
    const qrDataUrl = await QRCode.toDataURL(options.storeUrl, {
        width: QR_SIZE,
        margin: 2,
        color: { dark: COLORS.slate900, light: '#ffffff' },
    });
    const qrImage = await loadImage(qrDataUrl);
    if (qrImage) {
        ctx.save();
        ctx.fillStyle = '#ffffff';
        ctx.strokeStyle = COLORS.slate200;
        ctx.lineWidth = 5;
        drawRoundedRect(
            ctx,
            (W - QR_SIZE) / 2 - QR_PADDING,
            cursorY - QR_PADDING,
            QR_SIZE + QR_PADDING * 2,
            QR_SIZE + QR_PADDING * 2,
            QR_RADIUS,
        );
        ctx.fill();
        ctx.stroke();
        ctx.drawImage(qrImage, (W - QR_SIZE) / 2, cursorY);
        ctx.restore();
    }
    cursorY += QR_SIZE + QR_PADDING * 2 + 48;

    /* ---------- Mensaje ---------- */
    ctx.fillStyle = COLORS.slate900;
    ctx.font = '900 38px Inter, Arial, sans-serif';
    ctaLines.forEach((line) => {
        ctx.fillText(line, W / 2, cursorY);
        cursorY += 48;
    });

    cursorY += 20;

    /* ---------- URL ---------- */
    ctx.fillStyle = COLORS.slate400;
    ctx.font = '600 26px ui-monospace, Menlo, monospace';
    ctx.fillText(options.storeUrl, W / 2, cursorY);
    cursorY += 34 + 30;

    /* ---------- Badge de WhatsApp ---------- */
    // El punto verde va a la IZQUIERDA del texto, como en la web, y ambos
    // quedan centrados juntos dentro de la pastilla.
    const badgeText = 'Pedidos y consultas directas';
    const badgeFont = '900 30px Inter, Arial, sans-serif';
    ctx.font = badgeFont;
    const badgeTextWidth = ctx.measureText(badgeText).width;
    const dotRadius = 11;
    const dotGap = 22;
    const badgePadding = 40;
    const badgeWidth = badgeTextWidth + dotRadius * 2 + dotGap + badgePadding * 2;
    const badgeCenterY = cursorY + BADGE_H / 2;

    ctx.save();
    ctx.fillStyle = COLORS.emerald50;
    ctx.strokeStyle = COLORS.emerald200;
    ctx.lineWidth = 3;
    drawRoundedRect(ctx, (W - badgeWidth) / 2, cursorY, badgeWidth, BADGE_H, BADGE_RADIUS);
    ctx.fill();
    ctx.stroke();

    // Punto verde (alineado con el centro visual de las mayusculas)
    const dotX = (W - badgeWidth) / 2 + badgePadding + dotRadius;
    ctx.fillStyle = COLORS.emerald500;
    ctx.beginPath();
    ctx.arc(dotX, badgeCenterY - 5, dotRadius, 0, Math.PI * 2);
    ctx.fill();

    // Texto de la pastilla
    ctx.fillStyle = COLORS.emerald700;
    ctx.font = badgeFont;
    ctx.textBaseline = 'middle';
    ctx.fillText(
        badgeText,
        dotX + dotRadius + dotGap + badgeTextWidth / 2,
        badgeCenterY,
    );
    ctx.restore();

    ctx.restore(); // fin del recorte de la card

    return ctx.canvas.toDataURL('image/png');
}
