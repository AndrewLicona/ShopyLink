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
    storeName?: string | null;
}): string {
    const { phone, type, name, price, pricingMode, storeName } = params;
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
        // Services are an inquiry, not a purchase: greet the store by name and
        // ask about the service without forcing a price into the message.
        const greeting = storeName ? `Hola ${storeName},` : 'Hola,';
        text = `${greeting} me interesa consultar sobre el servicio: ${name}.`;
    }

    return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`;
}
