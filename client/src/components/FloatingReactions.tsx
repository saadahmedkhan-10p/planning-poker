import React from 'react';
import { usePoker } from '../context/PokerContext';

const EMOJIS = ['👍', '❤️', '🔥', '🚀', '🎉', '🤔', '☕', '👏'];

export const FloatingReactions: React.FC = () => {
  const { reactions, sendReaction } = usePoker();

  return (
    <>
      {/* Floating Animated Emojis */}
      <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
        {reactions.map((rx, idx) => {
          const seed = (rx.timestamp + idx * 79) % 80;
          const leftPercent = rx.x !== undefined ? rx.x : 10 + seed;

          return (
            <div
              key={rx.id}
              className="absolute bottom-20 flex flex-col items-center reaction-float"
              style={{
                left: `${leftPercent}%`
              }}
            >
              <span className="text-3xl select-none">
                {rx.emoji}
              </span>
              <span 
                className="text-[10px] font-medium text-[#E6EDF3] px-1.5 py-0.2 rounded mt-1 select-none"
                style={{
                  background: '#161B22',
                  border: '1px solid #30363D'
                }}
              >
                {rx.senderName}
              </span>
            </div>
          );
        })}
      </div>

      {/* Clean Reaction Dock — sits above the sticky CardDeck bar */}
      <div 
        className="fixed bottom-28 right-3 z-40 flex flex-col gap-1"
        style={{
          background: '#1C2128',
          border: '1px solid #30363D',
          borderRadius: '8px',
          padding: '6px 4px',
        }}
      >
        {EMOJIS.map(emoji => (
          <button
            key={emoji}
            onClick={() => sendReaction(emoji)}
            className="flex items-center justify-center transition cursor-pointer select-none"
            style={{
              width: '34px',
              height: '34px',
              borderRadius: '6px',
              border: 'none',
              background: 'transparent',
              fontSize: '20px',
              lineHeight: 1
            }}
            onMouseEnter={e => (e.currentTarget.style.background = '#30363D')}
            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
            title={emoji}
          >
            {emoji}
          </button>
        ))}
      </div>
    </>
  );
};
