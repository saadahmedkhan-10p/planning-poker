import React from 'react';
import { usePoker } from '../context/PokerContext';

const EMOJIS = ['👏', '☕', '🤔', '🚀', '💡', '❤️', '💯'];

export const FloatingReactions: React.FC = () => {
  const { reactions, sendReaction } = usePoker();

  return (
    <>
      {/* Floating Animated Emojis */}
      <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
        {reactions.map((rx, idx) => {
          // Calculate random starting X position based on timestamp and ID
          const seed = (rx.timestamp + idx * 79) % 80;
          const leftPercent = 10 + seed; // between 10% and 90%

          return (
            <div
              key={rx.id}
              className="absolute bottom-20 flex flex-col items-center animate-float-reaction"
              style={{
                left: `${leftPercent}%`,
                animation: 'floatUpAndFade 2.5s ease-out forwards'
              }}
            >
              <span className="text-3xl filter drop-shadow-md select-none">
                {rx.emoji}
              </span>
              <span className="text-[10px] font-semibold bg-black/60 text-white px-1.5 py-0.5 rounded-full mt-1 backdrop-blur-xs select-none">
                {rx.senderName}
              </span>
            </div>
          );
        })}
      </div>

      {/* Floating Reaction Dock (Bottom-Right or Bottom-Center) */}
      <div className="fixed bottom-4 right-4 z-40 flex items-center space-x-1 p-1.5 rounded-2xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border border-slate-200 dark:border-slate-800 soft-shadow">
        {EMOJIS.map(emoji => (
          <button
            key={emoji}
            onClick={() => sendReaction(emoji)}
            className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-xl text-base sm:text-lg hover:scale-125 active:scale-95 hover:bg-slate-100 dark:hover:bg-slate-800 transition transform duration-150 cursor-pointer"
            title={`React with ${emoji}`}
          >
            {emoji}
          </button>
        ))}
      </div>

      <style>{`
        @keyframes floatUpAndFade {
          0% {
            transform: translateY(0) scale(0.6);
            opacity: 0;
          }
          15% {
            transform: translateY(-20px) scale(1.1);
            opacity: 1;
          }
          80% {
            transform: translateY(-160px) scale(1);
            opacity: 0.9;
          }
          100% {
            transform: translateY(-220px) scale(0.9);
            opacity: 0;
          }
        }
      `}</style>
    </>
  );
};
