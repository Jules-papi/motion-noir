import React, { useState, useEffect } from 'react';
import { Post } from '../types';
import {
  X,
  Heart,
  MessageCircle,
  Bookmark,
  Crown,
  Lock,
  Coins,
  Check,
  KeyRound
} from 'lucide-react';
import { SECURE_LOCKED_BLUR_PLACEHOLDER } from '../utils/mediaSecurity';

interface MediaModalProps {
  post: Post | null;
  isOpen: boolean;
  onClose: () => void;
  isUserSubscribed: boolean;
  walletBalance: number;
  onLike: (postId: string) => void;
  onSave: (postId: string) => void;
  onSubscribeClick: () => void;
  onUnlockPPV: (post: Post) => void;
}

export const MediaModal: React.FC<MediaModalProps> = ({
  post,
  isOpen,
  onClose,
  isUserSubscribed,
  walletBalance,
  onLike,
  onSave,
  onSubscribeClick,
  onUnlockPPV,
}) => {
  const [touchStartY, setTouchStartY] = useState<number | null>(null);
  const [translateY, setTranslateY] = useState<number>(0);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !post) return null;

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartY(e.touches[0].clientY);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartY === null) return;
    const diff = e.touches[0].clientY - touchStartY;
    if (diff > 0) {
      setTranslateY(diff);
    }
  };

  const handleTouchEnd = () => {
    if (translateY > 110) {
      onClose();
    }
    setTranslateY(0);
    setTouchStartY(null);
  };

  const isSubscriptionLocked = false;
  const isPPVLocked = false;
  const isLocked = false;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-2 sm:p-6 overflow-hidden transition-all duration-200 cursor-pointer"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{
        transform: translateY > 0 ? `translateY(${translateY}px)` : undefined,
        opacity: translateY > 0 ? Math.max(0.3, 1 - translateY / 300) : 1,
      }}
    >
      {/* Swipe to close indicator on mobile */}
      <div className="absolute top-2 left-1/2 -translate-x-1/2 sm:hidden flex flex-col items-center text-white/50 pointer-events-none">
        <div className="w-10 h-1 bg-white/40 rounded-full mb-1" />
        <span className="text-[10px] tracking-wider uppercase font-mono">Swipe down to dismiss</span>
      </div>

      {/* Close Button */}
      <button
        onClick={onClose}
        aria-label="Close"
        className="absolute top-4 right-4 z-50 text-white/80 hover:text-white bg-black/60 hover:bg-black p-2 rounded-full border border-white/10 transition-colors cursor-pointer"
      >
        <X className="w-5 h-5" />
      </button>

      <div
        onClick={e => e.stopPropagation()}
        className="bg-[#09090B] border border-white/[0.12] rounded-2xl w-full max-w-5xl h-[85vh] max-h-[800px] flex flex-col md:flex-row overflow-hidden shadow-2xl cursor-default"
      >
        {/* Media Left Section */}
        <div className="relative flex-1 bg-black flex items-center justify-center overflow-hidden min-h-[300px]">
          {isLocked ? (
            /* Secure Locked View - DevTools Inspect safe */
            <div className="relative w-full h-full flex items-center justify-center p-6 text-center select-none">
              <img
                src={SECURE_LOCKED_BLUR_PLACEHOLDER}
                alt="Confidential plate preview"
                className="absolute inset-0 w-full h-full object-cover filter blur-3xl scale-110 opacity-40 select-none pointer-events-none"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#09090B] via-[#09090B]/85 to-[#09090B]/60" />
              <div className="relative z-10 max-w-sm flex flex-col items-center p-6 text-center">
                {post.isPPV ? (
                  <>
                    <div className="w-14 h-14 rounded-full bg-[#1A1A1E] border border-[#C5A880]/40 flex items-center justify-center text-[#C5A880] mb-3 shadow-xl">
                      <KeyRound className="w-6 h-6 stroke-[1.5]" />
                    </div>
                    <span className="text-[10px] font-mono tracking-[0.2em] uppercase text-[#C5A880] mb-1">
                      Confidential Monograph
                    </span>
                    <h3 className="font-serif text-lg text-white font-medium mb-1.5">
                      Unseal Vault Media
                    </h3>
                    <p className="text-xs text-zinc-400 mb-5 font-sans leading-relaxed">
                      Single-access entry to this confidential archive plate. Recorded to your private member ledger.
                    </p>
                    <button
                      onClick={() => onUnlockPPV(post)}
                      className="w-full py-2.5 px-6 rounded-full font-serif text-xs uppercase tracking-[0.14em] bg-[#1A1A1E] hover:bg-[#1A1A1E] text-[#C5A880] border border-[#C5A880]/40 hover:border-[#C5A880] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg"
                    >
                      <KeyRound className="w-3.5 h-3.5" />
                      <span>Unseal for {post.unlockPrice} €</span>
                    </button>
                    <div className="mt-2.5 text-[11px] font-mono text-zinc-400">
                      Ledger Balance: <span className="text-white font-semibold">{walletBalance} €</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="w-14 h-14 rounded-full bg-[#1A1A1E] border border-[#C5A880]/40 flex items-center justify-center text-[#C5A880] mb-3 shadow-xl">
                      <Crown className="w-6 h-6 stroke-[1.5]" />
                    </div>
                    <span className="text-[10px] font-mono tracking-[0.2em] uppercase text-[#C5A880] mb-1">
                      Privé Salon
                    </span>
                    <h3 className="font-serif text-lg text-white font-medium mb-1.5">
                      Patron Circle Privileges
                    </h3>
                    <p className="text-xs text-zinc-400 mb-5 font-sans leading-relaxed">
                      Reserved strictly for active patrons of {post.author.name}'s private salon.
                    </p>
                    <button
                      onClick={onSubscribeClick}
                      className="w-full py-2.5 px-6 rounded-full font-serif text-xs uppercase tracking-[0.14em] bg-[#C5A880] hover:bg-[#edd3a4] text-black font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg"
                    >
                      <Crown className="w-3.5 h-3.5" />
                      <span>Subscribe for 99 € / mo</span>
                    </button>
                  </>
                )}
              </div>
            </div>
          ) : post.type === 'video' && post.videoUrl ? (
            /* Unlocked Video */
            <video
              src={post.videoUrl}
              controls
              autoPlay
              className="w-full h-full object-contain"
            />
          ) : post.mediaUrl ? (
            /* Unlocked Photo */
            <img
              src={post.mediaUrl}
              alt="Dispatch plate"
              className="w-full h-full object-contain"
            />
          ) : (
            <div className="p-8 text-zinc-500 font-mono text-xs">Media unavailable</div>
          )}
        </div>

        {/* Sidebar Info Right Section */}
        <div className="w-full md:w-80 lg:w-96 flex flex-col bg-[#111113] border-t md:border-t-0 md:border-l border-white/[0.08]">
          {/* Author Header */}
          <div className="p-4 border-b border-white/[0.08] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img
                src={post.author.avatar}
                alt={post.author.name}
                className="w-9 h-9 rounded-full object-cover border border-white/10"
              />
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-sans font-medium text-xs text-white">
                    {post.author.name}
                  </span>
                  {post.author.isVerified && (
                    <Check className="w-3 h-3 text-[#C5A880]" />
                  )}
                </div>
                <span className="text-[11px] font-mono text-zinc-400">
                  @{post.author.username}
                </span>
              </div>
            </div>

            {post.isPPV && (
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#1A1A1E] text-[#C5A880] border border-[#C5A880]/30">
                {post.unlockPrice} €
              </span>
            )}
            {post.isSubscribersOnly && (
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#1A1A1E] text-white border border-white/15">
                Privé
              </span>
            )}
          </div>

          {/* Description & Comments */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4 font-sans text-xs">
            {post.content && (
              <p className="text-zinc-200 leading-relaxed whitespace-pre-line font-serif">
                "{post.content}"
              </p>
            )}

            {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {post.tags.map(t => (
                  <span key={t} className="text-[11px] font-mono text-[#C5A880]">
                    #{t}
                  </span>
                ))}
              </div>
            )}

            {/* Comments List */}
            <div className="pt-3 border-t border-white/[0.06] space-y-3">
              <span className="text-[11px] font-mono tracking-wider text-zinc-400 uppercase block">
                Dispatches & Remarks ({post.comments?.length || 0})
              </span>
              {post.comments && post.comments.length > 0 ? (
                post.comments.map(c => (
                  <div key={c.id} className="flex gap-2.5 items-start text-xs">
                    <img
                      src={c.author.avatar}
                      alt={c.author.name}
                      className="w-6 h-6 rounded-full object-cover mt-0.5 border border-white/10"
                    />
                    <div className="flex-1 bg-[#1A1A1E] p-2.5 rounded-xl border border-white/[0.06]">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-sans font-medium text-white text-[11px]">
                          {c.author.name}
                        </span>
                        <span className="text-[10px] font-mono text-zinc-500">
                          {c.createdAt}
                        </span>
                      </div>
                      <p className="text-zinc-300 font-sans">{c.text}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-zinc-500 font-serif italic">No remarks recorded yet.</p>
              )}
            </div>
          </div>

          {/* Actions Footer */}
          <div className="p-3.5 border-t border-white/[0.08] flex items-center justify-between text-zinc-400">
            <div className="flex items-center gap-4">
              <button
                onClick={() => onLike(post.id)}
                className={`flex items-center gap-1.5 text-xs transition-colors cursor-pointer ${
                  post.isLiked ? 'text-[#C5A880]' : 'hover:text-white'
                }`}
              >
                <Heart className={`w-4 h-4 ${post.isLiked ? 'fill-[#C5A880]' : ''}`} />
                <span className="font-mono text-[11px]">{post.likesCount}</span>
              </button>
              <div className="flex items-center gap-1.5 text-xs">
                <MessageCircle className="w-4 h-4 text-zinc-500" />
                <span className="font-mono text-[11px]">{post.commentsCount}</span>
              </div>
            </div>

            <button
              onClick={() => onSave(post.id)}
              className={`p-1.5 transition-colors cursor-pointer rounded-full hover:bg-white/5 ${
                post.isSaved ? 'text-[#C5A880]' : 'hover:text-white'
              }`}
            >
              <Bookmark className={`w-4 h-4 ${post.isSaved ? 'fill-[#C5A880]' : ''}`} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
