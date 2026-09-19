import React, { useState, useEffect, useRef } from 'react';
import { Post, PostType, UserProfile } from '../types';
import { 
  X, 
  Image as ImageIcon, 
  Video as VideoIcon, 
  FileText, 
  Crown, 
  Coins, 
  Check,
  Upload
} from 'lucide-react';

interface CreatePostModalProps {
  currentUser: UserProfile;
  isOpen: boolean;
  onClose: () => void;
  onSubmitPost: (newPost: Partial<Post>) => void;
}

export const CreatePostModal: React.FC<CreatePostModalProps> = ({
  currentUser,
  isOpen,
  onClose,
  onSubmitPost,
}) => {
  const [postType, setPostType] = useState<PostType>('photo');
  const [content, setContent] = useState('');
  const [mediaUrl, setMediaUrl] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [isSubscribersOnly, setIsSubscribersOnly] = useState(false);
  const [isPPV, setIsPPV] = useState(false);
  const [unlockPrice, setUnlockPrice] = useState<number>(100);
  const [isSensitive, setIsSensitive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        setMediaUrl(result);
      }
    };
    reader.readAsDataURL(file);
  };

  const samplePhotos = [
    'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1518495973542-4542c06a5843?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1200&q=80',
  ];

  const sampleVideos = [
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() && !mediaUrl && !videoUrl) return;

    const tags = tagsInput
      .split(/[,#\s]+/)
      .map(t => t.trim())
      .filter(Boolean);

    const newPost: Partial<Post> = {
      author: currentUser,
      type: postType,
      content,
      mediaUrl: postType === 'video' ? videoUrl : (mediaUrl || samplePhotos[0]),
      thumbnailUrl: postType === 'video' ? samplePhotos[1] : (mediaUrl || samplePhotos[0]),
      previewBlurUrl: (isSubscribersOnly || isPPV) ? samplePhotos[3] : undefined,
      isSubscribersOnly: postType !== 'text' && isSubscribersOnly,
      isPPV: postType !== 'text' && isPPV,
      isSensitive,
      unlockPrice: isPPV ? unlockPrice : undefined,
      isUnlocked: false,
      likesCount: 0,
      commentsCount: 0,
      sharesCount: 0,
      createdAt: 'Just now',
      tags,
      isLiked: false,
      isSaved: false,
    };

    onSubmitPost(newPost);
    setContent('');
    setMediaUrl('');
    setVideoUrl('');
    setTagsInput('');
    setIsSubscribersOnly(false);
    setIsPPV(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xs">
      <div 
        className="bg-[#0c0c0e] border border-white/[0.12] rounded-xs w-full max-w-lg shadow-2xl overflow-hidden max-h-[90vh] sm:max-h-[85vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-5 border-b border-white/[0.08] flex items-center justify-between shrink-0">
          <div>
            <span className="text-[10px] font-mono tracking-widest uppercase text-amber-300 block">
              Maison Member Dispatch
            </span>
            <h3 className="font-serif text-lg text-stone-100 font-medium">Publish Private Dispatch</h3>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-xs text-stone-400 hover:text-stone-200 border border-white/[0.06] hover:border-white/20 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="p-5 space-y-4 flex-1 overflow-y-auto">
            {/* Post Type Selector */}
            <div className="grid grid-cols-3 gap-2 p-1 bg-[#121215] border border-white/[0.06] rounded-xs">
              <button
                type="button"
                onClick={() => setPostType('photo')}
                className={`flex items-center justify-center gap-1.5 py-2 rounded-xs text-xs font-serif uppercase tracking-wider transition-all ${
                  postType === 'photo' 
                    ? 'bg-[#181613] text-amber-200 border border-amber-600/40' 
                    : 'text-stone-400 hover:text-stone-200'
                }`}
              >
                <ImageIcon className="w-3.5 h-3.5" />
                <span>Plate (Photo)</span>
              </button>
              <button
                type="button"
                onClick={() => setPostType('video')}
                className={`flex items-center justify-center gap-1.5 py-2 rounded-xs text-xs font-serif uppercase tracking-wider transition-all ${
                  postType === 'video' 
                    ? 'bg-[#181613] text-amber-200 border border-amber-600/40' 
                    : 'text-stone-400 hover:text-stone-200'
                }`}
              >
                <VideoIcon className="w-3.5 h-3.5" />
                <span>Motion</span>
              </button>
              <button
                type="button"
                onClick={() => setPostType('text')}
                className={`flex items-center justify-center gap-1.5 py-2 rounded-xs text-xs font-serif uppercase tracking-wider transition-all ${
                  postType === 'text' 
                    ? 'bg-[#181613] text-amber-200 border border-amber-600/40' 
                    : 'text-stone-400 hover:text-stone-200'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Epistle</span>
              </button>
            </div>

            {/* Monetization & Access Toggles */}
            {postType !== 'text' && (
              <div className="bg-[#121215] border border-white/[0.06] rounded-xs p-3.5 space-y-3 font-mono">
                <span className="block text-[10px] tracking-wider uppercase text-amber-200">Access & Privacy Tier</span>
                <label className="flex items-center justify-between cursor-pointer">
                  <div className="flex items-center gap-2.5">
                    <div className="w-6 h-6 rounded-xs bg-[#161512] text-amber-300 border border-amber-600/30 flex items-center justify-center">
                      <Crown className="w-3 h-3" />
                    </div>
                    <div>
                      <div className="text-xs font-serif text-stone-200">Privé Patron Reserve</div>
                      <div className="text-[10px] text-stone-400 font-sans">Restricted strictly to active monthly patrons</div>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={isSubscribersOnly}
                    onChange={(e) => {
                      setIsSubscribersOnly(e.target.checked);
                      if (e.target.checked) setIsPPV(false);
                    }}
                    className="w-4 h-4 rounded-xs accent-amber-500"
                  />
                </label>

                <label className="flex items-center justify-between cursor-pointer pt-2 border-t border-white/[0.06]">
                  <div className="flex items-center gap-2.5">
                    <div className="w-6 h-6 rounded-xs bg-[#161512] text-amber-300 border border-amber-600/30 flex items-center justify-center">
                      <Coins className="w-3 h-3" />
                    </div>
                    <div>
                      <div className="text-xs font-serif text-stone-200">Confidential Unseal (PPV)</div>
                      <div className="text-[10px] text-stone-400 font-sans">Single-access confidential admission fee</div>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={isPPV}
                    onChange={(e) => {
                      setIsPPV(e.target.checked);
                      if (e.target.checked) setIsSubscribersOnly(false);
                    }}
                    className="w-4 h-4 rounded-xs accent-amber-500"
                  />
                </label>

                {isPPV && (
                  <div className="pt-2 pl-8 flex items-center gap-2 text-xs">
                    <span className="text-stone-400">Unseal Fee (€):</span>
                    <input
                      type="number"
                      min={5}
                      max={500}
                      step={5}
                      value={unlockPrice}
                      onChange={(e) => setUnlockPrice(Number(e.target.value))}
                      className="w-24 px-2.5 py-1 rounded-xs border border-white/15 bg-[#16161a] text-stone-100 font-mono"
                    />
                  </div>
                )}
              </div>
            )}

            {/* Intimate / Sensual Tag */}
            <div className="p-3 bg-[#131215] border border-white/[0.06] rounded-xs font-mono">
              <label className="flex items-center justify-between cursor-pointer gap-2">
                <div>
                  <span className="text-[11px] uppercase tracking-wider text-amber-200 block font-medium">
                    Intimate / Confidential Visuals
                  </span>
                  <p className="text-[10px] font-sans text-stone-400">
                    Will apply initial scrim filter across member streams until tapped.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={isSensitive}
                  onChange={e => setIsSensitive(e.target.checked)}
                  className="w-4 h-4 rounded-xs accent-amber-500 shrink-0"
                />
              </label>
            </div>

            {/* Caption */}
            <div>
              <label className="block text-[10px] font-mono uppercase tracking-wider text-stone-400 mb-1.5">Epigraph / Text</label>
              <textarea
                rows={3}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Compose thoughts, reflections or salon notes..."
                className="w-full px-3.5 py-2.5 rounded-xs border border-white/[0.08] bg-[#121215] text-xs text-stone-200 placeholder-stone-400 font-serif leading-relaxed focus:border-amber-400/50 outline-hidden"
              />
            </div>

            {/* Media Presets */}
            {postType === 'photo' && (
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-[10px] font-mono uppercase tracking-wider text-stone-400">
                    Plate Visual (Device Upload or Reference)
                  </label>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-[11px] font-serif uppercase tracking-wider text-amber-300 hover:text-amber-200 flex items-center gap-1.5 cursor-pointer bg-white/5 px-2.5 py-1 rounded-xs border border-white/10"
                  >
                    <Upload className="w-3 h-3" />
                    <span>Upload Local File</span>
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </div>

                {mediaUrl && (
                  <div className="relative mb-2.5 rounded-xs overflow-hidden border border-amber-400/50 max-h-48 bg-black flex items-center justify-center">
                    <img src={mediaUrl} alt="Preview" className="max-h-48 w-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setMediaUrl('')}
                      className="absolute top-2 right-2 p-1 rounded-xs bg-black/80 text-stone-300 hover:text-white border border-white/20"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                    <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded-xs bg-black/80 text-[10px] font-mono text-amber-300 border border-white/10">
                      Active Selected Plate
                    </div>
                  </div>
                )}

                <input
                  type="url"
                  value={mediaUrl.startsWith('data:') ? '' : mediaUrl}
                  onChange={(e) => setMediaUrl(e.target.value)}
                  placeholder="Or enter direct URL: https://..."
                  className="w-full px-3 py-1.5 rounded-xs border border-white/[0.08] bg-[#121215] text-xs text-stone-200 placeholder-stone-400 mb-2 font-mono outline-hidden focus:border-amber-400/50"
                />

                <div className="grid grid-cols-4 gap-2">
                  {samplePhotos.map((url, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setMediaUrl(url)}
                      className={`relative aspect-video rounded-xs overflow-hidden border transition-all cursor-pointer ${
                        mediaUrl === url ? 'border-amber-400' : 'border-white/10 opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={url} alt="" className="w-full h-full object-cover filter contrast-[1.05]" />
                      {mediaUrl === url && (
                        <span className="absolute top-1 right-1 bg-amber-500 text-stone-950 rounded-xs p-0.5">
                          <Check className="w-2.5 h-2.5" />
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {postType === 'video' && (
              <div>
                <label className="block text-[10px] font-mono uppercase tracking-wider text-stone-400 mb-1.5">Motion Reference (MP4)</label>
                <input
                  type="url"
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  placeholder="https://...mp4"
                  className="w-full px-3 py-1.5 rounded-xs border border-white/[0.08] bg-[#121215] text-xs text-stone-200 placeholder-stone-400 mb-2 font-mono outline-hidden focus:border-amber-400/50"
                />
                <div className="flex gap-2">
                  {sampleVideos.map((url, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setVideoUrl(url)}
                      className={`px-3 py-1.5 rounded-xs border text-xs font-mono ${
                        videoUrl === url ? 'bg-[#181613] text-amber-200 border-amber-600/50' : 'bg-[#121215] text-stone-400 border-white/10'
                      }`}
                    >
                      Motion Reel {idx + 1}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Tags */}
            <div>
              <label className="block text-[10px] font-mono uppercase tracking-wider text-stone-400 mb-1.5">Chapter & Salon Descriptors</label>
              <input
                type="text"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                placeholder="Vernissage, CapDAntibes, NoirPortrait, Salon"
                className="w-full px-3 py-1.5 rounded-xs border border-white/[0.08] bg-[#121215] text-xs text-stone-200 placeholder-stone-400 font-mono outline-hidden focus:border-amber-400/50"
              />
            </div>
          </div>

          {/* Sticky Actions Footer */}
          <div className="p-4 border-t border-white/[0.08] bg-[#0c0c0e] flex items-center justify-end gap-3 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xs text-xs font-mono uppercase tracking-wider text-stone-400 hover:text-stone-200 transition-colors"
            >
              Dismiss
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xs font-serif text-xs uppercase tracking-[0.14em] bg-[#161512] hover:bg-[#201d18] text-amber-200 border border-amber-600/40 hover:border-amber-400 transition-all flex items-center gap-2"
            >
              <span>Publish Dispatch</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
