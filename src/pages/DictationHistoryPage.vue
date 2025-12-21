<template>
  <q-page padding>
    <div class="row q-gutter-md">
      <div class="col-12">
        <div class="text-h4 q-mb-md">{{ $t('dictationHistory.title') }}</div>
        <div class="text-subtitle1 q-mb-lg">{{ $t('dictationHistory.description') }}</div>
      </div>

      <!-- Search and Filter Controls -->
      <div class="col-12">
        <q-card flat bordered>
          <q-card-section class="row q-gutter-md items-center">
            <div class="col-12 col-md-4">
              <q-input
                v-model="searchQuery"
                :label="$t('dictationHistory.searchUnits')"
                outlined
                clearable
                debounce="300"
              >
                <template v-slot:prepend>
                  <q-icon name="search" />
                </template>
              </q-input>
            </div>
            <div class="col-12 col-md-4">
              <q-select
                v-model="selectedUnitIds"
                :options="unitOptions"
                :label="$t('dictationHistory.filterByUnits')"
                outlined
                clearable
                multiple
                emit-value
                map-options
                use-chips
                options-dense
              >
                <template v-slot:prepend>
                  <q-icon name="school" />
                </template>
              </q-select>
            </div>
            <div class="col-12 col-md-4">
              <q-select
                v-model="selectedTagIds"
                :options="tagOptions"
                :label="$t('dictationHistory.filterByTags')"
                outlined
                clearable
                multiple
                emit-value
                map-options
                use-chips
                options-dense
              >
                <template v-slot:prepend>
                  <q-icon name="label" />
                </template>
              </q-select>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Date Range Filter -->
      <div class="col-12">
        <q-card flat bordered class="q-mt-md">
          <q-card-section class="row q-gutter-md items-center">
            <div class="col-12 col-md-4">
              <q-select
                v-model="dateRangeType"
                :options="dateRangeOptions"
                :label="$t('dictationHistory.timeRange')"
                outlined
                clearable
                emit-value
                map-options
              >
                <template v-slot:prepend>
                  <q-icon name="event" />
                </template>
              </q-select>
            </div>
            <div class="col-12 col-md-8" v-if="dateRangeType === 'custom'">
              <q-date
                v-model="customDateRange"
                range
                outlined
                minimal
                mask="YYYY-MM-DD"
              />
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="col-12 text-center">
        <q-spinner-dots size="40px" color="primary" />
        <div class="q-mt-sm">{{ $t('dictationHistory.loading') }}</div>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="col-12">
        <q-banner class="bg-negative text-white">
          <template v-slot:avatar>
            <q-icon name="error" />
          </template>
          {{ error }}
          <template v-slot:action>
            <q-btn flat :label="$t('dictationHistory.retry')" @click="loadHistory" />
          </template>
        </q-banner>
      </div>

      <!-- Empty State -->
      <div v-else-if="filteredSessions.length === 0" class="col-12 text-center">
        <div class="text-h6 text-grey-7 q-mb-md">
          {{ hasActiveFilters ? $t('dictationHistory.noRecordsFound') : $t('dictationHistory.noRecords') }}
        </div>
        <q-btn
          v-if="!hasActiveFilters"
          color="primary"
          :label="$t('dictationHistory.startDictation')"
          :to="{ name: 'dictation' }"
        />
        <q-btn
          v-else
          flat
          color="primary"
          :label="$t('dictationHistory.clearFilters')"
          @click="clearFilters"
        />
      </div>

      <!-- Sessions List -->
      <div v-else class="col-12">
        <div class="row q-gutter-md">
          <div
            v-for="session in filteredSessions"
            :key="session.id"
            class="col-12 col-sm-6 col-lg-4"
          >
            <q-card
              class="session-card cursor-pointer"
              flat
              bordered
            >
              <q-card-section>
                <div class="row items-center justify-between q-mb-sm">
                  <div class="text-h6">{{ session.unitName }}</div>
                  <div class="column items-end">
                    <q-chip
                      :color="getAccuracyColor(formatAccuracy(session.accuracy))"
                      text-color="white"
                      size="sm"
                    >
                      {{ displayAccuracy(session.accuracy) }}
                    </q-chip>
                    <div class="text-caption text-grey-6">
                      {{ formatDate(session.completedAt) }}
                    </div>
                  </div>
                </div>

                <div class="row q-gutter-xs q-mb-sm">
                  <q-chip
                    v-for="tag in getSessionTags(session)"
                    :key="tag.id"
                    :style="{ backgroundColor: tag.color + '20', color: tag.color }"
                    size="sm"
                    text-color="black"
                  >
                    {{ tag.name }}
                  </q-chip>
                </div>

                <div class="row q-gutter-md text-caption text-grey-7">
                  <div>
                    <q-icon name="timer" size="sm" class="q-mr-xs" />
                    {{ formatDuration(session.duration) }}
                  </div>
                  <div>
                    <q-icon name="headphones" size="sm" class="q-mr-xs" />
                    {{ session.results.length }} {{ $t('dictationHistory.vocabularyCount') }}
                  </div>
                </div>
              </q-card-section>

              <q-card-actions align="right">
                <q-btn
                  flat
                  color="negative"
                  icon="delete"
                  :label="$t('dictationHistory.deleteRecord')"
                  @click.stop="confirmDelete(session)"
                />
              </q-card-actions>
            </q-card>
          </div>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Dialog -->
    <q-dialog v-model="showDeleteDialog" persistent>
      <q-card>
        <q-card-section>
          <div class="text-h6">{{ $t('dictationHistory.deleteDialogTitle') }}</div>
        </q-card-section>

        <q-card-section v-if="sessionToDelete">
          <div>{{ $t('dictationHistory.deleteDialogMessage') }}</div>
          <div class="q-mt-sm text-weight-bold">{{ sessionToDelete.unitName }}</div>
          <div class="text-caption text-grey-6">
            {{ formatDate(sessionToDelete.completedAt) }} ·
            {{ $t('dictationHistory.deleteDialogDetails') }} {{ displayAccuracy(sessionToDelete.accuracy) }} ·
            {{ sessionToDelete.results.length }} {{ $t('dictationHistory.vocabularyCount') }}
          </div>
          <div class="text-negative q-mt-sm">
            {{ $t('dictationHistory.deleteDialogWarning') }}
          </div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat :label="$t('dictationHistory.cancel')" @click="showDeleteDialog = false" />
          <q-btn
            color="negative"
            :label="$t('dictationHistory.delete')"
            :loading="deleting"
            @click="deleteSession"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { dictationService, unitService, unitTagService, tagService } from '../services/indexeddb'
import type { DictationSession } from '../types/dictation'
import type { Unit } from '../types/unit'
import type { Tag } from '../types/tag'

// State
const loading = ref(false)
const error = ref<string | null>(null)
const sessions = ref<DictationSession[]>([])
const units = ref<Unit[]>([])
const tags = ref<Tag[]>([])
const unitTagRelations = ref<Array<{unitId: string, tagId: string}>>([])

// Filter state
const searchQuery = ref('')
const selectedUnitIds = ref<string[]>([])
const selectedTagIds = ref<string[]>([])

// Date filter state
const dateRangeType = ref<string>('')
const customDateRange = ref<{ from?: string, to?: string }>({})

// I18n
const { t } = useI18n()

const dateRangeOptions = computed(() => [
  { label: t('dictationHistoryFilters.today'), value: 'today' },
  { label: t('dictationHistoryFilters.yesterday'), value: 'yesterday' },
  { label: t('dictationHistoryFilters.thisWeek'), value: 'thisWeek' },
  { label: t('dictationHistoryFilters.lastWeek'), value: 'lastWeek' },
  { label: t('dictationHistoryFilters.thisMonth'), value: 'thisMonth' },
  { label: t('dictationHistoryFilters.lastMonth'), value: 'lastMonth' },
  { label: t('dictationHistoryFilters.last7Days'), value: 'last7Days' },
  { label: t('dictationHistoryFilters.last30Days'), value: 'last30Days' },
  { label: t('dictationHistoryFilters.customRange'), value: 'custom' }
])

// Dialog state
const showDeleteDialog = ref(false)
const sessionToDelete = ref<DictationSession | null>(null)
const deleting = ref(false)

// Computed
const unitOptions = computed(() => {
  return units.value.map(unit => ({
    label: unit.name,
    value: unit.id
  }))
})

const tagOptions = computed(() => {
  return tags.value.map(tag => ({
    label: tag.name,
    value: tag.id
  }))
})

const hasActiveFilters = computed(() => {
  return searchQuery.value ||
         selectedUnitIds.value.length > 0 ||
         selectedTagIds.value.length > 0 ||
         dateRangeType.value !== ''
})

const filteredSessions = computed(() => {
  let filtered = sessions.value

  // Filter by search query
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(session =>
      session.unitName.toLowerCase().includes(query)
    )
  }

  // Filter by selected units
  if (selectedUnitIds.value.length > 0) {
    filtered = filtered.filter(session =>
      selectedUnitIds.value.includes(session.unitId)
    )
  }

  // Filter by selected tags
  if (selectedTagIds.value.length > 0) {
    filtered = filtered.filter(session =>
      selectedTagIds.value.every(tagId =>
        getSessionTags(session).some(tag => tag.id === tagId)
      )
    )
  }

  // Filter by date range
  if (dateRangeType.value) {
    const { startDate, endDate } = getDateRangeFilter()
    if (startDate) {
      filtered = filtered.filter(session => {
        const sessionDate = new Date(session.completedAt)
        const result = sessionDate >= startDate &&
                       (!endDate || sessionDate <= endDate)
        return result
      })
    }
  }

  // Sort by completion date (newest first)
  return filtered.sort((a, b) =>
    new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()
  )
})

// Date utility functions
const getDateRangeFilter = (): { startDate?: Date, endDate?: Date } => {
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

  switch (dateRangeType.value) {
    case 'today':
      return { startDate: today, endDate: new Date(today.getTime() + 86400000 - 1) }

    case 'yesterday': {
      const yesterday = new Date(today)
      yesterday.setDate(yesterday.getDate() - 1)
      return { startDate: yesterday, endDate: today }
    }

    case 'thisWeek': {
      const startOfWeek = new Date(today)
      startOfWeek.setDate(today.getDate() - today.getDay())
      return { startDate: startOfWeek, endDate: new Date(today.getTime() + 86400000 - 1) }
    }

    case 'lastWeek': {
      const startOfLastWeek = new Date(today)
      startOfLastWeek.setDate(today.getDate() - today.getDay() - 7)
      const endOfLastWeek = new Date(startOfLastWeek)
      endOfLastWeek.setDate(startOfLastWeek.getDate() + 6)
      return { startDate: startOfLastWeek, endDate: endOfLastWeek }
    }

    case 'thisMonth': {
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
      return { startDate: startOfMonth, endDate: new Date(today.getTime() + 86400000 - 1) }
    }

    case 'lastMonth': {
      const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
      const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0)
      return { startDate: startOfLastMonth, endDate: endOfLastMonth }
    }

    case 'last7Days': {
      const sevenDaysAgo = new Date(today)
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6)
      return { startDate: sevenDaysAgo, endDate: new Date(today.getTime() + 86400000 - 1) }
    }

    case 'last30Days': {
      const thirtyDaysAgo = new Date(today)
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 29)
      return { startDate: thirtyDaysAgo, endDate: new Date(today.getTime() + 86400000 - 1) }
    }

    case 'custom':
      if (customDateRange.value.from && customDateRange.value.to) {
        return {
          startDate: new Date(customDateRange.value.from),
          endDate: new Date(customDateRange.value.to + ' 23:59:59')
        }
      }
      return {}

    default:
      return {}
  }
}

// Methods
const loadHistory = async () => {
  try {
    loading.value = true
    error.value = null

    const [allSessions, allUnits, allTags, allUnitTagRelations] = await Promise.all([
      dictationService.getAllDictationSessions(),
      unitService.getAllUnits(),
      tagService.getAllTags(),
      unitTagService.getAllUnitTags()
    ])

    sessions.value = allSessions.sort((a: DictationSession, b: DictationSession) =>
      new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()
    )
    units.value = allUnits
    tags.value = allTags
    unitTagRelations.value = allUnitTagRelations
  } catch (err) {
    console.error('Failed to load dictation history:', err)
    error.value = t('dictationHistory.loadError')
  } finally {
    loading.value = false
  }
}

const getSessionTags = (session: DictationSession): Tag[] => {
  return unitTagRelations.value
    .filter(unitTag => unitTag.unitId === session.unitId)
    .map(unitTag => tags.value.find(tag => tag.id === unitTag.tagId))
    .filter((tag): tag is Tag => tag !== undefined)
}

const getAccuracyColor = (accuracy: number): string => {
  if (accuracy >= 90) return 'green'
  if (accuracy >= 70) return 'orange'
  return 'red'
}

const formatAccuracy = (accuracy: number): number => {
  return Math.round(accuracy * 100)
}

const displayAccuracy = (accuracy: number): string => {
  return `${formatAccuracy(accuracy)}${t('dictationHistory.accuracySuffix')}`
}

const formatDate = (date: Date): string => {
  return new Date(date).toLocaleDateString(undefined, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const formatDuration = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
}

const clearFilters = () => {
  searchQuery.value = ''
  selectedUnitIds.value = []
  selectedTagIds.value = []
  dateRangeType.value = ''
  customDateRange.value = {} as { from?: string, to?: string }
}

const confirmDelete = (session: DictationSession) => {
  sessionToDelete.value = session
  showDeleteDialog.value = true
}

const deleteSession = async () => {
  if (!sessionToDelete.value) return

  try {
    deleting.value = true
    await dictationService.deleteDictationSession(sessionToDelete.value.id)

    // Remove from local state
    sessions.value = sessions.value.filter(s => s.id !== sessionToDelete.value!.id)

    showDeleteDialog.value = false
    sessionToDelete.value = null
  } catch (err) {
    console.error('Failed to delete session:', err)
    error.value = t('dictationHistory.deleteError')
  } finally {
    deleting.value = false
  }
}

// Lifecycle
onMounted(() => {
  void loadHistory()
})
</script>

<style scoped>
.session-card {
  transition: all 0.3s ease;
}

.session-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}
</style>