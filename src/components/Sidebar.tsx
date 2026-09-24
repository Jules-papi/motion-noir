import React from 'react';
import { 
  Home,
  BookOpen, 
  Compass, 
  MessageSquare, 
  CalendarDays, 
  Users, 
  ShieldCheck, 
  Plus, 
  Crown, 
  KeyRound, 
  FileText,
  LogOut,
  SlidersHorizontal,
  Flame,
  CheckCircle2,
  Lock,
  Sparkles
} from 'lucide-react';
import { UserProfile } from '../types';
import { SupportedCurrency, SupportedLanguage } from '../types/anlatiTypes';

export type ActiveViewType = 'home' | 'feed' | 'profile' | 'chat' | 'discovery';

interface SidebarProps {
  currentView: ActiveViewType;
  onNavigate: (view: ActiveViewType) => void;
  currentUser: UserProfile;
  walletBalance: number;
  isUserSubscribed: boolean;
  unreadChatCount?: number;
  language?: SupportedLanguage;
  currency?: SupportedCurrency;
  onOpenWallet: () => void;
  onOpenCreatePost: () => void;
  onOpenMembershipModal: () => void;
  onOpenKYCModal?: () => void;
  onOpenVisitorsModal?: () => void;
  onOpenPayoutModal?: () => void;
  onOpenAuth?: () => void;
  onLogout?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onNavigate,
  currentUser,
  walletBalance,
  isUserSubscribed,
  unreadChatCount = 0,
  onOpenWallet,
  onOpenCreatePost,
  onOpenMembershipModal,
  onOpenAuth,
  onLogout,
}) => {
  const navItems = [
    { 
      id: 'home' as const, 
      label: 'Giriş / Portal', 
      sub: 'Topluluk Rehberi',
      icon: Home 
    },
    { 
      id: 'feed' as const, 
      label: 'The Gazette', 
      sub: 'Topluluk Akışı',
      icon: BookOpen 
    },
    { 
      id: 'discovery' as const, 
      label: 'The Registry', 
      sub: 'Üye Kataloğu',
      icon: Compass 
    },
    { 
      id: 'chat' as const, 
      label: 'Dispatches', 
      sub: 'Şifreli Salonlar',
      icon: MessageSquare, 
      badge: unreadChatCount 
    },
    { 
      id: 'profile' as const, 
      label: 'Member Dossier', 
      sub: 'Profil & Tercihler',
      icon: KeyRound 
    },
  ];

  // If on home landing page, desktop sidebar is hidden for majestic full-width layout
  if (currentView === 'home') {
    return (
      <nav 
        aria-label="Mobile Navigation"
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#07080A]/95 backdrop-blur-2xl border-t border-white/[0.08] px-2 py-1.5 flex items-center justify-around shadow-2xl"
      >
        <button
          onClick={() => onNavigate('home')}
          className="flex-1 flex flex-col items-center justify-center py-1 gap-1 text-[10px] font-sans text-white font-medium cursor-pointer"
        >
          <Home className="w-4 h-4 stroke-[1.75]" />
          <span className="truncate">Portal</span>
          <span className="w-1 h-1 rounded-full bg-white mt-0.5" />
        </button>

        <button
          onClick={() => onNavigate('discovery')}
          className="flex-1 flex flex-col items-center justify-center py-1 gap-1 text-[10px] font-sans text-zinc-400 hover:text-zinc-200 cursor-pointer"
        >
          <Compass className="w-4 h-4 stroke-[1.75]" />
          <span className="truncate">Üyeler</span>
        </button>

        <button
          onClick={() => onNavigate('feed')}
          className="flex-1 flex flex-col items-center justify-center py-1 gap-1 text-[10px] font-sans text-zinc-400 hover:text-zinc-200 cursor-pointer"
        >
          <BookOpen className="w-4 h-4 stroke-[1.75]" />
          <span className="truncate">Akış</span>
        </button>

        <button
          onClick={() => onNavigate('chat')}
          className="flex-1 flex flex-col items-center justify-center py-1 gap-1 text-[10px] font-sans text-zinc-400 hover:text-zinc-200 cursor-pointer"
        >
          <MessageSquare className="w-4 h-4 stroke-[1.75]" />
          <span className="truncate">Salonlar</span>
        </button>

        <button
          onClick={onOpenAuth}
          className="flex-1 flex flex-col items-center justify-center py-1 gap-1 text-[10px] font-sans text-[#E5C590] cursor-pointer"
        >
          <KeyRound className="w-4 h-4 stroke-[1.75]" />
          <span className="truncate">Giriş</span>
        </button>
      </nav>
    );
  }

  return (
    <>
      {/* ========================================================
          DESKTOP EDITORIAL SIDEBAR (LEFT) - PAGE SPECIFIC IDENTITY
          ======================================================== */}
      <aside className="hidden md:flex flex-col justify-between w-64 lg:w-72 shrink-0 h-screen sticky top-0 px-5 lg:px-6 py-6 border-r border-white/[0.08] bg-[#07080A] overflow-y-auto no-scrollbar">
        <div className="space-y-6">
          {/* Major Club Brand Header */}
          <div 
            onClick={() => onNavigate('home')}
            className="cursor-pointer group flex items-center gap-3"
          >
            <img 
              src="/major-club-logo.png" 
              alt="MAJOR CLUB" 
              className="h-8 w-auto object-contain hover:scale-105 transition-transform"
            />
          </div>

          {/* Minimalist Divider */}
          <div className="h-px bg-white/[0.06]" />

          {/* Core Navigation Links */}
          <nav className="space-y-1">
            <span className="px-3 pb-1 text-[9px] font-mono tracking-[0.2em] text-zinc-500 uppercase block">
              Navigasyon
            </span>

            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  data-nav-id={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-all text-left cursor-pointer group ${
                    isActive 
                      ? 'bg-[#181B22] text-[#E5C590] font-medium border border-[#E5C590]/30 shadow-xs' 
                      : 'text-zinc-400 hover:text-white hover:bg-white/[0.03]'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Icon className={`w-4 h-4 shrink-0 transition-colors ${
                      isActive ? 'text-[#E5C590]' : 'text-zinc-400 group-hover:text-white'
                    }`} strokeWidth={1.5} />
                    <div className="min-w-0">
                      <span className="block truncate font-sans text-xs">{item.label}</span>
                    </div>
                  </div>

                  {Boolean(item.badge && item.badge > 0) && (
                    <span className="px-1.5 py-0.5 rounded-full bg-[#E5C590]/20 border border-[#E5C590]/30 text-[9px] font-mono text-[#E5C590]">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* PAGE-SPECIFIC IDENTITY MODULE */}
          {currentView === 'feed' && (
            <div className="pt-2 border-t border-white/[0.06] space-y-3">
              <span className="px-3 text-[9px] font-mono tracking-[0.2em] text-zinc-500 uppercase block">
                Akış Kanalları & Trendler
              </span>
              <div className="space-y-1 text-xs">
                <button className="w-full text-left px-3 py-1.5 rounded-lg text-white bg-white/[0.04] font-medium flex items-center justify-between">
                  <span>Tüm Gönderiler</span>
                  <Flame className="w-3.5 h-3.5 text-[#E5C590]" />
                </button>
                <button className="w-full text-left px-3 py-1.5 rounded-lg text-zinc-400 hover:text-white transition-colors flex items-center justify-between">
                  <span>Özel Çemberim</span>
                  <Users className="w-3.5 h-3.5 text-zinc-500" />
                </button>
                <button className="w-full text-left px-3 py-1.5 rounded-lg text-zinc-400 hover:text-white transition-colors flex items-center justify-between">
                  <span>Fotoğraf Dispatches</span>
                  <Sparkles className="w-3.5 h-3.5 text-zinc-500" />
                </button>
              </div>
            </div>
          )}

          {currentView === 'discovery' && (
            <div className="pt-2 border-t border-white/[0.06] space-y-3">
              <span className="px-3 text-[9px] font-mono tracking-[0.2em] text-[#E5C590] uppercase block flex items-center gap-1.5">
                <SlidersHorizontal className="w-3 h-3" />
                <span>Katalog Filtreleri</span>
              </span>
              <div className="px-3 space-y-2 text-xs text-zinc-300">
                <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.04] space-y-1.5">
                  <span className="text-[10px] text-zinc-500 font-mono uppercase block">Öncelikli Eşleşme</span>
                  <div className="flex items-center gap-1 flex-wrap">
                    <span className="px-2 py-0.5 rounded-md bg-[#181B22] text-[#E5C590] text-[10px] border border-[#E5C590]/30">Kadınlar</span>
                    <span className="px-2 py-0.5 rounded-md bg-[#181B22] text-zinc-300 text-[10px] border border-white/10">Çiftler</span>
                    <span className="px-2 py-0.5 rounded-md bg-[#181B22] text-zinc-300 text-[10px] border border-white/10">Swinger</span>
                  </div>
                </div>
                <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.04] space-y-1">
                  <span className="text-[10px] text-zinc-500 font-mono uppercase block">Bölgeler</span>
                  <p className="text-[11px] text-zinc-400">Amsterdam · Paris · Rotterdam · Londra</p>
                </div>
              </div>
            </div>
          )}

          {currentView === 'profile' && (
            <div className="pt-2 border-t border-white/[0.06] space-y-3">
              <span className="px-3 text-[9px] font-mono tracking-[0.2em] text-[#E5C590] uppercase block">
                Dossier Kısayolları
              </span>
              <div className="px-3 space-y-1 text-xs text-zinc-400">
                <div className="flex items-center gap-2 py-1 text-zinc-200">
                  <FileText className="w-3.5 h-3.5 text-[#E5C590]" />
                  <span>Hakkımızda & Vizyon</span>
                </div>
                <div className="flex items-center gap-2 py-1 text-zinc-200">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Tercihler & Sınırlar</span>
                </div>
                <div className="flex items-center gap-2 py-1 text-zinc-200">
                  <Lock className="w-3.5 h-3.5 text-amber-400" />
                  <span>Şifreli Mahzen</span>
                </div>
              </div>
            </div>
          )}

          {currentView === 'chat' && (
            <div className="pt-2 border-t border-white/[0.06] space-y-3">
              <span className="px-3 text-[9px] font-mono tracking-[0.2em] text-zinc-500 uppercase block">
                Salon Kanalları
              </span>
              <div className="px-3 space-y-1.5 text-xs text-zinc-300">
                <div className="flex items-center justify-between py-1 border-b border-white/[0.04]">
                  <span>Birebir Sohbetler</span>
                  <span className="text-[10px] font-mono text-[#E5C590]">Şifreli</span>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-white/[0.04]">
                  <span>Tanışma Talepleri</span>
                  <span className="text-[10px] font-mono text-zinc-400">3 Bekleyen</span>
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
            className="w-full py-2.5 px-4 rounded-xl text-xs font-sans font-medium bg-[#121419] hover:bg-[#181B22] text-white border border-white/[0.08] hover:border-white/20 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
          >
            <Plus className="w-3.5 h-3.5 text-white" />
            <span>Compose Dispatch</span>
          </button>

          {/* Member Card Summary / Guest Admission */}
          {currentUser.isGuest ? (
            <button
              onClick={onOpenAuth}
              className="w-full p-2.5 rounded-xl bg-gradient-to-r from-[#181B22] to-[#121419] border border-[#E5C590]/30 hover:border-[#E5C590] text-[#E5C590] flex items-center justify-between transition-all cursor-pointer shadow-sm group"
            >
              <div className="flex items-center gap-2.5">
                <KeyRound className="w-4 h-4 text-[#E5C590]" />
                <div className="text-left">
                  <div className="font-sans text-xs font-medium text-white group-hover:text-[#E5C590] transition-colors">
                    Salon Admission
                  </div>
                  <div className="text-[10px] text-zinc-400 font-sans">
                    Giriş Yap / Üye Ol
                  </div>
                </div>
              </div>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-md bg-[#E5C590]/10 text-[#E5C590]">
                Katıl
              </span>
            </button>
          ) : (
            <div className="p-2.5 rounded-xl bg-[#121419] border border-white/[0.06] hover:border-white/15 flex items-center justify-between transition-colors">
              <div 
                onClick={() => onNavigate('profile')}
                className="flex items-center gap-3 min-w-0 flex-1 cursor-pointer"
              >
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-8 h-8 rounded-full object-cover border border-white/10 shrink-0"
                />
                <div className="min-w-0">
                  <div className="font-sans text-xs font-medium text-white truncate">
                    {currentUser.name}
                  </div>
                  <div className="text-[10px] font-mono text-zinc-400 truncate">
                    @{currentUser.username}
                  </div>
                </div>
              </div>
              {onLogout && (
                <button
                  onClick={onLogout}
                  title="Çıkış Yap"
                  className="p-1.5 text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer shrink-0 ml-1"
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
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#07080A]/95 backdrop-blur-2xl border-t border-white/[0.08] px-2 py-1.5 flex items-center justify-around shadow-2xl"
      >
        <button
          onClick={() => onNavigate('feed')}
          className={`flex-1 flex flex-col items-center justify-center py-1 gap-1 text-[10px] font-sans transition-colors cursor-pointer ${
            currentView === 'feed' ? 'text-white font-medium' : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <BookOpen className="w-4 h-4 stroke-[1.75]" />
          <span className="truncate">Feed</span>
          {currentView === 'feed' && (
            <span className="w-1 h-1 rounded-full bg-white mt-0.5" />
          )}
        </button>

        <button
          onClick={() => onNavigate('discovery')}
          className={`flex-1 flex flex-col items-center justify-center py-1 gap-1 text-[10px] font-sans transition-colors cursor-pointer ${
            currentView === 'discovery' ? 'text-white font-medium' : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Compass className="w-4 h-4 stroke-[1.75]" />
          <span className="truncate">Registry</span>
          {currentView === 'discovery' && (
            <span className="w-1 h-1 rounded-full bg-white mt-0.5" />
          )}
        </button>

        {/* Center Dispatch Action Button */}
        <div className="px-1 shrink-0">
          <button
            onClick={onOpenCreatePost}
            className="w-9 h-9 rounded-full bg-white text-black flex items-center justify-center active:scale-95 transition-transform cursor-pointer shadow-md"
            aria-label="New Dispatch"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>

        <button
          onClick={() => onNavigate('chat')}
          className={`flex-1 flex flex-col items-center justify-center py-1 gap-1 text-[10px] font-sans transition-colors cursor-pointer relative ${
            currentView === 'chat' ? 'text-white font-medium' : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <MessageSquare className="w-4 h-4 stroke-[1.75]" />
          <span className="truncate">Chat</span>
          {Boolean(unreadChatCount && unreadChatCount > 0) && (
            <span className="absolute top-1 right-3 w-2 h-2 rounded-full bg-[#E5C590]" />
          )}
          {currentView === 'chat' && (
            <span className="w-1 h-1 rounded-full bg-white mt-0.5" />
          )}
        </button>

        <button
          onClick={() => onNavigate('profile')}
          className={`flex-1 flex flex-col items-center justify-center py-1 gap-1 text-[10px] font-sans transition-colors cursor-pointer ${
            currentView === 'profile' ? 'text-white font-medium' : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <KeyRound className="w-4 h-4 stroke-[1.75]" />
          <span className="truncate">Dossier</span>
          {currentView === 'profile' && (
            <span className="w-1 h-1 rounded-full bg-white mt-0.5" />
          )}
        </button>
      </nav>
    </>
  );
};
