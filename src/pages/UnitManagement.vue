<template>
  <q-page class="q-pa-md">
    <!-- Page Header -->
    <div class="row q-mb-md">
      <div class="col-12">
        <div class="text-h4 text-weight-bold q-mb-md">{{ $t('unitManagement.title') }}</div>
        <div class="text-subtitle1 text-grey-7 q-mb-lg">
          {{ $t('unitManagement.description') }}
        </div>
      </div>
    </div>

    <!-- Search and Filter Controls -->
    <div class="row q-gutter-md q-mb-lg">
      <div class="col-12 col-md-6">
        <q-input
          v-model="searchQuery"
          outlined
          debounce="300"
          :placeholder="$t('unitManagement.searchPlaceholder')"
          clearable
          @update:model-value="handleSearch"
        >
          <template v-slot:prepend>
            <q-icon name="search" />
          </template>
        </q-input>
      </div>

      <div class="col-12 col-md-6">
        <q-select
          v-model="selectedTagIds"
          outlined
          multiple
          :options="tagOptions"
          option-value="id"
          option-label="name"
          clearable
          :placeholder="$t('unitManagement.filterByTags')"
          emit-value
          map-options
          @update:model-value="handleTagFilter"
        >
          <template v-slot:option="{ itemProps, opt }">
            <q-item v-bind="itemProps">
              <q-item-section>
                <q-item-label>{{ opt.name }}</q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-chip :style="{ backgroundColor: opt.color, color: 'white' }" size="sm" />
              </q-item-section>
            </q-item>
          </template>
        </q-select>
      </div>
    </div>

    <!-- Units Grid -->
    <div class="row q-gutter-md">
      <div v-for="unit in filteredUnits" :key="unit.id" class="col-12 col-sm-6 col-md-4">
        <q-card flat bordered class="unit-card cursor-pointer" @click="openUnit(unit)">
          <q-card-section>
            <!-- Header with title and action buttons -->
            <div class="row items-center justify-between q-mb-sm">
              <div class="col">
                <div class="text-h6 text-weight-bold">
                  {{ unit.name }}
                </div>
              </div>
              <div class="col-auto">
                <q-btn
                  flat
                  color="primary"
                  icon="edit"
                  size="sm"
                  round
                  @click.stop="editUnit(unit)"
                >
                  <q-tooltip>{{ $t('unitManagement.editTooltip') }}</q-tooltip>
                </q-btn>
                <q-btn
                  flat
                  color="negative"
                  icon="delete"
                  size="sm"
                  round
                  @click.stop="deleteUnit(unit)"
                >
                  <q-tooltip>{{ $t('unitManagement.deleteTooltip') }}</q-tooltip>
                </q-btn>
              </div>
            </div>

            <div class="row q-gutter-sm q-mb-md">
              <div class="col-auto">
                <q-chip
                  color="primary"
                  text-color="white"
                  icon="school"
                  :label="`${unit.vocabularyCount} ${$t('unitManagement.totalWords')}`"
                  size="sm"
                />
              </div>
              <div class="col-auto">
                <q-chip
                  color="red"
                  text-color="white"
                  icon="translate"
                  :label="`${unit.chineseCount} ${$t('unitManagement.chineseWords')}`"
                  size="sm"
                />
              </div>
              <div class="col-auto">
                <q-chip
                  color="blue"
                  text-color="white"
                  icon="language"
                  :label="`${unit.englishCount} ${$t('unitManagement.englishTerms')}`"
                  size="sm"
                />
              </div>
            </div>

            <div v-if="unit.tags.length > 0" class="q-mb-sm">
              <q-chip
                v-for="tag in unit.tags"
                :key="tag.id"
                :style="{ backgroundColor: tag.color, color: 'white' }"
                size="sm"
                class="q-mr-xs"
              >
                {{ tag.name }}
              </q-chip>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Empty State -->
      <div v-if="filteredUnits.length === 0" class="col-12 text-center">
        <div class="text-h5 text-grey-6 q-mb-md">
          {{ searchQuery || selectedTagIds.length > 0 ? $t('unitManagement.noUnitsFound') : $t('unitManagement.noUnits') }}
        </div>
        <div class="text-body1 text-grey-5">
          {{
            searchQuery || selectedTagIds.length > 0
              ? $t('unitManagement.tryAdjustingFilters')
              : $t('unitManagement.createFirstUnit')
          }}
        </div>
      </div>
    </div>

    <!-- Floating Action Button -->
    <q-page-sticky position="bottom-right" :offset="[18, 18]">
      <q-btn fab color="primary" icon="add" @click="createUnit">
        <q-tooltip>{{ $t('unitManagement.createUnit') }}</q-tooltip>
      </q-btn>
    </q-page-sticky>

    <!-- Unit Form Dialog -->
    <UnitForm
      v-model="showUnitForm"
      :unit="selectedUnit"
      @save="handleUnitSave"
      @cancel="handleUnitCancel"
    />

    <!-- Delete Confirmation Dialog -->
    <q-dialog v-model="showDeleteDialog" persistent>
      <q-card>
        <q-card-section class="row items-center">
          <q-avatar icon="delete" color="negative" text-color="white" />
          <div class="q-ml-sm">
            <div class="text-h6">{{ $t('unitManagement.deleteUnit') }}</div>
          </div>
        </q-card-section>

        <q-card-section v-if="unitToDelete">
          {{ $t('unitManagement.deleteUnitConfirmation', { name: unitToDelete.name }) }}
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat :label="$t('common.cancel')" color="primary" v-close-popup />
          <q-btn flat :label="$t('common.delete')" color="negative" @click="confirmDelete" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Vocabulary Management Dialog -->
    <VocabularyEditor
      v-model="showVocabularyEditor"
      :unit="selectedUnit"
      @close="closeVocabularyEditor"
    />
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useQuasar } from 'quasar';
import { unitService, tagService, unitTagService, vocabularyService } from 'src/services/indexeddb';
import type { Unit, UnitWithVocabularyCount } from 'src/types/unit';
import type { Tag } from 'src/types/tag';
import UnitForm from 'src/components/UnitForm.vue';
import VocabularyEditor from 'src/components/VocabularyEditor.vue';

// Define component name for ESLint
defineOptions({
  name: 'UnitManagementPage',
});

const $q = useQuasar();

// Reactive data
const units = ref<Unit[]>([]);
const tags = ref<Tag[]>([]);
const searchQuery = ref('');
const selectedTagIds = ref<string[]>([]);
const showUnitForm = ref(false);
const showDeleteDialog = ref(false);
const showVocabularyEditor = ref(false);
const selectedUnit = ref<Unit | null>(null);
const unitToDelete = ref<Unit | null>(null);

// Computed properties
const tagOptions = computed(() => tags.value);

const filteredUnits = computed(() => {
  if (searchQuery.value.trim() === '' && selectedTagIds.value.length === 0) {
    return unitsWithCounts.value;
  }
  return unitsWithCounts.value.filter((unit) => {
    const matchesSearch = unit.name.toLowerCase().includes(searchQuery.value.toLowerCase());
    const matchesTags =
      selectedTagIds.value.length === 0 ||
      selectedTagIds.value.every((tagId) => unit.tags.some((tag) => tag.id === tagId));
    return matchesSearch && matchesTags;
  });
});

const unitsWithCounts = computed((): UnitWithVocabularyCount[] => {
  return units.value.map((unit) => {
    // The loadUnits function enriches units with count data and tags
    // Type assertion to access properties that are added during enrichment
    const enrichedUnit = unit as Unit & {
      vocabularyCount?: number;
      chineseCount?: number;
      englishCount?: number;
      tags?: { id: string; name: string; color: string }[];
    };

    return {
      id: unit.id,
      name: unit.name,
      createdAt: unit.createdAt,
      updatedAt: unit.updatedAt,
      vocabularyCount: enrichedUnit.vocabularyCount || 0,
      chineseCount: enrichedUnit.chineseCount || 0,
      englishCount: enrichedUnit.englishCount || 0,
      tags: enrichedUnit.tags || [],
    };
  });
});

// Methods
async function loadUnits() {
  try {
    units.value = await unitService.getAllUnits();

    // Load vocabulary counts and tags for each unit
    const enrichedUnits = await Promise.all(
      units.value.map(async (unit) => {
        const [counts, unitTags] = await Promise.all([
          vocabularyService.getVocabularyCountByUnit(unit.id),
          unitTagService.getUnitTags(unit.id),
        ]);

        return {
          ...unit,
          vocabularyCount: counts.total,
          chineseCount: counts.chinese,
          englishCount: counts.english,
          tags: unitTags,
        };
      }),
    );

    units.value = enrichedUnits;
  } catch (error) {
    console.error('Failed to load units:', error);
    $q.notify({
      type: 'negative',
      message: 'Failed to load units',
      icon: 'error',
    });
  }
}

async function loadTags() {
  try {
    tags.value = await tagService.getAllTags();
  } catch (error) {
    console.error('Failed to load tags:', error);
  }
}

function handleSearch() {
  // Search is handled by computed property
}

function handleTagFilter() {
  // Filter is handled by computed property
}

function createUnit() {
  selectedUnit.value = null;
  showUnitForm.value = true;
}

function editUnit(unit: Unit) {
  selectedUnit.value = unit;
  showUnitForm.value = true;
}

function openUnit(unit: UnitWithVocabularyCount) {
  selectedUnit.value = unit as Unit;
  showVocabularyEditor.value = true;
}

function deleteUnit(unit: Unit) {
  unitToDelete.value = unit;
  showDeleteDialog.value = true;
}

async function confirmDelete() {
  if (!unitToDelete.value) return;

  try {
    await unitService.deleteUnit(unitToDelete.value.id);

    $q.notify({
      type: 'positive',
      message: `Unit "${unitToDelete.value.name}" deleted successfully`,
      icon: 'delete',
    });

    await loadUnits();
  } catch (error) {
    console.error('Failed to delete unit:', error);
    $q.notify({
      type: 'negative',
      message: 'Failed to delete unit',
      icon: 'error',
    });
  } finally {
    unitToDelete.value = null;
    showDeleteDialog.value = false;
  }
}

async function handleUnitSave(unitData: { name: string; tagIds?: string[] }) {
  try {
    if (selectedUnit.value) {
      // Update existing unit
      await unitService.updateUnit(selectedUnit.value.id, { name: unitData.name });

      // Update tag associations
      if (unitData.tagIds !== undefined) {
        await unitTagService.setUnitTags(selectedUnit.value.id, unitData.tagIds);
      }

      $q.notify({
        type: 'positive',
        message: `Unit "${unitData.name}" updated successfully`,
        icon: 'save',
      });
    } else {
      // Create new unit
      const newUnit = await unitService.createUnit({ name: unitData.name });

      // Set tag associations
      if (unitData.tagIds && unitData.tagIds.length > 0) {
        await unitTagService.setUnitTags(newUnit.id, unitData.tagIds);
      }

      $q.notify({
        type: 'positive',
        message: `Unit "${unitData.name}" created successfully`,
        icon: 'add',
      });
    }

    await loadUnits();
    showUnitForm.value = false;
  } catch (error) {
    console.error('Failed to save unit:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';

    $q.notify({
      type: 'negative',
      message: `Failed to save unit: ${errorMessage}`,
      icon: 'error',
      timeout: 5000,
      actions: [
        {
          label: 'Retry',
          color: 'primary',
          handler: () => {
            // Auto retry the save operation
            void handleUnitSave(unitData);
          },
        },
      ],
    });
  }
}

function handleUnitCancel() {
  showUnitForm.value = false;
  selectedUnit.value = null;
}

function closeVocabularyEditor() {
  showVocabularyEditor.value = false;
  selectedUnit.value = null;
  void loadUnits(); // Refresh units to update vocabulary counts
}

onMounted(() => {
  void loadUnits();
  void loadTags();
});
</script>

<style scoped>
.unit-card {
  transition: transform 0.2s ease;
}

.unit-card:hover {
  transform: translateY(-2px);
}

@media (max-width: 600px) {
  .q-gutter-md > div {
    margin-bottom: 16px;
  }
}
</style>
