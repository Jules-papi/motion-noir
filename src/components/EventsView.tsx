import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  X,
  Users,
  ShieldCheck,
  CheckCircle2,
  Lock,
  KeyRound,
  ArrowRight
} from 'lucide-react';
import { PlatformEvent, UserProfile } from '../types';
import { SupportedCurrency, SupportedLanguage } from '../types/anlatiTypes';
import { EventCard } from './EventCard';
import { CreateEventModal } from './CreateEventModal';
import { PersonalTicketModal } from './PersonalTicketModal';
import { EventOrganizerModal } from './EventOrganizerModal';
import { EventApplicationModal } from './EventApplicationModal';
import { DigitalConsentModal } from './DigitalConsentModal';

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
  onCreateEvent: (newEvent: Partial<PlatformEvent>) => void;
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
  onApproveEventApplication,
  onToast,
}) => {
  const [selectedCity, setSelectedCity] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [activeQrEvent, setActiveQrEvent] = useState<PlatformEvent | null>(null);
  const [organizerEvent, setOrganizerEvent] = useState<PlatformEvent | null>(null);
  const [applyingEvent, setApplyingEvent] = useState<PlatformEvent | null>(null);
  const [ndaEvent, setNdaEvent] = useState<PlatformEvent | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const filteredEvents = events.filter(e => {
    const matchesCity = selectedCity === 'all' || e.city.toLowerCase() === selectedCity.toLowerCase();
    const matchesCategory = selectedCategory === 'all' || e.category === selectedCategory;
    const matchesSearch = e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          e.venue.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          e.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCity && matchesCategory && matchesSearch;
  });

  const categories = [
    { id: 'all', label: 'All Salons' },
    { id: 'swinger', label: 'Sanctuary & Swinger' },
    { id: 'trio', label: 'Duo & Trio Soirées' },
    { id: 'sexparty', label: 'Chamber & Playroom' },
    { id: 'cocktail', label: 'Intimate Vernissage' },
    { id: 'dinner', label: 'Private Côte Retreats' },
  ];

  return (
    <div className="space-y-10 pb-24 max-w-7xl mx-auto">
      {/* 1. EDITORIAL HEADER */}
      <div className="pt-2 sm:pt-4 border-b border-white/[0.08] pb-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <span className="text-[10px] font-mono tracking-[0.28em] text-[#C5A880] uppercase block">
              Private Gatherings & Nocturnes
            </span>
            <h1 className="font-serif text-3xl sm:text-5xl font-light text-[#F4F1EC] tracking-tight">
              Exclusive Salons
            </h1>
            <p className="text-sm text-[#9B9894] font-sans font-light leading-relaxed">
              Curated guest lists, pre-invitation vetting, sealed-camera private estates, and mutual non-disclosure accords across Amsterdam, Paris, and the Aegean Côte.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="py-2.5 px-5 rounded-full bg-[#181B22] hover:bg-[#222631] text-[#E5C590] border border-[#E5C590]/40 text-xs font-serif uppercase tracking-[0.14em] flex items-center gap-2 transition-all cursor-pointer shadow-md"
            >
              <Plus className="w-3.5 h-3.5 text-[#E5C590]" />
              <span>Host Salon</span>
            </button>

            <button
              onClick={() => setOrganizerEvent(events[0])}
              className="py-2.5 px-5 rounded-full bg-[#121419] text-zinc-400 hover:text-white border border-white/[0.08] text-xs font-serif uppercase tracking-[0.14em] transition-colors cursor-pointer"
            >
              Concierge Panel
            </button>
          </div>
        </div>

        {/* Quiet Luxury Pill Capsule Tabs */}
        <div className="flex items-center gap-2 pt-6 overflow-x-auto no-scrollbar">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-1.5 rounded-full text-xs font-serif uppercase tracking-[0.14em] transition-all cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-[#181B22] text-[#E5C590] border border-[#E5C590]/40 shadow-sm'
                  : 'bg-[#121419] text-zinc-400 border border-white/[0.06] hover:text-white'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* 2. ADMISSION PROTOCOL SPECIFICATION */}
      <div className="p-4 sm:p-5 rounded-2xl bg-[#121419] border border-white/[0.08] flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-3">
          <KeyRound className="w-4 h-4 text-[#E5C590] shrink-0" />
          <div className="space-y-0.5">
            <span className="font-serif text-white text-sm block">Admission Protocol</span>
            <span className="text-zinc-400 font-sans">
              1. Request Admission ➔ 2. Concierge Vetting ➔ 3. Sign Encrypted NDA ➔ 4. Receive Personal QR Token
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 font-mono text-[10px] text-zinc-400">
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/40 border border-white/5">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            <span>Strict Consent</span>
          </span>
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/40 border border-white/5">
            <Lock className="w-3 h-3 text-[#E5C590]" />
            <span>Sealed Optics</span>
          </span>
        </div>
      </div>

      {/* 3. INVITATION CARDS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
        {filteredEvents.map(event => (
          <EventCard
            key={event.id}
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
        ))}
      </div>

      {/* Modals */}
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
          onClose={() => setIsCreateModalOpen(false)}
          onCreateEvent={(newEvent: Partial<PlatformEvent>) => {
            onCreateEvent(newEvent);
            setIsCreateModalOpen(false);
          }}
        />
      )}
    </div>
  );
};
