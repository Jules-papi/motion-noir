import React, { useState } from 'react';
import { 
  X, 
  Coins, 
  Check, 
  ShieldCheck
} from 'lucide-react';

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  walletBalance: number;
  onAddBalance: (amount: number) => void;
}

export const WalletModal: React.FC<WalletModalProps> = ({
  isOpen,
  onClose,
  walletBalance,
  onAddBalance,
}) => {
  const [selectedTopUp, setSelectedTopUp] = useState<number>(250);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const handleTopUp = () => {
    onAddBalance(selectedTopUp);
    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      onClose();
    }, 1200);
  };

  const topUpOptions = [
    { amount: 100, bonus: null },
    { amount: 250, bonus: '+25 € Privé Credit' },
    { amount: 500, bonus: '+75 € Privé Credit' },
    { amount: 1000, bonus: '+200 € Privé Credit' },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-[#0c0c0e] border border-white/[0.12] rounded-xs w-full max-w-md overflow-hidden shadow-2xl max-h-[90vh] sm:max-h-[85vh] flex flex-col relative">
        {/* Header */}
        <div className="px-5 py-4 border-b border-white/[0.08] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-xs bg-[#161512] border border-amber-600/30 text-amber-200 flex items-center justify-center">
              <Coins className="w-3.5 h-3.5" />
            </div>
            <div>
              <span className="text-[10px] font-mono tracking-widest uppercase text-amber-300 block">
                Maison Treasury
              </span>
              <h3 className="font-serif text-base text-stone-100 font-medium">
                Member Ledger & Vault Reserve
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-stone-400 hover:text-stone-200 p-1 rounded-xs border border-white/[0.06] hover:border-white/20 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-5 space-y-4 flex-1 overflow-y-auto">
          {/* Current Balance Card */}
          <div className="p-5 rounded-xs bg-[#131316] border border-white/[0.08] text-stone-100 relative">
            <span className="text-[10px] font-mono uppercase tracking-widest text-stone-400 block mb-1">
              Available Vault Credit
            </span>
            <div className="font-serif text-3xl font-medium flex items-baseline gap-1.5 text-stone-100">
              <span>{walletBalance}</span>
              <span className="text-base font-mono text-amber-300">€</span>
            </div>
            <div className="mt-3 flex items-center gap-1.5 text-[10px] font-mono text-stone-400">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-300" />
              <span>Simulated Club Vault (Sandbox Environment)</span>
            </div>
          </div>

          {/* Top-up Selection */}
          <div>
            <label className="block text-[10px] font-mono uppercase tracking-wider text-stone-400 mb-2">
              Select Deposit Allotment
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              {topUpOptions.map(opt => (
                <button
                  key={opt.amount}
                  type="button"
                  onClick={() => setSelectedTopUp(opt.amount)}
                  className={`p-3.5 rounded-xs border text-left transition-all relative ${
                    selectedTopUp === opt.amount
                      ? 'border-amber-600/60 bg-[#181613] text-stone-100'
                      : 'border-white/[0.08] bg-[#121215] text-stone-300 hover:border-white/20'
                  }`}
                >
                  <div className="font-serif text-base text-stone-100">
                    +{opt.amount} €
                  </div>
                  {opt.bonus && (
                    <span className="text-[10px] font-mono text-amber-200 block mt-0.5">
                      {opt.bonus}
                    </span>
                  )}
                  {selectedTopUp === opt.amount && (
                    <span className="absolute top-2.5 right-2.5 text-amber-300">
                      <Check className="w-3.5 h-3.5" />
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Details note */}
          <div className="p-3 bg-[#111114] border border-white/[0.06] rounded-xs text-[11px] font-sans font-light text-stone-400 space-y-1 leading-relaxed">
            <span className="text-stone-300 font-serif block text-xs">Ledger Entitlements:</span>
            <p>
              Use vault balance for unsealing confidential plates, securing salon reservations, and commissioning bespoke photo prints.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/[0.08] bg-[#0c0c0e] flex items-center justify-end gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xs text-xs font-mono uppercase tracking-wider text-stone-400 hover:text-stone-200 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleTopUp}
            disabled={isSuccess}
            className="px-5 py-2 rounded-xs font-serif text-xs uppercase tracking-[0.14em] bg-[#161512] hover:bg-[#201d18] text-amber-200 border border-amber-600/40 hover:border-amber-400 transition-all flex items-center gap-2"
          >
            {isSuccess ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Coins className="w-3.5 h-3.5 text-amber-300" />}
            <span>{isSuccess ? 'Credited to Vault' : `Credit +${selectedTopUp} €`}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
