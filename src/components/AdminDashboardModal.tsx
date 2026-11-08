import React, { useState, useEffect } from 'react';
import {
  X,
  Shield,
  Activity,
  Zap,
  Globe,
  Bell,
  Plus,
  Trash2,
  ExternalLink,
  CheckCircle,
  Clock,
  Sparkles,
  Users,
  Search,
} from 'lucide-react';
import { AdminMetrics, PopupOffer } from '../types';

interface AdminDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  popups: PopupOffer[];
  onRefreshPopups: () => void;
}

export const AdminDashboardModal: React.FC<AdminDashboardModalProps> = ({
  isOpen,
  onClose,
  popups,
  onRefreshPopups,
}) => {
  const [metrics, setMetrics] = useState<AdminMetrics | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'popups' | 'logs'>('overview');

  // Form for creating new popup offer / announcement
  const [newTitle, setNewTitle] = useState<string>('');
  const [newContent, setNewContent] = useState<string>('');
  const [newBadge, setNewBadge] = useState<string>('Founder Announcement');
  const [newLink, setNewLink] = useState<string>('https://siddharthacademy.org');
  const [newLinkText, setNewLinkText] = useState<string>('Learn More');
  const [newColor, setNewColor] = useState<string>('indigo');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      fetchOverview();
    }
  }, [isOpen]);

  const fetchOverview = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/overview');
      if (res.ok) {
        const data = await res.json();
        setMetrics(data);
      }
    } catch (err) {
      console.error('Failed to load admin overview:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreatePopup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/admin/popups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newTitle,
          contentHtml: newContent,
          badgeText: newBadge,
          linkUrl: newLink,
          linkText: newLinkText,
          themeColor: newColor,
        }),
      });

      if (res.ok) {
        setNewTitle('');
        setNewContent('');
        onRefreshPopups();
        alert('Announcement/Offer popup created successfully!');
      }
    } catch (err) {
      console.error('Error creating popup:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeletePopup = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/popups/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        onRefreshPopups();
      }
    } catch (err) {
      console.error('Error deleting popup:', err);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in"
    >
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <span className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-md">
              <Shield className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                Searchly Administrator Portal
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 font-semibold">
                  Siddharth Academy
                </span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                System telemetry, queries analysis &amp; announcement management
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            aria-label="Close Admin Modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-4 px-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-3 border-b-2 transition ${
              activeTab === 'overview'
                ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Overview &amp; Telemetry
          </button>
          <button
            onClick={() => setActiveTab('popups')}
            className={`py-3 border-b-2 transition flex items-center gap-1.5 ${
              activeTab === 'popups'
                ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <Bell className="w-3.5 h-3.5" />
            <span>Announcements &amp; Offers ({popups.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('logs')}
            className={`py-3 border-b-2 transition flex items-center gap-1.5 ${
              activeTab === 'logs'
                ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Live Query Logs</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {isLoading ? (
            <div className="py-12 text-center text-slate-400 text-sm">
              Loading platform telemetry...
            </div>
          ) : activeTab === 'overview' && metrics ? (
            <>
              {/* Top Key Metrics Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-4 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/60">
                  <div className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold mb-1">
                    Total Queries Served
                  </div>
                  <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
                    {metrics.totalSearches.toLocaleString()}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1">Live searches</div>
                </div>

                <div className="p-4 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/60">
                  <div className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold mb-1">
                    Direct Answer Rate
                  </div>
                  <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
                    {metrics.directAnswerRate}%
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1">Instant calculation &amp; facts</div>
                </div>

                <div className="p-4 rounded-2xl bg-amber-50/60 dark:bg-amber-950/40 border border-amber-100 dark:border-amber-900/60">
                  <div className="text-xs text-amber-600 dark:text-amber-400 font-semibold mb-1">
                    Average Latency
                  </div>
                  <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
                    {metrics.avgLatencyMs}ms
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1">High-speed pipeline</div>
                </div>

                <div className="p-4 rounded-2xl bg-purple-50/60 dark:bg-purple-950/40 border border-purple-100 dark:border-purple-900/60">
                  <div className="text-xs text-purple-600 dark:text-purple-400 font-semibold mb-1">
                    System Health
                  </div>
                  <div className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle className="w-5 h-5" />
                    <span>{metrics.status}</span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1">All providers nominal</div>
                </div>
              </div>

              {/* Languages Distribution */}
              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                  <Globe className="w-4 h-4 text-indigo-500" />
                  <span>Multilingual Query Breakdown</span>
                </h4>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800">
                    <div className="text-xs text-slate-400">English Queries</div>
                    <div className="text-xl font-bold text-slate-800 dark:text-slate-100 mt-1">
                      {metrics.languages.English}
                    </div>
                  </div>
                  <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800">
                    <div className="text-xs text-slate-400">Hindi Queries (हिन्दी)</div>
                    <div className="text-xl font-bold text-slate-800 dark:text-slate-100 mt-1">
                      {metrics.languages.Hindi}
                    </div>
                  </div>
                  <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800">
                    <div className="text-xs text-slate-400">Hinglish Queries</div>
                    <div className="text-xl font-bold text-slate-800 dark:text-slate-100 mt-1">
                      {metrics.languages.Hinglish}
                    </div>
                  </div>
                </div>
              </div>

              {/* Provider Pipeline Status */}
              <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-emerald-500" />
                  <span>Active Search &amp; Grounding Providers</span>
                </h4>
                <div className="space-y-2">
                  {metrics.systemProviders.map((prov, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 text-xs"
                    >
                      <div className="font-semibold text-slate-800 dark:text-slate-200">
                        {prov.name}
                      </div>
                      <div className="flex items-center gap-4 text-slate-500 dark:text-slate-400">
                        <span>Latency: {prov.latency}</span>
                        <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                          {prov.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : activeTab === 'popups' ? (
            <div className="space-y-6">
              {/* Form to create new Popup Offer */}
              <form
                onSubmit={handleCreatePopup}
                className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 space-y-4"
              >
                <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Plus className="w-4 h-4 text-indigo-500" />
                  <span>Publish New Announcement / Offer Popup</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Title
                    </label>
                    <input
                      type="text"
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      placeholder="e.g., Siddharth Academy Free Coding Workshop"
                      required
                      className="w-full text-xs px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Badge Text
                    </label>
                    <input
                      type="text"
                      value={newBadge}
                      onChange={(e) => setNewBadge(e.target.value)}
                      placeholder="e.g. Special Offer / New Course"
                      className="w-full text-xs px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    HTML / Message Content
                  </label>
                  <textarea
                    rows={2}
                    value={newContent}
                    onChange={(e) => setNewContent(e.target.value)}
                    placeholder="HTML supported: e.g. Join our <b>Python & AI Masterclass</b> starting this weekend!"
                    required
                    className="w-full text-xs px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Action Link URL
                    </label>
                    <input
                      type="text"
                      value={newLink}
                      onChange={(e) => setNewLink(e.target.value)}
                      placeholder="https://..."
                      className="w-full text-xs px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Link Button Text
                    </label>
                    <input
                      type="text"
                      value={newLinkText}
                      onChange={(e) => setNewLinkText(e.target.value)}
                      placeholder="e.g., Register Now"
                      className="w-full text-xs px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition shadow-sm"
                >
                  {isSubmitting ? 'Publishing...' : 'Publish Announcement Popup'}
                </button>
              </form>

              {/* List of active popups */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Active Popups ({popups.length})
                </h4>
                {popups.map((p) => (
                  <div
                    key={p.id}
                    className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex items-start justify-between gap-4"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                          {p.badgeText}
                        </span>
                        <h5 className="font-bold text-sm text-slate-900 dark:text-white">
                          {p.title}
                        </h5>
                      </div>
                      <div
                        className="text-xs text-slate-600 dark:text-slate-300 mb-2"
                        dangerouslySetInnerHTML={{ __html: p.contentHtml }}
                      />
                      <a
                        href={p.linkUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-semibold inline-flex items-center gap-1"
                      >
                        <span>{p.linkText}</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>

                    <button
                      onClick={() => handleDeletePopup(p.id)}
                      className="p-1.5 text-slate-400 hover:text-red-500 transition"
                      title="Delete popup"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* Logs Tab */
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                Recent Queries (Real-time Audit Trail)
              </h4>
              {metrics?.recentLogs && metrics.recentLogs.length > 0 ? (
                metrics.recentLogs.map((log) => (
                  <div
                    key={log.id}
                    className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="font-semibold text-slate-800 dark:text-slate-200">
                        "{log.query}"
                      </span>
                      <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                        {log.language}
                      </span>
                      {log.hasDirectAnswer && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                          Direct Answer
                        </span>
                      )}
                    </div>
                    <span className="text-slate-400">{log.latencyMs}ms</span>
                  </div>
                ))
              ) : (
                <div className="py-6 text-center text-xs text-slate-400">
                  No search logs recorded yet in this session.
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
