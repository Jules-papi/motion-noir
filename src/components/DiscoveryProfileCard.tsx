import React from 'react';
import { 
  MapPin, 
  MessageSquare, 
  Heart, 
  Check, 
  Crown, 
  Users, 
  ArrowUpRight,
  Lock
} from 'lucide-react';
import { DiscoveryProfile } from '../types';

interface DiscoveryProfileCardProps {
  profile: DiscoveryProfile;
  isFollowed: boolean;
  isInterestSent: boolean;
  onToggleFollow: (id: string) => void;
  onStartChat: (profile: DiscoveryProfile) => void;
  onOpenInterestModal: (profile: DiscoveryProfile) => void;
  onLikeProfile: (profile: DiscoveryProfile) => void;
  onViewProfile?: (userId: string) => void;
}

export const DiscoveryProfileCard: React.FC<DiscoveryProfileCardProps> = ({
  profile,
  isInterestSent,
  onStartChat,
  onOpenInterestModal,
  onLikeProfile,
  onViewProfile,
}) => {
  const isCouple = profile.gender === 'couple_mf';

  if (isCouple) {
    /* ----------------------------------------------------
       ARCHETYPE: COUPLE / DUO DOSSIER (CINEMATIC DUO CARD)
       Photography-dominant, dual-identity composition
       ---------------------------------------------------- */
    return (
      <div 
        onClick={() => onViewProfile ? onViewProfile(profile.id) : onOpenInterestModal(profile)}
        className="group relative rounded-2xl overflow-hidden bg-[#121419] border border-white/[0.08] hover:border-white/20 transition-all duration-300 flex flex-col cursor-pointer shadow-xl"
      >
        {/* Dominant Duo Photography */}
        <div className="relative aspect-[3/4] sm:aspect-[4/5] w-full overflow-hidden bg-[#0a0b0e]">
          <img
            src={profile.coverImage || profile.avatar}
            alt={profile.name}
            className="w-full h-full object-cover filter contrast-[1.05] brightness-95 transition-transform duration-700 ease-out group-hover:scale-[1.03]"
          />

          {/* Deep Vignette */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#07080A] via-[#07080A]/40 to-transparent" />

          {/* Discreet Top Badges */}
          <div className="absolute top-3.5 left-3.5 right-3.5 flex items-center justify-between pointer-events-none">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-[10px] font-sans font-medium uppercase tracking-wider text-white">
              <Users className="w-3 h-3 text-[#E5C590]" />
              <span>Couple</span>
            </div>

            {profile.isOnline && (
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-[10px] font-sans text-white">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>Active</span>
              </div>
            )}
          </div>

          {/* Bottom Editorial Content Overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-3.5 sm:p-4 pt-6 text-white flex flex-col justify-end">
            {/* Moniker & Ages */}
            <div className="flex items-baseline justify-between gap-1.5">
              <h3 className="font-serif text-base sm:text-lg font-normal tracking-tight text-white leading-tight truncate">
                {profile.name}
              </h3>
              <span className="text-[11px] font-mono text-zinc-400 tracking-wide shrink-0">
                {profile.age} & 34
              </span>
            </div>

            {/* Location & Proximity */}
            <div className="flex items-center gap-1.5 text-[11px] text-zinc-400 font-sans mt-0.5">
              <MapPin className="w-3 h-3 text-[#E5C590] shrink-0" />
              <span className="truncate">{profile.city}</span>
              <span className="text-zinc-600">·</span>
              <span className="font-mono text-[10px] shrink-0">{profile.distanceKm} km</span>
            </div>

            {/* Dynamic & Looking For */}
            <div className="text-[11px] text-zinc-300 font-sans mt-1 leading-snug line-clamp-1">
              <span className="text-[#E5C590] font-sans font-medium uppercase tracking-wider text-[9px] mr-1">Seeking:</span>
              Open Couple · Salons
            </div>

            {/* Restrained Action Bar */}
            <div className="mt-3 pt-2.5 border-t border-white/[0.08] flex items-center gap-1.5">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenInterestModal(profile);
                }}
                className={`flex-1 py-1.5 px-2.5 rounded-full text-[11px] font-sans font-medium transition-all flex items-center justify-center gap-1 cursor-pointer ${
                  isInterestSent
                    ? 'bg-[#181B22] text-emerald-300 border border-emerald-500/30'
                    : 'bg-white hover:bg-zinc-200 text-black shadow-xs'
                }`}
              >
                <span className="truncate">{isInterestSent ? 'Intro Sent' : 'Dossier'}</span>
                {!isInterestSent && <ArrowUpRight className="w-3 h-3 text-black shrink-0" />}
              </button>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onStartChat(profile);
                }}
                className="w-9 h-9 rounded-full bg-[#181B22] hover:bg-[#222631] border border-white/10 text-zinc-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer shrink-0"
                title="Direct Dispatch"
                aria-label="Direct Dispatch"
              >
                <MessageSquare className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onLikeProfile(profile);
                }}
                className="w-9 h-9 rounded-full bg-[#181B22] hover:bg-[#222631] border border-white/10 text-zinc-300 hover:text-[#E5C590] flex items-center justify-center transition-colors cursor-pointer shrink-0"
                title="Express Affinity"
                aria-label="Express Affinity"
              >
                <Heart className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ----------------------------------------------------
     ARCHETYPE: SINGLE MEMBER (TALL EDITORIAL PORTRAIT)
     Full-bleed portrait with integrated bottom typography
     ---------------------------------------------------- */
  return (
    <div 
      onClick={() => onViewProfile ? onViewProfile(profile.id) : onOpenInterestModal(profile)}
      className="group relative rounded-2xl overflow-hidden bg-[#121419] border border-white/[0.08] hover:border-white/20 transition-all duration-300 flex flex-col cursor-pointer shadow-xl"
    >
      {/* Dominant Portrait Photography */}
      <div className="relative aspect-[3/4] sm:aspect-[4/5] w-full overflow-hidden bg-[#0a0b0e]">
        <img
          src={profile.avatar}
          alt={profile.name}
          className="w-full h-full object-cover filter contrast-[1.05] brightness-95 transition-transform duration-700 ease-out group-hover:scale-[1.03]"
        />

        {/* Deep Vignette */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#07080A] via-[#07080A]/40 to-transparent" />

        {/* Discreet Top Badges */}
        <div className="absolute top-3.5 left-3.5 right-3.5 flex items-center justify-between pointer-events-none">
          <div className="flex items-center gap-1.5 flex-wrap">
            {profile.isOnline ? (
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-[10px] font-sans text-white">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>In Salon</span>
              </div>
            ) : (
              <div className="text-[10px] font-sans text-zinc-400 px-3 py-1 rounded-full bg-black/50 backdrop-blur-xs border border-white/5">
                Attested
              </div>
            )}

            {profile.isPrivate && (
              <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/20 backdrop-blur-md border border-amber-500/30 text-[10px] font-sans text-amber-300">
                <Lock className="w-3 h-3" />
                <span>Gizli</span>
              </div>
            )}
          </div>

          {profile.membershipTier === 'vip' && (
            <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-[#181B22]/90 backdrop-blur-md border border-[#E5C590]/30 text-[10px] font-sans text-[#E5C590] uppercase tracking-wider">
              <Crown className="w-3 h-3 text-[#E5C590]" />
              <span>Privé</span>
            </div>
          )}
        </div>

        {/* Bottom Editorial Content Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-3.5 sm:p-4 pt-6 text-white flex flex-col justify-end">
          {/* Moniker & Age */}
          <div className="flex items-center justify-between gap-1.5">
            <div className="flex items-center gap-1.5 min-w-0">
              <h3 className="font-serif text-base sm:text-lg font-normal tracking-tight text-white leading-tight truncate">
                {profile.name}, {profile.age}
              </h3>
              <Check className="w-3 h-3 text-[#E5C590] shrink-0" />
            </div>

            <span className="text-[9px] font-mono text-zinc-400 tracking-wider uppercase shrink-0">
              {profile.matchRate}%
            </span>
          </div>

          {/* Location & Proximity */}
          <div className="flex items-center gap-1.5 text-[11px] text-zinc-400 font-sans mt-0.5">
            <MapPin className="w-3 h-3 text-[#E5C590] shrink-0" />
            <span className="truncate">{profile.city}</span>
            <span className="text-zinc-600">·</span>
            <span className="font-mono text-[10px] shrink-0">{profile.distanceKm} km</span>
          </div>

          {/* Relationship Dynamic & Ethos */}
          <div className="text-[11px] text-zinc-300 font-sans mt-1 leading-snug line-clamp-1">
            <span className="text-[#E5C590] font-sans font-medium uppercase tracking-wider text-[9px] mr-1">Seeking:</span>
            {profile.gender === 'woman' ? 'Couples & Solo' : 'Salon Encounters'}
          </div>

          {/* Restrained Action Bar */}
          <div className="mt-3 pt-2.5 border-t border-white/[0.08] flex items-center gap-1.5">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onOpenInterestModal(profile);
              }}
              className={`flex-1 py-1.5 px-2.5 rounded-full text-[11px] font-sans font-medium transition-all flex items-center justify-center gap-1 cursor-pointer ${
                isInterestSent
                  ? 'bg-[#181B22] text-emerald-300 border border-emerald-500/30'
                  : 'bg-white hover:bg-zinc-200 text-black shadow-xs'
              }`}
            >
              <span className="truncate">{isInterestSent ? 'Intro Sent' : 'Dossier'}</span>
              {!isInterestSent && <ArrowUpRight className="w-3 h-3 text-black shrink-0" />}
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onStartChat(profile);
              }}
              className="w-9 h-9 rounded-full bg-[#181B22] hover:bg-[#222631] border border-white/10 text-zinc-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer shrink-0"
              title="Direct Dispatch"
              aria-label="Direct Dispatch"
            >
              <MessageSquare className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onLikeProfile(profile);
              }}
              className="w-9 h-9 rounded-full bg-[#181B22] hover:bg-[#222631] border border-white/10 text-zinc-300 hover:text-[#E5C590] flex items-center justify-center transition-colors cursor-pointer shrink-0"
              title="Express Affinity"
              aria-label="Express Affinity"
            >
              <Heart className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
