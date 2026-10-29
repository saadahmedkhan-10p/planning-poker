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

  // Update URL without page reload when joined
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
    <div className="min-h-screen flex flex-col bg-[#0D1117] text-[#E6EDF3]">
      
      {/* ERROR TOAST */}
      {errorMessage && (
        <div 
          className="fixed top-4 right-4 z-50 flex items-center gap-2 px-3.5 py-2.5 rounded-lg text-xs"
          style={{
            background: '#161B22',
            border: '1px solid #CF222E',
            color: '#E6EDF3'
          }}
        >
          <AlertCircle className="w-4 h-4 text-[#CF222E] shrink-0" />
          <span>{errorMessage}</span>
          <button onClick={clearError} className="p-1 hover:text-white rounded cursor-pointer ml-1 text-[#8B949E]">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* DISCONNECTED WARNING BANNER */}
      {!isConnected && (
        <div 
          className="text-xs font-medium py-1.5 px-4 text-center tracking-wide flex items-center justify-center gap-2 text-white"
          style={{ background: '#9A6700', borderBottom: '1px solid #30363D' }}
        >
          <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
          <span>Connecting to real-time server...</span>
        </div>
      )}

      {/* JOIN SCREEN */}
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

          <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-5 flex flex-col justify-between">
            {/* Active Story Card */}
            <div>
              <ActiveStoryCard 
                onOpenStoryDrawer={() => setIsStoryDrawerOpen(true)} 
                onOpenImportModal={() => setIsStoryFetchModalOpen(true)}
              />

              {/* Reveal Statistics / Consensus Panel */}
              {room?.isRevealed && (
                <ConsensusResults />
              )}

              {/* Center Table Grid with Participant Pods */}
              <PokerTable />
            </div>

            {/* Bottom: Player's Card Hand */}
            <div className="sticky bottom-0 pt-2 pb-5 bg-[#0D1117]/95 z-20">
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
      <footer 
        className="py-3 px-4 text-center text-xs text-[#8B949E]"
        style={{ borderTop: '1px solid #30363D' }}
      >
        AgilePoint — Real-time planning poker for agile engineering teams
      </footer>
    </div>
  );
};
