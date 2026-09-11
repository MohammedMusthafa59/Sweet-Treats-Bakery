import React, { useEffect } from 'react';
import { WhatsAppOrderDetails } from '../types';
import confetti from 'canvas-confetti';
import { CheckCircle2, ShoppingBag, MessageCircle, ExternalLink, Sparkles, Clock, User, PhoneCall, Copy, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface OrderSuccessModalProps {
  order: WhatsAppOrderDetails | null;
  onClose: () => void;
}

export const OrderSuccessModal: React.FC<OrderSuccessModalProps> = ({
  order,
  onClose,
}) => {
  const [copied, setCopied] = React.useState(false);

  useEffect(() => {
    if (order) {
      try {
        confetti({
          particleCount: 75,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#059669', '#10B981', '#B45309', '#F59E0B', '#FBBF24'],
        });
      } catch {
        // Safe if canvas-confetti fails
      }
    }
  }, [order]);

  if (!order) return null;

  const handleCopyMessage = () => {
    if (!order) return;
    navigator.clipboard.writeText(order.formattedMessage);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 sm:p-6">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
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
          {/* Top Banner */}
          <div className="bg-gradient-to-br from-emerald-600 to-teal-800 text-white p-6 text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-white/10 rounded-full blur-xl" />
            <div className="absolute bottom-0 left-0 -ml-8 -mb-8 w-32 h-32 bg-emerald-400/10 rounded-full blur-xl" />

            <div className="w-14 h-14 bg-white/20 ring-4 ring-white/30 rounded-full flex items-center justify-center mx-auto mb-2.5 shadow-inner">
              <CheckCircle2 className="w-8 h-8 text-white" />
            </div>

            <span className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full text-xs font-semibold bg-white/20 text-white mb-2">
              <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
              WhatsApp Handoff Ready
            </span>

            <h2 className="font-display text-xl sm:text-2xl font-bold tracking-tight text-white mb-1">
              Order Dispatched to WhatsApp!
            </h2>
            <p className="text-xs sm:text-sm text-emerald-100 max-w-sm mx-auto">
              Please send the pre-filled message in your WhatsApp chat with +91 9486123975 to complete your confirmation.
            </p>
          </div>

          {/* Details Body */}
          <div className="p-5 sm:p-6 space-y-4 text-xs">
            {/* Meta Info Grid */}
            <div className="grid grid-cols-2 gap-3 bg-white p-3.5 rounded-2xl border border-[#ECE0D2]">
              <div className="space-y-0.5">
                <span className="text-[11px] text-[#8C6F5E] flex items-center gap-1">
                  <User className="w-3 h-3 text-[#B45309]" /> Customer
                </span>
                <span className="font-bold text-[#2E190F] block truncate">
                  {order.customerName}
                </span>
              </div>
              <div className="space-y-0.5">
                <span className="text-[11px] text-[#8C6F5E] flex items-center gap-1">
                  <PhoneCall className="w-3 h-3 text-[#B45309]" /> Contact
                </span>
                <span className="font-semibold text-[#2E190F] block truncate">
                  {order.customerContact}
                </span>
              </div>
              <div className="space-y-0.5 col-span-2 pt-2 border-t border-[#F5EDE3] flex items-center justify-between">
                <span className="text-[11px] text-[#8C6F5E] flex items-center gap-1">
                  <Clock className="w-3 h-3 text-emerald-600" /> WhatsApp Number
                </span>
                <span className="font-mono font-bold text-emerald-700">
                  +91 9486123975
                </span>
              </div>
            </div>

            {/* Items Summary Table */}
            <div className="bg-white rounded-2xl border border-[#ECE0D2] overflow-hidden">
              <div className="p-3 bg-[#F9F5F0] border-b border-[#ECE0D2] font-semibold text-[#5B3E2F] flex justify-between">
                <span>Items Ordered</span>
                <span>Subtotal</span>
              </div>
              <div className="p-3 space-y-2 max-h-32 overflow-y-auto divide-y divide-[#F5EDE3]">
                {order.items.map((item, idx) => (
                  <div key={idx} className="pt-2 first:pt-0 flex justify-between items-center">
                    <div>
                      <span className="font-medium text-[#2E190F] block">
                        {item.name}
                      </span>
                      <span className="text-[11px] text-[#8C6F5E]">
                        Qty: {item.qty} × ₹{item.price}
                      </span>
                    </div>
                    <span className="font-bold text-[#8C3A16]">
                      ₹{(item.qty * item.price).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
              <div className="p-3 bg-[#FAF7F2] border-t border-[#ECE0D2] flex justify-between items-baseline">
                <span className="font-bold text-[#2E190F]">Total</span>
                <span className="font-sans text-base font-extrabold text-[#9A3412]">
                  ₹{order.total.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Re-open WhatsApp & Copy Actions */}
            <div className="space-y-2 pt-1">
              <a
                href={order.whatsAppUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white text-xs sm:text-sm font-bold rounded-xl shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <MessageCircle className="w-4 h-4 fill-white/20" />
                <span>Re-open WhatsApp Chat</span>
                <ExternalLink className="w-3.5 h-3.5 ml-1" />
              </a>

              <div className="flex gap-2">
                <button
                  onClick={handleCopyMessage}
                  className="flex-1 py-2.5 px-3 bg-white hover:bg-[#F2EAE0] text-[#5C3B28] text-xs font-semibold rounded-xl border border-[#DAC9B7] transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied to Clipboard' : 'Copy Message Text'}</span>
                </button>

                <button
                  id="place-another-order-button"
                  onClick={onClose}
                  className="flex-1 py-2.5 px-3 bg-[#B45309] hover:bg-[#92400E] text-white text-xs font-semibold rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>Browse More Treats</span>
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
