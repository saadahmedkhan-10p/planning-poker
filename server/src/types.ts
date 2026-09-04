export type DeckType = 
  | 'fibonacci' 
  | 'modified_fibonacci' 
  | 'tshirt' 
  | 'powers_of_two' 
  | 'risk' 
  | 'custom';

export const PRESET_DECKS: Record<Exclude<DeckType, 'custom'>, string[]> = {
  fibonacci: ['0', '1', '2', '3', '5', '8', '13', '21', '34', '55', '89', '?'],
  modified_fibonacci: ['0', '½', '1', '2', '3', '5', '8', '13', '20', '40', '100', '?'],
  tshirt: ['XS', 'S', 'M', 'L', 'XL', 'XXL', '?'],
  powers_of_two: ['1', '2', '4', '8', '16', '32', '64', '?'],
  risk: ['Low', 'Medium', 'High', 'Critical', '?']
};

export type ParticipantRole = 'facilitator' | 'estimator' | 'observer';

export interface Participant {
  id: string;
  name: string;
  role: ParticipantRole;
  avatarColor: string;
  connected: boolean;
  vote: string | null;
  voted: boolean;
}

export interface StoryStats {
  average?: number | null;
  median?: string | null;
  mode?: string | null;
  agreementPercent?: number | null;
  totalVotes: number;
  voteDistribution: Record<string, number>;
  outliers?: {
    lowestVoters?: string[];
    highestVoters?: string[];
  };
}

export interface Story {
  id: string;
  title: string;
  description?: string;
  url?: string;
  points?: string | null;
  status: 'pending' | 'active' | 'estimated';
  createdAt: number;
  estimatedAt?: number;
  stats?: StoryStats;
}

export interface RoomSettings {
  deckType: DeckType;
  customDeck: string[];
  autoReveal: boolean;
  showTimer: boolean;
  timerDuration: number; // in seconds
  allowRevote: boolean;
  showAverage: boolean;
  anonymousVoting: boolean;
}

export interface Room {
  id: string;
  name: string;
  facilitatorId: string;
  settings: RoomSettings;
  participants: Record<string, Participant>;
  stories: Story[];
  activeStoryId: string | null;
  isRevealed: boolean;
  timerEndTime: number | null;
  timerActive: boolean;
  timerSecondsRemaining: number | null;
  createdAt: number;
  updatedAt: number;
}

export interface ReactionEvent {
  id: string;
  senderId: string;
  senderName: string;
  emoji: string;
  timestamp: number;
}

export interface ClientRoomState extends Omit<Room, 'participants'> {
  participants: Array<Participant & {
    // Vote is masked if not revealed and current user is not this participant
    maskedVote?: string | null;
  }>;
  consensusStats?: StoryStats | null;
}
