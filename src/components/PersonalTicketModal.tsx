import React from 'react';
import { 
  QrCode, 
  MapPin, 
  X, 
  Download, 
  ShieldCheck,
  Calendar
} from 'lucide-react';
import { PlatformEvent, UserProfile } from '../types';

interface PersonalTicketModalProps {
  event: PlatformEvent;
  currentUser: UserProfile;
  onClose: () => void;
  onDownloadMock?: () => void;
}

export const PersonalTicketModal: React.FC<PersonalTicketModalProps> = ({
  event,
  currentUser,
  onClose,
  onDownloadMock,
}) => {
  const inviteeNumber = (event.attendeesCount || 28).toString().padStart(3, '0');
  const ticketCode = `MN-${event.id.slice(0, 4).toUpperCase()}-${inviteeNumber}`;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="bg-[#0B0B0D] border border-white/[0.12] rounded-[12px] w-full max-w-sm overflow-hidden shadow-2xl relative text-[#F4F1EC] flex flex-col max-h-[92vh]">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-1.5 rounded-[8px] bg-black/60 text-stone-400 hover:text-white border border-white/10 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Ticket Header & Event Cover */}
        <div className="relative h-28 w-full overflow-hidden shrink-0 bg-[#151518]">
          <img
            src={event.coverImage}
            alt={event.title}
            className="w-full h-full object-cover filter contrast-[1.05] opacity-50"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0B0B0D] via-[#0B0B0D]/50 to-transparent" />
          
          <div className="absolute bottom-3 left-5 right-12">
            <span className="text-[9px] font-mono tracking-[0.25em] text-[#C5A880] uppercase block">
              Major Club Société Privée
            </span>
            <h3 className="font-serif text-base truncate mt-0.5 text-[#F4F1EC] font-medium">
              {event.title}
            </h3>
          </div>
        </div>

        {/* Invitation Body */}
        <div className="p-5 space-y-4 flex-1 overflow-y-auto">
          {/* Official Invitation Label */}
          <div className="text-center pb-1">
            <span className="inline-block text-[10px] font-mono tracking-[0.28em] uppercase text-stone-400 border-b border-white/[0.08] pb-1">
              Your Official Invitation
            </span>
          </div>

          {/* QR Code Container - Refined Dark Luxury Pass */}
          <div className="relative p-5 rounded-[10px] bg-[#151518] border border-white/[0.08] flex flex-col items-center justify-center space-y-3">
            {/* Visual Pass Frame */}
            <div className="w-44 h-44 p-3 bg-[#1C1C21] rounded-[8px] border border-white/[0.08] flex flex-col items-center justify-center relative">
              <QrCode className="w-36 h-36 text-[#F4F1EC]" />
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <span className="w-8 h-8 rounded-[6px] bg-[#0B0B0D] text-[#C5A880] border border-[#C5A880]/30 flex items-center justify-center font-serif text-sm shadow-md">
                  ❦
                </span>
              </div>
            </div>

            <div className="text-center pt-1 space-y-1">
              <div className="font-serif text-sm tracking-wider text-[#F4F1EC] uppercase font-medium">
                {currentUser.name.toUpperCase()} · INVITEE #{inviteeNumber}
              </div>
              <div className="text-[10px] font-mono tracking-widest text-[#C5A880]">
                {ticketCode}
              </div>
              <div className="text-[10px] text-[#9B9894] font-sans font-light">
                Valid for confidential admission to this salon
              </div>
            </div>
          </div>

          {/* Event Metadata Breakdown */}
          <div className="grid grid-cols-2 gap-2 text-xs text-stone-300 font-mono">
            <div className="p-2.5 rounded-[8px] bg-[#151518] border border-white/[0.06]">
              <span className="text-[9px] text-stone-400 uppercase tracking-wider block">Salon Evening</span>
              <span className="text-[11px] text-[#F4F1EC] font-sans font-medium mt-0.5 block truncate">{event.startsAt}</span>
            </div>

            <div className="p-2.5 rounded-[8px] bg-[#151518] border border-white/[0.06]">
              <span className="text-[9px] text-stone-400 uppercase tracking-wider block">Chamber / City</span>
              <span className="text-[11px] text-[#F4F1EC] font-sans font-medium mt-0.5 block truncate">{event.city}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 p-2.5 rounded-[8px] bg-[#151518]/60 border border-white/[0.06] text-[10px] font-mono text-stone-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>Nontransferable digital passport. Signed under Maison NDA protocol.</span>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-white/[0.08] bg-[#0B0B0D] flex items-center gap-2 shrink-0">
          <button
            onClick={() => {
              if (onDownloadMock) onDownloadMock();
              onClose();
            }}
            className="w-full py-2.5 px-4 rounded-[10px] text-xs font-serif uppercase tracking-[0.14em] bg-[#1C1C21] hover:bg-[#25252b] text-[#F4F1EC] border border-white/[0.12] hover:border-[#C5A880]/50 flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-[#C5A880]" />
            <span>Save Invitation Pass</span>
          </button>
        </div>
      </div>
    </div>
  );
};
