<template>
  <q-page padding>
    <div class="row q-gutter-md">
      <div class="col-12">
        <div class="text-h4 q-mb-md">复习练习</div>
        <div class="text-subtitle1 q-mb-lg">复习系统<strong>基于独立词汇库</strong>，在听写中出错的词汇会自动加入复习库，帮助您精准掌握困难单词</div>
      </div>

      <!-- Review Settings Card -->
      <div class="col-12">
        <q-card flat bordered>
          <q-card-section>
            <div class="text-h6 q-mb-md">复习设置</div>
            <div class="row q-gutter-md">
              <div class="col-12 col-sm-6 col-md-3">
                <q-input
                  v-model.number="reviewSettings.wordCount"
                  type="number"
                  label="复习词汇数量"
                  outlined
                  min="1"
                  max="50"
                  suffix="个"
                />
              </div>
              <div class="col-12 col-sm-6 col-md-3">
                <q-select
                  v-model="reviewSettings.difficultyFilter"
                  :options="difficultyOptions"
                  label="难度筛选"
                  outlined
                  emit-value
                  map-options
                />
              </div>
                          <div class="col-12 col-sm-6 col-md-3">
                <q-select
                  v-model="reviewSettings.focusType"
                  :options="focusTypeOptions"
                  label="复习重点"
                  outlined
                  emit-value
                  map-options
                >
                  <template v-slot:prepend>
                    <q-icon name="priority_high" />
                  </template>
                </q-select>
              </div>
              <!-- Audio Settings -->
              <div class="col-12 col-sm-6 col-md-4">
                <div class="text-subtitle2 q-mb-sm">音频播放设置</div>
                <div class="row q-gutter-sm">
                  <div class="col-12 col-md-4">
                    <q-input
                      v-model.number="reviewSettings.playCount"
                      type="number"
                      label="播放次数"
                      outlined
                      min="1"
                      max="5"
                      suffix="次"
                    />
                  </div>
                  <div class="col-12 col-md-4">
                    <q-input
                      v-model.number="reviewSettings.interval"
                      type="number"
                      label="词语间隔"
                      outlined
                      min="1"
                      max="10"
                      suffix="秒"
                    />
                  </div>
                  <div class="col-12 col-md-4">
                    <q-input
                      v-model.number="reviewSettings.intraWordInterval"
                      type="number"
                      label="内部间隔"
                      outlined
                      min="0.5"
                      max="5"
                      step="0.5"
                      suffix="秒"
                    />
                  </div>
                </div>
              </div>
              <div class="col-12 col-sm-6 col-md-3">
                <q-btn
                  color="primary"
                  label="开始复习"
                  size="lg"
                  class="full-height"
                  :loading="generatingSession"
                  :disable="!hasVocabularyForReview"
                  @click="startReviewSession"
                />
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Statistics Overview -->
      <div class="col-12">
        <q-card flat bordered>
          <q-card-section>
            <div class="text-h6 q-mb-md">复习库统计</div>
            <div class="row q-gutter-md">
              <div class="col-12 col-sm-6 col-md-3">
                <div class="text-center">
                  <div class="text-h4 text-primary">{{ reviewStatistics.totalReviews }}</div>
                  <div class="text-caption text-grey-6">复习词汇总数</div>
                </div>
              </div>
              <div class="col-12 col-sm-6 col-md-3">
                <div class="text-center">
                  <div class="text-h4 text-warning">{{ errorSummary.problematicWordsCount }}</div>
                  <div class="text-caption text-grey-6">复习库词汇数</div>
                </div>
              </div>
              <div class="col-12 col-sm-6 col-md-3">
                <div class="text-center">
                  <div class="text-h4 text-negative">{{ reviewStatistics.overdueWordsCount }}</div>
                  <div class="text-caption text-grey-6">待复习词汇</div>
                </div>
              </div>
              <div class="col-12 col-sm-6 col-md-3">
                <div class="text-center">
                  <div class="text-h4 text-positive">{{ Math.round(reviewStatistics.averageAccuracy * 100) }}%</div>
                  <div class="text-caption text-grey-6">复习准确率</div>
                </div>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Memory Level Distribution -->
      <div class="col-12">
        <q-card flat bordered>
          <q-card-section>
            <div class="text-h6 q-mb-md">记忆水平分布</div>
            <div class="row q-gutter-md items-center">
              <div
                v-for="(count, level) in reviewStatistics.wordsAtEachLevel"
                :key="level"
                class="col-12 col-sm-6 col-md-4 col-lg-3"
              >
                <div class="row items-center q-gutter-sm">
                  <div class="col-shrink">
                    <div
                      class="memory-level-indicator"
                      :style="{ backgroundColor: getMemoryLevelColor(level) }"
                    >
                      {{ level }}
                    </div>
                  </div>
                  <div class="col">
                    <div class="text-body2">{{ getMemoryLevelDescription(level) }}</div>
                    <div class="text-caption text-grey-6">{{ count }} 个词汇</div>
                  </div>
                </div>
              </div>
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
            <q-btn flat label="重试" @click="loadReviewData" />
          </template>
        </q-banner>
      </div>

      <!-- No Vocabulary State -->
      <div v-else-if="!hasVocabularyForReview" class="col-12 text-center">
        <div class="text-h6 text-grey-7 q-mb-md">
          还没有需要复习的词汇
        </div>
        <div class="text-body1 text-grey-6 q-mb-lg">
          复习系统基于<strong>独立词汇库</strong>。请先进行听写练习，当您在听写中答错单词时，系统会自动将这些单词加入复习库。
        </div>
        <q-btn
          color="primary"
          label="开始听写练习"
          :to="{ name: 'dictation' }"
        />
      </div>
    </div>

    <!-- Review Practice Dialog -->
    <ReviewPracticeDialog
      v-model="showReviewDialog"
      :session-id="currentReviewSessionId || ''"
      @complete="onReviewComplete"
    />

    <!-- Review Results Selection Dialog -->
    <ReviewResultsSelectionDialog
      v-model="showResultsDialog"
      :session-id="completedReviewSessionId || ''"
      @saved="onResultsSaved"
    />
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { reviewService, memoryAlgorithmService, dictationErrorAnalyzer } from '../services/index'
import type { ReviewSettings, ReviewStatistics, MemoryLevel } from '../types/review'
import ReviewPracticeDialog from '../components/ReviewPracticeDialog.vue'
import ReviewResultsSelectionDialog from '../components/ReviewResultsSelectionDialog.vue'

// State
const loading = ref(false)
const error = ref<string | null>(null)
const generatingSession = ref(false)

// Review settings
const reviewSettings = ref<ReviewSettings & { focusType: 'all' | 'hard' | 'easy' }>({
  wordCount: 15,
  difficultyFilter: 'all',
  maxDailyReviews: 30,
  focusType: 'all',
  playCount: 2,
  interval: 3,
  intraWordInterval: 1.0
})

// Data
const reviewStatistics = ref<ReviewStatistics>({
  totalSessions: 0,
  totalReviews: 0,
  averageAccuracy: 0,
  memoryLevelDistribution: {
    0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0
  },
  wordsAtEachLevel: {
    0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0
  },
  overdueWordsCount: 0,
  todayReviewsCount: 0,
  streakDays: 0
})


// Error summary data
const errorSummary = ref({
  totalDictations: 0,
  totalErrors: 0,
  problematicWordsCount: 0,
  recentAccuracyTrend: [] as number[],
  recommendedReviewCount: 0
})

// Dialog states
const showReviewDialog = ref(false)
const showResultsDialog = ref(false)
const currentReviewSessionId = ref<string | null>(null)
const completedReviewSessionId = ref<string | null>(null)

// Computed
const hasVocabularyForReview = computed(() => {
  // 检查是否有任何复习词汇（不仅仅是不期）
  return errorSummary.value.problematicWordsCount > 0 || reviewStatistics.value.totalReviews > 0
})

const difficultyOptions = [
  { label: '全部', value: 'all' },
  { label: '简单', value: 'easy' },
  { label: '困难', value: 'hard' }
]

const focusTypeOptions = [
  { label: '全部错误词汇', value: 'all' },
  { label: '严重错误词汇', value: 'hard' },
  { label: '轻微错误词汇', value: 'easy' }
]

// Methods
const loadReviewData = async () => {
  try {
    loading.value = true
    error.value = null

    const [statistics, reviewLibraryStats, recommendedSettings] = await Promise.all([
      reviewService.getReviewStatistics(),
      dictationErrorAnalyzer.getReviewLibraryStatistics(),
      reviewService.getRecommendedReviewSettings()
    ])

    reviewStatistics.value = statistics

    // Update the error summary with review library statistics
    errorSummary.value = {
      totalDictations: statistics.totalSessions,
      totalErrors: 0, // We don't track this in the independent system
      problematicWordsCount: reviewLibraryStats.totalVocabulary,
      recentAccuracyTrend: [], // Not applicable for independent system
      recommendedReviewCount: statistics.overdueWordsCount
    }

    reviewSettings.value = { ...recommendedSettings, focusType: 'all' }
  } catch (err) {
    console.error('Failed to load review data:', err)
    error.value = '加载复习数据失败，请重试'
  } finally {
    loading.value = false
  }
}

const startReviewSession = async () => {
  try {
    generatingSession.value = true

    const session = await reviewService.generateReviewSession(reviewSettings.value)
    currentReviewSessionId.value = session.id
    showReviewDialog.value = true
  } catch (err) {
    console.error('Failed to start review session:', err)
    error.value = '开始复习失败，请重试'
  } finally {
    generatingSession.value = false
  }
}

const onReviewComplete = (sessionId: string) => {
  completedReviewSessionId.value = sessionId
  showReviewDialog.value = false
  showResultsDialog.value = true
}

const onResultsSaved = () => {
  showResultsDialog.value = false
  // Refresh review data to show updated statistics
  void loadReviewData()
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

// Lifecycle
onMounted(() => {
  void loadReviewData()
})
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