import React, { useRef, useState } from 'react';
import { supabase } from '../lib/supabase';
import { noirApi } from '../services/noirApi';
import { UserProfile } from '../types';
import {
  X,
  Lock,
  Mail,
  User,
  ShieldCheck,
  KeyRound,
  Check,
  ArrowRight,
  Loader2,
  AlertCircle,
  Eye,
  EyeOff,
  ArrowLeft
} from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import { DEFAULT_AVATAR_URL, DEFAULT_COVER_URL } from '../constants/profile';

export type AuthMode = 'signin' | 'signup' | 'reset' | 'recovery';

const getAuthErrorKey = (error: unknown, action: AuthMode): string => {
  const code = String((error as { code?: string })?.code || '').toLowerCase();
  const message = String((error as { message?: string })?.message || error || '').toLowerCase();

  if (
    code === 'user_already_exists' ||
    code === 'email_exists' ||
    message.includes('already registered') ||
    message.includes('already exists')
  ) return 'auth.emailExists';

  if (code === 'weak_password' || (message.includes('password') && (message.includes('short') || message.includes('least')))) {
    return 'auth.passwordShort';
  }
  if (code.includes('rate_limit') || message.includes('rate limit') || message.includes('too many')) return 'auth.rateLimit';
  if (code === 'email_address_invalid' || message.includes('invalid email') || message.includes('validate email')) return 'auth.invalidEmail';
  if (code === 'email_not_confirmed' || message.includes('email not confirmed')) return 'auth.emailUnconfirmed';
  if (code === 'invalid_credentials' || message.includes('invalid login')) return 'auth.invalidCredentials';
  if (code === 'signup_disabled' || message.includes('signups not allowed') || message.includes('signup is disabled')) return 'auth.signupDisabled';
  if (message.includes('confirmation email') || message.includes('sending email')) return 'auth.confirmationEmailFailed';
  if (message.includes('failed to fetch') || message.includes('network')) return 'auth.networkError';
  if (message.includes('profile_creation_failed')) return 'auth.profileFailed';

  if (action === 'reset') return 'auth.resetFailed';

  return action === 'signup' ? 'auth.signupFailed' : 'auth.failed';
};

interface AuthModalProps {
  isOpen: boolean;
  initialMode?: AuthMode;
  onClose: () => void;
  onAuthSuccess: (user: UserProfile) => void;
  onToast: (msg: { text: string; type: 'success' | 'info' | 'error' }) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  initialMode = 'signin',
  onClose,
  onAuthSuccess,
  onToast,
}) => {
  const { t } = useLanguage();
  const onCloseRef = useRef(onClose);
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [gender, setGender] = useState<'unspecified' | 'woman' | 'man' | 'non_binary' | 'couple'>('unspecified');
  const [age, setAge] = useState(26);
  const [location, setLocation] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState('');

  React.useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  React.useEffect(() => {
    if (!isOpen) return;
    setMode(initialMode);
    setFormError('');
    setPassword('');
    setConfirmPassword('');
    setShowPassword(false);
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCloseRef.current();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [initialMode, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const action: AuthMode = mode;
    const normalizedEmail = email.trim().toLowerCase();
    setFormError('');
    if (action === 'reset' && !normalizedEmail) {
      onToast({ text: t('auth.emailRequired'), type: 'error' });
      return;
    }
    if (action === 'recovery' && (!password || !confirmPassword)) {
      onToast({ text: t('auth.passwordRequired'), type: 'error' });
      return;
    }
    if ((action === 'signin' || action === 'signup') && (!normalizedEmail || !password)) {
      onToast({ text: t('auth.required'), type: 'error' });
      return;
    }

    setIsLoading(true);

    try {
      if (action === 'reset') {
        const { error } = await supabase.auth.resetPasswordForEmail(normalizedEmail, {
          redirectTo: `${window.location.origin}/?password-recovery=1`,
        });
        if (error) throw error;
        onToast({ text: t('auth.resetSent'), type: 'success' });
        setMode('signin');
        return;
      }

      if (action === 'recovery') {
        if (password.length < 6) throw new Error('weak_password');
        if (password !== confirmPassword) {
          setFormError(t('auth.passwordMismatch'));
          return;
        }
        const { error } = await supabase.auth.updateUser({ password });
        if (error) throw error;
        window.history.replaceState({}, document.title, window.location.pathname);
        onToast({ text: t('auth.passwordUpdated'), type: 'success' });
        onClose();
        return;
      }

      if (action === 'signup') {
        const normalizedUsername = (username || name || normalizedEmail.split('@')[0])
          .trim()
          .toLowerCase()
          .replace(/[^a-z0-9_]+/g, '_')
          .replace(/^_+|_+$/g, '') || `member_${Date.now()}`;
        const avatar = DEFAULT_AVATAR_URL;
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: normalizedEmail,
          password,
          options: {
            data: {
              name: name || normalizedEmail.split('@')[0],
              username: normalizedUsername,
              location,
              age,
              gender,
              avatar,
              coverImage: DEFAULT_COVER_URL,
            },
          },
        });

        if (authError) {
          throw authError;
        }

        if (!authData.user || authData.user.identities?.length === 0) {
          throw new Error('user_already_registered');
        }

        if (!authData.session) {
          onToast({ text: t('auth.verifyEmail'), type: 'success' });
          onClose();
          return;
        }

        const userId = authData.user.id;
        const newProfile = await noirApi.upsertProfile({
          id: userId,
          name: name || normalizedEmail.split('@')[0],
          username: normalizedUsername,
          location,
          age,
          gender,
          avatar,
          coverImage: DEFAULT_COVER_URL,
        });

        if (newProfile) {
          onToast({ text: t('auth.created'), type: 'success' });
          onAuthSuccess(newProfile);
          onClose();
        } else {
          throw new Error('profile_creation_failed');
        }
      } else {
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
          email: normalizedEmail,
          password,
        });

        if (authError) {
          throw authError;
        }

        const userId = authData.user?.id;
        if (userId) {
          const profiles = await noirApi.getProfiles();
          const existing = profiles.find(p => p.id === userId);
          if (existing) {
            onToast({ text: `${t('auth.welcome')}, ${existing.name}.`, type: 'success' });
            onAuthSuccess(existing);
            onClose();
            return;
          }
        }

        // Fallback or new profile bootstrap
        const metadata = authData.user?.user_metadata || {};
        const bootstrapped = await noirApi.upsertProfile({
          id: userId || `u-${Date.now()}`,
          name: metadata.name || normalizedEmail.split('@')[0],
          username: metadata.username || normalizedEmail.split('@')[0],
          location: metadata.location,
          age: metadata.age,
          gender: metadata.gender,
          avatar: metadata.avatar,
        });
        if (bootstrapped) {
          onAuthSuccess(bootstrapped);
          onClose();
        } else {
          throw new Error('profile_creation_failed');
        }
      }
    } catch (err: any) {
      console.warn(`Auth ${action} failed:`, err);
      const errorKey = getAuthErrorKey(err, action);
      const errorText = t(errorKey);
      setFormError(errorText);
      onToast({ text: errorText, type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200 cursor-pointer"
    >
      <div
        className="relative w-full max-w-3xl bg-[#111113] border border-white/[0.08] rounded-xl overflow-hidden shadow-2xl flex flex-col md:flex-row cursor-default"
        onClick={e => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          aria-label={t('auth.close')}
          className="absolute top-4 right-4 z-20 p-2 text-[#9A9996] hover:text-[#F1EFEA] rounded-full hover:bg-white/[0.05] transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* 1. EDITORIAL PHOTOGRAPHY PANEL (DESKTOP ~42%) */}
        <div className="relative md:w-5/12 min-h-[160px] md:min-h-full overflow-hidden bg-[#09090B] flex flex-col justify-between p-6">
          <img
            src="https://images.unsplash.com/photo-1543007630-9710e4a00a20?w=1000&auto=format&fit=crop&q=85"
            alt="Major Club Nocturne"
            className="absolute inset-0 w-full h-full object-cover filter contrast-[1.08] brightness-[0.72] scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#111113] via-[#09090B]/60 to-black/40" />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#111113]/80 hidden md:block" />

          {/* Top Brand Tag */}
          <div className="relative z-10">
            <span className="text-[10px] font-mono tracking-[0.25em] text-[#C5A880] uppercase block">
              Société Privée
            </span>
            <span className="text-[11px] font-sans text-[#9A9996]">
              Amsterdam · Paris
            </span>
          </div>

          {/* Bottom Editorial Statement */}
          <div className="relative z-10 pt-8 md:pt-24 space-y-2">
            <h2 className="font-serif text-2xl sm:text-3xl text-[#F1EFEA] font-light tracking-wide leading-tight">
              MAJOR CLUB
            </h2>
            <p className="font-serif italic text-sm text-[#F1EFEA]/85 leading-snug">
              {t('auth.tagline1')}<br />
              {t('auth.tagline2')}
            </p>
            <p className="text-[10px] font-sans text-[#9A9996] pt-1">
              {t('auth.adults')}
            </p>
          </div>
        </div>

        {/* 2. AUTHENTICATION CONTROLS (DESKTOP ~58%) */}
        <div className="p-6 sm:p-8 md:w-7/12 flex flex-col justify-center">
          <div className="mb-6">
            <h3 className="font-serif text-xl sm:text-2xl text-[#F1EFEA] font-normal tracking-wide">
              {mode === 'signin' && t('auth.signinTitle')}
              {mode === 'signup' && t('auth.signupTitle')}
              {mode === 'reset' && t('auth.resetTitle')}
              {mode === 'recovery' && t('auth.recoveryTitle')}
            </h3>
            <p className="text-xs text-[#9A9996] mt-1 font-sans">
              {mode === 'signin' && t('auth.signinText')}
              {mode === 'signup' && t('auth.signupText')}
              {mode === 'reset' && t('auth.resetText')}
              {mode === 'recovery' && t('auth.recoveryText')}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3.5 font-sans">
            {mode === 'signup' && (
              <>
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-[#9A9996] mb-1 font-mono">
                    {t('auth.name')}
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder={t('auth.namePlaceholder')}
                    className="w-full px-3.5 py-2 bg-[#1A1A1E] border border-white/[0.08] rounded-lg text-xs text-[#F1EFEA] placeholder-[#66666A] focus:outline-hidden focus:border-[#C5A880]/50 transition-colors"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] uppercase tracking-wider text-[#9A9996] mb-1 font-mono">
                      {t('auth.age')}
                    </label>
                    <input
                      type="number"
                      min={18}
                      max={80}
                      value={age}
                      onChange={e => setAge(Number(e.target.value))}
                      className="w-full px-3.5 py-2 bg-[#1A1A1E] border border-white/[0.08] rounded-lg text-xs text-[#F1EFEA] focus:outline-hidden focus:border-[#C5A880]/50"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-wider text-[#9A9996] mb-1 font-mono">
                      {t('auth.gender')}
                    </label>
                    <select
                      value={gender}
                      onChange={e => setGender(e.target.value as any)}
                      className="w-full px-3.5 py-2 bg-[#1A1A1E] border border-white/[0.08] rounded-lg text-xs text-[#F1EFEA] focus:outline-hidden focus:border-[#C5A880]/50 cursor-pointer"
                    >
                      <option value="unspecified">Belirtmek istemiyorum</option>
                      <option value="woman">{t('auth.woman')}</option>
                      <option value="man">{t('auth.man')}</option>
                      <option value="non_binary">{t('auth.nonbinary')}</option>
                      <option value="couple">{t('auth.couple')}</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-[#9A9996] mb-1 font-mono">
                    Konum / Chapter <span className="normal-case tracking-normal text-[#66666A]">(isteğe bağlı)</span>
                  </label>
                  <input
                    type="text"
                    value={location}
                    onChange={e => setLocation(e.target.value)}
                    placeholder="Şehir veya bölge"
                    className="w-full px-3.5 py-2 bg-[#1A1A1E] border border-white/[0.08] rounded-lg text-xs text-[#F1EFEA] placeholder-[#66666A] focus:outline-hidden focus:border-[#C5A880]/50"
                  />
                </div>
              </>
            )}

            {mode !== 'recovery' && (
            <div>
              <label className="block text-[10px] uppercase tracking-wider text-[#9A9996] mb-1 font-mono">
                {t('auth.email')}
              </label>
              <div className="relative">
                <Mail className="w-3.5 h-3.5 text-[#66666A] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="patron@majorclub.com"
                  className="w-full pl-9 pr-3.5 py-2 bg-[#1A1A1E] border border-white/[0.08] rounded-lg text-xs text-[#F1EFEA] placeholder-[#66666A] focus:outline-hidden focus:border-[#C5A880]/50 transition-colors"
                />
              </div>
            </div>
            )}

            {mode !== 'reset' && (
            <div>
              <label className="block text-[10px] uppercase tracking-wider text-[#9A9996] mb-1 font-mono">
                {t('auth.password')}
              </label>
              <div className="relative">
                <KeyRound className="w-3.5 h-3.5 text-[#66666A] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-9 pr-10 py-2 bg-[#1A1A1E] border border-white/[0.08] rounded-lg text-xs text-[#F1EFEA] placeholder-[#66666A] focus:outline-hidden focus:border-[#C5A880]/50 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(value => !value)}
                  aria-label={showPassword ? t('auth.hidePassword') : t('auth.showPassword')}
                  title={showPassword ? t('auth.hidePassword') : t('auth.showPassword')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-[#9A9996] hover:bg-white/[0.05] hover:text-[#F1EFEA] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C5A880]"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {mode === 'signin' && (
                <button
                  type="button"
                  onClick={() => {
                    setFormError('');
                    setMode('reset');
                  }}
                  className="mt-2 text-[11px] text-[#C5A880] hover:text-[#E1C89F] transition-colors"
                >
                  {t('auth.forgotPassword')}
                </button>
              )}
            </div>
            )}

            {mode === 'recovery' && (
              <div>
                <label className="block text-[10px] uppercase tracking-wider text-[#9A9996] mb-1 font-mono">
                  {t('auth.confirmPassword')}
                </label>
                <div className="relative">
                  <KeyRound className="w-3.5 h-3.5 text-[#66666A] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={event => setConfirmPassword(event.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-9 pr-3.5 py-2 bg-[#1A1A1E] border border-white/[0.08] rounded-lg text-xs text-[#F1EFEA] placeholder-[#66666A] focus:outline-hidden focus:border-[#C5A880]/50 transition-colors"
                  />
                </div>
              </div>
            )}

            {formError && (
              <div
                role="alert"
                aria-live="assertive"
                className="flex items-start gap-2 rounded-lg border border-rose-400/20 bg-rose-500/10 px-3.5 py-2.5 text-xs leading-relaxed text-rose-200"
              >
                <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-3 py-2.5 px-4 rounded-lg bg-[#F1EFEA] text-[#09090B] font-medium text-xs hover:bg-white active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 shadow-sm"
            >
              {isLoading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : mode === 'signin' ? (
                <>
                  <span>{t('auth.signin')}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              ) : mode === 'signup' ? (
                <>
                  <span>{t('auth.submit')}</span>
                  <Check className="w-3.5 h-3.5" />
                </>
              ) : mode === 'reset' ? (
                <>
                  <span>{t('auth.sendReset')}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              ) : (
                <>
                  <span>{t('auth.updatePassword')}</span>
                  <Check className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>

          {/* Toggle Mode */}
          <div className="mt-4 pt-3 border-t border-white/[0.06] text-center">
            {(mode === 'reset' || mode === 'recovery') ? (
              <button
                type="button"
                onClick={() => {
                  setFormError('');
                  setMode('signin');
                }}
                className="inline-flex items-center gap-1.5 text-xs text-[#9A9996] hover:text-[#F1EFEA] transition-colors cursor-pointer"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                {t('auth.backToSignIn')}
              </button>
            ) : (
            <button
              type="button"
              onClick={() => {
                setFormError('');
                setMode(mode === 'signin' ? 'signup' : 'signin');
              }}
              className="text-xs text-[#9A9996] hover:text-[#F1EFEA] transition-colors cursor-pointer"
            >
              {mode === 'signin'
                ? t('auth.noAccount')
                : t('auth.hasAccount')}
            </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
