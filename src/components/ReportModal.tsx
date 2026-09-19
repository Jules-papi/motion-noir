import React, { useState } from 'react';
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
  const [reason, setReason] = useState<ReportItem['reason']>('Spam / Reklam');
  const [description, setDescription] = useState('');

  if (!isOpen || !target) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;

    onSubmitReport({
      reporterName: 'Siz (Doğrulanmış Kullanıcı)',
      targetType: target.type,
      targetTitle: target.title,
      targetId: target.id,
      reason,
      description: description.trim(),
    });

    setDescription('');
    onClose();
  };

  const reasons: ReportItem['reason'][] = [
    'Spam / Reklam',
    'Taciz / Zorbalık',
    'Sahte Hesap',
    'Uygunsuz NSFW',
    'Dolandırıcılık',
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center shrink-0">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-base text-zinc-900 dark:text-white">
              Şikayet Bildirimi Oluştur
            </h3>
            <p className="text-xs text-zinc-400">
              Hedef: <strong>{target.title}</strong>
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="font-semibold block mb-1.5 text-zinc-700 dark:text-zinc-300">
              İhlal Nedeni
            </label>
            <div className="space-y-1.5">
              {reasons.map(r => (
                <label
                  key={r}
                  className={`flex items-center justify-between p-2.5 rounded-xl border cursor-pointer transition-colors ${
                    reason === r
                      ? 'border-rose-500 bg-rose-50/50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-300 font-semibold'
                      : 'border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/40 text-zinc-600 dark:text-zinc-400'
                  }`}
                >
                  <span>{r}</span>
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
            <label className="font-semibold block mb-1 text-zinc-700 dark:text-zinc-300">
              Detaylı Açıklama
            </label>
            <textarea
              rows={3}
              required
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Gözlemlediğiniz ihlali veya rahatsız edici durumu açıklayın..."
              className="w-full p-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 border-none text-zinc-900 dark:text-white outline-hidden focus:ring-2 focus:ring-rose-500"
            />
          </div>

          <div className="bg-amber-500/10 p-3 rounded-xl border border-amber-500/20 text-[11px] text-amber-600 dark:text-amber-400 leading-relaxed">
            Bildiriminiz AI Güvenlik Motoru tarafından taranacak ve moderatör inceleme sırasına alınacaktır.
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-xl font-bold text-xs bg-rose-600 hover:bg-rose-500 text-white shadow-md active:scale-95 transition-all"
          >
            Şikayeti Gönder
          </button>
        </form>
      </div>
    </div>
  );
};
