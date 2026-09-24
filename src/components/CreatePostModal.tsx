import React, { useState, useEffect, useRef } from 'react';
import { Post, UserProfile } from '../types';
import { 
  X, 
  ArrowLeft,
  ArrowRight,
  Camera, 
  Image as ImageIcon, 
  FlipHorizontal,
  RefreshCw,
  Check,
  Sparkles,
  MapPin,
  Shield,
  EyeOff,
  Sliders,
  Crown,
  Lock,
  Upload
} from 'lucide-react';
import { noirApi } from '../services/noirApi';

interface CreatePostModalProps {
  currentUser: UserProfile;
  isOpen: boolean;
  onClose: () => void;
  onSubmitPost: (newPost: Partial<Post>) => void;
}

type CreatorMode = 'gallery' | 'camera';
type CreatorStep = 'media' | 'details';

interface FilterPreset {
  id: string;
  name: string;
  css: string;
}

const FILTER_PRESETS: FilterPreset[] = [
  { id: 'normal', name: 'Normal', css: 'none' },
  { id: 'noir', name: 'Major Noir', css: 'grayscale(100%) contrast(130%)' },
  { id: 'gold', name: 'Gold Velvet', css: 'sepia(30%) contrast(110%) brightness(105%) saturate(120%)' },
  { id: 'vogue', name: 'Vogue', css: 'contrast(125%) saturate(115%)' },
  { id: 'midnight', name: 'Midnight', css: 'contrast(115%) brightness(90%) hue-rotate(200deg) saturate(90%)' },
  { id: 'vintage', name: 'Vintage 90s', css: 'sepia(45%) contrast(95%) brightness(100%)' },
];

export const CreatePostModal: React.FC<CreatePostModalProps> = ({
  currentUser,
  isOpen,
  onClose,
  onSubmitPost,
}) => {
  // Step & Mode State
  const [step, setStep] = useState<CreatorStep>('media');
  const [mode, setMode] = useState<CreatorMode>('gallery');
  const [aspectRatio, setAspectRatio] = useState<'4/5' | '1/1'>('4/5');
  const [selectedFilter, setSelectedFilter] = useState<FilterPreset>(FILTER_PRESETS[0]);

  // Media & Form State
  const [capturedImage, setCapturedImage] = useState<string>('');
  const [caption, setCaption] = useState<string>('');
  const [selectedLocation, setSelectedLocation] = useState<string>('Amsterdam Chapter');
  const [privacyTier, setPrivacyTier] = useState<'public' | 'verified' | 'vip'>('public');
  const [hasFaceMask, setHasFaceMask] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Camera Hardware State
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [isCameraLoading, setIsCameraLoading] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sample curated plates for quick selection
  const curatedPlates = [
    'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=800&auto=format&fit=crop&q=80',
  ];

  // Stop camera tracks cleanly
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
    setIsCameraLoading(false);
  };

  // Start hardware camera stream
  const startCamera = async (overrideFacing?: 'user' | 'environment') => {
    try {
      setCameraError(null);
      setIsCameraLoading(true);
      stopCamera();

      const chosenFacing = overrideFacing || facingMode;
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: chosenFacing,
          width: { ideal: 1080 },
          height: { ideal: 1350 },
        },
        audio: false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play().catch(console.warn);
        };
      }
      setIsCameraActive(true);
    } catch (err: any) {
      console.warn('Camera stream request error:', err);
      // Fallback try basic video constraint if specific width/facing failed
      try {
        const fallbackStream = await navigator.mediaDevices.getUserMedia({ video: true });
        streamRef.current = fallbackStream;
        if (videoRef.current) {
          videoRef.current.srcObject = fallbackStream;
          videoRef.current.play().catch(console.warn);
        }
        setIsCameraActive(true);
      } catch (fallbackErr) {
        setCameraError(
          'Kamera izni verilmedi veya cihazınızda kamera bulunamadı. Galeriden fotoğraf seçerek devam edebilirsiniz.'
        );
        setIsCameraActive(false);
      }
    } finally {
      setIsCameraLoading(false);
    }
  };

  // Flip camera between front and back
  const handleToggleFacingMode = () => {
    const nextFacing = facingMode === 'user' ? 'environment' : 'user';
    setFacingMode(nextFacing);
    startCamera(nextFacing);
  };

  // Capture still from video stream
  const handleCapturePhoto = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 1080;
    canvas.height = video.videoHeight || 1350;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Handle selfie mirror
    if (facingMode === 'user') {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
    setCapturedImage(dataUrl);
    stopCamera();

    if ('vibrate' in navigator) {
      try { navigator.vibrate(40); } catch {}
    }
  };

  // File Upload from device storage/gallery
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        setCapturedImage(result);
        stopCamera();
      }
    };
    reader.readAsDataURL(file);
  };

  // Mode Switcher effect
  useEffect(() => {
    if (!isOpen) {
      stopCamera();
      return;
    }
    if (mode === 'camera' && !capturedImage) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [mode, isOpen, capturedImage]);

  // Reset state on open
  useEffect(() => {
    if (isOpen) {
      setStep('media');
      setMode('gallery');
      if (!capturedImage) {
        setCapturedImage(curatedPlates[0]);
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Final Publish Handler
  const handlePublish = async () => {
    if (!capturedImage) return;

    setIsSubmitting(true);
    try {
      const newPost: Partial<Post> = {
        author: currentUser,
        type: 'photo',
        content: caption.trim() || undefined,
        mediaUrl: capturedImage,
        hasFaceMask,
        isSubscribersOnly: privacyTier === 'vip',
        isPPV: privacyTier === 'vip',
        unlockPrice: privacyTier === 'vip' ? 50 : undefined,
        tags: [selectedLocation.replace(/\s+/g, ''), 'MajorClub', 'Lifestyle'],
        likesCount: 0,
        commentsCount: 0,
        sharesCount: 0,
        createdAt: 'Az önce',
        isLiked: false,
        isSaved: false,
      };

      onSubmitPost(newPost);
      onClose();
    } catch (err) {
      console.error('Publish error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div 
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200"
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="bg-[#0A0C10] border border-white/10 w-full sm:max-w-xl h-full sm:h-[88vh] sm:rounded-3xl flex flex-col overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200"
      >
        {/* ========================================================
            1. INSTAGRAM TOP NAVIGATION BAR
            ======================================================== */}
        <header className="h-14 px-4 border-b border-white/[0.08] flex items-center justify-between shrink-0 bg-[#0E1015]">
          {step === 'media' ? (
            <button
              onClick={() => {
                stopCamera();
                onClose();
              }}
              className="text-xs font-sans text-zinc-400 hover:text-white transition-colors cursor-pointer"
            >
              Vazgeç
            </button>
          ) : (
            <button
              onClick={() => setStep('media')}
              className="p-1.5 text-zinc-400 hover:text-white transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}

          <h2 className="text-sm font-sans font-semibold tracking-wide text-white">
            {step === 'media' ? 'Yeni Gönderi' : 'Yeni Paylaşım'}
          </h2>

          {step === 'media' ? (
            <button
              onClick={() => setStep('details')}
              disabled={!capturedImage}
              className="text-xs font-sans font-semibold text-[#E5C590] hover:text-[#d9b880] transition-colors cursor-pointer disabled:opacity-40"
            >
              İleri
            </button>
          ) : (
            <button
              onClick={handlePublish}
              disabled={isSubmitting}
              className="px-3.5 py-1.5 rounded-full bg-linear-to-r from-[#E5C590] to-[#C9A96E] text-black font-semibold text-xs hover:brightness-110 transition-all cursor-pointer disabled:opacity-40"
            >
              {isSubmitting ? 'Paylaşılıyor...' : 'Paylaş'}
            </button>
          )}
        </header>

        {/* ========================================================
            2. STEP 1: MEDIA CAPTURE & FILTER SELECTION
            ======================================================== */}
        {step === 'media' && (
          <div className="flex-1 flex flex-col overflow-hidden bg-black">
            {/* Viewfinder / Main Image Canvas Viewport */}
            <div className="relative flex-1 bg-[#050608] flex items-center justify-center overflow-hidden">
              {mode === 'camera' && !capturedImage ? (
                /* LIVE HARDWARE CAMERA STREAM */
                <div className="relative w-full h-full flex items-center justify-center bg-black">
                  <video
                    ref={videoRef}
                    playsInline
                    autoPlay
                    muted
                    className="w-full h-full object-cover"
                    style={{ transform: facingMode === 'user' ? 'scaleX(-1)' : 'none' }}
                  />

                  {/* Camera Controls Overlay */}
                  <div className="absolute inset-x-0 bottom-6 flex items-center justify-around px-8 pointer-events-auto">
                    {/* Camera Flip */}
                    <button
                      onClick={handleToggleFacingMode}
                      className="p-3 rounded-full bg-black/60 backdrop-blur-md text-white border border-white/20 hover:bg-black/80 transition-colors cursor-pointer"
                      title="Kamerayı Döndür"
                    >
                      <FlipHorizontal className="w-5 h-5" />
                    </button>

                    {/* Circular Shutter Button */}
                    <button
                      onClick={handleCapturePhoto}
                      className="w-18 h-18 rounded-full border-4 border-[#E5C590] p-1.5 flex items-center justify-center hover:scale-105 active:scale-95 transition-transform cursor-pointer shadow-[0_0_20px_rgba(229,197,144,0.4)]"
                    >
                      <div className="w-full h-full rounded-full bg-white active:bg-[#E5C590] transition-colors" />
                    </button>

                    {/* Switch to gallery */}
                    <button
                      onClick={() => setMode('gallery')}
                      className="p-3 rounded-full bg-black/60 backdrop-blur-md text-white border border-white/20 hover:bg-black/80 transition-colors cursor-pointer"
                      title="Galeriyi Aç"
                    >
                      <ImageIcon className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Camera Error / Permission Notice */}
                  {cameraError && (
                    <div className="absolute inset-0 bg-black/90 p-6 flex flex-col items-center justify-center text-center space-y-4">
                      <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-[#E5C590]">
                        <Camera className="w-6 h-6" />
                      </div>
                      <p className="text-xs text-zinc-300 max-w-xs leading-relaxed font-sans">
                        {cameraError}
                      </p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => startCamera()}
                          className="px-4 py-2 rounded-full bg-[#E5C590] text-black font-semibold text-xs hover:brightness-110 cursor-pointer"
                        >
                          Tekrar Dene
                        </button>
                        <button
                          onClick={() => setMode('gallery')}
                          className="px-4 py-2 rounded-full bg-white/10 text-white font-medium text-xs hover:bg-white/20 cursor-pointer"
                        >
                          Galeriden Seç
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                /* CAPTURED / SELECTED PHOTO PREVIEW */
                <div className={`relative w-full h-full flex items-center justify-center overflow-hidden ${
                  aspectRatio === '4/5' ? 'aspect-[4/5]' : 'aspect-square'
                }`}>
                  <img
                    src={capturedImage}
                    alt="Preview"
                    style={{ filter: selectedFilter.css }}
                    className="w-full h-full object-cover transition-all duration-300"
                  />

                  {/* Aspect Ratio Toggle (1:1 / 4:5) */}
                  <button
                    onClick={() => setAspectRatio(prev => prev === '4/5' ? '1/1' : '4/5')}
                    className="absolute bottom-4 left-4 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-[11px] font-mono border border-white/15 hover:bg-black/80 transition-colors cursor-pointer"
                  >
                    {aspectRatio === '4/5' ? '4:5 Portre' : '1:1 Kare'}
                  </button>

                  {/* Retake Camera photo button */}
                  {mode === 'camera' && (
                    <button
                      onClick={() => {
                        setCapturedImage('');
                        startCamera();
                      }}
                      className="absolute bottom-4 right-4 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md text-white text-xs font-sans border border-white/15 hover:bg-black/80 flex items-center gap-1.5 cursor-pointer"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Tekrar Çek</span>
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Filter Carousel Strip (Instagram Style) */}
            <div className="h-24 px-4 py-2 border-t border-white/[0.08] bg-[#0C0E14] flex items-center gap-3 overflow-x-auto no-scrollbar shrink-0">
              {FILTER_PRESETS.map((f) => (
                <button
                  key={f.id}
                  onClick={() => setSelectedFilter(f)}
                  className={`flex flex-col items-center gap-1 shrink-0 cursor-pointer transition-transform ${
                    selectedFilter.id === f.id ? 'scale-105' : 'opacity-70 hover:opacity-100'
                  }`}
                >
                  <div className={`w-12 h-12 rounded-xl overflow-hidden border-2 ${
                    selectedFilter.id === f.id ? 'border-[#E5C590]' : 'border-white/10'
                  }`}>
                    <img
                      src={capturedImage || curatedPlates[0]}
                      alt={f.name}
                      style={{ filter: f.css }}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <span className={`text-[10px] font-sans ${
                    selectedFilter.id === f.id ? 'text-[#E5C590] font-semibold' : 'text-zinc-400'
                  }`}>
                    {f.name}
                  </span>
                </button>
              ))}
            </div>

            {/* Bottom Gallery Grid & Mode Selector */}
            <div className="h-44 bg-[#0E1015] border-t border-white/[0.08] flex flex-col shrink-0">
              {/* Mode Switcher Tabs */}
              <div className="flex border-b border-white/[0.06] bg-[#07080A]">
                <button
                  onClick={() => {
                    setMode('gallery');
                    stopCamera();
                  }}
                  className={`flex-1 py-2 text-xs font-sans font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                    mode === 'gallery' ? 'text-white border-b-2 border-[#E5C590]' : 'text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  <ImageIcon className="w-3.5 h-3.5" />
                  <span>Galeri</span>
                </button>
                <button
                  onClick={() => {
                    setMode('camera');
                    setCapturedImage('');
                    startCamera();
                  }}
                  className={`flex-1 py-2 text-xs font-sans font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                    mode === 'camera' ? 'text-white border-b-2 border-[#E5C590]' : 'text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>Fotoğraf Çek (Kamera)</span>
                </button>
              </div>

              {/* Gallery Scroll Grid & Device Upload Button */}
              <div className="flex-1 p-3 overflow-y-auto">
                <div className="grid grid-cols-4 gap-2">
                  {/* Upload from Device Button */}
                  <label className="aspect-square rounded-xl bg-white/[0.04] border border-dashed border-white/20 hover:border-[#E5C590]/50 flex flex-col items-center justify-center gap-1 text-zinc-400 hover:text-white cursor-pointer transition-colors">
                    <Upload className="w-4 h-4 text-[#E5C590]" />
                    <span className="text-[10px] font-sans">Yükle</span>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>

                  {/* Sample Curated Plates */}
                  {curatedPlates.map((url, index) => (
                    <div
                      key={index}
                      onClick={() => {
                        setCapturedImage(url);
                        stopCamera();
                      }}
                      className={`relative aspect-square rounded-xl overflow-hidden cursor-pointer border ${
                        capturedImage === url ? 'border-[#E5C590] ring-2 ring-[#E5C590]/30' : 'border-transparent'
                      }`}
                    >
                      <img src={url} alt={`Option ${index}`} className="w-full h-full object-cover" />
                      {capturedImage === url && (
                        <div className="absolute inset-0 bg-[#E5C590]/20 flex items-center justify-center">
                          <Check className="w-4 h-4 text-white drop-shadow-md" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================
            3. STEP 2: INSTAGRAM CAPTION, TAGS & PRIVACY SETTINGS
            ======================================================== */}
        {step === 'details' && (
          <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-6 bg-[#0B0D12]">
            {/* Media Thumbnail + Caption Input Row */}
            <div className="flex gap-4 items-start">
              <div className="w-20 h-24 rounded-2xl overflow-hidden shrink-0 border border-white/15 bg-black">
                <img
                  src={capturedImage}
                  alt="Thumbnail"
                  style={{ filter: selectedFilter.css }}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="flex-1">
                <textarea
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="Bir açıklama yaz... (#etiketler ekleyebilirsiniz)"
                  rows={4}
                  className="w-full p-3 rounded-xl bg-[#121419] border border-white/[0.08] text-white placeholder-zinc-500 text-xs focus:outline-none focus:border-[#E5C590]/50 font-sans resize-none leading-relaxed"
                />
              </div>
            </div>

            {/* Location Selector */}
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-sans text-zinc-400">
                <MapPin className="w-3.5 h-3.5 text-[#E5C590]" />
                <span>Konum Ekle</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {['Amsterdam Chapter', 'Paris Le Marais', 'İstanbul Bebek', 'Rotterdam Chapter'].map((loc) => (
                  <button
                    key={loc}
                    type="button"
                    onClick={() => setSelectedLocation(loc)}
                    className={`px-3 py-1.5 rounded-full text-xs font-sans transition-all cursor-pointer ${
                      selectedLocation === loc
                        ? 'bg-[#E5C590] text-black font-semibold'
                        : 'bg-[#14161C] text-zinc-400 border border-white/10 hover:text-white'
                    }`}
                  >
                    {loc}
                  </button>
                ))}
              </div>
            </div>

            {/* Adult Discretion & Privacy Options */}
            <div className="space-y-3 pt-2 border-t border-white/[0.06]">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="text-xs font-sans font-medium text-white flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5 text-[#E5C590]" />
                    <span>Discreet Yüz Maskesi</span>
                  </div>
                  <div className="text-[11px] text-zinc-500 font-sans">
                    Fotoğraftaki yüz alanına şık Major Club gizlilik şeridi ekler.
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setHasFaceMask(!hasFaceMask)}
                  className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                    hasFaceMask ? 'bg-[#E5C590]' : 'bg-white/10'
                  }`}
                >
                  <div className={`w-5 h-5 rounded-full bg-black transition-transform absolute top-0.5 ${
                    hasFaceMask ? 'left-5.5' : 'left-0.5'
                  }`} />
                </button>
              </div>

              {/* Privacy Tier Matrix */}
              <div className="space-y-2 pt-2">
                <span className="text-xs font-sans text-zinc-400 block">Erişim Düzeyi</span>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setPrivacyTier('public')}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                      privacyTier === 'public'
                        ? 'bg-[#E5C590]/15 border-[#E5C590] text-[#E5C590]'
                        : 'bg-[#121419] border-white/10 text-zinc-400'
                    }`}
                  >
                    <div className="text-xs font-semibold">Tüm Üyeler</div>
                    <div className="text-[10px] text-zinc-500">Akışta görünür</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPrivacyTier('verified')}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                      privacyTier === 'verified'
                        ? 'bg-[#E5C590]/15 border-[#E5C590] text-[#E5C590]'
                        : 'bg-[#121419] border-white/10 text-zinc-400'
                    }`}
                  >
                    <div className="text-xs font-semibold">Doğrulanmış</div>
                    <div className="text-[10px] text-zinc-500">Sadece onaylılar</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPrivacyTier('vip')}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                      privacyTier === 'vip'
                        ? 'bg-[#E5C590]/15 border-[#E5C590] text-[#E5C590]'
                        : 'bg-[#121419] border-white/10 text-zinc-400'
                    }`}
                  >
                    <div className="text-xs font-semibold">Özel Kilitli</div>
                    <div className="text-[10px] text-zinc-500">VIP / PPV Kasa</div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
