<template>
  <q-dialog v-model="isOpen" persistent maximized>
    <q-card>
      <q-card-section class="row items-center q-pb-none">
        <div class="text-h6">
          Manage Vocabulary - {{ unit?.name }}
        </div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup @click="handleClose" />
      </q-card-section>

      <q-card-section>
        <div v-if="!unit" class="text-center">
          <q-icon name="warning" size="3rem" color="warning" class="q-mb-md" />
          <div class="text-h6 q-mb-sm">No Unit Selected</div>
          <div class="text-grey-6">Please select a unit to manage its vocabulary.</div>
        </div>

        <div v-else>
          <!-- Statistics Bar -->
          <div class="row q-mb-lg">
            <div class="col-4 q-pr-sm">
              <q-card flat bordered class="full-height stats-card">
                <q-card-section class="q-pa-sm">
                  <div class="row items-center justify-center q-gutter-sm">
                    <div class="col-auto">
                      <q-avatar color="primary" text-color="white" size="md" icon="school" />
                    </div>
                    <div class="col text-center">
                      <div class="text-caption text-grey-6">总词汇</div>
                      <div class="text-h6 text-weight-bold text-primary">{{ vocabularyStats.total }}</div>
                    </div>
                  </div>
                </q-card-section>
              </q-card>
            </div>

            <div class="col-4 q-px-sm">
              <q-card flat bordered class="full-height stats-card">
                <q-card-section class="q-pa-sm">
                  <div class="row items-center justify-center q-gutter-sm">
                    <div class="col-auto">
                      <q-avatar color="red" text-color="white" size="md" icon="translate" />
                    </div>
                    <div class="col text-center">
                      <div class="text-caption text-grey-6">中文</div>
                      <div class="text-h6 text-weight-bold text-red">{{ vocabularyStats.chinese }}</div>
                    </div>
                  </div>
                </q-card-section>
              </q-card>
            </div>

            <div class="col-4 q-pl-sm">
              <q-card flat bordered class="full-height stats-card">
                <q-card-section class="q-pa-sm">
                  <div class="row items-center justify-center q-gutter-sm">
                    <div class="col-auto">
                      <q-avatar color="blue" text-color="white" size="md" icon="language" />
                    </div>
                    <div class="col text-center">
                      <div class="text-caption text-grey-6">English</div>
                      <div class="text-h6 text-weight-bold text-blue">{{ vocabularyStats.english }}</div>
                    </div>
                  </div>
                </q-card-section>
              </q-card>
            </div>
          </div>

          <!-- Tab Panel for Chinese and English -->
          <q-tabs v-model="activeTab" dense class="q-mb-lg">
            <q-tab name="chinese" icon="translate" label="中文 Words">
              <q-badge v-if="chineseVocabulary.length > 0" color="red" floating>
                {{ chineseVocabulary.length }}
              </q-badge>
            </q-tab>
            <q-tab name="english" icon="language" label="English Terms">
              <q-badge v-if="englishVocabulary.length > 0" color="blue" floating>
                {{ englishVocabulary.length }}
              </q-badge>
            </q-tab>
          </q-tabs>

          <q-tab-panels v-model="activeTab" animated>
            <q-tab-panel name="chinese">
              <!-- Add Word Form -->
              <q-card flat bordered class="q-mb-lg">
                <q-card-section>
                  <div class="text-subtitle2 q-mb-sm">Add Chinese Word</div>
                  <div class="row q-gutter-md">
                    <div class="col-12 col-md-8">
                      <q-input
                        v-model="newChineseWord"
                        outlined
                        placeholder="Enter Chinese word..."
                        maxlength="100"
                        @keyup.enter="addChineseWord"
                      >
                        <template v-slot:prepend>
                          <q-icon name="translate" />
                        </template>
                      </q-input>
                    </div>
                    <div class="col-12 col-md-4">
                      <q-btn
                        color="primary"
                        icon="add"
                        label="Add Word"
                        @click="addChineseWord"
                        :disable="!newChineseWord.trim()"
                        class="full-width"
                      />
                    </div>
                  </div>
                </q-card-section>
              </q-card>

              <!-- Vocabulary List -->
              <VocabularyList
                :vocabulary="chineseVocabulary"
                type="chinese"
                @edit="editVocabularyItem"
                @delete="deleteVocabularyItem"
                @audio-record="recordAudio"
                @audio-play="playAudio"
              />
            </q-tab-panel>

            <q-tab-panel name="english">
              <!-- Add Term Form -->
              <q-card flat bordered class="q-mb-lg">
                <q-card-section>
                  <div class="text-subtitle2 q-mb-sm">Add English Term</div>
                  <div class="row q-gutter-md">
                    <div class="col-12 col-md-8">
                      <q-input
                        v-model="newEnglishTerm"
                        outlined
                        placeholder="Enter English term..."
                        maxlength="100"
                        @keyup.enter="addEnglishTerm"
                      >
                        <template v-slot:prepend>
                          <q-icon name="language" />
                        </template>
                      </q-input>
                    </div>
                    <div class="col-12 col-md-4">
                      <q-btn
                        color="primary"
                        icon="add"
                        label="Add Term"
                        @click="addEnglishTerm"
                        :disable="!newEnglishTerm.trim()"
                        class="full-width"
                      />
                    </div>
                  </div>
                </q-card-section>
              </q-card>

              <!-- Vocabulary List -->
              <VocabularyList
                :vocabulary="englishVocabulary"
                type="english"
                @edit="editVocabularyItem"
                @delete="deleteVocabularyItem"
                @audio-record="recordAudio"
                @audio-play="playAudio"
              />
            </q-tab-panel>
          </q-tab-panels>
        </div>
      </q-card-section>

      <q-card-actions align="right">
        <q-btn flat label="Close" color="primary" v-close-popup @click="handleClose" />
      </q-card-actions>
    </q-card>
  </q-dialog>

  <!-- Audio Recording Dialog -->
  <q-dialog v-model="showAudioRecorder" persistent>
    <q-card style="min-width: 500px">
      <q-card-section class="row items-center q-pb-none">
        <div class="text-h6">Record Audio</div>
        <div class="text-subtitle2 q-ml-sm">
          "{{ recordingForItem?.text }}"
        </div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup @click="cancelAudioRecording" />
      </q-card-section>

      <q-card-section class="text-center q-pa-lg">
        <div class="text-h5 q-mb-lg text-weight-bold">
          {{ recordingForItem?.type === 'chinese' ? '中文' : 'English' }}
        </div>
        <div class="text-h4 q-mb-md">
          "{{ recordingForItem?.text }}"
        </div>

        <AudioRecorder
          @recording-started="onAudioRecordingStarted"
          @recording-stopped="onAudioRecordingStopped"
          @error="onAudioRecordingError"
        />
      </q-card-section>
    </q-card>
  </q-dialog>

  <!-- Audio Playback Dialog -->
  <q-dialog v-model="showAudioPlayer" persistent>
    <q-card style="min-width: 500px">
      <q-card-section class="row items-center q-pb-none">
        <div class="text-h6">Play Audio</div>
        <div class="text-subtitle2 q-ml-sm">
          "{{ playingForItem?.text }}"
        </div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup @click="closeAudioPlayer" />
      </q-card-section>

      <q-card-section class="text-center q-pa-lg">
        <div class="text-h5 q-mb-lg text-weight-bold">
          {{ playingForItem?.type === 'chinese' ? '中文' : 'English' }}
        </div>
        <div class="text-h4 q-mb-md">
          "{{ playingForItem?.text }}"
        </div>

        <AudioPlayer
          v-if="currentAudioBlob"
          :audio-blob="currentAudioBlob"
          show-metadata
          @ended="onAudioPlaybackEnded"
          @error="onAudioPlaybackError"
        />

        <div v-else class="text-center">
          <q-spinner-dots size="2rem" color="primary" class="q-mb-md" />
          <div class="text-body1">Loading audio...</div>
        </div>
      </q-card-section>
    </q-card>
  </q-dialog>

  <!-- Edit Vocabulary Dialog -->
  <q-dialog v-model="showEditDialog" persistent>
    <q-card style="min-width: 400px">
      <q-card-section class="row items-center q-pb-none">
        <div class="text-h6">Edit {{ editingItem?.type === 'chinese' ? 'Chinese Word' : 'English Term' }}</div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup />
      </q-card-section>

      <q-card-section>
        <q-form @submit="saveEdit">
          <q-input
            v-model="editingText"
            outlined
            :label="`Enter ${editingItem?.type === 'chinese' ? 'Chinese word' : 'English term'}...`"
            maxlength="100"
            :rules="[val => !!val.trim() || 'Text is required']"
          />
        </q-form>
      </q-card-section>

      <q-card-actions align="right">
        <q-btn flat label="Cancel" color="grey" v-close-popup />
        <q-btn
          color="primary"
          label="Save"
          @click="saveEdit"
          :disable="!editingText.trim()"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useQuasar } from 'quasar';
import { vocabularyService } from 'src/services/indexeddb';
import { audioService } from 'src/services/audioService';
import type { Unit, VocabularyItem } from 'src/types/unit';
import VocabularyList from 'src/components/VocabularyList.vue';
import AudioRecorder from 'src/components/AudioRecorder.vue';
import AudioPlayer from 'src/components/AudioPlayer.vue';

// Define component name for ESLint
defineOptions({
  name: 'VocabularyEditor'
});

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
  (e: 'close'): void;
}

const emit = defineEmits<Emits>();

const $q = useQuasar();

// Reactive data
const activeTab = ref('chinese');
const vocabulary = ref<VocabularyItem[]>([]);
const newChineseWord = ref('');
const newEnglishTerm = ref('');
const showEditDialog = ref(false);
const editingItem = ref<VocabularyItem | null>(null);
const editingText = ref('');

// Audio recording/playback state
const showAudioRecorder = ref(false);
const showAudioPlayer = ref(false);
const recordingForItem = ref<VocabularyItem | null>(null);
const playingForItem = ref<VocabularyItem | null>(null);
const currentAudioBlob = ref<Blob | null>(null);

// Computed
const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
});

const chineseVocabulary = computed(() =>
  vocabulary.value.filter(item => item.type === 'chinese').sort((a, b) => a.text.localeCompare(b.text))
);

const englishVocabulary = computed(() =>
  vocabulary.value.filter(item => item.type === 'english').sort((a, b) => a.text.localeCompare(b.text))
);

const vocabularyStats = computed(() => ({
  total: vocabulary.value.length,
  chinese: chineseVocabulary.value.length,
  english: englishVocabulary.value.length
}));

// Methods
async function loadVocabulary() {
  if (!props.unit) return;

  try {
    vocabulary.value = await vocabularyService.getVocabularyItemsByUnit(props.unit.id);
  } catch (error) {
    console.error('Failed to load vocabulary:', error);
    $q.notify({
      type: 'negative',
      message: 'Failed to load vocabulary items',
      icon: 'error'
    });
  }
}

async function addChineseWord() {
  const text = newChineseWord.value.trim();
  if (!text || !props.unit) return;

  try {
    await vocabularyService.createVocabularyItem({
      unitId: props.unit.id,
      type: 'chinese',
      text,
      hasAudio: false
    });

    newChineseWord.value = '';
    await loadVocabulary();

    $q.notify({
      type: 'positive',
      message: `Chinese word "${text}" added successfully`,
      icon: 'add'
    });
  } catch (error) {
    console.error('Failed to add Chinese word:', error);
    $q.notify({
      type: 'negative',
      message: 'Failed to add Chinese word',
      icon: 'error'
    });
  }
}

async function addEnglishTerm() {
  const text = newEnglishTerm.value.trim();
  if (!text || !props.unit) return;

  try {
    await vocabularyService.createVocabularyItem({
      unitId: props.unit.id,
      type: 'english',
      text,
      hasAudio: false
    });

    newEnglishTerm.value = '';
    await loadVocabulary();

    $q.notify({
      type: 'positive',
      message: `English term "${text}" added successfully`,
      icon: 'add'
    });
  } catch (error) {
    console.error('Failed to add English term:', error);
    $q.notify({
      type: 'negative',
      message: 'Failed to add English term',
      icon: 'error'
    });
  }
}

function editVocabularyItem(item: VocabularyItem) {
  editingItem.value = item;
  editingText.value = item.text;
  showEditDialog.value = true;
}

async function saveEdit() {
  if (!editingItem.value || !editingText.value.trim()) return;

  try {
    await vocabularyService.updateVocabularyItem(editingItem.value.id, {
      text: editingText.value.trim()
    });

    await loadVocabulary();
    showEditDialog.value = false;
    editingItem.value = null;
    editingText.value = '';

    $q.notify({
      type: 'positive',
      message: 'Vocabulary item updated successfully',
      icon: 'save'
    });
  } catch (error) {
    console.error('Failed to update vocabulary item:', error);
    $q.notify({
      type: 'negative',
      message: 'Failed to update vocabulary item',
      icon: 'error'
    });
  }
}

function deleteVocabularyItem(item: VocabularyItem) {
  $q.dialog({
    title: 'Confirm Delete',
    message: `Are you sure you want to delete "${item.text}"?`,
    ok: {
      label: 'Delete',
      color: 'negative'
    },
    cancel: {
      label: 'Cancel',
      color: 'grey'
    }
  }).onOk(() => {
    void (async () => {
      try {
        await vocabularyService.deleteVocabularyItem(item.id);
        await loadVocabulary();

        $q.notify({
          type: 'positive',
          message: `"${item.text}" deleted successfully`,
          icon: 'delete'
        });
      } catch (error) {
        console.error('Failed to delete vocabulary item:', error);
        $q.notify({
          type: 'negative',
          message: 'Failed to delete vocabulary item',
          icon: 'error'
        });
      }
    })();
  });
}

function recordAudio(item: VocabularyItem) {
  try {
    recordingForItem.value = item;
    showAudioRecorder.value = true;
  } catch (error) {
    console.error('Failed to open audio recorder:', error);
    $q.notify({
      type: 'negative',
      message: 'Failed to open audio recorder',
      icon: 'error'
    });
  }
}

async function playAudio(item: VocabularyItem) {
  try {
    if (!item.hasAudio) {
      $q.notify({
        type: 'warning',
        message: 'No audio recorded for this item',
        icon: 'warning'
      });
      return;
    }

    playingForItem.value = item;
    currentAudioBlob.value = null; // Reset previous audio
    showAudioPlayer.value = true;

    // Load audio blob from IndexedDB
    const audioBlob = await vocabularyService.getAudioBlob(item.id);

    if (!audioBlob) {
      throw new Error('No audio found for this item');
    }

    currentAudioBlob.value = audioBlob;
  } catch (error) {
    console.error('Failed to play audio:', error);
    $q.notify({
      type: 'negative',
      message: error instanceof Error ? error.message : 'Failed to play audio',
      icon: 'error'
    });
    showAudioPlayer.value = false;
  }
}

// Audio recording event handlers
function onAudioRecordingStarted() {
  console.log('Audio recording started');
}

async function onAudioRecordingStopped(audioBlob: Blob) {
  try {
    if (!recordingForItem.value) return;

    // Validate and optimize audio
    const validation = audioService.validateAudioFormat(audioBlob);
    if (!validation.isValid) {
      throw new Error(validation.error || 'Invalid audio format');
    }

    // Optimize audio size if needed
    const optimizedBlob = await audioService.optimizeAudioSize(audioBlob, 2); // 2MB max

    // Save to IndexedDB
    const success = await vocabularyService.setAudioBlob(recordingForItem.value.id, optimizedBlob);

    if (!success) {
      throw new Error('Failed to save audio recording');
    }

    // Update the vocabulary item
    await vocabularyService.updateVocabularyItem(recordingForItem.value.id, {
      hasAudio: true
    });

    // Reload vocabulary to show updated audio status
    await loadVocabulary();

    showAudioRecorder.value = false;
    recordingForItem.value = null;

    $q.notify({
      type: 'positive',
      message: 'Audio recording saved successfully',
      icon: 'check'
    });
  } catch (error) {
    console.error('Failed to save audio recording:', error);
    $q.notify({
      type: 'negative',
      message: error instanceof Error ? error.message : 'Failed to save audio recording',
      icon: 'error'
    });
  }
}

function onAudioRecordingError(error: string) {
  console.error('Audio recording error:', error);
  $q.notify({
    type: 'negative',
    message: `Recording error: ${error}`,
    icon: 'error'
  });
}

function cancelAudioRecording() {
  showAudioRecorder.value = false;
  recordingForItem.value = null;
}

// Audio playback event handlers
function onAudioPlaybackEnded() {
  // Audio finished playing
  console.log('Audio playback ended');
}

function onAudioPlaybackError(error: string) {
  console.error('Audio playback error:', error);
  $q.notify({
    type: 'negative',
    message: `Playback error: ${error}`,
    icon: 'error'
  });
}

function closeAudioPlayer() {
  showAudioPlayer.value = false;
  playingForItem.value = null;
  currentAudioBlob.value = null;
}

function handleClose() {
  emit('close');
}

// Watch for unit changes
watch(() => props.unit, () => {
  if (props.unit) {
    void loadVocabulary();
  } else {
    vocabulary.value = [];
  }
});

// Watch for dialog opening
watch(isOpen, (newValue) => {
  if (newValue && props.unit) {
    void loadVocabulary();
  }
});

onMounted(() => {
  if (props.unit) {
    void loadVocabulary();
  }
});
</script>

<style scoped>
.q-dialog .q-card {
  min-width: 600px;
}

/* Statistics Cards Styling */
.stats-card {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  height: 100%;
}

.stats-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.stats-card .q-card-section {
  padding: 12px;
  min-height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.stats-card .text-h6 {
  line-height: 1.2;
}

@media (max-width: 600px) {
  .q-dialog .q-card {
    min-width: auto;
    width: 100%;
    margin: 0;
  }

  .stats-card .q-card-section {
    min-height: 70px;
    padding: 8px;
  }

  .stats-card .text-h6 {
    font-size: 1rem;
  }

  .stats-card .text-caption {
    font-size: 0.7rem;
  }
}

@media (max-width: 400px) {
  .stats-card .q-card-section {
    min-height: 60px;
    padding: 6px;
  }

  .stats-card .text-h6 {
    font-size: 0.9rem;
  }

  .stats-card .q-avatar {
    width: 32px !important;
    height: 32px !important;
  }
}
</style>