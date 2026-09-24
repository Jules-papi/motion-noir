import React from 'react';
import { 
  Crown, 
  ArrowRight,
  Calendar,
  KeyRound,
  UserPlus,
  UserCheck
} from 'lucide-react';
import { OTHER_SUGGESTED_CREATORS } from '../data/initialData';
import { UserProfile, PlatformEvent } from '../types';

interface RightBarProps {
  walletBalance: number;
  isUserSubscribed: boolean;
  currentUser: UserProfile;
  registeredEvents?: PlatformEvent[];
  followingIds?: string[];
  suggestedProfiles?: (UserProfile | { id: string; name: string; username: string; avatar: string })[];
  onFollow?: (userId: string) => void;
  onOpenWallet: () => void;
  onSubscribeClick: () => void;
  onNavigateToProfile: (userId?: string) => void;
  onNavigateToEvents?: () => void;
  onNavigateToForum?: () => void;
  onTopicClick?: (tag: string) => void;
}

export const RightBar: React.FC<RightBarProps> = ({
  walletBalance,
  isUserSubscribed,
  currentUser,
  registeredEvents = [],
  followingIds = [],
  suggestedProfiles,
  onFollow,
  onOpenWallet,
  onSubscribeClick,
  onNavigateToProfile,
  onNavigateToEvents,
  onNavigateToForum,
  onTopicClick,
}) => {
  const displayCreators = (suggestedProfiles && suggestedProfiles.length > 0)
    ? suggestedProfiles.slice(0, 5)
    : OTHER_SUGGESTED_CREATORS;

  const handleToggle = (id: string) => {
    if (onFollow) {
      onFollow(id);
    }
  };

  const trendingTopics = [
    { tag: 'VernissagePrivé', count: '14 dispatches' },
    { tag: 'CapDAntibesRetreat', count: '9 dispatches' },
    { tag: 'NocturnePhotography', count: '28 dispatches' },
    { tag: 'SalonChamberRules', count: '17 dispatches' },
  ];

  return (
    <aside className="hidden xl:block w-80 shrink-0 h-screen sticky top-0 px-4 py-7 space-y-4 overflow-y-auto no-scrollbar border-l border-white/[0.08] bg-[#07080A]">
      {/* Profile Visitors (Authentic JOYclub / Adult Community Pattern) */}
      <div className="bg-[#121419] border border-white/[0.08] rounded-2xl p-4 space-y-3 shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-white font-sans text-xs font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Profil Ziyaretçileri</span>
          </div>
          <span className="text-[10px] font-mono text-[#E5C590]">Bugün 18 Kişi</span>
        </div>
        <p className="text-[11px] text-zinc-400 font-sans leading-relaxed">
          Son 24 saatte profilinizi inceleyen doğrulanmış üyeler:
        </p>
        <div className="flex items-center -space-x-2 pt-1">
          {displayCreators.slice(0, 4).map((c, i) => (
            <img
              key={i}
              src={c.avatar}
              alt={c.name}
              title={`${c.name} profilinizi ziyaret etti`}
              className="w-8 h-8 rounded-full object-cover border-2 border-[#121419] hover:scale-110 transition-transform cursor-pointer"
            />
          ))}
          <div className="w-8 h-8 rounded-full bg-[#181B22] border-2 border-[#121419] flex items-center justify-center text-[10px] font-mono text-[#E5C590] cursor-pointer">
            +14
          </div>
        </div>
      </div>

      {/* Society Curators & Hosts */}
      <div className="bg-[#121419] border border-white/[0.08] rounded-2xl p-4 space-y-3.5 shadow-xl">
        <h4 className="font-sans text-xs font-medium text-white">
          Featured Patrons & Hosts
        </h4>

        <div className="space-y-3">
          {displayCreators.map(c => {
            const isFollowing = followingIds.includes(c.id);
            return (
              <div key={c.id} className="flex items-center justify-between gap-2">
                <div 
                  onClick={() => onNavigateToProfile(c.id)}
                  className="flex items-center gap-2.5 cursor-pointer group flex-1 min-w-0"
                >
                  <img
                    src={c.avatar}
                    alt={c.name}
                    className="w-8 h-8 rounded-full object-cover border border-white/15 group-hover:border-white/40 transition-colors shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="font-sans text-xs font-medium text-white truncate group-hover:text-zinc-200 transition-colors">
                        {c.name}
                      </span>
                    </div>
                    <span className="text-[11px] font-sans text-zinc-400 truncate block">
                      @{c.username}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => handleToggle(c.id)}
                  className={`px-3 py-1 rounded-full text-[11px] font-sans font-medium transition-all border shrink-0 cursor-pointer ${
                    isFollowing
                      ? 'bg-[#181B22] text-zinc-300 border-white/10 hover:border-white/20'
                      : 'bg-white hover:bg-zinc-200 text-black border-transparent'
                  }`}
                >
                  {isFollowing ? (
                    <span className="flex items-center gap-1">
                      <UserCheck className="w-3 h-3" />
                      <span>Circle</span>
                    </span>
                  ) : (
                    <span className="flex items-center gap-1">
                      <UserPlus className="w-3 h-3" />
                      <span>Admit</span>
                    </span>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Salon Dispatches */}
      <div className="bg-[#121419] border border-white/[0.08] rounded-2xl p-4 space-y-3 shadow-xl">
        <h4 className="font-sans text-xs font-medium text-white">
          Salon Conversations
        </h4>

        <div className="space-y-2">
          {trendingTopics.map(t => (
            <div 
              key={t.tag} 
              onClick={() => onTopicClick && onTopicClick(t.tag)}
              className="p-2 -mx-2 rounded-xl hover:bg-white/[0.04] transition-colors cursor-pointer group"
              title={`Explore #${t.tag}`}
            >
              <span className="text-xs font-sans font-medium text-zinc-300 group-hover:text-[#E5C590] transition-colors block">
                #{t.tag}
              </span>
              <span className="text-[11px] font-sans text-zinc-400">
                {t.count}
              </span>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
};
