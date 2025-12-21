import type { ReviewMemoryState, ReviewResult } from '../types/review'
import { db } from './index'
import type { MemoryLevel } from '../types/review'

export class ReviewMemoryStateService {
  /**
   * Get memory state by review vocabulary ID
   */
  async getByReviewVocabularyId(reviewVocabularyId: string): Promise<ReviewMemoryState | null> {
    try {
      const memoryState = await db.reviewMemoryStates.where('reviewVocabularyId').equals(reviewVocabularyId).first()
      return memoryState || null
    } catch (error) {
      console.error(`Error getting memory state for review vocabulary ${reviewVocabularyId}:`, error)
      return null
    }
  }

  /**
   * Get memory state by ID
   */
  async getById(id: string): Promise<ReviewMemoryState | null> {
    try {
      const memoryState = await db.reviewMemoryStates.get(id)
      return memoryState || null
    } catch (error) {
      console.error(`Error getting memory state ${id}:`, error)
      return null
    }
  }

  /**
   * Get all memory states
   */
  async getAll(): Promise<ReviewMemoryState[]> {
    try {
      return await db.reviewMemoryStates.toArray()
    } catch (error) {
      console.error('Error getting all memory states:', error)
      return []
    }
  }

  /**
   * Get memory states that are overdue for review
   */
  async getOverdueForReview(limit: number = 50): Promise<ReviewMemoryState[]> {
    try {
      const now = new Date()
      const states = await db.reviewMemoryStates
        .where('nextReviewDate')
        .belowOrEqual(now)
        .limit(limit)
        .toArray()

      // Sort by priority (earliest next review date first)
      return states.sort((a, b) => a.nextReviewDate.getTime() - b.nextReviewDate.getTime())
    } catch (error) {
      console.error('Error getting overdue memory states:', error)
      return []
    }
  }

  /**
   * Create new memory state
   */
  async createMemoryState(memoryState: Omit<ReviewMemoryState, 'id' | 'createdAt' | 'updatedAt'>): Promise<ReviewMemoryState> {
    try {
      const now = new Date()
      const id = crypto.randomUUID()

      const newState: ReviewMemoryState = {
        ...memoryState,
        id,
        createdAt: now,
        updatedAt: now
      }

      await db.reviewMemoryStates.add(newState)
      return newState
    } catch (error) {
      console.error('Error creating memory state:', error)
      throw error
    }
  }

  /**
   * Update memory state from review result
   */
  async updateFromReviewResult(result: ReviewResult): Promise<ReviewMemoryState | null> {
    try {
      // Get the current memory state
      const currentState = await this.getByReviewVocabularyId(result.vocabularyItemId)
      if (!currentState) {
        console.warn(`No memory state found for vocabulary ${result.vocabularyItemId}`)
        return null
      }

      // Simplified Ebbinghaus algorithm
      const currentLevel = currentState.memoryLevel as MemoryLevel
      let newMemoryLevel: MemoryLevel

      if (result.isCorrect) {
        // Move up one level if correct
        newMemoryLevel = Math.min(7, currentLevel + 1) as MemoryLevel
      } else {
        // Move down to level 0 if incorrect
        newMemoryLevel = 0
      }

      const now = new Date()

      // Simple interval calculation (days until next review)
      const intervals = [1, 2, 4, 7, 15, 30, 30, 30] // Ebbinghaus intervals
      const interval = intervals[newMemoryLevel] || 1
      const nextReviewDate = new Date(now.getTime() + interval * 24 * 60 * 60 * 1000)

      // Update memory state
      const updatedMemoryState: ReviewMemoryState = {
        ...currentState,
        memoryLevel: newMemoryLevel,
        lastReviewDate: now,
        nextReviewDate,
        errorCount: result.isCorrect ? Math.max(0, currentState.errorCount - 1) : currentState.errorCount + 1,
        successStreak: result.isCorrect ? currentState.successStreak + 1 : 0,
        difficultyScore: result.isCorrect ? Math.max(1, currentState.difficultyScore - 1) : Math.min(10, currentState.difficultyScore + 1),
        updatedAt: now
      }

      await db.reviewMemoryStates.update(currentState.id, updatedMemoryState)
      return updatedMemoryState
    } catch (error) {
      console.error(`Error updating memory state from review result:`, error)
      return null
    }
  }

  /**
   * Update memory state manually
   */
  async updateMemoryState(id: string, updates: Partial<Omit<ReviewMemoryState, 'id' | 'createdAt'>>): Promise<ReviewMemoryState | null> {
    try {
      const existing = await this.getById(id)
      if (!existing) return null

      const updatedState: ReviewMemoryState = {
        ...existing,
        ...updates,
        updatedAt: new Date()
      }

      await db.reviewMemoryStates.update(id, updatedState)
      return updatedState
    } catch (error) {
      console.error(`Error updating memory state ${id}:`, error)
      return null
    }
  }

  /**
   * Get memory states for specific review vocabularies
   */
  async getByReviewVocabularyIds(reviewVocabularyIds: string[]): Promise<ReviewMemoryState[]> {
    try {
      return await db.reviewMemoryStates.where('reviewVocabularyId').anyOf(reviewVocabularyIds).toArray()
    } catch (error) {
      console.error('Error getting memory states by review vocabulary IDs:', error)
      return []
    }
  }

  /**
   * Get memory level distribution statistics
   */
  async getMemoryLevelDistribution(): Promise<Record<MemoryLevel, number>> {
    try {
      const allStates = await this.getAll()
      const distribution: Record<MemoryLevel, number> = {
        0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0
      }

      allStates.forEach(state => {
        const level = state.memoryLevel as MemoryLevel
        if (level >= 0 && level <= 7) {
          distribution[level]++
        }
      })

      return distribution
    } catch (error) {
      console.error('Error getting memory level distribution:', error)
      return { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0 }
    }
  }

  /**
   * Get statistics for review memory states
   */
  async getReviewMemoryStatistics(): Promise<{
    totalMemoryStates: number
    overdueCount: number
    averageDifficulty: number
    averageMemoryLevel: number
    totalErrors: number
    totalSuccessStreak: number
  }> {
    try {
      const allStates = await this.getAll()
      const now = new Date()
      const overdueStates = allStates.filter(state => state.nextReviewDate <= now)

      const totalErrors = allStates.reduce((sum, state) => sum + state.errorCount, 0)
      const totalSuccessStreak = allStates.reduce((sum, state) => sum + state.successStreak, 0)
      const averageDifficulty = allStates.length > 0
        ? allStates.reduce((sum, state) => sum + state.difficultyScore, 0) / allStates.length
        : 0
      const averageMemoryLevel = allStates.length > 0
        ? allStates.reduce((sum, state) => sum + state.memoryLevel, 0) / allStates.length
        : 0

      return {
        totalMemoryStates: allStates.length,
        overdueCount: overdueStates.length,
        averageDifficulty: Math.round(averageDifficulty * 100) / 100,
        averageMemoryLevel: Math.round(averageMemoryLevel * 100) / 100,
        totalErrors,
        totalSuccessStreak
      }
    } catch (error) {
      console.error('Error getting review memory statistics:', error)
      return {
        totalMemoryStates: 0,
        overdueCount: 0,
        averageDifficulty: 0,
        averageMemoryLevel: 0,
        totalErrors: 0,
        totalSuccessStreak: 0
      }
    }
  }

  /**
   * Get recent review results for a vocabulary item
   * Note: This would need to be implemented once we have review results for the new system
   */
  private getRecentReviewResults(vocabularyItemId: string): Promise<ReviewResult[]> {
    try {
      // For now, return empty array. This will be implemented when we update the review result system
      // In the future, this would query review results for the specific review vocabulary
      return Promise.resolve([])
    } catch (error) {
      console.error(`Error getting recent review results for ${vocabularyItemId}:`, error)
      return Promise.resolve([])
    }
  }

  /**
   * Delete memory state
   */
  async delete(id: string): Promise<boolean> {
    try {
      await db.reviewMemoryStates.delete(id)
      return true
    } catch (error) {
      console.error(`Error deleting memory state ${id}:`, error)
      return false
    }
  }

  /**
   * Delete memory states for specific review vocabularies
   */
  async deleteByReviewVocabularyIds(reviewVocabularyIds: string[]): Promise<boolean> {
    try {
      await db.reviewMemoryStates.where('reviewVocabularyId').anyOf(reviewVocabularyIds).delete()
      return true
    } catch (error) {
      console.error('Error deleting memory states by review vocabulary IDs:', error)
      return false
    }
  }
}

export const reviewMemoryStateService = new ReviewMemoryStateService()