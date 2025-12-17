<template>
  <q-page class="tag-management">
    <div class="tag-management__header">
      <div class="text-h5">{{ $t('tagManagement.title') }}</div>
      <div class="text-body1 text-grey-7 q-mt-sm">{{ $t('tagManagement.description') }}</div>
    </div>

    <TagList
      :loading="tagStore.loading"
      :tags="tagStore.tags"
      @edit="handleEditTag"
      @delete="handleDeleteTag"
    />

    <!-- Floating Action Button for creating new tags -->
    <q-page-sticky position="bottom-right" :offset="[18, 18]">
      <q-btn
        fab
        icon="add"
        color="primary"
        @click="handleCreateNew"
        :aria-label="$t('tagManagement.createNew')"
      />
    </q-page-sticky>

    <!-- Modal Dialog for Tag Creation/Edit -->
    <q-dialog
      v-model="showModal"
      maximized
      transition-show="slide-up"
      transition-hide="slide-down"
      :full-width="$q.screen.lt.md"
      class="tag-modal"
    >
      <q-card class="tag-modal__card">
        <q-card-section class="tag-modal__header">
          <div class="text-h6">
            {{ editingTag ? $t('tagManagement.editTag') : $t('tagManagement.createTag') }}
          </div>
          <q-btn
            flat
            round
            dense
            icon="close"
            @click="handleModalClose"
            :aria-label="$t('common.cancel')"
          />
        </q-card-section>

        <q-card-section class="tag-modal__content">
          <TagForm
            :tag="editingTag"
            @success="handleFormSuccess"
            @cancel="handleModalClose"
          />
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useTagStore } from '../stores/tag-store'
import { useQuasar } from 'quasar'
import TagList from '../components/TagList.vue'
import TagForm from '../components/TagForm.vue'
import type { Tag } from '../types/tag'

const { t } = useI18n()
const tagStore = useTagStore()
const quasar = useQuasar()

const editingTag = ref<Tag | null>(null)
const showModal = ref(false)

onMounted(async () => {
  await loadTags()
})

async function loadTags() {
  try {
    await tagStore.loadTags()
  } catch {
    quasar.notify({
      type: 'negative',
      message: 'Failed to load tags'
    })
  }
}

function handleCreateNew() {
  editingTag.value = null
  showModal.value = true
}

function handleEditTag(tag: Tag) {
  editingTag.value = tag
  showModal.value = true
}

function handleDeleteTag(tag: Tag) {
  quasar.dialog({
    title: t('tagManagement.deleteTag'),
    message: t('tagManagement.deleteTagConfirmation', { name: tag.name }),
    cancel: {
      label: t('common.cancel'),
      color: 'grey'
    },
    ok: {
      label: t('common.delete'),
      color: 'negative'
    },
    persistent: true
  }).onOk(() => {
      tagStore.deleteTag(tag.id)
        .then(() => {
          quasar.notify({
            type: 'positive',
            message: t('tagManagement.tagDeleted')
          })
        })
        .catch((error) => {
          quasar.notify({
            type: 'negative',
            message: error instanceof Error ? error.message : t('tagManagement.deleteFailed')
          })
        })
    })
}

function handleFormSuccess() {
  // Close modal immediately
  showModal.value = false
  editingTag.value = null

  // Success notification is already handled by TagForm
  // Modal will close with animation due to v-model binding
}

function handleModalClose() {
  showModal.value = false
  editingTag.value = null
}

watch(() => tagStore.error, (error) => {
  if (error) {
    quasar.notify({
      type: 'negative',
      message: error
    })
  }
})
</script>

<style lang="scss" scoped>
.tag-management {
  padding: 24px;
  max-width: 1400px;
  margin: 0 auto;
  min-height: calc(100vh - 100px);
}

.tag-management__header {
  margin-bottom: 32px;
}

.tag-modal {
  &__card {
    width: 500px;
    max-width: 90vw;
    max-height: 80vh;
  }

  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-bottom: 16px;
    border-bottom: 1px solid rgba(0, 0, 0, 0.12);
  }

  &__content {
    padding: 24px 0;
    max-height: calc(80vh - 80px);
    overflow-y: auto;
  }
}

@media (max-width: 1023px) {
  .tag-management {
    padding: 16px;
  }

  .tag-modal {
    &__card {
      width: 100%;
      height: 100%;
      max-width: none;
      max-height: none;
    }

    &__content {
      max-height: none;
    }
  }
}
</style>