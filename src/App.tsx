/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  Mic,
  X,
  Compass,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Globe,
  Clock,
  Shield,
  HelpCircle,
  ExternalLink,
} from 'lucide-react';
import {
  SearchCategory,
  SearchResponseData,
  UserBookmark,
  PopupOffer,
} from './types';
import { Header } from './components/Header';
import { SearchFilters } from './components/SearchFilters';
import { DirectAnswerCard } from './components/DirectAnswerCard';
import { SearchResults } from './components/SearchResults';
import { VoiceSearchModal } from './components/VoiceSearchModal';
import { AIModeChat } from './components/AIModeChat';
import { AdminDashboardModal } from './components/AdminDashboardModal';
import { AnnouncementPopup } from './components/AnnouncementPopup';
import { HistoryAndBookmarksModal } from './components/HistoryAndBookmarksModal';
import { ToolsModal } from './components/ToolsModal';

export default function App() {
  // Theme state
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('searchly_theme');
    if (saved === 'light' || saved === 'dark') return saved;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  // Query & View states
  const [query, setQuery] = useState<string>('');
  const [submittedQuery, setSubmittedQuery] = useState<string>('');
  const [category, setCategory] = useState<SearchCategory>('all');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('auto');
  const [safeSearch, setSafeSearch] = useState<'moderate' | 'strict' | 'off'>('moderate');
  const [timeFilter, setTimeFilter] = useState<string>('all');

  // Search Results & Loading
  const [searchData, setSearchData] = useState<SearchResponseData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Autocomplete suggestions
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState<boolean>(false);
  const [selectedSuggestionIdx, setSelectedSuggestionIdx] = useState<number>(-1);

  // Modals & Assistant Mode
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState<boolean>(false);
  const [isAIMode, setIsAIMode] = useState<boolean>(false);
  const [aiModeInitialPrompt, setAiModeInitialPrompt] = useState<string>('');
  const [isAdminOpen, setIsAdminOpen] = useState<boolean>(false);
  const [isHistoryBookmarksOpen, setIsHistoryBookmarksOpen] = useState<boolean>(false);
  const [isToolsOpen, setIsToolsOpen] = useState<boolean>(false);

  // Persistent User History & Bookmarks
  const [userHistory, setUserHistory] = useState<Array<{ id: string; query: string; timestamp: number }>>(() => {
    try {
      const saved = localStorage.getItem('searchly_history');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [bookmarks, setBookmarks] = useState<UserBookmark[]>(() => {
    try {
      const saved = localStorage.getItem('searchly_bookmarks');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Popups & Announcements from Founder / Siddharth Academy
  const [popups, setPopups] = useState<PopupOffer[]>([]);
  const [activePopup, setActivePopup] = useState<PopupOffer | null>(null);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const suggestionsBoxRef = useRef<HTMLDivElement>(null);

  // Apply theme to <html> element
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('searchly_theme', theme);
  }, [theme]);

  // Load popups on mount
  useEffect(() => {
    fetchPopups();
  }, []);

  // Save history & bookmarks to localStorage
  useEffect(() => {
    localStorage.setItem('searchly_history', JSON.stringify(userHistory.slice(0, 50)));
  }, [userHistory]);

  useEffect(() => {
    localStorage.setItem('searchly_bookmarks', JSON.stringify(bookmarks));
  }, [bookmarks]);

  // Read URL query parameters on initial load
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const q = params.get('q');
    const type = params.get('type') as SearchCategory;
    const lang = params.get('lang');

    if (q) {
      setQuery(q);
      if (type) setCategory(type);
      if (lang) setSelectedLanguage(lang);
      executeSearch(q, type || 'all', lang || 'auto');
    }

    const handlePopState = () => {
      const currentParams = new URLSearchParams(window.location.search);
      const curQ = currentParams.get('q');
      if (curQ) {
        setQuery(curQ);
        executeSearch(curQ, (currentParams.get('type') as SearchCategory) || 'all');
      } else {
        setSubmittedQuery('');
        setSearchData(null);
        setQuery('');
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const fetchPopups = async () => {
    try {
      const res = await fetch('/api/admin/popups');
      if (res.ok) {
        const data = await res.json();
        setPopups(data.popups || []);
        if (data.popups && data.popups.length > 0) {
          const dismissedId = sessionStorage.getItem('searchly_dismissed_popup');
          const firstAvailable = data.popups.find((p: PopupOffer) => p.id !== dismissedId);
          setActivePopup(firstAvailable || null);
        }
      }
    } catch {
      // ignore
    }
  };

  // Fetch Autocomplete Suggestions
  useEffect(() => {
    if (!query.trim()) {
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/suggestions?q=${encodeURIComponent(query.trim())}`);
        if (res.ok) {
          const data = await res.json();
          setSuggestions(data.suggestions || []);
        }
      } catch {
        // ignore
      }
    }, 150);

    return () => clearTimeout(timer);
  }, [query]);

  // Main search execution
  const executeSearch = async (
    targetQuery: string,
    targetCategory: SearchCategory = category,
    targetLang: string = selectedLanguage
  ) => {
    const cleanQuery = targetQuery.trim();
    if (!cleanQuery) return;

    setSubmittedQuery(cleanQuery);
    setIsLoading(true);
    setShowSuggestions(false);

    // Sync URL with browser history
    const url = new URL(window.location.href);
    url.searchParams.set('q', cleanQuery);
    if (targetCategory !== 'all') {
      url.searchParams.set('type', targetCategory);
    } else {
      url.searchParams.delete('type');
    }
    if (targetLang !== 'auto') {
      url.searchParams.set('lang', targetLang);
    } else {
      url.searchParams.delete('lang');
    }
    window.history.pushState({}, '', url.toString());

    // Add to user history
    setUserHistory((prev) => [
      { id: `h-${Date.now()}`, query: cleanQuery, timestamp: Date.now() },
      ...prev.filter((item) => item.query.toLowerCase() !== cleanQuery.toLowerCase()),
    ]);

    try {
      const res = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          q: cleanQuery,
          type: targetCategory,
          lang: targetLang,
          safeSearch,
          timeFilter,
        }),
      });

      if (!res.ok) throw new Error('Search failed');
      const data: SearchResponseData = await res.json();
      setSearchData(data);
    } catch (err) {
      console.error('Search error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedSuggestionIdx >= 0 && suggestions[selectedSuggestionIdx]) {
      const picked = suggestions[selectedSuggestionIdx];
      setQuery(picked);
      executeSearch(picked, category, selectedLanguage);
    } else {
      executeSearch(query, category, selectedLanguage);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions || suggestions.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedSuggestionIdx((prev) => (prev < suggestions.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedSuggestionIdx((prev) => (prev > 0 ? prev - 1 : suggestions.length - 1));
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  const handleToggleBookmark = (item: {
    title: string;
    url: string;
    domain: string;
    snippet?: string;
    category: SearchCategory;
  }) => {
    setBookmarks((prev) => {
      const exists = prev.some((b) => b.url === item.url);
      if (exists) {
        return prev.filter((b) => b.url !== item.url);
      } else {
        return [
          {
            id: `bm-${Date.now()}`,
            title: item.title,
            url: item.url,
            domain: item.domain,
            snippet: item.snippet,
            category: item.category,
            savedAt: Date.now(),
          },
          ...prev,
        ];
      }
    });
  };

  const isResultsView = Boolean(submittedQuery);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors font-sans selection:bg-indigo-500 selection:text-white">
      {/* Top Header */}
      <Header
        theme={theme}
        onToggleTheme={() => setTheme(theme === 'light' ? 'dark' : 'light')}
        selectedLanguage={selectedLanguage}
        onSelectLanguage={(lang) => {
          setSelectedLanguage(lang);
          if (submittedQuery) executeSearch(submittedQuery, category, lang);
        }}
        isAIMode={isAIMode}
        onToggleAIMode={() => setIsAIMode(!isAIMode)}
        onOpenAdmin={() => setIsAdminOpen(true)}
        onOpenHistoryBookmarks={() => setIsHistoryBookmarksOpen(true)}
        onOpenTools={() => setIsToolsOpen(true)}
        isCompactHeader={isResultsView}
      />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col">
        {/* VIEW 1: Dedicated AI Mode Chat */}
        {isAIMode ? (
          <AIModeChat
            initialPrompt={aiModeInitialPrompt || submittedQuery}
            onClose={() => {
              setIsAIMode(false);
              setAiModeInitialPrompt('');
            }}
            selectedLanguage={selectedLanguage}
          />
        ) : !isResultsView ? (
          /* VIEW 2: Google-Inspired Searchly Homepage */
          <div className="flex-1 flex flex-col items-center justify-center px-4 max-w-4xl mx-auto w-full -mt-10 sm:-mt-14">
            {/* Searchly Brand Identity */}
            <div className="flex flex-col items-center mb-8 select-none">
              <div className="flex items-center gap-3 group">
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-3xl bg-gradient-to-tr from-indigo-600 via-blue-600 to-indigo-700 flex items-center justify-center text-white shadow-xl shadow-indigo-600/30 group-hover:scale-105 group-hover:rotate-6 transition-all duration-300">
                  <Compass className="w-8 h-8 sm:w-9 sm:h-9" />
                </div>
                <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white font-heading">
                  Searchly
                  <span className="inline-block w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-full bg-indigo-600 ml-1"></span>
                </h1>
              </div>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-xs font-semibold tracking-wide text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-3 py-0.5 rounded-full border border-indigo-200/50 dark:border-indigo-800/50">
                  by Siddharth Academy
                </span>
                <span className="text-xs text-slate-400 hidden sm:inline">
                  • Multilingual AI Search Engine
                </span>
              </div>
            </div>

            {/* Central Search Form */}
            <div className="w-full max-w-2xl relative">
              <form
                onSubmit={handleFormSubmit}
                className="relative flex items-center w-full bg-white dark:bg-slate-900 rounded-full border border-slate-200 dark:border-slate-800 shadow-md hover:shadow-xl focus-within:shadow-xl focus-within:border-indigo-500/80 transition-all duration-200 p-2 sm:p-2.5 z-20"
              >
                <div className="pl-3 pr-2 text-slate-400">
                  <Search className="w-5 h-5" />
                </div>

                <input
                  ref={searchInputRef}
                  type="text"
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setShowSuggestions(true);
                    setSelectedSuggestionIdx(-1);
                  }}
                  onFocus={() => setShowSuggestions(true)}
                  onKeyDown={handleKeyDown}
                  placeholder="Search web or ask anything in English, हिन्दी, Hinglish..."
                  className="flex-1 text-sm sm:text-base bg-transparent text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none px-2"
                />

                {query && (
                  <button
                    type="button"
                    onClick={() => {
                      setQuery('');
                      setSuggestions([]);
                      searchInputRef.current?.focus();
                    }}
                    className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition"
                    title="Clear search"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}

                {/* Google-Inspired Voice Search Mic Button */}
                <button
                  type="button"
                  onClick={() => setIsVoiceModalOpen(true)}
                  className="p-2 ml-1 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-slate-800 rounded-full transition"
                  title="Voice Search (Hindi & English)"
                >
                  <Mic className="w-5 h-5" />
                </button>
              </form>

              {/* Autocomplete Suggestions Popup */}
              {showSuggestions && suggestions.length > 0 && (
                <div
                  ref={suggestionsBoxRef}
                  className="absolute left-0 right-0 top-14 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl py-3 z-30 animate-in fade-in slide-in-from-top-1 overflow-hidden"
                >
                  {suggestions.map((item, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setQuery(item);
                        executeSearch(item, category, selectedLanguage);
                      }}
                      className={`w-full text-left px-5 py-2.5 text-sm flex items-center justify-between transition ${
                        selectedSuggestionIdx === idx
                          ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 font-semibold'
                          : 'text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-3 truncate">
                        <Search className="w-4 h-4 text-slate-400 shrink-0" />
                        <span className="truncate">{item}</span>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-300 opacity-0 group-hover:opacity-100" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Homepage Search Action Buttons */}
            <div className="flex items-center gap-3 mt-7">
              <button
                onClick={() => executeSearch(query || 'What is artificial intelligence', category, selectedLanguage)}
                className="px-5 py-2.5 rounded-full text-xs sm:text-sm font-semibold bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-800 shadow-xs hover:shadow transition"
              >
                Searchly Search
              </button>

              <button
                onClick={() => {
                  const curiosities = [
                    'वह को English में क्या कहते हैं?',
                    'What is the capital of India?',
                    '2 + 2',
                    'Speed of light in km per second',
                    'How does photosynthesis work?',
                  ];
                  const pick = curiosities[Math.floor(Math.random() * curiosities.length)];
                  setQuery(pick);
                  executeSearch(pick, category, selectedLanguage);
                }}
                className="flex items-center gap-1.5 px-5 py-2.5 rounded-full text-xs sm:text-sm font-semibold bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200/50 dark:border-indigo-800/50 shadow-xs transition"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>AI Direct Answer</span>
              </button>
            </div>

            {/* Multilingual Search Shortcuts */}
            <div className="flex flex-wrap items-center justify-center gap-2 mt-8 text-xs text-slate-500 dark:text-slate-400">
              <Globe className="w-3.5 h-3.5 text-indigo-500" />
              <span>Searchly offered in:</span>
              <button
                onClick={() => {
                  setSelectedLanguage('hi');
                  setQuery('वह को English में क्या कहते हैं?');
                }}
                className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline"
              >
                हिन्दी
              </button>
              <span>•</span>
              <button
                onClick={() => setSelectedLanguage('en')}
                className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline"
              >
                English
              </button>
              <span>•</span>
              <button
                onClick={() => {
                  setSelectedLanguage('hinglish');
                  setQuery('AI kya hota hai');
                }}
                className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline"
              >
                Hinglish
              </button>
            </div>

            {/* Trending / Popular Queries Pill Chips */}
            <div className="mt-8 flex flex-col items-center">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2.5 flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-indigo-500" />
                Trending &amp; Popular Questions
              </span>
              <div className="flex flex-wrap justify-center gap-2 max-w-xl">
                {[
                  'वह को English में क्या कहते हैं?',
                  'What is the capital of India?',
                  '2 + 2',
                  'Artificial Intelligence 2026',
                  'Python tutorial for beginners',
                  'Weather today',
                ].map((sample, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setQuery(sample);
                      executeSearch(sample, category, selectedLanguage);
                    }}
                    className="text-xs px-3.5 py-1.5 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-600 text-slate-700 dark:text-slate-300 transition"
                  >
                    {sample}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* VIEW 3: Search Results Page */
          <div className="flex-1 flex flex-col">
            {/* Top Search Bar & Filters in Results View */}
            <div className="bg-white dark:bg-slate-950 border-b border-slate-200/80 dark:border-slate-800 pt-3 px-4 sm:px-6">
              <div className="max-w-6xl mx-auto flex items-center gap-4 pb-3">
                <form
                  onSubmit={handleFormSubmit}
                  className="flex-1 max-w-2xl relative flex items-center bg-slate-50 dark:bg-slate-900 rounded-full border border-slate-200 dark:border-slate-800 focus-within:border-indigo-500 p-1.5 sm:p-2 shadow-xs transition"
                >
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="flex-1 text-sm bg-transparent text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none pl-3"
                  />
                  {query && (
                    <button
                      type="button"
                      onClick={() => setQuery('')}
                      className="p-1 text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setIsVoiceModalOpen(true)}
                    className="p-1.5 text-indigo-600 dark:text-indigo-400 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full transition ml-1"
                    title="Voice Search"
                  >
                    <Mic className="w-4 h-4" />
                  </button>
                  <button
                    type="submit"
                    className="p-1.5 text-slate-500 hover:text-indigo-600 transition ml-1"
                    title="Search"
                  >
                    <Search className="w-4 h-4" />
                  </button>
                </form>
              </div>

              {/* Category tabs and filters */}
              <SearchFilters
                currentCategory={category}
                onSelectCategory={(newCat) => {
                  setCategory(newCat);
                  executeSearch(submittedQuery, newCat, selectedLanguage);
                }}
                latencyMs={searchData?.latencyMs || 240}
                totalEstimatedResults={searchData?.totalEstimatedResults || 1420000}
                selectedLanguage={selectedLanguage}
                onSelectLanguage={(l) => {
                  setSelectedLanguage(l);
                  executeSearch(submittedQuery, category, l);
                }}
                safeSearch={safeSearch}
                onSelectSafeSearch={(s) => {
                  setSafeSearch(s);
                  executeSearch(submittedQuery, category, selectedLanguage);
                }}
                timeFilter={timeFilter}
                onSelectTimeFilter={(t) => {
                  setTimeFilter(t);
                  executeSearch(submittedQuery, category, selectedLanguage);
                }}
                currentQuery={submittedQuery}
              />
            </div>

            {/* Results Body */}
            <div className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6">
              {/* Prominent Direct Answer / AI Highlight Card if available */}
              {searchData?.directAnswer && category === 'all' && (
                <DirectAnswerCard
                  answer={searchData.directAnswer}
                  query={submittedQuery}
                  onFollowUpClick={(nextQ) => {
                    setQuery(nextQ);
                    executeSearch(nextQ, category, selectedLanguage);
                  }}
                  onOpenAIMode={(prompt) => {
                    setAiModeInitialPrompt(prompt);
                    setIsAIMode(true);
                  }}
                />
              )}

              {/* Web / Images / Videos / News results */}
              <SearchResults
                category={category}
                webResults={searchData?.results.web || []}
                imageResults={searchData?.results.images || []}
                videoResults={searchData?.results.videos || []}
                newsResults={searchData?.results.news || []}
                isLoading={isLoading}
                query={submittedQuery}
                bookmarks={bookmarks}
                onToggleBookmark={handleToggleBookmark}
              />
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-950 py-4 px-6 text-xs text-slate-500 dark:text-slate-400 transition-colors">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-800 dark:text-slate-200">Searchly</span>
            <span>•</span>
            <span>Project by <b>Siddharth Academy</b></span>
            <span>(sddhrthacademy@gmail.com)</span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={() => setIsAdminOpen(true)}
              className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline"
            >
              Founder Admin Portal
            </button>
            <button
              onClick={() => setIsToolsOpen(true)}
              className="hover:text-slate-700 dark:hover:text-slate-200 transition"
            >
              Quick Tools
            </button>
            <button
              onClick={() => setIsHistoryBookmarksOpen(true)}
              className="hover:text-slate-700 dark:hover:text-slate-200 transition"
            >
              Saved &amp; History
            </button>
          </div>
        </div>
      </footer>

      {/* Google-Inspired Voice Search Fullscreen Modal */}
      <VoiceSearchModal
        isOpen={isVoiceModalOpen}
        onClose={() => setIsVoiceModalOpen(false)}
        onSearch={(voiceQuery) => {
          setQuery(voiceQuery);
          executeSearch(voiceQuery, category, selectedLanguage);
        }}
        defaultLang={selectedLanguage}
      />

      {/* Administrator Dashboard Modal */}
      <AdminDashboardModal
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        popups={popups}
        onRefreshPopups={fetchPopups}
      />

      {/* History & Bookmarks Modal */}
      <HistoryAndBookmarksModal
        isOpen={isHistoryBookmarksOpen}
        onClose={() => setIsHistoryBookmarksOpen(false)}
        history={userHistory}
        bookmarks={bookmarks}
        onSelectQuery={(q) => {
          setQuery(q);
          executeSearch(q, category, selectedLanguage);
        }}
        onDeleteHistoryItem={(id) => {
          setUserHistory((prev) => prev.filter((item) => item.id !== id));
        }}
        onClearAllHistory={() => {
          setUserHistory([]);
        }}
        onRemoveBookmark={(url) => {
          setBookmarks((prev) => prev.filter((b) => b.url !== url));
        }}
      />

      {/* Quick Tools Modal (Calculator, Translator, Converter) */}
      <ToolsModal
        isOpen={isToolsOpen}
        onClose={() => setIsToolsOpen(false)}
        onSearchQuery={(q) => {
          setQuery(q);
          executeSearch(q, category, selectedLanguage);
        }}
      />

      {/* Active Announcement / Academy Offer Banner */}
      <AnnouncementPopup
        popup={activePopup}
        onDismiss={() => {
          if (activePopup) {
            sessionStorage.setItem('searchly_dismissed_popup', activePopup.id);
          }
          setActivePopup(null);
        }}
      />
    </div>
  );
}
