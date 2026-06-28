import { useState } from 'react';
import { Trash2, RotateCcw, Copy, Check, History, Languages } from 'lucide-react';
import { TranslationHistoryItem, Language } from '../types';

interface TranslationHistoryProps {
  history: TranslationHistoryItem[];
  languages: Language[];
  onRestore: (item: TranslationHistoryItem) => void;
  onDelete: (id: string) => void;
  onClearAll: () => void;
}

export default function TranslationHistory({
  history,
  languages,
  onRestore,
  onDelete,
  onClearAll,
}: TranslationHistoryProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const getLanguageName = (code: string) => {
    if (code === 'auto') return 'Auto Detect';
    const found = languages.find(lang => lang.code === code);
    return found ? found.name : code.toUpperCase();
  };

  const handleCopy = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  if (history.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 rounded-2xl border border-slate-200/50 dark:border-slate-800/40 bg-white/40 dark:bg-slate-900/20 text-center">
        <History className="w-10 h-10 text-slate-300 dark:text-slate-700 mb-2" />
        <h3 className="text-sm font-medium text-slate-600 dark:text-slate-450">No Translation History</h3>
        <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 max-w-[200px]">
          Your translation history will appear here once you translate some text.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
          <History className="w-4 h-4 text-indigo-500" />
          Translation History
        </h3>
        <button
          onClick={onClearAll}
          className="text-xs font-medium text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 flex items-center gap-1 cursor-pointer py-1 px-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/20 transition-all"
        >
          <Trash2 className="w-3.5 h-3.5" />
          Clear All
        </button>
      </div>

      <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
        {history.map((item) => (
          <div
            key={item.id}
            className="group relative p-4 rounded-xl border border-slate-100 dark:border-slate-850 bg-white/70 dark:bg-slate-900/50 hover:bg-white dark:hover:bg-slate-900 hover:border-slate-200 dark:hover:border-slate-800 shadow-sm transition-all duration-200"
          >
            {/* Lang pair & tone badge */}
            <div className="flex items-center justify-between mb-2 text-xs">
              <span className="flex items-center gap-1.5 font-medium text-slate-500 dark:text-slate-450">
                <span>{getLanguageName(item.sourceLang)}</span>
                <Languages className="w-3.5 h-3.5 text-indigo-400" />
                <span>{getLanguageName(item.targetLang)}</span>
              </span>

              {item.tone && item.tone !== 'default' && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 capitalize">
                  {item.tone}
                </span>
              )}
            </div>

            {/* Source & Translated Texts */}
            <div className="space-y-1.5 mb-3 text-sm">
              <div className="text-slate-700 dark:text-slate-300 font-normal line-clamp-2">
                {item.sourceText}
              </div>
              <div className="text-indigo-600 dark:text-indigo-400 font-medium line-clamp-2 pl-2 border-l border-indigo-100 dark:border-indigo-950">
                {item.translatedText}
              </div>
            </div>

            {/* Action buttons (revealed on hover/active) */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-50 dark:border-slate-850">
              <span className="text-[10px] text-slate-400 dark:text-slate-500">
                {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => handleCopy(item.translatedText, item.id)}
                  title="Copy Translation"
                  className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-950/20 transition-all cursor-pointer"
                >
                  {copiedId === item.id ? (
                    <Check className="w-3.5 h-3.5 text-green-500" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
                <button
                  onClick={() => onRestore(item)}
                  title="Restore to Translator"
                  className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-950/20 transition-all cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => onDelete(item.id)}
                  title="Delete from History"
                  className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
