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
  Image,
  Calendar,
  ShieldCheck,
  Lock,
  CheckCircle2,
  HelpCircle,
  XCircle,
  Flame,
  Sparkles,
  Eye,
  Heart,
  Users
} from 'lucide-react';
import { noirApi } from '../services/noirApi';

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
  onUpdateUser?: (updated: Partial<UserProfile>) => void;
  onBack?: () => void;
  onToggleFollow?: (userId: string) => void;
  onStartChat?: (user: UserProfile) => void;
  onOpenAuth?: () => void;
}

type MainDossierTab = 'overview' | 'dispatches' | 'vault' | 'events';
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
  const [editBio, setEditBio] = useState(user.bio);
  const [editLocation, setEditLocation] = useState(user.location || 'Amsterdam Chapter');
  const [editAge, setEditAge] = useState<number>(user.age || 29);
  const [editGender, setEditGender] = useState(user.gender || 'Woman');
  const [editOrientation, setEditOrientation] = useState(user.orientation || 'Heterosexual');
  const [editAvatar, setEditAvatar] = useState(user.avatar);
  const [editIsPrivate, setEditIsPrivate] = useState<boolean>(!!user.isPrivate);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  React.useEffect(() => {
    setEditName(user.name);
    setEditBio(user.bio);
    setEditLocation(user.location || 'Amsterdam Chapter');
    setEditAge(user.age || 29);
    setEditGender(user.gender || 'Woman');
    setEditOrientation(user.orientation || 'Heterosexual');
    setEditAvatar(user.avatar);
    setEditIsPrivate(!!user.isPrivate);
  }, [user]);

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
        isPrivate: editIsPrivate,
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
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-[11px] font-mono text-zinc-400">Avatar Image</label>
                  <label className="text-xs text-[#E5C590] hover:text-[#d9b880] flex items-center gap-1.5 cursor-pointer bg-white/5 hover:bg-white/10 px-2.5 py-1 rounded-full border border-white/10 transition-colors">
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
                  <img src={editAvatar} alt="Avatar Preview" className="w-10 h-10 rounded-full object-cover border border-white/20 shrink-0 bg-[#121419]" />
                  <input
                    type="text"
                    value={editAvatar}
                    onChange={e => setEditAvatar(e.target.value)}
                    placeholder="or paste image URL..."
                    className="flex-1 px-3.5 py-2 text-xs rounded-xl bg-[#181B22] border border-white/[0.08] text-white outline-none focus:border-[#E5C590]/50"
                  />
                </div>
              </div>

              <div className="pt-2 border-t border-white/[0.08]">
                <label className="flex items-center gap-3 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={editIsPrivate}
                    onChange={e => setEditIsPrivate(e.target.checked)}
                    className="w-4 h-4 rounded-md border-white/20 text-[#E5C590] focus:ring-0 bg-[#181B22]"
                  />
                  <div>
                    <span className="text-xs text-white font-medium flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-amber-400" />
                      <span>Gizli Profil (Private Account)</span>
                    </span>
                    <span className="text-[11px] text-zinc-400 block">
                      Açıkken sadece onayladığınız üyeler fotoğraf ve dispatches içeriklerinizi görebilir.
                    </span>
                  </div>
                </label>
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

      {/* 2. PRIVATE PROFILE LOCK FOR VISITORS / NON-CIRCLE MEMBERS */}
      {user.isPrivate && !isOwnProfile ? (
        <div className="py-20 px-6 rounded-3xl bg-[#121419]/70 border border-white/[0.08] text-center flex flex-col items-center justify-center my-6 max-w-xl mx-auto shadow-2xl animate-in fade-in zoom-in-95 duration-200">
          <div className="w-16 h-16 rounded-full bg-white/[0.04] border border-white/10 flex items-center justify-center mb-4 text-[#E5C590] shadow-inner">
            <Lock className="w-7 h-7 stroke-[1.5]" />
          </div>
          <span className="px-3 py-1 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20 text-xs font-mono uppercase tracking-wider mb-2">
            Gizli Profil
          </span>
          <h3 className="font-serif text-2xl text-white font-normal mb-2">Bu Hesap Gizlidir</h3>
          <p className="text-xs text-zinc-400 max-w-sm mb-6 leading-relaxed font-sans">
            Bu kullanıcının paylaşımlarını, fotoğraf mahzenini ve özel salon dispatches akışını görebilmek için onaylı üye olmalı ve takip isteği göndermelisiniz.
          </p>
          {currentUser?.isGuest ? (
            <button
              onClick={onOpenAuth}
              className="px-6 py-2.5 rounded-full bg-linear-to-r from-[#E5C590] to-[#C9A96E] text-black font-semibold text-xs hover:brightness-110 shadow-lg cursor-pointer transition-all"
            >
              Giriş Yap / Üye Ol
            </button>
          ) : (
            <button
              onClick={() => onToggleFollow?.(user.id)}
              className="px-6 py-2.5 rounded-full bg-white hover:bg-zinc-200 text-black font-medium text-xs transition-colors cursor-pointer"
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
                ? 'bg-[#181B22] text-[#E5C590] border border-[#E5C590]/30 shadow-xs font-medium'
                : 'text-zinc-400 hover:text-white hover:bg-white/[0.04]'
            }`}
          >
            <FileText className="w-3.5 h-3.5 text-[#E5C590]" />
            <span>Dossier Özeti & Tercihler</span>
          </button>

          <button
            onClick={() => setMainTab('dispatches')}
            className={`px-4 py-2 rounded-xl text-xs font-sans whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer ${
              mainTab === 'dispatches'
                ? 'bg-[#181B22] text-[#E5C590] border border-[#E5C590]/30 shadow-xs font-medium'
                : 'text-zinc-400 hover:text-white hover:bg-white/[0.04]'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Dispatches ({posts.length})</span>
          </button>

          <button
            onClick={() => setMainTab('vault')}
            className={`px-4 py-2 rounded-xl text-xs font-sans whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer ${
              mainTab === 'vault'
                ? 'bg-[#181B22] text-[#E5C590] border border-[#E5C590]/30 shadow-xs font-medium'
                : 'text-zinc-400 hover:text-white hover:bg-white/[0.04]'
            }`}
          >
            <Image className="w-3.5 h-3.5" />
            <span>Fotoğraf Mahzeni ({photoCount + 6})</span>
          </button>

          <button
            onClick={() => setMainTab('events')}
            className={`px-4 py-2 rounded-xl text-xs font-sans whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer ${
              mainTab === 'events'
                ? 'bg-[#181B22] text-[#E5C590] border border-[#E5C590]/30 shadow-xs font-medium'
                : 'text-zinc-400 hover:text-white hover:bg-white/[0.04]'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Katıldığı Salonlar (3)</span>
          </button>
        </div>
      </div>

      {/* 3. TAB CONTENT RENDERING */}
      {mainTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 font-sans">
          {/* LEFT 2 COLS: Narrative & FetLife/JOYclub Kink Matrix */}
          <div className="lg:col-span-2 space-y-6">
            {/* Extended About Dossier */}
            <div className="p-6 rounded-2xl bg-[#121419] border border-white/[0.08] space-y-3 shadow-xl">
              <div className="flex items-center gap-2 text-xs font-mono text-[#E5C590] uppercase tracking-wider">
                <FileText className="w-3.5 h-3.5" />
                <span>Hakkımızda & Tanışma Vizyonu</span>
              </div>
              <p className="text-sm text-zinc-300 font-light leading-relaxed">
                {user.bio || 'Major Club özel cemiyetinin saygın üyeleri. Sanat, felsefe ve rafine yetişkin deneyimlerini saygı ve gizlilik çerçevesinde buluşturuyoruz.'}
              </p>
              <p className="text-xs text-zinc-400 leading-relaxed pt-2 border-t border-white/[0.04]">
                Bizim için en temel kural karşılıklı rıza, temiz iletişim ve zarafettir. Şifreli salon sohbetlerinde samimi, yüz yüze buluşmalarda ise özenli tavırları önceliklendiririz.
              </p>
            </div>

            {/* Tercihler ve Sınırlar (Kink / Fetish / Limits Matrix) */}
            <div className="p-6 rounded-2xl bg-[#121419] border border-white/[0.08] space-y-5 shadow-xl">
              <div>
                <span className="text-xs font-mono text-[#E5C590] uppercase tracking-wider block">
                  Tercihler, İlgi Alanları ve Sınırlar (Boundaries)
                </span>
                <p className="text-xs text-zinc-400 mt-1">
                  FetLife & JOYclub standartlarında rıza ve fantezi uyum matrisi.
                </p>
              </div>

              {/* Yes / Preferred */}
              <div className="space-y-2">
                <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Evet / İlgi Duyar & Tercih Eder</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {['Soft Swing', 'Maskeli Salonlar', 'Şarap & Gastronomi', 'Sensual Masaj', 'Shibari / Halat', 'Özel Süit Partileri', 'Kültürel Sohbet'].map(item => (
                    <span key={item} className="px-3 py-1 rounded-full text-xs bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                      ✓ {item}
                    </span>
                  ))}
                </div>
              </div>

              {/* Maybe / Open */}
              <div className="space-y-2 pt-2 border-t border-white/[0.04]">
                <div className="flex items-center gap-1.5 text-xs text-amber-400 font-medium">
                  <HelpCircle className="w-3.5 h-3.5" />
                  <span>Açık / Meraklı (Uygun Kimyada)</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {['Exhibitionism (İzlenme)', 'Üçlü Deneyim (Threesome)', 'Hafif Dominasyon / BDSM', 'Tantra'].map(item => (
                    <span key={item} className="px-3 py-1 rounded-full text-xs bg-amber-500/10 text-amber-300 border border-amber-500/20">
                      ? {item}
                    </span>
                  ))}
                </div>
              </div>

              {/* Hard Limits / Sınırlar */}
              <div className="space-y-2 pt-2 border-t border-white/[0.04]">
                <div className="flex items-center gap-1.5 text-xs text-rose-400 font-medium">
                  <XCircle className="w-3.5 h-3.5" />
                  <span>Kesin Sınırlar (Hard Limits)</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {['Saygısız / Israrcı Tavırlar', 'İzinsiz Fotoğraf & Medya Yayma', 'Sert Şiddet / Pain', 'Alkol / Madde Baskısı', 'Rızasız Temas'].map(item => (
                    <span key={item} className="px-3 py-1 rounded-full text-xs bg-rose-500/10 text-rose-300 border border-rose-500/20">
                      ✕ {item}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COL: Telemetry & Specs */}
          <div className="space-y-6">
            {/* Profile Telemetry Card */}
            <div className="p-6 rounded-2xl bg-[#121419] border border-white/[0.08] space-y-4 shadow-xl">
              <span className="text-xs font-mono text-[#E5C590] uppercase tracking-wider block">
                Temel Telemetri & Özellikler
              </span>

              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between py-1.5 border-b border-white/[0.04]">
                  <span className="text-zinc-500">Yaş & Beden:</span>
                  <span className="text-zinc-200 font-medium">{user.age || 29} Yaş · Atletik</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-white/[0.04]">
                  <span className="text-zinc-500">Konum / Bölge:</span>
                  <span className="text-zinc-200 font-medium">{user.location || 'Amsterdam Chapter'}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-white/[0.04]">
                  <span className="text-zinc-500">Kimlik / Cinsiyet:</span>
                  <span className="text-zinc-200 font-medium">{user.gender || 'Kadın'}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-white/[0.04]">
                  <span className="text-zinc-500">Cinsel Yönelim:</span>
                  <span className="text-zinc-200 font-medium">{user.orientation || 'Biseksüel'}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-white/[0.04]">
                  <span className="text-zinc-500">İlişki Tipi:</span>
                  <span className="text-zinc-200 font-medium">Açık Çift (Open Duo)</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-white/[0.04]">
                  <span className="text-zinc-500">Aradıkları:</span>
                  <span className="text-[#E5C590] font-medium">Çiftler & Kadınlar</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-white/[0.04]">
                  <span className="text-zinc-500">Diller:</span>
                  <span className="text-zinc-200 font-medium">İngilizce, Felemenkçe</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-zinc-500">Sigara / Alkol:</span>
                  <span className="text-zinc-200 font-medium">Yalnızca Sosyal</span>
                </div>
              </div>
            </div>

            {/* Community Badges Card */}
            <div className="p-6 rounded-2xl bg-[#121419] border border-white/[0.08] space-y-3 shadow-xl">
              <span className="text-xs font-mono text-zinc-400 uppercase tracking-wider block">
                Topluluk Doğrulamaları
              </span>
              <div className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                <ShieldCheck className="w-5 h-5 text-[#E5C590] shrink-0" />
                <div>
                  <span className="text-xs text-white font-medium block">Maison Attested Patron</span>
                  <span className="text-[11px] text-zinc-400">Kimlik ve fotoğraf teyidi yapılmış salon üyesi.</span>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                <Eye className="w-5 h-5 text-emerald-400 shrink-0" />
                <div>
                  <span className="text-xs text-white font-medium block">1,840 Profil Ziyareti</span>
                  <span className="text-[11px] text-zinc-400">Doğrulanmış cemiyet üyeleri tarafından görüntülendi.</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MEDIA VAULT TAB */}
      {mainTab === 'vault' && (
        <div className="space-y-6">
          <div className="p-4 rounded-xl bg-[#121419] border border-white/[0.08] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-[#E5C590]" />
              <span className="text-xs text-white font-medium">Özel Şifreli Mahzen (Private Vault)</span>
            </div>
            <span className="text-xs text-zinc-400">Yalnızca İzinli Patrona Açık</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {posts.filter(p => p.type === 'photo').map(post => (
              <ProfilePostGridItem
                key={post.id}
                post={post}
                isUserSubscribed={isUserSubscribed}
                onOpenMedia={onOpenMedia}
                onUnlockPPV={onUnlockPPV}
              />
            ))}
            {/* VIP Blurred Teasers */}
            {[1, 2, 3, 4].map(idx => (
              <div key={idx} className="relative aspect-square rounded-2xl overflow-hidden bg-[#181B22] border border-white/[0.08] flex flex-col items-center justify-center p-4 text-center group cursor-pointer">
                <div className="absolute inset-0 bg-cover bg-center filter blur-lg opacity-40 scale-110" style={{ backgroundImage: `url(${user.avatar})` }} />
                <div className="relative z-10 space-y-1">
                  <Lock className="w-6 h-6 text-[#E5C590] mx-auto mb-1 group-hover:scale-110 transition-transform" />
                  <span className="text-xs text-white font-medium block">VIP Mahzen #{idx}</span>
                  <span className="text-[10px] text-zinc-400 block">Erişim İzni İste</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* EVENTS TAB */}
      {mainTab === 'events' && (
        <div className="space-y-4">
          {[
            { title: 'Vernissage Privé — Paris Chapter', date: '14 Kasım 2026', location: 'Le Marais, Paris', desc: 'Gizli galeri açılışı ve maskeli şampanya kokteyli.' },
            { title: 'Venetian Nocturne Masked Ball', date: '28 Kasım 2026', location: 'Prinsengracht Loft, Amsterdam', desc: 'Siyah kravat ve Venedik maskeleriyle özel çember buluşması.' },
            { title: 'Sensory Tantric Gathering', date: '12 Aralık 2026', location: 'Secret Penthouse, Brussels', desc: 'Duyusal farkındalık, ipek halat ve meditasyon atölyesi.' },
          ].map((event, i) => (
            <div key={i} className="p-5 rounded-2xl bg-[#121419] border border-white/[0.08] flex items-center justify-between gap-4 hover:border-white/20 transition-all shadow-md">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-[#E5C590]" />
                  <h4 className="font-serif text-base text-white font-medium">{event.title}</h4>
                </div>
                <p className="text-xs text-zinc-400 font-sans">{event.desc}</p>
                <div className="flex items-center gap-3 text-xs text-zinc-500 font-mono pt-1">
                  <span>{event.date}</span>
                  <span>·</span>
                  <span>{event.location}</span>
                </div>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-sans bg-white/5 border border-white/10 text-emerald-400 shrink-0">
                Davetli / Attending
              </span>
            </div>
          ))}
        </div>
      )}

      {/* DISPATCHES TAB (EXISTING POSTS FEED) */}
      {mainTab === 'dispatches' && (
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
      )}
        </>
      )}

    </div>
  );
};
