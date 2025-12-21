<template>
  <q-btn
    color="secondary"
    icon="auto_awesome"
    label="Quick Initialize"
    class="full-width"
    style="height: 56px"
    :loading="loading"
    @click="showConfirmDialog = true"
  />

  <!-- Confirmation Dialog -->
  <q-dialog v-model="showConfirmDialog" persistent>
    <q-card style="min-width: 500px">
      <q-card-section>
        <div class="text-h6 q-mb-sm">
          <q-icon name="auto_awesome" class="q-mr-sm" />
          Quick Initialize Sample Data
        </div>
        <div class="text-body2 text-grey-7">
          This will add sample tags, units, and vocabulary items to help you get started with dictation practice.
        </div>
      </q-card-section>

      <q-separator />

      <q-card-section class="q-pt-none">
        <!-- Data Preview -->
        <div class="text-subtitle2 q-mb-md">Data that will be created:</div>

        <div class="row q-gutter-md">
          <div class="col">
            <q-card flat bordered class="bg-primary-1">
              <q-card-section class="text-center">
                <div class="text-h4 text-primary">{{ dataPreview.tagsCount }}</div>
                <div class="text-caption">Tags</div>
              </q-card-section>
            </q-card>
          </div>
          <div class="col">
            <q-card flat bordered class="bg-secondary-1">
              <q-card-section class="text-center">
                <div class="text-h4 text-secondary">{{ dataPreview.unitsCount }}</div>
                <div class="text-caption">Units</div>
              </q-card-section>
            </q-card>
          </div>
          <div class="col">
            <q-card flat bordered class="bg-accent-1">
              <q-card-section class="text-center">
                <div class="text-h4 text-accent">{{ dataPreview.vocabularyCount }}</div>
                <div class="text-caption">Vocabulary</div>
              </q-card-section>
            </q-card>
          </div>
        </div>

        <!-- Sample Content Preview -->
        <div class="q-mt-md">
          <div class="text-subtitle2 q-mb-sm">Sample content:</div>

          <div class="row q-gutter-md">
            <div class="col-12 col-md-6">
              <div class="text-caption text-grey-6 q-mb-xs">Tags:</div>
              <q-chip
                v-for="tagName in dataPreview.sampleTags.slice(0, 3)"
                :key="tagName"
                size="sm"
                color="primary"
                text-color="white"
              >
                {{ tagName }}
              </q-chip>
              <q-chip
                v-if="dataPreview.sampleTags.length > 3"
                size="sm"
                color="grey-5"
                text-color="white"
              >
                +{{ dataPreview.sampleTags.length - 3 }} more
              </q-chip>
            </div>

            <div class="col-12 col-md-6">
              <div class="text-caption text-grey-6 q-mb-xs">Units:</div>
              <q-chip
                v-for="unitName in dataPreview.sampleUnits.slice(0, 3)"
                :key="unitName"
                size="sm"
                color="secondary"
                text-color="white"
              >
                {{ unitName }}
              </q-chip>
              <q-chip
                v-if="dataPreview.sampleUnits.length > 3"
                size="sm"
                color="grey-5"
                text-color="white"
              >
                +{{ dataPreview.sampleUnits.length - 3 }} more
              </q-chip>
            </div>
          </div>
        </div>

        <!-- Warning if data already exists -->
        <q-banner
          v-if="hasExistingData"
          class="bg-warning-1 text-warning-10 q-mt-md"
          dense
        >
          <template v-slot:avatar>
            <q-icon name="warning" />
          </template>
          Sample data will be added to your existing data. Duplicates will be skipped.
        </q-banner>
      </q-card-section>

      <q-separator />

      <q-card-actions align="right">
        <q-btn flat label="Cancel" @click="closeDialog" />
        <q-btn
          color="primary"
          label="Initialize Sample Data"
          :loading="loading"
          @click="initializeData"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { dataInitializer } from '../services/dataInitializer'
import type { InitializationStats } from '../types/initializer'

interface Emits {
  (e: 'initialize', stats: InitializationStats): void
}

const emit = defineEmits<Emits>()

const $q = useQuasar()

// State
const loading = ref(false)
const showConfirmDialog = ref(false)
const hasExistingData = ref(false)
const dataPreview = ref(dataInitializer.getDataPreview())

// Methods
const checkExistingData = async () => {
  try {
    hasExistingData.value = await dataInitializer.hasExistingData()
  } catch (error) {
    console.error('Failed to check existing data:', error)
    hasExistingData.value = false
  }
}

const initializeData = async () => {
  loading.value = true

  try {
    // Show progress notification
    const progressNotification = $q.notify({
      type: 'ongoing',
      message: 'Initializing sample data...',
      caption: 'Creating tags, units, and vocabulary items...',
      position: 'top',
      timeout: 0 // Don't auto-dismiss
    })

    // Initialize the data
    const stats = await dataInitializer.initializeAllSampleData()

    // Update progress notification
    progressNotification({
      type: 'positive',
      message: 'Sample data initialized successfully!',
      caption: `${stats.tagsCount} tags, ${stats.unitsCount} units, ${stats.vocabularyCount} vocabulary items created.`,
      timeout: 3000
    })

    // Emit event to parent
    emit('initialize', stats)

    // Close dialog
    closeDialog()
  } catch (error) {
    console.error('Failed to initialize data:', error)

    $q.notify({
      type: 'negative',
      message: 'Failed to initialize sample data',
      caption: error instanceof Error ? error.message : 'Unknown error',
      icon: 'error',
      position: 'top',
      timeout: 5000
    })
  } finally {
    loading.value = false
  }
}

const closeDialog = () => {
  showConfirmDialog.value = false
}

// Lifecycle
onMounted(() => {
  void checkExistingData()
})
</script>

<style scoped>
.bg-primary-1 {
  background-color: rgba(33, 150, 243, 0.1);
}

.bg-secondary-1 {
  background-color: rgba(156, 39, 176, 0.1);
}

.bg-accent-1 {
  background-color: rgba(255, 152, 0, 0.1);
}

.bg-warning-1 {
  background-color: rgba(255, 193, 7, 0.1);
}

.text-warning-10 {
  color: #f57c00;
}
</style>