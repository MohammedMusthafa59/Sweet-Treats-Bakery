import { CartItem } from '../types';

export const WHATSAPP_PHONE_NUMBER = '919486123975';

export function buildWhatsAppMessage(
  customerName: string,
  phone: string,
  items: CartItem[],
  total: number,
  address?: string,
  email?: string
): string {
  const itemLines = items
    .map(
      (item) =>
        `- ${item.product.name} x${item.quantity} - ₹${item.product.price * item.quantity}`
    )
    .join('\n');

  let message = `Hi! I'd like to order:\n${itemLines}\nTotal: ₹${total}\nName: ${customerName}`;
  if (phone && phone.trim()) {
    message += `\nPhone: ${phone.trim()}`;
  }
  if (email && email.trim()) {
    message += `\nEmail: ${email.trim()}`;
  }
  if (address && address.trim()) {
    message += `\nDelivery Address: ${address.trim()}`;
  }
  return message;
}

export function buildWhatsAppUrl(message: string): string {
  return `https://wa.me/${WHATSAPP_PHONE_NUMBER}?text=${encodeURIComponent(message)}`;
}
