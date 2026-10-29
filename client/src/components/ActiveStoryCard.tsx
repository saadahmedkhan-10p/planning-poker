import React from 'react';
import { usePoker } from '../context/PokerContext';
import { 
  ExternalLink, 
  ChevronRight, 
  ChevronLeft, 
  CheckCircle2, 
  RotateCcw, 
  Layers,
  Link as LinkIcon
} from 'lucide-react';

interface ActiveStoryCardProps {
  onOpenStoryDrawer: () => void;
  onOpenImportModal: () => void;
}

export const ActiveStoryCard: React.FC<ActiveStoryCardProps> = ({ 
  onOpenStoryDrawer, 
  onOpenImportModal 
}) => {
  const { room, isFacilitator, resetVotes, setActiveStory } = usePoker();

  if (!room) return null;

  const activeStory = room.stories.find(s => s.id === room.activeStoryId);
  const currentIndex = room.stories.findIndex(s => s.id === room.activeStoryId);
  const totalStories = room.stories.length;
  const nextStory = currentIndex >= 0 && currentIndex < totalStories - 1 ? room.stories[currentIndex + 1] : null;
  const prevStory = currentIndex > 0 ? room.stories[currentIndex - 1] : null;

  if (!activeStory) {
    return (
      <div 
        className="w-full max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs mb-4"
        style={{
          background: '#161B22',
          border: '1px solid #30363D',
          borderRadius: '8px',
          padding: '16px 20px'
        }}
      >
        <span className="text-[#8B949E]">
          No story actively selected for pointing.
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenImportModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs text-[#E6EDF3] transition cursor-pointer"
            style={{
              background: '#1C2128',
              border: '1px solid #30363D',
              borderRadius: '6px'
            }}
            title="Import from URL"
          >
            <LinkIcon className="w-3.5 h-3.5 text-[#8B949E]" />
            <span>Import URL</span>
          </button>
          <button
            onClick={onOpenStoryDrawer}
            className="px-3 py-1.5 rounded text-xs text-[#E6EDF3] transition cursor-pointer"
            style={{
              background: '#1C2128',
              border: '1px solid #30363D',
              borderRadius: '6px'
            }}
          >
            Open Backlog
          </button>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="w-full max-w-5xl mx-auto mb-4"
      style={{
        background: '#161B22',
        border: '1px solid #30363D',
        borderRadius: '8px',
        padding: '16px 20px'
      }}
    >
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
        {/* Story details */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span 
              className="font-medium text-[11px]"
              style={{
                background: 'rgba(124, 58, 237, 0.12)',
                border: '1px solid rgba(124, 58, 237, 0.3)',
                color: '#A78BFA',
                borderRadius: '4px',
                padding: '2px 7px'
              }}
            >
              Active Story
            </span>

            {/* Position indicator */}
            {totalStories > 0 && currentIndex >= 0 && (
              <span className="text-[11px] font-mono text-[#8B949E]">
                Story {currentIndex + 1} of {totalStories}
              </span>
            )}

            {/* Estimated points badge if estimated */}
            {activeStory.points && (
              <span 
                className="inline-flex items-center text-[11px] font-medium"
                style={{
                  background: 'rgba(63, 185, 80, 0.1)',
                  border: '1px solid rgba(63, 185, 80, 0.3)',
                  color: '#3FB950',
                  borderRadius: '4px',
                  padding: '2px 7px'
                }}
              >
                <CheckCircle2 className="w-3 h-3 mr-1" />
                {activeStory.points} {activeStory.points === '1' ? 'pt' : 'pts'}
              </span>
            )}
          </div>

          <h2 className="font-semibold text-base text-[#E6EDF3] leading-snug">
            {activeStory.title}
          </h2>

          {activeStory.description && (
            <p className="mt-1 text-xs text-[#8B949E] line-clamp-2 leading-relaxed">
              {activeStory.description}
            </p>
          )}

          {activeStory.url && (
            <a
              href={activeStory.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 mt-2 text-xs text-[#8B949E] hover:text-[#E6EDF3] transition"
            >
              <span>View in tracker</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>

        {/* Story controls & navigation */}
        <div className="flex items-center gap-1.5 shrink-0 self-start sm:self-center">
          {/* Import link button */}
          <button
            onClick={onOpenImportModal}
            className="w-8 h-8 rounded flex items-center justify-center text-[#8B949E] hover:text-[#E6EDF3] transition cursor-pointer"
            style={{
              background: '#1C2128',
              border: '1px solid #30363D',
              borderRadius: '6px'
            }}
            title="Import story from URL"
          >
            <LinkIcon className="w-3.5 h-3.5" />
          </button>

          {/* Revote button */}
          {room.isRevealed && isFacilitator && (
            <button
              onClick={resetVotes}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded text-xs text-[#8B949E] hover:text-[#E6EDF3] transition cursor-pointer"
              style={{
                background: '#1C2128',
                border: '1px solid #30363D',
                borderRadius: '6px'
              }}
              title="Revote this story"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Revote</span>
            </button>
          )}

          {/* Navigation Prev/Next */}
          {prevStory && isFacilitator && (
            <button
              onClick={() => setActiveStory(prevStory.id)}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded text-xs text-[#8B949E] hover:text-[#E6EDF3] transition cursor-pointer"
              style={{
                background: '#1C2128',
                border: '1px solid #30363D',
                borderRadius: '6px'
              }}
              title="Previous story"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Prev</span>
            </button>
          )}

          {nextStory && isFacilitator && (
            <button
              onClick={() => setActiveStory(nextStory.id)}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded text-xs text-[#E6EDF3] transition cursor-pointer"
              style={{
                background: '#1C2128',
                border: '1px solid #30363D',
                borderRadius: '6px'
              }}
              title="Next story"
            >
              <span>Next</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Open Backlog */}
          <button
            onClick={onOpenStoryDrawer}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded text-xs text-[#8B949E] hover:text-[#E6EDF3] transition cursor-pointer"
            style={{
              background: '#1C2128',
              border: '1px solid #30363D',
              borderRadius: '6px'
            }}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Backlog</span>
          </button>
        </div>
      </div>
    </div>
  );
};
