import React, { useEffect } from 'react';
import { Store, Clock, MessageCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { WHATSAPP_PHONE_NUMBER } from '../utils/whatsapp';

interface ShutdownOverlayProps {
  message?: string;
}

export const ShutdownOverlay: React.FC<ShutdownOverlayProps> = ({ message }) => {
  // Prevent any keyboard dismissal attempts (like ESC)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
      }
    };
    window.addEventListener('keydown', handleKeyDown, true);
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, []);

  return (
    <div
      id="shutdown-screen-overlay"
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="shutdown-title"
      aria-describedby="shutdown-desc"
      className="fixed inset-0 z-[9999] bg-[#22120A] text-[#FAF7F2] flex items-center justify-center p-4 sm:p-6 select-none overflow-y-auto"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Background ambient warmth */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(180,83,9,0.18)_0%,rgba(34,18,10,0.95)_70%)] pointer-events-none" />

      {/* Main Container Card */}
      <div className="relative w-full max-w-lg bg-[#2E180E] border border-[#522D1B] rounded-3xl p-6 sm:p-10 text-center shadow-2xl space-y-6">
        {/* Decorative Icon */}
        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-[#452313] border border-[#6B371E] flex items-center justify-center mx-auto shadow-inner">
          <Store className="w-8 h-8 sm:w-10 sm:h-10 text-[#F59E0B]" />
        </div>

        <div className="space-y-2.5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#452313] text-[#FBBF24] border border-[#6B371E]">
            <Clock className="w-3.5 h-3.5" />
            <span>Kitchen Temporarily Paused</span>
          </div>

          <h1
            id="shutdown-title"
            className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-white leading-snug"
          >
            Sweet Treats Bakery
          </h1>
        </div>

        {/* Message from shutdown.message */}
        <div className="bg-[#1C0D06] border border-[#482413] rounded-2xl p-5 text-left space-y-2">
          <div className="flex items-center gap-2 text-[#FBBF24] text-xs font-semibold uppercase tracking-wider">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>Bakery Notice</span>
          </div>
          <p
            id="shutdown-desc"
            className="text-sm sm:text-base text-[#E6CEBE] leading-relaxed"
          >
            {message && message.trim().length > 0
              ? message
              : 'Our kitchen is currently closed and not accepting new orders at this moment. Please check back shortly!'}
          </p>
        </div>

        {/* Live polling auto-reconnect indicator */}
        <div className="flex items-center justify-center gap-2 text-xs text-[#BA9985]">
          <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#F59E0B]" />
          <span>Monitoring bakery status in real time. We will reopen automatically.</span>
        </div>

        {/* Inquiries via WhatsApp */}
        <div className="pt-2 border-t border-[#482413]/80 flex flex-col items-center gap-2">
          <span className="text-xs text-[#9C7A68]">Have an inquiry about an existing order?</span>
          <a
            href={`https://wa.me/${WHATSAPP_PHONE_NUMBER}?text=${encodeURIComponent(
              'Hi Choco House! I have an inquiry while the store is paused.'
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-700 hover:bg-emerald-600 text-white rounded-xl text-xs font-semibold shadow-md transition-all cursor-pointer"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Contact on WhatsApp</span>
          </a>
        </div>
      </div>
    </div>
  );
};
