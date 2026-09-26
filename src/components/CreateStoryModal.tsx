import React, { useState, useRef } from 'react';
import { X, Upload, Sparkles, Clock, Check, Image as ImageIcon } from 'lucide-react';
import { UserProfile, Story } from '../types';

interface CreateStoryModalProps {
  isOpen: boolean;
  currentUser: UserProfile;
  onClose: () => void;
  onAddStory: (newStory: Story) => void;
}

export const CreateStoryModal: React.FC<CreateStoryModalProps> = ({
  isOpen,
  currentUser,
  onClose,
  onAddStory,
}) => {
  const [mediaUrl, setMediaUrl] = useState<string>('');
  const [caption, setCaption] = useState<string>('');
  const [selectedPresetIndex, setSelectedPresetIndex] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const presets = [
    'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=900&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1519741497674-611481863552?w=900&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=900&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1518495973542-4542c06a5843?w=900&auto=format&fit=crop&q=80',
  ];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const res = event.target?.result as string;
      if (res) {
        setMediaUrl(res);
        setSelectedPresetIndex(null);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalUrl = mediaUrl || (selectedPresetIndex !== null ? presets[selectedPresetIndex] : presets[0]);

    const newStory: Story = {
      id: `story-${Date.now()}`,
      type: 'photo',
      author: {
        id: currentUser.id,
        name: currentUser.name,
        username: currentUser.username,
        avatar: currentUser.avatar,
        isVerified: currentUser.isVerified,
      },
      mediaUrl: finalUrl,
      isViewed: false,
      createdAt: 'Just now',
    };

    onAddStory(newStory);
    onClose();
    setMediaUrl('');
    setCaption('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div
        className="bg-[#09090B] border border-white/[0.12] rounded-2xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 px-5 border-b border-white/[0.08] flex items-center justify-between shrink-0 bg-[#111113]">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-[#C5A880] animate-pulse" />
            <h3 className="font-serif text-sm text-white font-medium">Publish 24h Vignette (Story)</h3>
          </div>
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="p-1 rounded-full text-zinc-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 flex-1 overflow-y-auto">
          {/* Media Preview Box */}
          <div className="relative aspect-[9/14] max-h-[280px] mx-auto rounded-2xl overflow-hidden border border-white/10 bg-[#1A1A1E] flex flex-col items-center justify-center group shadow-inner">
            {mediaUrl || selectedPresetIndex !== null ? (
              <>
                <img
                  src={mediaUrl || presets[selectedPresetIndex!]}
                  alt="Story preview"
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => {
                    setMediaUrl('');
                    setSelectedPresetIndex(null);
                  }}
                  className="absolute top-2.5 right-2.5 p-1.5 rounded-full bg-black/70 text-white hover:bg-black/90 transition-colors cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="flex flex-col items-center justify-center p-6 text-center cursor-pointer w-full h-full hover:bg-white/[0.02] transition-colors"
              >
                <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[#C5A880] mb-2 group-hover:scale-110 transition-transform">
                  <Upload className="w-5 h-5" />
                </div>
                <span className="text-xs font-medium text-zinc-200 block">Select Photo from Device</span>
                <span className="text-[10px] text-zinc-500 font-sans mt-0.5">JPG, PNG, HEIC up to 25MB</span>
              </div>
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileUpload}
          />

          {/* Quick Preset Selection */}
          <div>
            <span className="text-[11px] font-mono text-zinc-400 block mb-2">Or select curated salon visual:</span>
            <div className="grid grid-cols-4 gap-2">
              {presets.map((src, idx) => (
                <button
                  key={idx}
                  type="button"
                  aria-label={`Select preset background ${idx + 1}`}
                  onClick={() => {
                    setSelectedPresetIndex(idx);
                    setMediaUrl('');
                  }}
                  className={`aspect-square rounded-xl overflow-hidden border transition-all relative cursor-pointer ${
                    selectedPresetIndex === idx && !mediaUrl
                      ? 'border-[#C5A880] ring-2 ring-[#C5A880]/40'
                      : 'border-white/10 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={src} alt="preset" className="w-full h-full object-cover" />
                  {selectedPresetIndex === idx && !mediaUrl && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-[#C5A880]">
                      <Check className="w-4 h-4" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Optional Caption */}
          <div>
            <label className="text-[11px] font-mono text-zinc-400 block mb-1">Vignette Caption (Optional)</label>
            <input
              type="text"
              value={caption}
              onChange={e => setCaption(e.target.value)}
              placeholder="Private thought or invitation..."
              className="w-full px-3.5 py-2.5 bg-[#1A1A1E] border border-white/10 rounded-xl text-xs text-white placeholder-zinc-500 outline-none focus:border-[#C5A880]/50"
            />
          </div>

          <div className="flex items-center gap-2 text-[10px] font-mono text-zinc-500 bg-white/[0.03] p-2.5 rounded-xl border border-white/[0.04]">
            <Clock className="w-3.5 h-3.5 text-[#C5A880]" />
            <span>Ephemeral Vignettes self-archive automatically after 24 hours.</span>
          </div>

          {/* Actions */}
          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs rounded-full text-zinc-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs rounded-full bg-[#C5A880] hover:bg-[#B89B6E] text-black font-semibold shadow-md active:scale-95 transition-all cursor-pointer"
            >
              Post Vignette
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
