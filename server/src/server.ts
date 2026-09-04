import express, { Request, Response } from 'express';
import http from 'node:http';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import cors from 'cors';
import { Server, Socket } from 'socket.io';
import { RoomManager } from './roomManager.js';
import { ReactionEvent } from './types.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

const PORT = process.env.PORT || 4000;
const roomManager = new RoomManager();

app.use(cors());
app.use(express.json());

// Track socket to room & user mapping
interface SocketData {
  roomId?: string;
  userId?: string;
}
const socketMeta = new Map<string, SocketData>();

// --- REST Endpoints ---
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: Date.now()
  });
});

app.post('/api/rooms', (req: Request, res: Response) => {
  const { name, settings, customId } = req.body;
  const room = roomManager.createRoom(name, settings, customId);
  res.status(201).json({ room });
});

app.get('/api/rooms/:id', (req: Request, res: Response) => {
  const roomId = String(req.params.id);
  const room = roomManager.getRoom(roomId);
  if (!room) {
    res.status(404).json({ error: 'Room not found' });
    return;
  }
  res.json({ room });
});

// CSV Export for sprint story points
app.get('/api/rooms/:id/export.csv', (req: Request, res: Response) => {
  const roomId = String(req.params.id);
  const room = roomManager.getRoom(roomId);
  if (!room) {
    res.status(404).send('Room not found');
    return;
  }

  const rows = [
    ['Story ID', 'Title', 'Description', 'Points', 'Status', 'Estimated Date'].join(',')
  ];

  for (const s of room.stories) {
    const title = `"${(s.title || '').replace(/"/g, '""')}"`;
    const desc = `"${(s.description || '').replace(/"/g, '""')}"`;
    const pts = s.points ?? 'Unestimated';
    const date = s.estimatedAt ? new Date(s.estimatedAt).toISOString() : '';
    rows.push([s.id, title, desc, pts, s.status, date].join(','));
  }

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename="${room.id}-estimates.csv"`);
  res.send(rows.join('\n'));
});

// --- Timer intervals ---
const activeTimerIntervals = new Map<string, NodeJS.Timeout>();

function stopRoomTimer(roomId: string) {
  const existing = activeTimerIntervals.get(roomId);
  if (existing) {
    clearInterval(existing);
    activeTimerIntervals.delete(roomId);
  }
}

function startRoomTimer(roomId: string, durationSeconds: number) {
  stopRoomTimer(roomId);

  const room = roomManager.getRoom(roomId);
  if (!room) return;

  room.timerActive = true;
  room.timerSecondsRemaining = durationSeconds;
  room.timerEndTime = Date.now() + durationSeconds * 1000;

  broadcastRoomState(roomId);

  const interval = setInterval(() => {
    const currentRoom = roomManager.getRoom(roomId);
    if (!currentRoom || !currentRoom.timerActive || currentRoom.timerSecondsRemaining === null) {
      stopRoomTimer(roomId);
      return;
    }

    currentRoom.timerSecondsRemaining -= 1;
    if (currentRoom.timerSecondsRemaining <= 0) {
      currentRoom.timerSecondsRemaining = 0;
      currentRoom.timerActive = false;
      currentRoom.timerEndTime = null;
      stopRoomTimer(roomId);

      io.to(roomId).emit('timer_expired', { roomId });
      // If auto-reveal on timer expiration
      if (currentRoom.settings.autoReveal && !currentRoom.isRevealed) {
        roomManager.revealVotes(roomId);
      }
    }

    broadcastRoomState(roomId);
  }, 1000);

  activeTimerIntervals.set(roomId, interval);
}

// Broadcast room state to each client tailored to their perspective (masked votes)
function broadcastRoomState(roomId: string) {
  const room = roomManager.getRoom(roomId);
  if (!room) return;

  const socketsInRoom = io.sockets.adapter.rooms.get(roomId);
  if (!socketsInRoom) return;

  for (const socketId of socketsInRoom) {
    const clientSocket = io.sockets.sockets.get(socketId);
    if (!clientSocket) continue;

    const meta = socketMeta.get(socketId);
    const clientState = roomManager.getClientState(roomId, meta?.userId);
    if (clientState) {
      clientSocket.emit('room_state', clientState);
    }
  }
}

// --- Socket.IO Event Handlers ---
io.on('connection', (socket: Socket) => {
  // Join Room
  socket.on('join_room', ({ roomId, participant }) => {
    if (!roomId || !participant?.id) return;

    socket.join(roomId);
    socketMeta.set(socket.id, { roomId, userId: participant.id });

    const { room, participant: finalParticipant } = roomManager.joinRoom(roomId, participant);
    
    socket.emit('joined_successfully', { participant: finalParticipant });
    broadcastRoomState(roomId);
  });

  // Cast Vote
  socket.on('cast_vote', ({ roomId, vote }) => {
    const meta = socketMeta.get(socket.id);
    if (!meta || !meta.userId || meta.roomId !== roomId) return;

    try {
      const { shouldAutoReveal } = roomManager.castVote(roomId, meta.userId, vote);
      broadcastRoomState(roomId);

      if (shouldAutoReveal) {
        io.to(roomId).emit('auto_revealed', { roomId });
      }
    } catch (err: any) {
      socket.emit('error_message', { message: err.message });
    }
  });

  // Reveal Votes
  socket.on('reveal_votes', ({ roomId }) => {
    const meta = socketMeta.get(socket.id);
    const room = roomManager.getRoom(roomId);
    if (!room || !meta?.userId) return;

    // Only facilitator can manually reveal
    if (room.facilitatorId && room.facilitatorId !== meta.userId) {
      socket.emit('error_message', { message: 'Only the session facilitator can reveal cards.' });
      return;
    }

    stopRoomTimer(roomId);
    roomManager.revealVotes(roomId);
    broadcastRoomState(roomId);
    io.to(roomId).emit('votes_revealed', { roomId });
  });

  // Reset Votes
  socket.on('reset_votes', ({ roomId }) => {
    const meta = socketMeta.get(socket.id);
    const room = roomManager.getRoom(roomId);
    if (!room || !meta?.userId) return;

    if (room.facilitatorId && room.facilitatorId !== meta.userId) {
      socket.emit('error_message', { message: 'Only the session facilitator can reset cards.' });
      return;
    }

    stopRoomTimer(roomId);
    roomManager.resetVotes(roomId);
    broadcastRoomState(roomId);
    io.to(roomId).emit('votes_reset', { roomId });
  });

  // Update Settings
  socket.on('update_settings', ({ roomId, settings }) => {
    const meta = socketMeta.get(socket.id);
    const room = roomManager.getRoom(roomId);
    if (!room || !meta?.userId || room.facilitatorId !== meta.userId) return;

    roomManager.updateSettings(roomId, settings);
    broadcastRoomState(roomId);
  });

  // Update Participant Role
  socket.on('update_role', ({ roomId, participantId, role }) => {
    const meta = socketMeta.get(socket.id);
    const room = roomManager.getRoom(roomId);
    if (!room) return;

    // Facilitator or user themselves changing to observer
    if (meta?.userId === room.facilitatorId || meta?.userId === participantId) {
      roomManager.updateParticipantRole(roomId, participantId, role);
      broadcastRoomState(roomId);
    }
  });

  // Kick Participant
  socket.on('kick_participant', ({ roomId, participantId }) => {
    const meta = socketMeta.get(socket.id);
    const room = roomManager.getRoom(roomId);
    if (!room || !meta?.userId || room.facilitatorId !== meta.userId) return;

    roomManager.kickParticipant(roomId, participantId);
    broadcastRoomState(roomId);
  });

  // Timer Controls
  socket.on('timer_action', ({ roomId, action, duration }) => {
    const meta = socketMeta.get(socket.id);
    const room = roomManager.getRoom(roomId);
    if (!room || !meta?.userId || room.facilitatorId !== meta.userId) return;

    if (action === 'start') {
      const dur = duration || room.timerSecondsRemaining || room.settings.timerDuration || 60;
      startRoomTimer(roomId, dur);
    } else if (action === 'pause') {
      stopRoomTimer(roomId);
      room.timerActive = false;
      broadcastRoomState(roomId);
    } else if (action === 'reset') {
      stopRoomTimer(roomId);
      room.timerActive = false;
      room.timerSecondsRemaining = duration || room.settings.timerDuration || 60;
      broadcastRoomState(roomId);
    }
  });

  // Backlog / Story Events
  socket.on('add_story', ({ roomId, story }) => {
    roomManager.addStory(roomId, story);
    broadcastRoomState(roomId);
  });

  socket.on('import_stories', ({ roomId, stories }) => {
    roomManager.importStories(roomId, stories);
    broadcastRoomState(roomId);
  });

  socket.on('set_active_story', ({ roomId, storyId }) => {
    const meta = socketMeta.get(socket.id);
    const room = roomManager.getRoom(roomId);
    if (!room || !meta?.userId || room.facilitatorId !== meta.userId) return;

    roomManager.setActiveStory(roomId, storyId);
    broadcastRoomState(roomId);
  });

  socket.on('set_story_points', ({ roomId, storyId, points }) => {
    const meta = socketMeta.get(socket.id);
    const room = roomManager.getRoom(roomId);
    if (!room || !meta?.userId || room.facilitatorId !== meta.userId) return;

    roomManager.setStoryPoints(roomId, storyId, points);
    broadcastRoomState(roomId);
  });

  socket.on('delete_story', ({ roomId, storyId }) => {
    const meta = socketMeta.get(socket.id);
    const room = roomManager.getRoom(roomId);
    if (!room || !meta?.userId || room.facilitatorId !== meta.userId) return;

    roomManager.deleteStory(roomId, storyId);
    broadcastRoomState(roomId);
  });

  // Team Floating Reactions
  socket.on('send_reaction', ({ roomId, emoji }) => {
    const meta = socketMeta.get(socket.id);
    if (!meta || !meta.userId) return;

    const room = roomManager.getRoom(roomId);
    const sender = room?.participants[meta.userId];

    const reaction: ReactionEvent = {
      id: `rx-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      senderId: meta.userId,
      senderName: sender?.name || 'Anonymous',
      emoji,
      timestamp: Date.now()
    };

    io.to(roomId).emit('reaction_received', reaction);
  });

  // Disconnect
  socket.on('disconnect', () => {
    const meta = socketMeta.get(socket.id);
    if (meta && meta.roomId && meta.userId) {
      roomManager.leaveRoom(meta.roomId, meta.userId);
      broadcastRoomState(meta.roomId);
    }
    socketMeta.delete(socket.id);
  });
});

// --- Static client serving in production ---
const clientDistPath = path.resolve(__dirname, '../../client/dist');
if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));
  app.get('*', (req: Request, res: Response) => {
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
}

server.listen(PORT, () => {
  console.log(`🚀 AgilePoint Planning Poker Server running on http://localhost:${PORT}`);
});
