import React, { useState } from 'react';
import {
  ArrowLeft,
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  Eye,
  Crown,
  Send,
  ShieldAlert
} from 'lucide-react';
import { ForumTopic, UserProfile } from '../types';

interface ForumTopicDetailProps {
  topic: ForumTopic;
  currentUser: UserProfile;
  onBack: () => void;
  onUpvoteTopic: (topicId: string) => void;
  onAddReply: (topicId: string, content: string) => void;
  onReportTopic: (topic: ForumTopic) => void;
}

export const ForumTopicDetail: React.FC<ForumTopicDetailProps> = ({
  topic,
  currentUser,
  onBack,
  onUpvoteTopic,
  onAddReply,
  onReportTopic,
}) => {
  const [replyText, setReplyText] = useState('');

  const handleReplySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    onAddReply(topic.id, replyText);
    setReplyText('');
  };

  return (
    <div className="bg-[#111113] border border-white/[0.08] rounded-2xl p-6 sm:p-7 shadow-xl space-y-6">
      {/* Detail Header */}
      <div className="flex items-center justify-between pb-4 border-b border-white/[0.06]">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs font-sans font-medium text-zinc-400 hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Salons</span>
        </button>

        <button
          onClick={() => onReportTopic(topic)}
          className="text-xs text-zinc-500 hover:text-rose-400 font-sans font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <ShieldAlert className="w-3.5 h-3.5" />
          <span>Report Dispatch</span>
        </button>
      </div>

      {/* Main Topic Content */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <img
            src={topic.author.avatar}
            alt={topic.author.name}
            className="w-10 h-10 rounded-full object-cover border border-white/15"
          />
          <div>
            <div className="flex items-center gap-1.5 font-sans font-medium text-sm text-white">
              <span>{topic.author.name}</span>
              {topic.author.membershipTier === 'vip' && (
                <Crown className="w-3.5 h-3.5 text-[#C5A880]" />
              )}
            </div>
            <span className="text-[11px] font-mono text-zinc-500">{topic.createdAt}</span>
          </div>
        </div>

        <h2 className="text-xl font-serif font-light text-white tracking-wide leading-snug">
          {topic.title}
        </h2>

        <p className="text-xs sm:text-sm text-zinc-300 font-normal leading-relaxed whitespace-pre-wrap">
          {topic.content}
        </p>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 pt-2">
          {topic.tags.map(tag => (
            <span
              key={tag}
              className="text-[11px] px-2.5 py-1 rounded-full bg-[#1A1A1E] border border-white/10 text-zinc-400 font-sans font-medium"
            >
              #{tag}
            </span>
          ))}
        </div>

        {/* Stats & Upvote */}
        <div className="flex items-center justify-between pt-4 border-t border-white/[0.06]">
          <div className="flex items-center gap-2">
            <button
              onClick={() => onUpvoteTopic(topic.id)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#1A1A1E] hover:bg-[#1A1A1E] text-white border border-white/10 font-sans font-medium text-xs transition-colors cursor-pointer"
            >
              <ThumbsUp className="w-3.5 h-3.5 text-zinc-300" />
              <span>{topic.upvotes} Affirm</span>
            </button>
          </div>

          <span className="text-xs font-mono text-zinc-500 flex items-center gap-1.5">
            <Eye className="w-3.5 h-3.5 text-zinc-500" />
            <span>{topic.viewsCount} views</span>
          </span>
        </div>
      </div>

      {/* Replies Section */}
      <div className="space-y-4 pt-4 border-t border-white/[0.06]">
        <h4 className="font-sans font-medium text-sm text-white flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-[#C5A880]" />
          <span>Chamber Discussions ({topic.replies.length})</span>
        </h4>

        {/* Reply Form */}
        <form onSubmit={handleReplySubmit} className="flex gap-2">
          <input
            type="text"
            value={replyText}
            onChange={e => setReplyText(e.target.value)}
            placeholder="Contribute discreet perspective..."
            className="flex-1 py-2.5 px-4 text-xs rounded-full bg-[#1A1A1E] border border-white/[0.08] text-white placeholder-zinc-500 focus:outline-none focus:border-white/20"
          />
          <button
            type="submit"
            disabled={!replyText.trim()}
            className="px-4 py-2 rounded-full bg-white hover:bg-zinc-200 disabled:opacity-40 text-black text-xs font-sans font-medium flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Dispatch</span>
          </button>
        </form>

        {/* Replies List */}
        <div className="space-y-3 pt-2">
          {topic.replies.map(reply => (
            <div
              key={reply.id}
              className="p-3.5 rounded-xl bg-[#1A1A1E] border border-white/[0.06] space-y-2"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <img
                    src={reply.author.avatar}
                    alt=""
                    className="w-6 h-6 rounded-full object-cover border border-white/10"
                  />
                  <span className="font-sans font-medium text-xs text-zinc-200">
                    {reply.author.name}
                  </span>
                  {reply.author.membershipTier === 'vip' && (
                    <Crown className="w-3 h-3 text-[#C5A880]" />
                  )}
                </div>
                <span className="text-[10px] font-mono text-zinc-500">{reply.createdAt}</span>
              </div>
              <p className="text-xs text-zinc-300 font-normal leading-relaxed pl-8">
                {reply.content}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
