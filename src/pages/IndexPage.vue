<template>
  <q-page padding class="dashboard-page">
    <!-- Loading State -->
    <div v-if="isLoading" class="column items-center justify-center" style="min-height: 400px;">
      <q-spinner-dots size="40px" color="primary" class="q-mb-md" />
      <div class="text-h6 text-grey-7">加载统计数据中...</div>
    </div>

    <!-- Dashboard Content -->
    <div v-else class="column">
      <!-- Dashboard Header with Welcome Message -->
      <DashboardHeader
        :dashboard-stats="dashboardStats"
        :loading="isLoading"
        @refresh="refreshStats"
        @settings="showSettings = true"
      />

      <!-- Quick Actions -->
      <QuickActions :dashboard-stats="dashboardStats" />

      <!-- Main Statistics Grid -->
      <div class="row q-gutter-lg q-mb-lg">
        <div class="col-12 col-lg-8">
          <!-- Overview Statistics -->
          <OverviewStats :dashboard-stats="dashboardStats" />

          <!-- Learning Progress Analysis -->
          <LearningProgress :dashboard-stats="dashboardStats" />
        </div>

        <div class="col-12 col-lg-4">
          <!-- System Analytics -->
          <SystemAnalytics :dashboard-stats="dashboardStats" />
        </div>
      </div>

      <!-- Help Section -->
      <HelpSection />

      <!-- Settings Dialog -->
      <q-dialog v-model="showSettings" persistent>
        <q-card style="min-width: 500px;">
          <q-card-section class="row items-center q-pb-none">
            <div class="text-h6">仪表板设置</div>
            <q-space />
            <q-btn flat round dense icon="close" @click="showSettings = false" />
          </q-card-section>

          <q-separator />

          <q-card-section class="column q-gutter-md">
            <div>
              <div class="text-subtitle2 q-mb-sm">刷新设置</div>
              <div class="row items-center q-gutter-md">
                <q-toggle
                  v-model="dashboardConfig.enableAutoRefresh"
                  label="自动刷新"
                  color="primary"
                />
                <q-input
                  v-model.number="dashboardConfig.refreshInterval"
                  type="number"
                  label="刷新间隔（秒）"
                  outlined
                  dense
                  style="width: 150px"
                  :disable="!dashboardConfig.enableAutoRefresh"
                  min="10"
                  max="300"
                  step="10"
                />
              </div>
            </div>

            <div>
              <div class="text-subtitle2 q-mb-sm">显示设置</div>
              <div class="column q-gutter-sm">
                <q-toggle
                  v-model="dashboardConfig.enableAnimations"
                  label="启用动画效果"
                  color="primary"
                />
                <q-toggle
                  v-model="dashboardConfig.showDetailedStats"
                  label="显示详细统计"
                  color="primary"
                />
                <q-toggle
                  v-model="dashboardConfig.compactMode"
                  label="紧凑模式"
                  color="primary"
                />
              </div>
            </div>
          </q-card-section>

          <q-separator />

          <q-card-actions align="right">
            <q-btn flat label="取消" @click="showSettings = false" />
            <q-btn color="primary" label="保存" @click="saveSettings" />
          </q-card-actions>
        </q-card>
      </q-dialog>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { useSystemStats } from 'src/composables/useSystemStats'
import type { DashboardConfig } from 'src/types/dashboard'

// Import dashboard components
import DashboardHeader from 'src/components/dashboard/DashboardHeader.vue'
import OverviewStats from 'src/components/dashboard/OverviewStats.vue'
import QuickActions from 'src/components/dashboard/QuickActions.vue'
import LearningProgress from 'src/components/dashboard/LearningProgress.vue'
import SystemAnalytics from 'src/components/dashboard/SystemAnalytics.vue'
import HelpSection from 'src/components/dashboard/HelpSection.vue'

// Initialize system stats composable with default configuration
const {
  dashboardStats,
  isLoading,
  refreshStats,
  startAutoRefresh,
  stopAutoRefresh
} = useSystemStats({
  refreshInterval: 30000,
  enableAnimations: true,
  showDetailedStats: true,
  compactMode: false
})

// Settings state
const showSettings = ref(false)
const dashboardConfig = ref<DashboardConfig>({
  refreshInterval: 30,
  enableAutoRefresh: true,
  enableAnimations: true,
  showDetailedStats: true,
  compactMode: false
})

// Watch for configuration changes
watch(() => dashboardConfig.value.enableAutoRefresh, (newValue) => {
  if (newValue) {
    startAutoRefresh()
  } else {
    stopAutoRefresh()
  }
})

watch(() => dashboardConfig.value.refreshInterval, () => {
  if (dashboardConfig.value.enableAutoRefresh) {
    stopAutoRefresh()
    startAutoRefresh()
  }
})

// Save settings to localStorage
function saveSettings(): void {
  try {
    localStorage.setItem('dashboardConfig', JSON.stringify(dashboardConfig.value))
    showSettings.value = false
  } catch (error) {
    console.error('Failed to save dashboard settings:', error)
  }
}

// Load settings from localStorage
function loadSettings(): void {
  try {
    const savedConfig = localStorage.getItem('dashboardConfig')
    if (savedConfig) {
      const parsed = JSON.parse(savedConfig)
      dashboardConfig.value = { ...dashboardConfig.value, ...parsed }
    }
  } catch (error) {
    console.error('Failed to load dashboard settings:', error)
  }
}

// Lifecycle
onMounted(async () => {
  // Load saved settings
  loadSettings()

  // Initial refresh
  await refreshStats()
})

onUnmounted(() => {
  stopAutoRefresh()
})
</script>

<style scoped>
.dashboard-page {
  background: #f8f9fa;
  min-height: 100vh;
}

/* Smooth transitions for loading state */
.column {
  transition: opacity 0.3s ease;
}

/* Custom scrollbar for better appearance */
.q-page {
  scrollbar-width: thin;
  scrollbar-color: #c1c1c1 transparent;
}

.q-page::-webkit-scrollbar {
  width: 8px;
}

.q-page::-webkit-scrollbar-track {
  background: transparent;
}

.q-page::-webkit-scrollbar-thumb {
  background-color: #c1c1c1;
  border-radius: 4px;
}

.q-page::-webkit-scrollbar-thumb:hover {
  background-color: #a8a8a8;
}

/* Responsive adjustments */
@media (max-width: 1024px) {
  .dashboard-page {
    padding: 12px;
  }
}

@media (max-width: 600px) {
  .dashboard-page {
    padding: 8px;
  }
}

/* Enhance card spacing and shadows */
.q-card {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.q-card:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

/* Loading animation */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.column {
  animation: fadeIn 0.5s ease-out;
}
</style>