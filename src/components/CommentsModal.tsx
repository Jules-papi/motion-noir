import React, { useState, useRef } from 'react';
import { Post, Comment, UserProfile } from '../types';
import { X, Send, Heart, CheckCircle2 } from 'lucide-react';

interface CommentsModalProps {
  post: Post | null;
  isOpen: boolean;
  currentUser: UserProfile;
  onClose: () => void;
  onAddComment: (postId: string, text: string) => void;
}

export const CommentsModal: React.FC<CommentsModalProps> = ({
  post,
  isOpen,
  currentUser,
  onClose,
  onAddComment,
}) => {
  const [commentText, setCommentText] = useState('');
  const [likedCommentIds, setLikedCommentIds] = useState<Record<string, boolean>>({});
  const touchStartY = useRef<number>(0);
  const [dragY, setDragY] = useState(0);

  React.useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !post) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    onAddComment(post.id, commentText.trim());
    setCommentText('');
  };

  const handleEmojiClick = (emoji: string) => {
    setCommentText(prev => prev + emoji);
    if ('vibrate' in navigator) {
      try { navigator.vibrate(15); } catch {}
    }
  };

  const toggleCommentLike = (commentId: string) => {
    setLikedCommentIds(prev => ({ ...prev, [commentId]: !prev[commentId] }));
    if ('vibrate' in navigator) {
      try { navigator.vibrate(25); } catch {}
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const diff = e.touches[0].clientY - touchStartY.current;
    if (diff > 0) {
      setDragY(diff);
    }
  };

  const handleTouchEnd = () => {
    if (dragY > 100) {
      onClose();
    }
    setDragY(0);
  };

  const quickEmojis = ['❤️', '🔥', '🍷', '🖤', '👏', '✨', '🥂', '💋'];

  return (
    <div 
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex sm:items-center items-end justify-center p-0 sm:p-4 animate-in fade-in duration-200"
    >
      <div 
        onClick={e => e.stopPropagation()}
        style={{ transform: dragY > 0 ? `translateY(${dragY}px)` : undefined }}
        className="bg-[#121419] border border-white/[0.12] rounded-t-3xl sm:rounded-2xl w-full max-w-lg h-[80vh] sm:h-[580px] flex flex-col overflow-hidden shadow-2xl animate-in slide-in-from-bottom duration-250 ease-out transition-transform"
      >
        {/* Mobile Drag Handle */}
        <div 
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          className="pt-3 pb-1 cursor-grab active:cursor-grabbing shrink-0"
        >
          <div className="w-10 h-1.5 bg-white/20 hover:bg-white/40 rounded-full mx-auto transition-colors" />
        </div>

        {/* Header */}
        <div className="px-5 py-3 border-b border-white/[0.08] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <h3 className="font-sans text-sm text-white font-semibold tracking-tight">
              Yorumlar
            </h3>
            <span className="text-xs text-zinc-400 font-mono">
              ({post.comments?.length || 0})
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-white p-1 rounded-full hover:bg-white/5 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Comments Stream */}
        <div className="flex-1 p-4 overflow-y-auto space-y-4">
          {/* Post Author Caption Pin */}
          {post.content && (
            <div className="flex gap-3 items-start pb-4 border-b border-white/[0.06]">
              <img
                src={post.author.avatar}
                alt={post.author.name}
                className="w-9 h-9 rounded-full object-cover shrink-0 border border-[#E5C590]/30"
              />
              <div className="flex-1 min-w-0 text-xs font-sans">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <span className="font-semibold text-white truncate">
                    {post.author.username || post.author.name}
                  </span>
                  {post.author.isVerified && (
                    <CheckCircle2 className="w-3 h-3 text-[#E5C590] shrink-0" />
                  )}
                  <span className="text-[10px] text-zinc-500 font-mono ml-auto">
                    {post.createdAt}
                  </span>
                </div>
                <p className="text-zinc-200 leading-relaxed font-light">
                  {post.content}
                </p>
              </div>
            </div>
          )}

          {/* User Comments */}
          {post.comments && post.comments.length > 0 ? (
            post.comments.map(c => {
              const isCommentLiked = Boolean(likedCommentIds[c.id]);
              return (
                <div key={c.id} className="flex gap-3 items-start group">
                  <img
                    src={c.author.avatar}
                    alt={c.author.name}
                    className="w-8 h-8 rounded-full object-cover shrink-0 mt-0.5"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-sans leading-relaxed">
                      <span className="font-semibold text-white mr-1.5 inline-flex items-center gap-1">
                        {c.author.name}
                        {c.author.isVerified && (
                          <CheckCircle2 className="w-3 h-3 text-[#E5C590]" />
                        )}
                      </span>
                      <span className="text-zinc-300 font-light">
                        {c.text}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-[10px] text-zinc-500 font-sans mt-1">
                      <span>{c.createdAt}</span>
                      <button 
                        type="button" 
                        onClick={() => toggleCommentLike(c.id)}
                        className="hover:text-zinc-300 cursor-pointer font-medium"
                      >
                        {isCommentLiked ? 'Beğenildi' : 'Beğen'}
                      </button>
                      <button 
                        type="button"
                        onClick={() => setCommentText(`@${c.author.username || c.author.name} `)}
                        className="hover:text-zinc-300 cursor-pointer font-medium"
                      >
                        Yanıtla
                      </button>
                    </div>
                  </div>

                  {/* Comment Heart Button */}
                  <button
                    onClick={() => toggleCommentLike(c.id)}
                    className="p-1 text-zinc-500 hover:text-rose-500 transition-colors cursor-pointer shrink-0"
                  >
                    <Heart 
                      className={`w-3.5 h-3.5 transition-transform active:scale-75 ${
                        isCommentLiked 
                          ? 'fill-rose-500 text-rose-500 scale-110' 
                          : 'stroke-[1.5]'
                      }`} 
                    />
                  </button>
                </div>
              );
            })
          ) : (
            <div className="py-12 text-center space-y-1">
              <p className="text-sm font-sans font-medium text-white">Henüz yorum yok</p>
              <p className="text-xs font-sans text-zinc-500">Sohbeti başlatan ilk kişi sen ol.</p>
            </div>
          )}
        </div>

        {/* Quick Emoji Reaction Pill Strip (Instagram Style) */}
        <div className="px-4 py-2 border-t border-white/[0.06] flex items-center justify-around bg-[#0E1015] overflow-x-auto no-scrollbar">
          {quickEmojis.map((emoji) => (
            <button
              key={emoji}
              type="button"
              onClick={() => handleEmojiClick(emoji)}
              className="text-lg hover:scale-125 transition-transform active:scale-95 cursor-pointer px-1"
            >
              {emoji}
            </button>
          ))}
        </div>

        {/* Add Comment Input Bar */}
        <form onSubmit={handleSubmit} className="p-3.5 border-t border-white/[0.08] flex items-center gap-3 bg-[#121419] shrink-0">
          <img
            src={currentUser.avatar}
            alt={currentUser.name}
            className="w-8 h-8 rounded-full object-cover border border-white/10 shrink-0"
          />
          <input
            type="text"
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder={`${currentUser.name} olarak bir yorum ekle...`}
            className="flex-1 px-3.5 py-2.5 rounded-full text-xs bg-[#181B22] border border-white/[0.08] text-white placeholder-zinc-500 focus:outline-none focus:border-[#E5C590]/50 font-sans"
          />
          <button
            type="submit"
            disabled={!commentText.trim()}
            className="px-4 py-2 rounded-full bg-linear-to-r from-[#E5C590] to-[#C9A96E] text-black font-semibold text-xs hover:brightness-110 transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed shrink-0"
          >
            Paylaş
          </button>
        </form>
      </div>
    </div>
  );
};

