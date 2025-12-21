import { tagService, unitService, vocabularyService } from './indexeddb'
import type { InitializationStats, SampleTag, SampleUnit, SampleVocabulary } from '../types/initializer'

export class DataInitializer {
  /**
   * Initialize all sample data (tags, units, and vocabulary)
   */
  async initializeAllSampleData(): Promise<InitializationStats> {
    const stats: InitializationStats = {
      tagsCount: 0,
      unitsCount: 0,
      vocabularyCount: 0
    }

    try {
      // Initialize tags first
      const tagIds = await this.initializeSampleTags()
      stats.tagsCount = tagIds.length

      // Then initialize units
      const unitIds = await this.initializeSampleUnits()
      stats.unitsCount = unitIds.length

      // Finally initialize vocabulary items
      const vocabularyCount = await this.initializeSampleVocabulary(unitIds)
      stats.vocabularyCount = vocabularyCount

      return stats
    } catch (error) {
      console.error('Failed to initialize sample data:', error)
      throw new Error(`Data initialization failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Initialize sample tags
   */
  async initializeSampleTags(): Promise<string[]> {
    const tagIds: string[] = []

    for (const sampleTag of this.getSampleTags()) {
      try {
        // Check if tag already exists
        const existingTag = await tagService.getTagByName(sampleTag.name)
        if (!existingTag) {
          const newTag = await tagService.createTag({
            name: sampleTag.name,
            color: sampleTag.color
          })
          tagIds.push(newTag.id)
        } else {
          tagIds.push(existingTag.id)
        }
      } catch (error) {
        console.error(`Failed to create tag "${sampleTag.name}":`, error)
        // Continue with other tags even if one fails
      }
    }

    return tagIds
  }

  /**
   * Initialize sample units
   */
  async initializeSampleUnits(): Promise<string[]> {
    const unitIds: string[] = []

    for (const sampleUnit of this.getSampleUnits()) {
      try {
        // Check if unit already exists
        const existingUnit = await unitService.getUnitByName(sampleUnit.name)
        if (!existingUnit) {
          const newUnit = await unitService.createUnit({
            name: sampleUnit.name
          })
          unitIds.push(newUnit.id)
        } else {
          unitIds.push(existingUnit.id)
        }
      } catch (error) {
        console.error(`Failed to create unit "${sampleUnit.name}":`, error)
        // Continue with other units even if one fails
      }
    }

    return unitIds
  }

  /**
   * Initialize sample vocabulary items
   */
  async initializeSampleVocabulary(unitIds: string[]): Promise<number> {
    let vocabularyCount = 0
    const sampleUnits = this.getSampleUnits()
    const sampleVocabulary = this.getSampleVocabulary()

    for (let i = 0; i < unitIds.length && i < sampleUnits.length; i++) {
      const unitId = unitIds[i]
      if (!unitId) continue

      const unitName = sampleUnits[i]?.name
      if (!unitName) continue

      const vocabularyItems = sampleVocabulary[unitName] || []

      for (const sampleVocab of vocabularyItems) {
        try {
          await vocabularyService.createVocabularyItem({
            unitId,
            type: sampleVocab.type,
            text: sampleVocab.text,
            hasAudio: false
          })
          vocabularyCount++
        } catch (error) {
          console.error(`Failed to create vocabulary item "${sampleVocab.text}":`, error)
          // Continue with other vocabulary items even if one fails
        }
      }
    }

    return vocabularyCount
  }

  /**
   * Get sample tags data
   */
  private getSampleTags(): SampleTag[] {
    return [
      { name: 'Beginner', color: '#4CAF50' },
      { name: 'Intermediate', color: '#FF9800' },
      { name: 'Advanced', color: '#F44336' },
      { name: 'Business', color: '#2196F3' },
      { name: 'Daily Life', color: '#9C27B0' }
    ]
  }

  /**
   * Get sample units data
   */
  private getSampleUnits(): SampleUnit[] {
    return [
      { name: 'Basic Greetings', tagIds: [] },
      { name: 'Numbers and Time', tagIds: [] },
      { name: 'Food and Drinks', tagIds: [] },
      { name: 'Family and Friends', tagIds: [] },
      { name: 'Work and Office', tagIds: [] },
      { name: 'Travel and Places', tagIds: [] }
    ]
  }

  /**
   * Get sample vocabulary data organized by unit
   */
  private getSampleVocabulary(): Record<string, SampleVocabulary[]> {
    return {
      'Basic Greetings': [
        { unitId: '', type: 'chinese', text: '你好' },
        { unitId: '', type: 'english', text: 'Hello' },
        { unitId: '', type: 'chinese', text: '谢谢' },
        { unitId: '', type: 'english', text: 'Thank you' },
        { unitId: '', type: 'chinese', text: '再见' },
        { unitId: '', type: 'english', text: 'Goodbye' },
        { unitId: '', type: 'chinese', text: '对不起' },
        { unitId: '', type: 'english', text: 'Sorry' },
        { unitId: '', type: 'chinese', text: '欢迎' },
        { unitId: '', type: 'english', text: 'Welcome' }
      ],
      'Numbers and Time': [
        { unitId: '', type: 'chinese', text: '一' },
        { unitId: '', type: 'english', text: 'One' },
        { unitId: '', type: 'chinese', text: '二' },
        { unitId: '', type: 'english', text: 'Two' },
        { unitId: '', type: 'chinese', text: '三' },
        { unitId: '', type: 'english', text: 'Three' },
        { unitId: '', type: 'chinese', text: '今天' },
        { unitId: '', type: 'english', text: 'Today' },
        { unitId: '', type: 'chinese', text: '明天' },
        { unitId: '', type: 'english', text: 'Tomorrow' },
        { unitId: '', type: 'chinese', text: '现在' },
        { unitId: '', type: 'english', text: 'Now' }
      ],
      'Food and Drinks': [
        { unitId: '', type: 'chinese', text: '水' },
        { unitId: '', type: 'english', text: 'Water' },
        { unitId: '', type: 'chinese', text: '米饭' },
        { unitId: '', type: 'english', text: 'Rice' },
        { unitId: '', type: 'chinese', text: '茶' },
        { unitId: '', type: 'english', text: 'Tea' },
        { unitId: '', type: 'chinese', text: '咖啡' },
        { unitId: '', type: 'english', text: 'Coffee' },
        { unitId: '', type: 'chinese', text: '面包' },
        { unitId: '', type: 'english', text: 'Bread' },
        { unitId: '', type: 'chinese', text: '牛奶' },
        { unitId: '', type: 'english', text: 'Milk' }
      ],
      'Family and Friends': [
        { unitId: '', type: 'chinese', text: '家人' },
        { unitId: '', type: 'english', text: 'Family' },
        { unitId: '', type: 'chinese', text: '朋友' },
        { unitId: '', type: 'english', text: 'Friend' },
        { unitId: '', type: 'chinese', text: '老师' },
        { unitId: '', type: 'english', text: 'Teacher' },
        { unitId: '', type: 'chinese', text: '学生' },
        { unitId: '', type: 'english', text: 'Student' },
        { unitId: '', type: 'chinese', text: '父母' },
        { unitId: '', type: 'english', text: 'Parents' },
        { unitId: '', type: 'chinese', text: '孩子' },
        { unitId: '', type: 'english', text: 'Child' },
        { unitId: '', type: 'chinese', text: '兄弟' },
        { unitId: '', type: 'english', text: 'Brother' },
        { unitId: '', type: 'chinese', text: '姐妹' },
        { unitId: '', type: 'english', text: 'Sister' }
      ],
      'Work and Office': [
        { unitId: '', type: 'chinese', text: '工作' },
        { unitId: '', type: 'english', text: 'Work' },
        { unitId: '', type: 'chinese', text: '会议' },
        { unitId: '', type: 'english', text: 'Meeting' },
        { unitId: '', type: 'chinese', text: '项目' },
        { unitId: '', type: 'english', text: 'Project' },
        { unitId: '', type: 'chinese', text: '报告' },
        { unitId: '', type: 'english', text: 'Report' },
        { unitId: '', type: 'chinese', text: '办公室' },
        { unitId: '', type: 'english', text: 'Office' },
        { unitId: '', type: 'chinese', text: '同事' },
        { unitId: '', type: 'english', text: 'Colleague' },
        { unitId: '', type: 'chinese', text: '经理' },
        { unitId: '', type: 'english', text: 'Manager' },
        { unitId: '', type: 'chinese', text: '老板' },
        { unitId: '', type: 'english', text: 'Boss' }
      ],
      'Travel and Places': [
        { unitId: '', type: 'chinese', text: '去' },
        { unitId: '', type: 'english', text: 'Go' },
        { unitId: '', type: 'chinese', text: '来' },
        { unitId: '', type: 'english', text: 'Come' },
        { unitId: '', type: 'chinese', text: '学校' },
        { unitId: '', type: 'english', text: 'School' },
        { unitId: '', type: 'chinese', text: '医院' },
        { unitId: '', type: 'english', text: 'Hospital' },
        { unitId: '', type: 'chinese', text: '商店' },
        { unitId: '', type: 'english', text: 'Store' },
        { unitId: '', type: 'chinese', text: '公园' },
        { unitId: '', type: 'english', text: 'Park' },
        { unitId: '', type: 'chinese', text: '机场' },
        { unitId: '', type: 'english', text: 'Airport' },
        { unitId: '', type: 'chinese', text: '酒店' },
        { unitId: '', type: 'english', text: 'Hotel' },
        { unitId: '', type: 'chinese', text: '家' },
        { unitId: '', type: 'english', text: 'Home' }
      ]
    }
  }

  /**
   * Check if sample data already exists
   */
  async hasExistingData(): Promise<boolean> {
    try {
      const [tagsCount, unitsCount, vocabularyCount] = await Promise.all([
        tagService.getAllTags().then(tags => tags.length),
        unitService.getAllUnits().then(units => units.length),
        // Get a rough estimate of vocabulary count from one unit
        unitService.getAllUnits().then(async (units) => {
          if (units.length === 0) return 0
          const firstUnit = units[0]
          if (!firstUnit?.id) return 0
          const count = await vocabularyService.getVocabularyCountByUnit(firstUnit.id)
          return count.total
        })
      ])

      // Consider data exists if we have meaningful amounts
      return tagsCount >= 3 && unitsCount >= 2 && vocabularyCount >= 5
    } catch (error) {
      console.error('Error checking existing data:', error)
      return false
    }
  }

  /**
   * Get preview of what data will be created
   */
  getDataPreview(): {
    tagsCount: number
    unitsCount: number
    vocabularyCount: number
    sampleTags: string[]
    sampleUnits: string[]
  } {
    const sampleTags = this.getSampleTags()
    const sampleUnits = this.getSampleUnits()
    const sampleVocabulary = this.getSampleVocabulary()

    const totalVocabulary = Object.values(sampleVocabulary).reduce(
      (total, vocabList) => total + vocabList.length,
      0
    )

    return {
      tagsCount: sampleTags.length,
      unitsCount: sampleUnits.length,
      vocabularyCount: totalVocabulary,
      sampleTags: sampleTags.map(tag => tag.name),
      sampleUnits: sampleUnits.map(unit => unit.name)
    }
  }
}

// Export singleton instance
export const dataInitializer = new DataInitializer()