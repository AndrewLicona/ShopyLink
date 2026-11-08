/**
 * Paleta de temas de ShopyLink.
 *
 * Los mismos valores que `globals.css`. Se usan donde no hay CSS disponible:
 * el afiche QR (canvas) y el catálogo en PDF (jsPDF).
 */

export const THEME_PRIMARY: Record<string, string> = {
    classic: '#2563eb',
    fresh: '#10b981',
    modern: '#6366f1',
    minimal: '#18181b',
    gold: '#d4af37',
    pastel: '#f8bbd0',
    lilac: '#d1c4e9',
    gray: '#9ca3af',
    'dark-gray': '#4b5563',
    sunset: '#f97316',
    ocean: '#06b6d4',
    berry: '#db2777',
    forest: '#059669',
    corporate: '#475569',
};

export const DEFAULT_THEME_PRIMARY = THEME_PRIMARY.classic!;

/** Color principal del tema de la tienda. */
export function getThemePrimary(theme?: string | null): string {
    return THEME_PRIMARY[(theme || '').toLowerCase()] || DEFAULT_THEME_PRIMARY;
}

/** Convierte `#rrggbb` (o `#rgb`) a `[r, g, b]`. */
export function hexToRgb(hex: string): [number, number, number] {
    const clean = hex.replace('#', '').trim();
    const full =
        clean.length === 3
            ? clean
                  .split('')
                  .map((c) => c + c)
                  .join('')
            : clean;

    const value = Number.parseInt(full.slice(0, 6) || '000000', 16);
    return [(value >> 16) & 255, (value >> 8) & 255, value & 255];
}

function toHex(rgb: [number, number, number]): string {
    return `#${rgb.map((c) => Math.max(0, Math.min(255, Math.round(c))).toString(16).padStart(2, '0')).join('')}`;
}

/** Mezcla dos colores. `t` = 0 devuelve `from`, `t` = 1 devuelve `to`. */
export function mixColors(from: string, to: string, t: number): string {
    const a = hexToRgb(from);
    const b = hexToRgb(to);
    return toHex([
        a[0] + (b[0] - a[0]) * t,
        a[1] + (b[1] - a[1]) * t,
        a[2] + (b[2] - a[2]) * t,
    ]);
}

/** Aclara el color (0 = igual, 1 = blanco). */
export function tint(hex: string, amount: number): string {
    return mixColors(hex, '#ffffff', amount);
}

/** Oscurece el color (0 = igual, 1 = negro). */
export function shade(hex: string, amount: number): string {
    return mixColors(hex, '#000000', amount);
}

/** Color de acento que usa la tienda: el personalizado si existe, si no el del tema. */
export function getStoreAccent(theme?: string | null, primaryColor?: string | null): string {
    const custom = (primaryColor || '').trim();
    if (custom.startsWith('#') && (custom.length === 4 || custom.length === 7)) {
        return custom;
    }
    return getThemePrimary(theme);
}
