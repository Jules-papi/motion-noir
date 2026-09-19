import React, { useState } from 'react';
import { Calendar, X } from 'lucide-react';
import { PlatformEvent } from '../types';

interface CreateEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateEvent: (newEvent: Partial<PlatformEvent>) => void;
}

export const CreateEventModal: React.FC<CreateEventModalProps> = ({
  isOpen,
  onClose,
  onCreateEvent,
}) => {
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newCity, setNewCity] = useState('İstanbul');
  const [newVenue, setNewVenue] = useState('');
  const [newPrice, setNewPrice] = useState(250);
  const [newCapacity, setNewCapacity] = useState(50);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    onCreateEvent({
      title: newTitle,
      description: newDesc,
      city: newCity,
      venue: newVenue,
      price: newPrice,
      capacity: newCapacity,
    });
    setNewTitle('');
    setNewDesc('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl max-w-md w-full shadow-2xl overflow-hidden max-h-[90vh] sm:max-h-[85vh] flex flex-col relative">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between shrink-0">
          <h3 className="font-extrabold text-base text-zinc-900 dark:text-white flex items-center gap-2">
            <Calendar className="w-5 h-5 text-rose-500" />
            <span>Yeni Etkinlik Oluştur</span>
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form with scrollable body and sticky footer */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="p-4 sm:p-5 space-y-3 text-xs flex-1 overflow-y-auto">
            <div>
              <label className="font-semibold block mb-1">Etkinlik Başlığı</label>
              <input
                type="text"
                required
                value={newTitle}
                onChange={e => setNewTitle(e.target.value)}
                placeholder="Örn: Bebek Sahil Sunset Kokteyl"
                className="w-full p-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 border-none text-zinc-900 dark:text-white outline-hidden focus:ring-2 focus:ring-rose-500"
              />
            </div>

            <div>
              <label className="font-semibold block mb-1">Açıklama</label>
              <textarea
                rows={2}
                value={newDesc}
                onChange={e => setNewDesc(e.target.value)}
                placeholder="Etkinliğin konsepti, müzik tarzı ve katılımcı profili..."
                className="w-full p-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 border-none text-zinc-900 dark:text-white outline-hidden focus:ring-2 focus:ring-rose-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-semibold block mb-1">Şehir</label>
                <select
                  value={newCity}
                  onChange={e => setNewCity(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 border-none text-zinc-900 dark:text-white outline-hidden"
                >
                  <option value="İstanbul">İstanbul</option>
                  <option value="İzmir">İzmir</option>
                  <option value="Muğla">Muğla (Bodrum)</option>
                  <option value="Nevşehir">Nevşehir</option>
                </select>
              </div>
              <div>
                <label className="font-semibold block mb-1">Mekan</label>
                <input
                  type="text"
                  required
                  value={newVenue}
                  onChange={e => setNewVenue(e.target.value)}
                  placeholder="Örn: Lucca Lounge"
                  className="w-full p-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 border-none text-zinc-900 dark:text-white outline-hidden"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-semibold block mb-1">Bilet Fiyatı (₺)</label>
                <input
                  type="number"
                  value={newPrice}
                  onChange={e => setNewPrice(Number(e.target.value))}
                  className="w-full p-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 border-none text-zinc-900 dark:text-white outline-hidden"
                />
              </div>
              <div>
                <label className="font-semibold block mb-1">Maksimum Kontenjan</label>
                <input
                  type="number"
                  value={newCapacity}
                  onChange={e => setNewCapacity(Number(e.target.value))}
                  className="w-full p-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 border-none text-zinc-900 dark:text-white outline-hidden"
                />
              </div>
            </div>
          </div>

          {/* Sticky Actions Footer */}
          <div className="p-3.5 sm:p-4 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50/95 dark:bg-zinc-900/95 backdrop-blur-xs flex items-center justify-end gap-2.5 shrink-0 sticky bottom-0 z-10 pb-[max(0.875rem,env(safe-area-inset-bottom))]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              Vazgeç
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl font-bold text-xs bg-gradient-to-r from-rose-500 to-purple-600 text-white shadow-md active:scale-95 transition-all"
            >
              Etkinliği Yayınla
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
