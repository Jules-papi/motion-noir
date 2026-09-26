import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  AlertTriangle,
  Users,
  CreditCard,
  Server,
  X,
  Activity,
  Bot,
  Ban,
  CheckCircle2,
  Clock,
  Calendar,
  Crown,
  Building,
  Plus,
  ArrowRight,
  Sparkles,
  MapPin,
  Lock,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  FileText
} from 'lucide-react';
import { ReportItem, PlatformEvent, OrganizerApplication, Venue, UserProfile } from '../types';
import { noirApi } from '../services/noirApi';

export type AdminTab = 'events' | 'organizers' | 'venues' | 'moderation' | 'health';

interface AdminPanelViewProps {
  currentUser: UserProfile;
  reports?: ReportItem[];
  onTakeAction?: (reportId: string, actionType: 'ban' | 'warn' | 'delete') => void;
  onDismissReport?: (reportId: string) => void;
  onToast?: (msg: { text: string; type: 'success' | 'info' | 'error' }) => void;
  onEventApproved?: () => void;
  onNavigateHome?: () => void;
}

export const AdminPanelView: React.FC<AdminPanelViewProps> = ({
  currentUser,
  reports = [],
  onTakeAction,
  onDismissReport,
  onToast,
  onEventApproved,
  onNavigateHome,
}) => {
  // Navigation
  const [activeTab, setActiveTab] = useState<AdminTab>('events');
  const [selectedReportFilter, setSelectedReportFilter] = useState<'all' | 'pending' | 'action_taken' | 'dismissed'>('all');

  // Governance Data States
  const [pendingEvents, setPendingEvents] = useState<PlatformEvent[]>([]);
  const [organizerApplications, setOrganizerApplications] = useState<OrganizerApplication[]>([]);
  const [venues, setVenues] = useState<Venue[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Rejection Modals/Prompts
  const [rejectingEventId, setRejectingEventId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [reviewingAppId, setReviewingAppId] = useState<string | null>(null);
  const [reviewerNotes, setReviewerNotes] = useState('');

  // Venue Creation State
  const [isAddVenueOpen, setIsAddVenueOpen] = useState(false);
  const [newVenueName, setNewVenueName] = useState('');
  const [newVenueSlug, setNewVenueSlug] = useState('');
  const [newVenueCity, setNewVenueCity] = useState('Amsterdam');
  const [newVenueAddress, setNewVenueAddress] = useState('');
  const [newVenueType, setNewVenueType] = useState('villa');
  const [newVenueCapacity, setNewVenueCapacity] = useState(60);
  const [newVenueDesc, setNewVenueDesc] = useState('');
  const [newVenueCover, setNewVenueCover] = useState('https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1200&q=80');
  const [newVenueAmenities, setNewVenueAmenities] = useState('Isıtmalı Havuz, Ses Yalıtımı, Özel Bar, Kilitli Odalar');
  const [newVenueRules, setNewVenueRules] = useState('Kamera mühürleme zorunlu, 100% Karşılıklı rıza, 21+ Yaş');

  // Load Admin Data on Mount and Tab Change
  const loadAdminData = async () => {
    setIsLoading(true);
    try {
      const [evts, apps, vns] = await Promise.all([
        noirApi.getPendingEvents(),
        noirApi.getOrganizerApplications(),
        noirApi.getVenues(),
      ]);
      setPendingEvents(evts);
      setOrganizerApplications(apps);
      setVenues(vns);
    } catch (err) {
      console.warn('Failed to load admin governance data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser?.isAdmin) {
      loadAdminData();
    }
  }, [currentUser?.isAdmin]);

  // Security Access Gate
  if (!currentUser || !currentUser.isAdmin) {
    return (
      <div className="p-8 sm:p-16 max-w-xl mx-auto my-12 rounded-2xl bg-[#111113] border border-rose-500/20 text-center space-y-4 shadow-2xl">
        <div className="w-14 h-14 rounded-full bg-rose-950/40 border border-rose-500/30 text-rose-400 flex items-center justify-center mx-auto">
          <Lock className="w-6 h-6 stroke-[1.75]" />
        </div>
        <h2 className="font-serif text-2xl text-[#F1EFEA] font-light">
          Erişim Reddedildi — Yüksek Küratör Protokolü
        </h2>
        <p className="text-xs text-[#9A9996] font-sans leading-relaxed">
          Bu konsol yalnızca Major Club Yüksek Küratör Konseyi ve sistem yöneticilerine tahsis edilmiştir. Yetkiniz bulunmamaktadır.
        </p>
        {onNavigateHome && (
          <button
            onClick={onNavigateHome}
            className="mt-4 px-5 py-2.5 rounded-full bg-[#1A1A1E] hover:bg-[#222228] text-[#C5A880] border border-[#C5A880]/30 text-xs font-serif uppercase tracking-wider transition-all cursor-pointer"
          >
            Ana Sayfaya Dön
          </button>
        )}
      </div>
    );
  }

  // --- ACTIONS ---
  const handleApproveEvent = async (eventId: string) => {
    try {
      const ok = await noirApi.approveEvent(eventId);
      if (ok) {
        setPendingEvents(prev => prev.filter(e => e.id !== eventId));
        onToast?.({ text: 'Salon etkinliği onaylandı ve takvimde canlıya alındı.', type: 'success' });
        if (onEventApproved) onEventApproved();
      } else {
        onToast?.({ text: 'Etkinlik onaylanırken hata oluştu.', type: 'error' });
      }
    } catch (err: any) {
      onToast?.({ text: err?.message || 'İşlem başarısız.', type: 'error' });
    }
  };

  const handleRejectEvent = async (eventId: string) => {
    try {
      const ok = await noirApi.rejectEvent(eventId, rejectReason || undefined);
      if (ok) {
        setPendingEvents(prev => prev.filter(e => e.id !== eventId));
        setRejectingEventId(null);
        setRejectReason('');
        onToast?.({ text: 'Etkinlik başvurusu reddedildi.', type: 'info' });
      } else {
        onToast?.({ text: 'İşlem sırasında hata oluştu.', type: 'error' });
      }
    } catch (err: any) {
      onToast?.({ text: err?.message || 'İşlem başarısız.', type: 'error' });
    }
  };

  const handleReviewApplication = async (appId: string, status: 'approved' | 'rejected') => {
    try {
      const ok = await noirApi.reviewOrganizerApplication(appId, status, reviewerNotes || undefined);
      if (ok) {
        setOrganizerApplications(prev => prev.map(a => a.id === appId ? { ...a, status, reviewerNotes } : a));
        setReviewingAppId(null);
        setReviewerNotes('');
        onToast?.({
          text: status === 'approved' ? 'Küratör yetkisi onaylandı ve üyeye tanımlandı.' : 'Başvuru reddedildi.',
          type: status === 'approved' ? 'success' : 'info'
        });
      } else {
        onToast?.({ text: 'İşlem sırasında hata oluştu.', type: 'error' });
      }
    } catch (err: any) {
      onToast?.({ text: err?.message || 'İşlem başarısız.', type: 'error' });
    }
  };

  const handleCreateVenue = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVenueName.trim() || !newVenueCity.trim()) return;

    try {
      const amenitiesArr = newVenueAmenities.split(',').map(s => s.trim()).filter(Boolean);
      const rulesArr = newVenueRules.split(',').map(s => s.trim()).filter(Boolean);

      const created = await noirApi.createVenue({
        name: newVenueName.trim(),
        slug: newVenueSlug.trim() || newVenueName.toLowerCase().replace(/[^a-z0-9]/g, '-'),
        city: newVenueCity.trim(),
        address: newVenueAddress.trim() || undefined,
        venueType: newVenueType as any,
        capacity: Number(newVenueCapacity) || 50,
        description: newVenueDesc.trim() || `${newVenueCity} merkezinde seçkin özel buluşma mekanı.`,
        coverImage: newVenueCover.trim(),
        photos: [newVenueCover.trim()],
        amenities: amenitiesArr,
        rules: rulesArr,
        isVerified: true,
      });

      if (created) {
        setVenues(prev => [created, ...prev]);
        setIsAddVenueOpen(false);
        setNewVenueName('');
        setNewVenueSlug('');
        setNewVenueAddress('');
        setNewVenueDesc('');
        onToast?.({ text: 'Yeni doğrulanmış mekan sisteme eklendi.', type: 'success' });
      } else {
        onToast?.({ text: 'Mekan eklenirken hata oluştu.', type: 'error' });
      }
    } catch (err: any) {
      onToast?.({ text: err?.message || 'Mekan oluşturulamadı.', type: 'error' });
    }
  };

  const filteredReports = reports.filter(r =>
    selectedReportFilter === 'all' ? true : r.status === selectedReportFilter
  );

  const stats = [
    { label: 'Bekleyen Salon Onayı', value: pendingEvents.length.toString(), change: 'Canlı küratör kuyruğu', icon: Calendar },
    { label: 'Küratör Başvuruları', value: organizerApplications.filter(a => a.status === 'pending').length.toString(), change: 'İncelenmeyi bekleyen', icon: Crown },
    { label: 'Partner Mekanlar', value: venues.length.toString(), change: 'Doğrulanmış mülkler', icon: Building },
    { label: 'Gizlilik Filtre Doğruluğu', value: '99.8%', change: 'Şifreli Optik & NLP', icon: Bot },
  ];

  const systemServices = [
    { name: 'Encrypted Edge Gateway (Kong TLS 1.3)', status: 'Optimal', latency: '4ms', load: '18% Capacity' },
    { name: 'Dossier Ledger (PostgreSQL Isolated Nodes)', status: 'Encrypted', latency: '2ms', load: 'Zero-Leak Shards' },
    { name: 'Ephemeral Memory Pool (Volatile Redis Cluster)', status: 'Optimal', latency: '1ms', load: 'Auto-Purge Ready' },
    { name: 'Private Event Bus (Kafka Confidential Enclave)', status: 'Clear', latency: '3ms', load: '0 Queue Lag' },
    { name: 'Semantic Registry Search (Elastic Cluster)', status: 'Synchronized', latency: '9ms', load: 'Encrypted Index' },
    { name: 'Vision Discretion & NSFW Shield', status: 'Armed', latency: '38ms', load: 'Dedicated Inference GPU' },
  ];

  return (
    <div className="space-y-6 text-[#F1EFEA] max-w-7xl mx-auto pb-24">
      {/* 1. HEADER BANNER */}
      <div className="rounded-2xl bg-[#09090B] p-6 sm:p-8 border border-white/[0.12] shadow-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1A1A1E] border border-[#C5A880]/30 text-[#C5A880] text-xs font-mono uppercase tracking-[0.16em]">
            <ShieldCheck className="w-3.5 h-3.5 text-[#C5A880]" />
            <span>High Curatorship & Society Governance</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif text-[#F1EFEA] tracking-wide font-normal">
            Yüksek Küratör & Yönetim Konsolu
          </h1>
          <p className="text-xs sm:text-sm text-[#9A9996] font-sans max-w-2xl leading-relaxed">
            Yeni salon etkinliklerini denetleyin, organizatör başvurularını inceleyin, doğrulanmış partner mekanları yönetin ve platform standartlarını koruyun.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="bg-[#111113] p-1 rounded-full flex items-center gap-1 border border-white/[0.08] shrink-0 overflow-x-auto no-scrollbar max-w-full">
          <button
            onClick={() => setActiveTab('events')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-serif uppercase tracking-[0.1em] transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'events'
                ? 'bg-[#C5A880] text-[#09090B] font-semibold shadow-sm'
                : 'text-[#9A9996] hover:text-[#F1EFEA]'
            }`}
          >
            <Calendar className="w-3 h-3" />
            <span>Salon Onayları</span>
            {pendingEvents.length > 0 && (
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                activeTab === 'events' ? 'bg-black text-[#C5A880]' : 'bg-[#C5A880] text-black font-bold'
              }`}>
                {pendingEvents.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('organizers')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-serif uppercase tracking-[0.1em] transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'organizers'
                ? 'bg-[#C5A880] text-[#09090B] font-semibold shadow-sm'
                : 'text-[#9A9996] hover:text-[#F1EFEA]'
            }`}
          >
            <Crown className="w-3 h-3" />
            <span>Küratörler</span>
            {organizerApplications.filter(a => a.status === 'pending').length > 0 && (
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                activeTab === 'organizers' ? 'bg-black text-[#C5A880]' : 'bg-[#C5A880] text-black font-bold'
              }`}>
                {organizerApplications.filter(a => a.status === 'pending').length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('venues')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-serif uppercase tracking-[0.1em] transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'venues'
                ? 'bg-[#C5A880] text-[#09090B] font-semibold shadow-sm'
                : 'text-[#9A9996] hover:text-[#F1EFEA]'
            }`}
          >
            <Building className="w-3 h-3" />
            <span>Mekanlar</span>
          </button>

          <button
            onClick={() => setActiveTab('moderation')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-serif uppercase tracking-[0.1em] transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'moderation'
                ? 'bg-[#C5A880] text-[#09090B] font-semibold shadow-sm'
                : 'text-[#9A9996] hover:text-[#F1EFEA]'
            }`}
          >
            <AlertTriangle className="w-3 h-3" />
            <span>Decorum</span>
          </button>

          <button
            onClick={() => setActiveTab('health')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-serif uppercase tracking-[0.1em] transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'health'
                ? 'bg-[#C5A880] text-[#09090B] font-semibold shadow-sm'
                : 'text-[#9A9996] hover:text-[#F1EFEA]'
            }`}
          >
            <Server className="w-3 h-3" />
            <span>Altyapı</span>
          </button>
        </div>
      </div>

      {/* 2. STATS OVERVIEW */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(s => {
          const Icon = s.icon;
          return (
            <div
              key={s.label}
              className="bg-[#09090B] border border-white/[0.08] rounded-2xl p-5 shadow-xs space-y-2.5"
            >
              <div className="flex items-center justify-between text-[#9A9996]">
                <span className="text-xs font-sans">{s.label}</span>
                <Icon className="w-4 h-4 text-[#C5A880]" />
              </div>
              <div className="text-2xl font-serif text-[#F1EFEA] font-light">
                {s.value}
              </div>
              <div className="text-[11px] font-mono text-[#C5A880]">
                {s.change}
              </div>
            </div>
          );
        })}
      </div>

      {/* 3. TAB CONTENT */}

      {/* TAB A: PENDING EVENTS */}
      {activeTab === 'events' && (
        <div className="bg-[#09090B] border border-white/[0.08] rounded-2xl p-6 shadow-xs space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h2 className="text-lg font-serif text-[#F1EFEA] flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#C5A880]" />
                <span>Onay Bekleyen Salon Etkinlikleri</span>
              </h2>
              <p className="text-xs text-[#9A9996] font-sans">
                Üyeler veya organizatörler tarafından oluşturulmuş, henüz yayına alınmamış etkinlikler.
              </p>
            </div>

            <button
              onClick={loadAdminData}
              className="text-xs font-mono text-[#C5A880] hover:underline cursor-pointer"
            >
              Yenile
            </button>
          </div>

          {pendingEvents.length === 0 ? (
            <div className="p-16 text-center rounded-xl bg-[#111113] border border-white/[0.06] space-y-3">
              <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto opacity-70" />
              <h3 className="font-serif text-base text-[#F1EFEA]">Bekleyen Etkinlik Onayı Yok</h3>
              <p className="text-xs text-[#9A9996] max-w-sm mx-auto">
                Tüm salon etkinlikleri incelendi veya canlı yayında. Yeni bir etkinlik oluşturulduğunda bu listeye düşecektir.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingEvents.map(event => (
                <div
                  key={event.id}
                  className="p-5 rounded-xl bg-[#111113] border border-white/[0.08] flex flex-col md:flex-row gap-5 justify-between items-start md:items-center group"
                >
                  <div className="flex items-start gap-4">
                    <img
                      src={event.coverImage}
                      alt={event.title}
                      className="w-20 h-20 rounded-xl object-cover border border-white/[0.08] shrink-0"
                    />
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 text-[11px] font-mono text-[#9A9996]">
                        <span className="text-[#C5A880] uppercase tracking-wider">{event.category}</span>
                        <span>·</span>
                        <span>{event.city}</span>
                        <span>·</span>
                        <span>{new Date(event.startsAt).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })}</span>
                        <span>·</span>
                        <span className="text-[#C5A880]">
                          {event.price === 0 ? 'Serbest' : `${event.price} ${event.currency || 'EUR'}`}
                        </span>
                      </div>

                      <h4 className="font-serif text-lg text-[#F1EFEA] font-light">
                        {event.title}
                      </h4>

                      <p className="text-xs text-[#9A9996] font-sans line-clamp-2 max-w-xl">
                        {event.description}
                      </p>

                      <div className="flex items-center gap-3 pt-1 text-[11px] font-mono text-[#9A9996]">
                        <span>Mekan: <strong className="text-[#F1EFEA]">{event.venue || 'Özel Adres'}</strong></span>
                        <span>·</span>
                        <span>Kapasite: <strong className="text-[#F1EFEA]">{event.capacity} Patron</strong></span>
                        {event.organizer && (
                          <>
                            <span>·</span>
                            <span>Küratör: <strong className="text-[#C5A880]">@{event.organizer.username}</strong></span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2.5 shrink-0 self-end md:self-center pt-2 md:pt-0 border-t md:border-t-0 border-white/[0.06] w-full md:w-auto justify-end">
                    {rejectingEventId === event.id ? (
                      <div className="flex items-center gap-2 w-full md:w-auto">
                        <input
                          type="text"
                          value={rejectReason}
                          onChange={e => setRejectReason(e.target.value)}
                          placeholder="Reddetme sebebi..."
                          className="px-3 py-1.5 rounded-lg bg-[#09090B] border border-white/[0.1] text-xs text-[#F1EFEA] placeholder-[#66666A] focus:outline-none"
                        />
                        <button
                          onClick={() => handleRejectEvent(event.id)}
                          className="px-3 py-1.5 rounded-lg bg-rose-950/80 hover:bg-rose-900 border border-rose-500/30 text-rose-200 text-xs font-serif uppercase tracking-wider cursor-pointer"
                        >
                          Reddet
                        </button>
                        <button
                          onClick={() => setRejectingEventId(null)}
                          className="p-1.5 text-[#9A9996] hover:text-[#F1EFEA]"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <button
                          onClick={() => setRejectingEventId(event.id)}
                          className="px-3.5 py-2 rounded-xl bg-[#1A1A1E] hover:bg-[#222228] text-rose-300 border border-rose-500/20 text-xs font-serif uppercase tracking-wider transition-all cursor-pointer"
                        >
                          Reddet
                        </button>

                        <button
                          onClick={() => handleApproveEvent(event.id)}
                          className="px-4 py-2 rounded-xl bg-[#C5A880] hover:bg-[#B89B6E] text-[#09090B] text-xs font-serif uppercase tracking-wider font-semibold transition-all cursor-pointer shadow-md active:scale-95 flex items-center gap-1.5"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 stroke-[2.5]" />
                          <span>Onayla & Canlıya Al</span>
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB B: ORGANIZER APPLICATIONS */}
      {activeTab === 'organizers' && (
        <div className="bg-[#09090B] border border-white/[0.08] rounded-2xl p-6 shadow-xs space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h2 className="text-lg font-serif text-[#F1EFEA] flex items-center gap-2">
                <Crown className="w-4 h-4 text-[#C5A880]" />
                <span>Küratör & Organizatör Başvuruları</span>
              </h2>
              <p className="text-xs text-[#9A9996] font-sans">
                Özel salonlar ve buluşmalar organize etmek isteyen patron adaylarının portfolyoları ve niyet mektupları.
              </p>
            </div>

            <button
              onClick={loadAdminData}
              className="text-xs font-mono text-[#C5A880] hover:underline cursor-pointer"
            >
              Yenile
            </button>
          </div>

          {organizerApplications.length === 0 ? (
            <div className="p-16 text-center rounded-xl bg-[#111113] border border-white/[0.06] space-y-3">
              <Crown className="w-10 h-10 text-[#C5A880] mx-auto opacity-50" />
              <h3 className="font-serif text-base text-[#F1EFEA]">Kayıtlı Başvuru Bulunmuyor</h3>
              <p className="text-xs text-[#9A9996] max-w-sm mx-auto">
                Yeni bir üye organizatörlük başvurusu gönderdiğinde bu ekranda onayınıza sunulacaktır.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {organizerApplications.map(app => (
                <div
                  key={app.id}
                  className="p-5 rounded-xl bg-[#111113] border border-white/[0.08] space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/[0.06]">
                    <div className="flex items-center gap-3">
                      {app.user?.avatar ? (
                        <img
                          src={app.user.avatar}
                          alt={app.user.name}
                          className="w-10 h-10 rounded-full object-cover border border-[#C5A880]/40"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-[#1A1A1E] text-[#C5A880] flex items-center justify-center font-serif">
                          {app.user?.name?.[0] || 'U'}
                        </div>
                      )}
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-serif text-base text-[#F1EFEA]">{app.user?.name || 'Patron'}</span>
                          <span className="text-xs font-mono text-[#9A9996]">@{app.user?.username}</span>
                          {app.user?.isVerified && (
                            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-500/20">
                              Onaylı Profil
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] font-mono text-[#66666A]">
                          Başvuru: {new Date(app.createdAt).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-mono uppercase tracking-wider border ${
                        app.status === 'approved'
                          ? 'bg-emerald-950/50 text-emerald-300 border-emerald-500/30'
                          : app.status === 'rejected'
                          ? 'bg-rose-950/50 text-rose-300 border-rose-500/30'
                          : 'bg-[#1A1A1E] text-[#C5A880] border-[#C5A880]/30'
                      }`}>
                        {app.status === 'approved' ? 'Onaylandı' : app.status === 'rejected' ? 'Reddedildi' : 'İnceleme Bekliyor'}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-sans">
                    <div className="p-3.5 rounded-lg bg-[#09090B] border border-white/[0.04] space-y-1">
                      <span className="text-[10px] font-mono text-[#C5A880] uppercase tracking-wider block">
                        Deneyim & Geçmiş
                      </span>
                      <p className="text-[#9A9996] leading-relaxed whitespace-pre-wrap">
                        {app.experience}
                      </p>
                    </div>

                    <div className="p-3.5 rounded-lg bg-[#09090B] border border-white/[0.04] space-y-1">
                      <span className="text-[10px] font-mono text-[#C5A880] uppercase tracking-wider block">
                        Planlanan Salon Konseptleri
                      </span>
                      <p className="text-[#9A9996] leading-relaxed whitespace-pre-wrap">
                        {app.intendedEvents}
                      </p>
                    </div>
                  </div>

                  {app.socialLinks && (
                    <div className="text-xs font-mono text-[#9A9996] flex items-center gap-2">
                      <span className="text-[#C5A880]">Referanslar:</span>
                      <span>{app.socialLinks}</span>
                    </div>
                  )}

                  {/* Actions */}
                  {app.status === 'pending' && (
                    <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-white/[0.06]">
                      <button
                        onClick={() => handleReviewApplication(app.id, 'rejected')}
                        className="px-3.5 py-1.5 rounded-xl bg-[#1A1A1E] hover:bg-[#222228] text-rose-300 border border-rose-500/20 text-xs font-serif uppercase tracking-wider transition-all cursor-pointer"
                      >
                        Reddet
                      </button>
                      <button
                        onClick={() => handleReviewApplication(app.id, 'approved')}
                        className="px-4 py-1.5 rounded-xl bg-[#C5A880] hover:bg-[#B89B6E] text-[#09090B] text-xs font-serif uppercase tracking-wider font-semibold transition-all cursor-pointer shadow-md active:scale-95 flex items-center gap-1.5"
                      >
                        <Crown className="w-3.5 h-3.5" />
                        <span>Küratör Olarak Onayla</span>
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB C: VENUES MANAGEMENT */}
      {activeTab === 'venues' && (
        <div className="bg-[#09090B] border border-white/[0.08] rounded-2xl p-6 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <h2 className="text-lg font-serif text-[#F1EFEA] flex items-center gap-2">
                <Building className="w-4 h-4 text-[#C5A880]" />
                <span>Partner Mekanlar & Malikane Envanteri</span>
              </h2>
              <p className="text-xs text-[#9A9996] font-sans">
                Etkinliklerin güvenle ve gizlilik kurallarına uygun gerçekleştirileceği doğrulanmış alanlar.
              </p>
            </div>

            <button
              onClick={() => setIsAddVenueOpen(!isAddVenueOpen)}
              className="px-4 py-2 rounded-xl bg-[#C5A880] hover:bg-[#B89B6E] text-[#09090B] text-xs font-serif uppercase tracking-wider font-semibold transition-all cursor-pointer shadow-md flex items-center gap-2 self-start sm:self-auto"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>{isAddVenueOpen ? 'İptal' : 'Yeni Mekan Ekle'}</span>
            </button>
          </div>

          {/* Add Venue Drawer */}
          {isAddVenueOpen && (
            <form onSubmit={handleCreateVenue} className="p-5 rounded-xl bg-[#111113] border border-[#C5A880]/30 space-y-4">
              <h3 className="font-serif text-base text-[#F1EFEA] flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#C5A880]" />
                <span>Yeni Doğrulanmış Mekan Kaydı</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs font-sans">
                <div className="space-y-1">
                  <label className="text-[11px] font-mono text-[#9A9996]">Mekan Adı</label>
                  <input
                    type="text"
                    required
                    value={newVenueName}
                    onChange={e => setNewVenueName(e.target.value)}
                    placeholder="Örn: Maison de L'Ombre"
                    className="w-full px-3 py-2 rounded-lg bg-[#09090B] border border-white/[0.08] text-[#F1EFEA] focus:outline-none focus:border-[#C5A880]/50"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-mono text-[#9A9996]">Şehir</label>
                  <input
                    type="text"
                    required
                    value={newVenueCity}
                    onChange={e => setNewVenueCity(e.target.value)}
                    placeholder="Örn: Amsterdam"
                    className="w-full px-3 py-2 rounded-lg bg-[#09090B] border border-white/[0.08] text-[#F1EFEA] focus:outline-none focus:border-[#C5A880]/50"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-mono text-[#9A9996]">Mekan Tipi</label>
                  <select
                    value={newVenueType}
                    onChange={e => setNewVenueType(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-[#09090B] border border-white/[0.08] text-[#F1EFEA] focus:outline-none font-serif"
                  >
                    <option value="villa">Özel Malikane & Villa</option>
                    <option value="club">Gizli Kulüp & Lounge</option>
                    <option value="suite">Yalı & Çatı Süiti</option>
                    <option value="bunker">Endüstriyel Bunker</option>
                    <option value="hotel">Şato & Butik Otel</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-mono text-[#9A9996]">Kapasite (Kişi)</label>
                  <input
                    type="number"
                    value={newVenueCapacity}
                    onChange={e => setNewVenueCapacity(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg bg-[#09090B] border border-white/[0.08] text-[#F1EFEA] focus:outline-none"
                  />
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <label className="text-[11px] font-mono text-[#9A9996]">Kapak Fotoğrafı URL</label>
                  <input
                    type="url"
                    value={newVenueCover}
                    onChange={e => setNewVenueCover(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full px-3 py-2 rounded-lg bg-[#09090B] border border-white/[0.08] text-[#F1EFEA] focus:outline-none"
                  />
                </div>

                <div className="space-y-1 sm:col-span-3">
                  <label className="text-[11px] font-mono text-[#9A9996]">Açıklama</label>
                  <textarea
                    rows={2}
                    value={newVenueDesc}
                    onChange={e => setNewVenueDesc(e.target.value)}
                    placeholder="Mekanın atmosferi, olanakları ve gizlilik seviyesi..."
                    className="w-full px-3 py-2 rounded-lg bg-[#09090B] border border-white/[0.08] text-[#F1EFEA] focus:outline-none"
                  />
                </div>

                <div className="space-y-1 sm:col-span-3">
                  <label className="text-[11px] font-mono text-[#9A9996]">Olanaklar (Virgülle ayırın)</label>
                  <input
                    type="text"
                    value={newVenueAmenities}
                    onChange={e => setNewVenueAmenities(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-[#09090B] border border-white/[0.08] text-[#F1EFEA] focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddVenueOpen(false)}
                  className="px-4 py-2 rounded-xl bg-[#1A1A1E] text-[#9A9996] text-xs font-serif uppercase cursor-pointer"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#C5A880] text-[#09090B] text-xs font-serif uppercase font-semibold cursor-pointer shadow-md"
                >
                  Mekanı Kaydet
                </button>
              </div>
            </form>
          )}

          {/* Venues Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {venues.map(v => (
              <div
                key={v.id}
                className="p-4 rounded-xl bg-[#111113] border border-white/[0.08] space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="relative aspect-[16/10] rounded-lg overflow-hidden bg-[#09090B]">
                    <img
                      src={v.coverImage}
                      alt={v.name}
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute top-2 left-2 px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-black/70 text-[#C5A880]">
                      {v.venueType}
                    </span>
                    {v.isVerified && (
                      <span className="absolute top-2 right-2 px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-950/80 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                        <CheckCircle2 className="w-2.5 h-2.5" /> Doğrulandı
                      </span>
                    )}
                  </div>

                  <h4 className="font-serif text-base text-[#F1EFEA] font-light">
                    {v.name}
                  </h4>
                  <p className="text-xs text-[#9A9996] font-sans line-clamp-2">
                    {v.description}
                  </p>
                </div>

                <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between text-[11px] font-mono text-[#9A9996]">
                  <span className="flex items-center gap-1 text-[#F1EFEA]">
                    <MapPin className="w-3 h-3 text-[#C5A880]" />
                    {v.city}
                  </span>
                  <span>Max {v.capacity || 50} Kişi</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB D: DECORUM MODERATION */}
      {activeTab === 'moderation' && (
        <div className="bg-[#09090B] border border-white/[0.08] rounded-2xl p-6 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-serif text-[#F1EFEA] flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-[#C5A880]" />
                <span>Bekleyen Decorum & Gizlilik Denetimleri</span>
              </h2>
              <p className="text-xs text-[#9A9996] font-sans mt-0.5">
                Üyeler tarafından bildirilen veya otomatik gizlilik filtrelerine takılan olaylar.
              </p>
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-1 bg-[#111113] p-1 rounded-full border border-white/[0.06] text-xs">
              {(['all', 'pending', 'action_taken', 'dismissed'] as const).map(f => (
                <button
                  key={f}
                  onClick={() => setSelectedReportFilter(f)}
                  className={`px-3 py-1 rounded-full font-serif uppercase tracking-[0.1em] text-[11px] transition-all cursor-pointer ${
                    selectedReportFilter === f
                      ? 'bg-[#1A1A1E] text-[#C5A880] border border-[#C5A880]/30 shadow-xs'
                      : 'text-[#9A9996] hover:text-[#F1EFEA]'
                  }`}
                >
                  {f === 'all' && 'Tümü'}
                  {f === 'pending' && 'Bekleyen'}
                  {f === 'action_taken' && 'Yaptırım'}
                  {f === 'dismissed' && 'Af'}
                </button>
              ))}
            </div>
          </div>

          {filteredReports.length === 0 ? (
            <div className="p-12 text-center rounded-xl bg-[#111113] border border-white/[0.06] space-y-2">
              <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto opacity-70" />
              <p className="font-serif text-sm text-[#F1EFEA]">Şikayet kuyruğu temiz.</p>
              <p className="text-xs text-[#9A9996]">İnceleme bekleyen kural ihlali bulunmuyor.</p>
            </div>
          ) : (
            <div className="space-y-3.5 divide-y divide-white/[0.06]">
              {filteredReports.map(report => (
                <div key={report.id} className="pt-4 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <span className="px-2.5 py-0.5 rounded-full bg-[#1A1A1E] text-[#C5A880] border border-[#C5A880]/30 font-mono text-[11px]">
                        {report.reason}
                      </span>
                      <span className="font-serif text-sm text-[#F1EFEA]">
                        {report.targetTitle}
                      </span>
                      <span className="text-xs text-[#66666A] font-mono">
                        (@{report.reporterName})
                      </span>
                    </div>

                    <div className="flex items-center gap-2.5">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-mono border flex items-center gap-1.5 ${
                        report.aiRiskScore > 90
                          ? 'bg-rose-950/40 text-rose-300 border-rose-500/30'
                          : 'bg-[#1A1A1E] text-[#C5A880] border-[#C5A880]/30'
                      }`}>
                        <Bot className="w-3.5 h-3.5" />
                        <span>Güven: {report.aiRiskScore}%</span>
                      </span>
                      <span className="text-[11px] text-[#66666A] font-mono">{report.createdAt}</span>
                    </div>
                  </div>

                  <div className="bg-[#111113] p-3.5 rounded-xl space-y-1.5 text-xs text-[#9A9996] border border-white/[0.06] font-sans">
                    <p><strong className="text-[#F1EFEA]">Üye Bildirimi:</strong> {report.description}</p>
                    <p className="text-[#C5A880]">
                      <strong>Küratöryel Filtre Analizi:</strong> {report.aiFlagReason}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-1">
                    <div>
                      {report.status === 'pending' && (
                        <span className="text-[11px] text-[#C5A880] font-mono flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5" />
                          Küratör Kararı Bekleniyor
                        </span>
                      )}
                      {report.status === 'action_taken' && (
                        <span className="text-[11px] text-emerald-400 font-mono flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Yetkiler Askıya Alındı / İçerik İzolasyonu
                        </span>
                      )}
                      {report.status === 'dismissed' && (
                        <span className="text-[11px] text-[#66666A] font-mono flex items-center gap-1.5">
                          <X className="w-3.5 h-3.5" />
                          Şikayet Hükümsüz Sayıldı
                        </span>
                      )}
                    </div>

                    {report.status === 'pending' && (
                      <div className="flex items-center gap-2">
                        {onTakeAction && (
                          <button
                            onClick={() => onTakeAction(report.id, 'ban')}
                            className="px-3.5 py-1.5 rounded-full text-xs font-serif uppercase tracking-[0.1em] bg-rose-950/60 hover:bg-rose-900 border border-rose-500/30 text-rose-200 transition-colors flex items-center gap-1.5 cursor-pointer"
                          >
                            <Ban className="w-3 h-3" />
                            <span>İhraç Et / Engelle</span>
                          </button>
                        )}
                        {onDismissReport && (
                          <button
                            onClick={() => onDismissReport(report.id)}
                            className="px-3.5 py-1.5 rounded-full text-xs font-serif uppercase tracking-[0.1em] bg-[#1A1A1E] border border-white/10 hover:border-white/20 text-[#9A9996] hover:text-[#F1EFEA] transition-colors cursor-pointer"
                          >
                            Yoksay (Af)
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB E: HEALTH MONITOR */}
      {activeTab === 'health' && (
        <div className="bg-[#09090B] border border-white/[0.08] rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-serif text-[#F1EFEA] flex items-center gap-2">
              <Server className="w-4 h-4 text-[#C5A880]" />
              <span>Gizlilik & Mikroservis Sağlık Matrisi (Zero-Log Mesh)</span>
            </h2>
            <span className="text-xs text-[#C5A880] font-mono bg-[#1A1A1E] px-3 py-1 rounded-full border border-[#C5A880]/30">
              99.99% Availability
            </span>
          </div>

          <div className="space-y-2.5">
            {systemServices.map(srv => (
              <div
                key={srv.name}
                className="p-3.5 rounded-xl bg-[#111113] border border-white/[0.06] flex items-center justify-between text-xs"
              >
                <div className="space-y-0.5">
                  <div className="font-serif text-[#F1EFEA]">
                    {srv.name}
                  </div>
                  <div className="text-[11px] text-[#9A9996] font-mono">
                    {srv.load}
                  </div>
                </div>

                <div className="flex items-center gap-4 text-right">
                  <span className="text-[11px] text-[#9A9996] font-mono">
                    {srv.latency}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-mono text-[10px] flex items-center gap-1.5 border border-emerald-500/20">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    {srv.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
