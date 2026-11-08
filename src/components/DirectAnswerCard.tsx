import React, { useState, useEffect } from 'react';
import {
  Volume2,
  VolumeX,
  Play,
  Pause,
  Square,
  Copy,
  Check,
  Sparkles,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  HelpCircle,
  MessageSquare,
  BookOpen,
} from 'lucide-react';
import { DirectAnswer } from '../types';

interface DirectAnswerCardProps {
  answer: DirectAnswer;
  query: string;
  onFollowUpClick: (q: string) => void;
  onOpenAIMode?: (initialPrompt: string) => void;
}

export const DirectAnswerCard: React.FC<DirectAnswerCardProps> = ({
  answer,
  query,
  onFollowUpClick,
  onOpenAIMode,
}) => {
  const [copied, setCopied] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [speechRate, setSpeechRate] = useState<number>(1);
  const [showVoiceSettings, setShowVoiceSettings] = useState<boolean>(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoiceURI, setSelectedVoiceURI] = useState<string>('');
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  // Initialize Speech Synthesis Voices
  useEffect(() => {
    if ('speechSynthesis' in window) {
      const updateVoices = () => {
        const available = window.speechSynthesis.getVoices();
        setVoices(available);
        if (available.length > 0 && !selectedVoiceURI) {
          // Check if query has Hindi characters
          const isHindi = /[\u0900-\u097F]/.test(query) || answer.highlightedAnswer.includes('वह');
          const preferred = available.find((v) =>
            isHindi ? v.lang.startsWith('hi') : v.lang.startsWith('en')
          );
          if (preferred) setSelectedVoiceURI(preferred.voiceURI);
        }
      };

      updateVoices();
      window.speechSynthesis.onvoiceschanged = updateVoices;
    }

    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [query, answer]);

  const handleCopy = () => {
    const textToCopy = `${answer.highlightedAnswer}${
      answer.fullExplanation ? `\n\n${answer.fullExplanation}` : ''
    }`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleStartSpeech = () => {
    if (!('speechSynthesis' in window)) return;

    if (isPaused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
      setIsSpeaking(true);
      return;
    }

    window.speechSynthesis.cancel();

    const fullSpeechText = `${answer.highlightedAnswer}. ${answer.fullExplanation || ''}`;
    const utterance = new SpeechSynthesisUtterance(fullSpeechText);
    utterance.rate = speechRate;

    if (selectedVoiceURI) {
      const voice = voices.find((v) => v.voiceURI === selectedVoiceURI);
      if (voice) utterance.voice = voice;
    }

    utterance.onstart = () => {
      setIsSpeaking(true);
      setIsPaused(false);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      setIsPaused(false);
    };

    utterance.onerror = () => {
      setIsSpeaking(false);
      setIsPaused(false);
    };

    window.speechSynthesis.speak(utterance);
  };

  const handlePauseSpeech = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.pause();
      setIsPaused(true);
      setIsSpeaking(false);
    }
  };

  const handleStopSpeech = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      setIsPaused(false);
    }
  };

  const getCategoryBadge = () => {
    switch (answer.category) {
      case 'calculation':
        return { label: 'Direct Calculation', color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300' };
      case 'translation':
        return { label: 'Language Translation', color: 'bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300' };
      case 'definition':
        return { label: 'Knowledge & Definition', color: 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300' };
      default:
        return { label: 'AI Direct Answer', color: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300' };
    }
  };

  const badge = getCategoryBadge();

  return (
    <div className="mb-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden">
      {/* Top Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-6 pt-5 pb-3 border-b border-slate-100 dark:border-slate-800/80">
        <div className="flex items-center gap-2">
          <span className="flex items-center justify-center w-7 h-7 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
            <Sparkles className="w-4 h-4" />
          </span>
          <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${badge.color}`}>
            {badge.label}
          </span>
          {answer.source && (
            <span className="text-xs text-slate-500 dark:text-slate-400 hidden sm:inline">
              via {answer.source}
            </span>
          )}
        </div>

        {/* Action Controls: Copy & Read Aloud */}
        <div className="flex items-center gap-1.5">
          {/* Read Aloud Controller */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-full p-1 text-slate-600 dark:text-slate-300">
            {!isSpeaking && !isPaused ? (
              <button
                onClick={handleStartSpeech}
                className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium hover:text-indigo-600 dark:hover:text-indigo-400 transition"
                title="Read aloud"
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span>Listen</span>
              </button>
            ) : (
              <>
                {isSpeaking ? (
                  <button
                    onClick={handlePauseSpeech}
                    className="p-1 hover:text-indigo-600 transition"
                    title="Pause reading"
                  >
                    <Pause className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <button
                    onClick={handleStartSpeech}
                    className="p-1 hover:text-indigo-600 transition"
                    title="Resume reading"
                  >
                    <Play className="w-3.5 h-3.5" />
                  </button>
                )}
                <button
                  onClick={handleStopSpeech}
                  className="p-1 hover:text-red-500 transition"
                  title="Stop reading"
                >
                  <Square className="w-3.5 h-3.5" />
                </button>
              </>
            )}

            {/* Speed toggle */}
            <button
              onClick={() => {
                const nextRates = [0.75, 1, 1.25, 1.5];
                const nextIdx = (nextRates.indexOf(speechRate) + 1) % nextRates.length;
                setSpeechRate(nextRates[nextIdx]);
              }}
              className="px-2 text-[11px] font-bold text-indigo-600 dark:text-indigo-400 border-l border-slate-300 dark:border-slate-700 ml-1"
              title="Change speech rate"
            >
              {speechRate}x
            </button>
          </div>

          {/* Copy Button */}
          <button
            onClick={handleCopy}
            className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
            title="Copy answer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
        </div>
      </div>

      {/* Main Highlighted Answer */}
      <div className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight mb-3">
              {answer.highlightedAnswer}
            </div>

            {/* Formula / Secondary Details */}
            {answer.formula && (
              <div className="text-sm font-mono text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl border border-slate-200/60 dark:border-slate-700/60 mb-3 inline-block">
                {answer.formula}
              </div>
            )}

            {/* Context & Full Explanation */}
            {answer.fullExplanation && (
              <p className="text-slate-700 dark:text-slate-300 text-sm sm:text-base leading-relaxed">
                {answer.fullExplanation}
              </p>
            )}

            {/* Bullet points if available */}
            {answer.keyTakeaways && answer.keyTakeaways.length > 0 && (
              <ul className="mt-3 space-y-1.5 list-disc list-inside text-sm text-slate-600 dark:text-slate-300">
                {answer.keyTakeaways.map((point, idx) => (
                  <li key={idx}>{point}</li>
                ))}
              </ul>
            )}
          </div>

          {/* Thumbnail preview if available */}
          {answer.thumbnail && (
            <div className="shrink-0 hidden sm:block w-24 h-24 rounded-2xl overflow-hidden shadow-sm border border-slate-200 dark:border-slate-800">
              <img
                src={answer.thumbnail}
                alt={answer.highlightedAnswer}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
          )}
        </div>

        {/* Source Citations & Grounding Links */}
        {answer.sources && answer.sources.length > 0 && (
          <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Sources &amp; Citations:
            </span>
            {answer.sources.map((s, idx) => (
              <a
                key={idx}
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
              >
                <img
                  src={`https://www.google.com/s2/favicons?domain=${s.domain}&sz=32`}
                  alt=""
                  className="w-3.5 h-3.5 rounded-full"
                />
                <span className="truncate max-w-[130px] font-medium">{s.title || s.domain}</span>
                <ExternalLink className="w-2.5 h-2.5 opacity-60" />
              </a>
            ))}
          </div>
        )}

        {/* Deep Dive in AI Mode & Follow-up questions */}
        <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800/80 flex flex-wrap items-center justify-between gap-3">
          {answer.relatedQuestions && answer.relatedQuestions.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs text-slate-400 flex items-center gap-1">
                <HelpCircle className="w-3 h-3" /> People also ask:
              </span>
              {answer.relatedQuestions.slice(0, 3).map((rq, idx) => (
                <button
                  key={idx}
                  onClick={() => onFollowUpClick(rq)}
                  className="text-xs px-3 py-1 rounded-full bg-indigo-50/70 hover:bg-indigo-100 dark:bg-indigo-950/40 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 transition text-left"
                >
                  {rq}
                </button>
              ))}
            </div>
          )}

          {onOpenAIMode && (
            <button
              onClick={() => onOpenAIMode(query)}
              className="ml-auto inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-sm transition"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Deep Dive in AI Mode</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
