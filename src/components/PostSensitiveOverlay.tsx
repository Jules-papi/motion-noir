import React from 'react';
import { Eye, Shield } from 'lucide-react';

interface PostSensitiveOverlayProps {
  onReveal: () => void;
}

export const PostSensitiveOverlay: React.FC<PostSensitiveOverlayProps> = ({ onReveal }) => {
  return (
    <div className="absolute inset-0 z-20 bg-[#0B0B0D]/85 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center text-[#F4F1EC]">
      <div className="w-10 h-10 rounded-[10px] bg-[#151518] border border-white/[0.08] text-stone-400 flex items-center justify-center mb-3">
        <Shield className="w-4 h-4 text-[#C5A880]" />
      </div>

      <h4 className="font-serif text-base text-[#F4F1EC] font-medium mb-1 tracking-wide">
        Sensitive Content
      </h4>
      <p className="text-xs text-[#9B9894] font-sans font-light max-w-xs mb-5 leading-relaxed">
        This dispatch contains intimate or sensitive photography. You retain full visual control.
      </p>

      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onReveal();
        }}
        className="px-4 py-2 rounded-[10px] text-xs font-serif uppercase tracking-[0.14em] bg-[#1C1C21] hover:bg-[#25252b] text-[#F4F1EC] border border-white/[0.12] hover:border-[#C5A880]/50 flex items-center gap-2 transition-all shadow-xs cursor-pointer"
      >
        <Eye className="w-3.5 h-3.5 text-[#C5A880]" />
        <span>View Media</span>
      </button>
    </div>
  );
};
