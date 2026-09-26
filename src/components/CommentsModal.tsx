import React, { useState } from 'react';
import { Post, Comment, UserProfile } from '../types';
import { Send, Heart, CheckCircle2, Trash2 } from 'lucide-react';
import { BottomSheet } from './BottomSheet';

interface CommentsModalProps {
  post: Post | null;
  isOpen: boolean;
  currentUser: UserProfile | null;
  onClose: () => void;
  onAddComment: (postId: string, text: string) => void;
  onDeleteComment?: (commentId: string) => void;
  onOpenAuth?: () => void;
}

export const CommentsModal: React.FC<CommentsModalProps> = ({
  post,
  isOpen,
  currentUser,
  onClose,
  onAddComment,
  onDeleteComment,
  onOpenAuth,
}) => {
  const [commentText, setCommentText] = useState('');
  const [likedCommentIds, setLikedCommentIds] = useState<Record<string, boolean>>({});

  if (!isOpen || !post) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    if (!currentUser || currentUser.isGuest) {
      onOpenAuth?.();
      return;
    }
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

  const quickEmojis = ['❤️', '🔥', '🍷', '🖤', '👏', '✨', '🥂', '💋'];

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2">
          <span className="font-sans text-sm text-white font-semibold tracking-tight">
            Yorumlar
          </span>
          <span className="text-xs text-zinc-400 font-mono">
            ({post.comments?.length || post.commentsCount || 0})
          </span>
        </div>
      }
    >
      <div className="flex flex-col h-full min-h-[420px]">
        {/* Comments Stream */}
        <div className="flex-1 p-4 overflow-y-auto space-y-4">
          {/* Post Author Caption Pin */}
          {post.content && (
            <div className="flex gap-3 items-start pb-4 border-b border-white/[0.06]">
              <img
                src={post.author.avatar}
                alt={post.author.name}
                className="w-9 h-9 rounded-full object-cover shrink-0 border border-[#C5A880]/30"
              />
              <div className="flex-1 min-w-0 text-xs font-sans">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <span className="font-semibold text-white truncate">
                    {post.author.username || post.author.name}
                  </span>
                  {post.author.isVerified && (
                    <CheckCircle2 className="w-3 h-3 text-[#C5A880] shrink-0" />
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
              const isAuthor = currentUser && !currentUser.isGuest && currentUser.id === c.author.id;

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
                          <CheckCircle2 className="w-3 h-3 text-[#C5A880]" />
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

                      {/* Delete Flow: only comment author can delete */}
                      {isAuthor && onDeleteComment && (
                        <button
                          type="button"
                          onClick={() => {
                            if (window.confirm('Bu yorumu silmek istediğinizden emin misiniz?')) {
                              onDeleteComment(c.id);
                            }
                          }}
                          className="hover:text-rose-400 text-zinc-600 transition-colors cursor-pointer flex items-center gap-0.5"
                          title="Yorumu Sil"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>Sil</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Comment Heart Button */}
                  <button
                    type="button"
                    onClick={() => toggleCommentLike(c.id)}
                    aria-label="Beğen"
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

        {/* Quick Emoji Reaction Strip */}
        <div className="px-4 py-2 border-t border-white/[0.06] flex items-center justify-around bg-[#0E1015] overflow-x-auto no-scrollbar shrink-0">
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
        <div className="p-3.5 border-t border-white/[0.08] bg-[#111113] shrink-0">
          {currentUser && !currentUser.isGuest ? (
            <form onSubmit={handleSubmit} className="flex items-center gap-3">
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
                className="flex-1 px-3.5 py-2.5 rounded-full text-xs bg-[#1A1A1E] border border-white/[0.08] text-white placeholder-zinc-500 focus:outline-none focus:border-[#C5A880]/50 font-sans"
              />
              <button
                type="submit"
                disabled={!commentText.trim()}
                className="px-4 py-2 rounded-full bg-linear-to-r from-[#C5A880] to-[#C9A96E] text-black font-semibold text-xs hover:brightness-110 transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed shrink-0"
              >
                Paylaş
              </button>
            </form>
          ) : (
            <div className="flex items-center justify-between gap-3 px-2 py-1">
              <span className="text-xs text-zinc-400 font-sans">
                Yorum yapabilmek için lütfen giriş yapın veya üye olun.
              </span>
              <button
                type="button"
                onClick={onOpenAuth}
                className="px-4 py-2 rounded-full bg-[#C5A880] text-black font-semibold text-xs hover:brightness-110 transition-all cursor-pointer shrink-0"
              >
                Giriş Yap
              </button>
            </div>
          )}
        </div>
      </div>
    </BottomSheet>
  );
};
