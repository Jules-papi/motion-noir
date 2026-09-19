import React, { useState } from 'react';
import { ShieldCheck, Lock, AlertTriangle, FileText, CheckCircle2, X } from 'lucide-react';
import { PlatformEvent } from '../types';
import { SupportedLanguage } from '../types/anlatiTypes';

interface DigitalConsentModalProps {
  isOpen: boolean;
  event: PlatformEvent;
  language?: SupportedLanguage;
  onClose: () => void;
  onConfirmConsent: (eventId: string) => void;
}

export const DigitalConsentModal: React.FC<DigitalConsentModalProps> = ({
  isOpen,
  event,
  language = 'tr',
  onClose,
  onConfirmConsent,
}) => {
  const [agreedNoCamera, setAgreedNoCamera] = useState(false);
  const [agreedConsent, setAgreedConsent] = useState(false);
  const [agreedPrivacy, setAgreedPrivacy] = useState(false);
  const [signatureName, setSignatureName] = useState('');

  if (!isOpen) return null;

  const isFormValid = agreedNoCamera && agreedConsent && agreedPrivacy && signatureName.trim().length >= 3;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="bg-zinc-950 border border-zinc-800 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl relative text-white flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-5 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/60">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-sm text-white">
                Dijital Rıza & Gizlilik Sözleşmesi (NDA)
              </h3>
              <p className="text-[11px] text-zinc-400">
                🇳🇱 Hollanda Yetişkin Etkinlikleri & GDPR Uyumlu Rıza Protokolü
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-4 overflow-y-auto text-xs text-zinc-300 leading-relaxed">
          <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-300 flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block text-[11px]">Bilet Alımı Öncesi Zorunlu Taahhüt:</span>
              <span className="text-[11px] text-amber-200/90">
                "{event.title}" partisine katılım sağlayabilmek için aşağıdaki gizlilik ve rıza kurallarını onaylamanız yasal gerekliliktir.
              </span>
            </div>
          </div>

          {/* Rules list */}
          <div className="space-y-3">
            {/* Rule 1 */}
            <label className="flex items-start gap-3 p-3 rounded-2xl bg-zinc-900 border border-zinc-800/80 cursor-pointer hover:border-zinc-700 transition-colors">
              <input
                type="checkbox"
                checked={agreedNoCamera}
                onChange={e => setAgreedNoCamera(e.target.checked)}
                className="mt-0.5 rounded text-rose-600 focus:ring-rose-500 w-4 h-4"
              />
              <div className="space-y-0.5">
                <span className="font-bold text-white flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-rose-400" />
                  1. Kamera & Medya Kayıt Yasağı (Camera Mühürleme)
                </span>
                <p className="text-[11px] text-zinc-400">
                  Mekan girişinde telefon kameraları güvenlik etiketiyle mühürlenir. İçeride fotoğraf, video veya ses kaydı almak kesinlikle yasaktır ve yasal kovuşturmaya tabidir.
                </p>
              </div>
            </label>

            {/* Rule 2 */}
            <label className="flex items-start gap-3 p-3 rounded-2xl bg-zinc-900 border border-zinc-800/80 cursor-pointer hover:border-zinc-700 transition-colors">
              <input
                type="checkbox"
                checked={agreedConsent}
                onChange={e => setAgreedConsent(e.target.checked)}
                className="mt-0.5 rounded text-rose-600 focus:ring-rose-500 w-4 h-4"
              />
              <div className="space-y-0.5">
                <span className="font-bold text-white flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  2. Açık ve Karşılıklı Rıza (Enthusiastic Consent)
                </span>
                <p className="text-[11px] text-zinc-400">
                  Her türlü temas, etkileşim ve sohbet koşulsuz karşılıklı rızaya dayanır. "Hayır" kesin ve nihaidir. Her an geri çekilebilir; karşı tarafın kararına derhal saygı duyulacaktır.
                </p>
              </div>
            </label>

            {/* Rule 3 */}
            <label className="flex items-start gap-3 p-3 rounded-2xl bg-zinc-900 border border-zinc-800/80 cursor-pointer hover:border-zinc-700 transition-colors">
              <input
                type="checkbox"
                checked={agreedPrivacy}
                onChange={e => setAgreedPrivacy(e.target.checked)}
                className="mt-0.5 rounded text-rose-600 focus:ring-rose-500 w-4 h-4"
              />
              <div className="space-y-0.5">
                <span className="font-bold text-white flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-purple-400" />
                  3. Katılımcı Mahremiyeti & Sıfır İfşa
                </span>
                <p className="text-[11px] text-zinc-400">
                  Mekanda görülen, tanışılan veya birlikte vakit geçirilen hiç kimsenin kimliği, mesleği veya profili üçüncü şahıslarla paylaşılamaz.
                </p>
              </div>
            </label>
          </div>

          {/* Digital Signature Field */}
          <div className="pt-1">
            <label className="block text-[11px] font-bold text-zinc-300 mb-1.5">
              Dijital İmzanız (Adınız & Soyadınız veya Profil Rumuzunuz):
            </label>
            <input
              type="text"
              value={signatureName}
              onChange={e => setSignatureName(e.target.value)}
              placeholder="Örn: Kerem & Selin (Çift) veya Sophie V."
              className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-white placeholder-zinc-500 text-xs focus:ring-2 focus:ring-rose-500 outline-hidden"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-zinc-800 bg-zinc-900/90 flex items-center justify-end gap-2.5">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white transition-colors"
          >
            Vazgeç
          </button>
          <button
            disabled={!isFormValid}
            onClick={() => {
              onConfirmConsent(event.id);
              onClose();
            }}
            className="px-5 py-2.5 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 disabled:opacity-40 disabled:cursor-not-allowed text-white flex items-center gap-2 shadow-lg shadow-rose-600/20 active:scale-95 transition-all"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Sözleşmeyi İmzala & Devam Et</span>
          </button>
        </div>
      </div>
    </div>
  );
};
