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
  Check,
  Upload,
  Loader2,
  FileText,
  ShieldCheck,
  Lock,
  CheckCircle2,
  HelpCircle,
  XCircle,
  Flame,
  Sparkles,
  Eye,
  Heart,
  Users,
  Bookmark
} from 'lucide-react';
import { noirApi } from '../services/noirApi';
import {
  DEFAULT_AVATAR_URL,
  DEFAULT_COVER_URL,
  PROFILE_BOUNDARY_OPTIONS,
  PROFILE_INTEREST_OPTIONS,
  PROFILE_LOOKING_FOR_OPTIONS,
} from '../constants/profile';

interface ProfileProps {
  user: UserProfile;
  currentUser?: UserProfile;
  posts: Post[];
  walletBalance: number;
  isUserSubscribed: boolean;
  isFollowing?: boolean;
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
  onUpdateUser?: (updated: Partial<UserProfile>) => Promise<boolean | void> | boolean | void;
  onBack?: () => void;
  onToggleFollow?: (userId: string) => void;
  onStartChat?: (user: UserProfile) => void;
  onOpenAuth?: () => void;
}

type MainDossierTab = 'overview' | 'dispatches' | 'saved';
type ProfileTab = 'all' | 'photo' | 'video' | 'text';

export const Profile: React.FC<ProfileProps> = ({
  user,
  currentUser,
  posts,
  walletBalance,
  isUserSubscribed,
  isFollowing = false,
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
  onBack,
  onToggleFollow,
  onStartChat,
  onOpenAuth,
}) => {
  const isOwnProfile = !currentUser?.isGuest && currentUser?.id === user.id;

  const [mainTab, setMainTab] = useState<MainDossierTab>('overview');
  const [activeTab, setActiveTab] = useState<ProfileTab>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  // Edit profile form state
  const [editName, setEditName] = useState(user.name);
  const [editUsername, setEditUsername] = useState(user.username || '');
  const [editBio, setEditBio] = useState(user.bio);
  const [editLocation, setEditLocation] = useState(user.location || '');
  const [editAge, setEditAge] = useState<number | ''>(user.age ?? '');
  const [editGender, setEditGender] = useState(user.gender || 'unspecified');
  const [editOrientation, setEditOrientation] = useState(user.orientation || '');
  const [editAvatar, setEditAvatar] = useState(user.avatar || DEFAULT_AVATAR_URL);
  const [editCover, setEditCover] = useState(user.coverImage || DEFAULT_COVER_URL);
  const [editInterests, setEditInterests] = useState<string[]>(user.interests || []);
  const [editLookingFor, setEditLookingFor] = useState<string[]>(user.lookingFor || []);
  const [editBoundaries, setEditBoundaries] = useState<string[]>(user.boundaries || []);
  const [editIsPrivate, setEditIsPrivate] = useState<boolean>(!!user.isPrivate);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isUploadingCover, setIsUploadingCover] = useState(false);

  React.useEffect(() => {
    setEditName(user.name);
    setEditUsername(user.username || '');
    setEditBio(user.bio);
    setEditLocation(user.location || '');
    setEditAge(user.age ?? '');
    setEditGender(user.gender || 'unspecified');
    setEditOrientation(user.orientation || '');
    setEditAvatar(user.avatar || DEFAULT_AVATAR_URL);
    setEditCover(user.coverImage || DEFAULT_COVER_URL);
    setEditInterests(user.interests || []);
    setEditLookingFor(user.lookingFor || []);
    setEditBoundaries(user.boundaries || []);
    setEditIsPrivate(!!user.isPrivate);
  }, [user]);

  const [savedPosts, setSavedPosts] = useState<Post[]>([]);
  const [isLoadingSaved, setIsLoadingSaved] = useState<boolean>(false);

  React.useEffect(() => {
    if (mainTab === 'saved' && user?.id) {
      setIsLoadingSaved(true);
      noirApi.getSavedPosts(user.id)
        .then(res => setSavedPosts(res))
        .catch(err => console.error('Error loading saved posts:', err))
        .finally(() => setIsLoadingSaved(false));
    }
  }, [mainTab, user?.id]);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) setEditAvatar(result);
    };
    reader.readAsDataURL(file);

    try {
      setIsUploadingAvatar(true);
      const url = await noirApi.uploadImage(file, 'avatars');
      if (url) {
        setEditAvatar(url);
      }
    } catch (err) {
      console.warn('Avatar upload fallback:', err);
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setIsUploadingCover(true);
      const url = await noirApi.uploadImage(file, 'covers');
      if (url) setEditCover(url);
    } catch (err) {
      console.warn('Cover upload failed:', err);
      onToast?.({ text: 'Kapak görseli yüklenemedi.', type: 'error' });
    } finally {
      setIsUploadingCover(false);
    }
  };

  const toggleOption = (value: string, selected: string[], setSelected: React.Dispatch<React.SetStateAction<string[]>>) => {
    setSelected(selected.includes(value) ? selected.filter(item => item !== value) : [...selected, value]);
  };

  React.useEffect(() => {
    if (!isEditingProfile) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsEditingProfile(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isEditingProfile]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanUsername = editUsername.trim().toLowerCase().replace(/[^a-z0-9_]/g, '');
    if (!cleanUsername || cleanUsername.length < 3) {
      onToast?.({ text: 'Kullanıcı adı en az 3 karakter olmalı ve yalnızca harf, rakam ve alt çizgi içermelidir.', type: 'error' });
      return;
    }
    if (cleanUsername.length > 30) {
      onToast?.({ text: 'Kullanıcı adı 30 karakterden uzun olamaz.', type: 'error' });
      return;
    }

    if (onUpdateUser) {
      const res = await onUpdateUser({
        name: editName,
        username: cleanUsername,
        bio: editBio,
        location: editLocation,
        age: editAge === '' ? undefined : editAge,
        gender: editGender,
        orientation: editOrientation,
        avatar: editAvatar,
        coverImage: editCover,
        interests: editInterests,
        lookingFor: editLookingFor,
        boundaries: editBoundaries,
        isPrivate: editIsPrivate,
      });
      if (res === false) {
        return;
      }
    }
    setIsEditingProfile(false);
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
        isOwnProfile={isOwnProfile}
        isFollowing={isFollowing}
        onSubscribe={onSubscribe}
        onOpenWallet={onOpenWallet}
        onOpenCreatePost={onOpenCreatePost}
        onEditProfile={() => setIsEditingProfile(true)}
        onToggleFollow={() => onToggleFollow?.(user.id)}
        onStartChat={() => onStartChat?.(user)}
        onBack={onBack}
      />
      {/* EDIT PROFILE MODAL */}
      {isEditingProfile && (
        <div
          onClick={() => setIsEditingProfile(false)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn cursor-pointer"
        >
          <div
            className="bg-[#111113] border border-white/[0.12] rounded-xl w-full max-w-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col cursor-default"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 px-5 border-b border-white/[0.08] flex items-center justify-between shrink-0 bg-[#111113]">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[#C5A880]" />
                <h3 className="font-serif text-sm text-[#F1EFEA] font-medium">Edit Member Dossier</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsEditingProfile(false)}
                aria-label="Close edit profile"
                className="p-1 rounded-full text-[#9A9996] hover:text-[#F1EFEA] hover:bg-white/10 transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="p-5 space-y-4 overflow-y-auto flex-1 font-sans">
              <div>
                <label className="block text-[11px] font-mono text-[#9A9996] mb-1">Full Name</label>
                <input
                  type="text"
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                  required
                  className="w-full px-3.5 py-2 text-xs rounded-xl bg-[#1A1A1E] border border-white/[0.08] text-[#F1EFEA] outline-none focus:border-[#C5A880]/50"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono text-[#9A9996] mb-1">Username (@handle)</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#66666A] font-mono text-xs">@</span>
                  <input
                    type="text"
                    value={editUsername}
                    onChange={e => setEditUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                    required
                    placeholder="username"
                    className="w-full pl-8 pr-3.5 py-2 text-xs rounded-xl bg-[#1A1A1E] border border-white/[0.08] text-[#F1EFEA] outline-none focus:border-[#C5A880]/50 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-mono text-[#9A9996] mb-1">Bio / Personal Ethos</label>
                <textarea
                  rows={3}
                  value={editBio}
                  onChange={e => setEditBio(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl bg-[#1A1A1E] border border-white/[0.08] text-[#F1EFEA] outline-none focus:border-[#C5A880]/50"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-mono text-[#9A9996] mb-1">Age</label>
                  <input
                    type="number"
                    value={editAge}
                    onChange={e => setEditAge(e.target.value === '' ? '' : Number(e.target.value))}
                    min={18}
                    max={99}
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-[#1A1A1E] border border-white/[0.08] text-[#F1EFEA] outline-none focus:border-[#C5A880]/50"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-[#9A9996] mb-1">Location / Chapter</label>
                  <input
                    type="text"
                    value={editLocation}
                    onChange={e => setEditLocation(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-[#1A1A1E] border border-white/[0.08] text-[#F1EFEA] outline-none focus:border-[#C5A880]/50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-mono text-[#9A9996] mb-1">Gender</label>
                  <select
                    value={editGender}
                    onChange={e => setEditGender(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-[#1A1A1E] border border-white/[0.08] text-[#F1EFEA] outline-none focus:border-[#C5A880]/50"
                  >
                    <option value="unspecified">Belirtmek istemiyorum</option>
                    <option value="Woman">Woman</option>
                    <option value="Man">Man</option>
                    <option value="Non-Binary">Non-Binary</option>
                    <option value="Couple">Couple / Duo</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-[#9A9996] mb-1">Sexual Orientation</label>
                  <select
                    value={editOrientation}
                    onChange={e => setEditOrientation(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-[#1A1A1E] border border-white/[0.08] text-[#F1EFEA] outline-none focus:border-[#C5A880]/50"
                  >
                    <option value="">Belirtmek istemiyorum</option>
                    <option value="Heterosexual">Heterosexual</option>
                    <option value="Bisexual">Bisexual</option>
                    <option value="Gay / Lesbian">Gay / Lesbian</option>
                    <option value="Pansexual">Pansexual</option>
                    <option value="Queer">Queer</option>
                  </select>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-[11px] font-mono text-[#9A9996]">Avatar Image</label>
                  <label className="text-xs text-[#C5A880] hover:text-[#B89B6E] flex items-center gap-1.5 cursor-pointer bg-white/5 hover:bg-white/10 px-2.5 py-1 rounded-full border border-white/10 transition-colors">
                    {isUploadingAvatar ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Uploading...</span>
                      </>
                    ) : (
                      <>
                        <Upload className="w-3.5 h-3.5" />
                        <span>Upload Photo</span>
                      </>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      disabled={isUploadingAvatar}
                      onChange={handleAvatarUpload}
                      className="hidden"
                    />
                  </label>
                </div>
                <div className="flex items-center gap-3">
                  <img src={editAvatar} alt="Avatar Preview" className="w-10 h-10 rounded-full object-cover border border-white/20 shrink-0 bg-[#1A1A1E]" />
                  <input
                    type="text"
                    value={editAvatar}
                    onChange={e => setEditAvatar(e.target.value)}
                    placeholder="or paste image URL..."
                    className="flex-1 px-3.5 py-2 text-xs rounded-xl bg-[#1A1A1E] border border-white/[0.08] text-[#F1EFEA] outline-none focus:border-[#C5A880]/50"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-[11px] font-mono text-[#9A9996]">Profil Kapak Görseli</label>
                  <label className="text-xs text-[#C5A880] hover:text-[#B89B6E] flex items-center gap-1.5 cursor-pointer bg-white/5 hover:bg-white/10 px-2.5 py-1 rounded-full border border-white/10 transition-colors">
                    {isUploadingCover ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                    <span>{isUploadingCover ? 'Yükleniyor...' : 'Kapak yükle'}</span>
                    <input type="file" accept="image/*" disabled={isUploadingCover} onChange={handleCoverUpload} className="hidden" />
                  </label>
                </div>
                <div className="overflow-hidden rounded-lg border border-white/[0.08] bg-[#09090B]">
                  <img src={editCover} alt="Kapak önizlemesi" className="h-24 w-full object-cover" />
                </div>
              </div>

              {[
                { title: 'İlgi Alanları', options: PROFILE_INTEREST_OPTIONS, selected: editInterests, setter: setEditInterests },
                { title: 'Aradıklarım / Dinamikler', options: PROFILE_LOOKING_FOR_OPTIONS, selected: editLookingFor, setter: setEditLookingFor },
                { title: 'Sınırlarım', options: PROFILE_BOUNDARY_OPTIONS, selected: editBoundaries, setter: setEditBoundaries },
              ].map(group => (
                <fieldset key={group.title} className="space-y-2">
                  <legend className="text-[11px] font-mono text-[#9A9996]">{group.title}</legend>
                  <div className="flex flex-wrap gap-2">
                    {group.options.map(option => {
                      const active = group.selected.includes(option);
                      return (
                        <button
                          key={option}
                          type="button"
                          aria-pressed={active}
                          onClick={() => toggleOption(option, group.selected, group.setter)}
                          className={`rounded-full border px-3 py-1.5 text-[11px] transition-colors ${active
                            ? 'border-[#C5A880]/60 bg-[#C5A880]/15 text-[#F1EFEA]'
                            : 'border-white/[0.08] bg-[#1A1A1E] text-[#9A9996] hover:border-white/20 hover:text-[#F1EFEA]'
                          }`}
                        >
                          {option}
                        </button>
                      );
                    })}
                  </div>
                </fieldset>
              ))}

              <div className="pt-2 border-t border-white/[0.08]">
                <label className="flex items-center gap-3 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={editIsPrivate}
                    onChange={e => setEditIsPrivate(e.target.checked)}
                    className="w-4 h-4 rounded-md border-white/20 text-[#C5A880] focus:ring-0 bg-[#1A1A1E] accent-[#C5A880]"
                  />
                  <div>
                    <span className="text-xs text-[#F1EFEA] font-medium flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-amber-400" />
                      <span>Gizli Profil (Private Account)</span>
                    </span>
                    <span className="text-[11px] text-[#9A9996] block">
                      Açıkken sadece onayladığınız üyeler fotoğraf ve dispatches içeriklerinizi görebilir.
                    </span>
                  </div>
                </label>
              </div>

              <div className="pt-3 border-t border-white/[0.08] flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsEditingProfile(false)}
                  className="px-4 py-2 text-xs rounded-full text-[#9A9996] hover:text-[#F1EFEA] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-full font-sans font-medium text-xs bg-[#F1EFEA] hover:bg-[#E5E3DE] text-[#09090B] transition-colors cursor-pointer"
                >
                  Save Dossier
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. PRIVATE PROFILE LOCK FOR VISITORS / NON-FOLLOWERS */}
      {user.isPrivate && !isOwnProfile && !isFollowing ? (
        <div className="py-20 px-6 rounded-2xl bg-[#111113] border border-white/[0.08] text-center flex flex-col items-center justify-center my-6 max-w-xl mx-auto shadow-2xl animate-in fade-in zoom-in-95 duration-200">
          <div className="w-16 h-16 rounded-full bg-[#1A1A1E] border border-white/10 flex items-center justify-center mb-4 text-[#C5A880]">
            <Lock className="w-7 h-7 stroke-[1.5]" />
          </div>
          <span className="px-3 py-1 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20 text-xs font-mono uppercase tracking-wider mb-2">
            Gizli Profil
          </span>
          <h3 className="font-serif text-2xl text-[#F1EFEA] font-normal mb-2">Bu Hesap Gizlidir</h3>
          <p className="text-xs text-[#9A9996] max-w-sm mb-6 leading-relaxed font-sans">
            Bu kullanıcının paylaşımlarını, fotoğraf mahzenini ve özel salon dispatches akışını görebilmek için onaylı üye olmalı ve takip isteği göndermelisiniz.
          </p>
          {currentUser?.isGuest ? (
            <button
              onClick={onOpenAuth}
              className="px-6 py-2.5 rounded-full bg-[#F1EFEA] hover:bg-[#E5E3DE] text-[#09090B] font-medium text-xs shadow-lg cursor-pointer transition-all"
            >
              Giriş Yap / Üye Ol
            </button>
          ) : (
            <button
              onClick={() => onToggleFollow?.(user.id)}
              className="px-6 py-2.5 rounded-full bg-[#F1EFEA] hover:bg-[#E5E3DE] text-[#09090B] font-medium text-xs transition-colors cursor-pointer"
            >
              {isFollowing ? '✓ Takip İsteği Gönderildi' : 'Takip İsteği Gönder'}
            </button>
          )}
        </div>
      ) : (
        <>
          {/* 2. ADULT COMMUNITY DOSSIER NAVIGATION BAR */}
          <div className="border-b border-white/[0.08] pb-1">
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
              <button
                onClick={() => setMainTab('overview')}
                className={`px-4 py-2 rounded-xl text-xs font-sans whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer ${
                  mainTab === 'overview'
                    ? 'bg-[#1A1A1E] text-[#F1EFEA] border border-white/10 shadow-xs font-medium'
                    : 'text-[#9A9996] hover:text-[#F1EFEA] hover:bg-white/[0.04]'
                }`}
              >
                <FileText className="w-3.5 h-3.5 text-[#C5A880]" />
                <span>Dossier Özeti & Tercihler</span>
              </button>

              <button
                onClick={() => setMainTab('dispatches')}
                className={`px-4 py-2 rounded-xl text-xs font-sans whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer ${
                  mainTab === 'dispatches'
                    ? 'bg-[#1A1A1E] text-[#F1EFEA] border border-white/10 shadow-xs font-medium'
                    : 'text-[#9A9996] hover:text-[#F1EFEA] hover:bg-white/[0.04]'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-[#C5A880]" />
                <span>Dispatches ({posts.length})</span>
              </button>

              {isOwnProfile && (
                <button
                  onClick={() => setMainTab('saved')}
                  className={`px-4 py-2 rounded-xl text-xs font-sans whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer ${
                    mainTab === 'saved'
                      ? 'bg-[#1A1A1E] text-[#F1EFEA] border border-white/10 shadow-xs font-medium'
                      : 'text-[#9A9996] hover:text-[#F1EFEA] hover:bg-white/[0.04]'
                  }`}
                >
                  <Bookmark className="w-3.5 h-3.5 text-[#C5A880]" />
                  <span>Kaydedilenler</span>
                </button>
              )}
            </div>
          </div>

          {/* 3. TAB CONTENT RENDERING */}
          {mainTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 font-sans">
              <div className="space-y-6">
                {/* Extended About Dossier */}
                <div className="p-6 rounded-xl bg-[#111113] border border-white/[0.08] space-y-3 shadow-xl">
                  <div className="flex items-center gap-2 text-xs font-mono text-[#C5A880] uppercase tracking-wider">
                    <FileText className="w-3.5 h-3.5" />
                    <span>Personal Ethos & Background</span>
                  </div>
                  {user.bio ? (
                    <p className="text-sm text-[#F1EFEA] font-light leading-relaxed">{user.bio}</p>
                  ) : (
                    <p className="text-xs text-[#66666A] leading-relaxed">Henüz bir profil açıklaması eklenmemiş.</p>
                  )}
                </div>

                {/* Verification & Trust Attestation */}
                <div className="p-6 rounded-xl bg-[#111113] border border-white/[0.08] space-y-3 shadow-xl">
                  <div className="flex items-center gap-2 text-xs font-mono text-[#C5A880] uppercase tracking-wider">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Attestation & Discretion</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div className="p-3.5 rounded-lg bg-[#1A1A1E] border border-white/[0.04] space-y-1">
                      <span className="text-xs text-[#F1EFEA] font-medium block">
                        {user.isVerified ? 'Maison Attested Patron' : 'Member Status'}
                      </span>
                      <span className="text-[11px] text-[#9A9996] block leading-snug">
                        {user.isVerified
                          ? 'Kimlik ve fotoğraf teyidi yapılmış doğrulanmış cemiyet üyesi.'
                          : 'Major Club Société Privée kayıtlı üye profili.'}
                      </span>
                    </div>

                    <div className="p-3.5 rounded-lg bg-[#1A1A1E] border border-white/[0.04] space-y-1">
                      <span className="text-xs text-[#F1EFEA] font-medium block">
                        {user.isPrivate ? 'Discreet Profile' : 'Open Directory'}
                      </span>
                      <span className="text-[11px] text-[#9A9996] block leading-snug">
                        {user.isPrivate
                          ? 'Fotoğraf ve dispatches mahzeni yalnızca onaylı bağlantılara açıktır.'
                          : 'Paylaşımlar kulüp içi üyelerle paylaşılmaktadır.'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="p-6 rounded-xl bg-[#111113] border border-white/[0.08] space-y-4 shadow-xl">
                  <span className="text-xs font-mono text-[#C5A880] uppercase tracking-wider block">
                    İlgi Alanları & Aradıklarım
                  </span>
                  {[
                    { label: 'İlgi alanları', values: user.interests || [] },
                    { label: 'Aradıklarım / Dinamikler', values: user.lookingFor || [] },
                    { label: 'Sınırlarım', values: user.boundaries || [] },
                  ].map(group => (
                    <div key={group.label} className="space-y-2 border-t border-white/[0.04] pt-3 first:border-0 first:pt-0">
                      <span className="text-[10px] uppercase tracking-wider text-[#66666A]">{group.label}</span>
                      {group.values.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {group.values.map(value => (
                            <span key={value} className="rounded-full border border-white/[0.08] bg-[#1A1A1E] px-2.5 py-1 text-[11px] text-[#F1EFEA]">{value}</span>
                          ))}
                        </div>
                      ) : (
                        <p className="text-[11px] text-[#66666A]">Henüz seçim yapılmamış.</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

      {/* DISPATCHES TAB (EXISTING POSTS FEED) */}
      {mainTab === 'dispatches' && (
        <div className="space-y-6">
          {/* Quiet Luxury Pill Tabs & View Switcher */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="inline-flex items-center p-1 rounded-full bg-[#111113] border border-white/[0.08] overflow-x-auto no-scrollbar max-w-full">
              <button
                onClick={() => setActiveTab('all')}
                className={`px-4 py-1.5 rounded-full text-xs font-sans transition-all whitespace-nowrap cursor-pointer ${
                  activeTab === 'all'
                    ? 'bg-[#1A1A1E] text-white font-medium border border-white/10 shadow-xs'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                All Dispatches ({posts.length})
              </button>

              <button
                onClick={() => setActiveTab('photo')}
                className={`px-4 py-1.5 rounded-full text-xs font-sans transition-all whitespace-nowrap cursor-pointer ${
                  activeTab === 'photo'
                    ? 'bg-[#1A1A1E] text-[#F1EFEA] font-medium border border-white/10 shadow-xs'
                    : 'text-[#9A9996] hover:text-[#F1EFEA]'
                }`}
              >
                Photography ({photoCount})
              </button>

              <button
                onClick={() => setActiveTab('video')}
                className={`px-4 py-1.5 rounded-full text-xs font-sans transition-all whitespace-nowrap cursor-pointer ${
                  activeTab === 'video'
                    ? 'bg-[#1A1A1E] text-[#F1EFEA] font-medium border border-white/10 shadow-xs'
                    : 'text-[#9A9996] hover:text-[#F1EFEA]'
                }`}
              >
                Cinematic ({videoCount})
              </button>
            </div>

            {/* Grid / Stream Switcher */}
            <div className="inline-flex items-center p-1 rounded-full bg-[#111113] border border-white/[0.08] shrink-0 self-start sm:self-auto">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-full transition-colors cursor-pointer ${
                  viewMode === 'grid'
                    ? 'bg-[#1A1A1E] text-[#F1EFEA] shadow-xs'
                    : 'text-[#9A9996] hover:text-[#F1EFEA]'
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
                    ? 'bg-[#1A1A1E] text-[#F1EFEA] shadow-xs'
                    : 'text-[#9A9996] hover:text-[#F1EFEA]'
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
                  currentUser={currentUser}
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
      )}

      {/* SAVED POSTS TAB (PERSONAL ARCHIVE) */}
      {mainTab === 'saved' && (
        <div className="space-y-6">
          <div className="p-4 rounded-xl bg-[#111113] border border-white/[0.08] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bookmark className="w-4 h-4 text-[#C5A880]" />
              <span className="text-xs text-[#F1EFEA] font-medium">Kişisel Arşiv & Kaydedilen Gönderiler</span>
            </div>
            <span className="text-xs text-[#9A9996]">{savedPosts.length} gönderi kayıtlı</span>
          </div>

          {isLoadingSaved ? (
            <div className="py-20 text-center flex flex-col items-center justify-center">
              <Loader2 className="w-6 h-6 animate-spin text-[#C5A880] mb-2" />
              <span className="text-xs text-[#9A9996]">Kaydedilen gönderiler yükleniyor...</span>
            </div>
          ) : savedPosts.length === 0 ? (
            <EmptyState
              variant="posts"
              title="Henüz kaydedilen gönderi yok"
              description="Akışta veya keşfette ilginizi çeken salon gönderilerini kaydederek kişisel mahzeninizde arşivleyebilirsiniz."
              actionLabel="Akışı İncele"
              onAction={onBack}
            />
          ) : (
            <div className="max-w-2xl mx-auto space-y-6">
              {savedPosts.map(post => (
                <PostCard
                  key={post.id}
                  post={post}
                  currentUser={currentUser}
                  isUserSubscribed={isUserSubscribed}
                  walletBalance={walletBalance}
                  onLike={onLike}
                  onSave={(id) => {
                    onSave(id);
                    setSavedPosts(prev => prev.filter(p => p.id !== id));
                  }}
                  onOpenComments={onOpenComments}
                  onOpenMedia={onOpenMedia}
                  onUnlockPPV={onUnlockPPV}
                  onSubscribeClick={onSubscribe}
                  onShare={onShare}
                />
              ))}
            </div>
          )}
        </div>
      )}
        </>
      )}

    </div>
  );
};
