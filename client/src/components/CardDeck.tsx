import React, { useEffect } from 'react';
import { usePoker } from '../context/PokerContext';
import { PlayingCard } from './PlayingCard';
import { Eye } from 'lucide-react';

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
  const isRevealed = Boolean(room.isRevealed);

  // Keyboard shortcut support (1-9 for deck values, c/esc to clear)
  useEffect(() => {
    if (isObserver || isRevealed) return;

    const handleKeyDown = (e: KeyboardEvent) => {
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
  }, [isObserver, isRevealed, activeDeck, currentVote, castVote]);

  if (isObserver) {
    return (
      <div 
        className="w-full max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs"
        style={{
          background: '#1C2128',
          border: '1px solid #30363D',
          borderRadius: '8px',
          padding: '12px 16px'
        }}
      >
        <div className="flex items-center gap-2.5 text-[#8B949E]">
          <Eye className="w-4 h-4 text-[#8B949E]" />
          <span>You are viewing as an <strong>Observer</strong>. Join as estimator to vote on points.</span>
        </div>
        <button
          onClick={() => updateRole(currentUser.id, 'estimator')}
          className="text-white text-xs font-medium transition cursor-pointer"
          style={{
            background: '#7C3AED',
            border: 'none',
            borderRadius: '6px',
            padding: '6px 12px'
          }}
          onMouseEnter={e => (e.currentTarget.style.background = '#6D28D9')}
          onMouseLeave={e => (e.currentTarget.style.background = '#7C3AED')}
        >
          Join as Estimator
        </button>
      </div>
    );
  }

  return (
    <div 
      className="w-full max-w-4xl mx-auto"
      style={{
        background: '#161B22',
        border: '1px solid #30363D',
        borderRadius: '8px',
        padding: '16px 20px'
      }}
    >
      {/* Hand Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-[#8B949E]">
            {isRevealed
              ? `Voting locked (cards revealed) • Final vote: ${currentVote || 'None'}`
              : `Your vote ${currentVote ? `: ${currentVote}` : ''}`}
          </span>
          {!isRevealed && currentVote && (
            <button
              onClick={() => castVote(null)}
              className="text-xs text-[#8B949E] hover:underline cursor-pointer bg-transparent border-none p-0 ml-2"
            >
              Clear
            </button>
          )}
        </div>

        <span className="text-xs text-[#484F58]">
          {isRevealed ? 'Revealed' : 'Press 1-9 to pick • Esc to clear'}
        </span>
      </div>

      {/* Cards Row */}
      <div className={`w-full overflow-x-auto flex items-center justify-start sm:justify-center gap-2 pb-1 pt-1 ${isRevealed ? 'opacity-50 pointer-events-none' : ''}`}>
        {activeDeck.map((val, idx) => {
          const isSelected = currentVote === val;
          const shortcut = idx < 9 && !isRevealed ? idx + 1 : undefined;

          return (
            <PlayingCard
              key={val}
              value={val}
              size="md"
              isSelected={isSelected}
              disabled={isRevealed}
              shortcutKey={shortcut}
              onClick={() => !isRevealed && castVote(isSelected ? null : val)}
            />
          );
        })}
      </div>
    </div>
  );
};
