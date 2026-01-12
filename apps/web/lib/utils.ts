export function formatCurrency(value: number | string) {
    const amount = typeof value === 'string' ? parseFloat(value) : value;
    const formatter = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD', // Using USD formatting style for '$' symbol
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
    });

    // We replace $ with RD$ if we want specifically Dominican Peso, 
    // but the user asked "why DOP", implying they want it cleaner.
    // I will use the standard symbol and remove trailing zeros.
    return formatter.format(amount || 0).replace('$', '$');
}

import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}
