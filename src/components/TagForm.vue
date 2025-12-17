<template>
  <q-form @submit="handleSubmit" @validation-error="onValidationError" class="tag-form">
    <div class="tag-form__field">
      <q-input
        v-model="formData.name"
        :label="$t('tagManagement.tagName')"
        :hint="$t('tagManagement.tagNameHint')"
        :rules="nameRules"
        outlined
        class="q-mb-lg"
        :disable="loading"
        ref="nameInput"
        autocomplete="off"
        autofocus
      >
        <template v-slot:prepend>
          <q-icon name="label" color="primary" />
        </template>
      </q-input>
    </div>

    <div class="tag-form__field">
      <div class="text-subtitle2 q-mb-sm">{{ $t('tagManagement.selectColor') }}</div>
      <TagColorPicker
        v-model="formData.color"
        :disabled="loading"
      />
    </div>

    <div class="tag-form__actions">
      <q-btn
        type="button"
        :label="$t('common.cancel')"
        outline
        color="grey"
        @click="handleCancel"
        :disable="loading"
        class="tag-form__cancel-btn"
        size="md"
      />

      <q-btn
        type="submit"
        :label="isEditing ? $t('common.update') : $t('common.create')"
        color="primary"
        :loading="loading"
        class="tag-form__submit-btn"
        size="md"
        :disable="loading"
      />
    </div>
  </q-form>
</template>

<script setup lang="ts">
import { ref, reactive, watch, nextTick, onMounted, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useQuasar } from 'quasar'
import TagColorPicker from './TagColorPicker.vue'
import { useTagStore } from '../stores/tag-store'
import type { Tag } from '../types/tag'

interface Props {
  tag?: Tag | null
}

const props = withDefaults(defineProps<Props>(), {
  tag: null
})

const emit = defineEmits<{
  success: []
  cancel: []
}>()

const { t } = useI18n()
const quasar = useQuasar()
const tagStore = useTagStore()

const nameInput = ref()
const loading = ref(false)

const isEditing = computed(() => !!props.tag)

const formData = reactive({
  name: props.tag?.name || '',
  color: props.tag?.color || '#1976D2'
})

const nameRules = [
  (val: string) => !!val && val.trim().length > 0 || t('tagManagement.nameRequired'),
  (val: string) => val.trim().length >= 2 || t('tagManagement.nameTooShort'),
  (val: string) => {
    const existingTag = tagStore.getTagByName(val.trim())
    return !existingTag || existingTag.id === props.tag?.id || t('tagManagement.nameAlreadyExists')
  }
]

watch(() => props.tag, (newTag) => {
  if (newTag) {
    formData.name = newTag.name
    formData.color = newTag.color
  } else {
    formData.name = ''
    formData.color = '#1976D2'
  }
  void nextTick(() => {
    nameInput.value?.focus()
  })
}, { immediate: true })

async function handleSubmit() {
  try {
    loading.value = true
    tagStore.clearError()

    if (isEditing.value && props.tag) {
      await tagStore.updateTag(props.tag.id, {
        name: formData.name.trim(),
        color: formData.color
      })
      quasar.notify({
        type: 'positive',
        message: t('tagManagement.tagUpdated'),
        timeout: 2000
      })
    } else {
      await tagStore.createTag({
        name: formData.name.trim(),
        color: formData.color
      })
      quasar.notify({
        type: 'positive',
        message: t('tagManagement.tagCreated'),
        timeout: 2000
      })
    }

    // Emit success to trigger modal auto-close
    emit('success')
  } catch (error) {
    quasar.notify({
      type: 'negative',
      message: error instanceof Error ? error.message : t('tagManagement.operationFailed'),
      timeout: 3000
    })
  } finally {
    loading.value = false
  }
}

function handleCancel() {
  emit('cancel')
}

function onValidationError() {
  quasar.notify({
    type: 'negative',
    message: t('tagManagement.formValidationFailed')
  })
}

onMounted(() => {
  void nextTick(() => {
    nameInput.value?.focus()
  })
})
</script>

<style lang="scss" scoped>
.tag-form {
  width: 100%;
  max-width: 400px;
  margin: 0 auto;
}

.tag-form__field {
  margin-bottom: 24px;

  &:last-child {
    margin-bottom: 32px;
  }
}

.tag-form__actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 24px;
  padding-top: 16px;
  border-top: 1px solid rgba(0, 0, 0, 0.08);
}

.tag-form__cancel-btn {
  min-width: 80px;
}

.tag-form__submit-btn {
  min-width: 100px;
}

// Modal-specific optimizations
@media (max-width: 768px) {
  .tag-form {
    max-width: none;
  }

  .tag-form__actions {
    flex-direction: column-reverse;
    gap: 12px;
  }

  .tag-form__cancel-btn,
  .tag-form__submit-btn {
    width: 100%;
    min-width: auto;
  }
}

// Focus management improvements
.tag-form :deep(.q-field__control) {
  border-radius: 8px;
}

.tag-form :deep(.q-field--focused .q-field__control) {
  box-shadow: 0 0 0 2px rgba(25, 118, 210, 0.2);
}
</style>