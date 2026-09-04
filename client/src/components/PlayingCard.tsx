import React from 'react';

interface PlayingCardProps {
  value?: string | null;
  isRevealed?: boolean;
  isSelected?: boolean;
  isVoted?: boolean;
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
  disabled?: boolean;
  shortcutKey?: string | number;
  highlightConsensus?: boolean;
}

export const PlayingCard: React.FC<PlayingCardProps> = ({
  value,
  isRevealed = false,
  isSelected = false,
  isVoted = false,
  size = 'md',
  onClick,
  disabled = false,
  shortcutKey,
  highlightConsensus = false
}) => {
  // Dimensions
  const sizeClasses = {
    sm: 'w-12 h-16 sm:w-14 sm:h-20 text-sm sm:text-base rounded-lg',
    md: 'w-16 h-24 sm:w-20 sm:h-28 text-lg sm:text-2xl rounded-xl',
    lg: 'w-20 h-28 sm:w-24 sm:h-36 text-2xl sm:text-3xl rounded-2xl'
  };

  const cornerSize = {
    sm: 'text-[9px] top-1 left-1.5',
    md: 'text-[11px] top-1.5 left-2',
    lg: 'text-xs top-2 left-2.5'
  };

  // Interactive states for selectable cards (deck hand)
  const interactiveClasses = onClick && !disabled
    ? 'cursor-pointer hover:-translate-y-2 hover:shadow-xl transition-all duration-200'
    : '';

  const selectedClasses = isSelected
    ? 'ring-4 ring-indigo-500 -translate-y-3 shadow-2xl shadow-indigo-500/30'
    : 'soft-shadow-card';

  // If this card is an unrevealed opponent card
  const isFaceDown = isVoted && !isRevealed;

  return (
    <div
      onClick={!disabled && onClick ? onClick : undefined}
      className={`relative select-none perspective-1000 ${sizeClasses[size]} ${interactiveClasses} ${selectedClasses} group`}
    >
      <div
        className={`w-full h-full transition-transform duration-500 transform-style-3d relative ${
          isRevealed || isSelected || !isFaceDown ? '' : 'rotate-y-180'
        }`}
      >
        {/* FRONT OF CARD (Value Visible) */}
        <div
          className={`absolute inset-0 backface-hidden rounded-inherit border flex flex-col items-center justify-center font-heading font-extrabold transition-colors ${
            highlightConsensus
              ? 'bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-950/80 dark:to-emerald-900/60 border-emerald-500 text-emerald-700 dark:text-emerald-300 ring-2 ring-emerald-500/50'
              : isSelected
              ? 'bg-gradient-to-br from-indigo-50 to-white dark:from-indigo-950 dark:to-slate-900 border-indigo-500 text-indigo-600 dark:text-indigo-400'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100'
          }`}
        >
          {/* Top-Left Corner Pip */}
          {value && value !== 'HIDDEN' && (
            <span className={`absolute font-mono font-bold text-slate-400 dark:text-slate-500 ${cornerSize[size]}`}>
              {value}
            </span>
          )}

          {/* Center Value */}
          <span className="leading-none">
            {value === 'HIDDEN' ? '?' : value || '—'}
          </span>

          {/* Bottom-Right Pip (inverted) */}
          {value && value !== 'HIDDEN' && (
            <span className={`absolute font-mono font-bold text-slate-400 dark:text-slate-500 rotate-180 ${
              size === 'sm' ? 'text-[9px] bottom-1 right-1.5' : size === 'md' ? 'text-[11px] bottom-1.5 right-2' : 'text-xs bottom-2 right-2.5'
            }`}>
              {value}
            </span>
          )}

          {/* Keyboard shortcut hint if provided */}
          {shortcutKey !== undefined && (
            <div className="absolute -bottom-2 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-[10px] font-mono px-1.5 py-0.5 rounded border border-slate-300 dark:border-slate-700 opacity-75 group-hover:opacity-100 transition">
              {shortcutKey}
            </div>
          )}
        </div>

        {/* BACK OF CARD (Face Down Pattern) */}
        <div
          className="absolute inset-0 backface-hidden rotate-y-180 rounded-inherit border-2 border-indigo-400 dark:border-indigo-600 bg-gradient-to-tr from-indigo-600 to-indigo-700 dark:from-indigo-800 dark:to-indigo-900 p-1 flex items-center justify-center overflow-hidden shadow-inner"
        >
          {/* Intricate Geometric Playing Card Pattern */}
          <div className="w-full h-full rounded border border-white/20 flex items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:8px_8px]" />
            <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full border-2 border-white/40 flex items-center justify-center text-white/70 font-bold text-xs">
              ✦
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
