import React, { useState, useEffect } from 'react';
import { 
  ArrowLeftRight, 
  Copy, 
  Trash2, 
  Sparkles, 
  Languages, 
  Check, 
  AlertCircle, 
  RefreshCw,
  Info
} from 'lucide-react';
import ThemeToggle from './components/ThemeToggle';
import LanguageDropdown from './components/LanguageDropdown';
import TranslationHistory from './components/TranslationHistory';
import SkeletonLoader from './components/SkeletonLoader';
import { Language, TranslationHistoryItem, ToneType } from './types';

const LANGUAGES: Language[] = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' },
  { code: 'zh', name: 'Chinese (Simplified)' },
  { code: 'ja', name: 'Japanese' },
  { code: 'ko', name: 'Korean' },
  { code: 'it', name: 'Italian' },
  { code: 'pt', name: 'Portuguese' },
  { code: 'ru', name: 'Russian' },
  { code: 'ar', name: 'Arabic' },
  { code: 'hi', name: 'Hindi' },
  { code: 'nl', name: 'Dutch' },
  { code: 'tr', name: 'Turkish' },
  { code: 'sv', name: 'Swedish' },
  { code: 'pl', name: 'Polish' },
  { code: 'vi', name: 'Vietnamese' },
  { code: 'th', name: 'Thai' },
];

const TONES = [
  { code: 'default', label: 'Default' },
  { code: 'casual', label: 'Casual' },
  { code: 'formal', label: 'Formal' },
  { code: 'professional', label: 'Professional' },
  { code: 'funny', label: 'Humorous' },
  { code: 'poetic', label: 'Poetic' },
];

const API_BASE = (import.meta as any).env?.VITE_API_BASE || '';

export default function App() {
  // Core State
  const [sourceLang, setSourceLang] = useState('auto');
  const [targetLang, setTargetLang] = useState('es');
  const [sourceText, setSourceText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [tone, setTone] = useState<ToneType>('default');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // App states
  const [serverStatus, setServerStatus] = useState<'checking' | 'connected' | 'offline'>('checking');
  const [copiedSource, setCopiedSource] = useState(false);
  const [copiedTarget, setCopiedTarget] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  
  // History State
  const [history, setHistory] = useState<TranslationHistoryItem[]>(() => {
    const stored = localStorage.getItem('translation_history');
    return stored ? JSON.parse(stored) : [];
  });

  // Verify server connection on mount
  useEffect(() => {
    const checkHealth = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/health`);
        if (res.ok) {
          setServerStatus('connected');
        } else {
          setServerStatus('offline');
        }
      } catch (err) {
        setServerStatus('offline');
      }
    };
    checkHealth();
  }, []);

  // Save history to localStorage
  useEffect(() => {
    localStorage.setItem('translation_history', JSON.stringify(history));
  }, [history]);

  // Handle Translate execution
  const handleTranslate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!sourceText.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch(`${API_BASE}/api/translate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: sourceText,
          sourceLang,
          targetLang: LANGUAGES.find(l => l.code === targetLang)?.name || targetLang,
          tone,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Something went wrong during translation.');
      }

      setTranslatedText(data.translatedText);

      // Add to history list
      const newItem: TranslationHistoryItem = {
        id: Math.random().toString(36).substring(2, 9),
        sourceText,
        translatedText: data.translatedText,
        sourceLang,
        targetLang,
        tone,
        timestamp: Date.now(),
      };
      
      setHistory(prev => [newItem, ...prev.slice(0, 49)]); // Limit to 50 items
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Unable to connect to the translation server. Ensure the backend is running.');
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-translate when typing finishes (debounce)
  useEffect(() => {
    if (!sourceText.trim()) {
      setTranslatedText('');
      setError(null);
      return;
    }

    const delayDebounceFn = setTimeout(() => {
      handleTranslate();
    }, 1200); // Translate 1.2s after user stops typing

    return () => clearTimeout(delayDebounceFn);
  }, [sourceText, sourceLang, targetLang, tone]);

  // Copy text helper
  const triggerCopy = async (text: string, isSource: boolean) => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      if (isSource) {
        setCopiedSource(true);
        setTimeout(() => setCopiedSource(false), 2000);
      } else {
        setCopiedTarget(true);
        setTimeout(() => setCopiedTarget(false), 2000);
      }
      showToast('Copied to clipboard!');
    } catch (err) {
      console.error(err);
      showToast('Failed to copy.');
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Clear inputs
  const handleClear = () => {
    setSourceText('');
    setTranslatedText('');
    setError(null);
  };

  // Swap Languages
  const handleSwap = () => {
    if (sourceLang === 'auto') {
      // If auto-detecting, we can swap target to source and set target to a default
      setSourceLang(targetLang);
      setTargetLang(sourceLang === targetLang ? 'en' : 'en');
    } else {
      const tempLang = sourceLang;
      setSourceLang(targetLang);
      setTargetLang(tempLang);
    }

    // Swap texts
    const tempText = sourceText;
    setSourceText(translatedText);
    setTranslatedText(tempText);
    setError(null);
  };

  // Restore history item
  const handleRestore = (item: TranslationHistoryItem) => {
    setSourceLang(item.sourceLang);
    setTargetLang(item.targetLang);
    setSourceText(item.sourceText);
    setTranslatedText(item.translatedText);
    setTone(item.tone as ToneType);
    setError(null);
    showToast('Restored translation from history!');
  };

  // Delete single history item
  const handleDeleteHistory = (id: string) => {
    setHistory(prev => prev.filter(item => item.id !== id));
    showToast('Item deleted.');
  };

  // Clear all history
  const handleClearHistory = () => {
    if (window.confirm('Are you sure you want to clear your entire translation history?')) {
      setHistory([]);
      showToast('History cleared.');
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      
      {/* Decorative Glow Orbs */}
      <div className="bg-glow-indigo top-[-10rem] left-[-10rem]" />
      <div className="bg-glow-violet bottom-[-15rem] right-[-10rem]" />

      {/* Main Container */}
      <div className="max-w-6xl mx-auto px-4 py-6 md:py-12 relative z-10 flex flex-col min-h-screen justify-between">
        
        {/* Navigation / Header */}
        <header className="flex items-center justify-between mb-8 md:mb-12">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-tr from-indigo-600 to-violet-500 rounded-2xl text-white shadow-lg shadow-indigo-500/25">
              <Languages className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-bold tracking-tight bg-gradient-to-r from-slate-900 via-indigo-950 to-indigo-900 dark:from-white dark:via-slate-100 dark:to-slate-300 bg-clip-text text-transparent">
                Universal AI Translator
              </h1>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className={`w-2 h-2 rounded-full ${
                  serverStatus === 'connected' ? 'bg-green-500 animate-pulse' :
                  serverStatus === 'offline' ? 'bg-red-500' : 'bg-amber-500'
                }`} />
                <span className="text-[10px] md:text-xs text-slate-400 dark:text-slate-500 font-medium">
                  {serverStatus === 'connected' ? 'AI Server Online' :
                   serverStatus === 'offline' ? 'AI Server Offline' : 'Checking connection...'}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <ThemeToggle />
          </div>
        </header>

        {/* Translation Body */}
        <main className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start mb-auto">
          
          {/* Left/Center Columns: Translation Card */}
          <div className="lg:col-span-2 space-y-6">
            <div className="glass-card p-5 md:p-6 rounded-3xl transition-all duration-300">
              
              {/* Language Toolbar & Swap */}
              <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 mb-5">
                <div className="w-full sm:flex-1">
                  <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 block mb-1.5 uppercase tracking-wider pl-1">From</span>
                  <LanguageDropdown
                    selectedCode={sourceLang}
                    onChange={setSourceLang}
                    languages={LANGUAGES}
                    showAuto={true}
                  />
                </div>

                <div className="flex items-center justify-center pt-5 sm:pt-4">
                  <button
                    onClick={handleSwap}
                    type="button"
                    title="Swap languages"
                    className="p-3 rounded-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-500 hover:text-indigo-500 hover:border-indigo-500/50 dark:hover:border-indigo-500/50 transition-all duration-200 hover:scale-105 active:scale-95 shadow-sm cursor-pointer"
                  >
                    <ArrowLeftRight className="w-4 h-4" />
                  </button>
                </div>

                <div className="w-full sm:flex-1">
                  <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 block mb-1.5 uppercase tracking-wider pl-1">To</span>
                  <LanguageDropdown
                    selectedCode={targetLang}
                    onChange={setTargetLang}
                    languages={LANGUAGES}
                    showAuto={false}
                  />
                </div>
              </div>

              {/* Text Input Areas */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-px md:bg-slate-200 md:dark:bg-slate-800/80 rounded-2xl overflow-hidden border border-slate-200/60 dark:border-slate-800/80 bg-slate-100 dark:bg-slate-900/40">
                
                {/* Source Input Card */}
                <div className="bg-white dark:bg-slate-900/90 p-4 md:p-5 flex flex-col justify-between min-h-[220px] md:min-h-[280px]">
                  <textarea
                    value={sourceText}
                    onChange={e => setSourceText(e.target.value)}
                    placeholder="Type or paste your text to translate..."
                    maxLength={5000}
                    className="w-full h-full min-h-[140px] md:min-h-[200px] resize-none bg-transparent border-0 p-0 text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:ring-0 focus:outline-none text-base md:text-lg leading-relaxed"
                  />
                  <div className="flex items-center justify-between pt-4 border-t border-slate-50 dark:border-slate-850">
                    <div className="flex items-center gap-1.5">
                      {sourceText && (
                        <>
                          <button
                            onClick={() => triggerCopy(sourceText, true)}
                            title="Copy input text"
                            className="p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-all cursor-pointer"
                          >
                            {copiedSource ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                          </button>
                          <button
                            onClick={handleClear}
                            title="Clear text"
                            className="p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-400 hover:text-red-500 dark:hover:text-red-500 transition-all cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                    <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">
                      {sourceText.length} / 5,000
                    </span>
                  </div>
                </div>

                {/* Translated Output Card */}
                <div className="bg-slate-50/50 dark:bg-slate-900/30 p-4 md:p-5 flex flex-col justify-between min-h-[220px] md:min-h-[280px] relative">
                  
                  {isLoading ? (
                    <SkeletonLoader />
                  ) : (
                    <div className={`w-full h-full min-h-[140px] md:min-h-[200px] text-slate-800 dark:text-slate-100 text-base md:text-lg leading-relaxed whitespace-pre-wrap select-text overflow-y-auto ${!translatedText ? 'text-slate-400 italic' : ''}`}>
                      {translatedText || "Translation will appear here..."}
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-4 border-t border-slate-50 dark:border-slate-850">
                    <div className="flex items-center gap-1.5">
                      {translatedText && !isLoading && (
                        <button
                          onClick={() => triggerCopy(translatedText, false)}
                          title="Copy translation"
                          className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-500 hover:text-indigo-500 transition-all cursor-pointer shadow-sm"
                        >
                          {copiedTarget ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                        </button>
                      )}
                    </div>
                    {translatedText && (
                      <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">
                        {translatedText.length} chars
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Translation Controls & Settings */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mt-5 pt-3 border-t border-slate-200/50 dark:border-slate-800/30">
                {/* Tone selection */}
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-450 whitespace-nowrap flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                    Tone:
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {TONES.map((t) => (
                      <button
                        key={t.code}
                        type="button"
                        onClick={() => setTone(t.code as ToneType)}
                        className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-all duration-150 cursor-pointer
                          ${tone === t.code 
                            ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/10' 
                            : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-350'
                          }`}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Translate Button */}
                <button
                  type="button"
                  onClick={() => handleTranslate()}
                  disabled={isLoading || !sourceText.trim() || serverStatus === 'offline'}
                  className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-medium rounded-xl shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30 transition-all duration-200 disabled:opacity-50 disabled:shadow-none cursor-pointer hover:-translate-y-0.5 active:translate-y-0 disabled:pointer-events-none text-sm md:text-base"
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Translating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      Translate Now
                    </>
                  )}
                </button>
              </div>

            </div>

            {/* Error handling card */}
            {error && (
              <div className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 rounded-2xl text-red-700 dark:text-red-300 animate-in fade-in slide-in-from-top-1 duration-200">
                <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <h4 className="text-sm font-semibold">Translation Failed</h4>
                  <p className="text-xs mt-0.5 leading-relaxed">{error}</p>
                  <button
                    onClick={() => handleTranslate()}
                    className="mt-2 text-xs font-semibold underline flex items-center gap-1 hover:text-red-800 dark:hover:text-red-200 transition-colors"
                  >
                    <RefreshCw className="w-3 h-3" /> Try Again
                  </button>
                </div>
              </div>
            )}

            {/* Quick Tips */}
            <div className="flex items-start gap-2.5 p-4 rounded-2xl bg-indigo-50/30 dark:bg-indigo-950/5 border border-indigo-100/30 dark:border-indigo-950/10 text-slate-500 dark:text-slate-400">
              <Info className="w-4.5 h-4.5 mt-0.5 text-indigo-400 flex-shrink-0" />
              <div className="text-xs leading-relaxed">
                <span className="font-semibold text-slate-700 dark:text-slate-300">Pro Tip: </span>
                By default, the translator will automatically process your input 1.2 seconds after you stop typing. You can also customize the output style by picking a different tone above!
              </div>
            </div>
          </div>

          {/* Right Column: History panel */}
          <div className="lg:col-span-1">
            <div className="glass-card p-5 md:p-6 rounded-3xl shadow-md">
              <TranslationHistory
                history={history}
                languages={LANGUAGES}
                onRestore={handleRestore}
                onDelete={handleDeleteHistory}
                onClearAll={handleClearHistory}
              />
            </div>
          </div>

        </main>

        {/* Global Toast Notification */}
        {toastMessage && (
          <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 px-4 py-2.5 rounded-full bg-slate-900/90 dark:bg-white/95 text-white dark:text-slate-900 text-xs font-semibold shadow-lg backdrop-blur-sm flex items-center gap-2 animate-in fade-in slide-in-from-bottom-4 duration-200">
            <Check className="w-3.5 h-3.5 text-green-500" />
            {toastMessage}
          </div>
        )}

        {/* Footer */}
        <footer className="mt-12 pt-6 border-t border-slate-200/50 dark:border-slate-800/30 text-center text-xs text-slate-400 dark:text-slate-500 flex flex-col sm:flex-row justify-between items-center gap-2">
          <p>© 2026 Universal AI Translator. Powered by OpenAI GPT-4o-mini.</p>
          <div className="flex items-center gap-4">
            <a href="#" className="hover:text-indigo-500 hover:underline">Privacy Policy</a>
            <a href="#" className="hover:text-indigo-500 hover:underline">Terms of Service</a>
          </div>
        </footer>

      </div>
    </div>
  );
}
