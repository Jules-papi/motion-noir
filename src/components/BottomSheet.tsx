import React, { useState, useRef, useEffect, useCallback } from 'react';
import { X } from 'lucide-react';

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  headerRight?: React.ReactNode;
  children: React.ReactNode;
  maxHeightClass?: string;
  className?: string;
}

export const BottomSheet: React.FC<BottomSheetProps> = ({
  isOpen,
  onClose,
  title,
  headerRight,
  children,
  maxHeightClass = 'h-[85vh] sm:h-[620px]',
  className = '',
}) => {
  const [dragY, setDragY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const touchStartY = useRef<number>(0);
  const touchStartTime = useRef<number>(0);

  // 1. Keyboard Escape Listener
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // 2. Body Scroll Lock
  useEffect(() => {
    if (!isOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [isOpen]);

  // 3. Touch Gesture Handlers (Swipe-to-Dismiss)
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
    touchStartTime.current = Date.now();
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    const currentY = e.touches[0].clientY;
    const diff = currentY - touchStartY.current;
    // Allow dragging downwards only (with minor negative bounce resistance)
    if (diff > 0) {
      setDragY(diff);
    } else {
      setDragY(diff * 0.15);
    }
  };

  const handleTouchEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);
    const duration = Date.now() - touchStartTime.current;
    const velocity = dragY / (duration || 1);

    // Dismiss if dragged down > 80px or swiped down fast (velocity > 0.5)
    if (dragY > 80 || velocity > 0.5) {
      onClose();
    }
    setDragY(0);
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          transform: dragY > 0 ? `translateY(${dragY}px)` : undefined,
          transition: isDragging ? 'none' : 'transform 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
        className={`bg-[#0E1015] border border-white/[0.12] rounded-t-3xl sm:rounded-2xl w-full max-w-lg ${maxHeightClass} flex flex-col overflow-hidden shadow-2xl animate-in slide-in-from-bottom-6 duration-250 ease-out ${className}`}
      >
        {/* Mobile Drag Handle Area (Minimum 44px touch target) */}
        <div
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          className="pt-3 pb-2 w-full flex items-center justify-center cursor-grab active:cursor-grabbing shrink-0 touch-none select-none"
        >
          <div className="w-12 h-1.5 bg-white/25 hover:bg-white/40 rounded-full transition-colors" />
        </div>

        {/* Sheet Header */}
        {(title || headerRight) && (
          <div className="px-5 py-3 border-b border-white/[0.08] flex items-center justify-between shrink-0 bg-[#0E1015]">
            <div className="flex items-center gap-2 min-w-0">
              {typeof title === 'string' ? (
                <h3 className="font-sans text-sm text-white font-semibold tracking-tight truncate">
                  {title}
                </h3>
              ) : (
                title
              )}
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {headerRight}
              <button
                type="button"
                onClick={onClose}
                aria-label="Kapat"
                className="w-11 h-11 flex items-center justify-center rounded-full text-zinc-400 hover:text-white hover:bg-white/[0.08] transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* Sheet Content Area (Safe area padded) */}
        <div className="flex-1 overflow-y-auto overscroll-contain pb-[max(1rem,env(safe-area-inset-bottom))]">
          {children}
        </div>
      </div>
    </div>
  );
};
