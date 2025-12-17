import Dexie, { type Table } from 'dexie'
import type { Tag } from '../types/tag'
import type { Unit, VocabularyItem, UnitTag } from '../types/unit'

export class AppDatabase extends Dexie {
  tags!: Table<Tag>
  units!: Table<Unit>
  vocabularyItems!: Table<VocabularyItem>
  unitTags!: Table<UnitTag>

  constructor() {
    super('dictation-tools-database')

    this.version(1).stores({
      tags: 'id, name, color, createdAt, updatedAt'
    })

    this.version(2).stores({
      tags: 'id, name, color, createdAt, updatedAt',
      units: 'id, name, createdAt, updatedAt',
      vocabularyItems: 'id, unitId, type, text, hasAudio, createdAt, updatedAt',
      unitTags: 'unitId, tagId, createdAt' // Old schema without primary key
    }).upgrade(() => {
      // Handle version 2 upgrade if needed
      console.log('Upgrading database to version 2')
    })

    this.version(3).stores({
      tags: 'id, name, color, createdAt, updatedAt',
      units: 'id, name, createdAt, updatedAt',
      vocabularyItems: 'id, unitId, type, text, hasAudio, createdAt, updatedAt',
      unitTags: '++id, unitId, tagId, createdAt' // New schema with auto-increment primary key
    }).upgrade(tx => {
      // Migrate existing unitTags to new schema
      return tx.table('unitTags').toCollection().modify(oldUnitTag => {
        // Generate composite key for the new id field
        oldUnitTag.id = `${oldUnitTag.unitId}-${oldUnitTag.tagId}`
      })
    })
  }

  // Helper method to ensure database is properly initialized
  async waitForReady(): Promise<void> {
    // This ensures the database is open and ready
    if (!this.isOpen()) {
      await this.open();
    }
  }
}

export const db = new AppDatabase()

export const tagService = {
  async getAllTags(): Promise<Tag[]> {
    return await db.tags.orderBy('name').toArray()
  },

  async getTagById(id: string): Promise<Tag | undefined> {
    return await db.tags.get(id)
  },

  async createTag(tag: Pick<Tag, 'name' | 'color'>): Promise<Tag> {
    const now = new Date()
    const id = crypto.randomUUID()

    const newTag: Tag = {
      ...tag,
      id,
      createdAt: now,
      updatedAt: now
    }

    await db.tags.add(newTag)
    return newTag
  },

  async updateTag(id: string, updates: Partial<Omit<Tag, 'id' | 'createdAt'>>): Promise<Tag | undefined> {
    const existing = await db.tags.get(id)
    if (!existing) return undefined

    const updatedTag: Tag = {
      ...existing,
      ...updates,
      updatedAt: new Date()
    }

    await db.tags.update(id, updatedTag)
    return updatedTag
  },

  async deleteTag(id: string): Promise<boolean> {
    await db.tags.delete(id)
    return true
  },

  async getTagByName(name: string): Promise<Tag | undefined> {
    return await db.tags.where('name').equals(name).first()
  }
}

export const unitService = {
  async getAllUnits(): Promise<Unit[]> {
    return await db.units.orderBy('name').toArray()
  },

  async getUnitById(id: string): Promise<Unit | undefined> {
    return await db.units.get(id)
  },

  async createUnit(unit: Pick<Unit, 'name'>): Promise<Unit> {
    const now = new Date()
    const id = crypto.randomUUID()

    const newUnit: Unit = {
      ...unit,
      id,
      createdAt: now,
      updatedAt: now
    }

    await db.units.add(newUnit)
    return newUnit
  },

  async updateUnit(id: string, updates: Partial<Omit<Unit, 'id' | 'createdAt'>>): Promise<Unit | undefined> {
    const existing = await db.units.get(id)
    if (!existing) return undefined

    const updatedUnit: Unit = {
      ...existing,
      ...updates,
      updatedAt: new Date()
    }

    await db.units.update(id, updatedUnit)
    return updatedUnit
  },

  async deleteUnit(id: string): Promise<boolean> {
    await db.units.delete(id)
    // Also delete associated vocabulary items and tag relationships
    await db.vocabularyItems.where('unitId').equals(id).delete()
    await db.unitTags.where('unitId').equals(id).delete()
    return true
  },

  async getUnitByName(name: string): Promise<Unit | undefined> {
    return await db.units.where('name').equals(name).first()
  },

  async searchUnits(query: string, tagIds?: string[]): Promise<Unit[]> {
    let units = db.units.toCollection()

    if (query) {
      units = units.filter(unit =>
        unit.name.toLowerCase().includes(query.toLowerCase())
      )
    }

    const result = await units.toArray()

    if (tagIds && tagIds.length > 0) {
      // Filter units that have all specified tags
      const unitsWithTags = new Set<string>()

      for (const tagId of tagIds) {
        const unitIds = await db.unitTags.where('tagId').equals(tagId).toArray()
        const unitIdSet = new Set(unitIds.map(ut => ut.unitId))

        if (unitsWithTags.size === 0) {
          unitIdSet.forEach(id => unitsWithTags.add(id))
        } else {
          // Keep only units that are in both sets (intersection)
          const currentUnits = new Set(unitsWithTags)
          currentUnits.forEach(id => {
            if (!unitIdSet.has(id)) {
              unitsWithTags.delete(id)
            }
          })
        }
      }

      return result.filter(unit => unitsWithTags.has(unit.id))
    }

    return result
  }
}

export const vocabularyService = {
  async getVocabularyItemsByUnit(unitId: string): Promise<VocabularyItem[]> {
    return await db.vocabularyItems
      .where('unitId')
      .equals(unitId)
      .sortBy('createdAt')
  },

  async getVocabularyItemById(id: string): Promise<VocabularyItem | undefined> {
    return await db.vocabularyItems.get(id)
  },

  async createVocabularyItem(item: Omit<VocabularyItem, 'id' | 'createdAt' | 'updatedAt'>): Promise<VocabularyItem> {
    const now = new Date()
    const id = crypto.randomUUID()

    const newItem: VocabularyItem = {
      ...item,
      id,
      createdAt: now,
      updatedAt: now
    }

    await db.vocabularyItems.add(newItem)
    return newItem
  },

  async updateVocabularyItem(id: string, updates: Partial<Omit<VocabularyItem, 'id' | 'createdAt'>>): Promise<VocabularyItem | undefined> {
    const existing = await db.vocabularyItems.get(id)
    if (!existing) return undefined

    const updatedItem: VocabularyItem = {
      ...existing,
      ...updates,
      updatedAt: new Date()
    }

    await db.vocabularyItems.update(id, updatedItem)
    return updatedItem
  },

  async deleteVocabularyItem(id: string): Promise<boolean> {
    await db.vocabularyItems.delete(id)
    return true
  },

  async getVocabularyCountByUnit(unitId: string): Promise<{ total: number; chinese: number; english: number }> {
    const items = await db.vocabularyItems.where('unitId').equals(unitId).toArray()

    return {
      total: items.length,
      chinese: items.filter(item => item.type === 'chinese').length,
      english: items.filter(item => item.type === 'english').length
    }
  },

  // Audio blob storage and retrieval methods (Task 3.6)
  async getAudioBlob(vocabularyItemId: string): Promise<Blob | undefined> {
    const item = await db.vocabularyItems.get(vocabularyItemId)
    return item?.audioBlob
  },

  async setAudioBlob(vocabularyItemId: string, audioBlob: Blob): Promise<boolean> {
    try {
      const existing = await db.vocabularyItems.get(vocabularyItemId)
      if (!existing) return false

      await db.vocabularyItems.update(vocabularyItemId, {
        audioBlob,
        audioSize: audioBlob.size,
        hasAudio: true,
        updatedAt: new Date()
      })
      return true
    } catch (error) {
      console.error('Error setting audio blob:', error)
      return false
    }
  },

  async removeAudioBlob(vocabularyItemId: string): Promise<boolean> {
    try {
      const existing = await db.vocabularyItems.get(vocabularyItemId)
      if (!existing) return false

      await db.vocabularyItems.update(vocabularyItemId, {
        audioBlob: undefined,
        audioSize: 0,
        hasAudio: false,
        updatedAt: new Date()
      })
      return true
    } catch (error) {
      console.error('Error removing audio blob:', error)
      return false
    }
  },

  async getVocabularyItemsWithAudio(unitId: string): Promise<VocabularyItem[]> {
    return await db.vocabularyItems
      .where('unitId')
      .equals(unitId)
      .and(item => item.hasAudio === true)
      .sortBy('createdAt')
  },

  async getTotalAudioSize(unitId?: string): Promise<number> {
    let items: VocabularyItem[] = []
    if (unitId) {
      items = await db.vocabularyItems.where('unitId').equals(unitId).toArray()
    } else {
      items = await db.vocabularyItems.toArray()
    }

    return items
      .filter(item => item.hasAudio === true && item.audioSize && item.audioSize > 0)
      .reduce((total, item) => total + (item.audioSize || 0), 0)
  },

  async cleanupOrphanedAudio(): Promise<number> {
    // Clean up audio blobs where hasAudio is false but audioBlob exists
    const items = await db.vocabularyItems
      .filter(item => !item.hasAudio && !!item.audioBlob)
      .toArray()

    for (const item of items) {
      await db.vocabularyItems.update(item.id, {
        audioBlob: undefined,
        audioSize: 0
      })
    }

    return items.length
  }
}

export const unitTagService = {
  async getUnitTags(unitId: string): Promise<Tag[]> {
    const unitTagRelations = await db.unitTags.where('unitId').equals(unitId).toArray()
    const tagIds = unitTagRelations.map(ut => ut.tagId)

    if (tagIds.length === 0) return []

    return await db.tags.where('id').anyOf(tagIds).toArray()
  },

  async addTagToUnit(unitId: string, tagId: string): Promise<void> {
    const existing = await db.unitTags
      .where('unitId').equals(unitId)
      .and(ut => ut.tagId === tagId)
      .first()

    if (!existing) {
      const unitTag: UnitTag = {
        id: `${unitId}-${tagId}`, // Composite key
        unitId,
        tagId,
        createdAt: new Date()
      }
      await db.unitTags.add(unitTag)
    }
  },

  async removeTagFromUnit(unitId: string, tagId: string): Promise<void> {
    const targetId = `${unitId}-${tagId}`
    await db.unitTags.delete(targetId)
  },

  async setUnitTags(unitId: string, tagIds: string[]): Promise<void> {
  try {
    // Ensure database is ready
    await db.waitForReady();

    // First, remove existing tag relationships
    await db.unitTags.where('unitId').equals(unitId).delete()

    // Then add new tag relationships
    if (tagIds.length > 0) {
      // Remove any duplicates from tagIds
      const uniqueTagIds = [...new Set(tagIds)]

      const unitTags: UnitTag[] = uniqueTagIds.map(tagId => ({
        id: `${unitId}-${tagId}`, // Composite key
        unitId,
        tagId,
        createdAt: new Date()
      }))

      // Add each tag individually to ensure proper handling
      for (const unitTag of unitTags) {
        await db.unitTags.add(unitTag)
      }
    }
  } catch (error) {
    console.error('Error setting unit tags:', error)
    throw new Error(`Failed to set unit tags: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}
}