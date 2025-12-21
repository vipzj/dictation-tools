import type { VocabularyItem } from './unit'
import type { DictationResult } from './dictation'

export interface ReviewVocabulary {
  id: string
  sourceUnitId: string // Reference to original unit
  sourceVocabularyItemId: string // Reference to original vocabulary
  text: string
  type: 'chinese' | 'english'
  addedAt: Date
  addedFromDictationResult: DictationResult // Reference to the error that triggered addition
  hasAudio: boolean
  audioSource: 'recorded' | 'tts'
  audioBlob?: Blob | null
  audioSize?: number
  createdAt: Date
  updatedAt: Date
}

export interface ReviewMemoryState {
  id: string
  reviewVocabularyId: string
  memoryLevel: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 // Ebbinghaus levels
  lastReviewDate: Date
  nextReviewDate: Date
  errorCount: number
  successStreak: number
  difficultyScore: number
  createdAt: Date
  updatedAt: Date
}

export interface MemoryState {
  id: string
  vocabularyItemId: string
  memoryLevel: number // 0-7 levels of mastery
  lastReviewDate: Date
  nextReviewDate: Date
  errorCount: number
  successStreak: number
  difficultyScore: number
  createdAt: Date
  updatedAt: Date
}

export interface ReviewSession {
  id: string
  vocabularyItems: ReviewItem[]
  settings: ReviewSettings
  startedAt: Date
  completedAt?: Date
  accuracy?: number
  duration?: number // in seconds
}

export interface ReviewResult {
  id: string
  vocabularyItemId: string
  vocabularyText: string
  vocabularyType: 'chinese' | 'english'
  isCorrect: boolean
  audioSource: 'recorded' | 'tts'
  responseTime: number // milliseconds
  reviewSessionId: string
  memoryStateBefore?: MemoryState | ReviewMemoryState | undefined
  memoryStateAfter?: MemoryState | ReviewMemoryState | undefined
}

export interface ReviewItem {
  vocabularyItem: VocabularyItem | ReviewVocabulary
  memoryState?: MemoryState | ReviewMemoryState
  priority: number
}

export interface ReviewSettings {
  wordCount: number
  difficultyFilter: 'all' | 'easy' | 'hard'
  maxDailyReviews: number
  units?: string[] // optional unit filter
  autoPlayAudio?: boolean
  showMemoryLevel?: boolean
  showProgress?: boolean
  adaptiveDifficulty?: boolean
  algorithmType?: string
  intervalMultiplier?: number
  forgettingFactor?: number
  // Audio playback settings
  playCount: number
  interval: number // seconds between different words
  intraWordInterval: number // seconds between multiple plays of the same word
}

export interface ReviewSessionSummary {
  id: string
  itemCount: number
  correctCount: number
  accuracy: number
  duration: number
  startedAt: Date
  completedAt: Date
  memoryLevelImprovements: number
  newItemsCount: number
  strengthenedItemsCount: number
}

export const DEFAULT_REVIEW_SETTINGS: ReviewSettings = {
  wordCount: 15,
  difficultyFilter: 'all',
  maxDailyReviews: 30,
  playCount: 2,
  interval: 3,
  intraWordInterval: 1.0,
  units: [],
  autoPlayAudio: true,
  showMemoryLevel: true,
  showProgress: true,
  adaptiveDifficulty: true,
  algorithmType: 'ebbinghaus',
  intervalMultiplier: 1.0,
  forgettingFactor: 0.5
} as const

export const EBBINGHAUS_INTERVALS = [
  1,   // Level 0 -> 1: Initial learning
  2,   // Level 1 -> 2: First review
  4,   // Level 2 -> 4: Second review
  7,   // Level 3 -> 7: Third review
  15,  // Level 4 -> 15: Fourth review
  30,  // Level 5 -> 30: Fifth review
  30,  // Level 6 -> 30: Sixth review
  30   // Level 7 -> 30: Maintenance level
] as const

export type MemoryLevel = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7

export interface ReviewProgress {
  totalWords: number
  reviewedWords: number
  correctWords: number
  currentWordIndex: number
  sessionAccuracy: number
}

export interface ReviewStatistics {
  totalSessions: number
  totalReviews: number
  averageAccuracy: number
  memoryLevelDistribution: Record<MemoryLevel, number>
  wordsAtEachLevel: Record<MemoryLevel, number>
  overdueWordsCount: number
  todayReviewsCount: number
  streakDays: number
}