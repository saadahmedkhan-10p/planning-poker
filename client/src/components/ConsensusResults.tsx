import React from 'react';
import { usePoker } from '../context/PokerContext';
import { Check, Flame, MessageSquare, RotateCcw, Award, ArrowRight } from 'lucide-react';

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

  return (
    <div className="w-full max-w-4xl mx-auto my-4 rounded-3xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200 dark:border-slate-800 soft-shadow p-5 sm:p-6 transition-all">
      {/* Top Banner: Consensus Status */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pb-5 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center space-x-3 text-center sm:text-left">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
            isUnanimous 
              ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30 ring-4 ring-emerald-100 dark:ring-emerald-950/60' 
              : isHighAgreement
              ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/30'
              : 'bg-amber-500 text-white shadow-lg shadow-amber-500/30'
          }`}>
            {isUnanimous ? <Award className="w-6 h-6" /> : isHighAgreement ? <Check className="w-6 h-6" /> : <Flame className="w-6 h-6" />}
          </div>

          <div>
            <div className="flex items-center space-x-2">
              <span className={`text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                isUnanimous 
                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' 
                  : isHighAgreement
                  ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300'
                  : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
              }`}>
                {isUnanimous ? '🎉 Unanimous Agreement' : isHighAgreement ? 'Strong Alignment' : 'Split Votes — Discussion Needed'}
              </span>
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                {stats.agreementPercent}% agreement
              </span>
            </div>
            <h3 className="font-heading font-bold text-xl text-slate-900 dark:text-white mt-1">
              {isUnanimous
                ? `The team unanimously voted ${stats.mode} points!`
                : isHighAgreement
                ? `Most of the team favors ${stats.mode} points.`
                : 'Different perspectives detected. Discuss assumptions before deciding.'}
            </h3>
          </div>
        </div>

        {/* Facilitator Actions */}
        {isFacilitator && (
          <div className="flex items-center space-x-2 flex-wrap gap-y-2 justify-center sm:justify-end">
            {stats.mode && nextStory && (
              <button
                onClick={() => handleAcceptAndNext(stats.mode!)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition shadow-md shadow-emerald-600/20 cursor-pointer inline-flex items-center space-x-1.5"
                title={`Save ${stats.mode} pts and advance to: ${nextStory.title}`}
              >
                <Check className="w-3.5 h-3.5" />
                <span>Accept {stats.mode} & Next Story</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}

            {stats.mode && !nextStory && (
              <button
                onClick={() => handleApplyPoints(stats.mode!)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition shadow-sm cursor-pointer inline-flex items-center space-x-1.5"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Accept {stats.mode} Pts</span>
              </button>
            )}

            {nextStory && (
              <button
                onClick={() => setActiveStory(nextStory.id)}
                className="px-3.5 py-2 rounded-xl text-xs font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950 dark:hover:bg-indigo-900 transition border border-indigo-200 dark:border-indigo-800 cursor-pointer inline-flex items-center space-x-1.5"
                title={`Skip to next: ${nextStory.title}`}
              >
                <span>Next Story</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}

            {nearestDeckVal && nearestDeckVal !== stats.mode && (
              <button
                onClick={() => handleApplyPoints(nearestDeckVal)}
                className="px-3.5 py-2 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 transition border border-slate-200 dark:border-slate-700 cursor-pointer"
                title={`Accept nearest deck value to average (${stats.average})`}
              >
                Nearest ({nearestDeckVal})
              </button>
            )}

            <button
              onClick={resetVotes}
              className="px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 transition border border-slate-200 dark:border-slate-700 cursor-pointer inline-flex items-center space-x-1"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
              <span>Revote</span>
            </button>
          </div>
        )}
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-5">
        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800 text-center">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Average (Mean)
          </span>
          <div className="font-heading font-extrabold text-2xl text-slate-800 dark:text-slate-100 mt-0.5">
            {stats.average !== null && stats.average !== undefined ? stats.average : '—'}
          </div>
          {nearestDeckVal && (
            <span className="text-[10px] text-slate-500 dark:text-slate-400">
              Nearest: <strong className="text-indigo-600 dark:text-indigo-400">{nearestDeckVal}</strong>
            </span>
          )}
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800 text-center">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Median
          </span>
          <div className="font-heading font-extrabold text-2xl text-slate-800 dark:text-slate-100 mt-0.5">
            {stats.median || '—'}
          </div>
          <span className="text-[10px] text-slate-500 dark:text-slate-400">Middle estimate</span>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800 text-center">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Mode (Popular)
          </span>
          <div className="font-heading font-extrabold text-2xl text-slate-800 dark:text-slate-100 mt-0.5">
            {stats.mode || '—'}
          </div>
          <span className="text-[10px] text-slate-500 dark:text-slate-400">Most common vote</span>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800 text-center">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Total Votes
          </span>
          <div className="font-heading font-extrabold text-2xl text-slate-800 dark:text-slate-100 mt-0.5">
            {stats.totalVotes}
          </div>
          <span className="text-[10px] text-slate-500 dark:text-slate-400">Estimators participated</span>
        </div>
      </div>

      {/* Vote Distribution Visualizer */}
      <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Vote Breakdown
          </span>
        </div>

        <div className="flex flex-wrap gap-2">
          {Object.entries(stats.voteDistribution).map(([val, count]) => {
            const pct = Math.round((count / stats.totalVotes) * 100);
            const isHighest = val === stats.mode;

            return (
              <div
                key={val}
                className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl border transition-all ${
                  isHighest
                    ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-300 dark:border-indigo-700 text-indigo-900 dark:text-indigo-200 shadow-sm'
                    : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                <span className="font-heading font-extrabold text-base">{val}</span>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  {count} {count === 1 ? 'vote' : 'votes'} ({pct}%)
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Outlier Alignment Prompt */}
      {stats.outliers && (
        <div className="mt-4 p-3.5 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/40 text-amber-900 dark:text-amber-200 text-xs flex items-start space-x-3">
          <MessageSquare className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <strong className="font-semibold text-amber-800 dark:text-amber-300">
              Agile Dialogue Suggestion:
            </strong>{' '}
            {stats.outliers.lowestVoters && stats.outliers.lowestVoters.length > 0 && (
              <span>
                Lowest vote ({stats.outliers.lowestVoters.join(', ')}) vs{' '}
              </span>
            )}
            {stats.outliers.highestVoters && stats.outliers.highestVoters.length > 0 && (
              <span>
                highest vote ({stats.outliers.highestVoters.join(', ')}).
              </span>
            )}{' '}
            Inviting the lowest and highest estimators to share assumptions helps uncover hidden risks or simpler paths!
          </div>
        </div>
      )}
    </div>
  );
};
