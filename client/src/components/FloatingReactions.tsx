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
          // Calculate random starting X position based on timestamp and ID
          const seed = (rx.timestamp + idx * 79) % 80;
          const leftPercent = rx.x !== undefined ? rx.x : 10 + seed; // between 10% and 90%

          return (
            <div
              key={rx.id}
              className="absolute bottom-24 flex flex-col items-center reaction-float"
              style={{
                left: `${leftPercent}%`
              }}
            >
              <span className="text-4xl filter drop-shadow-xl select-none transform hover:scale-125 transition">
                {rx.emoji}
              </span>
              <span className="text-[10px] font-semibold bg-black/75 text-slate-200 px-2 py-0.5 rounded-full mt-1.5 border border-white/10 backdrop-blur-md select-none shadow-md">
                {rx.senderName}
              </span>
            </div>
          );
        })}
      </div>

      {/* Floating Reaction Dock (8 Emojis) */}
      <div className="fixed bottom-4 right-4 z-40 flex items-center space-x-1 p-1.5 rounded-2xl glass-card border border-white/10 shadow-2xl backdrop-blur-xl">
        {EMOJIS.map(emoji => (
          <button
            key={emoji}
            onClick={() => sendReaction(emoji)}
            className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-xl text-lg hover:scale-130 active:scale-95 hover:bg-white/10 transition-all duration-150 cursor-pointer select-none"
            title={`React with ${emoji}`}
          >
            {emoji}
          </button>
        ))}
      </div>
    </>
  );
};
