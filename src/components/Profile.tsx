import React, { useState } from 'react';
import { 
  UserProfile, 
  Post 
} from '../types';
import { PostCard } from './PostCard';
import { ProfileHeader } from './ProfileHeader';
import { ProfilePostGridItem } from './ProfilePostGridItem';
import { EmptyState } from './EmptyState';
import { 
  Grid, 
  List, 
  Check
} from 'lucide-react';

interface ProfileProps {
  user: UserProfile;
  posts: Post[];
  walletBalance: number;
  isUserSubscribed: boolean;
  onSubscribe: () => void;
  onOpenWallet: () => void;
  onOpenCreatePost: () => void;
  onLike: (postId: string) => void;
  onSave: (postId: string) => void;
  onOpenComments: (post: Post) => void;
  onOpenMedia: (post: Post) => void;
  onUnlockPPV: (post: Post) => void;
  onShare: (post: Post) => void;
  onViewPartnerProfile?: (username: string) => void;
  onToast?: (msg: { text: string; type: 'success' | 'info' | 'error' }) => void;
  onUpdateUser?: (updated: Partial<UserProfile>) => void;
}

type ProfileTab = 'all' | 'photo' | 'video' | 'text';

export const Profile: React.FC<ProfileProps> = ({
  user,
  posts,
  walletBalance,
  isUserSubscribed,
  onSubscribe,
  onOpenWallet,
  onOpenCreatePost,
  onLike,
  onSave,
  onOpenComments,
  onOpenMedia,
  onUnlockPPV,
  onShare,
  onToast,
  onUpdateUser,
}) => {
  const [activeTab, setActiveTab] = useState<ProfileTab>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  // Edit profile form state
  const [editName, setEditName] = useState(user.name);
  const [editBio, setEditBio] = useState(user.bio);
  const [editLocation, setEditLocation] = useState(user.location || 'Amsterdam Chapter');
  const [editAge, setEditAge] = useState<number>(user.age || 29);
  const [editGender, setEditGender] = useState(user.gender || 'Woman');
  const [editOrientation, setEditOrientation] = useState(user.orientation || 'Heterosexual');
  const [editAvatar, setEditAvatar] = useState(user.avatar);

  React.useEffect(() => {
    if (!isEditingProfile) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsEditingProfile(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isEditingProfile]);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (onUpdateUser) {
      onUpdateUser({
        name: editName,
        bio: editBio,
        location: editLocation,
        age: editAge,
        gender: editGender,
        orientation: editOrientation,
        avatar: editAvatar,
      });
    }
    setIsEditingProfile(false);
    onToast?.({ text: 'Member dossier updated successfully.', type: 'success' });
  };

  // Filter posts based on active tab
  const filteredPosts = posts.filter(post => {
    if (activeTab === 'all') return true;
    if (activeTab === 'photo') return post.type === 'photo';
    if (activeTab === 'video') return post.type === 'video';
    if (activeTab === 'text') return post.type === 'text';
    return true;
  });

  const photoCount = posts.filter(p => p.type === 'photo').length;
  const videoCount = posts.filter(p => p.type === 'video').length;
  const textCount = posts.filter(p => p.type === 'text').length;

  return (
    <div className="w-full pb-24 space-y-8 max-w-5xl mx-auto">
      {/* 1. EDITORIAL HEADER & PORTRAIT HERO */}
      <ProfileHeader
        user={user}
        walletBalance={walletBalance}
        isUserSubscribed={isUserSubscribed}
        onSubscribe={onSubscribe}
        onOpenWallet={onOpenWallet}
        onOpenCreatePost={onOpenCreatePost}
        onEditProfile={() => setIsEditingProfile(true)}
      />
      {/* EDIT PROFILE MODAL */}
      {isEditingProfile && (
        <div 
          onClick={() => setIsEditingProfile(false)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn cursor-pointer"
        >
          <div 
            className="bg-[#0c0d11] border border-white/[0.12] rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden max-h-[90vh] flex flex-col cursor-default"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 px-5 border-b border-white/[0.08] flex items-center justify-between shrink-0 bg-[#121419]">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-[#E5C590]" />
                <h3 className="font-serif text-sm text-white font-medium">Edit Member Dossier</h3>
              </div>
              <button 
                type="button"
                onClick={() => setIsEditingProfile(false)}
                aria-label="Close edit profile"
                className="p-1 rounded-full text-zinc-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="p-5 space-y-4 overflow-y-auto flex-1 font-sans">
              <div>
                <label className="block text-[11px] font-mono text-zinc-400 mb-1">Full Name</label>
                <input
                  type="text"
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                  required
                  className="w-full px-3.5 py-2 text-xs rounded-xl bg-[#181B22] border border-white/[0.08] text-white outline-none focus:border-[#E5C590]/50"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono text-zinc-400 mb-1">Bio / Personal Ethos</label>
                <textarea
                  rows={3}
                  value={editBio}
                  onChange={e => setEditBio(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl bg-[#181B22] border border-white/[0.08] text-white outline-none focus:border-[#E5C590]/50"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-mono text-zinc-400 mb-1">Age</label>
                  <input
                    type="number"
                    value={editAge}
                    onChange={e => setEditAge(parseInt(e.target.value, 10) || 18)}
                    min={18}
                    max={99}
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-[#181B22] border border-white/[0.08] text-white outline-none focus:border-[#E5C590]/50"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-zinc-400 mb-1">Location / Chapter</label>
                  <input
                    type="text"
                    value={editLocation}
                    onChange={e => setEditLocation(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-[#181B22] border border-white/[0.08] text-white outline-none focus:border-[#E5C590]/50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-mono text-zinc-400 mb-1">Gender</label>
                  <select
                    value={editGender}
                    onChange={e => setEditGender(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-[#181B22] border border-white/[0.08] text-white outline-none focus:border-[#E5C590]/50"
                  >
                    <option value="Woman">Woman</option>
                    <option value="Man">Man</option>
                    <option value="Non-Binary">Non-Binary</option>
                    <option value="Couple">Couple / Duo</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-zinc-400 mb-1">Sexual Orientation</label>
                  <select
                    value={editOrientation}
                    onChange={e => setEditOrientation(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-[#181B22] border border-white/[0.08] text-white outline-none focus:border-[#E5C590]/50"
                  >
                    <option value="Heterosexual">Heterosexual</option>
                    <option value="Bisexual">Bisexual</option>
                    <option value="Gay / Lesbian">Gay / Lesbian</option>
                    <option value="Pansexual">Pansexual</option>
                    <option value="Queer">Queer</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-mono text-zinc-400 mb-1">Avatar Image URL</label>
                <input
                  type="text"
                  value={editAvatar}
                  onChange={e => setEditAvatar(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl bg-[#181B22] border border-white/[0.08] text-white outline-none focus:border-[#E5C590]/50"
                />
              </div>

              <div className="pt-3 border-t border-white/[0.08] flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsEditingProfile(false)}
                  className="px-4 py-2 text-xs rounded-full text-zinc-400 hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-full font-sans font-semibold text-xs bg-[#E5C590] hover:bg-[#d9b880] text-black transition-colors cursor-pointer"
                >
                  Save Dossier
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. MEDIA GALLERY & DISPATCH EXHIBITION */}
      <div className="space-y-6">
        {/* Quiet Luxury Pill Tabs & View Switcher */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="inline-flex items-center p-1 rounded-full bg-[#121419] border border-white/[0.08] overflow-x-auto no-scrollbar max-w-full">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-4 py-1.5 rounded-full text-xs font-sans transition-all whitespace-nowrap cursor-pointer ${
                activeTab === 'all'
                  ? 'bg-[#181B22] text-white font-medium border border-white/10 shadow-xs'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              All Dispatches ({posts.length})
            </button>

            <button
              onClick={() => setActiveTab('photo')}
              className={`px-4 py-1.5 rounded-full text-xs font-sans transition-all whitespace-nowrap cursor-pointer ${
                activeTab === 'photo'
                  ? 'bg-[#181B22] text-white font-medium border border-white/10 shadow-xs'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Photography ({photoCount})
            </button>

            <button
              onClick={() => setActiveTab('video')}
              className={`px-4 py-1.5 rounded-full text-xs font-sans transition-all whitespace-nowrap cursor-pointer ${
                activeTab === 'video'
                  ? 'bg-[#181B22] text-white font-medium border border-white/10 shadow-xs'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Cinematic ({videoCount})
            </button>
          </div>

          {/* Grid / Stream Switcher */}
          <div className="inline-flex items-center p-1 rounded-full bg-[#121419] border border-white/[0.08] shrink-0 self-start sm:self-auto">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-full transition-colors cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-[#181B22] text-white shadow-xs'
                  : 'text-zinc-400 hover:text-white'
              }`}
              title="Gallery Grid"
              aria-label="Gallery Grid"
            >
              <Grid className="w-4 h-4 stroke-[1.5]" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-full transition-colors cursor-pointer ${
                viewMode === 'list'
                  ? 'bg-[#181B22] text-white shadow-xs'
                  : 'text-zinc-400 hover:text-white'
              }`}
              title="Editorial Stream"
              aria-label="Editorial Stream"
            >
              <List className="w-4 h-4 stroke-[1.5]" />
            </button>
          </div>
        </div>

        {/* Content Stream or Photography Grid */}
        {filteredPosts.length === 0 ? (
          <EmptyState
            variant="posts"
            title="No dispatches found"
            description="No entries or photographs have been published under this category yet."
            actionLabel="Compose Dispatch"
            onAction={onOpenCreatePost}
          />
        ) : viewMode === 'list' ? (
          <div className="max-w-2xl mx-auto space-y-6">
            {filteredPosts.map(post => (
              <PostCard
                key={post.id}
                post={post}
                isUserSubscribed={isUserSubscribed}
                walletBalance={walletBalance}
                onLike={onLike}
                onSave={onSave}
                onOpenComments={onOpenComments}
                onOpenMedia={onOpenMedia}
                onUnlockPPV={onUnlockPPV}
                onSubscribeClick={onSubscribe}
                onShare={onShare}
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-5">
            {filteredPosts.map(post => (
              <ProfilePostGridItem
                key={post.id}
                post={post}
                isUserSubscribed={isUserSubscribed}
                onOpenMedia={onOpenMedia}
                onUnlockPPV={onUnlockPPV}
              />
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
