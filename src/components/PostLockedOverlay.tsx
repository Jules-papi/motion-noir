import React from 'react';
import { KeyRound, Crown, Coins, ShieldCheck } from 'lucide-react';
import { Post } from '../types';
import { SECURE_LOCKED_BLUR_PLACEHOLDER } from '../utils/mediaSecurity';

interface PostLockedOverlayProps {
  post: Post;
  walletBalance: number;
  onSubscribeClick: () => void;
  onUnlockPPV: (post: Post) => void;
}

export const PostLockedOverlay: React.FC<PostLockedOverlayProps> = ({
  post,
  walletBalance,
  onSubscribeClick,
  onUnlockPPV,
}) => {
  return (
    <div className="relative mx-4 sm:mx-5 mb-4 rounded-xs overflow-hidden bg-[#09090b] border border-white/[0.08] min-h-[360px] flex items-center justify-center group">
      {/* Blurred Background Preview - Secure Generic Silhouette Placeholder (inspect-safe) */}
      <img 
        src={SECURE_LOCKED_BLUR_PLACEHOLDER} 
        alt="Confidential plate preview" 
        className="absolute inset-0 w-full h-full object-cover filter blur-3xl scale-110 opacity-45 select-none pointer-events-none"
      />
      
      <div className="absolute inset-0 bg-gradient-to-t from-[#09090b] via-[#09090b]/85 to-[#09090b]/50" />

      {/* Locked Overlay Content */}
      <div className="relative z-10 max-w-sm p-6 text-center text-stone-200 flex flex-col items-center">
        {post.isPPV ? (
          <>
            <div className="w-12 h-12 rounded-xs bg-[#161512] border border-amber-600/40 flex items-center justify-center mb-4 text-amber-200 shadow-lg">
              <KeyRound className="w-5 h-5 stroke-[1.5]" />
            </div>
            <span className="text-[10px] font-mono tracking-[0.22em] uppercase text-amber-300/90 mb-1">
              Confidential Plate
            </span>
            <h3 className="font-serif text-lg text-stone-100 font-medium tracking-tight mb-2">
              Unlock Vault Media
            </h3>
            <p className="text-xs text-stone-400 mb-5 leading-relaxed font-sans font-light">
              Single-key entry to the creator's private monograph plate. Recorded securely to your member ledger.
            </p>

            {post.exclusivePerks && (
              <div className="w-full bg-[#121215] border border-white/[0.06] rounded-xs p-3 mb-5 text-left text-xs space-y-1.5">
                {post.exclusivePerks.map((perk, i) => (
                  <div key={i} className="flex items-center gap-2 text-stone-300 text-[11px] font-sans">
                    <ShieldCheck className="w-3.5 h-3.5 text-amber-400/80 shrink-0" />
                    <span>{perk}</span>
                  </div>
                ))}
              </div>
            )}

            <button
              onClick={() => onUnlockPPV(post)}
              className="w-full py-2.5 px-5 rounded-xs font-serif text-xs tracking-[0.16em] uppercase bg-[#181613] hover:bg-[#221f1a] text-amber-200 border border-amber-600/40 hover:border-amber-400 transition-all flex items-center justify-center gap-2"
            >
              <KeyRound className="w-3.5 h-3.5 text-amber-300" />
              <span>Unlock for {post.unlockPrice} €</span>
            </button>
            <span className="text-[10px] font-mono text-stone-400 mt-2.5">
              Ledger Balance: <strong className="text-stone-200">{walletBalance} €</strong>
            </span>
          </>
        ) : (
          <>
            <div className="w-12 h-12 rounded-xs bg-[#161512] border border-amber-600/40 flex items-center justify-center mb-4 text-amber-200 shadow-lg">
              <Crown className="w-5 h-5 stroke-[1.5]" />
            </div>
            <span className="text-[10px] font-mono tracking-[0.22em] uppercase text-amber-300/90 mb-1">
              Privé Salon
            </span>
            <h3 className="font-serif text-lg text-stone-100 font-medium tracking-tight mb-2">
              Patron Circle Privileges
            </h3>
            <p className="text-xs text-stone-400 mb-5 leading-relaxed font-sans font-light">
              This dispatch is reserved for active salon patrons. Patronage grants unrestricted access to confidential archives.
            </p>

            <button
              onClick={onSubscribeClick}
              className="w-full py-2.5 px-5 rounded-xs font-serif text-xs tracking-[0.16em] uppercase bg-[#181613] hover:bg-[#221f1a] text-amber-200 border border-amber-600/40 hover:border-amber-400 transition-all flex items-center justify-center gap-2"
            >
              <Crown className="w-3.5 h-3.5 text-amber-300" />
              <span>Subscribe for 99 € / mo</span>
            </button>
          </>
        )}
      </div>
    </div>
  );
};
