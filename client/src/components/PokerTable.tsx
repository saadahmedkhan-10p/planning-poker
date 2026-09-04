import React from 'react';
import { usePoker } from '../context/PokerContext';
import { PlayingCard } from './PlayingCard';
import { 
  Eye, 
  Crown, 
  Clock, 
  RotateCcw, 
  UserMinus, 
  Play, 
  Pause
} from 'lucide-react';

export const PokerTable: React.FC = () => {
  const { 
    room, 
    currentUser, 
    isFacilitator, 
    revealVotes, 
    resetVotes, 
    kickParticipant,
    updateRole,
    timerAction
  } = usePoker();

  if (!room) return null;

  const estimators = room.participants.filter(p => p.role !== 'observer');
  const observers = room.participants.filter(p => p.role === 'observer');
  const connectedEstimators = estimators.filter(p => p.connected);
  const votedCount = connectedEstimators.filter(p => p.voted).length;
  const allVoted = connectedEstimators.length > 0 && votedCount === connectedEstimators.length;

  const consensusValue = room.consensusStats?.mode;

  return (
    <div className="w-full max-w-5xl mx-auto my-6 px-2 flex flex-col items-center">
      
      {/* POKER TABLE STADIUM */}
      <div className="w-full rounded-3xl bg-gradient-to-b from-slate-100/90 to-slate-200/90 dark:from-slate-900/90 dark:to-slate-950/90 border-4 border-slate-200 dark:border-slate-800/80 p-6 sm:p-10 shadow-2xl relative overflow-hidden transition-all">
        
        {/* Subtle felt surface texture */}
        <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#4f46e5_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

        {/* Center Table Hub */}
        <div className="relative z-10 max-w-md mx-auto rounded-2xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border border-slate-200 dark:border-slate-800 p-5 text-center shadow-lg mb-8">
          
          {/* Progress / Status */}
          <div className="flex items-center justify-between text-xs font-semibold mb-2">
            <span className="text-slate-500 dark:text-slate-400 uppercase tracking-wider font-heading">
              {room.isRevealed ? 'Results Revealed' : 'Round In Progress'}
            </span>
            <span className="text-indigo-600 dark:text-indigo-400">
              {votedCount} of {connectedEstimators.length} Voted
            </span>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden mb-4">
            <div 
              className={`h-full transition-all duration-300 ${
                allVoted ? 'bg-emerald-500' : 'bg-indigo-500'
              }`}
              style={{ width: `${connectedEstimators.length ? (votedCount / connectedEstimators.length) * 100 : 0}%` }}
            />
          </div>

          {/* Center Action Buttons */}
          <div className="flex items-center justify-center space-x-2">
            {!room.isRevealed ? (
              isFacilitator ? (
                <button
                  onClick={revealVotes}
                  disabled={votedCount === 0}
                  className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer inline-flex items-center space-x-2 ${
                    allVoted
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white ring-4 ring-emerald-500/20 animate-pulse'
                      : votedCount > 0
                      ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
                      : 'bg-slate-300 dark:bg-slate-800 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  <Eye className="w-4 h-4" />
                  <span>Reveal Cards {allVoted ? '(All Voted!)' : ''}</span>
                </button>
              ) : (
                <div className="text-xs text-slate-500 dark:text-slate-400 py-1 flex items-center justify-center space-x-1.5">
                  <span className="w-2 h-2 rounded-full bg-indigo-500 animate-ping" />
                  <span>Waiting for facilitator to reveal...</span>
                </div>
              )
            ) : (
              isFacilitator ? (
                <button
                  onClick={resetVotes}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-slate-800 hover:bg-slate-900 dark:bg-slate-700 dark:hover:bg-slate-600 transition shadow-md cursor-pointer inline-flex items-center space-x-2"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Start New Round</span>
                </button>
              ) : (
                <div className="text-xs text-slate-500 dark:text-slate-400 py-1">
                  Cards are revealed! Facilitator will start next round.
                </div>
              )
            )}
          </div>

          {/* Timer Section in Center Hub */}
          {room.settings.showTimer && (
            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
              <div className="flex items-center space-x-1.5 font-mono font-bold text-slate-700 dark:text-slate-300">
                <Clock className={`w-3.5 h-3.5 ${room.timerActive ? 'text-amber-500 animate-pulse' : 'text-slate-400'}`} />
                <span>
                  {Math.floor((room.timerSecondsRemaining || 0) / 60)}:
                  {String((room.timerSecondsRemaining || 0) % 60).padStart(2, '0')}
                </span>
              </div>

              {isFacilitator && (
                <div className="flex items-center space-x-1">
                  {room.timerActive ? (
                    <button
                      onClick={() => timerAction('pause')}
                      className="p-1 rounded text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                      title="Pause Timer"
                    >
                      <Pause className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <button
                      onClick={() => timerAction('start')}
                      className="p-1 rounded text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 cursor-pointer"
                      title="Start Timer"
                    >
                      <Play className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <button
                    onClick={() => timerAction('reset', room.settings.timerDuration)}
                    className="p-1 rounded text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                    title="Reset Timer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* PARTICIPANTS PODS GRID */}
        <div className="relative z-10 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6 justify-items-center">
          {estimators.map(p => {
            const isMe = currentUser?.id === p.id;
            const isFac = room.facilitatorId === p.id;
            const isUnanimousHighlight = room.isRevealed && p.vote && p.vote === consensusValue;

            return (
              <div
                key={p.id}
                className={`flex flex-col items-center p-3 rounded-2xl transition-all duration-200 w-32 sm:w-36 ${
                  isMe
                    ? 'bg-indigo-50/70 dark:bg-indigo-950/40 ring-2 ring-indigo-500/40'
                    : 'bg-white/70 dark:bg-slate-900/60 backdrop-blur-sm border border-slate-200/50 dark:border-slate-800/60'
                }`}
              >
                {/* Playing Card Slot */}
                <div className="mb-3">
                  {p.voted ? (
                    <PlayingCard
                      value={p.vote}
                      size="sm"
                      isRevealed={room.isRevealed}
                      isVoted={true}
                      highlightConsensus={Boolean(isUnanimousHighlight)}
                    />
                  ) : (
                    <div className="w-12 h-16 sm:w-14 sm:h-20 rounded-lg border-2 border-dashed border-slate-300 dark:border-slate-700 flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 text-[10px] font-medium">
                      <span className="w-2 h-2 rounded-full bg-slate-400/80 animate-ping mb-1" />
                      <span>Thinking</span>
                    </div>
                  )}
                </div>

                {/* Participant Details */}
                <div className="flex items-center space-x-1.5 w-full justify-center">
                  <div
                    className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0 shadow-sm"
                    style={{ backgroundColor: p.avatarColor }}
                  >
                    {p.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[75px]">
                    {p.name} {isMe ? '(You)' : ''}
                  </span>
                </div>

                {/* Role / Status Badge */}
                <div className="flex items-center space-x-1 mt-1">
                  {isFac && (
                    <span className="inline-flex items-center text-[9px] font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50 px-1.5 py-0.2 rounded">
                      <Crown className="w-2.5 h-2.5 mr-0.5" />
                      Host
                    </span>
                  )}
                  {!p.connected && (
                    <span className="text-[9px] text-rose-500 font-medium">
                      Offline
                    </span>
                  )}
                </div>

                {/* Facilitator Context Actions (Kick / Reassign) */}
                {isFacilitator && !isMe && (
                  <div className="mt-2 pt-1 border-t border-slate-200/40 dark:border-slate-800/40 flex items-center space-x-2">
                    <button
                      onClick={() => updateRole(p.id, 'observer')}
                      className="text-[10px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 cursor-pointer"
                      title="Move to Spectator"
                    >
                      <Eye className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => kickParticipant(p.id)}
                      className="text-[10px] text-slate-400 hover:text-rose-500 cursor-pointer"
                      title="Remove from room"
                    >
                      <UserMinus className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Observers Row if any */}
        {observers.length > 0 && (
          <div className="mt-8 pt-4 border-t border-slate-200/60 dark:border-slate-800/60 flex items-center justify-center flex-wrap gap-2 text-xs text-slate-500 dark:text-slate-400">
            <span className="font-semibold inline-flex items-center mr-1">
              <Eye className="w-3.5 h-3.5 mr-1" />
              Spectators ({observers.length}):
            </span>
            {observers.map(obs => (
              <span 
                key={obs.id}
                className="px-2 py-0.5 rounded-full bg-white/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 text-[11px]"
              >
                {obs.name} {currentUser?.id === obs.id ? '(You)' : ''}
              </span>
            ))}
          </div>
        )}

      </div>
    </div>
  );
};
