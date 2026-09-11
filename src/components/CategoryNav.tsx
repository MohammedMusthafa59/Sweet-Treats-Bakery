import React from 'react';
import { Cake, Cookie, Coffee, Sparkles } from 'lucide-react';

interface CategoryNavProps {
  categories: string[];
  activeCategory: string;
  onSelectCategory: (category: string) => void;
  categoryCounts?: Record<string, number>;
}

export const CategoryNav: React.FC<CategoryNavProps> = ({
  categories,
  activeCategory,
  onSelectCategory,
  categoryCounts,
}) => {
  const getCategoryIcon = (category: string) => {
    if (category.toLowerCase().includes('biscuit') || category.toLowerCase().includes('cookie')) {
      return <Cookie className="w-3.5 h-3.5" />;
    }
    if (category.toLowerCase().includes('drink') || category.toLowerCase().includes('coffee')) {
      return <Coffee className="w-3.5 h-3.5" />;
    }
    if (category === 'All') {
      return <Sparkles className="w-3.5 h-3.5" />;
    }
    return <Cake className="w-3.5 h-3.5" />;
  };

  const allItemsCount = categoryCounts
    ? Object.values(categoryCounts).reduce((acc: number, c: number) => acc + c, 0)
    : undefined;

  return (
    <div className="sticky top-[110px] sm:top-[115px] z-20 bg-[#FAF7F2]/90 backdrop-blur-md py-3 border-b border-[#EBDDCF]/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar scroll-smooth">
          {/* All Treats Button */}
          <button
            id="cat-tab-all"
            onClick={() => onSelectCategory('All')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
              activeCategory === 'All'
                ? 'bg-[#B45309] text-white shadow-sm ring-2 ring-[#B45309]/30'
                : 'bg-white/80 text-[#5C3B28] border border-[#E5D7C5] hover:bg-[#F4ECE1] hover:border-[#D6C2AC]'
            }`}
          >
            {getCategoryIcon('All')}
            <span>All Treats</span>
            {allItemsCount !== undefined && (
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  activeCategory === 'All' ? 'bg-[#78350F] text-[#FDE68A]' : 'bg-[#EFE6DB] text-[#7C5A46]'
                }`}
              >
                {allItemsCount}
              </span>
            )}
          </button>

          {/* Individual Category Buttons */}
          {categories.map((cat) => {
            const isSelected = activeCategory === cat;
            const count = categoryCounts ? categoryCounts[cat] : undefined;

            return (
              <button
                key={cat}
                id={`cat-tab-${cat.toLowerCase().replace(/\s+/g, '-')}`}
                onClick={() => onSelectCategory(cat)}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#B45309] text-white shadow-sm ring-2 ring-[#B45309]/30'
                    : 'bg-white/80 text-[#5C3B28] border border-[#E5D7C5] hover:bg-[#F4ECE1] hover:border-[#D6C2AC]'
                }`}
              >
                {getCategoryIcon(cat)}
                <span>{cat}</span>
                {count !== undefined && (
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                      isSelected ? 'bg-[#78350F] text-[#FDE68A]' : 'bg-[#EFE6DB] text-[#7C5A46]'
                    }`}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
