import type { Tag } from './tag';

export interface DataSection {
  name: string;
  count: number;
  visible: boolean;
  data: Tag[];
}

export interface ExportData {
  version: string;
  exportDate: string;
  applicationName: string;
  data: {
    tags: Tag[];
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