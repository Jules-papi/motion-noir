import React, { useEffect } from 'react';
import { Shield, ArrowRight, BookOpen, Sparkles, Compass, EyeOff, X } from 'lucide-react';

interface CamouflageViewProps {
  onExitCamouflage: () => void;
}

export const CamouflageView: React.FC<CamouflageViewProps> = ({ onExitCamouflage }) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onExitCamouflage();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onExitCamouflage]);

  return (
    <div className="min-h-screen bg-[#FDFCFB] text-[#1E1E1E] font-serif selection:bg-stone-300 selection:text-black">
      {/* 1. EDITORIAL HEADER */}
      <header className="border-b border-stone-200/80 sticky top-0 bg-[#FDFCFB]/95 backdrop-blur-md z-30">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-xl tracking-[0.25em] font-light uppercase font-serif">
              ATELIER NOIR
            </span>
            <span className="hidden sm:inline text-[11px] font-sans text-stone-400 uppercase tracking-widest pl-3 border-l border-stone-200">
              Journal of Architecture & Space
            </span>
          </div>

          <div className="flex items-center gap-6">
            <nav className="hidden md:flex items-center gap-6 text-xs font-sans uppercase tracking-wider text-stone-600">
              <span className="hover:text-black cursor-pointer">Essays</span>
              <span className="hover:text-black cursor-pointer">Monographs</span>
              <span className="hover:text-black cursor-pointer">Pavilions</span>
              <span className="hover:text-black cursor-pointer">Archive</span>
            </nav>

            {/* Discreet Return Switch */}
            <button
              onClick={onExitCamouflage}
              className="group flex items-center gap-2 px-3 py-1.5 rounded-full border border-stone-300 hover:border-stone-800 text-stone-600 hover:text-black text-xs font-sans transition-all cursor-pointer shadow-xs"
              title="Return to Major Club (Esc)"
            >
              <EyeOff className="w-3.5 h-3.5 text-stone-400 group-hover:text-black transition-colors" />
              <span className="text-[11px] uppercase tracking-wider">Devam Et</span>
              <kbd className="hidden sm:inline text-[9px] bg-stone-100 text-stone-500 px-1.5 py-0.5 rounded-sm border border-stone-200 font-mono">
                ESC
              </kbd>
            </button>
          </div>
        </div>
      </header>

      {/* 2. COVER ESSAY HERO */}
      <main className="max-w-5xl mx-auto px-6 py-12">
        <section className="border-b border-stone-200 pb-12 mb-12">
          <div className="flex items-center gap-2 text-[10px] font-sans uppercase tracking-[0.25em] text-stone-500 mb-3">
            <span>Special Monograph</span>
            <span>·</span>
            <span>Issue 48</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-normal leading-tight tracking-tight mb-6 max-w-3xl">
            The Poetics of Concrete: Brutalist Pavilions and Shadow Studies in Northern Europe
          </h1>

          <p className="text-stone-600 font-sans text-sm sm:text-base leading-relaxed max-w-2xl font-light mb-8">
            An inquiry into the interplay between tactile raw surfaces, monolithic geometry, and natural light filtration across contemporary residential sanctuaries in Rotterdam, Berlin, and Copenhagen.
          </p>

          <div className="w-full aspect-21/9 rounded-lg overflow-hidden bg-stone-200 mb-4 shadow-sm">
            <img
              src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=80"
              alt="Architectural study"
              className="w-full h-full object-cover filter contrast-[1.05] grayscale"
            />
          </div>
          <span className="text-[11px] font-sans text-stone-400 italic block text-right">
            Fig. 1.1 — Spatial study in monolithic limestone and filtered afternoon zenith light.
          </span>
        </section>

        {/* 3. ESSAYS GRID */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <article className="space-y-3">
            <div className="aspect-4/3 rounded-sm overflow-hidden bg-stone-200">
              <img
                src="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=800&q=80"
                alt="Minimalist travertine"
                className="w-full h-full object-cover grayscale contrast-110"
              />
            </div>
            <span className="text-[10px] font-sans text-stone-400 uppercase tracking-widest block">
              Materials & Form
            </span>
            <h3 className="text-lg font-normal leading-snug">
              Travertine Cavities & Tactile Silence
            </h3>
            <p className="text-stone-500 font-sans text-xs leading-relaxed font-light">
              Explorations in monolithic stone cutting and the acoustic properties of underground vaulted cellars.
            </p>
          </article>

          <article className="space-y-3">
            <div className="aspect-4/3 rounded-sm overflow-hidden bg-stone-200">
              <img
                src="https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=800&q=80"
                alt="Shadow study"
                className="w-full h-full object-cover grayscale contrast-110"
              />
            </div>
            <span className="text-[10px] font-sans text-stone-400 uppercase tracking-widest block">
              Light Dynamics
            </span>
            <h3 className="text-lg font-normal leading-snug">
              Chiaroscuro in Interior Design
            </h3>
            <p className="text-stone-500 font-sans text-xs leading-relaxed font-light">
              How private spaces balance visual discretion with expansive spatial intimacy.
            </p>
          </article>

          <article className="space-y-3">
            <div className="aspect-4/3 rounded-sm overflow-hidden bg-stone-200">
              <img
                src="https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=800&q=80"
                alt="Sanctuary design"
                className="w-full h-full object-cover grayscale contrast-110"
              />
            </div>
            <span className="text-[10px] font-sans text-stone-400 uppercase tracking-widest block">
              Spatial Philosophy
            </span>
            <h3 className="text-lg font-normal leading-snug">
              Private Sanctuaries: Architecture of Discretion
            </h3>
            <p className="text-stone-500 font-sans text-xs leading-relaxed font-light">
              The evolution of secluded European salons from 18th-century cabinet parlors to contemporary lofts.
            </p>
          </article>
        </section>

        {/* 4. FOOTER NOTE */}
        <footer className="border-t border-stone-200 pt-8 flex items-center justify-between text-xs font-sans text-stone-400">
          <span>© 2026 Atelier Noir Edition · All rights reserved.</span>
          <button
            onClick={onExitCamouflage}
            className="text-stone-600 hover:text-black underline cursor-pointer"
          >
            Major Club Portalı'na Dön (Esc)
          </button>
        </footer>
      </main>
    </div>
  );
};
