<template>
  <div class="help-section">
    <div class="text-h6 q-mb-md">使用帮助</div>

    <div class="row q-gutter-md">
      <!-- Getting Started -->
      <div class="col-12 col-md-6">
        <q-card flat bordered>
          <q-card-section>
            <div class="text-subtitle2 q-mb-md flex items-center">
              <q-icon name="rocket_launch" color="primary" class="q-mr-sm" />
              快速入门
            </div>
            <div class="help-items">
              <div
                v-for="item in gettingStartedItems"
                :key="item.title"
                class="help-item"
                @click="handleItemClick(item)"
              >
                <q-avatar
                  :color="item.color"
                  text-color="white"
                  :icon="item.icon"
                  size="sm"
                  class="q-mr-md"
                />
                <div class="col">
                  <div class="help-item-title">{{ item.title }}</div>
                  <div class="help-item-description">{{ item.description }}</div>
                </div>
                <q-icon name="open_in_new" color="grey-5" />
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Learning Guide -->
      <div class="col-12 col-md-6">
        <q-card flat bordered>
          <q-card-section>
            <div class="text-subtitle2 q-mb-md flex items-center">
              <q-icon name="school" color="secondary" class="q-mr-sm" />
              学习指南
            </div>
            <div class="help-items">
              <div
                v-for="item in learningGuideItems"
                :key="item.title"
                class="help-item"
                @click="handleItemClick(item)"
              >
                <q-avatar
                  :color="item.color"
                  text-color="white"
                  :icon="item.icon"
                  size="sm"
                  class="q-mr-md"
                />
                <div class="col">
                  <div class="help-item-title">{{ item.title }}</div>
                  <div class="help-item-description">{{ item.description }}</div>
                </div>
                <q-icon name="open_in_new" color="grey-5" />
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Features Overview -->
      <div class="col-12 col-md-6">
        <q-card flat bordered>
          <q-card-section>
            <div class="text-subtitle2 q-mb-md flex items-center">
              <q-icon name="featured_play_list" color="accent" class="q-mr-sm" />
              功能介绍
            </div>
            <div class="help-items">
              <div
                v-for="item in featureItems"
                :key="item.title"
                class="help-item"
                @click="handleItemClick(item)"
              >
                <q-avatar
                  :color="item.color"
                  text-color="white"
                  :icon="item.icon"
                  size="sm"
                  class="q-mr-md"
                />
                <div class="col">
                  <div class="help-item-title">{{ item.title }}</div>
                  <div class="help-item-description">{{ item.description }}</div>
                </div>
                <q-icon name="chevron_right" color="grey-5" />
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Troubleshooting -->
      <div class="col-12 col-md-6">
        <q-card flat bordered>
          <q-card-section>
            <div class="text-subtitle2 q-mb-md flex items-center">
              <q-icon name="help_outline" color="info" class="q-mr-sm" />
              常见问题
            </div>
            <div class="help-items">
              <div
                v-for="item in troubleshootingItems"
                :key="item.title"
                class="help-item"
                @click="handleItemClick(item)"
              >
                <q-avatar
                  :color="item.color"
                  text-color="white"
                  :icon="item.icon"
                  size="sm"
                  class="q-mr-md"
                />
                <div class="col">
                  <div class="help-item-title">{{ item.title }}</div>
                  <div class="help-item-description">{{ item.description }}</div>
                </div>
                <q-icon name="expand_more" color="grey-5" />
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Quick Tips -->
    <div class="row q-gutter-md q-mt-lg">
      <div class="col-12">
        <q-card flat bordered class="bg-blue-1">
          <q-card-section>
            <div class="text-subtitle2 q-mb-md flex items-center">
              <q-icon name="tips_and_updates" color="blue" class="q-mr-sm" />
              使用小贴士
            </div>
            <div class="row q-gutter-md">
              <div class="col-12 col-sm-6 col-md-3" v-for="tip in tips" :key="tip.text">
                <div class="tip-item">
                  <q-icon :name="tip.icon" :color="tip.color" class="q-mb-sm" size="md" />
                  <div class="tip-text">{{ tip.text }}</div>
                </div>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Contact & Support -->
    <div class="row q-gutter-md q-mt-md">
      <div class="col-12">
        <q-card flat bordered>
          <q-card-section class="row items-center justify-between">
            <div class="row items-center q-gutter-md">
              <q-icon name="support_agent" color="primary" size="md" />
              <div>
                <div class="text-subtitle1">需要帮助？</div>
                <div class="text-caption text-grey-6">
                  查看详细文档或联系我们获取支持
                </div>
              </div>
            </div>
            <div class="row q-gutter-sm">
              <q-btn
                flat
                color="primary"
                label="查看文档"
                icon="menu_book"
                @click="openDocumentation"
              />
              <q-btn
                flat
                color="secondary"
                label="用户手册"
                icon="description"
                @click="openUserManual"
              />
              <q-btn
                outline
                color="accent"
                label="视频教程"
                icon="smart_display"
                @click="openVideoTutorial"
              />
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Help Dialog -->
    <q-dialog v-model="showHelpDialog" persistent>
      <q-card style="min-width: 600px; max-width: 800px;">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">{{ selectedHelpItem?.title }}</div>
          <q-space />
          <q-btn flat round dense icon="close" @click="showHelpDialog = false" />
        </q-card-section>

        <q-separator />

        <q-card-section class="scroll" style="max-height: 60vh;">
          <div v-if="selectedHelpItem">
            <div v-html="selectedHelpItem.content"></div>
          </div>
        </q-card-section>

        <q-separator />

        <q-card-actions align="right">
          <q-btn flat label="关闭" @click="showHelpDialog = false" />
          <q-btn
            v-if="selectedHelpItem?.action"
            color="primary"
            :label="selectedHelpItem.actionLabel || '了解更多'"
            @click="executeHelpAction"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import type { HelpItem } from 'src/types/dashboard'

const router = useRouter()
const showHelpDialog = ref(false)
const selectedHelpItem = ref<HelpItem | null>(null)

const gettingStartedItems = [
  {
    title: '首次使用',
    description: '了解如何创建第一个学习单元并开始练习',
    icon: 'play_arrow',
    color: 'primary',
    link: '/getting-started',
    content: `
      <h3>欢迎使用听写练习系统！</h3>
      <p>首次使用请按照以下步骤：</p>
      <ol>
        <li>创建学习单元：点击"单元管理"创建您的第一个学习单元</li>
        <li>添加词汇：在单元中添加需要学习的中文和英文词汇</li>
        <li>开始练习：点击"开始听写"进行听写练习</li>
        <li>查看结果：练习完成后查看正确率并进行复习</li>
      </ol>
      <p>建议每天练习15-30分钟，效果最佳！</p>
    `
  },
  {
    title: '音频设置',
    description: '配置音频播放选项和录音设置',
    icon: 'settings_voice',
    color: 'secondary',
    link: '/audio-settings',
    content: `
      <h3>音频设置指南</h3>
      <p>系统支持两种音频模式：</p>
      <ul>
        <li><strong>语音合成(TTS)</strong>：系统自动生成语音，无需额外设置</li>
        <li><strong>录音模式</strong>：录制自己的语音，更个性化</li>
      </ul>
      <p>建议初次使用时先尝试TTS模式，熟悉后可切换到录音模式。</p>
    `
  },
  {
    title: '复习系统',
    description: '了解艾宾浩斯遗忘曲线复习方法',
    icon: 'psychology',
    color: 'accent',
    link: '/review-system',
    content: `
      <h3>复习系统介绍</h3>
      <p>本系统采用艾宾浩斯遗忘曲线，科学安排复习：</p>
      <ul>
        <li>听写出错的词汇自动加入复习库</li>
        <li>系统智能计算最佳复习时间</li>
        <li>记忆水平从0-7级，掌握程度递增</li>
        <li>定期复习巩固学习效果</li>
      </ul>
    `
  }
]

const learningGuideItems = [
  {
    title: '最佳学习习惯',
    description: '建立有效的学习方法和时间安排',
    icon: 'schedule',
    color: 'primary',
    link: '/learning-habits',
    content: `
      <h3>培养良好学习习惯</h3>
      <p><strong>时间安排：</strong></p>
      <ul>
        <li>每天固定时间练习，建立学习节奏</li>
        <li>每次15-30分钟，避免过度疲劳</li>
        <li>早上记忆效果最佳，晚上适合复习</li>
      </ul>
      <p><strong>学习方法：</strong></p>
      <ul>
        <li>先听后写，专注理解</li>
        <li>及时复习，加深记忆</li>
        <li>循序渐进，逐步提升</li>
      </ul>
    `
  },
  {
    title: '词汇选择策略',
    description: '如何选择合适的词汇进行学习',
    icon: 'lightbulb',
    color: 'secondary',
    link: '/vocabulary-strategy',
    content: `
      <h3>词汇选择策略</h3>
      <p><strong>初学者建议：</strong></p>
      <ul>
        <li>从常用词汇开始，如日常用语</li>
        <li>中文英文词汇配对学习</li>
        <li>单个单元20-50个词汇为宜</li>
      </ul>
      <p><strong>进阶学习者：</strong></p>
      <ul>
        <li>按主题分类，如职业词汇</li>
        <li>学习同义词、反义词组</li>
        <li>包含成语、俗语等高级内容</li>
      </ul>
    `
  },
  {
    title: '记忆技巧',
    description: '提升词汇记忆的有效方法',
    icon: 'psychology',
    color: 'info',
    link: '/memory-techniques',
    content: `
      <h3>有效记忆技巧</h3>
      <p><strong>关联记忆：</strong></p>
      <ul>
        <li>联想图像场景</li>
        <li>建立词汇网络</li>
        <li>创造记忆口诀</li>
      </ul>
      <p><strong>重复练习：</strong></p>
      <ul>
        <li>分时段复习</li>
        <li>多种感官参与</li>
        <li>间隔时间递增</li>
      </ul>
    `
  }
]

const featureItems = [
  {
    title: '单元管理',
    description: '创建、编辑和管理学习单元',
    icon: 'category',
    color: 'primary',
    link: '/units',
    content: `
      <h3>单元管理功能</h3>
      <p>单元管理帮助您组织学习内容：</p>
      <ul>
        <li><strong>创建单元</strong>：为不同主题创建独立单元</li>
        <li><strong>添加词汇</strong>：在每个单元中添加中英文词汇</li>
        <li><strong>标签分类</strong>：使用标签组织单元，便于查找</li>
        <li><strong>导入导出</strong>：支持数据的导入导出</li>
      </ul>
    `
  },
  {
    title: '听写练习',
    description: '核心功能，提供专业的听写训练',
    icon: 'record_voice_over',
    color: 'secondary',
    link: '/dictation',
    content: `
      <h3>听写练习功能</h3>
      <p>听写练习是系统的核心功能：</p>
      <ul>
        <li><strong>音频播放</strong>：TTS或录音播放</li>
        <li><strong>间隔控制</strong>：可调节播放间隔</li>
        <li><strong>实时反馈</strong>：即时显示正确率</li>
        <li><strong>结果统计</strong>：详细的练习报告</li>
      </ul>
    `
  },
  {
    title: '智能复习',
    description: '基于遗忘曲线的科学复习系统',
    icon: 'autorenew',
    color: 'accent',
    link: '/review',
    content: `
      <h3>智能复习系统</h3>
      <p>基于科学记忆原理的复习功能：</p>
      <ul>
        <li><strong>自动收集</strong>：听写错误词汇自动加入</li>
        <li><strong>智能调度</strong>：根据遗忘曲线安排复习</li>
        <li><strong>记忆跟踪</strong>：0-7级记忆水平追踪</li>
        <li><strong>效果评估</strong>：实时评估学习效果</li>
      </ul>
    `
  },
  {
    title: '数据分析',
    description: '全面的学习数据统计和分析',
    icon: 'analytics',
    color: 'info',
    link: '/analytics',
    content: `
      <h3>数据分析功能</h3>
      <p>详细的学习数据统计：</p>
      <ul>
        <li><strong>学习进度</strong>：词汇掌握程度统计</li>
        <li><strong>正确率分析</strong>：历史正确率趋势</li>
        <li><strong>时间统计</strong>：学习时长和频率分析</li>
        <li><strong>效果评估</strong>：学习效果量化分析</li>
      </ul>
    `
  }
]

const troubleshootingItems = [
  {
    title: '音频无法播放',
    description: '解决音频播放问题的常见方法',
    icon: 'volume_up',
    color: 'warning',
    content: `
      <h3>音频播放问题解决</h3>
      <p><strong>检查项目：</strong></p>
      <ul>
        <li>设备音量是否开启</li>
        <li>浏览器是否允许音频播放</li>
        <li>网络连接是否正常</li>
        <li>是否选择正确的音频模式</li>
      </ul>
      <p><strong>解决方法：</strong></p>
      <ul>
        <li>刷新页面重试</li>
        <li>切换到TTS模式</li>
        <li>检查设备音频权限</li>
        <li>更换浏览器尝试</li>
      </ul>
    `
  },
  {
    title: '录音质量问题',
    description: '提高录音质量的设置建议',
    icon: 'mic',
    color: 'secondary',
    content: `
      <h3>录音质量问题解决</h3>
      <p><strong>提升录音质量：</strong></p>
      <ul>
        <li>使用优质麦克风</li>
        <li>保持环境安静</li>
        <li>距离麦克风适当距离</li>
        <li>发音清晰标准</li>
      </ul>
      <p><strong>设备检查：</strong></p>
      <ul>
        <li>测试麦克风权限</li>
        <li>检查输入设备</li>
        <li>调整音量增益</li>
        <li>减少环境噪音</li>
      </ul>
    `
  },
  {
    title: '同步问题',
    description: '数据同步异常的处理方法',
    icon: 'sync',
    color: 'info',
    content: `
      <h3>数据同步问题</h3>
      <p><strong>常见原因：</strong></p>
      <ul>
        <li>浏览器缓存问题</li>
        <li>网络连接异常</li>
        <li>浏览器存储限制</li>
        <li>并发访问冲突</li>
      </ul>
      <p><strong>解决方案：</strong></p>
      <ul>
        <li>清除浏览器缓存</li>
        <li>检查网络连接</li>
        <li>重启浏览器</li>
        <li>导出数据备份</li>
      </ul>
    `
  },
  {
    title: '性能优化',
    description: '提升系统运行速度的建议',
    icon: 'speed',
    color: 'primary',
    content: `
      <h3>性能优化建议</h3>
      <p><strong>数据库优化：</strong></p>
      <ul>
        <li>定期清理历史记录</li>
        <li>删除不需要的单元</li>
        <li>导出数据后清理</li>
        <li>避免单元过大</li>
      </ul>
      <p><strong>系统优化：</strong></p>
      <ul>
        <li>关闭其他标签页</li>
        <li>定期重启浏览器</li>
        <li>清理浏览器缓存</li>
        <li>使用现代浏览器</li>
      </ul>
    `
  }
]

const tips = [
  {
    text: '每天练习比偶尔长时间学习更有效',
    icon: 'timer',
    color: 'blue'
  },
  {
    text: '听写错误是正常的，及时复习能大幅提升记忆',
    icon: 'psychology',
    color: 'green'
  },
  {
    text: '设置合适的播放间隔，给大脑充分时间处理',
    icon: 'schedule',
    color: 'orange'
  },
  {
    text: '录音模式比TTS更能加深记忆印象',
    icon: 'mic',
    color: 'purple'
  }
]

function handleItemClick(item: HelpItem): void {
  selectedHelpItem.value = item
  showHelpDialog.value = true
}

function executeHelpAction(): void {
  if (selectedHelpItem.value?.link) {
    // Handle internal routing
    if (selectedHelpItem.value.link.startsWith('/')) {
      void router.push(selectedHelpItem.value.link)
      showHelpDialog.value = false
      return
    }
  }

  if (selectedHelpItem.value?.action) {
    selectedHelpItem.value.action()
    showHelpDialog.value = false
  }
}

function openDocumentation(): void {
  // Open documentation in new tab or navigate
  window.open('#', '_blank')
}

function openUserManual(): void {
  // Open user manual
  window.open('#', '_blank')
}

function openVideoTutorial(): void {
  // Open video tutorial
  window.open('#', '_blank')
}
</script>

<style scoped>
.help-section {
  margin-bottom: 24px;
}

.help-items {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.help-item {
  display: flex;
  align-items: center;
  padding: 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  background: #fafafa;
}

.help-item:hover {
  background: #f0f0f0;
  transform: translateX(4px);
}

.help-item-title {
  font-weight: 500;
  font-size: 14px;
  margin-bottom: 4px;
}

.help-item-description {
  font-size: 12px;
  color: #666;
}

.tip-item {
  text-align: center;
  padding: 16px;
  background: white;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
}

.tip-text {
  font-size: 13px;
  margin-top: 8px;
  line-height: 1.4;
}

.scroll {
  max-height: 60vh;
  overflow-y: auto;
}

.scroll::-webkit-scrollbar {
  width: 6px;
}

.scroll::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.scroll::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.scroll::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

@media (max-width: 600px) {
  .help-item {
    padding: 8px;
  }

  .tip-item {
    padding: 12px;
  }

  .tip-text {
    font-size: 12px;
  }
}
</style>