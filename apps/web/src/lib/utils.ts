/**
 * Canonical money formatter for the whole app.
 *
 * The currency depends on the country of the store: a store in Colombia shows
 * `$ 25.000 COP` and one in the United States `$ 25.00 USD`. Marketplace,
 * dashboard and PDF all use `formatCurrency` (with the ISO code) so a customer
 * never sees two different prices for the same item.
 *
 * The individual storefront uses `formatPrice` (without the ISO code): there the
 * store belongs to a single country, so the code would only add noise.
 */
export { formatCurrency, formatPrice, formatAmount, getCurrencyForCountry, getCountryName, COUNTRY_OPTIONS, DEFAULT_COUNTRY } from './currency';

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
