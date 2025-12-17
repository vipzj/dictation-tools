import Dexie, { type Table } from 'dexie'
import type { Tag } from '../types/tag'

export class AppDatabase extends Dexie {
  tags!: Table<Tag>

  constructor() {
    super('dictation-tools-database')

    this.version(1).stores({
      tags: 'id, name, color, createdAt, updatedAt'
    })
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