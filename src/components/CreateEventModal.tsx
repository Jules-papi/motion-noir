import React, { useState, useRef, useEffect } from 'react';
import {
  Calendar,
  X,
  Upload,
  Image as ImageIcon,
  Clock,
  MapPin,
  ShieldCheck,
  CheckCircle2,
  Lock,
  Sparkles,
  Users,
  Building,
  Crown,
  AlertCircle
} from 'lucide-react';
import { CreateEventPayload, Venue, UserProfile } from '../types';
import { noirApi } from '../services/noirApi';

interface CreateEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateEvent: (newEvent: CreateEventPayload) => void;
  currentUser?: UserProfile;
  initialVenue?: Venue | null;
  onToast?: (msg: { text: string; type: 'success' | 'info' | 'error' }) => void;
}

export const CreateEventModal: React.FC<CreateEventModalProps> = ({
  isOpen,
  onClose,
  onCreateEvent,
  currentUser,
  initialVenue,
  onToast,
}) => {
  const [venues, setVenues] = useState<Venue[]>([]);
  const [selectedVenueId, setSelectedVenueId] = useState<string>(initialVenue?.id || 'custom');

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [city, setCity] = useState(initialVenue?.city || 'Amsterdam');
  const [venue, setVenue] = useState(initialVenue?.name || '');
  const [address, setAddress] = useState(initialVenue?.address || '');
  const [categorySlug, setCategorySlug] = useState('swinger');
  const [startAt, setStartAt] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    d.setHours(21, 0, 0, 0);
    return d.toISOString().slice(0, 16);
  });
  const [endAt, setEndAt] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 8);
    d.setHours(4, 0, 0, 0);
    return d.toISOString().slice(0, 16);
  });
  const [price, setPrice] = useState(250);
  const [currency, setCurrency] = useState('EUR');
  const [capacity, setCapacity] = useState(initialVenue?.capacity || 50);
  const [vipFree, setVipFree] = useState(true);
  const [requiresApproval, setRequiresApproval] = useState(true);
  const [ndaRequired, setNdaRequired] = useState(true);
  const [dressCode, setDressCode] = useState('Lingerie / Silk Robe / Elegant Mask');
  const [participationTarget, setParticipationTarget] = useState<'couples_only' | 'trio_couples' | 'mixed' | 'all'>('couples_only');
  const [orientationNotice, setOrientationNotice] = useState('🔞 21+ Yaş Sınırı. Sadece onaylanmış çiftler kabul edilir. 100% Gizlilik ve karşılıklı rıza esastır.');
  const [coverImageUrl, setCoverImageUrl] = useState(initialVenue?.coverImage || '');
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load verified venues
  useEffect(() => {
    if (!isOpen) return;
    noirApi.getVenues()
      .then(res => setVenues(res))
      .catch(err => console.warn('Could not load venues:', err));
  }, [isOpen]);

  // Sync when initialVenue prop changes
  useEffect(() => {
    if (initialVenue) {
      setSelectedVenueId(initialVenue.id);
      setVenue(initialVenue.name);
      setCity(initialVenue.city);
      setAddress(initialVenue.address || '');
      if (initialVenue.capacity) setCapacity(initialVenue.capacity);
      if (initialVenue.coverImage) setCoverImageUrl(initialVenue.coverImage);
    }
  }, [initialVenue]);

  // Handle venue selection change
  const handleVenueChange = (venueId: string) => {
    setSelectedVenueId(venueId);
    if (venueId === 'custom') {
      return;
    }
    const target = venues.find(v => v.id === venueId);
    if (target) {
      setVenue(target.name);
      setCity(target.city);
      setAddress(target.address || '');
      if (target.capacity) setCapacity(target.capacity);
      if (target.coverImage && !coverImageUrl) setCoverImageUrl(target.coverImage);
    }
  };

  if (!isOpen) return null;

  const isVerifiedHost = currentUser?.isOrganizer || currentUser?.organizerStatus === 'verified' || currentUser?.isAdmin;

  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingImage(true);
    try {
      const url = await noirApi.uploadImage(file, 'events');
      if (url) {
        setCoverImageUrl(url);
        if (onToast) onToast({ text: 'Kapak görseli yüklendi.', type: 'success' });
      } else {
        if (onToast) onToast({ text: 'Görsel yüklenemedi.', type: 'error' });
      }
    } catch (err: any) {
      if (onToast) onToast({ text: err?.message || 'Yükleme hatası.', type: 'error' });
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const payload: CreateEventPayload = {
      title: title.trim(),
      description: description.trim(),
      city,
      venue: venue.trim(),
      address: address.trim(),
      venueId: selectedVenueId !== 'custom' ? selectedVenueId : undefined,
      coverImage: coverImageUrl || undefined,
      startAt: new Date(startAt).toISOString(),
      endAt: endAt ? new Date(endAt).toISOString() : undefined,
      timezone: city === 'İstanbul' ? 'Europe/Istanbul' : 'Europe/Amsterdam',
      price: Number(price) || 0,
      currency,
      capacity: Number(capacity) || 50,
      vipFree,
      requiresApproval,
      ndaRequired,
      dressCode: dressCode.trim() || undefined,
      participationTarget,
      orientationNotice: orientationNotice.trim() || undefined,
      status: isVerifiedHost ? 'published' : 'pending_review',
    };

    onCreateEvent(payload);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-[#111113] border border-white/[0.08] rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-white/[0.08] flex items-center justify-between shrink-0 bg-[#09090B]">
          <div className="flex items-center gap-2.5">
            <span className="w-2 h-2 rounded-full bg-[#C5A880]" />
            <h3 className="font-serif text-lg sm:text-xl text-[#F1EFEA] font-light tracking-wide">
              Yeni Salon Daveti Oluştur (Host Salon)
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-[#9A9996] hover:text-[#F1EFEA] hover:bg-white/[0.06] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Curator Quality Badge Notice */}
        <div className={`px-5 py-3 border-b flex items-center justify-between text-xs ${
          isVerifiedHost
            ? 'bg-emerald-500/[0.05] border-emerald-500/20 text-emerald-300'
            : 'bg-amber-500/[0.05] border-amber-500/20 text-[#C5A880]'
        }`}>
          <div className="flex items-center gap-2">
            {isVerifiedHost ? (
              <Crown className="w-4 h-4 text-[#C5A880] shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-[#C5A880] shrink-0" />
            )}
            <span className="font-serif">
              {isVerifiedHost
                ? 'Doğrulanmış Küratör Statüsü: Etkinliğiniz doğrudan takvimde yayınlanacaktır.'
                : 'Standart Üye Modu: Etkinliğiniz Major Club küratör konseyi onayından sonra takvimde yayına alınacaktır.'}
            </span>
          </div>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5 text-xs no-scrollbar">
          {/* Partner Venue Selector */}
          <div>
            <label className="font-mono text-[10px] text-[#C5A880] uppercase tracking-wider block mb-1.5 flex items-center gap-1.5">
              <Building className="w-3.5 h-3.5" />
              Doğrulanmış Partner Mekan Seçimi
            </label>
            <select
              value={selectedVenueId}
              onChange={e => handleVenueChange(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/[0.08] text-xs text-[#F1EFEA] focus:outline-none focus:border-[#C5A880]/50 font-serif"
            >
              <option value="custom">Özel / Gizli Lokasyon Belirt (Mekan Seçmeden İlerle)</option>
              {venues.map(v => (
                <option key={v.id} value={v.id}>
                  {v.name} ({v.city} · {v.venueType})
                </option>
              ))}
            </select>
          </div>

          {/* Cover Image Upload Area */}
          <div>
            <label className="font-mono text-[10px] text-[#9A9996] uppercase tracking-wider block mb-2">
              Kapak Görseli (16:9 Editorial)
            </label>
            <div
              onClick={() => fileInputRef.current?.click()}
              className="relative h-44 rounded-xl border border-dashed border-white/10 hover:border-[#C5A880]/50 transition-colors bg-[#09090B] flex flex-col items-center justify-center cursor-pointer overflow-hidden group"
            >
              {coverImageUrl ? (
                <>
                  <img src={coverImageUrl} alt="Preview" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-xs text-[#F1EFEA] font-mono">
                    Görseli Değiştir
                  </div>
                </>
              ) : (
                <div className="text-center p-4 space-y-2">
                  <div className="w-10 h-10 rounded-full bg-white/[0.04] border border-white/[0.08] flex items-center justify-center mx-auto text-[#C5A880]">
                    <Upload className="w-4 h-4" />
                  </div>
                  <p className="font-serif text-sm text-[#F1EFEA]">
                    {isUploadingImage ? 'Yükleniyor...' : 'Kapak fotoğrafı seçin veya sürükleyin'}
                  </p>
                  <p className="text-[10px] font-mono text-[#66666A]">
                    JPEG, PNG veya WebP · Max 5MB · Yüksek çözünürlük
                  </p>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={handleImageFileChange}
              />
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="font-mono text-[10px] text-[#9A9996] uppercase tracking-wider block mb-1.5">
              Etkinlik / Salon Başlığı *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Örn: Amsterdam Secret Villa — Eşli Lifestyle & Swinger Party"
              className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/[0.08] text-xs text-[#F1EFEA] placeholder-[#66666A] focus:outline-none focus:border-[#C5A880]/50 font-serif"
            />
          </div>

          {/* Description */}
          <div>
            <label className="font-mono text-[10px] text-[#9A9996] uppercase tracking-wider block mb-1.5">
              Kürasyon & Davet Metni
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Gecenin teması, kuralları, müzik tarzı ve katılımcı beklentileri..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/[0.08] text-xs text-[#F1EFEA] placeholder-[#66666A] focus:outline-none focus:border-[#C5A880]/50 font-sans leading-relaxed"
            />
          </div>

          {/* City & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="font-mono text-[10px] text-[#9A9996] uppercase tracking-wider block mb-1.5">
                Şehir
              </label>
              <select
                value={city}
                onChange={e => setCity(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/[0.08] text-xs text-[#F1EFEA] focus:outline-none focus:border-[#C5A880]/50 font-serif"
              >
                <option value="Amsterdam">Amsterdam (Hollanda)</option>
                <option value="Rotterdam">Rotterdam (Hollanda)</option>
                <option value="Utrecht">Utrecht (Hollanda)</option>
                <option value="İstanbul">İstanbul (Türkiye)</option>
                <option value="Paris">Paris (Fransa)</option>
                <option value="Berlin">Berlin (Almanya)</option>
              </select>
            </div>

            <div>
              <label className="font-mono text-[10px] text-[#9A9996] uppercase tracking-wider block mb-1.5">
                Kategori
              </label>
              <select
                value={categorySlug}
                onChange={e => setCategorySlug(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/[0.08] text-xs text-[#F1EFEA] focus:outline-none focus:border-[#C5A880]/50 font-serif"
              >
                <option value="swinger">Swinger & Eşli Lifestyle</option>
                <option value="trio">Duo & Trio (Throuple)</option>
                <option value="sexparty">Playroom & Chamber Party</option>
                <option value="kink">Kink & Fetish Soirée</option>
                <option value="cocktail">Vernissage & Kokteyl</option>
                <option value="dinner">Özel Retreat & Yemek</option>
                <option value="party">Genel Dans & Gece</option>
              </select>
            </div>
          </div>

          {/* Venue & Address */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="font-mono text-[10px] text-[#9A9996] uppercase tracking-wider block mb-1.5">
                Mekan Adı
              </label>
              <input
                type="text"
                required
                value={venue}
                onChange={e => setVenue(e.target.value)}
                placeholder="Örn: Villa Noorderlicht Privé"
                className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/[0.08] text-xs text-[#F1EFEA] placeholder-[#66666A] focus:outline-none focus:border-[#C5A880]/50 font-sans"
              />
            </div>

            <div>
              <label className="font-mono text-[10px] text-[#9A9996] uppercase tracking-wider block mb-1.5">
                Açık Adres / Konum Detayı
              </label>
              <input
                type="text"
                value={address}
                onChange={e => setAddress(e.target.value)}
                placeholder="Örn: Buiksloterdijk 184, Amsterdam Noord"
                className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/[0.08] text-xs text-[#F1EFEA] placeholder-[#66666A] focus:outline-none focus:border-[#C5A880]/50 font-sans"
              />
            </div>
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="font-mono text-[10px] text-[#9A9996] uppercase tracking-wider block mb-1.5">
                Başlangıç Tarihi & Saati *
              </label>
              <input
                type="datetime-local"
                required
                value={startAt}
                onChange={e => setStartAt(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/[0.08] text-xs text-[#F1EFEA] focus:outline-none focus:border-[#C5A880]/50 font-mono"
              />
            </div>

            <div>
              <label className="font-mono text-[10px] text-[#9A9996] uppercase tracking-wider block mb-1.5">
                Bitiş Tarihi & Saati
              </label>
              <input
                type="datetime-local"
                value={endAt}
                onChange={e => setEndAt(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/[0.08] text-xs text-[#F1EFEA] focus:outline-none focus:border-[#C5A880]/50 font-mono"
              />
            </div>
          </div>

          {/* Price & Capacity */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <div>
              <label className="font-mono text-[10px] text-[#9A9996] uppercase tracking-wider block mb-1.5">
                Katılım Bedeli
              </label>
              <input
                type="number"
                min="0"
                value={price}
                onChange={e => setPrice(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/[0.08] text-xs text-[#F1EFEA] focus:outline-none focus:border-[#C5A880]/50 font-mono"
              />
            </div>

            <div>
              <label className="font-mono text-[10px] text-[#9A9996] uppercase tracking-wider block mb-1.5">
                Para Birimi
              </label>
              <select
                value={currency}
                onChange={e => setCurrency(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/[0.08] text-xs text-[#F1EFEA] focus:outline-none focus:border-[#C5A880]/50 font-mono"
              >
                <option value="EUR">EUR (€)</option>
                <option value="TRY">TRY (₺)</option>
                <option value="USD">USD ($)</option>
              </select>
            </div>

            <div>
              <label className="font-mono text-[10px] text-[#9A9996] uppercase tracking-wider block mb-1.5">
                Maksimum Kontenjan
              </label>
              <input
                type="number"
                min="5"
                max="500"
                value={capacity}
                onChange={e => setCapacity(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/[0.08] text-xs text-[#F1EFEA] focus:outline-none focus:border-[#C5A880]/50 font-mono"
              />
            </div>
          </div>

          {/* Dress Code & Target */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="font-mono text-[10px] text-[#9A9996] uppercase tracking-wider block mb-1.5">
                Kıyafet Kodu (Dress Code)
              </label>
              <input
                type="text"
                value={dressCode}
                onChange={e => setDressCode(e.target.value)}
                placeholder="Örn: Silk Robe & Mask / Black Tie"
                className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/[0.08] text-xs text-[#F1EFEA] placeholder-[#66666A] focus:outline-none focus:border-[#C5A880]/50 font-sans"
              />
            </div>

            <div>
              <label className="font-mono text-[10px] text-[#9A9996] uppercase tracking-wider block mb-1.5">
                Hedef Kitle
              </label>
              <select
                value={participationTarget}
                onChange={e => setParticipationTarget(e.target.value as any)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/[0.08] text-xs text-[#F1EFEA] focus:outline-none focus:border-[#C5A880]/50 font-serif"
              >
                <option value="couples_only">Sadece Onaylı Çiftler</option>
                <option value="trio_couples">Çiftler & Üçlüler</option>
                <option value="mixed">Karma (Çiftler, Kadınlar, Erkekler)</option>
                <option value="all">Tüm Topluluk</option>
              </select>
            </div>
          </div>

          {/* Policy Toggles */}
          <div className="p-4 rounded-xl bg-black/40 border border-white/[0.06] space-y-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={requiresApproval}
                onChange={e => setRequiresApproval(e.target.checked)}
                className="w-4 h-4 rounded accent-[#C5A880]"
              />
              <span className="text-xs text-[#F1EFEA] font-serif">
                Ön Eleme / Küratör Onayı Zorunlu (Başvurular incelenir)
              </span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={ndaRequired}
                onChange={e => setNdaRequired(e.target.checked)}
                className="w-4 h-4 rounded accent-[#C5A880]"
              />
              <span className="text-xs text-[#F1EFEA] font-serif">
                Şifreli Gizlilik Anlaşması (NDA) Zorunlu (Kamera mühürleme kuralı)
              </span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={vipFree}
                onChange={e => setVipFree(e.target.checked)}
                className="w-4 h-4 rounded accent-[#C5A880]"
              />
              <span className="text-xs text-[#F1EFEA] font-serif">
                VIP Üyelere Ücretsiz Katılım Hakkı Tanı
              </span>
            </label>
          </div>

          {/* Sticky Actions */}
          <div className="pt-3 flex items-center justify-end gap-3 border-t border-white/[0.08]">
            <button
              type="button"
              onClick={onClose}
              className="py-2.5 px-4 rounded-xl text-xs font-serif text-[#9A9996] hover:text-[#F1EFEA] transition-colors cursor-pointer"
            >
              Vazgeç
            </button>
            <button
              type="submit"
              className="py-2.5 px-6 rounded-xl bg-[#C5A880] hover:bg-[#B89B6E] text-[#09090B] font-serif text-xs uppercase tracking-wider font-semibold transition-all cursor-pointer shadow-lg active:scale-95"
            >
              {isVerifiedHost ? 'Salonu Yayınla' : 'Onaya Gönder'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
