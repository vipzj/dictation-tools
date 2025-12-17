import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { tagService } from '../services/indexeddb'
import type { Tag, CreateTagRequest, UpdateTagRequest } from '../types/tag'

export const useTagStore = defineStore('tag', () => {
  const tags = ref<Tag[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  const sortedTags = computed(() => {
    return [...tags.value].sort((a, b) => a.name.localeCompare(b.name))
  })

  const getTagById = computed(() => {
    return (id: string) => tags.value.find(tag => tag.id === id)
  })

  const getTagByName = computed(() => {
    return (name: string) => tags.value.find(tag => tag.name.toLowerCase() === name.toLowerCase()) || undefined
  })

  async function loadTags() {
    loading.value = true
    error.value = null

    try {
      tags.value = await tagService.getAllTags()
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to load tags'
      console.error('Failed to load tags:', err)
    } finally {
      loading.value = false
    }
  }

  async function createTag(request: CreateTagRequest) {
    loading.value = true
    error.value = null

    try {
      if (request.name.trim().length < 2) {
        throw new Error('Tag name must be at least 2 characters long')
      }

      const existingTag = getTagByName.value(request.name.trim())
      if (existingTag) {
        throw new Error('A tag with this name already exists')
      }

      const defaultColors = ['#1976D2', '#388E3C', '#F57C00', '#D32F2F', '#7B1FA2', '#0288D1', '#689F38', '#FFA000']
      const defaultColor = defaultColors[Math.floor(Math.random() * defaultColors.length)]

      const tagColor = request.color || defaultColor
      const newTag = await tagService.createTag({
        name: request.name.trim(),
        color: tagColor as string
      })

      tags.value.push(newTag)
      return newTag
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to create tag'
      console.error('Failed to create tag:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  async function updateTag(id: string, request: UpdateTagRequest) {
    loading.value = true
    error.value = null

    try {
      if (request.name !== undefined) {
        const trimmedName = request.name.trim()
        if (trimmedName.length < 2) {
          throw new Error('Tag name must be at least 2 characters long')
        }

        const existingTag = getTagByName.value(trimmedName)
        if (existingTag && existingTag.id !== id) {
          throw new Error('A tag with this name already exists')
        }

        request.name = trimmedName
      }

      const updatedTag = await tagService.updateTag(id, request)
      if (!updatedTag) {
        throw new Error('Tag not found')
      }

      const index = tags.value.findIndex(tag => tag.id === id)
      if (index !== -1) {
        tags.value[index] = updatedTag
      }

      return updatedTag
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to update tag'
      console.error('Failed to update tag:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  async function deleteTag(id: string) {
    loading.value = true
    error.value = null

    try {
      const success = await tagService.deleteTag(id)
      if (!success) {
        throw new Error('Tag not found')
      }

      tags.value = tags.value.filter(tag => tag.id !== id)
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to delete tag'
      console.error('Failed to delete tag:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  function clearError() {
    error.value = null
  }

  return {
    tags: sortedTags,
    loading,
    error,
    getTagById,
    getTagByName,
    loadTags,
    createTag,
    updateTag,
    deleteTag,
    clearError
  }
})