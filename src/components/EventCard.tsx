import React from 'react';
import { 
  Calendar, 
  MapPin, 
  Crown, 
  QrCode, 
  Users, 
  ArrowUpRight,
  ShieldCheck,
  CheckCircle2,
  Lock,
  Sparkles
} from 'lucide-react';
import { PlatformEvent, UserProfile } from '../types';
import { SupportedCurrency } from '../types/anlatiTypes';
import { formatCurrency } from '../utils/i18n';

interface EventCardProps {
  event: PlatformEvent;
  currentUser: UserProfile;
  isUserSubscribed: boolean;
  currency?: SupportedCurrency;
  onApplyClick: (event: PlatformEvent) => void;
  onPayTicket: (event: PlatformEvent) => void;
  onOpenQrModal: (event: PlatformEvent) => void;
  onSignNdaClick?: (event: PlatformEvent) => void;
  onOpenOrganizerPanel?: (event: PlatformEvent) => void;
}

export const EventCard: React.FC<EventCardProps> = ({
  event,
  currentUser,
  isUserSubscribed,
  currency = 'EUR',
  onApplyClick,
  onPayTicket,
  onOpenQrModal,
  onSignNdaClick,
}) => {
  const isVipFree = event.vipFree && (isUserSubscribed || currentUser.membershipTier === 'vip');
  const effectivePrice = isVipFree ? 0 : event.price;
  const status = event.applicationStatus || (event.isUserRegistered ? 'paid' : 'none');

  const handlePayOrNda = () => {
    if (!event.isNdaSigned && onSignNdaClick) {
      onSignNdaClick(event);
      return;
    }
    onPayTicket(event);
  };

  return (
    <div className="group relative rounded-[16px] overflow-hidden bg-[#151518] border border-white/[0.08] hover:border-white/20 transition-all duration-500 flex flex-col justify-between shadow-2xl">
      {/* 1. DOMINANT CINEMATIC PHOTOGRAPHY */}
      <div className="relative aspect-[16/10] sm:aspect-[16/9] w-full overflow-hidden bg-[#0B0B0D]">
        <img
          src={event.coverImage}
          alt={event.title}
          className="w-full h-full object-cover filter contrast-[1.05] brightness-90 transition-transform duration-700 ease-out group-hover:scale-105"
        />

        {/* Deep Vignette & Dark Gradients */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#151518] via-[#151518]/40 to-black/40" />

        {/* Top Invitation Header */}
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-[10px] font-mono tracking-widest uppercase text-[#F4F1EC]">
              Private Salon
            </span>
            <span className="text-[10px] font-mono tracking-wider text-[#9B9894] uppercase bg-black/40 backdrop-blur-xs px-2.5 py-1 rounded-full border border-white/5">
              {event.city}
            </span>
          </div>

          <span className="px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-xs font-mono text-[#F4F1EC]">
            {isVipFree ? 'Privé Pass' : formatCurrency(effectivePrice, currency)}
          </span>
        </div>

        {/* Date & Title on Bottom of Photo */}
        <div className="absolute bottom-3 left-4 right-4 text-[#F4F1EC]">
          <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#C5A880] block mb-1">
            {event.startsAt}
          </span>
          <h3 className="font-serif text-xl sm:text-2xl font-normal tracking-tight text-[#F4F1EC] leading-tight line-clamp-1">
            {event.title}
          </h3>
        </div>
      </div>

      {/* 2. INVITATION BODY & PROTOCOL */}
      <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between space-y-5">
        <p className="text-xs sm:text-sm text-[#9B9894] font-sans font-light line-clamp-2 leading-relaxed">
          {event.description}
        </p>

        {/* Vetting & Logistics Specifications */}
        <div className="space-y-2 pt-2 border-t border-white/[0.06] text-xs font-mono">
          <div className="flex items-center justify-between text-[#9B9894]">
            <span className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-stone-400" />
              <span>{event.venue}</span>
            </span>
            <span className="text-stone-500">Sealed Address</span>
          </div>

          <div className="flex items-center justify-between text-[#9B9894]">
            <span className="flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-stone-400" />
              <span>Attendants Capacity</span>
            </span>
            <span className="text-[#F4F1EC]">{event.attendeesCount} / {event.capacity} Patrons</span>
          </div>

          {event.dressCode && (
            <div className="flex items-center justify-between text-[#9B9894]">
              <span>Dress Code</span>
              <span className="text-[#C5A880]">{event.dressCode}</span>
            </div>
          )}
        </div>

        {/* 3. ACTION BAR: EXCLUSIVE INVITATION STATUS */}
        <div className="pt-3 border-t border-white/[0.08]">
          {status === 'paid' ? (
            <button
              onClick={() => onOpenQrModal(event)}
              className="w-full py-2.5 px-4 rounded-[8px] bg-[#151a16] hover:bg-[#1c241e] text-emerald-300 border border-emerald-600/40 text-xs font-serif uppercase tracking-[0.14em] flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg"
            >
              <QrCode className="w-4 h-4 text-emerald-400" />
              <span>Your Invitation Pass (QR)</span>
            </button>
          ) : status === 'approved' ? (
            <button
              onClick={handlePayOrNda}
              className="w-full py-2.5 px-4 rounded-[8px] bg-[#F4F1EC] hover:bg-white text-[#0B0B0D] font-medium text-xs font-serif uppercase tracking-[0.14em] flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg"
            >
              <span>{event.isNdaSigned ? 'Claim Invitation Ticket' : 'Sign Non-Disclosure & Claim'}</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          ) : status === 'pending' ? (
            <div className="w-full py-2.5 px-4 rounded-[8px] bg-[#1C1C21] text-[#9B9894] border border-white/10 text-xs font-mono uppercase tracking-wider text-center">
              Chamber Review In Progress
            </div>
          ) : (
            <button
              onClick={() => onApplyClick(event)}
              className="w-full py-2.5 px-4 rounded-[8px] bg-[#F4F1EC] hover:bg-white text-[#0B0B0D] font-medium text-xs font-serif uppercase tracking-[0.14em] flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg"
            >
              <span>Request To Join</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
