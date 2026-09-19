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
  Share2
} from 'lucide-react';
import { UserProfile } from '../types';

interface ProfileHeaderProps {
  user: UserProfile;
  walletBalance: number;
  isUserSubscribed: boolean;
  onSubscribe: () => void;
  onOpenWallet: () => void;
  onOpenCreatePost: () => void;
  onEditProfile?: () => void;
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  user,
  walletBalance,
  isUserSubscribed,
  onSubscribe,
  onOpenWallet,
  onOpenCreatePost,
  onEditProfile,
}) => {
  return (
    <div className="w-full space-y-6">
      {/* 1. CINEMATIC EDITORIAL HERO PHOTOGRAPHY */}
      <div className="relative w-full rounded-2xl overflow-hidden bg-[#121419] border border-white/[0.08] shadow-2xl">
        <div className="relative aspect-[16/9] sm:aspect-[21/9] w-full overflow-hidden bg-[#07080A]">
          {/* Cover Media */}
          <img 
            src={user.coverImage} 
            alt="Dossier cover" 
            className="w-full h-full object-cover filter contrast-[1.05] brightness-90"
          />

          {/* Deep Cinematic Gradients */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#07080A] via-[#07080A]/50 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#07080A]/80 via-transparent to-black/30" />

          {/* Hero Bottom Overlay: Integrated Portrait & Moniker */}
          <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-8 flex flex-col sm:flex-row sm:items-end justify-between gap-6 z-10">
            {/* Integrated Avatar & Identity */}
            <div className="flex items-end gap-5">
              <div className="relative shrink-0">
                <img 
                  src={user.avatar} 
                  alt={user.name} 
                  className="w-24 h-24 sm:w-32 sm:h-32 rounded-2xl object-cover border-2 border-white/20 shadow-2xl bg-[#121419]"
                />
                <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-400 border-2 border-[#07080A]" title="Present in Club" />
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h1 className="font-serif text-3xl sm:text-4xl text-white font-normal tracking-tight">
                    {user.name}
                  </h1>
                  {user.isVerified && (
                    <Check className="w-4 h-4 text-[#E5C590] shrink-0" />
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-zinc-400 font-mono">
                  <span>@{user.username}</span>
                  <span>·</span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-zinc-400" />
                    <span>{user.location || 'Amsterdam Chapter'}</span>
                  </span>
                  <span>·</span>
                  <span>Member #{user.id.slice(0, 4)}</span>
                </div>
              </div>
            </div>

            {/* Quiet Action Buttons */}
            <div className="flex items-center gap-2.5 flex-wrap">
              <button
                onClick={onOpenCreatePost}
                className="py-2.5 px-5 rounded-full text-xs font-sans bg-[#181B22] hover:bg-[#222631] text-white border border-white/[0.12] hover:border-white/30 flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
              >
                <Plus className="w-3.5 h-3.5 text-[#E5C590]" />
                <span>New Dispatch</span>
              </button>

              {onEditProfile && (
                <button
                  onClick={onEditProfile}
                  className="py-2.5 px-5 rounded-full text-xs font-sans bg-white hover:bg-zinc-200 text-black font-medium transition-all cursor-pointer shadow-xs"
                >
                  Edit Dossier
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 2. EDITORIAL DOSSIER ATTRIBUTES & BIO */}
      <div className="p-6 sm:p-8 rounded-2xl bg-[#121419] border border-white/[0.08] space-y-6 shadow-xl">
        {/* Intimate Bio Pull-Quote */}
        <div className="max-w-3xl space-y-2">
          <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#E5C590] block">
            Personal Ethos
          </span>
          <p className="font-serif text-lg sm:text-xl text-white font-light leading-relaxed italic">
            "{user.bio}"
          </p>
        </div>

        {/* Editorial Spec Attributes Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-white/[0.06] text-xs">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 block">
              Age
            </span>
            <span className="font-sans font-medium text-zinc-200 mt-1 block">
              {user.age || 29} Years
            </span>
          </div>

          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 block">
              Gender
            </span>
            <span className="font-sans font-medium text-zinc-200 mt-1 block">
              {user.gender || 'Individual'}
            </span>
          </div>

          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 block">
              Orientation
            </span>
            <span className="font-sans font-medium text-zinc-200 mt-1 block">
              {user.orientation || 'Hetero / Bi-Curious'}
            </span>
          </div>

          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 block">
              Location
            </span>
            <span className="font-sans font-medium text-zinc-200 mt-1 block">
              {user.location || 'Amsterdam Chapter'}
            </span>
          </div>
        </div>

        {/* Engagement Stats Strip */}
        <div className="flex items-center gap-8 pt-4 border-t border-white/[0.06] text-xs font-serif">
          <div>
            <span className="text-base text-white font-normal mr-1.5">{user.postsCount}</span>
            <span className="text-zinc-400 uppercase tracking-wider text-[11px]">Dispatches</span>
          </div>
          <div>
            <span className="text-base text-white font-normal mr-1.5">{user.followersCount}</span>
            <span className="text-zinc-400 uppercase tracking-wider text-[11px]">Subscribers</span>
          </div>
          <div>
            <span className="text-base text-white font-normal mr-1.5">{user.followingCount}</span>
            <span className="text-zinc-400 uppercase tracking-wider text-[11px]">Circle</span>
          </div>
          <div>
            <span className="text-base text-[#E5C590] font-normal mr-1.5">14</span>
            <span className="text-zinc-400 uppercase tracking-wider text-[11px]">Salons Attended</span>
          </div>
        </div>
      </div>
    </div>
  );
};
