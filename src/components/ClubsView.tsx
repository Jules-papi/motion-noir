import React, { useState } from 'react';
import {
  Users2,
  Sparkles,
  Check,
  Plus,
  Lock,
  Globe,
  MessageCircle,
  Search,
  Crown
} from 'lucide-react';
import { ClubCommunity, UserProfile } from '../types';

interface ClubsViewProps {
  clubs: ClubCommunity[];
  currentUser: UserProfile;
  onToggleJoin: (clubId: string) => void;
  onOpenClubChat: (club: ClubCommunity) => void;
}

export const ClubsView: React.FC<ClubsViewProps> = ({
  clubs,
  currentUser,
  onToggleJoin,
  onOpenClubChat,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const categories = [
    { id: 'all', label: 'All Chapters' },
    { id: 'Gece Hayatı & Parti', label: 'Nocturne & Soirées' },
    { id: 'Sanat & Fotoğraf', label: 'Fine Arts & Prints' },
    { id: 'Lifestyle & Seyahat', label: 'Retreats & Travel' },
    { id: 'Müzik & Prodüksiyon', label: 'Vinyl & Acoustics' }
  ];

  const filteredClubs = clubs.filter(club => {
    const matchesCategory = selectedCategory === 'all' || club.category === selectedCategory;
    const matchesSearch = club.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          club.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16">
      {/* Editorial Chapter Header */}
      <div className="bg-[#111113] border border-white/[0.08] rounded-2xl p-6 sm:p-7 shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-xl space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1A1A1E] border border-white/10 text-[11px] font-sans font-medium text-[#C5A880]">
            <Crown className="w-3.5 h-3.5 text-[#C5A880]" />
            <span>Cercles & Chapitres Privés</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-serif font-light text-white tracking-wide">
            Private Circles & Conclaves
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed font-sans font-normal">
            Affiliate with discreet fraternities, analog art salons, and confidential nocturnal gatherings across Paris, Amsterdam, and international chapters.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search chapters or disciplines..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-full text-xs bg-[#111113] border border-white/[0.08] text-white placeholder-zinc-500 focus:outline-none focus:border-white/20 transition-colors"
          />
        </div>

        {/* Category Capsule Pills */}
        <div className="inline-flex items-center p-1 rounded-full bg-[#111113] border border-white/[0.08] overflow-x-auto no-scrollbar max-w-full">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-sans transition-all whitespace-nowrap cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-[#1A1A1E] text-white font-medium shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Clubs Grid or Empty State */}
      {filteredClubs.length === 0 ? (
        <div className="bg-[#111113] border border-white/[0.08] rounded-2xl p-10 text-center space-y-3 shadow-xl">
          <div className="w-12 h-12 mx-auto rounded-full bg-[#1A1A1E] border border-white/10 flex items-center justify-center text-zinc-400">
            <Users2 className="w-6 h-6 text-zinc-400" />
          </div>
          <h3 className="font-sans font-medium text-sm text-white">
            No Circles Found in This Chapter
          </h3>
          <p className="text-xs text-zinc-400 max-w-sm mx-auto">
            Clear your search keyword or browse all chapters to explore society circles.
          </p>
          <button
            onClick={() => {
              setSelectedCategory('all');
              setSearchQuery('');
            }}
            className="px-4 py-2 rounded-full text-xs font-sans font-medium bg-white hover:bg-zinc-200 text-black transition-colors cursor-pointer"
          >
            Show All Chapters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
          {filteredClubs.map(club => (
            <div
              key={club.id}
              className="bg-[#111113] border border-white/[0.08] rounded-2xl overflow-hidden shadow-xl hover:border-white/15 transition-all flex flex-col"
            >
              {/* Club Cover */}
              <div className="h-40 relative overflow-hidden bg-[#09090B]">
                <img
                  src={club.coverImage}
                  alt={club.name}
                  className="w-full h-full object-cover filter contrast-[1.05]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#111113] via-black/40 to-transparent" />

                <div className="absolute top-3 right-3 flex items-center gap-1.5">
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-sans font-medium backdrop-blur-md bg-black/60 border border-white/15 text-white flex items-center gap-1">
                    {club.isPrivate ? <Lock className="w-3 h-3 text-[#C5A880]" /> : <Globe className="w-3 h-3 text-zinc-400" />}
                    <span>{club.isPrivate ? 'Confidential' : 'Open Salon'}</span>
                  </span>
                </div>

                <div className="absolute bottom-3 left-4 right-4">
                  <span className="text-[10px] uppercase font-mono tracking-widest text-[#C5A880] block mb-1">
                    {club.category}
                  </span>
                  <h3 className="text-base font-sans font-semibold text-white leading-tight">
                    {club.name}
                  </h3>
                </div>
              </div>

              {/* Content & Actions */}
              <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-4">
                <p className="text-xs text-zinc-400 leading-relaxed font-normal">
                  {club.description}
                </p>

                <div className="p-2.5 rounded-xl bg-[#1A1A1E] border border-white/[0.06] text-[11px] text-zinc-400 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
                  <span className="truncate">Recent Dispatch: {club.recentActivity}</span>
                </div>

                {/* Member Capacity Progress Bar */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-[11px] font-sans text-zinc-400">
                    <span>Chapter Quota</span>
                    <span className="font-mono text-zinc-300">%{Math.min(96, Math.round((club.membersCount / 1200) * 100))}</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-[#1A1A1E] overflow-hidden">
                    <div
                      className="h-full rounded-full bg-white/70"
                      style={{ width: `${Math.min(96, Math.round((club.membersCount / 1200) * 100))}%` }}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-white/[0.06]">
                  <div className="flex items-center gap-1.5 text-xs font-sans text-zinc-400">
                    <Users2 className="w-4 h-4 text-zinc-400" />
                    <span>{club.membersCount.toLocaleString()} Members</span>
                  </div>

                  <div className="flex items-center gap-2">
                    {club.isJoined && (
                      <button
                        onClick={() => onOpenClubChat(club)}
                        className="px-3.5 py-1.5 rounded-full text-xs font-sans font-medium bg-[#1A1A1E] hover:bg-[#1A1A1E] text-white border border-white/10 flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <MessageCircle className="w-3.5 h-3.5 text-zinc-400" />
                        <span>Chamber</span>
                      </button>
                    )}

                    <button
                      onClick={() => onToggleJoin(club.id)}
                      className={`px-4 py-1.5 rounded-full text-xs font-sans font-medium flex items-center gap-1.5 transition-all cursor-pointer shadow-sm ${
                        club.isJoined
                          ? 'bg-[#1A1A1E] text-emerald-300 border border-emerald-500/30'
                          : 'bg-white hover:bg-zinc-200 text-black'
                      }`}
                    >
                      {club.isJoined ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Admitted</span>
                        </>
                      ) : (
                        <>
                          <Plus className="w-3.5 h-3.5" />
                          <span>Admit</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
