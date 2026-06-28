import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Search, Check, Globe } from 'lucide-react';
import { Language } from '../types';

interface LanguageDropdownProps {
  selectedCode: string;
  onChange: (code: string) => void;
  languages: Language[];
  showAuto?: boolean;
}

export default function LanguageDropdown({
  selectedCode,
  onChange,
  languages,
  showAuto = false,
}: LanguageDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Reset search when opening/closing
  useEffect(() => {
    if (!isOpen) setSearchQuery('');
  }, [isOpen]);

  const selectedLanguage = selectedCode === 'auto'
    ? { code: 'auto', name: 'Auto Detect' }
    : languages.find(lang => lang.code === selectedCode);

  const filteredLanguages = languages.filter(lang =>
    lang.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    lang.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelect = (code: string) => {
    onChange(code);
    setIsOpen(false);
  };

  return (
    <div className="relative inline-block w-full text-left" ref={dropdownRef}>
      <div>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`flex items-center justify-between w-full px-4 py-3 text-sm font-medium rounded-xl border transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500/20
            ${isOpen 
              ? 'bg-slate-50 dark:bg-slate-800/80 border-indigo-500/80 dark:border-indigo-500/80 text-indigo-600 dark:text-indigo-400' 
              : 'bg-white/70 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:border-slate-300 dark:hover:border-slate-700'
            }`}
        >
          <span className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-slate-400 dark:text-slate-500" />
            {selectedLanguage ? selectedLanguage.name : 'Select Language'}
          </span>
          <ChevronDown className={`w-4 h-4 ml-2 transition-transform duration-200 ${isOpen ? 'transform rotate-180 text-indigo-500' : 'text-slate-400'}`} />
        </button>
      </div>

      {isOpen && (
        <div className="absolute left-0 z-50 w-full mt-2 origin-top-right rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl ring-1 ring-black/5 dark:ring-white/5 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
          {/* Search bar inside dropdown */}
          <div className="sticky top-0 p-2 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400 dark:text-slate-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search languages..."
                className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/80 text-slate-800 dark:text-slate-200 placeholder-slate-400"
                autoFocus
              />
            </div>
          </div>

          {/* Languages list */}
          <ul className="max-h-60 overflow-y-auto py-1 divide-y divide-slate-50 dark:divide-slate-850">
            {showAuto && (
              <li key="auto">
                <button
                  type="button"
                  onClick={() => handleSelect('auto')}
                  className={`flex items-center justify-between w-full px-4 py-2.5 text-sm text-left transition-colors duration-150 cursor-pointer
                    ${selectedCode === 'auto'
                      ? 'bg-indigo-50/50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 font-semibold'
                      : 'text-slate-700 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                    }`}
                >
                  <span>Auto Detect</span>
                  {selectedCode === 'auto' && <Check className="w-4 h-4 text-indigo-500" />}
                </button>
              </li>
            )}
            
            {filteredLanguages.length > 0 ? (
              filteredLanguages.map(lang => (
                <li key={lang.code}>
                  <button
                    type="button"
                    onClick={() => handleSelect(lang.code)}
                    className={`flex items-center justify-between w-full px-4 py-2.5 text-sm text-left transition-colors duration-150 cursor-pointer
                      ${selectedCode === lang.code
                        ? 'bg-indigo-50/50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 font-semibold'
                        : 'text-slate-700 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                      }`}
                  >
                    <span>{lang.name}</span>
                    {selectedCode === lang.code && <Check className="w-4 h-4 text-indigo-500" />}
                  </button>
                </li>
              ))
            ) : (
              <li className="px-4 py-3 text-sm text-center text-slate-450 dark:text-slate-500 bg-slate-50 dark:bg-slate-950/30">
                No languages found
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
