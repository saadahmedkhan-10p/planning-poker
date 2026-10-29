import React from 'react';
import { usePoker } from '../context/PokerContext';
import { Check, RotateCcw, ArrowRight } from 'lucide-react';

export const ConsensusResults: React.FC = () => {
  const { room, isFacilitator, setStoryPoints, resetVotes, activeDeck, setActiveStory } = usePoker();

  if (!room || !room.isRevealed || !room.consensusStats) return null;

  const stats = room.consensusStats;
  const currentIndex = room.stories.findIndex(s => s.id === room.activeStoryId);
  const nextStory = currentIndex >= 0 && currentIndex < room.stories.length - 1 ? room.stories[currentIndex + 1] : null;

  // Find nearest deck value to arithmetic average
  const findNearestDeckValue = (avg: number | null | undefined): string => {
    if (avg === null || avg === undefined) return '';
    const numericDeck = activeDeck
      .map(v => ({ raw: v, num: v === '½' ? 0.5 : parseFloat(v) }))
      .filter(item => !isNaN(item.num));

    if (numericDeck.length === 0) return '';
    let closest = numericDeck[0];
    let minDiff = Math.abs(avg - closest.num);

    for (const item of numericDeck) {
      const diff = Math.abs(avg - item.num);
      if (diff < minDiff) {
        minDiff = diff;
        closest = item;
      }
    }
    return closest.raw;
  };

  const nearestDeckVal = findNearestDeckValue(stats.average);

  const handleApplyPoints = (pts: string) => {
    if (!room.activeStoryId || !pts) return;
    setStoryPoints(room.activeStoryId, pts);
  };

  const handleAcceptAndNext = (pts: string) => {
    if (!room.activeStoryId || !pts) return;
    setStoryPoints(room.activeStoryId, pts);
    if (nextStory) {
      setActiveStory(nextStory.id);
    }
  };

  const isUnanimous = stats.agreementPercent === 100 && stats.totalVotes >= 2;
  const isHighAgreement = (stats.agreementPercent || 0) >= 75 && !isUnanimous;

  const statusColor = isUnanimous ? '#3FB950' : isHighAgreement ? '#D29922' : '#F85149';
  const statusLabel = isUnanimous ? 'Unanimous Agreement' : isHighAgreement ? 'Strong Agreement' : 'Split Votes';

  return (
    <div 
      className="w-full max-w-5xl mx-auto mb-4"
      style={{
        background: '#161B22',
        border: '1px solid #30363D',
        borderRadius: '8px',
        padding: '20px'
      }}
    >
      {/* Consensus Banner: Single horizontal bar */}
      <div 
        className="flex items-center justify-between pb-3 mb-4 border-b"
        style={{ borderColor: '#30363D' }}
      >
        <div className="flex items-center gap-2">
          <span 
            className="w-2.5 h-2.5 rounded-full inline-block"
            style={{ background: statusColor }}
          />
          <span className="font-semibold text-sm" style={{ color: statusColor }}>
            {statusLabel}
          </span>
          <span className="text-xs text-[#8B949E]">
            — Most favored: <strong className="text-[#E6EDF3]">{stats.mode || '—'} points</strong>
          </span>
        </div>

        <span className="text-xs font-mono font-medium text-[#8B949E]">
          {stats.agreementPercent}% agreement
        </span>
      </div>

      {/* 4-column Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
        <div 
          style={{
            background: '#1C2128',
            border: '1px solid #30363D',
            borderRadius: '6px',
            padding: '12px'
          }}
        >
          <div className="text-[11px] font-medium text-[#8B949E] uppercase tracking-wider">
            Average
          </div>
          <div className="text-[22px] font-semibold text-[#E6EDF3] mt-0.5">
            {stats.average !== null && stats.average !== undefined ? stats.average : '—'}
          </div>
          {nearestDeckVal && (
            <div className="text-[11px] text-[#8B949E] mt-0.5">
              Nearest: <span className="text-[#E6EDF3]">{nearestDeckVal}</span>
            </div>
          )}
        </div>

        <div 
          style={{
            background: '#1C2128',
            border: '1px solid #30363D',
            borderRadius: '6px',
            padding: '12px'
          }}
        >
          <div className="text-[11px] font-medium text-[#8B949E] uppercase tracking-wider">
            Median
          </div>
          <div className="text-[22px] font-semibold text-[#E6EDF3] mt-0.5">
            {stats.median || '—'}
          </div>
          <div className="text-[11px] text-[#8B949E] mt-0.5">
            Middle estimate
          </div>
        </div>

        <div 
          style={{
            background: '#1C2128',
            border: '1px solid #30363D',
            borderRadius: '6px',
            padding: '12px'
          }}
        >
          <div className="text-[11px] font-medium text-[#8B949E] uppercase tracking-wider">
            Mode
          </div>
          <div className="text-[22px] font-semibold text-[#E6EDF3] mt-0.5">
            {stats.mode || '—'}
          </div>
          <div className="text-[11px] text-[#8B949E] mt-0.5">
            Popular vote
          </div>
        </div>

        <div 
          style={{
            background: '#1C2128',
            border: '1px solid #30363D',
            borderRadius: '6px',
            padding: '12px'
          }}
        >
          <div className="text-[11px] font-medium text-[#8B949E] uppercase tracking-wider">
            Votes Cast
          </div>
          <div className="text-[22px] font-semibold text-[#E6EDF3] mt-0.5">
            {stats.totalVotes}
          </div>
          <div className="text-[11px] text-[#8B949E] mt-0.5">
            Estimators
          </div>
        </div>
      </div>

      {/* Simple Vote Distribution */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <span className="text-xs text-[#8B949E] mr-1">Distribution:</span>
        {Object.entries(stats.voteDistribution).map(([val, count]) => (
          <span 
            key={val}
            className="text-xs px-2.5 py-1 rounded text-[#E6EDF3]"
            style={{
              background: '#1C2128',
              border: val === stats.mode ? '1px solid #7C3AED' : '1px solid #30363D'
            }}
          >
            <strong className="font-semibold">{val}</strong>: {count} {count === 1 ? 'vote' : 'votes'}
          </span>
        ))}
      </div>

      {/* Action Buttons Row */}
      {isFacilitator && (
        <div 
          className="flex items-center justify-end gap-2 pt-3 border-t"
          style={{ borderColor: '#30363D' }}
        >
          {stats.mode && nextStory && (
            <button
              onClick={() => handleAcceptAndNext(stats.mode!)}
              className="text-xs font-medium text-white transition cursor-pointer flex items-center gap-1.5"
              style={{
                background: '#7C3AED',
                borderRadius: '6px',
                padding: '6px 14px',
                border: 'none'
              }}
              onMouseEnter={e => (e.currentTarget.style.background = '#6D28D9')}
              onMouseLeave={e => (e.currentTarget.style.background = '#7C3AED')}
            >
              <Check className="w-3.5 h-3.5" />
              <span>Accept {stats.mode} & Next</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}

          {stats.mode && !nextStory && (
            <button
              onClick={() => handleApplyPoints(stats.mode!)}
              className="text-xs font-medium text-white transition cursor-pointer flex items-center gap-1.5"
              style={{
                background: '#7C3AED',
                borderRadius: '6px',
                padding: '6px 14px',
                border: 'none'
              }}
              onMouseEnter={e => (e.currentTarget.style.background = '#6D28D9')}
              onMouseLeave={e => (e.currentTarget.style.background = '#7C3AED')}
            >
              <Check className="w-3.5 h-3.5" />
              <span>Accept {stats.mode} Pts</span>
            </button>
          )}

          <button
            onClick={resetVotes}
            className="text-xs font-medium text-[#E6EDF3] transition cursor-pointer flex items-center gap-1.5"
            style={{
              background: '#1C2128',
              border: '1px solid #30363D',
              borderRadius: '6px',
              padding: '6px 14px'
            }}
            onMouseEnter={e => (e.currentTarget.style.background = '#30363D')}
            onMouseLeave={e => (e.currentTarget.style.background = '#1C2128')}
          >
            <RotateCcw className="w-3.5 h-3.5 text-[#8B949E]" />
            <span>Revote</span>
          </button>

          {nextStory && (
            <button
              onClick={() => setActiveStory(nextStory.id)}
              className="text-xs text-[#8B949E] hover:text-[#E6EDF3] hover:underline cursor-pointer bg-transparent border-none px-2"
            >
              Skip to Next
            </button>
          )}
        </div>
      )}
    </div>
  );
};
