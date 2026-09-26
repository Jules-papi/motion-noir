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
  Upload,
  Navigation,
  Search,
  Loader2,
  Compass
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

  // Media & Form State - REAL DEVICE PHOTOS ONLY
  const [capturedImage, setCapturedImage] = useState<string>('');
  const [selectedFileOrBlob, setSelectedFileOrBlob] = useState<File | Blob | null>(null);
  const [devicePhotos, setDevicePhotos] = useState<string[]>([]);
  const [caption, setCaption] = useState<string>('');
  const [isSensitive, setIsSensitive] = useState<boolean>(false);

  // Free OpenStreetMap Geocoding & GPS Location State
  const [selectedLocation, setSelectedLocation] = useState<string>('Amsterdam Chapter');
  const [locationCoords, setLocationCoords] = useState<{ lat: number; lon: number } | null>({ lat: 52.3676, lon: 4.9041 });
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [locationSearchQuery, setLocationSearchQuery] = useState<string>('');
  const [isSearchingLocation, setIsSearchingLocation] = useState<boolean>(false);
  const [locationSuggestions, setLocationSuggestions] = useState<{ displayName: string; lat: number; lon: number }[]>([]);
  const [showLocationSearch, setShowLocationSearch] = useState<boolean>(false);

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
    canvas.toBlob((blob) => {
      if (blob) {
        setSelectedFileOrBlob(blob);
        const previewUrl = URL.createObjectURL(blob);
        setCapturedImage(previewUrl);
        setDevicePhotos(prev => [previewUrl, ...prev.filter(item => item !== previewUrl)]);
      }
    }, 'image/jpeg', 0.92);
    stopCamera();

    if ('vibrate' in navigator) {
      try { navigator.vibrate(40); } catch {}
    }
  };

  // File Upload from user's real device gallery
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Strict client validation: MIME and Max Size 5MB
    const allowed = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowed.includes(file.type)) {
      alert('Yalnızca JPEG, PNG veya WebP görseli yükleyebilirsiniz.');
      e.target.value = '';
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert('Görsel boyutu 5MB sınırını aşamaz.');
      e.target.value = '';
      return;
    }

    setSelectedFileOrBlob(file);
    const previewUrl = URL.createObjectURL(file);
    setCapturedImage(previewUrl);
    setDevicePhotos(prev => [previewUrl, ...prev.filter(item => item !== previewUrl)]);
    stopCamera();
    e.target.value = '';
  };

  // Free OpenStreetMap GPS Reverse Geocoding
  const handleDetectCurrentLocation = async () => {
    if (!navigator.geolocation) {
      alert('Tarayıcınız konum servisini desteklemiyor.');
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords;
          setLocationCoords({ lat: latitude, lon: longitude });
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=14&addressdetails=1`
          );
          if (response.ok) {
            const data = await response.json();
            const addr = data.address || {};
            const locality = addr.suburb || addr.neighbourhood || addr.quarter || addr.city_district || addr.city || addr.town || 'Mevcut Konum';
            const city = addr.city || addr.province || addr.state || '';
            const country = addr.country || '';
            const formatted = [locality, city, country].filter(Boolean).join(', ');
            setSelectedLocation(formatted || `GPS (${latitude.toFixed(2)}, ${longitude.toFixed(2)})`);
          } else {
            setSelectedLocation(`GPS (${latitude.toFixed(2)}, ${longitude.toFixed(2)})`);
          }
        } catch (err) {
          console.warn('Geolocation reverse geocode fallback:', err);
          setSelectedLocation('Mevcut Konum (GPS)');
        } finally {
          setIsLocating(false);
          setShowLocationSearch(false);
        }
      },
      (err) => {
        console.warn('Geolocation error:', err);
        setIsLocating(false);
      },
      { timeout: 8000, enableHighAccuracy: true }
    );
  };

  // Free OpenStreetMap Realtime Location Search
  const handleSearchLocations = async (query: string) => {
    setLocationSearchQuery(query);
    if (!query.trim() || query.length < 2) {
      setLocationSuggestions([]);
      return;
    }
    setIsSearchingLocation(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&addressdetails=1`
      );
      if (response.ok) {
        const results = await response.json();
        const mapped = results.map((item: any) => ({
          displayName: item.display_name,
          lat: parseFloat(item.lat),
          lon: parseFloat(item.lon),
        }));
        setLocationSuggestions(mapped);
      }
    } catch (err) {
      console.warn('Location search error:', err);
    } finally {
      setIsSearchingLocation(false);
    }
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
      if (!capturedImage && devicePhotos.length > 0) {
        setCapturedImage(devicePhotos[0]);
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Final Publish Handler
  const handlePublish = async () => {
    if (!capturedImage) return;

    setIsSubmitting(true);
    try {
      let finalMediaUrl = capturedImage;

      // Real Supabase Storage upload: replaces Base64 with HTTPS public URL
      if (selectedFileOrBlob) {
        const uploadedUrl = await noirApi.uploadImage(selectedFileOrBlob, 'posts');
        if (!uploadedUrl) {
          alert('Görsel sunucuya yüklenemedi. Lütfen tekrar deneyin.');
          setIsSubmitting(false);
          return;
        }
        finalMediaUrl = uploadedUrl;
      }

      const newPost: Partial<Post> = {
        author: currentUser,
        type: 'photo',
        content: caption.trim() || undefined,
        mediaUrl: finalMediaUrl,
        hasFaceMask,
        isSensitive,
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
    } catch (err: any) {
      console.error('Publish error:', err);
      alert(err.message || 'Gönderi paylaşılırken bir hata oluştu.');
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
        className="bg-[#111113] border border-white/[0.08] w-full sm:max-w-xl h-full sm:h-[88vh] sm:rounded-xl flex flex-col overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200"
      >
        {/* ========================================================
            1. TOP NAVIGATION BAR
            ======================================================== */}
        <header className="h-14 px-4 border-b border-white/[0.08] flex items-center justify-between shrink-0 bg-[#111113]">
          {step === 'media' ? (
            <button
              onClick={() => {
                stopCamera();
                onClose();
              }}
              className="text-xs font-sans text-[#9A9996] hover:text-[#F1EFEA] transition-colors cursor-pointer"
            >
              Vazgeç
            </button>
          ) : (
            <button
              onClick={() => setStep('media')}
              className="p-1.5 text-[#9A9996] hover:text-[#F1EFEA] transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}

          <h2 className="text-xs font-sans font-medium tracking-wide text-[#F1EFEA]">
            {step === 'media' ? 'Yeni Gönderi' : 'Gönderi Detayları'}
          </h2>

          {step === 'media' ? (
            <button
              onClick={() => setStep('details')}
              disabled={!capturedImage}
              className="text-xs font-sans font-medium text-[#C5A880] hover:text-[#F1EFEA] transition-colors cursor-pointer disabled:opacity-40"
            >
              İleri
            </button>
          ) : (
            <button
              onClick={handlePublish}
              disabled={isSubmitting}
              className="px-3.5 py-1.5 rounded-lg bg-[#F1EFEA] hover:bg-white text-[#09090B] font-medium text-xs transition-all cursor-pointer disabled:opacity-40"
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
                      className="w-18 h-18 rounded-full border-4 border-[#C5A880] p-1.5 flex items-center justify-center hover:scale-105 active:scale-95 transition-transform cursor-pointer shadow-[0_0_20px_rgba(229,197,144,0.4)]"
                    >
                      <div className="w-full h-full rounded-full bg-white active:bg-[#C5A880] transition-colors" />
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
                      <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-[#C5A880]">
                        <Camera className="w-6 h-6" />
                      </div>
                      <p className="text-xs text-zinc-300 max-w-xs leading-relaxed font-sans">
                        {cameraError}
                      </p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => startCamera()}
                          className="px-4 py-2 rounded-full bg-[#C5A880] text-black font-semibold text-xs hover:brightness-110 cursor-pointer"
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
                /* CAPTURED / SELECTED PHOTO PREVIEW OR GALLERY PROMPT */
                capturedImage ? (
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
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="flex flex-col items-center justify-center p-8 text-center cursor-pointer group hover:bg-white/[0.02] rounded-3xl transition-all"
                  >
                    <div className="w-16 h-16 rounded-2xl bg-white/[0.04] border border-white/15 group-hover:border-[#C5A880] flex items-center justify-center text-[#C5A880] mb-3 group-hover:scale-105 transition-all shadow-xl">
                      <ImageIcon className="w-8 h-8 stroke-[1.5]" />
                    </div>
                    <h3 className="text-white font-medium text-sm font-sans mb-1">
                      Cihazınızın Galerisini Açın
                    </h3>
                    <p className="text-xs text-zinc-400 max-w-xs font-sans mb-4">
                      Telefonunuzdaki albümlerden veya bilgisayarınızdan doğrudan bir görsel seçin.
                    </p>
                    <span className="px-5 py-2 rounded-full bg-white text-black font-semibold text-xs group-hover:bg-zinc-200 transition-colors shadow-md flex items-center gap-1.5">
                      <Upload className="w-3.5 h-3.5" />
                      <span>Galeriden Seç</span>
                    </span>
                  </div>
                )
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
                    selectedFilter.id === f.id ? 'border-[#C5A880]' : 'border-white/10'
                  }`}>
                    {capturedImage ? (
                      <img
                        src={capturedImage}
                        alt={f.name}
                        style={{ filter: f.css }}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div
                        style={{ filter: f.css }}
                        className="w-full h-full bg-linear-to-br from-zinc-700 to-zinc-900"
                      />
                    )}
                  </div>
                  <span className={`text-[10px] font-sans ${
                    selectedFilter.id === f.id ? 'text-[#C5A880] font-semibold' : 'text-zinc-400'
                  }`}>
                    {f.name}
                  </span>
                </button>
              ))}
            </div>

            {/* Bottom Gallery Grid & Mode Selector */}
            <div className="h-44 bg-[#0E1015] border-t border-white/[0.08] flex flex-col shrink-0">
              {/* Mode Switcher Tabs */}
              <div className="flex border-b border-white/[0.06] bg-[#09090B]">
                <button
                  onClick={() => {
                    setMode('gallery');
                    stopCamera();
                  }}
                  className={`flex-1 py-2 text-xs font-sans font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                    mode === 'gallery' ? 'text-white border-b-2 border-[#C5A880]' : 'text-zinc-500 hover:text-zinc-300'
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
                    mode === 'camera' ? 'text-white border-b-2 border-[#C5A880]' : 'text-zinc-500 hover:text-zinc-300'
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
                  <label className="aspect-square rounded-xl bg-white/[0.04] border border-dashed border-white/20 hover:border-[#C5A880]/50 flex flex-col items-center justify-center gap-1 text-zinc-400 hover:text-white cursor-pointer transition-colors group">
                    <Upload className="w-4 h-4 text-[#C5A880] group-hover:scale-110 transition-transform" />
                    <span className="text-[10px] font-sans">Fotoğraf Seç</span>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>

                  {/* Real Device Uploaded Photos in Session */}
                  {devicePhotos.map((url, index) => (
                    <div
                      key={index}
                      onClick={() => {
                        setCapturedImage(url);
                        stopCamera();
                      }}
                      className={`relative aspect-square rounded-xl overflow-hidden cursor-pointer border transition-all ${
                        capturedImage === url ? 'border-[#C5A880] ring-2 ring-[#C5A880]/30' : 'border-transparent hover:border-white/20'
                      }`}
                    >
                      <img src={url} alt={`Device Photo ${index}`} className="w-full h-full object-cover" />
                      {capturedImage === url && (
                        <div className="absolute inset-0 bg-[#C5A880]/20 flex items-center justify-center">
                          <Check className="w-4 h-4 text-white drop-shadow-md" />
                        </div>
                      )}
                    </div>
                  ))}

                  {devicePhotos.length === 0 && (
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="col-span-3 aspect-auto rounded-xl bg-white/[0.02] border border-white/[0.06] p-3 flex items-center gap-3 cursor-pointer hover:bg-white/[0.04] transition-colors"
                    >
                      <Compass className="w-5 h-5 text-zinc-500 shrink-0" />
                      <p className="text-[11px] text-zinc-400 font-sans leading-tight">
                        Cihazınızdaki fotoğraflardan birini seçmek için sol taraftaki <span className="text-[#C5A880] font-medium">Fotoğraf Seç</span> butonuna tıklayın.
                      </p>
                    </div>
                  )}
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
                  className="w-full p-3 rounded-xl bg-[#111113] border border-white/[0.08] text-white placeholder-zinc-500 text-xs focus:outline-none focus:border-[#C5A880]/50 font-sans resize-none leading-relaxed"
                />
              </div>
            </div>

            {/* Free OpenStreetMap & GPS Location Selector */}
            <div className="space-y-3 p-3.5 rounded-2xl bg-[#111113] border border-white/[0.08]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-sans text-zinc-300">
                  <MapPin className="w-3.5 h-3.5 text-[#C5A880]" />
                  <span className="font-medium">Konum Ekle</span>
                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded-md border border-emerald-500/20">
                    Ücretsiz Harita & GPS
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={handleDetectCurrentLocation}
                    disabled={isLocating}
                    className="px-2.5 py-1 rounded-full text-[11px] font-sans bg-white/[0.06] hover:bg-white/[0.12] text-white border border-white/10 flex items-center gap-1.5 transition-colors cursor-pointer"
                    title="Cihaz GPS Konumunu Al"
                  >
                    {isLocating ? (
                      <>
                        <Loader2 className="w-3 h-3 animate-spin text-[#C5A880]" />
                        <span>Bulunuyor...</span>
                      </>
                    ) : (
                      <>
                        <Navigation className="w-3 h-3 text-[#C5A880]" />
                        <span>Mevcut Konumum</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowLocationSearch(!showLocationSearch)}
                    className={`px-2.5 py-1 rounded-full text-[11px] font-sans border transition-colors cursor-pointer flex items-center gap-1 ${
                      showLocationSearch
                        ? 'bg-[#C5A880] text-black border-[#C5A880] font-medium'
                        : 'bg-white/[0.06] hover:bg-white/[0.12] text-zinc-300 border-white/10'
                    }`}
                  >
                    <Search className="w-3 h-3" />
                    <span>Ara</span>
                  </button>
                </div>
              </div>

              {/* Realtime OpenStreetMap Search Input */}
              {showLocationSearch && (
                <div className="space-y-2 pt-1 animate-in fade-in duration-150">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={locationSearchQuery}
                      onChange={(e) => handleSearchLocations(e.target.value)}
                      placeholder="Şehir, ilçe veya mekan ara (örn: Kadıköy, Bebek, Amsterdam, Berlin)..."
                      className="w-full pl-8.5 pr-8 py-2 rounded-xl bg-[#1A1A1E] border border-white/15 text-white placeholder-zinc-500 text-xs focus:outline-none focus:border-[#C5A880]/50 font-sans"
                    />
                    {isSearchingLocation && (
                      <Loader2 className="w-3.5 h-3.5 text-[#C5A880] animate-spin absolute right-3 top-1/2 -translate-y-1/2" />
                    )}
                  </div>

                  {/* Suggestions Dropdown */}
                  {locationSuggestions.length > 0 && (
                    <div className="rounded-xl bg-[#1A1A1E] border border-white/15 overflow-hidden shadow-2xl divide-y divide-white/[0.06] max-h-40 overflow-y-auto">
                      {locationSuggestions.map((item, idx) => (
                        <div
                          key={idx}
                          onClick={() => {
                            setSelectedLocation(item.displayName.split(',').slice(0, 3).join(', '));
                            setLocationCoords({ lat: item.lat, lon: item.lon });
                            setLocationSuggestions([]);
                            setShowLocationSearch(false);
                          }}
                          className="p-2.5 hover:bg-white/[0.06] text-xs text-zinc-300 hover:text-white flex items-center gap-2 cursor-pointer transition-colors"
                        >
                          <MapPin className="w-3.5 h-3.5 text-[#C5A880] shrink-0" />
                          <span className="truncate">{item.displayName}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Active Location Display */}
              {selectedLocation && (
                <div className="flex items-center justify-between p-2 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-2 h-2 rounded-full bg-emerald-400 shrink-0 animate-pulse" />
                    <span className="text-xs text-white font-sans truncate font-medium">
                      {selectedLocation}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedLocation('');
                      setLocationCoords(null);
                    }}
                    className="p-1 rounded-full text-zinc-400 hover:text-rose-400 hover:bg-white/10 transition-colors cursor-pointer"
                    title="Konumu Kaldır"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {/* OpenStreetMap Live Interactive Preview */}
              {locationCoords && (
                <div className="w-full h-24 rounded-xl overflow-hidden border border-white/10 relative shadow-inner">
                  <iframe
                    width="100%"
                    height="100%"
                    frameBorder="0"
                    scrolling="no"
                    src={`https://www.openstreetmap.org/export/embed.html?bbox=${locationCoords.lon - 0.012}%2C${locationCoords.lat - 0.012}%2C${locationCoords.lon + 0.012}%2C${locationCoords.lat + 0.012}&layer=mapnik&marker=${locationCoords.lat}%2C${locationCoords.lon}`}
                    className="w-full h-full opacity-80 filter contrast-125"
                    title="OpenStreetMap"
                  />
                  <div className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded-md bg-black/85 backdrop-blur-md text-[9px] font-mono text-[#C5A880] border border-white/10 pointer-events-none flex items-center gap-1">
                    <Compass className="w-2.5 h-2.5" />
                    <span>OpenStreetMap</span>
                  </div>
                </div>
              )}

              {/* Quick Presets Strip */}
              <div className="flex items-center gap-1.5 flex-wrap pt-1 border-t border-white/[0.04]">
                <span className="text-[10px] font-mono text-zinc-500 uppercase mr-1">Popüler:</span>
                {[
                  { name: 'Amsterdam', coords: { lat: 52.3676, lon: 4.9041 } },
                  { name: 'Paris Le Marais', coords: { lat: 48.8566, lon: 2.3522 } },
                  { name: 'İstanbul Bebek', coords: { lat: 41.0766, lon: 29.0433 } },
                  { name: 'Berlin Mitte', coords: { lat: 52.5200, lon: 13.4050 } },
                  { name: 'Rotterdam', coords: { lat: 51.9244, lon: 4.4777 } },
                  { name: 'London Soho', coords: { lat: 51.5136, lon: -0.1365 } },
                ].map((item) => (
                  <button
                    key={item.name}
                    type="button"
                    onClick={() => {
                      setSelectedLocation(item.name);
                      setLocationCoords(item.coords);
                    }}
                    className={`px-2.5 py-1 rounded-full text-[11px] font-sans transition-all cursor-pointer ${
                      selectedLocation === item.name
                        ? 'bg-[#C5A880] text-black font-semibold shadow-xs'
                        : 'bg-[#1A1A1E] text-zinc-400 border border-white/[0.06] hover:text-white hover:border-white/20'
                    }`}
                  >
                    {item.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Adult Discretion & Privacy Options */}
            <div className="space-y-3 pt-2 border-t border-white/[0.06]">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="text-xs font-sans font-medium text-white flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5 text-[#C5A880]" />
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
                    hasFaceMask ? 'bg-[#C5A880]' : 'bg-white/10'
                  }`}
                >
                  <div className={`w-5 h-5 rounded-full bg-black transition-transform absolute top-0.5 ${
                    hasFaceMask ? 'left-5.5' : 'left-0.5'
                  }`} />
                </button>
              </div>

              {/* Sensitive Media (NSFW Blur) Toggle */}
              <div className="flex items-center justify-between pt-1">
                <div className="space-y-0.5">
                  <div className="text-xs font-sans font-medium text-white flex items-center gap-1.5">
                    <EyeOff className="w-3.5 h-3.5 text-amber-400" />
                    <span>Hassas İçerik Sansürü (NSFW Blur)</span>
                  </div>
                  <div className="text-[11px] text-zinc-500 font-sans">
                    Akışta koruyucu buzlu perdeyle sunulur; kullanıcı onayladığında açılır.
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsSensitive(!isSensitive)}
                  className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                    isSensitive ? 'bg-amber-500' : 'bg-white/10'
                  }`}
                >
                  <div className={`w-5 h-5 rounded-full bg-black transition-transform absolute top-0.5 ${
                    isSensitive ? 'left-5.5' : 'left-0.5'
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
                        ? 'bg-[#C5A880]/15 border-[#C5A880] text-[#C5A880]'
                        : 'bg-[#111113] border-white/10 text-zinc-400'
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
                        ? 'bg-[#C5A880]/15 border-[#C5A880] text-[#C5A880]'
                        : 'bg-[#111113] border-white/10 text-zinc-400'
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
                        ? 'bg-[#C5A880]/15 border-[#C5A880] text-[#C5A880]'
                        : 'bg-[#111113] border-white/10 text-zinc-400'
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
