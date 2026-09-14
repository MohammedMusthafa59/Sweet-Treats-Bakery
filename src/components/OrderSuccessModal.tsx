import React, { useEffect } from 'react';
import { OrderConfirmationDetails } from '../types';
import confetti from 'canvas-confetti';
import {
  CheckCircle2,
  ShoppingBag,
  MessageCircle,
  Sparkles,
  Clock,
  User,
  Phone,
  Mail,
  MapPin,
  Check,
  CreditCard,
  Receipt,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { WHATSAPP_PHONE_NUMBER } from '../utils/whatsapp';

interface OrderSuccessModalProps {
  order: OrderConfirmationDetails | null;
  onClose: () => void;
  onViewOrders?: () => void;
}

export const OrderSuccessModal: React.FC<OrderSuccessModalProps> = ({
  order,
  onClose,
  onViewOrders,
}) => {
  const [copied, setCopied] = React.useState(false);

  useEffect(() => {
    if (order) {
      try {
        confetti({
          particleCount: 85,
          spread: 80,
          origin: { y: 0.5 },
          colors: ['#059669', '#10B981', '#B45309', '#F59E0B', '#FBBF24', '#D97706'],
        });
      } catch {
        // Fallback gracefully if confetti unavailable
      }
    }
  }, [order]);

  if (!order) return null;

  const isRazorpay = order.channel === 'Razorpay';

  const handleCopyPaymentId = () => {
    if (order.paymentId) {
      navigator.clipboard.writeText(order.paymentId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <AnimatePresence>
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
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative w-full max-w-lg bg-[#FAF7F2] rounded-3xl border border-[#E2D4C3] shadow-2xl overflow-hidden z-10 my-8"
        >
          {/* Top Celebration Banner */}
          <div className="bg-gradient-to-br from-[#15803D] via-[#166534] to-[#14532D] text-white p-6 text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-white/10 rounded-full blur-xl" />
            <div className="absolute bottom-0 left-0 -ml-8 -mb-8 w-32 h-32 bg-emerald-400/10 rounded-full blur-xl" />

            <div className="w-14 h-14 bg-white/20 ring-4 ring-white/30 rounded-full flex items-center justify-center mx-auto mb-2.5 shadow-inner">
              <CheckCircle2 className="w-8 h-8 text-white" />
            </div>

            <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-semibold bg-white/20 text-white mb-2">
              <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
              <span>{isRazorpay ? 'Payment Verified & Confirmed' : 'WhatsApp Order Received'}</span>
            </span>

            <h2 className="font-display text-xl sm:text-2xl font-bold tracking-tight text-white mb-1">
              Thank you, your order has been placed!
            </h2>
            <p className="text-xs sm:text-sm text-emerald-100 max-w-sm mx-auto leading-relaxed">
              {isRazorpay
                ? 'Your payment was successfully processed. Our pastry chefs are preparing your freshly baked goodies!'
                : 'Your order was dispatched to our kitchen team. Please send the pre-filled message on WhatsApp to complete confirmation.'}
            </p>
          </div>

          {/* Details Body */}
          <div className="p-5 sm:p-6 space-y-4 text-xs">
            {/* Meta Info Grid */}
            <div className="bg-white p-3.5 rounded-2xl border border-[#ECE0D2] space-y-2.5">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-0.5">
                  <span className="text-[11px] text-[#8C6F5E] flex items-center gap-1">
                    <User className="w-3 h-3 text-[#B45309]" /> Customer
                  </span>
                  <span className="font-bold text-[#2E190F] block truncate text-xs sm:text-sm">
                    {order.customerName}
                  </span>
                </div>

                <div className="space-y-0.5">
                  <span className="text-[11px] text-[#8C6F5E] flex items-center gap-1">
                    <Phone className="w-3 h-3 text-[#B45309]" /> Phone
                  </span>
                  <span className="font-semibold text-[#2E190F] block truncate text-xs">
                    {order.phone || 'Recorded'}
                  </span>
                </div>
              </div>

              {order.email && (
                <div className="space-y-0.5 pt-1.5 border-t border-[#F5ECE2]">
                  <span className="text-[11px] text-[#8C6F5E] flex items-center gap-1">
                    <Mail className="w-3 h-3 text-[#B45309]" /> Email
                  </span>
                  <span className="text-[#2E190F] text-xs font-medium">
                    {order.email}
                  </span>
                </div>
              )}

              {order.address && (
                <div className="space-y-0.5 pt-1.5 border-t border-[#F5ECE2]">
                  <span className="text-[11px] text-[#8C6F5E] flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-[#B45309]" /> Delivery Address
                  </span>
                  <span className="text-[#2E190F] text-xs leading-relaxed block">
                    {order.address}
                  </span>
                </div>
              )}

              {isRazorpay && order.paymentId && (
                <div className="pt-2 border-t border-[#F2EAE0] flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="text-[10px] text-[#8C6F5E] uppercase tracking-wider flex items-center gap-1">
                      <CreditCard className="w-3 h-3 text-emerald-600" /> Razorpay Payment ID
                    </span>
                    <span className="font-mono font-semibold text-[#1F2937] text-xs">
                      {order.paymentId}
                    </span>
                  </div>
                  <button
                    onClick={handleCopyPaymentId}
                    className="px-2.5 py-1 text-[11px] font-medium text-[#7C5A47] hover:text-[#2E190F] bg-[#FAF7F2] hover:bg-[#EDE3D6] rounded-md transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-600" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <span>Copy ID</span>
                    )}
                  </button>
                </div>
              )}
            </div>

            {/* Items Purchased List */}
            <div className="bg-white rounded-2xl p-4 border border-[#ECE0D2]">
              <h4 className="font-semibold text-[#3B2215] mb-2 pb-1.5 border-b border-[#F4EBE2] flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <ShoppingBag className="w-3.5 h-3.5 text-[#B45309]" />
                  <span>Treats in this Order</span>
                </span>
                <span className="text-[11px] font-normal text-[#8C6F5E]">
                  {order.items.length} item{order.items.length === 1 ? '' : 's'}
                </span>
              </h4>

              <div className="divide-y divide-[#F7EFE7] max-h-36 overflow-y-auto pr-1">
                {order.items.map((item, idx) => (
                  <div key={idx} className="py-2 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-semibold text-[#2E190F]">{item.name}</span>
                      <span className="text-[#8C6F5E] ml-2 text-[11px]">x{item.qty}</span>
                    </div>
                    <span className="font-semibold text-[#9A3412]">
                      ₹{(item.price * item.qty).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>

              {/* Total Row */}
              <div className="pt-3 mt-2 border-t-2 border-[#EEDBCC] flex items-center justify-between font-bold text-sm text-[#2E190F]">
                <span>Total Amount {isRazorpay && <span className="text-emerald-700 text-xs font-normal">(Paid)</span>}</span>
                <span className="text-base text-[#9A3412]">₹{order.total.toLocaleString()}</span>
              </div>
            </div>

            {/* Delivery/Kitchen Info */}
            <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-3 flex items-start gap-2.5 text-[11px] text-[#7A5B4C]">
              <Clock className="w-4 h-4 text-[#B45309] shrink-0 mt-0.5" />
              <div>
                <strong className="text-[#3B2215] block">Fresh Kitchen Timings</strong>
                <span>
                  Baking batches dispatch daily 8:00 AM – 11:30 AM &amp; 3:00 PM – 6:00 PM. Handcrafted fresh with pure butter and Belgian cocoa.
                </span>
              </div>
            </div>

            {/* Support link */}
            <div className="text-center pt-1">
              <a
                href={`https://wa.me/${WHATSAPP_PHONE_NUMBER}?text=${encodeURIComponent(
                  `Hi Choco House! I have a question regarding my order (${isRazorpay ? `Payment ID: ${order.paymentId}` : `Name: ${order.customerName}`}) for ₹${order.total}.`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-emerald-700 hover:text-emerald-800 hover:underline font-semibold"
              >
                <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                <span>Need assistance? Chat with us on WhatsApp</span>
              </a>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
              {onViewOrders && (
                <button
                  id="view-in-my-orders-btn"
                  onClick={() => {
                    onClose();
                    onViewOrders();
                  }}
                  className="flex-1 py-2.5 sm:py-3 bg-[#2E160D] hover:bg-[#1E0D06] text-[#FDE68A] font-semibold rounded-xl text-xs sm:text-sm border border-[#522D1B] transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Receipt className="w-4 h-4 text-[#FDE68A]" />
                  <span>View in My Orders</span>
                </button>
              )}
              <button
                id="close-order-success-btn"
                onClick={onClose}
                className="flex-1 py-2.5 sm:py-3 bg-[#B45309] hover:bg-[#92400E] active:scale-98 text-white font-semibold rounded-xl text-xs sm:text-sm transition-all shadow-xs cursor-pointer"
              >
                Continue Browsing
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
