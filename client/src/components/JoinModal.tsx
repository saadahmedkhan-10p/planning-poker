import React, { useState } from 'react';
import { usePoker } from '../context/PokerContext';
import type { ParticipantRole } from '../types/poker';
import { Users, Eye, Check } from 'lucide-react';

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
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div 
        className="relative w-full max-w-[420px] rounded-xl text-[#E6EDF3] transition-all"
        style={{
          background: '#161B22',
          border: '1px solid #30363D',
          borderRadius: '12px',
          padding: '32px'
        }}
      >
        {/* Logo & Header */}
        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-2 mb-1.5">
            <span className="text-[#7C3AED] text-xl font-bold leading-none">♠</span>
            <span className="font-semibold text-xl tracking-tight text-[#E6EDF3]">
              AgilePoint
            </span>
          </div>
          <p className="text-xs text-[#8B949E]">
            {isInviteLink
              ? 'Enter your name to join the session'
              : 'Real-time planning poker for agile engineering teams'}
          </p>
        </div>

        {/* Tab switcher: Create vs Join (hidden if invite link) */}
        {!isInviteLink && (
          <div 
            className="flex rounded-md p-1 mb-5"
            style={{ background: '#1C2128', border: '1px solid #30363D' }}
          >
            <button
              type="button"
              onClick={() => setMode('create')}
              className={`flex-1 py-1.5 text-xs font-medium rounded transition cursor-pointer ${
                mode === 'create'
                  ? 'bg-[#161B22] text-[#E6EDF3] border border-[#30363D]'
                  : 'text-[#8B949E] hover:text-[#E6EDF3]'
              }`}
            >
              New Session
            </button>
            <button
              type="button"
              onClick={() => setMode('join')}
              className={`flex-1 py-1.5 text-xs font-medium rounded transition cursor-pointer ${
                mode === 'join'
                  ? 'bg-[#161B22] text-[#E6EDF3] border border-[#30363D]'
                  : 'text-[#8B949E] hover:text-[#E6EDF3]'
              }`}
            >
              Join Room
            </button>
          </div>
        )}

        {/* Invite link banner */}
        {isInviteLink && (
          <div 
            className="mb-4 px-3 py-2 rounded-md text-xs text-[#8B949E] flex items-center justify-between"
            style={{ background: '#1C2128', border: '1px solid #30363D' }}
          >
            <span>📎 Joining room <strong className="text-[#E6EDF3] font-mono">{roomIdInput}</strong></span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleJoin} className="space-y-4">
          {!isInviteLink && mode === 'create' && (
            <div>
              <label className="block text-xs font-medium text-[#8B949E] mb-1.5">
                Session Name
              </label>
              <input
                type="text"
                value={roomNameInput}
                onChange={e => setRoomNameInput(e.target.value)}
                placeholder="e.g. Sprint 42 Planning"
                required
                className="w-full text-sm placeholder-[#484F58] focus:border-[#6E40C9] focus:outline-none transition"
                style={{
                  background: '#0D1117',
                  border: '1px solid #30363D',
                  borderRadius: '6px',
                  padding: '8px 12px',
                  color: '#E6EDF3'
                }}
              />
            </div>
          )}

          {!isInviteLink && mode === 'join' && (
            <div>
              <label className="block text-xs font-medium text-[#8B949E] mb-1.5">
                Room Code / ID
              </label>
              <input
                type="text"
                value={roomIdInput}
                onChange={e => setRoomIdInput(e.target.value)}
                placeholder="e.g. sprint-42-819"
                required
                className="w-full text-sm font-mono placeholder-[#484F58] focus:border-[#6E40C9] focus:outline-none transition"
                style={{
                  background: '#0D1117',
                  border: '1px solid #30363D',
                  borderRadius: '6px',
                  padding: '8px 12px',
                  color: '#E6EDF3'
                }}
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-[#8B949E] mb-1.5">
              Your Name
            </label>
            <input
              type="text"
              value={displayName}
              onChange={e => setDisplayName(e.target.value)}
              placeholder="e.g. Alex Morgan"
              required
              className="w-full text-sm placeholder-[#484F58] focus:border-[#6E40C9] focus:outline-none transition"
              style={{
                background: '#0D1117',
                border: '1px solid #30363D',
                borderRadius: '6px',
                padding: '8px 12px',
                color: '#E6EDF3'
              }}
            />
          </div>

          {/* Role selector */}
          <div>
            <label className="block text-xs font-medium text-[#8B949E] mb-1.5">
              Role
            </label>
            <div className="grid grid-cols-2 gap-2">
              <div
                onClick={() => setRole('estimator')}
                className="p-3 text-center cursor-pointer transition"
                style={{
                  background: role === 'estimator' ? 'rgba(124, 58, 237, 0.08)' : '#0D1117',
                  border: role === 'estimator' ? '1px solid #7C3AED' : '1px solid #30363D',
                  borderRadius: '8px'
                }}
              >
                <Users className={`w-4 h-4 mx-auto mb-1 ${role === 'estimator' ? 'text-[#7C3AED]' : 'text-[#8B949E]'}`} />
                <span className="font-medium text-xs block text-[#E6EDF3]">Estimator</span>
                <span className="text-[11px] text-[#8B949E]">Votes on points</span>
              </div>

              <div
                onClick={() => setRole('observer')}
                className="p-3 text-center cursor-pointer transition"
                style={{
                  background: role === 'observer' ? 'rgba(124, 58, 237, 0.08)' : '#0D1117',
                  border: role === 'observer' ? '1px solid #7C3AED' : '1px solid #30363D',
                  borderRadius: '8px'
                }}
              >
                <Eye className={`w-4 h-4 mx-auto mb-1 ${role === 'observer' ? 'text-[#7C3AED]' : 'text-[#8B949E]'}`} />
                <span className="font-medium text-xs block text-[#E6EDF3]">Observer</span>
                <span className="text-[11px] text-[#8B949E]">Spectates only</span>
              </div>
            </div>
          </div>

          {/* Avatar color swatches */}
          <div>
            <label className="block text-xs font-medium text-[#8B949E] mb-1.5">
              Avatar Color
            </label>
            <div className="flex items-center justify-between gap-1.5">
              {AVATAR_COLORS.map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setAvatarColor(c)}
                  className="w-[28px] h-[28px] rounded-full flex items-center justify-center transition hover:opacity-90 cursor-pointer"
                  style={{ backgroundColor: c }}
                >
                  {avatarColor === c && (
                    <Check className="w-3.5 h-3.5 text-white" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Submit button */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full text-sm font-medium transition cursor-pointer text-white"
              style={{
                background: '#7C3AED',
                borderRadius: '6px',
                padding: '10px 16px',
                border: 'none'
              }}
              onMouseEnter={e => (e.currentTarget.style.background = '#6D28D9')}
              onMouseLeave={e => (e.currentTarget.style.background = '#7C3AED')}
            >
              {mode === 'create' ? 'Create Session' : 'Join Session'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
