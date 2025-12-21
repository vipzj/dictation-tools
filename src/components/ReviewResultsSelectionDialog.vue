<template>
  <q-dialog v-model="modelValueComputed" persistent>
    <q-card style="min-width: 600px">
      <!-- Header -->
      <q-card-section class="row items-center">
        <div class="text-h6">复习结果确认</div>
        <q-space />
        <q-btn
          flat
          round
          dense
          icon="close"
          @click="close"
        />
      </q-card-section>

      <!-- Summary -->
      <q-card-section class="q-pa-lg">
        <div class="text-center">
          <div class="text-h5 q-mb-md">
            复习完成！请确认每个词汇的正确性
          </div>
          <div class="row q-gutter-md justify-center items-center">
            <div class="col text-center">
              <div class="text-h3 text-primary">
                {{ currentCorrectCount }}/{{ totalCount }}
              </div>
              <div class="text-caption text-grey-6">已确认/总数</div>
            </div>
            <div class="col text-center">
              <div class="text-h3 text-info">
                {{ accuracy.toFixed(1) }}%
              </div>
              <div class="text-caption text-grey-6">当前正确率</div>
            </div>
          </div>
        </div>
      </q-card-section>

      <q-separator />

      <!-- Vocabulary List -->
      <q-card-section class="q-pa-lg">
        <div class="text-h6 q-mb-md">词汇结果</div>
        <div class="column q-gutter-sm">
          <div
            v-for="(result, index) in sessionResults"
            :key="result.vocabularyItemId"
            class="row items-center q-py-sm q-my-sm bg-white rounded-borders"
          >
            <div class="col-auto q-mr-md text-grey-6">
              {{ index + 1 }}.
            </div>
            <div class="col">
              <div class="row items-center">
                <div class="col">
                  <div class="text-body1">
                    {{ result.vocabularyText }}
                  </div>
                  <div class="text-caption text-grey-6">
                    {{ result.vocabularyType === 'chinese' ? '中文' : 'English' }}
                    · {{ result.audioSource === 'recorded' ? '录音' : '语音合成' }}
                  </div>
                </div>
                <div class="col-auto">
                  <q-toggle
                    v-model="result.isCorrect"
                    :color="result.isCorrect ? 'positive' : 'negative'"
                    :icon="result.isCorrect ? 'check' : 'close'"
                    :label="result.isCorrect ? '正确' : '错误'"
                    keep-color
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </q-card-section>

      <q-separator />

      <!-- Actions -->
      <q-card-actions align="right" class="q-pa-md">
        <q-btn flat label="取消" @click="close" />
        <q-btn
          color="primary"
          label="保存结果"
          :loading="saving"
          @click="saveResults"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { reviewSessionService } from '../services/index'
import type { ReviewSession } from '../types/review'
import type { ReviewResult } from '../types/review'
import type { ReviewVocabulary } from '../types/review'

interface Props {
  modelValue: boolean
  sessionId: string
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'saved'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const modelValueComputed = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

// State
const loading = ref(false)
const saving = ref(false)
const session = ref<ReviewSession | null>(null)
const sessionResults = ref<(ReviewResult & { isCorrect: boolean })[]>([])

// Computed
const totalCount = computed(() => sessionResults.value.length)

const currentCorrectCount = computed(() => {
  return sessionResults.value.filter(r => r.isCorrect).length
})

const accuracy = computed(() => {
  if (totalCount.value === 0) return 0
  return (currentCorrectCount.value / totalCount.value) * 100
})

// Watch for dialog open
watch(() => props.modelValue, async (newValue) => {
  if (newValue && props.sessionId) {
    await loadSession()
  }
})

// Methods
const loadSession = async () => {
  try {
    loading.value = true

    const loadedSession = await reviewSessionService.getReviewSessionById(props.sessionId)
    if (!loadedSession) {
      throw new Error('Review session not found')
    }

    session.value = loadedSession

    // Create results from vocabulary items (since audio playback doesn't track correct/incorrect)
    const results: (ReviewResult & { isCorrect: boolean })[] = []

    for (const item of loadedSession.vocabularyItems) {
      results.push({
        id: crypto.randomUUID(),
        vocabularyItemId: item.vocabularyItem.id,
        vocabularyText: item.vocabularyItem.text,
        vocabularyType: item.vocabularyItem.type,
        isCorrect: false, // Default to incorrect
        audioSource: (item.vocabularyItem as ReviewVocabulary).audioSource || 'tts',
        responseTime: 0, // Not applicable for audio-only review
        reviewSessionId: loadedSession.id
      })
    }

    sessionResults.value = results
  } catch (error) {
    console.error('Failed to load review session:', error)
    modelValueComputed.value = false
  } finally {
    loading.value = false
  }
}

const close = () => {
  modelValueComputed.value = false
}

const saveResults = async () => {
  if (!session.value) return

  saving.value = true

  try {
    // Convert back to ReviewResult format
    const results: ReviewResult[] = sessionResults.value.map(r => ({
      id: r.id,
      vocabularyItemId: r.vocabularyItemId,
      vocabularyText: r.vocabularyText,
      vocabularyType: r.vocabularyType,
      isCorrect: r.isCorrect,
      audioSource: r.audioSource,
      responseTime: 0, // Not applicable for audio-only review
      reviewSessionId: props.sessionId
    }))

    await reviewSessionService.completeReviewSession(props.sessionId, results)

    emit('saved')
    close()
  } catch (error) {
    console.error('Error saving review results:', error)
  } finally {
    saving.value = false
  }
}
</script>

<style scoped>
.rounded-borders {
  border: 1px solid #e0e0e0;
}
</style>