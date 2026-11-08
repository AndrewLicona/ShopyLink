/**
 * Moneda por país para los mensajes de WhatsApp de la API.
 *
 * Debe mantenerse en sincronía con `apps/web/src/lib/currency.ts`: el cliente
 * y el mensaje que recibe el merchant tienen que mostrar exactamente la misma
 * moneda y el mismo formato.
 */

export interface CurrencyConfig {
  code: string;
  locale: string;
  decimals: number;
  symbol: string;
}

const CURRENCIES_BY_COUNTRY: Record<string, CurrencyConfig> = {
  CO: { code: 'COP', locale: 'es-CO', decimals: 0, symbol: '$' },
  MX: { code: 'MXN', locale: 'es-MX', decimals: 0, symbol: '$' },
  AR: { code: 'ARS', locale: 'es-AR', decimals: 0, symbol: '$' },
  CL: { code: 'CLP', locale: 'es-CL', decimals: 0, symbol: '$' },
  PE: { code: 'PEN', locale: 'es-PE', decimals: 2, symbol: 'S/' },
  UY: { code: 'UYU', locale: 'es-UY', decimals: 2, symbol: '$' },
  PY: { code: 'PYG', locale: 'es-PY', decimals: 0, symbol: '₲' },
  BO: { code: 'BOB', locale: 'es-BO', decimals: 2, symbol: 'Bs' },
  EC: { code: 'USD', locale: 'es-EC', decimals: 2, symbol: '$' },
  PA: { code: 'USD', locale: 'es-PA', decimals: 2, symbol: '$' },
  PR: { code: 'USD', locale: 'es-PR', decimals: 2, symbol: '$' },
  DO: { code: 'DOP', locale: 'es-DO', decimals: 2, symbol: 'RD$' },
  GT: { code: 'GTQ', locale: 'es-GT', decimals: 2, symbol: 'Q' },
  CR: { code: 'CRC', locale: 'es-CR', decimals: 0, symbol: '₡' },
  HN: { code: 'HNL', locale: 'es-HN', decimals: 2, symbol: 'L' },
  SV: { code: 'USD', locale: 'es-SV', decimals: 2, symbol: '$' },
  NI: { code: 'NIO', locale: 'es-NI', decimals: 2, symbol: 'C$' },
  CU: { code: 'CUP', locale: 'es-CU', decimals: 2, symbol: '$' },
  US: { code: 'USD', locale: 'en-US', decimals: 2, symbol: '$' },
  ES: { code: 'EUR', locale: 'es-ES', decimals: 2, symbol: '€' },
  PT: { code: 'EUR', locale: 'pt-PT', decimals: 2, symbol: '€' },
  IT: { code: 'EUR', locale: 'it-IT', decimals: 2, symbol: '€' },
  DE: { code: 'EUR', locale: 'de-DE', decimals: 2, symbol: '€' },
  FR: { code: 'EUR', locale: 'fr-FR', decimals: 2, symbol: '€' },
  GB: { code: 'GBP', locale: 'en-GB', decimals: 2, symbol: '£' },
  CA: { code: 'CAD', locale: 'en-CA', decimals: 2, symbol: '$' },
  AU: { code: 'AUD', locale: 'en-AU', decimals: 2, symbol: '$' },
};

const DEFAULT_COUNTRY = 'CO';

export function getCurrencyForCountry(country?: string | null): CurrencyConfig {
  const code = (country || '').trim().toUpperCase();
  return CURRENCIES_BY_COUNTRY[code] ?? CURRENCIES_BY_COUNTRY[DEFAULT_COUNTRY];
}

/** Formato `símbolo valor CÓDIGO` (ej: `$ 25.000 COP`). */
export function formatCurrency(
  value: number | string | null | undefined,
  country?: string | null,
): string {
  const amount = typeof value === 'string' ? parseFloat(value) : value;
  const currency = getCurrencyForCountry(country);

  const formatted = new Intl.NumberFormat(currency.locale, {
    minimumFractionDigits: currency.decimals,
    maximumFractionDigits: currency.decimals,
  }).format(amount || 0);

  return `${currency.symbol} ${formatted} ${currency.code}`;
}
