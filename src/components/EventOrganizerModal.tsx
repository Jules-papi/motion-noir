import React, { useState, useEffect } from 'react';
import {
  Users,
  CheckCircle2,
  XCircle,
  QrCode,
  X,
  Search,
  ShieldCheck,
  Clock,
  Check,
  Filter,
  Ticket
} from 'lucide-react';
import { PlatformEvent, EventAttendee } from '../types';
import { noirApi } from '../services/noirApi';

interface EventOrganizerModalProps {
  event: PlatformEvent;
  onClose: () => void;
  onToast?: (msg: { text: string; type: 'success' | 'info' | 'error' }) => void;
  onApproveApplicationForEvent?: (eventId: string, applicantName: string) => void;
}

export const EventOrganizerModal: React.FC<EventOrganizerModalProps> = ({
  event,
  onClose,
  onToast,
  onApproveApplicationForEvent,
}) => {
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'approved' | 'checked_in'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [ticketSearchInput, setTicketSearchInput] = useState('');
  const [attendees, setAttendees] = useState<EventAttendee[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load real DB attendees
  const fetchAttendees = async () => {
    setIsLoading(true);
    try {
      const data = await noirApi.getEventAttendees(event.id);
      setAttendees(data);
    } catch (err) {
      console.warn('Could not load attendees:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendees();
  }, [event.id]);

  const handleApprove = async (attendeeId: string) => {
    const target = attendees.find(a => a.id === attendeeId);
    try {
      const ok = await noirApi.approveRegistration(attendeeId);
      if (ok) {
        setAttendees(prev => prev.map(a => a.id === attendeeId ? {
          ...a,
          status: 'approved',
        } : a));
        if (target && onApproveApplicationForEvent) {
          onApproveApplicationForEvent(event.id, target.userName);
        }
        if (onToast) onToast({ text: `${target?.userName || 'Üye'} başvurusu onaylandı.`, type: 'success' });
      }
    } catch {
      if (onToast) onToast({ text: 'Onaylama işlemi başarısız.', type: 'error' });
    }
  };

  const handleReject = async (attendeeId: string) => {
    try {
      const ok = await noirApi.rejectRegistration(attendeeId);
      if (ok) {
        setAttendees(prev => prev.map(a => a.id === attendeeId ? {
          ...a,
          status: 'rejected',
        } : a));
        if (onToast) onToast({ text: 'Başvuru reddedildi.', type: 'info' });
      }
    } catch {
      if (onToast) onToast({ text: 'Red işlemi başarısız.', type: 'error' });
    }
  };

  const handleCheckIn = async (attendeeId: string) => {
    try {
      const ok = await noirApi.checkInAttendee(attendeeId);
      if (ok) {
        setAttendees(prev => prev.map(a => a.id === attendeeId ? {
          ...a,
          isCheckedIn: true,
          checkedInAt: new Date().toISOString(),
        } : a));
        if (onToast) onToast({ text: 'Kapı girişi doğrulandı ve kaydedildi.', type: 'success' });
      }
    } catch {
      if (onToast) onToast({ text: 'Giriş teyidi başarısız.', type: 'error' });
    }
  };

  const handleManualTicketCheckIn = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = ticketSearchInput.trim().toUpperCase();
    if (!code) return;

    const matched = attendees.find(a => a.ticketCode?.toUpperCase() === code);
    if (!matched) {
      if (onToast) onToast({ text: 'Bu bilet koduyla eşleşen davetli bulunamadı.', type: 'error' });
      return;
    }

    if (matched.isCheckedIn) {
      if (onToast) onToast({ text: `${matched.userName} zaten giriş yapmış!`, type: 'info' });
      return;
    }

    await handleCheckIn(matched.id);
    setTicketSearchInput('');
  };

  const filteredAttendees = attendees.filter(app => {
    let matchesStatus = true;
    if (filterStatus === 'pending') matchesStatus = app.status === 'pending';
    else if (filterStatus === 'approved') matchesStatus = app.status === 'approved' && !app.isCheckedIn;
    else if (filterStatus === 'checked_in') matchesStatus = app.isCheckedIn;

    const query = searchQuery.toLowerCase().trim();
    const matchesSearch = !query ||
      app.userName.toLowerCase().includes(query) ||
      app.userUsername.toLowerCase().includes(query) ||
      (app.ticketCode && app.ticketCode.toLowerCase().includes(query)) ||
      (app.note && app.note.toLowerCase().includes(query));

    return matchesStatus && matchesSearch;
  });

  const pendingCount = attendees.filter(a => a.status === 'pending').length;
  const approvedCount = attendees.filter(a => a.status === 'approved').length;
  const checkedInCount = attendees.filter(a => a.isCheckedIn).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-4xl rounded-2xl bg-[#111113] border border-white/[0.08] shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-white/[0.08] flex items-center justify-between bg-[#09090B] shrink-0">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#C5A880]" />
              <span className="text-[10px] font-mono tracking-widest text-[#C5A880] uppercase">
                Concierge & Kapı Yönetimi
              </span>
            </div>
            <h3 className="font-serif text-lg sm:text-xl text-[#F1EFEA] font-light">
              {event.title}
            </h3>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full text-[#9A9996] hover:text-[#F1EFEA] hover:bg-white/[0.06] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Quick Stats & Ticket Code Lookup Bar */}
        <div className="p-4 sm:p-5 border-b border-white/[0.06] bg-[#1A1A1E] flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
          {/* Quick Metrics */}
          <div className="flex items-center gap-3 text-xs font-mono">
            <div className="px-3 py-1.5 rounded-lg bg-black/40 border border-white/[0.06]">
              <span className="text-[#9A9996] block text-[9px]">BEKLEYEN</span>
              <strong className="text-[#C5A880] text-sm">{pendingCount}</strong>
            </div>
            <div className="px-3 py-1.5 rounded-lg bg-black/40 border border-white/[0.06]">
              <span className="text-[#9A9996] block text-[9px]">ONAYLI</span>
              <strong className="text-emerald-400 text-sm">{approvedCount}</strong>
            </div>
            <div className="px-3 py-1.5 rounded-lg bg-black/40 border border-white/[0.06]">
              <span className="text-[#9A9996] block text-[9px]">GİRİŞ YAPAN</span>
              <strong className="text-[#F1EFEA] text-sm">{checkedInCount}</strong>
            </div>
          </div>

          {/* Ticket Code Check-In Fast Input */}
          <form onSubmit={handleManualTicketCheckIn} className="flex items-center gap-2">
            <input
              type="text"
              value={ticketSearchInput}
              onChange={e => setTicketSearchInput(e.target.value)}
              placeholder="Bilet Kodu (Örn: VIP-AMS-1234)"
              className="px-3 py-2 rounded-xl bg-black/40 border border-white/[0.08] text-xs font-mono text-[#F1EFEA] placeholder-[#66666A] focus:outline-none focus:border-[#C5A880]/50 uppercase"
            />
            <button
              type="submit"
              className="py-2 px-3.5 rounded-xl bg-[#C5A880] text-[#09090B] font-mono text-xs font-medium hover:bg-[#B89B6E] transition-colors cursor-pointer shrink-0"
            >
              Kapı Doğrula
            </button>
          </form>
        </div>

        {/* Filter Pills & Search */}
        <div className="p-4 border-b border-white/[0.06] flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-serif tracking-wider uppercase transition-all cursor-pointer ${
                filterStatus === 'all'
                  ? 'bg-[#1A1A1E] text-[#C5A880] border border-[#C5A880]/30 shadow-sm'
                  : 'text-[#9A9996] hover:text-[#F1EFEA]'
              }`}
            >
              Tümü ({attendees.length})
            </button>
            <button
              onClick={() => setFilterStatus('pending')}
              className={`px-3 py-1.5 rounded-lg text-xs font-serif tracking-wider uppercase transition-all cursor-pointer ${
                filterStatus === 'pending'
                  ? 'bg-[#1A1A1E] text-[#C5A880] border border-[#C5A880]/30 shadow-sm'
                  : 'text-[#9A9996] hover:text-[#F1EFEA]'
              }`}
            >
              Bekleyen ({pendingCount})
            </button>
            <button
              onClick={() => setFilterStatus('approved')}
              className={`px-3 py-1.5 rounded-lg text-xs font-serif tracking-wider uppercase transition-all cursor-pointer ${
                filterStatus === 'approved'
                  ? 'bg-[#1A1A1E] text-[#C5A880] border border-[#C5A880]/30 shadow-sm'
                  : 'text-[#9A9996] hover:text-[#F1EFEA]'
              }`}
            >
              Onaylananlar ({approvedCount})
            </button>
            <button
              onClick={() => setFilterStatus('checked_in')}
              className={`px-3 py-1.5 rounded-lg text-xs font-serif tracking-wider uppercase transition-all cursor-pointer ${
                filterStatus === 'checked_in'
                  ? 'bg-[#1A1A1E] text-[#C5A880] border border-[#C5A880]/30 shadow-sm'
                  : 'text-[#9A9996] hover:text-[#F1EFEA]'
              }`}
            >
              Giriş Yapanlar ({checkedInCount})
            </button>
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 text-[#9A9996] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Davetli ara..."
              className="pl-8 pr-3 py-1.5 rounded-lg bg-black/40 border border-white/[0.08] text-xs text-[#F1EFEA] placeholder-[#66666A] focus:outline-none focus:border-[#C5A880]/50"
            />
          </div>
        </div>

        {/* Attendees List */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-3 flex-1 no-scrollbar">
          {isLoading ? (
            <p className="text-center py-12 text-xs font-mono text-[#9A9996]">Davetli listesi yükleniyor...</p>
          ) : filteredAttendees.length === 0 ? (
            <div className="text-center py-12 text-[#9A9996]">
              <Users className="w-8 h-8 text-[#C5A880] mx-auto mb-2 opacity-50" />
              <p className="font-serif text-sm text-[#F1EFEA]">Filtreye uygun davetli bulunamadı.</p>
            </div>
          ) : (
            filteredAttendees.map(att => (
              <div
                key={att.id}
                className="p-3.5 sm:p-4 rounded-xl bg-black/40 border border-white/[0.06] hover:border-white/10 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="flex items-start gap-3">
                  <img
                    src={att.userAvatar}
                    alt={att.userName}
                    className="w-10 h-10 rounded-full object-cover border border-white/10 shrink-0"
                  />
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-serif text-sm text-[#F1EFEA] font-light">{att.userName}</span>
                      <span className="text-[10px] font-mono text-[#9A9996]">@{att.userUsername}</span>
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-mono bg-white/[0.04] text-[#C5A880] border border-white/[0.06] capitalize">
                        {att.participationType || 'all'}
                      </span>
                    </div>

                    {att.note && (
                      <p className="text-xs text-[#9A9996] font-sans italic line-clamp-2">
                        "{att.note}"
                      </p>
                    )}

                    <div className="flex items-center gap-3 text-[10px] font-mono text-[#66666A]">
                      {att.ticketCode && (
                        <span className="text-[#C5A880] flex items-center gap-1">
                          <Ticket className="w-3 h-3" /> {att.ticketCode}
                        </span>
                      )}
                      {att.ndaSigned && (
                        <span className="text-emerald-400 flex items-center gap-1">
                          <ShieldCheck className="w-3 h-3" /> NDA Onaylı
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                  {att.status === 'pending' && (
                    <>
                      <button
                        onClick={() => handleReject(att.id)}
                        className="p-2 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/20 transition-colors cursor-pointer"
                        title="Reddet"
                      >
                        <XCircle className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleApprove(att.id)}
                        className="py-1.5 px-3.5 rounded-lg bg-[#C5A880] hover:bg-[#B89B6E] text-[#09090B] font-mono text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-md"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Onayla</span>
                      </button>
                    </>
                  )}

                  {att.status === 'approved' && !att.isCheckedIn && (
                    <button
                      onClick={() => handleCheckIn(att.id)}
                      className="py-1.5 px-3.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-black font-mono text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-md"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Kapıda Giriş Ver</span>
                    </button>
                  )}

                  {att.isCheckedIn && (
                    <span className="px-3 py-1 rounded-full text-xs font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> İçeride
                    </span>
                  )}

                  {att.status === 'rejected' && (
                    <span className="px-3 py-1 rounded-full text-xs font-mono text-rose-400 bg-rose-500/10 border border-rose-500/20">
                      Reddedildi
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
