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
  onOpenWallet: () => void;
  onSubscribeClick: () => void;
  onNavigateToProfile: (userId?: string) => void;
  onNavigateToEvents?: () => void;
  onNavigateToForum?: () => void;
}

export const RightBar: React.FC<RightBarProps> = ({
  walletBalance,
  isUserSubscribed,
  currentUser,
  registeredEvents = [],
  onOpenWallet,
  onSubscribeClick,
  onNavigateToProfile,
  onNavigateToEvents,
  onNavigateToForum,
}) => {
  const [creators, setCreators] = React.useState(OTHER_SUGGESTED_CREATORS);

  const toggleFollow = (id: string) => {
    setCreators(prev => prev.map(c => c.id === id ? { ...c, isFollowing: !c.isFollowing } : c));
  };

  const trendingTopics = [
    { tag: 'VernissagePrivé', count: '14 dispatches' },
    { tag: 'CapDAntibesRetreat', count: '9 dispatches' },
    { tag: 'NocturnePhotography', count: '28 dispatches' },
    { tag: 'SalonChamberRules', count: '17 dispatches' },
  ];

  return (
    <aside className="hidden xl:block w-80 shrink-0 h-screen sticky top-0 px-4 py-7 space-y-4 overflow-y-auto no-scrollbar border-l border-white/[0.08] bg-[#07080A]">
      {/* Member Vault Card */}
      <div className="bg-[#121419] border border-white/[0.08] rounded-2xl p-4 space-y-3.5 shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-zinc-400 font-sans text-xs font-medium">
            <KeyRound className="w-3.5 h-3.5 text-[#E5C590]" />
            <span>Member Ledger</span>
          </div>
          <button
            onClick={onOpenWallet}
            className="text-[11px] font-sans text-zinc-400 hover:text-white flex items-center gap-1 transition-colors cursor-pointer"
          >
            <span>Deposit</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        <div className="flex items-baseline justify-between pt-0.5">
          <div className="flex items-baseline gap-1">
            <span className="font-sans text-2xl font-bold tracking-tight text-white">
              {walletBalance}
            </span>
            <span className="text-xs font-mono text-zinc-400">
              €
            </span>
          </div>
          <span className="text-[10px] font-mono tracking-wider px-2.5 py-0.5 rounded-full bg-[#181B22] text-[#E5C590] border border-[#E5C590]/20 uppercase">
            Available
          </span>
        </div>

        <button
          onClick={onOpenWallet}
          className="w-full py-2.5 px-3 rounded-full text-xs font-sans font-medium bg-white hover:bg-zinc-200 text-black transition-colors flex items-center justify-center gap-2 shadow-sm cursor-pointer"
        >
          <span>Credit Member Ledger</span>
        </button>
      </div>

      {/* Privé Membership Card */}
      <div className="bg-[#121419] border border-white/[0.08] rounded-2xl p-4 space-y-3 shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-white font-sans text-xs font-medium">
            <Crown className="w-3.5 h-3.5 text-[#E5C590]" />
            <span>Privé Patronage</span>
          </div>
          {(currentUser.membershipTier === 'vip' || isUserSubscribed) && (
            <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-emerald-950/60 border border-emerald-500/30 text-emerald-300">
              ACTIVE
            </span>
          )}
        </div>
        <p className="text-xs text-zinc-400 leading-relaxed font-sans font-normal">
          {currentUser.membershipTier === 'vip' || isUserSubscribed
            ? 'Active Privé status. Full admission to confidential plates, private archives, and vernissages.'
            : 'Access unrestricted member vaults, priority invitations, and confidential salons across chapters.'}
        </p>
        <button
          onClick={onSubscribeClick}
          className={`w-full py-2.5 px-3 rounded-full font-sans text-xs font-medium transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm ${
            currentUser.membershipTier === 'vip' || isUserSubscribed
              ? 'bg-[#181B22] text-emerald-300 border border-emerald-500/30'
              : 'bg-[#181B22] hover:bg-[#222631] text-[#E5C590] border border-[#E5C590]/30 hover:border-[#E5C590]/60'
          }`}
        >
          <Crown className="w-3.5 h-3.5" />
          <span>
            {currentUser.membershipTier === 'vip' || isUserSubscribed
              ? 'Patron Active'
              : 'Acquire Privé Tier (99 € / mo)'}
          </span>
        </button>
      </div>

      {/* Upcoming Event Invitation */}
      {registeredEvents.length > 0 && (
        <div className="bg-[#121419] border border-white/[0.08] rounded-2xl p-4 space-y-3 shadow-xl">
          <div className="flex items-center justify-between">
            <h4 className="font-sans text-xs font-medium text-white flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5 text-[#E5C590]" />
              <span>Confirmed Soirée</span>
            </h4>
            {onNavigateToEvents && (
              <button
                onClick={onNavigateToEvents}
                className="text-[11px] font-sans text-zinc-400 hover:text-white transition-colors cursor-pointer"
              >
                All
              </button>
            )}
          </div>

          <div className="p-3 rounded-xl bg-[#181B22] border border-white/[0.06] space-y-1 text-xs">
            <div className="font-sans font-medium text-white truncate">
              {registeredEvents[0].title}
            </div>
            <div className="text-[11px] font-sans text-zinc-400">
              {registeredEvents[0].startsAt}
            </div>
            <div className="text-[11px] font-sans text-emerald-400 pt-0.5 flex items-center gap-1.5">
              <span>✓</span>
              <span>Encrypted QR Token Sealed</span>
            </div>
          </div>
        </div>
      )}

      {/* Society Curators & Hosts */}
      <div className="bg-[#121419] border border-white/[0.08] rounded-2xl p-4 space-y-3.5 shadow-xl">
        <h4 className="font-sans text-xs font-medium text-white">
          Featured Patrons & Hosts
        </h4>

        <div className="space-y-3">
          {creators.map(c => (
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
                onClick={() => toggleFollow(c.id)}
                className={`px-3 py-1 rounded-full text-[11px] font-sans font-medium transition-all border shrink-0 cursor-pointer ${
                  c.isFollowing
                    ? 'bg-[#181B22] text-zinc-300 border-white/10 hover:border-white/20'
                    : 'bg-white hover:bg-zinc-200 text-black border-transparent'
                }`}
              >
                {c.isFollowing ? (
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
          ))}
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
              onClick={onNavigateToForum}
              className="p-2 -mx-2 rounded-xl hover:bg-white/[0.03] transition-colors cursor-pointer group"
            >
              <span className="text-xs font-sans font-medium text-zinc-300 group-hover:text-white transition-colors block">
                #{t.tag}
              </span>
              <span className="text-[11px] font-sans text-zinc-500">
                {t.count}
              </span>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
};
