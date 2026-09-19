import React, { useState } from 'react';
import { 
  X, 
  Send, 
  ShieldCheck, 
  Users, 
  Sparkles, 
  AlertTriangle, 
  Info,
  Calendar,
  MapPin,
  CheckCircle2
} from 'lucide-react';
import { PlatformEvent, UserProfile } from '../types';

interface EventApplicationModalProps {
  isOpen: boolean;
  event: PlatformEvent | null;
  currentUser: UserProfile;
  onClose: () => void;
  onSubmitApplication: (applicationData: {
    eventId: string;
    participationType: string;
    note: string;
  }) => void;
}

export const EventApplicationModal: React.FC<EventApplicationModalProps> = ({
  isOpen,
  event,
  currentUser,
  onClose,
  onSubmitApplication,
}) => {
  const [participationType, setParticipationType] = useState<string>('couple_mf');
  const [note, setNote] = useState('');
  const [hasAcceptedGuidelines, setHasAcceptedGuidelines] = useState(true);

  if (!isOpen || !event) return null;

  const participationOptions = [
    { id: 'couple_mf', label: 'Çift (Kadın & Erkek)', icon: '👫', desc: 'Eşli / Hetero veya Biseksüel Çift' },
    { id: 'couple_ff', label: 'Çift (Kadın & Kadın)', icon: '👭', desc: 'Lezbiyen / Biseksüel Çift' },
    { id: 'couple_mm', label: 'Çift (Erkek & Erkek)', icon: '👬', desc: 'Gey / Biseksüel Çift' },
    { id: 'single_female', label: 'Tekil Kadın', icon: '💃', desc: 'Bireysel Kadın Katılımı' },
    { id: 'single_male', label: 'Tekil Erkek', icon: '🕺', desc: 'Bireysel Erkek Katılımı' },
    { id: 'trio_throuple', label: 'Üçlü (Trio / Throuple)', icon: '👥', desc: 'MFF / MMF / Çoklu Birliktelik' },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasAcceptedGuidelines) return;

    onSubmitApplication({
      eventId: event.id,
      participationType,
      note,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header with Event Snippet */}
        <div className="relative p-6 bg-gradient-to-r from-zinc-900 via-purple-950 to-rose-950 text-white">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-300 text-[11px] font-bold mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Ön Başvuru & Katılım Talebi</span>
          </div>

          <h3 className="text-xl font-black text-white leading-tight">
            {event.title}
          </h3>

          <div className="flex items-center gap-3 text-xs text-zinc-300 mt-2">
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-rose-400" />
              {event.city} • {event.venue}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-purple-400" />
              {event.startsAt}
            </span>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Workflow Explainer Banner */}
          <div className="bg-purple-50 dark:bg-purple-950/30 border border-purple-200/80 dark:border-purple-800/60 rounded-2xl p-3.5 text-xs text-purple-900 dark:text-purple-200 space-y-1.5">
            <div className="flex items-center gap-1.5 font-bold text-purple-700 dark:text-purple-300">
              <Info className="w-4 h-4 shrink-0" />
              <span>Başvuru & Bilet Alma Süreci</span>
            </div>
            <p className="text-[11px] leading-relaxed text-zinc-600 dark:text-zinc-300">
              1. Başvurunuz organizatör ekibi tarafından gizlilik ve kontenjan dengesi gözetilerek incelenir.<br />
              2. Onaylandığında bildirim alırsınız.<br />
              3. <strong>{event.price > 0 ? `Bilet ücretlidir (${event.price} ₺). Onaylandıktan sonra ödemenizi yapıp QR biletinizi alabilirsiniz.` : 'Bilet ücretsizdir. Onaylandığı an QR biletiniz anında aktif olur.'}</strong>
            </p>
          </div>

          {/* Orientation & Legal Note */}
          {event.orientationNotice && (
            <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-700 dark:text-amber-300 text-xs flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-500" />
              <span>{event.orientationNotice}</span>
            </div>
          )}

          {/* Participation Type Selection */}
          <div>
            <label className="block text-xs font-bold text-zinc-800 dark:text-zinc-200 mb-2">
              Katılım Türünüzü Seçin:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {participationOptions.map(opt => (
                <button
                  type="button"
                  key={opt.id}
                  onClick={() => setParticipationType(opt.id)}
                  className={`p-3 rounded-2xl border text-left flex items-start gap-2.5 transition-all ${
                    participationType === opt.id
                      ? 'border-rose-500 bg-rose-50/50 dark:bg-rose-950/30 text-zinc-900 dark:text-white shadow-xs'
                      : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 text-zinc-600 dark:text-zinc-400'
                  }`}
                >
                  <span className="text-xl shrink-0">{opt.icon}</span>
                  <div className="min-w-0">
                    <span className="text-xs font-bold block truncate">{opt.label}</span>
                    <span className="text-[10px] text-zinc-500 block truncate">{opt.desc}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Notes / Message to Organizer */}
          <div>
            <label className="block text-xs font-bold text-zinc-800 dark:text-zinc-200 mb-1.5">
              Organizatöre Not / Tanıtımınız (İsteğe Bağlı):
            </label>
            <textarea
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder="Örn: Yaşlarımız 29 & 32, Amsterdam'da yaşıyoruz. Lifestyle ve kokteyl etkinliklerine daha önce katıldık..."
              rows={3}
              className="w-full p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 text-xs text-zinc-900 dark:text-white placeholder-zinc-400 focus:ring-2 focus:ring-rose-500 outline-hidden resize-none"
            />
          </div>

          {/* Privacy & Consent Confirmation */}
          <label className="flex items-start gap-2.5 cursor-pointer text-xs text-zinc-600 dark:text-zinc-300">
            <input
              type="checkbox"
              checked={hasAcceptedGuidelines}
              onChange={e => setHasAcceptedGuidelines(e.target.checked)}
              className="mt-0.5 rounded-sm text-rose-600 accent-rose-600 w-4 h-4"
            />
            <span className="text-[11px] leading-snug">
              21+ yaşında olduğumu, etkinlikteki tüm misafirlerin mahremiyetine ve rıza (consent) kurallarına uyacağımı, izinsiz fotoğraf çekilmeyeceğini kabul ediyorum.
            </span>
          </label>

          {/* Actions */}
          <div className="pt-2 flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 px-4 rounded-xl text-xs font-bold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              Vazgeç
            </button>
            <button
              type="submit"
              disabled={!hasAcceptedGuidelines}
              className="flex-2 py-3 px-6 rounded-xl text-xs font-bold bg-gradient-to-r from-rose-600 to-purple-600 hover:from-rose-500 hover:to-purple-500 text-white flex items-center justify-center gap-2 shadow-lg shadow-rose-600/20 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Katılma Başvurusu Gönder</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
