import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Camera, 
  CheckCircle2, 
  Sparkles, 
  X, 
  HandMetal, 
  RefreshCw,
  Lock
} from 'lucide-react';
import { UserProfile } from '../types';

interface KYCModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
  onCompleteVerification: () => void;
}

export const KYCModal: React.FC<KYCModalProps> = ({
  isOpen,
  onClose,
  currentUser: _currentUser,
  onCompleteVerification,
}) => {
  const [step, setStep] = useState<'prompt' | 'capture' | 'analyzing' | 'success'>('prompt');
  const [capturedImage, setCapturedImage] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleStartCapture = () => {
    setStep('capture');
    setTimeout(() => {
      setCapturedImage('https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80');
    }, 900);
  };

  const handleRunAIAnalysis = () => {
    setStep('analyzing');
    setTimeout(() => {
      setStep('success');
      onCompleteVerification();
    }, 2200);
  };

  return (
    <div className="fixed inset-0 z-60 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-[#0C0D11] border border-white/[0.12] rounded-2xl max-w-md w-full p-6 sm:p-7 shadow-2xl relative text-zinc-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-white rounded-full bg-white/5 border border-white/10 transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {step === 'prompt' && (
          <div className="text-center py-1">
            <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-[#181B22] border border-[#E5C590]/30 flex items-center justify-center text-[#E5C590]">
              <ShieldCheck className="w-7 h-7" />
            </div>
            
            <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#E5C590] block mb-1">
              Curator Concierge · Biometric Seal
            </span>
            <h3 className="text-lg font-serif text-white mb-2">
              Identity Attestation & Gesture Seal
            </h3>
            
            <p className="text-xs text-zinc-400 font-sans leading-relaxed mb-5">
              To protect the confidentiality and sanctity of Major Club, every patron confirms their physical identity via a private, zero-storage cryptographic gesture audit.
            </p>

            <div className="bg-[#121419] p-4 rounded-xl border border-white/[0.08] mb-6 text-left">
              <div className="flex items-center gap-2 text-xs font-serif text-[#E5C590] mb-2">
                <HandMetal className="w-4 h-4" />
                <span>Requested Random Gesture Attestation:</span>
              </div>
              <p className="text-xs text-zinc-300 font-sans bg-black/40 p-3 rounded-lg border border-white/5 leading-relaxed">
                "Present a subtle two-finger victory sign beside your temple while facing the ambient lens."
              </p>
            </div>

            <div className="flex items-center gap-2 mb-5 px-3 py-2 rounded-lg bg-black/40 border border-white/5 text-[11px] text-zinc-400 font-mono">
              <Lock className="w-3.5 h-3.5 text-[#E5C590] shrink-0" />
              <span>Biometric vectors encrypted in volatile memory only.</span>
            </div>

            <button
              onClick={handleStartCapture}
              className="w-full py-3 rounded-full font-serif uppercase tracking-[0.14em] text-xs bg-[#E5C590] hover:bg-[#d9b880] text-black font-semibold flex items-center justify-center gap-2 shadow-lg shadow-[#E5C590]/10 transition-all cursor-pointer"
            >
              <Camera className="w-4 h-4" />
              <span>Activate Sensor & Capture</span>
            </button>
          </div>
        )}

        {step === 'capture' && (
          <div className="text-center py-1">
            <h4 className="text-sm font-serif text-white mb-3">
              Optical Viewfinder · Align Gesture
            </h4>
            <div className="relative w-64 h-64 mx-auto rounded-2xl overflow-hidden border border-[#E5C590]/40 bg-black flex items-center justify-center mb-5">
              {capturedImage ? (
                <img src={capturedImage} alt="Attestation Selfie" className="w-full h-full object-cover" />
              ) : (
                <div className="flex flex-col items-center gap-2 text-zinc-500 text-xs animate-pulse font-mono">
                  <Camera className="w-8 h-8 text-[#E5C590]" />
                  <span>Connecting encrypted feed...</span>
                </div>
              )}
              <div className="absolute top-2.5 right-2.5 bg-black/80 px-2.5 py-1 rounded-full text-[10px] text-[#E5C590] font-mono border border-white/10">
                Gesture Recognized ✓
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setCapturedImage(null)}
                className="flex-1 py-2.5 rounded-full text-xs font-serif uppercase tracking-[0.12em] bg-[#181B22] border border-white/10 text-zinc-300 hover:text-white transition-colors cursor-pointer"
              >
                Re-capture
              </button>
              <button
                onClick={handleRunAIAnalysis}
                className="flex-1 py-2.5 rounded-full text-xs font-serif uppercase tracking-[0.12em] bg-[#E5C590] hover:bg-[#d9b880] text-black font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Submit to Notary</span>
              </button>
            </div>
          </div>
        )}

        {step === 'analyzing' && (
          <div className="text-center py-9">
            <RefreshCw className="w-9 h-9 text-[#E5C590] animate-spin mx-auto mb-4" />
            <h4 className="text-base font-serif text-white mb-2">
              Cryptographic Notarization
            </h4>
            <p className="text-xs text-zinc-400 font-sans mb-5 max-w-xs mx-auto leading-relaxed">
              Synthesizing gesture attestation with your private dossier credentials...
            </p>
            <div className="w-48 mx-auto h-1 bg-white/10 rounded-full overflow-hidden">
              <div className="h-full bg-[#E5C590] animate-pulse w-3/4 rounded-full" />
            </div>
          </div>
        )}

        {step === 'success' && (
          <div className="text-center py-4">
            <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h4 className="text-base font-serif text-white mb-1">
              Biometric Attestation Affixed
            </h4>
            <p className="text-xs text-zinc-400 mb-4 font-sans leading-relaxed">
              Authenticity score: <strong className="text-emerald-400 font-mono">99.8%</strong>. The verified seal has been permanently attached to your dossier.
            </p>
            <div className="mb-5 px-3 py-1.5 rounded-lg bg-black/40 text-[#E5C590] text-[11px] font-mono border border-white/10">
              Attestation Hash: 0x882a...9c41 (Verified on Private Chain)
            </div>
            <button
              onClick={onClose}
              className="w-full py-2.5 rounded-full font-serif uppercase tracking-[0.14em] text-xs bg-[#181B22] border border-[#E5C590]/40 text-[#E5C590] hover:bg-[#20242e] transition-colors cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
