import { db } from './indexeddb';
import type { ExportData, ImportResult, ClearResult } from 'src/types/settings';
import type { Tag } from 'src/types/tag';

/**
 * Type guard to check if unknown data is a valid Tag-like object
 */
function isTagLike(data: unknown): data is Partial<Tag> {
  return (
    typeof data === 'object' &&
    data !== null &&
    'name' in data &&
    typeof (data as Partial<Tag>).name === 'string'
  );
}

class DataManager {
  private readonly APP_NAME = 'dictation-tools';
  private readonly VERSION = '1.0';
  private readonly MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

  /**
   * Export all data from IndexedDB as a downloadable JSON file
   */
  async exportData(): Promise<void> {
    try {
      // Collect all data from IndexedDB
      const [tags, units, vocabularyItems, dictationSessions] = await Promise.all([
        db.tags.toArray(),
        db.units.toArray(),
        db.vocabularyItems.toArray(),
        db.dictationSessions.toArray()
      ]);

      const exportData: ExportData = {
        version: this.VERSION,
        exportDate: new Date().toISOString(),
        applicationName: this.APP_NAME,
        data: {
          tags,
          units,
          vocabularyItems,
          dictationSessions
        }
      };

      // Create and download the file
      const jsonString = JSON.stringify(exportData, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);

      const fileName = `${this.APP_NAME}-backup-${new Date().toISOString().split('T')[0]}.json`;

      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      link.style.display = 'none';

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Clean up the URL object
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed:', error);
      throw new Error('Failed to export data');
    }
  }

  /**
   * Import data from a JSON file
   */
  async importData(file: File): Promise<ImportResult> {
    const result: ImportResult = {
      success: false,
      importedCount: 0,
      skippedCount: 0,
      errors: []
    };

    try {
      // Validate file
      this.validateImportFile(file);

      // Read and parse file
      const jsonString = await this.readFileAsText(file);
      const importData: ExportData = JSON.parse(jsonString);

      // Validate import data structure
      this.validateImportData(importData);

      // Import tags data
      if (importData.data.tags && Array.isArray(importData.data.tags)) {
        const tagsResult = await this.importTags(importData.data.tags);
        result.importedCount += tagsResult.importedCount;
        result.skippedCount += tagsResult.skippedCount;
        result.errors.push(...tagsResult.errors);
      }

      result.success = result.errors.length === 0;
      result.message = result.success
        ? `Successfully imported ${result.importedCount} items`
        : `Import completed with ${result.errors.length} errors`;

      return result;
    } catch (error) {
      console.error('Import failed:', error);
      result.success = false;
      result.message = error instanceof Error ? error.message : 'Import failed';
      return result;
    }
  }

  /**
   * Clear all data from IndexedDB with confirmation
   */
  async clearAllData(): Promise<ClearResult> {
    try {
      // Completely delete the entire IndexedDB database
      await db.delete();

      return {
        success: true,
        message: 'Database deleted successfully - will recreate on next access'
      };
    } catch (error) {
      console.error('Database deletion failed:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to delete database'
      };
    }
  }

  /**
   * Get all data for preview
   */
  async getAllData(): Promise<ExportData> {
    try {
      const [tags, units, vocabularyItems, dictationSessions] = await Promise.all([
        db.tags.toArray(),
        db.units.toArray(),
        db.vocabularyItems.toArray(),
        db.dictationSessions.toArray()
      ]);

      return {
        version: this.VERSION,
        exportDate: new Date().toISOString(),
        applicationName: this.APP_NAME,
        data: {
          tags,
          units,
          vocabularyItems,
          dictationSessions
        }
      };
    } catch (error) {
      console.error('Failed to get all data:', error);
      throw new Error('Failed to retrieve data');
    }
  }

  /**
   * Validate import file
   */
  private validateImportFile(file: File): void {
    // Check file type
    if (file.type !== 'application/json' && !file.name.endsWith('.json')) {
      throw new Error('Invalid file type. Only JSON files are allowed.');
    }

    // Check file size
    if (file.size > this.MAX_FILE_SIZE) {
      throw new Error('File too large. Maximum size is 10MB.');
    }

    // Check file name
    if (!file.name.toLowerCase().includes(this.APP_NAME)) {
      // This is a warning, not an error
      console.warn('File does not appear to be from this application');
    }
  }

  /**
   * Validate import data structure
   */
  private validateImportData(data: unknown): void {
    if (!data || typeof data !== 'object') {
      throw new Error('Invalid file format: Not a valid JSON object');
    }

    const importData = data as Partial<ExportData>;

    if (!importData.applicationName || importData.applicationName !== this.APP_NAME) {
      throw new Error('Invalid file: Not exported from this application');
    }

    if (!importData.data || typeof importData.data !== 'object') {
      throw new Error('Invalid file format: Missing data section');
    }

    // Version compatibility check
    if (importData.version && this.isVersionIncompatible(importData.version)) {
      throw new Error(`Incompatible version: ${importData.version}. Current version: ${this.VERSION}`);
    }
  }

  /**
   * Check if versions are compatible
   */
  private isVersionIncompatible(importVersion: string): boolean {
    // For now, only exact version matches are allowed
    return importVersion !== this.VERSION;
  }

  /**
   * Import tags with conflict detection
   */
  private async importTags(tags: unknown[]): Promise<ImportResult> {
    const result: ImportResult = {
      success: true,
      importedCount: 0,
      skippedCount: 0,
      errors: []
    };

    for (const tagData of tags) {
      try {
        // Validate tag structure
        this.validateTagData(tagData);

        // Type guard to ensure tagData is a Tag-like object
        if (!isTagLike(tagData)) {
          throw new Error('Invalid tag data: missing required properties');
        }

        // Check for existing tag with same name
        const existingTag = await db.tags.where('name').equals(tagData.name!).first();

        if (existingTag) {
          // Tag with same name exists - skip it
          result.skippedCount++;
          result.errors.push(`Tag "${tagData.name}" already exists (skipped)`);
          continue;
        }

        // Create new tag with valid structure
        const newTag: Tag = {
          id: tagData.id || crypto.randomUUID(),
          name: tagData.name!,
          color: tagData.color || '#1976D2',
          createdAt: tagData.createdAt ? new Date(tagData.createdAt) : new Date(),
          updatedAt: tagData.updatedAt ? new Date(tagData.updatedAt) : new Date()
        };

        await db.tags.add(newTag);
        result.importedCount++;
      } catch (error) {
        const tagName = isTagLike(tagData) ? tagData.name : 'unknown';
        result.errors.push(`Failed to import tag "${tagName}": ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    result.success = result.errors.length === 0;
    return result;
  }

  /**
   * Validate tag data structure
   */
  private validateTagData(tag: unknown): void {
    if (!isTagLike(tag)) {
      throw new Error('Invalid tag data: Not a valid object with name property');
    }

    if (tag.name!.trim().length < 2) {
      throw new Error('Invalid tag: Name must be at least 2 characters long');
    }

    if (tag.name!.length > 50) {
      throw new Error('Invalid tag: Name too long (max 50 characters)');
    }

    if (tag.color && typeof tag.color !== 'string') {
      throw new Error('Invalid tag: Color must be a string');
    }
  }

  /**
   * Read file as text
   */
  private readFileAsText(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = () => {
        if (typeof reader.result === 'string') {
          resolve(reader.result);
        } else {
          reject(new Error('Failed to read file content'));
        }
      };

      reader.onerror = () => {
        reject(new Error('Failed to read file'));
      };

      reader.readAsText(file);
    });
  }
}

// Export singleton instance
export const dataManager = new DataManager();