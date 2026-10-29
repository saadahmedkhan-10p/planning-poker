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
  const dimensions = {
    sm: { width: '40px', height: '56px', fontSize: '13px', radius: '6px' },
    md: { width: '52px', height: '72px', fontSize: '18px', radius: '8px' },
    lg: { width: '80px', height: '108px', fontSize: '28px', radius: '8px' }
  }[size];

  const cornerSize = {
    sm: 'text-[8px] top-0.5 left-1',
    md: 'text-[9px] top-1 left-1.5',
    lg: 'text-[11px] top-1.5 left-2'
  }[size];

  const cornerSizeBottom = {
    sm: 'text-[8px] bottom-0.5 right-1',
    md: 'text-[9px] bottom-1 right-1.5',
    lg: 'text-[11px] bottom-1.5 right-2'
  }[size];

  const isFaceDown = isVoted && !isRevealed;

  return (
    <div
      onClick={!disabled && onClick ? onClick : undefined}
      style={{
        width: dimensions.width,
        height: dimensions.height,
        cursor: !disabled && onClick ? 'pointer' : 'default',
        transform: isSelected ? 'translateY(-4px)' : 'none',
        transition: 'transform 150ms ease'
      }}
      className="relative select-none perspective-1000 group shrink-0"
    >
      <div
        className={`w-full h-full transition-transform duration-300 preserve-3d relative ${
          isRevealed || isSelected || !isFaceDown ? '' : 'rotate-y-180'
        }`}
      >
        {/* FRONT OF CARD */}
        <div
          className="absolute inset-0 backface-hidden flex flex-col items-center justify-center font-semibold transition-colors"
          style={{
            background: highlightConsensus
              ? 'rgba(63, 185, 80, 0.08)'
              : isSelected
              ? 'rgba(124, 58, 237, 0.12)'
              : '#1C2128',
            border: highlightConsensus
              ? '1px solid #3FB950'
              : isSelected
              ? '1px solid #7C3AED'
              : '1px solid #30363D',
            boxShadow: isSelected ? '0 0 0 1px #7C3AED' : 'none',
            borderRadius: dimensions.radius,
            color: highlightConsensus ? '#3FB950' : isSelected ? '#E6EDF3' : '#E6EDF3'
          }}
        >
          {/* Top-Left Corner Pip */}
          {value && value !== 'HIDDEN' && (
            <span className={`absolute font-mono text-[#8B949E] ${cornerSize}`}>
              {value}
            </span>
          )}

          {/* Center Value */}
          <span 
            className="leading-none font-semibold"
            style={{ fontSize: dimensions.fontSize }}
          >
            {value === 'HIDDEN' ? '?' : value || '—'}
          </span>

          {/* Bottom-Right Corner Pip */}
          {value && value !== 'HIDDEN' && (
            <span className={`absolute font-mono text-[#8B949E] rotate-180 ${cornerSizeBottom}`}>
              {value}
            </span>
          )}

          {/* Keyboard shortcut hint */}
          {shortcutKey !== undefined && (
            <div 
              className="absolute -bottom-2 text-[9px] font-mono px-1 py-0.2 rounded border"
              style={{
                background: '#0D1117',
                borderColor: '#30363D',
                color: '#8B949E'
              }}
            >
              {shortcutKey}
            </div>
          )}
        </div>

        {/* BACK OF CARD (Face Down) */}
        <div
          className="absolute inset-0 backface-hidden rotate-y-180 flex items-center justify-center"
          style={{
            background: '#1C2128',
            backgroundImage: `repeating-linear-gradient(45deg, #1C2128, #1C2128 4px, #22272E 4px, #22272E 8px)`,
            border: '1px solid #30363D',
            borderRadius: dimensions.radius
          }}
        >
          <div 
            className="w-4 h-4 rounded-full flex items-center justify-center text-[10px] text-[#8B949E]"
            style={{ border: '1px solid #30363D', background: '#161B22' }}
          >
            ♠
          </div>
        </div>
      </div>
    </div>
  );
};
