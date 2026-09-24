import React, { useState, useEffect } from 'react';
import { ShieldAlert, X, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { ReportItem } from '../types';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  target: {
    type: 'user' | 'post' | 'message' | 'event';
    title: string;
    id: string;
  } | null;
  onSubmitReport: (report: Omit<ReportItem, 'id' | 'createdAt' | 'status' | 'aiRiskScore' | 'aiFlagReason'>) => void;
}

export const ReportModal: React.FC<ReportModalProps> = ({
  isOpen,
  onClose,
  target,
  onSubmitReport,
}) => {
  const [reason, setReason] = useState<string>('Spam / Solicitation');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !target) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;

    onSubmitReport({
      reporterName: 'Attested Member',
      targetType: target.type,
      targetTitle: target.title,
      targetId: target.id,
      reason,
      description: description.trim(),
    });

    setDescription('');
    onClose();
  };

  const reasons: string[] = [
    'Spam / Solicitation',
    'Harassment / Conduct Violation',
    'Impersonation / Fake Dossier',
    'Inappropriate Content',
    'Deceptive / Fraudulent Activity',
  ];

  return (
    <div 
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 cursor-pointer animate-in fade-in duration-150"
    >
      <div 
        onClick={e => e.stopPropagation()}
        className="bg-[#0c0d11] border border-white/[0.12] rounded-2xl p-6 sm:p-7 max-w-md w-full space-y-5 shadow-2xl relative cursor-default"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full text-zinc-400 hover:text-white hover:bg-white/[0.06] transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-center justify-center shrink-0">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-mono tracking-widest uppercase text-rose-400 block">
              Discretion & Trust
            </span>
            <h3 className="font-serif text-lg text-white font-medium tracking-tight">
              File Confidential Report
            </h3>
            <p className="text-xs text-zinc-400 font-sans mt-0.5">
              Subject: <span className="text-zinc-200 font-medium">{target.title}</span>
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs font-sans">
          <div>
            <label className="font-mono text-[11px] uppercase tracking-wider text-zinc-400 block mb-2">
              Infraction Category
            </label>
            <div className="space-y-2">
              {reasons.map(r => (
                <label
                  key={r}
                  className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                    reason === r
                      ? 'border-rose-500/60 bg-rose-500/10 text-white font-medium'
                      : 'border-white/[0.08] bg-[#14161C] hover:border-white/20 text-zinc-400 hover:text-white'
                  }`}
                >
                  <span className="text-xs">{r}</span>
                  <input
                    type="radio"
                    name="reason"
                    checked={reason === r}
                    onChange={() => setReason(r)}
                    className="accent-rose-500"
                  />
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="font-mono text-[11px] uppercase tracking-wider text-zinc-400 block mb-1.5">
              Confidential Particulars
            </label>
            <textarea
              rows={3}
              required
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Provide context or observe conduct regarding this incident..."
              className="w-full p-3 rounded-xl bg-[#14161C] border border-white/[0.08] text-white placeholder-zinc-500 text-xs focus:outline-none focus:border-[#E5C590]/50"
            />
          </div>

          <div className="bg-[#181B22] p-3 rounded-xl border border-white/[0.06] text-[11px] text-zinc-400 leading-relaxed font-sans">
            Your incident record is encrypted and forwarded directly to the Major Club Trust & Discretion council.
          </div>

          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-full text-xs font-sans text-zinc-400 hover:text-white border border-white/[0.08] hover:border-white/20 cursor-pointer transition-colors"
            >
              Dismiss
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-full text-xs font-sans font-medium bg-rose-600 hover:bg-rose-500 text-white shadow-md active:scale-95 transition-all cursor-pointer"
            >
              Transmit Report
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
