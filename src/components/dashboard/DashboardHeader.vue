<template>
  <div class="dashboard-header">
    <div class="row items-center justify-between q-py-lg">
      <div class="col-12 col-md-8">
        <div class="text-h4 text-weight-bold q-mb-sm">
          欢迎回来！
        </div>
        <div class="text-subtitle1 text-grey-7">
          {{ welcomeMessage }}
        </div>
      </div>

      <div class="col-12 col-md-4 text-right">
        <div class="row q-gutter-sm justify-end">
          <q-btn
            flat
            round
            color="primary"
            icon="refresh"
            @click="$emit('refresh')"
            :loading="loading"
            class="q-mr-sm"
          >
            <q-tooltip>刷新统计数据</q-tooltip>
          </q-btn>

          <q-btn
            flat
            round
            color="secondary"
            icon="settings"
            @click="$emit('settings')"
          >
            <q-tooltip>仪表板设置</q-tooltip>
          </q-btn>
        </div>
      </div>
    </div>

    <!-- Quick Stats Summary -->
    <div class="row q-gutter-md q-mt-md">
      <div class="col-12 col-sm-6 col-md-3">
        <q-card flat bordered class="quick-stat-card">
          <q-card-section class="row items-center q-pa-md">
            <q-avatar
              :color="getAvatarColor(0)"
              text-color="white"
              icon="school"
              size="md"
              class="q-mr-md"
            />
            <div>
              <div class="text-h6">{{ dashboardStats.content.totalUnits }}</div>
              <div class="text-caption text-grey-6">学习单元</div>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-sm-6 col-md-3">
        <q-card flat bordered class="quick-stat-card">
          <q-card-section class="row items-center q-pa-md">
            <q-avatar
              :color="getAvatarColor(1)"
              text-color="white"
              icon="menu_book"
              size="md"
              class="q-mr-md"
            />
            <div>
              <div class="text-h6">{{ dashboardStats.content.totalVocabulary }}</div>
              <div class="text-caption text-grey-6">词汇总数</div>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-sm-6 col-md-3">
        <q-card flat bordered class="quick-stat-card">
          <q-card-section class="row items-center q-pa-md">
            <q-avatar
              :color="getAvatarColor(2)"
              text-color="white"
              icon="assessment"
              size="md"
              class="q-mr-md"
            />
            <div>
              <div class="text-h6">{{ dashboardStats.learning.totalSessions }}</div>
              <div class="text-caption text-grey-6">练习次数</div>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-sm-6 col-md-3">
        <q-card flat bordered class="quick-stat-card">
          <q-card-section class="row items-center q-pa-md">
            <q-avatar
              :color="getAccuracyColor()"
              text-color="white"
              :icon="getAccuracyIcon()"
              size="md"
              class="q-mr-md"
            />
            <div>
              <div class="text-h6">{{ Math.round(dashboardStats.learning.averageAccuracy) }}%</div>
              <div class="text-caption text-grey-6">平均正确率</div>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Streak and Achievement Banner -->
    <div class="row q-mt-md" v-if="showStreakBanner">
      <div class="col-12">
        <q-banner class="streak-banner bg-gradient-to-r from-orange-4 to-red-4 text-white">
          <template v-slot:avatar>
            <q-avatar color="white" text-color="orange" icon="local_fire_department" />
          </template>
          <div class="text-h6">
            {{ streakMessage }}
          </div>
        </q-banner>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { DashboardStats } from 'src/types/dashboard'

interface Props {
  dashboardStats: DashboardStats
  loading?: boolean
  userName?: string
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  userName: '用户'
})

defineEmits<{
  refresh: []
  settings: []
}>()

const welcomeMessage = computed(() => {
  const hour = new Date().getHours()
  let greeting = '早上好'

  if (hour >= 12 && hour < 18) {
    greeting = '下午好'
  } else if (hour >= 18) {
    greeting = '晚上好'
  }

  const sessionCount = props.dashboardStats.learning.totalSessions
  let sessionInfo = ''

  if (sessionCount === 0) {
    sessionInfo = '开始您的学习之旅吧！'
  } else if (sessionCount < 10) {
    sessionInfo = `您已完成 ${sessionCount} 次练习，继续加油！`
  } else if (sessionCount < 50) {
    sessionInfo = `您已完成 ${sessionCount} 次练习，学习效果显著！`
  } else {
    sessionInfo = `您已完成 ${sessionCount} 次练习，真是太棒了！`
  }

  return `${greeting}，${props.userName}！${sessionInfo}`
})

const showStreakBanner = computed(() => {
  return props.dashboardStats.learning.currentStreak >= 3
})

const streakMessage = computed(() => {
  const streak = props.dashboardStats.learning.currentStreak
  if (streak >= 7) {
    return `🔥 连续学习 ${streak} 天！您真是学习达人！`
  } else if (streak >= 5) {
    return `🔥 连续学习 ${streak} 天！保持这个势头！`
  } else {
    return `🔥 连续学习 ${streak} 天！太棒了！`
  }
})

function getAvatarColor(index: number): string {
  const colors = ['primary', 'secondary', 'accent', 'info', 'warning', 'positive'] as const
  return colors[index % colors.length] as string
}

function getAccuracyColor(): string {
  const accuracy = props.dashboardStats.learning.averageAccuracy
  if (accuracy >= 90) return 'positive'
  if (accuracy >= 75) return 'info'
  if (accuracy >= 60) return 'warning'
  return 'negative'
}

function getAccuracyIcon(): string {
  const accuracy = props.dashboardStats.learning.averageAccuracy
  if (accuracy >= 90) return 'emoji_events'
  if (accuracy >= 75) return 'thumb_up'
  if (accuracy >= 60) return 'trending_up'
  return 'trending_down'
}
</script>

<style scoped>
.dashboard-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  color: white;
  padding: 24px;
  margin-bottom: 24px;
}

.quick-stat-card {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  transition: transform 0.2s ease;
}

.quick-stat-card:hover {
  transform: translateY(-2px);
}

.streak-banner {
  border-radius: 8px;
}

@media (max-width: 600px) {
  .dashboard-header {
    padding: 16px;
    margin-bottom: 16px;
  }

  .quick-stat-card {
    margin-bottom: 8px;
  }
}

/* Gradient text effect */
.text-h4 {
  background: linear-gradient(45deg, #fff, #f0f0f0);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
</style>