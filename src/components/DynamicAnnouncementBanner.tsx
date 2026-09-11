import React from 'react';
import { AnnouncementData } from '../types';
import { ArrowRight, Tag } from 'lucide-react';

interface DynamicAnnouncementBannerProps {
  announcement: AnnouncementData;
  onClick: () => void;
}

export const DynamicAnnouncementBanner: React.FC<DynamicAnnouncementBannerProps> = ({
  announcement,
  onClick,
}) => {
  return (
    <aside
      id="dynamic-announcement-banner"
      onClick={onClick}
      className="bg-gradient-to-r from-[#9A3412] via-[#B45309] to-[#78350F] text-white py-2 px-4 shadow-sm cursor-pointer hover:brightness-105 transition-all sticky top-0 z-40 border-b border-amber-900/30"
      role="banner"
      aria-label="Announcement banner"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 text-xs sm:text-sm">
        <div className="flex items-center gap-2 overflow-hidden">
          <span className="shrink-0 px-2 py-0.5 rounded-full bg-white/20 text-[10px] font-bold tracking-wider uppercase flex items-center gap-1">
            <Tag className="w-2.5 h-2.5 text-amber-200" />
            <span>Notice</span>
          </span>
          <span className="font-medium truncate text-[#FFF7ED]">
            {announcement.message}
          </span>
        </div>

        <div className="shrink-0 flex items-center gap-1.5 text-xs font-semibold text-amber-100 hover:text-white group">
          <span>{announcement.ctaLabel || 'View Offer'}</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
        </div>
      </div>
    </aside>
  );
};
