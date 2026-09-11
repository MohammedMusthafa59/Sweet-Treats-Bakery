import React from 'react';
import { CartItem } from '../types';
import { getProductImage } from '../data/fallbackImages';
import { X, Trash2, Plus, Minus, ArrowRight, ShoppingBag, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (productName: string, delta: number) => void;
  onRemoveItem: (productName: string) => void;
  onClearCart: () => void;
  onProceedToCheckout: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onProceedToCheckout,
}) => {
  const totalAmount = items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );
  const totalItemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
          />

          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 280 }}
              className="w-screen max-w-md bg-[#FAF7F2] border-l border-[#E5D7C7] shadow-2xl flex flex-col"
            >
              {/* Drawer Header */}
              <div className="p-4 sm:p-5 bg-white border-b border-[#EBDDCF] flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-[#B45309]/10 flex items-center justify-center text-[#B45309]">
                    <ShoppingBag className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="font-display text-lg sm:text-xl font-bold text-[#2E190F]">
                      Your Bakery Basket
                    </h2>
                    <p className="text-xs text-[#7A5B4C]">
                      {totalItemCount} {totalItemCount === 1 ? 'item' : 'items'} selected
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  {items.length > 0 && (
                    <button
                      onClick={onClearCart}
                      className="text-xs text-[#9C7058] hover:text-[#DC2626] px-2 py-1 rounded-md transition-colors cursor-pointer"
                    >
                      Clear
                    </button>
                  )}
                  <button
                    id="close-cart-button"
                    onClick={onClose}
                    className="p-1.5 rounded-full hover:bg-[#F2EAE0] text-[#5C3F32] transition-colors cursor-pointer"
                    aria-label="Close cart"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Drawer Body - Items List */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-5 divide-y divide-[#EFE7DC]">
                {items.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-6">
                    <div className="w-16 h-16 rounded-full bg-[#EFE5D8] flex items-center justify-center text-[#9C7A68] mb-3">
                      <ShoppingBag className="w-8 h-8 stroke-1" />
                    </div>
                    <h3 className="font-display text-lg font-semibold text-[#3B2215] mb-1">
                      Your basket is currently empty
                    </h3>
                    <p className="text-xs text-[#7C6152] max-w-xs mb-5">
                      Explore our handcrafted chocolate cakes, cheesecakes, biscuits, and chilled beverages.
                    </p>
                    <button
                      onClick={onClose}
                      className="px-4 py-2 bg-[#B45309] hover:bg-[#92400E] text-white text-xs font-semibold rounded-full shadow-xs transition-colors cursor-pointer"
                    >
                      Browse Bakery Menu
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {items.map((item) => {
                      const itemSubtotal = item.product.price * item.quantity;
                      const image = getProductImage(item.product.name, undefined, item.product.imageUrl);

                      return (
                        <div
                          key={item.product.name}
                          className="pt-3 first:pt-0 flex gap-3.5 items-start"
                        >
                          <img
                            src={image}
                            alt={item.product.name}
                            className="w-16 h-16 rounded-xl object-cover border border-[#E8DACB] shrink-0 bg-[#F5EFEB]"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-1">
                              <h4 className="text-sm font-semibold text-[#2E190F] truncate">
                                {item.product.name}
                              </h4>
                              <button
                                onClick={() => onRemoveItem(item.product.name)}
                                className="text-[#A88876] hover:text-[#DC2626] p-1 transition-colors cursor-pointer"
                                aria-label={`Remove ${item.product.name}`}
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            <p className="text-xs text-[#7E6354] mb-2">
                              ₹{item.product.price} each
                            </p>

                            <div className="flex items-center justify-between">
                              {/* Quantity Adjuster */}
                              <div className="flex items-center border border-[#E5D7C7] rounded-lg bg-white p-0.5 shadow-2xs">
                                <button
                                  onClick={() => onUpdateQuantity(item.product.name, -1)}
                                  className="w-6 h-6 flex items-center justify-center text-[#735A4C] hover:bg-[#F2EAE0] rounded transition-colors cursor-pointer"
                                  aria-label="Decrease quantity"
                                >
                                  <Minus className="w-3 h-3" />
                                </button>
                                <span className="w-6 text-center text-xs font-semibold text-[#2F180E]">
                                  {item.quantity}
                                </span>
                                <button
                                  onClick={() => onUpdateQuantity(item.product.name, 1)}
                                  className="w-6 h-6 flex items-center justify-center text-[#735A4C] hover:bg-[#F2EAE0] rounded transition-colors cursor-pointer"
                                  aria-label="Increase quantity"
                                >
                                  <Plus className="w-3 h-3" />
                                </button>
                              </div>

                              {/* Item Subtotal */}
                              <span className="text-sm font-bold text-[#9A3412]">
                                ₹{itemSubtotal.toLocaleString()}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Drawer Footer - Price Breakdown & Checkout */}
              {items.length > 0 && (
                <div className="p-4 sm:p-5 bg-white border-t border-[#EBDDCF] space-y-3">
                  <div className="space-y-1.5 text-xs text-[#6B4E3F]">
                    <div className="flex justify-between">
                      <span>Items Subtotal</span>
                      <span className="font-semibold text-[#2E190F]">₹{totalAmount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center text-[#15803D]">
                      <span className="flex items-center gap-1">
                        <Sparkles className="w-3 h-3" /> Bakery Box Packaging
                      </span>
                      <span className="font-semibold">Complimentary</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-[#F2E8DC] flex justify-between items-baseline">
                    <span className="font-display text-base font-bold text-[#2E190F]">Total Amount</span>
                    <span className="font-sans text-xl font-extrabold text-[#9A3412]">
                      ₹{totalAmount.toLocaleString()}
                    </span>
                  </div>

                  <button
                    id="cart-checkout-button"
                    onClick={onProceedToCheckout}
                    className="w-full py-3 px-4 bg-[#B45309] hover:bg-[#92400E] active:scale-98 text-white text-sm font-bold rounded-xl shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <span>Proceed to Checkout</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <p className="text-[11px] text-center text-[#8C6F5E]">
                    Direct kitchen order confirmation via WhatsApp
                  </p>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
};
