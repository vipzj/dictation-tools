<template>
  <div class="data-viewer">
    <!-- Controls -->
    <div class="row q-mb-md items-center justify-between">
      <div class="col-auto">
        <q-btn-group flat>
          <q-btn
            flat
            color="primary"
            icon="content_copy"
            label="Copy"
            @click="copyToClipboard"
            :disable="!hasData"
          />
          <q-btn
            flat
            color="secondary"
            icon="refresh"
            label="Refresh"
            @click="loadData"
            :loading="loading"
          />
        </q-btn-group>
      </div>
      <div class="col-auto">
        <q-toggle
          v-model="formatted"
          label="Formatted"
          color="primary"
        />
      </div>
    </div>

    <!-- Data Display -->
    <q-card flat bordered>
      <q-card-section class="q-pa-none">
        <div v-if="loading" class="q-pa-lg text-center">
          <q-spinner size="2rem" color="primary" />
          <div class="q-mt-sm text-grey-7">Loading data...</div>
        </div>

        <div v-else-if="!hasData" class="q-pa-lg text-center text-grey-7">
          <q-icon name="inbox" size="3rem" class="q-mb-md" />
          <div class="text-h6">No data stored</div>
          <div class="text-caption">Start by creating some tags to see data here</div>
        </div>

        <div v-else class="json-container">
          <pre class="json-content">{{ displayData }}</pre>
        </div>
      </q-card-section>
    </q-card>

    <!-- Data Sections Toggle -->
    <div v-if="hasData && sections.length > 1" class="q-mt-md">
      <div class="text-subtitle2 q-mb-sm">Data Sections:</div>
      <q-chip
        v-for="(section, index) in sections"
        :key="section.name"
        clickable
        :color="section.visible ? 'primary' : 'grey-4'"
        text-color="white"
        @click="toggleSection(index)"
        class="q-mr-sm q-mb-sm"
      >
        {{ section.name }} ({{ section.count }})
      </q-chip>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useQuasar } from 'quasar';
import { db } from 'src/services/indexeddb';
import type { DataSection } from 'src/types/settings';

const $q = useQuasar();

const raw = ref<Record<string, unknown>>({});
const sections = ref<DataSection[]>([]);
const loading = ref(false);
const formatted = ref(true);

// Check if there's any data to display
const hasData = computed(() => {
  return Object.keys(raw.value).length > 0;
});

// Get display data based on formatted toggle and section visibility
const displayData = computed(() => {
  if (!hasData.value) return '';

  const filteredData: Record<string, unknown> = {};

  sections.value.forEach(section => {
    if (section.visible) {
      filteredData[section.name] = section.data;
    }
  });

  return formatted.value
    ? JSON.stringify(filteredData, null, 2)
    : JSON.stringify(filteredData);
});

// Load all data from IndexedDB
async function loadData() {
  loading.value = true;
  try {
    const data: Record<string, unknown> = {};

    // Load tags data
    const tags = await db.tags.toArray();
    data.tags = tags;

    raw.value = data;

    // Create sections
    sections.value = [
      {
        name: 'tags',
        count: tags.length,
        visible: true,
        data: tags
      }
    ];
  } catch (error) {
    console.error('Error loading data:', error);
    $q.notify({
      type: 'negative',
      message: 'Failed to load data',
      icon: 'error'
    });
  } finally {
    loading.value = false;
  }
}

// Copy JSON data to clipboard
async function copyToClipboard() {
  try {
    await navigator.clipboard.writeText(displayData.value);
    $q.notify({
      type: 'positive',
      message: 'Data copied to clipboard',
      icon: 'content_copy'
    });
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
    // Fallback for older browsers
    const textArea = document.createElement('textarea');
    textArea.value = displayData.value;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);

    $q.notify({
      type: 'positive',
      message: 'Data copied to clipboard',
      icon: 'content_copy'
    });
  }
}

// Toggle visibility of data sections
function toggleSection(index: number) {
  const section = sections.value[index];
  if (section) {
    section.visible = !section.visible;
  }
}

onMounted(() => {
  void loadData();
});
</script>

<style scoped>
.json-container {
  max-height: 400px;
  overflow: auto;
}

.json-content {
  margin: 0;
  padding: 16px;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 13px;
  line-height: 1.4;
  background-color: #f8f9fa;
  border-radius: 4px;
  white-space: pre-wrap;
  word-wrap: break-word;
}

/* Dark mode support */
body.body--dark .json-content {
  background-color: #1e1e1e;
  color: #d4d4d4;
}

/* Scrollbar styling */
.json-container::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

.json-container::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

.json-container::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 4px;
}

.json-container::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

/* Dark mode scrollbar */
body.body--dark .json-container::-webkit-scrollbar-track {
  background: #2a2a2a;
}

body.body--dark .json-container::-webkit-scrollbar-thumb {
  background: #555;
}

body.body--dark .json-container::-webkit-scrollbar-thumb:hover {
  background: #777;
}
</style>