import React from 'react';
import { Heart, Award, ShieldCheck, Flame } from 'lucide-react';

interface BakeryHeroProps {
  onExploreClick: () => void;
}

export const BakeryHero: React.FC<BakeryHeroProps> = ({ onExploreClick }) => {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[#F5ECE1] to-[#FAF7F2] border-b border-[#E8DCCF] py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Column Text */}
          <div className="lg:col-span-7 space-y-4 sm:space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EADBCE] text-[#7A3E1D] text-xs font-semibold">
              <Flame className="w-3.5 h-3.5 text-[#B45309]" />
              <span>Artisanal Bakery & Patisserie</span>
            </div>

            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-[#2E180E] leading-tight">
              Handcrafted cakes, golden biscuits, and sweet indulgences.
            </h2>

            <p className="text-sm sm:text-base text-[#6B4E3F] max-w-xl mx-auto lg:mx-0 leading-relaxed">
              Every creation at <strong className="text-[#3B1E12]">Sweet Treats</strong> is slow-baked with pure European butter, Belgian cocoa, farm cream, and seasonal fruits. Browse our live kitchen menu below and enjoy seamless ordering with secure Razorpay checkout or direct WhatsApp handoff.
            </p>

            <div className="pt-2 flex flex-wrap items-center justify-center lg:justify-start gap-4">
              <button
                onClick={onExploreClick}
                className="px-6 py-3 bg-[#B45309] hover:bg-[#92400E] active:scale-98 text-white text-sm font-semibold rounded-full shadow-md hover:shadow-lg transition-all cursor-pointer"
              >
                Explore Today's Treats
              </button>

              <div className="flex items-center gap-4 text-xs font-medium text-[#7C5A46]">
                <span className="flex items-center gap-1">
                  <Award className="w-4 h-4 text-[#B45309]" />
                  <span>Small-Batch Craft</span>
                </span>
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-4 h-4 text-[#B45309]" />
                  <span>Eggless Options</span>
                </span>
                <span className="flex items-center gap-1">
                  <Heart className="w-4 h-4 text-[#B45309]" />
                  <span>Zero Preservatives</span>
                </span>
              </div>
            </div>
          </div>

          {/* Right Column Visual Collage */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-sm sm:max-w-md">
              {/* Background ambient shape */}
              <div className="absolute inset-0 bg-[#E8DACB] rounded-3xl -rotate-2 transform scale-95 opacity-80" />

              {/* Main Featured Image Card */}
              <div className="relative bg-white p-3 sm:p-4 rounded-3xl shadow-xl border border-[#E5D7C7] rotate-1">
                <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-[#F5EFEB]">
                  <img
                    src="https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=900&q=80"
                    alt="Artisanal Chocolate Truffle Cake"
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="pt-3 flex items-center justify-between">
                  <div>
                    <h4 className="font-display text-sm sm:text-base font-bold text-[#2E180E]">
                      Signature Dark Truffle
                    </h4>
                    <p className="text-[11px] text-[#7A5B4C]">Rich 70% dark ganache sponge</p>
                  </div>
                  <span className="px-2.5 py-1 bg-[#FAF4ED] text-[#9A3412] font-bold text-xs rounded-full border border-[#E8D7C5]">
                    Chef's Pick
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
