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
}) => {
  const [langMenuOpen, setLangMenuOpen] = useState(false);

  const languages: { code: SupportedLanguage; label: string; flag: string }[] = [
    { code: 'nl', label: 'Nederlands', flag: '🇳🇱' },
    { code: 'en', label: 'English', flag: '🇬🇧' },
    { code: 'tr', label: 'Türkçe', flag: '🇹🇷' },
  ];

  const currentLang = languages.find(l => l.code === language) || languages[0];

  return (
    <header className="sticky top-0 z-30 w-full max-w-full bg-[#07080A]/95 backdrop-blur-xl border-b border-white/[0.08] px-3.5 sm:px-8 py-3 transition-colors overflow-hidden">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        {/* Mobile / Brand Monogram */}
        <div 
          onClick={() => onNavigate('feed')}
          className="flex items-center gap-2.5 cursor-pointer shrink-0"
        >
          <div className="w-8 h-8 rounded-full bg-[#121419] border border-white/[0.12] flex items-center justify-center text-white font-serif font-semibold text-sm shadow-inner">
            M
          </div>
          <div className="flex flex-col">
            <span className="font-serif tracking-[0.16em] text-sm text-white uppercase font-light whitespace-nowrap">
              Maison Noir
            </span>
          </div>
        </div>

        {/* Quiet Search Trigger */}
        <div className="flex-1 max-w-md relative hidden md:block">
          <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              const val = e.target.value;
              if (onSearchChange) onSearchChange(val);
              onNavigate('discovery');
            }}
            onFocus={() => {
              onNavigate('discovery');
            }}
            placeholder="Search dossiers, private salons, or chapters..."
            className="w-full pl-9 pr-9 py-2 rounded-full text-xs bg-[#121419] border border-white/[0.08] text-white placeholder-zinc-500 focus:outline-none focus:border-[#E5C590]/40 transition-colors font-sans"
          />
          {searchQuery && (
            <button
              onClick={() => {
                if (onSearchChange) onSearchChange('');
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded-full text-zinc-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Right Header Navigation Controls */}
        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
          {/* Currency Toggle (Desktop/Tablet) */}
          {onCurrencyChange && (
            <button
              onClick={() => onCurrencyChange(currency === 'EUR' ? 'TRY' : 'EUR')}
              className="hidden sm:inline-flex px-2.5 py-1.5 rounded-full text-[10px] tracking-wider font-mono uppercase text-zinc-400 hover:text-white hover:bg-white/[0.04] transition-colors cursor-pointer border border-transparent hover:border-white/[0.08]"
            >
              {currency === 'EUR' ? '€ EUR' : '₺ TRY'}
            </button>
          )}

          {/* Language Selector (Desktop/Tablet) */}
          {onLanguageChange && (
            <div className="relative hidden sm:block">
              <button
                onClick={() => setLangMenuOpen(!langMenuOpen)}
                className="px-2.5 py-1.5 rounded-full text-[10px] tracking-wider font-mono uppercase text-zinc-400 hover:text-white hover:bg-white/[0.04] transition-colors flex items-center gap-1.5 cursor-pointer border border-transparent hover:border-white/[0.08]"
              >
                <span>{currentLang.flag}</span>
                <span>{currentLang.code.toUpperCase()}</span>
              </button>

              {langMenuOpen && (
                <div className="absolute right-0 top-9 w-36 bg-[#121419] border border-white/[0.12] rounded-xl shadow-2xl p-1 z-50 animate-in fade-in duration-100">
                  {languages.map(l => (
                    <button
                      key={l.code}
                      onClick={() => {
                        onLanguageChange(l.code);
                        setLangMenuOpen(false);
                      }}
                      className={`w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-xs text-left transition-colors cursor-pointer ${
                        language === l.code
                          ? 'bg-[#181B22] text-white font-medium'
                          : 'text-zinc-400 hover:text-white'
                      }`}
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

          {/* Private Vault Balance Pill */}
          <button
            onClick={onOpenWallet}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs bg-[#121419] hover:bg-[#181B22] text-white border border-white/[0.08] hover:border-white/20 transition-all cursor-pointer shadow-sm"
            title="Member Vault"
          >
            <KeyRound className="w-3.5 h-3.5 text-[#E5C590]" />
            <span className="font-mono text-[11px] sm:text-xs">
              {formatCurrency(walletBalance, currency)}
            </span>
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
