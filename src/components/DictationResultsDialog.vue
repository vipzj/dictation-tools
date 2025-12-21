<template>
  <q-dialog v-model="modelValue" persistent>
    <q-card style="min-width: 600px; max-width: 800px">
      <q-card-section>
        <div class="text-h6">听写结果</div>
        <div v-if="session" class="text-subtitle2 text-grey-6">
          {{ session.unitName }} · {{ formatDate(session.completedAt) }}
        </div>
      </q-card-section>

      <q-separator />

      <!-- Results Summary -->
      <q-card-section v-if="session" class="q-pt-none">
        <div class="row q-gutter-md items-center q-mb-md">
          <div class="col">
            <div class="text-center">
              <div class="text-h3 text-primary">{{ Math.round(accuracy) }}%</div>
              <div class="text-caption text-grey-6">准确率</div>
            </div>
          </div>
          <div class="col">
            <div class="text-center">
              <div class="text-h3 text-positive">{{ correctCount }}</div>
              <div class="text-caption text-grey-6">正确</div>
            </div>
          </div>
          <div class="col">
            <div class="text-center">
              <div class="text-h3 text-negative">{{ incorrectCount }}</div>
              <div class="text-caption text-grey-6">错误</div>
            </div>
          </div>
          <div class="col">
            <div class="text-center">
              <div class="text-h3">{{ Math.floor(session.duration / 60) }}分</div>
              <div class="text-caption text-grey-6">用时</div>
            </div>
          </div>
        </div>
      </q-card-section>

      <q-separator />

      <!-- Vocabulary Results -->
      <q-card-section class="q-pt-none">
        <div class="text-subtitle2 q-mb-md">请检查每个词语的听写结果</div>
        <div style="max-height: 400px; overflow-y: auto">
          <div
            v-for="(result, index) in sessionResults"
            :key="result.vocabularyItemId"
            class="row items-center q-py-sm q-my-sm"
            :class="{ 'bg-negative-1': !result.isCorrect }"
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

      <q-card-actions align="right">
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
import { useQuasar } from 'quasar'
import { dictationService, dictationErrorAnalyzer } from '../services/index'
import type { DictationSession, DictationResult } from '../types/dictation'

interface Props {
  modelValue: boolean
  sessionId: string | null
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'saved'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const $q = useQuasar()

// State
const session = ref<DictationSession | null>(null)
const sessionResults = ref<DictationResult[]>([])
const saving = ref(false)

// Computed
const modelValue = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const correctCount = computed(() => {
  return sessionResults.value.filter(r => r.isCorrect).length
})

const incorrectCount = computed(() => {
  return sessionResults.value.filter(r => !r.isCorrect).length
})

const accuracy = computed(() => {
  if (sessionResults.value.length === 0) return 0
  return (correctCount.value / sessionResults.value.length) * 100
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
    const loadedSession = await dictationService.getDictationSessionById(sessionId)
    if (!loadedSession) {
      throw new Error('Session not found')
    }
    session.value = loadedSession

    // Create mutable results from session
    sessionResults.value = session.value.results.map(result => ({ ...result }))
  } catch (error) {
    console.error('Failed to load session:', error)
  }
}

const formatDate = (date: Date) => {
  return new Date(date).toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const close = () => {
  modelValue.value = false
}

const saveResults = async () => {
  if (!session.value) return

  saving.value = true

  try {
    // Calculate final accuracy
    const finalCorrectCount = sessionResults.value.filter(r => r.isCorrect).length
    const finalAccuracy = sessionResults.value.length > 0
      ? finalCorrectCount / sessionResults.value.length
      : 0

    // Create clean, serializable results array
    const cleanResults = sessionResults.value.map(result => ({
      vocabularyItemId: result.vocabularyItemId,
      vocabularyText: result.vocabularyText,
      vocabularyType: result.vocabularyType,
      isCorrect: result.isCorrect,
      audioSource: result.audioSource
    }))

    // Update session with clean results and final accuracy
    await dictationService.updateDictationSession(session.value.id, {
      results: cleanResults,
      accuracy: finalAccuracy
    })

    // Add error words to review library
    const errorResults = cleanResults.filter(result => !result.isCorrect)
    if (errorResults.length > 0) {
      try {
        await dictationErrorAnalyzer.addErrorsToReviewLibrary(errorResults)

        // Show success notification for review library addition
        $q.notify({
          type: 'positive',
          message: `已将 ${errorResults.length} 个错误词汇添加到复习库`,
          icon: 'add_task',
          timeout: 3000
        })
      } catch (reviewError) {
        console.error('Failed to add errors to review library:', reviewError)
        // Don't fail the whole save operation if review library addition fails
        $q.notify({
          type: 'warning',
          message: '听写结果已保存，但添加到复习库时出现问题',
          icon: 'warning',
          timeout: 3000
        })
      }
    }

    emit('saved')
    close()
  } catch (error) {
    console.error('Failed to save results:', error)

    // Try to provide more specific error information without causing circular reference errors
    let errorMessage = 'Unknown error'
    if (error instanceof Error) {
      errorMessage = error.message
    } else if (typeof error === 'string') {
      errorMessage = error
    }

    $q.notify({
      type: 'negative',
      message: '保存失败，请重试',
      icon: 'error',
      caption: errorMessage
    })
  } finally {
    saving.value = false
  }
}
</script>

<style scoped>
.bg-negative-1 {
  background-color: rgba(244, 67, 54, 0.1);
  border-radius: 4px;
}
</style>