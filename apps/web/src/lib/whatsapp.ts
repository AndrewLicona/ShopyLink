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
  // Strip everything that is not a digit or leading +
  const cleanPhone = phone.replace(/[^\d+]/g, '');

  let text: string;
  if (type === 'product') {
    const priceStr = price != null
      ? ` por $${price.toLocaleString('es-CO')}`
      : '';
    text = `Hola, quiero pedir el producto: ${name}${priceStr}`;
  } else {
    text = `Hola, me interesa información sobre el servicio: ${name}`;
  }

  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`;
}
