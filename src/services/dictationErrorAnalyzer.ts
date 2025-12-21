import type { VocabularyItem } from '../types/unit'
import type { MemoryState, ReviewItem } from '../types/review'
import type { DictationResult } from '../types/dictation'
import { dictationService, vocabularyService, memoryStateService, unitService, reviewVocabularyService } from './index'

export interface VocabularyError {
  vocabularyItemId: string
  vocabularyText: string
  vocabularyType: 'chinese' | 'english'
  errorCount: number
  totalAttempts: number
  errorRate: number
  lastErrorAt: Date
  lastCorrectAt?: Date
  consecutiveErrors: number
  averageResponseTime?: number
  difficultyScore: number
  memoryState?: MemoryState
}

export interface ErrorAnalysisResult {
  totalVocabularyItems: number
  itemsWithErrors: number
  totalErrors: number
  averageAccuracy: number
  errorDistribution: Record<string, number> // error rate distribution
  mostProblematicItems: VocabularyError[]
  recentlyWrongItems: VocabularyError[]
  needsReviewItems: VocabularyError[]
}

export class DictationErrorAnalyzer {
  /**
   * 分析所有听写记录，找出用户出错的词汇
   */
  async analyzeDictationErrors(): Promise<ErrorAnalysisResult> {
    // 获取所有听写会话
    const allSessions = await dictationService.getAllDictationSessions()

    // 分析每个词汇的表现
    const vocabularyPerformance = new Map<string, VocabularyError>()

    let totalResults = 0
    let totalCorrect = 0

    for (const session of allSessions) {
      for (const result of session.results) {
        totalResults++
        if (result.isCorrect) {
          totalCorrect++
        }

        const existing = vocabularyPerformance.get(result.vocabularyItemId)

        if (existing) {
          // 更新现有记录
          existing.totalAttempts++
          if (result.isCorrect) {
            existing.lastCorrectAt = session.completedAt
            existing.consecutiveErrors = 0
          } else {
            existing.errorCount++
            existing.lastErrorAt = session.completedAt
            existing.consecutiveErrors++
          }
          existing.errorRate = existing.errorCount / existing.totalAttempts
        } else {
          // 创建新记录
          const vocabularyError: VocabularyError = {
            vocabularyItemId: result.vocabularyItemId,
            vocabularyText: result.vocabularyText,
            vocabularyType: result.vocabularyType,
            errorCount: result.isCorrect ? 0 : 1,
            totalAttempts: 1,
            errorRate: result.isCorrect ? 0 : 1,
            lastErrorAt: result.isCorrect ? new Date(0) : session.completedAt,
            consecutiveErrors: result.isCorrect ? 0 : 1,
            difficultyScore: 5 // 默认难度
          }

          if (result.isCorrect) {
            vocabularyError.lastCorrectAt = session.completedAt
          }
          vocabularyPerformance.set(result.vocabularyItemId, vocabularyError)
        }
      }
    }

    // 获取词汇信息和记忆状态
    const vocabularyErrors: VocabularyError[] = []
    const units = await unitService.getAllUnits()

    for (const [vocabId, vocabError] of vocabularyPerformance) {
      // 查找对应的词汇项
      let vocabularyItem: VocabularyItem | undefined

      for (const unit of units) {
        const items = await vocabularyService.getVocabularyItemsByUnit(unit.id)
        const found = items.find(item => item.id === vocabId)
        if (found) {
          vocabularyItem = found
          break
        }
      }

      if (vocabularyItem) {
        const memoryState = await memoryStateService.getMemoryStateByVocabularyId(vocabId)
        if (memoryState) {
          vocabError.memoryState = memoryState
        }

        // 计算难度评分
        vocabError.difficultyScore = this.calculateDifficultyScore(vocabError)

        vocabularyErrors.push(vocabError)
      }
    }

    // 排序和分析
    const mostProblematicItems = vocabularyErrors
      .filter(item => item.errorCount > 0)
      .sort((a, b) => b.errorCount - a.errorCount)
      .slice(0, 20)

    const recentlyWrongItems = vocabularyErrors
      .filter(item => item.lastErrorAt > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)) // 最近7天
      .sort((a, b) => b.lastErrorAt.getTime() - a.lastErrorAt.getTime())
      .slice(0, 15)

    const needsReviewItems = vocabularyErrors
      .filter(item => this.needsReview(item))
      .sort((a, b) => this.getReviewPriority(b) - this.getReviewPriority(a))

    // 错误率分布
    const errorDistribution: Record<string, number> = {
      '0%': 0,
      '1-25%': 0,
      '26-50%': 0,
      '51-75%': 0,
      '76-99%': 0,
      '100%': 0
    }

    vocabularyErrors.forEach(item => {
      const rate = item.errorRate
      if (rate === 0) (errorDistribution['0%'] = (errorDistribution['0%'] || 0) + 1)
      else if (rate <= 0.25) (errorDistribution['1-25%'] = (errorDistribution['1-25%'] || 0) + 1)
      else if (rate <= 0.5) (errorDistribution['26-50%'] = (errorDistribution['26-50%'] || 0) + 1)
      else if (rate <= 0.75) (errorDistribution['51-75%'] = (errorDistribution['51-75%'] || 0) + 1)
      else if (rate < 1) (errorDistribution['76-99%'] = (errorDistribution['76-99%'] || 0) + 1)
      else (errorDistribution['100%'] = (errorDistribution['100%'] || 0) + 1)
    })

    return {
      totalVocabularyItems: vocabularyErrors.length,
      itemsWithErrors: vocabularyErrors.filter(item => item.errorCount > 0).length,
      totalErrors: vocabularyErrors.reduce((sum, item) => sum + item.errorCount, 0),
      averageAccuracy: totalResults > 0 ? totalCorrect / totalResults : 0,
      errorDistribution,
      mostProblematicItems,
      recentlyWrongItems,
      needsReviewItems
    }
  }

  /**
   * 获取需要复习的词汇 - 完全基于听写错误记录
   */
  async getVocabularyForReview(wordCount: number = 15, difficultyFilter: 'all' | 'easy' | 'hard' = 'all'): Promise<ReviewItem[]> {
    try {
      // 基于错误记录获取词汇
      const errorAnalysis = await this.analyzeDictationErrors()
      let candidates = errorAnalysis.needsReviewItems

      // 应用难度筛选
      if (difficultyFilter === 'easy') {
        candidates = candidates.filter(item => item.difficultyScore <= 5)
      } else if (difficultyFilter === 'hard') {
        candidates = candidates.filter(item => item.difficultyScore > 5)
      }

      // 如果没有错误词汇，返回空数组（因为没有错误的词汇不需要复习）
      if (candidates.length === 0) {
        return []
      }

      // 转换为ReviewItem格式
      const reviewItems: ReviewItem[] = candidates.slice(0, wordCount).map(vocabError => ({
        vocabularyItem: {
          id: vocabError.vocabularyItemId,
          unitId: '', // 单元ID在复习中不重要
          type: vocabError.vocabularyType,
          text: vocabError.vocabularyText,
          hasAudio: false,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        priority: this.getReviewPriority(vocabError)
      }))

      return reviewItems
    } catch (error) {
      console.error('Error in dictation error analysis:', error)
      // 如果错误分析失败，返回空数组
      return []
    }
  }

  /**
   * 从记忆状态获取需要复习的词汇（回退方法）
   */
  private async getVocabularyFromMemoryStates(
    wordCount: number,
    difficultyFilter: 'all' | 'easy' | 'hard' = 'all',
    excludeIds: string[] = []
  ): Promise<VocabularyError[]> {
    try {
      const memoryStates = await memoryStateService.getAllMemoryStates()
      const now = new Date()

      // 筛选需要复习的记忆状态
      const dueForReview = memoryStates
        .filter(state => state.nextReviewDate <= now)
        .filter(state => !excludeIds.includes(state.vocabularyItemId))

      // 如果没有需要复习的，则选择一些基础的词汇用于复习
      const candidatesToProcess = dueForReview.length > 0
        ? dueForReview
        : memoryStates.slice(0, wordCount) // 取前几个词汇

      // 获取对应的词汇信息
      const vocabularyErrors: VocabularyError[] = []
      const units = await unitService.getAllUnits()

      for (const memoryState of candidatesToProcess) {
        // 查找对应的词汇项
        let vocabularyItem: VocabularyItem | undefined

        for (const unit of units) {
          try {
            const items = await vocabularyService.getVocabularyItemsByUnit(unit.id)
            const found = items.find(item => item.id === memoryState.vocabularyItemId)
            if (found) {
              vocabularyItem = found
              break
            }
          } catch (error) {
            console.warn(`Failed to get vocabulary for unit ${unit.id}:`, error)
            continue
          }
        }

        if (vocabularyItem) {
          const vocabError: VocabularyError = {
            vocabularyItemId: vocabularyItem.id,
            vocabularyText: vocabularyItem.text,
            vocabularyType: vocabularyItem.type,
            errorCount: 0, // 没有错误记录
            totalAttempts: 1,
            errorRate: 0,
            lastErrorAt: new Date(0), // 从未出错
            consecutiveErrors: 0,
            difficultyScore: memoryState.difficultyScore,
            memoryState: memoryState
          }

          // 应用难度筛选
          if (difficultyFilter === 'easy' && vocabError.difficultyScore > 5) continue
          if (difficultyFilter === 'hard' && vocabError.difficultyScore <= 5) continue

          vocabularyErrors.push(vocabError)

          if (vocabularyErrors.length >= wordCount) break
        }
      }

      return vocabularyErrors
    } catch (error) {
      console.error('Error in getVocabularyFromMemoryStates:', error)
      return [] // 返回空数组而不是抛出错误
    }
  }

  /**
   * 判断词汇是否需要复习 - 完全基于听写错误记录
   */
  private needsReview(vocabError: VocabularyError): boolean {
    // 只有出错过的词汇才需要复习
    if (vocabError.errorCount === 0) return false

    // 以下任何一个条件满足就需要复习：

    // 1. 最近有错误（30天内）
    const daysSinceLastError = (Date.now() - vocabError.lastErrorAt.getTime()) / (24 * 60 * 60 * 1000)
    if (daysSinceLastError <= 30) return true

    // 2. 连续错误次数 > 0
    if (vocabError.consecutiveErrors > 0) return true

    // 3. 错误率较高（>10%）
    if (vocabError.errorRate > 0.1) return true

    // 4. 错误次数较多（>2次）
    if (vocabError.errorCount > 2) return true

    return false
  }

  /**
   * 计算复习优先级
   */
  private getReviewPriority(vocabError: VocabularyError): number {
    let priority = 0

    // 基于错误次数
    priority += vocabError.errorCount * 10

    // 基于错误率
    priority += vocabError.errorRate * 20

    // 基于连续错误
    priority += vocabError.consecutiveErrors * 15

    // 基于最近错误时间（越近越优先）
    const daysSinceLastError = (Date.now() - vocabError.lastErrorAt.getTime()) / (24 * 60 * 60 * 1000)
    priority += Math.max(0, (7 - daysSinceLastError) * 5)

    // 基于难度评分
    priority += vocabError.difficultyScore

    return priority
  }

  /**
   * 计算难度评分
   */
  private calculateDifficultyScore(vocabError: VocabularyError): number {
    let score = 5 // 基础分数

    // 基于错误率
    if (vocabError.errorRate > 0.5) score += 2
    else if (vocabError.errorRate > 0.3) score += 1
    else if (vocabError.errorRate < 0.1) score -= 2

    // 基于连续错误
    if (vocabError.consecutiveErrors > 3) score += 2
    else if (vocabError.consecutiveErrors > 1) score += 1

    // 基于总错误次数
    if (vocabError.errorCount > 5) score += 1

    // 基于记忆状态
    if (vocabError.memoryState) {
      score += (vocabError.memoryState.difficultyScore - 5) * 0.5
    }

    return Math.max(1, Math.min(10, score))
  }

  /**
   * 获取错误统计摘要
   */
  async getErrorSummary(): Promise<{
    totalDictations: number
    totalErrors: number
    problematicWordsCount: number
    recentAccuracyTrend: number[]
    recommendedReviewCount: number
  }> {
    const analysis = await this.analyzeDictationErrors()
    const sessions = await dictationService.getAllDictationSessions()

    // 计算最近的准确率趋势（最近10次听写）
    const recentAccuracyTrend = sessions
      .sort((a, b) => b.completedAt.getTime() - a.completedAt.getTime())
      .slice(0, 10)
      .reverse()
      .map(session => session.accuracy)

    return {
      totalDictations: sessions.length,
      totalErrors: analysis.totalErrors,
      problematicWordsCount: analysis.itemsWithErrors,
      recentAccuracyTrend,
      recommendedReviewCount: analysis.needsReviewItems.length
    }
  }

  /**
   * Add error words from dictation results to review library
   */
  async addErrorsToReviewLibrary(errors: DictationResult[]): Promise<void> {
    try {
      // Only add incorrect results
      const errorResults = errors.filter(error => !error.isCorrect)

      if (errorResults.length === 0) {
        console.log('No errors to add to review library')
        return
      }

      console.log(`Adding ${errorResults.length} error words to review library`)

      // Add each error to the review vocabulary library
      const addedVocabularies = await reviewVocabularyService.addMultipleFromDictationErrors(errorResults)

      console.log(`Successfully added ${addedVocabularies.length} vocabularies to review library`)
    } catch (error) {
      console.error('Error adding errors to review library:', error)
      throw error
    }
  }

  /**
   * Check if vocabulary already exists in review library
   */
  async existsInReviewLibrary(vocabularyItemId: string): Promise<boolean> {
    return await reviewVocabularyService.existsInReviewLibrary(vocabularyItemId)
  }

  /**
   * Add errors from a dictation session to review library
   */
  async addSessionErrorsToReviewLibrary(sessionId: string): Promise<void> {
    try {
      const session = await dictationService.getDictationSessionById(sessionId)
      if (!session) {
        throw new Error(`Dictation session ${sessionId} not found`)
      }

      await this.addErrorsToReviewLibrary(session.results)
    } catch (error) {
      console.error(`Error adding session ${sessionId} errors to review library:`, error)
      throw error
    }
  }

  /**
   * Get review library statistics
   */
  async getReviewLibraryStatistics(): Promise<{
    totalVocabulary: number
    chineseCount: number
    englishCount: number
    withAudioCount: number
    withoutAudioCount: number
    recentAdditions: number
  }> {
    try {
      const stats = await reviewVocabularyService.getReviewVocabularyStats()
      const allVocab = await reviewVocabularyService.getAll()

      // Count recent additions (last 7 days)
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      const recentAdditions = allVocab.filter(vocab => vocab.addedAt >= sevenDaysAgo).length

      return {
        totalVocabulary: stats.total,
        chineseCount: stats.chinese,
        englishCount: stats.english,
        withAudioCount: stats.withAudio,
        withoutAudioCount: stats.withoutAudio,
        recentAdditions
      }
    } catch (error) {
      console.error('Error getting review library statistics:', error)
      return {
        totalVocabulary: 0,
        chineseCount: 0,
        englishCount: 0,
        withAudioCount: 0,
        withoutAudioCount: 0,
        recentAdditions: 0
      }
    }
  }
}

export const dictationErrorAnalyzer = new DictationErrorAnalyzer()