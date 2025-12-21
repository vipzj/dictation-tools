<template>
  <q-card flat bordered class="q-pa-md">
    <q-card-section>
      <div class="text-h6 q-mb-md">
        <q-icon name="psychology" class="q-mr-sm" />
        {{ $t('reviewSettings.title') }}
      </div>

      <div class="row q-gutter-md">
        <!-- Word Count Setting -->
        <div class="col-12 col-sm-6 col-md-4">
          <q-input
            v-model.number="settings.wordCount"
            type="number"
            :label="$t('reviewSettings.wordCount')"
            outlined
            min="1"
            max="50"
            :suffix="$t('reviewSettings.wordCountSuffix')"
            @update:model-value="updateSetting('wordCount', $event)"
          >
            <template v-slot:prepend>
              <q-icon name="format_list_numbered" />
            </template>
            <template v-slot:hint>
              {{ $t('reviewSettings.wordCountHint') }}
            </template>
          </q-input>
        </div>

        <!-- Difficulty Filter Setting -->
        <div class="col-12 col-sm-6 col-md-4">
          <q-select
            v-model="settings.difficultyFilter"
            :options="difficultyOptions"
            :label="$t('reviewSettings.difficultyFilter')"
            outlined
            emit-value
            map-options
            @update:model-value="updateSetting('difficultyFilter', $event)"
          >
            <template v-slot:prepend>
              <q-icon name="trending_up" />
            </template>
            <template v-slot:hint>
              {{ $t('reviewSettings.difficultyFilterHint') }}
            </template>
          </q-select>
        </div>

        <!-- Auto Play Setting -->
        <div class="col-12 col-sm-6 col-md-4">
          <div class="row items-center q-gutter-sm">
          <q-icon name="volume_up" />
          <q-toggle
            v-model="settings.autoPlayAudio"
            :label="$t('reviewSettings.autoPlayAudio')"
            color="primary"
            @update:model-value="updateSetting('autoPlayAudio', $event)"
          />
        </div>
        </div>

        <!-- Show Memory Level Setting -->
        <div class="col-12 col-sm-6 col-md-4">
          <div class="row items-center q-gutter-sm">
            <q-icon name="psychology" />
            <q-toggle
              v-model="settings.showMemoryLevel"
              :label="$t('reviewSettings.showMemoryLevel')"
              color="primary"
              @update:model-value="updateSetting('showMemoryLevel', $event)"
            />
          </div>
        </div>

        <!-- Show Progress Setting -->
        <div class="col-12 col-sm-6 col-md-4">
          <div class="row items-center q-gutter-sm">
          <q-icon name="trending_up" />
          <q-toggle
            v-model="settings.showProgress"
            :label="$t('reviewSettings.showProgress')"
            color="primary"
            @update:model-value="updateSetting('showProgress', $event)"
          />
        </div>
        </div>

        <!-- Adaptive Difficulty Setting -->
        <div class="col-12 col-sm-6 col-md-4">
          <div class="row items-center q-gutter-sm">
          <q-icon name="auto_fix_high" />
          <q-toggle
            v-model="settings.adaptiveDifficulty"
            :label="$t('reviewSettings.adaptiveDifficulty')"
            color="primary"
            @update:model-value="updateSetting('adaptiveDifficulty', $event)"
          />
        </div>
        </div>
      </div>

      <!-- Memory Algorithm Settings -->
      <q-separator class="q-my-md" />

      <div class="text-h6 q-mb-md">
        <q-icon name="memory" class="q-mr-sm" />
        {{ $t('reviewSettings.memoryAlgorithmTitle') }}
      </div>

      <div class="row q-gutter-md">
        <!-- Algorithm Type -->
        <div class="col-12 col-sm-6 col-md-4">
          <q-select
            v-model="settings.algorithmType"
            :options="algorithmOptions"
            :label="$t('reviewSettings.algorithmType')"
            outlined
            emit-value
            map-options
            @update:model-value="updateSetting('algorithmType', $event)"
          >
            <template v-slot:prepend>
              <q-icon name="memory" />
            </template>
            <template v-slot:hint>
              {{ $t('reviewSettings.algorithmTypeHint') }}
            </template>
          </q-select>
        </div>

        <!-- Review Interval Multiplier -->
        <div class="col-12 col-sm-6 col-md-4">
          <q-input
            v-model.number="settings.intervalMultiplier"
            type="number"
            :label="$t('reviewSettings.intervalMultiplier')"
            outlined
            min="0.5"
            max="3.0"
            step="0.1"
            @update:model-value="updateSetting('intervalMultiplier', $event)"
          >
            <template v-slot:prepend>
              <q-icon name="schedule" />
            </template>
            <template v-slot:hint>
              {{ $t('reviewSettings.intervalMultiplierHint') }}
            </template>
          </q-input>
        </div>

        <!-- Forgetting Factor -->
        <div class="col-12 col-sm-6 col-md-4">
          <q-input
            v-model.number="settings.forgettingFactor"
            type="number"
            :label="$t('reviewSettings.forgettingFactor')"
            outlined
            min="0.1"
            max="1.0"
            step="0.1"
            @update:model-value="updateSetting('forgettingFactor', $event)"
          >
            <template v-slot:prepend>
              <q-icon name="psychology_alt" />
            </template>
            <template v-slot:hint>
              {{ $t('reviewSettings.forgettingFactorHint') }}
            </template>
          </q-input>
        </div>
      </div>

      <!-- Reset Button -->
      <div class="row q-mt-md">
        <div class="col-12">
          <q-btn
            flat
            color="primary"
            icon="refresh"
            :label="$t('reviewSettings.resetToDefaults')"
            @click="resetToDefaults"
          />
        </div>
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useQuasar } from 'quasar'
import { useI18n } from 'vue-i18n'
import { settingsService } from '../services/index'
import type { AppSettings } from '../types/settings'
import { DEFAULT_REVIEW_SETTINGS } from '../types/review'

// Define component name for ESLint
defineOptions({
  name: 'ReviewSettings'
})

const $q = useQuasar()
const { t } = useI18n()

// Local state for settings
const settings = ref({
  wordCount: DEFAULT_REVIEW_SETTINGS.wordCount,
  difficultyFilter: DEFAULT_REVIEW_SETTINGS.difficultyFilter,
  autoPlayAudio: true,
  showMemoryLevel: true,
  showProgress: true,
  adaptiveDifficulty: false,
  algorithmType: 'ebbinghaus',
  intervalMultiplier: 1.0,
  forgettingFactor: 0.5
})

// Options
const difficultyOptions = computed(() => [
  { label: t('reviewSettings.difficultyOptions.all'), value: 'all' },
  { label: t('reviewSettings.difficultyOptions.easy'), value: 'easy' },
  { label: t('reviewSettings.difficultyOptions.hard'), value: 'hard' }
])

const algorithmOptions = computed(() => [
  { label: t('reviewSettings.algorithmOptions.ebbinghaus'), value: 'ebbinghaus' },
  { label: t('reviewSettings.algorithmOptions.sm2'), value: 'sm2' },
  { label: t('reviewSettings.algorithmOptions.anki'), value: 'anki' }
])

// Methods
const loadSettings = () => {
  try {
    const savedSettings = settingsService.getSettings()

    // Update local state with saved settings
    if (savedSettings.review?.wordCount !== undefined) {
      settings.value.wordCount = savedSettings.review.wordCount
    }
    if (savedSettings.review?.difficultyFilter !== undefined) {
      settings.value.difficultyFilter = savedSettings.review.difficultyFilter
    }
    if (savedSettings.review?.autoPlayAudio !== undefined) {
      settings.value.autoPlayAudio = savedSettings.review.autoPlayAudio
    }
    if (savedSettings.review?.showMemoryLevel !== undefined) {
      settings.value.showMemoryLevel = savedSettings.review.showMemoryLevel
    }
    if (savedSettings.review?.showProgress !== undefined) {
      settings.value.showProgress = savedSettings.review.showProgress
    }
    if (savedSettings.review?.adaptiveDifficulty !== undefined) {
      settings.value.adaptiveDifficulty = savedSettings.review.adaptiveDifficulty
    }
    if (savedSettings.review?.algorithmType !== undefined) {
      settings.value.algorithmType = savedSettings.review.algorithmType
    }
    if (savedSettings.review?.intervalMultiplier !== undefined) {
      settings.value.intervalMultiplier = savedSettings.review.intervalMultiplier
    }
    if (savedSettings.review?.forgettingFactor !== undefined) {
      settings.value.forgettingFactor = savedSettings.review.forgettingFactor
    }
  } catch (error) {
    console.error('Failed to load review settings:', error)
  }
}

const updateSetting = (key: string, value: unknown) => {
  try {
    const currentSettings = settingsService.getSettings()

    // Update the review settings
    const updatedSettings: AppSettings = {
      ...currentSettings,
      review: {
        ...currentSettings.review,
        [key]: value
      }
    }

    settingsService.saveSettingsToStorage(updatedSettings)

    $q.notify({
      type: 'positive',
      message: t('reviewSettings.settingsSaved'),
      icon: 'save'
    })
  } catch (error) {
    console.error('Failed to update setting:', error)

    $q.notify({
      type: 'negative',
      message: t('reviewSettings.saveSettingsFailed'),
      icon: 'error'
    })
  }
}

const resetToDefaults = () => {
  try {
    const currentSettings = settingsService.getSettings()

    // Reset review settings to defaults
    const defaultReviewSettings = {
      wordCount: DEFAULT_REVIEW_SETTINGS.wordCount,
      difficultyFilter: DEFAULT_REVIEW_SETTINGS.difficultyFilter,
      maxDailyReviews: DEFAULT_REVIEW_SETTINGS.maxDailyReviews,
      playCount: DEFAULT_REVIEW_SETTINGS.playCount,
      interval: DEFAULT_REVIEW_SETTINGS.interval,
      intraWordInterval: DEFAULT_REVIEW_SETTINGS.intraWordInterval,
      units: [],
      autoPlayAudio: true,
      showMemoryLevel: true,
      showProgress: true,
      adaptiveDifficulty: false,
      algorithmType: 'ebbinghaus',
      intervalMultiplier: 1.0,
      forgettingFactor: 0.5
    }

    const updatedSettings: AppSettings = {
      ...currentSettings,
      review: defaultReviewSettings
    }

    settingsService.saveSettingsToStorage(updatedSettings)

    // Update local state
    settings.value = { ...defaultReviewSettings }

    $q.notify({
      type: 'positive',
      message: t('reviewSettings.resetSuccess'),
      icon: 'refresh'
    })
  } catch (error) {
    console.error('Failed to reset settings:', error)

    $q.notify({
      type: 'negative',
      message: t('reviewSettings.resetFailed'),
      icon: 'error'
    })
  }
}

// Lifecycle
onMounted(() => {
  void loadSettings()
})
</script>

<style scoped>
.q-card {
  transition: all 0.3s ease;
}

.q-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}
</style>