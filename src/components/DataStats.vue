<template>
  <div class="data-stats">
    <div class="row q-gutter-md">
      <!-- Total Tags -->
      <div class="col-12 col-sm-6 col-md-3">
        <q-card flat bordered class="stat-card">
          <q-card-section class="text-center">
            <q-icon name="label" size="2rem" color="primary" class="q-mb-sm" />
            <div class="text-h4 text-weight-bold">{{ stats.totalTags }}</div>
            <div class="text-caption text-grey-7">Total Tags</div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Database Size -->
      <div class="col-12 col-sm-6 col-md-3">
        <q-card flat bordered class="stat-card">
          <q-card-section class="text-center">
            <q-icon name="storage" size="2rem" color="secondary" class="q-mb-sm" />
            <div class="text-h4 text-weight-bold">{{ stats.databaseSize }}</div>
            <div class="text-caption text-grey-7">Database Size</div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Last Modified -->
      <div class="col-12 col-sm-6 col-md-3">
        <q-card flat bordered class="stat-card">
          <q-card-section class="text-center">
            <q-icon name="schedule" size="2rem" color="info" class="q-mb-sm" />
            <div class="text-h6 text-weight-bold">{{ stats.lastModified }}</div>
            <div class="text-caption text-grey-7">Last Modified</div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Storage Location -->
      <div class="col-12 col-sm-6 col-md-3">
        <q-card flat bordered class="stat-card">
          <q-card-section class="text-center">
            <q-icon name="folder" size="2rem" color="warning" class="q-mb-sm" />
            <div class="text-h6 text-weight-bold">{{ stats.storageLocation }}</div>
            <div class="text-caption text-grey-7">Storage Location</div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Refresh Button -->
    <div class="row q-mt-md">
      <div class="col-12 text-right">
        <q-btn
          flat
          color="primary"
          icon="refresh"
          label="Refresh"
          @click="refreshStats"
          :loading="loading"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { db } from 'src/services/indexeddb';

interface DataStats {
  totalTags: number;
  databaseSize: string;
  lastModified: string;
  storageLocation: string;
}

const stats = ref<DataStats>({
  totalTags: 0,
  databaseSize: '0 KB',
  lastModified: 'Never',
  storageLocation: 'IndexedDB'
});

const loading = ref(false);

// Format bytes to human readable format
function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Format date to relative time
function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;

  return date.toLocaleDateString();
}

// Calculate estimated database size
async function estimateDatabaseSize(): Promise<number> {
  try {
    const tags = await db.tags.toArray();
    const jsonString = JSON.stringify(tags);
    return new Blob([jsonString]).size;
  } catch (error) {
    console.error('Error estimating database size:', error);
    return 0;
  }
}

// Get the most recent modification date
async function getLastModified(): Promise<Date> {
  try {
    const tags = await db.tags.toArray();
    if (tags.length === 0) return new Date(0);

    return tags.reduce((latest, tag) => {
      const tagDate = new Date(tag.updatedAt);
      return tagDate > latest ? tagDate : latest;
    }, new Date(0));
  } catch (error) {
    console.error('Error getting last modified date:', error);
    return new Date(0);
  }
}

// Refresh all statistics
async function refreshStats() {
  loading.value = true;
  try {
    // Get total tags count
    const totalTags = await db.tags.count();

    // Get database size estimate
    const dbSize = await estimateDatabaseSize();

    // Get last modified date
    const lastModified = await getLastModified();

    // Update stats
    stats.value = {
      totalTags,
      databaseSize: formatBytes(dbSize),
      lastModified: lastModified.getTime() === 0 ? 'Never' : formatRelativeTime(lastModified),
      storageLocation: 'IndexedDB (Local)'
    };
  } catch (error) {
    console.error('Error refreshing stats:', error);
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  void refreshStats();
});
</script>

<style scoped>
.stat-card {
  height: 100%;
  transition: transform 0.2s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
}

@media (max-width: 600px) {
  .stat-card {
    margin-bottom: 8px;
  }
}
</style>