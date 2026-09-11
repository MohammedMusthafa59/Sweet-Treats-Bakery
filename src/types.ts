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
  phone: string;
  email?: string;
  address: string;
  orderNotes?: string;
}

export interface RazorpayOrderPayload {
  customerName: string;
  phone: string;
  email: string;
  address: string;
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
  phone: string;
  email?: string;
  address: string;
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

export interface ShutdownStatus {
  active: boolean;
  message?: string;
}

export interface ApiProductResponse {
  success: boolean;
  categories?: Record<string, Product[]>;
  shutdown?: ShutdownStatus | null;
  announcement?: string | null;
  version?: string | number;
  message?: string;
}
