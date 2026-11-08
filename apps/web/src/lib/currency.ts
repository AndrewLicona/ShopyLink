/**
 * Moneda según el país de la tienda.
 *
 * Cada tienda define su país y de ahí sale la moneda con la que se muestran
 * todos sus precios (tienda, panel, marketplace, PDF y mensaje de WhatsApp).
 * El formato es siempre `símbolo valor CÓDIGO` (ej: `$ 25.000 COP`) para que
 * el cliente siempre sepa qué moneda está viendo.
 */

export interface CurrencyConfig {
    /** Código ISO 4217 (COP, MXN, USD...). */
    code: string;
    /** Locale usado para el separador de miles. */
    locale: string;
    /** Decimales: las monedas sin centavos (COP, MXN, CLP...) no llevan. */
    decimals: number;
    /** Símbolo que se muestra delante del valor. */
    symbol: string;
}

export const CURRENCIES_BY_COUNTRY: Record<string, CurrencyConfig> = {
    // América Latina
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
    // Global
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

/** Países disponibles para que el dueño de la tienda elija en Ajustes. */
export const COUNTRY_OPTIONS: { code: string; name: string }[] = [
    { code: 'CO', name: 'Colombia' },
    { code: 'MX', name: 'México' },
    { code: 'AR', name: 'Argentina' },
    { code: 'CL', name: 'Chile' },
    { code: 'PE', name: 'Perú' },
    { code: 'UY', name: 'Uruguay' },
    { code: 'PY', name: 'Paraguay' },
    { code: 'BO', name: 'Bolivia' },
    { code: 'EC', name: 'Ecuador' },
    { code: 'PA', name: 'Panamá' },
    { code: 'PR', name: 'Puerto Rico' },
    { code: 'DO', name: 'República Dominicana' },
    { code: 'GT', name: 'Guatemala' },
    { code: 'CR', name: 'Costa Rica' },
    { code: 'HN', name: 'Honduras' },
    { code: 'SV', name: 'El Salvador' },
    { code: 'NI', name: 'Nicaragua' },
    { code: 'CU', name: 'Cuba' },
    { code: 'US', name: 'Estados Unidos' },
    { code: 'ES', name: 'España' },
    { code: 'PT', name: 'Portugal' },
    { code: 'IT', name: 'Italia' },
    { code: 'DE', name: 'Alemania' },
    { code: 'FR', name: 'Francia' },
    { code: 'GB', name: 'Reino Unido' },
    { code: 'CA', name: 'Canadá' },
    { code: 'AU', name: 'Australia' },
];

/** País por defecto cuando la tienda todavía no tiene country configurado. */
export const DEFAULT_COUNTRY = 'CO';

export function getCurrencyForCountry(country?: string | null): CurrencyConfig {
    const code = (country || '').trim().toUpperCase();
    return CURRENCIES_BY_COUNTRY[code] ?? CURRENCIES_BY_COUNTRY[DEFAULT_COUNTRY]!;
}

export function getCountryName(country?: string | null): string {
    const code = (country || '').trim().toUpperCase();
    return COUNTRY_OPTIONS.find(c => c.code === code)?.name ?? COUNTRY_OPTIONS[0]!.name;
}

/**
 * Formatea un precio con la moneda del país indicado.
 *
 * @example formatCurrency(25000, 'CO') -> '$ 25.000 COP'
 * @example formatCurrency(25, 'US')    -> '$ 25.00 USD'
 */
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

/**
 * Formatea un monto sin símbolo ni código de moneda.
 *
 * Se usa en el panel de super admin, donde los totales suman tiendas de
 * distintos países: ahí no hay una moneda única que represente el monto.
 *
 * @example formatAmount(25000) -> '25.000'
 */
export function formatAmount(value: number | string | null | undefined): string {
    const amount = typeof value === 'string' ? parseFloat(value) : value;

    return new Intl.NumberFormat('es-CO', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
    }).format(amount || 0);
}
