import React from 'react';
import { usePoker } from '../context/PokerContext';
import { 
  Bookmark, 
  ExternalLink, 
  ChevronRight, 
  ChevronLeft, 
  CheckCircle2, 
  RotateCcw, 
  ArrowRight,
  Layers,
  DownloadCloud
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
      <div className="w-full max-w-4xl mx-auto p-4 rounded-2xl glass-card border border-dashed border-white/10 text-center flex flex-col sm:flex-row items-center justify-between gap-3 shadow-lg">
        <div className="flex items-center space-x-3 text-slate-400 text-sm">
          <Bookmark className="w-4 h-4 text-violet-400" />
          <span>No story actively selected for pointing.</span>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={onOpenImportModal}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold text-white bg-violet-600/30 hover:bg-violet-600/50 border border-violet-500/40 transition cursor-pointer flex items-center space-x-1.5"
          >
            <DownloadCloud className="w-3.5 h-3.5 text-violet-300" />
            <span>Fetch from ADO / Jira</span>
          </button>
          <button
            onClick={onOpenStoryDrawer}
            className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-slate-200 bg-white/10 hover:bg-white/20 border border-white/10 transition cursor-pointer"
          >
            Select from Backlog
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto rounded-2xl glass-card border border-white/10 p-4 sm:p-5 transition-all text-slate-100 shadow-xl">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
        {/* Story details */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 mb-2 flex-wrap gap-y-1">
            <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-md text-[11px] font-bold uppercase tracking-wider bg-violet-600/30 text-violet-300 border border-violet-500/30">
              <Bookmark className="w-3 h-3 mr-1" />
              Active Story
            </span>

            {/* Story position indicator */}
            {totalStories > 0 && currentIndex >= 0 && (
              <span className="text-[11px] font-mono font-medium text-slate-400 bg-white/5 px-2 py-0.5 rounded-md border border-white/10">
                Story {currentIndex + 1} of {totalStories}
              </span>
            )}

            {activeStory.points && (
              <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                <CheckCircle2 className="w-3 h-3 mr-1 text-emerald-400" />
                {activeStory.points} {activeStory.points === '1' ? 'Point' : 'Points'}
              </span>
            )}
          </div>

          <h2 className="font-heading font-bold text-lg sm:text-xl text-white leading-snug">
            {activeStory.title}
          </h2>

          {activeStory.description && (
            <p className="mt-1.5 text-xs sm:text-sm text-slate-400 line-clamp-2 leading-relaxed">
              {activeStory.description}
            </p>
          )}

          {activeStory.url && (
            <a
              href={activeStory.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-1 mt-2 text-xs text-cyan-400 hover:text-cyan-300 transition font-medium"
            >
              <span>View in Work Item Tracker</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>

        {/* Story controls */}
        <div className="flex items-center space-x-2 shrink-0 self-end sm:self-center flex-wrap gap-y-2">
          {/* Quick Import Button */}
          <button
            onClick={onOpenImportModal}
            className="inline-flex items-center space-x-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold text-violet-300 bg-violet-600/20 hover:bg-violet-600/30 border border-violet-500/30 transition cursor-pointer"
            title="Import Story from URL"
          >
            <DownloadCloud className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Import</span>
          </button>

          {/* Revote button */}
          {room.isRevealed && isFacilitator && (
            <button
              onClick={resetVotes}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-slate-300 bg-white/10 hover:bg-white/20 border border-white/10 transition cursor-pointer"
              title="Revote this story"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
              <span>Revote</span>
            </button>
          )}

          {/* Prev Story */}
          {prevStory && isFacilitator && (
            <button
              onClick={() => setActiveStory(prevStory.id)}
              className="inline-flex items-center space-x-1 px-2.5 py-1.5 rounded-xl text-xs font-medium text-slate-300 bg-white/10 hover:bg-white/20 border border-white/10 transition cursor-pointer"
              title={`Go to previous: ${prevStory.title}`}
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Prev</span>
            </button>
          )}

          {/* Next Story */}
          {nextStory && isFacilitator && (
            <button
              onClick={() => setActiveStory(nextStory.id)}
              className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold text-white bg-violet-600 hover:bg-violet-500 shadow-md shadow-violet-600/30 transition cursor-pointer"
              title={`Next story: ${nextStory.title}`}
            >
              <span>Next</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Backlog Drawer Button */}
          <button
            onClick={onOpenStoryDrawer}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-300 bg-white/5 hover:bg-white/10 border border-white/10 transition cursor-pointer"
            title="Open backlog list"
          >
            <Layers className="w-3.5 h-3.5 text-slate-400" />
            <span>Backlog</span>
            <ChevronRight className="w-3 h-3 text-slate-400" />
          </button>
        </div>
      </div>
    </div>
  );
};
