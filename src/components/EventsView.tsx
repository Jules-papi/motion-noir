import React, { useState, useMemo, useEffect } from 'react';
import {
  Plus,
  Search,
  X,
  Users,
  ShieldCheck,
  CheckCircle2,
  Lock,
  KeyRound,
  Calendar,
  Grid,
  List,
  Bookmark,
  Ticket,
  Sparkles,
  SlidersHorizontal,
  Clock,
  MapPin,
  ArrowRight,
  Building,
  Crown
} from 'lucide-react';
import { PlatformEvent, UserProfile, CreateEventPayload, Venue } from '../types';
import { SupportedCurrency, SupportedLanguage } from '../types/anlatiTypes';
import { noirApi } from '../services/noirApi';
import { EventCard } from './EventCard';
import { EventCalendar } from './EventCalendar';
import { EventDetailModal } from './EventDetailModal';
import { CreateEventModal } from './CreateEventModal';
import { PersonalTicketModal } from './PersonalTicketModal';
import { EventOrganizerModal } from './EventOrganizerModal';
import { EventApplicationModal } from './EventApplicationModal';
import { DigitalConsentModal } from './DigitalConsentModal';
import { TicketWalletModal } from './TicketWalletModal';
import { VenuesView } from './VenuesView';
import { OrganizerApplicationModal } from './OrganizerApplicationModal';

export type EventViewMode = 'grid' | 'list' | 'calendar';
export type EventPrimaryTab = 'all' | 'upcoming' | 'popular' | 'saved' | 'my_registrations' | 'venues';
export type EventDateFilter = 'all' | 'weekend' | 'week' | 'month';

interface EventsViewProps {
  events: PlatformEvent[];
  currentUser: UserProfile;
  walletBalance: number;
  isUserSubscribed: boolean;
  currency?: SupportedCurrency;
  language?: SupportedLanguage;
  onApplyToEvent: (event: PlatformEvent, data: { participationType: string; note: string }) => void;
  onPayForTicket: (event: PlatformEvent) => void;
  onSignNdaForEvent?: (eventId: string) => void;
  onCheckIn: (eventId: string) => void;
  onCreateEvent: (newEvent: CreateEventPayload) => void;
  onSaveEvent?: (eventId: string) => void;
  onCancelRegistration?: (eventId: string) => void;
  onApproveEventApplication?: (eventId: string, applicantName?: string) => void;
  onToast?: (msg: { text: string; type: 'success' | 'info' | 'error' }) => void;
}

export const EventsView: React.FC<EventsViewProps> = ({
  events,
  currentUser,
  walletBalance,
  isUserSubscribed,
  currency = 'EUR',
  language = 'tr',
  onApplyToEvent,
  onPayForTicket,
  onSignNdaForEvent,
  onCheckIn,
  onCreateEvent,
  onSaveEvent,
  onCancelRegistration,
  onApproveEventApplication,
  onToast,
}) => {
  // Navigation & View Mode
  const [viewMode, setViewMode] = useState<EventViewMode>('grid');
  const [primaryTab, setPrimaryTab] = useState<EventPrimaryTab>('all');
  const [selectedCity, setSelectedCity] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedDateFilter, setSelectedDateFilter] = useState<EventDateFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Venues state
  const [venues, setVenues] = useState<Venue[]>([]);
  const [prefilledVenue, setPrefilledVenue] = useState<Venue | null>(null);

  // Modals state
  const [selectedDetailEvent, setSelectedDetailEvent] = useState<PlatformEvent | null>(null);
  const [activeQrEvent, setActiveQrEvent] = useState<PlatformEvent | null>(null);
  const [organizerEvent, setOrganizerEvent] = useState<PlatformEvent | null>(null);
  const [applyingEvent, setApplyingEvent] = useState<PlatformEvent | null>(null);
  const [ndaEvent, setNdaEvent] = useState<PlatformEvent | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isTicketWalletOpen, setIsTicketWalletOpen] = useState(false);
  const [isOrganizerModalOpen, setIsOrganizerModalOpen] = useState(false);

  // Load verified partner venues from Supabase
  useEffect(() => {
    noirApi.getVenues()
      .then(res => setVenues(res))
      .catch(err => console.warn('Could not load venues in EventsView:', err));
  }, []);

  // Available Cities
  const cities = useMemo(() => {
    const list = ['all', 'Amsterdam', 'Rotterdam', 'Utrecht', 'İstanbul', 'Paris'];
    events.forEach(e => {
      if (e.city && !list.includes(e.city)) list.push(e.city);
    });
    return list;
  }, [events]);

  // Categories
  const categories = [
    { id: 'all', label: 'Tüm Salonlar' },
    { id: 'swinger', label: 'Swinger & Eşli' },
    { id: 'trio', label: 'Duo & Trio' },
    { id: 'sexparty', label: 'Chamber & Playroom' },
    { id: 'cocktail', label: 'Vernissage & Kokteyl' },
    { id: 'dinner', label: 'Özel Côte Retreat' },
    { id: 'kink', label: 'Kink & Fetish' },
  ];

  // Filtering Logic
  const filteredEvents = useMemo(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    return events.filter(e => {
      // 1. Primary Tab Filter
      if (primaryTab === 'saved' && !e.isSaved) return false;
      if (primaryTab === 'my_registrations' && !e.isUserRegistered) return false;

      // 2. City Filter
      if (selectedCity !== 'all' && e.city?.toLowerCase() !== selectedCity.toLowerCase()) {
        return false;
      }

      // 3. Category Filter
      if (selectedCategory !== 'all' && e.category !== selectedCategory) {
        return false;
      }

      // 4. Date Filter
      const evtDate = new Date(e.startsAt);
      if (!isNaN(evtDate.getTime())) {
        if (selectedDateFilter === 'weekend') {
          // Friday evening to Sunday
          const day = evtDate.getDay();
          if (day !== 5 && day !== 6 && day !== 0) return false;
        } else if (selectedDateFilter === 'week') {
          const in7Days = new Date(today);
          in7Days.setDate(in7Days.getDate() + 7);
          if (evtDate < today || evtDate > in7Days) return false;
        } else if (selectedDateFilter === 'month') {
          if (evtDate.getMonth() !== now.getMonth() || evtDate.getFullYear() !== now.getFullYear()) {
            return false;
          }
        }
      }

      // 5. Search Query Filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesTitle = e.title.toLowerCase().includes(q);
        const matchesVenue = e.venue?.toLowerCase().includes(q) || false;
        const matchesDesc = e.description?.toLowerCase().includes(q) || false;
        const matchesCity = e.city?.toLowerCase().includes(q) || false;
        if (!matchesTitle && !matchesVenue && !matchesDesc && !matchesCity) return false;
      }

      return true;
    });
  }, [events, primaryTab, selectedCity, selectedCategory, selectedDateFilter, searchQuery]);

  // Sorted views
  const displayEvents = useMemo(() => {
    if (primaryTab === 'popular') {
      return [...filteredEvents].sort((a, b) => (b.attendeesCount || 0) - (a.attendeesCount || 0));
    }
    // Default: upcoming (start_at ascending)
    return [...filteredEvents].sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime());
  }, [filteredEvents, primaryTab]);

  return (
    <div className="space-y-8 pb-24 max-w-7xl mx-auto">
      {/* 1. EDITORIAL HEADER */}
      <div className="pt-2 sm:pt-4 border-b border-white/[0.08] pb-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <span className="text-[10px] font-mono tracking-[0.28em] text-[#C5A880] uppercase block">
              Private Gatherings, Nocturnes & Calendar
            </span>
            <h1 className="font-serif text-3xl sm:text-5xl font-light text-[#F1EFEA] tracking-tight">
              Exclusive Salons
            </h1>
            <p className="text-sm text-[#9A9996] font-sans font-light leading-relaxed">
              Curated guest lists, pre-invitation vetting, sealed-camera private estates, and mutual non-disclosure accords across Amsterdam, Paris, and the Aegean Côte.
            </p>
          </div>

          {/* Action CTAs */}
          <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap shrink-0">
            <button
              onClick={() => setIsTicketWalletOpen(true)}
              className="py-2 px-3.5 rounded-full bg-[#1A1A1E] hover:bg-[#222228] text-[#C5A880] border border-[#C5A880]/30 text-xs font-serif uppercase tracking-[0.12em] flex items-center gap-2 transition-all cursor-pointer shadow-sm active:scale-95"
            >
              <Ticket className="w-3.5 h-3.5 text-[#C5A880]" />
              <span>Bilet Cüzdanı</span>
            </button>

            {!currentUser.isOrganizer && !currentUser.isAdmin && (
              <button
                onClick={() => setIsOrganizerModalOpen(true)}
                className="py-2 px-3.5 rounded-full bg-[#1A1A1E] hover:bg-[#222228] text-[#C5A880] border border-[#C5A880]/30 text-xs font-serif uppercase tracking-[0.12em] flex items-center gap-1.5 transition-all cursor-pointer shadow-sm active:scale-95"
                title="Küratör veya Salon Organizatörü Başvurusu Yap"
              >
                <Crown className="w-3.5 h-3.5 text-[#C5A880]" />
                <span>Küratör Ol</span>
              </button>
            )}

            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="py-2 px-4 rounded-full bg-[#C5A880] hover:bg-[#B89B6E] text-[#09090B] text-xs font-serif uppercase tracking-[0.14em] font-semibold flex items-center gap-2 transition-all cursor-pointer shadow-md active:scale-95"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Host Salon</span>
            </button>

            {events.length > 0 && (
              <button
                onClick={() => setOrganizerEvent(events[0])}
                className="py-2 px-3.5 rounded-full bg-[#111113] text-[#9A9996] hover:text-[#F1EFEA] border border-white/[0.08] text-xs font-serif uppercase tracking-[0.12em] transition-colors cursor-pointer"
              >
                Küratör Paneli
              </button>
            )}
          </div>
        </div>

        {/* 2. PRIMARY NAVIGATION TABS & VIEW MODE SWITCHER */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-6 border-t border-white/[0.06] mt-6">
          {/* Section Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
            <button
              onClick={() => setPrimaryTab('all')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-serif uppercase tracking-wider transition-all cursor-pointer shrink-0 ${
                primaryTab === 'all'
                  ? 'bg-[#1A1A1E] text-[#C5A880] border border-[#C5A880]/30 shadow-sm'
                  : 'text-[#9A9996] hover:text-[#F1EFEA]'
              }`}
            >
              Tüm Salonlar ({events.length})
            </button>
            <button
              onClick={() => setPrimaryTab('upcoming')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-serif uppercase tracking-wider transition-all cursor-pointer shrink-0 ${
                primaryTab === 'upcoming'
                  ? 'bg-[#1A1A1E] text-[#C5A880] border border-[#C5A880]/30 shadow-sm'
                  : 'text-[#9A9996] hover:text-[#F1EFEA]'
              }`}
            >
              Yaklaşanlar
            </button>
            <button
              onClick={() => setPrimaryTab('popular')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-serif uppercase tracking-wider transition-all cursor-pointer shrink-0 ${
                primaryTab === 'popular'
                  ? 'bg-[#1A1A1E] text-[#C5A880] border border-[#C5A880]/30 shadow-sm'
                  : 'text-[#9A9996] hover:text-[#F1EFEA]'
              }`}
            >
              Popüler Salonlar
            </button>
            <button
              onClick={() => setPrimaryTab('venues')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-serif uppercase tracking-wider transition-all cursor-pointer shrink-0 flex items-center gap-1.5 ${
                primaryTab === 'venues'
                  ? 'bg-[#1A1A1E] text-[#C5A880] border border-[#C5A880]/30 shadow-sm'
                  : 'text-[#9A9996] hover:text-[#F1EFEA]'
              }`}
            >
              <Building className="w-3 h-3 text-[#C5A880]" />
              <span>Mekanlar & Salonlar ({venues.length})</span>
            </button>
            <button
              onClick={() => setPrimaryTab('saved')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-serif uppercase tracking-wider transition-all cursor-pointer shrink-0 flex items-center gap-1.5 ${
                primaryTab === 'saved'
                  ? 'bg-[#1A1A1E] text-[#C5A880] border border-[#C5A880]/30 shadow-sm'
                  : 'text-[#9A9996] hover:text-[#F1EFEA]'
              }`}
            >
              <Bookmark className="w-3 h-3" />
              <span>Ajandam</span>
            </button>
            <button
              onClick={() => setPrimaryTab('my_registrations')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-serif uppercase tracking-wider transition-all cursor-pointer shrink-0 flex items-center gap-1.5 ${
                primaryTab === 'my_registrations'
                  ? 'bg-[#1A1A1E] text-[#C5A880] border border-[#C5A880]/30 shadow-sm'
                  : 'text-[#9A9996] hover:text-[#F1EFEA]'
              }`}
            >
              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
              <span>Başvurularım</span>
            </button>
          </div>

          {/* View Mode Toggle (Grid / List / Calendar) */}
          <div className="flex items-center gap-1 bg-black/40 p-1 rounded-xl border border-white/[0.08] self-start sm:self-auto shrink-0">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-[#1A1A1E] text-[#C5A880] shadow-sm'
                  : 'text-[#9A9996] hover:text-[#F1EFEA]'
              }`}
              title="Grid Görünümü"
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                viewMode === 'list'
                  ? 'bg-[#1A1A1E] text-[#C5A880] shadow-sm'
                  : 'text-[#9A9996] hover:text-[#F1EFEA]'
              }`}
              title="Liste Görünümü"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-serif flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === 'calendar'
                  ? 'bg-[#1A1A1E] text-[#C5A880] shadow-sm font-medium'
                  : 'text-[#9A9996] hover:text-[#F1EFEA]'
              }`}
              title="Takvim Görünümü"
            >
              <Calendar className="w-4 h-4" />
              <span>Takvim</span>
            </button>
          </div>
        </div>

        {/* 3. MULTI-LEVEL FILTERS (Search, City, Category, Date) - Only shown for Events, Venues has its own filters */}
        {primaryTab !== 'venues' && (
          <div className="space-y-3 pt-5">
            {/* Row A: Search Bar + City Filter + Date Filter */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
              {/* Search Input */}
              <div className="sm:col-span-6 relative">
                <Search className="w-4 h-4 text-[#9A9996] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Salon adı, mekan, şehir veya açıklama ara..."
                  className="w-full pl-10 pr-9 py-2.5 rounded-xl bg-[#111113] border border-white/[0.08] text-xs text-[#F1EFEA] placeholder-[#66666A] focus:outline-none focus:border-[#C5A880]/50 font-sans"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9A9996] hover:text-[#F1EFEA]"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* City Dropdown */}
              <div className="sm:col-span-3">
                <select
                  value={selectedCity}
                  onChange={e => setSelectedCity(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#111113] border border-white/[0.08] text-xs text-[#F1EFEA] focus:outline-none focus:border-[#C5A880]/50 font-serif"
                >
                  <option value="all">Tüm Şehirler</option>
                  {cities.filter(c => c !== 'all').map(city => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
              </div>

              {/* Date Quick Filter */}
              <div className="sm:col-span-3">
                <select
                  value={selectedDateFilter}
                  onChange={e => setSelectedDateFilter(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#111113] border border-white/[0.08] text-xs text-[#F1EFEA] focus:outline-none focus:border-[#C5A880]/50 font-serif"
                >
                  <option value="all">Tüm Tarihler</option>
                  <option value="weekend">Bu Hafta Sonu (Cuma-Paz)</option>
                  <option value="week">Gelecek 7 Gün</option>
                  <option value="month">Bu Ay</option>
                </select>
              </div>
            </div>

            {/* Row B: Category Pills */}
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pt-1">
              {categories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-full text-xs font-serif uppercase tracking-[0.12em] transition-all cursor-pointer shrink-0 ${
                    selectedCategory === cat.id
                      ? 'bg-[#1A1A1E] text-[#C5A880] border border-[#C5A880]/40 shadow-sm'
                      : 'bg-[#111113] text-[#9A9996] border border-white/[0.06] hover:text-[#F1EFEA]'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 4. ADMISSION PROTOCOL BANNER - Only for Events */}
      {primaryTab !== 'venues' && (
        <div className="p-4 sm:p-5 rounded-xl bg-[#111113] border border-white/[0.08] flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-3">
            <KeyRound className="w-4 h-4 text-[#C5A880] shrink-0" />
            <div className="space-y-0.5">
              <span className="font-serif text-[#F1EFEA] text-sm block">Admission Protocol</span>
              <span className="text-[#9A9996] font-sans">
                1. Request Admission ➔ 2. Concierge Vetting ➔ 3. Sign Encrypted NDA ➔ 4. Receive Personal QR Token
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 font-mono text-[10px] text-[#9A9996]">
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/40 border border-white/5">
              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
              <span>Strict Consent</span>
            </span>
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/40 border border-white/5">
              <Lock className="w-3 h-3 text-[#C5A880]" />
              <span>Sealed Optics</span>
            </span>
          </div>
        </div>
      )}

      {/* 5. MAIN CONTENT DISPLAY (Venues vs Calendar vs Grid vs List) */}
      {primaryTab === 'venues' ? (
        <VenuesView
          venues={venues}
          events={events}
          currentUser={currentUser}
          onHostInVenue={(venue) => {
            const isEligible = currentUser.isOrganizer || currentUser.organizerStatus === 'verified' || currentUser.isAdmin;
            if (isEligible) {
              setPrefilledVenue(venue);
              setIsCreateModalOpen(true);
            } else {
              onToast?.({
                text: 'Özel mekanlarda salon organize edebilmek için onaylı küratör başvurusu gereklidir.',
                type: 'info'
              });
              setIsOrganizerModalOpen(true);
            }
          }}
          onSelectEvent={(evt) => setSelectedDetailEvent(evt)}
          onToast={onToast}
        />
      ) : viewMode === 'calendar' ? (
        <EventCalendar
          events={displayEvents}
          currentUser={currentUser}
          onSelectEvent={evt => setSelectedDetailEvent(evt)}
          onApplyClick={evt => setApplyingEvent(evt)}
        />
      ) : displayEvents.length === 0 ? (
        /* Empty State */
        <div className="p-16 text-center rounded-2xl bg-[#111113] border border-white/[0.08] space-y-3">
          <Calendar className="w-10 h-10 text-[#C5A880] mx-auto opacity-50 mb-2" />
          <h3 className="font-serif text-lg text-[#F1EFEA] font-light">
            Seçtiğiniz kriterlere uygun salon bulunamadı.
          </h3>
          <p className="text-xs text-[#9A9996] max-w-md mx-auto font-sans leading-relaxed">
            Filtreleri temizleyerek diğer şehirlerdeki veya farklı kategorilerdeki özel salon davetlerini keşfedebilirsiniz.
          </p>
          <button
            onClick={() => {
              setSelectedCity('all');
              setSelectedCategory('all');
              setSelectedDateFilter('all');
              setSearchQuery('');
              setPrimaryTab('all');
            }}
            className="mt-3 px-4 py-2 rounded-xl bg-[#1A1A1E] hover:bg-[#222228] text-[#C5A880] border border-[#C5A880]/30 text-xs font-serif uppercase tracking-wider transition-all cursor-pointer"
          >
            Filtreleri Sıfırla
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        /* Grid View */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
          {displayEvents.map(event => (
            <div key={event.id} className="relative group">
              <EventCard
                event={event}
                currentUser={currentUser}
                isUserSubscribed={isUserSubscribed}
                currency={currency}
                onApplyClick={e => setApplyingEvent(e)}
                onPayTicket={onPayForTicket}
                onOpenQrModal={e => setActiveQrEvent(e)}
                onSignNdaClick={e => setNdaEvent(e)}
                onOpenOrganizerPanel={e => setOrganizerEvent(e)}
              />
              {/* Quick Detail Overlay Click */}
              <button
                onClick={() => setSelectedDetailEvent(event)}
                className="absolute top-4 left-4 p-2 rounded-full bg-black/60 hover:bg-black/90 text-[#F1EFEA] border border-white/10 backdrop-blur-md transition-all cursor-pointer shadow-md"
                title="Salon Ayrıntılarını İncele"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#C5A880]" />
              </button>
            </div>
          ))}
        </div>
      ) : (
        /* List View (Row Style) */
        <div className="space-y-4">
          {displayEvents.map(event => {
            const timeStr = new Date(event.startsAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            const dateStr = new Date(event.startsAt).toLocaleDateString('tr-TR', {
              day: 'numeric',
              month: 'long',
              weekday: 'short',
            });
            const isApproved = event.applicationStatus === 'approved' || event.applicationStatus === 'paid';

            return (
              <div
                key={event.id}
                onClick={() => setSelectedDetailEvent(event)}
                className="p-4 sm:p-5 rounded-xl bg-[#111113] border border-white/[0.08] hover:border-[#C5A880]/40 transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
              >
                <div className="flex items-center gap-4">
                  <img
                    src={event.coverImage}
                    alt={event.title}
                    className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl object-cover shrink-0 border border-white/[0.08] group-hover:scale-105 transition-transform"
                  />
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-[11px] font-mono text-[#9A9996]">
                      <span className="text-[#C5A880] uppercase">{event.category}</span>
                      <span>·</span>
                      <span className="flex items-center gap-1 text-[#F1EFEA]">
                        <Clock className="w-3 h-3 text-[#C5A880]" />
                        {dateStr} ({timeStr})
                      </span>
                      <span>·</span>
                      <span>{event.city}</span>
                    </div>

                    <h4 className="font-serif text-base sm:text-lg text-[#F1EFEA] font-light group-hover:text-[#C5A880] transition-colors line-clamp-1">
                      {event.title}
                    </h4>

                    <p className="text-xs text-[#9A9996] font-sans line-clamp-1">
                      {event.venue} — {event.description}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-white/[0.06]">
                  <div className="text-left sm:text-right">
                    <span className="text-[10px] font-mono text-[#9A9996] block">Ücret</span>
                    <span className="font-serif text-sm text-[#C5A880]">
                      {event.price === 0 ? 'Serbest' : `${event.price} ${event.currency || 'EUR'}`}
                    </span>
                  </div>

                  {isApproved ? (
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        setActiveQrEvent(event);
                      }}
                      className="py-2 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-black text-xs font-serif uppercase tracking-wider font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-md"
                    >
                      <Ticket className="w-3.5 h-3.5" />
                      <span>Giriş Kartı</span>
                    </button>
                  ) : event.applicationStatus === 'pending' ? (
                    <span className="px-3 py-1.5 rounded-xl bg-white/[0.04] text-[#C5A880] border border-white/[0.08] text-xs font-serif uppercase tracking-wider">
                      İnceleniyor
                    </span>
                  ) : (
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        setApplyingEvent(event);
                      }}
                      className="py-2 px-4 rounded-xl bg-[#C5A880] hover:bg-[#B89B6E] text-[#09090B] text-xs font-serif uppercase tracking-wider font-semibold transition-all cursor-pointer shadow-md active:scale-95"
                    >
                      Katıl
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 6. MODALS */}
      {selectedDetailEvent && (
        <EventDetailModal
          event={selectedDetailEvent}
          currentUser={currentUser}
          isOpen={Boolean(selectedDetailEvent)}
          onClose={() => setSelectedDetailEvent(null)}
          onApplyClick={e => setApplyingEvent(e)}
          onOpenQrModal={e => setActiveQrEvent(e)}
          onSignNdaClick={e => setNdaEvent(e)}
          onOpenOrganizerPanel={e => setOrganizerEvent(e)}
          onToggleSave={onSaveEvent}
          onToast={onToast}
        />
      )}

      {activeQrEvent && (
        <PersonalTicketModal
          event={activeQrEvent}
          currentUser={currentUser}
          onClose={() => setActiveQrEvent(null)}
        />
      )}

      {organizerEvent && (
        <EventOrganizerModal
          event={organizerEvent}
          onClose={() => setOrganizerEvent(null)}
          onToast={onToast}
          onApproveApplicationForEvent={(eventId: string, applicantName: string) => {
            if (onApproveEventApplication) {
              onApproveEventApplication(eventId, applicantName);
            }
          }}
        />
      )}

      {applyingEvent && (
        <EventApplicationModal
          isOpen={Boolean(applyingEvent)}
          event={applyingEvent}
          currentUser={currentUser}
          onClose={() => setApplyingEvent(null)}
          onSubmitApplication={data => {
            if (applyingEvent) {
              onApplyToEvent(applyingEvent, data);
            }
            setApplyingEvent(null);
          }}
        />
      )}

      {ndaEvent && (
        <DigitalConsentModal
          isOpen={Boolean(ndaEvent)}
          event={ndaEvent}
          language={language}
          onClose={() => setNdaEvent(null)}
          onConfirmConsent={(eventId: string) => {
            if (onSignNdaForEvent) {
              onSignNdaForEvent(eventId);
            }
            onPayForTicket(ndaEvent);
            setNdaEvent(null);
          }}
        />
      )}

      {isCreateModalOpen && (
        <CreateEventModal
          isOpen={isCreateModalOpen}
          onClose={() => {
            setIsCreateModalOpen(false);
            setPrefilledVenue(null);
          }}
          onCreateEvent={onCreateEvent}
          currentUser={currentUser}
          initialVenue={prefilledVenue}
          onToast={onToast}
        />
      )}

      {isOrganizerModalOpen && (
        <OrganizerApplicationModal
          currentUser={currentUser}
          isOpen={isOrganizerModalOpen}
          onClose={() => setIsOrganizerModalOpen(false)}
          onToast={onToast}
          onSuccess={() => {
            onToast?.({
              text: 'Küratör başvurunuz kaydedildi. İnceleme sonrası bilgilendirileceksiniz.',
              type: 'success'
            });
          }}
        />
      )}

      {isTicketWalletOpen && (
        <TicketWalletModal
          isOpen={isTicketWalletOpen}
          onClose={() => setIsTicketWalletOpen(false)}
          events={events}
          currentUser={currentUser}
          onCheckInEvent={onCheckIn}
          onToast={onToast || (() => {})}
        />
      )}
    </div>
  );
};
