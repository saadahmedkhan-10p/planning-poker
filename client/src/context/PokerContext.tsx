import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { io, Socket } from 'socket.io-client';
import confetti from 'canvas-confetti';
import type { 
  ClientRoomState, 
  Participant, 
  RoomSettings, 
  ReactionEvent
} from '../types/poker';
import { PRESET_DECKS } from '../types/poker';
import { soundEffects } from '../sound/soundEffects';

interface UserProfile {
  id: string;
  name: string;
  role: Participant['role'];
  avatarColor: string;
}

interface PokerContextType {
  socket: Socket | null;
  isConnected: boolean;
  room: ClientRoomState | null;
  currentUser: UserProfile | null;
  isFacilitator: boolean;
  activeDeck: string[];
  soundEnabled: boolean;
  theme: 'light' | 'dark';
  reactions: ReactionEvent[];
  errorMessage: string | null;
  
  // Actions
  joinRoom: (roomId: string, name: string, role?: Participant['role'], avatarColor?: string) => void;
  leaveRoom: () => void;
  castVote: (vote: string | null) => void;
  revealVotes: () => void;
  resetVotes: () => void;
  updateSettings: (settings: Partial<RoomSettings>) => void;
  updateRole: (participantId: string, role: Participant['role']) => void;
  kickParticipant: (participantId: string) => void;
  addStory: (story: { title: string; description?: string; url?: string }) => void;
  importStories: (stories: Array<{ title: string; description?: string; url?: string }>) => void;
  setActiveStory: (storyId: string) => void;
  setStoryPoints: (storyId: string, points: string) => void;
  deleteStory: (storyId: string) => void;
  timerAction: (action: 'start' | 'pause' | 'reset', duration?: number) => void;
  sendReaction: (emoji: string) => void;
  toggleSound: () => void;
  toggleTheme: () => void;
  clearError: () => void;
}

const PokerContext = createContext<PokerContextType | undefined>(undefined);

const USER_STORAGE_KEY = 'agilepoint_user_profile';
const THEME_STORAGE_KEY = 'agilepoint_theme';

const AVATAR_COLORS = [
  '#4F46E5', '#6366F1', '#06B6D4', '#059669', 
  '#10B981', '#F59E0B', '#EC4899', '#8B5CF6'
];

export const PokerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [room, setRoom] = useState<ClientRoomState | null>(null);
  const [reactions, setReactions] = useState<ReactionEvent[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => soundEffects.isEnabled());

  // Theme state
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem(THEME_STORAGE_KEY);
    if (saved === 'dark' || saved === 'light') return saved;
    return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  // User profile
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem(USER_STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // Ignore
      }
    }
    return {
      id: `user-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
      name: '',
      role: 'estimator',
      avatarColor: AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)]
    };
  });

  // Sync theme with HTML root class
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  }, [theme]);

  // Persist user profile
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(currentUser));
    }
  }, [currentUser]);

  // Initialize Socket.io connection
  useEffect(() => {
    // In dev or prod, connect to VITE_SERVER_URL, localhost:4000, or window.location.origin
    const envServerUrl = (import.meta as any).env?.VITE_SERVER_URL;
    const socketUrl = envServerUrl || (window.location.port === '5173' ? 'http://localhost:4000' : window.location.origin);
    const newSocket = io(socketUrl, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 10,
      reconnectionDelay: 1000
    });

    newSocket.on('connect', () => {
      setIsConnected(true);
    });

    newSocket.on('disconnect', () => {
      setIsConnected(false);
    });

    newSocket.on('room_state', (updatedRoom: ClientRoomState) => {
      setRoom(updatedRoom);
    });

    newSocket.on('votes_revealed', () => {
      soundEffects.playReveal();
    });

    newSocket.on('votes_reset', () => {
      // Round reset
    });

    newSocket.on('timer_expired', () => {
      soundEffects.playTick();
    });

    newSocket.on('reaction_received', (rx: ReactionEvent) => {
      setReactions(prev => [...prev.slice(-15), rx]);
    });

    newSocket.on('error_message', ({ message }: { message: string }) => {
      setErrorMessage(message);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, []);

  // Trigger celebration effects if unanimous consensus on reveal
  useEffect(() => {
    if (room?.isRevealed && room.consensusStats) {
      const stats = room.consensusStats;
      if (stats.agreementPercent === 100 && stats.totalVotes >= 2) {
        soundEffects.playConsensusFanfare();
        try {
          confetti({
            particleCount: 120,
            spread: 70,
            origin: { y: 0.6 }
          });
        } catch {
          // Ignore
        }
      }
    }
  }, [room?.isRevealed, room?.consensusStats]);

  // Determine facilitator status
  const isFacilitator = useMemo(() => {
    if (!room || !currentUser) return false;
    return room.facilitatorId === currentUser.id;
  }, [room, currentUser]);

  // Determine active deck cards
  const activeDeck = useMemo(() => {
    if (!room) return PRESET_DECKS.fibonacci;
    const { deckType, customDeck } = room.settings;
    if (deckType === 'custom') {
      return customDeck.length > 0 ? customDeck : PRESET_DECKS.fibonacci;
    }
    return PRESET_DECKS[deckType] || PRESET_DECKS.fibonacci;
  }, [room]);

  // Actions
  const joinRoom = useCallback((roomId: string, name: string, role?: Participant['role'], avatarColor?: string) => {
    if (!socket || !currentUser) return;

    const updatedUser: UserProfile = {
      ...currentUser,
      name: name.trim() || currentUser.name || 'Anonymous',
      role: role || currentUser.role,
      avatarColor: avatarColor || currentUser.avatarColor
    };
    setCurrentUser(updatedUser);

    socket.emit('join_room', {
      roomId,
      participant: updatedUser
    });
  }, [socket, currentUser]);

  const leaveRoom = useCallback(() => {
    if (!socket || !room) return;
    socket.emit('leave_room', { roomId: room.id });
    setRoom(null);
  }, [socket, room]);

  const castVote = useCallback((vote: string | null) => {
    if (!socket || !room) return;
    soundEffects.playCardPick();
    socket.emit('cast_vote', { roomId: room.id, vote });
  }, [socket, room]);

  const revealVotes = useCallback(() => {
    if (!socket || !room) return;
    socket.emit('reveal_votes', { roomId: room.id });
  }, [socket, room]);

  const resetVotes = useCallback(() => {
    if (!socket || !room) return;
    socket.emit('reset_votes', { roomId: room.id });
  }, [socket, room]);

  const updateSettings = useCallback((settings: Partial<RoomSettings>) => {
    if (!socket || !room) return;
    socket.emit('update_settings', { roomId: room.id, settings });
  }, [socket, room]);

  const updateRole = useCallback((participantId: string, role: Participant['role']) => {
    if (!socket || !room) return;
    socket.emit('update_role', { roomId: room.id, participantId, role });
  }, [socket, room]);

  const kickParticipant = useCallback((participantId: string) => {
    if (!socket || !room) return;
    socket.emit('kick_participant', { roomId: room.id, participantId });
  }, [socket, room]);

  const addStory = useCallback((story: { title: string; description?: string; url?: string }) => {
    if (!socket || !room) return;
    socket.emit('add_story', { roomId: room.id, story });
  }, [socket, room]);

  const importStories = useCallback((stories: Array<{ title: string; description?: string; url?: string }>) => {
    if (!socket || !room) return;
    socket.emit('import_stories', { roomId: room.id, stories });
  }, [socket, room]);

  const setActiveStory = useCallback((storyId: string) => {
    if (!socket || !room) return;
    socket.emit('set_active_story', { roomId: room.id, storyId });
  }, [socket, room]);

  const setStoryPoints = useCallback((storyId: string, points: string) => {
    if (!socket || !room) return;
    socket.emit('set_story_points', { roomId: room.id, storyId, points });
  }, [socket, room]);

  const deleteStory = useCallback((storyId: string) => {
    if (!socket || !room) return;
    socket.emit('delete_story', { roomId: room.id, storyId });
  }, [socket, room]);

  const timerAction = useCallback((action: 'start' | 'pause' | 'reset', duration?: number) => {
    if (!socket || !room) return;
    socket.emit('timer_action', { roomId: room.id, action, duration });
  }, [socket, room]);

  const sendReaction = useCallback((emoji: string) => {
    if (!socket || !room) return;
    socket.emit('send_reaction', { roomId: room.id, emoji });
  }, [socket, room]);

  const toggleSound = useCallback(() => {
    const newState = soundEffects.toggle();
    setSoundEnabled(newState);
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  }, []);

  const clearError = useCallback(() => {
    setErrorMessage(null);
  }, []);

  return (
    <PokerContext.Provider
      value={{
        socket,
        isConnected,
        room,
        currentUser,
        isFacilitator,
        activeDeck,
        soundEnabled,
        theme,
        reactions,
        errorMessage,
        joinRoom,
        leaveRoom,
        castVote,
        revealVotes,
        resetVotes,
        updateSettings,
        updateRole,
        kickParticipant,
        addStory,
        importStories,
        setActiveStory,
        setStoryPoints,
        deleteStory,
        timerAction,
        sendReaction,
        toggleSound,
        toggleTheme,
        clearError
      }}
    >
      {children}
    </PokerContext.Provider>
  );
};

export const usePoker = () => {
  const context = useContext(PokerContext);
  if (!context) {
    throw new Error('usePoker must be used within a PokerProvider');
  }
  return context;
};
