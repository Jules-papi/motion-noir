import React, { useState, useEffect } from 'react';
import {
  X,
  Calendar,
  Clock,
  MapPin,
  Users,
  ShieldCheck,
  CheckCircle2,
  Lock,
  KeyRound,
  Bookmark,
  Share2,
  QrCode,
  AlertTriangle,
  Send,
  Sparkles,
  Crown
} from 'lucide-react';
import { PlatformEvent, UserProfile, EventComment } from '../types';
import { noirApi } from '../services/noirApi';

interface EventDetailModalProps {
  event: PlatformEvent;
  currentUser: UserProfile;
  isOpen: boolean;
  onClose: () => void;
  onApplyClick: (event: PlatformEvent) => void;
  onOpenQrModal: (event: PlatformEvent) => void;
  onSignNdaClick?: (event: PlatformEvent) => void;
  onOpenOrganizerPanel?: (event: PlatformEvent) => void;
  onToggleSave?: (eventId: string) => void;
  onToast?: (msg: { text: string; type: 'success' | 'info' | 'error' }) => void;
}

export const EventDetailModal: React.FC<EventDetailModalProps> = ({
  event,
  currentUser,
  isOpen,
  onClose,
  onApplyClick,
  onOpenQrModal,
  onSignNdaClick,
  onOpenOrganizerPanel,
  onToggleSave,
  onToast,
}) => {
  const [comments, setComments] = useState<EventComment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [activeTab, setActiveTab] = useState<'details' | 'discussion'>('details');

  // Load live comments
  useEffect(() => {
    if (!isOpen) return;
    let isMounted = true;
    setIsLoadingComments(true);

    noirApi.getEventComments(event.id)
      .then(res => {
        if (isMounted) setComments(res);
      })
      .catch(err => console.warn('Could not load event comments:', err))
      .finally(() => {
        if (isMounted) setIsLoadingComments(false);
      });

    // Track event view in background
    noirApi.trackEventView(event.id);

    return () => {
      isMounted = false;
    };
  }, [event.id, isOpen]);

  if (!isOpen) return null;

  const handleSendComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || isSubmittingComment) return;

    if (currentUser.isGuest) {
      if (onToast) onToast({ text: 'Yorum yapmak için lütfen giriş yapın.', type: 'info' });
      return;
    }

    setIsSubmittingComment(true);
    try {
      const added = await noirApi.addEventComment(event.id, newComment.trim());
      if (added) {
        setComments(prev => [...prev, added]);
        setNewComment('');
        if (onToast) onToast({ text: 'Yorumunuz paylaşıldı.', type: 'success' });
      }
    } catch {
      if (onToast) onToast({ text: 'Yorum eklenirken hata oluştu.', type: 'error' });
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const isOrganizer = currentUser.id === event.organizerId || currentUser.id === event.organizer?.id;
  const isApproved = event.applicationStatus === 'approved' || event.applicationStatus === 'paid';
  const isPending = event.applicationStatus === 'pending';

  const formattedDate = new Date(event.startsAt).toLocaleDateString('tr-TR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const formattedStartTime = new Date(event.startsAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const formattedEndTime = new Date(event.endsAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const capacityRatio = event.capacity ? Math.min(100, Math.round((event.attendeesCount / event.capacity) * 100)) : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-3xl rounded-2xl bg-[#111113] border border-white/[0.08] shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Cover Hero & Header Buttons */}
        <div className="relative h-56 sm:h-72 w-full shrink-0 overflow-hidden bg-[#09090B]">
          <img
            src={event.coverImage}
            alt={event.title}
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#111113] via-[#111113]/40 to-transparent" />

          {/* Top Floating Controls */}
          <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-[10px] font-mono tracking-widest text-[#C5A880] uppercase bg-black/60 backdrop-blur-md border border-[#C5A880]/30 shadow-md">
                {event.category}
              </span>
              <span className="px-3 py-1 rounded-full text-[10px] font-mono tracking-widest text-[#F1EFEA] uppercase bg-black/60 backdrop-blur-md border border-white/10 shadow-md">
                {event.city}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {onToggleSave && (
                <button
                  onClick={() => onToggleSave(event.id)}
                  className={`p-2.5 rounded-full backdrop-blur-md border transition-colors cursor-pointer ${
                    event.isSaved
                      ? 'bg-[#C5A880] text-[#09090B] border-[#C5A880]'
                      : 'bg-black/60 text-[#F1EFEA] border-white/10 hover:text-[#C5A880]'
                  }`}
                  title={event.isSaved ? 'Ajandadan Çıkar' : 'Ajandaya Kaydet'}
                >
                  <Bookmark className="w-4 h-4 fill-current" />
                </button>
              )}

              <button
                onClick={onClose}
                className="p-2.5 rounded-full bg-black/60 hover:bg-black/90 text-[#9A9996] hover:text-[#F1EFEA] border border-white/10 backdrop-blur-md transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Hero Bottom Metadata */}
          <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
            <div className="space-y-1 max-w-xl">
              <span className="text-[10px] font-mono text-[#C5A880] tracking-widest uppercase block">
                {event.venue}
              </span>
              <h2 className="font-serif text-xl sm:text-3xl text-[#F1EFEA] font-light leading-tight">
                {event.title}
              </h2>
            </div>

            <div className="text-right shrink-0">
              <span className="text-xs font-mono text-[#9A9996] block">Katılım Bedeli</span>
              <span className="font-serif text-xl text-[#C5A880] font-light">
                {event.price === 0 ? 'Serbest Davet' : `${event.price} ${event.currency || 'EUR'}`}
              </span>
            </div>
          </div>
        </div>

        {/* Tab Switcher (Details vs Discussion) */}
        <div className="flex items-center gap-4 px-6 border-b border-white/[0.08] bg-[#09090B]">
          <button
            onClick={() => setActiveTab('details')}
            className={`py-3 text-xs font-serif tracking-wider uppercase border-b-2 transition-all cursor-pointer ${
              activeTab === 'details'
                ? 'border-[#C5A880] text-[#C5A880] font-medium'
                : 'border-transparent text-[#9A9996] hover:text-[#F1EFEA]'
            }`}
          >
            Salon Detayları
          </button>
          <button
            onClick={() => setActiveTab('discussion')}
            className={`py-3 text-xs font-serif tracking-wider uppercase border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'discussion'
                ? 'border-[#C5A880] text-[#C5A880] font-medium'
                : 'border-transparent text-[#9A9996] hover:text-[#F1EFEA]'
            }`}
          >
            <span>Topluluk Sohbeti</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-white/[0.06] text-[#9A9996]">
              {comments.length}
            </span>
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 no-scrollbar">
          {activeTab === 'details' ? (
            <>
              {/* Date, Time & Location Strip */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-xl bg-[#1A1A1E] border border-white/[0.06]">
                <div className="flex items-start gap-3">
                  <Calendar className="w-4 h-4 text-[#C5A880] mt-0.5 shrink-0" />
                  <div className="space-y-0.5">
                    <span className="text-xs font-serif text-[#F1EFEA] block">{formattedDate}</span>
                    <span className="text-[11px] font-mono text-[#9A9996] flex items-center gap-1">
                      <Clock className="w-3 h-3 text-[#C5A880]" />
                      {formattedStartTime} - {formattedEndTime} ({event.timezone || 'Amsterdam'})
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-[#C5A880] mt-0.5 shrink-0" />
                  <div className="space-y-0.5">
                    <span className="text-xs font-serif text-[#F1EFEA] block">{event.venue}</span>
                    <span className="text-[11px] font-sans text-[#9A9996] block line-clamp-1">
                      {event.address}
                    </span>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <span className="text-[10px] font-mono tracking-widest text-[#9A9996] uppercase block">
                  Davet Notu & Kürasyon
                </span>
                <p className="text-sm font-sans text-[#F1EFEA]/90 font-light leading-relaxed whitespace-pre-line">
                  {event.description}
                </p>
              </div>

              {/* Protocol & Etiquette Rules */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3 rounded-lg bg-black/40 border border-white/[0.06] space-y-1">
                  <span className="text-[10px] font-mono text-[#9A9996] uppercase block">Kıyafet Kuralı</span>
                  <span className="text-xs font-serif text-[#F1EFEA] block">
                    {event.dressCode || 'Elegance & Chic'}
                  </span>
                </div>

                <div className="p-3 rounded-lg bg-black/40 border border-white/[0.06] space-y-1">
                  <span className="text-[10px] font-mono text-[#9A9996] uppercase block">Katılım Profili</span>
                  <span className="text-xs font-serif text-[#F1EFEA] block capitalize">
                    {event.participationTarget === 'couples_only'
                      ? 'Sadece Onaylı Çiftler'
                      : event.participationTarget === 'trio_couples'
                      ? 'Çiftler & Üçlüler'
                      : 'Karma & Açık Profil'}
                  </span>
                </div>

                <div className="p-3 rounded-lg bg-black/40 border border-white/[0.06] space-y-1">
                  <span className="text-[10px] font-mono text-[#9A9996] uppercase block">Gizlilik / NDA</span>
                  <span className="text-xs font-serif text-[#C5A880] block flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    {event.ndaRequired ? 'Şifreli NDA Zorunlu' : 'Standart Rıza'}
                  </span>
                </div>
              </div>

              {event.orientationNotice && (
                <div className="p-3.5 rounded-xl bg-amber-500/[0.04] border border-amber-500/20 flex items-start gap-3">
                  <AlertTriangle className="w-4 h-4 text-[#C5A880] shrink-0 mt-0.5" />
                  <p className="text-xs text-[#F1EFEA]/80 font-sans leading-relaxed">
                    {event.orientationNotice}
                  </p>
                </div>
              )}

              {/* Capacity Progress & Guest Ratio */}
              <div className="p-4 rounded-xl bg-[#1A1A1E] border border-white/[0.06] space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-serif text-[#F1EFEA]">Kontenjan Durumu</span>
                  <span className="font-mono text-[#C5A880]">
                    {event.attendeesCount} / {event.capacity || 50} Davetli (%{capacityRatio})
                  </span>
                </div>

                {/* Progress bar */}
                <div className="w-full h-1.5 rounded-full bg-white/[0.08] overflow-hidden">
                  <div
                    className="h-full bg-[#C5A880] rounded-full transition-all duration-500"
                    style={{ width: `${capacityRatio}%` }}
                  />
                </div>

                {/* Ratio pills */}
                {event.attendeeRatio && (
                  <div className="flex items-center gap-3 pt-2 text-[11px] font-mono text-[#9A9996] flex-wrap">
                    <span>Çiftler: <strong className="text-[#F1EFEA]">{event.attendeeRatio.couples}</strong></span>
                    <span>·</span>
                    <span>Tekil Kadın: <strong className="text-[#F1EFEA]">{event.attendeeRatio.singleWomen}</strong></span>
                    <span>·</span>
                    <span>Tekil Erkek: <strong className="text-[#F1EFEA]">{event.attendeeRatio.singleMen}</strong></span>
                    <span>·</span>
                    <span>Trio: <strong className="text-[#F1EFEA]">{event.attendeeRatio.trios}</strong></span>
                  </div>
                )}
              </div>

              {/* Organizer Dossier */}
              <div className="p-4 rounded-xl bg-black/40 border border-white/[0.06] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={event.organizer.avatar}
                    alt={event.organizer.name}
                    className="w-11 h-11 rounded-full object-cover border border-[#C5A880]/40"
                  />
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-serif text-sm text-[#F1EFEA] font-light">{event.organizer.name}</span>
                      {event.organizer.isVerified && (
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#C5A880]" />
                      )}
                    </div>
                    <span className="text-[11px] font-mono text-[#9A9996]">@{event.organizer.username} · Salon Küratörü</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-mono text-[#C5A880] border border-[#C5A880]/30 bg-[#C5A880]/5">
                    Doğrulanmış Ev Sahibi
                  </span>
                </div>
              </div>
            </>
          ) : (
            /* Discussion Tab */
            <div className="space-y-4">
              <div className="space-y-3">
                {isLoadingComments ? (
                  <p className="text-center py-8 text-xs text-[#9A9996] font-mono">Yorumlar yükleniyor...</p>
                ) : comments.length === 0 ? (
                  <div className="text-center py-8 text-[#9A9996] space-y-1">
                    <p className="font-serif text-sm text-[#F1EFEA]">Henüz yorum yapılmamış.</p>
                    <p className="text-xs text-[#66666A]">Salon hakkında soru sormak veya düşüncelerinizi paylaşmak için ilk yorumu bırakın.</p>
                  </div>
                ) : (
                  comments.map(c => (
                    <div key={c.id} className="p-3 rounded-lg bg-[#1A1A1E] border border-white/[0.06] flex items-start gap-3">
                      <img
                        src={c.user.avatar}
                        alt={c.user.name}
                        className="w-8 h-8 rounded-full object-cover border border-white/10 shrink-0"
                      />
                      <div className="space-y-0.5 flex-1">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-serif text-[#F1EFEA] font-medium">{c.user.name}</span>
                          <span className="font-mono text-[#9A9996] text-[10px]">{c.createdAt}</span>
                        </div>
                        <p className="text-xs text-[#F1EFEA]/80 font-sans leading-relaxed">{c.content}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Comment Input */}
              <form onSubmit={handleSendComment} className="flex items-center gap-2 pt-2 border-t border-white/[0.06]">
                <input
                  type="text"
                  value={newComment}
                  onChange={e => setNewComment(e.target.value)}
                  placeholder="Salon hakkında bir soru veya not bırakın..."
                  className="flex-1 px-4 py-2.5 rounded-xl bg-black/40 border border-white/[0.08] text-xs text-[#F1EFEA] placeholder-[#66666A] focus:outline-none focus:border-[#C5A880]/50 font-sans"
                />
                <button
                  type="submit"
                  disabled={!newComment.trim() || isSubmittingComment}
                  className="p-2.5 rounded-xl bg-[#C5A880] text-[#09090B] hover:bg-[#B89B6E] disabled:opacity-40 transition-colors cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Modal Sticky Bottom Action Footer */}
        <div className="p-4 sm:p-5 border-t border-white/[0.08] bg-[#09090B] flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs font-mono text-[#9A9996]">
            {isApproved && (
              <span className="text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" /> Davetiyeniz Onaylandı
              </span>
            )}
            {isPending && (
              <span className="text-[#C5A880] flex items-center gap-1.5">
                <Clock className="w-4 h-4" /> Küratör Değerlendirmesi Sürüyor
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            {isOrganizer && onOpenOrganizerPanel && (
              <button
                onClick={() => {
                  onClose();
                  onOpenOrganizerPanel(event);
                }}
                className="py-2.5 px-4 rounded-xl bg-[#1A1A1E] text-[#C5A880] border border-[#C5A880]/40 text-xs font-serif uppercase tracking-wider hover:bg-[#222228] transition-all cursor-pointer"
              >
                Küratör Paneli
              </button>
            )}

            {isApproved ? (
              <button
                onClick={() => {
                  onClose();
                  onOpenQrModal(event);
                }}
                className="py-2.5 px-5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-black font-serif text-xs uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer font-medium shadow-lg"
              >
                <QrCode className="w-4 h-4" />
                <span>Giriş Kartı (QR)</span>
              </button>
            ) : isPending ? (
              <button
                disabled
                className="py-2.5 px-5 rounded-xl bg-white/[0.06] text-[#9A9996] border border-white/[0.08] font-serif text-xs uppercase tracking-wider cursor-not-allowed"
              >
                İnceleniyor
              </button>
            ) : (
              <button
                onClick={() => {
                  onClose();
                  onApplyClick(event);
                }}
                className="py-2.5 px-6 rounded-xl bg-[#C5A880] hover:bg-[#B89B6E] text-[#09090B] font-serif text-xs uppercase tracking-wider font-semibold transition-all cursor-pointer shadow-lg active:scale-95"
              >
                Katılım Başvurusu Yap
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
