import React from 'react';
import {
  ArrowRight,
  BadgeCheck,
  MapPin,
  UserCheck,
  UserPlus,
} from 'lucide-react';
import { DiscoveryProfile, UserProfile } from '../types';
import { ActiveViewType } from './Sidebar';
import { useLanguage } from '../i18n/LanguageContext';

interface RightBarProps {
  currentUser: UserProfile;
  currentView: ActiveViewType;
  followingIds?: string[];
  suggestedProfiles?: DiscoveryProfile[];
  onFollow?: (userId: string) => void;
  onOpenAuth: () => void;
  onNavigateToProfile: (userId: string) => void;
  onNavigateToDiscovery: () => void;
}

export const RightBar: React.FC<RightBarProps> = ({
  currentUser,
  currentView,
  followingIds = [],
  suggestedProfiles = [],
  onFollow,
  onOpenAuth,
  onNavigateToProfile,
  onNavigateToDiscovery,
}) => {
  const { t } = useLanguage();
  const displayProfiles = React.useMemo(() => {
    const candidates = suggestedProfiles.filter(profile => profile.id !== currentUser.id);

    return [...candidates]
      .sort((a, b) => {
        const score = (profile: DiscoveryProfile) => {
          let value = profile.isVerified ? 30 : 0;
          value += profile.isOnline ? 25 : 0;

          if (currentView === 'profile' && profile.city === currentUser.location) value += 45;
          if (currentView === 'chat') value += profile.isOnline ? 55 : 0;
          if (currentView === 'discovery') value += profile.matchRate;
          if (currentView === 'feed') value += profile.matchRate * 0.55;

          value -= Math.min(profile.distanceKm ?? 50, 50) * 0.35;
          return value;
        };

        return score(b) - score(a);
      })
      .slice(0, 5);
  }, [currentUser.id, currentUser.location, currentView, suggestedProfiles]);

  if (displayProfiles.length === 0) return null;

  const contextualCopy: Partial<Record<ActiveViewType, { title: string; description: string }>> = {
    feed: { title: t('right.feedTitle'), description: t('right.feedDescription') },
    profile: { title: t('right.profileTitle'), description: t('right.profileDescription') },
    chat: { title: t('right.chatTitle'), description: t('right.chatDescription') },
    discovery: { title: t('right.discoveryTitle'), description: t('right.discoveryDescription') },
    events: { title: 'Seçkin Salonlar', description: 'Özel buluşmalar ve doğrulanmış mekanlar.' },
    admin: { title: 'Yönetim Konsolu', description: 'Yüksek küratör konseyi ve denetim.' },
  };
  const copy = currentUser.isGuest
    ? {
        title: t('right.community'),
        description: t('right.verified'),
      }
    : contextualCopy[currentView] || contextualCopy.discovery!;

  return (
    <aside className="sticky top-0 hidden h-screen w-80 shrink-0 overflow-y-auto border-l border-white/[0.08] bg-[#09090B] px-5 py-8 xl:block">
      <div className="border-y border-white/[0.1] py-5">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="font-serif text-2xl leading-none text-[#F1EFEA]">{copy.title}</h2>
            <p className="mt-2 text-[11px] leading-4 text-[#9A9996]">{copy.description}</p>
          </div>
          <button
            type="button"
            onClick={onNavigateToDiscovery}
            className="text-[#C5A880] transition-transform duration-150 hover:translate-x-0.5"
            aria-label={t('right.openAll')}
          >
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-6 space-y-5">
          {displayProfiles.map(profile => {
            const isFollowing = followingIds.includes(profile.id);
            return (
              <div key={profile.id} className="group grid grid-cols-[auto_1fr_auto] items-center gap-3">
                <button
                  type="button"
                  onClick={() => onNavigateToProfile(profile.id)}
                  className="relative"
                  aria-label={`${profile.name} profilini aç`}
                >
                  <img
                    src={profile.avatar}
                    alt=""
                    className="h-10 w-10 rounded-full object-cover ring-1 ring-white/15 transition-[filter,box-shadow] duration-150 group-hover:ring-white/35"
                  />
                  {profile.isOnline && (
                    <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-[#09090B] bg-emerald-400" />
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => onNavigateToProfile(profile.id)}
                  className="min-w-0 text-left"
                >
                  <span className="flex items-center gap-1.5">
                    <span className="truncate text-xs font-semibold text-[#F1EFEA]">{profile.name}</span>
                    {profile.isVerified && <BadgeCheck className="h-3.5 w-3.5 shrink-0 text-[#C5A880]" />}
                  </span>
                  <span className="mt-0.5 flex items-center gap-1 text-[10px] text-[#9A9996]">
                    <MapPin className="h-3 w-3" />
                    {profile.city}
                    {typeof profile.distanceKm === 'number' ? ` · ${profile.distanceKm} km` : ''}
                  </span>
                </button>

                {currentUser.isGuest ? (
                  <button
                    type="button"
                    onClick={() => onNavigateToProfile(profile.id)}
                    className="rounded-md border border-white/[0.12] px-2.5 py-1.5 text-[10px] font-medium text-[#D3D0CA] transition-colors duration-150 hover:border-white/25 hover:text-white"
                  >
                    {t('right.inspect')}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => onFollow?.(profile.id)}
                    className={`flex h-8 w-8 items-center justify-center rounded-full border transition-[border-color,background-color,transform] duration-150 active:scale-95 ${
                      isFollowing
                        ? 'border-white/10 bg-[#1A1A1E] text-[#C5A880]'
                        : 'border-white/15 text-[#D3D0CA] hover:border-[#C5A880]/55 hover:text-[#C5A880]'
                    }`}
                    aria-label={isFollowing ? `${profile.name} bağlantısını kaldır` : `${profile.name} ile bağlantı kur`}
                    title={isFollowing ? 'Bağlantıda' : 'Bağlantı kur'}
                  >
                    {isFollowing ? <UserCheck className="h-3.5 w-3.5" /> : <UserPlus className="h-3.5 w-3.5" />}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {currentUser.isGuest && (
        <div className="mt-7">
          <p className="font-serif text-2xl leading-tight text-[#F1EFEA]">
            {t('right.joinTitle')}
          </p>
          <button
            type="button"
            onClick={onOpenAuth}
            className="mt-5 inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.1em] text-[#C5A880] underline-offset-4 hover:underline"
          >
            {t('right.create')}
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </aside>
  );
};
