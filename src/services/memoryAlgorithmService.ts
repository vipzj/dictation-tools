import type { MemoryState, MemoryLevel } from '../types/review'
import { EBBINGHAUS_INTERVALS } from '../types/review'

export class MemoryAlgorithmService {
  /**
   * Calculate next review date based on memory level and performance
   */
  calculateNextReviewDate(memoryState: MemoryState, isCorrect: boolean): Date {
    const { memoryLevel } = memoryState
    const now = new Date()

    if (isCorrect) {
      // Move to next level or maintain at highest level
      const nextLevel = Math.min(7, memoryLevel + 1)
      const intervalDays = EBBINGHAUS_INTERVALS[nextLevel] || 30
      return new Date(now.getTime() + intervalDays * 24 * 60 * 60 * 1000)
    } else {
      // Move back to lower level (minimum 0) and review tomorrow
      const previousLevel = Math.max(0, memoryLevel - 1)
      const intervalDays = EBBINGHAUS_INTERVALS[previousLevel] || 1
      return new Date(now.getTime() + intervalDays * 24 * 60 * 60 * 1000)
    }
  }

  /**
   * Calculate memory level progression based on performance
   */
  calculateMemoryLevel(
    currentLevel: MemoryLevel,
    isCorrect: boolean,
    errorCount: number,
    successStreak: number
  ): MemoryLevel {
    if (isCorrect) {
      // Progress to next level with bonus for streaks
      let newLevel = Math.min(7, currentLevel + 1)

      // Bonus progression for consecutive correct reviews
      if (successStreak >= 3 && currentLevel < 6) {
        newLevel = Math.min(7, currentLevel + 2)
      } else if (successStreak >= 5 && currentLevel < 5) {
        newLevel = Math.min(7, currentLevel + 1)
      }

      return newLevel as MemoryLevel
    } else {
      // Regress based on error frequency and current level
      let newLevel = Math.max(0, currentLevel - 1)

      // Additional regression for high error count
      if (errorCount >= 3 && currentLevel > 2) {
        newLevel = Math.max(0, currentLevel - 2)
      } else if (errorCount >= 5) {
        newLevel = Math.max(0, currentLevel - 3)
      }

      return newLevel as MemoryLevel
    }
  }

  /**
   * Calculate difficulty score based on error patterns and performance history
   */
  calculateDifficultyScore(
    errorCount: number,
    successStreak: number,
    totalReviews: number,
    recentAccuracy: number
  ): number {
    let baseScore = 5 // default difficulty

    // Adjust based on error frequency
    if (errorCount === 0) {
      baseScore = Math.max(1, baseScore - 2)
    } else if (errorCount === 1) {
      baseScore = Math.max(2, baseScore - 1)
    } else if (errorCount >= 3) {
      baseScore = Math.min(8, baseScore + 1)
    } else if (errorCount >= 5) {
      baseScore = Math.min(10, baseScore + 2)
    }

    // Adjust based on recent performance
    if (recentAccuracy >= 0.9) {
      baseScore = Math.max(1, baseScore - 1)
    } else if (recentAccuracy < 0.5) {
      baseScore = Math.min(9, baseScore + 1)
    }

    // Consider total review experience
    if (totalReviews < 3) {
      baseScore = Math.min(7, baseScore) // Lower difficulty for beginners
    } else if (totalReviews > 20 && recentAccuracy > 0.8) {
      baseScore = Math.max(1, baseScore - 2) // Lower difficulty if well-learned
    }

    return Math.max(1, Math.min(10, baseScore))
  }

  /**
   * Calculate priority score for review selection
   * Higher priority = sooner review needed
   */
  calculateReviewPriority(memoryState: MemoryState): number {
    const now = new Date()
    const { nextReviewDate, difficultyScore, errorCount, memoryLevel } = memoryState

    // Calculate overdue days (negative means overdue)
    const overdueDays = Math.floor((now.getTime() - nextReviewDate.getTime()) / (24 * 60 * 60 * 1000))

    // Base priority from overdue status
    let priority = Math.max(0, overdueDays * 10)

    // Higher priority for difficult items
    priority += difficultyScore

    // Higher priority for items with many errors
    priority += Math.min(errorCount * 2, 20)

    // Lower priority for high memory levels (unless overdue)
    if (memoryLevel >= 5 && overdueDays <= 0) {
      priority -= 5
    }

    return priority
  }

  /**
   * Check if a vocabulary item needs review
   */
  needsReview(memoryState: MemoryState): boolean {
    const now = new Date()
    return memoryState.nextReviewDate <= now
  }

  /**
   * Get memory level description
   */
  getMemoryLevelDescription(level: MemoryLevel): string {
    const descriptions = {
      0: '新学词汇 (New)',
      1: '初次复习 (1st Review)',
      2: '初步掌握 (Learning)',
      3: '基本掌握 (Basic)',
      4: '熟练掌握 (Familiar)',
      5: '掌握良好 (Good)',
      6: '完全掌握 (Mastered)',
      7: '长期记忆 (Maintained)'
    }
    return descriptions[level] || descriptions[0]
  }

  /**
   * Get review interval description
   */
  getIntervalDescription(level: MemoryLevel): string {
    const intervals = ['1天', '2天', '4天', '7天', '15天', '30天', '30天', '30天']
    return (intervals[level] || intervals[0])!
  }

  /**
   * Calculate estimated review date for a given memory level
   */
  getEstimatedNextReviewDate(memoryState: MemoryState): Date {
    const { memoryLevel } = memoryState
    const now = new Date()
    const intervalDays = EBBINGHAUS_INTERVALS[memoryLevel] || 30

    // Add some randomness to avoid all items clustering
    const randomVariation = Math.random() * 0.2 - 0.1 // ±10% variation
    const adjustedDays = intervalDays * (1 + randomVariation)

    return new Date(now.getTime() + adjustedDays * 24 * 60 * 60 * 1000)
  }

  /**
   * Get memory strength percentage based on memory level
   */
  getMemoryStrength(level: MemoryLevel): number {
    const strengths = [0, 14, 29, 43, 57, 71, 86, 100]
    return strengths[level] ?? 0
  }

  /**
   * Predict future review schedule for next N days
   */
  predictReviewSchedule(memoryState: MemoryState, days: number = 30): Array<{ date: Date, level: MemoryLevel, interval: string }> {
    const schedule = []
    let currentState = { ...memoryState }
    const now = new Date()

    for (let i = 0; i < days; i++) {
      const futureDate = new Date(now.getTime() + i * 24 * 60 * 60 * 1000)

      if (currentState.nextReviewDate <= futureDate) {
        // Assume perfect performance for prediction
        const nextLevel = Math.min(7, currentState.memoryLevel + 1)
        const interval = EBBINGHAUS_INTERVALS[nextLevel] || 30

        schedule.push({
          date: futureDate,
          level: nextLevel as MemoryLevel,
          interval: interval + '天'
        })

        // Update state for next iteration
        currentState = {
          ...currentState,
          memoryLevel: nextLevel,
          lastReviewDate: futureDate,
          nextReviewDate: new Date(futureDate.getTime() + interval * 24 * 60 * 60 * 1000)
        }
      }
    }

    return schedule
  }

  /**
   * Calculate learning efficiency metrics
   */
  calculateLearningEfficiency(memoryStates: MemoryState[]): {
    averageMemoryLevel: number
    totalItems: number
    masteredItems: number
    needsReviewItems: number
    averageDifficulty: number
  } {
    if (memoryStates.length === 0) {
      return {
        averageMemoryLevel: 0,
        totalItems: 0,
        masteredItems: 0,
        needsReviewItems: 0,
        averageDifficulty: 0
      }
    }

    const now = new Date()
    const totalItems = memoryStates.length
    const masteredItems = memoryStates.filter(state => state.memoryLevel >= 6).length
    const needsReviewItems = memoryStates.filter(state => state.nextReviewDate <= now).length

    const averageMemoryLevel = memoryStates.reduce((sum, state) => sum + state.memoryLevel, 0) / totalItems
    const averageDifficulty = memoryStates.reduce((sum, state) => sum + state.difficultyScore, 0) / totalItems

    return {
      averageMemoryLevel: Math.round(averageMemoryLevel * 10) / 10,
      totalItems,
      masteredItems,
      needsReviewItems,
      averageDifficulty: Math.round(averageDifficulty * 10) / 10
    }
  }
}

export const memoryAlgorithmService = new MemoryAlgorithmService()