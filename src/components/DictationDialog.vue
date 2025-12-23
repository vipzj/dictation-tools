<template>
  <q-dialog v-model="modelValue" persistent>
    <q-card style="min-width: 400px">
      <q-card-section>
        <div class="text-h6">{{ $t('dictationDialog.title') }}</div>
        <div v-if="unit" class="text-subtitle2 text-grey-6">
          {{ unit.name }} · {{ unit.vocabularyCount }} {{ $t('dictationDialog.vocabularyCount') }}
        </div>
      </q-card-section>

      <q-card-section class="q-pt-none">
        <div class="row q-gutter-md">
          <div class="col-12 col-sm-6">
            <q-input
              v-model.number="localSettings.playCount"
              type="number"
              :label="$t('dictationDialog.playCount')"
              outlined
              :min="1"
              :max="5"
              :suffix="$t('dictationDialog.playCountSuffix')"
            >
              <template v-slot:prepend>
                <q-icon name="repeat" />
              </template>
            </q-input>
          </div>
          <div class="col-12 col-sm-6">
            <q-input
              v-model.number="localSettings.interval"
              type="number"
              :label="$t('dictationDialog.wordInterval')"
              outlined
              :min="1"
              :max="10"
              :suffix="$t('dictationDialog.intervalSuffix')"
            >
              <template v-slot:prepend>
                <q-icon name="timer" />
              </template>
              <template v-slot:append>
                <q-icon name="info">
                  <q-tooltip>
                    {{ $t('dictationDialog.intervalTooltip') }}
                  </q-tooltip>
                </q-icon>
              </template>
            </q-input>
          </div>
          <div class="col-12 col-sm-6">
            <q-input
              v-model.number="localSettings.intraWordInterval"
              type="number"
              :label="$t('dictationDialog.intraWordInterval')"
              outlined
              :min="0.5"
              :max="5"
              step="0.1"
              :suffix="$t('dictationDialog.intervalSuffix')"
              :rules="[
                val => val >= 0.5 || $t('dictationDialog.validationRules.minInterval'),
                val => val <= 5 || $t('dictationDialog.validationRules.maxInterval')
              ]"
            >
              <template v-slot:prepend>
                <q-icon name="speed" />
              </template>
              <template v-slot:append>
                <q-icon name="info">
                  <q-tooltip>
                    {{ $t('dictationDialog.intraWordIntervalTooltip') }}
                  </q-tooltip>
                </q-icon>
              </template>
            </q-input>
          </div>
        </div>

        <div class="q-mt-md">
          <div class="text-caption text-grey-6">
            <div>{{ $t('dictationDialog.vocabularyStats', { chinese: unit?.chineseCount || 0, english: unit?.englishCount || 0 }) }}</div>
            <div>{{ $t('dictationDialog.audioInfo') }}</div>
          </div>
        </div>
      </q-card-section>

      <q-card-actions align="right">
        <q-btn flat :label="$t('dictationDialog.cancel')" @click="close" />
        <q-btn
          color="primary"
          :label="$t('dictationDialog.startDictation')"
          :loading="starting"
          @click="startDictation"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { settingsService } from '../services/settingsService'
import { dictationService, vocabularyService } from '../services/indexeddb'
import type { UnitWithVocabularyCount } from '../types/unit'
import type { DictationSettings, DictationSession, CreateDictationSessionRequest } from '../types/dictation'

const { t } = useI18n()

interface Props {
  modelValue: boolean
  unit: UnitWithVocabularyCount | null
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'start', sessionId: string): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const starting = ref(false)
const localSettings = ref<DictationSettings>({
  playCount: 2,
  interval: 3,
  intraWordInterval: 1.0
})

const modelValue = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

// Load default settings when dialog opens
watch(() => props.modelValue, (open) => {
  if (open) {
    const settings = settingsService.getSettings()
    localSettings.value = { ...settings.dictation }
  }
})

const close = () => {
  modelValue.value = false
}

const startDictation = async () => {
  if (!props.unit) return

  starting.value = true

  try {
    // Get all vocabulary items for the unit
    const vocabularyItems = await vocabularyService.getVocabularyItemsByUnit(props.unit.id)

    if (vocabularyItems.length === 0) {
      throw new Error(t('dictationDialog.noVocabularyError'))
    }

    // Create dictation session
    const createRequest: CreateDictationSessionRequest = {
      unitId: props.unit.id,
      unitName: props.unit.name,
      settings: { ...localSettings.value }
    }

    const session: DictationSession = {
      id: '', // Will be set by service
      ...createRequest,
      results: vocabularyItems.map(item => ({
        vocabularyItemId: item.id,
        vocabularyText: item.text,
        vocabularyType: item.type,
        isCorrect: true, // Default to correct
        audioSource: item.hasAudio ? 'recorded' : 'tts'
      })),
      accuracy: 0, // Will be calculated after completion
      startedAt: new Date(),
      completedAt: new Date(), // Will be updated after completion
      duration: 0 // Will be calculated after completion
    }

    void dictationService.createDictationSession(session).then(createdSession => {
      emit('start', createdSession.id)
    })
    close()
  } catch (error) {
    console.error('Failed to start dictation:', error)
    // Show error message
    // TODO: Add proper error handling with Quasar Notify
  } finally {
    starting.value = false
  }
}
</script>