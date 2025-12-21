<template>
  <div class="overview-stats">
    <div class="text-h6 q-mb-md">系统概览</div>

    <!-- Content Statistics Section -->
    <div class="row q-gutter-md q-mb-lg">
      <div class="col-12">
        <q-card flat bordered>
          <q-card-section>
            <div class="text-subtitle2 q-mb-md flex items-center">
              <q-icon name="inventory_2" color="primary" class="q-mr-sm" />
              内容统计
            </div>
            <div class="row q-gutter-md">
              <div class="col-12 col-sm-6 col-md-3">
                <div class="stat-item">
                  <div class="text-h4 text-primary">{{ stats.content.totalUnits }}</div>
                  <div class="text-caption text-grey-6">学习单元</div>
                  <div class="text-caption text-grey-7">其中 {{ stats.content.activeUnits }} 个活跃</div>
                </div>
              </div>
              <div class="col-12 col-sm-6 col-md-3">
                <div class="stat-item">
                  <div class="text-h4 text-secondary">{{ stats.content.totalVocabulary }}</div>
                  <div class="text-caption text-grey-6">词汇总数</div>
                  <div class="text-caption text-grey-7">
                    中文 {{ stats.content.vocabularyByType.chinese }} /
                    英文 {{ stats.content.vocabularyByType.english }}
                  </div>
                </div>
              </div>
              <div class="col-12 col-sm-6 col-md-3">
                <div class="stat-item">
                  <div class="text-h4 text-accent">{{ stats.content.totalTags }}</div>
                  <div class="text-caption text-grey-6">标签数量</div>
                  <div class="text-caption text-grey-7">用于内容分类管理</div>
                </div>
              </div>
              <div class="col-12 col-sm-6 col-md-3">
                <div class="stat-item">
                  <div class="text-h4 text-info">{{ Math.round(stats.content.audioCoverage) }}%</div>
                  <div class="text-caption text-grey-6">音频覆盖率</div>
                  <q-linear-progress
                    :value="stats.content.audioCoverage / 100"
                    color="info"
                    size="4px"
                    class="q-mt-xs"
                  />
                </div>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Learning Progress Section -->
    <div class="row q-gutter-md q-mb-lg">
      <div class="col-12">
        <q-card flat bordered>
          <q-card-section>
            <div class="text-subtitle2 q-mb-md flex items-center">
              <q-icon name="trending_up" color="positive" class="q-mr-sm" />
              学习进度
            </div>
            <div class="row q-gutter-md">
              <div class="col-12 col-sm-6 col-md-3">
                <div class="stat-item">
                  <div class="text-h4 text-positive">{{ stats.learning.totalSessions }}</div>
                  <div class="text-caption text-grey-6">练习总次数</div>
                  <div class="text-caption text-grey-7">
                  总练习次数分布
                </div>
                </div>
              </div>
              <div class="col-12 col-sm-6 col-md-3">
                <div class="stat-item">
                  <div class="text-h4" :class="getAccuracyColor()">
                    {{ Math.round(stats.learning.averageAccuracy) }}%
                  </div>
                  <div class="text-caption text-grey-6">平均正确率</div>
                  <div class="text-caption text-grey-7">
                    最高 {{ Math.round(stats.learning.bestAccuracy) }}%
                  </div>
                </div>
              </div>
              <div class="col-12 col-sm-6 col-md-3">
                <div class="stat-item">
                  <div class="text-h4 text-warning">{{ stats.learning.currentStreak }}</div>
                  <div class="text-caption text-grey-6">连续学习天数</div>
                  <div class="text-caption text-grey-7" v-if="stats.learning.currentStreak > 0">
                    继续保持！
                  </div>
                </div>
              </div>
              <div class="col-12 col-sm-6 col-md-3">
                <div class="stat-item">
                  <div class="text-h4 text-info">{{ formatTime(stats.learning.totalPracticeTime) }}</div>
                  <div class="text-caption text-grey-6">总学习时长</div>
                  <div class="text-caption text-grey-7">
                    平均每次 {{ formatTime(Math.round(stats.learning.totalPracticeTime / Math.max(1, stats.learning.totalSessions))) }}
                  </div>
                </div>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- System Analytics Section -->
    <div class="row q-gutter-md">
      <div class="col-12">
        <q-card flat bordered>
          <q-card-section>
            <div class="text-subtitle2 q-mb-md flex items-center">
              <q-icon name="analytics" color="info" class="q-mr-sm" />
              系统分析
            </div>
            <div class="row q-gutter-md">
              <div class="col-12 col-sm-6 col-md-3">
                <div class="stat-item">
                  <div class="text-h4 text-grey-7">{{ stats.system.databaseSize }}</div>
                  <div class="text-caption text-grey-6">数据库大小</div>
                  <div class="text-caption text-grey-7">{{ stats.system.storageLocation }}</div>
                </div>
              </div>
              <div class="col-12 col-sm-6 col-md-3">
                <div class="stat-item">
                  <div class="text-h4 text-grey-7">{{ formatDate(stats.system.lastActivity) }}</div>
                  <div class="text-caption text-grey-6">最后活动</div>
                  <div class="text-caption text-grey-7">{{ getRelativeTime(stats.system.lastActivity) }}</div>
                </div>
              </div>
              <div class="col-12 col-sm-6 col-md-3">
                <div class="stat-item">
                  <div class="text-h4" :class="getErrorRateColor()">
                    {{ Math.round(stats.system.errorRate) }}%
                  </div>
                  <div class="text-caption text-grey-6">错误率</div>
                  <q-linear-progress
                    :value="stats.system.errorRate / 100"
                    :color="getErrorRateProgressColor()"
                    size="4px"
                    class="q-mt-xs"
                  />
                </div>
              </div>
              <div class="col-12 col-sm-6 col-md-3">
                <div class="stat-item">
                  <div class="text-h4" :class="getPerformanceColor()">
                    {{ stats.system.performanceScore }}
                  </div>
                  <div class="text-caption text-grey-6">表现评分</div>
                  <div class="text-caption text-grey-7">综合学习表现</div>
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
import { computed } from 'vue'
import type { DashboardStats } from 'src/types/dashboard'

interface Props {
  dashboardStats: DashboardStats
}

const props = defineProps<Props>()

const stats = computed(() => props.dashboardStats)

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

function getAccuracyColor(): string {
  const accuracy = props.dashboardStats.learning.averageAccuracy
  if (accuracy >= 90) return 'text-positive'
  if (accuracy >= 75) return 'text-info'
  if (accuracy >= 60) return 'text-warning'
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

function getPerformanceColor(): string {
  const score = props.dashboardStats.system.performanceScore
  if (score >= 90) return 'text-positive'
  if (score >= 75) return 'text-info'
  if (score >= 60) return 'text-warning'
  return 'text-negative'
}
</script>

<style scoped>
.overview-stats {
  margin-bottom: 24px;
}

.stat-item {
  padding: 8px 0;
}

.stat-item .text-h4 {
  font-weight: 600;
  line-height: 1.2;
}

.q-card {
  transition: box-shadow 0.3s ease;
}

.q-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

@media (max-width: 600px) {
  .stat-item {
    text-align: center;
    padding: 12px 0;
  }
}
</style>