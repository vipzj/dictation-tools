<template>
  <q-page padding>
    <div class="row q-gutter-md">
      <div class="col-12">
        <div class="text-h4 q-mb-md">{{ $t('reviewHistory.title') }}</div>
        <div class="text-subtitle1 q-mb-lg">{{ $t('reviewHistory.description') }}</div>
      </div>

      <!-- Search and Filter Controls -->
      <div class="col-12">
        <q-card flat bordered>
          <q-card-section class="row q-gutter-md items-center">
            <div class="col-12 col-md-4">
              <q-input
                v-model="searchQuery"
                label="搜索复习记录"
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
                v-model="selectedAccuracyFilter"
                :options="accuracyFilterOptions"
                label="按准确率筛选"
                outlined
                clearable
                emit-value
                map-options
              >
                <template v-slot:prepend>
                  <q-icon name="trending_up" />
                </template>
              </q-select>
            </div>
            <div class="col-12 col-md-4">
              <q-select
                v-model="selectedMemoryLevelFilter"
                :options="memoryLevelFilterOptions"
                label="按记忆水平筛选"
                outlined
                clearable
                emit-value
                map-options
              >
                <template v-slot:prepend>
                  <q-icon name="psychology" />
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
                label="时间范围"
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
        <div class="q-mt-sm">加载中...</div>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="col-12">
        <q-banner class="bg-negative text-white">
          <template v-slot:avatar>
            <q-icon name="error" />
          </template>
          {{ error }}
          <template v-slot:action>
            <q-btn flat label="重试" @click="loadHistory" />
          </template>
        </q-banner>
      </div>

      <!-- Empty State -->
      <div v-else-if="filteredSessions.length === 0" class="col-12 text-center">
        <div class="text-h6 text-grey-7 q-mb-md">
          {{ hasActiveFilters ? '没有找到匹配的记录' : '还没有复习记录' }}
        </div>
        <q-btn
          v-if="!hasActiveFilters"
          color="primary"
          label="开始复习"
          :to="{ name: 'review' }"
        />
        <q-btn
          v-else
          flat
          color="primary"
          label="清除筛选条件"
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
              @click="viewSessionDetails(session)"
            >
              <q-card-section>
                <div class="row items-center justify-between q-mb-sm">
                  <div class="text-h6">复习练习 #{{ session.id.slice(-6) }}</div>
                  <div class="column items-end">
                    <q-chip
                      :color="getAccuracyColor(session.accuracy || 0)"
                      text-color="white"
                      size="sm"
                    >
                      {{ Math.round((session.accuracy || 0) * 100) }}%
                    </q-chip>
                    <div class="text-caption text-grey-6">
                      {{ formatDate(session.completedAt || new Date()) }}
                    </div>
                  </div>
                </div>

                <!-- Memory Level Distribution -->
                <div class="q-mb-sm">
                  <div class="text-caption text-grey-6 q-mb-xs">记忆水平分布</div>
                  <div class="row q-gutter-xs">
                    <div
                      v-for="(count, level) in getSessionMemoryLevels(session)"
                      :key="level"
                      class="memory-level-chip"
                      :style="{ backgroundColor: getMemoryLevelColor(level as MemoryLevel) }"
                    >
                      <div class="text-xs text-white text-bold">
                        L{{ level }}: {{ count }}
                      </div>
                    </div>
                  </div>
                </div>

                <div class="row q-gutter-md text-caption text-grey-7">
                  <div>
                    <q-icon name="timer" size="sm" class="q-mr-xs" />
                    {{ formatDuration(session.duration || 0) }}
                  </div>
                  <div>
                    <q-icon name="psychology" size="sm" class="q-mr-xs" />
                    {{ session.vocabularyItems.length }} 个词汇
                  </div>
                  <div>
                    <q-icon name="trending_up" size="sm" class="q-mr-xs" />
                    {{ getSessionMemoryImprovements() }} 提升
                  </div>
                </div>
              </q-card-section>

              <q-card-actions align="right">
                <q-btn
                  flat
                  color="primary"
                  icon="visibility"
                  label="查看详情"
                  @click.stop="viewSessionDetails(session)"
                />
                <q-btn
                  flat
                  color="negative"
                  icon="delete"
                  label="删除"
                  @click.stop="confirmDelete(session)"
                />
              </q-card-actions>
            </q-card>
          </div>
        </div>
      </div>
    </div>

    <!-- Session Details Dialog -->
    <q-dialog v-model="showDetailsDialog">
      <q-card style="min-width: 700px; max-width: 90vw;">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">复习练习详情</div>
          <q-space />
          <q-btn flat round dense icon="close" v-close-popup />
        </q-card-section>

        <q-card-section v-if="selectedSession" class="q-pa-lg">
          <!-- Session Summary -->
          <div class="q-mb-lg">
            <div class="text-h6 q-mb-md">练习概要</div>
            <div class="row q-gutter-md">
              <div class="col-12 col-sm-4">
                <q-card flat bordered>
                  <q-card-section class="text-center">
                    <div class="text-h4" :class="getAccuracyColor(selectedSession.accuracy || 0)">
                      {{ Math.round((selectedSession.accuracy || 0) * 100) }}%
                    </div>
                    <div class="text-caption text-grey-6">准确率</div>
                  </q-card-section>
                </q-card>
              </div>
              <div class="col-12 col-sm-4">
                <q-card flat bordered>
                  <q-card-section class="text-center">
                    <div class="text-h4 text-primary">
                      {{ selectedSession.vocabularyItems.length }}
                    </div>
                    <div class="text-caption text-grey-6">复习词汇数</div>
                  </q-card-section>
                </q-card>
              </div>
              <div class="col-12 col-sm-4">
                <q-card flat bordered>
                  <q-card-section class="text-center">
                    <div class="text-h4 text-info">
                      {{ formatDuration(selectedSession.duration || 0) }}
                    </div>
                    <div class="text-caption text-grey-6">用时</div>
                  </q-card-section>
                </q-card>
              </div>
            </div>
          </div>

          <!-- Review Items -->
          <div>
            <div class="text-h6 q-mb-md">复习词汇详情</div>
            <q-list bordered separator>
              <q-item
                v-for="(item, index) in selectedSession.vocabularyItems"
                :key="item.vocabularyItem.id"
                :class="{ 'bg-negative-1': !item.memoryState }"
              >
                <q-item-section avatar>
                  <div class="text-h6 text-grey-6">
                    {{ index + 1 }}
                  </div>
                </q-item-section>

                <q-item-section>
                  <q-item-label>{{ item.vocabularyItem.text }}</q-item-label>
                  <q-item-label caption>
                    {{ item.vocabularyItem.type === 'chinese' ? '中文' : 'English' }}
                    · 记忆水平: {{ getMemoryLevelDescription((item.memoryState?.memoryLevel || 0) as MemoryLevel) }}
                  </q-item-label>
                </q-item-section>

                <q-item-section side>
                  <div class="column items-end">
                    <q-chip
                      v-if="item.memoryState"
                      :color="getMemoryLevelColor(item.memoryState.memoryLevel as MemoryLevel)"
                      text-color="white"
                      size="sm"
                    >
                      Level {{ item.memoryState.memoryLevel }}
                    </q-chip>
                    <div class="text-caption text-grey-6 q-mt-xs">
                      难度: {{ item.memoryState?.difficultyScore || 0 }}
                    </div>
                  </div>
                </q-item-section>
              </q-item>
            </q-list>
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- Confirmation Dialog -->
    <q-dialog v-model="showDeleteDialog">
      <q-card>
        <q-card-section class="row items-center">
          <q-avatar icon="delete" color="negative" text-color="white" />
          <span class="q-ml-sm">确定要删除这条复习记录吗？</span>
        </q-card-section>

        <q-card-section>
          删除后将无法恢复，包括本次复习的所有记忆状态更新。
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="取消" color="primary" v-close-popup />
          <q-btn flat label="确定删除" color="negative" @click="deleteSession" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { reviewSessionService, memoryAlgorithmService } from '../services/index'
import type { ReviewSession, MemoryLevel } from '../types/review'
import { useQuasar } from 'quasar'

const $q = useQuasar()

// State
const loading = ref(false)
const error = ref<string | null>(null)
const sessions = ref<ReviewSession[]>([])

// Filter state
const searchQuery = ref('')
const selectedAccuracyFilter = ref('')
const selectedMemoryLevelFilter = ref('')
const dateRangeType = ref('')
const customDateRange = ref({ from: '', to: '' })

// Dialog state
const showDetailsDialog = ref(false)
const showDeleteDialog = ref(false)
const selectedSession = ref<ReviewSession | null>(null)
const sessionToDelete = ref<ReviewSession | null>(null)

// Options
const accuracyFilterOptions = [
  { label: '优秀 (90%+)', value: 'excellent' },
  { label: '良好 (70-89%)', value: 'good' },
  { label: '及格 (50-69%)', value: 'average' },
  { label: '需要练习 (<50%)', value: 'poor' }
]

const memoryLevelFilterOptions = [
  { label: '新学词汇 (0-1)', value: 'new' },
  { label: '学习中 (2-3)', value: 'learning' },
  { label: '基本掌握 (4-5)', value: 'familiar' },
  { label: '完全掌握 (6-7)', value: 'mastered' }
]

const dateRangeOptions = [
  { label: '今天', value: 'today' },
  { label: '本周', value: 'week' },
  { label: '本月', value: 'month' },
  { label: '自定义', value: 'custom' }
]

// Computed
const hasActiveFilters = computed(() => {
  return searchQuery.value ||
    selectedAccuracyFilter.value ||
    selectedMemoryLevelFilter.value ||
    dateRangeType.value ||
    customDateRange.value.from
})

const filteredSessions = computed(() => {
  let filtered = sessions.value

  // Filter by search query
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(session =>
      session.id.toLowerCase().includes(query)
    )
  }

  // Filter by accuracy
  if (selectedAccuracyFilter.value) {
    filtered = filtered.filter(session => {
      const accuracy = (session.accuracy || 0) * 100
      switch (selectedAccuracyFilter.value) {
        case 'excellent': return accuracy >= 90
        case 'good': return accuracy >= 70 && accuracy < 90
        case 'average': return accuracy >= 50 && accuracy < 70
        case 'poor': return accuracy < 50
        default: return true
      }
    })
  }

  // Filter by date range
  if (dateRangeType.value) {
    const now = new Date()
    let fromDate: Date

    switch (dateRangeType.value) {
      case 'today':
        fromDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())
        break
      case 'week':
        fromDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        break
      case 'month':
        fromDate = new Date(now.getFullYear(), now.getMonth(), 1)
        break
      case 'custom':
        if (customDateRange.value.from) {
          fromDate = new Date(customDateRange.value.from)
          const toDate = customDateRange.value.to ? new Date(customDateRange.value.to) : now
          filtered = filtered.filter(session => {
            if (!session.completedAt) return false
            const sessionDate = new Date(session.completedAt)
            return sessionDate >= fromDate && sessionDate <= toDate
          })
          return filtered
        }
        return filtered
      default:
        return filtered
    }

    filtered = filtered.filter(session => {
      return session.completedAt ? new Date(session.completedAt) >= fromDate : false
    })
  }

  // Sort by completedAt in descending order (most recent first)
  return filtered.sort((a, b) => {
    const dateA = a.completedAt ? new Date(a.completedAt).getTime() : 0
    const dateB = b.completedAt ? new Date(b.completedAt).getTime() : 0
    return dateB - dateA
  })
})

// Methods
const loadHistory = async () => {
  try {
    loading.value = true
    error.value = null

    const allSessions = await reviewSessionService.getAllReviewSessions()
    sessions.value = allSessions
  } catch (err) {
    console.error('Failed to load review history:', err)
    error.value = '加载复习历史失败，请重试'
  } finally {
    loading.value = false
  }
}

const clearFilters = () => {
  searchQuery.value = ''
  selectedAccuracyFilter.value = ''
  selectedMemoryLevelFilter.value = ''
  dateRangeType.value = ''
  customDateRange.value = { from: '', to: '' }
}

const viewSessionDetails = (session: ReviewSession) => {
  selectedSession.value = session
  showDetailsDialog.value = true
}

const confirmDelete = (session: ReviewSession) => {
  sessionToDelete.value = session
  showDeleteDialog.value = true
}

const deleteSession = async () => {
  if (!sessionToDelete.value) return

  try {
    await reviewSessionService.deleteReviewSession(sessionToDelete.value.id)

    $q.notify({
      type: 'positive',
      message: '复习记录已删除'
    })

    // Remove from local list
    sessions.value = sessions.value.filter(s => s.id !== sessionToDelete.value!.id)

    showDeleteDialog.value = false
    sessionToDelete.value = null
  } catch (err) {
    console.error('Failed to delete review session:', err)

    $q.notify({
      type: 'negative',
      message: '删除复习记录失败，请重试'
    })
  }
}

const getSessionMemoryLevels = (session: ReviewSession): Record<number, number> => {
  const levels: Record<number, number> = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0 }

  session.vocabularyItems.forEach(item => {
    if (item.memoryState) {
      const level = item.memoryState.memoryLevel
      levels[level] = (levels[level] || 0) + 1
    }
  })

  return levels
}

const getSessionMemoryImprovements = (): string => {
  // This would normally be calculated from the session results
  // For now, return a mock value
  const improvements = Math.floor(Math.random() * 5) + 1
  return `${improvements}个词汇`
}

const getAccuracyColor = (accuracy: number): string => {
  if (accuracy >= 0.9) return 'positive'
  if (accuracy >= 0.7) return 'warning'
  return 'negative'
}

const getMemoryLevelColor = (level: MemoryLevel): string => {
  const colors = [
    '#9E9E9E', // 0 - Grey
    '#FF9800', // 1 - Orange
    '#FFC107', // 2 - Amber
    '#8BC34A', // 3 - Light Green
    '#4CAF50', // 4 - Green
    '#2196F3', // 5 - Blue
    '#3F51B5', // 6 - Indigo
    '#9C27B0'  // 7 - Purple
  ]
  return (colors[level] ?? colors[0])!
}

const getMemoryLevelDescription = (level: MemoryLevel): string => {
  return memoryAlgorithmService.getMemoryLevelDescription(level)
}

const formatDate = (date: Date | string): string => {
  if (!date) return ''
  return new Date(date).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const formatDuration = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
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

.memory-level-chip {
  width: 24px;
  height: 24px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  line-height: 1;
}

.text-xs {
  font-size: 10px;
}
</style>