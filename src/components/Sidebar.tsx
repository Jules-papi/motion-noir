import React from 'react';
import {
  Home,
  BookOpen,
  Compass,
  MessageSquare,
  ShieldCheck,
  Plus,
  KeyRound,
  FileText,
  LogOut,
  SlidersHorizontal,
  Flame,
  Lock,
  Calendar
} from 'lucide-react';
import { UserProfile } from '../types';
import { useLanguage } from '../i18n/LanguageContext';

export type ActiveViewType = 'home' | 'feed' | 'profile' | 'chat' | 'discovery' | 'events' | 'admin';

interface SidebarProps {
  currentView: ActiveViewType;
  onNavigate: (view: ActiveViewType) => void;
  currentUser: UserProfile;
  unreadChatCount?: number;
  onOpenCreatePost: () => void;
  onOpenAuth?: () => void;
  onLogout?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onNavigate,
  currentUser,
  unreadChatCount = 0,
  onOpenCreatePost,
  onOpenAuth,
  onLogout,
}) => {
  const { t } = useLanguage();
  const navItems = [
    {
      id: 'home' as const,
      label: t('nav.portal'),
      sub: 'Topluluk Rehberi',
      icon: Home
    },
    {
      id: 'feed' as const,
      label: t('nav.feed'),
      sub: 'Topluluk Akışı',
      icon: BookOpen
    },
    {
      id: 'discovery' as const,
      label: t('nav.registry'),
      sub: 'Üye Kataloğu',
      icon: Compass
    },
    {
      id: 'chat' as const,
      label: t('nav.chat'),
      sub: 'Şifreli Salonlar',
      icon: MessageSquare,
      badge: unreadChatCount
    },
    {
      id: 'profile' as const,
      label: t('nav.profile'),
      sub: 'Profil & Tercihler',
      icon: KeyRound
    },
  ];

  // If on home landing page, desktop sidebar is hidden for majestic full-width layout
  if (currentView === 'home') {
    return (
      <nav
        aria-label="Mobile Navigation"
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#09090B]/95 backdrop-blur-2xl border-t border-white/[0.08] px-3 pt-2 pb-[max(0.75rem,env(safe-area-inset-bottom))] flex items-center justify-around shadow-2xl"
      >
        <button
          onClick={() => onNavigate('home')}
          className="flex-1 flex flex-col items-center justify-center py-1 gap-1 text-[10px] font-sans text-[#F1EFEA] font-medium cursor-pointer"
        >
          <Home className="w-4 h-4 stroke-[1.75]" />
          <span className="truncate">{t('nav.portal')}</span>
          <span className="w-1 h-1 rounded-full bg-[#C5A880] mt-0.5" />
        </button>

        <button
          onClick={() => onNavigate('discovery')}
          className="flex-1 flex flex-col items-center justify-center py-1 gap-1 text-[10px] font-sans text-[#9A9996] hover:text-[#F1EFEA] cursor-pointer"
        >
          <Compass className="w-4 h-4 stroke-[1.75]" />
          <span className="truncate">{t('nav.members')}</span>
        </button>

        <button
          onClick={() => onNavigate('feed')}
          className="flex-1 flex flex-col items-center justify-center py-1 gap-1 text-[10px] font-sans text-[#9A9996] hover:text-[#F1EFEA] cursor-pointer"
        >
          <BookOpen className="w-4 h-4 stroke-[1.75]" />
          <span className="truncate">{t('nav.feed')}</span>
        </button>

        <button
          onClick={() => onNavigate('chat')}
          className="flex-1 flex flex-col items-center justify-center py-1 gap-1 text-[10px] font-sans text-[#9A9996] hover:text-[#F1EFEA] cursor-pointer"
        >
          <MessageSquare className="w-4 h-4 stroke-[1.75]" />
          <span className="truncate">{t('nav.salons')}</span>
        </button>

        <button
          onClick={onOpenAuth}
          className="flex-1 flex flex-col items-center justify-center py-1 gap-1 text-[10px] font-sans text-[#C5A880] cursor-pointer"
        >
          <KeyRound className="w-4 h-4 stroke-[1.75]" />
          <span className="truncate">{t('nav.login')}</span>
        </button>
      </nav>
    );
  }

  return (
    <>
      {/* ========================================================
          DESKTOP EDITORIAL SIDEBAR (LEFT) - PAGE SPECIFIC IDENTITY
          ======================================================== */}
      <aside className={`${currentView === 'chat' ? 'hidden' : 'hidden md:flex'} flex-col justify-between w-64 lg:w-72 shrink-0 h-screen sticky top-0 px-5 lg:px-6 py-6 border-r border-white/[0.08] bg-[#09090B] overflow-y-auto no-scrollbar`}>
        <div className="space-y-6">
          {/* PAGE CONTEXT & SECTION HEADER */}
          <div className="px-1 py-1">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#C5A880]" />
              <span className="text-[10px] font-mono tracking-[0.25em] text-[#C5A880] uppercase font-semibold">
                {currentView === 'feed' && t('nav.feed')}
                {currentView === 'discovery' && t('nav.registry')}
                {currentView === 'events' && (t('nav.events') || 'Etkinlikler & Takvim')}
                {currentView === 'chat' && t('nav.chat')}
                {currentView === 'profile' && t('nav.profile')}
                {currentView === 'admin' && 'Yüksek Küratörlük Konsolu'}
              </span>
            </div>
            <p className="text-xs text-[#9A9996] mt-1.5 font-sans leading-relaxed">
              {currentView === 'feed' && t('side.feedContext')}
              {currentView === 'discovery' && t('side.registryContext')}
              {currentView === 'events' && (t('side.eventsContext') || 'Seçkin buluşmalar, özel salonlar ve ajanda.')}
              {currentView === 'chat' && t('side.chatContext')}
              {currentView === 'profile' && t('side.profileContext')}
              {currentView === 'admin' && 'Etkinlik onayları, organizatör başvuruları ve mekan denetimi.'}
            </p>
          </div>

          <div className="h-px bg-white/[0.06]" />

          {/* PAGE-SPECIFIC IDENTITY MODULE */}
          {currentView === 'feed' && (
            <div className="pt-2 border-t border-white/[0.06] space-y-3">
              <span className="px-3 text-[9px] font-mono tracking-[0.25em] text-[#9A9996] uppercase block">
                {t('side.feedChannels')}
              </span>
              <div className="space-y-1 text-xs">
                <div className="w-full text-left px-3 py-1.5 rounded-lg text-[#F1EFEA] bg-white/[0.04] font-medium flex items-center justify-between">
                  <span>{t('side.allPosts')}</span>
                  <Flame className="w-3.5 h-3.5 text-[#C5A880]" />
                </div>
              </div>
            </div>
          )}

          {currentView === 'discovery' && (
            <div className="pt-2 border-t border-white/[0.06] space-y-3">
              <span className="px-3 text-[9px] font-mono tracking-[0.25em] text-[#C5A880] uppercase block flex items-center gap-1.5">
                <SlidersHorizontal className="w-3 h-3" />
                <span>{t('side.filters')}</span>
              </span>
              <div className="px-3 space-y-2 text-xs text-[#9A9996]">
                <div className="p-2.5 rounded-lg bg-[#111113] border border-white/[0.06] space-y-1.5">
                  <span className="text-[10px] text-[#9A9996] font-mono uppercase block">{t('side.priority')}</span>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="px-2 py-0.5 rounded-md bg-[#1A1A1E] text-[#C5A880] text-[10px] border border-[#C5A880]/30 font-medium">{t('side.women')}</span>
                    <span className="px-2 py-0.5 rounded-md bg-[#1A1A1E] text-[#F1EFEA] text-[10px] border border-white/10">{t('side.couples')}</span>
                    <span className="px-2 py-0.5 rounded-md bg-[#1A1A1E] text-[#F1EFEA] text-[10px] border border-white/10">Swinger</span>
                  </div>
                </div>
                <div className="p-2.5 rounded-lg bg-[#111113] border border-white/[0.06] space-y-1">
                  <span className="text-[10px] text-[#9A9996] font-mono uppercase block">{t('side.regions')}</span>
                  <p className="text-[11px] text-[#9A9996]">Amsterdam · Paris · Rotterdam · Londra</p>
                </div>
              </div>
            </div>
          )}

          {currentView === 'profile' && (
            <div className="pt-2 border-t border-white/[0.06] space-y-3">
              <span className="px-3 text-[9px] font-mono tracking-[0.25em] text-[#C5A880] uppercase block">
                {t('side.profileShortcuts')}
              </span>
              <div className="px-3 space-y-1 text-xs text-[#9A9996]">
                <div className="flex items-center gap-2 py-1 text-[#F1EFEA]">
                  <FileText className="w-3.5 h-3.5 text-[#C5A880]" />
                  <span>{t('side.summary')}</span>
                </div>
                <div className="flex items-center gap-2 py-1 text-[#F1EFEA]">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{t('side.verifiedStatus')}</span>
                </div>
              </div>
            </div>
          )}

          {currentView === 'events' && (
            <div className="pt-2 border-t border-white/[0.06] space-y-3">
              <span className="px-3 text-[9px] font-mono tracking-[0.25em] text-[#C5A880] uppercase block">
                Salon Protokolü
              </span>
              <div className="px-3 space-y-2 text-xs text-[#9A9996]">
                <div className="p-2.5 rounded-lg bg-[#111113] border border-white/[0.06] space-y-1.5">
                  <div className="flex items-center gap-2 text-[#F1EFEA]">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Şifreli NDA Zorunlu</span>
                  </div>
                  <p className="text-[10px] text-[#9A9996]">Kameralar girişte mühürlenir, davetliler anonim kalır.</p>
                </div>
              </div>
            </div>
          )}

          {currentView === 'admin' && (
            <div className="pt-2 border-t border-white/[0.06] space-y-3">
              <span className="px-3 text-[9px] font-mono tracking-[0.25em] text-[#C5A880] uppercase block">
                Yüksek Küratörlük
              </span>
              <div className="px-3 space-y-2 text-xs text-[#9A9996]">
                <div className="p-2.5 rounded-lg bg-[#111113] border border-[#C5A880]/20 space-y-1">
                  <span className="text-[10px] text-[#C5A880] font-mono uppercase block">Yetki Seviyesi</span>
                  <p className="text-[11px] text-[#F1EFEA]">Society Governance / Admin</p>
                </div>
              </div>
            </div>
          )}

          {currentView === 'chat' && (
            <div className="pt-2 border-t border-white/[0.06] space-y-3">
              <span className="px-3 text-[9px] font-mono tracking-[0.25em] text-[#9A9996] uppercase block">
                {t('side.chatChannels')}
              </span>
              <div className="px-3 space-y-1.5 text-xs text-[#9A9996]">
                <div className="flex items-center justify-between py-1 border-b border-white/[0.04]">
                  <span className="text-[#F1EFEA]">{t('side.direct')}</span>
                  <span className="text-[10px] font-mono text-[#C5A880]">{t('side.encrypted')}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Bottom User & Membership Section */}
        <div className="space-y-3 pt-5 border-t border-white/[0.06]">
          {/* Quick Dispatch Composer Button */}
          <button
            onClick={onOpenCreatePost}
            className="w-full py-2 px-4 rounded-lg text-xs font-sans font-medium bg-[#111113] hover:bg-[#1A1A1E] text-[#F1EFEA] border border-white/[0.08] hover:border-white/20 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
          >
            <Plus className="w-3.5 h-3.5 text-[#F1EFEA]" />
            <span>{t('nav.compose')}</span>
          </button>

          {/* Member Card Summary / Guest Admission */}
          {currentUser.isGuest ? (
            <button
              onClick={onOpenAuth}
              className="w-full p-2.5 rounded-lg bg-[#111113] border border-white/[0.08] hover:border-[#C5A880]/40 text-[#F1EFEA] flex items-center justify-between transition-all cursor-pointer shadow-xs group"
            >
              <div className="flex items-center gap-2.5">
                <KeyRound className="w-4 h-4 text-[#C5A880]" />
                <div className="text-left">
                  <div className="font-sans text-xs font-medium text-[#F1EFEA] group-hover:text-[#C5A880] transition-colors">
                    {t('side.membership')}
                  </div>
                  <div className="text-[10px] text-[#9A9996] font-sans">
                    {t('nav.loginJoin')}
                  </div>
                </div>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-white/[0.06] text-[#F1EFEA] border border-white/[0.08]">
                {t('side.join')}
              </span>
            </button>
          ) : (
            <div className="p-2.5 rounded-lg bg-[#111113] border border-white/[0.08] flex items-center justify-between transition-colors">
              <div
                onClick={() => onNavigate('profile')}
                className="flex items-center gap-2.5 min-w-0 flex-1 cursor-pointer"
              >
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-7 h-7 rounded-full object-cover border border-white/15 shrink-0"
                />
                <div className="min-w-0">
                  <div className="font-sans text-xs font-medium text-[#F1EFEA] truncate">
                    {currentUser.name}
                  </div>
                  <div className="text-[10px] font-mono text-[#9A9996] truncate">
                    @{currentUser.username}
                  </div>
                </div>
              </div>
              {onLogout && (
                <button
                  onClick={onLogout}
                  title="Çıkış Yap"
                  className="p-1.5 text-[#9A9996] hover:text-rose-400 hover:bg-rose-500/10 rounded-md transition-colors cursor-pointer shrink-0 ml-1"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          )}
        </div>
      </aside>

      {/* ========================================================
          MOBILE EDITORIAL BOTTOM NAVIGATION DOCK
          Pristine, responsive, zero-overflow neo-mobile dock
          ======================================================== */}
      <nav
        aria-label="Mobile Navigation"
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#09090B]/95 backdrop-blur-2xl border-t border-white/[0.08] px-3 pt-2 pb-[max(0.75rem,env(safe-area-inset-bottom))] flex items-center justify-around shadow-2xl"
      >
        <button
          onClick={() => onNavigate('feed')}
          className={`flex-1 flex flex-col items-center justify-center py-1 gap-1 text-[10px] font-sans transition-colors cursor-pointer ${
            currentView === 'feed' ? 'text-[#F1EFEA] font-medium' : 'text-[#9A9996] hover:text-[#F1EFEA]'
          }`}
        >
          <BookOpen className="w-4 h-4 stroke-[1.75]" />
          <span className="truncate">{t('nav.feed')}</span>
          {currentView === 'feed' && (
            <span className="w-1 h-1 rounded-full bg-[#C5A880] mt-0.5" />
          )}
        </button>

        <button
          onClick={() => onNavigate('discovery')}
          className={`flex-1 flex flex-col items-center justify-center py-1 gap-1 text-[10px] font-sans transition-colors cursor-pointer ${
            currentView === 'discovery' ? 'text-[#F1EFEA] font-medium' : 'text-[#9A9996] hover:text-[#F1EFEA]'
          }`}
        >
          <Compass className="w-4 h-4 stroke-[1.75]" />
          <span className="truncate">{t('nav.registry')}</span>
          {currentView === 'discovery' && (
            <span className="w-1 h-1 rounded-full bg-[#C5A880] mt-0.5" />
          )}
        </button>

        <button
          onClick={() => onNavigate('events')}
          className={`flex-1 flex flex-col items-center justify-center py-1 gap-1 text-[10px] font-sans transition-colors cursor-pointer ${
            currentView === 'events' ? 'text-[#F1EFEA] font-medium' : 'text-[#9A9996] hover:text-[#F1EFEA]'
          }`}
        >
          <Calendar className="w-4 h-4 stroke-[1.75]" />
          <span className="truncate">{t('nav.events') || 'Salonlar'}</span>
          {currentView === 'events' && (
            <span className="w-1 h-1 rounded-full bg-[#C5A880] mt-0.5" />
          )}
        </button>

        {/* Center Dispatch Action Button */}
        <div className="px-1 shrink-0">
          <button
            onClick={onOpenCreatePost}
            className="w-9 h-9 rounded-full bg-[#F1EFEA] text-[#09090B] flex items-center justify-center active:scale-95 transition-transform cursor-pointer shadow-md"
            aria-label="New Dispatch"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>

        <button
          onClick={() => onNavigate('chat')}
          className={`flex-1 flex flex-col items-center justify-center py-1 gap-1 text-[10px] font-sans transition-colors cursor-pointer relative ${
            currentView === 'chat' ? 'text-[#F1EFEA] font-medium' : 'text-[#9A9996] hover:text-[#F1EFEA]'
          }`}
        >
          <MessageSquare className="w-4 h-4 stroke-[1.75]" />
          <span className="truncate">{t('nav.chat')}</span>
          {Boolean(unreadChatCount && unreadChatCount > 0) && (
            <span className="absolute top-1 right-3 w-1.5 h-1.5 rounded-full bg-[#C5A880]" />
          )}
          {currentView === 'chat' && (
            <span className="w-1 h-1 rounded-full bg-[#C5A880] mt-0.5" />
          )}
        </button>

        <button
          onClick={() => onNavigate('profile')}
          className={`flex-1 flex flex-col items-center justify-center py-1 gap-1 text-[10px] font-sans transition-colors cursor-pointer ${
            currentView === 'profile' ? 'text-[#F1EFEA] font-medium' : 'text-[#9A9996] hover:text-[#F1EFEA]'
          }`}
        >
          <KeyRound className="w-4 h-4 stroke-[1.75]" />
          <span className="truncate">{t('nav.profile')}</span>
          {currentView === 'profile' && (
            <span className="w-1 h-1 rounded-full bg-[#C5A880] mt-0.5" />
          )}
        </button>
      </nav>
    </>
  );
};
