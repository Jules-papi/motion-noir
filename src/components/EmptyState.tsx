import React from 'react';
import { Sparkles } from 'lucide-react';

export type EmptyStateVariant = 
  | 'posts'
  | 'search'
  | 'events'
  | 'chat'
  | 'notifications'
  | 'favorites'
  | 'clubs';

interface EmptyStateProps {
  variant?: EmptyStateVariant;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  variant = 'posts',
  title,
  description,
  actionLabel,
  onAction,
}) => {
  // Sophisticated SVG micro-illustrations without external image dependencies
  const renderIllustration = () => {
    switch (variant) {
      case 'chat':
        return (
          <svg className="w-24 h-24 text-rose-500/20 dark:text-rose-400/20" viewBox="0 0 96 96" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="48" cy="48" r="40" className="fill-rose-50 dark:fill-rose-950/40 stroke-rose-500/30" strokeWidth="2" strokeDasharray="4 4" />
            <rect x="26" y="28" width="38" height="26" rx="8" className="fill-white dark:fill-zinc-800 stroke-rose-500/60" strokeWidth="2" />
            <path d="M34 38H56M34 44H48" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-rose-400" />
            <path d="M42 54L38 60V54H42Z" className="fill-white dark:fill-zinc-800 stroke-rose-500/60" strokeWidth="2" />
            <rect x="42" y="42" width="30" height="22" rx="6" className="fill-rose-500 text-white" />
            <circle cx="51" cy="53" r="1.5" fill="white" />
            <circle cx="57" cy="53" r="1.5" fill="white" />
            <circle cx="63" cy="53" r="1.5" fill="white" />
          </svg>
        );

      case 'events':
        return (
          <svg className="w-24 h-24 text-purple-500/20 dark:text-purple-400/20" viewBox="0 0 96 96" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="48" cy="48" r="40" className="fill-purple-50 dark:fill-purple-950/40 stroke-purple-500/30" strokeWidth="2" strokeDasharray="4 4" />
            <rect x="28" y="28" width="40" height="42" rx="10" className="fill-white dark:fill-zinc-800 stroke-purple-500/60" strokeWidth="2" />
            <path d="M28 40H68" className="stroke-purple-500/40" strokeWidth="2" />
            <rect x="36" y="24" width="4" height="8" rx="2" className="fill-purple-500" />
            <rect x="56" y="24" width="4" height="8" rx="2" className="fill-purple-500" />
            <circle cx="40" cy="50" r="2.5" className="fill-purple-400" />
            <circle cx="48" cy="50" r="2.5" className="fill-purple-400" />
            <circle cx="56" cy="50" r="2.5" className="fill-purple-400" />
            <circle cx="40" cy="58" r="2.5" className="fill-purple-400" />
            <circle cx="48" cy="58" r="2.5" className="fill-purple-400" />
            <circle cx="56" cy="58" r="2.5" className="fill-rose-500 animate-pulse" />
          </svg>
        );

      case 'search':
        return (
          <svg className="w-24 h-24 text-sky-500/20 dark:text-sky-400/20" viewBox="0 0 96 96" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="48" cy="48" r="40" className="fill-sky-50 dark:fill-sky-950/30 stroke-sky-500/30" strokeWidth="2" strokeDasharray="4 4" />
            <circle cx="44" cy="44" r="18" className="fill-white dark:fill-zinc-800 stroke-sky-500/70" strokeWidth="3" />
            <line x1="57" y1="57" x2="70" y2="70" stroke="currentColor" strokeWidth="4" strokeLinecap="round" className="text-sky-500" />
            <circle cx="40" cy="40" r="4" className="fill-sky-400/40" />
          </svg>
        );

      case 'notifications':
        return (
          <svg className="w-24 h-24 text-amber-500/20 dark:text-amber-400/20" viewBox="0 0 96 96" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="48" cy="48" r="40" className="fill-amber-50 dark:fill-amber-950/30 stroke-amber-500/30" strokeWidth="2" strokeDasharray="4 4" />
            <path d="M48 26C39.1634 26 32 33.1634 32 42V54L26 60V64H70V60L64 54V42C64 33.1634 56.8366 26 48 26Z" className="fill-white dark:fill-zinc-800 stroke-amber-500/70" strokeWidth="2" />
            <path d="M42 66C42 69.3137 44.6863 72 48 72C51.3137 72 54 69.3137 54 66" className="stroke-amber-500/70" strokeWidth="2" strokeLinecap="round" />
            <circle cx="62" cy="34" r="4" className="fill-rose-500 animate-ping" />
          </svg>
        );

      case 'posts':
      default:
        return (
          <svg className="w-24 h-24 text-rose-500/20 dark:text-rose-400/20" viewBox="0 0 96 96" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="48" cy="48" r="40" className="fill-rose-50 dark:fill-rose-950/30 stroke-rose-500/30" strokeWidth="2" strokeDasharray="4 4" />
            <rect x="26" y="26" width="44" height="44" rx="12" className="fill-white dark:fill-zinc-800 stroke-rose-500/60" strokeWidth="2" />
            <circle cx="38" cy="38" r="4" className="fill-rose-400" />
            <path d="M30 60L42 46L54 58L60 52L66 60" className="stroke-rose-500/60" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M56 32L64 24M64 32L56 24" className="stroke-purple-400" strokeWidth="2" strokeLinecap="round" />
          </svg>
        );
    }
  };

  return (
    <div className="p-8 sm:p-12 text-center rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 shadow-xs flex flex-col items-center justify-center space-y-3.5 my-4">
      <div className="relative">
        {renderIllustration()}
      </div>

      <div className="max-w-md space-y-1">
        <h3 className="text-sm sm:text-base font-extrabold text-zinc-900 dark:text-white">
          {title}
        </h3>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
          {description}
        </p>
      </div>

      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="mt-2 px-4 py-2 rounded-xl text-xs font-bold bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 hover:opacity-90 active:scale-95 transition-all shadow-xs"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};
