import React, { useState } from 'react';
import {
  Sun,
  Moon,
  Globe,
  Sparkles,
  Grid,
  User,
  Shield,
  Bookmark,
  History,
  Calculator,
  Compass,
  ArrowRight,
  LogOut,
  Settings,
  HelpCircle,
  ExternalLink,
} from 'lucide-react';
import { LanguageCode } from '../types';

interface HeaderProps {
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  selectedLanguage: string;
  onSelectLanguage: (lang: string) => void;
  isAIMode: boolean;
  onToggleAIMode: () => void;
  onOpenAdmin: () => void;
  onOpenHistoryBookmarks: () => void;
  onOpenTools: () => void;
  isCompactHeader?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  theme,
  onToggleTheme,
  selectedLanguage,
  onSelectLanguage,
  isAIMode,
  onToggleAIMode,
  onOpenAdmin,
  onOpenHistoryBookmarks,
  onOpenTools,
  isCompactHeader = false,
}) => {
  const [showLangMenu, setShowLangMenu] = useState<boolean>(false);
  const [showUserMenu, setShowUserMenu] = useState<boolean>(false);
  const [showAppsMenu, setShowAppsMenu] = useState<boolean>(false);

  const languages = [
    { code: 'auto', label: 'All (Auto)' },
    { code: 'en', label: 'English (Global)' },
    { code: 'hi', label: 'हिन्दी (Hindi)' },
    { code: 'hinglish', label: 'Hinglish (Mix)' },
    { code: 'es', label: 'Español' },
  ];

  return (
    <header className="relative z-30 w-full flex items-center justify-between px-4 sm:px-6 py-3 transition-colors">
      {/* Left side brand or breadcrumb */}
      <div className="flex items-center gap-3">
        {isCompactHeader ? (
          <a
            href="/"
            className="flex items-center gap-2 group transition"
            title="Searchly Home"
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 via-blue-600 to-indigo-700 flex items-center justify-center text-white shadow-md shadow-indigo-600/20 group-hover:scale-105 transition-transform">
              <Compass className="w-5 h-5 animate-spin-slow" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-1 font-heading">
                Searchly
                <span className="w-2 h-2 rounded-full bg-indigo-600 inline-block"></span>
              </span>
            </div>
          </a>
        ) : (
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
              Siddharth Academy
            </span>
          </div>
        )}
      </div>

      {/* Right side navigation items */}
      <div className="flex items-center space-x-1 sm:space-x-3">
        {/* AI Mode Toggle Button */}
        <button
          onClick={onToggleAIMode}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition shadow-xs ${
            isAIMode
              ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-indigo-500/20'
              : 'bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:hover:bg-indigo-900/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-800/60'
          }`}
          title="Switch between Web Search & AI Assistant Mode"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">{isAIMode ? 'Exit AI Mode' : 'AI Mode'}</span>
        </button>

        {/* Quick Tools Launcher */}
        <button
          onClick={onOpenTools}
          className="p-2 rounded-full text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          title="Searchly Tools (Calculator, Translator, Converter)"
        >
          <Calculator className="w-4 h-4" />
        </button>

        {/* Language Dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              setShowLangMenu(!showLangMenu);
              setShowUserMenu(false);
              setShowAppsMenu(false);
            }}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            title="Choose Language"
          >
            <Globe className="w-4 h-4 text-indigo-500" />
            <span className="hidden md:inline uppercase font-bold text-[11px]">
              {selectedLanguage === 'auto' ? 'Lang' : selectedLanguage}
            </span>
          </button>

          {showLangMenu && (
            <div className="absolute right-0 mt-2 w-44 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-2">
              <div className="px-3 py-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Language
              </div>
              {languages.map((l) => (
                <button
                  key={l.code}
                  onClick={() => {
                    onSelectLanguage(l.code);
                    setShowLangMenu(false);
                  }}
                  className={`w-full text-left px-3.5 py-2 text-xs font-medium flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800 transition ${
                    selectedLanguage === l.code
                      ? 'text-indigo-600 dark:text-indigo-400 font-bold bg-indigo-50/50 dark:bg-indigo-950/30'
                      : 'text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <span>{l.label}</span>
                  {selectedLanguage === l.code && <span className="w-1.5 h-1.5 rounded-full bg-indigo-600" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Theme Toggle Button */}
        <button
          onClick={onToggleTheme}
          className="p-2 rounded-full text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} theme`}
          aria-label="Toggle Theme"
        >
          {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4 text-amber-400" />}
        </button>

        {/* User Account / Profile Menu */}
        <div className="relative">
          <button
            onClick={() => {
              setShowUserMenu(!showUserMenu);
              setShowLangMenu(false);
              setShowAppsMenu(false);
            }}
            className="flex items-center gap-1.5 p-1 rounded-full text-slate-700 dark:text-slate-200 hover:ring-2 hover:ring-indigo-500/30 transition"
            title="User Profile & History"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold shadow-xs">
              S
            </div>
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl py-3 z-50 animate-in fade-in slide-in-from-top-2">
              <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800">
                <div className="font-bold text-sm text-slate-900 dark:text-white">
                  Siddharth Academy
                </div>
                <div className="text-xs text-slate-400 truncate">
                  sddhrthacademy@gmail.com
                </div>
                <span className="inline-block mt-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                  Project Owner &amp; Founder
                </span>
              </div>

              <div className="py-1">
                <button
                  onClick={() => {
                    onOpenHistoryBookmarks();
                    setShowUserMenu(false);
                  }}
                  className="w-full text-left px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2.5 transition"
                >
                  <History className="w-4 h-4 text-slate-400" />
                  <span>Search History</span>
                </button>

                <button
                  onClick={() => {
                    onOpenHistoryBookmarks();
                    setShowUserMenu(false);
                  }}
                  className="w-full text-left px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2.5 transition"
                >
                  <Bookmark className="w-4 h-4 text-slate-400" />
                  <span>Saved Bookmarks</span>
                </button>

                <button
                  onClick={() => {
                    onOpenAdmin();
                    setShowUserMenu(false);
                  }}
                  className="w-full text-left px-4 py-2 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 flex items-center gap-2.5 transition"
                >
                  <Shield className="w-4 h-4" />
                  <span>Founder Admin Dashboard</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
