import React, { useState, useEffect } from 'react';
import { 
  QrCode, 
  X, 
  Download, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle, 
  Scan, 
  Ticket, 
  Sparkles, 
  Lock, 
  RefreshCw,
  Camera,
  MapPin,
  Calendar,
  Clock,
  ArrowRight
} from 'lucide-react';
import { PlatformEvent, UserProfile } from '../types';

interface TicketWalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  events: PlatformEvent[];
  currentUser: UserProfile;
  onCheckInEvent: (eventId: string) => void;
  onToast: (msg: { text: string; type: 'success' | 'info' | 'error' }) => void;
}

export const TicketWalletModal: React.FC<TicketWalletModalProps> = ({
  isOpen,
  onClose,
  events,
  currentUser,
  onCheckInEvent,
  onToast,
}) => {
  const [activeTab, setActiveTab] = useState<'passes' | 'scanner'>('passes');
  const [selectedTicketEvent, setSelectedTicketEvent] = useState<PlatformEvent | null>(null);
  
  // Gate Scanner state
  const [scannerCode, setScannerCode] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<{
    status: 'success' | 'error' | 'already_checked_in';
    message: string;
    event?: PlatformEvent;
    timestamp?: string;
  } | null>(null);

  // Dynamic anti-screenshot token rotation
  const [securityToken, setSecurityToken] = useState(() => Math.random().toString(36).substring(2, 8).toUpperCase());
  
  useEffect(() => {
    const interval = setInterval(() => {
      setSecurityToken(Math.random().toString(36).substring(2, 8).toUpperCase());
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  // Filter events user has tickets for (applicationStatus === 'paid' or isUserRegistered)
  const ticketEvents = events.filter(e => e.applicationStatus === 'paid' || e.isUserRegistered || e.isCheckedIn);

  useEffect(() => {
    if (ticketEvents.length > 0 && !selectedTicketEvent) {
      setSelectedTicketEvent(ticketEvents[0]);
    }
  }, [events]);

  if (!isOpen) return null;

  const handleSimulateScan = (eventToScan?: PlatformEvent) => {
    const target = eventToScan || events.find(e => 
      e.id === scannerCode || 
      `MN-${e.id.slice(0, 4).toUpperCase()}`.includes(scannerCode.toUpperCase()) ||
      (e.ticketCode && e.ticketCode.toUpperCase() === scannerCode.toUpperCase())
    );

    setIsScanning(true);
    setScanResult(null);

    setTimeout(() => {
      setIsScanning(false);
      if (!target) {
        setScanResult({
          status: 'error',
          message: 'Geçersiz veya sahte bilet kodu! Major Club salon kayıtlarında bulunamadı.',
        });
        return;
      }

      if (target.isCheckedIn) {
        setScanResult({
          status: 'already_checked_in',
          message: `DİKKAT: Bu bilet daha önce giriş yaptı! (${target.title})`,
          event: target,
          timestamp: new Date().toLocaleTimeString(),
        });
        return;
      }

      // Successful check-in
      onCheckInEvent(target.id);
      setScanResult({
        status: 'success',
        message: `Giriş Onaylandı! Hoş geldiniz, ${currentUser.name}. Salona erişim yetkisi verildi.`,
        event: target,
        timestamp: new Date().toLocaleTimeString(),
      });
      onToast({ text: `✓ ${target.title} için QR bilet kapıda başarıyla okutuldu!`, type: 'success' });
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
      <div className="bg-[#0D0F14] border border-white/10 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl relative text-[#F4F1EC] flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-white/[0.08] flex items-center justify-between bg-[#121419] shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#1A1D24] border border-white/10 flex items-center justify-center text-[#E5C590]">
              <Ticket className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-serif text-lg text-white font-medium">
                Major Club Bilet & Kapı Cüzdanı
              </h2>
              <p className="text-[11px] text-zinc-400 font-sans">
                Kişisel dijital salon pasaportları ve kapı QR doğrulama sistemi
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Capsule Navigation */}
        <div className="flex items-center gap-2 px-5 pt-4 pb-2 bg-[#121419]/50 border-b border-white/[0.04]">
          <button
            onClick={() => setActiveTab('passes')}
            className={`px-4 py-1.5 rounded-full text-xs font-serif uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'passes'
                ? 'bg-[#1E222B] text-[#E5C590] border border-[#E5C590]/40 shadow-sm'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Ticket className="w-3.5 h-3.5" />
            <span>Aktif Biletlerim ({ticketEvents.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('scanner')}
            className={`px-4 py-1.5 rounded-full text-xs font-serif uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'scanner'
                ? 'bg-[#1E222B] text-[#E5C590] border border-[#E5C590]/40 shadow-sm'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Scan className="w-3.5 h-3.5" />
            <span>Giriş Kapısı QR Tarayıcı</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-5 overflow-y-auto flex-1 space-y-6">
          {activeTab === 'passes' ? (
            <div>
              {ticketEvents.length === 0 ? (
                <div className="text-center py-12 px-4 space-y-3">
                  <div className="w-12 h-12 rounded-full bg-[#181B22] border border-white/10 flex items-center justify-center mx-auto text-zinc-500">
                    <Ticket className="w-6 h-6" />
                  </div>
                  <h3 className="font-serif text-base text-zinc-300">Henüz Kayıtlı Biletiniz Yok</h3>
                  <p className="text-xs text-zinc-500 max-w-sm mx-auto font-sans">
                    Özel salon etkinliklerine başvurarak veya davetiyenizi onaylayarak dijital QR pasaportunuzu oluşturabilirsiniz.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
                  {/* Ticket List on the Left */}
                  <div className="md:col-span-5 space-y-3">
                    <span className="text-[10px] font-mono tracking-widest text-zinc-400 uppercase block">
                      Kayıtlı Davetiyeler
                    </span>
                    {ticketEvents.map(event => {
                      const isSelected = selectedTicketEvent?.id === event.id;
                      return (
                        <div
                          key={event.id}
                          onClick={() => setSelectedTicketEvent(event)}
                          className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-[#1A1D24] border-[#E5C590]/60 shadow-md'
                              : 'bg-[#121419] border-white/[0.06] hover:border-white/20'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-serif text-xs text-white font-medium truncate">
                              {event.title}
                            </span>
                            {event.isCheckedIn ? (
                              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[9px] font-mono shrink-0">
                                GİRİŞ YAPILDI
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-full bg-[#E5C590]/20 text-[#E5C590] text-[9px] font-mono shrink-0">
                                GEÇERLİ
                              </span>
                            )}
                          </div>
                          <div className="mt-2 flex items-center gap-3 text-[10px] text-zinc-400 font-mono">
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-[#E5C590]" />
                              {event.city}
                            </span>
                            <span>·</span>
                            <span>{event.startsAt.split(',')[0]}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Selected Ticket Live Card */}
                  {selectedTicketEvent && (
                    <div className="md:col-span-7 bg-[#15171E] border border-white/10 rounded-2xl p-5 flex flex-col items-center space-y-4 shadow-xl relative overflow-hidden">
                      {/* Top ribbon */}
                      <div className="w-full flex items-center justify-between pb-3 border-b border-white/[0.06] text-[10px] font-mono">
                        <span className="text-[#E5C590] tracking-widest uppercase">
                          MAJOR CLUB VIP PASS
                        </span>
                        <span className="flex items-center gap-1 text-zinc-400">
                          <RefreshCw className="w-3 h-3 animate-spin text-[#E5C590]" />
                          Token: {securityToken}
                        </span>
                      </div>

                      {/* Event Title */}
                      <div className="text-center space-y-1">
                        <h4 className="font-serif text-base text-white font-medium">
                          {selectedTicketEvent.title}
                        </h4>
                        <p className="text-[11px] text-zinc-400 font-sans">
                          {selectedTicketEvent.venue} · {selectedTicketEvent.address}
                        </p>
                      </div>

                      {/* QR Display */}
                      <div className="relative p-4 bg-[#0B0C0E] rounded-xl border border-white/10 flex flex-col items-center justify-center">
                        <div className="w-36 h-36 bg-white p-2.5 rounded-lg flex items-center justify-center relative shadow-inner">
                          <QrCode className="w-full h-full text-black" />
                          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <span className="w-7 h-7 rounded-full bg-[#0D0F14] text-[#E5C590] border border-[#E5C590]/40 flex items-center justify-center font-serif text-xs font-bold shadow-md">
                              MN
                            </span>
                          </div>
                        </div>

                        {selectedTicketEvent.isCheckedIn && (
                          <div className="absolute inset-0 bg-black/75 backdrop-blur-[2px] rounded-xl flex flex-col items-center justify-center text-emerald-400 p-2 text-center animate-in fade-in">
                            <CheckCircle2 className="w-10 h-10 mb-1" />
                            <span className="font-mono text-xs font-bold tracking-widest">KAPI GİRİŞİ YAPILDI</span>
                            <span className="text-[9px] text-zinc-400 mt-0.5 font-sans">Damgalanmış Pasaport</span>
                          </div>
                        )}
                      </div>

                      {/* Attendee details */}
                      <div className="w-full bg-[#1A1D24] p-3 rounded-xl border border-white/[0.06] grid grid-cols-2 gap-2 text-[10px] font-mono">
                        <div>
                          <span className="text-zinc-500 block uppercase">Davetli</span>
                          <span className="text-white font-medium truncate block">{currentUser.name}</span>
                        </div>
                        <div>
                          <span className="text-zinc-500 block uppercase">Bilet Kodu</span>
                          <span className="text-[#E5C590] font-medium block">
                            {selectedTicketEvent.ticketCode || `MN-AMS-${selectedTicketEvent.id.slice(0, 4).toUpperCase()}`}
                          </span>
                        </div>
                        <div>
                          <span className="text-zinc-500 block uppercase">Tarih / Saat</span>
                          <span className="text-zinc-300 block truncate">{selectedTicketEvent.startsAt}</span>
                        </div>
                        <div>
                          <span className="text-zinc-500 block uppercase">Loca / Oda</span>
                          <span className="text-zinc-300 block">Privé Lounge Suite</span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="w-full flex items-center gap-2 pt-1">
                        <button
                          onClick={() => {
                            setActiveTab('scanner');
                            setScannerCode(selectedTicketEvent.ticketCode || selectedTicketEvent.id);
                          }}
                          className="flex-1 py-2 px-3 rounded-xl bg-[#1E222B] hover:bg-[#282D39] text-[#E5C590] border border-[#E5C590]/40 text-xs font-serif uppercase tracking-wider flex items-center justify-center gap-2 transition-colors cursor-pointer"
                        >
                          <Scan className="w-3.5 h-3.5" />
                          <span>Kapıda Doğrula</span>
                        </button>
                        <button
                          onClick={() => {
                            onToast({ text: 'Bilet Apple / Google Wallet formatında indirildi.', type: 'success' });
                          }}
                          className="py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 text-xs font-serif uppercase tracking-wider border border-white/10 flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>İndir</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            /* GATE SCANNER TAB */
            <div className="space-y-6 max-w-lg mx-auto">
              <div className="text-center space-y-1">
                <span className="text-[10px] font-mono tracking-widest text-[#E5C590] uppercase">
                  Major Club Gatekeeping Engine
                </span>
                <h3 className="font-serif text-xl text-white font-medium">
                  Giriş Kapısı QR Doğrulayıcı
                </h3>
                <p className="text-xs text-zinc-400 font-sans">
                  Kapı görevlisi olarak bilet QR kodunu tarayın veya bilet kodunu girerek salona giriş damgasını onaylayın.
                </p>
              </div>

              {/* Camera Scanner Viewfinder Simulator */}
              <div className="relative w-full h-56 bg-black rounded-2xl border-2 border-dashed border-white/20 overflow-hidden flex flex-col items-center justify-center">
                {/* Laser animation */}
                {isScanning ? (
                  <>
                    <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-rose-500 to-transparent shadow-[0_0_15px_#f43f5e] animate-pulse top-1/2 -translate-y-1/2" />
                    <div className="flex flex-col items-center gap-2 text-rose-400 font-mono text-xs">
                      <RefreshCw className="w-6 h-6 animate-spin" />
                      <span>Bilet Doğrulanıyor & Şifre Çözülüyor...</span>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center gap-2 text-zinc-500">
                    <Camera className="w-8 h-8 text-zinc-400" />
                    <span className="text-xs font-sans">Kamera Vizörü Hazır</span>
                    <span className="text-[10px] font-mono text-zinc-600">Major Club High-Speed QR Sensor</span>
                  </div>
                )}

                {/* Viewfinder Target Corners */}
                <div className="absolute top-4 left-4 w-6 h-6 border-t-2 border-l-2 border-[#E5C590]" />
                <div className="absolute top-4 right-4 w-6 h-6 border-t-2 border-r-2 border-[#E5C590]" />
                <div className="absolute bottom-4 left-4 w-6 h-6 border-b-2 border-l-2 border-[#E5C590]" />
                <div className="absolute bottom-4 right-4 w-6 h-6 border-b-2 border-r-2 border-[#E5C590]" />
              </div>

              {/* Scan input controls */}
              <div className="space-y-3">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={scannerCode}
                    onChange={e => setScannerCode(e.target.value)}
                    placeholder="Bilet Kodu (Örn: MN-AMS-4029 veya event-1)..."
                    className="flex-1 bg-[#15171E] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder-zinc-500 font-mono focus:outline-hidden focus:border-[#E5C590]"
                  />
                  <button
                    onClick={() => handleSimulateScan()}
                    disabled={isScanning}
                    className="px-5 py-2.5 rounded-xl bg-white hover:bg-zinc-200 text-black text-xs font-serif uppercase tracking-wider font-semibold transition-colors cursor-pointer disabled:opacity-50"
                  >
                    Tara & Okut
                  </button>
                </div>

                {/* Quick test buttons */}
                <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pt-1">
                  <span className="text-[10px] font-mono text-zinc-500 shrink-0">Hızlı Test:</span>
                  {events.slice(0, 3).map(ev => (
                    <button
                      key={ev.id}
                      onClick={() => {
                        setScannerCode(ev.ticketCode || ev.id);
                        handleSimulateScan(ev);
                      }}
                      className="px-2.5 py-1 rounded-full bg-[#181B22] hover:bg-[#202530] text-zinc-300 text-[10px] font-mono border border-white/5 whitespace-nowrap cursor-pointer"
                    >
                      {ev.city} ({ev.id})
                    </button>
                  ))}
                </div>
              </div>

              {/* Scan Result Feedback Card */}
              {scanResult && (
                <div className={`p-4 rounded-2xl border transition-all ${
                  scanResult.status === 'success'
                    ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200'
                    : scanResult.status === 'already_checked_in'
                    ? 'bg-amber-950/40 border-amber-500/40 text-amber-200'
                    : 'bg-rose-950/40 border-rose-500/40 text-rose-200'
                }`}>
                  <div className="flex items-start gap-3">
                    {scanResult.status === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />}
                    {scanResult.status === 'already_checked_in' && <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />}
                    {scanResult.status === 'error' && <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />}
                    <div className="space-y-1">
                      <span className="text-xs font-serif font-semibold block">
                        {scanResult.status === 'success' ? 'DOĞRULAMA BAŞARILI' : scanResult.status === 'already_checked_in' ? 'TEKRAR GİRİŞ UYARISI' : 'DOĞRULAMA BAŞARISIZ'}
                      </span>
                      <p className="text-xs font-sans opacity-90">{scanResult.message}</p>
                      {scanResult.timestamp && (
                        <span className="text-[10px] font-mono opacity-75 block">Saat: {scanResult.timestamp}</span>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
