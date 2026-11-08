import React, { useState } from 'react';
import {
  Globe,
  Image as ImageIcon,
  Video,
  Newspaper,
  MapPin,
  ShoppingBag,
  SlidersHorizontal,
  ChevronDown,
  Clock,
  Shield,
  Share2,
  Check,
} from 'lucide-react';
import { SearchCategory, LanguageCode } from '../types';

interface SearchFiltersProps {
  currentCategory: SearchCategory;
  onSelectCategory: (category: SearchCategory) => void;
  latencyMs: number;
  totalEstimatedResults: number;
  selectedLanguage: string;
  onSelectLanguage: (lang: string) => void;
  safeSearch: 'moderate' | 'strict' | 'off';
  onSelectSafeSearch: (val: 'moderate' | 'strict' | 'off') => void;
  timeFilter: string;
  onSelectTimeFilter: (val: string) => void;
  currentQuery: string;
}

export const SearchFilters: React.FC<SearchFiltersProps> = ({
  currentCategory,
  onSelectCategory,
  latencyMs,
  totalEstimatedResults,
  selectedLanguage,
  onSelectLanguage,
  safeSearch,
  onSelectSafeSearch,
  timeFilter,
  onSelectTimeFilter,
  currentQuery,
}) => {
  const [showTools, setShowTools] = useState<boolean>(false);
  const [copiedShare, setCopiedShare] = useState<boolean>(false);

  const categories: Array<{ id: SearchCategory; label: string; icon: React.ReactNode }> = [
    { id: 'all', label: 'All', icon: <Globe className="w-4 h-4" /> },
    { id: 'web', label: 'Web', icon: <Globe className="w-4 h-4" /> },
    { id: 'images', label: 'Images', icon: <ImageIcon className="w-4 h-4" /> },
    { id: 'videos', label: 'Videos', icon: <Video className="w-4 h-4" /> },
    { id: 'news', label: 'News', icon: <Newspaper className="w-4 h-4" /> },
  ];

  const handleShare = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    setCopiedShare(true);
    setTimeout(() => setCopiedShare(false), 2000);
  };

  return (
    <div className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 transition-colors">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Navigation Categories Tabs */}
        <div className="flex items-center justify-between gap-4 overflow-x-auto no-scrollbar pt-2">
          <div className="flex items-center space-x-1 sm:space-x-2">
            {categories.map((cat) => {
              const active = currentCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => onSelectCategory(cat.id)}
                  className={`flex items-center gap-1.5 px-3.5 py-2.5 text-sm font-semibold rounded-t-lg border-b-2 transition-all whitespace-nowrap ${
                    active
                      ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
                      : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  {cat.icon}
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>

          {/* Tools & Share Button */}
          <div className="flex items-center gap-2 shrink-0 pb-1">
            <button
              onClick={() => setShowTools(!showTools)}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full border transition ${
                showTools
                  ? 'bg-slate-100 dark:bg-slate-800 border-indigo-400 text-indigo-600 dark:text-indigo-400'
                  : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Tools</span>
              <ChevronDown className={`w-3 h-3 transition-transform ${showTools ? 'rotate-180' : ''}`} />
            </button>

            <button
              onClick={handleShare}
              className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-full border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900 transition"
              title="Copy shareable search link"
            >
              {copiedShare ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Share2 className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">{copiedShare ? 'Copied' : 'Share'}</span>
            </button>
          </div>
        </div>

        {/* Expandable Tools Bar: Time, Language, SafeSearch */}
        {showTools && (
          <div className="py-3 border-t border-slate-100 dark:border-slate-800/60 flex flex-wrap items-center gap-4 text-xs animate-in slide-in-from-top-1">
            {/* Time Filter */}
            <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span className="font-medium">Time:</span>
              <select
                value={timeFilter}
                onChange={(e) => onSelectTimeFilter(e.target.value)}
                className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="all">Any time</option>
                <option value="day">Past 24 hours</option>
                <option value="week">Past week</option>
                <option value="month">Past month</option>
                <option value="year">Past year</option>
              </select>
            </div>

            {/* Language Filter */}
            <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
              <Globe className="w-3.5 h-3.5 text-slate-400" />
              <span className="font-medium">Search in Language:</span>
              <select
                value={selectedLanguage}
                onChange={(e) => onSelectLanguage(e.target.value)}
                className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="auto">All Languages (Auto)</option>
                <option value="en">English only</option>
                <option value="hi">हिन्दी (Hindi only)</option>
              </select>
            </div>

            {/* SafeSearch Filter */}
            <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
              <Shield className="w-3.5 h-3.5 text-slate-400" />
              <span className="font-medium">SafeSearch:</span>
              <select
                value={safeSearch}
                onChange={(e) => onSelectSafeSearch(e.target.value as any)}
                className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="moderate">Moderate</option>
                <option value="strict">Strict</option>
                <option value="off">Off</option>
              </select>
            </div>
          </div>
        )}

        {/* Results Metadata & Latency Stats */}
        <div className="py-2 text-[12px] text-slate-400 dark:text-slate-500 flex items-center justify-between">
          <span>
            About {totalEstimatedResults.toLocaleString()} results ({(latencyMs / 1000).toFixed(2)} seconds)
          </span>
          <span className="hidden sm:inline text-slate-400">
            Powered by Searchly Intelligence • Siddharth Academy
          </span>
        </div>
      </div>
    </div>
  );
};
