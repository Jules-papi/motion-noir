import React, { useState, useMemo } from 'react';
import {
  Building,
  MapPin,
  Users,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  Search,
  X,
  Filter,
  ArrowRight,
  Plus
} from 'lucide-react';
import { Venue, PlatformEvent, UserProfile } from '../types';
import { VenueDetailModal } from './VenueDetailModal';

interface VenuesViewProps {
  venues: Venue[];
  events: PlatformEvent[];
  currentUser: UserProfile;
  onHostInVenue?: (venue: Venue) => void;
  onSelectEvent?: (event: PlatformEvent) => void;
  onToast?: (msg: { text: string; type: 'success' | 'info' | 'error' }) => void;
}

export const VenuesView: React.FC<VenuesViewProps> = ({
  venues,
  events,
  currentUser,
  onHostInVenue,
  onSelectEvent,
  onToast,
}) => {
  const [selectedCity, setSelectedCity] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedVenue, setSelectedVenue] = useState<Venue | null>(null);

  const cities = useMemo(() => {
    const list = ['all', 'Amsterdam', 'Rotterdam', 'Utrecht', 'İstanbul', 'Paris'];
    venues.forEach(v => {
      if (v.city && !list.includes(v.city)) list.push(v.city);
    });
    return list;
  }, [venues]);

  const venueTypes = [
    { id: 'all', label: 'Tüm Mekanlar' },
    { id: 'villa', label: 'Özel Malikane & Villa' },
    { id: 'club', label: 'Gizli Kulüp & Lounge' },
    { id: 'suite', label: 'Yalı & Çatı Süiti' },
    { id: 'bunker', label: 'Endüstriyel Bunker' },
    { id: 'hotel', label: 'Şato & Butik Otel' },
  ];

  const filteredVenues = useMemo(() => {
    return venues.filter(v => {
      if (selectedCity !== 'all' && v.city?.toLowerCase() !== selectedCity.toLowerCase()) {
        return false;
      }
      if (selectedType !== 'all' && v.venueType !== selectedType) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = v.name.toLowerCase().includes(q);
        const matchesCity = v.city.toLowerCase().includes(q);
        const matchesDesc = v.description.toLowerCase().includes(q);
        if (!matchesName && !matchesCity && !matchesDesc) return false;
      }
      return true;
    });
  }, [venues, selectedCity, selectedType, searchQuery]);

  return (
    <div className="space-y-8">
      {/* Header & Filters */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="space-y-1">
            <span className="text-[10px] font-mono tracking-widest text-[#C5A880] uppercase block">
              Boutique Venues, Estates & Dungeons
            </span>
            <h3 className="font-serif text-2xl sm:text-3xl text-[#F1EFEA] font-light">
              Doğrulanmış Partner Mekanlar
            </h3>
            <p className="text-xs text-[#9A9996] font-sans max-w-xl leading-relaxed">
              Özel ısıtmalı havuzlu malikaneler, ses yalıtımlı tarihi yalı süitleri, darkroom kulüpleri ve şatolar.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-[#9A9996]">
              {filteredVenues.length} Doğrulanmış Mekan
            </span>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-2">
          <div className="sm:col-span-6 relative">
            <Search className="w-4 h-4 text-[#9A9996] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Mekan adı, özellik veya şehir ara..."
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

          <div className="sm:col-span-3">
            <select
              value={selectedType}
              onChange={e => setSelectedType(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#111113] border border-white/[0.08] text-xs text-[#F1EFEA] focus:outline-none focus:border-[#C5A880]/50 font-serif"
            >
              {venueTypes.map(vt => (
                <option key={vt.id} value={vt.id}>{vt.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Venues Grid */}
      {filteredVenues.length === 0 ? (
        <div className="p-16 text-center rounded-2xl bg-[#111113] border border-white/[0.08] space-y-2">
          <Building className="w-10 h-10 text-[#C5A880] mx-auto opacity-50 mb-2" />
          <p className="font-serif text-base text-[#F1EFEA]">Filtreye uygun mekan bulunamadı.</p>
          <p className="text-xs text-[#9A9996]">Filtreleri sıfırlayarak tüm partner mekanları görüntüleyebilirsiniz.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVenues.map(venue => {
            const venueEvents = events.filter(e => e.venueId === venue.id || e.venue === venue.name);

            return (
              <div
                key={venue.id}
                onClick={() => setSelectedVenue(venue)}
                className="rounded-2xl bg-[#111113] border border-white/[0.08] hover:border-[#C5A880]/40 transition-all cursor-pointer overflow-hidden flex flex-col justify-between group shadow-xl"
              >
                <div>
                  {/* Cover */}
                  <div className="relative aspect-[16/10] w-full overflow-hidden bg-[#09090B]">
                    <img
                      src={venue.coverImage}
                      alt={venue.name}
                      className="w-full h-full object-cover filter contrast-[1.05] brightness-90 group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#111113] via-transparent to-transparent" />

                    <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono tracking-widest text-[#C5A880] uppercase bg-black/60 backdrop-blur-md border border-[#C5A880]/30">
                        {venue.venueType}
                      </span>

                      {venue.isVerified && (
                        <span className="px-2.5 py-0.5 rounded-full text-[9px] font-mono text-emerald-400 bg-black/60 backdrop-blur-md border border-emerald-500/30 flex items-center gap-1">
                          <CheckCircle2 className="w-2.5 h-2.5" /> Doğrulanmış
                        </span>
                      )}
                    </div>

                    <div className="absolute bottom-3 left-3">
                      <span className="text-[10px] font-mono text-[#F1EFEA] flex items-center gap-1 bg-black/60 px-2.5 py-1 rounded-md backdrop-blur-md">
                        <MapPin className="w-3 h-3 text-[#C5A880]" />
                        {venue.city}
                      </span>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-4 space-y-2">
                    <h4 className="font-serif text-lg text-[#F1EFEA] font-light group-hover:text-[#C5A880] transition-colors line-clamp-1">
                      {venue.name}
                    </h4>
                    <p className="text-xs text-[#9A9996] font-sans line-clamp-2 leading-relaxed">
                      {venue.description}
                    </p>

                    {/* Amenities pills */}
                    {venue.amenities && venue.amenities.length > 0 && (
                      <div className="flex items-center gap-1.5 pt-2 flex-wrap">
                        {venue.amenities.slice(0, 3).map((item, i) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 rounded text-[9px] font-mono bg-white/[0.04] text-[#9A9996] border border-white/[0.06]"
                          >
                            {item}
                          </span>
                        ))}
                        {venue.amenities.length > 3 && (
                          <span className="text-[9px] font-mono text-[#C5A880]">
                            +{venue.amenities.length - 3}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer Strip */}
                <div className="p-4 pt-3 border-t border-white/[0.06] flex items-center justify-between text-xs">
                  <span className="text-[11px] font-mono text-[#9A9996] flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-[#C5A880]" />
                    {venue.capacity ? `Max ${venue.capacity} Kişi` : 'Gizli Kapasite'}
                  </span>

                  <span className="text-xs font-serif text-[#C5A880] flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                    İncele <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Selected Venue Detail Modal */}
      {selectedVenue && (
        <VenueDetailModal
          venue={selectedVenue}
          isOpen={Boolean(selectedVenue)}
          onClose={() => setSelectedVenue(null)}
          onHostHere={onHostInVenue}
          upcomingEvents={events.filter(e => e.venueId === selectedVenue.id || e.venue === selectedVenue.name)}
          onSelectEvent={onSelectEvent}
        />
      )}
    </div>
  );
};
