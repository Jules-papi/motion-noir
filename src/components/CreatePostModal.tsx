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
  Upload,
  Eye,
  ShieldCheck,
  Sparkles
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
  const [unlockPrice, setUnlockPrice] = useState<number>(50);
  const [isSensitive, setIsSensitive] = useState(false);
  const [hasFaceMask, setHasFaceMask] = useState(false);
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
      hasFaceMask,
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
    setHasFaceMask(false);
    onClose();
  };

  return (
    <div 
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn cursor-pointer"
    >
      <div 
        className="bg-[#0c0d11] border border-white/[0.12] rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden max-h-[90vh] flex flex-col cursor-default"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 px-5 border-b border-white/[0.08] flex items-center justify-between shrink-0 bg-[#121419]">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-[#E5C590]" />
            <h3 className="font-serif text-sm text-white font-medium">Publish Private Dispatch</h3>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-full text-zinc-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="p-5 space-y-4 flex-1 overflow-y-auto">
            {/* Post Type Selector */}
            <div className="grid grid-cols-3 gap-2 p-1 bg-[#121419] border border-white/[0.06] rounded-xl">
              <button
                type="button"
                onClick={() => setPostType('photo')}
                className={`flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-serif transition-all cursor-pointer ${
                  postType === 'photo' 
                    ? 'bg-[#1e222b] text-[#E5C590] border border-[#E5C590]/40 shadow-sm' 
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <ImageIcon className="w-3.5 h-3.5" />
                <span>Plate (Photo)</span>
              </button>
              <button
                type="button"
                onClick={() => setPostType('video')}
                className={`flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-serif transition-all cursor-pointer ${
                  postType === 'video' 
                    ? 'bg-[#1e222b] text-[#E5C590] border border-[#E5C590]/40 shadow-sm' 
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <VideoIcon className="w-3.5 h-3.5" />
                <span>Motion</span>
              </button>
              <button
                type="button"
                onClick={() => setPostType('text')}
                className={`flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-serif transition-all cursor-pointer ${
                  postType === 'text' 
                    ? 'bg-[#1e222b] text-[#E5C590] border border-[#E5C590]/40 shadow-sm' 
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Epistle</span>
              </button>
            </div>

            {/* Caption */}
            <div>
              <label className="block text-[11px] font-mono text-zinc-400 mb-1.5">Epigraph / Dispatch Text</label>
              <textarea
                rows={3}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Compose thoughts, reflections or salon notes..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-white/[0.08] bg-[#121419] text-xs text-zinc-200 placeholder-zinc-500 font-sans leading-relaxed focus:border-[#E5C590]/50 outline-none"
              />
            </div>

            {/* Media Upload and Presets */}
            {postType === 'photo' && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-[11px] font-mono text-zinc-400">
                    Plate Visual (Device Upload)
                  </label>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-xs text-[#E5C590] hover:text-[#d9b880] flex items-center gap-1.5 cursor-pointer bg-white/5 hover:bg-white/10 px-3 py-1 rounded-full border border-white/10 transition-colors"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload from Device</span>
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
                  <div className="relative mb-3 rounded-xl overflow-hidden border border-[#E5C590]/50 max-h-48 bg-black flex items-center justify-center shadow-lg">
                    <img src={mediaUrl} alt="Preview" className="max-h-48 w-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setMediaUrl('')}
                      className="absolute top-2.5 right-2.5 p-1.5 rounded-full bg-black/80 text-white hover:bg-black transition-colors cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                    <div className="absolute bottom-2 left-2 px-2.5 py-0.5 rounded-md bg-black/80 text-[10px] font-mono text-[#E5C590] border border-white/10">
                      Active Selected Plate
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-4 gap-2">
                  {samplePhotos.map((url, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setMediaUrl(url)}
                      className={`relative aspect-video rounded-xl overflow-hidden border transition-all cursor-pointer ${
                        mediaUrl === url ? 'border-[#E5C590] ring-2 ring-[#E5C590]/30' : 'border-white/10 opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={url} alt="" className="w-full h-full object-cover filter contrast-[1.05]" />
                      {mediaUrl === url && (
                        <span className="absolute top-1 right-1 bg-[#E5C590] text-black rounded-full p-0.5">
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
                <label className="block text-[11px] font-mono text-zinc-400 mb-1.5">Motion Reference (MP4)</label>
                <div className="flex gap-2">
                  {sampleVideos.map((url, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setVideoUrl(url)}
                      className={`px-3.5 py-2 rounded-xl border text-xs font-mono transition-colors cursor-pointer ${
                        videoUrl === url ? 'bg-[#181B22] text-[#E5C590] border-[#E5C590]/50' : 'bg-[#121419] text-zinc-400 border-white/10 hover:border-white/20'
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
              <label className="block text-[11px] font-mono text-zinc-400 mb-1.5">Salon Descriptors & Tags</label>
              <input
                type="text"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                placeholder="Vernissage, CapDAntibes, NoirPortrait, Salon"
                className="w-full px-3.5 py-2 rounded-xl border border-white/[0.08] bg-[#121419] text-xs text-zinc-200 placeholder-zinc-500 font-sans outline-none focus:border-[#E5C590]/50"
              />
            </div>
          </div>

          {/* Sticky Actions Footer */}
          <div className="p-4 px-5 border-t border-white/[0.08] bg-[#121419] flex items-center justify-end gap-3 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs rounded-full text-zinc-400 hover:text-white transition-colors cursor-pointer"
            >
              Dismiss
            </button>
            <button
              type="submit"
              className="px-6 py-2 rounded-full font-sans font-semibold text-xs bg-[#E5C590] hover:bg-[#d9b880] text-black shadow-md active:scale-95 transition-all cursor-pointer flex items-center gap-2"
            >
              <span>Publish Dispatch</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

