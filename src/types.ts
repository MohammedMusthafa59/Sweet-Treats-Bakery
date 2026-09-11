export interface Product {
  name: string;
  price: number;
  imageUrl: string;
  description: string;
  category?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface CustomerInfo {
  customerName: string;
  customerContact: string; // phone or email
  orderNotes?: string;
}

export interface WhatsAppOrderDetails {
  customerName: string;
  customerContact: string;
  items: Array<{
    name: string;
    qty: number;
    price: number;
  }>;
  total: number;
  whatsAppUrl: string;
  formattedMessage: string;
  createdAt: string;
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

