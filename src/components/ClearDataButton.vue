<template>
  <q-btn
    color="negative"
    icon="delete_sweep"
    label="Clear All Data"
    @click="showConfirmationDialog"
    :loading="loading"
    class="full-width"
  >
    <q-tooltip>
      Permanently delete all stored data
    </q-tooltip>
  </q-btn>

  <!-- Confirmation Dialog -->
  <q-dialog v-model="showDialog" persistent>
    <q-card style="min-width: 450px">
      <q-card-section class="bg-negative text-white">
        <div class="text-h6 flex items-center">
          <q-icon name="warning" class="q-mr-sm" />
          ⚠️ Danger Zone - Clear All Data
        </div>
      </q-card-section>

      <q-card-section class="q-pt-lg">
        <div class="text-body1 q-mb-md">
          This action will <strong>permanently delete the entire database file</strong> stored in this application:
        </div>

        <div class="q-ml-lg q-mb-md">
          <ul class="text-negative">
            <li>All tags ({{ dataCounts.tags }} items)</li>
            <li>All units ({{ dataCounts.units }} items)</li>
            <li>All vocabulary items ({{ dataCounts.vocabularyItems }} items)</li>
            <li>All dictation sessions ({{ dataCounts.dictationSessions }} items)</li>
            <li>Unit-tag relationships ({{ dataCounts.unitTags }} items)</li>
            <li>Audio recordings and blobs (if any)</li>
            <li>Database file: <strong>dictation-tools-database</strong></li>
          </ul>
        </div>

        <div class="bg-red-1 q-pa-md rounded-borders q-mb-md">
          <div class="text-subtitle2 text-red-9 q-mb-sm">
            <q-icon name="warning" class="q-mr-sm" />
            ⚠️ Complete Database Deletion:
          </div>
          <div class="text-body2 text-red-8">
            This will <strong>permanently delete the entire database file</strong>.
            The database will be recreated automatically with fresh schema when you restart the application.
            This action cannot be undone and is more destructive than regular data clearing.
          </div>
        </div>

        <div class="bg-orange-1 q-pa-md rounded-borders">
          <div class="text-subtitle2 text-orange-9 q-mb-sm">
            <q-icon name="info" class="q-mr-sm" />
            Important:
          </div>
          <div class="text-body2 text-orange-8">
            Make sure you have exported a backup before proceeding. All user data will be permanently lost.
          </div>
        </div>
      </q-card-section>

      <q-card-section class="q-pt-none">
        <div class="text-body2 q-mb-md">
          Type <code class="bg-grey-2 q-pa-xs rounded">DELETE ALL DATA</code> below to confirm:
        </div>

        <q-input
          v-model="confirmationText"
          outlined
          placeholder="Type DELETE ALL DATA"
          :rules="[
            val => !!val || 'Please type the confirmation phrase',
            val => val === 'DELETE ALL DATA' || 'Confirmation phrase does not match'
          ]"
          hide-bottom-space
          class="q-mb-md"
        />

        <q-separator class="q-my-md" />

        <div class="flex justify-between">
          <q-btn
            flat
            color="grey"
            label="Cancel"
            @click="cancelClear"
            :disable="loading"
          />
          <q-btn
            color="negative"
            label="Delete All Data"
            @click="confirmClearData"
            :loading="loading"
            :disable="!isConfirmationValid"
          />
        </div>
      </q-card-section>
    </q-card>
  </q-dialog>

  <!-- Success Dialog -->
  <q-dialog v-model="showSuccessDialog">
    <q-card style="min-width: 400px">
      <q-card-section class="bg-positive text-white text-center">
        <q-icon name="check_circle" size="3rem" class="q-mb-md" />
        <div class="text-h6">Data Cleared Successfully</div>
      </q-card-section>

      <q-card-section class="q-pt-lg text-center">
        <div class="text-body1 q-mb-md">
          All data has been permanently deleted from this application.
        </div>
        <div class="text-grey-6">
          The application has been reset to its initial state.
        </div>
      </q-card-section>

      <q-card-actions align="center">
        <q-btn
          color="primary"
          label="Got it"
          @click="showSuccessDialog = false"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>

  <!-- Error Dialog -->
  <q-dialog v-model="showErrorDialog">
    <q-card style="min-width: 400px">
      <q-card-section class="bg-negative text-white">
        <div class="text-h6 flex items-center">
          <q-icon name="error" class="q-mr-sm" />
          Error Clearing Data
        </div>
      </q-card-section>

      <q-card-section class="q-pt-lg">
        <div class="text-body1 q-mb-md">
          Failed to clear data. Please try again.
        </div>
        <div v-if="errorMessage" class="text-negative q-mt-sm">
          {{ errorMessage }}
        </div>
      </q-card-section>

      <q-card-actions align="right">
        <q-btn
          flat
          color="primary"
          label="Close"
          @click="showErrorDialog = false"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { db } from 'src/services/indexeddb';
import { dataManager } from 'src/services/dataManager';

const emit = defineEmits<{
  clear: [];
}>();


const loading = ref(false);
const showDialog = ref(false);
const showSuccessDialog = ref(false);
const showErrorDialog = ref(false);
const confirmationText = ref('');
const errorMessage = ref('');
const dataCounts = ref({
  tags: 0,
  units: 0,
  vocabularyItems: 0,
  dictationSessions: 0,
  unitTags: 0
});

// Computed property to check if confirmation is valid
const isConfirmationValid = computed(() => {
  return confirmationText.value === 'DELETE ALL DATA';
});

// Load comprehensive data count
async function loadDataCount() {
  try {
    const [tags, units, vocabulary, sessions, unitTags] = await Promise.all([
      db.tags.count(),
      db.units.count(),
      db.vocabularyItems.count(),
      db.dictationSessions.count(),
      db.unitTags.count()
    ]);

    dataCounts.value = {
      tags,
      units,
      vocabularyItems: vocabulary,
      dictationSessions: sessions,
      unitTags
    };
  } catch (error) {
    console.error('Failed to load data count:', error);
    dataCounts.value = {
      tags: 0,
      units: 0,
      vocabularyItems: 0,
      dictationSessions: 0,
      unitTags: 0
    };
  }
}

// Show confirmation dialog
async function showConfirmationDialog() {
  await loadDataCount();
  showDialog.value = true;
  confirmationText.value = '';
  errorMessage.value = '';
}

// Cancel clear operation
function cancelClear() {
  showDialog.value = false;
  confirmationText.value = '';
}

// Confirm and clear data
async function confirmClearData() {
  if (!isConfirmationValid.value) return;

  loading.value = true;

  try {
    const result = await dataManager.clearAllData();

    if (result.success) {
      // Success
      showDialog.value = false;
      showSuccessDialog.value = true;
      emit('clear');

      // Reset data counts since database is completely deleted
      dataCounts.value = {
        tags: 0,
        units: 0,
        vocabularyItems: 0,
        dictationSessions: 0,
        unitTags: 0
      };
    } else {
      // Error
      errorMessage.value = result.message || 'Unknown error occurred';
      showErrorDialog.value = true;
    }
  } catch (error) {
    console.error('Clear data failed:', error);
    errorMessage.value = error instanceof Error ? error.message : 'Failed to clear data';
    showErrorDialog.value = true;
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  void loadDataCount();
});
</script>

<style scoped>
.q-btn {
  height: 56px;
}

code {
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 0.9em;
}

ul {
  margin: 0;
  padding-left: 1.5em;
}

ul li {
  margin-bottom: 0.5em;
}
</style>