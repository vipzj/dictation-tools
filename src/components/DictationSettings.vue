<template>
  <q-card flat bordered class="q-pa-md">
    <q-card-section>
      <div class="text-h6 q-mb-md">
        <q-icon name="headphones" class="q-mr-sm" />
        听写设置
      </div>

      <div class="row q-gutter-md">
        <!-- Default Play Count -->
        <div class="col-12 col-sm-6">
          <q-input
            v-model.number="localSettings.playCount"
            type="number"
            label="默认播放次数"
            outlined
            :min="1"
            :max="5"
            suffix="次"
            @update:model-value="updateSettings"
          >
            <template v-slot:prepend>
              <q-icon name="repeat" />
            </template>
          </q-input>
        </div>

        <!-- Default Interval -->
        <div class="col-12 col-sm-6">
          <q-input
            v-model.number="localSettings.interval"
            type="number"
            label="默认间隔时间"
            outlined
            :min="1"
            :max="10"
            suffix="秒"
            @update:model-value="updateSettings"
          >
            <template v-slot:prepend>
              <q-icon name="timer" />
            </template>
          </q-input>
        </div>
      </div>

      <div class="q-mt-md">
        <q-btn
          flat
          color="primary"
          label="恢复默认设置"
          @click="resetToDefaults"
        />
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { settingsService } from '../services/settingsService'
import type { DictationSettings } from '../types/dictation'

const $q = useQuasar()

const localSettings = ref<DictationSettings>({
  playCount: 2,
  interval: 3
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
      message: '设置已保存',
      icon: 'check'
    })
  } catch (error) {
    console.error('Failed to save settings:', error)
    $q.notify({
      type: 'negative',
      message: '保存设置失败',
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
      message: '已恢复默认设置',
      icon: 'check'
    })
  } catch (error) {
    console.error('Failed to reset settings:', error)
    $q.notify({
      type: 'negative',
      message: '重置设置失败',
      icon: 'error'
    })
  }
}

onMounted(() => {
  void loadSettings()
})
</script>