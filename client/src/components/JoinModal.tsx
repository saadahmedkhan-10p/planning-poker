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
  '#4F46E5', '#6366F1', '#06B6D4', '#059669', 
  '#10B981', '#F59E0B', '#EC4899', '#8B5CF6'
];

interface JoinModalProps {
  initialRoomId?: string | null;
  onSelectRoom: (roomId: string) => void;
}

export const JoinModal: React.FC<JoinModalProps> = ({ initialRoomId, onSelectRoom }) => {
  const { currentUser, joinRoom } = usePoker();

  const [mode, setMode] = useState<'create' | 'join'>(initialRoomId ? 'join' : 'create');
  const [roomIdInput, setRoomIdInput] = useState(initialRoomId || '');
  const [roomNameInput, setRoomNameInput] = useState('Sprint Planning');
  const [displayName, setDisplayName] = useState(currentUser?.name || '');
  const [role, setRole] = useState<ParticipantRole>('estimator');
  const [avatarColor, setAvatarColor] = useState(currentUser?.avatarColor || AVATAR_COLORS[0]);

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    const targetRoomId = (mode === 'create' ? roomNameInput.toLowerCase().replace(/[^a-z0-9]/g, '-') + '-' + Math.floor(100 + Math.random() * 900) : roomIdInput).trim();
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
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md">
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 transition-all">
        
        {/* Header Branding */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-indigo-500 mx-auto flex items-center justify-center text-white shadow-lg shadow-indigo-500/30 mb-3">
            <Sparkles className="w-6 h-6" />
          </div>
          <h2 className="font-heading font-extrabold text-2xl text-slate-900 dark:text-white tracking-tight">
            AgilePoint Planning Poker
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Free, real-time estimation for modern agile teams. No subscriptions, no limits.
          </p>
        </div>

        {/* Mode Toggle (Create vs Join) */}
        {!initialRoomId && (
          <div className="flex rounded-xl bg-slate-100 dark:bg-slate-800 p-1 mb-6">
            <button
              type="button"
              onClick={() => setMode('create')}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition cursor-pointer flex items-center justify-center space-x-1.5 ${
                mode === 'create'
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
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
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
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
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Session / Sprint Name
              </label>
              <input
                type="text"
                value={roomNameInput}
                onChange={e => setRoomNameInput(e.target.value)}
                placeholder="e.g. Sprint 42 Pointing"
                required
                className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
              />
            </div>
          ) : (
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Room Code / ID
              </label>
              <input
                type="text"
                value={roomIdInput}
                onChange={e => setRoomIdInput(e.target.value)}
                placeholder="e.g. swift-sprint-104"
                required
                className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white font-mono"
              />
            </div>
          )}

          {/* User Display Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Your Name / Handle *
            </label>
            <input
              type="text"
              value={displayName}
              onChange={e => setDisplayName(e.target.value)}
              placeholder="e.g. Sarah Jenkins"
              required
              className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
            />
          </div>

          {/* Role Picker */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Your Participation Role
            </label>
            <div className="grid grid-cols-2 gap-2">
              <div
                onClick={() => setRole('estimator')}
                className={`p-3 rounded-xl border text-center cursor-pointer transition-all ${
                  role === 'estimator'
                    ? 'border-indigo-600 bg-indigo-50/70 dark:bg-indigo-950/60 ring-2 ring-indigo-500/20 text-indigo-900 dark:text-indigo-200'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 text-slate-600 dark:text-slate-400'
                }`}
              >
                <Users className="w-4 h-4 mx-auto mb-1 text-indigo-500" />
                <span className="font-heading font-bold text-xs block">Estimator</span>
                <span className="text-[10px] text-slate-500">Votes on story points</span>
              </div>

              <div
                onClick={() => setRole('observer')}
                className={`p-3 rounded-xl border text-center cursor-pointer transition-all ${
                  role === 'observer'
                    ? 'border-indigo-600 bg-indigo-50/70 dark:bg-indigo-950/60 ring-2 ring-indigo-500/20 text-indigo-900 dark:text-indigo-200'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 text-slate-600 dark:text-slate-400'
                }`}
              >
                <Eye className="w-4 h-4 mx-auto mb-1 text-indigo-500" />
                <span className="font-heading font-bold text-xs block">Spectator</span>
                <span className="text-[10px] text-slate-500">Observes without voting</span>
              </div>
            </div>
          </div>

          {/* Avatar Color Picker */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Avatar Accent Color
            </label>
            <div className="flex items-center justify-between gap-1.5">
              {AVATAR_COLORS.map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setAvatarColor(c)}
                  className="w-8 h-8 rounded-full flex items-center justify-center transition-transform hover:scale-110 cursor-pointer shadow-xs"
                  style={{ backgroundColor: c }}
                >
                  {avatarColor === c && <Check className="w-4 h-4 text-white" />}
                </button>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full mt-4 py-3 rounded-xl text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition shadow-md shadow-indigo-500/20 cursor-pointer inline-flex items-center justify-center space-x-2"
          >
            <span>{mode === 'create' ? 'Start Session' : 'Enter Session'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

      </div>
    </div>
  );
};
