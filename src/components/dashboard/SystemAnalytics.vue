<template>
  <div class="system-analytics">
    <div class="text-h6 q-mb-md">系统分析</div>

    <!-- System Health Overview -->
    <div class="row q-gutter-md q-mb-lg">
      <div class="col-12 col-md-6">
        <q-card flat bordered>
          <q-card-section>
            <div class="text-subtitle2 q-mb-md flex items-center">
              <q-icon name="monitor_heart" color="primary" class="q-mr-sm" />
              系统健康状态
            </div>

            <div class="row q-gutter-md">
              <div class="col-12">
                <div class="health-metric">
                  <div class="flex items-center justify-between q-mb-sm">
                    <span>系统性能评分</span>
                    <span class="text-weight-bold" :class="getPerformanceScoreColor()">
                      {{ dashboardStats.system.performanceScore }}/100
                    </span>
                  </div>
                  <q-linear-progress
                    :value="dashboardStats.system.performanceScore / 100"
                    :color="getPerformanceScoreColor().replace('text-', '')"
                    size="8px"
                    rounded
                  />
                </div>
              </div>

              <div class="col-12">
                <div class="health-metric">
                  <div class="flex items-center justify-between q-mb-sm">
                    <span>错误率</span>
                    <span class="text-weight-bold" :class="getErrorRateColor()">
                      {{ Math.round(dashboardStats.system.errorRate) }}%
                    </span>
                  </div>
                  <q-linear-progress
                    :value="dashboardStats.system.errorRate / 100"
                    :color="getErrorRateProgressColor()"
                    size="8px"
                    rounded
                  />
                </div>
              </div>

              <div class="col-12">
                <div class="health-metric">
                  <div class="flex items-center justify-between">
                    <span>系统状态</span>
                    <q-chip
                      :color="getSystemHealthChipColor()"
                      :icon="getSystemHealthIcon()"
                      :label="getSystemHealthLabel()"
                      size="sm"
                    />
                  </div>
                </div>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-md-6">
        <q-card flat bordered>
          <q-card-section>
            <div class="text-subtitle2 q-mb-md flex items-center">
              <q-icon name="storage" color="secondary" class="q-mr-sm" />
              存储分析
            </div>

            <div class="row q-gutter-md">
              <div class="col-12">
                <div class="storage-item">
                  <div class="text-h6">{{ dashboardStats.system.databaseSize }}</div>
                  <div class="text-caption text-grey-6">数据库大小</div>
                </div>
              </div>

              <div class="col-12">
                <div class="storage-item">
                  <div class="text-h6">{{ dashboardStats.system.storageLocation }}</div>
                  <div class="text-caption text-grey-6">存储位置</div>
                </div>
              </div>

              <div class="col-12">
                <div class="storage-item">
                  <div class="text-h6">{{ formatDate(dashboardStats.system.lastModified) }}</div>
                  <div class="text-caption text-grey-6">最后更新</div>
                </div>
              </div>
            </div>

            <!-- Data Distribution Chart (Simplified) -->
            <div class="q-mt-md">
              <div class="text-subtitle2 q-mb-sm">数据分布</div>
              <div class="row q-gutter-sm text-caption">
                <div class="col-4 text-center">
                  <div class="text-weight-bold">{{ dashboardStats.content.totalUnits }}</div>
                  <div class="text-grey-6">单元</div>
                </div>
                <div class="col-4 text-center">
                  <div class="text-weight-bold">{{ dashboardStats.content.totalVocabulary }}</div>
                  <div class="text-grey-6">词汇</div>
                </div>
                <div class="col-4 text-center">
                  <div class="text-weight-bold">{{ dashboardStats.learning.totalSessions }}</div>
                  <div class="text-grey-6">会话</div>
                </div>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Usage Patterns -->
    <div class="row q-gutter-md q-mb-lg">
      <div class="col-12">
        <q-card flat bordered>
          <q-card-section>
            <div class="text-subtitle2 q-mb-md flex items-center">
              <q-icon name="insights" color="info" class="q-mr-sm" />
              使用模式分析
            </div>

            <div class="row q-gutter-md">
              <div class="col-12 col-md-4">
                <div class="usage-metric">
                  <q-icon name="schedule" color="primary" size="md" class="q-mb-sm" />
                  <div class="text-h6">{{ getRelativeTime(dashboardStats.system.lastActivity) }}</div>
                  <div class="text-caption text-grey-6">最后活动时间</div>
                </div>
              </div>

              <div class="col-12 col-md-4">
                <div class="usage-metric">
                  <q-icon name="timer" color="secondary" size="md" class="q-mb-sm" />
                  <div class="text-h6">{{ formatTime(dashboardStats.learning.totalPracticeTime) }}</div>
                  <div class="text-caption text-grey-6">累计学习时长</div>
                </div>
              </div>

              <div class="col-12 col-md-4">
                <div class="usage-metric">
                  <q-icon name="speed" color="accent" size="md" class="q-mb-sm" />
                  <div class="text-h6">{{ getUsageIntensity() }}</div>
                  <div class="text-caption text-grey-6">使用强度</div>
                </div>
              </div>
            </div>

            <!-- Activity Status -->
            <div class="q-mt-md">
              <div class="text-subtitle2 q-mb-sm">活动状态</div>
              <div class="row q-gutter-sm">
                <q-chip
                  :color="getActivityChipColor()"
                  :icon="getActivityIcon()"
                  :label="getActivityLabel()"
                />
                <q-chip
                  color="info"
                  icon="calendar_today"
                  :label="getDaysSinceLastActivity() + '天前'"
                />
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- System Recommendations -->
    <div class="row q-gutter-md">
      <div class="col-12">
        <q-card flat bordered>
          <q-card-section>
            <div class="text-subtitle2 q-mb-md flex items-center">
              <q-icon name="lightbulb" color="warning" class="q-mr-sm" />
              系统建议
            </div>

            <div class="row q-gutter-md">
              <div class="col-12">
                <div v-for="recommendation in getSystemRecommendations()" :key="recommendation.title" class="recommendation-item">
                  <div class="row items-center q-gutter-md">
                    <q-avatar
                      :color="recommendation.color"
                      text-color="white"
                      :icon="recommendation.icon"
                      size="md"
                    />
                    <div class="col">
                      <div class="text-subtitle2">{{ recommendation.title }}</div>
                      <div class="text-caption text-grey-6">{{ recommendation.description }}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { DashboardStats } from 'src/types/dashboard'

interface Props {
  dashboardStats: DashboardStats
}

const props = defineProps<Props>()

function getPerformanceScoreColor(): string {
  const score = props.dashboardStats.system.performanceScore
  if (score >= 90) return 'text-positive'
  if (score >= 75) return 'text-info'
  if (score >= 60) return 'text-warning'
  return 'text-negative'
}

function getErrorRateColor(): string {
  const errorRate = props.dashboardStats.system.errorRate
  if (errorRate <= 10) return 'text-positive'
  if (errorRate <= 20) return 'text-warning'
  return 'text-negative'
}

function getErrorRateProgressColor(): string {
  const errorRate = props.dashboardStats.system.errorRate
  if (errorRate <= 10) return 'positive'
  if (errorRate <= 20) return 'warning'
  return 'negative'
}

function getSystemHealthIcon(): string {
  const score = props.dashboardStats.system.performanceScore
  if (score >= 90) return 'check_circle'
  if (score >= 75) return 'info'
  if (score >= 60) return 'warning'
  return 'error'
}

function getSystemHealthChipColor(): string {
  const score = props.dashboardStats.system.performanceScore
  if (score >= 90) return 'positive'
  if (score >= 75) return 'info'
  if (score >= 60) return 'warning'
  return 'negative'
}

function getSystemHealthLabel(): string {
  const score = props.dashboardStats.system.performanceScore
  if (score >= 90) return '优秀'
  if (score >= 75) return '良好'
  if (score >= 60) return '一般'
  return '需改进'
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('zh-CN')
}

function getRelativeTime(date: Date): string {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return '刚刚'
  if (diffMins < 60) return `${diffMins}分钟前`
  if (diffHours < 24) return `${diffHours}小时前`
  if (diffDays < 7) return `${diffDays}天前`

  return date.toLocaleDateString('zh-CN')
}

function formatTime(minutes: number): string {
  if (minutes < 60) {
    return `${minutes}分钟`
  } else if (minutes < 1440) {
    const hours = Math.floor(minutes / 60)
    const remainingMinutes = minutes % 60
    return remainingMinutes > 0 ? `${hours}小时${remainingMinutes}分钟` : `${hours}小时`
  } else {
    const days = Math.floor(minutes / 1440)
    const remainingHours = Math.floor((minutes % 1440) / 60)
    return remainingHours > 0 ? `${days}天${remainingHours}小时` : `${days}天`
  }
}

function getUsageIntensity(): string {
  const sessions = props.dashboardStats.learning.totalSessions
  const timePerSession = props.dashboardStats.learning.totalPracticeTime / Math.max(1, sessions)

  if (timePerSession >= 30) return '高强度'
  if (timePerSession >= 15) return '中等强度'
  if (timePerSession >= 5) return '轻度'
  return '轻度'
}

function getActivityChipColor(): string {
  const daysSinceLastActivity = getDaysSinceLastActivity()
  if (daysSinceLastActivity <= 1) return 'positive'
  if (daysSinceLastActivity <= 7) return 'info'
  if (daysSinceLastActivity <= 30) return 'warning'
  return 'negative'
}

function getActivityIcon(): string {
  const daysSinceLastActivity = getDaysSinceLastActivity()
  if (daysSinceLastActivity <= 1) return 'whatshot'
  if (daysSinceLastActivity <= 7) return 'local_activity'
  if (daysSinceLastActivity <= 30) return 'hourglass_empty'
  return 'hourglass_full'
}

function getActivityLabel(): string {
  const daysSinceLastActivity = getDaysSinceLastActivity()
  if (daysSinceLastActivity === 0) return '活跃用户'
  if (daysSinceLastActivity <= 1) return '近期活跃'
  if (daysSinceLastActivity <= 7) return '定期使用'
  if (daysSinceLastActivity <= 30) return '偶尔使用'
  return '长期未用'
}

function getDaysSinceLastActivity(): number {
  const now = new Date()
  const lastActivity = props.dashboardStats.system.lastActivity
  return Math.floor((now.getTime() - lastActivity.getTime()) / (24 * 60 * 60 * 1000))
}

function getSystemRecommendations(): Array<{ title: string; description: string; icon: string; color: string }> {
  const recommendations = []
  const stats = props.dashboardStats

  // Performance recommendations
  if (stats.system.performanceScore < 60) {
    recommendations.push({
      title: '性能优化',
      description: '系统性能较低，建议优化数据结构或减少缓存',
      icon: 'speed',
      color: 'negative'
    })
  }

  // Error rate recommendations
  if (stats.system.errorRate > 20) {
    recommendations.push({
      title: '错误率过高',
      description: '学习正确率较低，建议加强基础练习',
      icon: 'error',
      color: 'negative'
    })
  }

  // Activity recommendations
  const daysSinceLastActivity = getDaysSinceLastActivity()
  if (daysSinceLastActivity > 7 && stats.learning.totalSessions > 0) {
    recommendations.push({
      title: '保持学习习惯',
      description: '建议每周至少进行2-3次练习',
      icon: 'schedule',
      color: 'warning'
    })
  }

  // Storage recommendations
  const dbSize = parseFloat(stats.system.databaseSize.replace(/[^\d.]/g, ''))
  if (dbSize > 100) { // 100MB
    recommendations.push({
      title: '存储空间管理',
      description: '数据库较大，建议清理历史数据或优化存储',
      icon: 'storage',
      color: 'info'
    })
  }

  // Positive feedback
  if (recommendations.length === 0) {
    recommendations.push({
      title: '系统运行良好',
      description: '所有指标都在正常范围内，继续保持！',
      icon: 'thumb_up',
      color: 'positive'
    })
  }

  return recommendations
}
</script>

<style scoped>
.system-analytics {
  margin-bottom: 24px;
}

.health-metric {
  margin-bottom: 16px;
}

.storage-item {
  text-align: center;
  padding: 12px;
  background: #fafafa;
  border-radius: 8px;
  margin-bottom: 8px;
}

.usage-metric {
  text-align: center;
  padding: 16px;
  background: #f9f9f9;
  border-radius: 8px;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.recommendation-item {
  padding: 12px;
  background: #fafafa;
  border-radius: 8px;
  margin-bottom: 8px;
  transition: transform 0.2s ease;
}

.recommendation-item:hover {
  transform: translateX(4px);
}

@media (max-width: 600px) {
  .usage-metric {
    padding: 12px;
  }

  .recommendation-item {
    padding: 8px;
  }
}
</style>