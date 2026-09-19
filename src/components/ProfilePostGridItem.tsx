import React from 'react';
import { Lock, Crown, Play } from 'lucide-react';
import { Post } from '../types';
import { SECURE_LOCKED_BLUR_PLACEHOLDER } from '../utils/mediaSecurity';

interface ProfilePostGridItemProps {
  post: Post;
  isUserSubscribed: boolean;
  onOpenMedia: (post: Post) => void;
  onUnlockPPV: (post: Post) => void;
}

export const ProfilePostGridItem: React.FC<ProfilePostGridItemProps> = ({
  post,
  isUserSubscribed,
  onOpenMedia,
  onUnlockPPV,
}) => {
  const isPpvLocked = post.isPPV && !post.isUnlocked;
  const isSubLocked = post.isSubscribersOnly && !isUserSubscribed;

  const handleClick = () => {
    if (isPpvLocked) {
      onUnlockPPV(post);
    } else {
      onOpenMedia(post);
    }
  };

  return (
    <div
      onClick={handleClick}
      className="group relative aspect-square rounded-2xl overflow-hidden bg-[#121419] cursor-pointer border border-white/[0.08] hover:border-white/25 transition-all duration-300 shadow-md"
    >
      {post.type === 'text' ? (
        <div className="w-full h-full p-4 flex flex-col justify-between bg-[#181B22]">
          <p className="text-xs text-zinc-300 line-clamp-4 leading-relaxed font-serif italic">
            "{post.content}"
          </p>
          <span className="text-[9px] font-mono tracking-widest text-zinc-500 uppercase">
            Salon Dispatch
          </span>
        </div>
      ) : (
        <>
          <img
            src={
              (isSubLocked || isPpvLocked)
                ? SECURE_LOCKED_BLUR_PLACEHOLDER
                : (post.mediaUrl || post.thumbnailUrl)
            }
            alt="Plate"
            className={`w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 filter contrast-[1.05] ${
              (isSubLocked || isPpvLocked) ? 'filter blur-lg scale-110' : ''
            }`}
          />

          {/* Locked Overlays */}
          {isPpvLocked ? (
            <div className="absolute inset-0 bg-[#07080A]/85 backdrop-blur-xs flex flex-col items-center justify-center p-3 text-center text-zinc-200">
              <div className="w-9 h-9 rounded-full bg-[#181B22] border border-[#E5C590]/40 flex items-center justify-center mb-1.5 text-[#E5C590]">
                <Lock className="w-4 h-4" />
              </div>
              <span className="text-xs font-mono font-medium text-[#E5C590]">
                {post.unlockPrice} €
              </span>
              <span className="text-[9px] font-mono uppercase tracking-widest text-zinc-400 mt-0.5">
                Confidential Plate
              </span>
            </div>
          ) : isSubLocked ? (
            <div className="absolute inset-0 bg-[#07080A]/85 backdrop-blur-xs flex flex-col items-center justify-center p-3 text-center text-zinc-200">
              <div className="w-9 h-9 rounded-full bg-[#181B22] border border-[#E5C590]/40 flex items-center justify-center mb-1.5 text-[#E5C590]">
                <Crown className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-sans uppercase tracking-wider text-[#E5C590]">
                Privé Patron Only
              </span>
            </div>
          ) : (
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4 text-white font-mono text-xs">
              <span>{post.likesCount} applauds</span>
              <span>{post.commentsCount} notes</span>
            </div>
          )}

          {/* Corner Badges */}
          <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5">
            {post.type === 'video' && (
              <span className="p-1.5 rounded-full bg-black/70 backdrop-blur-md text-white border border-white/10">
                <Play className="w-2.5 h-2.5 fill-current" />
              </span>
            )}
            {post.isPPV && !isPpvLocked && (
              <span className="px-2.5 py-0.5 rounded-full bg-[#181B22] border border-[#E5C590]/40 text-[#E5C590] text-[9px] font-mono uppercase tracking-wider">
                Unsealed
              </span>
            )}
            {post.isSubscribersOnly && !isSubLocked && (
              <span className="px-2.5 py-0.5 rounded-full bg-[#181B22] border border-[#E5C590]/40 text-[#E5C590] text-[9px] font-mono uppercase tracking-wider">
                Privé
              </span>
            )}
          </div>
        </>
      )}
    </div>
  );
};
