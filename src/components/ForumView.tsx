import React, { useState } from 'react';
import {
  MessageSquare,
  ThumbsUp,
  Eye,
  Plus,
  Search,
  Pin,
  Crown
} from 'lucide-react';
import { ForumCategory, ForumTopic, UserProfile } from '../types';
import { CreateTopicModal } from './CreateTopicModal';
import { ForumTopicDetail } from './ForumTopicDetail';

interface ForumViewProps {
  categories: ForumCategory[];
  topics: ForumTopic[];
  currentUser: UserProfile;
  onUpvoteTopic: (topicId: string) => void;
  onAddReply: (topicId: string, content: string) => void;
  onCreateTopic: (newTopic: { title: string; content: string; categoryId: string; tags: string[] }) => void;
  onReportTopic: (topic: ForumTopic) => void;
}

export const ForumView: React.FC<ForumViewProps> = ({
  categories,
  topics,
  currentUser,
  onUpvoteTopic,
  onAddReply,
  onCreateTopic,
  onReportTopic,
}) => {
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTopicId, setActiveTopicId] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const filteredTopics = topics.filter(t => {
    const matchesCategory = selectedCategoryId === 'all' || t.categoryId === selectedCategoryId;
    const matchesSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          t.content.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const activeTopic = topics.find(t => t.id === activeTopicId);

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16">
      {/* Forum Header Banner */}
      <div className="bg-[#111113] border border-white/[0.08] rounded-2xl p-6 sm:p-7 shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-xl space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1A1A1E] border border-white/10 text-[#C5A880] text-xs font-sans font-medium">
            <Crown className="w-3.5 h-3.5 text-[#C5A880]" />
            <span>Salons & Dispatches</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-serif font-light text-white tracking-wide">
            Chamber Debates & Nocturne Chronicles
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed font-sans font-normal">
            Exchange confidential dispatches on European nightlife, vernissages, travel retreats, and member etiquette.
          </p>
          <div className="pt-2">
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="px-5 py-2.5 rounded-full bg-white hover:bg-zinc-200 text-black font-sans font-medium text-xs flex items-center gap-2 shadow-sm transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4 text-black" />
              <span>Initiate Chamber Debate</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Forum Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Categories Sidebar */}
        <div className="lg:col-span-1 space-y-2">
          <div className="bg-[#111113] border border-white/[0.08] rounded-2xl p-3 shadow-xl space-y-1">
            <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-500 px-3 py-1.5 block">
              Categories
            </span>
            <button
              onClick={() => {
                setSelectedCategoryId('all');
                setActiveTopicId(null);
              }}
              className={`w-full text-left px-3 py-2 rounded-xl text-xs font-sans transition-all flex items-center justify-between cursor-pointer ${
                selectedCategoryId === 'all'
                  ? 'bg-[#1A1A1E] text-white font-medium border border-white/10 shadow-xs'
                  : 'text-zinc-400 hover:text-white hover:bg-white/[0.03]'
              }`}
            >
              <span>All Salons</span>
              <span className="text-[11px] font-mono text-zinc-500">{topics.length}</span>
            </button>

            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => {
                  setSelectedCategoryId(cat.id);
                  setActiveTopicId(null);
                }}
                className={`w-full text-left px-3 py-2 rounded-xl text-xs font-sans transition-all flex items-center justify-between cursor-pointer ${
                  selectedCategoryId === cat.id
                    ? 'bg-[#1A1A1E] text-white font-medium border border-white/10 shadow-xs'
                    : 'text-zinc-400 hover:text-white hover:bg-white/[0.03]'
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  <span>{cat.iconName || '💬'}</span>
                  <span className="truncate">{cat.name}</span>
                </div>
                <span className="text-[11px] font-mono text-zinc-500 shrink-0">
                  {topics.filter(t => t.categoryId === cat.id).length}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Topics List or Topic Detail */}
        <div className="lg:col-span-3 space-y-4">
          {activeTopic ? (
            <ForumTopicDetail
              topic={activeTopic}
              currentUser={currentUser}
              onBack={() => setActiveTopicId(null)}
              onUpvoteTopic={onUpvoteTopic}
              onAddReply={onAddReply}
              onReportTopic={onReportTopic}
            />
          ) : (
            <>
              {/* Search Bar */}
              <div className="relative">
                <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search chamber dispatches or tags..."
                  className="w-full pl-9 pr-4 py-2 rounded-full bg-[#111113] border border-white/[0.08] text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-white/20 transition-colors"
                />
              </div>

              {/* List */}
              <div className="space-y-3">
                {filteredTopics.map(topic => (
                  <div
                    key={topic.id}
                    onClick={() => setActiveTopicId(topic.id)}
                    className="bg-[#111113] border border-white/[0.08] rounded-2xl p-4 sm:p-5 shadow-xl hover:border-white/15 transition-all cursor-pointer space-y-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1.5 flex-1">
                        <div className="flex items-center gap-2">
                          {topic.isPinned && (
                            <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-[#1A1A1E] border border-[#C5A880]/30 text-[#C5A880] font-sans font-medium flex items-center gap-1">
                              <Pin className="w-2.5 h-2.5" />
                              Pinned
                            </span>
                          )}
                          <h3 className="text-sm font-sans font-semibold text-white hover:text-zinc-200 transition-colors">
                            {topic.title}
                          </h3>
                        </div>
                        <p className="text-xs text-zinc-400 font-normal line-clamp-2 leading-relaxed">
                          {topic.content}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs text-zinc-500 pt-3 border-t border-white/[0.06]">
                      <div className="flex items-center gap-2">
                        <img
                          src={topic.author.avatar}
                          alt=""
                          className="w-5 h-5 rounded-full object-cover border border-white/10"
                        />
                        <span className="font-sans font-medium text-zinc-300">
                          {topic.author.name}
                        </span>
                        <span>•</span>
                        <span className="font-mono text-[11px]">{topic.createdAt}</span>
                      </div>

                      <div className="flex items-center gap-3.5">
                        <span className="flex items-center gap-1 text-zinc-400">
                          <ThumbsUp className="w-3.5 h-3.5 text-zinc-400" />
                          <span className="font-mono text-[11px]">{topic.upvotes}</span>
                        </span>
                        <span className="flex items-center gap-1 text-zinc-400">
                          <MessageSquare className="w-3.5 h-3.5 text-zinc-400" />
                          <span className="font-mono text-[11px]">{topic.repliesCount}</span>
                        </span>
                        <span className="flex items-center gap-1 text-zinc-500">
                          <Eye className="w-3.5 h-3.5 text-zinc-500" />
                          <span className="font-mono text-[11px]">{topic.viewsCount}</span>
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Create Topic Modal */}
      <CreateTopicModal
        isOpen={isCreateModalOpen}
        categories={categories}
        onClose={() => setIsCreateModalOpen(false)}
        onCreateTopic={onCreateTopic}
      />
    </div>
  );
};
