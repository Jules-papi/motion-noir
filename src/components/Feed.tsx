import React, { useState } from 'react';
import { Post, UserProfile, Story } from '../types';
import { PostCard } from './PostCard';
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
import { useLanguage } from '../i18n/LanguageContext';

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
  onTip?: (post: Post, amount: number) => void;
  onOpenCreatePost: () => void;
  onOpenCreateStory?: () => void;
  onNavigateToProfile: (userId?: string) => void;
  onReportPost?: (post: Post) => void;
  onRefresh?: () => Promise<void> | void;
  hasMorePosts?: boolean;
  isLoadingMore?: boolean;
  onLoadMore?: () => void;
  onDeletePost?: (postId: string) => void;
}

export const Feed: React.FC<FeedProps> = ({
  currentUser,
  posts,
  isUserSubscribed,
  walletBalance,
  onLike,
  onSave,
  onOpenComments,
  onOpenMedia,
  onSubscribeClick,
  onUnlockPPV,
  onShare,
  onTip,
  onOpenCreatePost,
  onNavigateToProfile,
  onReportPost,
  onRefresh,
  hasMorePosts,
  isLoadingMore,
  onLoadMore,
  onDeletePost,
}) => {
  const { t } = useLanguage();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    if (onRefresh) {
      await onRefresh();
    }
    setTimeout(() => {
      setIsRefreshing(false);
    }, 500);
  };

  const displayedPosts = posts;

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6 pb-24">
      {/* Editorial Dispatch Entry Box */}
      <div className="bg-[#111113] border border-white/[0.08] rounded-xl p-3.5 sm:p-4 shadow-xs">
        <div className="flex items-center gap-3">
          <img
            src={currentUser.avatar}
            alt={currentUser.name}
            className="w-8 h-8 rounded-full object-cover border border-white/15 shrink-0"
          />
          <button
            onClick={onOpenCreatePost}
            className="flex-1 text-left px-3.5 py-2 rounded-lg bg-[#1A1A1E] hover:bg-[#222228] border border-white/[0.06] hover:border-white/15 text-[#9A9996] text-xs transition-colors font-sans truncate cursor-pointer"
          >
            {t('feed.compose')}, {currentUser.name.split(' ')[0]}...
          </button>
        </div>

        <div className="mt-3 pt-2.5 border-t border-white/[0.06] flex items-center justify-between gap-2">
          <div className="flex items-center gap-1 sm:gap-1.5 overflow-x-auto no-scrollbar">
            <button
              onClick={onOpenCreatePost}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[#9A9996] hover:text-[#F1EFEA] hover:bg-white/[0.04] transition-colors text-[11px] font-sans whitespace-nowrap cursor-pointer"
            >
              <ImageIcon className="w-3.5 h-3.5 text-[#9A9996]" />
              <span>{t('feed.photo')}</span>
            </button>
            <button
              onClick={onOpenCreatePost}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[#9A9996] hover:text-[#F1EFEA] hover:bg-white/[0.04] transition-colors text-[11px] font-sans whitespace-nowrap cursor-pointer"
            >
              <VideoIcon className="w-3.5 h-3.5 text-[#9A9996]" />
              <span>{t('feed.video')}</span>
            </button>
          </div>

          <button
            onClick={onOpenCreatePost}
            className="px-3.5 py-1 rounded-md bg-[#F1EFEA] hover:bg-white text-[#09090B] text-xs font-sans font-medium transition-colors shadow-xs shrink-0 whitespace-nowrap cursor-pointer"
          >
            {t('feed.publish')}
          </button>
        </div>
      </div>

      {/* Stream Context Header & Refresh */}
      <div className="flex items-center justify-between gap-2 px-1">
        <span className="text-[11px] font-mono tracking-wider text-[#9A9996] uppercase">
          {t('nav.feed')} · {posts.length} {t('feed.dispatches')}
        </span>

        {/* Refresh button */}
        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          aria-label={t('feed.refresh')}
          className="p-1.5 rounded-md bg-[#111113] border border-white/[0.08] text-[#9A9996] hover:text-[#F1EFEA] hover:border-white/20 transition-all shrink-0 cursor-pointer"
          title={t('feed.refresh')}
        >
          <RotateCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-[#F1EFEA]' : ''}`} />
        </button>
      </div>

      {/* Posts Stream / Skeleton / Empty State */}
      {isRefreshing ? (
        <div className="space-y-6 animate-pulse">
          <div className="bg-[#111113] border border-white/[0.08] rounded-xl p-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#1A1A1E]" />
              <div className="space-y-2 flex-1">
                <div className="w-1/3 h-3 bg-[#1A1A1E] rounded-md" />
                <div className="w-1/4 h-2 bg-[#1A1A1E] rounded-md" />
              </div>
            </div>
            <div className="w-full h-56 bg-[#1A1A1E] rounded-lg" />
          </div>
        </div>
      ) : displayedPosts.length === 0 ? (
        <EmptyState
          title={t('feed.emptyTitle')}
          description={t('feed.emptyText')}
        />
      ) : (
        <div className="space-y-6 sm:space-y-7">
          {displayedPosts.map(post => (
            <PostCard
              key={post.id}
              post={post}
              currentUser={currentUser}
              isUserSubscribed={isUserSubscribed}
              walletBalance={walletBalance}
              onLike={onLike}
              onSave={onSave}
              onOpenComments={onOpenComments}
              onOpenMedia={onOpenMedia}
              onSubscribeClick={onSubscribeClick}
              onUnlockPPV={onUnlockPPV}
              onShare={onShare}
              onTip={onTip}
              onAuthorClick={onNavigateToProfile}
              onReportPost={onReportPost}
              onDelete={onDeletePost}
            />
          ))}

          {/* Pagination Load More Button */}
          {hasMorePosts && onLoadMore && (
            <div className="pt-4 pb-12 flex justify-center">
              <button
                type="button"
                onClick={onLoadMore}
                disabled={isLoadingMore}
                className="px-5 py-2 rounded-lg bg-[#111113] hover:bg-[#1A1A1E] border border-white/10 text-xs font-sans text-[#9A9996] hover:text-[#F1EFEA] transition-all cursor-pointer flex items-center gap-2 shadow-sm disabled:opacity-50"
              >
                {isLoadingMore ? (
                  <>
                    <RotateCw className="w-3.5 h-3.5 animate-spin text-[#C5A880]" />
                    <span>{t('feed.loading')}</span>
                  </>
                ) : (
                  <span>{t('feed.more')}</span>
                )}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
