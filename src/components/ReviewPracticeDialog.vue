<template>
  <q-dialog v-model="modelValueComputed" persistent maximized>
    <q-card class="column">
      <!-- Header -->
      <q-card-section class="row items-center q-pb-none">
        <div class="text-h6">{{ $t('reviewPracticeDialog.title') }}</div>
        <q-space />
        <q-btn
          flat
          round
          dense
          icon="close"
          @click="confirmStop"
        />
      </q-card-section>

      <!-- Progress Info -->
      <q-card-section class="q-pb-none">
        <div class="row items-center q-gutter-md">
          <div class="col text-center">
            <div class="text-h2 text-weight-bold">
              {{ current + 1 }} / {{ total }}
            </div>
            <div class="text-caption text-grey-6">
              {{ $t('reviewPracticeDialog.currentProgress') }}
            </div>
          </div>
          <div class="col">
            <q-linear-progress
              :value="progress"
              size="8px"
              color="primary"
              rounded
            />
          </div>
        </div>
      </q-card-section>

      <!-- Main Content -->
      <q-card-section class="col column items-center justify-center q-pa-lg">
        <div class="text-center" style="max-width: 600px">
          <!-- Memory Level Info -->
          <div v-if="currentReviewItem && currentReviewItem.memoryState" class="q-mb-lg">
            <div class="text-h6 q-mb-sm">
              {{ $t('reviewPracticeDialog.memoryLevel') }}: {{ getMemoryLevelDescription(currentReviewItem.memoryState.memoryLevel as MemoryLevel) }}
            </div>
            <div class="row q-gutter-md justify-center items-center">
              <div class="memory-level-indicator" :style="{ backgroundColor: getMemoryLevelColor(currentReviewItem.memoryState.memoryLevel as MemoryLevel) }">
                {{ currentReviewItem.memoryState.memoryLevel }}
              </div>
              <div class="text-caption text-grey-6">
                {{ $t('reviewPracticeDialog.errorCount') }}: {{ currentReviewItem.memoryState.errorCount }}
              </div>
              <div class="text-caption text-grey-6">
                {{ $t('reviewPracticeDialog.successStreak') }}: {{ currentReviewItem.memoryState.successStreak }}
              </div>
            </div>
          </div>

          <!-- Audio Status -->
          <div class="column items-center q-mb-xl">
            <div class="text-h4 q-mb-md">
              {{ audioStatus }}
            </div>

            <!-- Audio Playing Indicator -->
            <div v-if="isPlayingAudio" class="column items-center">
              <q-spinner-dots size="60px" color="primary" class="q-mb-md" />
              <div class="text-body1 text-grey-6">
                {{ $t('reviewPracticeDialog.playingProgress', { current: currentPlayCount, total: totalPlayCount }) }}
              </div>
              <div v-if="isInInterval" class="text-caption text-grey-5 q-mt-sm">
                {{ $t('reviewPracticeDialog.intervalTime', { seconds: remainingInterval }) }}
              </div>
            </div>

            <!-- Interval Countdown -->
            <div v-else-if="isInInterval" class="column items-center">
              <q-circular-progress
                show-value
                font-size="20px"
                :value="((sessionSettings.interval - remainingInterval) / sessionSettings.interval) * 100"
                size="80px"
                color="primary"
                class="q-mb-md"
              >
                {{ remainingInterval }}
              </q-circular-progress>
              <div class="text-body1 text-grey-6">
                {{ $t('reviewPracticeDialog.preparingNext') }}
              </div>
            </div>

            <!-- Ready Indicator -->
            <div v-else class="text-center">
              <div class="text-h2 text-primary q-mb-md">
                {{ current + 1 }}
              </div>
              <div class="text-body1 text-grey-6">
                {{ $t('reviewPracticeDialog.preparingToPlay') }}
              </div>
            </div>
          </div>
        </div>
      </q-card-section>

      <!-- Footer -->
      <q-card-section class="q-pt-none">
        <div class="row justify-center">
          <q-btn
            v-if="!isPlaying"
            color="primary"
            :label="$t('reviewPracticeDialog.startReview')"
            size="lg"
            @click="startReview"
          />
          <q-btn
            v-else
            color="negative"
            :label="$t('reviewPracticeDialog.stopReview')"
            size="lg"
            @click="confirmStop"
          />
        </div>
      </q-card-section>
    </q-card>

    <!-- Stop Confirmation Dialog -->
    <q-dialog v-model="showStopConfirmation" persistent>
      <q-card>
        <q-card-section class="row items-center">
          <q-avatar icon="warning" color="negative" text-color="white" />
          <span class="q-ml-sm">{{ $t('reviewPracticeDialog.stopConfirmation') }}</span>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat :label="$t('common.cancel')" color="primary" @click="showStopConfirmation = false" />
          <q-btn
            flat
            :label="$t('reviewPracticeDialog.stopReview')"
            color="negative"
            @click="stopReview"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { reviewSessionService } from '../services/index'
import { dictationAudioService } from '../services/index'
import type { ReviewSession } from '../types/review'
import type { ReviewResult } from '../types/review'
import type { MemoryLevel } from '../types/review'
import type { VocabularyItem } from '../types/unit'
import type { ReviewVocabulary } from '../types/review'

interface Props {
  modelValue: boolean
  sessionId: string | null
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'complete', sessionId: string): void
}

const { t } = useI18n()
const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// State
const session = ref<ReviewSession | null>(null)
const current = ref(0)
const isPlaying = ref(false)
const isPlayingAudio = ref(false)
const isInInterval = ref(false)
const audioStatus = ref(t('reviewPracticeDialog.preparingToStart'))
const currentPlayCount = ref(0)
const totalPlayCount = ref(0)
const remainingInterval = ref(0)
const showStopConfirmation = ref(false)

let intervalTimer: NodeJS.Timeout | null = null

// Computed
const modelValueComputed = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const total = computed(() => session.value?.vocabularyItems.length || 0)

const progress = computed(() => {
  if (total.value === 0) return 0
  return current.value / total.value
})

const sessionSettings = computed(() => session.value?.settings || {
  playCount: 2,
  interval: 3,
  intraWordInterval: 1.0
})

const currentReviewItem = computed(() => {
  if (!session.value || current.value >= session.value.vocabularyItems.length) {
    return null
  }
  return session.value.vocabularyItems[current.value]
})

// Watch for session changes
watch(() => props.sessionId, async (sessionId) => {
  if (sessionId) {
    await loadSession(sessionId)
  }
})

// Methods
const loadSession = async (sessionId: string) => {
  try {
    const loadedSession = await reviewSessionService.getReviewSessionById(sessionId)
    if (!loadedSession) {
      throw new Error('Review session not found')
    }

    session.value = loadedSession
    current.value = 0
    isPlaying.value = false
    audioStatus.value = t('reviewPracticeDialog.preparingToStart')
    currentPlayCount.value = 0
    totalPlayCount.value = 0
    remainingInterval.value = 0
    isInInterval.value = false
  } catch (error) {
    console.error('Failed to load review session:', error)
    modelValueComputed.value = false
  }
}

const startReview = () => {
  if (!session.value) return

  isPlaying.value = true
  current.value = 0
  audioStatus.value = t('reviewPracticeDialog.playingReview')

  // Start playing audio for all vocabulary items
  // Convert ReviewVocabulary to VocabularyItem format for audio service
  const vocabularyItems: VocabularyItem[] = session.value.vocabularyItems.map(item => {
    const vocab = item.vocabularyItem as ReviewVocabulary
    return {
      id: vocab.id,
      unitId: vocab.sourceUnitId || 'review',
      type: vocab.type,
      text: vocab.text,
      hasAudio: vocab.hasAudio,
      audioSize: vocab.audioSize || 0,
      createdAt: vocab.createdAt,
      updatedAt: vocab.updatedAt
    }
  })

  void dictationAudioService.playDictationSession(
    vocabularyItems,
    sessionSettings.value,
    (currentIndex: number) => {
      current.value = currentIndex
    },
    () => {
      void completeReview()
    }
  )
}

const confirmStop = () => {
  showStopConfirmation.value = true
}

const stopReview = async () => {
  if (intervalTimer) {
    clearInterval(intervalTimer)
    intervalTimer = null
  }

  dictationAudioService.stop()

  isPlaying.value = false
  showStopConfirmation.value = false

  // Save partial results if needed
  if (session.value) {
    // Create empty results since user didn't complete
    const results: ReviewResult[] = []
    for (let i = 0; i < Math.min(current.value, total.value); i++) {
      const item = session.value.vocabularyItems[i]
      if (item) {
        const vocab = item.vocabularyItem as ReviewVocabulary
        results.push({
          id: crypto.randomUUID(),
          vocabularyItemId: vocab.id,
          vocabularyText: vocab.text,
          vocabularyType: vocab.type,
          isCorrect: false, // Default to false since user didn't complete
          audioSource: vocab.audioSource || 'tts',
          responseTime: 0,
          reviewSessionId: session.value.id
        })
      }
    }

    await reviewSessionService.completeReviewSession(session.value.id, results)
  }

  emit('complete', session.value?.id || '')
  modelValueComputed.value = false
}

const completeReview = () => {
  if (!session.value) return

  isPlaying.value = false
  audioStatus.value = t('reviewPracticeDialog.completingReview')

  emit('complete', session.value.id)
  modelValueComputed.value = false
}

// Helper methods
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
  const descriptions = [
    t('reviewPracticeDialog.memoryLevels.0'),
    t('reviewPracticeDialog.memoryLevels.1'),
    t('reviewPracticeDialog.memoryLevels.2'),
    t('reviewPracticeDialog.memoryLevels.3'),
    t('reviewPracticeDialog.memoryLevels.4'),
    t('reviewPracticeDialog.memoryLevels.5'),
    t('reviewPracticeDialog.memoryLevels.6'),
    t('reviewPracticeDialog.memoryLevels.7')
  ]
  return (descriptions[level] ?? descriptions[0])!
}

// Lifecycle
onUnmounted(() => {
  if (intervalTimer) {
    clearInterval(intervalTimer)
  }
  dictationAudioService.stop()
})

// Watch for dictationAudioService state changes
watch(() => dictationAudioService.getIsPlaying(), (playing) => {
  isPlayingAudio.value = playing
})

watch(() => dictationAudioService.getCurrentPlayCount(), (count) => {
  currentPlayCount.value = count
})

watch(() => dictationAudioService.getCurrentTotalPlayCount(), (count) => {
  totalPlayCount.value = count
})

watch(() => dictationAudioService.getIsInInterval(), (inInterval) => {
  isInInterval.value = inInterval
})

watch(() => dictationAudioService.getRemainingInterval(), (interval) => {
  remainingInterval.value = interval
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