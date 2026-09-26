import React from 'react';
import {
  MapPin,
  Calendar,
  Crown,
  KeyRound,
  Plus,
  MessageSquare,
  Heart,
  Check,
  Sparkles,
  ShieldCheck,
  Share2,
  ArrowLeft,
  Lock,
  UserPlus,
  UserCheck
} from 'lucide-react';
import { UserProfile } from '../types';
import { DEFAULT_AVATAR_URL, DEFAULT_COVER_URL } from '../constants/profile';

interface ProfileHeaderProps {
  user: UserProfile;
  walletBalance: number;
  isUserSubscribed: boolean;
  isOwnProfile?: boolean;
  isFollowing?: boolean;
  onSubscribe: () => void;
  onOpenWallet: () => void;
  onOpenCreatePost: () => void;
  onEditProfile?: () => void;
  onToggleFollow?: () => void;
  onStartChat?: () => void;
  onBack?: () => void;
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  user,
  walletBalance,
  isUserSubscribed,
  isOwnProfile = true,
  isFollowing = false,
  onSubscribe,
  onOpenWallet,
  onOpenCreatePost,
  onEditProfile,
  onToggleFollow,
  onStartChat,
  onBack,
}) => {
  return (
    <div className="w-full space-y-6">
      {/* Return to Feed / Directory Navigation Button */}
      {onBack && (
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-xs font-sans text-[#9A9996] hover:text-[#F1EFEA] transition-all cursor-pointer group shadow-xs"
        >
          <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5" />
          <span>Geri Dön</span>
        </button>
      )}

      {/* 1. CINEMATIC EDITORIAL HERO PHOTOGRAPHY */}
      <div className="relative w-full rounded-xl overflow-hidden bg-[#111113] border border-white/[0.08] shadow-2xl">
        <div className="relative aspect-[16/9] sm:aspect-[21/9] w-full overflow-hidden bg-[#09090B]">
          {/* Cover Media */}
          <img
            src={user.coverImage || DEFAULT_COVER_URL}
            alt="Dossier cover"
            className="w-full h-full object-cover filter contrast-[1.05] brightness-90"
          />

          {/* Deep Cinematic Gradients */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#09090B] via-[#09090B]/60 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#09090B]/80 via-transparent to-black/30" />

          {/* Hero Bottom Overlay: Integrated Portrait & Moniker */}
          <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-8 flex flex-col sm:flex-row sm:items-end justify-between gap-6 z-10">
            {/* Integrated Avatar & Identity */}
            <div className="flex items-end gap-5">
              <div className="relative shrink-0">
                <img
                  src={user.avatar || DEFAULT_AVATAR_URL}
                  alt={user.name}
                  className="w-24 h-24 sm:w-32 sm:h-32 rounded-xl object-cover border-2 border-white/20 shadow-2xl bg-[#1A1A1E]"
                />
                <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-400 border-2 border-[#09090B]" title="Present in Club" />
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="font-serif text-3xl sm:text-4xl text-[#F1EFEA] font-normal tracking-tight">
                    {user.name}
                  </h1>
                  {user.isVerified && (
                    <Check className="w-4 h-4 text-[#C5A880] shrink-0" />
                  )}
                  {user.isPrivate && (
                    <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20 text-[10px] font-mono flex items-center gap-1.5 shadow-xs">
                      <Lock className="w-3 h-3" />
                      <span>Gizli Profil</span>
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[#9A9996] font-mono">
                  <span>@{user.username}</span>
                  {user.location && (
                    <>
                      <span>·</span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-[#C5A880]" />
                        <span>{user.location}</span>
                      </span>
                    </>
                  )}
                  <span>·</span>
                  <span>Member #{user.id.slice(0, 4)}</span>
                </div>
              </div>
            </div>

            {/* Action Buttons: Own Profile vs Visitor View */}
            <div className="flex items-center gap-2.5 flex-wrap">
              {isOwnProfile ? (
                <>
                  <button
                    onClick={onOpenCreatePost}
                    className="py-2.5 px-5 rounded-full text-xs font-sans bg-[#1A1A1E] hover:bg-white/10 text-[#F1EFEA] border border-white/[0.12] hover:border-white/30 flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
                  >
                    <Plus className="w-3.5 h-3.5 text-[#C5A880]" />
                    <span>New Dispatch</span>
                  </button>

                  {onEditProfile && (
                    <button
                      onClick={onEditProfile}
                      className="py-2.5 px-5 rounded-full text-xs font-sans bg-[#F1EFEA] hover:bg-[#E5E3DE] text-[#09090B] font-medium transition-all cursor-pointer shadow-xs"
                    >
                      Edit Dossier
                    </button>
                  )}
                </>
              ) : (
                <>
                  {onToggleFollow && (
                    <button
                      onClick={onToggleFollow}
                      className={`py-2.5 px-5 rounded-full text-xs font-sans font-medium flex items-center gap-1.5 transition-all cursor-pointer shadow-xs ${
                        isFollowing
                          ? 'bg-[#1A1A1E] text-[#C5A880] border border-[#C5A880]/30 hover:border-[#C5A880]/60'
                          : 'bg-[#F1EFEA] hover:bg-[#E5E3DE] text-[#09090B]'
                      }`}
                    >
                      {isFollowing ? (
                        <>
                          <UserCheck className="w-3.5 h-3.5" />
                          <span>Çemberde (Takip Ediliyor)</span>
                        </>
                      ) : (
                        <>
                          <UserPlus className="w-3.5 h-3.5" />
                          <span>{user.isPrivate ? 'Takip İsteği Gönder' : 'Takip Et (Admit)'}</span>
                        </>
                      )}
                    </button>
                  )}

                  {onStartChat && (
                    <button
                      onClick={onStartChat}
                      className="py-2.5 px-4 rounded-full text-xs font-sans bg-[#1A1A1E] hover:bg-white/10 text-[#F1EFEA] border border-white/[0.12] hover:border-white/30 flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
                    >
                      <MessageSquare className="w-3.5 h-3.5 text-[#C5A880]" />
                      <span>Özel Dispatch</span>
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 2. EDITORIAL DOSSIER ATTRIBUTES & BIO */}
      <div className="p-6 sm:p-8 rounded-xl bg-[#111113] border border-white/[0.08] space-y-6 shadow-xl">
        {/* Intimate Bio Pull-Quote */}
        {user.bio && (
          <div className="max-w-3xl space-y-2">
            <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#C5A880] block">
              Personal Ethos
            </span>
            <p className="font-serif text-lg sm:text-xl text-[#F1EFEA] font-light leading-relaxed italic">
              "{user.bio}"
            </p>
          </div>
        )}

        {[
          user.age ? { label: 'Yaş', value: `${user.age}` } : null,
          user.gender && user.gender !== 'unspecified' ? { label: 'Kimlik / Cinsiyet', value: user.gender } : null,
          user.orientation ? { label: 'Yönelim', value: user.orientation } : null,
          user.location ? { label: 'Konum / Chapter', value: user.location } : null,
        ].some(Boolean) && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-white/[0.06] text-xs">
            {[
              user.age ? { label: 'Yaş', value: `${user.age}` } : null,
              user.gender && user.gender !== 'unspecified' ? { label: 'Kimlik / Cinsiyet', value: user.gender } : null,
              user.orientation ? { label: 'Yönelim', value: user.orientation } : null,
              user.location ? { label: 'Konum / Chapter', value: user.location } : null,
            ].filter((item): item is { label: string; value: string } => Boolean(item)).map(item => (
              <div key={item.label}>
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#66666A] block">{item.label}</span>
                <span className="font-sans font-medium text-[#F1EFEA] mt-1 block">{item.value}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
