<template>
  <div class="tag-list">
    <div v-if="loading" class="tag-list__loading">
      <q-spinner-dots size="48px" color="primary" />
      <div class="q-mt-md text-subtitle1">{{ $t('common.loading') }}</div>
    </div>

    <div v-else-if="tags.length === 0" class="tag-list__empty">
      <q-icon name="label" size="64px" color="grey-5" />
      <div class="text-h5 q-mt-md">{{ $t('tagManagement.noTags') }}</div>
      <div class="text-body1 text-grey-6 q-mt-sm">{{ $t('tagManagement.noTagsDescription') }}</div>
      <div class="text-body2 text-grey-5 q-mt-md">
        {{ $t('tagManagement.clickFABToCreate') }}
      </div>
    </div>

    <div v-else class="tag-grid" role="list">
      <q-card
        v-for="tag in tags"
        :key="tag.id"
        class="tag-card"
        flat
        bordered
        role="listitem"
        :aria-label="`Tag: ${tag.name}, Color: ${tag.color}, Created: ${formatDate(tag.createdAt)}`"
      >
        <q-card-section class="tag-card__content">
          <div class="tag-card__header">
            <div class="tag-card__color-swatch">
              <div
                class="tag-card__color"
                :style="{ backgroundColor: tag.color }"
              />
            </div>
            <div class="tag-card__info">
              <div class="text-h6 text-weight-medium">{{ tag.name }}</div>
              <div class="text-caption text-grey-6">
                {{ formatDate(tag.createdAt) }}
              </div>
            </div>
          </div>

          <div class="tag-card__actions">
            <q-btn
              flat
              round
              dense
              icon="edit"
              color="primary"
              size="sm"
              @click="handleEdit(tag)"
              :aria-label="$t('common.edit')"
              class="tag-card__action-btn"
            >
              <q-tooltip>{{ $t('common.edit') }}</q-tooltip>
            </q-btn>
            <q-btn
              flat
              round
              dense
              icon="delete"
              color="negative"
              size="sm"
              @click="handleDelete(tag)"
              :aria-label="$t('common.delete')"
              class="tag-card__action-btn"
            >
              <q-tooltip>{{ $t('common.delete') }}</q-tooltip>
            </q-btn>
          </div>
        </q-card-section>
      </q-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useTagStore } from '../stores/tag-store'
import type { Tag } from '../types/tag'

const tagStore = useTagStore()

const tags = computed(() => tagStore.tags)
const loading = computed(() => tagStore.loading)

const emit = defineEmits<{
  edit: [tag: Tag]
  delete: [tag: Tag]
}>()

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }).format(new Date(date))
}

function handleEdit(tag: Tag) {
  emit('edit', tag)
}

function handleDelete(tag: Tag) {
  emit('delete', tag)
}
</script>

<style lang="scss" scoped>
.tag-list {
  width: 100%;
}

.tag-list__loading,
.tag-list__empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 64px 32px;
  text-align: center;
  min-height: 300px;
}

.tag-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
  width: 100%;
}

.tag-card {
  transition: all 0.3s ease;
  cursor: pointer;
  border-radius: 12px;
  overflow: hidden;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
    border-color: var(--q-primary);
  }

  &:active {
    transform: translateY(-2px);
  }
}

.tag-card__content {
  padding: 20px;
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.tag-card__header {
  display: flex;
  align-items: center;
  gap: 16px;
  flex: 1;
}

.tag-card__color-swatch {
  flex-shrink: 0;
}

.tag-card__color {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  border: 2px solid rgba(0, 0, 0, 0.08);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease;

  .tag-card:hover & {
    transform: scale(1.05);
  }
}

.tag-card__info {
  flex: 1;
  min-width: 0;
}

.tag-card__actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
}

.tag-card__action-btn {
  width: 40px;
  height: 40px;
  opacity: 0.7;
  transition: all 0.2s ease;

  &:hover {
    opacity: 1;
    transform: scale(1.1);
  }
}

// Responsive design
@media (max-width: 1200px) {
  .tag-grid {
    grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
    gap: 18px;
  }
}

@media (max-width: 768px) {
  .tag-grid {
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
    gap: 16px;
  }

  .tag-card__content {
    padding: 16px;
  }

  .tag-card__color {
    width: 40px;
    height: 40px;
  }

  .tag-card__action-btn {
    width: 36px;
    height: 36px;
  }
}

@media (max-width: 480px) {
  .tag-grid {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .tag-card__content {
    padding: 16px;
  }

  .tag-list__empty {
    padding: 48px 24px;
  }
}

// Touch-friendly improvements
@media (hover: none) and (pointer: coarse) {
  .tag-card__action-btn {
    opacity: 1;
    width: 44px;
    height: 44px;
  }

  .tag-card {
    &:active {
      transform: scale(0.98);
    }
  }
}
</style>