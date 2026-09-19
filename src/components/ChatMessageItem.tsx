import React, { useState, useEffect } from 'react';
import { 
  Play, 
  Pause, 
  Check, 
  CheckCheck, 
  Flame, 
  Lock, 
  Eye, 
  Clock, 
  X, 
  ShieldAlert,
  Sparkles
} from 'lucide-react';
import { ChatMessage } from '../types';

interface ChatMessageItemProps {
  msg: ChatMessage;
  isMe: boolean;
  isPlayingAudio: boolean;
  onToggleAudio: (msg: ChatMessage) => void;
  onMarkViewedOnce?: (id: string) => void;
}

export const ChatMessageItem: React.FC<ChatMessageItemProps> = ({
  msg,
  isMe,
  isPlayingAudio,
  onToggleAudio,
  onMarkViewedOnce,
}) => {
  const [isViewingModal, setIsViewingModal] = useState(false);
  const [secondsRemaining, setSecondsRemaining] = useState(5);
  const [hasViewedLocal, setHasViewedLocal] = useState(msg.isViewedOnce || false);

  const isViewOnceMsg = msg.isViewOnce;

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isViewingModal && secondsRemaining > 0) {
      timer = setInterval(() => {
        setSecondsRemaining(prev => {
          if (prev <= 1) {
            setIsViewingModal(false);
            setHasViewedLocal(true);
            onMarkViewedOnce?.(msg.id);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isViewingModal, secondsRemaining, msg.id, onMarkViewedOnce]);

  const handleOpenViewOnce = () => {
    if (hasViewedLocal) return;
    setSecondsRemaining(5);
    setIsViewingModal(true);
  };

  const handleCloseViewOnceEarly = () => {
    setIsViewingModal(false);
    setHasViewedLocal(true);
    onMarkViewedOnce?.(msg.id);
  };

  return (
    <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
      {!isMe && msg.senderName && (
        <div className="flex items-center gap-1.5 mb-1 ml-1 text-[10px] font-mono text-[#E5C590]">
          {msg.senderAvatar && (
            <img src={msg.senderAvatar} alt="" className="w-3.5 h-3.5 rounded-full object-cover" />
          )}
          <span>{msg.senderName}</span>
        </div>
      )}
      <div
        className={`max-w-[85%] sm:max-w-md rounded-2xl px-4 py-3 text-xs shadow-md ${
          isMe
            ? 'bg-[#181B22] text-white border border-white/[0.14] rounded-br-xs'
            : 'bg-[#121419] text-zinc-200 border border-white/[0.08] rounded-bl-xs'
        }`}
      >
        {/* View-Once Ephemeral Plate */}
        {isViewOnceMsg ? (
          <div className="py-1">
            {hasViewedLocal ? (
              <div className="flex items-center gap-2.5 p-3 rounded-xl bg-black/40 border border-white/[0.06] text-zinc-500">
                <Flame className="w-4 h-4 text-zinc-600" />
                <span className="font-serif italic text-[11px] text-zinc-400">
                  Ephemeral media viewed and permanently destroyed.
                </span>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleOpenViewOnce}
                className="w-full flex items-center justify-between gap-3 p-3 rounded-xl transition-all cursor-pointer bg-[#181B22] border border-[#E5C590]/30 hover:border-[#E5C590]/60 text-[#E5C590]"
              >
                <div className="flex items-center gap-2.5 text-left">
                  <div className="w-7 h-7 rounded-full bg-[#E5C590] text-black flex items-center justify-center font-mono font-bold text-[11px]">
                    1x
                  </div>
                  <div>
                    <span className="font-serif font-medium block text-xs text-white">
                      Confidential Ephemeral Plate
                    </span>
                    <span className="text-[10px] text-zinc-400 font-sans block">
                      Self-destructs 5 seconds upon unveiling
                    </span>
                  </div>
                </div>
                <Eye className="w-4 h-4 shrink-0 text-[#E5C590]" />
              </button>
            )}
            {msg.text && <p className="mt-2 text-zinc-300 font-sans leading-relaxed">{msg.text}</p>}
          </div>
        ) : msg.isAudio ? (
          /* Audio Dispatch Player */
          <div className="flex items-center gap-3 py-1.5 min-w-[210px] sm:min-w-[240px]">
            <button
              onClick={() => onToggleAudio(msg)}
              className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 shadow-xs transition-transform active:scale-95 cursor-pointer ${
                isMe 
                  ? 'bg-[#E5C590] text-black hover:bg-[#d9b880]' 
                  : 'bg-[#181B22] text-[#E5C590] border border-[#E5C590]/30 hover:bg-[#20242e]'
              }`}
              aria-label={isPlayingAudio ? 'Pause' : 'Play'}
            >
              {isPlayingAudio ? (
                <Pause className="w-4 h-4 fill-current" />
              ) : (
                <Play className="w-4 h-4 ml-0.5 fill-current" />
              )}
            </button>
            <div className="flex-1 space-y-1.5">
              {/* Dynamic Sound Waveform */}
              <div className="flex items-center gap-0.5 sm:gap-1 h-6">
                {(msg.audioWaveform && msg.audioWaveform.length >= 10
                  ? msg.audioWaveform
                  : [14, 22, 10, 26, 18, 28, 12, 20, 24, 16, 26, 10, 18, 22, 14, 28, 16, 20]
                ).map((h, i) => {
                  const totalBars = (msg.audioWaveform?.length || 18);
                  const progressIdx = Math.floor(totalBars * 0.6);
                  const isActive = isPlayingAudio && i <= progressIdx;
                  return (
                    <span
                      key={i}
                      style={{ height: `${h}px` }}
                      className={`w-1 sm:w-1.5 rounded-full transition-all duration-150 ${
                        isActive 
                          ? 'bg-[#E5C590]' 
                          : 'bg-white/20'
                      }`}
                    />
                  );
                })}
              </div>
              <div className="flex items-center justify-between text-[10px] text-zinc-400 font-mono">
                <span>{isPlayingAudio ? 'Playing' : '0:00'}</span>
                <span>{msg.audioDuration || '0:14'}</span>
              </div>
            </div>
          </div>
        ) : (
          <p className="leading-relaxed whitespace-pre-wrap text-zinc-200 font-sans">{msg.text}</p>
        )}

        {/* Metadata & Status */}
        <div
          className={`flex items-center justify-end gap-1.5 mt-1.5 text-[10px] font-mono ${
            isMe ? 'text-zinc-400' : 'text-zinc-500'
          }`}
        >
          <span>{msg.createdAt}</span>
          {isMe && (
            <span>
              {msg.status === 'seen' ? (
                <CheckCheck className="w-3.5 h-3.5 text-[#E5C590]" />
              ) : msg.status === 'delivered' ? (
                <CheckCheck className="w-3.5 h-3.5 text-zinc-400" />
              ) : (
                <Check className="w-3 h-3 text-zinc-400" />
              )}
            </span>
          )}
        </div>
      </div>

      {/* Ephemeral View-Once Fullscreen Modal */}
      {isViewingModal && (
        <div className="fixed inset-0 z-70 bg-black/95 backdrop-blur-md flex flex-col items-center justify-center p-4 select-none">
          {/* Top Bar with Countdown */}
          <div className="max-w-md w-full flex items-center justify-between text-white mb-4">
            <div className="flex items-center gap-2 bg-[#121419] border border-[#E5C590]/40 px-3.5 py-1.5 rounded-full text-xs font-mono text-[#E5C590] shadow-xl">
              <Flame className="w-4 h-4 text-[#E5C590]" />
              <span>Self-destructing in {secondsRemaining}s</span>
            </div>

            <button
              onClick={handleCloseViewOnceEarly}
              className="p-2 rounded-full bg-[#181B22] border border-white/10 text-zinc-300 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Ephemeral Photo */}
          <div className="max-w-md w-full max-h-[75vh] rounded-2xl overflow-hidden border border-white/10 shadow-2xl relative bg-[#121419]">
            <img
              src={msg.mediaUrl || 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=1000&auto=format&fit=crop&q=80'}
              alt="View Once Private Media"
              className="w-full h-full object-cover select-none pointer-events-none"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
          </div>

          <div className="mt-4 flex items-center gap-2 text-zinc-400 text-xs font-sans">
            <ShieldAlert className="w-4 h-4 text-[#E5C590]" />
            <span>Screen capture prohibited · Auto-destruction protocol active</span>
          </div>
        </div>
      )}
    </div>
  );
};
