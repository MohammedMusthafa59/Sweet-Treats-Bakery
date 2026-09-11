import React, { useState } from 'react';
import { CartItem, CustomerInfo, OrderConfirmationDetails } from '../types';
import { loadRazorpayScript, RAZORPAY_KEY_ID, RazorpayPaymentSuccessResponse } from '../utils/razorpay';
import { submitBakeryOrder } from '../utils/api';
import { buildWhatsAppMessage, buildWhatsAppUrl, WHATSAPP_PHONE_NUMBER } from '../utils/whatsapp';
import {
  X,
  CreditCard,
  MessageCircle,
  AlertCircle,
  ShoppingBag,
  ArrowRight,
  User,
  Mail,
  Phone,
  ShieldCheck,
  Loader2,
  AlertTriangle,
  RotateCcw,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  totalAmount: number;
  onPaymentSuccess: (details: OrderConfirmationDetails) => void;
  onWhatsAppOrder: (details: OrderConfirmationDetails) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  items,
  totalAmount,
  onPaymentSuccess,
  onWhatsAppOrder,
}) => {
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');

  const [errors, setErrors] = useState<{ name?: string; email?: string; phone?: string }>({});
  const [isProcessingRazorpay, setIsProcessingRazorpay] = useState(false);
  const [paymentNotice, setPaymentNotice] = useState<string | null>(null);
  const [verificationError, setVerificationError] = useState<string | null>(null);
  const [failedPaymentId, setFailedPaymentId] = useState<string | null>(null);

  const totalItemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const validate = (): boolean => {
    const newErrors: { name?: string; email?: string; phone?: string } = {};

    if (!customerName.trim()) {
      newErrors.name = 'Please enter your full name.';
    }

    if (!customerEmail.trim()) {
      newErrors.email = 'Please enter your email address.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail.trim())) {
      newErrors.email = 'Please enter a valid email address.';
    }

    if (!customerPhone.trim()) {
      newErrors.phone = 'Please enter your contact phone number.';
    } else if (customerPhone.trim().length < 8) {
      newErrors.phone = 'Please enter a valid phone number (at least 8 digits).';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePayNow = async (e: React.FormEvent) => {
    e.preventDefault();
    setPaymentNotice(null);
    setVerificationError(null);
    setFailedPaymentId(null);

    if (!validate()) return;

    setIsProcessingRazorpay(true);

    try {
      const isLoaded = await loadRazorpayScript();
      if (!isLoaded || !window.Razorpay) {
        setPaymentNotice('Unable to load Razorpay payment gateway. You can try again or order via WhatsApp instead.');
        setIsProcessingRazorpay(false);
        return;
      }

      const options = {
        key: RAZORPAY_KEY_ID,
        amount: Math.round(totalAmount * 100), // in paise
        currency: 'INR',
        name: 'Choco House',
        description: `${totalItemCount} bakery item${totalItemCount === 1 ? '' : 's'} • Total ₹${totalAmount}`,
        prefill: {
          name: customerName.trim(),
          email: customerEmail.trim(),
          contact: customerPhone.trim(),
        },
        theme: {
          color: '#B45309',
        },
        modal: {
          ondismiss: () => {
            setIsProcessingRazorpay(false);
            setPaymentNotice('Payment was not completed — you can try again or order via WhatsApp instead.');
          },
        },
        handler: async (response: RazorpayPaymentSuccessResponse) => {
          setIsProcessingRazorpay(true);
          try {
            // Send payload to Google Apps Script as specified in prompt
            const orderPayload = {
              customerName: customerName.trim(),
              customerEmail: customerEmail.trim(),
              items: items.map((item) => ({
                name: item.product.name,
                qty: item.quantity,
                price: item.product.price,
              })),
              total: totalAmount,
              order_id: response.razorpay_order_id || '',
              payment_id: response.razorpay_payment_id || '',
              signature: response.razorpay_signature || '',
            };

            const postResult = await submitBakeryOrder(orderPayload);

            if (postResult.success === false) {
              setFailedPaymentId(response.razorpay_payment_id);
              setVerificationError(
                postResult.message || 'Signature verification failed. Please contact our support via WhatsApp so we can confirm and process your order immediately.'
              );
              setIsProcessingRazorpay(false);
              return;
            }

            // Success! Clear cart and display confirmation modal
            const confirmationDetails: OrderConfirmationDetails = {
              customerName: customerName.trim(),
              customerEmail: customerEmail.trim(),
              customerPhone: customerPhone.trim(),
              items: orderPayload.items,
              total: totalAmount,
              paymentId: response.razorpay_payment_id,
              orderId: response.razorpay_order_id,
              channel: 'Razorpay',
              createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            };

            setIsProcessingRazorpay(false);
            onPaymentSuccess(confirmationDetails);
          } catch (err: any) {
            console.error('Error recording payment:', err);
            // Fallback: still confirm since payment ID is already generated
            const confirmationDetails: OrderConfirmationDetails = {
              customerName: customerName.trim(),
              customerEmail: customerEmail.trim(),
              customerPhone: customerPhone.trim(),
              items: items.map((i) => ({ name: i.product.name, qty: i.quantity, price: i.product.price })),
              total: totalAmount,
              paymentId: response.razorpay_payment_id,
              orderId: response.razorpay_order_id,
              channel: 'Razorpay',
              createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            };
            setIsProcessingRazorpay(false);
            onPaymentSuccess(confirmationDetails);
          }
        },
      };

      const rzpInstance = new window.Razorpay(options);

      rzpInstance.on('payment.failed', (response: any) => {
        console.warn('Razorpay payment failed:', response);
        setIsProcessingRazorpay(false);
        setPaymentNotice('Payment was not completed — you can try again or order via WhatsApp instead.');
      });

      rzpInstance.open();
    } catch (err) {
      console.error('Razorpay initialization error:', err);
      setIsProcessingRazorpay(false);
      setPaymentNotice('Payment was not completed — you can try again or order via WhatsApp instead.');
    }
  };

  const handleOrderViaWhatsAppFallback = () => {
    // Collect Name and Phone/Email
    const trimmedName = customerName.trim() || 'Valued Customer';
    const contactInfo = [customerPhone.trim(), customerEmail.trim()].filter(Boolean).join(' / ');

    const formattedMessage = buildWhatsAppMessage(trimmedName, contactInfo, items, totalAmount);
    const whatsAppUrl = buildWhatsAppUrl(formattedMessage);

    // Open WhatsApp
    window.open(whatsAppUrl, '_blank', 'noopener,noreferrer');

    // Record order and confirm
    const confirmationDetails: OrderConfirmationDetails = {
      customerName: trimmedName,
      customerEmail: customerEmail.trim(),
      customerPhone: customerPhone.trim(),
      items: items.map((item) => ({
        name: item.product.name,
        qty: item.quantity,
        price: item.product.price,
      })),
      total: totalAmount,
      channel: 'WhatsApp',
      whatsAppUrl,
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    submitBakeryOrder({
      customerName: trimmedName,
      customerEmail: customerEmail.trim(),
      customerPhone: customerPhone.trim(),
      items: confirmationDetails.items,
      total: totalAmount,
      channel: 'WhatsApp',
      timestamp: new Date().toISOString(),
    });

    onWhatsAppOrder(confirmationDetails);
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
            onClick={!isProcessingRazorpay ? onClose : undefined}
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
                <div className="w-9 h-9 rounded-full bg-[#B45309]/10 text-[#B45309] flex items-center justify-center border border-[#B45309]/20">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-display text-lg sm:text-xl font-bold text-[#2E190F]">
                    Complete Your Order
                  </h3>
                  <p className="text-xs text-[#7A5B4C]">
                    Pay securely via Razorpay (UPI, Cards, Netbanking)
                  </p>
                </div>
              </div>

              <button
                id="close-checkout-modal"
                disabled={isProcessingRazorpay}
                onClick={onClose}
                className="p-1.5 rounded-full hover:bg-[#F2EAE0] text-[#6B4E3F] transition-colors cursor-pointer disabled:opacity-50"
                aria-label="Close checkout"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Verification Failure Banner */}
            {verificationError && (
              <div className="mx-5 mt-4 p-4 bg-red-50 border border-red-200 rounded-xl text-xs space-y-2 text-red-900">
                <div className="flex items-center gap-2 font-bold text-red-800">
                  <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                  <span>Order Verification Notice</span>
                </div>
                <p className="text-red-700 leading-relaxed">
                  {verificationError}
                </p>
                {failedPaymentId && (
                  <p className="font-mono text-[11px] bg-white p-2 rounded-md border border-red-200 text-red-800">
                    Payment Reference: <strong>{failedPaymentId}</strong>
                  </p>
                )}
                <div className="pt-1">
                  <a
                    href={`https://wa.me/${WHATSAPP_PHONE_NUMBER}?text=${encodeURIComponent(
                      `Hi Choco House! My payment was completed with ID: ${failedPaymentId || ''}, but signature verification encountered an issue. Please confirm my order.`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold text-xs transition-colors"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>Contact Support via WhatsApp</span>
                  </a>
                </div>
              </div>
            )}

            {/* Cancellation or Failure Alert Banner */}
            {paymentNotice && !verificationError && (
              <div className="mx-5 mt-4 p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-amber-800">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Payment Notice</span>
                </div>
                <p className="text-amber-800 leading-relaxed">
                  {paymentNotice}
                </p>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handlePayNow} className="p-5 sm:p-6 space-y-4">
              {/* Basket Summary Box */}
              <div className="bg-white rounded-xl p-4 border border-[#E9DDCE] space-y-2">
                <div className="flex justify-between items-center text-xs font-semibold text-[#6E4F3E] border-b border-[#F5EDE3] pb-2">
                  <span className="flex items-center gap-1.5">
                    <ShoppingBag className="w-3.5 h-3.5 text-[#B45309]" />
                    <span>Order Summary ({totalItemCount} items)</span>
                  </span>
                  <span className="text-[#9A3412] font-bold text-sm">
                    Total: ₹{totalAmount.toLocaleString()}
                  </span>
                </div>
                <div className="max-h-24 overflow-y-auto space-y-1.5 text-xs text-[#52372A] pr-1">
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
                  Full Name <span className="text-[#DC2626]">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-[#9C7A68] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    id="checkout-name-input"
                    type="text"
                    placeholder="e.g. Priyan Sharma"
                    value={customerName}
                    disabled={isProcessingRazorpay}
                    onChange={(e) => {
                      setCustomerName(e.target.value);
                      if (errors.name) setErrors((prev) => ({ ...prev, name: undefined }));
                    }}
                    className={`w-full pl-9 pr-3.5 py-2.5 text-sm bg-white rounded-xl border transition-all text-[#2E190F] focus:outline-none focus:ring-2 ${
                      errors.name
                        ? 'border-[#DC2626] focus:ring-[#DC2626]/30'
                        : 'border-[#E2D4C3] focus:border-[#B45309] focus:ring-[#B45309]/30'
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

              {/* Customer Email & Phone Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Email Input */}
                <div>
                  <label
                    htmlFor="checkout-email-input"
                    className="block text-xs font-semibold text-[#3B2215] mb-1.5"
                  >
                    Email Address <span className="text-[#DC2626]">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-[#9C7A68] absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      id="checkout-email-input"
                      type="email"
                      placeholder="name@example.com"
                      value={customerEmail}
                      disabled={isProcessingRazorpay}
                      onChange={(e) => {
                        setCustomerEmail(e.target.value);
                        if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
                      }}
                      className={`w-full pl-9 pr-3 py-2.5 text-sm bg-white rounded-xl border transition-all text-[#2E190F] focus:outline-none focus:ring-2 ${
                        errors.email
                          ? 'border-[#DC2626] focus:ring-[#DC2626]/30'
                          : 'border-[#E2D4C3] focus:border-[#B45309] focus:ring-[#B45309]/30'
                      }`}
                    />
                  </div>
                  {errors.email && (
                    <p className="mt-1 text-xs text-[#DC2626] flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      {errors.email}
                    </p>
                  )}
                </div>

                {/* Phone Input */}
                <div>
                  <label
                    htmlFor="checkout-phone-input"
                    className="block text-xs font-semibold text-[#3B2215] mb-1.5"
                  >
                    Phone Number <span className="text-[#DC2626]">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-[#9C7A68] absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      id="checkout-phone-input"
                      type="tel"
                      placeholder="e.g. 9876543210"
                      value={customerPhone}
                      disabled={isProcessingRazorpay}
                      onChange={(e) => {
                        setCustomerPhone(e.target.value);
                        if (errors.phone) setErrors((prev) => ({ ...prev, phone: undefined }));
                      }}
                      className={`w-full pl-9 pr-3 py-2.5 text-sm bg-white rounded-xl border transition-all text-[#2E190F] focus:outline-none focus:ring-2 ${
                        errors.phone
                          ? 'border-[#DC2626] focus:ring-[#DC2626]/30'
                          : 'border-[#E2D4C3] focus:border-[#B45309] focus:ring-[#B45309]/30'
                      }`}
                    />
                  </div>
                  {errors.phone && (
                    <p className="mt-1 text-xs text-[#DC2626] flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      {errors.phone}
                    </p>
                  )}
                </div>
              </div>

              {/* Primary: Razorpay Pay Now Button */}
              <div className="pt-2 space-y-2">
                <button
                  id="pay-now-razorpay-button"
                  type="submit"
                  disabled={isProcessingRazorpay}
                  className="w-full py-3.5 px-4 bg-[#B45309] hover:bg-[#92400E] active:scale-98 disabled:opacity-75 text-white text-sm font-bold rounded-xl shadow-md hover:shadow-lg flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  {isProcessingRazorpay ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Connecting to Razorpay...</span>
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-5 h-5" />
                      <span>Pay Now • ₹{totalAmount.toLocaleString()}</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                <div className="flex items-center justify-center gap-2 text-[11px] text-[#7C5A47]">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Secured by Razorpay • UPI, Cards, Netbanking & Wallets</span>
                </div>
              </div>

              {/* Divider for WhatsApp fallback */}
              <div className="relative flex py-2 items-center">
                <div className="flex-grow border-t border-[#E8DCCF]"></div>
                <span className="flex-shrink mx-3 text-xs text-[#8C6F5E] font-medium uppercase tracking-wider">
                  or prefer direct handoff?
                </span>
                <div className="flex-grow border-t border-[#E8DCCF]"></div>
              </div>

              {/* Secondary: WhatsApp order button */}
              <div>
                <button
                  id="fallback-whatsapp-order-button"
                  type="button"
                  disabled={isProcessingRazorpay}
                  onClick={handleOrderViaWhatsAppFallback}
                  className="w-full py-2.5 px-4 bg-white hover:bg-emerald-50 text-emerald-800 border border-emerald-300 hover:border-emerald-400 font-semibold text-xs sm:text-sm rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
                >
                  <MessageCircle className="w-4 h-4 text-emerald-600 fill-emerald-600/15" />
                  <span>Order via WhatsApp instead</span>
                </button>
                <p className="text-[10px] text-center text-[#9C7F6E] mt-1.5">
                  Sends pre-formatted cart summary to kitchen at +91 9486123975
                </p>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
