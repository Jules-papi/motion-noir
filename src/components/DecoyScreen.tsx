import React from 'react';
import { ArrowUpRight, TrendingUp, Shield, BarChart3, Globe, Lock } from 'lucide-react';

interface DecoyScreenProps {
  onDismiss: () => void;
}

export const DecoyScreen: React.FC<DecoyScreenProps> = ({ onDismiss }) => {
  return (
    <div className="fixed inset-0 z-50 bg-[#0F1115] text-zinc-300 font-sans overflow-y-auto select-none animate-in fade-in duration-100">
      {/* Editorial Header */}
      <header className="border-b border-zinc-800 bg-[#0B0C0E] sticky top-0 z-10 px-6 py-3">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="font-serif text-lg tracking-wider uppercase text-zinc-100 font-bold">
              THE FINANCIAL & ARTS REVIEW
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-400">
              VOL. XLVIII • GLOBAL MARKETS
            </span>
          </div>
          <div className="flex items-center gap-4 text-xs font-mono text-zinc-400">
            <span>ZURICH • LONDON • TOKYO</span>
            <button
              onClick={onDismiss}
              className="px-3 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs transition-colors flex items-center gap-1.5 cursor-pointer border border-zinc-700"
              title="Devam etmek için tıklayın (veya ESC tuşuna basın)"
            >
              <Lock className="w-3 h-3 text-zinc-400" />
              <span>Geri Dön (ESC)</span>
            </button>
          </div>
        </div>
      </header>

      {/* Market Ticker */}
      <div className="bg-[#14161C] border-b border-zinc-800/80 px-6 py-1.5 overflow-x-auto text-[11px] font-mono text-zinc-400 flex items-center gap-8 no-scrollbar">
        <div className="flex items-center gap-1.5">
          <span className="text-zinc-500">S&P 500</span>
          <span className="text-zinc-200">5,864.20</span>
          <span className="text-emerald-400 flex items-center">+0.42% <ArrowUpRight className="w-3 h-3 inline" /></span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-zinc-500">FTSE 100</span>
          <span className="text-zinc-200">8,241.10</span>
          <span className="text-emerald-400 flex items-center">+0.18% <ArrowUpRight className="w-3 h-3 inline" /></span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-zinc-500">GOLD (XAU/USD)</span>
          <span className="text-zinc-200">$2,714.80</span>
          <span className="text-emerald-400 flex items-center">+0.65% <ArrowUpRight className="w-3 h-3 inline" /></span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-zinc-500">FINE WINE 100</span>
          <span className="text-zinc-200">384.2 pts</span>
          <span className="text-emerald-400 flex items-center">+0.12%</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-zinc-500">CONTEMP. ART INDEX</span>
          <span className="text-zinc-200">1,420.50</span>
          <span className="text-zinc-400">0.00%</span>
        </div>
      </div>

      {/* Main Newspaper / Editorial Grid */}
      <main className="max-w-6xl mx-auto p-6 md:p-10 space-y-8">
        <div className="border-b border-zinc-800 pb-4">
          <span className="text-xs font-mono text-amber-500/80 uppercase tracking-widest">
            Special Report • Macroeconomic Horizons
          </span>
          <h1 className="font-serif text-3xl md:text-4xl text-zinc-100 font-normal mt-1 leading-tight">
            European Private Real Estate & High-Yield Asset Portfolios Show Resilient Growth
          </h1>
          <p className="text-xs font-sans text-zinc-400 mt-2">
            By Julian De Vries, Senior Market Analyst in Amsterdam & London | Updated 14 minutes ago
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Main Column */}
          <div className="md:col-span-2 space-y-4 text-sm text-zinc-300 leading-relaxed font-sans">
            <p>
              Capital allocation across Western European metropolitan hubs continues to favor discreet family office syndicates and private wealth holding vehicles. The demand for architectural heritage estates in Amsterdam, Geneva, and Milan has increased institutional valuation benchmarks by 4.8% quarter-over-quarter.
            </p>
            <p>
              Meanwhile, alternative asset classes—spanning collectible timepieces, modern figurative sculpture, and blue-chip art auctions—have demonstrated low correlation to sovereign yield volatility.
            </p>

            <div className="p-4 rounded-xl bg-[#14171E] border border-zinc-800 my-6 space-y-2">
              <div className="flex items-center justify-between text-xs font-mono text-zinc-400">
                <span className="flex items-center gap-1.5">
                  <BarChart3 className="w-4 h-4 text-amber-400" />
                  Asset Yield Distribution Q3/Q4
                </span>
                <span>EUR Base Currency</span>
              </div>
              <div className="h-2 bg-zinc-800 rounded-full overflow-hidden flex">
                <div className="bg-amber-600 h-full w-[45%]" />
                <div className="bg-emerald-600 h-full w-[30%]" />
                <div className="bg-blue-600 h-full w-[25%]" />
              </div>
              <div className="flex justify-between text-[10px] font-mono text-zinc-500 pt-1">
                <span>Real Estate (45%)</span>
                <span>Equities (30%)</span>
                <span>Private Equity (25%)</span>
              </div>
            </div>

            <p>
              Analysts recommend long-duration portfolio hedging strategies, prioritizing unencumbered liquid reserves alongside resilient private equity structures.
            </p>
          </div>

          {/* Sidebar Analysis */}
          <div className="space-y-6">
            <div className="p-4 rounded-xl bg-[#14161C] border border-zinc-800 space-y-3">
              <span className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                Key Economic Indicators
              </span>
              <ul className="text-xs space-y-2.5 font-mono text-zinc-300">
                <li className="flex justify-between border-b border-zinc-800/60 pb-1">
                  <span className="text-zinc-500">ECB Deposit Rate:</span>
                  <span>3.25%</span>
                </li>
                <li className="flex justify-between border-b border-zinc-800/60 pb-1">
                  <span className="text-zinc-500">EUR/USD:</span>
                  <span>1.0864</span>
                </li>
                <li className="flex justify-between border-b border-zinc-800/60 pb-1">
                  <span className="text-zinc-500">Brent Crude:</span>
                  <span>$74.30</span>
                </li>
                <li className="flex justify-between">
                  <span className="text-zinc-500">10Y Bund Yield:</span>
                  <span>2.18%</span>
                </li>
              </ul>
            </div>

            <div className="p-4 rounded-xl bg-[#14161C] border border-zinc-800 text-xs space-y-2">
              <span className="font-serif text-sm text-zinc-200 font-medium block">
                Contemporary Art Index Notice
              </span>
              <p className="text-zinc-400 leading-normal">
                Autumn international auctions in Paris and Basel recorded strong participation from independent European collections.
              </p>
            </div>
          </div>
        </div>

        {/* Discreet Return Footer */}
        <div className="pt-8 border-t border-zinc-800/60 flex items-center justify-between text-xs text-zinc-500">
          <span>© 2026 Financial & Arts Global Advisory Group. All rights reserved.</span>
          <button
            onClick={onDismiss}
            className="hover:text-zinc-300 transition-colors underline cursor-pointer text-[11px] font-mono"
          >
            Major Club'a Geri Dön
          </button>
        </div>
      </main>
    </div>
  );
};
