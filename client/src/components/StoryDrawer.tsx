import React, { useState } from 'react';
import { usePoker } from '../context/PokerContext';
import { 
  X, 
  Download, 
  Copy, 
  Check, 
  Trash2, 
  FileText,
  UploadCloud,
  CheckCircle2
} from 'lucide-react';

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

  const [activeTab, setActiveTab] = useState<'list' | 'add' | 'import'>('list');
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [bulkInput, setBulkInput] = useState('');
  const [copiedSummary, setCopiedSummary] = useState(false);

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

    // Split lines by newline. If comma or tab separated, parse title + description
    const lines = bulkInput.split('\n').map(l => l.trim()).filter(Boolean);
    const parsedStories = lines.map(line => {
      // Check if Jira format like "PROJ-123: Story title"
      return {
        title: line,
        description: undefined,
        url: undefined
      };
    });

    if (parsedStories.length > 0) {
      importStories(parsedStories);
      setBulkInput('');
      setActiveTab('list');
    }
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
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity" 
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white dark:bg-slate-900 shadow-2xl flex flex-col border-l border-slate-200 dark:border-slate-800 transition-all">
          
          {/* Header */}
          <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div>
              <h2 className="font-heading font-bold text-lg text-slate-900 dark:text-white">
                Sprint Backlog
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {room.stories.length} stories in this session
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Tab Navigation */}
          <div className="flex border-b border-slate-200 dark:border-slate-800 px-5 pt-2">
            <button
              onClick={() => setActiveTab('list')}
              className={`pb-2.5 px-3 text-xs font-semibold cursor-pointer border-b-2 transition ${
                activeTab === 'list'
                  ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                  : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400'
              }`}
            >
              Stories ({room.stories.length})
            </button>
            <button
              onClick={() => setActiveTab('add')}
              className={`pb-2.5 px-3 text-xs font-semibold cursor-pointer border-b-2 transition ${
                activeTab === 'add'
                  ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                  : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400'
              }`}
            >
              + Add Story
            </button>
            <button
              onClick={() => setActiveTab('import')}
              className={`pb-2.5 px-3 text-xs font-semibold cursor-pointer border-b-2 transition ${
                activeTab === 'import'
                  ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                  : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400'
              }`}
            >
              Bulk Import
            </button>
          </div>

          {/* Content Body */}
          <div className="flex-1 overflow-y-auto p-5">
            {/* TAB: STORY LIST */}
            {activeTab === 'list' && (
              <div className="space-y-3">
                {room.stories.length === 0 ? (
                  <div className="text-center py-10">
                    <FileText className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
                    <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
                      No stories in the backlog yet.
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      Add tickets one by one or paste a batch from Jira.
                    </p>
                    <button
                      onClick={() => setActiveTab('add')}
                      className="mt-4 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition cursor-pointer"
                    >
                      Create First Story
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
                            ? 'bg-indigo-50/80 dark:bg-indigo-950/50 border-indigo-400 dark:border-indigo-700 ring-2 ring-indigo-500/20 shadow-sm'
                            : 'bg-white dark:bg-slate-800/60 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2 mb-1">
                              <span className="text-[11px] font-mono text-slate-400">
                                #{idx + 1}
                              </span>
                              {s.points ? (
                                <span className="inline-flex items-center text-[10px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/80 px-2 py-0.5 rounded">
                                  <CheckCircle2 className="w-2.5 h-2.5 mr-1" />
                                  {s.points} pts
                                </span>
                              ) : (
                                <span className="text-[10px] font-medium text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded">
                                  Pending
                                </span>
                              )}
                              {isActive && (
                                <span className="text-[10px] font-bold text-indigo-700 dark:text-indigo-400 bg-indigo-100 dark:bg-indigo-950 px-2 py-0.5 rounded">
                                  Pointing Now
                                </span>
                              )}
                            </div>

                            <h4 className="font-heading font-semibold text-sm text-slate-800 dark:text-slate-100 leading-snug">
                              {s.title}
                            </h4>

                            {s.description && (
                              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                                {s.description}
                              </p>
                            )}
                          </div>

                          <div className="flex items-center space-x-1 shrink-0">
                            {!isActive && (
                              <button
                                onClick={() => setActiveStory(s.id)}
                                className="px-2.5 py-1 rounded-lg text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950 transition cursor-pointer"
                                title="Vote on this story"
                              >
                                Point
                              </button>
                            )}
                            {isFacilitator && (
                              <button
                                onClick={() => deleteStory(s.id)}
                                className="p-1 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition cursor-pointer"
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

            {/* TAB: ADD STORY */}
            {activeTab === 'add' && (
              <form onSubmit={handleAddSingle} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Story Title or Ticket Key *
                  </label>
                  <input
                    type="text"
                    value={newTitle}
                    onChange={e => setNewTitle(e.target.value)}
                    placeholder="e.g. AUTH-42: Implement GitHub OAuth login"
                    required
                    className="w-full px-3 py-2 rounded-xl text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Description / Acceptance Criteria (Optional)
                  </label>
                  <textarea
                    value={newDesc}
                    onChange={e => setNewDesc(e.target.value)}
                    rows={4}
                    placeholder="Summary of requirements, dependencies, or scope..."
                    className="w-full px-3 py-2 rounded-xl text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Jira / GitHub URL (Optional)
                  </label>
                  <input
                    type="url"
                    value={newUrl}
                    onChange={e => setNewUrl(e.target.value)}
                    placeholder="https://yourcompany.atlassian.net/browse/PROJ-123"
                    className="w-full px-3 py-2 rounded-xl text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition shadow-sm cursor-pointer"
                >
                  Add Story to Backlog
                </button>
              </form>
            )}

            {/* TAB: BULK IMPORT */}
            {activeTab === 'import' && (
              <form onSubmit={handleImportBulk} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
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
                    className="w-full font-mono px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition shadow-sm cursor-pointer inline-flex items-center justify-center space-x-1.5"
                >
                  <UploadCloud className="w-4 h-4" />
                  <span>Import All Lines as Stories</span>
                </button>
              </form>
            )}
          </div>

          {/* Footer Actions */}
          <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex items-center justify-between gap-2">
            <button
              onClick={handleCopyMarkdownSummary}
              className="flex-1 py-2 px-3 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 transition cursor-pointer inline-flex items-center justify-center space-x-1.5"
            >
              {copiedSummary ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                  <span className="text-emerald-600">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-500" />
                  <span>Copy Markdown</span>
                </>
              )}
            </button>

            <a
              href={`/api/rooms/${room.id}/export.csv`}
              download
              className="flex-1 py-2 px-3 rounded-xl text-xs font-medium text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 transition cursor-pointer inline-flex items-center justify-center space-x-1.5 text-center"
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
