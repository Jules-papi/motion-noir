import React, { useState } from 'react';
import { 
  UserProfile, 
  Post 
} from '../types';
import { PostCard } from './PostCard';
import { ProfileHeader } from './ProfileHeader';
import { RelationshipPartnerCard } from './RelationshipPartnerCard';
import { ProfilePostGridItem } from './ProfilePostGridItem';
import { EmptyState } from './EmptyState';
import { PrivateVaultModal } from './PrivateVaultModal';
import { 
  Crown, 
  Grid, 
  List, 
  KeyRound,
  ShieldCheck,
  Sparkles,
  Plane,
  Calendar,
  MapPin,
  Compass,
  Edit3,
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
}

type ProfileTab = 'all' | 'photo' | 'video' | 'text' | 'subscription' | 'ppv';

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
  onViewPartnerProfile,
  onToast,
}) => {
  const [activeTab, setActiveTab] = useState<ProfileTab>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isVaultOpen, setIsVaultOpen] = useState(false);
  const [isEditingTravel, setIsEditingTravel] = useState(false);
  const [travelCity, setTravelCity] = useState(user.travelPassport?.city || 'Amsterdam');
  const [travelCountry, setTravelCountry] = useState(user.travelPassport?.country || 'Hollanda');
  const [travelStartDate, setTravelStartDate] = useState(user.travelPassport?.startDate || '24 Ekim 2026');
  const [travelEndDate, setTravelEndDate] = useState(user.travelPassport?.endDate || '29 Ekim 2026');
  const [travelIntent, setTravelIntent] = useState(user.travelPassport?.intent || 'Villa Swinger Party & Noord Salonları');
  const [travelActive, setTravelActive] = useState(user.travelPassport?.isActive ?? true);

  const handleSaveTravel = (e: React.FormEvent) => {
    e.preventDefault();
    setIsEditingTravel(false);
    onToast?.({ text: 'Seyahat Pasaportu ve Rota güncellendi.', type: 'success' });
  };

  // Filter posts based on active tab
  const filteredPosts = posts.filter(post => {
    if (activeTab === 'all') return true;
    if (activeTab === 'photo') return post.type === 'photo';
    if (activeTab === 'video') return post.type === 'video';
    if (activeTab === 'text') return post.type === 'text';
    if (activeTab === 'subscription') return post.isSubscribersOnly;
    if (activeTab === 'ppv') return post.isPPV;
    return true;
  });

  const photoCount = posts.filter(p => p.type === 'photo').length;
  const videoCount = posts.filter(p => p.type === 'video').length;
  const textCount = posts.filter(p => p.type === 'text').length;
  const subCount = posts.filter(p => p.isSubscribersOnly).length;
  const ppvCount = posts.filter(p => p.isPPV).length;

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
      />

      {/* 2. DUO DOSSIER & RELATIONSHIP CARD */}
      <RelationshipPartnerCard
        profileType="couple"
        relationshipStatus="open_relationship"
        partner={{
          partnerId: 'anna_nl',
          partnerName: 'Anna Van Dijk',
          partnerUsername: 'anna_amsterdam',
          partnerAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
          status: 'connected',
          connectedSince: '2 years',
          isPublicOnProfile: true,
        }}
        coupleDetails={{
          personA: { name: user.name, age: 31, gender: 'He / Him', avatar: user.avatar },
          personB: { name: 'Anna', age: 29, gender: 'She / Her', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80' },
          coupleBio: 'Amsterdam & Paris lifestyle couple. Intimate salons, private vernissages and like-minded companions.',
          coupleInterests: ['Salon Evenings', 'Fine Art & Noir Photography', 'Cap dAntibes Retreats'],
          lookingFor: ['Couples', 'Solo Femme', 'Salon Hosts'],
          photos: []
        }}
        onViewPartnerProfile={onViewPartnerProfile}
        onOpenVault={() => setIsVaultOpen(true)}
      />

      {/* 3. RENDEZVOUS TRAVEL PASSPORT / SEYAHAT ROTASI */}
      <div className="rounded-2xl bg-[#121419] border border-white/[0.08] p-6 sm:p-7 space-y-4 shadow-xl">
        <div className="flex items-center justify-between border-b border-white/[0.06] pb-3.5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#181B22] border border-[#E5C590]/30 flex items-center justify-center text-[#E5C590]">
              <Plane className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-mono tracking-[0.2em] text-[#E5C590] uppercase block">
                Rendezvous Passport
              </span>
              <h3 className="font-serif text-base sm:text-lg text-white font-normal">
                Gelecek Şehir & Salon Seyahat Rotası
              </h3>
            </div>
          </div>

          <button
            onClick={() => setIsEditingTravel(!isEditingTravel)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-sans bg-[#181B22] border border-white/10 hover:border-white/20 text-zinc-300 hover:text-white transition-all cursor-pointer"
          >
            <Edit3 className="w-3.5 h-3.5 text-[#E5C590]" />
            <span>{isEditingTravel ? 'İptal' : 'Rotayı Düzenle'}</span>
          </button>
        </div>

        {isEditingTravel ? (
          <form onSubmit={handleSaveTravel} className="space-y-4 pt-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="text-[10px] font-mono uppercase text-zinc-400 block mb-1">Hedef Şehir</label>
                <input
                  type="text"
                  value={travelCity}
                  onChange={e => setTravelCity(e.target.value)}
                  placeholder="örn. Amsterdam, Paris, Berlin..."
                  className="w-full px-3 py-2 text-xs rounded-xl bg-[#181B22] border border-white/[0.08] text-white outline-none focus:border-[#E5C590]/50"
                />
              </div>
              <div>
                <label className="text-[10px] font-mono uppercase text-zinc-400 block mb-1">Ülke</label>
                <input
                  type="text"
                  value={travelCountry}
                  onChange={e => setTravelCountry(e.target.value)}
                  placeholder="örn. Hollanda, Fransa..."
                  className="w-full px-3 py-2 text-xs rounded-xl bg-[#181B22] border border-white/[0.08] text-white outline-none focus:border-[#E5C590]/50"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="text-[10px] font-mono uppercase text-zinc-400 block mb-1">Başlangıç Tarihi</label>
                <input
                  type="text"
                  value={travelStartDate}
                  onChange={e => setTravelStartDate(e.target.value)}
                  placeholder="örn. 24 Ekim 2026"
                  className="w-full px-3 py-2 text-xs rounded-xl bg-[#181B22] border border-white/[0.08] text-white outline-none focus:border-[#E5C590]/50"
                />
              </div>
              <div>
                <label className="text-[10px] font-mono uppercase text-zinc-400 block mb-1">Bitiş Tarihi</label>
                <input
                  type="text"
                  value={travelEndDate}
                  onChange={e => setTravelEndDate(e.target.value)}
                  placeholder="örn. 29 Ekim 2026"
                  className="w-full px-3 py-2 text-xs rounded-xl bg-[#181B22] border border-white/[0.08] text-white outline-none focus:border-[#E5C590]/50"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-mono uppercase text-zinc-400 block mb-1">Seyahat Amacı & İlgi</label>
              <input
                type="text"
                value={travelIntent}
                onChange={e => setTravelIntent(e.target.value)}
                placeholder="örn. Villa Swinger Party, Darkroom Salonları..."
                className="w-full px-3 py-2 text-xs rounded-xl bg-[#181B22] border border-white/[0.08] text-white outline-none focus:border-[#E5C590]/50"
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <label className="flex items-center gap-2 cursor-pointer text-xs text-zinc-300">
                <input
                  type="checkbox"
                  checked={travelActive}
                  onChange={e => setTravelActive(e.target.checked)}
                  className="rounded accent-[#E5C590]"
                />
                <span>Bu rotayı keşfet sayfasındaki yerel üyelere açık göster</span>
              </label>

              <button
                type="submit"
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-sans bg-[#E5C590] text-black font-semibold hover:bg-[#d9b880] transition-colors cursor-pointer"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Kaydet & Yayınla</span>
              </button>
            </div>
          </form>
        ) : (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-[#181B22] border border-white/[0.06]">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#E5C590]" />
                <span className="font-serif text-sm sm:text-base text-white font-medium">
                  {travelCity}, {travelCountry}
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-950/60 text-emerald-300 border border-emerald-500/30">
                  Planlandı
                </span>
              </div>
              <div className="flex items-center gap-3 text-xs text-zinc-400 font-sans">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-zinc-500" />
                  {travelStartDate} – {travelEndDate}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1 text-zinc-300">
                  <Compass className="w-3.5 h-3.5 text-[#E5C590]" />
                  {travelIntent}
                </span>
              </div>
            </div>

            <span className="text-[11px] font-sans text-zinc-400 bg-white/[0.03] px-3 py-1.5 rounded-lg border border-white/[0.06] text-right">
              {travelCity} salon üyeleri gelişinizi görebilir
            </span>
          </div>
        )}
      </div>

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

            <button
              onClick={() => setActiveTab('subscription')}
              className={`px-4 py-1.5 rounded-full text-xs font-sans transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'subscription'
                  ? 'bg-[#181B22] text-[#E5C590] font-medium border border-[#E5C590]/25 shadow-xs'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Crown className="w-3.5 h-3.5 text-[#E5C590]" />
              <span>Privé ({subCount})</span>
            </button>

            <button
              onClick={() => setIsVaultOpen(true)}
              className="px-4 py-1.5 rounded-full text-xs font-sans text-[#E5C590] hover:text-white transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer"
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>Private Vault</span>
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

      {/* Private Vault Modal */}
      {isVaultOpen && (
        <PrivateVaultModal
          isOpen={isVaultOpen}
          targetUser={user}
          currentUser={user}
          onClose={() => setIsVaultOpen(false)}
          onToast={onToast}
        />
      )}
    </div>
  );
};
