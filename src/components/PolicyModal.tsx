import React from 'react';
import { PolicyType } from '../types';
import { POLICIES, PolicySection } from '../data/policies';
import { X, Shield, FileText, RotateCcw, Truck, MessageCircle, Mail } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface PolicyModalProps {
  isOpen: boolean;
  selectedPolicy: PolicyType | null;
  onClose: () => void;
  onSelectPolicy: (policy: PolicyType) => void;
}

export const PolicyModal: React.FC<PolicyModalProps> = ({
  isOpen,
  selectedPolicy,
  onClose,
  onSelectPolicy,
}) => {
  if (!isOpen || !selectedPolicy) return null;

  const currentPolicy: PolicySection = POLICIES[selectedPolicy] || POLICIES.terms;

  const policyIcons: Record<PolicyType, React.ReactNode> = {
    terms: <FileText className="w-4 h-4" />,
    privacy: <Shield className="w-4 h-4" />,
    refund: <RotateCcw className="w-4 h-4" />,
    shipping: <Truck className="w-4 h-4" />,
    contact: <MessageCircle className="w-4 h-4" />,
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 sm:p-6">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        />

        {/* Modal Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 15 }}
          className="relative w-full max-w-2xl bg-[#FAF7F2] rounded-2xl border border-[#E2D4C3] shadow-2xl overflow-hidden z-10 my-8 flex flex-col max-h-[85vh]"
        >
          {/* Header */}
          <div className="p-4 sm:p-5 bg-white border-b border-[#EBDDCF] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-[#B45309]/10 text-[#B45309] flex items-center justify-center">
                {policyIcons[selectedPolicy]}
              </div>
              <div>
                <h3 className="font-display text-lg sm:text-xl font-bold text-[#2E190F]">
                  {currentPolicy.title}
                </h3>
                <p className="text-xs text-[#7A5B4C]">{currentPolicy.subtitle}</p>
              </div>
            </div>

            <button
              id="close-policy-modal"
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-[#F2EAE0] text-[#6B4E3F] transition-colors cursor-pointer"
              aria-label="Close policy modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick tab switchers */}
          <div className="bg-[#F6EFE6] px-4 py-2 border-b border-[#EBDDCF] flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            {(Object.keys(POLICIES) as PolicyType[]).map((key) => {
              const isActive = selectedPolicy === key;
              return (
                <button
                  key={key}
                  id={`policy-tab-${key}`}
                  onClick={() => onSelectPolicy(key)}
                  className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#B45309] text-white shadow-xs'
                      : 'bg-white/80 text-[#5C3B28] hover:bg-white border border-[#E4D5C3]'
                  }`}
                >
                  {POLICIES[key].title}
                </button>
              );
            })}
          </div>

          {/* Body Content */}
          <div className="p-5 sm:p-6 overflow-y-auto text-[#3B2215] text-sm leading-relaxed space-y-4">
            {currentPolicy.content.intro && (
              <p className="font-medium text-[#2E190F]">{currentPolicy.content.intro}</p>
            )}

            {currentPolicy.content.points && currentPolicy.content.points.length > 0 && (
              <ul className="space-y-2.5 list-none pl-0">
                {currentPolicy.content.points.map((point, index) => (
                  <li key={index} className="flex items-start gap-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#B45309] mt-2 shrink-0" />
                    <span className="text-xs sm:text-sm text-[#4E3224]">{point}</span>
                  </li>
                ))}
              </ul>
            )}

            {currentPolicy.content.details && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {currentPolicy.content.details.map((detail, index) => (
                  <div
                    key={index}
                    className="p-3.5 bg-white rounded-xl border border-[#E8DACB] space-y-1"
                  >
                    <span className="text-xs font-semibold text-[#8C624D] uppercase tracking-wider block">
                      {detail.label}
                    </span>
                    {detail.href ? (
                      <a
                        href={detail.href}
                        target="_blank"
                        rel="noreferrer"
                        className="text-sm font-bold text-[#B45309] hover:underline flex items-center gap-1.5"
                      >
                        {detail.label === 'WhatsApp' ? (
                          <MessageCircle className="w-4 h-4 text-emerald-600" />
                        ) : (
                          <Mail className="w-4 h-4 text-[#B45309]" />
                        )}
                        <span>{detail.value}</span>
                      </a>
                    ) : (
                      <span className="text-sm font-bold text-[#2E190F]">{detail.value}</span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer note */}
          <div className="p-4 bg-white border-t border-[#EBDDCF] flex justify-end">
            <button
              onClick={onClose}
              className="px-5 py-2 bg-[#B45309] hover:bg-[#92400E] text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
