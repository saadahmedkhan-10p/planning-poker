import React, { useState } from 'react';
import { 
  Sparkles, 
  Share2, 
  Volume2, 
  VolumeX, 
  Check, 
  Settings, 
  Layers, 
  QrCode, 
  Users,
  LogOut,
  Camera,
  CameraOff
} from 'lucide-react';
import { usePoker } from '../context/PokerContext';

interface NavbarProps {
  onOpenSettings: () => void;
  onOpenStoryDrawer: () => void;
  onOpenShareModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ 
  onOpenSettings, 
  onOpenStoryDrawer,
  onOpenShareModal
}) => {
  const { 
    room, 
    currentUser, 
    isFacilitator, 
    isConnected, 
    soundEnabled, 
    toggleSound, 
    leaveRoom,
    isCameraOn,
    toggleCamera,
    hasMediaSupport
  } = usePoker();

  const [copied, setCopied] = useState(false);

  const handleCopyLink = () => {
    if (!room) return;
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const connectedCount = room ? room.participants.filter(p => p.connected).length : 0;
  const unestimatedCount = room ? room.stories.filter(s => s.status !== 'estimated').length : 0;

  return (
    <header className="sticky top-0 z-30 bg-white/5 backdrop-blur-xl border-b border-white/10 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Left: Brand & Room Info */}
        <div className="flex items-center space-x-3 sm:space-x-4">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-violet-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-violet-600/30 border border-violet-400/30">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="font-heading font-extrabold text-lg tracking-tight bg-gradient-to-r from-violet-400 via-purple-300 to-cyan-400 bg-clip-text text-transparent">
                AgilePoint
              </span>
              <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-violet-500/20 text-violet-300 border border-violet-500/30">
                v2
              </span>
            </div>
          </div>

          {room && (
            <div className="h-5 w-px bg-white/10 hidden sm:block" />
          )}

          {room && (
            <div className="flex items-center space-x-2">
              <h1 className="font-heading font-semibold text-sm sm:text-base text-slate-200 max-w-[140px] sm:max-w-xs truncate">
                {room.name}
              </h1>
              <span className="font-mono text-xs text-slate-300 bg-white/10 px-3 py-1 rounded-lg border border-white/10 select-all">
                {room.id}
              </span>
            </div>
          )}
        </div>

        {/* Center: Live Stats & Camera Action (Desktop) */}
        {room && (
          <div className="hidden md:flex items-center space-x-3">
            {/* Live Camera Quick Toggle */}
            {hasMediaSupport && (
              <button
                onClick={toggleCamera}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer border ${
                  isCameraOn
                    ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400/40 shadow-sm'
                    : 'bg-white/5 hover:bg-white/10 text-slate-300 border-white/10'
                }`}
                title={isCameraOn ? 'Turn camera off' : 'Turn camera on'}
              >
                {isCameraOn ? (
                  <>
                    <span className="w-2 h-2 rounded-full bg-cyan-400 pulse-cyan" />
                    <Camera className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Cam Live</span>
                  </>
                ) : (
                  <>
                    <CameraOff className="w-3.5 h-3.5 text-slate-400" />
                    <span>Enable Cam</span>
                  </>
                )}
              </button>
            )}

            {/* Backlog Button */}
            <button
              onClick={onOpenStoryDrawer}
              className="flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 bg-white/5 hover:bg-white/10 border border-white/10 transition cursor-pointer"
              title="View Backlog & Stories"
            >
              <Layers className="w-3.5 h-3.5 text-violet-400" />
              <span>Backlog</span>
              {unestimatedCount > 0 ? (
                <span className="px-1.5 py-0.2 bg-violet-600 text-white rounded-full text-[10px] font-bold">
                  {unestimatedCount}
                </span>
              ) : (
                <span className="px-1.5 py-0.2 bg-emerald-500/20 text-emerald-400 rounded-full text-[10px] font-bold">
                  ✓
                </span>
              )}
            </button>

            {/* Live Connected Indicator */}
            <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 bg-white/5 border border-white/10">
              <Users className="w-3.5 h-3.5 text-slate-400" />
              <span>{connectedCount} online</span>
              <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-cyan-400 pulse-cyan' : 'bg-rose-500 animate-pulse'}`} />
            </div>
          </div>
        )}

        {/* Right: Actions */}
        <div className="flex items-center space-x-1.5 sm:space-x-2">
          {room && (
            <>
              {/* Copy Invite Link */}
              <button
                onClick={handleCopyLink}
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-violet-600/30 hover:bg-violet-600/50 border border-violet-500/40 transition cursor-pointer"
                title="Copy Room Link"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="hidden sm:inline text-emerald-300">Copied!</span>
                  </>
                ) : (
                  <>
                    <Share2 className="w-3.5 h-3.5 text-violet-300" />
                    <span className="hidden sm:inline">Invite</span>
                  </>
                )}
              </button>

              {/* QR Code */}
              <button
                onClick={onOpenShareModal}
                className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 border border-transparent hover:border-white/10 transition cursor-pointer"
                title="Show QR Code"
              >
                <QrCode className="w-4 h-4" />
              </button>

              {/* Settings (Facilitator only) */}
              {isFacilitator && (
                <button
                  onClick={onOpenSettings}
                  className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 border border-transparent hover:border-white/10 transition cursor-pointer"
                  title="Session Settings"
                >
                  <Settings className="w-4 h-4" />
                </button>
              )}
            </>
          )}

          {/* Sound Toggle */}
          <button
            onClick={toggleSound}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 border border-transparent hover:border-white/10 transition cursor-pointer"
            title={soundEnabled ? 'Mute Sounds' : 'Enable Sounds'}
          >
            {soundEnabled ? (
              <Volume2 className="w-4 h-4 text-violet-400" />
            ) : (
              <VolumeX className="w-4 h-4 text-slate-500" />
            )}
          </button>

          {/* User Profile Avatar & Leave Button */}
          {room && currentUser && (
            <div className="flex items-center pl-1 sm:pl-2">
              <div 
                className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold ring-2 ring-white/20 shadow-md"
                style={{ backgroundColor: currentUser.avatarColor }}
                title={`${currentUser.name} (${currentUser.role})`}
              >
                {currentUser.name.charAt(0).toUpperCase() || 'U'}
              </div>
              <button
                onClick={leaveRoom}
                className="ml-1 sm:ml-2 p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/20 transition cursor-pointer"
                title="Leave Room"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

      </div>
    </header>
  );
};
