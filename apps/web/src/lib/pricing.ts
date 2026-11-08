import type { Product } from '@/types/types';
import { formatCurrency } from '@/lib/utils';

export type PricingMode = 'fixed' | 'from' | 'hourly' | 'quote' | null | undefined;

/** Human label for the pricing semantics of a service. */
export function getPricingLabel(mode: PricingMode): string | null {
    switch (mode) {
        case 'from':
            return 'Desde';
        case 'hourly':
            return 'Por hora';
        case 'quote':
            return 'A convenir';
        default:
            return null;
    }
}

/** Suffix appended to the price, e.g. "$50.000 / hora". */
export function getPricingSuffix(mode: PricingMode): string | null {
    switch (mode) {
        case 'hourly':
            return '/hora';
        default:
            return null;
    }
}

/**
 * Canonical price text for a service, driven by its pricing mode.
 *
 * - from   → "Desde $ 25.000 COP"
 * - hourly → "$ 25.000 COP / hr"
 * - quote  → "A convenir"
 * - fixed  → "$ 25.000 COP"
 *
 * Services without a price are always quoted on request.
 */
export function getServicePriceLabel(
    price?: number | null,
    mode: PricingMode = 'fixed',
): string {
    const amount = price != null ? formatCurrency(price) : null;

    switch (mode) {
        case 'quote':
            return 'A convenir';
        case 'from':
            return amount ? `Desde ${amount}` : 'A convenir';
        case 'hourly':
            return amount ? `${amount} / hr` : 'A convenir';
        default:
            return amount ?? 'A convenir';
    }
}

/**
 * A product is purchasable right now when stock tracking is off, when there is
 * stock, or when at least one variant has stock. Otherwise it is "por encargo".
 */
export function isProductAvailable(product: Product): boolean {
    if (product.trackInventory === false) return true;
    if ((product.inventory?.stock ?? 0) > 0) return true;

    return (product.variants ?? []).some((variant) => {
        if (variant.trackInventory === false) return true;
        const stock = variant.useParentStock
            ? (product.inventory?.stock ?? 0)
            : (variant.stock ?? 0);
        return stock > 0;
    });
}

export function isService(product: Product): boolean {
    return product.itemType === 'service';
}

/**
 * Units a shopper can still add for this product.
 *
 * Returns `null` when the product does not track inventory (unlimited).
 */
export function getAvailableStock(product: Product): number | null {
    if (product.trackInventory === false) return null;

    const parentStock = product.inventory?.stock ?? 0;
    if (parentStock > 0) return parentStock;

    // The parent may be empty while its variants still have stock.
    return (product.variants ?? []).reduce((acc, variant) => {
        if (variant.trackInventory === false) return acc;
        const stock = variant.useParentStock
            ? (product.inventory?.stock ?? 0)
            : (variant.stock ?? 0);
        return acc + (stock ?? 0);
    }, 0);
}
