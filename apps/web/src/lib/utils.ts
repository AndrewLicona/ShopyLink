/**
 * Canonical money formatter for the whole app.
 *
 * Every price is Colombian pesos with no decimals: `$ 25.000 COP`.
 * Backend, storefront, marketplace, dashboard and PDF all use this exact
 * format so a customer never sees two different prices for the same item.
 */
export function formatCurrency(value: number | string | null | undefined): string {
    const amount = typeof value === 'string' ? parseFloat(value) : value;
    const formatter = new Intl.NumberFormat('es-CO', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    });
    return `$ ${formatter.format(amount || 0)} COP`;
}

import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function generateSlug(text: string): string {
    return text
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
}

export function getAbsoluteUrl(path: string | null | undefined): string | null {
    if (!path) return null;
    if (path.startsWith('http://') || path.startsWith('https://')) return path;
    const baseUrl = process.env.NEXT_PUBLIC_FRONTEND_URL || 'https://shopylinks.shop';
    return `${baseUrl}${path.startsWith('/') ? '' : '/'}${path}`;
}
