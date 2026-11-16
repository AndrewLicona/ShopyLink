/** Coincidencias orientativas: no impiden guardar productos distintos. */
export function normalizeProductName(name: string): string {
    return name.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim().replace(/\s+/g, ' ');
}

export function findSimilarProducts<T extends { name: string }>(name: string, products: T[]): T[] {
    const query = normalizeProductName(name);
    if (query.length < 3) return [];
    const terms = query.split(' ');
    return products.filter(product => {
        const candidate = normalizeProductName(product.name);
        if (candidate === query) return true;
        if (query.length >= 5 && candidate.length >= 5 && (candidate.includes(query) || query.includes(candidate))) return true;
        const other = candidate.split(' ');
        return terms.length >= 2 && other.length >= 2 && terms.filter(term => other.includes(term)).length / Math.max(terms.length, other.length) >= 0.8;
    }).slice(0, 5);
}
