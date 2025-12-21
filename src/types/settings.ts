import type { Tag } from './tag';
import type { Unit, VocabularyItem } from './unit';
import type { DictationSession } from './dictation';
import type { DictationSettings } from './dictation';

export interface DataSection {
  name: string;
  count: number;
  visible: boolean;
  data: Tag[];
}

export interface AppSettings {
  dictation: DictationSettings;
}

export const DEFAULT_SETTINGS: AppSettings = {
  dictation: {
    playCount: 2,
    interval: 3
  }
} as const;

export interface ExportData {
  version: string;
  exportDate: string;
  applicationName: string;
  data: {
    tags: Tag[];
    units: Unit[];
    vocabularyItems: VocabularyItem[];
    dictationSessions: DictationSession[];
  };
}

export interface ImportResult {
  success: boolean;
  importedCount: number;
  skippedCount: number;
  errors: string[];
  message?: string;
}

export interface ClearResult {
  success: boolean;
  message?: string;
}

export interface ImportConflict {
  type: 'duplicate' | 'invalid';
  item: unknown;
  reason: string;
}