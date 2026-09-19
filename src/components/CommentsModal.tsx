import React, { useState } from 'react';
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

  if (!isOpen || !post) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    onAddComment(post.id, commentText.trim());
    setCommentText('');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl w-full max-w-md h-[550px] flex flex-col overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-5 py-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
          <h3 className="font-bold text-sm text-zinc-900 dark:text-white">
            Yorumlar ({post.comments?.length || 0})
          </h3>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Comments Stream */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3.5">
          {post.comments && post.comments.length > 0 ? (
            post.comments.map(c => (
              <div key={c.id} className="flex gap-3 items-start">
                <img
                  src={c.author.avatar}
                  alt={c.author.name}
                  className="w-8 h-8 rounded-full object-cover shrink-0 mt-0.5"
                />
                <div className="flex-1 bg-zinc-100 dark:bg-zinc-800/70 p-3 rounded-2xl">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-1">
                      <span className="font-semibold text-xs text-zinc-900 dark:text-zinc-100">
                        {c.author.name}
                      </span>
                      {c.author.isVerified && (
                        <CheckCircle2 className="w-3 h-3 text-sky-500" />
                      )}
                    </div>
                    <span className="text-[10px] text-zinc-400">
                      {c.createdAt}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed">
                    {c.text}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="py-12 text-center text-zinc-400 text-xs">
              İlk yorumu sen yaz!
            </div>
          )}
        </div>

        {/* Add Comment Input */}
        <form onSubmit={handleSubmit} className="p-3 border-t border-zinc-200 dark:border-zinc-800 flex items-center gap-2 bg-zinc-50 dark:bg-zinc-900/50">
          <img
            src={currentUser.avatar}
            alt={currentUser.name}
            className="w-8 h-8 rounded-full object-cover"
          />
          <input
            type="text"
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="Bir yorum ekle..."
            className="flex-1 px-3 py-2 rounded-xl text-xs bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-hidden focus:ring-2 focus:ring-rose-500"
          />
          <button
            type="submit"
            disabled={!commentText.trim()}
            className="p-2 rounded-xl bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
