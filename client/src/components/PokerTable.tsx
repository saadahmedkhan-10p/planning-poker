import React from 'react';
import { usePoker } from '../context/PokerContext';
import { VideoTile } from './VideoTile';
import { 
  Eye, 
  Clock, 
  RotateCcw, 
  Play, 
  Pause,
  Sparkles
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
    timerAction,
    localStream,
    remoteStreams,
    isCameraOn,
    toggleCamera,
    isMuted,
    toggleMute,
    hasMediaSupport
  } = usePoker();

  if (!room) return null;

  const estimators = room.participants.filter(p => p.role !== 'observer');
  const observers = room.participants.filter(p => p.role === 'observer');
  const connectedEstimators = estimators.filter(p => p.connected);
  const votedCount = connectedEstimators.filter(p => p.voted).length;
  const allVoted = connectedEstimators.length > 0 && votedCount === connectedEstimators.length;

  const consensusValue = room.consensusStats?.mode;

  return (
    <div className="w-full max-w-6xl mx-auto my-6 px-2 flex flex-col items-center">
      
      {/* IMMERSIVE DARK POKER STADIUM */}
      <div className="w-full rounded-[36px] sm:rounded-[56px] bg-gradient-to-br from-slate-900 via-[#0E1326] to-[#0B0E1A] border-4 border-slate-800/80 p-5 sm:p-10 shadow-2xl relative overflow-hidden transition-all">
        
        {/* Subtle Felt Surface Glow */}
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#7c3aed_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none" />
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none" />

        {/* Center Table Hub */}
        <div className="relative z-10 max-w-md mx-auto rounded-2xl glass border border-white/10 p-5 text-center shadow-xl mb-8">
          
          {/* Progress / Status Header */}
          <div className="flex items-center justify-between text-xs font-semibold mb-2">
            <span className="text-slate-400 uppercase tracking-wider font-heading flex items-center space-x-1.5">
              <span className={`w-2 h-2 rounded-full ${room.isRevealed ? 'bg-emerald-400' : 'bg-cyan-400 pulse-cyan'}`} />
              <span>{room.isRevealed ? 'Results Revealed' : 'Round Active'}</span>
            </span>
            <span className="text-violet-400 font-mono">
              {votedCount} / {connectedEstimators.length} Voted
            </span>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-2 rounded-full bg-white/5 overflow-hidden mb-4 border border-white/5">
            <div 
              className={`h-full transition-all duration-300 ${
                allVoted 
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-400 shadow-md shadow-emerald-500/50' 
                  : 'bg-gradient-to-r from-violet-600 to-indigo-500'
              }`}
              style={{ width: `${connectedEstimators.length ? (votedCount / connectedEstimators.length) * 100 : 0}%` }}
            />
          </div>

          {/* Center Action Controls */}
          <div className="flex items-center justify-center space-x-2">
            {!room.isRevealed ? (
              isFacilitator ? (
                <button
                  onClick={revealVotes}
                  disabled={votedCount === 0}
                  className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-lg cursor-pointer inline-flex items-center space-x-2 ${
                    allVoted
                      ? 'bg-emerald-600 hover:bg-emerald-500 text-white ring-4 ring-emerald-500/30 animate-pulse'
                      : votedCount > 0
                      ? 'bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white shadow-violet-600/30'
                      : 'bg-white/5 text-slate-500 cursor-not-allowed border border-white/5'
                  }`}
                >
                  <Eye className="w-4 h-4" />
                  <span>Reveal Cards {allVoted ? '(All Voted!)' : ''}</span>
                </button>
              ) : (
                <div className="text-xs text-slate-400 py-1 flex items-center justify-center space-x-2">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                  <span>Waiting for facilitator to reveal...</span>
                </div>
              )
            ) : (
              isFacilitator ? (
                <button
                  onClick={resetVotes}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-slate-800 hover:bg-slate-700 transition shadow-lg border border-white/10 cursor-pointer inline-flex items-center space-x-2"
                >
                  <RotateCcw className="w-4 h-4 text-violet-400" />
                  <span>Start New Round</span>
                </button>
              ) : (
                <div className="text-xs text-slate-400 py-1 flex items-center justify-center space-x-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Cards revealed! Facilitator will start next round.</span>
                </div>
              )
            )}
          </div>

          {/* Timer Section in Center Hub */}
          {room.settings.showTimer && (
            <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs">
              <div className="flex items-center space-x-1.5 font-mono font-bold text-slate-300">
                <Clock className={`w-3.5 h-3.5 ${room.timerActive ? 'text-amber-400 animate-pulse' : 'text-slate-500'}`} />
                <span className="text-white">
                  {Math.floor((room.timerSecondsRemaining || 0) / 60)}:
                  {String((room.timerSecondsRemaining || 0) % 60).padStart(2, '0')}
                </span>
              </div>

              {isFacilitator && (
                <div className="flex items-center space-x-1">
                  {room.timerActive ? (
                    <button
                      onClick={() => timerAction('pause')}
                      className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 cursor-pointer"
                      title="Pause Timer"
                    >
                      <Pause className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <button
                      onClick={() => timerAction('start')}
                      className="p-1 rounded-lg text-emerald-400 hover:bg-emerald-500/20 cursor-pointer"
                      title="Start Timer"
                    >
                      <Play className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <button
                    onClick={() => timerAction('reset', room.settings.timerDuration)}
                    className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 cursor-pointer"
                    title="Reset Timer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* PARTICIPANTS VIDEO TILES GRID */}
        <div className="relative z-10 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-5 justify-items-center">
          {estimators.map(p => {
            const isMe = currentUser?.id === p.id;
            const isUnanimousHighlight = room.isRevealed && p.vote && p.vote === consensusValue;
            const peerStream = isMe ? localStream : remoteStreams.get(p.id);

            return (
              <VideoTile
                key={p.id}
                participant={p}
                stream={peerStream}
                isLocal={isMe}
                isCameraOn={isMe ? isCameraOn : Boolean(peerStream)}
                onToggleCamera={toggleCamera}
                isMuted={isMuted}
                onToggleMute={toggleMute}
                hasMediaSupport={hasMediaSupport}
                isRevealed={room.isRevealed}
                highlightConsensus={Boolean(isUnanimousHighlight)}
                isSessionFacilitator={isFacilitator}
                onKick={() => kickParticipant(p.id)}
                onMakeObserver={() => updateRole(p.id, 'observer')}
              />
            );
          })}
        </div>

        {/* Observers Row if any */}
        {observers.length > 0 && (
          <div className="mt-8 pt-4 border-t border-white/10 flex items-center justify-center flex-wrap gap-2 text-xs text-slate-400">
            <span className="font-semibold inline-flex items-center mr-1 text-slate-300">
              <Eye className="w-3.5 h-3.5 mr-1 text-violet-400" />
              Spectators ({observers.length}):
            </span>
            {observers.map(obs => (
              <span 
                key={obs.id}
                className="px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-[11px] text-slate-300"
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
