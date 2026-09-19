import React, { useState, useEffect, useRef } from 'react';
import { Plus, X, ChevronLeft, ChevronRight, Heart } from 'lucide-react';
import { Story, UserProfile } from '../types';

interface StoriesBarProps {
  stories: Story[];
  currentUser: UserProfile;
  onAddStory: () => void;
}

export const StoriesBar: React.FC<StoriesBarProps> = ({
  stories,
  currentUser,
  onAddStory,
}) => {
  const [activeStoryIndex, setActiveStoryIndex] = useState<number | null>(null);
  const [progress, setProgress] = useState<number>(0);
  const [isLiked, setIsLiked] = useState<boolean>(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scrollStories = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === 'left' ? -220 : 220;
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    if (activeStoryIndex === null) {
      setProgress(0);
      setIsLiked(false);
      return;
    }

    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          if (activeStoryIndex < stories.length - 1) {
            setActiveStoryIndex(activeStoryIndex + 1);
            return 0;
          } else {
            setActiveStoryIndex(null);
            return 0;
          }
        }
        return prev + 2;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [activeStoryIndex, stories.length]);

  const activeStory = activeStoryIndex !== null ? stories[activeStoryIndex] : null;

  return (
    <>
      {/* Editorial Vignette Bar */}
      <div className="relative group mb-6">
        {/* Left Scroll Button */}
        <button
          onClick={() => scrollStories('left')}
          className="hidden sm:flex absolute -left-3 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-[#181B22] shadow-xl border border-white/15 items-center justify-center text-zinc-400 hover:text-white transition-all opacity-0 group-hover:opacity-100 cursor-pointer"
          aria-label="Previous Stories"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* Stories Scroll Container */}
        <div 
          ref={scrollContainerRef}
          className="flex items-center gap-3 overflow-x-auto no-scrollbar scroll-smooth py-1"
        >
          {/* Add Vignette Card */}
          <div 
            onClick={onAddStory}
            className="flex flex-col items-center gap-1.5 shrink-0 cursor-pointer group/btn"
          >
            <div className="relative w-20 h-28 rounded-2xl border border-dashed border-white/15 group-hover/btn:border-white/35 bg-[#121419] flex flex-col items-center justify-center p-1 transition-all overflow-hidden shadow-sm">
              <img 
                src={currentUser.avatar} 
                alt={currentUser.name} 
                className="w-9 h-9 rounded-full object-cover opacity-60 group-hover/btn:opacity-90 transition-opacity mb-1.5"
              />
              <div className="w-5 h-5 rounded-full bg-white text-black flex items-center justify-center text-xs shadow-md">
                <Plus className="w-3 h-3 stroke-[2.5]" />
              </div>
            </div>
            <span className="text-[10px] font-sans text-zinc-400 truncate max-w-[76px]">
              Add Story
            </span>
          </div>

          {/* Stories List */}
          {stories.map((story, idx) => (
            <div
              key={story.id}
              onClick={() => {
                setActiveStoryIndex(idx);
                setProgress(0);
              }}
              className="flex flex-col items-center gap-1.5 shrink-0 cursor-pointer group/item"
            >
              <div className={`w-20 h-28 rounded-2xl overflow-hidden relative transition-all duration-300 group-hover/item:scale-[1.03] shadow-md ${
                story.isViewed 
                  ? 'border border-white/10 opacity-70' 
                  : 'border border-white/25 ring-1 ring-white/10'
              }`}>
                <img
                  src={story.mediaUrl || story.author.avatar}
                  alt={story.author.name}
                  className="w-full h-full object-cover filter contrast-[1.05]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/30" />
                <div className="absolute top-2 left-2">
                  <img
                    src={story.author.avatar}
                    alt={story.author.name}
                    className="w-6 h-6 rounded-full object-cover border border-white/60 shadow"
                  />
                </div>
              </div>
              <span className="text-[11px] font-sans text-zinc-300 font-medium truncate max-w-[76px]">
                {story.author.name.split(' ')[0]}
              </span>
            </div>
          ))}
        </div>

        {/* Right Scroll Button */}
        <button
          onClick={() => scrollStories('right')}
          className="hidden sm:flex absolute -right-3 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-[#181B22] shadow-xl border border-white/15 items-center justify-center text-zinc-400 hover:text-white transition-all opacity-0 group-hover:opacity-100 cursor-pointer"
          aria-label="Next Stories"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Story Fullscreen Monograph Modal */}
      {activeStory && (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
          <div className="relative w-full max-w-sm h-[85vh] max-h-[680px] bg-[#0B0B0D] rounded-[16px] overflow-hidden shadow-2xl flex flex-col border border-white/15">
            {/* Top Progress Bar */}
            <div className="absolute top-3 left-3 right-3 z-20 flex gap-1">
              {stories.map((s, idx) => (
                <div key={s.id} className="h-0.5 flex-1 bg-white/20 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-[#F4F1EC] transition-all"
                    style={{
                      width: idx < activeStoryIndex! ? '100%' : idx === activeStoryIndex ? `${progress}%` : '0%'
                    }}
                  />
                </div>
              ))}
            </div>

            {/* Header / Author */}
            <div className="absolute top-6 left-4 right-4 z-20 flex items-center justify-between text-white">
              <div className="flex items-center gap-2.5">
                <img
                  src={activeStory.author.avatar}
                  alt={activeStory.author.name}
                  className="w-8 h-8 rounded-full object-cover border border-white/40"
                />
                <div>
                  <div className="text-xs font-serif tracking-wide font-medium flex items-center gap-1.5 text-[#F4F1EC]">
                    <span>{activeStory.author.name}</span>
                  </div>
                  <span className="text-[9px] font-mono tracking-wider text-[#9B9894]">{activeStory.createdAt}</span>
                </div>
              </div>

              <button
                onClick={() => setActiveStoryIndex(null)}
                className="w-8 h-8 rounded-full bg-black/50 text-[#F4F1EC] hover:bg-black/80 flex items-center justify-center border border-white/20 cursor-pointer"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Story Media */}
            <div className="relative flex-1 bg-black flex items-center justify-center">
              <img
                src={activeStory.mediaUrl}
                alt="Story content"
                className="w-full h-full object-cover filter contrast-[1.05]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30" />
            </div>

            {/* Bottom Caption & Interactions */}
            <div className="absolute bottom-0 left-0 right-0 p-4 z-20 bg-gradient-to-t from-black via-black/70 to-transparent">
              {activeStory.caption && (
                <p className="text-xs text-[#F4F1EC] font-serif leading-relaxed mb-3">
                  "{activeStory.caption}"
                </p>
              )}
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Send a private reply..."
                  className="flex-1 bg-black/60 border border-white/20 rounded-[8px] px-3 py-2 text-xs text-[#F4F1EC] placeholder-[#9B9894] focus:outline-none focus:border-white/40 font-sans"
                />
                <button
                  onClick={() => setIsLiked(!isLiked)}
                  className={`p-2 rounded-[8px] border transition-colors cursor-pointer ${
                    isLiked
                      ? 'bg-rose-950/40 border-rose-500/50 text-rose-400'
                      : 'bg-black/60 border-white/20 text-[#9B9894] hover:text-[#F4F1EC]'
                  }`}
                  aria-label="Like story"
                >
                  <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
