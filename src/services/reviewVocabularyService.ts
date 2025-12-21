import type { ReviewVocabulary, ReviewMemoryState } from '../types/review'
import type { DictationResult } from '../types/dictation'
import { db, vocabularyService } from './index'

export class ReviewVocabularyService {
  /**
   * Add vocabulary to review library from a dictation error
   */
  async addFromDictationError(error: DictationResult): Promise<ReviewVocabulary | null> {
    try {
      // Check if this vocabulary is already in the review library
      const existing = await this.getBySourceVocabularyItemId(error.vocabularyItemId)
      if (existing) {
        console.log(`Vocabulary ${error.vocabularyItemId} already exists in review library`)
        return existing
      }

      // Get the original vocabulary item to copy data from
      const originalVocab = await vocabularyService.getVocabularyItemById(error.vocabularyItemId)
      if (!originalVocab) {
        console.warn(`Original vocabulary item ${error.vocabularyItemId} not found`)
        return null
      }

      const now = new Date()
      const id = crypto.randomUUID()

      // Copy audio from original vocabulary if available
      const audioBlob = originalVocab.hasAudio
        ? await vocabularyService.getAudioBlob(error.vocabularyItemId)
        : undefined

      const reviewVocabulary: ReviewVocabulary = {
        id,
        sourceUnitId: originalVocab.unitId,
        sourceVocabularyItemId: error.vocabularyItemId,
        text: error.vocabularyText,
        type: error.vocabularyType,
        addedAt: now,
        addedFromDictationResult: error,
        hasAudio: originalVocab.hasAudio || false,
        audioSource: originalVocab.hasAudio ? 'recorded' : 'tts',
        audioBlob: audioBlob || null,
        audioSize: audioBlob?.size || 0,
        createdAt: now,
        updatedAt: now
      }

      await db.reviewVocabulary.add(reviewVocabulary)

      // Create initial memory state for this review vocabulary
      await this.createInitialMemoryState(id)

      console.log(`Added vocabulary ${error.vocabularyText} to review library`)
      return reviewVocabulary
    } catch (error) {
      console.error('Error adding vocabulary to review library:', error)
      return null
    }
  }

  /**
   * Add multiple vocabularies from dictation errors
   */
  async addMultipleFromDictationErrors(errors: DictationResult[]): Promise<ReviewVocabulary[]> {
    const addedVocabularies: ReviewVocabulary[] = []

    // Only add errors (incorrect results)
    const errorResults = errors.filter(error => !error.isCorrect)

    for (const error of errorResults) {
      const reviewVocab = await this.addFromDictationError(error)
      if (reviewVocab) {
        addedVocabularies.push(reviewVocab)
      }
    }

    return addedVocabularies
  }

  /**
   * Get review vocabulary by ID
   */
  async getById(id: string): Promise<ReviewVocabulary | null> {
    try {
      const reviewVocab = await db.reviewVocabulary.get(id)
      return reviewVocab ?? null
    } catch (error) {
      console.error(`Error getting review vocabulary ${id}:`, error)
      return null
    }
  }

  /**
   * Get all review vocabulary
   */
  async getAll(): Promise<ReviewVocabulary[]> {
    try {
      return await db.reviewVocabulary.orderBy('addedAt').reverse().toArray()
    } catch (error) {
      console.error('Error getting all review vocabulary:', error)
      return []
    }
  }

  /**
   * Get review vocabulary by source vocabulary item ID
   */
  async getBySourceVocabularyItemId(sourceVocabularyItemId: string): Promise<ReviewVocabulary | null> {
    try {
      const result = await db.reviewVocabulary.where('sourceVocabularyItemId').equals(sourceVocabularyItemId).first()
      return result ?? null
    } catch (error) {
      console.error(`Error getting review vocabulary by source ID ${sourceVocabularyItemId}:`, error)
      return null
    }
  }

  /**
   * Check if vocabulary exists in review library
   */
  async existsInReviewLibrary(vocabularyItemId: string): Promise<boolean> {
    const existing = await this.getBySourceVocabularyItemId(vocabularyItemId)
    return existing !== null
  }

  /**
   * Get audio blob for review vocabulary
   */
  async getAudioBlob(reviewVocabId: string): Promise<Blob | null> {
    try {
      const reviewVocab = await this.getById(reviewVocabId)
      if (!reviewVocab) return null

      if (reviewVocab.audioBlob) {
        return reviewVocab.audioBlob
      }

      // If no audio blob but hasAudio is true, try to get from original vocabulary
      if (reviewVocab.hasAudio && reviewVocab.sourceVocabularyItemId) {
        const originalAudioBlob = await vocabularyService.getAudioBlob(reviewVocab.sourceVocabularyItemId)
        return originalAudioBlob || null
      }

      return null
    } catch (error) {
      console.error(`Error getting audio blob for review vocabulary ${reviewVocabId}:`, error)
      return null
    }
  }

  /**
   * Set audio blob for review vocabulary
   */
  async setAudioBlob(reviewVocabId: string, audioBlob: Blob): Promise<boolean> {
    try {
      const existing = await this.getById(reviewVocabId)
      if (!existing) return false

      await db.reviewVocabulary.update(reviewVocabId, {
        audioBlob,
        audioSize: audioBlob.size,
        hasAudio: true,
        audioSource: 'recorded',
        updatedAt: new Date()
      })
      return true
    } catch (error) {
      console.error(`Error setting audio blob for review vocabulary ${reviewVocabId}:`, error)
      return false
    }
  }

  /**
   * Get review vocabulary count statistics
   */
  async getReviewVocabularyStats(): Promise<{
    total: number
    chinese: number
    english: number
    withAudio: number
    withoutAudio: number
  }> {
    try {
      const allVocab = await this.getAll()

      return {
        total: allVocab.length,
        chinese: allVocab.filter(v => v.type === 'chinese').length,
        english: allVocab.filter(v => v.type === 'english').length,
        withAudio: allVocab.filter(v => v.hasAudio).length,
        withoutAudio: allVocab.filter(v => !v.hasAudio).length
      }
    } catch (error) {
      console.error('Error getting review vocabulary stats:', error)
      return {
        total: 0,
        chinese: 0,
        english: 0,
        withAudio: 0,
        withoutAudio: 0
      }
    }
  }

  /**
   * Create initial memory state for review vocabulary
   */
  private async createInitialMemoryState(reviewVocabularyId: string): Promise<ReviewMemoryState> {
    const now = new Date()
    const id = crypto.randomUUID()

    const memoryState: ReviewMemoryState = {
      id,
      reviewVocabularyId,
      memoryLevel: 0, // Start at level 0 for new review vocabulary
      lastReviewDate: now,
      nextReviewDate: new Date(now.getTime() + 24 * 60 * 60 * 1000), // Next day
      errorCount: 1, // Start with 1 error since this came from a dictation error
      successStreak: 0,
      difficultyScore: 5, // Default difficulty
      createdAt: now,
      updatedAt: now
    }

    await db.reviewMemoryStates.add(memoryState)
    return memoryState
  }

  /**
   * Delete review vocabulary and its memory state
   */
  async delete(reviewVocabId: string): Promise<boolean> {
    try {
      await db.transaction('rw', db.reviewVocabulary, db.reviewMemoryStates, async () => {
        await db.reviewVocabulary.delete(reviewVocabId)
        await db.reviewMemoryStates.where('reviewVocabularyId').equals(reviewVocabId).delete()
      })
      return true
    } catch (error) {
      console.error(`Error deleting review vocabulary ${reviewVocabId}:`, error)
      return false
    }
  }

  /**
   * Clear all review vocabulary (for testing/reset purposes)
   */
  async clearAll(): Promise<boolean> {
    try {
      await db.transaction('rw', db.reviewVocabulary, db.reviewMemoryStates, async () => {
        await db.reviewVocabulary.clear()
        await db.reviewMemoryStates.clear()
      })
      return true
    } catch (error) {
      console.error('Error clearing all review vocabulary:', error)
      return false
    }
  }
}

export const reviewVocabularyService = new ReviewVocabularyService()