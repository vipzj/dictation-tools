export interface DictationSession {
  id: string
  unitId: string
  unitName: string
  settings: DictationSettings
  results: DictationResult[]
  accuracy: number
  startedAt: Date
  completedAt: Date
  duration: number // in seconds
}

export interface DictationResult {
  vocabularyItemId: string
  vocabularyText: string
  vocabularyType: 'chinese' | 'english'
  isCorrect: boolean
  audioSource: 'recorded' | 'tts'
}

export interface DictationSettings {
  playCount: number
  interval: number // in seconds
}

export interface DictationSessionSummary {
  id: string
  unitId: string
  unitName: string
  accuracy: number
  itemCount: number
  correctCount: number
  startedAt: Date
  duration: number
}

export interface CreateDictationSessionRequest {
  unitId: string
  unitName: string
  settings: DictationSettings
}

export const DEFAULT_DICTATION_SETTINGS: DictationSettings = {
  playCount: 2,
  interval: 3
} as const