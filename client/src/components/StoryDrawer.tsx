import React, { useState, useEffect } from 'react';
import { usePoker } from '../context/PokerContext';
import { fetchStoryFromUrl, type FetchedStory } from '../services/storyFetcher';
import { 
  X, 
  Download, 
  Copy, 
  Check, 
  Trash2, 
  FileText,
  UploadCloud,
  CheckCircle2,
  DownloadCloud,
  Key,
  Link as LinkIcon,
  Eye,
  EyeOff,
  Loader2,
  AlertCircle
} from 'lucide-react';

const STORY_TOKEN_STORAGE_KEY = 'agilepoint_story_token';

interface StoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const StoryDrawer: React.FC<StoryDrawerProps> = ({ isOpen, onClose }) => {
  const { 
    room, 
    isFacilitator, 
    addStory, 
    importStories, 
    setActiveStory, 
    deleteStory 
  } = usePoker();

  const [activeTab, setActiveTab] = useState<'list' | 'import-url' | 'add' | 'import-bulk'>('list');
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [bulkInput, setBulkInput] = useState('');
  const [copiedSummary, setCopiedSummary] = useState(false);

  // ADO/Jira URL Import states
  const [importUrl, setImportUrl] = useState('');
  const [token, setToken] = useState(() => localStorage.getItem(STORY_TOKEN_STORAGE_KEY) || '');
  const [showToken, setShowToken] = useState(false);
  const [importLoading, setImportLoading] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const [fetchedStory, setFetchedStory] = useState<FetchedStory | null>(null);

  useEffect(() => {
    if (token) {
      localStorage.setItem(STORY_TOKEN_STORAGE_KEY, token);
    }
  }, [token]);

  if (!isOpen || !room) return null;

  const handleAddSingle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    addStory({
      title: newTitle.trim(),
      description: newDesc.trim() || undefined,
      url: newUrl.trim() || undefined
    });

    setNewTitle('');
    setNewDesc('');
    setNewUrl('');
    setActiveTab('list');
  };

  const handleImportBulk = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bulkInput.trim()) return;

    const lines = bulkInput.split('\n').map(l => l.trim()).filter(Boolean);
    const parsedStories = lines.map(line => ({
      title: line,
      description: undefined,
      url: undefined
    }));

    if (parsedStories.length > 0) {
      importStories(parsedStories);
      setBulkInput('');
      setActiveTab('list');
    }
  };

  const handleFetchStory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!importUrl.trim()) return;

    setImportLoading(true);
    setImportError(null);
    setFetchedStory(null);

    try {
      const story = await fetchStoryFromUrl(importUrl.trim(), token.trim());
      setFetchedStory(story);
    } catch (err: any) {
      setImportError(err.message || 'Failed to fetch work item');
    } finally {
      setImportLoading(false);
    }
  };

  const handleAddFetchedStory = (setAsActive = false) => {
    if (!fetchedStory) return;

    addStory({
      title: `${fetchedStory.id ? `[${fetchedStory.id}] ` : ''}${fetchedStory.title}`,
      description: fetchedStory.description,
      url: fetchedStory.url
    });

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

    setFetchedStory(null);
    setImportUrl('');
    setActiveTab('list');
  };

  const handleCopyMarkdownSummary = () => {
    const lines = [
      `# Sprint Planning Poker Summary - ${room.name}`,
      `Date: ${new Date().toLocaleDateString()}`,
      '',
      '| Story | Points | Status |',
      '|---|---|---|'
    ];

    for (const s of room.stories) {
      lines.push(`| ${s.title.replace(/\|/g, '-')} | **${s.points || 'Unestimated'}** | ${s.status} |`);
    }

    navigator.clipboard.writeText(lines.join('\n')).then(() => {
      setCopiedSummary(true);
      setTimeout(() => setCopiedSummary(false), 2000);
    });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        onClick={onClose} 
        className="absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity" 
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#0E1326] shadow-2xl flex flex-col border-l border-white/10 text-slate-100 transition-all">
          
          {/* Header */}
          <div className="p-5 border-b border-white/10 flex items-center justify-between">
            <div>
              <h2 className="font-heading font-bold text-lg text-white">
                Sprint Backlog
              </h2>
              <p className="text-xs text-slate-400">
                {room.stories.length} stories in this session
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Tab Navigation */}
          <div className="flex border-b border-white/10 px-4 pt-2 overflow-x-auto scrollbar-none gap-1">
            <button
              onClick={() => setActiveTab('list')}
              className={`pb-2.5 px-3 text-xs font-semibold cursor-pointer border-b-2 transition whitespace-nowrap ${
                activeTab === 'list'
                  ? 'border-violet-500 text-violet-300'
                  : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              Stories ({room.stories.length})
            </button>
            <button
              onClick={() => setActiveTab('import-url')}
              className={`pb-2.5 px-3 text-xs font-semibold cursor-pointer border-b-2 transition whitespace-nowrap flex items-center space-x-1 ${
                activeTab === 'import-url'
                  ? 'border-violet-500 text-violet-300'
                  : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              <DownloadCloud className="w-3.5 h-3.5" />
              <span>Import URL</span>
            </button>
            <button
              onClick={() => setActiveTab('add')}
              className={`pb-2.5 px-3 text-xs font-semibold cursor-pointer border-b-2 transition whitespace-nowrap ${
                activeTab === 'add'
                  ? 'border-violet-500 text-violet-300'
                  : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              + Manual
            </button>
            <button
              onClick={() => setActiveTab('import-bulk')}
              className={`pb-2.5 px-3 text-xs font-semibold cursor-pointer border-b-2 transition whitespace-nowrap ${
                activeTab === 'import-bulk'
                  ? 'border-violet-500 text-violet-300'
                  : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              Bulk CSV
            </button>
          </div>

          {/* Content Body */}
          <div className="flex-1 overflow-y-auto p-5">
            {/* TAB: STORY LIST */}
            {activeTab === 'list' && (
              <div className="space-y-3">
                {room.stories.length === 0 ? (
                  <div className="text-center py-10">
                    <FileText className="w-10 h-10 mx-auto text-slate-600 mb-2" />
                    <p className="text-sm font-medium text-slate-300">
                      No stories in the backlog yet.
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      Import from Azure DevOps/Jira or add manually.
                    </p>
                    <button
                      onClick={() => setActiveTab('import-url')}
                      className="mt-4 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-violet-600 hover:bg-violet-500 transition cursor-pointer"
                    >
                      Import from ADO / Jira
                    </button>
                  </div>
                ) : (
                  room.stories.map((s, idx) => {
                    const isActive = s.id === room.activeStoryId;

                    return (
                      <div
                        key={s.id}
                        className={`p-3.5 rounded-2xl border transition-all ${
                          isActive
                            ? 'bg-violet-950/40 border-violet-500/60 ring-1 ring-violet-500/40 shadow-md'
                            : 'bg-white/5 border-white/10 hover:border-white/20'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2 mb-1">
                              <span className="text-[11px] font-mono text-slate-400">
                                #{idx + 1}
                              </span>
                              {s.points ? (
                                <span className="inline-flex items-center text-[10px] font-bold text-emerald-300 bg-emerald-500/20 px-2 py-0.5 rounded border border-emerald-500/30">
                                  <CheckCircle2 className="w-2.5 h-2.5 mr-1" />
                                  {s.points} pts
                                </span>
                              ) : (
                                <span className="text-[10px] font-medium text-amber-300 bg-amber-500/20 px-2 py-0.5 rounded border border-amber-500/30">
                                  Pending
                                </span>
                              )}
                              {isActive && (
                                <span className="text-[10px] font-bold text-violet-300 bg-violet-500/20 px-2 py-0.5 rounded border border-violet-500/30">
                                  Pointing
                                </span>
                              )}
                            </div>

                            <h4 className="font-heading font-semibold text-sm text-white leading-snug">
                              {s.title}
                            </h4>

                            {s.description && (
                              <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                                {s.description}
                              </p>
                            )}
                          </div>

                          <div className="flex items-center space-x-1 shrink-0">
                            {!isActive && (
                              <button
                                onClick={() => setActiveStory(s.id)}
                                className="px-2.5 py-1 rounded-lg text-xs font-semibold text-violet-300 hover:bg-violet-600/20 transition cursor-pointer"
                                title="Vote on this story"
                              >
                                Point
                              </button>
                            )}
                            {isFacilitator && (
                              <button
                                onClick={() => deleteStory(s.id)}
                                className="p-1 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/20 transition cursor-pointer"
                                title="Delete story"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}

            {/* TAB: IMPORT FROM URL (ADO/JIRA) */}
            {activeTab === 'import-url' && (
              <div className="space-y-4">
                <form onSubmit={handleFetchStory} className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      ADO / Jira Issue URL
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                        <LinkIcon className="w-4 h-4" />
                      </div>
                      <input
                        type="url"
                        value={importUrl}
                        onChange={e => setImportUrl(e.target.value)}
                        placeholder="https://dev.azure.com/... or https://domain.atlassian.net/browse/..."
                        required
                        className="w-full pl-9 pr-3 py-2.5 rounded-xl text-xs bg-white/5 border border-white/10 focus:border-violet-500 focus:outline-none text-white placeholder-slate-500"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-semibold text-slate-300">
                        PAT / API Token
                      </label>
                      <span className="text-[10px] text-slate-400">Stored in browser</span>
                    </div>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                        <Key className="w-4 h-4" />
                      </div>
                      <input
                        type={showToken ? 'text' : 'password'}
                        value={token}
                        onChange={e => setToken(e.target.value)}
                        placeholder="ADO: PAT | Jira: email:api_token"
                        className="w-full pl-9 pr-9 py-2.5 rounded-xl text-xs bg-white/5 border border-white/10 focus:border-violet-500 focus:outline-none text-white placeholder-slate-500 font-mono"
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

                  <button
                    type="submit"
                    disabled={importLoading || !importUrl.trim()}
                    className="w-full py-2.5 rounded-xl text-xs font-bold text-white bg-violet-600 hover:bg-violet-500 transition shadow-md shadow-violet-600/30 cursor-pointer flex items-center justify-center space-x-1.5 disabled:opacity-50"
                  >
                    {importLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Fetching...</span>
                      </>
                    ) : (
                      <>
                        <DownloadCloud className="w-4 h-4" />
                        <span>Fetch Story</span>
                      </>
                    )}
                  </button>
                </form>

                {importError && (
                  <div className="p-3 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs flex items-start space-x-2">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
                    <span>{importError}</span>
                  </div>
                )}

                {fetchedStory && (
                  <div className="p-4 rounded-xl bg-white/[0.06] border border-white/10 space-y-2.5">
                    <div className="flex items-center space-x-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-violet-500/20 text-violet-300 border border-violet-500/30">
                        {fetchedStory.source === 'ado' ? 'ADO' : 'Jira'}
                      </span>
                      <span className="text-xs font-mono font-bold text-cyan-400">
                        #{fetchedStory.id}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {fetchedStory.type}
                      </span>
                    </div>

                    <h4 className="font-heading font-bold text-sm text-white">
                      {fetchedStory.title}
                    </h4>

                    {fetchedStory.description && (
                      <p className="text-xs text-slate-400 line-clamp-3">
                        {fetchedStory.description}
                      </p>
                    )}

                    <div className="pt-2 flex items-center justify-end space-x-2 border-t border-white/10">
                      <button
                        onClick={() => handleAddFetchedStory(false)}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-300 bg-white/10 hover:bg-white/20 transition cursor-pointer"
                      >
                        Add to Backlog
                      </button>
                      <button
                        onClick={() => handleAddFetchedStory(true)}
                        className="px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 transition shadow-sm cursor-pointer"
                      >
                        Point Now
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB: MANUAL ADD */}
            {activeTab === 'add' && (
              <form onSubmit={handleAddSingle} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Story Title or Ticket Key *
                  </label>
                  <input
                    type="text"
                    value={newTitle}
                    onChange={e => setNewTitle(e.target.value)}
                    placeholder="e.g. AUTH-42: Implement GitHub OAuth login"
                    required
                    className="w-full px-3 py-2 rounded-xl text-xs sm:text-sm bg-white/5 border border-white/10 focus:outline-none focus:border-violet-500 text-white placeholder-slate-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Description / Acceptance Criteria (Optional)
                  </label>
                  <textarea
                    value={newDesc}
                    onChange={e => setNewDesc(e.target.value)}
                    rows={4}
                    placeholder="Summary of requirements or scope..."
                    className="w-full px-3 py-2 rounded-xl text-xs sm:text-sm bg-white/5 border border-white/10 focus:outline-none focus:border-violet-500 text-white placeholder-slate-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Issue Tracker URL (Optional)
                  </label>
                  <input
                    type="url"
                    value={newUrl}
                    onChange={e => setNewUrl(e.target.value)}
                    placeholder="https://company.atlassian.net/browse/PROJ-123"
                    className="w-full px-3 py-2 rounded-xl text-xs sm:text-sm bg-white/5 border border-white/10 focus:outline-none focus:border-violet-500 text-white placeholder-slate-500"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl text-xs font-bold text-white bg-violet-600 hover:bg-violet-500 transition shadow-md shadow-violet-600/30 cursor-pointer"
                >
                  Add Story to Backlog
                </button>
              </form>
            )}

            {/* TAB: BULK IMPORT */}
            {activeTab === 'import-bulk' && (
              <form onSubmit={handleImportBulk} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Paste Story Titles (One per line)
                  </label>
                  <p className="text-[11px] text-slate-400 mb-2">
                    Paste issue keys and summaries copied from Jira, Linear, or GitHub issues.
                  </p>
                  <textarea
                    value={bulkInput}
                    onChange={e => setBulkInput(e.target.value)}
                    rows={8}
                    placeholder={`PROJ-101: Setup Docker containerization\nPROJ-102: Add payment webhook verification\nPROJ-103: Refactor user permissions grid`}
                    required
                    className="w-full font-mono px-3 py-2 rounded-xl text-xs bg-white/5 border border-white/10 focus:outline-none focus:border-violet-500 text-white placeholder-slate-500"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl text-xs font-bold text-white bg-violet-600 hover:bg-violet-500 transition shadow-md shadow-violet-600/30 cursor-pointer inline-flex items-center justify-center space-x-1.5"
                >
                  <UploadCloud className="w-4 h-4" />
                  <span>Import All Lines</span>
                </button>
              </form>
            )}
          </div>

          {/* Footer Actions */}
          <div className="p-4 border-t border-white/10 bg-white/[0.02] flex items-center justify-between gap-2">
            <button
              onClick={handleCopyMarkdownSummary}
              className="flex-1 py-2 px-3 rounded-xl text-xs font-medium text-slate-300 bg-white/5 border border-white/10 hover:bg-white/10 transition cursor-pointer inline-flex items-center justify-center space-x-1.5"
            >
              {copiedSummary ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-300">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-400" />
                  <span>Copy Markdown</span>
                </>
              )}
            </button>

            <a
              href={`/api/rooms/${room.id}/export.csv`}
              download
              className="flex-1 py-2 px-3 rounded-xl text-xs font-medium text-violet-300 bg-violet-600/20 border border-violet-500/30 hover:bg-violet-600/30 transition cursor-pointer inline-flex items-center justify-center space-x-1.5 text-center"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </a>
          </div>

        </div>
      </div>
    </div>
  );
};
