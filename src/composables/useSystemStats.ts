import { ref, computed, onMounted, onUnmounted, readonly } from 'vue'
import { db, dictationService } from 'src/services/indexeddb'
import { reviewService } from 'src/services/reviewService'
import type { SystemStats, DashboardStats, LoadingState, DashboardConfig } from 'src/types/dashboard'
import type { MemoryLevel } from 'src/types/review'

const DEFAULT_CONFIG: DashboardConfig = {
  refreshInterval: 30000, // 30 seconds
  enableAutoRefresh: true,
  enableAnimations: true,
  showDetailedStats: true,
  compactMode: false
}

export function useSystemStats(config: Partial<DashboardConfig> = {}) {
  const finalConfig = { ...DEFAULT_CONFIG, ...config }
  const loading = ref<LoadingState>({
    content: false,
    learning: false,
    system: false
  })

  const stats = ref<SystemStats>({
    // Content Statistics
    totalUnits: 0,
    totalVocabulary: 0,
    vocabularyByType: { chinese: 0, english: 0 },
    totalTags: 0,
    activeUnits: 0,
    audioCoverage: 0,

    // Practice Analytics
    totalDictationSessions: 0,
    totalReviewSessions: 0,
    totalPracticeSessions: 0,
    averageDictationAccuracy: 0,
    averageReviewAccuracy: 0,
    bestAccuracy: 0,
    currentStreak: 0,
    totalPracticeTime: 0,

    // Learning Progress
    memoryLevelDistribution: {
      0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0
    },
    overdueReviews: 0,
    masteredVocabulary: 0,
    learningProgress: 0,

    // System Analytics
    databaseSize: '0 KB',
    lastActivity: new Date(),
    lastModified: new Date(),
    storageLocation: 'IndexedDB (Local)',
    errorRate: 0,
    improvementTrend: 'stable'
  })

  let refreshTimer: NodeJS.Timeout | null = null

  // Computed properties for dashboard organization
  const dashboardStats = computed<DashboardStats>(() => ({
    content: {
      totalUnits: stats.value.totalUnits,
      totalVocabulary: stats.value.totalVocabulary,
      vocabularyByType: stats.value.vocabularyByType,
      totalTags: stats.value.totalTags,
      activeUnits: stats.value.activeUnits,
      audioCoverage: stats.value.audioCoverage
    },
    learning: {
      totalSessions: stats.value.totalPracticeSessions,
      averageAccuracy: calculateOverallAccuracy(),
      bestAccuracy: stats.value.bestAccuracy,
      currentStreak: stats.value.currentStreak,
      memoryLevelDistribution: stats.value.memoryLevelDistribution,
      masteredVocabulary: stats.value.masteredVocabulary,
      overdueReviews: stats.value.overdueReviews,
      totalPracticeTime: stats.value.totalPracticeTime,
      improvementTrend: stats.value.improvementTrend
    },
    system: {
      databaseSize: stats.value.databaseSize,
      lastActivity: stats.value.lastActivity,
      lastModified: stats.value.lastModified,
      storageLocation: stats.value.storageLocation,
      errorRate: stats.value.errorRate,
      performanceScore: calculatePerformanceScore()
    }
  }))

  const isLoading = computed(() =>
    loading.value.content || loading.value.learning || loading.value.system
  )

  // Helper functions
  function formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  
  function calculateOverallAccuracy(): number {
    const dictationWeight = stats.value.totalDictationSessions || 1
    const reviewWeight = stats.value.totalReviewSessions || 1
    const totalWeight = dictationWeight + reviewWeight

    return (
      (stats.value.averageDictationAccuracy * dictationWeight +
       stats.value.averageReviewAccuracy * reviewWeight) / totalWeight
    )
  }

  function calculatePerformanceScore(): number {
    const accuracy = calculateOverallAccuracy()
    const streakBonus = Math.min(stats.value.currentStreak * 2, 20)
    const masteryRatio = stats.value.totalVocabulary > 0
      ? (stats.value.masteredVocabulary / stats.value.totalVocabulary) * 100
      : 0

    return Math.round(accuracy * 0.6 + streakBonus + masteryRatio * 0.4)
  }

  function calculateLearningProgress(): number {
    if (stats.value.totalVocabulary === 0) return 0

    const weightedSum = Object.entries(stats.value.memoryLevelDistribution)
      .reduce((sum, [level, count]) => {
        const levelNum = parseInt(level) as MemoryLevel
        return sum + (count * levelNum)
      }, 0)

    const maxPossibleSum = stats.value.totalVocabulary * 7
    return Math.round((weightedSum / maxPossibleSum) * 100)
  }

  function determineImprovementTrend(): 'up' | 'down' | 'stable' {
    // This would ideally compare recent performance with historical performance
    // For now, use accuracy as a simple indicator
    const accuracy = calculateOverallAccuracy()
    if (accuracy >= 80) return 'up'
    if (accuracy >= 60) return 'stable'
    return 'down'
  }

  // Data loading functions
  async function loadContentStats(): Promise<void> {
    loading.value.content = true
    try {
      const [units, vocabulary, vocabularyByType, tags] = await Promise.all([
        db.units.count(),
        db.vocabularyItems.count(),
        Promise.all([
          db.vocabularyItems.where('type').equals('chinese').count(),
          db.vocabularyItems.where('type').equals('english').count()
        ]),
        db.tags.count()
      ])

      const audioCount = await db.vocabularyItems.filter(item => item.hasAudio === true).count()
      const audioCoverage = vocabulary > 0 ? (audioCount / vocabulary) * 100 : 0

      stats.value.totalUnits = units
      stats.value.totalVocabulary = vocabulary
      stats.value.vocabularyByType = {
        chinese: vocabularyByType[0],
        english: vocabularyByType[1]
      }
      stats.value.totalTags = tags
      stats.value.activeUnits = units // Simplified - could filter by recent activity
      stats.value.audioCoverage = Math.round(audioCoverage)
    } catch (error) {
      console.error('Error loading content stats:', error)
    } finally {
      loading.value.content = false
    }
  }

  async function loadLearningStats(): Promise<void> {
    loading.value.learning = true
    try {
      // Get dictation statistics
      const dictationStats = await dictationService.getDictationSessionStats()
      const dictationSessions = await db.dictationSessions.count()

      // Get review statistics
      const reviewStats = await reviewService.getReviewStatistics()
      const reviewSessions = await db.reviewSessions.count()

      // Get memory level distribution
      const memoryStates = await db.memoryStates.toArray()
      const memoryLevelDistribution: Record<MemoryLevel, number> = {
        0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0
      }

      memoryStates.forEach(state => {
        const level = state.memoryLevel as MemoryLevel
        memoryLevelDistribution[level]++
      })

      // Calculate mastered vocabulary (levels 5-7)
      const masteredVocabulary = Object.entries(memoryLevelDistribution)
        .filter(([level]) => parseInt(level) >= 5)
        .reduce((sum, [, count]) => sum + count, 0)

      stats.value.totalDictationSessions = dictationSessions
      stats.value.totalReviewSessions = reviewSessions
      stats.value.totalPracticeSessions = dictationSessions + reviewSessions
      stats.value.averageDictationAccuracy = dictationStats.averageAccuracy
      stats.value.averageReviewAccuracy = reviewStats.averageAccuracy
      stats.value.bestAccuracy = Math.max(dictationStats.bestAccuracy, reviewStats.averageAccuracy)
      stats.value.currentStreak = reviewStats.streakDays
      stats.value.memoryLevelDistribution = memoryLevelDistribution
      stats.value.masteredVocabulary = masteredVocabulary
      stats.value.overdueReviews = reviewStats.overdueWordsCount
      stats.value.learningProgress = calculateLearningProgress()
      stats.value.improvementTrend = determineImprovementTrend()

      // Calculate total practice time (simplified - would need duration tracking)
      stats.value.totalPracticeTime = Math.round((dictationSessions + reviewSessions) * 5) // Assume 5 min avg per session
    } catch (error) {
      console.error('Error loading learning stats:', error)
    } finally {
      loading.value.learning = false
    }
  }

  async function loadSystemStats(): Promise<void> {
    loading.value.system = true
    try {
      // Calculate database size
      const [tags, units, vocabulary, dictationSessions, reviewSessions] = await Promise.all([
        db.tags.toArray(),
        db.units.toArray(),
        db.vocabularyItems.toArray(),
        db.dictationSessions.toArray(),
        db.reviewSessions.toArray()
      ])

      const allData = { tags, units, vocabulary, dictationSessions, reviewSessions }
      const jsonString = JSON.stringify(allData)
      const dbSize = new Blob([jsonString]).size

      // Get last activity
      const allDates = [
        ...tags.map(t => new Date(t.updatedAt)),
        ...units.map(u => new Date(u.updatedAt)),
        ...vocabulary.map(v => new Date(v.updatedAt)),
        ...dictationSessions.map(s => new Date(s.completedAt || s.startedAt)),
        ...reviewSessions.map(s => new Date(s.completedAt || s.startedAt))
      ].filter(date => !isNaN(date.getTime()))

      const lastActivity = allDates.length > 0 ? new Date(Math.max(...allDates.map(d => d.getTime()))) : new Date()

      // Calculate error rate (simplified)
      const totalSessions = dictationSessions.length + reviewSessions.length
      const errorCount = dictationSessions.filter(s => s.accuracy && s.accuracy < 60).length +
                       reviewSessions.filter(s => s.accuracy && s.accuracy < 60).length
      const errorRate = totalSessions > 0 ? (errorCount / totalSessions) * 100 : 0

      stats.value.databaseSize = formatBytes(dbSize)
      stats.value.lastActivity = lastActivity
      stats.value.lastModified = lastActivity
      stats.value.storageLocation = 'IndexedDB (本地)'
      stats.value.errorRate = Math.round(errorRate)
    } catch (error) {
      console.error('Error loading system stats:', error)
    } finally {
      loading.value.system = false
    }
  }

  // Public methods
  async function refreshStats(): Promise<void> {
    await Promise.all([
      loadContentStats(),
      loadLearningStats(),
      loadSystemStats()
    ])
  }

  async function refreshContentStats(): Promise<void> {
    await loadContentStats()
  }

  async function refreshLearningStats(): Promise<void> {
    await loadLearningStats()
  }

  async function refreshSystemStats(): Promise<void> {
    await loadSystemStats()
  }

  function startAutoRefresh(): void {
    if (finalConfig.refreshInterval > 0) {
      refreshTimer = setInterval(() => {
        void refreshStats()
      }, finalConfig.refreshInterval)
    }
  }

  function stopAutoRefresh(): void {
    if (refreshTimer) {
      clearInterval(refreshTimer)
      refreshTimer = null
    }
  }

  // Lifecycle
  onMounted(async () => {
    await refreshStats()
    startAutoRefresh()
  })

  onUnmounted(() => {
    stopAutoRefresh()
  })

  return {
    stats: readonly(stats),
    dashboardStats,
    isLoading,
    config: finalConfig,
    refreshStats,
    refreshContentStats,
    refreshLearningStats,
    refreshSystemStats,
    startAutoRefresh,
    stopAutoRefresh
  }
}