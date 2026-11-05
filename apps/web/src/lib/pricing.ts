import type { Product } from '@/types/types';

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
