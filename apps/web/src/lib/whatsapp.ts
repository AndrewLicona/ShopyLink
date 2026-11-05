/**
 * Builds a safe WhatsApp deep-link with a pre-formatted message.
 * Works for both products (direct order intent) and services (inquiry intent).
 */
export function buildWhatsAppLink(params: {
    phone: string;
    type: 'product' | 'service';
    name: string;
    price?: number | null;
    pricingMode?: string | null;
}): string {
    const { phone, type, name, price, pricingMode } = params;
    // wa.me expects digits only. A leading "+" breaks the deep link, so it is
    // stripped here and only the international digits are kept.
    const cleanPhone = phone.replace(/\D/g, '');

    let text: string;
    if (type === 'product') {
        const priceStr = price != null
            ? ` por $${price.toLocaleString('es-CO')}`
            : '';
        text = `Hola, quiero pedir el producto: ${name}${priceStr}`;
    } else {
        const modeLabel = pricingMode === 'hourly'
            ? ' (servicio por hora)'
            : pricingMode === 'quote'
                ? ' (servicio a convenir)'
                : '';
        const priceStr = price != null && pricingMode !== 'quote'
            ? ` — precio de referencia $${price.toLocaleString('es-CO')}`
            : '';
        text = `Hola, me interesa información sobre el servicio: ${name}${modeLabel}${priceStr}`;
    }

    return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`;
}
