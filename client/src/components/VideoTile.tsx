import React, { useRef, useEffect } from 'react';
import type { Participant } from '../types/poker';
import { PlayingCard } from './PlayingCard';
import { Mic, MicOff, UserMinus, Eye } from 'lucide-react';

interface VideoTileProps {
  participant: Participant;
  stream?: MediaStream | null;
  isLocal?: boolean;
  isCameraOn?: boolean;
  onToggleCamera?: () => void;
  isMuted?: boolean;
  onToggleMute?: () => void;
  hasMediaSupport?: boolean;
  isRevealed?: boolean;
  highlightConsensus?: boolean;
  isSessionFacilitator?: boolean;
  onKick?: () => void;
  onMakeObserver?: () => void;
}

export const VideoTile: React.FC<VideoTileProps> = ({
  participant,
  stream,
  isLocal = false,
  isCameraOn = false,
  isMuted = false,
  onToggleMute,
  isRevealed = false,
  highlightConsensus = false,
  isSessionFacilitator = false,
  onKick,
  onMakeObserver
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  const hasVideoStream = Boolean(stream && stream.getVideoTracks().some(t => t.readyState === 'live' && t.enabled));
  const isHost = participant.role === 'facilitator';
  const isObserver = participant.role === 'observer';

  return (
    <div
      style={{
        background: '#161B22',
        border: '1px solid #30363D',
        borderRadius: '8px',
        padding: '12px 10px',
        width: '120px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '8px',
        position: 'relative'
      }}
      className="group select-none"
    >
      {/* Facilitator actions overlay on hover */}
      {isSessionFacilitator && !isLocal && (
        <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 z-20 bg-[#161B22] p-0.5 rounded border border-[#30363D]">
          {onMakeObserver && !isObserver && (
            <button
              onClick={onMakeObserver}
              className="p-0.5 text-[#8B949E] hover:text-[#E6EDF3] cursor-pointer"
              title="Change to Observer"
            >
              <Eye className="w-3 h-3" />
            </button>
          )}
          {onKick && (
            <button
              onClick={onKick}
              className="p-0.5 text-[#8B949E] hover:text-[#F85149] cursor-pointer"
              title="Remove from room"
            >
              <UserMinus className="w-3 h-3" />
            </button>
          )}
        </div>
      )}

      {/* Card slot above avatar */}
      {!isObserver && (
        <div className="h-[56px] flex items-center justify-center">
          {isRevealed ? (
            <PlayingCard
              value={participant.vote}
              isRevealed={true}
              size="sm"
              highlightConsensus={highlightConsensus}
            />
          ) : participant.voted ? (
            <PlayingCard
              isVoted={true}
              isRevealed={false}
              size="sm"
            />
          ) : (
            <div 
              style={{
                width: '40px',
                height: '56px',
                border: '1px dashed #30363D',
                borderRadius: '6px'
              }}
              className="flex items-center justify-center text-[11px] text-[#484F58]"
            >
              —
            </div>
          )}
        </div>
      )}

      {/* Avatar or Video container */}
      <div className="relative">
        {hasVideoStream ? (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted={isLocal}
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              objectFit: 'cover',
              background: '#0D1117',
              border: '1px solid #30363D'
            }}
          />
        ) : (
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              backgroundColor: participant.avatarColor,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '16px',
              fontWeight: 600,
              color: 'white'
            }}
          >
            {participant.name.charAt(0).toUpperCase() || 'U'}
          </div>
        )}

        {/* Live Video Indicator */}
        {hasVideoStream && (
          <span 
            style={{
              background: '#3FB950',
              border: '2px solid #161B22',
              borderRadius: '50%',
              position: 'absolute',
              bottom: '1px',
              right: '1px',
              width: '8px',
              height: '8px'
            }}
          />
        )}

        {/* Voted badge indicator (when round is active and user voted) */}
        {!isRevealed && !isObserver && participant.voted && !hasVideoStream && (
          <span 
            style={{
              background: '#3FB950',
              border: '2px solid #161B22',
              borderRadius: '50%',
              position: 'absolute',
              bottom: '1px',
              right: '1px',
              width: '8px',
              height: '8px'
            }}
            title="Voted"
          />
        )}
      </div>

      {/* Participant info */}
      <div className="w-full flex flex-col items-center text-center">
        <span 
          className="text-xs font-medium text-[#E6EDF3] truncate w-full"
          title={participant.name}
        >
          {participant.name}
        </span>
        <span className="text-[10px] text-[#8B949E] mt-0.5">
          {isLocal ? 'You' : isHost ? 'Host' : isObserver ? 'Observer' : !participant.connected ? 'Offline' : ''}
        </span>
      </div>

      {/* Local mic mute toggle if local cam active */}
      {isLocal && isCameraOn && onToggleMute && (
        <button
          onClick={onToggleMute}
          className="p-1 rounded text-[#8B949E] hover:text-[#E6EDF3] transition cursor-pointer"
          style={{ border: '1px solid #30363D', background: '#1C2128' }}
          title={isMuted ? 'Unmute' : 'Mute'}
        >
          {isMuted ? <MicOff className="w-3 h-3 text-[#F85149]" /> : <Mic className="w-3 h-3" />}
        </button>
      )}
    </div>
  );
};
