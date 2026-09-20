import React, { useState } from 'react';
import { 
  Search, 
  Bell, 
  Crown, 
  Plus, 
  MessageSquare, 
  KeyRound,
  X
} from 'lucide-react';
import { UserProfile } from '../types';
import { SupportedCurrency, SupportedLanguage } from '../types/anlatiTypes';
import { ActiveViewType } from './Sidebar';
import { formatCurrency } from '../utils/i18n';

interface NavbarProps {
  currentUser: UserProfile;
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
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  walletBalance,
  isUserSubscribed,
  unreadChatCount = 2,
  unreadNotificationsCount = 2,
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
}) => {
  const [langMenuOpen, setLangMenuOpen] = useState(false);

  const languages: { code: SupportedLanguage; label: string; flag: string }[] = [
    { code: 'nl', label: 'Nederlands', flag: '🇳🇱' },
    { code: 'en', label: 'English', flag: '🇬🇧' },
    { code: 'tr', label: 'Türkçe', flag: '🇹🇷' },
  ];

  const currentLang = languages.find(l => l.code === language) || languages[0];

  return (
    <header className="sticky top-0 z-40 bg-[#07080A]/90 backdrop-blur-md border-b border-white/[0.06]">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
        {/* Logo and Brand */}
        <div 
          onClick={() => onNavigate('feed')}
          className="flex items-center gap-3 cursor-pointer select-none group shrink-0"
        >
          <div className="w-8 h-8 rounded-full bg-[#121419] border border-[#E5C590]/40 flex items-center justify-center text-[#E5C590] shadow-xs group-hover:border-[#E5C590] transition-colors">
            <span className="font-serif font-bold text-sm tracking-tighter">MN</span>
          </div>
          <div className="hidden sm:block">
            <span className="font-serif text-lg tracking-wider text-[#F3F4F6] block leading-none">
              MAISON NOIR
            </span>
            <span className="text-[9px] tracking-widest text-zinc-400 uppercase block font-sans">
              Private Members Salon
            </span>
          </div>
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
          {/* Dispatch Create Button */}
          <button
            onClick={onOpenCreatePost}
            className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white text-black font-sans text-xs font-medium hover:bg-zinc-200 transition-colors shadow-xs cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2]" />
            <span>Dispatch</span>
          </button>

          {/* Admission Key / Authenticate */}
          {onOpenAuth && (
            <button
              onClick={onOpenAuth}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-[#14161C] border border-[#E5C590]/30 hover:border-[#E5C590] text-[#E5C590] text-xs font-sans transition-colors cursor-pointer"
              title="Salon Admission & Switch Patron"
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span className="hidden sm:inline text-[11px]">Admission</span>
            </button>
          )}

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
            title="Member Dossier"
          >
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="w-8 h-8 rounded-full object-cover border border-white/20 group-hover:border-white/40 transition-colors"
            />
          </div>
        </div>
      </div>
    </header>
  );
};
