import React, { useState, useEffect } from 'react';
import {
  Eye,
  Ghost,
  Crown,
  X,
  Lock,
  CheckCircle2
} from 'lucide-react';
import { ProfileVisitor, UserProfile } from '../types';

interface VisitorsModalProps {
  isOpen: boolean;
  onClose: () => void;
  visitors: ProfileVisitor[];
  currentUser: UserProfile;
  onUpgradeToVip: () => void;
}

export const VisitorsModal: React.FC<VisitorsModalProps> = ({
  isOpen,
  onClose,
  visitors,
  currentUser,
  onUpgradeToVip,
}) => {
  const [isGhostModeActive, setIsGhostModeActive] = useState<boolean>(false);
  const isVip = currentUser.membershipTier === 'vip' || currentUser.membershipTier === 'gold';

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-60 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-[#09090B] border border-white/[0.12] rounded-2xl max-w-md w-full p-6 shadow-2xl relative max-h-[90vh] flex flex-col text-zinc-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-full bg-[#1A1A1E] border border-[#C5A880]/30 text-[#C5A880]">
              <Eye className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase tracking-[0.16em] text-[#C5A880] block">
                Discretion Log · 24H Audit
              </span>
              <h3 className="text-base font-serif text-white">
                Dossier Observers & Inquiries
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-white rounded-full bg-white/5 border border-white/10 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Ghost Mode Toggle Banner */}
        <div className="my-4 p-3.5 rounded-xl bg-[#111113] border border-white/[0.08] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg transition-colors ${
              isGhostModeActive
                ? 'bg-[#C5A880] text-black font-semibold'
                : 'bg-white/5 text-zinc-400 border border-white/10'
            }`}>
              <Ghost className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-serif text-white flex items-center gap-2">
                <span>Incognito Discretion Protocol</span>
                {isGhostModeActive && (
                  <span className="text-[9px] px-2 py-0.5 rounded-full bg-[#C5A880]/20 text-[#C5A880] font-mono border border-[#C5A880]/30">
                    Active
                  </span>
                )}
              </div>
              <p className="text-[11px] text-zinc-400 font-sans">
                Browse peer dossiers without leaving footprint markers.
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsGhostModeActive(prev => !prev)}
            className={`w-11 h-6 rounded-full transition-colors relative flex items-center px-0.5 cursor-pointer ${
              isGhostModeActive ? 'bg-[#C5A880]' : 'bg-white/10 border border-white/10'
            }`}
          >
            <div className={`w-5 h-5 rounded-full bg-black transition-transform ${
              isGhostModeActive ? 'translate-x-5' : 'translate-x-0'
            }`} />
          </button>
        </div>

        {/* Visitors List */}
        <div className="flex-1 overflow-y-auto space-y-2.5 my-1 pr-1">
          {visitors.map((item, idx) => {
            const shouldBlur = !isVip && idx > 0;

            return (
              <div
                key={item.id}
                className="p-3 rounded-xl bg-[#111113] border border-white/[0.06] flex items-center justify-between relative overflow-hidden"
              >
                <div className={`flex items-center gap-3 ${shouldBlur ? 'blur-xs select-none' : ''}`}>
                  <img
                    src={item.visitor.avatar}
                    alt={item.visitor.name}
                    className="w-10 h-10 rounded-full object-cover border border-white/10"
                  />
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-serif text-white">
                        {item.visitor.name}
                      </span>
                      {item.visitor.isVerified && (
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#C5A880]" />
                      )}
                      {item.visitor.membershipTier === 'vip' && (
                        <Crown className="w-3.5 h-3.5 text-[#C5A880] fill-[#C5A880]" />
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-zinc-400 font-mono">
                      <span>@{item.visitor.username}</span>
                      <span>•</span>
                      <span>{item.visitor.city}</span>
                    </div>
                  </div>
                </div>

                {shouldBlur ? (
                  <div className="absolute inset-0 bg-[#09090B]/80 backdrop-blur-xs flex items-center justify-center">
                    <button
                      onClick={onUpgradeToVip}
                      className="px-3 py-1.5 rounded-full text-[10px] font-serif uppercase tracking-[0.14em] bg-[#1A1A1E] text-[#C5A880] border border-[#C5A880]/40 flex items-center gap-1.5 hover:bg-[#1A1A1E] transition-colors cursor-pointer"
                    >
                      <Lock className="w-3 h-3 text-[#C5A880]" />
                      <span>Unseal with High Patron</span>
                    </button>
                  </div>
                ) : (
                  <span className="text-[10px] font-mono text-zinc-400 shrink-0">
                    {item.visitedAt}
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer upgrade note if not VIP */}
        {!isVip && (
          <div className="mt-3 p-3.5 rounded-xl bg-[#1A1A1E] border border-[#C5A880]/30 flex items-center justify-between">
            <div className="text-xs">
              <span className="font-serif text-[#C5A880] block">Unrestricted Dossier Ledger</span>
              <p className="text-[10px] text-zinc-400 font-sans">
                Patrons of High Standing maintain real-time unsealed registry insight.
              </p>
            </div>
            <button
              onClick={onUpgradeToVip}
              className="px-3.5 py-1.5 rounded-full bg-[#C5A880] hover:bg-[#B89B6E] text-black text-xs font-serif uppercase tracking-[0.12em] font-semibold shrink-0 transition-colors cursor-pointer"
            >
              Elevate
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
