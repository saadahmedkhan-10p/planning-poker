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
    sm: 'w-12 h-16 sm:w-14 sm:h-20 text-sm sm:text-base rounded-xl',
    md: 'w-16 h-24 sm:w-20 sm:h-28 text-lg sm:text-2xl rounded-2xl',
    lg: 'w-20 h-28 sm:w-24 sm:h-36 text-2xl sm:text-3xl rounded-2xl'
  };

  const cornerSize = {
    sm: 'text-[9px] top-1 left-1.5',
    md: 'text-[11px] top-1.5 left-2',
    lg: 'text-xs top-2 left-2.5'
  };

  // Interactive states for selectable cards (deck hand)
  const interactiveClasses = onClick && !disabled
    ? 'cursor-pointer hover:-translate-y-2 hover:shadow-xl hover:border-violet-500/50 transition-all duration-200'
    : '';

  const selectedClasses = isSelected
    ? 'ring-2 ring-violet-500 border-violet-500 -translate-y-3 shadow-xl shadow-violet-500/30'
    : 'border-white/10';

  // If this card is an unrevealed opponent card
  const isFaceDown = isVoted && !isRevealed;

  return (
    <div
      onClick={!disabled && onClick ? onClick : undefined}
      className={`relative select-none perspective-1000 ${sizeClasses[size]} ${interactiveClasses} ${selectedClasses} group`}
    >
      <div
        className={`w-full h-full transition-transform duration-500 preserve-3d relative ${
          isRevealed || isSelected || !isFaceDown ? '' : 'rotate-y-180'
        }`}
      >
        {/* FRONT OF CARD (Value Visible) */}
        <div
          className={`absolute inset-0 backface-hidden rounded-inherit border flex flex-col items-center justify-center font-heading font-extrabold transition-all ${
            highlightConsensus
              ? 'bg-gradient-to-br from-emerald-950/80 to-emerald-900/60 border-emerald-500 text-emerald-300 shadow-lg shadow-emerald-500/30 ring-2 ring-emerald-500/50'
              : isSelected
              ? 'bg-gradient-to-br from-violet-950/90 to-slate-900 border-violet-500 text-violet-300 shadow-lg shadow-violet-500/20'
              : 'bg-gradient-to-br from-slate-800/90 to-slate-900/95 border-white/10 text-slate-100 hover:border-white/20'
          }`}
        >
          {/* Top-Left Corner Pip */}
          {value && value !== 'HIDDEN' && (
            <span className={`absolute font-mono font-bold text-slate-400 ${cornerSize[size]}`}>
              {value}
            </span>
          )}

          {/* Center Value */}
          <span className={`leading-none ${isSelected ? 'text-violet-300' : highlightConsensus ? 'text-emerald-300' : 'text-white'}`}>
            {value === 'HIDDEN' ? '?' : value || '—'}
          </span>

          {/* Bottom-Right Pip (inverted) */}
          {value && value !== 'HIDDEN' && (
            <span className={`absolute font-mono font-bold text-slate-400 rotate-180 ${
              size === 'sm' ? 'text-[9px] bottom-1 right-1.5' : size === 'md' ? 'text-[11px] bottom-1.5 right-2' : 'text-xs bottom-2 right-2.5'
            }`}>
              {value}
            </span>
          )}

          {/* Keyboard shortcut hint if provided */}
          {shortcutKey !== undefined && (
            <div className="absolute -bottom-2 bg-slate-900 text-slate-400 text-[10px] font-mono px-1.5 py-0.5 rounded-md border border-white/10 opacity-70 group-hover:opacity-100 transition shadow">
              {shortcutKey}
            </div>
          )}
        </div>

        {/* BACK OF CARD (Face Down Pattern) */}
        <div
          className="absolute inset-0 backface-hidden rotate-y-180 rounded-inherit border border-violet-500/40 bg-gradient-to-tr from-violet-950 to-slate-950 p-1 flex items-center justify-center overflow-hidden shadow-inner"
        >
          {/* Intricate Geometric Playing Card Pattern */}
          <div className="w-full h-full rounded-xl border border-violet-400/20 flex items-center justify-center relative overflow-hidden bg-violet-900/10">
            <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#a78bfa_1px,transparent_1px)] [background-size:8px_8px]" />
            <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full border border-violet-400/40 flex items-center justify-center text-violet-300/80 font-bold text-xs shadow-inner">
              ✦
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
