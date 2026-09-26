import React, { useState, useRef } from 'react';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Crown,
  Check,
  Eye,
  MoreHorizontal,
  ShieldAlert,
  KeyRound,
  Heart,
  Trash2
} from 'lucide-react';
import { Post, UserProfile } from '../types';
import { PostCardFooter } from './PostCardFooter';
import { PostLockedOverlay } from './PostLockedOverlay';
import { PostSensitiveOverlay } from './PostSensitiveOverlay';
import { SECURE_LOCKED_BLUR_PLACEHOLDER } from '../utils/mediaSecurity';

interface PostCardProps {
  post: Post;
  currentUser?: UserProfile | null;
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
  onAuthorClick?: (authorId: string) => void;
  onReportPost?: (post: Post) => void;
  onDelete?: (postId: string) => void;
}

export const PostCard: React.FC<PostCardProps> = ({
  post,
  currentUser,
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
  onAuthorClick,
  onReportPost,
  onDelete,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [showMenu, setShowMenu] = useState(false);
  const [isSensitiveRevealed, setIsSensitiveRevealed] = useState(false);
  const [showHeartAnim, setShowHeartAnim] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const lastTapRef = useRef<number>(0);

  const handleMediaDoubleTap = (e: React.MouseEvent) => {
    const now = Date.now();
    const DOUBLE_TAP_DELAY = 300;
    if (now - lastTapRef.current < DOUBLE_TAP_DELAY) {
      e.preventDefault();
      e.stopPropagation();
      setShowHeartAnim(true);
      if ('vibrate' in navigator) {
        try { navigator.vibrate([40, 25, 40]); } catch {}
      }
      if (!post.isLiked) {
        onLike(post.id);
      }
      setTimeout(() => setShowHeartAnim(false), 900);
    } else {
      lastTapRef.current = now;
      setTimeout(() => {
        if (Date.now() - lastTapRef.current >= DOUBLE_TAP_DELAY && !showHeartAnim) {
          if (!showSensitiveOverlay) onOpenMedia(post);
        }
      }, DOUBLE_TAP_DELAY);
    }
  };

  const togglePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const isSubscriptionLocked = false;
  const isPPVLocked = false;
  const isContentLocked = false;
  const showSensitiveOverlay = Boolean(post.isSensitive && !isSensitiveRevealed);

  return (
    <article
      id={`post-card-${post.id}`}
      className="bg-[#111113] border border-white/[0.08] rounded-xl overflow-hidden transition-all duration-200 shadow-xs"
    >
      {/* 1. EDITORIAL AUTHOR HEADER */}
      <div className="p-4 sm:p-5 flex items-center justify-between">
        <div
          onClick={() => onAuthorClick && onAuthorClick(post.author.id)}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="relative shrink-0">
            <img
              src={post.author.avatar}
              alt={post.author.name}
              className="w-9 h-9 rounded-full object-cover border border-white/15 group-hover:border-white/30 transition-colors"
            />
            {post.isSubscribersOnly && (
              <span className="absolute -bottom-0.5 -right-0.5 bg-[#111113] text-[#C5A880] p-0.5 border border-[#C5A880]/30 rounded-full" title="Privé Member">
                <Crown className="w-2.5 h-2.5" />
              </span>
            )}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="font-sans text-xs sm:text-sm font-medium tracking-normal text-[#F1EFEA] group-hover:text-white transition-colors">
                {post.author.name}
              </h3>
              {post.author.isVerified && (
                <Check className="w-3.5 h-3.5 text-[#C5A880]" />
              )}
            </div>
            <div className="flex items-center gap-2 text-[11px] font-sans text-[#9A9996]">
              <span>@{post.author.username}</span>
              <span>·</span>
              <span>{post.createdAt}</span>
            </div>
          </div>
        </div>

        {/* Header Right Badges & Menu */}
        <div className="flex items-center gap-2">
          {post.isPPV && (
            <span className="text-[10px] font-sans font-medium px-2 py-0.5 rounded-md bg-[#1A1A1E] text-[#C5A880] border border-[#C5A880]/30 flex items-center gap-1">
              <KeyRound className="w-3 h-3" />
              <span>{post.unlockPrice} €</span>
            </span>
          )}
          {post.isSubscribersOnly && (
            <span className="text-[10px] font-sans font-medium px-2 py-0.5 rounded-md bg-[#1A1A1E] text-[#F1EFEA] border border-white/10">
              Privé
            </span>
          )}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowMenu(prev => !prev)}
              aria-label="Options"
              className="text-[#9A9996] hover:text-[#F1EFEA] p-1.5 rounded-md hover:bg-white/[0.04] transition-colors cursor-pointer"
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>

            {showMenu && (
              <div className="absolute right-0 top-full mt-1 w-44 bg-[#1A1A1E] border border-white/[0.08] rounded-lg shadow-2xl z-20 py-1 text-xs">
                {currentUser && !currentUser.isGuest && currentUser.id === post.author.id && (
                  <button
                    type="button"
                    onClick={() => {
                      setShowMenu(false);
                      if (window.confirm('Bu gönderiyi kalıcı olarak silmek istediğinizden emin misiniz?')) {
                        onDelete?.(post.id);
                      }
                    }}
                    className="w-full text-left px-3.5 py-2 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 flex items-center gap-2 font-sans cursor-pointer transition-colors border-b border-white/[0.06]"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Gönderiyi Sil</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => {
                    setShowMenu(false);
                    onReportPost?.(post);
                  }}
                  className="w-full text-left px-3.5 py-2 text-[#9A9996] hover:text-[#F1EFEA] hover:bg-white/[0.05] flex items-center gap-2 font-sans cursor-pointer transition-colors"
                >
                  <ShieldAlert className="w-3.5 h-3.5 text-[#C5A880]" />
                  <span>Report Dispatch</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 2. TEXT-ONLY DISPATCH CONTENT (if no photo/video) */}
      {!post.mediaUrl && !post.videoUrl && post.content && (
        <div className="px-4 sm:px-5 py-3.5 bg-white/[0.015]">
          <p className="text-[#F1EFEA] text-sm font-sans leading-relaxed whitespace-pre-line font-normal">
            {post.content}
          </p>
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2.5">
              {post.tags.map(tag => (
                <span
                  key={tag}
                  className="text-[11px] font-sans text-[#C5A880]/80 hover:text-[#C5A880] cursor-pointer transition-colors"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 3. CINEMATIC FULL-WIDTH PHOTOGRAPHY / VIDEO */}
      {isContentLocked ? (
        <PostLockedOverlay
          post={post}
          walletBalance={walletBalance}
          onSubscribeClick={onSubscribeClick}
          onUnlockPPV={onUnlockPPV}
        />
      ) : post.type === 'video' && post.videoUrl ? (
        <div className="relative w-full overflow-hidden bg-black aspect-video group cursor-pointer" onClick={togglePlay}>
          {showSensitiveOverlay && (
            <PostSensitiveOverlay onReveal={() => setIsSensitiveRevealed(true)} />
          )}
          <video
            ref={videoRef}
            src={showSensitiveOverlay ? undefined : post.videoUrl}
            poster={showSensitiveOverlay ? SECURE_LOCKED_BLUR_PLACEHOLDER : post.thumbnailUrl}
            className={`w-full h-full object-cover filter contrast-[1.05] ${showSensitiveOverlay ? 'filter blur-2xl' : ''}`}
            loop
            playsInline
            muted={isMuted}
            onEnded={() => setIsPlaying(false)}
          />

          {!showSensitiveOverlay && (
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <button
                onClick={togglePlay}
                aria-label={isPlaying ? 'Pause' : 'Play'}
                className="w-12 h-12 rounded-full bg-black/60 border border-white/20 text-white flex items-center justify-center hover:border-white/50 transition-all cursor-pointer"
              >
                {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
              </button>
            </div>
          )}

          {!showSensitiveOverlay && (
            <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-xs z-10 pointer-events-auto">
              <span className="bg-black/70 backdrop-blur-md px-2 py-0.5 rounded-[4px] font-mono text-[10px] border border-white/10">
                {post.videoDuration || 'Cinema'}
              </span>
              <button
                onClick={toggleMute}
                className="bg-black/70 backdrop-blur-md p-1.5 rounded-[4px] hover:bg-black/90 transition-colors border border-white/10 cursor-pointer"
                title={isMuted ? 'Unmute' : 'Mute'}
              >
                {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
              </button>
            </div>
          )}
        </div>
      ) : post.mediaUrl ? (
        <div
          onClick={handleMediaDoubleTap}
          className="relative w-full aspect-[4/5] max-h-[640px] overflow-hidden bg-[#09090B] cursor-pointer group select-none"
        >
          {showSensitiveOverlay && (
            <PostSensitiveOverlay onReveal={() => setIsSensitiveRevealed(true)} />
          )}
          <img
            src={showSensitiveOverlay ? SECURE_LOCKED_BLUR_PLACEHOLDER : post.mediaUrl}
            alt="Dispatch plate"
            className={`w-full h-full object-cover filter contrast-[1.04] transition-transform duration-700 group-hover:scale-[1.015] ${
              showSensitiveOverlay ? 'filter blur-2xl scale-105' : ''
            }`}
          />

          {/* Instagram-Style Floating Heart Burst on Double Tap */}
          {showHeartAnim && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-30 animate-in zoom-in-50 fade-in duration-150">
              <div className="w-24 h-24 rounded-full bg-black/40 backdrop-blur-xs flex items-center justify-center shadow-2xl drop-shadow-[0_0_30px_rgba(229,197,144,0.8)] animate-pulse">
                <Heart className="w-16 h-16 fill-[#C5A880] text-[#C5A880] drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]" />
              </div>
            </div>
          )}

          {/* Discreet Face Mask Overlay */}
          {post.hasFaceMask && !showSensitiveOverlay && (
            <div className="absolute top-[22%] left-1/2 -translate-x-1/2 w-44 h-8 bg-black/90 backdrop-blur-md rounded-full border border-white/20 flex items-center justify-center gap-1.5 shadow-2xl pointer-events-none">
              <span className="w-1.5 h-1.5 rounded-full bg-[#C5A880] animate-pulse" />
              <span className="text-[10px] font-mono tracking-widest text-[#C5A880] uppercase font-medium">
                DISCREET MASK
              </span>
            </div>
          )}
          {!showSensitiveOverlay && !showHeartAnim && (
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/25 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
              <span className="bg-black/75 text-white text-xs font-sans font-medium px-3.5 py-1.5 rounded-full border border-white/20 backdrop-blur-md flex items-center gap-2 shadow-xl">
                <Eye className="w-3.5 h-3.5 text-white" />
                İncele
              </span>
            </div>
          )}
        </div>
      ) : null}

      {/* 4. REFINED FOOTER */}
      <PostCardFooter
        post={post}
        onLike={onLike}
        onSave={onSave}
        onOpenComments={onOpenComments}
        onShare={onShare}
        onTip={onTip}
      />
    </article>
  );
};
