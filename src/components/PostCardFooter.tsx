import React, { useState } from 'react';
import { Heart, MessageSquare, Share2, Bookmark, Gift, Coins, Check } from 'lucide-react';
import { Post } from '../types';

interface PostCardFooterProps {
  post: Post;
  onLike: (postId: string) => void;
  onSave: (postId: string) => void;
  onOpenComments: (post: Post) => void;
  onShare: (post: Post) => void;
  onTip?: (post: Post, amount: number) => void;
}

export const PostCardFooter: React.FC<PostCardFooterProps> = ({
  post,
  onLike,
  onSave,
  onOpenComments,
  onShare,
  onTip,
}) => {
  const [showTipMenu, setShowTipMenu] = useState(false);
  const [customTip, setCustomTip] = useState('');
  const [tipSuccess, setTipSuccess] = useState(false);

  const handleSendTip = (amount: number) => {
    if (onTip) {
      onTip(post, amount);
      setTipSuccess(true);
      setTimeout(() => {
        setTipSuccess(false);
        setShowTipMenu(false);
        setCustomTip('');
      }, 900);
    }
  };

  return (
    <div className="px-4 sm:px-5 py-3 border-t border-white/[0.06] flex items-center justify-between text-zinc-400 relative">
      <div className="flex items-center gap-4 sm:gap-5">
        {/* Like */}
        <button
          id={`btn-like-${post.id}`}
          onClick={() => onLike(post.id)}
          className={`flex items-center gap-1.5 text-xs transition-colors cursor-pointer ${
            post.isLiked 
              ? 'text-rose-500' 
              : 'hover:text-white'
          }`}
        >
          <Heart className={`w-4 h-4 stroke-[1.75] ${post.isLiked ? 'fill-rose-500 text-rose-500' : ''}`} />
          <span className="font-sans text-xs font-medium">{post.likesCount}</span>
        </button>

        {/* Discussions */}
        <button
          id={`btn-comment-${post.id}`}
          onClick={() => onOpenComments(post)}
          className="flex items-center gap-1.5 text-xs font-sans hover:text-white transition-colors cursor-pointer"
        >
          <MessageSquare className="w-4 h-4 stroke-[1.75]" />
          <span className="font-sans text-xs font-medium">{post.commentsCount}</span>
        </button>

        {/* Share */}
        <button
          id={`btn-share-${post.id}`}
          onClick={() => onShare(post)}
          className="flex items-center gap-1.5 text-xs font-sans hover:text-white transition-colors cursor-pointer"
        >
          <Share2 className="w-4 h-4 stroke-[1.75]" />
          <span className="font-sans text-xs font-medium">{post.sharesCount}</span>
        </button>

        {/* Bahşiş / Tip Creator Button */}
        <div className="relative">
          <button
            id={`btn-tip-${post.id}`}
            onClick={() => setShowTipMenu(!showTipMenu)}
            className="flex items-center gap-1.5 text-xs font-sans text-zinc-400 hover:text-[#E5C590] transition-colors cursor-pointer"
          >
            <Gift className="w-4 h-4 stroke-[1.75]" />
            <span className="hidden sm:inline font-sans text-xs font-medium">Bahşiş</span>
          </button>

          {showTipMenu && (
            <div className="absolute left-0 bottom-9 w-60 bg-[#16181F] border border-white/15 rounded-2xl p-3 shadow-2xl z-40 animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between pb-2 border-b border-white/10 mb-2">
                <span className="text-[10px] font-mono tracking-widest text-[#E5C590] uppercase flex items-center gap-1">
                  <Coins className="w-3 h-3" />
                  Yazara Bahşiş Bırak
                </span>
                <button
                  onClick={() => setShowTipMenu(false)}
                  className="text-zinc-500 hover:text-white text-xs"
                >
                  ✕
                </button>
              </div>

              {tipSuccess ? (
                <div className="py-3 text-center text-emerald-400 text-xs font-mono flex items-center justify-center gap-1.5">
                  <Check className="w-4 h-4" />
                  <span>Bahşiş İletildi! Teşekkürler</span>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="grid grid-cols-4 gap-1.5">
                    {[5, 10, 25, 50].map(amt => (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => handleSendTip(amt)}
                        className="py-1.5 rounded-lg bg-[#1F232D] hover:bg-[#2A303D] text-white border border-white/5 hover:border-[#E5C590]/50 text-xs font-mono font-medium transition-colors cursor-pointer"
                      >
                        +{amt}€
                      </button>
                    ))}
                  </div>
                  <div className="flex gap-1.5">
                    <input
                      type="number"
                      placeholder="Miktar..."
                      value={customTip}
                      onChange={e => setCustomTip(e.target.value)}
                      className="flex-1 bg-[#121419] border border-white/10 rounded-lg px-2.5 py-1 text-xs text-white font-mono placeholder-zinc-500 focus:outline-hidden focus:border-[#E5C590]"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const parsed = parseInt(customTip, 10);
                        if (parsed > 0) handleSendTip(parsed);
                      }}
                      className="px-3 py-1 rounded-lg bg-[#E5C590] text-black font-semibold text-xs font-sans hover:bg-white transition-colors cursor-pointer"
                    >
                      Gönder
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Archive / Bookmark */}
      <button
        id={`btn-save-${post.id}`}
        onClick={() => onSave(post.id)}
        aria-label="Archive Record"
        className={`p-1.5 rounded-full transition-colors cursor-pointer ${
          post.isSaved 
            ? 'text-[#E5C590]' 
            : 'text-zinc-400 hover:text-white'
        }`}
      >
        <Bookmark className={`w-4 h-4 stroke-[1.75] ${post.isSaved ? 'fill-[#E5C590]' : ''}`} />
      </button>
    </div>
  );
};
