import React, { useState } from 'react';
import { usePoker } from '../context/PokerContext';
import type { DeckType } from '../types/poker';
import { PRESET_DECKS } from '../types/poker';
import { X, Sliders, Check } from 'lucide-react';

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
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity" 
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 z-10 transition-all">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <Sliders className="w-4 h-4" />
            </div>
            <h3 className="font-heading font-bold text-lg text-slate-900 dark:text-white">
              Session & Deck Settings
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="mt-5 space-y-5">
          {/* Deck Type Selection */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
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
                        ? 'border-indigo-600 bg-indigo-50/70 dark:bg-indigo-950/60 ring-2 ring-indigo-500/20'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-800/40'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-heading font-semibold text-xs text-slate-900 dark:text-white">
                        {deckDescriptions[type].label}
                      </span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />}
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                      {deckDescriptions[type].sample}
                    </p>
                  </div>
                );
              })}
            </div>

            {deckType === 'custom' && (
              <div className="mt-3">
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Comma-separated card values
                </label>
                <input
                  type="text"
                  value={customDeckStr}
                  onChange={e => setCustomDeckStr(e.target.value)}
                  placeholder="1, 2, 3, 5, 8, 13, 20, ?"
                  className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
                />
              </div>
            )}
          </div>

          {/* Voting Rules */}
          <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Session Rules
            </label>

            {/* Auto Reveal */}
            <label className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-800 cursor-pointer">
              <div>
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                  Auto-reveal cards
                </span>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Automatically reveal cards as soon as all active estimators have voted.
                </p>
              </div>
              <input
                type="checkbox"
                checked={autoReveal}
                onChange={e => setAutoReveal(e.target.checked)}
                className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
              />
            </label>

            {/* Timer Config */}
            <label className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-800 cursor-pointer">
              <div>
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                  Voting Countdown Timer
                </span>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Display a countdown timer during story pointing.
                </p>
              </div>
              <input
                type="checkbox"
                checked={showTimer}
                onChange={e => setShowTimer(e.target.checked)}
                className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
              />
            </label>

            {showTimer && (
              <div className="flex items-center space-x-3 px-3">
                <span className="text-xs text-slate-600 dark:text-slate-400">Default Duration:</span>
                {[30, 60, 90, 120].map(secs => (
                  <button
                    key={secs}
                    type="button"
                    onClick={() => setTimerDuration(secs)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer transition ${
                      timerDuration === secs
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                    }`}
                  >
                    {secs}s
                  </button>
                ))}
              </div>
            )}

            {/* Allow Revote */}
            <label className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-800 cursor-pointer">
              <div>
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                  Allow changing vote before reveal
                </span>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Estimators can change their pick anytime until cards are revealed.
                </p>
              </div>
              <input
                type="checkbox"
                checked={allowRevote}
                onChange={e => setAllowRevote(e.target.checked)}
                className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
              />
            </label>

            {/* Anonymous Voting */}
            <label className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-800 cursor-pointer">
              <div>
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                  Anonymous estimation
                </span>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Keep player identities hidden until cards are turned face-up.
                </p>
              </div>
              <input
                type="checkbox"
                checked={anonymousVoting}
                onChange={e => setAnonymousVoting(e.target.checked)}
                className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
              />
            </label>
          </div>

          <div className="flex items-center justify-end space-x-2 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition shadow-sm cursor-pointer"
            >
              Apply Settings
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
