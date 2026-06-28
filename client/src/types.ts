export interface TranslationHistoryItem {
  id: string;
  sourceText: string;
  translatedText: string;
  sourceLang: string;
  targetLang: string;
  tone: string;
  timestamp: number;
}

export type ToneType = 'default' | 'casual' | 'formal' | 'professional' | 'poetic' | 'funny';

export interface Language {
  code: string;
  name: string;
}
