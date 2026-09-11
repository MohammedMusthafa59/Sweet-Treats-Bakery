import React, { useState } from 'react';
import { CartItem, CustomerInfo } from '../types';
import { buildWhatsAppMessage, buildWhatsAppUrl } from '../utils/whatsapp';
import { X, MessageCircle, AlertCircle, ShoppingBag, ExternalLink, ArrowRight, User, PhoneCall } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  totalAmount: number;
  onOrderViaWhatsApp: (customerInfo: CustomerInfo, whatsAppUrl: string, formattedMsg: string) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  items,
  totalAmount,
  onOrderViaWhatsApp,
}) => {
  const [customerName, setCustomerName] = useState('');
  const [customerContact, setCustomerContact] = useState('');
  const [errors, setErrors] = useState<{ name?: string; contact?: string }>({});

  const validate = (): boolean => {
    const newErrors: { name?: string; contact?: string } = {};

    if (!customerName.trim()) {
      newErrors.name = 'Please enter your name.';
    }

    if (!customerContact.trim()) {
      newErrors.contact = 'Please enter your phone number or email.';
    } else if (customerContact.trim().length < 3) {
      newErrors.contact = 'Please enter a valid phone number or email.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleProceedToWhatsApp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const trimmedName = customerName.trim();
    const trimmedContact = customerContact.trim();

    const formattedMessage = buildWhatsAppMessage(trimmedName, trimmedContact, items, totalAmount);
    const whatsAppUrl = buildWhatsAppUrl(formattedMessage);

    // Open WhatsApp in a new tab/window
    window.open(whatsAppUrl, '_blank', 'noopener,noreferrer');

    // Notify parent to record order and display confirmation
    onOrderViaWhatsApp(
      { customerName: trimmedName, customerContact: trimmedContact },
      whatsAppUrl,
      formattedMessage
    );
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 sm:p-6">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
          />

          {/* Modal Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            className="relative w-full max-w-lg bg-[#FAF7F2] rounded-2xl border border-[#E2D4C3] shadow-2xl overflow-hidden z-10 my-8"
          >
            {/* Header */}
            <div className="p-5 bg-white border-b border-[#EBDDCF] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-200">
                  <MessageCircle className="w-5 h-5 fill-emerald-600/20" />
                </div>
                <div>
                  <h3 className="font-display text-lg sm:text-xl font-bold text-[#2E190F]">
                    Order via WhatsApp
                  </h3>
                  <p className="text-xs text-[#7A5B4C]">
                    Send your order directly to our bakery kitchen
                  </p>
                </div>
              </div>

              <button
                id="close-checkout-modal"
                onClick={onClose}
                className="p-1.5 rounded-full hover:bg-[#F2EAE0] text-[#6B4E3F] transition-colors cursor-pointer"
                aria-label="Close checkout"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleProceedToWhatsApp} className="p-5 sm:p-6 space-y-4">
              {/* Order Summary Compact Box */}
              <div className="bg-white rounded-xl p-4 border border-[#E9DDCE] space-y-2">
                <div className="flex justify-between items-center text-xs font-semibold text-[#6E4F3E] border-b border-[#F5EDE3] pb-2">
                  <span className="flex items-center gap-1.5">
                    <ShoppingBag className="w-3.5 h-3.5 text-[#B45309]" />
                    <span>Your Basket ({items.reduce((s, i) => s + i.quantity, 0)} items)</span>
                  </span>
                  <span className="text-[#9A3412] font-bold">Total: ₹{totalAmount.toLocaleString()}</span>
                </div>
                <div className="max-h-28 overflow-y-auto space-y-1.5 text-xs text-[#52372A] pr-1">
                  {items.map((i) => (
                    <div key={i.product.name} className="flex justify-between">
                      <span className="truncate max-w-[240px]">
                        {i.quantity}x {i.product.name}
                      </span>
                      <span className="font-medium text-[#7C5A47]">
                        ₹{(i.product.price * i.quantity).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Customer Name Input */}
              <div>
                <label
                  htmlFor="checkout-name-input"
                  className="block text-xs font-semibold text-[#3B2215] mb-1.5"
                >
                  Your Name <span className="text-[#DC2626]">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-[#9C7A68] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    id="checkout-name-input"
                    type="text"
                    placeholder="e.g. John Doe"
                    value={customerName}
                    onChange={(e) => {
                      setCustomerName(e.target.value);
                      if (errors.name) setErrors((prev) => ({ ...prev, name: undefined }));
                    }}
                    className={`w-full pl-9 pr-3.5 py-2.5 text-sm bg-white rounded-xl border transition-all text-[#2E190F] focus:outline-none focus:ring-2 ${
                      errors.name
                        ? 'border-[#DC2626] focus:ring-[#DC2626]/30'
                        : 'border-[#E2D4C3] focus:border-emerald-600 focus:ring-emerald-600/30'
                    }`}
                  />
                </div>
                {errors.name && (
                  <p className="mt-1 text-xs text-[#DC2626] flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    {errors.name}
                  </p>
                )}
              </div>

              {/* Customer Contact Input (Phone or Email) */}
              <div>
                <label
                  htmlFor="checkout-contact-input"
                  className="block text-xs font-semibold text-[#3B2215] mb-1.5"
                >
                  Phone Number or Email <span className="text-[#DC2626]">*</span>
                </label>
                <div className="relative">
                  <PhoneCall className="w-4 h-4 text-[#9C7A68] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    id="checkout-contact-input"
                    type="text"
                    placeholder="e.g. +91 98765 43210 or email@example.com"
                    value={customerContact}
                    onChange={(e) => {
                      setCustomerContact(e.target.value);
                      if (errors.contact) setErrors((prev) => ({ ...prev, contact: undefined }));
                    }}
                    className={`w-full pl-9 pr-3.5 py-2.5 text-sm bg-white rounded-xl border transition-all text-[#2E190F] focus:outline-none focus:ring-2 ${
                      errors.contact
                        ? 'border-[#DC2626] focus:ring-[#DC2626]/30'
                        : 'border-[#E2D4C3] focus:border-emerald-600 focus:ring-emerald-600/30'
                    }`}
                  />
                </div>
                {errors.contact && (
                  <p className="mt-1 text-xs text-[#DC2626] flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    {errors.contact}
                  </p>
                )}
                <p className="mt-1 text-[11px] text-[#8C6F5E]">
                  Used to confirm your order and coordinate fresh delivery.
                </p>
              </div>

              {/* WhatsApp explanation banner */}
              <div className="p-3.5 bg-emerald-50/80 border border-emerald-200 rounded-xl text-xs text-emerald-900 space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-emerald-800">
                  <MessageCircle className="w-4 h-4 text-emerald-600" />
                  <span>Direct Kitchen Handoff</span>
                </div>
                <p className="text-[11px] text-emerald-700 leading-relaxed">
                  Clicking below will open WhatsApp with your order items pre-formatted to <strong>+91 9486123975</strong>. You can review and hit send!
                </p>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  id="order-via-whatsapp-button"
                  type="submit"
                  className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white text-sm font-bold rounded-xl shadow-md hover:shadow-lg flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <MessageCircle className="w-5 h-5 fill-white/20" />
                  <span>Order via WhatsApp (₹{totalAmount.toLocaleString()})</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
