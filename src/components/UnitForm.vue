<template>
  <q-dialog v-model="isOpen" persistent maximized>
    <q-card>
      <q-card-section class="row items-center q-pb-none">
        <div class="text-h6">
          {{ unit ? 'Edit Unit' : 'Create New Unit' }}
        </div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup />
      </q-card-section>

      <q-card-section>
        <q-form @submit="handleSubmit" @validation-error="handleValidationError">
          <div class="q-gutter-md">
            <!-- Unit Name -->
            <div>
              <q-input
                v-model="formData.name"
                outlined
                label="Unit Name *"
                :rules="nameRules"
                maxlength="100"
                counter
                placeholder="Enter unit name (minimum 2 characters)"
              >
                <template v-slot:prepend>
                  <q-icon name="title" />
                </template>
              </q-input>
            </div>

            <!-- Tag Selection -->
            <div>
              <div class="text-subtitle2 q-mb-sm">Tags (Optional)</div>
              <q-select
                v-model="formData.tagIds"
                outlined
                multiple
                :options="tagOptions"
                option-value="id"
                option-label="name"
                clearable
                placeholder="Select tags to categorize this unit"
                emit-value
                map-options
                use-chips
                input-debounce="0"
                :loading="tagsLoading"
              >
                <template v-slot:option="{ itemProps, opt }">
                  <q-item v-bind="itemProps">
                    <q-item-section>
                      <q-item-label>{{ opt.name }}</q-item-label>
                    </q-item-section>
                    <q-item-section side>
                      <q-chip
                        :style="{ backgroundColor: opt.color, color: 'white' }"
                        size="sm"
                      />
                    </q-item-section>
                  </q-item>
                </template>
                <template v-slot:selected-item="scope">
                  <q-chip
                    removable
                    :style="{ backgroundColor: getTagColor(scope.opt), color: 'white' }"
                    @remove="removeTag(scope.opt)"
                    :tabindex="scope.tabindex"
                    class="q-mr-xs"
                  >
                    {{ scope.opt.name }}
                  </q-chip>
                </template>
                <template v-slot:no-option>
                  <q-item>
                    <q-item-section class="text-grey">
                      No tags available. <a href="/tags" target="_blank">Create tags first</a>
                    </q-item-section>
                  </q-item>
                </template>
              </q-select>
            </div>

            <!-- Unit Description (Optional for future enhancement) -->
            <div>
              <q-input
                v-model="formData.description"
                outlined
                type="textarea"
                label="Description (Optional)"
                rows="3"
                maxlength="500"
                counter
                placeholder="Add a description for this unit..."
              >
                <template v-slot:prepend>
                  <q-icon name="description" />
                </template>
              </q-input>
            </div>
          </div>

          <!-- Form Actions -->
          <div class="row q-mt-lg justify-end q-gutter-sm">
            <q-btn
              flat
              label="Cancel"
              color="grey"
              v-close-popup
              @click="handleCancel"
            />
            <q-btn
              type="submit"
              :label="unit ? 'Update' : 'Create'"
              color="primary"
              :loading="loading"
            />
          </div>
        </q-form>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { useQuasar } from 'quasar';
import { tagService, unitTagService } from 'src/services/indexeddb';
import type { Tag } from 'src/types/tag';
import type { Unit } from 'src/types/unit';

// Props
interface Props {
  modelValue: boolean;
  unit?: Unit | null;
}

const props = withDefaults(defineProps<Props>(), {
  unit: null
});

// Emits
interface Emits {
  (e: 'update:modelValue', value: boolean): void;
  (e: 'save', data: { name: string; tagIds?: string[] }): void;
  (e: 'cancel'): void;
}

const emit = defineEmits<Emits>();

const $q = useQuasar();

// Reactive data
const loading = ref(false);
const tagsLoading = ref(false);
const tags = ref<Tag[]>([]);
const formData = ref({
  name: '',
  description: '',
  tagIds: [] as string[]
});

// Computed
const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
});

const tagOptions = computed(() => tags.value);

const nameRules = [
  (val: string) => !!val || 'Unit name is required',
  (val: string) => (val && val.length >= 2) || 'Unit name must be at least 2 characters',
  (val: string) => (val && val.length <= 100) || 'Unit name must not exceed 100 characters'
];

// Methods
async function loadTags() {
  tagsLoading.value = true;
  try {
    tags.value = await tagService.getAllTags();
  } catch (error) {
    console.error('Failed to load tags:', error);
    $q.notify({
      type: 'negative',
      message: 'Failed to load tags',
      icon: 'error'
    });
  } finally {
    tagsLoading.value = false;
  }
}

function getTagColor(option: Tag | string): string {
  if (typeof option === 'string') {
    const tag = tags.value.find(t => t.id === option);
    return tag?.color || '#1976D2';
  }
  return option.color;
}

function removeTag(tag: Tag | string) {
  const tagId = typeof tag === 'string' ? tag : tag.id;
  const index = formData.value.tagIds.indexOf(tagId);
  if (index > -1) {
    formData.value.tagIds.splice(index, 1);
  }
}

function resetForm() {
  formData.value = {
    name: '',
    description: '',
    tagIds: []
  };
}

async function loadUnitData() {
  if (props.unit) {
    formData.value.name = props.unit.name;

    // Load unit's tags
    try {
      const unitTags = await unitTagService.getUnitTags(props.unit.id);
      formData.value.tagIds = unitTags.map(tag => tag.id);
    } catch (error) {
      console.error('Failed to load unit tags:', error);
    }
  } else {
    resetForm();
  }
}

function handleSubmit() {
  loading.value = true;

  try {
    emit('save', {
      name: formData.value.name,
      tagIds: formData.value.tagIds
    });
  } catch (error) {
    console.error('Error in form submission:', error);
  } finally {
    loading.value = false;
  }
}

function handleValidationError() {
  $q.notify({
    type: 'negative',
    message: 'Please fix the errors in the form',
    icon: 'warning'
  });
}

function handleCancel() {
  emit('cancel');
}

// Watch for unit changes
watch(() => props.unit, () => {
  void loadUnitData();
});

// Watch for dialog opening
watch(isOpen, (newValue) => {
  if (newValue) {
    void loadTags();
    void loadUnitData();
  }
});

onMounted(() => {
  if (props.modelValue) {
    void loadTags();
    void loadUnitData();
  }
});
</script>

<style scoped>
.q-dialog .q-card {
  min-width: 500px;
  max-width: 600px;
}

@media (max-width: 600px) {
  .q-dialog .q-card {
    min-width: auto;
    width: 100%;
    margin: 0;
  }
}
</style>