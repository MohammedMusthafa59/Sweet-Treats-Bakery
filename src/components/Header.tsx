import React from 'react';
import { ShoppingBag, Sparkles, Clock, MapPin, Search } from 'lucide-react';

interface HeaderProps {
  cartItemCount: number;
  cartTotal: number;
  onOpenCart: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  announcement?: string | null;
}

export const Header: React.FC<HeaderProps> = ({
  cartItemCount,
  cartTotal,
  onOpenCart,
  searchQuery,
  onSearchChange,
  announcement,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-[#FAF7F2]/95 backdrop-blur-md border-b border-[#EADFCF] transition-all">
      {/* Top Announcement Ribbon - plain text only, no icon prefix */}
      <div className="bg-[#5B2E1E] text-[#F9EFE6] text-xs font-medium py-1.5 px-4">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center">
            <span>{announcement || 'Freshly baked every morning with 100% pure butter & organic extracts'}</span>
          </div>
          <div className="hidden sm:flex items-center gap-4 text-[11px] text-[#D8B49C]">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" /> 8:00 AM – 9:00 PM
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3" /> Express Artisanal Delivery
            </span>
          </div>
        </div>
      </div>

      {/* Main Header Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 sm:py-4">
        <div className="flex items-center justify-between gap-3 sm:gap-6">
          {/* Logo & Brand Name */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-gradient-to-br from-[#B45309] to-[#78350F] flex items-center justify-center text-white shadow-sm ring-2 ring-[#FDE68A]/60">
              <span className="font-serif text-lg font-bold italic">ST</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-[#3B1E12]">
                  Sweet Treats
                </h1>
                <span className="hidden md:inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#F5E6D8] text-[#8C3A16] uppercase tracking-wider">
                  Bakery & Patisserie
                </span>
              </div>
              <p className="text-xs text-[#7A5B4C] hidden sm:block">
                Cakes • Cheesecakes • Biscuits • Cold Brews
              </p>
            </div>
          </div>

          {/* Search bar (Center/Right) */}
          <div className="hidden md:flex flex-1 max-w-xs lg:max-w-sm relative">
            <Search className="w-4 h-4 text-[#9C7A68] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              id="product-search-input"
              type="text"
              placeholder="Search cakes, cookies, drinks..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm bg-white/80 border border-[#E2D5C3] rounded-full placeholder-[#A38573] text-[#3B1E12] focus:outline-none focus:ring-2 focus:ring-[#B45309]/50 focus:border-[#B45309] transition-all shadow-xs"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#9C7A68] hover:text-[#3B1E12]"
              >
                Clear
              </button>
            )}
          </div>

          {/* Cart Trigger Button */}
          <div className="flex items-center gap-2">
            <button
              id="header-cart-button"
              onClick={onOpenCart}
              className="group relative flex items-center gap-2.5 px-3.5 sm:px-4 py-2 sm:py-2.5 bg-[#422013] hover:bg-[#2F150B] active:scale-95 text-white rounded-full shadow-md hover:shadow-lg transition-all cursor-pointer"
              aria-label={`View Cart with ${cartItemCount} items`}
            >
              <div className="relative">
                <ShoppingBag className="w-5 h-5 text-[#FDE68A] group-hover:scale-110 transition-transform" />
                {cartItemCount > 0 && (
                  <span className="absolute -top-2 -right-2.5 bg-[#DC2626] text-white text-[11px] font-bold h-5 min-w-[20px] px-1 rounded-full flex items-center justify-center border-2 border-[#FAF7F2] animate-pulse">
                    {cartItemCount}
                  </span>
                )}
              </div>
              <div className="text-left">
                <span className="hidden sm:inline text-xs text-[#E6C9B8] block leading-none">Basket</span>
                <span className="text-xs sm:text-sm font-semibold text-white">
                  ₹{cartTotal.toLocaleString()}
                </span>
              </div>
            </button>
          </div>
        </div>

        {/* Mobile Search input */}
        <div className="mt-2.5 md:hidden relative">
          <Search className="w-4 h-4 text-[#9C7A68] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search treats..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-white/90 border border-[#E2D5C3] rounded-full placeholder-[#A38573] text-[#3B1E12] focus:outline-none focus:ring-1 focus:ring-[#B45309]"
          />
        </div>
      </div>
    </header>
  );
};
