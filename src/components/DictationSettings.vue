<template>
  <q-card flat bordered class="q-pa-md">
    <q-card-section>
      <div class="text-h6 q-mb-md">
        <q-icon name="headphones" class="q-mr-sm" />
        {{ $t('dictationSettings.title') }}
      </div>

      <div class="row q-gutter-md">
        <!-- Default Play Count -->
        <div class="col-12 col-sm-6">
          <q-input
            v-model.number="localSettings.playCount"
            type="number"
            :label="$t('dictationSettings.defaultPlayCount')"
            outlined
            :min="1"
            :max="5"
            :suffix="$t('dictationSettings.playCountSuffix')"
            @update:model-value="updateSettings"
          >
            <template v-slot:prepend>
              <q-icon name="repeat" />
            </template>
          </q-input>
        </div>

        <!-- Default Inter-word Interval -->
        <div class="col-12 col-sm-6">
          <q-input
            v-model.number="localSettings.interval"
            type="number"
            :label="$t('dictationSettings.defaultInterval')"
            outlined
            :min="1"
            :max="10"
            :suffix="$t('dictationSettings.intervalSuffix')"
            @update:model-value="updateSettings"
          >
            <template v-slot:prepend>
              <q-icon name="timer" />
            </template>
            <template v-slot:append>
              <q-icon name="info">
                <q-tooltip>
                  {{ $t('dictationSettings.intervalTooltip') }}
                </q-tooltip>
              </q-icon>
            </template>
          </q-input>
        </div>

        <!-- Default Intra-word Interval -->
        <div class="col-12 col-sm-6">
          <q-input
            v-model.number="localSettings.intraWordInterval"
            type="number"
            :label="$t('dictationSettings.defaultIntraWordInterval')"
            outlined
            :min="0.5"
            :max="5"
            step="0.1"
            :suffix="$t('dictationSettings.intervalSuffix')"
            :rules="[
              val => val >= 0.5 || $t('dictationSettings.validationRules.minInterval'),
              val => val <= 5 || $t('dictationSettings.validationRules.maxInterval')
            ]"
            @update:model-value="updateSettings"
          >
            <template v-slot:prepend>
              <q-icon name="speed" />
            </template>
            <template v-slot:append>
              <q-icon name="info">
                <q-tooltip>
                  {{ $t('dictationSettings.intraWordIntervalTooltip') }}
                </q-tooltip>
              </q-icon>
            </template>
          </q-input>
        </div>
      </div>

      <div class="q-mt-md">
        <q-btn
          flat
          color="primary"
          :label="$t('dictationSettings.resetToDefaults')"
          @click="resetToDefaults"
        />
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { useI18n } from 'vue-i18n'
import { settingsService } from '../services/settingsService'
import type { DictationSettings } from '../types/dictation'

const $q = useQuasar()
const { t } = useI18n()

const localSettings = ref<DictationSettings>({
  playCount: 2,
  interval: 3,
  intraWordInterval: 1.0
})

const loadSettings = () => {
  try {
    const settings = settingsService.getSettings()
    localSettings.value = { ...settings.dictation }
  } catch (error) {
    console.error('Failed to load settings:', error)
  }
}

const updateSettings = () => {
  try {
    settingsService.updateSettings({
      dictation: { ...localSettings.value }
    })

    $q.notify({
      type: 'positive',
      message: t('dictationSettings.settingsSaved'),
      icon: 'check'
    })
  } catch (error) {
    console.error('Failed to save settings:', error)
    $q.notify({
      type: 'negative',
      message: t('dictationSettings.saveSettingsFailed'),
      icon: 'error'
    })
  }
}

const resetToDefaults = () => {
  try {
    settingsService.resetToDefaults()
    void loadSettings()

    $q.notify({
      type: 'positive',
      message: t('dictationSettings.resetSuccess'),
      icon: 'check'
    })
  } catch (error) {
    console.error('Failed to reset settings:', error)
    $q.notify({
      type: 'negative',
      message: t('dictationSettings.resetFailed'),
      icon: 'error'
    })
  }
}

onMounted(() => {
  void loadSettings()
})
</script>