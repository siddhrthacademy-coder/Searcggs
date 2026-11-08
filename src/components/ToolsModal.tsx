import React, { useState } from 'react';
import { X, Calculator, Languages, ArrowRightLeft, Check, Copy } from 'lucide-react';

interface ToolsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSearchQuery: (query: string) => void;
}

export const ToolsModal: React.FC<ToolsModalProps> = ({ isOpen, onClose, onSearchQuery }) => {
  const [activeTool, setActiveTool] = useState<'calc' | 'translate' | 'convert'>('calc');

  // Calculator State
  const [calcDisplay, setCalcDisplay] = useState<string>('0');
  const [calcFormula, setCalcFormula] = useState<string>('');

  // Translator State
  const [translateInput, setTranslateInput] = useState<string>('Namaste, how are you?');
  const [translateOutput, setTranslateOutput] = useState<string>('नमस्ते, आप कैसे हैं?');
  const [translateDirection, setTranslateDirection] = useState<'en-hi' | 'hi-en'>('en-hi');

  // Unit Converter State
  const [convertType, setConvertType] = useState<'currency' | 'temp' | 'length'>('currency');
  const [convertVal, setConvertVal] = useState<number>(100);

  if (!isOpen) return null;

  const handleCalcBtn = (char: string) => {
    if (char === 'C') {
      setCalcDisplay('0');
      setCalcFormula('');
      return;
    }
    if (char === '=') {
      try {
        const sanitized = calcFormula.replace(/×/g, '*').replace(/÷/g, '/');
        // eslint-disable-next-line no-new-func
        const res = Function(`"use strict"; return (${sanitized})`)();
        setCalcDisplay(String(res));
        setCalcFormula(`${calcFormula} = ${res}`);
      } catch {
        setCalcDisplay('Error');
      }
      return;
    }

    if (calcDisplay === '0' || calcFormula.includes('=')) {
      setCalcDisplay(char);
      setCalcFormula(char);
    } else {
      setCalcDisplay((prev) => prev + char);
      setCalcFormula((prev) => prev + char);
    }
  };

  const handleTranslate = () => {
    // Quick dictionary translation mapping or trigger Searchly search
    if (translateDirection === 'en-hi') {
      if (translateInput.toLowerCase().includes('what is your name')) {
        setTranslateOutput('आपका नाम क्या है?');
      } else if (translateInput.toLowerCase().includes('thank you')) {
        setTranslateOutput('धन्यवाद');
      } else {
        setTranslateOutput(`अनुवाद: "${translateInput}" (Searching Searchly...)`);
      }
    } else {
      if (translateInput.includes('वह')) {
        setTranslateOutput('He / She / That');
      } else {
        setTranslateOutput(`Translation for: "${translateInput}"`);
      }
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in"
    >
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Calculator className="w-4 h-4" />
            </span>
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              Searchly Quick Tools
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tools Tabs */}
        <div className="flex gap-2 my-4 bg-slate-100 dark:bg-slate-800/60 p-1 rounded-2xl text-xs font-semibold">
          <button
            onClick={() => setActiveTool('calc')}
            className={`flex-1 py-2 rounded-xl transition ${
              activeTool === 'calc'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Calculator
          </button>
          <button
            onClick={() => setActiveTool('translate')}
            className={`flex-1 py-2 rounded-xl transition ${
              activeTool === 'translate'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Translator (EN-HI)
          </button>
          <button
            onClick={() => setActiveTool('convert')}
            className={`flex-1 py-2 rounded-xl transition ${
              activeTool === 'convert'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Unit Converter
          </button>
        </div>

        {/* 1. Calculator Content */}
        {activeTool === 'calc' && (
          <div>
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 text-right mb-4">
              <div className="text-xs text-slate-400 font-mono h-4">
                {calcFormula}
              </div>
              <div className="text-2xl font-bold font-mono text-slate-900 dark:text-white">
                {calcDisplay}
              </div>
            </div>

            <div className="grid grid-cols-4 gap-2 text-sm font-bold">
              {['C', '(', ')', '÷', '7', '8', '9', '×', '4', '5', '6', '-', '1', '2', '3', '+', '0', '.', '%', '='].map(
                (btn) => (
                  <button
                    key={btn}
                    onClick={() => handleCalcBtn(btn)}
                    className={`py-3 rounded-xl transition shadow-xs ${
                      btn === '='
                        ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                        : btn === 'C'
                        ? 'bg-red-50 text-red-600 dark:bg-red-950/60 dark:text-red-400 hover:bg-red-100'
                        : ['÷', '×', '-', '+', '%'].includes(btn)
                        ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    {btn}
                  </button>
                )
              )}
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <button
                onClick={() => {
                  onSearchQuery(calcFormula || calcDisplay);
                  onClose();
                }}
                className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                Search this formula in Searchly &rarr;
              </button>
            </div>
          </div>
        )}

        {/* 2. Translator Content */}
        {activeTool === 'translate' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-600 dark:text-slate-300">
              <span>{translateDirection === 'en-hi' ? 'English' : 'हिन्दी (Hindi)'}</span>
              <button
                onClick={() =>
                  setTranslateDirection(translateDirection === 'en-hi' ? 'hi-en' : 'en-hi')
                }
                className="p-1 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200"
              >
                <ArrowRightLeft className="w-3.5 h-3.5 text-indigo-500" />
              </button>
              <span>{translateDirection === 'en-hi' ? 'हिन्दी (Hindi)' : 'English'}</span>
            </div>

            <div>
              <textarea
                rows={3}
                value={translateInput}
                onChange={(e) => setTranslateInput(e.target.value)}
                placeholder="Enter text to translate..."
                className="w-full text-xs p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div className="p-3 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/60">
              <div className="text-[11px] font-semibold text-slate-400 mb-1">Translation:</div>
              <div className="text-sm font-bold text-slate-900 dark:text-white">
                {translateOutput}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <button
                onClick={handleTranslate}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition"
              >
                Translate Now
              </button>
              <button
                onClick={() => {
                  onSearchQuery(`"${translateInput}" in ${translateDirection === 'en-hi' ? 'Hindi' : 'English'}`);
                  onClose();
                }}
                className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                Search full meaning in Searchly &rarr;
              </button>
            </div>
          </div>
        )}

        {/* 3. Unit Converter */}
        {activeTool === 'convert' && (
          <div className="space-y-4">
            <div className="flex gap-2 text-xs">
              <button
                onClick={() => setConvertType('currency')}
                className={`px-3 py-1.5 rounded-full font-semibold transition ${
                  convertType === 'currency'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                }`}
              >
                USD to INR
              </button>
              <button
                onClick={() => setConvertType('temp')}
                className={`px-3 py-1.5 rounded-full font-semibold transition ${
                  convertType === 'temp'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                }`}
              >
                °C to °F
              </button>
              <button
                onClick={() => setConvertType('length')}
                className={`px-3 py-1.5 rounded-full font-semibold transition ${
                  convertType === 'length'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                }`}
              >
                Miles to KM
              </button>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                Value
              </label>
              <input
                type="number"
                value={convertVal}
                onChange={(e) => setConvertVal(parseFloat(e.target.value) || 0)}
                className="w-full text-xs p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none"
              />
            </div>

            <div className="p-4 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/60">
              <div className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold mb-1">
                Converted Result:
              </div>
              <div className="text-xl font-bold text-slate-900 dark:text-white">
                {convertType === 'currency' && (
                  <span>${convertVal} USD ≈ ₹{(convertVal * 86.85).toFixed(2)} INR</span>
                )}
                {convertType === 'temp' && (
                  <span>{convertVal}°C = {((convertVal * 9) / 5 + 32).toFixed(1)}°F</span>
                )}
                {convertType === 'length' && (
                  <span>{convertVal} Miles = {(convertVal * 1.60934).toFixed(2)} Kilometers</span>
                )}
              </div>
            </div>

            <button
              onClick={() => {
                const q =
                  convertType === 'currency'
                    ? `${convertVal} USD to INR`
                    : convertType === 'temp'
                    ? `${convertVal} C to F`
                    : `${convertVal} miles to km`;
                onSearchQuery(q);
                onClose();
              }}
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline block text-right"
            >
              Search live exchange rate &rarr;
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
