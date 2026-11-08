import React, { useState } from 'react';
import { X, Sparkles, ExternalLink } from 'lucide-react';
import { PopupOffer } from '../types';

interface AnnouncementPopupProps {
  popup: PopupOffer | null;
  onDismiss: () => void;
}

export const AnnouncementPopup: React.FC<AnnouncementPopupProps> = ({ popup, onDismiss }) => {
  if (!popup) return null;

  return (
    <div className="fixed bottom-5 right-5 z-40 max-w-sm w-full bg-white dark:bg-slate-900 border border-indigo-200 dark:border-indigo-900/60 rounded-3xl shadow-2xl p-5 animate-in slide-in-from-bottom-5 duration-300">
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex items-center gap-2">
          <span className="w-6 h-6 rounded-lg bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <Sparkles className="w-3.5 h-3.5" />
          </span>
          <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
            {popup.badgeText}
          </span>
        </div>
        <button
          onClick={onDismiss}
          className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition p-1"
          title="Dismiss notification"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <h4 className="font-bold text-sm text-slate-900 dark:text-white mb-1.5">
        {popup.title}
      </h4>

      <div
        className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-3"
        dangerouslySetInnerHTML={{ __html: popup.contentHtml }}
      />

      <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
        <a
          href={popup.linkUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
        >
          <span>{popup.linkText}</span>
          <ExternalLink className="w-3 h-3" />
        </a>
        <button
          onClick={onDismiss}
          className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 text-[11px]"
        >
          Got it
        </button>
      </div>
    </div>
  );
};
