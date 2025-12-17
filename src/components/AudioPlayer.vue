<template>
  <div class="audio-player">
    <!-- Audio Player Controls -->
    <div class="row q-gutter-sm items-center">
      <!-- Play/Pause Button -->
      <q-btn
        :color="isPlaying ? 'secondary' : 'primary'"
        :icon="isPlaying ? 'pause' : 'play_arrow'"
        :size="size"
        round
        :disable="isDisabled || !audioElement"
        @click="togglePlayPause"
      >
        <q-tooltip>
          {{ isPlaying ? 'Pause' : 'Play' }}
        </q-tooltip>
      </q-btn>

      <!-- Stop Button -->
      <q-btn
        v-if="showStopButton"
        color="grey-6"
        icon="stop"
        :size="size"
        round
        :disable="isDisabled || !audioElement"
        @click="stop"
      >
        <q-tooltip>
          Stop
        </q-tooltip>
      </q-btn>

      <!-- Progress Bar -->
      <div v-if="showProgressBar" class="col progress-container">
        <q-slider
          v-model="currentTime"
          :min="0"
          :max="duration"
          :step="0.1"
          :disable="isDisabled || !audioElement"
          color="primary"
          track-color="grey-3"
          thumb-color="primary"
          @update:model-value="(value: number | null) => seekTo(value || 0)"
          @mousedown="isSeeking = true"
          @mouseup="isSeeking = false"
          @touchstart="isSeeking = true"
          @touchend="isSeeking = false"
        />

        <!-- Time Display -->
        <div class="row justify-between time-display">
          <span class="text-caption">{{ formatTime(currentTime) }}</span>
          <span class="text-caption">{{ formatTime(duration) }}</span>
        </div>
      </div>

      <!-- Volume Control -->
      <div v-if="showVolumeControl" class="volume-container">
        <q-btn
          :icon="volumeIcon"
          :size="size"
          flat
          dense
          @click="toggleMute"
        >
          <q-tooltip>
            {{ isMuted ? 'Unmute' : 'Mute' }}
          </q-tooltip>
        </q-btn>

        <q-slider
          v-model="volume"
          :min="0"
          :max="1"
          :step="0.1"
          :disable="isDisabled"
          color="primary"
          track-color="grey-3"
          thumb-color="primary"
          style="width: 80px"
          @update:model-value="(value: number | null) => setVolume(value || 0)"
        />
      </div>

      <!-- Download Button -->
      <q-btn
        v-if="showDownloadButton && audioBlob"
        color="grey-6"
        icon="download"
        :size="size"
        flat
        dense
        @click="downloadAudio"
      >
        <q-tooltip>
          Download audio
        </q-tooltip>
      </q-btn>
    </div>

    <!-- Loading Indicator -->
    <div v-if="isLoading" class="loading-container q-mt-sm">
      <q-spinner-dots size="sm" color="primary" />
      <span class="text-caption q-ml-sm">Loading audio...</span>
    </div>

    <!-- Error Display -->
    <div v-if="error" class="error-container q-mt-sm">
      <q-chip
        color="negative"
        text-color="white"
        icon="error"
        size="sm"
        :label="error"
      />
    </div>

    <!-- Audio Metadata -->
    <div v-if="showMetadata && metadata" class="metadata-container q-mt-sm">
      <div class="text-caption text-grey-6">
        {{ formatFileSize(metadata.size) }} • {{ metadata.mimeType.split('/')[1]?.toUpperCase() }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onUnmounted, nextTick } from 'vue';
import { audioService } from 'src/services/audioService';
import type { AudioMetadata } from 'src/types/audio';

// Define component name for ESLint
defineOptions({
  name: 'AudioPlayer'
});

// Props
interface Props {
  audioBlob?: Blob;
  audioUrl?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showProgressBar?: boolean;
  showVolumeControl?: boolean;
  showStopButton?: boolean;
  showDownloadButton?: boolean;
  showMetadata?: boolean;
  autoplay?: boolean;
  disabled?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  size: 'md',
  showProgressBar: true,
  showVolumeControl: true,
  showStopButton: true,
  showDownloadButton: false,
  showMetadata: false,
  autoplay: false,
  disabled: false
});

// Emits
interface Emits {
  (e: 'play'): void;
  (e: 'pause'): void;
  (e: 'stop'): void;
  (e: 'ended'): void;
  (e: 'timeUpdate', currentTime: number): void;
  (e: 'error', error: string): void;
}

const emit = defineEmits<Emits>();

// Reactive data
const audioElement = ref<HTMLAudioElement | null>(null);
const isPlaying = ref(false);
const currentTime = ref(0);
const duration = ref(0);
const volume = ref(1);
const isMuted = ref(false);
const isLoading = ref(false);
const error = ref<string | undefined>(undefined);
const metadata = ref<AudioMetadata | null>(null);
const isSeeking = ref(false);

// Computed
const isDisabled = computed(() => {
  return props.disabled || isLoading.value || !audioElement.value;
});

const volumeIcon = computed(() => {
  if (isMuted.value || volume.value === 0) {
    return 'volume_off';
  } else if (volume.value < 0.5) {
    return 'volume_down';
  } else {
    return 'volume_up';
  }
});

// Methods
async function loadAudio(): Promise<void> {
  if (!props.audioBlob && !props.audioUrl) {
    return;
  }

  isLoading.value = true;
  error.value = undefined;

  try {
    let audio: HTMLAudioElement;

    if (props.audioBlob) {
      audio = await audioService.playAudio(props.audioBlob);

      // Get metadata for blob
      try {
        metadata.value = await audioService.getAudioMetadata(props.audioBlob);
      } catch (metadataError) {
        console.warn('Failed to get audio metadata:', metadataError);
      }
    } else if (props.audioUrl) {
      audio = new Audio(props.audioUrl);
    } else {
      throw new Error('No audio source provided');
    }

    // Set up audio element
    audioElement.value = audio;
    audio.volume = volume.value;

    // Add event listeners
    audio.addEventListener('loadedmetadata', onLoadedMetadata);
    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('play', onPlay);
    audio.addEventListener('pause', onPause);
    audio.addEventListener('ended', onEnded);
    audio.addEventListener('error', onError);
    audio.addEventListener('loadstart', onLoadStart);
    audio.addEventListener('canplay', onCanPlay);

    // Load the audio
    audio.load();

    // Auto-play if requested
    if (props.autoplay) {
      await nextTick();
      void play();
    }

  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Failed to load audio';
    error.value = errorMessage;
    emit('error', errorMessage);
  } finally {
    isLoading.value = false;
  }
}

function play(): void {
  if (audioElement.value) {
    void audioElement.value.play();
  }
}

function pause(): void {
  if (audioElement.value) {
    audioElement.value.pause();
  }
}

function stop(): void {
  if (audioElement.value) {
    audioElement.value.pause();
    audioElement.value.currentTime = 0;
  }
  isPlaying.value = false;
  emit('stop');
}

function togglePlayPause(): void {
  if (isPlaying.value) {
    pause();
  } else {
    play();
  }
}

function seekTo(time: number): void {
  if (audioElement.value && !isSeeking.value) {
    audioElement.value.currentTime = time;
  }
}

function setVolume(newVolume: number): void {
  volume.value = newVolume;
  if (audioElement.value) {
    audioElement.value.volume = newVolume;
  }
}

function toggleMute(): void {
  isMuted.value = !isMuted.value;
  if (audioElement.value) {
    audioElement.value.muted = isMuted.value;
  }
}

function downloadAudio(): void {
  if (!props.audioBlob) return;

  try {
    const url = URL.createObjectURL(props.audioBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audio_${Date.now()}.${props.audioBlob.type.split('/')[1] || 'webm'}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Failed to download audio';
    error.value = errorMessage;
    emit('error', errorMessage);
  }
}

function formatTime(seconds: number): string {
  if (isNaN(seconds) || !isFinite(seconds)) return '0:00';

  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';

  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

// Event handlers
function onLoadedMetadata(): void {
  if (audioElement.value) {
    duration.value = audioElement.value.duration || 0;
  }
}

function onTimeUpdate(): void {
  if (audioElement.value && !isSeeking.value) {
    currentTime.value = audioElement.value.currentTime || 0;
    emit('timeUpdate', currentTime.value);
  }
}

function onPlay(): void {
  isPlaying.value = true;
  emit('play');
}

function onPause(): void {
  isPlaying.value = false;
  emit('pause');
}

function onEnded(): void {
  isPlaying.value = false;
  currentTime.value = 0;
  emit('ended');
}

function onError(): void {
  isLoading.value = false;
  const errorMessage = audioElement.value?.error?.message || 'Audio playback error';
  error.value = errorMessage;
  emit('error', errorMessage);
}

function onLoadStart(): void {
  isLoading.value = true;
}

function onCanPlay(): void {
  isLoading.value = false;
}

function cleanup(): void {
  if (audioElement.value) {
    // Remove event listeners
    audioElement.value.removeEventListener('loadedmetadata', onLoadedMetadata);
    audioElement.value.removeEventListener('timeupdate', onTimeUpdate);
    audioElement.value.removeEventListener('play', onPlay);
    audioElement.value.removeEventListener('pause', onPause);
    audioElement.value.removeEventListener('ended', onEnded);
    audioElement.value.removeEventListener('error', onError);
    audioElement.value.removeEventListener('loadstart', onLoadStart);
    audioElement.value.removeEventListener('canplay', onCanPlay);

    // Stop and reset
    audioElement.value.pause();
    audioElement.value.src = '';
    audioElement.value.load();
  }

  audioElement.value = null;
  isPlaying.value = false;
  currentTime.value = 0;
  duration.value = 0;
  error.value = undefined;
  metadata.value = null;
}

// Watchers
watch(() => props.audioBlob, () => {
  cleanup();
  void loadAudio();
}, { immediate: true });

watch(() => props.audioUrl, () => {
  cleanup();
  void loadAudio();
}, { immediate: true });

// Lifecycle
onUnmounted(() => {
  cleanup();
});
</script>

<style scoped>
.audio-player {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  width: 100%;
}

.progress-container {
  min-width: 150px;
}

.time-display {
  margin-top: 4px;
}

.volume-container {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 120px;
}

.loading-container,
.error-container,
.metadata-container {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

@media (max-width: 600px) {
  .volume-container {
    min-width: 80px;
  }

  .volume-container .q-slider {
    width: 60px !important;
  }
}
</style>