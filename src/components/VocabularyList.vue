<template>
  <div>
    <!-- Empty State -->
    <div v-if="vocabulary.length === 0" class="text-center q-pa-lg">
      <q-icon
        :name="type === 'chinese' ? 'translate' : 'language'"
        size="3rem"
        color="grey-4"
        class="q-mb-md"
      />
      <div class="text-h6 q-mb-sm text-grey-6">
        No {{ type === 'chinese' ? 'Chinese' : 'English' }} vocabulary yet
      </div>
      <div class="text-body2 text-grey-5">
        Add your first {{ type === 'chinese' ? 'Chinese word' : 'English term' }} to get started
      </div>
    </div>

    <!-- Vocabulary List -->
    <q-list v-else separator class="vocabulary-list">
      <q-item
        v-for="item in vocabulary"
        :key="item.id"
        class="vocabulary-item"
      >
        <q-item-section>
          <q-item-label class="text-h6">{{ item.text }}</q-item-label>
          <q-item-label caption>
            {{ item.type === 'chinese' ? 'Chinese' : 'English' }} •
            {{ formatDate(item.createdAt) }}
          </q-item-label>
          <div class="q-mt-sm">
            <q-chip
              :color="item.hasAudio ? 'green' : 'grey-5'"
              text-color="white"
              :icon="item.hasAudio ? 'check' : 'mic_off'"
              size="sm"
            >
              {{ item.hasAudio ? 'Audio recorded' : 'No audio' }}
            </q-chip>
          </div>
        </q-item-section>

        <q-item-section side>
          <div class="column q-gutter-xs">
            <!-- Audio Controls -->
            <div class="row q-gutter-xs">
              <q-btn
                :color="item.hasAudio ? 'primary' : 'grey-4'"
                :icon="item.hasAudio ? 'play_arrow' : 'mic'"
                size="sm"
                round
                dense
                :disable="!item.hasAudio"
                @click="$emit('audioPlay', item)"
              >
                <q-tooltip>
                  {{ item.hasAudio ? 'Play audio' : 'Record audio' }}
                </q-tooltip>
              </q-btn>
              <q-btn
                color="secondary"
                icon="mic"
                size="sm"
                round
                dense
                @click="$emit('audioRecord', item)"
              >
                <q-tooltip>
                  {{ item.hasAudio ? 'Re-record audio' : 'Record audio' }}
                </q-tooltip>
              </q-btn>
            </div>

            <!-- Edit/Delete Controls -->
            <div class="row q-gutter-xs">
              <q-btn
                color="warning"
                icon="edit"
                size="sm"
                round
                dense
                @click="$emit('edit', item)"
              >
                <q-tooltip>Edit</q-tooltip>
              </q-btn>
              <q-btn
                color="negative"
                icon="delete"
                size="sm"
                round
                dense
                @click="$emit('delete', item)"
              >
                <q-tooltip>Delete</q-tooltip>
              </q-btn>
            </div>
          </div>
        </q-item-section>
      </q-item>
    </q-list>
  </div>
</template>

<script setup lang="ts">
import type { VocabularyItem } from 'src/types/unit';

// Define component name for ESLint
defineOptions({
  name: 'VocabularyList'
});

// Props
interface Props {
  vocabulary: VocabularyItem[];
  type: 'chinese' | 'english';
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const props = defineProps<Props>();

// Emits
interface Emits {
  (e: 'edit', item: VocabularyItem): void;
  (e: 'delete', item: VocabularyItem): void;
  (e: 'audioRecord', item: VocabularyItem): void;
  (e: 'audioPlay', item: VocabularyItem): void;
}

defineEmits<Emits>();

// Methods
function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(date));
}
</script>

<style scoped>
.vocabulary-list {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  background-color: white;
}

.vocabulary-item:hover {
  background-color: #f5f5f5;
}

.vocabulary-item {
  transition: background-color 0.2s ease;
}

.q-item-section.side {
  min-width: 100px;
}

@media (max-width: 600px) {
  .q-item-section.side {
    min-width: 80px;
  }

  .vocabulary-list {
    border-radius: 4px;
  }
}
</style>