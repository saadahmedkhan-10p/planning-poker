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
      `# Sprint Planning Summary - ${room.name}`,
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
      {/* Dark overlay */}
      <div 
        onClick={onClose} 
        className="absolute inset-0 bg-black/60 transition-opacity" 
      />

      {/* Slide-in drawer panel */}
      <div 
        className="fixed inset-y-0 right-0 flex flex-col z-10 text-[#E6EDF3]"
        style={{
          width: '380px',
          maxWidth: '100vw',
          background: '#161B22',
          borderLeft: '1px solid #30363D',
          height: '100vh'
        }}
      >
        {/* Header */}
        <div 
          className="flex items-center justify-between"
          style={{
            borderBottom: '1px solid #30363D',
            padding: '14px 16px'
          }}
        >
          <div>
            <h2 className="font-semibold text-sm text-[#E6EDF3]">
              Sprint Backlog
            </h2>
            <p className="text-xs text-[#8B949E]">
              {room.stories.length} stories in session
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-[#8B949E] hover:text-[#E6EDF3] hover:bg-[#1C2128] cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab strip */}
        <div 
          className="flex px-3 pt-2 gap-2 overflow-x-auto"
          style={{ borderBottom: '1px solid #30363D' }}
        >
          <button
            onClick={() => setActiveTab('list')}
            className={`pb-2 px-2 text-xs font-medium cursor-pointer transition whitespace-nowrap ${
              activeTab === 'list'
                ? 'border-b-2 border-[#7C3AED] text-[#E6EDF3]'
                : 'text-[#8B949E] hover:text-[#E6EDF3]'
            }`}
          >
            Stories ({room.stories.length})
          </button>
          <button
            onClick={() => setActiveTab('import-url')}
            className={`pb-2 px-2 text-xs font-medium cursor-pointer transition whitespace-nowrap flex items-center gap-1 ${
              activeTab === 'import-url'
                ? 'border-b-2 border-[#7C3AED] text-[#E6EDF3]'
                : 'text-[#8B949E] hover:text-[#E6EDF3]'
            }`}
          >
            <LinkIcon className="w-3 h-3" />
            <span>Import URL</span>
          </button>
          <button
            onClick={() => setActiveTab('add')}
            className={`pb-2 px-2 text-xs font-medium cursor-pointer transition whitespace-nowrap ${
              activeTab === 'add'
                ? 'border-b-2 border-[#7C3AED] text-[#E6EDF3]'
                : 'text-[#8B949E] hover:text-[#E6EDF3]'
            }`}
          >
            + Add
          </button>
          <button
            onClick={() => setActiveTab('import-bulk')}
            className={`pb-2 px-2 text-xs font-medium cursor-pointer transition whitespace-nowrap ${
              activeTab === 'import-bulk'
                ? 'border-b-2 border-[#7C3AED] text-[#E6EDF3]'
                : 'text-[#8B949E] hover:text-[#E6EDF3]'
            }`}
          >
            Bulk CSV
          </button>
        </div>

        {/* Content body */}
        <div className="flex-1 overflow-y-auto">
          {/* TAB 1: LIST */}
          {activeTab === 'list' && (
            <div>
              {room.stories.length === 0 ? (
                <div className="text-center py-12 px-4">
                  <FileText className="w-8 h-8 mx-auto text-[#484F58] mb-2" />
                  <p className="text-xs text-[#8B949E]">
                    No stories in the backlog yet.
                  </p>
                  <button
                    onClick={() => setActiveTab('import-url')}
                    className="mt-3 text-xs text-[#E6EDF3] transition cursor-pointer"
                    style={{
                      background: '#7C3AED',
                      borderRadius: '6px',
                      padding: '6px 12px',
                      border: 'none'
                    }}
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
                      className="group transition flex items-start justify-between gap-2"
                      style={{
                        padding: '10px 16px',
                        borderBottom: '1px solid #30363D',
                        background: isActive ? '#1C2128' : 'transparent'
                      }}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 mb-1">
                          <span className="text-[10px] font-mono text-[#8B949E]">
                            #{idx + 1}
                          </span>
                          {s.points ? (
                            <span 
                              className="text-[10px] font-medium px-1.5 py-0.2 rounded"
                              style={{
                                background: 'rgba(63, 185, 80, 0.15)',
                                color: '#3FB950',
                                border: '1px solid rgba(63, 185, 80, 0.3)'
                              }}
                            >
                              {s.points} pts
                            </span>
                          ) : (
                            <span 
                              className="text-[10px] text-[#8B949E] px-1.5 py-0.2 rounded"
                              style={{ background: '#1C2128', border: '1px solid #30363D' }}
                            >
                              Pending
                            </span>
                          )}
                          {isActive && (
                            <span 
                              className="text-[10px] font-medium px-1.5 py-0.2 rounded"
                              style={{
                                background: 'rgba(124, 58, 237, 0.15)',
                                color: '#A78BFA',
                                border: '1px solid rgba(124, 58, 237, 0.3)'
                              }}
                            >
                              Active
                            </span>
                          )}
                        </div>

                        <h4 className="font-medium text-xs text-[#E6EDF3] leading-snug truncate" title={s.title}>
                          {s.title}
                        </h4>

                        {s.description && (
                          <p className="text-[11px] text-[#8B949E] mt-0.5 line-clamp-1">
                            {s.description}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-1 shrink-0 pt-0.5">
                        {!isActive && (
                          <button
                            onClick={() => setActiveStory(s.id)}
                            className="text-xs text-[#8B949E] hover:text-[#E6EDF3] px-2 py-1 rounded transition cursor-pointer"
                            style={{ background: '#1C2128', border: '1px solid #30363D' }}
                          >
                            Point
                          </button>
                        )}
                        {isFacilitator && (
                          <button
                            onClick={() => deleteStory(s.id)}
                            className="p-1 rounded text-[#8B949E] hover:text-[#F85149] hover:bg-[#1C2128] transition cursor-pointer"
                            title="Delete story"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* TAB 2: IMPORT FROM URL */}
          {activeTab === 'import-url' && (
            <div className="p-4 space-y-3">
              <form onSubmit={handleFetchStory} className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-[#8B949E] mb-1">
                    ADO / Jira Issue URL
                  </label>
                  <input
                    type="url"
                    value={importUrl}
                    onChange={e => setImportUrl(e.target.value)}
                    placeholder="https://dev.azure.com/... or https://domain.atlassian.net/..."
                    required
                    className="w-full text-xs text-[#E6EDF3] placeholder-[#484F58] focus:border-[#6E40C9] focus:outline-none"
                    style={{
                      background: '#0D1117',
                      border: '1px solid #30363D',
                      borderRadius: '6px',
                      padding: '8px 10px'
                    }}
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-medium text-[#8B949E]">
                      PAT / API Token
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

                <button
                  type="submit"
                  disabled={importLoading || !importUrl.trim()}
                  className="w-full text-xs font-medium text-white transition cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50"
                  style={{
                    background: '#7C3AED',
                    borderRadius: '6px',
                    padding: '8px 12px',
                    border: 'none'
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = '#6D28D9')}
                  onMouseLeave={e => (e.currentTarget.style.background = '#7C3AED')}
                >
                  {importLoading ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Fetching...</span>
                    </>
                  ) : (
                    <span>Fetch Story</span>
                  )}
                </button>
              </form>

              {importError && (
                <div 
                  className="p-2.5 rounded text-xs text-[#F85149] flex items-start gap-2"
                  style={{ background: 'rgba(248, 81, 73, 0.1)', border: '1px solid #F85149' }}
                >
                  <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                  <span>{importError}</span>
                </div>
              )}

              {fetchedStory && (
                <div 
                  className="p-3 rounded-lg space-y-2 mt-3"
                  style={{ background: '#1C2128', border: '1px solid #30363D' }}
                >
                  <div className="flex items-center gap-2">
                    <span 
                      className="px-1.5 py-0.2 rounded text-[10px] font-mono font-medium"
                      style={{ background: '#0D1117', color: '#8B949E', border: '1px solid #30363D' }}
                    >
                      #{fetchedStory.id}
                    </span>
                    <span className="text-[11px] text-[#8B949E]">{fetchedStory.type}</span>
                  </div>

                  <h4 className="font-medium text-xs text-[#E6EDF3]">
                    {fetchedStory.title}
                  </h4>

                  {fetchedStory.description && (
                    <p className="text-[11px] text-[#8B949E] line-clamp-3">
                      {fetchedStory.description}
                    </p>
                  )}

                  <div className="pt-2 flex items-center justify-end gap-2 border-t border-[#30363D]">
                    <button
                      onClick={() => handleAddFetchedStory(false)}
                      className="px-2.5 py-1 text-xs text-[#E6EDF3] rounded transition cursor-pointer"
                      style={{ background: '#0D1117', border: '1px solid #30363D' }}
                    >
                      Add to Backlog
                    </button>
                    <button
                      onClick={() => handleAddFetchedStory(true)}
                      className="px-2.5 py-1 text-xs text-white rounded transition cursor-pointer"
                      style={{ background: '#7C3AED', border: 'none' }}
                    >
                      Point Now
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: MANUAL ADD */}
          {activeTab === 'add' && (
            <form onSubmit={handleAddSingle} className="p-4 space-y-3">
              <div>
                <label className="block text-xs font-medium text-[#8B949E] mb-1">
                  Story Title *
                </label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  placeholder="e.g. Implement user authentication"
                  required
                  className="w-full text-xs text-[#E6EDF3] placeholder-[#484F58] focus:border-[#6E40C9] focus:outline-none"
                  style={{
                    background: '#0D1117',
                    border: '1px solid #30363D',
                    borderRadius: '6px',
                    padding: '8px 10px'
                  }}
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#8B949E] mb-1">
                  Description (Optional)
                </label>
                <textarea
                  value={newDesc}
                  onChange={e => setNewDesc(e.target.value)}
                  rows={4}
                  placeholder="Details, criteria..."
                  className="w-full text-xs text-[#E6EDF3] placeholder-[#484F58] focus:border-[#6E40C9] focus:outline-none"
                  style={{
                    background: '#0D1117',
                    border: '1px solid #30363D',
                    borderRadius: '6px',
                    padding: '8px 10px'
                  }}
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#8B949E] mb-1">
                  Issue Tracker URL (Optional)
                </label>
                <input
                  type="url"
                  value={newUrl}
                  onChange={e => setNewUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full text-xs text-[#E6EDF3] placeholder-[#484F58] focus:border-[#6E40C9] focus:outline-none"
                  style={{
                    background: '#0D1117',
                    border: '1px solid #30363D',
                    borderRadius: '6px',
                    padding: '8px 10px'
                  }}
                />
              </div>

              <button
                type="submit"
                className="w-full text-xs font-medium text-white transition cursor-pointer"
                style={{
                  background: '#7C3AED',
                  borderRadius: '6px',
                  padding: '8px 12px',
                  border: 'none'
                }}
                onMouseEnter={e => (e.currentTarget.style.background = '#6D28D9')}
                onMouseLeave={e => (e.currentTarget.style.background = '#7C3AED')}
              >
                Add Story
              </button>
            </form>
          )}

          {/* TAB 4: BULK CSV */}
          {activeTab === 'import-bulk' && (
            <form onSubmit={handleImportBulk} className="p-4 space-y-3">
              <div>
                <label className="block text-xs font-medium text-[#8B949E] mb-1">
                  Paste Titles (One per line)
                </label>
                <textarea
                  value={bulkInput}
                  onChange={e => setBulkInput(e.target.value)}
                  rows={8}
                  placeholder={`AUTH-101: Add OAuth provider\nAUTH-102: Setup session cookie\nAUTH-103: Reset password workflow`}
                  required
                  className="w-full font-mono text-xs text-[#E6EDF3] placeholder-[#484F58] focus:border-[#6E40C9] focus:outline-none"
                  style={{
                    background: '#0D1117',
                    border: '1px solid #30363D',
                    borderRadius: '6px',
                    padding: '8px 10px'
                  }}
                />
              </div>

              <button
                type="submit"
                className="w-full text-xs font-medium text-white transition cursor-pointer"
                style={{
                  background: '#7C3AED',
                  borderRadius: '6px',
                  padding: '8px 12px',
                  border: 'none'
                }}
                onMouseEnter={e => (e.currentTarget.style.background = '#6D28D9')}
                onMouseLeave={e => (e.currentTarget.style.background = '#7C3AED')}
              >
                Import Lines
              </button>
            </form>
          )}
        </div>

        {/* Footer Actions */}
        <div 
          className="flex items-center gap-2 p-3"
          style={{ borderTop: '1px solid #30363D', background: '#161B22' }}
        >
          <button
            onClick={handleCopyMarkdownSummary}
            className="flex-1 text-xs text-[#E6EDF3] flex items-center justify-center gap-1.5 py-1.5 rounded transition cursor-pointer"
            style={{ background: '#1C2128', border: '1px solid #30363D' }}
          >
            {copiedSummary ? (
              <>
                <Check className="w-3.5 h-3.5 text-[#3FB950]" />
                <span className="text-[#3FB950]">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-[#8B949E]" />
                <span>Copy Summary</span>
              </>
            )}
          </button>

          <a
            href={`/api/rooms/${room.id}/export.csv`}
            download
            className="flex-1 text-xs text-[#E6EDF3] flex items-center justify-center gap-1.5 py-1.5 rounded transition cursor-pointer text-center"
            style={{ background: '#1C2128', border: '1px solid #30363D' }}
          >
            <Download className="w-3.5 h-3.5 text-[#8B949E]" />
            <span>Export CSV</span>
          </a>
        </div>
      </div>
    </div>
  );
};
