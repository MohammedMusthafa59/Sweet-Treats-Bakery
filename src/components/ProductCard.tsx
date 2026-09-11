import React, { useState } from 'react';
import { Product } from '../types';
import { getProductImage } from '../data/fallbackImages';
import { Plus, Minus, ShoppingBag, Check } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  category: string;
  onAddToCart: (product: Product, quantity: number) => void;
  isHighlighted?: boolean;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  category,
  onAddToCart,
  isHighlighted = false,
}) => {
  const [quantity, setQuantity] = useState<number>(1);
  const [justAdded, setJustAdded] = useState<boolean>(false);
  const [imageSrc, setImageSrc] = useState<string>(() =>
    getProductImage(product.name, category, product.imageUrl)
  );

  const handleDecrease = () => {
    setQuantity((prev) => (prev > 1 ? prev - 1 : 1));
  };

  const handleIncrease = () => {
    setQuantity((prev) => prev + 1);
  };

  const handleAdd = () => {
    onAddToCart(product, quantity);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1400);
  };

  const handleImageError = () => {
    const fallback = getProductImage(product.name, category);
    if (imageSrc !== fallback) {
      setImageSrc(fallback);
    }
  };

  return (
    <div
      id={`product-${product.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}
      data-product-name={product.name}
      className={`group bg-white rounded-2xl border ${
        isHighlighted
          ? 'border-[#B45309] ring-4 ring-[#B45309]/40 shadow-xl scale-[1.02]'
          : 'border-[#ECE2D5] hover:border-[#DFCBB5] shadow-xs hover:shadow-md'
      } transition-all duration-300 flex flex-col overflow-hidden`}
    >
      {/* Product Image Area */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#F5EFEB]">
        <img
          src={imageSrc}
          alt={product.name}
          onError={handleImageError}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

        {/* Category Pill */}
        <span className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#FAF7F2]/90 backdrop-blur-xs text-[#7A3E1D] border border-[#E8DACB] shadow-2xs">
          {category}
        </span>

        {/* Offer Badge if onOffer */}
        {product.onOffer && (
          <span className="absolute top-2.5 right-2.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#DC2626] text-white shadow-xs tracking-wider uppercase">
            Offer
          </span>
        )}
      </div>

      {/* Card Content Area */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-baseline justify-between gap-2 mb-1">
            <h3 className="font-display text-base sm:text-lg font-semibold text-[#2F180E] group-hover:text-[#9A3412] transition-colors line-clamp-1">
              {product.name}
            </h3>
            <div className="flex items-baseline gap-1.5 whitespace-nowrap">
              {((product.onOffer && product.originalPrice !== undefined) ||
                (product.originalPrice !== undefined && product.originalPrice > product.price)) && (
                <span className="text-xs text-[#9C7F6E] line-through">
                  ₹{product.originalPrice}
                </span>
              )}
              <span className="font-sans font-bold text-base sm:text-lg text-[#9A3412]">
                ₹{product.price}
              </span>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-[#735A4C] line-clamp-2 leading-relaxed mb-4">
            {product.description}
          </p>
        </div>

        {/* Quantity Selector & Add to Cart Controls */}
        <div className="pt-3 border-t border-[#F2EAE0] flex items-center gap-2 sm:gap-3">
          {/* Quantity Selector */}
          <div className="flex items-center border border-[#E5D7C7] rounded-xl bg-[#FAF7F2] p-0.5">
            <button
              type="button"
              onClick={handleDecrease}
              aria-label="Decrease quantity"
              className="w-7 h-7 flex items-center justify-center text-[#735A4C] hover:text-[#2F180E] hover:bg-[#EDE3D6] rounded-lg transition-colors cursor-pointer"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <span className="w-7 text-center text-xs font-semibold text-[#2F180E]">
              {quantity}
            </span>
            <button
              type="button"
              onClick={handleIncrease}
              aria-label="Increase quantity"
              className="w-7 h-7 flex items-center justify-center text-[#735A4C] hover:text-[#2F180E] hover:bg-[#EDE3D6] rounded-lg transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Add to Cart Button */}
          <button
            type="button"
            onClick={handleAdd}
            className={`flex-1 py-2 px-3 rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-center gap-1.5 transition-all duration-200 cursor-pointer ${
              justAdded
                ? 'bg-[#15803D] text-white'
                : 'bg-[#B45309] hover:bg-[#92400E] active:scale-98 text-white shadow-xs'
            }`}
          >
            {justAdded ? (
              <>
                <Check className="w-4 h-4 animate-bounce" />
                <span>Added!</span>
              </>
            ) : (
              <>
                <ShoppingBag className="w-4 h-4 text-[#FDE68A]" />
                <span>Add to Cart</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
