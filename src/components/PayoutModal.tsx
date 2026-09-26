import React, { useState, useEffect } from 'react';
import {
  Building2,
  ArrowUpRight,
  X,
  Lock,
  Landmark
} from 'lucide-react';
import { PayoutRecord, UserProfile } from '../types';

interface PayoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
  totalEarnings: number;
  payouts: PayoutRecord[];
  onRequestPayout: (amount: number, iban: string, bankName: string) => void;
}

export const PayoutModal: React.FC<PayoutModalProps> = ({
  isOpen,
  onClose,
  currentUser: _currentUser,
  totalEarnings,
  payouts,
  onRequestPayout,
}) => {
  const [amount, setAmount] = useState<number>(350);
  const [iban, setIban] = useState<string>('NL91 ABNA 0417 1643 00');
  const [bankName, setBankName] = useState<string>('ABN AMRO Private Banking');

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const platformFee = Math.round(amount * 0.15);
  const netAmount = amount - platformFee;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (amount <= 0 || amount > totalEarnings) return;
    onRequestPayout(amount, iban, bankName);
  };

  return (
    <div className="fixed inset-0 z-60 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-[#09090B] border border-white/[0.12] rounded-2xl max-w-lg w-full p-6 shadow-2xl relative max-h-[90vh] flex flex-col text-zinc-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-full bg-[#1A1A1E] border border-[#C5A880]/30 text-[#C5A880]">
              <Landmark className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase tracking-[0.16em] text-[#C5A880] block">
                Treasury Settlement & Royalties
              </span>
              <h3 className="text-base font-serif text-white">
                Patron Honorarium & SEPA Liquidation
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-white rounded-full bg-white/5 border border-white/10 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto pr-1 py-4 space-y-5">
          {/* Earnings Overview Card */}
          <div className="p-5 rounded-xl bg-[#111113] border border-white/[0.08] relative overflow-hidden">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-serif text-zinc-400 uppercase tracking-wider">Unsettled Patron Royalties</span>
              <span className="text-[10px] bg-[#C5A880]/10 text-[#C5A880] border border-[#C5A880]/30 px-2.5 py-0.5 rounded-full font-mono">
                85% Curator Share
              </span>
            </div>
            <div className="text-3xl font-serif text-[#C5A880] font-light">€{totalEarnings.toLocaleString()}</div>
            <div className="mt-3 pt-3 border-t border-white/[0.06] flex justify-between text-[11px] text-zinc-400 font-sans">
              <span>Trailing 30-Day Dispatches: €4,250</span>
              <span className="font-mono">Vault Retainage: 15%</span>
            </div>
          </div>

          {/* Prototype disclaimer */}
          <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-black/40 border border-white/5 text-[11px] text-zinc-400 font-mono">
            <Lock className="w-3.5 h-3.5 text-[#C5A880] shrink-0" />
            <span>Dispatched via encrypted European SEPA Instant Clearing Protocol.</span>
          </div>

          {/* Withdrawal Form */}
          <form onSubmit={handleSubmit} className="space-y-3.5">
            <h4 className="text-xs font-serif text-white uppercase tracking-wider">
              Issue Liquidation Order
            </h4>

            <div>
              <label className="block text-xs text-zinc-400 font-sans mb-1.5">
                Amount to Liquidate (€)
              </label>
              <input
                type="number"
                min="50"
                max={totalEarnings}
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full px-4 py-2.5 rounded-xl border border-white/[0.08] bg-[#111113] text-white text-xs font-mono focus:border-[#C5A880]/50 outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-2.5 text-xs bg-[#111113] p-3 rounded-xl border border-white/[0.06]">
              <div>
                <span className="text-zinc-500 font-sans text-[11px]">Vault Maintenance (15%):</span>
                <p className="font-mono text-zinc-300 font-medium">-€{platformFee}</p>
              </div>
              <div>
                <span className="text-zinc-500 font-sans text-[11px]">Net Deposited to IBAN:</span>
                <p className="font-mono text-[#C5A880] font-medium">+€{netAmount}</p>
              </div>
            </div>

            <div>
              <label className="block text-xs text-zinc-400 font-sans mb-1.5">
                Designated Institutional Account & IBAN
              </label>
              <input
                type="text"
                value={iban}
                onChange={(e) => setIban(e.target.value)}
                placeholder="IBAN (e.g. NL91 ABNA ...)"
                className="w-full px-4 py-2.5 rounded-xl border border-white/[0.08] bg-[#111113] text-white text-xs font-mono mb-2 focus:border-[#C5A880]/50 outline-none"
              />
              <input
                type="text"
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                placeholder="Private Banking Institution Name"
                className="w-full px-4 py-2.5 rounded-xl border border-white/[0.08] bg-[#111113] text-white text-xs font-sans focus:border-[#C5A880]/50 outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={amount <= 0 || amount > totalEarnings}
              className="w-full py-3 rounded-full font-serif uppercase tracking-[0.14em] text-xs bg-[#C5A880] hover:bg-[#B89B6E] disabled:opacity-40 text-black font-semibold flex items-center justify-center gap-2 shadow-lg shadow-[#C5A880]/10 transition-all cursor-pointer"
            >
              <ArrowUpRight className="w-4 h-4" />
              <span>Authorize Settlement of €{netAmount}</span>
            </button>
          </form>

          {/* Past Payouts History */}
          <div>
            <h4 className="text-xs font-serif text-white uppercase tracking-wider mb-2.5">
              Settlement Ledger
            </h4>
            <div className="space-y-2">
              {payouts.map(pay => (
                <div
                  key={pay.id}
                  className="p-3 rounded-xl border border-white/[0.06] bg-[#111113] flex items-center justify-between text-xs"
                >
                  <div>
                    <div className="font-serif text-white">
                      Net: €{pay.netAmount} · {pay.bankName}
                    </div>
                    <div className="text-[10px] text-zinc-400 font-mono">
                      {pay.iban.substring(0, 16)}... • {pay.createdAt}
                    </div>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono border ${
                    pay.status === 'completed'
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                      : 'bg-[#C5A880]/10 text-[#C5A880] border-[#C5A880]/20'
                  }`}>
                    {pay.status === 'completed' ? 'Cleared' : 'Pending Verification'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
