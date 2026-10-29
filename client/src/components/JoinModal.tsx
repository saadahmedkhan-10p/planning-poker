import React, { useState } from 'react';
import { usePoker } from '../context/PokerContext';
import type { ParticipantRole } from '../types/poker';
import { 
  Sparkles, 
  Users, 
  Check, 
  ArrowRight, 
  PlusCircle, 
  LogIn, 
  Eye
} from 'lucide-react';

const AVATAR_COLORS = [
  '#7C3AED', '#6D28D9', '#06B6D4', '#059669', 
  '#10B981', '#F59E0B', '#EC4899', '#8B5CF6'
];

interface JoinModalProps {
  initialRoomId?: string | null;
  onSelectRoom: (roomId: string) => void;
}

export const JoinModal: React.FC<JoinModalProps> = ({ initialRoomId, onSelectRoom }) => {
  const { currentUser, joinRoom } = usePoker();

  // Lock to 'join' mode when an invite link room ID is present
  const isInviteLink = Boolean(initialRoomId);
  const [mode, setMode] = useState<'create' | 'join'>(isInviteLink ? 'join' : 'create');
  const [roomIdInput, setRoomIdInput] = useState(initialRoomId || '');
  const [roomNameInput, setRoomNameInput] = useState('Sprint Planning');
  const [displayName, setDisplayName] = useState(currentUser?.name || '');
  const [role, setRole] = useState<ParticipantRole>('estimator');
  const [avatarColor, setAvatarColor] = useState(currentUser?.avatarColor || AVATAR_COLORS[0]);

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    const targetRoomId = (mode === 'create' 
      ? roomNameInput.toLowerCase().replace(/[^a-z0-9]/g, '-') + '-' + Math.floor(100 + Math.random() * 900) 
      : roomIdInput
    ).trim();
    if (!targetRoomId) return;

    joinRoom(
      targetRoomId,
      displayName || 'Anonymous Developer',
      role,
      avatarColor
    );
    onSelectRoom(targetRoomId);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-md glass rounded-2xl shadow-2xl p-6 sm:p-8 transition-all border border-white/10 text-slate-100">
        
        {/* Header Branding with Violet Gradient */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-violet-600 to-indigo-600 mx-auto flex items-center justify-center text-white shadow-lg shadow-violet-600/30 mb-3 border border-violet-400/30">
            <Sparkles className="w-6 h-6" />
          </div>
          <h2 className="font-heading font-extrabold text-2xl tracking-tight bg-gradient-to-r from-violet-400 via-purple-300 to-cyan-400 bg-clip-text text-transparent">
            AgilePoint
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {isInviteLink
              ? "You've been invited! Enter your name to join the session."
              : 'Real-time planning poker with WebRTC camera pods and ADO/Jira sync.'}
          </p>
        </div>

        {/* Mode Toggle (Create vs Join) — hidden when arriving via invite link */}
        {!isInviteLink && (
          <div className="flex rounded-xl bg-white/5 border border-white/10 p-1 mb-6">
            <button
              type="button"
              onClick={() => setMode('create')}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition cursor-pointer flex items-center justify-center space-x-1.5 ${
                mode === 'create'
                  ? 'bg-violet-600 text-white shadow-md shadow-violet-600/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>New Session</span>
            </button>
            <button
              type="button"
              onClick={() => setMode('join')}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition cursor-pointer flex items-center justify-center space-x-1.5 ${
                mode === 'join'
                  ? 'bg-violet-600 text-white shadow-md shadow-violet-600/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Join Room</span>
            </button>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleJoin} className="space-y-4">
          {/* Room Name or Room Code */}
          {mode === 'create' ? (
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Session / Sprint Name
              </label>
              <input
                type="text"
                value={roomNameInput}
                onChange={e => setRoomNameInput(e.target.value)}
                placeholder="e.g. Sprint 42 Pointing"
                required
                className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:border-violet-500 focus:outline-none transition"
              />
            </div>
          ) : (
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Room Code / ID
              </label>
              {isInviteLink ? (
                /* Locked — room ID comes from invite link */
                <div className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-violet-600/10 border border-violet-500/30 text-violet-300 font-mono flex items-center justify-between">
                  <span className="truncate">{roomIdInput}</span>
                  <span className="text-[10px] text-violet-400 ml-2 shrink-0 font-sans">Invite link ✓</span>
                </div>
              ) : (
                <input
                  type="text"
                  value={roomIdInput}
                  onChange={e => setRoomIdInput(e.target.value)}
                  placeholder="e.g. swift-sprint-104"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:border-violet-500 focus:outline-none font-mono transition"
                />
              )}
            </div>
          )}

          {/* User Display Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Your Name / Handle *
            </label>
            <input
              type="text"
              value={displayName}
              onChange={e => setDisplayName(e.target.value)}
              placeholder="e.g. Alex Morgan"
              required
              className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:border-violet-500 focus:outline-none transition"
            />
          </div>

          {/* Role Toggle Pill Switcher */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Your Role in Room
            </label>
            <div className="grid grid-cols-2 gap-2">
              <div
                onClick={() => setRole('estimator')}
                className={`p-3 rounded-xl border text-center cursor-pointer transition-all ${
                  role === 'estimator'
                    ? 'border-violet-500 bg-violet-600/20 ring-1 ring-violet-500/50 text-white'
                    : 'border-white/10 bg-white/[0.02] hover:border-white/20 text-slate-400'
                }`}
              >
                <Users className={`w-4 h-4 mx-auto mb-1 ${role === 'estimator' ? 'text-violet-400' : 'text-slate-500'}`} />
                <span className="font-heading font-bold text-xs block">Estimator</span>
                <span className="text-[10px] text-slate-400">Votes on points</span>
              </div>

              <div
                onClick={() => setRole('observer')}
                className={`p-3 rounded-xl border text-center cursor-pointer transition-all ${
                  role === 'observer'
                    ? 'border-violet-500 bg-violet-600/20 ring-1 ring-violet-500/50 text-white'
                    : 'border-white/10 bg-white/[0.02] hover:border-white/20 text-slate-400'
                }`}
              >
                <Eye className={`w-4 h-4 mx-auto mb-1 ${role === 'observer' ? 'text-violet-400' : 'text-slate-500'}`} />
                <span className="font-heading font-bold text-xs block">Observer</span>
                <span className="text-[10px] text-slate-400">Spectates only</span>
              </div>
            </div>
          </div>

          {/* Avatar Color Swatches */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Avatar Color
            </label>
            <div className="flex items-center justify-between gap-1.5">
              {AVATAR_COLORS.map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setAvatarColor(c)}
                  className="w-8 h-8 rounded-full flex items-center justify-center transition-transform hover:scale-110 cursor-pointer shadow-sm relative"
                  style={{ backgroundColor: c }}
                >
                  {avatarColor === c && (
                    <Check className="w-4 h-4 text-white drop-shadow" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Primary Button */}
          <button
            type="submit"
            className="w-full mt-4 py-3 rounded-xl text-sm font-semibold text-white bg-violet-600 hover:bg-violet-500 transition shadow-lg shadow-violet-600/30 cursor-pointer inline-flex items-center justify-center space-x-2"
          >
            <span>{mode === 'create' ? 'Start Session' : isInviteLink ? 'Join Session' : 'Enter Session'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

      </div>
    </div>
  );
};
