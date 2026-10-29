import fs from 'node:fs';
import path from 'node:path';
import { 
  Room, 
  RoomSettings, 
  Participant, 
  Story, 
  StoryStats, 
  DeckType, 
  PRESET_DECKS, 
  ClientRoomState 
} from './types.js';

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'rooms.json');

export class RoomManager {
  private rooms: Map<string, Room> = new Map();
  private saveTimeout: NodeJS.Timeout | null = null;
  private timerIntervals: Map<string, NodeJS.Timeout> = new Map();

  constructor() {
    this.ensureDataDir();
    this.loadRooms();
  }

  private ensureDataDir(): void {
    if (!fs.existsSync(DATA_DIR)) {
      try {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      } catch (err) {
        console.warn('Could not create data directory:', err);
      }
    }
  }

  private loadRooms(): void {
    try {
      if (fs.existsSync(DATA_FILE)) {
        const raw = fs.readFileSync(DATA_FILE, 'utf-8');
        const list: Room[] = JSON.parse(raw);
        for (const room of list) {
          // Reset participant connection states on server restart
          for (const p of Object.values(room.participants)) {
            p.connected = false;
          }
          this.rooms.set(room.id, room);
        }
        console.log(`Loaded ${this.rooms.size} rooms from storage.`);
      }
    } catch (err) {
      console.warn('Failed to load rooms from storage:', err);
    }
  }

  public scheduleSave(): void {
    if (this.saveTimeout) return;
    this.saveTimeout = setTimeout(() => {
      this.saveRooms();
      this.saveTimeout = null;
    }, 2000);
  }

  private saveRooms(): void {
    try {
      this.ensureDataDir();
      const list = Array.from(this.rooms.values());
      fs.writeFileSync(DATA_FILE, JSON.stringify(list, null, 2), 'utf-8');
    } catch (err) {
      console.warn('Failed to save rooms to storage:', err);
    }
  }

  public getRoom(roomId: string): Room | undefined {
    return this.rooms.get(roomId);
  }

  public createRoom(
    name: string,
    settings?: Partial<RoomSettings>,
    customId?: string
  ): Room {
    const id = customId?.trim() ? customId.trim().toLowerCase().replace(/[^a-z0-9-_]/g, '-') : this.generateRoomId();
    
    const defaultSettings: RoomSettings = {
      deckType: 'fibonacci',
      customDeck: ['0', '1', '2', '3', '5', '8', '13', '21', '?'],
      autoReveal: false,
      showTimer: true,
      timerDuration: 60,
      allowRevote: true,
      showAverage: true,
      anonymousVoting: false,
      ...settings
    };

    const room: Room = {
      id,
      name: name || `Sprint Planning ${new Date().toLocaleDateString()}`,
      facilitatorId: '',
      settings: defaultSettings,
      participants: {},
      stories: [
        {
          id: 'story-1',
          title: 'Welcome to Planning Poker! Add or import your sprint stories here.',
          description: 'Click "Start Voting" when your team is assembled. Use numeric keys 1-9 for quick voting.',
          status: 'active',
          createdAt: Date.now()
        }
      ],
      activeStoryId: 'story-1',
      isRevealed: false,
      timerEndTime: null,
      timerActive: false,
      timerSecondsRemaining: defaultSettings.timerDuration,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    this.rooms.set(id, room);
    this.scheduleSave();
    return room;
  }

  private generateRoomId(): string {
    const adjectives = ['swift', 'agile', 'bright', 'focus', 'rapid', 'epic', 'steady', 'stellar'];
    const nouns = ['sprint', 'scrum', 'poker', 'point', 'rocket', 'stream', 'flow', 'team'];
    const randomAdj = adjectives[Math.floor(Math.random() * adjectives.length)];
    const randomNoun = nouns[Math.floor(Math.random() * nouns.length)];
    const num = Math.floor(100 + Math.random() * 900);
    return `${randomAdj}-${randomNoun}-${num}`;
  }

  public joinRoom(
    roomId: string, 
    participant: { id: string; name: string; role?: Participant['role']; avatarColor?: string }
  ): { room: Room; participant: Participant } {
    let room = this.getRoom(roomId);
    if (!room) {
      room = this.createRoom(`Sprint Planning`, {}, roomId);
    }

    const isFirst = Object.keys(room.participants).length === 0;
    const existing = room.participants[participant.id];

    const finalParticipant: Participant = {
      id: participant.id,
      name: participant.name.trim() || 'Anonymous Team Member',
      role: existing ? existing.role : (isFirst ? 'facilitator' : (participant.role || 'estimator')),
      avatarColor: participant.avatarColor || existing?.avatarColor || this.getRandomColor(),
      connected: true,
      vote: existing ? existing.vote : null,
      voted: existing ? existing.voted : false
    };

    if (isFirst || !room.facilitatorId || !room.participants[room.facilitatorId]?.connected) {
      if (finalParticipant.role === 'facilitator') {
        room.facilitatorId = finalParticipant.id;
      }
    }

    room.participants[participant.id] = finalParticipant;
    room.updatedAt = Date.now();
    this.scheduleSave();

    return { room, participant: finalParticipant };
  }

  public leaveRoom(roomId: string, participantId: string): Room | undefined {
    const room = this.getRoom(roomId);
    if (!room) return undefined;

    if (room.participants[participantId]) {
      room.participants[participantId].connected = false;
      
      // If facilitator left, assign next connected estimator or participant as facilitator
      if (room.facilitatorId === participantId) {
        const nextLeader = Object.values(room.participants).find(p => p.connected && p.id !== participantId);
        if (nextLeader) {
          room.facilitatorId = nextLeader.id;
          nextLeader.role = 'facilitator';
        }
      }
    }

    room.updatedAt = Date.now();
    this.scheduleSave();
    return room;
  }

  public castVote(roomId: string, participantId: string, vote: string | null): { room: Room; shouldAutoReveal: boolean } {
    const room = this.getRoom(roomId);
    if (!room) throw new Error('Room not found');
    if (room.isRevealed) throw new Error('Votes cannot be changed while cards are revealed');

    const participant = room.participants[participantId];
    if (!participant) throw new Error('Participant not in room');
    if (participant.role === 'observer') throw new Error('Observers cannot cast votes');

    participant.vote = vote;
    participant.voted = vote !== null;
    room.updatedAt = Date.now();

    // Check auto-reveal condition
    let shouldAutoReveal = false;
    if (room.settings.autoReveal && !room.isRevealed) {
      const activeEstimators = Object.values(room.participants).filter(
        p => p.connected && p.role !== 'observer'
      );
      if (activeEstimators.length > 0 && activeEstimators.every(p => p.voted)) {
        shouldAutoReveal = true;
        this.revealVotes(roomId);
      }
    }

    this.scheduleSave();
    return { room, shouldAutoReveal };
  }

  public revealVotes(roomId: string): Room {
    const room = this.getRoom(roomId);
    if (!room) throw new Error('Room not found');

    room.isRevealed = true;
    room.timerActive = false;
    room.timerEndTime = null;
    room.updatedAt = Date.now();

    // Calculate and cache stats on active story
    if (room.activeStoryId) {
      const story = room.stories.find(s => s.id === room.activeStoryId);
      if (story) {
        story.stats = this.calculateStats(room);
      }
    }

    this.scheduleSave();
    return room;
  }

  public resetVotes(roomId: string): Room {
    const room = this.getRoom(roomId);
    if (!room) throw new Error('Room not found');

    room.isRevealed = false;
    for (const p of Object.values(room.participants)) {
      p.vote = null;
      p.voted = false;
    }

    room.timerActive = false;
    room.timerEndTime = null;
    room.timerSecondsRemaining = room.settings.timerDuration;
    room.updatedAt = Date.now();

    this.scheduleSave();
    return room;
  }

  public updateSettings(roomId: string, newSettings: Partial<RoomSettings>): Room {
    const room = this.getRoom(roomId);
    if (!room) throw new Error('Room not found');

    room.settings = { ...room.settings, ...newSettings };
    if (newSettings.timerDuration) {
      room.timerSecondsRemaining = newSettings.timerDuration;
    }
    room.updatedAt = Date.now();
    this.scheduleSave();
    return room;
  }

  public updateParticipantRole(roomId: string, participantId: string, role: Participant['role']): Room {
    const room = this.getRoom(roomId);
    if (!room) throw new Error('Room not found');

    const participant = room.participants[participantId];
    if (participant) {
      participant.role = role;
      if (role === 'facilitator') {
        room.facilitatorId = participantId;
      } else if (room.facilitatorId === participantId) {
        const nextLeader = Object.values(room.participants).find(p => p.connected && p.id !== participantId);
        if (nextLeader) {
          room.facilitatorId = nextLeader.id;
          nextLeader.role = 'facilitator';
        }
      }
      // If changed to observer, clear any existing vote
      if (role === 'observer') {
        participant.vote = null;
        participant.voted = false;
      }
    }

    room.updatedAt = Date.now();
    this.scheduleSave();
    return room;
  }

  public kickParticipant(roomId: string, participantId: string): Room {
    const room = this.getRoom(roomId);
    if (!room) throw new Error('Room not found');

    delete room.participants[participantId];
    if (room.facilitatorId === participantId) {
      const nextLeader = Object.values(room.participants).find(p => p.connected);
      if (nextLeader) {
        room.facilitatorId = nextLeader.id;
        nextLeader.role = 'facilitator';
      }
    }

    room.updatedAt = Date.now();
    this.scheduleSave();
    return room;
  }

  // --- Story / Backlog Management ---

  public addStory(roomId: string, storyData: Partial<Story>): Room {
    const room = this.getRoom(roomId);
    if (!room) throw new Error('Room not found');

    const newStory: Story = {
      id: `story-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      title: storyData.title?.trim() || 'Untitled Story',
      description: storyData.description?.trim() || '',
      url: storyData.url?.trim() || '',
      status: room.stories.length === 0 ? 'active' : 'pending',
      createdAt: Date.now()
    };

    room.stories.push(newStory);
    if (!room.activeStoryId) {
      room.activeStoryId = newStory.id;
    }

    room.updatedAt = Date.now();
    this.scheduleSave();
    return room;
  }

  public importStories(roomId: string, titles: Array<{ title: string; description?: string; url?: string }>): Room {
    const room = this.getRoom(roomId);
    if (!room) throw new Error('Room not found');

    const newStories: Story[] = titles.map((item, idx) => ({
      id: `story-${Date.now()}-${idx}-${Math.floor(Math.random() * 1000)}`,
      title: item.title.trim(),
      description: item.description?.trim() || '',
      url: item.url?.trim() || '',
      status: 'pending',
      createdAt: Date.now() + idx
    }));

    room.stories.push(...newStories);
    if (!room.activeStoryId && room.stories.length > 0) {
      room.activeStoryId = room.stories[0].id;
      room.stories[0].status = 'active';
    }

    room.updatedAt = Date.now();
    this.scheduleSave();
    return room;
  }

  public setActiveStory(roomId: string, storyId: string): Room {
    const room = this.getRoom(roomId);
    if (!room) throw new Error('Room not found');

    for (const story of room.stories) {
      if (story.id === storyId) {
        story.status = 'active';
      } else if (story.status === 'active') {
        story.status = story.points ? 'estimated' : 'pending';
      }
    }

    room.activeStoryId = storyId;
    this.resetVotes(roomId);
    return room;
  }

  public setStoryPoints(roomId: string, storyId: string, points: string): Room {
    const room = this.getRoom(roomId);
    if (!room) throw new Error('Room not found');

    const story = room.stories.find(s => s.id === storyId);
    if (story) {
      story.points = points;
      story.status = 'estimated';
      story.estimatedAt = Date.now();
      story.stats = this.calculateStats(room);
    }

    room.updatedAt = Date.now();
    this.scheduleSave();
    return room;
  }

  public deleteStory(roomId: string, storyId: string): Room {
    const room = this.getRoom(roomId);
    if (!room) throw new Error('Room not found');

    room.stories = room.stories.filter(s => s.id !== storyId);
    if (room.activeStoryId === storyId) {
      const nextStory = room.stories.find(s => s.status !== 'estimated') || room.stories[0];
      room.activeStoryId = nextStory ? nextStory.id : null;
      if (nextStory) nextStory.status = 'active';
      this.resetVotes(roomId);
    }

    room.updatedAt = Date.now();
    this.scheduleSave();
    return room;
  }

  // --- Statistics & Consensus Calculation ---

  public calculateStats(room: Room): StoryStats {
    const votes: string[] = [];
    const voteMap: Record<string, string[]> = {}; // vote value -> participant names

    for (const p of Object.values(room.participants)) {
      if (p.connected && p.role !== 'observer' && p.vote !== null) {
        votes.push(p.vote);
        if (!voteMap[p.vote]) voteMap[p.vote] = [];
        voteMap[p.vote].push(p.name);
      }
    }

    const totalVotes = votes.length;
    if (totalVotes === 0) {
      return {
        totalVotes: 0,
        voteDistribution: {}
      };
    }

    const voteDistribution: Record<string, number> = {};
    for (const v of votes) {
      voteDistribution[v] = (voteDistribution[v] || 0) + 1;
    }

    // Numerical analysis
    const numericVotes: { val: number; raw: string; name: string }[] = [];
    for (const p of Object.values(room.participants)) {
      if (p.connected && p.role !== 'observer' && p.vote !== null) {
        const num = this.parseNumericValue(p.vote);
        if (num !== null) {
          numericVotes.push({ val: num, raw: p.vote, name: p.name });
        }
      }
    }

    let average: number | null = null;
    let median: string | null = null;
    let mode: string | null = null;
    let agreementPercent: number | null = null;
    const outliers: { lowestVoters?: string[]; highestVoters?: string[] } = {};

    // Mode
    let maxCount = 0;
    for (const [val, count] of Object.entries(voteDistribution)) {
      if (count > maxCount) {
        maxCount = count;
        mode = val;
      }
    }
    agreementPercent = Math.round((maxCount / totalVotes) * 100);

    if (numericVotes.length > 0) {
      const sum = numericVotes.reduce((acc, curr) => acc + curr.val, 0);
      average = Number((sum / numericVotes.length).toFixed(1));

      numericVotes.sort((a, b) => a.val - b.val);
      const mid = Math.floor(numericVotes.length / 2);
      if (numericVotes.length % 2 === 0) {
        const medNum = (numericVotes[mid - 1].val + numericVotes[mid].val) / 2;
        median = medNum % 1 === 0 ? medNum.toString() : medNum.toFixed(1);
      } else {
        median = numericVotes[mid].raw;
      }

      // Outlier identification (lowest and highest if distinct)
      const minVal = numericVotes[0].val;
      const maxVal = numericVotes[numericVotes.length - 1].val;
      if (minVal !== maxVal) {
        outliers.lowestVoters = numericVotes.filter(v => v.val === minVal).map(v => v.name);
        outliers.highestVoters = numericVotes.filter(v => v.val === maxVal).map(v => v.name);
      }
    }

    return {
      average,
      median,
      mode,
      agreementPercent,
      totalVotes,
      voteDistribution,
      outliers: outliers.lowestVoters ? outliers : undefined
    };
  }

  private parseNumericValue(vote: string): number | null {
    if (vote === '½') return 0.5;
    if (vote === '0') return 0;
    const n = parseFloat(vote);
    return isNaN(n) ? null : n;
  }

  private getRandomColor(): string {
    const colors = [
      '#4F46E5', '#6366F1', '#06B6D4', '#059669', 
      '#10B981', '#F59E0B', '#EC4899', '#8B5CF6'
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  public getClientState(roomId: string, currentUserId?: string): ClientRoomState | null {
    const room = this.getRoom(roomId);
    if (!room) return null;

    const participantsList = Object.values(room.participants).map(p => {
      // Mask vote if not revealed and this is not the current user
      const shouldShowVote = room.isRevealed || (currentUserId && p.id === currentUserId);
      return {
        ...p,
        vote: shouldShowVote ? p.vote : (p.voted ? 'HIDDEN' : null)
      };
    });

    const consensusStats = room.isRevealed ? this.calculateStats(room) : null;

    return {
      id: room.id,
      name: room.name,
      facilitatorId: room.facilitatorId,
      settings: room.settings,
      participants: participantsList,
      stories: room.stories,
      activeStoryId: room.activeStoryId,
      isRevealed: room.isRevealed,
      timerEndTime: room.timerEndTime,
      timerActive: room.timerActive,
      timerSecondsRemaining: room.timerSecondsRemaining,
      createdAt: room.createdAt,
      updatedAt: room.updatedAt,
      consensusStats
    };
  }
}
