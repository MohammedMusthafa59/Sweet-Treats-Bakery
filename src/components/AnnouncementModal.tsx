import React from 'react';
import { AnnouncementData } from '../types';
import { X, Sparkles, ArrowRight, Tag } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface AnnouncementModalProps {
  isOpen: boolean;
  announcement: AnnouncementData | null;
  onClose: () => void;
  onCtaClick: () => void;
}

export const AnnouncementModal: React.FC<AnnouncementModalProps> = ({
  isOpen,
  announcement,
  onClose,
  onCtaClick,
}) => {
  if (!isOpen || !announcement) return null;

  const ctaLabel = announcement.ctaLabel && announcement.ctaLabel.trim()
    ? announcement.ctaLabel
    : 'Explore Treats';

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 sm:p-6">
        {/* Backdrop - clicking closes modal without clicking CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        />

        {/* Modal Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 15 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative w-full max-w-md bg-[#FAF7F2] rounded-3xl border border-[#E2D4C3] shadow-2xl overflow-hidden z-10 my-8"
        >
          {/* Close Button (top-right X) */}
          <button
            id="announcement-modal-close-btn"
            onClick={onClose}
            aria-label="Close announcement"
            className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-white/70 hover:bg-white text-[#7A4B3A] hover:text-[#2E180E] flex items-center justify-center shadow-xs border border-[#E8DCCD] transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Header Banner */}
          <div className="bg-gradient-to-br from-[#8C3A16] via-[#B45309] to-[#D97706] text-white p-6 sm:p-7 text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 -mr-6 -mt-6 w-24 h-24 bg-white/10 rounded-full blur-lg" />
            <div className="absolute bottom-0 left-0 -ml-6 -mb-6 w-24 h-24 bg-amber-400/15 rounded-full blur-lg" />

            <div className="w-12 h-12 bg-white/20 ring-4 ring-white/30 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-inner">
              <Sparkles className="w-6 h-6 text-[#FDE68A]" />
            </div>

            <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-semibold bg-white/20 text-white mb-2">
              <Tag className="w-3 h-3 text-amber-200" />
              <span>Special Announcement</span>
            </span>

            <h3 className="font-display text-xl sm:text-2xl font-bold tracking-tight text-white leading-snug">
              Sweet Treats Update
            </h3>
          </div>

          {/* Body Content */}
          <div className="p-6 space-y-6 text-center">
            <div className="bg-white rounded-2xl p-5 border border-[#ECE0D2] shadow-2xs">
              <p className="text-[#3B1E12] font-medium text-base sm:text-lg leading-relaxed">
                {announcement.message}
              </p>
            </div>

            {/* CTA Button */}
            <div className="space-y-3">
              <button
                id="announcement-cta-btn"
                onClick={onCtaClick}
                className="w-full py-3.5 px-6 bg-[#B45309] hover:bg-[#92400E] active:scale-98 text-white font-semibold rounded-2xl text-sm transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer group"
              >
                <span>{ctaLabel}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </button>

              <button
                id="announcement-secondary-dismiss-btn"
                onClick={onClose}
                className="text-xs text-[#8C6F5E] hover:text-[#3B1E12] transition-colors py-1 cursor-pointer"
              >
                Dismiss to browse freely
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
