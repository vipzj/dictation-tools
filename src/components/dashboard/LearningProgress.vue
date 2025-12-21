<template>
  <div class="learning-progress">
    <div class="text-h6 q-mb-md">学习进度分析</div>

    <!-- Memory Level Distribution -->
    <div class="row q-gutter-md q-mb-lg">
      <div class="col-12 col-md-6">
        <q-card flat bordered>
          <q-card-section>
            <div class="text-subtitle2 q-mb-md flex items-center">
              <q-icon name="psychology" color="primary" class="q-mr-sm" />
              记忆水平分布
            </div>
            <div class="row q-gutter-sm q-mb-md">
              <div
                v-for="(count, level) in dashboardStats.learning.memoryLevelDistribution"
                :key="level"
                class="col-auto"
              >
                <div class="memory-level-item">
                  <div
                    class="memory-level-indicator"
                    :style="{ backgroundColor: getMemoryLevelColor(Number(level)) }"
                  >
                    {{ level }}
                  </div>
                  <div class="memory-level-info">
                    <div class="memory-level-count">{{ count }}</div>
                    <div class="memory-level-label">{{ getMemoryLevelLabel(Number(level)) }}</div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Progress Overview -->
            <div class="q-mt-md">
              <div class="flex items-center justify-between q-mb-sm">
                <span class="text-caption">总体进度</span>
                <span class="text-caption text-weight-bold">{{ learningProgress }}%</span>
              </div>
              <q-linear-progress
                :value="learningProgress / 100"
                color="primary"
                size="8px"
                rounded
              />
            </div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-md-6">
        <q-card flat bordered>
          <q-card-section>
            <div class="text-subtitle2 q-mb-md flex items-center">
              <q-icon name="emoji_events" color="secondary" class="q-mr-sm" />
              学习成就
            </div>
            <div class="row q-gutter-md">
              <div class="col-12 col-sm-6">
                <div class="achievement-item">
                  <div class="text-h3 text-positive">{{ dashboardStats.learning.masteredVocabulary }}</div>
                  <div class="text-caption text-grey-6">已掌握词汇</div>
                  <div class="text-caption text-grey-7">
                    占比 {{ masteredPercentage }}%
                  </div>
                </div>
              </div>
              <div class="col-12 col-sm-6">
                <div class="achievement-item">
                  <div class="text-h3 text-warning">{{ dashboardStats.learning.overdueReviews }}</div>
                  <div class="text-caption text-grey-6">待复习词汇</div>
                  <div class="text-caption text-grey-7">
                    <span v-if="dashboardStats.learning.overdueReviews === 0">全部按时复习！</span>
                    <span v-else>需要加强练习</span>
                  </div>
                </div>
              </div>
              <div class="col-12 col-sm-6">
                <div class="achievement-item">
                  <div class="text-h3 text-info">{{ dashboardStats.learning.currentStreak }}</div>
                  <div class="text-caption text-grey-6">连续天数</div>
                  <div class="text-caption text-grey-7">
                    <span v-if="dashboardStats.learning.currentStreak >= 7">学习达人！</span>
                    <span v-else-if="dashboardStats.learning.currentStreak >= 3">继续保持！</span>
                    <span v-else>开始养成习惯</span>
                  </div>
                </div>
              </div>
              <div class="col-12 col-sm-6">
                <div class="achievement-item">
                  <div class="text-h3" :class="getAccuracyColor()">
                    {{ Math.round(dashboardStats.learning.averageAccuracy) }}%
                  </div>
                  <div class="text-caption text-grey-6">平均正确率</div>
                  <div class="text-caption text-grey-7">
                    <span v-if="dashboardStats.learning.averageAccuracy >= 90">表现优异！</span>
                    <span v-else-if="dashboardStats.learning.averageAccuracy >= 75">表现良好</span>
                    <span v-else>还有提升空间</span>
                  </div>
                </div>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Performance Trends -->
    <div class="row q-gutter-md">
      <div class="col-12">
        <q-card flat bordered>
          <q-card-section>
            <div class="text-subtitle2 q-mb-md flex items-center">
              <q-icon name="trending_up" :color="getTrendIconColor()" class="q-mr-sm" />
              表现趋势
              <q-chip
                :color="getTrendChipColor()"
                :icon="getTrendIcon()"
                :label="getTrendLabel()"
                class="q-ml-sm"
                size="sm"
              />
            </div>

            <div class="row q-gutter-md">
              <div class="col-12 col-md-4">
                <div class="trend-metric">
                  <div class="trend-title">正确率趋势</div>
                  <div class="trend-value" :class="getAccuracyColor()">
                    {{ Math.round(dashboardStats.learning.averageAccuracy) }}%
                  </div>
                  <div class="trend-comparison">
                    <q-icon
                      :name="getTrendIcon()"
                      :color="getTrendIconColor()"
                      size="sm"
                      class="q-mr-xs"
                    />
                    <span :class="`text-${getTrendIconColor()}`">
                      {{ getTrendDescription() }}
                    </span>
                  </div>
                </div>
              </div>

              <div class="col-12 col-md-4">
                <div class="trend-metric">
                  <div class="trend-title">练习频率</div>
                  <div class="trend-value text-primary">
                    {{ getPracticeFrequency() }}
                  </div>
                  <div class="trend-comparison">
                    基于{{ dashboardStats.learning.totalSessions }}次练习
                  </div>
                </div>
              </div>

              <div class="col-12 col-md-4">
                <div class="trend-metric">
                  <div class="trend-title">学习效率</div>
                  <div class="trend-value text-secondary">
                    {{ calculateEfficiency() }}
                  </div>
                  <div class="trend-comparison">
                    每小时掌握词汇数
                  </div>
                </div>
              </div>
            </div>

            <!-- Recommendations -->
            <div class="q-mt-md">
              <q-separator class="q-mb-md" />
              <div class="text-subtitle2 q-mb-sm">学习建议</div>
              <div class="row q-gutter-sm">
                <q-chip
                  v-for="recommendation in getRecommendations()"
                  :key="recommendation.text"
                  :color="recommendation.color"
                  :icon="recommendation.icon"
                  :label="recommendation.text"
                  size="sm"
                />
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
import type { MemoryLevel } from 'src/types/review'

interface Props {
  dashboardStats: DashboardStats
}

const props = defineProps<Props>()

const learningProgress = computed(() => {
  // Calculate overall learning progress based on memory levels and mastery
  const totalVocab = props.dashboardStats.content.totalVocabulary
  if (totalVocab === 0) return 0

  // Weight memory levels more heavily
  const weightedProgress = Object.entries(props.dashboardStats.learning.memoryLevelDistribution)
    .reduce((sum, [level, count]) => {
      const levelNum = parseInt(level) as MemoryLevel
      const weight = levelNum / 7 // Higher levels contribute more
      return sum + (count * weight)
    }, 0)

  return Math.round((weightedProgress / totalVocab) * 100)
})

const masteredPercentage = computed(() => {
  const totalVocab = props.dashboardStats.content.totalVocabulary
  if (totalVocab === 0) return 0
  return Math.round((props.dashboardStats.learning.masteredVocabulary / totalVocab) * 100)
})

function getMemoryLevelColor(level: number): string {
  const colors = [
    '#9E9E9E', // 0 - Grey
    '#FF9800', // 1 - Orange
    '#FFC107', // 2 - Amber
    '#8BC34A', // 3 - Light Green
    '#4CAF50', // 4 - Green
    '#2196F3', // 5 - Blue
    '#3F51B5', // 6 - Indigo
    '#9C27B0'  // 7 - Purple
  ] as const
  return (colors[level] || colors[0]) as string
}

function getMemoryLevelLabel(level: number): string {
  const labels = [
    '未掌握', '初识', '认识', '熟悉', '掌握', '熟练', '精通', '完全掌握'
  ] as const
  return (labels[level] || labels[0]) as string
}

function getAccuracyColor(): string {
  const accuracy = props.dashboardStats.learning.averageAccuracy
  if (accuracy >= 90) return 'text-positive'
  if (accuracy >= 75) return 'text-info'
  if (accuracy >= 60) return 'text-warning'
  return 'text-negative'
}

function getTrendIcon(): string {
  const trend = props.dashboardStats.learning.improvementTrend
  if (trend === 'up') return 'trending_up'
  if (trend === 'down') return 'trending_down'
  return 'trending_flat'
}

function getTrendIconColor(): string {
  const trend = props.dashboardStats.learning.improvementTrend
  if (trend === 'up') return 'positive'
  if (trend === 'down') return 'negative'
  return 'warning'
}

function getTrendChipColor(): string {
  const trend = props.dashboardStats.learning.improvementTrend
  if (trend === 'up') return 'positive'
  if (trend === 'down') return 'negative'
  return 'warning'
}

function getTrendLabel(): string {
  const trend = props.dashboardStats.learning.improvementTrend
  if (trend === 'up') return '进步中'
  if (trend === 'down') return '需加强'
  return '稳定'
}

function getTrendDescription(): string {
  const accuracy = props.dashboardStats.learning.averageAccuracy
  const trend = props.dashboardStats.learning.improvementTrend

  if (trend === 'up') {
    return '表现正在提升'
  } else if (trend === 'down') {
    return '需要更多练习'
  } else {
    return `表现稳定 (${Math.round(accuracy)}%)`
  }
}

function getPracticeFrequency(): string {
  const sessions = props.dashboardStats.learning.totalSessions
  if (sessions === 0) return '无练习记录'
  if (sessions < 5) return '刚开始练习'
  if (sessions < 20) return '定期练习'
  if (sessions < 50) return '频繁练习'
  return '高强度练习'
}

function calculateEfficiency(): string {
  const totalTime = props.dashboardStats.learning.totalPracticeTime
  const mastered = props.dashboardStats.learning.masteredVocabulary

  if (totalTime === 0) return 'N/A'
  const hours = totalTime / 60
  const efficiency = mastered / hours

  if (efficiency >= 10) return '很高'
  if (efficiency >= 5) return '良好'
  if (efficiency >= 2) return '一般'
  return '需改进'
}

function getRecommendations(): Array<{ text: string; icon: string; color: string }> {
  const recommendations = []
  const stats = props.dashboardStats.learning

  if (stats.overdueReviews > 10) {
    recommendations.push({
      text: '增加复习频率',
      icon: 'alarm',
      color: 'warning'
    })
  }

  if (stats.averageAccuracy < 75) {
    recommendations.push({
      text: '加强基础练习',
      icon: 'school',
      color: 'negative'
    })
  }

  if (stats.currentStreak === 0 && stats.totalSessions > 0) {
    recommendations.push({
      text: '保持连续学习',
      icon: 'local_fire_department',
      color: 'info'
    })
  }

  if (props.dashboardStats.learning.masteredVocabulary < props.dashboardStats.content.totalVocabulary * 0.5 && props.dashboardStats.learning.totalSessions > 10) {
    recommendations.push({
      text: '专注掌握核心词汇',
      icon: 'lightbulb',
      color: 'primary'
    })
  }

  if (recommendations.length === 0) {
    recommendations.push({
      text: '学习状态良好！',
      icon: 'thumb_up',
      color: 'positive'
    })
  }

  return recommendations
}
</script>

<style scoped>
.learning-progress {
  margin-bottom: 24px;
}

.memory-level-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px;
  border-radius: 8px;
  background: #f5f5f5;
  transition: transform 0.2s ease;
}

.memory-level-item:hover {
  transform: scale(1.05);
}

.memory-level-indicator {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  font-size: 12px;
  flex-shrink: 0;
}

.memory-level-info {
  display: flex;
  flex-direction: column;
}

.memory-level-count {
  font-weight: 600;
  font-size: 14px;
}

.memory-level-label {
  font-size: 11px;
  color: #666;
}

.achievement-item {
  text-align: center;
  padding: 16px 8px;
}

.trend-metric {
  padding: 16px;
  border-radius: 8px;
  background: #fafafa;
}

.trend-title {
  font-size: 14px;
  color: #666;
  margin-bottom: 8px;
}

.trend-value {
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 4px;
}

.trend-comparison {
  font-size: 12px;
  color: #888;
}

@media (max-width: 600px) {
  .memory-level-item {
    min-width: 120px;
  }

  .achievement-item {
    padding: 12px 4px;
  }

  .trend-metric {
    padding: 12px;
  }
}
</style>