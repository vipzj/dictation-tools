<template>
  <q-page padding>
    <div class="row q-gutter-md">
      <div class="col-12">
        <div class="text-h4 q-mb-md">{{ $t('reviewPage.title') }}</div>
        <div class="text-subtitle1 q-mb-lg" v-html="$t('reviewPage.description')"></div>
      </div>

      <!-- Review Settings Card -->
      <div class="col-12">
        <q-card flat bordered>
          <q-card-section>
            <div class="text-h6 q-mb-md">{{ $t('reviewPage.reviewSettings') }}</div>
            <div class="row q-gutter-md">
              <div class="col-12 col-sm-6 col-md-3">
                <q-input
                  v-model.number="reviewSettings.wordCount"
                  type="number"
                  :label="$t('reviewPage.wordCount')"
                  outlined
                  min="1"
                  max="50"
                  :suffix="$t('reviewPage.units.times')"
                />
              </div>
              <div class="col-12 col-sm-6 col-md-3">
                <q-select
                  v-model="reviewSettings.difficultyFilter"
                  :options="difficultyOptions"
                  :label="$t('reviewPage.difficultyFilter')"
                  outlined
                  emit-value
                  map-options
                />
              </div>
                          <div class="col-12 col-sm-6 col-md-3">
                <q-select
                  v-model="reviewSettings.focusType"
                  :options="focusTypeOptions"
                  :label="$t('reviewPage.focusType')"
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
                <div class="text-subtitle2 q-mb-sm">{{ $t('reviewPage.audioSettings') }}</div>
                <div class="row q-gutter-sm">
                  <div class="col-12 col-md-4">
                    <q-input
                      v-model.number="reviewSettings.playCount"
                      type="number"
                      :label="$t('reviewPage.playCount')"
                      outlined
                      min="1"
                      max="5"
                      :suffix="$t('reviewPage.units.times')"
                    />
                  </div>
                  <div class="col-12 col-md-4">
                    <q-input
                      v-model.number="reviewSettings.interval"
                      type="number"
                      :label="$t('reviewPage.interval')"
                      outlined
                      min="1"
                      max="10"
                      :suffix="$t('reviewPage.units.seconds')"
                    />
                  </div>
                  <div class="col-12 col-md-4">
                    <q-input
                      v-model.number="reviewSettings.intraWordInterval"
                      type="number"
                      :label="$t('reviewPage.intraWordInterval')"
                      outlined
                      min="0.5"
                      max="5"
                      step="0.5"
                      :suffix="$t('reviewPage.units.seconds')"
                    />
                  </div>
                </div>
              </div>
              <div class="col-12 col-sm-6 col-md-3">
                <q-btn
                  color="primary"
                  :label="$t('reviewPage.startReview')"
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
            <div class="text-h6 q-mb-md">{{ $t('reviewPage.statistics') }}</div>
            <div class="row q-gutter-md">
              <div class="col-12 col-sm-6 col-md-3">
                <div class="text-center">
                  <div class="text-h4 text-primary">{{ reviewStatistics.totalReviews }}</div>
                  <div class="text-caption text-grey-6">{{ $t('reviewPage.totalReviews') }}</div>
                </div>
              </div>
              <div class="col-12 col-sm-6 col-md-3">
                <div class="text-center">
                  <div class="text-h4 text-warning">{{ errorSummary.problematicWordsCount }}</div>
                  <div class="text-caption text-grey-6">{{ $t('reviewPage.reviewLibraryCount') }}</div>
                </div>
              </div>
              <div class="col-12 col-sm-6 col-md-3">
                <div class="text-center">
                  <div class="text-h4 text-negative">{{ reviewStatistics.overdueWordsCount }}</div>
                  <div class="text-caption text-grey-6">{{ $t('reviewPage.overdueWords') }}</div>
                </div>
              </div>
              <div class="col-12 col-sm-6 col-md-3">
                <div class="text-center">
                  <div class="text-h4 text-positive">{{ Math.round(reviewStatistics.averageAccuracy * 100) }}%</div>
                  <div class="text-caption text-grey-6">{{ $t('reviewPage.reviewAccuracy') }}</div>
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
            <div class="text-h6 q-mb-md">{{ $t('reviewPage.memoryDistribution') }}</div>
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
                    <div class="text-caption text-grey-6">{{ count }} {{ $t('reviewPage.wordsCount') }}</div>
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
        <div class="q-mt-sm">{{ $t('common.loading') }}</div>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="col-12">
        <q-banner class="bg-negative text-white">
          <template v-slot:avatar>
            <q-icon name="error" />
          </template>
          {{ error }}
          <template v-slot:action>
            <q-btn flat :label="$t('common.retry')" @click="loadReviewData" />
          </template>
        </q-banner>
      </div>

      <!-- No Vocabulary State -->
      <div v-else-if="!hasVocabularyForReview" class="col-12 text-center">
        <div class="text-h6 text-grey-7 q-mb-md">
          {{ $t('reviewPage.noVocabularyForReview') }}
        </div>
        <div class="text-body1 text-grey-6 q-mb-lg" v-html="$t('reviewPage.addVocabularyFirst')">
        </div>
        <q-btn
          color="primary"
          :label="$t('reviewPage.startDictation')"
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
import { useI18n } from 'vue-i18n'
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

// I18n
const { t } = useI18n()

// Computed
const hasVocabularyForReview = computed(() => {
  // 检查是否有任何复习词汇（不仅仅是不期）
  return errorSummary.value.problematicWordsCount > 0 || reviewStatistics.value.totalReviews > 0
})

const difficultyOptions = computed(() => [
  { label: t('reviewOptions.difficulty.all'), value: 'all' },
  { label: t('reviewOptions.difficulty.easy'), value: 'easy' },
  { label: t('reviewOptions.difficulty.hard'), value: 'hard' }
])

const focusTypeOptions = computed(() => [
  { label: t('reviewOptions.focusType.all'), value: 'all' },
  { label: t('reviewOptions.focusType.hard'), value: 'hard' },
  { label: t('reviewOptions.focusType.easy'), value: 'easy' }
])

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
    error.value = t('reviewPage.loadError')
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
    error.value = t('reviewPage.startReviewError')
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