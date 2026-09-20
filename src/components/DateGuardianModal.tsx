import React, { useState, useEffect } from 'react';
import { ShieldCheck, ShieldAlert, Clock, Phone, Lock, Check, X, AlertTriangle, Send } from 'lucide-react';

interface DateGuardianModalProps {
  isOpen: boolean;
  onClose: () => void;
  onToast: (msg: { text: string; type: 'success' | 'error' | 'info' }) => void;
}

export const DateGuardianModal: React.FC<DateGuardianModalProps> = ({
  isOpen,
  onClose,
  onToast,
}) => {
  const [isActive, setIsActive] = useState(false);
  const [durationMinutes, setDurationMinutes] = useState<number>(60);
  const [remainingSeconds, setRemainingSeconds] = useState<number>(3600);
  const [contactName, setContactName] = useState('Gizem S.');
  const [contactPhone, setContactPhone] = useState('+90 532 555 0192');
  const [safetyPin, setSafetyPin] = useState('1881');
  const [enteredPin, setEnteredPin] = useState('');
  const [locationShare, setLocationShare] = useState(true);

  // Load from localStorage if already running
  useEffect(() => {
    const saved = localStorage.getItem('maison_guardian_session');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.endTime > Date.now()) {
          setIsActive(true);
          setRemainingSeconds(Math.floor((parsed.endTime - Date.now()) / 1000));
          setContactName(parsed.contactName || 'Gizem S.');
          setContactPhone(parsed.contactPhone || '+90 532 555 0192');
          setSafetyPin(parsed.safetyPin || '1881');
        } else {
          localStorage.removeItem('maison_guardian_session');
        }
      } catch {
        // Ignore parse error
      }
    }
  }, []);

  // Countdown timer
  useEffect(() => {
    if (!isActive) return;

    const interval = setInterval(() => {
      setRemainingSeconds(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          setIsActive(false);
          localStorage.removeItem('maison_guardian_session');
          onToast({
            text: '⚠️ Randevu süreniz doldu! Lütfen güvenli PIN kodunuzu doğrulayın.',
            type: 'error',
          });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isActive, onToast]);

  if (!isOpen) return null;

  const startGuardian = () => {
    const totalSec = durationMinutes * 60;
    setRemainingSeconds(totalSec);
    setIsActive(true);
    const endTime = Date.now() + totalSec * 1000;
    localStorage.setItem('maison_guardian_session', JSON.stringify({
      endTime,
      contactName,
      contactPhone,
      safetyPin,
    }));
    onToast({
      text: `🛡️ Güvenli Randevu Koruyucusu (${durationMinutes} dk) başlatıldı.`,
      type: 'success',
    });
  };

  const endGuardianSafely = () => {
    if (enteredPin !== safetyPin) {
      onToast({
        text: '❌ Hatalı Güvenlik PIN Kodu! Lütfen doğru kodu girin.',
        type: 'error',
      });
      return;
    }
    setIsActive(false);
    setEnteredPin('');
    localStorage.removeItem('maison_guardian_session');
    onToast({
      text: '✅ Randevu güvenle tamamlandı ve koruyucu oturumu kapatıldı.',
      type: 'success',
    });
  };

  const triggerEmergencyAlert = () => {
    onToast({
      text: `🚨 ACİL DURUM: "${contactName}" (${contactPhone}) numarasına konum ve acil bildirim kodu iletildi!`,
      type: 'error',
    });
  };

  const formatTime = (totalSec: number) => {
    const hrs = Math.floor(totalSec / 3600);
    const mins = Math.floor((totalSec % 3600) / 60);
    const secs = totalSec % 60;
    if (hrs > 0) {
      return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div 
        className="bg-[#0c0d11] border border-white/[0.12] rounded-2xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 px-5 border-b border-white/[0.08] flex items-center justify-between bg-[#121419]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-serif text-sm text-white font-medium">Güvenli Randevu Koruyucusu</h3>
              <p className="text-[10px] text-zinc-400 font-sans">Date Guardian & Discreet Check-in</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            aria-label="Close modal"
            className="p-1 rounded-full text-zinc-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-5 overflow-y-auto max-h-[80vh]">
          {isActive ? (
            /* Active Guardian Running State */
            <div className="space-y-4">
              <div className="p-5 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 text-center space-y-2">
                <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-400 block font-medium">
                  • Koruma Oturumu Aktif •
                </span>
                <div className="font-mono text-3xl font-bold text-white tracking-wider">
                  {formatTime(remainingSeconds)}
                </div>
                <p className="text-xs text-zinc-400 font-sans">
                  Süre bittiğinde güvenli PIN kodu girilmezse acil durum protokolü devreye girer.
                </p>
              </div>

              {/* Emergency Contact Summary */}
              <div className="p-3.5 rounded-xl bg-[#121419] border border-white/[0.06] text-xs space-y-1.5 font-sans">
                <div className="flex justify-between text-zinc-400">
                  <span>Acil Durum Kontağı:</span>
                  <span className="text-zinc-200 font-medium">{contactName} ({contactPhone})</span>
                </div>
                <div className="flex justify-between text-zinc-400">
                  <span>Konum Doğrulama:</span>
                  <span className="text-emerald-400 font-mono">Aktif (Canlı Şifreli)</span>
                </div>
              </div>

              {/* Safe PIN Input to Complete */}
              <div className="p-4 rounded-xl bg-[#181B22] border border-white/[0.08] space-y-3">
                <label className="block text-xs text-zinc-200 font-medium">
                  Randevuyu Güvenle Bitir (PIN Doğrula)
                </label>
                <div className="flex gap-2">
                  <input
                    type="password"
                    maxLength={6}
                    value={enteredPin}
                    onChange={e => setEnteredPin(e.target.value)}
                    placeholder="Güvenlik PIN Kodu"
                    className="flex-1 px-3 py-2 rounded-lg bg-black/40 border border-white/10 text-center font-mono text-white text-sm tracking-widest focus:outline-none focus:border-[#E5C590]"
                  />
                  <button
                    onClick={endGuardianSafely}
                    className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium cursor-pointer transition-colors flex items-center gap-1.5"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Bitir</span>
                  </button>
                </div>
                <span className="text-[10px] text-zinc-500 font-sans block">
                  (Varsayılan test PIN: <span className="font-mono text-zinc-400">{safetyPin}</span>)
                </span>
              </div>

              {/* Instant Emergency Trigger Button */}
              <button
                onClick={triggerEmergencyAlert}
                className="w-full py-2.5 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 border border-rose-500/40 text-rose-300 text-xs font-medium flex items-center justify-center gap-2 cursor-pointer transition-colors"
              >
                <AlertTriangle className="w-4 h-4 text-rose-400" />
                <span>Acil Durum Uyarısı Gönder (Simülasyon)</span>
              </button>
            </div>
          ) : (
            /* Setup New Guardian */
            <div className="space-y-4">
              <p className="text-xs text-zinc-300 font-sans leading-relaxed">
                Buluşmaya giderken koruyucuyu başlatın. Belirlediğiniz süre sonunda sessiz bir onay uyarısı alırsınız.
              </p>

              {/* Duration Selector */}
              <div>
                <label className="block text-[11px] font-mono text-zinc-400 mb-2">
                  Randevu Kontrol Süresi
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[30, 60, 120, 180].map(mins => (
                    <button
                      key={mins}
                      type="button"
                      onClick={() => setDurationMinutes(mins)}
                      className={`py-2 rounded-xl text-xs font-mono transition-colors cursor-pointer border ${
                        durationMinutes === mins
                          ? 'bg-[#E5C590] text-black font-semibold border-[#E5C590]'
                          : 'bg-[#121419] text-zinc-400 hover:text-white border-white/[0.08]'
                      }`}
                    >
                      {mins < 60 ? `${mins} Dk` : `${mins / 60} Saat`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Emergency Contact */}
              <div className="space-y-3 pt-2">
                <div>
                  <label className="block text-[11px] font-mono text-zinc-400 mb-1">
                    Güvenilir Acil Kontak İsmi
                  </label>
                  <input
                    type="text"
                    value={contactName}
                    onChange={e => setContactName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#121419] border border-white/[0.08] text-xs text-white focus:outline-none focus:border-[#E5C590]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-mono text-zinc-400 mb-1">
                    Acil Kontak Telefon Numarası
                  </label>
                  <input
                    type="tel"
                    value={contactPhone}
                    onChange={e => setContactPhone(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#121419] border border-white/[0.08] text-xs text-white font-mono focus:outline-none focus:border-[#E5C590]"
                  />
                </div>
              </div>

              {/* Safety PIN */}
              <div>
                <label className="block text-[11px] font-mono text-zinc-400 mb-1">
                  Güvenlik İptal PIN Kodu (4 Hane)
                </label>
                <input
                  type="password"
                  maxLength={4}
                  value={safetyPin}
                  onChange={e => setSafetyPin(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#121419] border border-white/[0.08] text-xs text-white font-mono tracking-widest focus:outline-none focus:border-[#E5C590]"
                />
              </div>

              <div className="p-3 rounded-xl bg-[#121419] border border-white/[0.06] flex items-center justify-between">
                <span className="text-xs text-zinc-300 font-sans">Acil durumda şifreli canlı konum ilet</span>
                <input
                  type="checkbox"
                  checked={locationShare}
                  onChange={e => setLocationShare(e.target.checked)}
                  className="w-4 h-4 rounded accent-[#E5C590] cursor-pointer"
                />
              </div>

              <button
                onClick={startGuardian}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-[#E5C590] to-[#C9A86A] text-black font-serif text-xs font-semibold tracking-wider uppercase hover:opacity-95 transition-opacity cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-[#E5C590]/10"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Koruyucuyu Başlat ({durationMinutes} Dk)</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
