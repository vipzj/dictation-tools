<template>
  <q-btn
    color="primary"
    icon="cloud_download"
    label="Export Data"
    @click="handleExport"
    :loading="loading"
    class="full-width"
  >
    <q-tooltip>
      Export all data as a JSON backup file
    </q-tooltip>
  </q-btn>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useQuasar } from 'quasar';
import { dataManager } from 'src/services/dataManager';

const emit = defineEmits<{
  export: [];
}>();

const $q = useQuasar();
const loading = ref(false);

async function handleExport() {
  loading.value = true;

  try {
    // Show progress notification
    const progressNotification = $q.notify({
      type: 'ongoing',
      message: 'Preparing data export...',
      icon: 'cloud_download',
      timeout: 0,
      position: 'top'
    });

    await dataManager.exportData();

    // Dismiss progress
    progressNotification();

    // Emit success event to parent
    emit('export');
  } catch (error) {
    console.error('Export failed:', error);
    $q.notify({
      type: 'negative',
      message: error instanceof Error ? error.message : 'Export failed',
      icon: 'error',
      timeout: 5000
    });
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.q-btn {
  height: 56px;
}
</style>