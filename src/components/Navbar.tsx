import React, { useState } from 'react';
import { 
  Search, 
  Bell, 
  Crown, 
  Plus, 
  MessageSquare, 
  KeyRound,
  LogOut,
  X
} from 'lucide-react';
import { UserProfile } from '../types';
import { SupportedCurrency, SupportedLanguage } from '../types/anlatiTypes';
import { ActiveViewType } from './Sidebar';
import { formatCurrency } from '../utils/i18n';

interface NavbarProps {
  currentUser: UserProfile;
  currentView?: ActiveViewType;
  walletBalance: number;
  isUserSubscribed: boolean;
  unreadChatCount?: number;
  unreadNotificationsCount?: number;
  currency?: SupportedCurrency;
  language?: SupportedLanguage;
  searchQuery?: string;
  onSearchChange?: (q: string) => void;
  onCurrencyChange?: (c: SupportedCurrency) => void;
  onLanguageChange?: (l: SupportedLanguage) => void;
  onOpenWallet: () => void;
  onOpenCreatePost: () => void;
  onOpenMembershipModal: () => void;
  onOpenNotifications: () => void;
  onNavigate: (view: ActiveViewType) => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  onOpenAuth?: () => void;
  onLogout?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  currentView = 'feed',
  walletBalance,
  isUserSubscribed,
  unreadChatCount = 0,
  unreadNotificationsCount = 0,
  currency = 'EUR',
  language = 'tr',
  searchQuery = '',
  onSearchChange,
  onCurrencyChange,
  onLanguageChange,
  onOpenWallet,
  onOpenCreatePost,
  onOpenMembershipModal,
  onOpenNotifications,
  onNavigate,
  onOpenAuth,
  onLogout,
}) => {
  const [langMenuOpen, setLangMenuOpen] = useState(false);

  const languages: { code: SupportedLanguage; label: string; flag: string }[] = [
    { code: 'nl', label: 'Nederlands', flag: '🇳🇱' },
    { code: 'en', label: 'English', flag: '🇬🇧' },
    { code: 'tr', label: 'Türkçe', flag: '🇹🇷' },
  ];

  const currentLang = languages.find(l => l.code === language) || languages[0];

  return (
    <header className="sticky top-0 z-40 bg-[#07080A]/95 backdrop-blur-md border-b border-white/[0.08]">
      {/* TIER 1: BRAND, GLOBAL SEARCH & ACCOUNT UTILITY */}
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
        {/* Logo and Brand */}
        <div 
          onClick={() => onNavigate('home')}
          className="flex items-center gap-3 cursor-pointer select-none group shrink-0"
        >
          <img 
            src="/major-club-logo.png" 
            alt="MAJOR CLUB" 
            className="h-9 sm:h-11 w-auto object-contain drop-shadow-[0_4px_12px_rgba(229,197,144,0.25)] hover:scale-105 transition-transform" 
          />
        </div>

        {/* Global Search Bar */}
        <div className="flex-1 max-w-md hidden md:block">
          <div className="relative">
            <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2 stroke-[1.5]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
              placeholder="Search registry, dispatches, patrons..."
              className="w-full pl-9 pr-8 py-2 bg-[#121419] border border-white/[0.08] rounded-full text-xs text-white placeholder-zinc-500 focus:outline-hidden focus:border-[#E5C590]/50 transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange && onSearchChange('')}
                aria-label="Clear search"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Right Navigation Controls */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {currentUser.isGuest ? (
            <>
              {/* Language Selector */}
              {onLanguageChange && (
                <div className="relative">
                  <button
                    onClick={() => setLangMenuOpen(!langMenuOpen)}
                    className="px-2 py-1.5 rounded-full text-zinc-400 hover:text-white hover:bg-white/[0.04] text-xs transition-colors flex items-center gap-1 cursor-pointer"
                    title="Select Language"
                  >
                    <span>{currentLang.flag}</span>
                    <span className="font-sans text-[11px] uppercase hidden sm:inline">{currentLang.code}</span>
                  </button>
                  {langMenuOpen && (
                    <div className="absolute right-0 mt-2 w-32 bg-[#121419] border border-white/[0.08] rounded-xl shadow-2xl p-1 z-50">
                      {languages.map(l => (
                        <button
                          key={l.code}
                          onClick={() => {
                            onLanguageChange(l.code);
                            setLangMenuOpen(false);
                          }}
                          className="w-full text-left px-2.5 py-1.5 text-xs text-zinc-300 hover:text-white hover:bg-white/[0.06] rounded-lg flex items-center gap-2"
                        >
                          <span>{l.flag}</span>
                          <span className="font-sans">{l.label}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Login / Register CTA */}
              <button
                onClick={onOpenAuth}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-linear-to-r from-[#E5C590] via-[#DFBA7F] to-[#C9A96E] text-black font-semibold text-xs hover:brightness-110 shadow-[0_2px_12px_rgba(229,197,144,0.3)] transition-all cursor-pointer"
              >
                <KeyRound className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Giriş Yap / Üye Ol</span>
              </button>
            </>
          ) : (
            <>
              {/* Dispatch Create Button */}
              <button
                onClick={onOpenCreatePost}
                className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white text-black font-sans text-xs font-medium hover:bg-zinc-200 transition-colors shadow-xs cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 stroke-[2]" />
                <span>Dispatch</span>
              </button>

              {/* Language Selector */}
              {onLanguageChange && (
                <div className="relative">
                  <button
                    onClick={() => setLangMenuOpen(!langMenuOpen)}
                    className="px-2 py-1.5 rounded-full text-zinc-400 hover:text-white hover:bg-white/[0.04] text-xs transition-colors flex items-center gap-1 cursor-pointer"
                    title="Select Language"
                  >
                    <span>{currentLang.flag}</span>
                    <span className="font-sans text-[11px] uppercase hidden sm:inline">{currentLang.code}</span>
                  </button>
                  {langMenuOpen && (
                    <div className="absolute right-0 mt-2 w-32 bg-[#121419] border border-white/[0.08] rounded-xl shadow-2xl p-1 z-50">
                      {languages.map(l => (
                        <button
                          key={l.code}
                          onClick={() => {
                            onLanguageChange(l.code);
                            setLangMenuOpen(false);
                          }}
                          className="w-full text-left px-2.5 py-1.5 text-xs text-zinc-300 hover:text-white hover:bg-white/[0.06] rounded-lg flex items-center gap-2"
                        >
                          <span>{l.flag}</span>
                          <span className="font-sans">{l.label}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Messages */}
              <button
                onClick={() => onNavigate('chat')}
                className="relative p-2 rounded-full text-zinc-400 hover:text-white hover:bg-white/[0.04] transition-colors cursor-pointer"
                title="Private Dispatches"
                aria-label="Private Dispatches"
              >
                <MessageSquare className="w-4 h-4 stroke-[1.5]" />
                {unreadChatCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-[#E5C590]" />
                )}
              </button>

              {/* Notifications */}
              <button
                onClick={onOpenNotifications}
                className="relative p-2 rounded-full text-zinc-400 hover:text-white hover:bg-white/[0.04] transition-colors cursor-pointer"
                title="Notifications"
                aria-label="Notifications"
              >
                <Bell className="w-4 h-4 stroke-[1.5]" />
                {unreadNotificationsCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-[#E5C590]" />
                )}
              </button>

              {/* User Dossier Avatar */}
              <div
                onClick={() => onNavigate('profile')}
                className="cursor-pointer group ml-0.5"
                title={`${currentUser.name} Dossier`}
              >
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-8 h-8 rounded-full object-cover border border-[#E5C590]/40 group-hover:border-[#E5C590] transition-colors"
                />
              </div>

              {/* Sign Out Button */}
              {onLogout && (
                <button
                  onClick={onLogout}
                  className="p-2 rounded-full text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                  title="Çıkış Yap"
                  aria-label="Çıkış Yap"
                >
                  <LogOut className="w-4 h-4 stroke-[1.5]" />
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {/* TIER 2: COMMUNITY PILLARS & PLATFORM WORLDS (JOYCLUB ARCHITECTURE) */}
      <div className="border-t border-white/[0.05] bg-[#0c0d12]/90">
        <div className="max-w-7xl mx-auto px-4 h-11 flex items-center justify-between gap-2 overflow-x-auto no-scrollbar">
          <nav className="flex items-center gap-1 sm:gap-2">
            {/* Portal / Anasayfa */}
            <button
              onClick={() => onNavigate('home')}
              className={`px-3 py-1.5 rounded-full text-xs font-sans whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                currentView === 'home'
                  ? 'bg-[#181B22] text-[#E5C590] border border-[#E5C590]/30 shadow-xs font-medium'
                  : 'text-zinc-400 hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              <span>Portal</span>
              <span className="text-[10px] text-zinc-500 font-mono hidden sm:inline">(Giriş)</span>
            </button>

            {/* The Gazette (Akış) */}
            <button
              onClick={() => onNavigate('feed')}
              className={`px-3 py-1.5 rounded-full text-xs font-sans whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                currentView === 'feed'
                  ? 'bg-[#181B22] text-[#E5C590] border border-[#E5C590]/30 shadow-xs font-medium'
                  : 'text-zinc-400 hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              <span>The Gazette</span>
              <span className="text-[10px] text-zinc-500 font-mono hidden sm:inline">(Akış)</span>
            </button>

            {/* The Registry (Üye Kataloğu) */}
            <button
              onClick={() => onNavigate('discovery')}
              className={`px-3 py-1.5 rounded-full text-xs font-sans whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                currentView === 'discovery'
                  ? 'bg-[#181B22] text-[#E5C590] border border-[#E5C590]/30 shadow-xs font-medium'
                  : 'text-zinc-400 hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              <span>The Registry</span>
              <span className="text-[10px] text-zinc-500 font-mono hidden sm:inline">(Üyeler)</span>
            </button>

            {/* Encrypted Salons (Mesajlar / Sohbet) */}
            <button
              onClick={() => onNavigate('chat')}
              className={`px-3 py-1.5 rounded-full text-xs font-sans whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                currentView === 'chat'
                  ? 'bg-[#181B22] text-[#E5C590] border border-[#E5C590]/30 shadow-xs font-medium'
                  : 'text-zinc-400 hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              <span>Dispatches</span>
              <span className="text-[10px] text-zinc-500 font-mono hidden sm:inline">(Salonlar)</span>
              {unreadChatCount > 0 && (
                <span className="w-1.5 h-1.5 rounded-full bg-[#E5C590]" />
              )}
            </button>

            {/* Member Dossier (Profil) */}
            <button
              onClick={() => onNavigate('profile')}
              className={`px-3 py-1.5 rounded-full text-xs font-sans whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                currentView === 'profile'
                  ? 'bg-[#181B22] text-[#E5C590] border border-[#E5C590]/30 shadow-xs font-medium'
                  : 'text-zinc-400 hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              <span>Member Dossier</span>
              <span className="text-[10px] text-zinc-500 font-mono hidden sm:inline">(Profil)</span>
            </button>
          </nav>

          {/* Quick Access Badges (Right side of Tier 2) */}
          <div className="hidden lg:flex items-center gap-3 text-xs font-sans text-zinc-400 shrink-0">
            <span className="text-[11px] text-zinc-500">Maison Chapters:</span>
            <span className="text-zinc-300 hover:text-[#E5C590] cursor-pointer transition-colors">Paris 🇫🇷</span>
            <span className="text-zinc-500">·</span>
            <span className="text-zinc-300 hover:text-[#E5C590] cursor-pointer transition-colors">Amsterdam 🇳🇱</span>
            <span className="text-zinc-500">·</span>
            <span className="text-zinc-300 hover:text-[#E5C590] cursor-pointer transition-colors">London 🇬🇧</span>
          </div>
        </div>
      </div>
    </header>
  );
};
