import React, { useState, useEffect } from 'react';
import { usePoker } from '../context/PokerContext';
import { fetchStoryFromUrl, type FetchedStory } from '../services/storyFetcher';
import { 
  X, 
  ExternalLink, 
  Loader2, 
  DownloadCloud, 
  Check, 
  Key, 
  Link as LinkIcon, 
  Eye, 
  EyeOff, 
  FileText,
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
      // Find newly added story or timeout slightly to activate
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
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
      {/* Dark frosted backdrop */}
      <div 
        onClick={onClose} 
        className="fixed inset-0 bg-black/70 backdrop-blur-md transition-opacity" 
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-lg glass-card rounded-2xl p-6 sm:p-7 z-10 transition-all border border-white/10 text-slate-100 shadow-2xl">
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-violet-600/30 border border-violet-500/40 flex items-center justify-center text-violet-400">
              <DownloadCloud className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-heading font-bold text-lg text-white">
                Import from Azure DevOps / Jira
              </h3>
              <p className="text-xs text-slate-400">
                Directly import work item details into your planning session
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleFetch} className="mt-5 space-y-4">
          {/* Work Item URL */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Work Item / Issue URL *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                <LinkIcon className="w-4 h-4" />
              </div>
              <input
                type="url"
                value={url}
                onChange={e => setUrl(e.target.value)}
                placeholder="https://dev.azure.com/org/proj/_workitems/edit/123 or https://company.atlassian.net/browse/PROJ-42"
                required
                className="w-full pl-9 pr-3 py-2.5 rounded-xl text-xs sm:text-sm bg-white/5 border border-white/10 focus:border-violet-500 focus:outline-none text-white placeholder-slate-500"
              />
            </div>
          </div>

          {/* PAT / API Token */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-slate-300">
                Personal Access Token (PAT) / API Token
              </label>
              <span className="text-[10px] text-slate-500">Stored only in your browser</span>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                <Key className="w-4 h-4" />
              </div>
              <input
                type={showToken ? 'text' : 'password'}
                value={token}
                onChange={e => setToken(e.target.value)}
                placeholder="Azure DevOps: PAT | Jira: email:api_token"
                className="w-full pl-9 pr-10 py-2.5 rounded-xl text-xs sm:text-sm bg-white/5 border border-white/10 focus:border-violet-500 focus:outline-none text-white placeholder-slate-500 font-mono"
              />
              <button
                type="button"
                onClick={() => setShowToken(!showToken)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-white cursor-pointer"
              >
                {showToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              For Azure DevOps, create a PAT with Work Items (Read) scope. For Jira Cloud, use <code>email:token</code> format.
            </p>
          </div>

          {/* Fetch Button */}
          <button
            type="submit"
            disabled={loading || !url.trim()}
            className="w-full py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-violet-600 to-violet-700 hover:from-violet-500 hover:to-violet-600 transition shadow-lg shadow-violet-600/30 cursor-pointer flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Fetching Story Details...</span>
              </>
            ) : (
              <>
                <DownloadCloud className="w-4 h-4" />
                <span>Fetch Work Item</span>
              </>
            )}
          </button>
        </form>

        {/* Error Display */}
        {error && (
          <div className="mt-4 p-3 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs flex items-start space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        {/* Story Preview Card */}
        {fetchedStory && (
          <div className="mt-5 p-4 rounded-xl bg-white/[0.06] border border-white/10 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-violet-600/30 text-violet-300 border border-violet-500/30">
                  {fetchedStory.source === 'ado' ? 'Azure DevOps' : 'Jira Cloud'}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-white/10 text-slate-300">
                  {fetchedStory.type}
                </span>
                <span className="text-xs font-mono font-bold text-cyan-400">
                  #{fetchedStory.id}
                </span>
              </div>

              {fetchedStory.url && (
                <a
                  href={fetchedStory.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-400 hover:text-white transition"
                  title="Open in new tab"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              )}
            </div>

            <h4 className="font-heading font-bold text-sm text-white">
              {fetchedStory.title}
            </h4>

            {fetchedStory.description ? (
              <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed">
                {fetchedStory.description}
              </p>
            ) : (
              <p className="text-xs text-slate-500 italic">No description provided.</p>
            )}

            {/* Actions for fetched story */}
            <div className="pt-2 flex items-center justify-end space-x-2 border-t border-white/10">
              <button
                type="button"
                onClick={() => handleAddToBacklog(false)}
                disabled={isAdded}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-300 bg-white/10 hover:bg-white/20 transition cursor-pointer flex items-center space-x-1"
              >
                {isAdded ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <FileText className="w-3.5 h-3.5" />}
                <span>{isAdded ? 'Added!' : 'Add to Backlog'}</span>
              </button>

              <button
                type="button"
                onClick={() => handleAddToBacklog(true)}
                disabled={isAdded}
                className="px-3.5 py-1.5 rounded-lg text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 transition shadow-md shadow-emerald-600/30 cursor-pointer flex items-center space-x-1"
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
