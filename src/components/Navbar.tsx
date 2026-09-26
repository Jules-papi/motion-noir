import React, { useState } from 'react';
import {
  Search,
  Bell,
  Plus,
  MessageSquare,
  KeyRound,
  LogOut,
  X,
  EyeOff,
  Calendar,
  ShieldCheck
} from 'lucide-react';
import { UserProfile } from '../types';
import { SupportedCurrency, SupportedLanguage } from '../types/anlatiTypes';
import { ActiveViewType } from './Sidebar';
import { DICTIONARY, SUPPORTED_LANGUAGES } from '../utils/i18n';
import { useLanguage } from '../i18n/LanguageContext';

interface NavbarProps {
  currentUser: UserProfile;
  currentView?: ActiveViewType;
  unreadChatCount?: number;
  unreadNotificationsCount?: number;
  currency?: SupportedCurrency;
  language?: SupportedLanguage;
  searchQuery?: string;
  onSearchChange?: (q: string) => void;
  onCurrencyChange?: (c: SupportedCurrency) => void;
  onLanguageChange?: (l: SupportedLanguage) => void;
  onOpenCreatePost: () => void;
  onOpenNotifications: () => void;
  onNavigate: (view: ActiveViewType) => void;
  onOpenAuth?: () => void;
  onLogout?: () => void;
  onToggleCamouflage?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  currentView = 'feed',
  unreadChatCount = 0,
  unreadNotificationsCount = 0,
  currency = 'EUR',
  language = 'tr',
  searchQuery = '',
  onSearchChange,
  onCurrencyChange,
  onLanguageChange,
  onOpenCreatePost,
  onOpenNotifications,
  onNavigate,
  onOpenAuth,
  onLogout,
  onToggleCamouflage,
}) => {
  const { t } = useLanguage();
  const [langMenuOpen, setLangMenuOpen] = useState(false);

  const currentLang = SUPPORTED_LANGUAGES.find(l => l.code === language) || SUPPORTED_LANGUAGES[1];
  const copy = DICTIONARY[language];

  return (
    <header className="sticky top-0 z-40 bg-[#09090B]/95 backdrop-blur-md border-b border-white/[0.08]">
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
            className="h-8 sm:h-9 w-auto object-contain opacity-95 group-hover:opacity-100 transition-opacity"
          />
        </div>

        {/* Global Search Bar */}
        <div className="flex-1 max-w-md hidden md:block">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-[#66666A] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
              placeholder={copy.searchPlaceholder}
              className="w-full pl-9 pr-8 py-1.5 bg-[#111113] border border-white/[0.08] rounded-lg text-xs text-[#F1EFEA] placeholder-[#66666A] focus:outline-hidden focus:border-[#C5A880]/50 transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange && onSearchChange('')}
                aria-label="Clear search"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#66666A] hover:text-[#F1EFEA]"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>

        {/* Right Navigation Controls */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Camouflage Mode Panic Button */}
          {onToggleCamouflage && (
            <button
              onClick={onToggleCamouflage}
              className="p-2 rounded-lg text-[#9A9996] hover:text-[#F1EFEA] hover:bg-white/[0.04] transition-colors cursor-pointer relative group flex items-center justify-center min-w-[34px] min-h-[34px]"
              title="Kamufle / Panik Modu (Esc)"
              aria-label="Kamufle Modu (Esc)"
            >
              <EyeOff className="w-4 h-4 stroke-[1.75]" />
              <span className="hidden md:group-hover:block absolute right-0 top-full mt-2 px-2.5 py-1 bg-[#111113] border border-white/10 text-[10px] text-[#F1EFEA] rounded-md whitespace-nowrap shadow-2xl z-50 pointer-events-none">
                Kamufle Modu (Esc)
              </span>
            </button>
          )}

          {currentUser.isGuest ? (
            <>
              {/* Language Selector */}
              {onLanguageChange && (
                <div className="relative">
                  <button
                    onClick={() => setLangMenuOpen(!langMenuOpen)}
                    className="h-9 w-9 rounded-lg text-[#9A9996] hover:text-[#F1EFEA] hover:bg-white/[0.04] text-base transition-colors flex items-center justify-center cursor-pointer"
                    title={currentLang.label}
                    aria-label={`${currentLang.label} — Select language`}
                  >
                    <span>{currentLang.flag}</span>
                  </button>
                  {langMenuOpen && (
                    <div className="absolute right-0 mt-2 w-32 bg-[#111113] border border-white/[0.08] rounded-lg shadow-2xl p-1 z-50">
                      {SUPPORTED_LANGUAGES.map(l => (
                        <button
                          key={l.code}
                          onClick={() => {
                            onLanguageChange(l.code);
                            setLangMenuOpen(false);
                          }}
                          className="w-full text-left px-2.5 py-1.5 text-xs text-[#9A9996] hover:text-[#F1EFEA] hover:bg-white/[0.06] rounded-md flex items-center gap-2"
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
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#F1EFEA] text-[#09090B] font-medium text-xs hover:bg-white transition-all cursor-pointer shadow-xs active:scale-[0.98]"
              >
                <KeyRound className="w-3.5 h-3.5 stroke-[2]" />
                <span>{t('nav.loginJoin')}</span>
              </button>
            </>
          ) : (
            <>
              {/* Dispatch Create Button */}
              <button
                onClick={onOpenCreatePost}
                className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-white/[0.06] hover:bg-white/[0.1] text-[#F1EFEA] border border-white/[0.08] font-sans text-xs font-medium transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 stroke-[2]" />
                <span>{t('nav.compose')}</span>
              </button>

              {/* Language Selector */}
              {onLanguageChange && (
                <div className="relative">
                  <button
                    onClick={() => setLangMenuOpen(!langMenuOpen)}
                    className="h-9 w-9 rounded-lg text-[#9A9996] hover:text-[#F1EFEA] hover:bg-white/[0.04] text-base transition-colors flex items-center justify-center cursor-pointer"
                    title={currentLang.label}
                    aria-label={`${currentLang.label} — Select language`}
                  >
                    <span>{currentLang.flag}</span>
                  </button>
                  {langMenuOpen && (
                    <div className="absolute right-0 mt-2 w-32 bg-[#111113] border border-white/[0.08] rounded-lg shadow-2xl p-1 z-50">
                      {SUPPORTED_LANGUAGES.map(l => (
                        <button
                          key={l.code}
                          onClick={() => {
                            onLanguageChange(l.code);
                            setLangMenuOpen(false);
                          }}
                          className="w-full text-left px-2.5 py-1.5 text-xs text-[#9A9996] hover:text-[#F1EFEA] hover:bg-white/[0.06] rounded-md flex items-center gap-2"
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
                className="relative p-2 rounded-lg text-[#9A9996] hover:text-[#F1EFEA] hover:bg-white/[0.04] transition-colors cursor-pointer"
                title="Private Dispatches"
                aria-label="Private Dispatches"
              >
                <MessageSquare className="w-4 h-4 stroke-[1.5]" />
                {unreadChatCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-[#C5A880]" />
                )}
              </button>

              {/* Notifications */}
              <button
                onClick={onOpenNotifications}
                className="relative p-2 rounded-lg text-[#9A9996] hover:text-[#F1EFEA] hover:bg-white/[0.04] transition-colors cursor-pointer"
                title="Notifications"
                aria-label="Notifications"
              >
                <Bell className="w-4 h-4 stroke-[1.5]" />
                {unreadNotificationsCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-[#C5A880]" />
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
                  className="w-7 h-7 rounded-full object-cover border border-white/15 group-hover:border-[#C5A880]/50 transition-colors"
                />
              </div>

              {/* Sign Out Button */}
              {onLogout && (
                <button
                  onClick={onLogout}
                  className="p-2 rounded-lg text-[#9A9996] hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
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

      {/* TIER 2: QUIET LUXURY SECTION NAVIGATION */}
      <div className="hidden md:block border-t border-white/[0.06] bg-[#0B0C0E]/95">
        <div className="max-w-7xl mx-auto px-4 h-10 flex items-center justify-between gap-2 overflow-x-auto no-scrollbar">
          <nav className="flex items-center gap-1">
            {/* Portal is a visitor-only entry point. Members start from the feed. */}
            {currentUser.isGuest && (
              <button
                onClick={() => onNavigate('home')}
                className={`px-3 py-1 rounded-md text-xs font-sans whitespace-nowrap transition-colors flex items-center gap-1.5 cursor-pointer ${
                  currentView === 'home'
                    ? 'bg-white/[0.06] text-[#F1EFEA] border border-white/[0.08] font-medium'
                    : 'text-[#9A9996] hover:text-[#F1EFEA] hover:bg-white/[0.03]'
                }`}
              >
                <span>{t('nav.portal')}</span>
              </button>
            )}

            {/* The Gazette (Akış) */}
            <button
              onClick={() => onNavigate('feed')}
              className={`px-3 py-1 rounded-md text-xs font-sans whitespace-nowrap transition-colors flex items-center gap-1.5 cursor-pointer ${
                currentView === 'feed'
                  ? 'bg-white/[0.06] text-[#F1EFEA] border border-white/[0.08] font-medium'
                  : 'text-[#9A9996] hover:text-[#F1EFEA] hover:bg-white/[0.03]'
              }`}
            >
              <span>{t('nav.feed')}</span>
            </button>

            {/* The Registry (Üye Kataloğu) */}
            <button
              onClick={() => onNavigate('discovery')}
              className={`px-3 py-1 rounded-md text-xs font-sans whitespace-nowrap transition-colors flex items-center gap-1.5 cursor-pointer ${
                currentView === 'discovery'
                  ? 'bg-white/[0.06] text-[#F1EFEA] border border-white/[0.08] font-medium'
                  : 'text-[#9A9996] hover:text-[#F1EFEA] hover:bg-white/[0.03]'
              }`}
            >
              <span>{t('nav.registry')}</span>
            </button>

            {/* Salons & Calendar (Etkinlikler & Takvim) */}
            <button
              onClick={() => onNavigate('events')}
              className={`px-3 py-1 rounded-md text-xs font-sans whitespace-nowrap transition-colors flex items-center gap-1.5 cursor-pointer ${
                currentView === 'events'
                  ? 'bg-white/[0.06] text-[#F1EFEA] border border-white/[0.08] font-medium'
                  : 'text-[#9A9996] hover:text-[#F1EFEA] hover:bg-white/[0.03]'
              }`}
            >
              <Calendar className="w-3.5 h-3.5 text-[#C5A880]" />
              <span>{t('nav.events') || 'Etkinlikler & Takvim'}</span>
            </button>

            {/* Encrypted Salons (Mesajlar / Sohbet) */}
            <button
              onClick={() => onNavigate('chat')}
              className={`px-3 py-1 rounded-md text-xs font-sans whitespace-nowrap transition-colors flex items-center gap-1.5 cursor-pointer ${
                currentView === 'chat'
                  ? 'bg-white/[0.06] text-[#F1EFEA] border border-white/[0.08] font-medium'
                  : 'text-[#9A9996] hover:text-[#F1EFEA] hover:bg-white/[0.03]'
              }`}
            >
              <span>{t('nav.chat')}</span>
              {unreadChatCount > 0 && (
                <span className="w-1.5 h-1.5 rounded-full bg-[#C5A880]" />
              )}
            </button>

            {/* Member Dossier (Profil) */}
            <button
              onClick={() => onNavigate('profile')}
              className={`px-3 py-1 rounded-md text-xs font-sans whitespace-nowrap transition-colors flex items-center gap-1.5 cursor-pointer ${
                currentView === 'profile'
                  ? 'bg-white/[0.06] text-[#F1EFEA] border border-white/[0.08] font-medium'
                  : 'text-[#9A9996] hover:text-[#F1EFEA] hover:bg-white/[0.03]'
              }`}
            >
              <span>{t('nav.profile')}</span>
            </button>

            {/* High Curatorship Admin Panel (If Admin) */}
            {currentUser.isAdmin && (
              <button
                onClick={() => onNavigate('admin')}
                className={`px-3 py-1 rounded-md text-xs font-sans whitespace-nowrap transition-colors flex items-center gap-1.5 cursor-pointer ml-1 ${
                  currentView === 'admin'
                    ? 'bg-[#C5A880]/15 text-[#C5A880] border border-[#C5A880]/40 font-semibold'
                    : 'text-[#C5A880] hover:text-[#E5C590] hover:bg-white/[0.03]'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5 text-[#C5A880]" />
                <span>Yönetim</span>
              </button>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
};
