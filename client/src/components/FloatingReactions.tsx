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

      {/* Clean Reaction Dock */}
      <div 
        className="fixed bottom-4 right-4 z-40"
        style={{
          background: '#1C2128',
          border: '1px solid #30363D',
          borderRadius: '8px',
          padding: '4px 6px',
          display: 'flex',
          gap: '4px'
        }}
      >
        {EMOJIS.map(emoji => (
          <button
            key={emoji}
            onClick={() => sendReaction(emoji)}
            className="flex items-center justify-center transition cursor-pointer select-none"
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '4px',
              border: 'none',
              background: 'transparent',
              fontSize: '18px'
            }}
            onMouseEnter={e => (e.currentTarget.style.background = '#30363D')}
            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
            title={`React ${emoji}`}
          >
            {emoji}
          </button>
        ))}
      </div>
    </>
  );
};
