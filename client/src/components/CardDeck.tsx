import React, { useEffect } from 'react';
import { usePoker } from '../context/PokerContext';
import { PlayingCard } from './PlayingCard';
import { Eye, X } from 'lucide-react';

export const CardDeck: React.FC = () => {
  const { 
    room, 
    currentUser, 
    activeDeck, 
    castVote,
    updateRole 
  } = usePoker();

  if (!room || !currentUser) return null;

  const myParticipant = room.participants.find(p => p.id === currentUser.id);
  const isObserver = myParticipant?.role === 'observer';
  const currentVote = myParticipant?.vote;

  // Keyboard shortcut support (1-9 for deck values)
  useEffect(() => {
    if (isObserver) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if typing in an input or textarea
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) return;

      const num = parseInt(e.key, 10);
      if (!isNaN(num) && num >= 1 && num <= activeDeck.length && num <= 9) {
        e.preventDefault();
        const cardValue = activeDeck[num - 1];
        castVote(cardValue === currentVote ? null : cardValue);
      } else if (e.key.toLowerCase() === 'c' || e.key === 'Escape') {
        castVote(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isObserver, activeDeck, currentVote, castVote]);

  if (isObserver) {
    return (
      <div className="w-full max-w-4xl mx-auto p-4 rounded-2xl bg-white/60 dark:bg-slate-900/60 backdrop-blur-md border border-slate-200 dark:border-slate-800 text-center flex flex-col sm:flex-row items-center justify-between gap-3 shadow-sm">
        <div className="flex items-center space-x-3 text-slate-600 dark:text-slate-300 text-sm">
          <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500">
            <Eye className="w-4 h-4" />
          </div>
          <span>You are viewing as an <strong>Observer / Spectator</strong>. You are not casting story points.</span>
        </div>
        <button
          onClick={() => updateRole(currentUser.id, 'estimator')}
          className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition shadow-sm cursor-pointer whitespace-nowrap"
        >
          Join as Estimator
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col items-center">
      {/* Hand Header */}
      <div className="flex items-center justify-between w-full px-2 mb-2">
        <div className="flex items-center space-x-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 font-heading">
            Your Estimation Hand
          </span>
          <span className="hidden sm:inline text-[11px] text-slate-400 dark:text-slate-500">
            (Keys 1-9 to vote quickly)
          </span>
        </div>

        {currentVote && (
          <button
            onClick={() => castVote(null)}
            className="inline-flex items-center space-x-1 text-xs text-rose-500 hover:text-rose-600 dark:hover:text-rose-400 transition cursor-pointer font-medium"
          >
            <X className="w-3.5 h-3.5" />
            <span>Clear vote ({currentVote})</span>
          </button>
        )}
      </div>

      {/* Hand Cards */}
      <div className="w-full overflow-x-auto pb-4 pt-2 px-2 flex items-center justify-start md:justify-center gap-2 sm:gap-3 scrollbar-none">
        {activeDeck.map((val, idx) => {
          const isSelected = currentVote === val;
          const shortcut = idx < 9 ? idx + 1 : undefined;

          return (
            <PlayingCard
              key={val}
              value={val}
              size="md"
              isSelected={isSelected}
              shortcutKey={shortcut}
              onClick={() => castVote(isSelected ? null : val)}
            />
          );
        })}
      </div>
    </div>
  );
};
