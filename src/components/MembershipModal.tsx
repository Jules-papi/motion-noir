import React from 'react';
import { 
  Crown, 
  Check, 
  X, 
  Coins 
} from 'lucide-react';
import { MembershipTier } from '../types';

interface MembershipModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTier: MembershipTier;
  walletBalance: number;
  onSelectTier: (tier: MembershipTier, price: number) => void;
  onOpenWallet: () => void;
}

export const MembershipModal: React.FC<MembershipModalProps> = ({
  isOpen,
  onClose,
  currentTier,
  walletBalance,
  onSelectTier,
  onOpenWallet,
}) => {
  if (!isOpen) return null;

  const tiers = [
    {
      id: 'standard' as MembershipTier,
      name: 'Admitted Member',
      price: 0,
      badge: 'Charter',
      features: [
        'Dispatches stream & personal archive',
        'Standard photographic plates & epistles',
        'Salon discussions & chapter forums',
        'Confidential member dossier profile',
      ],
      disabledFeatures: [
        'Unrestricted admission to Privé plates',
        'Complimentary invitations to chapter salons',
        'Guest registry visitation tracking',
        'Privé insignia badge',
      ],
    },
    {
      id: 'gold' as MembershipTier,
      name: 'Society Fellow',
      price: 59,
      badge: 'Elevated',
      features: [
        'All Admitted Member entitlements',
        'Direct chapter & geography search',
        'Immediate guest dossier view alerts',
        'Priority correspondence delivery',
        'Fellow insignia badge',
      ],
      disabledFeatures: [
        'Unrestricted admission to Privé plates',
        'Complimentary tickets to private salons',
      ],
    },
    {
      id: 'vip' as MembershipTier,
      name: 'Privé Patron',
      price: 99,
      badge: 'Privé Tier',
      popular: true,
      features: [
        'All Fellow and Charter privileges',
        'Unrestricted access to all Privé locked plates & motions',
        'Complimentary entry tokens to private villas & salons',
        'Incognito cloaked browsing through member registry',
        'Sealed Privé Crown Insignia on dossier',
        '24/7 dedicated concierge protocol',
      ],
      disabledFeatures: [],
    },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#0c0c0e] border border-white/[0.12] rounded-xs p-6 sm:p-8 max-w-3xl w-full space-y-6 shadow-2xl relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1 rounded-xs text-stone-400 hover:text-stone-200 border border-white/[0.06] hover:border-white/20 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="text-center space-y-2 max-w-md mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xs bg-[#161512] text-amber-200 text-[10px] font-mono uppercase tracking-[0.2em] border border-amber-600/30">
            <Crown className="w-3 h-3 text-amber-300" />
            <span>Maison Noir Society Patronage</span>
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl text-stone-100 font-medium tracking-tight">
            Elevate Your Club Patronage
          </h2>
          <p className="text-xs text-stone-400 font-sans font-light leading-relaxed">
            Gain confidential admission to curated evenings, unsealed archives, and private chapter registries.
          </p>
        </div>

        {/* Ledger Balance Bar */}
        <div className="bg-[#121215] border border-white/[0.06] p-3.5 rounded-xs flex items-center justify-between text-xs font-mono">
          <div className="flex items-center gap-2 text-stone-300">
            <Coins className="w-4 h-4 text-amber-300" />
            <span>Member Ledger Balance: <strong className="text-amber-200">{walletBalance} €</strong></span>
          </div>
          <button
            onClick={() => {
              onClose();
              onOpenWallet();
            }}
            className="text-[11px] text-amber-200 hover:text-amber-100 underline uppercase tracking-wider"
          >
            + Credit Ledger
          </button>
        </div>

        {/* Tiers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {tiers.map(t => {
            const isCurrent = currentTier === t.id;
            return (
              <div
                key={t.id}
                className={`rounded-xs p-5 border flex flex-col justify-between space-y-4 relative ${
                  t.popular
                    ? 'border-amber-600/50 bg-[#14120e]'
                    : 'border-white/[0.08] bg-[#111114]'
                }`}
              >
                {t.popular && (
                  <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-xs bg-[#1a1712] text-amber-200 border border-amber-600/40 text-[9px] font-mono uppercase tracking-widest">
                    {t.badge}
                  </span>
                )}

                <div className="space-y-3">
                  <div>
                    <h3 className="font-serif text-base text-stone-100 font-medium">
                      {t.name}
                    </h3>
                    <div className="pt-2">
                      <span className="font-serif text-2xl font-medium text-stone-100">
                        {t.price === 0 ? 'Complimentary' : `${t.price} €`}
                      </span>
                      {t.price > 0 && (
                        <span className="text-xs font-mono text-stone-400 ml-1">/ mo</span>
                      )}
                    </div>
                  </div>

                  {/* Feature checkmarks */}
                  <div className="space-y-2 pt-2 text-xs">
                    {t.features.map(f => (
                      <div key={f} className="flex items-start gap-2">
                        <Check className="w-3.5 h-3.5 text-amber-300 shrink-0 mt-0.5" />
                        <span className="text-stone-300 leading-tight font-sans font-light">
                          {f}
                        </span>
                      </div>
                    ))}
                    {t.disabledFeatures.map(df => (
                      <div key={df} className="flex items-start gap-2 opacity-30">
                        <X className="w-3.5 h-3.5 text-stone-400 shrink-0 mt-0.5" />
                        <span className="text-stone-400 line-through leading-tight font-sans font-light">
                          {df}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Select Button */}
                <button
                  onClick={() => onSelectTier(t.id, t.price)}
                  disabled={isCurrent}
                  className={`w-full py-2 px-3 rounded-xs font-serif text-xs uppercase tracking-[0.14em] transition-all ${
                    isCurrent
                      ? 'bg-[#18181c] text-stone-400 border border-white/[0.06] cursor-default'
                      : t.popular
                      ? 'bg-[#181613] hover:bg-[#221f1a] text-amber-200 border border-amber-600/50 hover:border-amber-400'
                      : 'bg-[#141417] hover:bg-[#1a1a20] text-stone-200 border border-white/[0.08]'
                  }`}
                >
                  {isCurrent ? 'Current Tier' : 'Elect Tier'}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
