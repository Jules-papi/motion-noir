import React, { useState, useMemo } from 'react';
import {
  Search,
  MapPin,
  SlidersHorizontal,
  X,
  Users,
  User,
  Crown,
  Sparkles,
  ArrowRight,
  Calendar,
  ShieldCheck,
  Heart,
  Grid,
  List
} from 'lucide-react';
import { DiscoveryProfile, UserProfile } from '../types';
import { DiscoveryProfileCard } from './DiscoveryProfileCard';
import { SendInterestModal } from './SendInterestModal';
import { MatchCelebrationModal } from './MatchCelebrationModal';
import { EmptyState } from './EmptyState';
import { useLanguage } from '../i18n/LanguageContext';

interface DiscoveryViewProps {
  profiles: DiscoveryProfile[];
  currentUser: UserProfile;
  onStartChat: (profile: DiscoveryProfile) => void;
  onViewProfile?: (userId: string) => void;
  onToast?: (message: { text: string; type: 'success' | 'info' | 'error' }) => void;
  searchQuery?: string;
  onSearchQueryChange?: (q: string) => void;
}

export const DiscoveryView: React.FC<DiscoveryViewProps> = ({
  profiles,
  currentUser,
  onStartChat,
  onViewProfile,
  onToast,
  searchQuery: externalSearchQuery,
  onSearchQueryChange,
}) => {
  const { t } = useLanguage();
  const [internalSearchQuery, setInternalSearchQuery] = useState('');
  const searchQuery = externalSearchQuery !== undefined ? externalSearchQuery : internalSearchQuery;
  const setSearchQuery = (val: string) => {
    setInternalSearchQuery(val);
    if (onSearchQueryChange) onSearchQueryChange(val);
  };
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [activeCategoryTab, setActiveCategoryTab] = useState<'all' | 'women' | 'men' | 'non_binary' | 'couples'>('all');
  const [selectedCity, setSelectedCity] = useState('all');
  const [maxDistance, setMaxDistance] = useState<number>(150);
  const [minAge, setMinAge] = useState<number>(20);
  const [maxAge, setMaxAge] = useState<number>(55);
  const [onlineOnly, setOnlineOnly] = useState(false);
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [selectedInterest, setSelectedInterest] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);

  const [followedIds, setFollowedIds] = useState<string[]>([]);
  const [sentInterestIds, setSentInterestIds] = useState<string[]>([]);
  const [interestModalProfile, setInterestModalProfile] = useState<DiscoveryProfile | null>(null);
  const [matchedProfile, setMatchedProfile] = useState<DiscoveryProfile | null>(null);

  const toggleFollow = (id: string) => {
    setFollowedIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleSendInterest = (profile: DiscoveryProfile, note: string) => {
    setSentInterestIds(prev => [...prev, profile.id]);
    setInterestModalProfile(null);
    if (onToast) {
      onToast({
        text: `Introduction dispatched to ${profile.name}'s salon dossier.`,
        type: 'success',
      });
    }
  };

  const handleLikeProfile = (profile: DiscoveryProfile) => {
    setMatchedProfile(profile);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCity('all');
    setMaxDistance(150);
    setMinAge(20);
    setMaxAge(55);
    setOnlineOnly(false);
    setVerifiedOnly(false);
    setSelectedInterest('all');
  };

  // Find a featured duo/profile for the spotlight
  const featuredProfile = useMemo(() => {
    return profiles.find(p => p.gender === 'couple_mf') || profiles[0];
  }, [profiles]);

  // Online active members for the horizontal strip
  const onlineProfiles = useMemo(() => {
    return profiles.filter(p => p.isOnline);
  }, [profiles]);

  const filteredProfiles = useMemo(() => {
    return profiles.filter(p => {
      const g = (p.gender || '').toLowerCase();
      if (activeCategoryTab === 'women' && g !== 'woman' && g !== 'female') return false;
      if (activeCategoryTab === 'men' && g !== 'man' && g !== 'male') return false;
      if (activeCategoryTab === 'non_binary' && g !== 'non_binary' && g !== 'non-binary') return false;
      if (activeCategoryTab === 'couples' && g !== 'couple' && g !== 'couple_mf') return false;

      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q ||
        p.name.toLowerCase().includes(q) ||
        p.bio.toLowerCase().includes(q) ||
        p.interests.some(i => i.toLowerCase().includes(q)) ||
        p.city.toLowerCase().includes(q);

      const matchesCity = selectedCity === 'all' || p.city.toLowerCase() === selectedCity.toLowerCase();
      const matchesDistance = p.distanceKm !== undefined ? p.distanceKm <= maxDistance : true;
      const matchesAge = p.age === undefined ? true : p.age >= minAge && p.age <= maxAge;
      const matchesOnline = !onlineOnly || p.isOnline;
      const matchesVerified = !verifiedOnly || p.isVerified;
      const matchesInterest = selectedInterest === 'all' || p.interests.some(i => i.toLowerCase().includes(selectedInterest.toLowerCase()));

      return matchesSearch && matchesCity && matchesDistance && matchesAge && matchesOnline && matchesVerified && matchesInterest;
    });
  }, [profiles, activeCategoryTab, searchQuery, selectedCity, maxDistance, minAge, maxAge, onlineOnly, verifiedOnly, selectedInterest]);

  return (
    <div className="space-y-12 pb-24 max-w-7xl mx-auto">
      {/* 1. EDITORIAL MASTHEAD */}
      <div className="pt-2 sm:pt-4 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-white/[0.08] pb-6">
          <div className="space-y-2">
            <span className="text-[10px] font-mono tracking-[0.28em] text-[#C5A880] uppercase block">
              Major Club Société Privée
            </span>
            <h1 className="font-serif text-3xl sm:text-5xl font-light text-[#F1EFEA] tracking-tight">
              {t('discovery.title')}
            </h1>
            <p className="text-sm text-[#9A9996] font-sans font-light max-w-xl leading-relaxed">
              {t('discovery.intro')}
            </p>
          </div>

          {/* Quick Filter Trigger & Active Count */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`px-4 py-2 rounded-full text-xs font-sans transition-colors flex items-center gap-2 cursor-pointer border ${
                showFilters || searchQuery || selectedCity !== 'all' || onlineOnly
                  ? 'bg-[#1A1A1E] text-[#F1EFEA] border-white/20'
                  : 'bg-[#111113] text-[#9A9996] border-white/[0.08] hover:text-[#F1EFEA] hover:border-white/15'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>{t('discovery.filters')}</span>
              {(selectedCity !== 'all' || onlineOnly || searchQuery) && (
                <span className="w-1.5 h-1.5 rounded-full bg-[#C5A880]" />
              )}
            </button>
          </div>
        </div>

        {/* Collapsible Filter Matrix Panel */}
        {showFilters && (
          <div className="p-5 rounded-xl bg-[#111113] border border-white/[0.08] space-y-4 shadow-xl animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-[#66666A] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder={t('discovery.search')}
                  className="w-full pl-9 pr-8 py-2 text-xs rounded-full bg-[#1A1A1E] border border-white/[0.08] text-[#F1EFEA] placeholder-[#66666A] focus:outline-none focus:border-[#C5A880]/40 font-sans"
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#66666A] hover:text-[#F1EFEA]">
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <div>
                <select
                  value={selectedCity}
                  onChange={e => setSelectedCity(e.target.value)}
                  className="w-full py-2 px-3.5 text-xs rounded-full bg-[#1A1A1E] border border-white/[0.08] text-[#F1EFEA] focus:outline-none focus:border-[#C5A880]/40 font-sans"
                >
                  <option value="all">{t('discovery.allCities')}</option>
                  <option value="Amsterdam">Amsterdam Chapter</option>
                  <option value="Rotterdam">Rotterdam Chapter</option>
                  <option value="Paris">Paris Chapter</option>
                  <option value="London">London Chapter</option>
                  <option value="İstanbul">İstanbul Salon</option>
                  <option value="İzmir">İzmir / Aegean</option>
                </select>
              </div>

              <div className="flex items-center justify-between px-4 py-2 rounded-full bg-[#1A1A1E] border border-white/[0.08]">
                <label className="text-xs text-[#9A9996] cursor-pointer flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={onlineOnly}
                    onChange={e => setOnlineOnly(e.target.checked)}
                    className="w-3.5 h-3.5 rounded accent-[#C5A880]"
                  />
                  <span>{t('discovery.online')}</span>
                </label>
                <label className="text-xs text-[#9A9996] cursor-pointer flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={verifiedOnly}
                    onChange={e => setVerifiedOnly(e.target.checked)}
                    className="w-3.5 h-3.5 rounded accent-[#C5A880]"
                  />
                  <span className="flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-[#C5A880]" />
                    <span>{t('discovery.attested')}</span>
                  </span>
                </label>
              </div>
            </div>

            {/* Sliders & Interest Matrix */}
            <div className="pt-3 border-t border-white/[0.06] grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-sans">
              {/* Distance Slider */}
              <div className="space-y-1.5 bg-[#1A1A1E]/50 p-3 rounded-xl border border-white/[0.04]">
                <div className="flex items-center justify-between text-[#9A9996]">
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[#C5A880]" />
                    Maximum Distance
                  </span>
                  <span className="font-mono text-[#F1EFEA] font-medium">{maxDistance} km</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="300"
                  step="5"
                  value={maxDistance}
                  onChange={e => setMaxDistance(parseInt(e.target.value, 10))}
                  className="w-full accent-[#C5A880] cursor-pointer"
                />
              </div>

              {/* Age Range Slider */}
              <div className="space-y-1.5 bg-[#1A1A1E]/50 p-3 rounded-xl border border-white/[0.04]">
                <div className="flex items-center justify-between text-[#9A9996]">
                  <span className="flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-[#C5A880]" />
                    Age Span
                  </span>
                  <span className="font-mono text-[#F1EFEA] font-medium">{minAge} - {maxAge} yrs</span>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="18"
                    max="65"
                    value={minAge}
                    onChange={e => setMinAge(Math.min(parseInt(e.target.value, 10), maxAge - 2))}
                    className="w-full accent-[#C5A880] cursor-pointer"
                  />
                  <input
                    type="range"
                    min="18"
                    max="65"
                    value={maxAge}
                    onChange={e => setMaxAge(Math.max(parseInt(e.target.value, 10), minAge + 2))}
                    className="w-full accent-[#C5A880] cursor-pointer"
                  />
                </div>
              </div>
            </div>

            {/* Interest Tags Filter */}
            <div className="pt-2 flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[10px] font-mono text-[#66666A] uppercase tracking-wider mr-1">Ethos Matrix:</span>
                {['all', 'Sensual', 'Cocktails', 'Exhibitionism', 'BDSM', 'Tantra', 'Fine Dining', 'Art'].map(tag => (
                  <button
                    key={tag}
                    onClick={() => setSelectedInterest(tag)}
                    className={`px-2.5 py-1 rounded-full text-[11px] font-sans transition-colors cursor-pointer ${
                      selectedInterest === tag
                        ? 'bg-[#C5A880] text-[#09090B] font-medium'
                        : 'bg-[#1A1A1E] text-[#9A9996] hover:text-[#F1EFEA] border border-white/[0.06]'
                    }`}
                  >
                    {tag === 'all' ? 'All' : tag}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-3">
                <span className="text-xs font-mono text-[#C5A880]">
                  {filteredProfiles.length} dossiers indexed
                </span>
                {(searchQuery || selectedCity !== 'all' || onlineOnly || verifiedOnly || selectedInterest !== 'all' || maxDistance !== 150) && (
                  <button onClick={clearFilters} className="text-xs font-sans text-[#9A9996] hover:text-[#F1EFEA] underline cursor-pointer">
                    Reset Filters
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Quiet Luxury Pill Capsule Segment Tabs & Grid/List Switcher */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="inline-flex items-center p-1 rounded-full bg-[#111113] border border-white/[0.08] overflow-x-auto no-scrollbar max-w-full">
            <button
              onClick={() => setActiveCategoryTab('all')}
              className={`px-4 py-1.5 rounded-full text-xs font-sans transition-all whitespace-nowrap cursor-pointer ${
                activeCategoryTab === 'all'
                  ? 'bg-[#1A1A1E] text-[#F1EFEA] font-medium border border-white/10 shadow-xs'
                  : 'text-[#9A9996] hover:text-[#F1EFEA]'
              }`}
            >
              All Dossiers ({profiles.length})
            </button>

            <button
              onClick={() => setActiveCategoryTab('women')}
              className={`px-4 py-1.5 rounded-full text-xs font-sans transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                activeCategoryTab === 'women'
                  ? 'bg-[#1A1A1E] text-[#F1EFEA] font-medium border border-white/10 shadow-xs'
                  : 'text-[#9A9996] hover:text-[#F1EFEA]'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>{t('discovery.women')}</span>
            </button>

            <button
              onClick={() => setActiveCategoryTab('men')}
              className={`px-4 py-1.5 rounded-full text-xs font-sans transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                activeCategoryTab === 'men'
                  ? 'bg-[#1A1A1E] text-[#F1EFEA] font-medium border border-white/10 shadow-xs'
                  : 'text-[#9A9996] hover:text-[#F1EFEA]'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>{t('discovery.men')}</span>
            </button>

            <button
              onClick={() => setActiveCategoryTab('non_binary')}
              className={`px-4 py-1.5 rounded-full text-xs font-sans transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                activeCategoryTab === 'non_binary'
                  ? 'bg-[#1A1A1E] text-[#F1EFEA] font-medium border border-white/10 shadow-xs'
                  : 'text-[#9A9996] hover:text-[#F1EFEA]'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>{t('discovery.nonbinary')}</span>
            </button>

            <button
              onClick={() => setActiveCategoryTab('couples')}
              className={`px-4 py-1.5 rounded-full text-xs font-sans transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                activeCategoryTab === 'couples'
                  ? 'bg-[#1A1A1E] text-[#F1EFEA] font-medium border border-white/10 shadow-xs'
                  : 'text-[#9A9996] hover:text-[#F1EFEA]'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>{t('discovery.couples')}</span>
            </button>
          </div>

          {/* Grid / List Switcher */}
          <div className="inline-flex items-center p-1 rounded-full bg-[#111113] border border-white/[0.08] shrink-0 self-start sm:self-auto">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-full transition-colors cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-[#1A1A1E] text-[#F1EFEA] shadow-xs'
                  : 'text-[#9A9996] hover:text-[#F1EFEA]'
              }`}
              title="Grid View"
              aria-label="Grid View"
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
              title="List View"
              aria-label="List View"
            >
              <List className="w-4 h-4 stroke-[1.5]" />
            </button>
          </div>
        </div>
      </div>

      {/* 2. FEATURED SPOTLIGHT: CINEMATIC HERO DOSSIER */}
      {featuredProfile && activeCategoryTab === 'all' && !searchQuery && (
        <section className="relative rounded-xl overflow-hidden bg-[#111113] border border-white/[0.08] group shadow-xl">
          <div className="relative aspect-[16/9] sm:aspect-[21/9] w-full overflow-hidden bg-[#09090B]">
            <img
              src={featuredProfile.coverImage || featuredProfile.avatar}
              alt={featuredProfile.name}
              className="w-full h-full object-cover filter contrast-[1.05] brightness-90 transition-transform duration-1000 ease-out group-hover:scale-[1.02]"
            />
            {/* Cinematic Gradient Overlays */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#09090B] via-[#09090B]/50 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#09090B]/90 via-[#09090B]/40 to-transparent" />

            {/* Spotlight Tag */}
            <div className="absolute top-5 left-5 sm:top-6 sm:left-8 flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-[#09090B]/70 backdrop-blur-md border border-white/10 text-[10px] font-sans uppercase tracking-wider text-[#F1EFEA] flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-[#C5A880]" />
                <span>{t('discovery.featured')}</span>
              </span>
            </div>

            {/* Spotlight Information */}
            <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-8 max-w-2xl text-[#F1EFEA]">
              <div className="flex items-center gap-2 text-xs font-mono text-[#9A9996] mb-1.5">
                <span>{featuredProfile.city}</span>
                <span>·</span>
                <span>{t('discovery.patron')}</span>
              </div>

              <h2 className="font-serif text-2xl sm:text-4xl text-[#F1EFEA] font-normal tracking-tight">
                {featuredProfile.name}
              </h2>

              {featuredProfile.bio && (
                <p className="text-xs sm:text-sm text-[#9A9996] font-sans font-light line-clamp-2 mt-2 leading-relaxed italic">
                  "{featuredProfile.bio}"
                </p>
              )}

              <div className="flex items-center gap-3 mt-4 pt-3 border-t border-white/[0.08]">
                <button
                  onClick={() => setInterestModalProfile(featuredProfile)}
                  className="py-2.5 px-5 rounded-full text-xs font-sans bg-[#F1EFEA] text-[#09090B] hover:bg-[#E5E3DE] font-medium flex items-center gap-2 transition-all cursor-pointer shadow-xs"
                >
                  <span>{t('discovery.introAction')}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={() => onStartChat(featuredProfile)}
                  className="py-2.5 px-4 rounded-full text-xs font-sans bg-[#1A1A1E] hover:bg-white/10 text-[#F1EFEA] border border-white/15 transition-colors cursor-pointer"
                >
                  Dispatch
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 3. ACTIVE IN SALON / NEARBY HORIZONTAL STRIP */}
      {onlineProfiles.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <h2 className="text-xs font-mono uppercase tracking-[0.2em] text-[#9A9996]">
                {t('discovery.activeNow')}
              </h2>
            </div>
            <span className="text-[11px] font-mono text-[#66666A]">
              {onlineProfiles.length} Members Active
            </span>
          </div>

          <div className="flex items-center gap-4 overflow-x-auto pb-2 no-scrollbar">
            {onlineProfiles.map(p => (
              <div
                key={p.id}
                onClick={() => setInterestModalProfile(p)}
                className="group shrink-0 w-24 sm:w-28 flex flex-col items-center text-center cursor-pointer"
              >
                <div className="relative w-18 h-18 sm:w-20 sm:h-20 rounded-full overflow-hidden bg-[#1A1A1E] border border-white/10 group-hover:border-[#C5A880]/50 transition-all p-0.5">
                  <img
                    src={p.avatar}
                    alt={p.name}
                    className="w-full h-full object-cover rounded-full filter contrast-[1.05] group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute bottom-1 right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-[#111113]" />
                </div>
                <span className="font-sans text-xs text-[#9A9996] mt-2 font-medium truncate w-full group-hover:text-[#F1EFEA]">
                  {p.name}
                </span>
                <span className="text-[10px] font-mono text-[#66666A] truncate w-full">
                  {p.city}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 4. MAIN DOSSIER CARDS GRID */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-mono uppercase tracking-[0.2em] text-[#9A9996]">
            Member Dossiers
          </h2>
          <span className="text-[11px] font-mono text-[#66666A]">
            Showing {filteredProfiles.length} Attested Profiles
          </span>
        </div>

        {filteredProfiles.length === 0 ? (
          <EmptyState
            variant="search"
            title="No Matching Member Dossiers Found"
            description="Adjust your proximity radius or chapter filters to discover more salon patrons."
            actionLabel="Reset Parameters"
            onAction={clearFilters}
          />
        ) : (
          viewMode === 'list' ? (
            <div className="space-y-4 max-w-3xl mx-auto">
              {filteredProfiles.map(profile => (
                <div
                  key={profile.id}
                  onClick={() => onViewProfile?.(profile.id)}
                  className="p-4 rounded-xl bg-[#111113] border border-white/[0.08] flex items-center justify-between gap-4 hover:border-white/20 transition-all shadow-md cursor-pointer group"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <img
                      src={profile.avatar}
                      alt={profile.name}
                      className="w-14 h-14 rounded-xl object-cover border border-white/15 shrink-0 group-hover:scale-105 transition-transform"
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="font-serif text-base text-[#F1EFEA] font-medium truncate group-hover:text-[#C5A880] transition-colors">
                          {profile.name}
                        </h4>
                        <span className="text-xs font-mono text-[#9A9996]">· {profile.age}</span>
                        {profile.isVerified && (
                          <ShieldCheck className="w-3.5 h-3.5 text-[#C5A880] shrink-0" />
                        )}
                        {profile.isPrivate && (
                          <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20 text-[9px] font-mono">
                            Gizli
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-[#9A9996] font-sans flex items-center gap-2 mt-0.5">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-[#C5A880]" />
                          <span>{profile.city}</span>
                        </span>
                        <span>·</span>
                        <span className="truncate">{profile.bio.slice(0, 60)}...</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onStartChat(profile);
                      }}
                      className="py-2 px-4 rounded-full text-xs font-sans bg-[#1A1A1E] hover:bg-white/10 text-[#F1EFEA] border border-white/15 transition-colors cursor-pointer"
                    >
                      Message
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setInterestModalProfile(profile);
                      }}
                      className="py-2 px-3.5 rounded-full text-xs font-sans bg-[#F1EFEA] hover:bg-[#E5E3DE] text-[#09090B] font-medium transition-colors cursor-pointer"
                    >
                      Introduce
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-5">
              {filteredProfiles.map(profile => (
                <DiscoveryProfileCard
                  key={profile.id}
                  profile={profile}
                  isFollowed={followedIds.includes(profile.id)}
                  isInterestSent={sentInterestIds.includes(profile.id)}
                  onToggleFollow={toggleFollow}
                  onStartChat={onStartChat}
                  onOpenInterestModal={p => setInterestModalProfile(p)}
                  onLikeProfile={handleLikeProfile}
                  onViewProfile={onViewProfile}
                />
              ))}
            </div>
          )
        )}
      </section>

      {/* Modals */}
      {interestModalProfile && (
        <SendInterestModal
          profile={interestModalProfile}
          currentUser={currentUser}
          onClose={() => setInterestModalProfile(null)}
          onSend={handleSendInterest}
        />
      )}

      {matchedProfile && (
        <MatchCelebrationModal
          matchedProfile={matchedProfile}
          currentUser={currentUser}
          onClose={() => setMatchedProfile(null)}
          onStartChat={onStartChat}
        />
      )}
    </div>
  );
};
