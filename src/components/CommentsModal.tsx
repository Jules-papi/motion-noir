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

  return (
    <div 
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-150"
    >
      <div 
        onClick={e => e.stopPropagation()}
        className="bg-[#121419] border border-white/[0.12] rounded-2xl w-full max-w-md h-[550px] flex flex-col overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-150"
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-white/[0.08] flex items-center justify-between">
          <h3 className="font-serif text-sm text-white font-medium">
            Salon Remarks ({post.comments?.length || 0})
          </h3>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-white p-1.5 rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
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
                      <span className="font-medium text-xs text-white">
                        {c.author.name}
                      </span>
                      {c.author.isVerified && (
                        <CheckCircle2 className="w-3 h-3 text-[#E5C590]" />
                      )}
                    </div>
                    <span className="text-[10px] text-zinc-500">
                      {c.createdAt}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-300 leading-relaxed font-sans">
                    {c.text}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="py-12 text-center text-zinc-500 text-xs font-serif italic">
              Be the first to record a remark in this dossier.
            </div>
          )}
        </div>

        {/* Add Comment Input */}
        <form onSubmit={handleSubmit} className="p-3.5 border-t border-white/[0.08] flex items-center gap-2.5 bg-[#121419]">
          <img
            src={currentUser.avatar}
            alt={currentUser.name}
            className="w-8 h-8 rounded-full object-cover border border-white/10"
          />
          <input
            type="text"
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="Record confidential remark..."
            className="flex-1 px-3.5 py-2 rounded-xl text-xs bg-[#181B22] border border-white/[0.08] text-white placeholder-zinc-500 focus:outline-none focus:border-[#E5C590]/50 font-sans"
          />
          <button
            type="submit"
            disabled={!commentText.trim()}
            className="p-2.5 rounded-xl bg-[#E5C590] text-black font-semibold hover:bg-[#d9b880] transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
};

