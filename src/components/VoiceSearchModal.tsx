import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, X, RotateCcw, ArrowRight, Globe, AlertCircle, Volume2 } from 'lucide-react';

interface VoiceSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSearch: (spokenQuery: string) => void;
  defaultLang?: string;
}

export const VoiceSearchModal: React.FC<VoiceSearchModalProps> = ({
  isOpen,
  onClose,
  onSearch,
  defaultLang = 'auto',
}) => {
  const [isListening, setIsListening] = useState<boolean>(false);
  const [transcript, setTranscript] = useState<string>('');
  const [interimText, setInterimText] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [selectedVoiceLang, setSelectedVoiceLang] = useState<string>(
    defaultLang === 'hi' ? 'hi-IN' : 'en-US'
  );
  const [isSupported, setIsSupported] = useState<boolean>(true);
  const recognitionRef = useRef<any>(null);
  const silenceTimerRef = useRef<any>(null);

  useEffect(() => {
    if (defaultLang === 'hi') {
      setSelectedVoiceLang('hi-IN');
    } else {
      setSelectedVoiceLang('en-US');
    }
  }, [defaultLang]);

  useEffect(() => {
    // Check SpeechRecognition support in browser
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setIsSupported(false);
      setErrorMsg('Speech recognition is not supported in this browser. You can type your query in the search bar.');
      return;
    }

    if (isOpen) {
      startRecognition();
    } else {
      stopRecognition();
      setTranscript('');
      setInterimText('');
      setErrorMsg(null);
    }

    return () => {
      stopRecognition();
    };
  }, [isOpen, selectedVoiceLang]);

  const startRecognition = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) return;

    setErrorMsg(null);
    setTranscript('');
    setInterimText('');

    try {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }

      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = selectedVoiceLang;

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        let finalTrans = '';
        let interimTrans = '';

        for (let i = 0; i < event.results.length; i++) {
          const res = event.results[i];
          if (res.isFinal) {
            finalTrans += res[0].transcript;
          } else {
            interimTrans += res[0].transcript;
          }
        }

        const currentText = finalTrans || interimTrans;
        if (finalTrans) {
          setTranscript((prev) => (prev ? prev + ' ' + finalTrans : finalTrans));
        }
        setInterimText(interimTrans);

        // Reset silence timer: when user pauses for 1.8 seconds after speaking words, auto-submit
        if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
        if (currentText.trim().length > 1) {
          silenceTimerRef.current = setTimeout(() => {
            handleCompleteSearch(currentText.trim());
          }, 1800);
        }
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        if (event.error === 'not-allowed') {
          setErrorMsg('Microphone access was denied. Please allow microphone permissions in your browser address bar.');
        } else if (event.error === 'no-speech') {
          // Keep listening or prompt user
        } else {
          setErrorMsg(`Voice search note: ${event.error}. You can try again or edit text.`);
        }
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err: any) {
      console.error('Failed to start speech recognition:', err);
      setErrorMsg('Could not initialize microphone. Please check permissions.');
      setIsListening(false);
    }
  };

  const stopRecognition = () => {
    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // ignore
      }
      recognitionRef.current = null;
    }
    setIsListening(false);
  };

  const handleCompleteSearch = (textToSearch?: string) => {
    const finalQuery = (textToSearch || transcript || interimText).trim();
    if (finalQuery) {
      stopRecognition();
      onSearch(finalQuery);
      onClose();
    }
  };

  if (!isOpen) return null;

  const displayText = transcript || interimText;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-8 flex flex-col items-center text-center overflow-hidden">
        {/* Close Button */}
        <button
          onClick={() => {
            stopRecognition();
            onClose();
          }}
          className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          aria-label="Close Voice Search"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Language Selector in Voice Modal */}
        <div className="flex items-center gap-2 mb-6 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-xs text-slate-600 dark:text-slate-300">
          <Globe className="w-3.5 h-3.5 text-indigo-500" />
          <span className="font-medium">Voice Language:</span>
          <select
            value={selectedVoiceLang}
            onChange={(e) => {
              setSelectedVoiceLang(e.target.value);
            }}
            className="bg-transparent font-semibold text-indigo-600 dark:text-indigo-400 focus:outline-none cursor-pointer"
          >
            <option value="en-US">English (US)</option>
            <option value="en-IN">English (India)</option>
            <option value="hi-IN">हिन्दी (Hindi)</option>
            <option value="es-ES">Español</option>
          </select>
        </div>

        {/* Status Prompt */}
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-2">
          {isListening ? 'Listening...' : displayText ? 'Recognized Voice Query' : 'Tap mic to speak'}
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-8 max-w-sm">
          {isListening
            ? 'Speak clearly in English, Hindi, or ask any question...'
            : 'Click microphone to record, or submit recognized query'}
        </p>

        {/* Large Animated Microphone Visual */}
        <div className="relative my-4 flex items-center justify-center">
          {isListening && (
            <>
              <div className="absolute w-36 h-36 rounded-full bg-indigo-500/20 dark:bg-indigo-500/30 animate-voice-listening pointer-events-none" />
              <div className="absolute w-48 h-48 rounded-full bg-red-500/10 dark:bg-red-500/20 animate-voice-ripple pointer-events-none" />
            </>
          )}

          <button
            onClick={() => {
              if (isListening) {
                stopRecognition();
              } else {
                startRecognition();
              }
            }}
            className={`relative z-10 w-28 h-28 rounded-full flex items-center justify-center shadow-xl transition-all duration-300 transform active:scale-95 ${
              isListening
                ? 'bg-gradient-to-tr from-red-500 to-rose-600 text-white shadow-red-500/40 ring-4 ring-red-400/30'
                : 'bg-gradient-to-tr from-indigo-600 to-blue-600 text-white hover:from-indigo-700 hover:to-blue-700 shadow-indigo-500/30'
            }`}
            aria-label={isListening ? 'Stop listening' : 'Start listening'}
          >
            {isListening ? (
              <Mic className="w-12 h-12 animate-pulse" />
            ) : (
              <MicOff className="w-11 h-11" />
            )}
          </button>
        </div>

        {/* Live Audio Equalizer Waveform */}
        {isListening && (
          <div className="flex items-center justify-center gap-1.5 h-10 mt-6 mb-2">
            <span className="w-1 bg-red-500 rounded-full wave-bar-1"></span>
            <span className="w-1 bg-amber-500 rounded-full wave-bar-2"></span>
            <span className="w-1 bg-emerald-500 rounded-full wave-bar-3"></span>
            <span className="w-1 bg-blue-500 rounded-full wave-bar-4"></span>
            <span className="w-1 bg-indigo-500 rounded-full wave-bar-5"></span>
          </div>
        )}

        {/* Live Recognized Text Box */}
        <div className="w-full mt-6 min-h-[90px] p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 flex flex-col items-center justify-center">
          {displayText ? (
            <div className="w-full">
              <input
                type="text"
                value={displayText}
                onChange={(e) => {
                  setTranscript(e.target.value);
                  setInterimText('');
                }}
                className="w-full text-center text-lg sm:text-xl font-medium text-slate-800 dark:text-slate-100 bg-transparent border-b border-dashed border-indigo-400 dark:border-indigo-500 focus:outline-none pb-1"
                placeholder="Edit query..."
              />
              <span className="text-xs text-indigo-500 dark:text-indigo-400 mt-2 block">
                Editable query text (press Enter or Search below)
              </span>
            </div>
          ) : (
            <span className="text-slate-400 dark:text-slate-500 italic text-base">
              Say something like: "What is the capital of India", "वह को English में क्या कहते हैं", or "25 * 4"
            </span>
          )}
        </div>

        {/* Error notification if microphone is blocked or error occurs */}
        {errorMsg && (
          <div className="mt-4 flex items-center gap-2 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 text-xs text-left border border-amber-200 dark:border-amber-800">
            <AlertCircle className="w-4 h-4 shrink-0 text-amber-600 dark:text-amber-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Modal Action Controls */}
        <div className="mt-8 flex items-center justify-center gap-3 w-full">
          <button
            onClick={() => {
              setTranscript('');
              setInterimText('');
              startRecognition();
            }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Try Again</span>
          </button>

          <button
            onClick={() => handleCompleteSearch()}
            disabled={!displayText.trim()}
            className="flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed shadow-md shadow-indigo-600/20 transition"
          >
            <span>Search Now</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
