import type {
  ReviewSession,
  ReviewResult,
  ReviewItem,
  ReviewSettings,
  ReviewProgress,
  ReviewStatistics,
  MemoryLevel,
  ReviewMemoryState
} from '../types/review'
import { reviewSessionService, reviewVocabularyService, reviewMemoryStateService } from './index'
import { DEFAULT_REVIEW_SETTINGS } from '../types/review'

export class ReviewService {
  /**
   * Generate a review session based on independent review vocabulary library
   */
  async generateReviewSession(settings: ReviewSettings = DEFAULT_REVIEW_SETTINGS): Promise<ReviewSession> {
    try {
      // First try to get overdue review vocabulary
      const overdueMemoryStates = await reviewMemoryStateService.getOverdueForReview(settings.wordCount)

      let memoryStates = overdueMemoryStates

      // If no overdue vocabulary, get all review vocabulary (for immediate review)
      if (overdueMemoryStates.length === 0) {
        console.log('No overdue vocabulary, getting all available review vocabulary')
        const allReviewVocabulary = await reviewVocabularyService.getAll()

        if (allReviewVocabulary.length === 0) {
          throw new Error('暂无需要复习的词汇。请在单元听写中出现错误后，词汇会自动加入复习库。')
        }

        // Get memory states for all vocabulary
        const allMemoryStates = await reviewMemoryStateService.getByReviewVocabularyIds(
          allReviewVocabulary.map(vocab => vocab.id)
        )

        // Sort by priority (newest first for immediate review)
        memoryStates = allMemoryStates
          .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
          .slice(0, settings.wordCount)
      }

      // Get review vocabulary items for these memory states
      const reviewVocabularyItems = await Promise.all(
        memoryStates.map(async (memoryState) => {
          const reviewVocab = await reviewVocabularyService.getById(memoryState.reviewVocabularyId)
          if (!reviewVocab) {
            console.warn(`Review vocabulary ${memoryState.reviewVocabularyId} not found`)
            return null
          }

          return {
            vocabularyItem: reviewVocab,
            memoryState: memoryState,
            priority: this.calculateReviewPriority(memoryState)
          }
        })
      )

      // Filter out null values and sort by priority
      const filteredItems = reviewVocabularyItems.filter(item => item !== null)
      const validReviewItems = filteredItems
        .sort((a, b) => (b?.priority || 0) - (a?.priority || 0))
        .slice(0, settings.wordCount) as ReviewItem[]

      if (validReviewItems.length === 0) {
        throw new Error('暂无有效的复习词汇。')
      }

      return await reviewSessionService.createReviewSession({
        vocabularyItems: validReviewItems,
        settings: {
          wordCount: settings.wordCount,
          difficultyFilter: settings.difficultyFilter,
          maxDailyReviews: settings.maxDailyReviews,
          playCount: settings.playCount,
          interval: settings.interval,
          intraWordInterval: settings.intraWordInterval,
          // Remove units field as review is independent of units
          ...(settings.autoPlayAudio && { autoPlayAudio: settings.autoPlayAudio }),
          ...(settings.showMemoryLevel && { showMemoryLevel: settings.showMemoryLevel }),
          ...(settings.showProgress && { showProgress: settings.showProgress }),
          ...(settings.adaptiveDifficulty && { adaptiveDifficulty: settings.adaptiveDifficulty }),
          ...(settings.algorithmType && { algorithmType: settings.algorithmType }),
          ...(settings.intervalMultiplier && { intervalMultiplier: settings.intervalMultiplier }),
          ...(settings.forgettingFactor && { forgettingFactor: settings.forgettingFactor })
        },
        startedAt: new Date()
      })
    } catch (error) {
      console.error('Failed to generate review session:', error)
      throw error
    }
  }

  /**
   * Calculate review priority for a vocabulary item
   */
  private calculateReviewPriority(
    memoryState: ReviewMemoryState
  ): number {
    let priority = 0

    // Priority based on memory level (lower level = higher priority)
    priority += (8 - memoryState.memoryLevel) * 10

    // Priority based on error count
    priority += memoryState.errorCount * 5

    // Priority based on difficulty score
    priority += memoryState.difficultyScore

    // Priority based on how overdue it is
    const now = new Date()
    const daysOverdue = Math.max(0, (now.getTime() - memoryState.nextReviewDate.getTime()) / (24 * 60 * 60 * 1000))
    priority += daysOverdue * 2

    return priority
  }

  
  /**
   * Complete a review session and update review memory states
   */
  async completeReviewSession(
    sessionId: string,
    results: ReviewResult[]
  ): Promise<{ session: ReviewSession; updatedMemoryStates: ReviewMemoryState[] }> {
    // Update review memory states based on review results
    const updatedMemoryStates: ReviewMemoryState[] = []

    for (const result of results) {
      const memoryStateAfter = await reviewMemoryStateService.updateFromReviewResult(result)
      if (memoryStateAfter) {
        updatedMemoryStates.push(memoryStateAfter)

        // Update the result with memory state information
        // Note: We need to get the memory state before for the result
        const memoryStateBefore = await reviewMemoryStateService.getByReviewVocabularyId(result.vocabularyItemId)
        if (memoryStateBefore) {
          result.memoryStateBefore = memoryStateBefore
          result.memoryStateAfter = memoryStateAfter
        }
      }
    }

    // Complete the review session
    const session = await reviewSessionService.completeReviewSession(sessionId, results)

    if (!session) {
      throw new Error('Failed to complete review session')
    }

    return { session, updatedMemoryStates }
  }

  /**
   * Get review progress for a session
   */
  getReviewProgress(session: ReviewSession, currentIndex: number): ReviewProgress {
    const totalWords = session.vocabularyItems.length
    const completedWords = Math.min(currentIndex + 1, totalWords)
    const correctWords = session.vocabularyItems
      .slice(0, completedWords)
      .filter(() => {
        // This would need to be tracked separately in a real implementation
        // For now, we'll simulate it
        return Math.random() > 0.3 // 70% accuracy assumption
      }).length

    return {
      totalWords,
      reviewedWords: completedWords,
      correctWords,
      currentWordIndex: currentIndex,
      sessionAccuracy: completedWords > 0 ? correctWords / completedWords : 0
    }
  }

  /**
   * Get comprehensive review statistics for independent review system
   */
  async getReviewStatistics(): Promise<ReviewStatistics> {
    const allSessions = await reviewSessionService.getAllReviewSessions()
    const allMemoryStates = await reviewMemoryStateService.getAll()
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000)

    // Calculate memory level distribution from review memory states
    const levelDistribution: Record<MemoryLevel, number> = {
      0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0
    }

    const wordsAtEachLevel: Record<MemoryLevel, number> = {
      0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0
    }

    allMemoryStates.forEach(state => {
      const level = state.memoryLevel as MemoryLevel
      levelDistribution[level] = (levelDistribution[level] || 0) + 1
      wordsAtEachLevel[level] = (wordsAtEachLevel[level] || 0) + 1
    })

    // Calculate overdue words count
    const overdueWordsCount = allMemoryStates.filter(state =>
      state.nextReviewDate <= now
    ).length

    // Calculate today's review count
    const todayReviewsCount = allSessions.filter(session =>
      session.startedAt >= today && session.startedAt < tomorrow
    ).length

    // Calculate accuracy statistics
    const totalReviews = allSessions.reduce((sum, session) => sum + session.vocabularyItems.length, 0)
    const averageAccuracy = allSessions.length > 0
      ? allSessions.reduce((sum, session) => sum + (session.accuracy || 0), 0) / allSessions.length
      : 0

    // Calculate streak (simplified - consecutive days with reviews)
    let streakDays = 0
    let currentDate = new Date(today)

    for (let i = 0; i < 30; i++) {
      const dayReviews = allSessions.filter(session =>
        session.startedAt >= currentDate && session.startedAt < new Date(currentDate.getTime() + 24 * 60 * 60 * 1000)
      )

      if (dayReviews.length > 0) {
        streakDays++
        currentDate = new Date(currentDate.getTime() - 24 * 60 * 60 * 1000)
      } else {
        break
      }
    }

    return {
      totalSessions: allSessions.length,
      totalReviews,
      averageAccuracy: Math.round(averageAccuracy * 100) / 100,
      memoryLevelDistribution: levelDistribution,
      wordsAtEachLevel,
      overdueWordsCount,
      todayReviewsCount,
      streakDays
    }
  }

  /**
   * Check if user has vocabulary items for review in independent review library
   */
  async hasVocabularyForReview(): Promise<boolean> {
    const reviewMemoryStates = await reviewMemoryStateService.getAll()
    return reviewMemoryStates.length > 0
  }

  /**
   * Get recommended review settings based on review library size and performance
   */
  async getRecommendedReviewSettings(): Promise<ReviewSettings> {
    const reviewVocabularyStats = await reviewVocabularyService.getReviewVocabularyStats()
    const stats = await this.getReviewStatistics()

    const baseSettings = { ...DEFAULT_REVIEW_SETTINGS }

    // Adjust word count based on review vocabulary size
    if (reviewVocabularyStats.total < 10) {
      baseSettings.wordCount = Math.max(3, reviewVocabularyStats.total)
    } else if (reviewVocabularyStats.total > 50) {
      baseSettings.wordCount = 20
    }

    // Adjust based on overdue items
    if (stats.overdueWordsCount > 0 && stats.overdueWordsCount < baseSettings.wordCount) {
      baseSettings.wordCount = stats.overdueWordsCount
    } else if (stats.overdueWordsCount > baseSettings.wordCount) {
      baseSettings.wordCount = Math.min(30, stats.overdueWordsCount)
    }

    // Adjust difficulty filter based on overall performance
    if (stats.averageAccuracy >= 0.8) {
      baseSettings.difficultyFilter = 'hard' // Focus on difficult items
    } else if (stats.averageAccuracy < 0.5) {
      baseSettings.difficultyFilter = 'easy' // Focus on easy items
    }

    return baseSettings
  }
}

export const reviewService = new ReviewService()