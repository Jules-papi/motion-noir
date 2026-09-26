import React from 'react';
import {
  ArrowRight,
  BadgeCheck,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  KeyRound,
  Lock,
  MapPin,
  MessageSquare,
  ShieldCheck,
  Users,
} from 'lucide-react';
import { DiscoveryProfile } from '../types';
import { ActiveViewType } from './Sidebar';
import { useLanguage } from '../i18n/LanguageContext';

interface GuestLandingViewProps {
  onNavigate: (view: ActiveViewType) => void;
  onOpenAuth: () => void;
  onViewProfile: (userId: string) => void;
  profiles?: DiscoveryProfile[];
}

export const GuestLandingView: React.FC<GuestLandingViewProps> = ({
  onNavigate,
  onOpenAuth,
  onViewProfile,
  profiles = [],
}) => {
  const { t } = useLanguage();
  const [openFaqIndex, setOpenFaqIndex] = React.useState<number | null>(0);
  const featureLinks = [
    { title: t('nav.registry'), description: t('home.registryDescription'), action: t('home.registryAction'), view: 'discovery' as const, icon: Users },
    { title: t('nav.feed'), description: t('home.gazetteDescription'), action: t('home.gazetteAction'), view: 'feed' as const, icon: BookOpen },
    { title: t('nav.chat'), description: t('home.dispatchDescription'), action: t('home.dispatchAction'), view: 'chat' as const, icon: MessageSquare },
  ];
  const faqs = [
    { question: t('home.faq1q'), answer: t('home.faq1a') },
    { question: t('home.faq2q'), answer: t('home.faq2a') },
    { question: t('home.faq3q'), answer: t('home.faq3a') },
  ];

  const profilePreviews = React.useMemo(
    () =>
      [...profiles]
        .filter(profile => profile.isVerified)
        .sort((a, b) => {
          const onlineDelta = Number(b.isOnline) - Number(a.isOnline);
          if (onlineDelta !== 0) return onlineDelta;
          const matchDelta = (b.matchRate || 0) - (a.matchRate || 0);
          if (matchDelta !== 0) return matchDelta;
          return (a.distanceKm ?? Number.MAX_SAFE_INTEGER) - (b.distanceKm ?? Number.MAX_SAFE_INTEGER);
        })
        .slice(0, 5),
    [profiles]
  );

  return (
    <div className="w-full space-y-24 pb-20 text-[#F1EFEA]">
      <section className="relative min-h-[640px] lg:min-h-[min(78vh,820px)] overflow-hidden rounded-2xl border border-white/[0.08] bg-[#09090B]">
        <img
          src="/major-club-hero-editorial.webp"
          alt={t('home.heroAlt')}
          className="absolute inset-0 h-full w-full object-cover object-[68%_center] sm:object-[72%_center]"
          fetchPriority="high"
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(9,9,11,0.98)_0%,rgba(9,9,11,0.9)_35%,rgba(9,9,11,0.38)_66%,rgba(9,9,11,0.08)_100%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(0deg,rgba(9,9,11,0.72)_0%,transparent_38%)] lg:hidden" />

        <div className="relative z-10 flex min-h-[640px] max-w-7xl items-end px-6 pb-10 pt-28 sm:px-10 sm:pb-14 lg:min-h-[min(78vh,820px)] lg:items-center lg:px-16 lg:py-20">
          <div className="max-w-xl">
            <div className="mb-8 flex items-center gap-3 text-[11px] font-medium uppercase tracking-[0.22em] text-[#C5A880]">
              <span className="h-px w-9 bg-[#C5A880]/60" />
              {t('home.eyebrow')}
            </div>

            <h1 className="max-w-[10ch] font-serif text-[clamp(3.5rem,7.6vw,6rem)] font-normal leading-[0.88] tracking-[-0.035em] text-[#F1EFEA]">
              {t('home.title')}
            </h1>

            <p className="mt-7 max-w-lg text-sm font-light leading-7 text-[#D3D0CA] sm:text-base">
              {t('home.intro')}
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => onNavigate('discovery')}
                className="inline-flex min-h-12 items-center justify-center gap-3 rounded-lg bg-[#F1EFEA] px-6 text-xs font-semibold uppercase tracking-[0.08em] text-[#09090B] transition-[background-color,transform] duration-150 hover:bg-white active:scale-[0.98]"
              >
                {t('home.explore')}
                <ArrowRight className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={onOpenAuth}
                className="inline-flex min-h-12 items-center justify-center gap-3 rounded-lg border border-[#C5A880]/45 bg-[#111113]/80 px-6 text-xs font-semibold uppercase tracking-[0.08em] text-[#D8BE99] transition-[border-color,background-color,transform] duration-150 hover:border-[#C5A880]/80 hover:bg-[#1A1A1E] active:scale-[0.98]"
              >
                <KeyRound className="h-4 w-4" />
                {t('home.join')}
              </button>
            </div>

            <div className="mt-10 flex flex-wrap gap-x-6 gap-y-3 border-t border-white/[0.12] pt-5 text-[11px] text-[#B5B2AC]">
              <span className="inline-flex items-center gap-2">
                <BadgeCheck className="h-3.5 w-3.5 text-[#C5A880]" />
                {t('home.verified')}
              </span>
              <span className="inline-flex items-center gap-2">
                <ShieldCheck className="h-3.5 w-3.5 text-[#C5A880]" />
                {t('home.consent')}
              </span>
              <span className="inline-flex items-center gap-2">
                <Lock className="h-3.5 w-3.5 text-[#C5A880]" />
                {t('home.privacy')}
              </span>
            </div>
          </div>
        </div>
      </section>

      {profilePreviews.length > 0 && (
        <section>
          <div className="mb-8 flex flex-col gap-4 border-b border-white/[0.1] pb-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="font-serif text-4xl font-normal tracking-[-0.025em] text-[#F1EFEA] sm:text-5xl">
                {t('home.peopleTitle')}
              </h2>
              <p className="mt-3 max-w-xl text-sm leading-6 text-[#9A9996]">
                {t('home.peopleText')}
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('discovery')}
              className="inline-flex items-center gap-2 self-start text-xs font-semibold uppercase tracking-[0.1em] text-[#C5A880] underline-offset-4 hover:underline sm:self-auto"
            >
              {t('home.allMembers')}
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>

          <div className="grid auto-rows-[180px] grid-cols-2 gap-3 sm:auto-rows-[230px] lg:grid-cols-12">
            {profilePreviews.map((profile, index) => {
              const layout =
                index === 0
                  ? 'col-span-2 row-span-2 lg:col-span-5'
                  : index === 1
                    ? 'lg:col-span-4'
                    : index === 2
                      ? 'lg:col-span-3'
                      : 'lg:col-span-3';

              return (
                <button
                  key={profile.id}
                  type="button"
                  onClick={() => onViewProfile(profile.id)}
                  className={`group relative overflow-hidden rounded-xl bg-[#111113] text-left ${layout}`}
                  aria-label={`${t('right.inspect')}: ${profile.name}`}
                >
                  <img
                    src={profile.coverImage || profile.avatar}
                    alt={profile.name}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-300 motion-safe:group-hover:scale-[1.02]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/10 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5">
                    <div className="flex items-center gap-2">
                      <span className="font-sans text-sm font-semibold text-white sm:text-base">
                        {profile.name}
                        {profile.age ? `, ${profile.age}` : ''}
                      </span>
                      {profile.isVerified && <BadgeCheck className="h-4 w-4 text-[#C5A880]" />}
                      {profile.isOnline && <span className="h-2 w-2 rounded-full bg-emerald-400" />}
                    </div>
                    <span className="mt-1 flex items-center gap-1.5 text-[11px] text-white/70">
                      <MapPin className="h-3 w-3" />
                      {profile.city}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </section>
      )}

      <section className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
        <div className="lg:sticky lg:top-32">
          <h2 className="max-w-[11ch] font-serif text-4xl font-normal leading-[0.98] tracking-[-0.025em] text-[#F1EFEA] sm:text-5xl">
            {t('home.pathsTitle')}
          </h2>
          <p className="mt-5 max-w-md text-sm leading-7 text-[#9A9996]">
            {t('home.pathsText')}
          </p>
        </div>

        <div className="divide-y divide-white/[0.1] border-y border-white/[0.1]">
          {featureLinks.map(({ title, description, action, view, icon: Icon }) => (
            <button
              key={title}
              type="button"
              onClick={() => onNavigate(view)}
              className="group grid w-full gap-4 py-7 text-left transition-colors duration-150 hover:bg-white/[0.02] sm:grid-cols-[44px_1fr_auto] sm:items-center sm:px-2"
            >
              <span className="flex h-10 w-10 items-center justify-center text-[#C5A880]">
                <Icon className="h-5 w-5 stroke-[1.5]" />
              </span>
              <span>
                <span className="block font-serif text-2xl text-[#F1EFEA]">{title}</span>
                <span className="mt-1 block max-w-lg text-xs leading-5 text-[#9A9996]">{description}</span>
              </span>
              <span className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.1em] text-[#C5A880]">
                {action}
                <ArrowRight className="h-4 w-4 transition-transform duration-150 group-hover:translate-x-1" />
              </span>
            </button>
          ))}
        </div>
      </section>

      <section className="border-y border-white/[0.1] py-14 sm:py-20">
        <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div>
            <h2 className="max-w-[14ch] font-serif text-4xl leading-[0.98] tracking-[-0.025em] sm:text-5xl">
              {t('home.ethosTitle')}
            </h2>
          </div>
          <div className="space-y-5 text-sm leading-7 text-[#B5B2AC]">
            <p>
              {t('home.ethosText')}
            </p>
            <div className="grid gap-3 text-xs sm:grid-cols-2">
              {[t('home.boundary'), t('home.reporting'), t('home.control'), t('home.reciprocal')].map(item => (
                <span key={item} className="flex items-center gap-2 text-[#D3D0CA]">
                  <CheckCircle2 className="h-4 w-4 text-[#C5A880]" />
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-4xl">
        <h2 className="mb-8 text-center font-serif text-4xl tracking-[-0.025em] text-[#F1EFEA]">
          {t('home.faqTitle')}
        </h2>
        <div className="divide-y divide-white/[0.1] border-y border-white/[0.1]">
          {faqs.map((item, index) => {
            const isOpen = openFaqIndex === index;
            return (
              <div key={item.question}>
                <button
                  type="button"
                  onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                  className="flex min-h-16 w-full items-center justify-between gap-6 py-5 text-left"
                  aria-expanded={isOpen}
                >
                  <span className="font-sans text-sm font-medium text-[#F1EFEA]">{item.question}</span>
                  <ChevronDown
                    className={`h-4 w-4 shrink-0 text-[#C5A880] transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                  />
                </button>
                {isOpen && (
                  <p className="max-w-2xl pb-6 text-sm leading-7 text-[#9A9996]">{item.answer}</p>
                )}
              </div>
            );
          })}
        </div>
      </section>

      <footer className="flex flex-col gap-5 border-t border-white/[0.1] pt-8 text-xs text-[#9A9996] sm:flex-row sm:items-end sm:justify-between">
        <div>
          <img src="/major-club-logo.png" alt="Major Club" className="h-9 w-auto object-contain opacity-80" />
          <p className="mt-3 max-w-md leading-5">
            {t('home.footer')}
          </p>
        </div>
        <p>© 2026 Major Club International · 18+</p>
      </footer>
    </div>
  );
};
