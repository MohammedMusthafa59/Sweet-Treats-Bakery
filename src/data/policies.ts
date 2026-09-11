import { PolicyType } from '../types';

export interface PolicySection {
  id: PolicyType;
  title: string;
  subtitle: string;
  content: {
    intro?: string;
    points?: string[];
    details?: { label: string; value: string; href?: string }[];
    outro?: string;
  };
}

export const POLICIES: Record<PolicyType, PolicySection> = {
  terms: {
    id: 'terms',
    title: 'Terms & Conditions',
    subtitle: 'Standard ordering & service terms',
    content: {
      intro: 'Welcome to Choco House. By using this website and placing an order, you agree to the following terms:',
      points: [
        'All orders are subject to availability of ingredients and products listed.',
        'Prices listed are in INR and may change without prior notice.',
        'Orders are confirmed only after the customer receives a confirmation message via WhatsApp.',
        'Choco House reserves the right to refuse or cancel any order at its discretion, including in cases of suspected fraud or errors in pricing.',
        'Product images are for representation purposes; actual products may vary slightly in appearance.',
      ],
    },
  },
  privacy: {
    id: 'privacy',
    title: 'Privacy Policy',
    subtitle: 'How we collect & protect your data',
    content: {
      intro:
        'We collect only the information necessary to process your order: your name, phone number, and/or email address.',
      points: [
        'This information is used solely for order confirmation, delivery coordination, and customer support.',
        'We do not sell or share your personal information with third parties, except as required to fulfill your order (e.g., coordinating delivery).',
        'We do not store payment information, as all communication is handled directly via WhatsApp.',
      ],
    },
  },
  refund: {
    id: 'refund',
    title: 'Refund & Cancellation Policy',
    subtitle: 'Fair & transparent cancellation terms',
    content: {
      points: [
        'Orders can be cancelled free of charge before preparation begins. Please contact us via WhatsApp as soon as possible to request cancellation.',
        'Once an order has entered preparation, cancellations may not be accepted as ingredients are perishable and already committed to your order.',
        'If you receive a damaged, incorrect, or defective item, please contact us within 24 hours with photos, and we will offer a replacement or refund at our discretion.',
        'Refunds, where applicable, will be processed within 5-7 business days to the original payment method.',
      ],
    },
  },
  shipping: {
    id: 'shipping',
    title: 'Shipping & Delivery Policy',
    subtitle: 'Timelines & city coverage',
    content: {
      points: [
        'Delivery timelines will be communicated directly via WhatsApp after order confirmation, typically within 24-48 hours depending on the item and your location.',
        'Delivery is currently available within Chennai city limits.',
        'Delivery charges, if any, will be communicated before order confirmation.',
        'We are not responsible for delays caused by incorrect address details provided by the customer.',
      ],
    },
  },
  contact: {
    id: 'contact',
    title: 'Contact Us',
    subtitle: 'Reach out to our kitchen & support team',
    content: {
      intro: 'For any questions, order support, or feedback, reach us at:',
      details: [
        {
          label: 'WhatsApp',
          value: '+91 9486123975',
          href: 'https://wa.me/919486123975',
        },
        {
          label: 'Email',
          value: 'team.framelabs@gmail.com',
          href: 'mailto:team.framelabs@gmail.com',
        },
      ],
    },
  },
};
