// Re-export all services from indexeddb.ts for easier imports
export {
  db,
  tagService,
  unitService,
  vocabularyService,
  unitTagService,
  dictationService,
  memoryStateService,
  reviewSessionService,
  reviewResultService
} from './indexeddb'

export { settingsService } from './settingsService'
export { dictationAudioService } from './dictationAudioService'
export { audioService } from './audioService'
export { reviewService } from './reviewService'
export { memoryAlgorithmService } from './memoryAlgorithmService'
export { dictationErrorAnalyzer } from './dictationErrorAnalyzer'
export { reviewVocabularyService } from './reviewVocabularyService'
export { reviewMemoryStateService } from './reviewMemoryStateService'
export { reviewAudioService } from './reviewAudioService'

// Types
export type { Tag } from '../types/tag'
export type { Unit, VocabularyItem, UnitTag } from '../types/unit'
export type { DictationSession, DictationResult, DictationSettings } from '../types/dictation'
export type {
  MemoryState,
  ReviewSession,
  ReviewResult,
  ReviewItem,
  ReviewSettings,
  ReviewSessionSummary,
  ReviewProgress,
  ReviewStatistics,
  MemoryLevel,
  ReviewVocabulary,
  ReviewMemoryState
} from '../types/review'

// App Settings
export type { AppSettings } from '../types/settings'

// Dashboard
export type {
  SystemStats,
  DashboardStats,
  ContentStats,
  LearningStats,
  SystemMetrics,
  HelpSection,
  HelpItem,
  QuickAction,
  LoadingState,
  DashboardConfig
} from '../types/dashboard'

// Dashboard Composable
export { useSystemStats } from '../composables/useSystemStats'