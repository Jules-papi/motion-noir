import React, { useState, useEffect, useRef } from 'react';
import { 
  Send, 
  Paperclip, 
  Mic, 
  Smile, 
  MoreVertical, 
  ShieldAlert, 
  Phone, 
  Video,
  ArrowLeft,
  Lock,
  Flame,
  Image as ImageIcon
} from 'lucide-react';
import { Conversation, UserProfile, ChatMessage } from '../types';
import { ChatSidebarList } from './ChatSidebarList';
import { ChatMessageItem } from './ChatMessageItem';
import { AudioRecorder } from './AudioRecorder';

interface ChatViewProps {
  conversations: Conversation[];
  currentUser: UserProfile;
  activeConversationId?: string;
  onSendMessage: (
    conversationId: string, 
    text: string, 
    isAudio?: boolean,
    audioDetails?: { blobUrl?: string; duration?: string; waveform?: number[] }
  ) => void;
  onReportUser: (targetUser: { id: string; name: string }) => void;
}

export const ChatView: React.FC<ChatViewProps> = ({
  conversations: initialConversations,
  currentUser,
  activeConversationId,
  onSendMessage,
  onReportUser,
}) => {
  const [conversations, setConversations] = useState<Conversation[]>(initialConversations);
  const [selectedConvId, setSelectedConvId] = useState<string>(() => {
    if (activeConversationId) return activeConversationId;
    if (typeof window !== 'undefined' && window.innerWidth >= 768) {
      return initialConversations[0]?.id || '';
    }
    return '';
  });
  const [inputText, setInputText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isPlayingAudio, setIsPlayingAudio] = useState<string | null>(null);
  const [isRecordingAudio, setIsRecordingAudio] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const activeAudioElRef = useRef<HTMLAudioElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setConversations(initialConversations);
  }, [initialConversations]);

  useEffect(() => {
    if (activeConversationId) {
      setSelectedConvId(activeConversationId);
    }
  }, [activeConversationId]);

  useEffect(() => {
    const handleResize = () => {
      if (typeof window !== 'undefined' && window.innerWidth >= 768 && !selectedConvId && conversations.length > 0) {
        setSelectedConvId(conversations[0].id);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [selectedConvId, conversations]);

  const activeConversation = conversations.find(c => c.id === selectedConvId) || conversations[0];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [activeConversation?.messages]);

  // Ambient audio tone fallback for synthetic voice notes
  const playAmbientAudioTone = (durationSeconds = 6) => {
    try {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();
      audioContextRef.current = ctx;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(320, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 1.5);
      osc.frequency.exponentialRampToValueAtTime(360, ctx.currentTime + durationSeconds);

      gain.gain.setValueAtTime(0.001, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.04, ctx.currentTime + 0.3);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + durationSeconds);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + durationSeconds);
    } catch {
      // Autoplay fallback
    }
  };

  const handleToggleAudio = (msg: ChatMessage) => {
    if (isPlayingAudio === msg.id) {
      if (activeAudioElRef.current) {
        activeAudioElRef.current.pause();
        activeAudioElRef.current = null;
      }
      setIsPlayingAudio(null);
    } else {
      if (activeAudioElRef.current) {
        activeAudioElRef.current.pause();
      }

      if (msg.audioBlobUrl) {
        const audio = new Audio(msg.audioBlobUrl);
        activeAudioElRef.current = audio;
        audio.onended = () => setIsPlayingAudio(null);
        audio.play().catch(() => playAmbientAudioTone(5));
        setIsPlayingAudio(msg.id);
      } else {
        setIsPlayingAudio(msg.id);
        playAmbientAudioTone(7);
        setTimeout(() => {
          setIsPlayingAudio(prev => prev === msg.id ? null : prev);
        }, 7000);
      }
    }
  };

  const handleSend = () => {
    if (!inputText.trim()) return;
    onSendMessage(selectedConvId, inputText);
    setInputText('');
    setShowEmojiPicker(false);
  };

  const handleLiveAudioRecorded = (audioBlobUrl: string, durationStr: string, waveform: number[]) => {
    setIsRecordingAudio(false);
    onSendMessage(selectedConvId, '', true, {
      blobUrl: audioBlobUrl,
      duration: durationStr,
      waveform: waveform,
    });
  };

  const handleImageFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        const newMsg: ChatMessage = {
          id: `img-${Date.now()}`,
          conversationId: selectedConvId,
          senderId: currentUser.id,
          text: 'Encrypted Plate Dispatch',
          mediaUrl: dataUrl,
          mediaType: 'image',
          status: 'delivered',
          createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };

        setConversations(prev =>
          prev.map(c => {
            if (c.id === selectedConvId) {
              return {
                ...c,
                lastMessage: '📷 Encrypted Plate Dispatch',
                lastMessageTime: 'Just now',
                messages: [...c.messages, newMsg],
              };
            }
            return c;
          })
        );
      }
    };
    reader.readAsDataURL(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSendViewOnceMock = () => {
    const newMsg: ChatMessage = {
      id: `vo-${Date.now()}`,
      conversationId: selectedConvId,
      senderId: currentUser.id,
      text: 'Confidential Ephemeral Plate · Strictly unsealed for 5s',
      mediaUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=1200&auto=format&fit=crop&q=80',
      isViewOnce: true,
      isViewedOnce: false,
      status: 'delivered',
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setConversations(prev =>
      prev.map(c => {
        if (c.id === selectedConvId) {
          return {
            ...c,
            lastMessage: '1x Confidential Ephemeral Plate',
            lastMessageTime: 'Just now',
            messages: [...c.messages, newMsg],
          };
        }
        return c;
      })
    );
  };

  const handleMarkViewedOnce = (msgId: string) => {
    setConversations(prev =>
      prev.map(c => ({
        ...c,
        messages: c.messages.map(m => (m.id === msgId ? { ...m, isViewedOnce: true } : m)),
      }))
    );
  };

  const emojis = ['🍸', '🥂', '✨', '🗝️', '🌹', '🖤', '🔥', '👑', '🎭', '🌙', '🕯️', '🥂'];

  if (!activeConversation) {
    return (
      <div className="p-12 text-center bg-[#121419] rounded-2xl border border-white/[0.08] text-zinc-400 font-serif">
        No active dispatches found. Initialize a conversation from the Registry.
      </div>
    );
  }

  const filteredConversations = conversations.filter(c =>
    c.participant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.participant.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="bg-[#0c0d11] border border-white/[0.08] rounded-2xl overflow-hidden shadow-2xl flex flex-col md:flex-row h-[calc(100vh-140px)] min-h-[560px]">
      {/* Left Conversations Sidebar */}
      <ChatSidebarList
        conversations={conversations}
        filteredConversations={filteredConversations}
        selectedConvId={selectedConvId}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onSelectConversation={(id) => {
          setSelectedConvId(id);
          setConversations(prev =>
            prev.map(c => c.id === id ? { ...c, unreadCount: 0 } : c)
          );
        }}
      />

      {/* Right Chat Area */}
      <div className={`flex-1 flex-col bg-[#07080a] min-w-0 ${
        !selectedConvId ? 'hidden md:flex' : 'flex'
      }`}>
        {/* Chat Header */}
        <div className="p-3.5 px-5 bg-[#121419] border-b border-white/[0.08] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSelectedConvId('')}
              className="md:hidden flex items-center gap-1.5 py-1 px-2.5 -ml-1 rounded-full text-zinc-300 hover:text-white bg-white/5 border border-white/10"
              aria-label="Return to salon list"
            >
              <ArrowLeft className="w-4 h-4 text-[#E5C590]" />
              <span className="text-xs font-mono">Salons</span>
            </button>
            <div className="relative">
              <img
                src={activeConversation.participant.avatar}
                alt={activeConversation.participant.name}
                className="w-10 h-10 rounded-full object-cover border border-white/10"
              />
              {activeConversation.participant.isOnline && (
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 border-2 border-[#121419] rounded-full" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-serif text-sm text-white">
                  {activeConversation.participant.name}
                </span>
                {activeConversation.participant.membershipTier === 'vip' && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#181B22] text-[#E5C590] font-mono border border-[#E5C590]/30">
                    VIP
                  </span>
                )}
              </div>
              <div className="text-[11px] text-zinc-400 flex items-center gap-1.5 font-sans">
                {activeConversation.participant.isOnline ? (
                  <span className="text-emerald-400 font-mono text-[10px]">Active Now</span>
                ) : (
                  <span className="font-mono text-[10px]">Last active: {activeConversation.participant.lastSeen || 'Recent'}</span>
                )}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1.5 relative">
            <div className="hidden sm:flex items-center gap-1.5 mr-2 px-3 py-1 rounded-full bg-black/40 border border-white/[0.06] text-[11px] font-mono text-zinc-400">
              <Lock className="w-3 h-3 text-[#E5C590]" />
              <span>End-to-End Encrypted</span>
            </div>

            <button 
              title="Secure Audio Dispatch" 
              className="p-2 rounded-full text-zinc-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
            >
              <Phone className="w-4 h-4" />
            </button>
            <button 
              title="Encrypted Video Salon" 
              className="p-2 rounded-full text-zinc-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
            >
              <Video className="w-4 h-4" />
            </button>
            
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-2 rounded-full text-zinc-400 hover:text-white hover:bg-white/5 cursor-pointer"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {menuOpen && (
              <div className="absolute right-0 top-11 w-52 bg-[#181B22] border border-white/10 rounded-2xl shadow-2xl p-1.5 z-30">
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    onReportUser(activeConversation.participant);
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl text-xs font-medium text-rose-400 hover:bg-rose-500/10 flex items-center gap-2 cursor-pointer"
                >
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span>Submit Confidential Incident</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Messages Stream */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {activeConversation.messages.map(msg => (
            <ChatMessageItem
              key={msg.id}
              msg={msg}
              isMe={msg.senderId === currentUser.id}
              isPlayingAudio={isPlayingAudio === msg.id}
              onToggleAudio={handleToggleAudio}
              onMarkViewedOnce={handleMarkViewedOnce}
            />
          ))}

          {isTyping && (
            <div className="flex items-center gap-2 text-xs text-zinc-400 font-sans italic">
              <span className="w-1.5 h-1.5 rounded-full bg-[#E5C590] animate-ping" />
              <span>{activeConversation.participant.name} is composing...</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Concierge Suggested Quick Prompts */}
        {activeConversation.id === 'conv-concierge' && (
          <div className="px-4 py-2 bg-[#0e1014] border-t border-white/[0.04] flex items-center gap-2 overflow-x-auto no-scrollbar shrink-0">
            <span className="text-[10px] font-mono text-[#E5C590] shrink-0">Concierge Quick Inquiries:</span>
            {[
              '🍸 Bu Hafta Sonu Etkinlikleri Neler?',
              '🗝️ Gizli Kulüp & Loca Tavsiyesi',
              '✨ Profil & Fotoğraf Stil Önerisi',
              '📜 NDA & Güvenli Buluşma Protokolü',
              '💎 VIP & Privé Üyelik Ayrıcalıkları'
            ].map((prompt, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => onSendMessage(selectedConvId, prompt)}
                className="px-3 py-1 rounded-full bg-[#181B22] hover:bg-[#222631] text-zinc-300 hover:text-white border border-white/10 text-[11px] font-sans whitespace-nowrap cursor-pointer transition-colors shadow-xs"
              >
                {prompt}
              </button>
            ))}
          </div>
        )}

        {/* Message Input Box */}
        <div className="p-3.5 bg-[#121419] border-t border-white/[0.08] shrink-0 pb-[max(0.85rem,env(safe-area-inset-bottom))] relative">
          {/* Emoji Picker Popover */}
          {showEmojiPicker && (
            <div className="absolute bottom-16 left-4 bg-[#181B22] border border-white/10 rounded-2xl p-2.5 shadow-2xl z-30 flex items-center gap-1.5 animate-fadeIn">
              {emojis.map((emoji, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setInputText(prev => prev + emoji);
                    setShowEmojiPicker(false);
                  }}
                  className="p-1.5 hover:bg-white/10 rounded-lg text-base cursor-pointer transition-transform hover:scale-125"
                >
                  {emoji}
                </button>
              ))}
            </div>
          )}

          {/* Hidden File Input for Device Photo Attachment */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImageFileSelected}
          />

          {isRecordingAudio ? (
            /* Live Audio Note Recorder */
            <AudioRecorder
              onSendAudio={handleLiveAudioRecorded}
              onCancel={() => setIsRecordingAudio(false)}
            />
          ) : (
            <form
              onSubmit={e => {
                e.preventDefault();
                handleSend();
              }}
              className="flex items-center gap-2"
            >
              <button
                type="button"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className={`p-2 rounded-full transition-colors cursor-pointer ${
                  showEmojiPicker ? 'text-[#E5C590] bg-[#E5C590]/10' : 'text-zinc-400 hover:text-white hover:bg-white/5'
                }`}
                title="Salon Emotes"
              >
                <Smile className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="p-2 text-zinc-400 hover:text-white rounded-full hover:bg-white/5 transition-colors cursor-pointer"
                title="Attach Confidential Plate from Device"
              >
                <Paperclip className="w-4 h-4" />
              </button>

              {/* 1x Ephemeral View-Once Dispatch Trigger */}
              <button
                type="button"
                onClick={handleSendViewOnceMock}
                title="Attach Confidential Ephemeral Plate (Auto-destructs after 5s)"
                className="px-3 py-1.5 rounded-full bg-[#181B22] hover:bg-[#20242e] text-[#E5C590] border border-[#E5C590]/30 text-xs font-mono flex items-center gap-1.5 transition-colors shrink-0 cursor-pointer"
              >
                <Flame className="w-3.5 h-3.5 text-[#E5C590]" />
                <span className="font-bold text-[11px]">1x</span>
                <span className="hidden sm:inline text-[10px] text-zinc-400 font-sans">Ephemeral</span>
              </button>

              <input
                type="text"
                value={inputText}
                onChange={e => {
                  setInputText(e.target.value);
                  if (!isTyping && e.target.value) {
                    setIsTyping(true);
                    setTimeout(() => setIsTyping(false), 3000);
                  }
                }}
                placeholder="Compose confidential dispatch..."
                className="flex-1 px-4 py-2.5 text-xs rounded-full bg-[#181B22] border border-white/[0.08] text-white placeholder-zinc-500 focus:border-white/20 outline-none font-sans"
              />

              {inputText.trim() ? (
                <button
                  type="submit"
                  className="p-2.5 rounded-full bg-[#E5C590] hover:bg-[#d9b880] text-black font-semibold shadow-md active:scale-95 transition-all cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsRecordingAudio(true)}
                  title="Record Encrypted Voice Note (Mic)"
                  className="p-2.5 rounded-full bg-[#181B22] border border-white/10 text-zinc-300 hover:text-[#E5C590] hover:border-[#E5C590]/40 transition-colors cursor-pointer group"
                >
                  <Mic className="w-4 h-4 group-hover:scale-110 transition-transform" />
                </button>
              )}
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
