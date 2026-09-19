import React, { useState } from 'react';
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
  Sparkles,
  Loader2
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (user: UserProfile) => void;
  onToast: (msg: { text: string; type: 'success' | 'info' | 'error' }) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onAuthSuccess,
  onToast,
}) => {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [gender, setGender] = useState<'woman' | 'man' | 'non_binary' | 'couple'>('woman');
  const [age, setAge] = useState(26);
  const [location, setLocation] = useState('Amsterdam');
  const [isLoading, setIsLoading] = useState(false);

  React.useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      onToast({ text: 'Please enter both email and password.', type: 'error' });
      return;
    }

    setIsLoading(true);

    try {
      if (mode === 'signup') {
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email,
          password,
        });

        if (authError) {
          throw authError;
        }

        const userId = authData.user?.id || `user-${Date.now()}`;
        const newProfile = await noirApi.upsertProfile({
          id: userId,
          name: name || email.split('@')[0],
          username: username || email.split('@')[0].toLowerCase(),
          location,
          age,
          gender,
          avatar: gender === 'man'
            ? 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80'
            : gender === 'couple'
            ? 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&auto=format&fit=crop&q=80'
            : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
        });

        if (newProfile) {
          onToast({ text: 'Maison Noir dossier created and verified.', type: 'success' });
          onAuthSuccess(newProfile);
          onClose();
        }
      } else {
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
          email,
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
            onToast({ text: `Welcome back, ${existing.name}.`, type: 'success' });
            onAuthSuccess(existing);
            onClose();
            return;
          }
        }

        // Fallback or new profile bootstrap
        const bootstrapped = await noirApi.upsertProfile({
          id: userId || `u-${Date.now()}`,
          name: email.split('@')[0],
          username: email.split('@')[0].toLowerCase(),
        });
        if (bootstrapped) {
          onAuthSuccess(bootstrapped);
          onClose();
        }
      }
    } catch (err: any) {
      console.error('Auth error:', err);
      onToast({ text: err.message || 'Authentication failed. Please verify credentials.', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  // Quick Switch to Preset Seed Patron for immediate instant demo without typing
  const handleQuickLoginAs = async (patronId: string) => {
    setIsLoading(true);
    const profiles = await noirApi.getProfiles();
    const target = profiles.find(p => p.id === patronId);
    if (target) {
      onToast({ text: `Authenticated as ${target.name}. Discretion enabled.`, type: 'success' });
      onAuthSuccess(target);
      onClose();
    }
    setIsLoading(false);
  };

  return (
    <div 
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200 cursor-pointer"
    >
      <div 
        className="relative w-full max-w-md bg-[#0D0F14] border border-[#E5C590]/25 rounded-2xl p-6 sm:p-8 shadow-2xl shadow-black/80 cursor-default"
        onClick={e => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-white rounded-full hover:bg-white/5 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#181B22] border border-[#E5C590]/30 text-[#E5C590] mb-3">
            <Lock className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-serif tracking-wide text-[#E5C590]">
            {mode === 'signin' ? 'Maison Noir Patron Entry' : 'Request Salon Admission'}
          </h2>
          <p className="text-xs text-zinc-400 mt-1 font-sans">
            {mode === 'signin'
              ? 'Present your credentials to access encrypted dispatches.'
              : 'Register an official dossier in the private registry.'}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 font-sans">
          {mode === 'signup' && (
            <>
              <div>
                <label className="block text-[11px] uppercase tracking-wider text-zinc-400 mb-1">Full Name / Pseudonym</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. Julian Vane"
                  className="w-full px-3.5 py-2.5 bg-[#14161C] border border-white/10 rounded-xl text-sm text-white placeholder-zinc-600 focus:outline-hidden focus:border-[#E5C590]/60 transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-zinc-400 mb-1">Age</label>
                  <input
                    type="number"
                    min={18}
                    max={80}
                    value={age}
                    onChange={e => setAge(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-[#14161C] border border-white/10 rounded-xl text-sm text-white focus:outline-hidden focus:border-[#E5C590]/60"
                  />
                </div>
                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-zinc-400 mb-1">Gender</label>
                  <select
                    value={gender}
                    onChange={e => setGender(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 bg-[#14161C] border border-white/10 rounded-xl text-sm text-white focus:outline-hidden focus:border-[#E5C590]/60"
                  >
                    <option value="woman">Woman</option>
                    <option value="man">Man</option>
                    <option value="non_binary">Non-Binary</option>
                    <option value="couple">Couple / Duo</option>
                  </select>
                </div>
              </div>
            </>
          )}

          <div>
            <label className="block text-[11px] uppercase tracking-wider text-zinc-400 mb-1">Confidential Email</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="patron@maison-noir.com"
                className="w-full pl-10 pr-3.5 py-2.5 bg-[#14161C] border border-white/10 rounded-xl text-sm text-white placeholder-zinc-600 focus:outline-hidden focus:border-[#E5C590]/60 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] uppercase tracking-wider text-zinc-400 mb-1">Passphrase</label>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-10 pr-3.5 py-2.5 bg-[#14161C] border border-white/10 rounded-xl text-sm text-white placeholder-zinc-600 focus:outline-hidden focus:border-[#E5C590]/60 transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 py-3 px-4 rounded-xl bg-gradient-to-r from-[#E5C590] to-[#C9A96E] text-black font-medium text-sm hover:opacity-95 transition-all shadow-lg shadow-[#E5C590]/15 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : mode === 'signin' ? (
              <>
                <span>Enter Private Salon</span>
                <ArrowRight className="w-4 h-4" />
              </>
            ) : (
              <>
                <span>Enroll in Registry</span>
                <Check className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Toggle Mode */}
        <div className="mt-4 text-center">
          <button
            onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')}
            className="text-xs text-zinc-400 hover:text-[#E5C590] transition-colors cursor-pointer"
          >
            {mode === 'signin' ? "Don't have a dossier? Apply for admission" : 'Already registered? Present credentials'}
          </button>
        </div>

        {/* Quick Demo Switcher for Clients / Buyers */}
        <div className="mt-6 pt-5 border-t border-white/[0.08]">
          <div className="flex items-center gap-1.5 text-[11px] text-[#E5C590]/90 uppercase font-sans tracking-wider mb-2.5">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Instant Switch for Evaluators / Buyers</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => handleQuickLoginAs('44444444-4444-4444-4444-444444444444')}
              className="px-2.5 py-2 rounded-lg bg-[#14161C] border border-white/5 hover:border-[#E5C590]/40 text-left text-xs text-zinc-300 transition-colors cursor-pointer"
            >
              <div className="font-medium text-white truncate">Julian Vane</div>
              <div className="text-[10px] text-zinc-500">Founder & Curator</div>
            </button>
            <button
              onClick={() => handleQuickLoginAs('11111111-1111-1111-1111-111111111111')}
              className="px-2.5 py-2 rounded-lg bg-[#14161C] border border-white/5 hover:border-[#E5C590]/40 text-left text-xs text-zinc-300 transition-colors cursor-pointer"
            >
              <div className="font-medium text-white truncate">Elena Rostova</div>
              <div className="text-[10px] text-zinc-500">Architect (Amsterdam)</div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
