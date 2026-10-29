import React, { useState, useEffect } from 'react';
import { usePoker } from './context/PokerContext';
import { Navbar } from './components/Navbar';
import { ActiveStoryCard } from './components/ActiveStoryCard';
import { ConsensusResults } from './components/ConsensusResults';
import { PokerTable } from './components/PokerTable';
import { CardDeck } from './components/CardDeck';
import { StoryDrawer } from './components/StoryDrawer';
import { RoomSettingsModal } from './components/RoomSettingsModal';
import { ShareModal } from './components/ShareModal';
import { JoinModal } from './components/JoinModal';
import { StoryFetchModal } from './components/StoryFetchModal';
import { FloatingReactions } from './components/FloatingReactions';
import { AlertCircle, X } from 'lucide-react';

export const App: React.FC = () => {
  const { room, currentUser, errorMessage, clearError, isConnected } = usePoker();

  const [isStoryDrawerOpen, setIsStoryDrawerOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isStoryFetchModalOpen, setIsStoryFetchModalOpen] = useState(false);
  const [initialRoomId, setInitialRoomId] = useState<string | null>(null);

  // Check URL params for room id
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const roomParam = params.get('room');
    if (roomParam) {
      setInitialRoomId(roomParam);
    } else {
      const pathParts = window.location.pathname.split('/').filter(Boolean);
      if (pathParts.length > 0 && pathParts[0] === 'room' && pathParts[1]) {
        setInitialRoomId(pathParts[1]);
      }
    }
  }, []);

  // Update URL without page reload when joined — always overwrite any stale params
  const handleSelectRoom = (roomId: string) => {
    const newUrl = `${window.location.origin}${window.location.pathname}?room=${roomId}`;
    window.history.replaceState({ roomId }, '', newUrl);
  };

  // Determine if user has joined this room
  const hasJoined = Boolean(
    room && 
    currentUser && 
    room.participants.some(p => p.id === currentUser.id)
  );

  return (
    <div className="min-h-screen flex flex-col bg-[#0B0E1A] text-slate-100 selection:bg-violet-500/30 selection:text-white">
      
      {/* ERROR TOAST */}
      {errorMessage && (
        <div className="fixed top-4 right-4 z-50 flex items-center space-x-2 px-4 py-3 rounded-2xl bg-rose-600/90 backdrop-blur-md text-white shadow-2xl text-xs font-semibold animate-in fade-in slide-in-from-top-2 duration-200 border border-rose-500/30">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
          <button onClick={clearError} className="p-1 hover:bg-white/20 rounded cursor-pointer">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* DISCONNECTED WARNING BANNER */}
      {!isConnected && (
        <div className="bg-amber-600/90 text-white text-xs font-bold py-1.5 px-4 text-center tracking-wide flex items-center justify-center space-x-2 border-b border-amber-500/30">
          <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
          <span>Connecting to real-time server...</span>
        </div>
      )}

      {/* MODALS */}
      {!hasJoined && (
        <JoinModal 
          initialRoomId={initialRoomId} 
          onSelectRoom={handleSelectRoom} 
        />
      )}

      {hasJoined && (
        <>
          <Navbar 
            onOpenSettings={() => setIsSettingsModalOpen(true)}
            onOpenStoryDrawer={() => setIsStoryDrawerOpen(true)}
            onOpenShareModal={() => setIsShareModalOpen(true)}
          />

          <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col justify-between">
            {/* Top: Active Story Card */}
            <div>
              <ActiveStoryCard 
                onOpenStoryDrawer={() => setIsStoryDrawerOpen(true)} 
                onOpenImportModal={() => setIsStoryFetchModalOpen(true)}
              />

              {/* Reveal Statistics / Consensus Panel */}
              {room?.isRevealed && (
                <ConsensusResults />
              )}

              {/* Center: Poker Table Stadium with WebRTC Video Pods */}
              <PokerTable />
            </div>

            {/* Bottom: Player's Card Hand */}
            <div className="sticky bottom-0 pt-2 pb-6 bg-gradient-to-t from-[#0B0E1A] via-[#0B0E1A]/95 to-transparent z-20">
              <CardDeck />
            </div>
          </main>

          {/* Floating Emoji Reactions & Dock */}
          <FloatingReactions />

          {/* Drawers & Dialogs */}
          <StoryDrawer 
            isOpen={isStoryDrawerOpen}
            onClose={() => setIsStoryDrawerOpen(false)}
          />

          <RoomSettingsModal
            isOpen={isSettingsModalOpen}
            onClose={() => setIsSettingsModalOpen(false)}
          />

          <ShareModal
            isOpen={isShareModalOpen}
            onClose={() => setIsShareModalOpen(false)}
          />

          <StoryFetchModal
            isOpen={isStoryFetchModalOpen}
            onClose={() => setIsStoryFetchModalOpen(false)}
          />
        </>
      )}

      {/* Footer */}
      <footer className="py-3 px-4 border-t border-white/10 text-center text-[11px] text-slate-500">
        AgilePoint Poker v2 • Dark Glass Real-Time Planning Poker with WebRTC & ADO/Jira Sync
      </footer>
    </div>
  );
};
