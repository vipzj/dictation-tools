<template>
  <div class="quick-actions">
    <div class="text-h6 q-mb-md">快速操作</div>

    <div class="row q-gutter-md">
      <div class="col-12 col-sm-6 col-md-4" v-for="action in actions" :key="action.route">
        <q-card
          flat
          bordered
          class="action-card cursor-pointer"
          clickable
          @click="handleActionClick(action)"
        >
          <q-card-section class="row items-center q-pa-md">
            <q-avatar
              :color="action.color"
              text-color="white"
              :icon="action.icon"
              size="lg"
              class="q-mr-md"
            >
              <q-badge
                v-if="action.badge"
                :color="action.badgeColor || 'negative'"
                floating
                :label="action.badge"
              />
            </q-avatar>
            <div class="col">
              <div class="text-h6">{{ action.title }}</div>
              <div class="text-caption text-grey-6">{{ action.description }}</div>
            </div>
            <q-icon name="chevron_right" color="grey-5" />
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Secondary Actions -->
    <div class="row q-gutter-md q-mt-md">
      <div class="col-12">
        <q-card flat bordered>
          <q-card-section class="row items-center justify-between">
            <div class="row items-center q-gutter-md">
              <q-icon name="history" color="grey-6" size="md" />
              <div>
                <div class="text-subtitle1">查看历史记录</div>
                <div class="text-caption text-grey-6">听写和复习的详细历史数据</div>
              </div>
            </div>
            <div class="row q-gutter-sm">
              <q-btn
                flat
                color="primary"
                label="听写历史"
                icon="history_edu"
                @click="$router.push({ name: 'dictation-history' })"
              />
              <q-btn
                flat
                color="secondary"
                label="复习历史"
                icon="psychology"
                @click="$router.push({ name: 'review-history' })"
              />
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Management Actions -->
    <div class="row q-gutter-md q-mt-md">
      <div class="col-12">
        <q-card flat bordered>
          <q-card-section class="row items-center justify-between">
            <div class="row items-center q-gutter-md">
              <q-icon name="settings" color="grey-6" size="md" />
              <div>
                <div class="text-subtitle1">内容管理</div>
                <div class="text-caption text-grey-6">管理学习单元、词汇和标签</div>
              </div>
            </div>
            <div class="row q-gutter-sm">
              <q-btn
                flat
                color="accent"
                label="单元管理"
                icon="category"
                @click="$router.push({ name: 'units' })"
              />
              <q-btn
                flat
                color="info"
                label="标签管理"
                icon="label"
                @click="$router.push({ name: 'tags' })"
              />
              <q-btn
                flat
                color="warning"
                label="系统设置"
                icon="settings"
                @click="$router.push({ name: 'settings' })"
              />
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import type { DashboardStats } from 'src/types/dashboard'
import type { QuickAction } from 'src/types/dashboard'

interface Props {
  dashboardStats: DashboardStats
}

const props = defineProps<Props>()
const router = useRouter()

const actions = computed<QuickAction[]>(() => [
  {
    title: '开始听写',
    description: '进行新的听写练习',
    icon: 'record_voice_over',
    color: 'primary',
    route: 'dictation',
    badge: 0,
    badgeColor: 'primary'
  },
  {
    title: '开始复习',
    description: '复习需要加强的词汇',
    icon: 'psychology',
    color: 'secondary',
    route: 'review',
    badge: props.dashboardStats.learning.overdueReviews > 0 ? props.dashboardStats.learning.overdueReviews : 0,
    badgeColor: props.dashboardStats.learning.overdueReviews > 10 ? 'negative' : 'warning'
  },
  {
    title: '单元练习',
    description: '选择特定单元进行练习',
    icon: 'menu_book',
    color: 'accent',
    route: 'units',
    badge: 0,
    badgeColor: 'accent'
  }
])

function handleActionClick(action: QuickAction): void {
  if (action.route) {
    void router.push({ name: action.route })
  }

  if (action.action) {
    action.action()
  }
}
</script>

<style scoped>
.quick-actions {
  margin-bottom: 24px;
}

.action-card {
  transition: all 0.3s ease;
  height: 100%;
}

.action-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.action-card:active {
  transform: translateY(0);
}

@media (max-width: 600px) {
  .action-card {
    margin-bottom: 8px;
  }
}

/* Ensure consistent height for cards */
.action-card .q-card-section {
  min-height: 80px;
}
</style>