import React from 'react';
import { Heart, MessageSquare, Share2, Bookmark } from 'lucide-react';
import { Post } from '../types';

interface PostCardFooterProps {
  post: Post;
  onLike: (postId: string) => void;
  onSave: (postId: string) => void;
  onOpenComments: (post: Post) => void;
  onShare: (post: Post) => void;
}

export const PostCardFooter: React.FC<PostCardFooterProps> = ({
  post,
  onLike,
  onSave,
  onOpenComments,
  onShare,
}) => {
  return (
    <div className="px-4 sm:px-5 py-3 border-t border-white/[0.06] flex items-center justify-between text-zinc-400">
      <div className="flex items-center gap-5 sm:gap-6">
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
