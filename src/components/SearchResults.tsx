import React, { useState } from 'react';
import {
  ExternalLink,
  Bookmark,
  BookmarkCheck,
  Share2,
  Check,
  Play,
  Maximize2,
  X,
  FileQuestion,
  ChevronRight,
} from 'lucide-react';
import {
  SearchCategory,
  WebResultItem,
  ImageResultItem,
  VideoResultItem,
  NewsResultItem,
  UserBookmark,
} from '../types';

interface SearchResultsProps {
  category: SearchCategory;
  webResults: WebResultItem[];
  imageResults: ImageResultItem[];
  videoResults: VideoResultItem[];
  newsResults: NewsResultItem[];
  isLoading: boolean;
  query: string;
  bookmarks: UserBookmark[];
  onToggleBookmark: (item: { title: string; url: string; domain: string; snippet?: string; category: SearchCategory }) => void;
}

export const SearchResults: React.FC<SearchResultsProps> = ({
  category,
  webResults,
  imageResults,
  videoResults,
  newsResults,
  isLoading,
  query,
  bookmarks,
  onToggleBookmark,
}) => {
  const [selectedImage, setSelectedImage] = useState<ImageResultItem | null>(null);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);

  const handleCopyLink = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedUrl(url);
    setTimeout(() => setCopiedUrl(null), 2000);
  };

  const isBookmarked = (url: string) => bookmarks.some((b) => b.url === url);

  // Render Skeleton Placeholders when loading
  if (isLoading) {
    return (
      <div className="space-y-6 max-w-4xl py-4 animate-pulse">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/60 relative overflow-hidden skeleton-shimmer">
            <div className="flex items-center gap-3 mb-2.5">
              <div className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-800" />
              <div className="h-3 w-36 rounded bg-slate-200 dark:bg-slate-800" />
            </div>
            <div className="h-5 w-3/4 rounded bg-slate-200 dark:bg-slate-800 mb-2.5" />
            <div className="space-y-1.5">
              <div className="h-3.5 w-full rounded bg-slate-100 dark:bg-slate-800/60" />
              <div className="h-3.5 w-5/6 rounded bg-slate-100 dark:bg-slate-800/60" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Handle empty state
  const hasItems =
    category === 'images'
      ? imageResults.length > 0
      : category === 'videos'
      ? videoResults.length > 0
      : category === 'news'
      ? newsResults.length > 0
      : webResults.length > 0;

  if (!hasItems) {
    return (
      <div className="py-16 text-center max-w-md mx-auto">
        <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 mx-auto flex items-center justify-center mb-4">
          <FileQuestion className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-2">
          No results found for "{query}"
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
          Check your spelling, try more general terms, or switch between search categories.
        </p>
      </div>
    );
  }

  // ------------------------------------------------------------------
  // 1. IMAGES TAB
  // ------------------------------------------------------------------
  if (category === 'images') {
    return (
      <>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 py-4">
          {imageResults.map((img) => (
            <div
              key={img.id}
              onClick={() => setSelectedImage(img)}
              className="group relative rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer flex flex-col"
            >
              <div className="relative aspect-4/3 w-full overflow-hidden bg-slate-200 dark:bg-slate-700">
                <img
                  src={img.url}
                  alt={img.title}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                {img.dimensions && (
                  <span className="absolute bottom-2 right-2 text-[10px] font-medium bg-black/60 backdrop-blur-md text-white px-1.5 py-0.5 rounded">
                    {img.dimensions}
                  </span>
                )}
              </div>
              <div className="p-3 bg-white dark:bg-slate-900 flex-1 flex flex-col justify-between">
                <div className="text-xs font-semibold text-slate-800 dark:text-slate-200 line-clamp-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                  {img.title}
                </div>
                <div className="text-[11px] text-slate-400 dark:text-slate-500 mt-1 truncate">
                  {img.source}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Image Lightbox View Modal */}
        {selectedImage && (
          <div
            role="dialog"
            aria-modal="true"
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in"
          >
            <div className="relative max-w-4xl w-full bg-slate-900 rounded-3xl overflow-hidden border border-slate-700 shadow-2xl flex flex-col">
              <div className="flex items-center justify-between p-4 border-b border-slate-800 text-white">
                <div className="truncate pr-4">
                  <h4 className="font-semibold text-sm sm:text-base truncate">{selectedImage.title}</h4>
                  <span className="text-xs text-slate-400">{selectedImage.source}</span>
                </div>
                <button
                  onClick={() => setSelectedImage(null)}
                  className="p-1.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="max-h-[70vh] flex items-center justify-center bg-black/50 p-4">
                <img
                  src={selectedImage.url}
                  alt={selectedImage.title}
                  className="max-h-[65vh] max-w-full object-contain rounded-xl"
                />
              </div>

              <div className="p-4 bg-slate-900/90 flex items-center justify-between gap-3 text-xs">
                <span className="text-slate-400">
                  Dimensions: {selectedImage.dimensions || 'High Resolution'}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleCopyLink(selectedImage.url)}
                    className="px-3 py-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-white transition flex items-center gap-1.5"
                  >
                    {copiedUrl === selectedImage.url ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
                    <span>{copiedUrl === selectedImage.url ? 'Link Copied' : 'Copy Image Link'}</span>
                  </button>
                  <a
                    href={selectedImage.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-1.5 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium transition flex items-center gap-1.5"
                  >
                    <span>Visit Source Website</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  // ------------------------------------------------------------------
  // 2. VIDEOS TAB
  // ------------------------------------------------------------------
  if (category === 'videos') {
    return (
      <div className="space-y-4 max-w-4xl py-4">
        {videoResults.map((vid) => (
          <div
            key={vid.id}
            className="flex flex-col sm:flex-row gap-4 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:shadow-md transition-all group"
          >
            <div className="relative sm:w-64 aspect-video rounded-xl overflow-hidden bg-slate-200 dark:bg-slate-800 shrink-0">
              <img
                src={vid.thumbnail}
                alt={vid.title}
                loading="lazy"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-black/25 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="w-10 h-10 rounded-full bg-white/90 text-slate-900 flex items-center justify-center shadow-lg">
                  <Play className="w-5 h-5 ml-0.5 fill-current" />
                </span>
              </div>
              <span className="absolute bottom-2 right-2 text-[10px] font-bold bg-black/80 text-white px-1.5 py-0.5 rounded">
                {vid.duration}
              </span>
            </div>

            <div className="flex-1 flex flex-col justify-between">
              <div>
                <a
                  href={vid.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-base sm:text-lg font-semibold text-slate-900 dark:text-slate-100 hover:text-indigo-600 dark:hover:text-indigo-400 transition leading-snug line-clamp-2"
                >
                  {vid.title}
                </a>
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-2 flex items-center gap-2">
                  <span className="font-medium text-slate-700 dark:text-slate-300">{vid.channel}</span>
                  <span>•</span>
                  <span>{vid.views}</span>
                  <span>•</span>
                  <span>{vid.uploaded}</span>
                </div>
              </div>

              <div className="mt-3 flex items-center gap-2">
                <a
                  href={vid.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 transition"
                >
                  <span>Watch Video</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
                {vid.badge && (
                  <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full">
                    {vid.badge}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // ------------------------------------------------------------------
  // 3. NEWS TAB
  // ------------------------------------------------------------------
  if (category === 'news') {
    return (
      <div className="space-y-4 max-w-4xl py-4">
        {newsResults.map((item) => (
          <div
            key={item.id}
            className="flex flex-col sm:flex-row gap-4 p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:shadow-md transition-all group"
          >
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2 text-xs text-slate-500 dark:text-slate-400">
                <span className="font-semibold text-slate-800 dark:text-slate-200">{item.source}</span>
                <span>•</span>
                <span>{item.time}</span>
              </div>
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 hover:text-indigo-600 dark:hover:text-indigo-400 transition leading-snug block mb-2"
              >
                {item.title}
              </a>
              <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
                {item.snippet}
              </p>
            </div>

            {item.thumbnail && (
              <div className="sm:w-36 aspect-4/3 rounded-xl overflow-hidden bg-slate-200 dark:bg-slate-800 shrink-0">
                <img
                  src={item.thumbnail}
                  alt={item.title}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
            )}
          </div>
        ))}
      </div>
    );
  }

  // ------------------------------------------------------------------
  // 4. WEB & ALL TAB (Default)
  // ------------------------------------------------------------------
  return (
    <div className="space-y-6 max-w-4xl py-4">
      {webResults.map((item) => {
        const bookmarked = isBookmarked(item.url);
        return (
          <article
            key={item.id}
            className="group p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800/80 shadow-xs hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-200"
          >
            {/* Header: Favicon + Domain URL Breadcrumb */}
            <div className="flex items-center justify-between gap-2 mb-1.5">
              <div className="flex items-center gap-2.5 truncate">
                <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center p-0.5 shrink-0 overflow-hidden border border-slate-200 dark:border-slate-700">
                  <img
                    src={item.favicon || `https://www.google.com/s2/favicons?domain=${item.domain}&sz=64`}
                    alt=""
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                    className="w-4 h-4 object-contain rounded-full"
                  />
                </div>
                <div className="flex items-center text-xs text-slate-600 dark:text-slate-400 truncate">
                  <span className="font-medium text-slate-800 dark:text-slate-200 truncate">
                    {item.source || item.domain}
                  </span>
                  <span className="mx-1 text-slate-400">›</span>
                  <span className="truncate text-slate-400 dark:text-slate-500">{item.domain}</span>
                </div>
              </div>

              {/* Bookmark & Copy Actions */}
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() =>
                    onToggleBookmark({
                      title: item.title,
                      url: item.url,
                      domain: item.domain,
                      snippet: item.snippet,
                      category: 'web',
                    })
                  }
                  className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-indigo-600 transition"
                  title={bookmarked ? 'Remove Bookmark' : 'Save Result'}
                >
                  {bookmarked ? (
                    <BookmarkCheck className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  ) : (
                    <Bookmark className="w-4 h-4" />
                  )}
                </button>
                <button
                  onClick={() => handleCopyLink(item.url)}
                  className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition"
                  title="Copy URL"
                >
                  {copiedUrl === item.url ? (
                    <Check className="w-4 h-4 text-emerald-500" />
                  ) : (
                    <Share2 className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Title */}
            <h3 className="mb-2">
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-lg sm:text-xl font-bold text-indigo-700 dark:text-indigo-400 hover:underline leading-snug inline-block"
              >
                {item.title}
              </a>
            </h3>

            {/* Snippet / Description */}
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              {item.date && (
                <span className="text-xs font-semibold text-slate-400 mr-2">
                  {item.date} —
                </span>
              )}
              {item.snippet}
            </p>
          </article>
        );
      })}
    </div>
  );
};
