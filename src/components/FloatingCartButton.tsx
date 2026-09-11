import React from 'react';
import { ShoppingBag, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';

interface FloatingCartButtonProps {
  itemCount: number;
  totalAmount: number;
  onClick: () => void;
}

export const FloatingCartButton: React.FC<FloatingCartButtonProps> = ({
  itemCount,
  totalAmount,
  onClick,
}) => {
  if (itemCount === 0) return null;

  return (
    <motion.aside
      aria-label="Floating cart shortcut"
      initial={{ y: 50, opacity: 0, scale: 0.9 }}
      animate={{ y: 0, opacity: 1, scale: 1 }}
      exit={{ y: 50, opacity: 0, scale: 0.9 }}
      className="fixed bottom-5 sm:bottom-6 right-4 sm:right-6 z-40"
    >
      <button
        id="floating-cart-btn"
        onClick={onClick}
        className="flex items-center gap-3 px-4 sm:px-5 py-3.5 bg-[#3D1D11] hover:bg-[#2A130A] active:scale-95 text-white rounded-full shadow-2xl hover:shadow-3xl ring-2 ring-[#F59E0B]/50 transition-all cursor-pointer group"
      >
        <div className="relative">
          <ShoppingBag className="w-5 h-5 text-[#FDE68A] group-hover:rotate-6 transition-transform" />
          <span className="absolute -top-2.5 -right-2.5 bg-[#DC2626] text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center ring-2 ring-[#3D1D11]">
            {itemCount}
          </span>
        </div>

        <div className="text-left pr-1">
          <div className="text-[10px] text-[#D8B49C] uppercase tracking-wider font-semibold leading-none">
            View Basket
          </div>
          <div className="text-sm font-extrabold text-white leading-tight">
            ₹{totalAmount.toLocaleString()}
          </div>
        </div>

        <div className="w-7 h-7 rounded-full bg-white/15 flex items-center justify-center group-hover:translate-x-0.5 transition-transform">
          <ArrowRight className="w-4 h-4 text-white" />
        </div>
      </button>
    </motion.aside>
  );
};
