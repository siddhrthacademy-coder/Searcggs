export type SearchCategory = 'all' | 'web' | 'images' | 'videos' | 'news';

export type LanguageCode = 'auto' | 'en' | 'hi' | 'hinglish';

export interface GroundingSource {
  title: string;
  url: string;
  domain: string;
}

export interface DirectAnswer {
  isDirectAnswer: boolean;
  category: 'calculation' | 'translation' | 'fact' | 'definition' | 'summary';
  highlightedAnswer: string;
  fullExplanation?: string;
  formula?: string;
  source?: string;
  sourceUrl?: string;
  thumbnail?: string;
  confidence?: string;
  relatedQuestions?: string[];
  keyTakeaways?: string[];
  sources?: GroundingSource[];
}

export interface WebResultItem {
  id: string;
  title: string;
  url: string;
  domain: string;
  snippet: string;
  favicon: string;
  date?: string;
  source?: string;
  thumbnail?: string;
}

export interface ImageResultItem {
  id: string;
  title: string;
  url: string;
  source: string;
  sourceUrl: string;
  dimensions?: string;
}

export interface VideoResultItem {
  id: string;
  title: string;
  channel: string;
  duration: string;
  views: string;
  uploaded: string;
  thumbnail: string;
  url: string;
  embedUrl?: string;
  badge?: string;
}

export interface NewsResultItem {
  id: string;
  title: string;
  source: string;
  domain: string;
  time: string;
  snippet: string;
  url: string;
  thumbnail?: string;
}

export interface SearchResponseData {
  query: string;
  type: SearchCategory;
  language: string;
  latencyMs: number;
  totalEstimatedResults: number;
  provider: string;
  directAnswer?: DirectAnswer | null;
  results: {
    web: WebResultItem[];
    images: ImageResultItem[];
    videos: VideoResultItem[];
    news: NewsResultItem[];
  };
  relatedQuestions: string[];
}

export interface PopupOffer {
  id: string;
  title: string;
  contentHtml: string;
  badgeText: string;
  linkUrl: string;
  linkText: string;
  isActive: boolean;
  themeColor: string;
  createdAt: number;
}

export interface AdminMetrics {
  project: string;
  founder: string;
  contact: string;
  status: string;
  totalSearches: number;
  directAnswerRate: number;
  avgLatencyMs: number;
  languages: {
    English: number;
    Hindi: number;
    Hinglish: number;
  };
  recentLogs: Array<{
    id: string;
    query: string;
    category: string;
    language: string;
    timestamp: number;
    hasDirectAnswer: boolean;
    latencyMs: number;
  }>;
  systemProviders: Array<{
    name: string;
    status: string;
    latency: string;
    quota: string;
  }>;
}

export interface UserBookmark {
  id: string;
  title: string;
  url: string;
  domain: string;
  snippet?: string;
  category: SearchCategory;
  savedAt: number;
}
