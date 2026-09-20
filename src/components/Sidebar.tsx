import React from 'react';
import { 
  BookOpen, 
  Compass, 
  MessageSquare, 
  CalendarDays, 
  Users, 
  ShieldCheck, 
  Plus, 
  Crown, 
  KeyRound, 
  FileText
} from 'lucide-react';
import { UserProfile } from '../types';
import { SupportedCurrency, SupportedLanguage } from '../types/anlatiTypes';

export type ActiveViewType = 'feed' | 'profile' | 'chat' | 'discovery';

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
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onNavigate,
  currentUser,
  walletBalance,
  isUserSubscribed,
  unreadChatCount = 2,
  onOpenWallet,
  onOpenCreatePost,
  onOpenMembershipModal,
}) => {
  const navItems = [
    { 
      id: 'feed' as const, 
      label: 'The Gazette', 
      sub: 'Private Journal',
      icon: BookOpen 
    },
    { 
      id: 'discovery' as const, 
      label: 'The Registry', 
      sub: 'Attested Dossiers',
      icon: Compass 
    },
    { 
      id: 'chat' as const, 
      label: 'Dispatches', 
      sub: 'Encrypted Salons',
      icon: MessageSquare, 
      badge: unreadChatCount 
    },
    { 
      id: 'profile' as const, 
      label: 'Member Dossier', 
      sub: 'Personal Profile',
      icon: KeyRound 
    },
  ];

  return (
    <>
      {/* ========================================================
          DESKTOP EDITORIAL SIDEBAR (LEFT)
          Quiet luxury, restrained typography, monochromatic focus
          ======================================================== */}
      <aside className="hidden md:flex flex-col justify-between w-64 lg:w-72 shrink-0 h-screen sticky top-0 px-5 lg:px-6 py-7 border-r border-white/[0.08] bg-[#07080A] overflow-y-auto no-scrollbar">
        <div className="space-y-7">
          {/* Understated Editorial Brand Header */}
          <div 
            onClick={() => onNavigate('feed')}
            className="cursor-pointer group flex items-center gap-3"
          >
            <div className="w-9 h-9 rounded-xl bg-[#121419] border border-white/[0.12] flex items-center justify-center text-white font-serif font-semibold text-base transition-colors group-hover:border-white/30 shadow-inner">
              M
            </div>
            <div>
              <span className="block font-serif text-base tracking-[0.18em] uppercase font-light text-white group-hover:text-white transition-colors">
                Maison Noir
              </span>
              <span className="block text-[9px] tracking-[0.2em] text-zinc-400 uppercase font-mono mt-0.5">
                Société Privée · Paris &amp; AMS
              </span>
            </div>
          </div>

          {/* Minimalist Divider */}
          <div className="h-px bg-white/[0.06]" />

          {/* Navigation Links */}
          <nav className="space-y-1">
            <span className="px-3 pb-2 text-[9px] font-mono tracking-[0.2em] text-zinc-400 uppercase block">
              Navigation
            </span>

            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  data-nav-id={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs transition-all text-left cursor-pointer group ${
                    isActive 
                      ? 'bg-[#181B22] text-white font-medium border border-white/[0.08] shadow-sm' 
                      : 'text-zinc-400 hover:text-white hover:bg-white/[0.03]'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Icon className={`w-4 h-4 shrink-0 transition-colors ${
                      isActive ? 'text-white' : 'text-zinc-400 group-hover:text-white'
                    }`} strokeWidth={1.5} />
                    <div className="min-w-0">
                      <span className="block truncate font-sans text-xs">{item.label}</span>
                      <span className="block text-[10px] font-sans text-zinc-400 font-light truncate">{item.sub}</span>
                    </div>
                  </div>

                  {Boolean(item.badge && item.badge > 0) && (
                    <span className="px-1.5 py-0.5 rounded-full bg-[#222631] border border-white/10 text-[9px] font-mono text-white">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
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

          {/* Member Card Summary */}
          <div 
            onClick={() => onNavigate('profile')}
            className="p-2.5 rounded-xl bg-[#121419] border border-white/[0.06] hover:border-white/15 flex items-center justify-between cursor-pointer transition-colors"
          >
            <div className="flex items-center gap-3 min-w-0">
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
                  {currentUser.location || 'Amsterdam'}
                </div>
              </div>
            </div>
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" title="Active" />
          </div>
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
