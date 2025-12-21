<template>
  <q-dialog v-model="modelValue" persistent maximized>
    <q-card class="column">
      <!-- Header -->
      <q-card-section class="row items-center q-pb-none">
        <div class="text-h6">听写练习中</div>
        <q-space />
        <q-btn
          flat
          round
          dense
          icon="close"
          @click="confirmStop"
        />
      </q-card-section>

      <!-- Main Content -->
      <q-card-section class="col column items-center justify-center q-pa-lg">
        <div class="text-center" style="max-width: 600px">
          <!-- Progress Info -->
          <div class="text-h2 text-weight-bold q-mb-md">
            {{ current }} / {{ total }}
          </div>

          <div class="text-subtitle1 text-grey-6 q-mb-lg">
            已完成 / 总数
          </div>

          <!-- Progress Bar -->
          <q-linear-progress
            :value="progress"
            size="8px"
            color="primary"
            class="q-mb-lg"
          />

          <!-- Audio Status -->
          <div class="column items-center q-mb-lg">
            <div class="text-h6 q-mb-sm">
              {{ audioStatus }}
            </div>

            <!-- Audio Playing Indicator -->
            <div v-if="isPlayingAudio" class="column items-center">
              <q-spinner-dots size="40px" color="primary" class="q-mb-md" />
              <div class="text-caption text-grey-6">
                正在播放第 {{ currentPlayCount }} / {{ totalPlayCount }} 次
              </div>
            </div>

            <!-- Interval Indicator -->
            <div v-else-if="isInInterval" class="column items-center">
              <q-icon name="timer" size="40px" color="grey-6" class="q-mb-md" />
              <div class="text-caption text-grey-6">
                间隔时间: {{ remainingInterval }} 秒
              </div>
            </div>

            <!-- Waiting to Start -->
            <div v-else class="column items-center">
              <q-icon name="headphones" size="40px" color="grey-6" class="q-mb-md" />
              <div class="text-caption text-grey-6">
                准备开始听写...
              </div>
            </div>
          </div>

          <!-- Warning Text -->
          <div class="text-caption text-negative q-mt-lg">
            请专注听写，不要查看词语内容
          </div>
        </div>
      </q-card-section>

      <!-- Footer -->
      <q-card-section class="q-pt-none">
        <div class="row justify-center">
          <q-btn
            v-if="!isPlaying"
            color="primary"
            label="开始听写"
            size="lg"
            @click="startPractice"
          />
          <q-btn
            v-else
            color="negative"
            label="停止练习"
            @click="confirmStop"
          />
        </div>
      </q-card-section>
    </q-card>
  </q-dialog>

  <!-- Stop Confirmation Dialog -->
  <q-dialog v-model="showStopConfirmation" persistent>
    <q-card>
      <q-card-section class="row items-center">
        <q-avatar icon="warning" color="negative" text-color="white" />
        <span class="q-ml-sm">确认停止听写练习？</span>
      </q-card-section>

      <q-card-actions align="right">
        <q-btn flat label="取消" color="primary" @click="showStopConfirmation = false" />
        <q-btn
          flat
          label="停止"
          color="negative"
          @click="stopPractice"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch, onUnmounted } from 'vue'
import { dictationService, vocabularyService } from '../services/indexeddb'
import { dictationAudioService } from '../services/dictationAudioService'
import type { DictationSession } from '../types/dictation'
import type { VocabularyItem } from '../types/unit'

interface Props {
  modelValue: boolean
  sessionId: string | null
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'complete', sessionId: string): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// State
const session = ref<DictationSession | null>(null)
const vocabularyItems = ref<VocabularyItem[]>([])
const current = ref(0)
const isPlaying = ref(false)
const isPlayingAudio = ref(false)
const isInInterval = ref(false)
const audioStatus = ref('准备开始听写...')
const currentPlayCount = ref(0)
const totalPlayCount = ref(0)
const remainingInterval = ref(0)
const showStopConfirmation = ref(false)

let intervalTimer: NodeJS.Timeout | null = null

// Computed
const modelValue = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const total = computed(() => vocabularyItems.value.length)

const progress = computed(() => {
  if (total.value === 0) return 0
  return current.value / total.value
})

// Watch for session changes
watch(() => props.sessionId, async (sessionId) => {
  if (sessionId) {
    await loadSession(sessionId)
  }
})

// Watch for dialog close
watch(() => props.modelValue, (open) => {
  if (!open) {
    stopPractice()
  }
})

// Methods
const loadSession = async (sessionId: string) => {
  try {
    const loadedSession = await dictationService.getDictationSessionById(sessionId)
    if (!loadedSession) {
      throw new Error('Session not found')
    }
    session.value = loadedSession

    // Load vocabulary items
    vocabularyItems.value = await vocabularyService.getVocabularyItemsByUnit(session.value.unitId)

    // Reset state
    current.value = 0
    isPlaying.value = false
    audioStatus.value = '准备开始听写...'
    currentPlayCount.value = 0
    totalPlayCount.value = 0
    isInInterval.value = false
    remainingInterval.value = 0
  } catch (error) {
    console.error('Failed to load session:', error)
  }
}

const startPractice = () => {
  if (!session.value || vocabularyItems.value.length === 0) return

  isPlaying.value = true
  audioStatus.value = '正在播放音频...'

  // Start dictation audio playback
  void dictationAudioService.playDictationSession(
    vocabularyItems.value,
    session.value.settings,
    (currentItem, totalItems) => {
      current.value = currentItem
      audioStatus.value = currentItem < totalItems ? '正在播放音频...' : '听写完成！'
    },
    () => {
      void onPracticeComplete()
    }
  )

  // Monitor audio status (simplified for now)
  // In a real implementation, you might want more detailed monitoring
  monitorAudioStatus()
}

const monitorAudioStatus = () => {
  // Update audio status and play counts
  isPlayingAudio.value = dictationAudioService.getIsPlaying()
  currentPlayCount.value = dictationAudioService.getCurrentPlayCount()
  totalPlayCount.value = dictationAudioService.getCurrentTotalPlayCount()
  isInInterval.value = dictationAudioService.getIsInInterval()
  remainingInterval.value = dictationAudioService.getRemainingInterval()

  if (isPlaying.value) {
    intervalTimer = setTimeout(() => {
      monitorAudioStatus()
    }, 100) // Update more frequently for smoother UI
  }
}

const onPracticeComplete = async () => {
  if (!session.value) return

  try {
    // Update session with completion data
    const completedAt = new Date()
    const duration = Math.floor((completedAt.getTime() - session.value.startedAt.getTime()) / 1000)

    await dictationService.updateDictationSession(session.value.id, {
      completedAt,
      duration
    })

    isPlaying.value = false
    audioStatus.value = '听写完成！'

    // Emit completion event
    emit('complete', session.value.id)
  } catch (error) {
    console.error('Failed to complete practice:', error)
  }
}

const stopPractice = () => {
  isPlaying.value = false
  isPlayingAudio.value = false
  isInInterval.value = false
  audioStatus.value = '听写已停止'

  // Stop audio service
  dictationAudioService.stop()

  // Clear timers
  if (intervalTimer) {
    clearTimeout(intervalTimer)
    intervalTimer = null
  }

  showStopConfirmation.value = false
  modelValue.value = false
}

const confirmStop = () => {
  if (isPlaying.value) {
    showStopConfirmation.value = true
  } else {
    modelValue.value = false
  }
}

// Cleanup
onUnmounted(() => {
  if (intervalTimer) {
    clearTimeout(intervalTimer)
  }
  dictationAudioService.stop()
})
</script>