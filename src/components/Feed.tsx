import React, { useState } from 'react';
import { Post, UserProfile, Story } from '../types';
import { PostCard } from './PostCard';
import { StoriesBar } from './StoriesBar';
import { EmptyState } from './EmptyState';
import { 
  Image as ImageIcon, 
  Video as VideoIcon, 
  Crown, 
  KeyRound, 
  RotateCw,
  Sparkles,
  BookOpen
} from 'lucide-react';

interface FeedProps {
  currentUser: UserProfile;
  posts: Post[];
  stories?: Story[];
  isUserSubscribed: boolean;
  walletBalance: number;
  onLike: (postId: string) => void;
  onSave: (postId: string) => void;
  onOpenComments: (post: Post) => void;
  onOpenMedia: (post: Post) => void;
  onSubscribeClick: () => void;
  onUnlockPPV: (post: Post) => void;
  onShare: (post: Post) => void;
  onOpenCreatePost: () => void;
  onNavigateToProfile: (userId?: string) => void;
  onReportPost?: (post: Post) => void;
}

type FeedFilter = 'for_you' | 'following' | 'vip' | 'ppv';

export const Feed: React.FC<FeedProps> = ({
  currentUser,
  posts,
  stories = [],
  isUserSubscribed,
  walletBalance,
  onLike,
  onSave,
  onOpenComments,
  onOpenMedia,
  onSubscribeClick,
  onUnlockPPV,
  onShare,
  onOpenCreatePost,
  onNavigateToProfile,
  onReportPost,
}) => {
  const [activeFilter, setActiveFilter] = useState<FeedFilter>('for_you');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 600);
  };

  const displayedPosts = posts.filter(post => {
    if (activeFilter === 'for_you') return true;
    if (activeFilter === 'following') return true;
    if (activeFilter === 'vip') return post.isSubscribersOnly;
    if (activeFilter === 'ppv') return post.isPPV;
    return true;
  });

  return (
    <div className="w-full max-w-2xl mx-auto space-y-7 pb-24">
      {/* Photography Vignette Bar */}
      <StoriesBar
        stories={stories}
        currentUser={currentUser}
        onAddStory={onOpenCreatePost}
      />

      {/* Editorial Dispatch Entry Box */}
      <div className="bg-[#121419] border border-white/[0.08] rounded-2xl p-3.5 sm:p-4 shadow-xl">
        <div className="flex items-center gap-3">
          <img 
            src={currentUser.avatar} 
            alt={currentUser.name} 
            className="w-9 h-9 rounded-full object-cover border border-white/15 shrink-0"
          />
          <button
            onClick={onOpenCreatePost}
            className="flex-1 text-left px-4 py-2.5 rounded-full bg-[#181B22] hover:bg-[#1F232C] border border-white/[0.06] hover:border-white/15 text-zinc-400 text-xs transition-colors font-sans truncate"
          >
            Compose a dispatch or confidential vignette, {currentUser.name.split(' ')[0]}...
          </button>
        </div>

        <div className="mt-3 pt-3 border-t border-white/[0.06] flex items-center justify-between gap-2">
          <div className="flex items-center gap-1 sm:gap-1.5 overflow-x-auto no-scrollbar">
            <button
              onClick={onOpenCreatePost}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-zinc-400 hover:text-white hover:bg-white/[0.04] transition-colors text-[11px] font-sans whitespace-nowrap cursor-pointer"
            >
              <ImageIcon className="w-3.5 h-3.5 text-zinc-400" />
              <span>Plates</span>
            </button>
            <button
              onClick={onOpenCreatePost}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-zinc-400 hover:text-white hover:bg-white/[0.04] transition-colors text-[11px] font-sans whitespace-nowrap cursor-pointer"
            >
              <VideoIcon className="w-3.5 h-3.5 text-zinc-400" />
              <span>Cinema</span>
            </button>
            <button
              onClick={onOpenCreatePost}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-zinc-400 hover:text-[#E5C590] hover:bg-white/[0.04] transition-colors text-[11px] font-sans whitespace-nowrap cursor-pointer"
            >
              <Crown className="w-3.5 h-3.5 text-[#E5C590]" />
              <span>Privé</span>
            </button>
          </div>

          <button
            onClick={onOpenCreatePost}
            className="px-4 py-1.5 rounded-full bg-white hover:bg-zinc-200 text-black text-[11px] font-sans font-medium transition-colors shadow-sm shrink-0 whitespace-nowrap cursor-pointer"
          >
            Publish
          </button>
        </div>
      </div>

      {/* Modern Capsule Segment Tabs & Refresh */}
      <div className="flex items-center justify-between gap-2 pt-1 pb-1">
        <div className="inline-flex items-center p-1 rounded-full bg-[#121419] border border-white/[0.08] overflow-x-auto no-scrollbar max-w-full">
          <button
            onClick={() => setActiveFilter('for_you')}
            className={`px-3.5 sm:px-4 py-1.5 rounded-full text-xs font-sans transition-all whitespace-nowrap cursor-pointer ${
              activeFilter === 'for_you'
                ? 'bg-[#222631] text-white font-medium shadow-sm'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            For You
          </button>

          <button
            onClick={() => setActiveFilter('following')}
            className={`px-3.5 sm:px-4 py-1.5 rounded-full text-xs font-sans transition-all whitespace-nowrap cursor-pointer ${
              activeFilter === 'following'
                ? 'bg-[#222631] text-white font-medium shadow-sm'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Circles
          </button>

          <button
            onClick={() => setActiveFilter('vip')}
            className={`px-3.5 sm:px-4 py-1.5 rounded-full text-xs font-sans transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
              activeFilter === 'vip'
                ? 'bg-[#222631] text-white font-medium shadow-sm'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Crown className="w-3 h-3 text-[#E5C590]" />
            <span>Privé</span>
          </button>

          <button
            onClick={() => setActiveFilter('ppv')}
            className={`px-3.5 sm:px-4 py-1.5 rounded-full text-xs font-sans transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
              activeFilter === 'ppv'
                ? 'bg-[#222631] text-white font-medium shadow-sm'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <KeyRound className="w-3 h-3 text-zinc-400" />
            <span>Vault</span>
          </button>
        </div>

        {/* Refresh simulation */}
        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          aria-label="Refresh Journal"
          className="p-2 rounded-full bg-[#121419] border border-white/[0.08] text-zinc-400 hover:text-white hover:border-white/20 transition-all shrink-0 cursor-pointer"
          title="Refresh Feed"
        >
          <RotateCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-white' : ''}`} />
        </button>
      </div>

      {/* Posts Stream / Skeleton / Empty State */}
      {isRefreshing ? (
        <div className="space-y-6 animate-pulse">
          <div className="bg-[#121419] border border-white/[0.08] rounded-2xl p-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-[#181B22]" />
              <div className="space-y-2 flex-1">
                <div className="w-1/3 h-3 bg-[#181B22] rounded-full" />
                <div className="w-1/4 h-2 bg-[#181B22] rounded-full" />
              </div>
            </div>
            <div className="w-full h-56 bg-[#181B22] rounded-xl" />
          </div>
        </div>
      ) : displayedPosts.length === 0 ? (
        <EmptyState
          title="Henüz Kayıt Yok"
          description="Bu kategoride henüz yayınlanmış bir kayıt veya özel kilitli medya bulunmuyor."
        />
      ) : (
        <div className="space-y-8">
          {displayedPosts.map(post => (
            <PostCard
              key={post.id}
              post={post}
              isUserSubscribed={isUserSubscribed}
              walletBalance={walletBalance}
              onLike={onLike}
              onSave={onSave}
              onOpenComments={onOpenComments}
              onOpenMedia={onOpenMedia}
              onSubscribeClick={onSubscribeClick}
              onUnlockPPV={onUnlockPPV}
              onShare={onShare}
              onAuthorClick={onNavigateToProfile}
              onReportPost={onReportPost}
            />
          ))}
        </div>
      )}
    </div>
  );
};
