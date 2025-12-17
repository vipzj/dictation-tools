<template>
  <q-btn
    color="secondary"
    icon="cloud_upload"
    label="Import Data"
    @click="triggerFileInput"
    :loading="loading"
    class="full-width"
  >
    <q-tooltip>
      Import data from a JSON backup file
    </q-tooltip>
  </q-btn>

  <!-- Hidden file input -->
  <input
    ref="fileInput"
    type="file"
    accept=".json,application/json"
    @change="handleFileSelect"
    style="display: none"
  />

  <!-- Import Preview Dialog -->
  <q-dialog v-model="showPreview" persistent>
    <q-card style="min-width: 500px; max-width: 700px">
      <q-card-section>
        <div class="text-h6">
          <q-icon name="preview" class="q-mr-sm" />
          Import Preview
        </div>
      </q-card-section>

      <q-card-section v-if="previewData">
        <div class="q-mb-md">
          <div class="text-subtitle2 q-mb-sm">File Information:</div>
          <div class="row q-gutter-md">
            <div class="col-12 col-sm-6">
              <strong>Application:</strong> {{ previewData.applicationName }}
            </div>
            <div class="col-12 col-sm-6">
              <strong>Version:</strong> {{ previewData.version }}
            </div>
            <div class="col-12 col-sm-6">
              <strong>Export Date:</strong> {{ formatDate(previewData.exportDate) }}
            </div>
            <div class="col-12 col-sm-6">
              <strong>Total Items:</strong> {{ totalItemCount }}
            </div>
          </div>
        </div>

        <div class="q-mb-md">
          <div class="text-subtitle2 q-mb-sm">Data Summary:</div>
          <q-chip
            v-for="(count, type) in itemCounts"
            :key="type"
            :label="`${type}: ${count}`"
            color="primary"
            text-color="white"
            class="q-mr-sm"
          />
        </div>

        <q-separator class="q-my-md" />

        <div class="text-body2 text-grey-7">
          <strong>⚠️ Important:</strong> Importing will merge this data with your existing data.
          Items with duplicate names will be skipped.
        </div>
      </q-card-section>

      <q-card-actions align="right">
        <q-btn flat label="Cancel" @click="cancelImport" />
        <q-btn
          color="primary"
          label="Import"
          @click="confirmImport"
          :loading="loading"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>

  <!-- Import Result Dialog -->
  <q-dialog v-model="showResult">
    <q-card style="min-width: 400px">
      <q-card-section>
        <div class="text-h6">
          <q-icon
            :name="importResult?.success ? 'check_circle' : 'warning'"
            :color="importResult?.success ? 'positive' : 'warning'"
            class="q-mr-sm"
          />
          Import Result
        </div>
      </q-card-section>

      <q-card-section v-if="importResult">
        <div v-if="importResult.success" class="text-center">
          <q-icon name="check_circle" size="3rem" color="positive" class="q-mb-md" />
          <div class="text-h6 q-mb-sm">Import Successful!</div>
          <div class="text-body1">{{ importResult.importedCount }} items imported</div>
          <div v-if="importResult.skippedCount > 0" class="text-grey-7 q-mt-sm">
            {{ importResult.skippedCount }} items skipped (duplicates)
          </div>
        </div>

        <div v-else>
          <q-icon name="warning" size="3rem" color="warning" class="q-mb-md" />
          <div class="text-h6 q-mb-sm">Import Issues</div>
          <div class="text-body1 q-mb-md">{{ importResult.message }}</div>

          <div v-if="importResult.errors.length > 0" class="q-mt-md">
            <div class="text-subtitle2 q-mb-sm">Errors:</div>
            <div class="error-list">
              <div
                v-for="(error, index) in importResult.errors.slice(0, 5)"
                :key="index"
                class="text-body2 text-negative q-mb-xs"
              >
                • {{ error }}
              </div>
              <div v-if="importResult.errors.length > 5" class="text-caption text-grey-6">
                ... and {{ importResult.errors.length - 5 }} more errors
              </div>
            </div>
          </div>
        </div>
      </q-card-section>

      <q-card-actions align="right">
        <q-btn flat label="Close" @click="showResult = false" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useQuasar } from 'quasar';
import { dataManager } from 'src/services/dataManager';
import type { ImportResult, ExportData } from 'src/types/settings';

const emit = defineEmits<{
  import: [file: File];
}>();

const $q = useQuasar();

const fileInput = ref<HTMLInputElement>();
const loading = ref(false);
const selectedFile = ref<File>();
const showPreview = ref(false);
const showResult = ref(false);
const previewData = ref<ExportData>();
const importResult = ref<ImportResult>();

// Computed properties for preview
const itemCounts = computed(() => {
  if (!previewData.value?.data) return {};

  return {
    Tags: previewData.value.data.tags?.length || 0
  };
});

const totalItemCount = computed(() => {
  return Object.values(itemCounts.value).reduce((sum, count) => sum + count, 0);
});

// Trigger file input click
function triggerFileInput() {
  fileInput.value?.click();
}

// Handle file selection
async function handleFileSelect(event: Event) {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];

  if (!file) return;

  selectedFile.value = file;
  await previewImportFile(file);

  // Reset file input
  input.value = '';
}

// Preview import file
async function previewImportFile(file: File) {
  loading.value = true;

  try {
    const jsonString = await readFileAsText(file);
    const data: ExportData = JSON.parse(jsonString);

    // Validate file structure
    if (!data.applicationName || !data.version || !data.data) {
      throw new Error('Invalid file format');
    }

    previewData.value = data;
    showPreview.value = true;
  } catch (error) {
    console.error('Preview failed:', error);
    $q.notify({
      type: 'negative',
      message: error instanceof Error ? error.message : 'Failed to preview file',
      icon: 'error'
    });
  } finally {
    loading.value = false;
  }
}

// Confirm import
async function confirmImport() {
  if (!selectedFile.value) return;

  loading.value = true;
  showPreview.value = false;

  try {
    const result = await dataManager.importData(selectedFile.value);
    importResult.value = result;
    showResult.value = true;

    emit('import', selectedFile.value);
  } catch (error) {
    console.error('Import failed:', error);
    $q.notify({
      type: 'negative',
      message: error instanceof Error ? error.message : 'Import failed',
      icon: 'error'
    });
  } finally {
    loading.value = false;
  }
}

// Cancel import
function cancelImport() {
  showPreview.value = false;
  selectedFile.value = undefined;
  previewData.value = undefined;
}

// Format date for display
function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    return date.toLocaleString();
  } catch {
    return 'Invalid date';
  }
}

// Read file as text
function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('Failed to read file'));
      }
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };

    reader.readAsText(file);
  });
}
</script>

<style scoped>
.q-btn {
  height: 56px;
}

.error-list {
  max-height: 200px;
  overflow-y: auto;
}
</style>