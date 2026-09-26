import React from 'react';
import {
  X,
  MapPin,
  Users,
  ShieldCheck,
  CheckCircle2,
  Lock,
  Sparkles,
  Calendar,
  Building,
  KeyRound,
  ArrowRight
} from 'lucide-react';
import { Venue, PlatformEvent } from '../types';

interface VenueDetailModalProps {
  venue: Venue;
  isOpen: boolean;
  onClose: () => void;
  onHostHere?: (venue: Venue) => void;
  upcomingEvents?: PlatformEvent[];
  onSelectEvent?: (event: PlatformEvent) => void;
}

export const VenueDetailModal: React.FC<VenueDetailModalProps> = ({
  venue,
  isOpen,
  onClose,
  onHostHere,
  upcomingEvents = [],
  onSelectEvent,
}) => {
  if (!isOpen) return null;

  const venueTypeLabels: Record<string, string> = {
    villa: 'Özel Malikane / Villa',
    club: 'Gizli Kulüp / Lounge',
    suite: 'Tarihi Yalı / Çatı Süiti',
    bunker: 'Endüstriyel Bunker & Darkroom',
    hotel: 'Şato / Butik Otel',
    resort: 'Sahil / Kır Malikanesi',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-3xl rounded-2xl bg-[#111113] border border-white/[0.08] shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Cover Image & Hero */}
        <div className="relative h-60 sm:h-72 w-full shrink-0 overflow-hidden bg-[#09090B]">
          <img
            src={venue.coverImage}
            alt={venue.name}
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#111113] via-[#111113]/30 to-transparent" />

          {/* Top Controls */}
          <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-[10px] font-mono tracking-widest text-[#C5A880] uppercase bg-black/60 backdrop-blur-md border border-[#C5A880]/30 shadow-md">
                {venueTypeLabels[venue.venueType] || venue.venueType}
              </span>
              {venue.isVerified && (
                <span className="px-3 py-1 rounded-full text-[10px] font-mono tracking-widest text-emerald-400 uppercase bg-black/60 backdrop-blur-md border border-emerald-500/30 flex items-center gap-1 shadow-md">
                  <CheckCircle2 className="w-3 h-3" /> Doğrulanmış Mekan
                </span>
              )}
            </div>

            <button
              onClick={onClose}
              className="p-2.5 rounded-full bg-black/60 hover:bg-black/90 text-[#9A9996] hover:text-[#F1EFEA] border border-white/10 backdrop-blur-md transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Bottom Title Info */}
          <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
            <div className="space-y-1">
              <span className="text-[10px] font-mono text-[#C5A880] tracking-widest uppercase flex items-center gap-1">
                <MapPin className="w-3 h-3" /> {venue.city}
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl text-[#F1EFEA] font-light">
                {venue.name}
              </h2>
            </div>

            <div className="text-right shrink-0">
              <span className="text-[10px] font-mono text-[#9A9996] block">Kapasite</span>
              <span className="font-serif text-lg text-[#F1EFEA] font-light flex items-center gap-1 justify-end">
                <Users className="w-4 h-4 text-[#C5A880]" />
                {venue.capacity || 'Belirtilmemiş'} Kişi
              </span>
            </div>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 no-scrollbar text-xs">
          {/* Address Bar */}
          {venue.address && (
            <div className="p-3.5 rounded-xl bg-[#1A1A1E] border border-white/[0.06] flex items-center gap-3">
              <KeyRound className="w-4 h-4 text-[#C5A880] shrink-0" />
              <div className="space-y-0.5">
                <span className="text-[10px] font-mono text-[#9A9996] uppercase block">Lokasyon & Giriş</span>
                <span className="text-xs font-sans text-[#F1EFEA]">{venue.address}</span>
              </div>
            </div>
          )}

          {/* Description */}
          <div className="space-y-2">
            <span className="text-[10px] font-mono tracking-widest text-[#9A9996] uppercase block">
              Mekan Hakkında & Mimarisi
            </span>
            <p className="text-sm font-sans text-[#F1EFEA]/90 font-light leading-relaxed whitespace-pre-line">
              {venue.description}
            </p>
          </div>

          {/* Photos Gallery */}
          {venue.photos && venue.photos.length > 0 && (
            <div className="space-y-2">
              <span className="text-[10px] font-mono tracking-widest text-[#9A9996] uppercase block">
                Mekan Görselleri ({venue.photos.length})
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {venue.photos.map((photo, i) => (
                  <img
                    key={i}
                    src={photo}
                    alt={`${venue.name} ${i + 1}`}
                    className="w-full h-28 rounded-xl object-cover border border-white/[0.08] hover:scale-105 transition-transform"
                  />
                ))}
              </div>
            </div>
          )}

          {/* Amenities Grid */}
          {venue.amenities && venue.amenities.length > 0 && (
            <div className="space-y-2">
              <span className="text-[10px] font-mono tracking-widest text-[#9A9996] uppercase block">
                Özel Olanaklar & Donanım
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {venue.amenities.map((item, i) => (
                  <div
                    key={i}
                    className="p-2.5 rounded-lg bg-black/40 border border-white/[0.06] flex items-center gap-2"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-[#C5A880] shrink-0" />
                    <span className="text-xs font-serif text-[#F1EFEA] truncate">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Rules & Protocols */}
          {venue.rules && venue.rules.length > 0 && (
            <div className="space-y-2">
              <span className="text-[10px] font-mono tracking-widest text-[#9A9996] uppercase block">
                Mekan Protokolü & Güvenlik Standartları
              </span>
              <div className="p-4 rounded-xl bg-black/40 border border-white/[0.06] space-y-2">
                {venue.rules.map((rule, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs font-sans text-[#F1EFEA]/80">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>{rule}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Upcoming Events in this Venue */}
          {upcomingEvents.length > 0 && (
            <div className="space-y-3 pt-2">
              <span className="text-[10px] font-mono tracking-widest text-[#C5A880] uppercase block">
                Bu Mekanda Planlanan Salonlar ({upcomingEvents.length})
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {upcomingEvents.map(evt => (
                  <div
                    key={evt.id}
                    onClick={() => {
                      onClose();
                      if (onSelectEvent) onSelectEvent(evt);
                    }}
                    className="p-3 rounded-xl bg-black/40 border border-white/[0.06] hover:border-[#C5A880]/40 transition-colors cursor-pointer flex items-center justify-between"
                  >
                    <div className="space-y-0.5">
                      <p className="font-serif text-xs text-[#F1EFEA] font-light line-clamp-1">{evt.title}</p>
                      <p className="text-[10px] font-mono text-[#9A9996]">
                        {new Date(evt.startsAt).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })} · {evt.price === 0 ? 'Serbest' : `${evt.price} EUR`}
                      </p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-[#C5A880] shrink-0 ml-2" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sticky Action Footer */}
        <div className="p-4 sm:p-5 border-t border-white/[0.08] bg-[#09090B] flex items-center justify-between gap-4">
          <span className="text-[11px] font-mono text-[#9A9996]">
            Major Club Doğrulanmış Mekan Partneri
          </span>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="py-2.5 px-4 rounded-xl text-xs font-serif text-[#9A9996] hover:text-[#F1EFEA] transition-colors cursor-pointer"
            >
              Kapat
            </button>

            {onHostHere && (
              <button
                onClick={() => {
                  onClose();
                  onHostHere(venue);
                }}
                className="py-2.5 px-5 rounded-xl bg-[#C5A880] hover:bg-[#B89B6E] text-[#09090B] font-serif text-xs uppercase tracking-wider font-semibold flex items-center gap-2 transition-all cursor-pointer shadow-lg active:scale-95"
              >
                <Calendar className="w-4 h-4" />
                <span>Bu Mekanda Etkinlik Başlat</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
