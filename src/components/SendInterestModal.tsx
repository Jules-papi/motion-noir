import React, { useState } from 'react';
import { Send, X, ShieldCheck } from 'lucide-react';
import { DiscoveryProfile, UserProfile } from '../types';

interface SendInterestModalProps {
  profile: DiscoveryProfile;
  currentUser: UserProfile;
  onClose: () => void;
  onSend: (profile: DiscoveryProfile, note: string) => void;
}

export const SendInterestModal: React.FC<SendInterestModalProps> = ({
  profile,
  onClose,
  onSend,
}) => {
  const [note, setNote] = useState('');
  const isCouple = profile.gender === 'couple_mf';

  const quickPrompts = [
    'Compliments on your dossier and refined salon presence. 🥂',
    'We noted resonant interests and would be delighted to introduce ourselves.',
    'Hope to cross paths during upcoming private chapter salons. 🏛️',
  ];

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSend(profile, note);
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 cursor-pointer animate-in fade-in duration-150"
    >
      <div
        onClick={e => e.stopPropagation()}
        className="bg-[#09090B] border border-white/[0.12] rounded-2xl max-w-md w-full shadow-2xl overflow-hidden max-h-[90vh] flex flex-col relative cursor-default"
      >
        {/* Header */}
        <div className="p-5 border-b border-white/[0.08] flex items-center justify-between shrink-0">
          <div>
            <span className="text-[10px] font-mono tracking-widest uppercase text-amber-300 block">
              Confidential Introduction
            </span>
            <h3 className="font-serif text-lg text-stone-100 font-medium">
              {isCouple ? 'Request Circle Accord with Couple' : 'Transmit Introduction Note'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-xs text-stone-400 hover:text-stone-200 border border-white/[0.06] hover:border-white/20 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="p-5 space-y-4 text-xs flex-1 overflow-y-auto">
            {/* Target Profile Card Summary */}
            <div className="flex items-center gap-3.5 p-3 rounded-xs bg-[#111113] border border-white/[0.06]">
              <img
                src={profile.avatar}
                alt={profile.name}
                className="w-12 h-12 rounded-xs object-cover border border-white/20"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 font-serif text-sm text-stone-200">
                  <span className="truncate">{profile.name}</span>
                  <span className="text-stone-400 font-mono text-xs">, {profile.age}</span>
                  {isCouple && (
                    <span className="px-1.5 py-0.5 rounded-xs bg-[#1A1A1E] text-amber-200 border border-amber-600/30 text-[9px] font-mono uppercase tracking-wider">
                      Duo
                    </span>
                  )}
                </div>
                <p className="text-[11px] font-sans font-light text-stone-400 truncate mt-0.5">{profile.bio}</p>
              </div>
            </div>

            {/* Quick Prompts */}
            <div>
              <label className="font-mono text-[10px] uppercase tracking-wider block mb-2 text-stone-400">
                Introduction Salutations:
              </label>
              <div className="space-y-1.5">
                {quickPrompts.map((msg, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setNote(msg)}
                    className="w-full text-left p-2.5 rounded-xs text-xs font-serif italic bg-[#111113] hover:bg-[#1A1A1E] text-stone-300 hover:text-amber-100 transition-colors border border-white/[0.05] hover:border-amber-500/30"
                  >
                    "{msg}"
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Message */}
            <div>
              <label className="font-mono text-[10px] uppercase tracking-wider block mb-1.5 text-stone-400">
                Personal Epigram:
              </label>
              <textarea
                rows={3}
                value={note}
                onChange={e => setNote(e.target.value)}
                placeholder="Compose a discreet and gracious note..."
                className="w-full p-3 rounded-xs bg-[#111113] border border-white/[0.08] text-stone-200 placeholder-stone-400 outline-hidden focus:border-amber-400/50 text-xs font-serif leading-relaxed"
              />
            </div>

            <div className="flex items-center gap-2.5 text-[11px] font-mono text-stone-400 bg-[#111113] p-3 rounded-xs border border-white/[0.06]">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Discretion Guarantee: Direct contact tokens remain masked until reciprocal accord is granted.</span>
            </div>
          </div>

          {/* Sticky Footer */}
          <div className="p-4 border-t border-white/[0.08] bg-[#09090B] flex items-center justify-end gap-3 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xs text-xs font-mono uppercase tracking-wider text-stone-400 hover:text-stone-200 transition-colors"
            >
              Dismiss
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xs font-serif text-xs uppercase tracking-[0.14em] bg-[#1A1A1E] hover:bg-[#1A1A1E] text-amber-200 border border-amber-600/40 hover:border-amber-400 transition-all flex items-center gap-2"
            >
              <Send className="w-3 h-3 text-amber-300" />
              <span>Transmit Note</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
