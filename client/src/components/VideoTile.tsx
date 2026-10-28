import React, { useRef, useEffect } from 'react';
import type { Participant } from '../types/poker';
import { 
  Camera, 
  CameraOff, 
  Mic, 
  MicOff, 
  Crown, 
  Check, 
  Clock, 
  Eye, 
  UserMinus 
} from 'lucide-react';

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
  onToggleCamera,
  isMuted = false,
  onToggleMute,
  hasMediaSupport = true,
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
      className={`relative w-36 sm:w-44 h-48 sm:h-52 rounded-2xl glass-card overflow-hidden flex flex-col justify-between p-2.5 transition-all duration-300 border ${
        isLocal 
          ? 'border-violet-500/50 shadow-lg shadow-violet-500/10' 
          : 'border-white/10 hover:border-violet-500/30'
      } group`}
    >
      {/* VIDEO FEED BACKGROUND */}
      {hasVideoStream ? (
        <>
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted={isLocal}
            className="absolute inset-0 w-full h-full object-cover"
          />
          {/* Subtle gradient overlays for text readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-black/60 pointer-events-none" />
        </>
      ) : (
        /* FALLBACK AVATAR DISPLAY */
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-b from-white/[0.04] to-white/[0.01]">
          <div
            className="w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center text-white font-extrabold text-xl sm:text-2xl shadow-xl transition-transform group-hover:scale-105"
            style={{
              backgroundColor: participant.avatarColor,
              boxShadow: `0 0 25px ${participant.avatarColor}40`
            }}
          >
            {participant.name.charAt(0).toUpperCase() || 'U'}
          </div>
        </div>
      )}

      {/* TOP HEADER ROW: Indicators & Badges */}
      <div className="relative z-10 flex items-center justify-between w-full">
        {/* Left: Role Pill or Live Camera Beacon */}
        <div className="flex items-center space-x-1.5">
          {hasVideoStream ? (
            <span className="flex items-center space-x-1 px-1.5 py-0.5 rounded-full bg-cyan-500/20 border border-cyan-400/40 text-[10px] font-semibold text-cyan-300">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 pulse-cyan" />
              <span>LIVE</span>
            </span>
          ) : isHost ? (
            <span className="inline-flex items-center space-x-0.5 px-1.5 py-0.5 rounded-full bg-violet-500/20 border border-violet-500/40 text-[10px] font-semibold text-violet-300">
              <Crown className="w-2.5 h-2.5" />
              <span>Host</span>
            </span>
          ) : isObserver ? (
            <span className="inline-flex items-center space-x-0.5 px-1.5 py-0.5 rounded-full bg-slate-700/50 border border-slate-600/40 text-[10px] font-medium text-slate-300">
              <Eye className="w-2.5 h-2.5" />
              <span>Observer</span>
            </span>
          ) : (
            <span className="text-[10px] font-mono text-slate-400 px-1.5 py-0.5 rounded bg-black/40 backdrop-blur-xs">
              Estimator
            </span>
          )}
        </div>

        {/* Right: Audio Indicator or Facilitator Quick Actions */}
        <div className="flex items-center space-x-1">
          {isLocal && isMuted && (
            <span className="p-1 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30" title="Muted">
              <MicOff className="w-3 h-3" />
            </span>
          )}

          {/* Facilitator kick/role button for remote participants */}
          {isSessionFacilitator && !isLocal && (
            <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center space-x-1 bg-black/60 backdrop-blur-xs rounded-lg p-0.5">
              {onMakeObserver && !isObserver && (
                <button
                  onClick={onMakeObserver}
                  className="p-1 rounded text-slate-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
                  title="Change to Observer"
                >
                  <Eye className="w-3 h-3" />
                </button>
              )}
              {onKick && (
                <button
                  onClick={onKick}
                  className="p-1 rounded text-slate-400 hover:text-rose-400 hover:bg-rose-500/20 transition cursor-pointer"
                  title="Remove from room"
                >
                  <UserMinus className="w-3 h-3" />
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* CENTER STATUS: Reveal Card or Voting Status */}
      <div className="relative z-10 flex flex-col items-center justify-center my-auto">
        {!isObserver && (
          <div>
            {isRevealed ? (
              /* REVEALED VOTE BADGE */
              <div
                className={`card-reveal px-3.5 py-1.5 rounded-xl font-heading font-black text-xl sm:text-2xl shadow-xl transition-all ${
                  highlightConsensus
                    ? 'bg-emerald-500 text-white shadow-emerald-500/50 ring-2 ring-emerald-300'
                    : 'bg-white/15 backdrop-blur-md text-white border border-white/20'
                }`}
              >
                {participant.vote || '—'}
              </div>
            ) : participant.voted ? (
              /* VOTED & WAITING BADGE */
              <div className="flex items-center space-x-1 px-2.5 py-1 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold backdrop-blur-md shadow-lg">
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>Ready</span>
              </div>
            ) : (
              /* THINKING STATE */
              <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-xl bg-black/40 border border-white/10 text-slate-400 text-[11px] font-medium backdrop-blur-xs">
                <Clock className="w-3 h-3 text-slate-500 animate-spin" />
                <span>Thinking</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* BOTTOM FOOTER: Participant Name & Local Media Controls */}
      <div className="relative z-10 w-full pt-1.5 border-t border-white/10 flex flex-col space-y-1">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-100 truncate max-w-[95px] sm:max-w-[110px]" title={participant.name}>
            {participant.name} {isLocal ? '(You)' : ''}
          </span>

          {!participant.connected && (
            <span className="text-[10px] font-medium text-rose-400">Offline</span>
          )}
        </div>

        {/* LOCAL CONTROLS: Camera / Mic Buttons */}
        {isLocal && hasMediaSupport && (
          <div className="flex items-center justify-center space-x-2 pt-1">
            <button
              onClick={onToggleCamera}
              className={`p-1.5 rounded-lg text-xs font-medium transition cursor-pointer flex items-center space-x-1 ${
                isCameraOn 
                  ? 'bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-400/40' 
                  : 'bg-white/10 hover:bg-white/20 text-slate-300 border border-white/10'
              }`}
              title={isCameraOn ? 'Turn Camera Off' : 'Turn Camera On'}
            >
              {isCameraOn ? <Camera className="w-3.5 h-3.5 text-cyan-300" /> : <CameraOff className="w-3.5 h-3.5 text-slate-400" />}
              <span className="text-[10px]">{isCameraOn ? 'Cam On' : 'Cam Off'}</span>
            </button>

            {isCameraOn && (
              <button
                onClick={onToggleMute}
                className={`p-1.5 rounded-lg text-xs font-medium transition cursor-pointer flex items-center space-x-1 ${
                  isMuted 
                    ? 'bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40' 
                    : 'bg-white/10 hover:bg-white/20 text-slate-300 border border-white/10'
                }`}
                title={isMuted ? 'Unmute' : 'Mute'}
              >
                {isMuted ? <MicOff className="w-3.5 h-3.5 text-rose-400" /> : <Mic className="w-3.5 h-3.5 text-slate-300" />}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
