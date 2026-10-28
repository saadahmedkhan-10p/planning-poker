import React, { useState, useEffect } from 'react';
import { usePoker } from '../context/PokerContext';
import type { DeckType } from '../types/poker';
import { PRESET_DECKS } from '../types/poker';
import { X, Sliders, Check, Key, Eye, EyeOff } from 'lucide-react';

const STORY_TOKEN_STORAGE_KEY = 'agilepoint_story_token';

interface RoomSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RoomSettingsModal: React.FC<RoomSettingsModalProps> = ({ isOpen, onClose }) => {
  const { room, updateSettings } = usePoker();

  if (!isOpen || !room) return null;

  const [deckType, setDeckType] = useState<DeckType>(room.settings.deckType);
  const [customDeckStr, setCustomDeckStr] = useState(room.settings.customDeck.join(', '));
  const [autoReveal, setAutoReveal] = useState(room.settings.autoReveal);
  const [showTimer, setShowTimer] = useState(room.settings.showTimer);
  const [timerDuration, setTimerDuration] = useState(room.settings.timerDuration);
  const [allowRevote, setAllowRevote] = useState(room.settings.allowRevote);
  const [anonymousVoting, setAnonymousVoting] = useState(room.settings.anonymousVoting);

  // Story token configuration
  const [storyToken, setStoryToken] = useState(() => localStorage.getItem(STORY_TOKEN_STORAGE_KEY) || '');
  const [showToken, setShowToken] = useState(false);

  useEffect(() => {
    if (storyToken) {
      localStorage.setItem(STORY_TOKEN_STORAGE_KEY, storyToken);
    }
  }, [storyToken]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    const parsedCustom = customDeckStr
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);

    updateSettings({
      deckType,
      customDeck: parsedCustom.length > 0 ? parsedCustom : ['1', '2', '3', '5', '8', '?'],
      autoReveal,
      showTimer,
      timerDuration,
      allowRevote,
      anonymousVoting
    });

    onClose();
  };

  const deckDescriptions: Record<DeckType, { label: string; sample: string }> = {
    fibonacci: {
      label: 'Standard Fibonacci',
      sample: PRESET_DECKS.fibonacci.join(', ')
    },
    modified_fibonacci: {
      label: 'Modified Fibonacci (Scrum)',
      sample: PRESET_DECKS.modified_fibonacci.join(', ')
    },
    tshirt: {
      label: 'T-Shirt Sizes',
      sample: PRESET_DECKS.tshirt.join(', ')
    },
    powers_of_two: {
      label: 'Powers of 2',
      sample: PRESET_DECKS.powers_of_two.join(', ')
    },
    risk: {
      label: 'Risk & Complexity',
      sample: PRESET_DECKS.risk.join(', ')
    },
    custom: {
      label: 'Custom Deck Hand',
      sample: 'User-defined values'
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        onClick={onClose} 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity" 
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-lg glass-card rounded-2xl shadow-2xl border border-white/10 p-6 z-10 transition-all text-slate-100 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center text-violet-400">
              <Sliders className="w-4 h-4" />
            </div>
            <h3 className="font-heading font-bold text-lg text-white">
              Session & Deck Settings
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="mt-5 space-y-5">
          {/* Deck Type Selection */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Card Estimation Scale
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {(Object.keys(deckDescriptions) as DeckType[]).map(type => {
                const isSelected = deckType === type;
                return (
                  <div
                    key={type}
                    onClick={() => setDeckType(type)}
                    className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                      isSelected
                        ? 'border-violet-500 bg-violet-600/20 ring-1 ring-violet-500/50'
                        : 'border-white/10 bg-white/[0.02] hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-heading font-semibold text-xs text-white">
                        {deckDescriptions[type].label}
                      </span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-violet-400" />}
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5 truncate">
                      {deckDescriptions[type].sample}
                    </p>
                  </div>
                );
              })}
            </div>

            {deckType === 'custom' && (
              <div className="mt-3">
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Comma-separated card values
                </label>
                <input
                  type="text"
                  value={customDeckStr}
                  onChange={e => setCustomDeckStr(e.target.value)}
                  placeholder="1, 2, 3, 5, 8, 13, 20, ?"
                  className="w-full px-3 py-2 rounded-xl text-xs bg-white/5 border border-white/10 focus:outline-none focus:border-violet-500 text-white"
                />
              </div>
            )}
          </div>

          {/* Voting Rules */}
          <div className="space-y-3 pt-3 border-t border-white/10">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
              Session Rules
            </label>

            {/* Auto Reveal */}
            <label className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/10 cursor-pointer">
              <div>
                <span className="text-xs font-semibold text-white">
                  Auto-reveal cards
                </span>
                <p className="text-[11px] text-slate-400">
                  Automatically reveal cards once all active estimators have voted.
                </p>
              </div>
              <input
                type="checkbox"
                checked={autoReveal}
                onChange={e => setAutoReveal(e.target.checked)}
                className="w-4 h-4 text-violet-600 rounded focus:ring-violet-500 cursor-pointer"
              />
            </label>

            {/* Timer Config */}
            <label className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/10 cursor-pointer">
              <div>
                <span className="text-xs font-semibold text-white">
                  Voting Countdown Timer
                </span>
                <p className="text-[11px] text-slate-400">
                  Display a countdown timer during pointing.
                </p>
              </div>
              <input
                type="checkbox"
                checked={showTimer}
                onChange={e => setShowTimer(e.target.checked)}
                className="w-4 h-4 text-violet-600 rounded focus:ring-violet-500 cursor-pointer"
              />
            </label>

            {showTimer && (
              <div className="flex items-center space-x-3 px-3">
                <span className="text-xs text-slate-400">Duration:</span>
                {[30, 60, 90, 120].map(secs => (
                  <button
                    key={secs}
                    type="button"
                    onClick={() => setTimerDuration(secs)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer transition ${
                      timerDuration === secs
                        ? 'bg-violet-600 text-white'
                        : 'bg-white/10 text-slate-300 hover:bg-white/20'
                    }`}
                  >
                    {secs}s
                  </button>
                ))}
              </div>
            )}

            {/* Allow Revote */}
            <label className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/10 cursor-pointer">
              <div>
                <span className="text-xs font-semibold text-white">
                  Allow vote changes before reveal
                </span>
                <p className="text-[11px] text-slate-400">
                  Estimators can modify their vote at any time before cards turn face-up.
                </p>
              </div>
              <input
                type="checkbox"
                checked={allowRevote}
                onChange={e => setAllowRevote(e.target.checked)}
                className="w-4 h-4 text-violet-600 rounded focus:ring-violet-500 cursor-pointer"
              />
            </label>

            {/* Anonymous Voting */}
            <label className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/10 cursor-pointer">
              <div>
                <span className="text-xs font-semibold text-white">
                  Anonymous estimation
                </span>
                <p className="text-[11px] text-slate-400">
                  Hide player identities on vote slots until reveal.
                </p>
              </div>
              <input
                type="checkbox"
                checked={anonymousVoting}
                onChange={e => setAnonymousVoting(e.target.checked)}
                className="w-4 h-4 text-violet-600 rounded focus:ring-violet-500 cursor-pointer"
              />
            </label>
          </div>

          {/* ADO & Jira Default Token Setting */}
          <div className="space-y-2 pt-3 border-t border-white/10">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
              Azure DevOps / Jira Token
            </label>
            <p className="text-[11px] text-slate-400">
              Saved in your browser localStorage only. Used for fetching story titles and descriptions.
            </p>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                <Key className="w-4 h-4" />
              </div>
              <input
                type={showToken ? 'text' : 'password'}
                value={storyToken}
                onChange={e => setStoryToken(e.target.value)}
                placeholder="ADO: PAT token | Jira: email:api_token"
                className="w-full pl-9 pr-9 py-2 rounded-xl text-xs bg-white/5 border border-white/10 focus:outline-none focus:border-violet-500 text-white font-mono"
              />
              <button
                type="button"
                onClick={() => setShowToken(!showToken)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-white cursor-pointer"
              >
                {showToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Footer buttons */}
          <div className="flex items-center justify-end space-x-2 pt-4 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-violet-600 hover:bg-violet-500 transition shadow-lg shadow-violet-600/30 cursor-pointer"
            >
              Apply Settings
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
