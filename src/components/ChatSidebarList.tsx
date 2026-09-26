import React from 'react';
import { Search, Crown, Users } from 'lucide-react';
import { Conversation } from '../types';

interface ChatSidebarListProps {
  conversations: Conversation[];
  filteredConversations: Conversation[];
  selectedConvId: string;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onSelectConversation: (id: string) => void;
}

export const ChatSidebarList: React.FC<ChatSidebarListProps> = ({
  conversations,
  filteredConversations,
  selectedConvId,
  searchQuery,
  onSearchChange,
  onSelectConversation,
}) => {
  return (
    <div
      className={`w-full md:w-80 lg:w-96 border-r border-white/[0.08] flex-col shrink-0 bg-[#09090B] ${
        selectedConvId ? 'hidden md:flex' : 'flex'
      }`}
    >
      {/* Header & Search */}
      <div className="p-5 border-b border-white/[0.08] space-y-4">
        <div className="space-y-1.5">
          <h2 className="text-lg font-serif font-normal text-white flex items-center gap-2">
            <span>Mesajlar</span>
            {conversations.reduce((acc, c) => acc + c.unreadCount, 0) > 0 && (
              <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-[#1A1A1E] border border-[#C5A880]/30 text-[#C5A880]">
                {conversations.reduce((acc, c) => acc + c.unreadCount, 0)} new
              </span>
            )}
          </h2>
          <p className="text-xs leading-relaxed text-[#9A9996]">
            Uçtan uca şifreli birebir yazışmalar ve özel salonlar.
          </p>
        </div>

        <div className="relative">
          <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => onSearchChange(e.target.value)}
            placeholder="Sohbetlerde ara..."
            aria-label="Search conversations"
            className="w-full pl-9 pr-3 py-2 text-xs rounded-full bg-[#111113] border border-white/[0.08] text-white placeholder-zinc-500 focus:border-white/20 outline-none font-sans"
          />
        </div>
      </div>

      {/* Conversation List */}
      <div className="flex-1 overflow-y-auto divide-y divide-white/[0.04] no-scrollbar">
        {filteredConversations.map(conv => {
          const isSelected = conv.id === selectedConvId;
          return (
            <button
              type="button"
              key={conv.id}
              onClick={() => onSelectConversation(conv.id)}
              aria-current={isSelected ? 'true' : undefined}
              className={`w-full p-3.5 flex items-center gap-3 text-left cursor-pointer transition-colors ${
                isSelected
                  ? 'bg-[#1A1A1E] border-y border-white/[0.06]'
                  : 'hover:bg-white/[0.02]'
              }`}
            >
              {/* Avatar with Online or Multi-party indicator */}
              <div className="relative shrink-0">
                {conv.isGroup && conv.groupParticipants && conv.groupParticipants.length >= 2 ? (
                  <div className="w-11 h-11 relative">
                    <img
                      src={conv.groupParticipants[1].avatar}
                      alt="P1"
                      className="w-7 h-7 rounded-full object-cover border border-[#09090B] absolute top-0 left-0"
                    />
                    <img
                      src={conv.groupParticipants[2].avatar}
                      alt="P2"
                      className="w-7 h-7 rounded-full object-cover border border-[#09090B] absolute bottom-0 right-0"
                    />
                    <span className="absolute -bottom-1 -left-1 w-4 h-4 rounded-full bg-[#1A1A1E] border border-[#C5A880]/40 flex items-center justify-center text-[9px] text-[#C5A880] font-mono">
                      3p
                    </span>
                  </div>
                ) : (
                  <>
                    <img
                      src={conv.participant.avatar}
                      alt={conv.participant.name}
                      className="w-11 h-11 rounded-full object-cover border border-white/10"
                    />
                    {conv.participant.isOnline && (
                      <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 border-2 border-[#09090B] rounded-full" />
                    )}
                  </>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1.5 truncate">
                    {conv.isGroup && <Users className="w-3 h-3 text-[#C5A880] shrink-0" />}
                    <span className="font-sans font-medium text-xs text-white truncate">
                      {conv.groupTitle || conv.participant.name}
                    </span>
                    {conv.participant.membershipTier === 'vip' && (
                      <Crown className="w-3 h-3 text-[#C5A880] shrink-0" />
                    )}
                  </div>
                  <span className="text-[10px] text-zinc-500 font-mono shrink-0">
                    {conv.lastMessageTime}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs text-zinc-400 truncate font-sans font-light">
                    {conv.lastMessage || 'Dispatch channel established'}
                  </p>
                  {conv.unreadCount > 0 && (
                    <span className="w-5 h-5 rounded-full bg-[#C5A880] text-black font-mono font-bold text-[10px] flex items-center justify-center shrink-0">
                      {conv.unreadCount}
                    </span>
                  )}
                </div>
              </div>
            </button>
          );
        })}
        {filteredConversations.length === 0 && (
          <div className="px-5 py-10 text-center text-xs leading-relaxed text-[#9A9996]">
            No conversations match your search.
          </div>
        )}
      </div>
    </div>
  );
};
