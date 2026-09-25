import React, { useState } from 'react';
import { Heart, MessageCircle, Send, Bookmark } from 'lucide-react';
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
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [likeAnimate, setLikeAnimate] = useState(false);

  const handleLikeClick = () => {
    setLikeAnimate(true);
    if ('vibrate' in navigator) {
      try { navigator.vibrate(30); } catch {}
    }
    onLike(post.id);
    setTimeout(() => setLikeAnimate(false), 300);
  };

  const caption = post.content || '';
  const isLongCaption = caption.length > 95;

  return (
    <div className="px-4 sm:px-5 pt-3 pb-4 space-y-2 text-zinc-300">
      {/* 1. INSTAGRAM ACTION BAR (44px+ THUMB ZONE COMPLIANT) */}
      <div className="flex items-center justify-between -mx-2">
        <div className="flex items-center gap-1">
          {/* Like Heart */}
          <button
            id={`btn-like-${post.id}`}
            onClick={handleLikeClick}
            aria-label="Beğen"
            className={`min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full hover:bg-white/[0.04] transition-all active:scale-75 cursor-pointer ${
              likeAnimate ? 'scale-125' : ''
            }`}
          >
            <Heart
              className={`w-6 h-6 stroke-[1.8] transition-colors ${
                post.isLiked 
                  ? 'fill-rose-500 text-rose-500 drop-shadow-[0_0_12px_rgba(244,63,94,0.6)]' 
                  : 'text-white hover:text-rose-400'
              }`}
            />
          </button>

          {/* Comment Bubble */}
          <button
            id={`btn-comment-${post.id}`}
            onClick={() => onOpenComments(post)}
            aria-label="Yorum Yap"
            className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full text-white hover:text-zinc-300 hover:bg-white/[0.04] transition-all active:scale-75 cursor-pointer"
          >
            <MessageCircle className="w-6 h-6 stroke-[1.8]" />
          </button>

          {/* Share / Direct Plane */}
          <button
            id={`btn-share-${post.id}`}
            onClick={() => onShare(post)}
            aria-label="Paylaş"
            className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full text-white hover:text-zinc-300 hover:bg-white/[0.04] transition-all active:scale-75 cursor-pointer"
          >
            <Send className="w-5 h-5 stroke-[1.8] -rotate-12" />
          </button>
        </div>

        {/* Bookmark / Save */}
        <button
          id={`btn-save-${post.id}`}
          onClick={() => onSave(post.id)}
          aria-label="Kaydet"
          className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full text-white hover:text-[#E5C590] hover:bg-white/[0.04] transition-all active:scale-75 cursor-pointer"
        >
          <Bookmark className={`w-5 h-5 stroke-[1.8] ${post.isSaved ? 'fill-[#E5C590] text-[#E5C590]' : ''}`} />
        </button>
      </div>

      {/* 2. LIKES COUNT (INSTAGRAM FORMAT) */}
      <div className="text-xs font-sans font-semibold text-white pt-0.5">
        {post.likesCount > 0 ? (
          <span>{post.likesCount.toLocaleString()} beğenme</span>
        ) : (
          <span className="font-normal text-zinc-400">İlk beğenen sen ol</span>
        )}
      </div>

      {/* 3. INLINE CAPTION PREVIEW */}
      {caption && (
        <div className="text-xs font-sans leading-relaxed text-zinc-200">
          <span className="font-semibold text-white mr-1.5">
            {post.author.username || post.author.name}
          </span>
          <span className="text-zinc-300">
            {isExpanded || !isLongCaption ? caption : `${caption.slice(0, 95)}...`}
          </span>
          {isLongCaption && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="ml-1 text-zinc-400 hover:text-zinc-200 text-xs font-medium cursor-pointer"
            >
              {isExpanded ? 'daha az' : 'devamı'}
            </button>
          )}
        </div>
      )}

      {/* 4. COMMENTS BOTTOM SHEET TRIGGER */}
      {post.commentsCount > 0 && (
        <button
          onClick={() => onOpenComments(post)}
          className="text-xs font-sans text-zinc-400 hover:text-zinc-200 transition-colors block text-left cursor-pointer pt-0.5"
        >
          {post.commentsCount === 1 ? '1 yorumu gör' : `${post.commentsCount} yorumun tümünü gör`}
        </button>
      )}

      {/* 5. TIMESTAMP */}
      <div className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 pt-0.5">
        {post.createdAt || 'Az önce'}
      </div>
    </div>
  );
};
