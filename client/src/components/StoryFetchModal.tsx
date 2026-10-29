import React, { useState, useEffect } from 'react';
import { usePoker } from '../context/PokerContext';
import { fetchStoryFromUrl, type FetchedStory } from '../services/storyFetcher';
import { 
  X, 
  ExternalLink, 
  Loader2, 
  Check, 
  Eye, 
  EyeOff, 
  AlertCircle 
} from 'lucide-react';

const STORY_TOKEN_STORAGE_KEY = 'agilepoint_story_token';

interface StoryFetchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const StoryFetchModal: React.FC<StoryFetchModalProps> = ({ isOpen, onClose }) => {
  const { addStory, setActiveStory, room } = usePoker();

  const [url, setUrl] = useState('');
  const [token, setToken] = useState(() => localStorage.getItem(STORY_TOKEN_STORAGE_KEY) || '');
  const [showToken, setShowToken] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fetchedStory, setFetchedStory] = useState<FetchedStory | null>(null);
  const [isAdded, setIsAdded] = useState(false);

  useEffect(() => {
    if (token) {
      localStorage.setItem(STORY_TOKEN_STORAGE_KEY, token);
    }
  }, [token]);

  if (!isOpen) return null;

  const handleFetch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;

    setLoading(true);
    setError(null);
    setFetchedStory(null);
    setIsAdded(false);

    try {
      const story = await fetchStoryFromUrl(url.trim(), token.trim());
      setFetchedStory(story);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch work item. Please verify URL and Token.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToBacklog = (setAsActive = false) => {
    if (!fetchedStory) return;

    addStory({
      title: `${fetchedStory.id ? `[${fetchedStory.id}] ` : ''}${fetchedStory.title}`,
      description: fetchedStory.description,
      url: fetchedStory.url
    });

    setIsAdded(true);

    if (setAsActive) {
      setTimeout(() => {
        if (room?.stories) {
          const matching = room.stories.find(s => s.url === fetchedStory.url || s.title.includes(fetchedStory.id));
          if (matching) {
            setActiveStory(matching.id);
          }
        }
      }, 300);
    }

    setTimeout(() => {
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div 
        className="relative w-full max-w-[460px] text-[#E6EDF3] transition-all"
        style={{
          background: '#161B22',
          border: '1px solid #30363D',
          borderRadius: '12px',
          padding: '24px'
        }}
      >
        <div className="flex items-center justify-between pb-3 border-b border-[#30363D]">
          <h3 className="font-semibold text-sm text-[#E6EDF3]">
            Import Work Item
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded text-[#8B949E] hover:text-[#E6EDF3] hover:bg-[#1C2128] cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleFetch} className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-medium text-[#8B949E] mb-1">
              Work Item / Issue URL *
            </label>
            <input
              type="url"
              value={url}
              onChange={e => setUrl(e.target.value)}
              placeholder="https://dev.azure.com/... or https://domain.atlassian.net/browse/..."
              required
              className="w-full text-xs text-[#E6EDF3] placeholder-[#484F58] focus:border-[#6E40C9] focus:outline-none"
              style={{
                background: '#0D1117',
                border: '1px solid #30363D',
                borderRadius: '6px',
                padding: '8px 12px'
              }}
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-medium text-[#8B949E]">
                Personal Access Token (PAT) / API Token
              </label>
              <span className="text-[10px] text-[#484F58]">Stored in browser</span>
            </div>
            <div className="relative">
              <input
                type={showToken ? 'text' : 'password'}
                value={token}
                onChange={e => setToken(e.target.value)}
                placeholder="ADO: PAT | Jira: email:api_token"
                className="w-full text-xs text-[#E6EDF3] placeholder-[#484F58] font-mono pr-8 focus:border-[#6E40C9] focus:outline-none"
                style={{
                  background: '#0D1117',
                  border: '1px solid #30363D',
                  borderRadius: '6px',
                  padding: '8px 12px'
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

          <button
            type="submit"
            disabled={loading || !url.trim()}
            className="w-full text-xs font-medium text-white transition cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50"
            style={{
              background: '#7C3AED',
              borderRadius: '6px',
              padding: '8px 14px',
              border: 'none'
            }}
            onMouseEnter={e => (e.currentTarget.style.background = '#6D28D9')}
            onMouseLeave={e => (e.currentTarget.style.background = '#7C3AED')}
          >
            {loading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Fetching Details...</span>
              </>
            ) : (
              <span>Fetch Work Item</span>
            )}
          </button>
        </form>

        {error && (
          <div 
            className="mt-3 p-2.5 rounded text-xs text-[#F85149] flex items-start gap-2"
            style={{ background: 'rgba(248, 81, 73, 0.1)', border: '1px solid #F85149' }}
          >
            <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {fetchedStory && (
          <div 
            className="mt-4 p-3 rounded-lg space-y-2"
            style={{ background: '#1C2128', border: '1px solid #30363D' }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span 
                  className="px-1.5 py-0.2 rounded text-[10px] font-mono font-medium"
                  style={{ background: '#0D1117', color: '#8B949E', border: '1px solid #30363D' }}
                >
                  #{fetchedStory.id}
                </span>
                <span className="text-[11px] text-[#8B949E]">{fetchedStory.type}</span>
              </div>

              {fetchedStory.url && (
                <a
                  href={fetchedStory.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#8B949E] hover:text-[#E6EDF3] transition"
                  title="Open in new tab"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>

            <h4 className="font-medium text-xs text-[#E6EDF3]">
              {fetchedStory.title}
            </h4>

            {fetchedStory.description && (
              <p className="text-[11px] text-[#8B949E] line-clamp-3 leading-relaxed">
                {fetchedStory.description}
              </p>
            )}

            <div className="pt-2 flex items-center justify-end gap-2 border-t border-[#30363D]">
              <button
                type="button"
                onClick={() => handleAddToBacklog(false)}
                disabled={isAdded}
                className="px-2.5 py-1 text-xs text-[#E6EDF3] rounded transition cursor-pointer"
                style={{ background: '#0D1117', border: '1px solid #30363D' }}
              >
                {isAdded ? 'Added!' : 'Add to Backlog'}
              </button>

              <button
                type="button"
                onClick={() => handleAddToBacklog(true)}
                disabled={isAdded}
                className="px-2.5 py-1 text-xs text-white rounded transition cursor-pointer flex items-center gap-1"
                style={{ background: '#7C3AED', border: 'none' }}
              >
                <Check className="w-3.5 h-3.5" />
                <span>Point Now</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
