export interface Product {
  name: string;
  price: number;
  imageUrl: string;
  description: string;
  category?: string;
  onOffer?: boolean;
  originalPrice?: number;
  discount?: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface CustomerInfo {
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  orderNotes?: string;
}

export interface RazorpayOrderPayload {
  customerName: string;
  customerEmail: string;
  items: Array<{
    name: string;
    qty: number;
    price: number;
  }>;
  total: number;
  order_id: string;
  payment_id: string;
  signature: string;
}

export interface OrderConfirmationDetails {
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  items: Array<{
    name: string;
    qty: number;
    price: number;
  }>;
  total: number;
  paymentId?: string;
  orderId?: string;
  channel: 'Razorpay' | 'WhatsApp';
  createdAt: string;
  whatsAppUrl?: string;
}

export type PolicyType =
  | 'terms'
  | 'privacy'
  | 'refund'
  | 'shipping'
  | 'contact';

export interface ApiProductResponse {
  success: boolean;
  categories?: Record<string, Product[]>;
  message?: string;
}
