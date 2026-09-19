import React, { useState } from 'react';
import { 
  X, 
  Coins, 
  Check, 
  ShieldCheck, 
  TrendingUp, 
  TrendingDown, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Gift, 
  PieChart, 
  History, 
  Landmark, 
  Sparkles,
  CreditCard
} from 'lucide-react';

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  walletBalance: number;
  onAddBalance: (amount: number) => void;
  onOpenPayout?: () => void;
}

export const WalletModal: React.FC<WalletModalProps> = ({
  isOpen,
  onClose,
  walletBalance,
  onAddBalance,
  onOpenPayout,
}) => {
  const [activeTab, setActiveTab] = useState<'topup' | 'analytics' | 'history'>('topup');
  const [selectedTopUp, setSelectedTopUp] = useState<number>(250);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const handleTopUp = () => {
    const amount = customAmount ? parseInt(customAmount, 10) : selectedTopUp;
    if (isNaN(amount) || amount <= 0) return;

    onAddBalance(amount);
    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      setCustomAmount('');
      onClose();
    }, 1000);
  };

  const topUpOptions = [
    { amount: 50, bonus: null },
    { amount: 100, bonus: '+10 € Privé' },
    { amount: 250, bonus: '+35 € Privé' },
    { amount: 500, bonus: '+90 € Privé' },
    { amount: 1000, bonus: '+250 € Privé VIP' },
  ];

  const transactions = [
    { id: 'tx-1', type: 'expense', title: 'Amsterdam Secret Villa Salon Bileti', category: 'Etkinlik', amount: -350, date: 'Bugün 14:10', icon: Landmark },
    { id: 'tx-2', type: 'income', title: 'Kapadokya Serisi PPV Kilit Satışı', category: 'PPV Geliri', amount: +85, date: 'Dün 22:30', icon: ArrowDownLeft },
    { id: 'tx-3', type: 'income', title: 'Derin Kaya Gönderi Bahşişi (Tip)', category: 'Bahşiş', amount: +25, date: 'Dün 18:15', icon: Gift },
    { id: 'tx-4', type: 'deposit', title: 'Kredi Kartı / iDEAL Bakiye Yükleme', category: 'Yükleme', amount: +500, date: '2 gün önce', icon: ArrowUpRight },
    { id: 'tx-5', type: 'expense', title: 'Sensual Monochrome Plate Kilit Açma', category: 'PPV İçerik', amount: -45, date: '3 gün önce', icon: TrendingDown },
  ];

  const spendingAnalytics = [
    { label: 'Özel Salon & Etkinlik Biletleri', percent: 55, amount: '€ 450', color: 'bg-[#E5C590]' },
    { label: 'PPV İçerik & Kilit Açma', percent: 25, amount: '€ 185', color: 'bg-indigo-400' },
    { label: 'İçerik Üreticilerine Bahşiş (Tips)', percent: 12, amount: '€ 95', color: 'bg-rose-400' },
    { label: 'Kulüp & Topluluk Üyelikleri', percent: 8, amount: '€ 60', color: 'bg-emerald-400' },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
      <div className="bg-[#0c0c0e] border border-white/[0.12] rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl max-h-[92vh] flex flex-col relative text-[#F4F1EC]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-white/[0.08] flex items-center justify-between bg-[#121419] shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-[#1A1D24] border border-[#E5C590]/30 text-[#E5C590] flex items-center justify-center">
              <Coins className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-mono tracking-widest uppercase text-[#E5C590] block">
                Maison Noir Treasury
              </span>
              <h3 className="font-serif text-base text-white font-medium">
                Üye Kasası & Cüzdan Merkezi
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 px-5 pt-3 pb-2 bg-[#121419]/60 border-b border-white/[0.04]">
          <button
            onClick={() => setActiveTab('topup')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-serif uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'topup'
                ? 'bg-[#1E222B] text-[#E5C590] border border-[#E5C590]/40 shadow-sm'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Coins className="w-3.5 h-3.5" />
            <span>Bakiye Yükle</span>
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-serif uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'analytics'
                ? 'bg-[#1E222B] text-[#E5C590] border border-[#E5C590]/40 shadow-sm'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <PieChart className="w-3.5 h-3.5" />
            <span>Harcama Analizi</span>
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-serif uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'history'
                ? 'bg-[#1E222B] text-[#E5C590] border border-[#E5C590]/40 shadow-sm'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>İşlem Geçmişi</span>
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-5 flex-1 overflow-y-auto">
          {/* Current Balance Card */}
          <div className="p-4 sm:p-5 rounded-xl bg-[#14161D] border border-white/[0.08] relative overflow-hidden">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-400 block mb-1">
                  Kullanılabilir Kasa Bakiyesi
                </span>
                <div className="font-serif text-3xl sm:text-4xl font-light flex items-baseline gap-2 text-white">
                  <span>{walletBalance}</span>
                  <span className="text-base font-mono text-[#E5C590]">€</span>
                </div>
              </div>

              {onOpenPayout && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenPayout();
                  }}
                  className="px-3.5 py-2 rounded-xl bg-[#1D212B] hover:bg-[#252A38] text-xs font-serif uppercase tracking-wider text-[#E5C590] border border-[#E5C590]/30 transition-colors cursor-pointer"
                >
                  IBAN Çekim Talebi
                </button>
              )}
            </div>

            <div className="mt-3 pt-3 border-t border-white/[0.06] flex items-center justify-between text-[10px] font-mono text-zinc-400">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                Avrupa Birliği Bankacılık Güvencesi & Escrow Kasa
              </span>
            </div>
          </div>

          {activeTab === 'topup' && (
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-mono uppercase tracking-wider text-zinc-400 mb-2">
                  Hazır Paket Seçin
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {topUpOptions.map(opt => (
                    <button
                      key={opt.amount}
                      type="button"
                      onClick={() => {
                        setSelectedTopUp(opt.amount);
                        setCustomAmount('');
                      }}
                      className={`p-3 rounded-xl border text-left transition-all relative cursor-pointer ${
                        selectedTopUp === opt.amount && !customAmount
                          ? 'border-[#E5C590]/70 bg-[#1A1D24] text-white shadow-sm'
                          : 'border-white/[0.06] bg-[#121419] text-zinc-300 hover:border-white/20'
                      }`}
                    >
                      <div className="font-serif text-base text-white font-medium">
                        +{opt.amount} €
                      </div>
                      {opt.bonus && (
                        <span className="text-[10px] font-mono text-[#E5C590] block mt-0.5">
                          {opt.bonus}
                        </span>
                      )}
                      {selectedTopUp === opt.amount && !customAmount && (
                        <span className="absolute top-2.5 right-2.5 text-[#E5C590]">
                          <Check className="w-3.5 h-3.5" />
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom amount */}
              <div>
                <label className="block text-[10px] font-mono uppercase tracking-wider text-zinc-400 mb-1.5">
                  veya Özel Miktar Girin (€)
                </label>
                <input
                  type="number"
                  placeholder="Örn: 150"
                  value={customAmount}
                  onChange={e => {
                    setCustomAmount(e.target.value);
                  }}
                  className="w-full bg-[#121419] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white font-mono placeholder-zinc-500 focus:outline-hidden focus:border-[#E5C590]"
                />
              </div>

              {/* Payment methods support */}
              <div className="p-3 bg-[#121419] rounded-xl border border-white/[0.06] flex items-center justify-between text-xs text-zinc-400 font-mono">
                <span className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-[#E5C590]" />
                  <span>iDEAL, Mastercard, Visa, Apple Pay</span>
                </span>
                <span className="text-[10px] text-emerald-400 font-medium">Anında Yükleme</span>
              </div>
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="space-y-4">
              <span className="text-[10px] font-mono tracking-widest text-zinc-400 uppercase block">
                Son 30 Günlük Harcama & Dağılım
              </span>

              {/* Visual Breakdown Bars */}
              <div className="space-y-3">
                {spendingAnalytics.map((item, idx) => (
                  <div key={idx} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-sans">
                      <span className="text-zinc-300">{item.label}</span>
                      <span className="font-mono text-white font-medium">{item.amount} ({item.percent}%)</span>
                    </div>
                    <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${item.color} rounded-full transition-all duration-500`}
                        style={{ width: `${item.percent}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2 font-mono text-xs">
                <div className="p-3 rounded-xl bg-[#121419] border border-white/5">
                  <span className="text-zinc-500 block text-[10px] uppercase">Toplam Harcama</span>
                  <span className="text-rose-400 font-serif text-lg font-medium block mt-1">- € 790</span>
                </div>
                <div className="p-3 rounded-xl bg-[#121419] border border-white/5">
                  <span className="text-zinc-500 block text-[10px] uppercase">Toplam Kazanç / Bahşiş</span>
                  <span className="text-emerald-400 font-serif text-lg font-medium block mt-1">+ € 310</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'history' && (
            <div className="space-y-3">
              <span className="text-[10px] font-mono tracking-widest text-zinc-400 uppercase block">
                Son İşlemler
              </span>
              <div className="space-y-2">
                {transactions.map(tx => {
                  const Icon = tx.icon;
                  const isIncome = tx.amount > 0;
                  return (
                    <div
                      key={tx.id}
                      className="p-3 rounded-xl bg-[#121419] border border-white/[0.04] flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                          isIncome ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                        }`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="text-xs font-sans text-white font-medium block truncate max-w-[200px] sm:max-w-xs">
                            {tx.title}
                          </span>
                          <span className="text-[10px] font-mono text-zinc-500 block">
                            {tx.category} · {tx.date}
                          </span>
                        </div>
                      </div>

                      <span className={`font-mono text-xs font-medium shrink-0 ${
                        isIncome ? 'text-emerald-400' : 'text-rose-400'
                      }`}>
                        {isIncome ? `+€${tx.amount}` : `-€${Math.abs(tx.amount)}`}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {activeTab === 'topup' && (
          <div className="p-4 border-t border-white/[0.08] bg-[#0c0c0e] flex items-center justify-end gap-3 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-mono uppercase tracking-wider text-zinc-400 hover:text-white transition-colors cursor-pointer"
            >
              Vazgeç
            </button>
            <button
              type="button"
              onClick={handleTopUp}
              disabled={isSuccess}
              className="px-5 py-2.5 rounded-xl font-serif text-xs uppercase tracking-[0.14em] bg-white hover:bg-zinc-200 text-black font-semibold transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSuccess ? <Check className="w-4 h-4 text-emerald-600" /> : <Coins className="w-4 h-4 text-[#C5A880]" />}
              <span>{isSuccess ? 'Kasaya Eklendi' : `Yükle +${customAmount || selectedTopUp} €`}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
