import React, { useState } from 'react';
import {
  X,
  History,
  Bookmark,
  Trash2,
  ExternalLink,
  Search,
  Clock,
  ArrowRight,
} from 'lucide-react';
import { UserBookmark } from '../types';

interface HistoryItem {
  id: string;
  query: string;
  timestamp: number;
}

interface HistoryAndBookmarksModalProps {
  isOpen: boolean;
  onClose: () => void;
  history: HistoryItem[];
  bookmarks: UserBookmark[];
  onSelectQuery: (q: string) => void;
  onDeleteHistoryItem: (id: string) => void;
  onClearAllHistory: () => void;
  onRemoveBookmark: (url: string) => void;
}

export const HistoryAndBookmarksModal: React.FC<HistoryAndBookmarksModalProps> = ({
  isOpen,
  onClose,
  history,
  bookmarks,
  onSelectQuery,
  onDeleteHistoryItem,
  onClearAllHistory,
  onRemoveBookmark,
}) => {
  const [activeTab, setActiveTab] = useState<'history' | 'bookmarks'>('history');
  const [searchTerm, setSearchTerm] = useState<string>('');

  if (!isOpen) return null;

  const filteredHistory = history.filter((h) =>
    h.query.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredBookmarks = bookmarks.filter((b) =>
    b.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.domain.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in"
    >
      <div className="relative w-full max-w-xl max-h-[85vh] bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              {activeTab === 'history' ? <History className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
            </span>
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              {activeTab === 'history' ? 'Your Search History' : 'Saved Bookmarks'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Toggle */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 text-xs font-semibold">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('history')}
              className={`px-3 py-1.5 rounded-full transition ${
                activeTab === 'history'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
              }`}
            >
              History ({history.length})
            </button>
            <button
              onClick={() => setActiveTab('bookmarks')}
              className={`px-3 py-1.5 rounded-full transition ${
                activeTab === 'bookmarks'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
              }`}
            >
              Saved ({bookmarks.length})
            </button>
          </div>

          {activeTab === 'history' && history.length > 0 && (
            <button
              onClick={onClearAllHistory}
              className="text-red-500 hover:text-red-600 text-[11px] font-bold hover:underline"
            >
              Clear All
            </button>
          )}
        </div>

        {/* Search filter input */}
        <div className="px-5 pt-3">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={`Filter ${activeTab}...`}
              className="w-full text-xs pl-8 pr-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none"
            />
          </div>
        </div>

        {/* Content list */}
        <div className="flex-1 overflow-y-auto p-5 space-y-2">
          {activeTab === 'history' ? (
            filteredHistory.length > 0 ? (
              filteredHistory.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/50 dark:border-slate-800 transition group"
                >
                  <button
                    onClick={() => {
                      onSelectQuery(item.query);
                      onClose();
                    }}
                    className="flex-1 text-left flex items-center gap-2.5 text-xs text-slate-800 dark:text-slate-200 font-medium truncate"
                  >
                    <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{item.query}</span>
                  </button>

                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-slate-400">
                      {new Date(item.timestamp).toLocaleDateString([], {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                    <button
                      onClick={() => onDeleteHistoryItem(item.id)}
                      className="p-1 text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition"
                      title="Delete query"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-8 text-center text-xs text-slate-400">
                No search history records found.
              </div>
            )
          ) : filteredBookmarks.length > 0 ? (
            filteredBookmarks.map((b) => (
              <div
                key={b.id}
                className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/50 dark:border-slate-800 transition flex items-start justify-between gap-3 group"
              >
                <div className="flex-1">
                  <a
                    href={b.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline leading-snug block mb-1"
                  >
                    {b.title}
                  </a>
                  <span className="text-[10px] text-slate-400 block truncate">
                    {b.domain}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <a
                    href={b.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1 text-slate-400 hover:text-indigo-600 transition"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                  <button
                    onClick={() => onRemoveBookmark(b.url)}
                    className="p-1 text-slate-400 hover:text-red-500 transition"
                    title="Remove Bookmark"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="py-8 text-center text-xs text-slate-400">
              No saved bookmarks yet. Bookmark any search result to view it here.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
