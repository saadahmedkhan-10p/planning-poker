import React, { useState } from 'react';
import { 
  Share2, 
  Volume2, 
  VolumeX, 
  Check, 
  Settings, 
  Layers, 
  QrCode, 
  LogOut,
  Camera,
  CameraOff,
  Crown
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
    <header 
      style={{
        background: '#161B22',
        borderBottom: '1px solid #30363D',
        height: '52px',
        padding: '0 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}
      className="sticky top-0 z-30 select-none"
    >
      {/* Left: Brand & Room ID */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5 font-semibold text-[15px] text-[#E6EDF3]">
          <span className="text-[#7C3AED] leading-none">♠</span>
          <span>AgilePoint</span>
        </div>

        {room && (
          <div className="flex items-center gap-2">
            <span 
              className="text-xs font-mono text-[#8B949E] px-2 py-0.5 rounded"
              style={{
                background: '#1C2128',
                border: '1px solid #30363D',
                borderRadius: '6px'
              }}
              title={`Room code: ${room.id}`}
            >
              {room.id}
            </span>
          </div>
        )}
      </div>

      {/* Center: Session Name & Backlog link */}
      {room && (
        <div className="hidden md:flex items-center gap-3">
          <span className="text-xs font-medium text-[#E6EDF3] max-w-[200px] truncate" title={room.name}>
            {room.name}
          </span>

          <button
            onClick={onOpenStoryDrawer}
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs text-[#8B949E] hover:text-[#E6EDF3] transition cursor-pointer"
            style={{
              background: '#1C2128',
              border: '1px solid #30363D',
              borderRadius: '6px'
            }}
            title="Open Backlog"
          >
            <Layers className="w-3.5 h-3.5 text-[#8B949E]" />
            <span>Backlog</span>
            {unestimatedCount > 0 ? (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-semibold bg-[#7C3AED] text-white">
                {unestimatedCount}
              </span>
            ) : (
              <span className="text-[#3FB950] text-[11px]">✓</span>
            )}
          </button>
        </div>
      )}

      {/* Right: Controls & Profile */}
      <div className="flex items-center gap-1.5">
        {/* Online Indicator */}
        {room && (
          <div className="flex items-center gap-1.5 mr-2 text-xs text-[#8B949E]">
            <span 
              className="w-2 h-2 rounded-full inline-block"
              style={{ background: '#3FB950' }}
            />
            <span>{connectedCount} online</span>
          </div>
        )}

        {/* Camera Toggle */}
        {hasMediaSupport && (
          <button
            onClick={toggleCamera}
            className="w-8 h-8 rounded flex items-center justify-center transition cursor-pointer text-[#8B949E] hover:text-[#E6EDF3] hover:bg-[#1C2128]"
            style={{
              border: isCameraOn ? '1px solid #7C3AED' : '1px solid #30363D',
              borderRadius: '6px',
              background: isCameraOn ? 'rgba(124, 58, 237, 0.1)' : 'transparent',
              color: isCameraOn ? '#E6EDF3' : '#8B949E'
            }}
            title={isCameraOn ? 'Turn camera off' : 'Turn camera on'}
          >
            {isCameraOn ? <Camera className="w-3.5 h-3.5 text-[#7C3AED]" /> : <CameraOff className="w-3.5 h-3.5" />}
          </button>
        )}

        {/* Mute/Sound Toggle */}
        <button
          onClick={toggleSound}
          className="w-8 h-8 rounded flex items-center justify-center transition cursor-pointer text-[#8B949E] hover:text-[#E6EDF3] hover:bg-[#1C2128]"
          style={{
            border: '1px solid #30363D',
            borderRadius: '6px',
            background: 'transparent'
          }}
          title={soundEnabled ? 'Mute Sounds' : 'Enable Sounds'}
        >
          {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5 text-[#484F58]" />}
        </button>

        {/* Share Link */}
        {room && (
          <button
            onClick={handleCopyLink}
            className="w-8 h-8 rounded flex items-center justify-center transition cursor-pointer text-[#8B949E] hover:text-[#E6EDF3] hover:bg-[#1C2128]"
            style={{
              border: '1px solid #30363D',
              borderRadius: '6px',
              background: 'transparent'
            }}
            title={copied ? 'Link Copied!' : 'Copy Room Link'}
          >
            {copied ? <Check className="w-3.5 h-3.5 text-[#3FB950]" /> : <Share2 className="w-3.5 h-3.5" />}
          </button>
        )}

        {/* QR Code */}
        {room && (
          <button
            onClick={onOpenShareModal}
            className="w-8 h-8 rounded flex items-center justify-center transition cursor-pointer text-[#8B949E] hover:text-[#E6EDF3] hover:bg-[#1C2128]"
            style={{
              border: '1px solid #30363D',
              borderRadius: '6px',
              background: 'transparent'
            }}
            title="Show QR Code"
          >
            <QrCode className="w-3.5 h-3.5" />
          </button>
        )}

        {/* Settings (Facilitator only) */}
        {room && isFacilitator && (
          <button
            onClick={onOpenSettings}
            className="w-8 h-8 rounded flex items-center justify-center transition cursor-pointer text-[#8B949E] hover:text-[#E6EDF3] hover:bg-[#1C2128]"
            style={{
              border: '1px solid #30363D',
              borderRadius: '6px',
              background: 'transparent'
            }}
            title="Session Settings"
          >
            <Settings className="w-3.5 h-3.5" />
          </button>
        )}

        {/* User avatar & leave */}
        {currentUser && (
          <div className="flex items-center gap-1.5 pl-1">
            <div className="relative">
              <div 
                className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold text-white select-none"
                style={{ backgroundColor: currentUser.avatarColor }}
                title={`${currentUser.name} (${isFacilitator ? 'Host' : currentUser.role})`}
              >
                {currentUser.name.charAt(0).toUpperCase() || 'U'}
              </div>
              {isFacilitator && (
                <div 
                  className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full flex items-center justify-center text-[#D29922]"
                  style={{ background: '#161B22', border: '1px solid #30363D' }}
                  title="Session Host"
                >
                  <Crown className="w-2.5 h-2.5 fill-current" />
                </div>
              )}
            </div>
            <button
              onClick={leaveRoom}
              className="w-8 h-8 rounded flex items-center justify-center transition cursor-pointer text-[#8B949E] hover:text-[#F85149] hover:bg-[#1C2128]"
              style={{
                border: '1px solid #30363D',
                borderRadius: '6px',
                background: 'transparent'
              }}
              title="Leave Room"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
