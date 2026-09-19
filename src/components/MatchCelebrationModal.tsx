import React from 'react';
import { MessageSquare, X } from 'lucide-react';
import { DiscoveryProfile, UserProfile } from '../types';

interface MatchCelebrationModalProps {
  matchedProfile: DiscoveryProfile;
  currentUser: UserProfile;
  onClose: () => void;
  onStartChat: (profile: DiscoveryProfile) => void;
}

export const MatchCelebrationModal: React.FC<MatchCelebrationModalProps> = ({
  matchedProfile,
  currentUser,
  onClose,
  onStartChat,
}) => {
  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-[#0c0c0e] border border-amber-600/30 rounded-xs p-6 sm:p-8 max-w-sm w-full text-center space-y-6 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-xs text-stone-400 hover:text-stone-200 border border-white/[0.06] hover:border-white/20 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xs bg-[#161512] border border-amber-600/30 text-amber-200 text-[10px] font-mono uppercase tracking-[0.2em]">
          <span>Reciprocal Circle Accord</span>
        </div>

        <h3 className="font-serif text-2xl text-stone-100 font-medium tracking-tight">
          Mutual Affinity Established
        </h3>

        {/* Dual Portraits with Gold Seal */}
        <div className="flex items-center justify-center gap-3 relative py-2">
          <div className="relative">
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="w-20 h-24 rounded-xs object-cover border border-white/20 shadow-xl"
            />
            <span className="absolute bottom-1 left-1/2 -translate-x-1/2 text-[9px] font-mono tracking-wider bg-black/80 px-1.5 py-0.5 rounded-xs text-stone-300 uppercase">
              You
            </span>
          </div>

          <div className="w-8 h-8 rounded-xs bg-[#181613] border border-amber-600/40 text-amber-200 flex items-center justify-center shadow-lg font-serif text-xs">
            ❦
          </div>

          <div className="relative">
            <img
              src={matchedProfile.avatar}
              alt={matchedProfile.name}
              className="w-20 h-24 rounded-xs object-cover border border-white/20 shadow-xl"
            />
            <span className="absolute bottom-1 left-1/2 -translate-x-1/2 text-[9px] font-mono tracking-wider bg-black/80 px-1.5 py-0.5 rounded-xs text-stone-300 uppercase truncate max-w-[70px]">
              {matchedProfile.name.split(' ')[0]}
            </span>
          </div>
        </div>

        <p className="text-xs text-stone-300 font-sans font-light leading-relaxed px-2">
          Both dossiers have reciprocated mutual appreciation. Direct salon correspondence is now unsealed.
        </p>

        <div className="space-y-2.5 pt-2">
          <button
            onClick={() => {
              onStartChat(matchedProfile);
              onClose();
            }}
            className="w-full py-2.5 rounded-xs font-serif text-xs uppercase tracking-[0.14em] bg-[#161512] hover:bg-[#201d18] text-amber-200 border border-amber-600/40 hover:border-amber-400 transition-all flex items-center justify-center gap-2"
          >
            <MessageSquare className="w-3.5 h-3.5 text-amber-300" />
            <span>Open Direct Correspondence</span>
          </button>

          <button
            onClick={onClose}
            className="w-full py-2 rounded-xs font-mono text-[11px] uppercase tracking-wider text-stone-400 hover:text-stone-200 transition-colors"
          >
            Return to Dossiers
          </button>
        </div>
      </div>
    </div>
  );
};
