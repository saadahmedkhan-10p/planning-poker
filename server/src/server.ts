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

// Helper functions for ADO and Jira story fetch
function parseAdoUrl(rawUrl: string): { org: string; project: string; id: string } | null {
  try {
    const u = new URL(rawUrl);
    if (u.hostname === 'dev.azure.com') {
      const parts = u.pathname.split('/').filter(Boolean);
      if (parts.length >= 4) {
        const org = parts[0];
        const project = parts[1];
        const id = parts[parts.length - 1];
        if (/^\d+$/.test(id)) {
          return { org, project, id };
        }
      }
    } else if (u.hostname.endsWith('.visualstudio.com')) {
      const org = u.hostname.split('.')[0];
      const parts = u.pathname.split('/').filter(Boolean);
      const id = parts[parts.length - 1];
      const project = parts.find(p => p !== 'DefaultCollection' && p !== '_workitems' && p !== 'edit') || '';
      if (/^\d+$/.test(id) && project) {
        return { org, project, id };
      }
    }
  } catch {
    return null;
  }
  return null;
}

function parseJiraUrl(rawUrl: string): { domain: string; issueKey: string } | null {
  try {
    const u = new URL(rawUrl);
    const browseMatch = u.pathname.match(/\/browse\/([A-Za-z0-9]+-\d+)/i);
    if (browseMatch) {
      return { domain: u.hostname, issueKey: browseMatch[1].toUpperCase() };
    }
    const selectedIssue = u.searchParams.get('selectedIssue');
    if (selectedIssue && /^[A-Za-z0-9]+-\d+$/i.test(selectedIssue)) {
      return { domain: u.hostname, issueKey: selectedIssue.toUpperCase() };
    }
    const lastPart = u.pathname.split('/').filter(Boolean).pop();
    if (lastPart && /^[A-Za-z0-9]+-\d+$/i.test(lastPart)) {
      return { domain: u.hostname, issueKey: lastPart.toUpperCase() };
    }
  } catch {
    return null;
  }
  return null;
}

function extractTextFromAdf(node: any): string {
  if (!node) return '';
  if (typeof node === 'string') return node;
  if (node.text) return node.text;
  if (Array.isArray(node.content)) {
    return node.content.map(extractTextFromAdf).filter(Boolean).join(' ');
  }
  return '';
}

// REST Proxy Endpoint for Azure DevOps & Jira Stories
app.get('/api/fetch-story', async (req: Request, res: Response) => {
  const url = req.query.url as string;
  const token = (req.headers['x-story-token'] as string) || '';

  if (!url) {
    res.status(400).json({ error: 'Missing required "url" query parameter' });
    return;
  }

  try {
    const adoInfo = parseAdoUrl(url);
    if (adoInfo) {
      const { org, project, id } = adoInfo;
      const apiUrl = `https://dev.azure.com/${encodeURIComponent(org)}/${encodeURIComponent(project)}/_apis/wit/workitems/${encodeURIComponent(id)}?api-version=7.0`;
      
      const headers: Record<string, string> = {
        'Accept': 'application/json'
      };
      if (token) {
        headers['Authorization'] = `Basic ${Buffer.from(':' + token.trim()).toString('base64')}`;
      }

      const response = await fetch(apiUrl, { headers });
      if (!response.ok) {
        const errText = await response.text();
        res.status(response.status).json({
          error: `Azure DevOps API returned status ${response.status}: ${errText.substring(0, 200)}`
        });
        return;
      }

      const data = await response.json() as any;
      const fields = data.fields || {};
      const title = fields['System.Title'] || `Work Item #${id}`;
      let description = fields['System.Description'] || '';
      // Strip HTML tags for clean text preview
      description = description.replace(/<[^>]*>?/gm, ' ').replace(/\s+/g, ' ').trim();
      const type = fields['System.WorkItemType'] || 'User Story';

      res.json({
        id: String(data.id || id),
        title,
        description,
        type,
        url,
        source: 'ado'
      });
      return;
    }

    const jiraInfo = parseJiraUrl(url);
    if (jiraInfo) {
      const { domain, issueKey } = jiraInfo;
      const apiUrl = `https://${domain}/rest/api/3/issue/${encodeURIComponent(issueKey)}`;
      
      const headers: Record<string, string> = {
        'Accept': 'application/json'
      };
      if (token) {
        // Jira requires basic auth with email:api_token base64 encoded
        const authString = token.includes(':') ? token.trim() : `:${token.trim()}`;
        headers['Authorization'] = `Basic ${Buffer.from(authString).toString('base64')}`;
      }

      const response = await fetch(apiUrl, { headers });
      if (!response.ok) {
        const errText = await response.text();
        res.status(response.status).json({
          error: `Jira API returned status ${response.status}: ${errText.substring(0, 200)}`
        });
        return;
      }

      const data = await response.json() as any;
      const fields = data.fields || {};
      const title = fields.summary || issueKey;
      const type = fields.issuetype?.name || 'Story';
      const description = fields.description ? extractTextFromAdf(fields.description) : '';

      res.json({
        id: issueKey,
        title,
        description,
        type,
        url,
        source: 'jira'
      });
      return;
    }

    res.status(400).json({
      error: 'Unrecognized URL. Please provide an Azure DevOps work item URL or Jira Cloud issue URL.'
    });
  } catch (err: any) {
    res.status(500).json({ error: `Failed to fetch story: ${err.message || 'Unknown server error'}` });
  }
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

  // WebRTC Signaling Relay
  socket.on('webrtc_offer', ({ targetUserId, offer }) => {
    const myMeta = socketMeta.get(socket.id);
    if (!myMeta?.userId || !myMeta?.roomId) return;

    for (const [sid, meta] of socketMeta) {
      if (meta.userId === targetUserId && meta.roomId === myMeta.roomId) {
        io.to(sid).emit('webrtc_offer', { fromUserId: myMeta.userId, offer });
        break;
      }
    }
  });

  socket.on('webrtc_answer', ({ targetUserId, answer }) => {
    const myMeta = socketMeta.get(socket.id);
    if (!myMeta?.userId || !myMeta?.roomId) return;

    for (const [sid, meta] of socketMeta) {
      if (meta.userId === targetUserId && meta.roomId === myMeta.roomId) {
        io.to(sid).emit('webrtc_answer', { fromUserId: myMeta.userId, answer });
        break;
      }
    }
  });

  const handleIceRelay = ({ targetUserId, candidate }: { targetUserId: string; candidate: any }) => {
    const myMeta = socketMeta.get(socket.id);
    if (!myMeta?.userId || !myMeta?.roomId) return;

    for (const [sid, meta] of socketMeta) {
      if (meta.userId === targetUserId && meta.roomId === myMeta.roomId) {
        io.to(sid).emit('webrtc_ice', { fromUserId: myMeta.userId, candidate });
        io.to(sid).emit('webrtc_ice_candidate', { fromUserId: myMeta.userId, candidate });
        break;
      }
    }
  };
  socket.on('webrtc_ice', handleIceRelay);
  socket.on('webrtc_ice_candidate', handleIceRelay);

  // Team Floating Reactions
  socket.on('send_reaction', ({ roomId, emoji, x, y }) => {
    const meta = socketMeta.get(socket.id);
    if (!meta || !meta.userId) return;

    const room = roomManager.getRoom(roomId);
    const sender = room?.participants[meta.userId];

    const reaction: ReactionEvent = {
      id: `rx-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      senderId: meta.userId,
      senderName: sender?.name || 'Anonymous',
      emoji,
      timestamp: Date.now(),
      x,
      y
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
