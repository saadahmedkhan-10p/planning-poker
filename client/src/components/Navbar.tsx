import React, { useState } from 'react';
import { 
  Sparkles, 
  Share2, 
  Volume2, 
  VolumeX, 
  Sun, 
  Moon, 
  Check, 
  Settings, 
  Layers, 
  QrCode, 
  Users,
  LogOut
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
    theme, 
    toggleTheme,
    leaveRoom
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
    <header className="sticky top-0 z-30 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Left: Brand & Room Info */}
        <div className="flex items-center space-x-3 sm:space-x-4">
          <div className="flex items-center space-x-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 flex items-center justify-center text-white shadow-sm shadow-indigo-500/30">
              <Sparkles className="w-5 h-5" />
            </div>
            <div className="hidden sm:block">
              <span className="font-heading font-bold text-lg text-slate-900 dark:text-white tracking-tight">
                AgilePoint
              </span>
              <span className="ml-1 text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-400">
                Free
              </span>
            </div>
          </div>

          {room && (
            <div className="h-5 w-px bg-slate-200 dark:bg-slate-700 hidden sm:block" />
          )}

          {room && (
            <div className="flex items-center space-x-2">
              <div className="flex flex-col">
                <div className="flex items-center space-x-2">
                  <h1 className="font-heading font-semibold text-sm sm:text-base text-slate-800 dark:text-slate-200 max-w-[140px] sm:max-w-xs truncate">
                    {room.name}
                  </h1>
                  <span className="font-mono text-xs text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200/60 dark:border-slate-700/60">
                    {room.id}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Center: Story & Participant Quick Stats (Desktop) */}
        {room && (
          <div className="hidden md:flex items-center space-x-3">
            <button
              onClick={onOpenStoryDrawer}
              className="flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-100 hover:bg-slate-200/70 dark:bg-slate-800 dark:hover:bg-slate-700/80 border border-slate-200 dark:border-slate-700 transition cursor-pointer"
              title="View Backlog & Stories"
            >
              <Layers className="w-3.5 h-3.5 text-indigo-500" />
              <span>Backlog</span>
              {unestimatedCount > 0 ? (
                <span className="px-1.5 py-0.2 bg-indigo-500 text-white rounded-full text-[10px] font-bold">
                  {unestimatedCount}
                </span>
              ) : (
                <span className="px-1.5 py-0.2 bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-full text-[10px] font-bold">
                  ✓
                </span>
              )}
            </button>

            <div className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800">
              <Users className="w-3.5 h-3.5 text-slate-400" />
              <span>{connectedCount} online</span>
              <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-500' : 'bg-rose-500 animate-pulse'}`} />
            </div>
          </div>
        )}

        {/* Right: Actions */}
        <div className="flex items-center space-x-1.5 sm:space-x-2">
          {room && (
            <>
              <button
                onClick={handleCopyLink}
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-indigo-700 dark:text-indigo-300 bg-indigo-50 hover:bg-indigo-100/80 dark:bg-indigo-950/60 dark:hover:bg-indigo-900/60 border border-indigo-200 dark:border-indigo-800/60 transition cursor-pointer"
                title="Copy Room Invite Link"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span className="hidden sm:inline text-emerald-600 dark:text-emerald-400">Copied!</span>
                  </>
                ) : (
                  <>
                    <Share2 className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Invite</span>
                  </>
                )}
              </button>

              <button
                onClick={onOpenShareModal}
                className="p-2 rounded-lg text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                title="Show QR Code & Room Details"
              >
                <QrCode className="w-4 h-4" />
              </button>

              {isFacilitator && (
                <button
                  onClick={onOpenSettings}
                  className="p-2 rounded-lg text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                  title="Session & Deck Settings"
                >
                  <Settings className="w-4 h-4" />
                </button>
              )}
            </>
          )}

          {/* Sound Toggle */}
          <button
            onClick={toggleSound}
            className="p-2 rounded-lg text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
            title={soundEnabled ? 'Mute Sounds' : 'Enable Sounds'}
          >
            {soundEnabled ? (
              <Volume2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            ) : (
              <VolumeX className="w-4 h-4 text-slate-400" />
            )}
          </button>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
            title={theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-slate-600" />
            )}
          </button>

          {room && currentUser && (
            <div className="flex items-center pl-1 sm:pl-2">
              <div 
                className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold ring-2 ring-white dark:ring-slate-900 shadow-sm"
                style={{ backgroundColor: currentUser.avatarColor }}
                title={`${currentUser.name} (${currentUser.role})`}
              >
                {currentUser.name.charAt(0).toUpperCase() || 'U'}
              </div>
              <button
                onClick={leaveRoom}
                className="ml-1 sm:ml-2 p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition cursor-pointer"
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
