import React from 'react';
import { usePoker } from '../context/PokerContext';
import { VideoTile } from './VideoTile';
import { 
  Eye, 
  RotateCcw, 
  Play, 
  Pause,
  Clock
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
    <div className="w-full max-w-5xl mx-auto my-6 flex flex-col items-center">
      {/* Action / Control Bar */}
      <div 
        className="w-full flex flex-col sm:flex-row items-center justify-between gap-3 mb-6 px-4 py-2.5 rounded-lg"
        style={{
          background: '#161B22',
          border: '1px solid #30363D'
        }}
      >
        {/* Status & Progress */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span 
              className="w-2 h-2 rounded-full inline-block"
              style={{ background: room.isRevealed ? '#3FB950' : '#7C3AED' }}
            />
            <span className="text-xs font-medium text-[#E6EDF3]">
              {room.isRevealed ? 'Votes Revealed' : 'Estimating'}
            </span>
          </div>

          <span className="text-xs text-[#8B949E]">
            {votedCount} of {connectedEstimators.length} voted
          </span>

          {/* Simple progress bar */}
          <div 
            className="w-20 h-1.5 rounded-full overflow-hidden"
            style={{ background: '#30363D' }}
          >
            <div 
              className="h-full transition-all duration-300"
              style={{
                width: `${connectedEstimators.length ? (votedCount / connectedEstimators.length) * 100 : 0}%`,
                background: allVoted ? '#3FB950' : '#7C3AED'
              }}
            />
          </div>
        </div>

        {/* Action Buttons & Timer */}
        <div className="flex items-center gap-2">
          {/* Timer Display */}
          {room.settings.showTimer && (
            <div 
              className="flex items-center gap-2 px-2.5 py-1 text-xs font-mono text-[#E6EDF3]"
              style={{
                background: '#1C2128',
                border: '1px solid #30363D',
                borderRadius: '6px'
              }}
            >
              <Clock className="w-3.5 h-3.5 text-[#8B949E]" />
              <span>
                {Math.floor((room.timerSecondsRemaining || 0) / 60)}:
                {String((room.timerSecondsRemaining || 0) % 60).padStart(2, '0')}
              </span>

              {isFacilitator && (
                <div className="flex items-center gap-1 ml-1">
                  {room.timerActive ? (
                    <button
                      onClick={() => timerAction('pause')}
                      className="text-[#8B949E] hover:text-[#E6EDF3] cursor-pointer"
                      title="Pause Timer"
                    >
                      <Pause className="w-3 h-3" />
                    </button>
                  ) : (
                    <button
                      onClick={() => timerAction('start')}
                      className="text-[#3FB950] hover:text-white cursor-pointer"
                      title="Start Timer"
                    >
                      <Play className="w-3 h-3" />
                    </button>
                  )}
                  <button
                    onClick={() => timerAction('reset', room.settings.timerDuration)}
                    className="text-[#8B949E] hover:text-[#E6EDF3] cursor-pointer"
                    title="Reset Timer"
                  >
                    <RotateCcw className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Reveal or Reset Button */}
          {!room.isRevealed ? (
            isFacilitator ? (
              <button
                onClick={revealVotes}
                disabled={votedCount === 0}
                className="text-xs font-medium text-white transition cursor-pointer flex items-center gap-1.5"
                style={{
                  background: votedCount === 0 ? '#30363D' : '#7C3AED',
                  cursor: votedCount === 0 ? 'not-allowed' : 'pointer',
                  borderRadius: '6px',
                  padding: '6px 14px',
                  border: 'none',
                  opacity: votedCount === 0 ? 0.6 : 1
                }}
                onMouseEnter={e => {
                  if (votedCount > 0) e.currentTarget.style.background = '#6D28D9';
                }}
                onMouseLeave={e => {
                  if (votedCount > 0) e.currentTarget.style.background = '#7C3AED';
                }}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Reveal Cards</span>
              </button>
            ) : (
              <span className="text-xs text-[#8B949E]">
                Waiting for facilitator to reveal...
              </span>
            )
          ) : (
            isFacilitator ? (
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
                <span>New Round</span>
              </button>
            ) : (
              <span className="text-xs text-[#8B949E]">
                Cards revealed
              </span>
            )
          )}
        </div>
      </div>

      {/* Participant Pods Grid */}
      <div className="w-full flex flex-wrap items-stretch justify-center gap-3">
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

      {/* Observers row if any */}
      {observers.length > 0 && (
        <div 
          className="w-full max-w-2xl mt-6 px-4 py-2.5 rounded-lg flex items-center justify-center flex-wrap gap-2 text-xs"
          style={{
            background: '#161B22',
            border: '1px solid #30363D'
          }}
        >
          <span className="text-[#8B949E] font-medium mr-1 flex items-center gap-1">
            <Eye className="w-3.5 h-3.5" />
            Observers ({observers.length}):
          </span>
          {observers.map(obs => (
            <span 
              key={obs.id}
              className="px-2 py-0.5 rounded text-[#E6EDF3] font-mono text-[11px]"
              style={{
                background: '#1C2128',
                border: '1px solid #30363D'
              }}
            >
              {obs.name} {currentUser?.id === obs.id ? '(You)' : ''}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};
