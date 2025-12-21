<template>
  <q-dialog v-model="modelValueComputed" persistent>
    <q-card style="min-width: 600px; max-width: 80vw;">
      <!-- Header -->
      <q-card-section class="row items-center q-pb-none">
        <div class="text-h6">复习完成</div>
        <q-space />
        <q-btn flat round dense icon="close" @click="closeDialog" />
      </q-card-section>

      <!-- Loading State -->
      <q-card-section v-if="loading" class="text-center q-pa-lg">
        <q-spinner-dots size="40px" color="primary" />
        <div class="q-mt-sm">正在保存复习结果...</div>
      </q-card-section>

      <!-- Results -->
      <q-card-section v-else-if="results" class="q-pa-lg">
        <!-- Summary -->
        <div class="text-center q-mb-lg">
          <div class="text-h4 q-mb-md">
            总体表现
          </div>
          <div class="row q-gutter-lg justify-center">
            <div class="text-center">
              <div class="text-h2" :class="accuracyColor">
                {{ Math.round(accuracy) }}%
              </div>
              <div class="text-caption text-grey-6">准确率</div>
            </div>
            <div class="text-center">
              <div class="text-h2 text-primary">
                {{ results.correctCount }}/{{ results.totalCount }}
              </div>
              <div class="text-caption text-grey-6">正确/总数</div>
            </div>
            <div class="text-center">
              <div class="text-h2 text-info">
                {{ formatDuration(results.duration) }}
              </div>
              <div class="text-caption text-grey-6">用时</div>
            </div>
          </div>
        </div>

        <!-- Performance Message -->
        <q-banner
          :class="performanceMessage.class"
          class="q-mb-lg"
          text-color="white"
        >
          <div class="text-h6 text-center">
            {{ performanceMessage.title }}
          </div>
          <div class="text-body1 text-center q-mt-sm">
            {{ performanceMessage.description }}
          </div>
        </q-banner>

        <!-- Memory Level Progress -->
        <div v-if="memoryLevelChanges.length > 0" class="q-mb-lg">
          <div class="text-h6 q-mb-md">记忆水平变化</div>
          <div class="row q-gutter-md">
            <div
              v-for="change in memoryLevelChanges"
              :key="change.vocabularyItemId"
              class="col-12 col-sm-6"
            >
              <q-card flat bordered>
                <q-card-section class="q-pa-md">
                  <div class="row items-center q-gutter-md">
                    <div class="col-shrink">
                      <div
                        class="memory-level-indicator"
                        :style="{ backgroundColor: getMemoryLevelColor(change.from) }"
                      >
                        {{ change.from }}
                      </div>
                    </div>
                    <div class="col-shrink">
                      <q-icon name="arrow_forward" size="md" />
                    </div>
                    <div class="col-shrink">
                      <div
                        class="memory-level-indicator"
                        :style="{ backgroundColor: getMemoryLevelColor(change.to) }"
                      >
                        {{ change.to }}
                      </div>
                    </div>
                    <div class="col">
                      <div class="text-body2">{{ change.vocabularyText }}</div>
                      <div class="text-caption text-grey-6">
                        {{ change.isCorrect ? '正确' : '错误' }}
                      </div>
                    </div>
                  </div>
                </q-card-section>
              </q-card>
            </div>
          </div>
        </div>

        <!-- Review Items List -->
        <div class="text-h6 q-mb-md">复习详情</div>
        <q-list bordered separator>
          <q-item
            v-for="(item, index) in results.items"
            :key="item.vocabularyItemId"
            :class="{ 'bg-negative-1': !item.isCorrect }"
          >
            <q-item-section avatar>
              <div class="text-h6 text-grey-6">
                {{ index + 1 }}
              </div>
            </q-item-section>

            <q-item-section>
              <q-item-label>{{ item.vocabularyText }}</q-item-label>
              <q-item-label caption>
                {{ item.vocabularyType === 'chinese' ? '中文' : 'English' }}
                · 记忆水平: {{ getMemoryLevelDescription(item.memoryLevel) }}
              </q-item-label>
            </q-item-section>

            <q-item-section side>
              <q-chip
                :color="item.isCorrect ? 'positive' : 'negative'"
                text-color="white"
                :icon="item.isCorrect ? 'check' : 'close'"
              >
                {{ item.isCorrect ? '正确' : '错误' }}
              </q-chip>
            </q-item-section>
          </q-item>
        </q-list>
      </q-card-section>

      <!-- Actions -->
      <q-card-actions align="right" class="q-pa-md">
        <q-btn
          flat
          label="返回复习"
          @click="closeDialog"
        />
        <q-btn
          color="primary"
          label="查看复习历史"
          @click="goToHistory"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { reviewSessionService, memoryAlgorithmService } from '../services/index'
import type { MemoryLevel } from '../types/review'

// Props
const props = defineProps<{
  modelValue: boolean
  sessionId: string
}>()

// Emits
const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'saved'): void
}>()

const modelValueComputed = computed({
  get: () => props.modelValue,
  set: (value: boolean) => emit('update:modelValue', value)
})

// Router
const router = useRouter()

// State
const loading = ref(false)
const results = ref<{
  totalCount: number
  correctCount: number
  accuracy: number
  duration: number
  items: Array<{
    vocabularyItemId: string
    vocabularyText: string
    vocabularyType: 'chinese' | 'english'
    isCorrect: boolean
    memoryLevel: MemoryLevel
  }>
} | null>(null)

const memoryLevelChanges = ref<Array<{
  vocabularyItemId: string
  vocabularyText: string
  from: MemoryLevel
  to: MemoryLevel
  isCorrect: boolean
}>>([])

// Computed
const accuracy = computed(() => results.value?.accuracy || 0)

const accuracyColor = computed(() => {
  const acc = accuracy.value
  if (acc >= 90) return 'text-positive'
  if (acc >= 70) return 'text-warning'
  return 'text-negative'
})

const performanceMessage = computed(() => {
  const acc = accuracy.value
  if (acc >= 90) {
    return {
      class: 'bg-positive',
      title: '表现优秀！',
      description: '您的复习效果非常好，继续保持！'
    }
  } else if (acc >= 70) {
    return {
      class: 'bg-info',
      title: '表现良好！',
      description: '您已经掌握了大部分词汇，再接再厉！'
    }
  } else {
    return {
      class: 'bg-warning',
      title: '需要更多练习',
      description: '建议增加复习频率，巩固记忆效果。'
    }
  }
})

// Watch for dialog open
watch(() => props.modelValue, async (newValue) => {
  if (newValue && props.sessionId) {
    await loadResults()
  }
})

// Methods
const loadResults = async () => {
  try {
    loading.value = true

    // Load session data
    const session = await reviewSessionService.getReviewSessionById(props.sessionId)

    if (!session) {
      throw new Error('Session not found')
    }

    // Generate mock results for demonstration
    // In a real implementation, this would come from the actual completed session
    const mockResults = {
      totalCount: session.vocabularyItems.length,
      correctCount: Math.round(session.vocabularyItems.length * 0.75), // 75% accuracy
      accuracy: 75,
      duration: session.duration || 0,
      items: session.vocabularyItems.map(item => ({
        vocabularyItemId: item.vocabularyItem.id,
        vocabularyText: item.vocabularyItem.text,
        vocabularyType: item.vocabularyItem.type,
        isCorrect: Math.random() > 0.25, // 75% chance of being correct
        memoryLevel: (item.memoryState?.memoryLevel || 0) as MemoryLevel
      }))
    }

    results.value = mockResults

    // Generate memory level changes
    const changes = session.vocabularyItems.slice(0, 5).map(item => ({
      vocabularyItemId: item.vocabularyItem.id,
      vocabularyText: item.vocabularyItem.text,
      from: (item.memoryState?.memoryLevel || 0) as MemoryLevel,
      to: Math.min(7, (item.memoryState?.memoryLevel || 0) + (Math.random() > 0.3 ? 1 : -1)) as MemoryLevel,
      isCorrect: Math.random() > 0.3
    }))

    memoryLevelChanges.value = changes

  } catch (error) {
    console.error('Failed to load review results:', error)
  } finally {
    loading.value = false
  }
}

const formatDuration = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
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

const closeDialog = () => {
  modelValueComputed.value = false
  emit('saved')
}

const goToHistory = () => {
  modelValueComputed.value = false
  void router.push({ name: 'review-history' })
}
</script>

<style scoped>
.memory-level-indicator {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  font-size: 14px;
}
</style>