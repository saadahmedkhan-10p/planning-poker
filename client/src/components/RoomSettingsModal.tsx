import React, { useState, useEffect } from 'react';
import { usePoker } from '../context/PokerContext';
import type { DeckType } from '../types/poker';
import { PRESET_DECKS } from '../types/poker';
import { X, Check, Eye, EyeOff } from 'lucide-react';

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
      label: 'Fibonacci',
      sample: PRESET_DECKS.fibonacci.join(', ')
    },
    modified_fibonacci: {
      label: 'Modified Fibonacci',
      sample: PRESET_DECKS.modified_fibonacci.join(', ')
    },
    tshirt: {
      label: 'T-Shirt',
      sample: PRESET_DECKS.tshirt.join(', ')
    },
    powers_of_two: {
      label: 'Powers of 2',
      sample: PRESET_DECKS.powers_of_two.join(', ')
    },
    risk: {
      label: 'Risk Scale',
      sample: PRESET_DECKS.risk.join(', ')
    },
    custom: {
      label: 'Custom Deck',
      sample: 'Custom values'
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div 
        className="relative w-full max-w-[480px] text-[#E6EDF3] max-h-[90vh] overflow-y-auto transition-all"
        style={{
          background: '#161B22',
          border: '1px solid #30363D',
          borderRadius: '12px',
          padding: '24px'
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#30363D]">
          <h3 className="font-semibold text-sm text-[#E6EDF3]">
            Session Settings
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded text-[#8B949E] hover:text-[#E6EDF3] hover:bg-[#1C2128] cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSave} className="mt-4 space-y-5">
          {/* Deck Type Section */}
          <div>
            <span 
              className="block text-[11px] font-semibold text-[#8B949E] uppercase tracking-wider mb-2"
              style={{ letterSpacing: '0.5px' }}
            >
              Estimation Scale
            </span>
            <div className="grid grid-cols-2 gap-2">
              {(Object.keys(deckDescriptions) as DeckType[]).map(type => {
                const isSelected = deckType === type;
                return (
                  <div
                    key={type}
                    onClick={() => setDeckType(type)}
                    className="p-2.5 rounded cursor-pointer transition text-left"
                    style={{
                      background: isSelected ? 'rgba(124, 58, 237, 0.08)' : '#1C2128',
                      border: isSelected ? '1px solid #7C3AED' : '1px solid #30363D',
                      borderRadius: '6px'
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-xs text-[#E6EDF3]">
                        {deckDescriptions[type].label}
                      </span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-[#7C3AED]" />}
                    </div>
                    <p className="text-[10px] text-[#8B949E] mt-0.5 truncate font-mono">
                      {deckDescriptions[type].sample}
                    </p>
                  </div>
                );
              })}
            </div>

            {deckType === 'custom' && (
              <div className="mt-2.5">
                <label className="block text-xs text-[#8B949E] mb-1">
                  Custom values (comma separated)
                </label>
                <input
                  type="text"
                  value={customDeckStr}
                  onChange={e => setCustomDeckStr(e.target.value)}
                  placeholder="1, 2, 3, 5, 8, ?"
                  className="w-full text-xs text-[#E6EDF3] placeholder-[#484F58] focus:border-[#6E40C9] focus:outline-none"
                  style={{
                    background: '#0D1117',
                    border: '1px solid #30363D',
                    borderRadius: '6px',
                    padding: '8px 10px'
                  }}
                />
              </div>
            )}
          </div>

          {/* Voting Rules Section */}
          <div className="pt-3 border-t border-[#30363D] space-y-3">
            <span 
              className="block text-[11px] font-semibold text-[#8B949E] uppercase tracking-wider"
              style={{ letterSpacing: '0.5px' }}
            >
              Session Rules
            </span>

            {/* Toggle: Auto Reveal */}
            <div className="flex items-center justify-between py-1">
              <div>
                <div className="text-xs font-medium text-[#E6EDF3]">Auto-reveal votes</div>
                <div className="text-[11px] text-[#8B949E]">Reveal cards as soon as all estimators vote</div>
              </div>
              <button
                type="button"
                onClick={() => setAutoReveal(!autoReveal)}
                className="w-9 h-5 rounded-full transition-colors relative cursor-pointer"
                style={{ background: autoReveal ? '#7C3AED' : '#30363D' }}
              >
                <span 
                  className="absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform"
                  style={{ transform: autoReveal ? 'translateX(16px)' : 'translateX(0)' }}
                />
              </button>
            </div>

            {/* Toggle: Show Timer */}
            <div className="flex items-center justify-between py-1">
              <div>
                <div className="text-xs font-medium text-[#E6EDF3]">Countdown timer</div>
                <div className="text-[11px] text-[#8B949E]">Show timer countdown during estimation</div>
              </div>
              <button
                type="button"
                onClick={() => setShowTimer(!showTimer)}
                className="w-9 h-5 rounded-full transition-colors relative cursor-pointer"
                style={{ background: showTimer ? '#7C3AED' : '#30363D' }}
              >
                <span 
                  className="absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform"
                  style={{ transform: showTimer ? 'translateX(16px)' : 'translateX(0)' }}
                />
              </button>
            </div>

            {showTimer && (
              <div className="flex items-center gap-2 pl-1">
                <span className="text-xs text-[#8B949E]">Duration:</span>
                {[30, 60, 90, 120].map(s => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setTimerDuration(s)}
                    className="px-2 py-0.5 text-xs rounded transition cursor-pointer"
                    style={{
                      background: timerDuration === s ? '#7C3AED' : '#1C2128',
                      color: timerDuration === s ? '#FFFFFF' : '#8B949E',
                      border: '1px solid #30363D'
                    }}
                  >
                    {s}s
                  </button>
                ))}
              </div>
            )}

            {/* Toggle: Allow Revote */}
            <div className="flex items-center justify-between py-1">
              <div>
                <div className="text-xs font-medium text-[#E6EDF3]">Allow vote modification</div>
                <div className="text-[11px] text-[#8B949E]">Estimators can change votes before reveal</div>
              </div>
              <button
                type="button"
                onClick={() => setAllowRevote(!allowRevote)}
                className="w-9 h-5 rounded-full transition-colors relative cursor-pointer"
                style={{ background: allowRevote ? '#7C3AED' : '#30363D' }}
              >
                <span 
                  className="absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform"
                  style={{ transform: allowRevote ? 'translateX(16px)' : 'translateX(0)' }}
                />
              </button>
            </div>

            {/* Toggle: Anonymous Voting */}
            <div className="flex items-center justify-between py-1">
              <div>
                <div className="text-xs font-medium text-[#E6EDF3]">Anonymous votes</div>
                <div className="text-[11px] text-[#8B949E]">Hide player names on card slots until reveal</div>
              </div>
              <button
                type="button"
                onClick={() => setAnonymousVoting(!anonymousVoting)}
                className="w-9 h-5 rounded-full transition-colors relative cursor-pointer"
                style={{ background: anonymousVoting ? '#7C3AED' : '#30363D' }}
              >
                <span 
                  className="absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform"
                  style={{ transform: anonymousVoting ? 'translateX(16px)' : 'translateX(0)' }}
                />
              </button>
            </div>
          </div>

          {/* Issue Tracker Token Section */}
          <div className="pt-3 border-t border-[#30363D] space-y-2">
            <span 
              className="block text-[11px] font-semibold text-[#8B949E] uppercase tracking-wider"
              style={{ letterSpacing: '0.5px' }}
            >
              Issue Tracker Integration
            </span>
            <p className="text-[11px] text-[#8B949E]">
              Personal access token for fetching Jira or Azure DevOps work items.
            </p>
            <div className="relative">
              <input
                type={showToken ? 'text' : 'password'}
                value={storyToken}
                onChange={e => setStoryToken(e.target.value)}
                placeholder="Azure DevOps: PAT | Jira: email:api_token"
                className="w-full text-xs text-[#E6EDF3] placeholder-[#484F58] font-mono pr-8 focus:border-[#6E40C9] focus:outline-none"
                style={{
                  background: '#0D1117',
                  border: '1px solid #30363D',
                  borderRadius: '6px',
                  padding: '8px 10px'
                }}
              />
              <button
                type="button"
                onClick={() => setShowToken(!showToken)}
                className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-[#8B949E] hover:text-[#E6EDF3] cursor-pointer"
              >
                {showToken ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* Footer buttons */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#30363D]">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-xs text-[#8B949E] hover:text-[#E6EDF3] transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="text-xs font-medium text-white transition cursor-pointer"
              style={{
                background: '#7C3AED',
                borderRadius: '6px',
                padding: '6px 14px',
                border: 'none'
              }}
              onMouseEnter={e => (e.currentTarget.style.background = '#6D28D9')}
              onMouseLeave={e => (e.currentTarget.style.background = '#7C3AED')}
            >
              Apply Settings
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
