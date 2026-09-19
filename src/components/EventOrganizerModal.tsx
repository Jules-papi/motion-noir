import React, { useState } from 'react';
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
  Filter 
} from 'lucide-react';
import { PlatformEvent } from '../types';
import { EventApplication } from '../types/anlatiTypes';

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
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<string | null>(null);

  // Initial mock applications for this event
  const [applications, setApplications] = useState<EventApplication[]>([
    {
      id: 'app-1',
      eventId: event.id,
      eventTitle: event.title,
      userId: 'usr-1',
      userName: 'Sophie & Mark (Çift)',
      userAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=200&q=80',
      userType: 'couple',
      status: 'pending',
      appliedAt: '2 saat önce',
      notes: 'Amsterdam lifestyle kulübünden geliyoruz, davetiye için teşekkürler.',
    },
    {
      id: 'app-2',
      eventId: event.id,
      eventTitle: event.title,
      userId: 'usr-2',
      userName: 'Elif Yılmaz (Tekil)',
      userAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      userType: 'single',
      status: 'approved',
      ticketId: 'VIP-AMS-4482',
      appliedAt: 'Dün',
    },
    {
      id: 'app-3',
      eventId: event.id,
      eventTitle: event.title,
      userId: 'usr-3',
      userName: 'Deniz & Can (Çift)',
      userAvatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=200&q=80',
      userType: 'couple',
      status: 'checked_in',
      ticketId: 'VIP-AMS-9912',
      appliedAt: '3 gün önce',
    },
    {
      id: 'app-4',
      eventId: event.id,
      eventTitle: event.title,
      userId: 'usr-4',
      userName: 'Lucas V. (Tekil)',
      userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
      userType: 'single',
      status: 'pending',
      appliedAt: 'Bugün 10:30',
      notes: 'Tekil katılım başvurusu.',
    },
  ]);

  const handleApprove = (appId: string) => {
    const targetApp = applications.find(a => a.id === appId);
    setApplications(prev =>
      prev.map(a =>
        a.id === appId
          ? { ...a, status: 'approved', ticketId: `VIP-AMS-${Math.floor(1000 + Math.random() * 9000)}` }
          : a
      )
    );
    if (onApproveApplicationForEvent && targetApp) {
      onApproveApplicationForEvent(event.id, targetApp.userName);
    }
    if (onToast) onToast({ text: `${targetApp ? targetApp.userName : 'Katılımcı'} başvurusu onaylandı ve bildirim gönderildi.`, type: 'success' });
  };

  const handleReject = (appId: string) => {
    setApplications(prev =>
      prev.map(a => (a.id === appId ? { ...a, status: 'rejected' } : a))
    );
    if (onToast) onToast({ text: 'Başvuru reddedildi.', type: 'info' });
  };

  const handleCheckIn = (appId: string) => {
    setApplications(prev =>
      prev.map(a => (a.id === appId ? { ...a, status: 'checked_in' } : a))
    );
    if (onToast) onToast({ text: 'Giriş QR Kodu onaylandı: Katılımcı içeri alındı!', type: 'success' });
  };

  const simulateQrScan = () => {
    setIsScanning(true);
    setScanResult(null);
    setTimeout(() => {
      setIsScanning(false);
      setScanResult('GEÇERLİ BİLET: Elif Yılmaz (VIP-AMS-4482) - Giriş Onaylandı ✅');
      setApplications(prev =>
        prev.map(a => (a.id === 'app-2' ? { ...a, status: 'checked_in' } : a))
      );
    }, 1200);
  };

  const filteredApps = applications.filter(a => {
    if (filterStatus !== 'all' && a.status !== filterStatus) return false;
    if (searchQuery && !a.userName.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in duration-150">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-md bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-300 font-bold text-[10px] uppercase">
                Organizatör Kontrol Paneli
              </span>
            </div>
            <h3 className="text-base font-extrabold text-zinc-900 dark:text-white mt-1 truncate">
              {event.title}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-4 gap-2 p-4 bg-zinc-50 dark:bg-zinc-800/40 border-b border-zinc-200 dark:border-zinc-800 text-center shrink-0">
          <div className="p-2 bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200/60 dark:border-zinc-700">
            <span className="text-[10px] text-zinc-400 block font-medium">Toplam</span>
            <strong className="text-sm font-bold text-zinc-900 dark:text-white">{applications.length}</strong>
          </div>
          <div className="p-2 bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200/60 dark:border-zinc-700">
            <span className="text-[10px] text-amber-500 block font-medium">Bekleyen</span>
            <strong className="text-sm font-bold text-amber-500">
              {applications.filter(a => a.status === 'pending').length}
            </strong>
          </div>
          <div className="p-2 bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200/60 dark:border-zinc-700">
            <span className="text-[10px] text-emerald-500 block font-medium">Onaylanan</span>
            <strong className="text-sm font-bold text-emerald-500">
              {applications.filter(a => a.status === 'approved').length}
            </strong>
          </div>
          <div className="p-2 bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200/60 dark:border-zinc-700">
            <span className="text-[10px] text-purple-500 block font-medium">İçeride</span>
            <strong className="text-sm font-bold text-purple-500">
              {applications.filter(a => a.status === 'checked_in').length}
            </strong>
          </div>
        </div>

        {/* QR Scanner Tool Banner */}
        <div className="p-3 mx-4 mt-3 rounded-2xl bg-gradient-to-r from-purple-900/40 to-indigo-900/40 border border-purple-500/30 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 text-xs text-purple-200">
            <QrCode className="w-5 h-5 text-purple-400 shrink-0" />
            <span>Kapıda Bilet Doğrulama: Katılımcıların QR kodunu taratarak anında onaylayın.</span>
          </div>
          <button
            onClick={simulateQrScan}
            disabled={isScanning}
            className="px-3 py-1.5 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-500 text-white shrink-0 shadow-xs"
          >
            {isScanning ? 'Taranıyor...' : 'QR Tara & Doğrula'}
          </button>
        </div>

        {scanResult && (
          <div className="mx-4 mt-2 p-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-bold text-center">
            {scanResult}
          </div>
        )}

        {/* Filter and Search Bar */}
        <div className="p-4 flex flex-col sm:flex-row items-center gap-2 shrink-0">
          <div className="relative w-full sm:flex-1">
            <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Katılımcı ismi ara..."
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl bg-zinc-100 dark:bg-zinc-800 border-none text-zinc-900 dark:text-white outline-hidden"
            />
          </div>

          <div className="flex items-center gap-1 w-full sm:w-auto overflow-x-auto">
            {(['all', 'pending', 'approved', 'checked_in'] as const).map(st => (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${
                  filterStatus === st
                    ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900'
                    : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
                }`}
              >
                {st === 'all' ? 'Tümü' : st === 'pending' ? 'Bekleyen' : st === 'approved' ? 'Onaylı' : 'Giriş Yapan'}
              </button>
            ))}
          </div>
        </div>

        {/* Applications List */}
        <div className="p-4 pt-0 space-y-2.5 flex-1 overflow-y-auto">
          {filteredApps.length === 0 ? (
            <p className="text-xs text-center text-zinc-400 py-8">Kriterlere uygun başvuru bulunamadı.</p>
          ) : (
            filteredApps.map(app => (
              <div
                key={app.id}
                className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/70 dark:border-zinc-700/70 flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src={app.userAvatar}
                    alt={app.userName}
                    className="w-10 h-10 rounded-xl object-cover ring-2 ring-zinc-300 dark:ring-zinc-700 shrink-0"
                  />
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <strong className="text-xs font-bold text-zinc-900 dark:text-white truncate">
                        {app.userName}
                      </strong>
                      <span className="text-[10px] text-zinc-400">• {app.appliedAt}</span>
                    </div>
                    {app.notes && (
                      <p className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate">{app.notes}</p>
                    )}
                    {app.ticketId && (
                      <span className="text-[10px] font-mono text-purple-600 dark:text-purple-400 font-bold block">
                        Bilet No: {app.ticketId}
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1.5 shrink-0">
                  {app.status === 'pending' && (
                    <>
                      <button
                        onClick={() => handleApprove(app.id)}
                        className="p-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1 shadow-xs"
                        title="Başvuruyu Onayla & QR Bilet Gönder"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Onayla</span>
                      </button>
                      <button
                        onClick={() => handleReject(app.id)}
                        className="p-2 rounded-xl bg-rose-100 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 text-xs font-bold"
                        title="Reddet"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </>
                  )}

                  {app.status === 'approved' && (
                    <button
                      onClick={() => handleCheckIn(app.id)}
                      className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center gap-1"
                    >
                      <QrCode className="w-3.5 h-3.5" />
                      <span>İçeri Al (Check-in)</span>
                    </button>
                  )}

                  {app.status === 'checked_in' && (
                    <span className="px-2.5 py-1 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>İçeride</span>
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
