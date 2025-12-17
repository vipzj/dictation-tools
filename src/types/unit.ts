export interface Unit {
  id: string
  name: string
  createdAt: Date
  updatedAt: Date
}

export interface CreateUnitRequest {
  name: string
  tagIds?: string[]
}

export interface UpdateUnitRequest {
  name?: string
  tagIds?: string[]
}

export interface VocabularyItem {
  id: string
  unitId: string
  type: 'chinese' | 'english'
  text: string
  audioBlob?: Blob
  audioSize?: number
  hasAudio: boolean
  createdAt: Date
  updatedAt: Date
}

export interface CreateVocabularyItemRequest {
  unitId: string
  type: 'chinese' | 'english'
  text: string
}

export interface UpdateVocabularyItemRequest {
  text?: string
  audioBlob?: Blob
}

export interface UnitTag {
  id: string // Composite key: unitId-tagId
  unitId: string
  tagId: string
  createdAt: Date
}

export interface UnitWithVocabularyCount extends Unit {
  vocabularyCount: number
  chineseCount: number
  englishCount: number
  tags: Array<{
    id: string
    name: string
    color: string
  }>
}

export interface UnitSearchFilter {
  query?: string
  tagIds?: string[]
}

export interface VocabularyStats {
  totalUnits: number
  totalVocabularyItems: number
  totalChineseItems: number
  totalEnglishItems: number
  totalAudioRecordings: number
}

export enum VocabularyType {
  CHINESE = 'chinese',
  ENGLISH = 'english'
}

export const VOCABULARY_TYPE_LABELS = {
  [VocabularyType.CHINESE]: '中文',
  [VocabularyType.ENGLISH]: 'English'
} as const;