<template>
  <q-page class="q-pa-md">
    <div class="row q-gutter-md">
      <!-- Page Title -->
      <div class="col-12">
        <div class="text-h4 text-weight-bold q-mb-md">Settings</div>
        <div class="text-subtitle1 text-grey-7 q-mb-lg">
          Manage your local data and application settings
        </div>
      </div>

      <!-- Data Statistics Section -->
      <div class="col-12">
        <q-card flat bordered class="q-pa-md">
          <q-card-section>
            <div class="text-h6 q-mb-md">
              <q-icon name="analytics" class="q-mr-sm" />
              Data Statistics
            </div>
            <DataStats />
          </q-card-section>
        </q-card>
      </div>

      <!-- Data Management Section -->
      <div class="col-12">
        <q-card flat bordered class="q-pa-md">
          <q-card-section>
            <div class="text-h6 q-mb-md">
              <q-icon name="storage" class="q-mr-sm" />
              Data Management
            </div>

            <div class="row q-gutter-md">
              <!-- Export Data -->
              <div class="col-12 col-sm-6 col-md-3">
                <ExportButton @export="handleExport" />
              </div>

              <!-- Import Data -->
              <div class="col-12 col-sm-6 col-md-3">
                <FileUpload @import="handleImport" />
              </div>

              <!-- Clear Data -->
              <div class="col-12 col-sm-6 col-md-3">
                <ClearDataButton @clear="handleClearData" />
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Raw Data Viewer Section -->
      <div class="col-12">
        <q-card flat bordered class="q-pa-md">
          <q-card-section>
            <div class="text-h6 q-mb-md">
              <q-icon name="code" class="q-mr-sm" />
              Raw Data Viewer
            </div>
            <DataViewer />
          </q-card-section>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useQuasar } from 'quasar';

// Define component name for ESLint
defineOptions({
  name: 'SettingsPage'
});
import DataStats from 'components/DataStats.vue';
import DataViewer from 'components/DataViewer.vue';
import ExportButton from 'components/ExportButton.vue';
import FileUpload from 'components/FileUpload.vue';
import ClearDataButton from 'components/ClearDataButton.vue';
import { dataManager } from 'src/services/dataManager';

const $q = useQuasar();

// Handle data export event (just show notification, export is handled by ExportButton)
function handleExport() {
  $q.notify({
    type: 'positive',
    message: 'Data exported successfully',
    icon: 'cloud_download'
  });
}

// Handle data import
async function handleImport(file: File) {
  try {
    const result = await dataManager.importData(file);
    if (result.success) {
      $q.notify({
        type: 'positive',
        message: `Successfully imported ${result.importedCount} items`,
        icon: 'cloud_upload'
      });
    } else {
      $q.notify({
        type: 'warning',
        message: result.message || 'Import completed with issues',
        icon: 'warning'
      });
    }
  } catch (error) {
    console.error('Import failed:', error);
    $q.notify({
      type: 'negative',
      message: 'Import failed. Please check the file format.',
      icon: 'error'
    });
  }
}

// Handle data clearing
async function handleClearData() {
  try {
    const result = await dataManager.clearAllData();
    if (result.success) {
      $q.notify({
        type: 'positive',
        message: 'All data cleared successfully',
        icon: 'delete_sweep'
      });
    } else {
      $q.notify({
        type: 'negative',
        message: result.message || 'Failed to clear data',
        icon: 'error'
      });
    }
  } catch (error) {
    console.error('Clear data failed:', error);
    $q.notify({
      type: 'negative',
      message: 'Failed to clear data. Please try again.',
      icon: 'error'
    });
  }
}

onMounted(() => {
  // Initialize data when component mounts
  console.log('Settings page mounted');
});
</script>

<style scoped>
.q-card {
  height: 100%;
}

@media (max-width: 600px) {
  .q-gutter-md > div {
    margin-bottom: 16px;
  }
}
</style>