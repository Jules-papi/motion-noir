import React, { useState } from 'react';
import { MessageSquare, X } from 'lucide-react';
import { ForumCategory } from '../types';

interface CreateTopicModalProps {
  isOpen: boolean;
  categories: ForumCategory[];
  onClose: () => void;
  onCreateTopic: (topic: { title: string; content: string; categoryId: string; tags: string[] }) => void;
}

export const CreateTopicModal: React.FC<CreateTopicModalProps> = ({
  isOpen,
  categories,
  onClose,
  onCreateTopic,
}) => {
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newCatId, setNewCatId] = useState(categories[0]?.id || 'cat-general');
  const [newTagsStr, setNewTagsStr] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;
    const tags = newTagsStr
      .split(',')
      .map(t => t.trim())
      .filter(Boolean);
    onCreateTopic({
      title: newTitle,
      content: newContent,
      categoryId: newCatId,
      tags,
    });
    setNewTitle('');
    setNewContent('');
    setNewTagsStr('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden max-h-[90vh] sm:max-h-[85vh] flex flex-col relative">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between shrink-0">
          <h3 className="font-extrabold text-base text-zinc-900 dark:text-white flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-rose-500" />
            <span>Yeni Forum Başlığı Aç</span>
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
              <label className="font-semibold block mb-1">Kategori</label>
              <select
                value={newCatId}
                onChange={e => setNewCatId(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 border-none text-zinc-900 dark:text-white outline-hidden"
              >
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-semibold block mb-1">Başlık</label>
              <input
                type="text"
                required
                value={newTitle}
                onChange={e => setNewTitle(e.target.value)}
                placeholder="Açıklayıcı ve dikkat çekici bir konu başlığı..."
                className="w-full p-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 border-none text-zinc-900 dark:text-white outline-hidden focus:ring-2 focus:ring-rose-500"
              />
            </div>

            <div>
              <label className="font-semibold block mb-1">İçerik & Açıklama</label>
              <textarea
                rows={4}
                required
                value={newContent}
                onChange={e => setNewContent(e.target.value)}
                placeholder="Görüşlerinizi, sorularınızı veya deneyimlerinizi detaylandırın..."
                className="w-full p-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 border-none text-zinc-900 dark:text-white outline-hidden focus:ring-2 focus:ring-rose-500"
              />
            </div>

            <div>
              <label className="font-semibold block mb-1">Etiketler (Virgülle ayırın)</label>
              <input
                type="text"
                value={newTagsStr}
                onChange={e => setNewTagsStr(e.target.value)}
                placeholder="Örn: Fotoğrafçılık, GeceÇekimi"
                className="w-full p-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 border-none text-zinc-900 dark:text-white outline-hidden"
              />
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
              Konuyu Başlat
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
