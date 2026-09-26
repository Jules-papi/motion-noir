import React, { useState } from 'react';
import {
  Crown,
  X,
  ShieldCheck,
  Sparkles,
  Calendar,
  Send,
  CheckCircle2
} from 'lucide-react';
import { UserProfile } from '../types';
import { noirApi } from '../services/noirApi';

interface OrganizerApplicationModalProps {
  currentUser: UserProfile;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  onToast?: (msg: { text: string; type: 'success' | 'info' | 'error' }) => void;
}

export const OrganizerApplicationModal: React.FC<OrganizerApplicationModalProps> = ({
  currentUser,
  isOpen,
  onClose,
  onSuccess,
  onToast,
}) => {
  const [experience, setExperience] = useState('');
  const [intendedEvents, setIntendedEvents] = useState('');
  const [socialLinks, setSocialLinks] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!experience.trim() || !intendedEvents.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const ok = await noirApi.applyForOrganizer({
        experience: experience.trim(),
        intendedEvents: intendedEvents.trim(),
        socialLinks: socialLinks.trim() || undefined,
      });

      if (ok) {
        setIsSubmitted(true);
        if (onToast) {
          onToast({ text: 'Küratör başvurunuz yönetime iletildi.', type: 'success' });
        }
        if (onSuccess) onSuccess();
      } else {
        if (onToast) {
          onToast({ text: 'Başvuru gönderilirken hata oluştu.', type: 'error' });
        }
      }
    } catch (err: any) {
      if (onToast) {
        onToast({ text: err?.message || 'Bir hata oluştu.', type: 'error' });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-lg rounded-2xl bg-[#111113] border border-white/[0.08] shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-white/[0.08] flex items-center justify-between bg-[#09090B] shrink-0">
          <div className="flex items-center gap-2.5">
            <Crown className="w-5 h-5 text-[#C5A880]" />
            <h3 className="font-serif text-lg text-[#F1EFEA] font-light">
              Küratör & Organizatör Başvurusu
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-[#9A9996] hover:text-[#F1EFEA] hover:bg-white/[0.06] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        {isSubmitted ? (
          <div className="p-8 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h4 className="font-serif text-xl text-[#F1EFEA] font-light">
              Başvurunuz Alındı
            </h4>
            <p className="text-xs text-[#9A9996] font-sans leading-relaxed max-w-sm mx-auto">
              Major Club küratör konseyi başvurunuzu ve profil uyumunuzu inceleyecek. Onaylandığında bildirim alacaksınız ve doğrudan salon yayınlama yetkisine sahip olacaksınız.
            </p>
            <button
              onClick={onClose}
              className="mt-4 px-6 py-2.5 rounded-xl bg-[#C5A880] text-[#09090B] text-xs font-serif uppercase tracking-wider font-semibold cursor-pointer"
            >
              Tamam
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1 text-xs no-scrollbar">
            {/* Context Note */}
            <div className="p-3.5 rounded-xl bg-[#1A1A1E] border border-white/[0.06] space-y-1">
              <span className="text-[10px] font-mono tracking-widest text-[#C5A880] uppercase block">
                Major Club Kürasyon Standartları
              </span>
              <p className="text-[11px] text-[#9A9996] font-sans leading-relaxed">
                Topluluk kalitesini ve gizliliğini korumak adına yalnızca onaylı organizatörler doğrudan salon oluşturabilir. Lütfen deneyiminizi ve planladığınız salon türlerini belirtin.
              </p>
            </div>

            {/* Experience */}
            <div>
              <label className="font-mono text-[10px] text-[#9A9996] uppercase tracking-wider block mb-1.5">
                Etkinlik / Lifestyle Deneyiminiz *
              </label>
              <textarea
                rows={3}
                required
                value={experience}
                onChange={e => setExperience(e.target.value)}
                placeholder="Daha önce düzenlediğiniz veya dahil olduğunuz özel partiler, salonlar veya davetler hakkında kısa bilgi..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/[0.08] text-xs text-[#F1EFEA] placeholder-[#66666A] focus:outline-none focus:border-[#C5A880]/50 font-sans leading-relaxed"
              />
            </div>

            {/* Intended Events */}
            <div>
              <label className="font-mono text-[10px] text-[#9A9996] uppercase tracking-wider block mb-1.5">
                Düzenlemeyi Planladığınız Salon Konseptleri *
              </label>
              <textarea
                rows={3}
                required
                value={intendedEvents}
                onChange={e => setIntendedEvents(e.target.value)}
                placeholder="Örn: Amsterdam özel villa partisi, Boğaz'da çift & trio tanışma kokteylleri, tematik maskeli balo..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/[0.08] text-xs text-[#F1EFEA] placeholder-[#66666A] focus:outline-none focus:border-[#C5A880]/50 font-sans leading-relaxed"
              />
            </div>

            {/* Social / Referrals */}
            <div>
              <label className="font-mono text-[10px] text-[#9A9996] uppercase tracking-wider block mb-1.5">
                Sosyal Bağlantılar & Referanslar (İsteğe bağlı)
              </label>
              <input
                type="text"
                value={socialLinks}
                onChange={e => setSocialLinks(e.target.value)}
                placeholder="Instagram, web sitesi veya sizi referans gösterecek Major Club üyeleri..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/[0.08] text-xs text-[#F1EFEA] placeholder-[#66666A] focus:outline-none focus:border-[#C5A880]/50 font-sans"
              />
            </div>

            {/* Actions */}
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
                disabled={isSubmitting}
                className="py-2.5 px-5 rounded-xl bg-[#C5A880] hover:bg-[#B89B6E] text-[#09090B] font-serif text-xs uppercase tracking-wider font-semibold transition-all cursor-pointer shadow-lg disabled:opacity-40"
              >
                {isSubmitting ? 'Gönderiliyor...' : 'Başvuruyu Gönder'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
