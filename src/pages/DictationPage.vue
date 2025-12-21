<template>
  <q-page padding>
    <div class="row q-gutter-md">
      <div class="col-12">
        <div class="text-h4 q-mb-md">听写练习</div>
        <div class="text-subtitle1 q-mb-lg">选择一个单元开始听写练习</div>
      </div>

      <!-- Search and Filter Controls -->
      <div class="col-12">
        <q-card flat bordered>
          <q-card-section class="row q-gutter-md items-center">
            <div class="col-12 col-md-6">
              <q-input
                v-model="searchQuery"
                label="搜索单元名称"
                outlined
                clearable
                debounce="300"
              >
                <template v-slot:prepend>
                  <q-icon name="search" />
                </template>
              </q-input>
            </div>
            <div class="col-12 col-md-6">
              <q-select
                v-model="selectedTagIds"
                :options="tagOptions"
                label="按标签筛选"
                outlined
                clearable
                multiple
                emit-value
                map-options
                use-chips
              >
                <template v-slot:prepend>
                  <q-icon name="label" />
                </template>
              </q-select>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="col-12 text-center">
        <q-spinner-dots size="40px" color="primary" />
        <div class="q-mt-sm">加载中...</div>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="col-12">
        <q-banner class="bg-negative text-white">
          <template v-slot:avatar>
            <q-icon name="error" />
          </template>
          {{ error }}
          <template v-slot:action>
            <q-btn flat label="重试" @click="loadUnits" />
          </template>
        </q-banner>
      </div>

      <!-- Empty State -->
      <div v-else-if="filteredUnits.length === 0" class="col-12 text-center">
        <div class="text-h6 text-grey-7 q-mb-md">
          {{ searchQuery || selectedTagIds?.length ? '没有找到匹配的单元' : '还没有创建任何单元' }}
        </div>
        <q-btn
          v-if="!searchQuery && !selectedTagIds?.length"
          color="primary"
          label="创建单元"
          :to="{ name: 'units' }"
        />
      </div>

      <!-- Units Grid -->
      <div v-else class="col-12">
        <div class="row q-gutter-md">
          <div
            v-for="unit in filteredUnits"
            :key="unit.id"
            class="col-12 col-sm-6 col-md-4 col-lg-3"
          >
            <q-card
              class="unit-card cursor-pointer"
              flat
              bordered
              @click="openDictationDialog(unit)"
            >
              <q-card-section>
                <div class="text-h6">{{ unit.name }}</div>
                <div class="text-subtitle2 text-grey-6 q-mb-sm">
                  {{ unit.vocabularyCount }} 个词汇
                </div>
                <div class="row q-gutter-xs">
                  <q-chip
                    v-for="tag in unit.tags"
                    :key="tag.id"
                    :style="{ backgroundColor: tag.color + '20', color: tag.color }"
                    size="sm"
                    text-color="black"
                  >
                    {{ tag.name }}
                  </q-chip>
                </div>
              </q-card-section>
              <q-card-section class="q-pt-none">
                <div class="text-caption text-grey-7">
                  {{ unit.chineseCount }} 中文 · {{ unit.englishCount }} English
                </div>
              </q-card-section>
            </q-card>
          </div>
        </div>
      </div>
    </div>

    <!-- Dictation Dialog -->
    <DictationDialog
      v-model="showDictationDialog"
      :unit="selectedUnit"
      @start="startDictation"
    />

    <!-- Dictation Practice Dialog -->
    <DictationPracticeDialog
      v-model="showPracticeDialog"
      :session-id="currentSessionId"
      @complete="onDictationComplete"
    />

    <!-- Dictation Results Dialog -->
    <DictationResultsDialog
      v-model="showResultsDialog"
      :session-id="completedSessionId"
      @saved="onResultsSaved"
    />
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { unitService, vocabularyService, unitTagService } from '../services/indexeddb'
import { tagService } from '../services/indexeddb'
import type { UnitWithVocabularyCount } from '../types/unit'
import type { Tag } from '../types/tag'
import DictationDialog from '../components/DictationDialog.vue'
import DictationPracticeDialog from '../components/DictationPracticeDialog.vue'
import DictationResultsDialog from '../components/DictationResultsDialog.vue'

// State
const loading = ref(false)
const error = ref<string | null>(null)
const searchQuery = ref('')
const selectedTagIds = ref<string[]>([])

// Dialog states
const showDictationDialog = ref(false)
const showPracticeDialog = ref(false)
const showResultsDialog = ref(false)

// Selected data
const selectedUnit = ref<UnitWithVocabularyCount | null>(null)
const currentSessionId = ref<string | null>(null)
const completedSessionId = ref<string | null>(null)

// Data
const units = ref<UnitWithVocabularyCount[]>([])
const tags = ref<Tag[]>([])

// Computed
const tagOptions = computed(() => {
  return tags.value.map(tag => ({
    label: tag.name,
    value: tag.id
  }))
})

const filteredUnits = computed(() => {
  let filtered = units.value

  // Filter by search query
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(unit =>
      unit.name.toLowerCase().includes(query)
    )
  }

  // Filter by selected tags
  if (selectedTagIds.value.length > 0) {
    filtered = filtered.filter(unit =>
      selectedTagIds.value.every(tagId =>
        unit.tags.some(tag => tag.id === tagId)
      )
    )
  }

  return filtered
})

// Methods
const loadUnits = async () => {
  try {
    loading.value = true
    error.value = null

    // Load all units
    const allUnits = await unitService.getAllUnits()

    // Enrich units with vocabulary counts and tags
    const unitsWithDetails = await Promise.all(
      allUnits.map(async (unit) => {
        const [vocabularyCount, unitTags] = await Promise.all([
          vocabularyService.getVocabularyCountByUnit(unit.id),
          unitTagService.getUnitTags(unit.id)
        ])

        const vocabularyItems = await vocabularyService.getVocabularyItemsByUnit(unit.id)
        const chineseCount = vocabularyItems.filter(item => item.type === 'chinese').length
        const englishCount = vocabularyItems.filter(item => item.type === 'english').length

        return {
          ...unit,
          vocabularyCount: vocabularyCount.total,
          chineseCount,
          englishCount,
          tags: unitTags
        }
      })
    )

    units.value = unitsWithDetails
  } catch (err) {
    console.error('Failed to load units:', err)

    // Handle database schema errors specifically
    if (err instanceof Error && err.message.includes('schema')) {
      error.value = '数据库架构需要更新，请刷新页面'
    } else {
      error.value = '加载单元失败，请重试'
    }
  } finally {
    loading.value = false
  }
}

const loadTags = async () => {
  try {
    tags.value = await tagService.getAllTags()
  } catch (err) {
    console.error('Failed to load tags:', err)
  }
}

const openDictationDialog = (unit: UnitWithVocabularyCount) => {
  selectedUnit.value = unit
  showDictationDialog.value = true
}

const startDictation = (sessionId: string) => {
  currentSessionId.value = sessionId
  showDictationDialog.value = false
  showPracticeDialog.value = true
}

const onDictationComplete = (sessionId: string) => {
  completedSessionId.value = sessionId
  showPracticeDialog.value = false
  showResultsDialog.value = true
}

const onResultsSaved = () => {
  showResultsDialog.value = false
  // Refresh units to update any stats if needed
  void loadUnits()
}

// Lifecycle
onMounted(() => {
  void Promise.all([
    loadUnits(),
    loadTags()
  ])
})
</script>

<style scoped>
.unit-card {
  transition: all 0.3s ease;
}

.unit-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}
</style>