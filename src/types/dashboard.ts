import type { MemoryLevel } from './review'

export interface SystemStats {
  // Content Statistics
  totalUnits: number
  totalVocabulary: number
  vocabularyByType: { chinese: number; english: number }
  totalTags: number
  activeUnits: number
  audioCoverage: number

  // Practice Analytics
  totalDictationSessions: number
  totalReviewSessions: number
  totalPracticeSessions: number
  averageDictationAccuracy: number
  averageReviewAccuracy: number
  bestAccuracy: number
  currentStreak: number
  totalPracticeTime: number

  // Learning Progress
  memoryLevelDistribution: Record<MemoryLevel, number>
  overdueReviews: number
  masteredVocabulary: number
  learningProgress: number

  // System Analytics
  databaseSize: string
  lastActivity: Date
  lastModified: Date
  storageLocation: string
  errorRate: number
  improvementTrend: 'up' | 'down' | 'stable'
}

export interface DashboardStats {
  content: ContentStats
  learning: LearningStats
  system: SystemMetrics
}

export interface ContentStats {
  totalUnits: number
  totalVocabulary: number
  vocabularyByType: { chinese: number; english: number }
  totalTags: number
  activeUnits: number
  audioCoverage: number
}

export interface LearningStats {
  totalSessions: number
  averageAccuracy: number
  bestAccuracy: number
  currentStreak: number
  memoryLevelDistribution: Record<MemoryLevel, number>
  masteredVocabulary: number
  overdueReviews: number
  totalPracticeTime: number
  improvementTrend: 'up' | 'down' | 'stable'
}

export interface SystemMetrics {
  databaseSize: string
  lastActivity: Date
  lastModified: Date
  storageLocation: string
  errorRate: number
  performanceScore: number
}

export interface HelpSection {
  title: string
  description: string
  items: HelpItem[]
}

export interface HelpItem {
  title: string
  description: string
  link?: string
  icon?: string
  color?: string
  action?: () => void
  content?: string
  actionLabel?: string
}

export interface QuickAction {
  title: string
  description: string
  icon: string
  color: string
  route: string
  badge: number
  badgeColor: string
  action?: () => void
}

export interface LoadingState {
  content: boolean
  learning: boolean
  system: boolean
}

export interface DashboardConfig {
  refreshInterval: number
  enableAutoRefresh: boolean
  enableAnimations: boolean
  showDetailedStats: boolean
  compactMode: boolean
}