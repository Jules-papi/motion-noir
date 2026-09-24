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
      const matchesDistance = p.distanceKm <= maxDistance;
      const matchesAge = p.age >= minAge && p.age <= maxAge;
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
            <span className="text-[10px] font-mono tracking-[0.28em] text-[#E5C590] uppercase block">
              Major Club Société Privée
            </span>
            <h1 className="font-serif text-3xl sm:text-5xl font-light text-white tracking-tight">
              Discover
            </h1>
            <p className="text-sm text-zinc-400 font-sans font-light max-w-xl leading-relaxed">
              Attested singles, couples, and private patrons indexed by aesthetic affinity, cultural provenance, and shared discretion.
            </p>
          </div>

          {/* Quick Filter Trigger & Active Count */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`px-4 py-2 rounded-full text-xs font-sans transition-colors flex items-center gap-2 cursor-pointer border ${
                showFilters || searchQuery || selectedCity !== 'all' || onlineOnly
                  ? 'bg-[#181B22] text-white border-white/20'
                  : 'bg-[#121419] text-zinc-400 border-white/[0.08] hover:text-white hover:border-white/15'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Filters</span>
              {(selectedCity !== 'all' || onlineOnly || searchQuery) && (
                <span className="w-1.5 h-1.5 rounded-full bg-[#E5C590]" />
              )}
            </button>
          </div>
        </div>

        {/* Collapsible Filter Matrix Panel */}
        {showFilters && (
          <div className="p-5 rounded-2xl bg-[#121419] border border-white/[0.08] space-y-4 shadow-xl animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search dossiers by moniker, ethos, chapter..."
                  className="w-full pl-9 pr-8 py-2 text-xs rounded-full bg-[#181B22] border border-white/[0.08] text-white placeholder-zinc-500 focus:outline-none focus:border-white/25 font-sans"
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white">
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <div>
                <select
                  value={selectedCity}
                  onChange={e => setSelectedCity(e.target.value)}
                  className="w-full py-2 px-3.5 text-xs rounded-full bg-[#181B22] border border-white/[0.08] text-white focus:outline-none focus:border-white/25 font-sans"
                >
                  <option value="all">All Chapters & Salons</option>
                  <option value="Amsterdam">Amsterdam Chapter</option>
                  <option value="Rotterdam">Rotterdam Chapter</option>
                  <option value="Paris">Paris Chapter</option>
                  <option value="London">London Chapter</option>
                  <option value="İstanbul">İstanbul Salon</option>
                  <option value="İzmir">İzmir / Aegean</option>
                </select>
              </div>

              <div className="flex items-center justify-between px-4 py-2 rounded-full bg-[#181B22] border border-white/[0.08]">
                <label className="text-xs text-zinc-300 cursor-pointer flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={onlineOnly}
                    onChange={e => setOnlineOnly(e.target.checked)}
                    className="w-3.5 h-3.5 rounded accent-[#E5C590]"
                  />
                  <span>Active in Salon Now</span>
                </label>
                <label className="text-xs text-zinc-300 cursor-pointer flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={verifiedOnly}
                    onChange={e => setVerifiedOnly(e.target.checked)}
                    className="w-3.5 h-3.5 rounded accent-[#E5C590]"
                  />
                  <span className="flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-[#E5C590]" />
                    <span>Attested</span>
                  </span>
                </label>
              </div>
            </div>

            {/* Sliders & Interest Matrix */}
            <div className="pt-3 border-t border-white/[0.06] grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-sans">
              {/* Distance Slider */}
              <div className="space-y-1.5 bg-[#181B22]/50 p-3 rounded-xl border border-white/[0.04]">
                <div className="flex items-center justify-between text-zinc-400">
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[#E5C590]" />
                    Maximum Distance
                  </span>
                  <span className="font-mono text-white font-medium">{maxDistance} km</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="300"
                  step="5"
                  value={maxDistance}
                  onChange={e => setMaxDistance(parseInt(e.target.value, 10))}
                  className="w-full accent-[#E5C590] cursor-pointer"
                />
              </div>

              {/* Age Range Slider */}
              <div className="space-y-1.5 bg-[#181B22]/50 p-3 rounded-xl border border-white/[0.04]">
                <div className="flex items-center justify-between text-zinc-400">
                  <span className="flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-[#E5C590]" />
                    Age Span
                  </span>
                  <span className="font-mono text-white font-medium">{minAge} - {maxAge} yrs</span>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="18"
                    max="65"
                    value={minAge}
                    onChange={e => setMinAge(Math.min(parseInt(e.target.value, 10), maxAge - 2))}
                    className="w-full accent-[#E5C590] cursor-pointer"
                  />
                  <input
                    type="range"
                    min="18"
                    max="65"
                    value={maxAge}
                    onChange={e => setMaxAge(Math.max(parseInt(e.target.value, 10), minAge + 2))}
                    className="w-full accent-[#E5C590] cursor-pointer"
                  />
                </div>
              </div>
            </div>

            {/* Interest Tags Filter */}
            <div className="pt-2 flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider mr-1">Ethos Matrix:</span>
                {['all', 'Sensual', 'Cocktails', 'Exhibitionism', 'BDSM', 'Tantra', 'Fine Dining', 'Art'].map(tag => (
                  <button
                    key={tag}
                    onClick={() => setSelectedInterest(tag)}
                    className={`px-2.5 py-1 rounded-full text-[11px] font-sans transition-colors cursor-pointer ${
                      selectedInterest === tag
                        ? 'bg-[#E5C590] text-black font-medium'
                        : 'bg-[#181B22] text-zinc-400 hover:text-white border border-white/[0.06]'
                    }`}
                  >
                    {tag === 'all' ? 'All' : tag}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-3">
                <span className="text-xs font-mono text-[#E5C590]">
                  {filteredProfiles.length} dossiers indexed
                </span>
                {(searchQuery || selectedCity !== 'all' || onlineOnly || verifiedOnly || selectedInterest !== 'all' || maxDistance !== 150) && (
                  <button onClick={clearFilters} className="text-xs font-sans text-zinc-400 hover:text-white underline cursor-pointer">
                    Reset Filters
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Quiet Luxury Pill Capsule Segment Tabs & Grid/List Switcher */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="inline-flex items-center p-1 rounded-full bg-[#121419] border border-white/[0.08] overflow-x-auto no-scrollbar max-w-full">
            <button
              onClick={() => setActiveCategoryTab('all')}
              className={`px-4 py-1.5 rounded-full text-xs font-sans transition-all whitespace-nowrap cursor-pointer ${
                activeCategoryTab === 'all'
                  ? 'bg-[#181B22] text-white font-medium border border-white/10 shadow-xs'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              All Dossiers ({profiles.length})
            </button>

            <button
              onClick={() => setActiveCategoryTab('women')}
              className={`px-4 py-1.5 rounded-full text-xs font-sans transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                activeCategoryTab === 'women'
                  ? 'bg-[#181B22] text-white font-medium border border-white/10 shadow-xs'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>Women</span>
            </button>

            <button
              onClick={() => setActiveCategoryTab('men')}
              className={`px-4 py-1.5 rounded-full text-xs font-sans transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                activeCategoryTab === 'men'
                  ? 'bg-[#181B22] text-white font-medium border border-white/10 shadow-xs'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>Men</span>
            </button>

            <button
              onClick={() => setActiveCategoryTab('non_binary')}
              className={`px-4 py-1.5 rounded-full text-xs font-sans transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                activeCategoryTab === 'non_binary'
                  ? 'bg-[#181B22] text-white font-medium border border-white/10 shadow-xs'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>Non-Binary</span>
            </button>

            <button
              onClick={() => setActiveCategoryTab('couples')}
              className={`px-4 py-1.5 rounded-full text-xs font-sans transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                activeCategoryTab === 'couples'
                  ? 'bg-[#181B22] text-white font-medium border border-white/10 shadow-xs'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Couples</span>
            </button>
          </div>

          {/* Grid / List Switcher */}
          <div className="inline-flex items-center p-1 rounded-full bg-[#121419] border border-white/[0.08] shrink-0 self-start sm:self-auto">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-full transition-colors cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-[#181B22] text-white shadow-xs'
                  : 'text-zinc-400 hover:text-white'
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
                  ? 'bg-[#181B22] text-white shadow-xs'
                  : 'text-zinc-400 hover:text-white'
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
        <section className="relative rounded-2xl overflow-hidden bg-[#121419] border border-white/[0.08] group shadow-xl">
          <div className="relative aspect-[16/9] sm:aspect-[21/9] w-full overflow-hidden bg-[#07080A]">
            <img
              src={featuredProfile.coverImage || featuredProfile.avatar}
              alt={featuredProfile.name}
              className="w-full h-full object-cover filter contrast-[1.05] brightness-90 transition-transform duration-1000 ease-out group-hover:scale-[1.02]"
            />
            {/* Cinematic Gradient Overlays */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#07080A] via-[#07080A]/50 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#07080A]/90 via-[#07080A]/40 to-transparent" />

            {/* Spotlight Tag */}
            <div className="absolute top-5 left-5 sm:top-6 sm:left-8 flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-[10px] font-sans uppercase tracking-wider text-white flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-[#E5C590]" />
                <span>Featured Duo of the Month</span>
              </span>
            </div>

            {/* Spotlight Information */}
            <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-8 max-w-2xl text-white">
              <div className="flex items-center gap-2 text-xs font-mono text-zinc-400 mb-1.5">
                <span>{featuredProfile.city}</span>
                <span>·</span>
                <span>Open Duo Patron</span>
              </div>
              
              <h2 className="font-serif text-2xl sm:text-4xl text-white font-normal tracking-tight">
                {featuredProfile.name}
              </h2>

              <p className="text-xs sm:text-sm text-zinc-300 font-sans font-light line-clamp-2 mt-2 leading-relaxed">
                "{featuredProfile.bio}"
              </p>

              <div className="flex items-center gap-3 mt-4 pt-3 border-t border-white/[0.08]">
                <button
                  onClick={() => setInterestModalProfile(featuredProfile)}
                  className="py-2.5 px-5 rounded-full text-xs font-sans bg-white text-black hover:bg-zinc-200 font-medium flex items-center gap-2 transition-all cursor-pointer shadow-xs"
                >
                  <span>Request Introduction</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={() => onStartChat(featuredProfile)}
                  className="py-2.5 px-4 rounded-full text-xs font-sans bg-[#181B22] hover:bg-[#222631] text-white border border-white/15 transition-colors cursor-pointer"
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
              <h2 className="text-xs font-mono uppercase tracking-[0.2em] text-zinc-400">
                In Salon Right Now
              </h2>
            </div>
            <span className="text-[11px] font-mono text-zinc-500">
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
                <div className="relative w-18 h-18 sm:w-20 sm:h-20 rounded-full overflow-hidden bg-[#181B22] border border-white/10 group-hover:border-[#E5C590]/50 transition-all p-0.5">
                  <img
                    src={p.avatar}
                    alt={p.name}
                    className="w-full h-full object-cover rounded-full filter contrast-[1.05] group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute bottom-1 right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-[#121419]" />
                </div>
                <span className="font-sans text-xs text-zinc-200 mt-2 font-medium truncate w-full group-hover:text-white">
                  {p.name}
                </span>
                <span className="text-[10px] font-mono text-zinc-500 truncate w-full">
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
          <h2 className="text-xs font-mono uppercase tracking-[0.2em] text-zinc-400">
            Member Dossiers
          </h2>
          <span className="text-[11px] font-mono text-zinc-500">
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
                  className="p-4 rounded-2xl bg-[#121419] border border-white/[0.08] flex items-center justify-between gap-4 hover:border-white/20 transition-all shadow-md cursor-pointer group"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <img 
                      src={profile.avatar} 
                      alt={profile.name} 
                      className="w-14 h-14 rounded-2xl object-cover border border-white/15 shrink-0 group-hover:scale-105 transition-transform"
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="font-serif text-base text-white font-medium truncate group-hover:text-[#E5C590] transition-colors">
                          {profile.name}
                        </h4>
                        <span className="text-xs font-mono text-zinc-400">· {profile.age}</span>
                        {profile.isVerified && (
                          <ShieldCheck className="w-3.5 h-3.5 text-[#E5C590] shrink-0" />
                        )}
                        {profile.isPrivate && (
                          <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[9px] font-mono">
                            Gizli
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-zinc-400 font-sans flex items-center gap-2 mt-0.5">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-[#E5C590]" />
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
                      className="py-2 px-4 rounded-full text-xs font-sans bg-[#181B22] hover:bg-[#222631] text-white border border-white/15 transition-colors cursor-pointer"
                    >
                      Message
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setInterestModalProfile(profile);
                      }}
                      className="py-2 px-3.5 rounded-full text-xs font-sans bg-white hover:bg-zinc-200 text-black font-medium transition-colors cursor-pointer"
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
