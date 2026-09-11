import React from 'react';
import { Heart, Award, ShieldCheck, Flame } from 'lucide-react';

interface BakeryHeroProps {
  onExploreClick: () => void;
}

export const BakeryHero: React.FC<BakeryHeroProps> = ({ onExploreClick }) => {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[#F5ECE1] to-[#FAF7F2] border-b border-[#E8DCCF] py-10 sm:py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#EADBCE] text-[#7A3E1D] text-xs font-semibold">
          <Flame className="w-3.5 h-3.5 text-[#B45309]" />
          <span>Artisanal Bakery & Patisserie</span>
        </div>

        <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-[#2E180E] leading-tight">
          Handcrafted cakes, golden biscuits, and sweet indulgences.
        </h2>

        <p className="text-sm sm:text-base md:text-lg text-[#6B4E3F] max-w-2xl mx-auto leading-relaxed">
          Every creation at <strong className="text-[#3B1E12]">Sweet Treats</strong> is slow-baked with pure European butter, Belgian cocoa, farm cream, and seasonal fruits. Browse our live kitchen menu below and enjoy seamless ordering with secure Razorpay checkout or direct WhatsApp handoff.
        </p>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            id="hero-explore-treats-btn"
            onClick={onExploreClick}
            className="w-full sm:w-auto px-8 py-3.5 bg-[#B45309] hover:bg-[#92400E] active:scale-98 text-white text-sm font-semibold rounded-full shadow-md hover:shadow-lg transition-all cursor-pointer"
          >
            Explore Today's Treats
          </button>
        </div>

        <div className="pt-2 flex flex-wrap items-center justify-center gap-6 text-xs sm:text-sm font-medium text-[#7C5A46]">
          <span className="flex items-center gap-1.5">
            <Award className="w-4 h-4 text-[#B45309]" />
            <span>Small-Batch Craft</span>
          </span>
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-[#B45309]" />
            <span>Eggless Options</span>
          </span>
          <span className="flex items-center gap-1.5">
            <Heart className="w-4 h-4 text-[#B45309]" />
            <span>Zero Preservatives</span>
          </span>
        </div>
      </div>
    </section>
  );
};
