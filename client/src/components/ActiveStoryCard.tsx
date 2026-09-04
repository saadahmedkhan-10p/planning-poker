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
  Layers
} from 'lucide-react';

interface ActiveStoryCardProps {
  onOpenStoryDrawer: () => void;
}

export const ActiveStoryCard: React.FC<ActiveStoryCardProps> = ({ onOpenStoryDrawer }) => {
  const { room, isFacilitator, resetVotes, setActiveStory } = usePoker();

  if (!room) return null;

  const activeStory = room.stories.find(s => s.id === room.activeStoryId);
  const currentIndex = room.stories.findIndex(s => s.id === room.activeStoryId);
  const totalStories = room.stories.length;
  const nextStory = currentIndex >= 0 && currentIndex < totalStories - 1 ? room.stories[currentIndex + 1] : null;
  const prevStory = currentIndex > 0 ? room.stories[currentIndex - 1] : null;

  if (!activeStory) {
    return (
      <div className="w-full max-w-4xl mx-auto p-4 rounded-2xl bg-white dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-800 text-center flex items-center justify-between shadow-sm">
        <div className="flex items-center space-x-3 text-slate-500 dark:text-slate-400 text-sm">
          <Bookmark className="w-4 h-4 text-indigo-500" />
          <span>No story actively selected for pointing.</span>
        </div>
        <button
          onClick={onOpenStoryDrawer}
          className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 transition cursor-pointer"
        >
          Select from Backlog
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 soft-shadow-card p-4 sm:p-5 transition-all">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
        {/* Story details */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 mb-1.5 flex-wrap gap-y-1">
            <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-md text-[11px] font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700 dark:bg-indigo-950/80 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-800/60">
              <Bookmark className="w-3 h-3 mr-1" />
              Active Story
            </span>

            {/* Story position indicator */}
            {totalStories > 0 && currentIndex >= 0 && (
              <span className="text-[11px] font-mono font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200/60 dark:border-slate-700/60">
                Story {currentIndex + 1} of {totalStories}
              </span>
            )}

            {activeStory.points && (
              <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60">
                <CheckCircle2 className="w-3 h-3 mr-1" />
                {activeStory.points} {activeStory.points === '1' ? 'Point' : 'Points'}
              </span>
            )}
          </div>

          <h2 className="font-heading font-bold text-lg sm:text-xl text-slate-900 dark:text-white leading-snug">
            {activeStory.title}
          </h2>

          {activeStory.description && (
            <p className="mt-1.5 text-xs sm:text-sm text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
              {activeStory.description}
            </p>
          )}

          {activeStory.url && (
            <a
              href={activeStory.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-1 mt-2 text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
            >
              <span>View in Jira / Issue Tracker</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>

        {/* Story navigation controls */}
        <div className="flex items-center space-x-2 shrink-0 self-end sm:self-center flex-wrap gap-y-2">
          {/* Revote button */}
          {room.isRevealed && isFacilitator && (
            <button
              onClick={resetVotes}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition cursor-pointer"
              title="Revote this story"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
              <span>Revote</span>
            </button>
          )}

          {/* Prev Story */}
          {prevStory && isFacilitator && (
            <button
              onClick={() => setActiveStory(prevStory.id)}
              className="inline-flex items-center space-x-1 px-2.5 py-1.5 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition cursor-pointer"
              title={`Go to previous: ${prevStory.title}`}
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Prev</span>
            </button>
          )}

          {/* Next Story (Prominent button) */}
          {nextStory && isFacilitator && (
            <button
              onClick={() => setActiveStory(nextStory.id)}
              className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm shadow-indigo-500/20 transition cursor-pointer"
              title={`Next story: ${nextStory.title}`}
            >
              <span>Next Story</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Backlog Drawer Button */}
          <button
            onClick={onOpenStoryDrawer}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 hover:bg-slate-200/80 dark:bg-slate-800 dark:hover:bg-slate-700/80 border border-slate-200 dark:border-slate-700 transition cursor-pointer"
            title="Open backlog list"
          >
            <Layers className="w-3.5 h-3.5 text-slate-500" />
            <span>Backlog</span>
            <ChevronRight className="w-3 h-3 text-slate-400" />
          </button>
        </div>
      </div>
    </div>
  );
};
