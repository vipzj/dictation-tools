<template>
  <div class="audio-recorder">
    <!-- Recording Controls -->
    <div class="row q-gutter-sm items-center">
      <!-- Record/Stop Button -->
      <q-btn
        :color="recordingState.isRecording ? 'negative' : 'primary'"
        :icon="recordingState.isRecording ? 'stop' : 'mic'"
        :size="size"
        round
        :disable="isDisabled"
        @click="toggleRecording"
      >
        <q-tooltip>
          {{ recordingState.isRecording ? 'Stop recording' : 'Start recording' }}
        </q-tooltip>
      </q-btn>

      <!-- Pause/Resume Button (shown when recording) -->
      <q-btn
        v-if="recordingState.isRecording"
        :color="recordingState.isPaused ? 'warning' : 'secondary'"
        :icon="recordingState.isPaused ? 'play_arrow' : 'pause'"
        :size="size"
        round
        @click="togglePause"
      >
        <q-tooltip>
          {{ recordingState.isPaused ? 'Resume recording' : 'Pause recording' }}
        </q-tooltip>
      </q-btn>

      <!-- Audio Level Indicator -->
      <div v-if="showAudioLevel" class="col audio-level-container">
        <div class="audio-level-bar">
          <div
            class="audio-level-fill"
            :style="{ width: `${recordingState.audioLevel}%` }"
          />
        </div>
        <div class="audio-level-text">
          {{ Math.round(recordingState.audioLevel) }}%
        </div>
      </div>

      <!-- Recording Duration -->
      <div v-if="showDuration && recordingState.isRecording" class="duration-text">
        {{ formatDuration(recordingDuration) }}
      </div>
    </div>

    <!-- Recording Status -->
    <div v-if="showStatus" class="status-container q-mt-sm">
      <q-chip
        v-if="recordingState.isRecording"
        :color="recordingState.isPaused ? 'warning' : 'negative'"
        text-color="white"
        :icon="recordingState.isPaused ? 'pause' : 'fiber_manual_record'"
        size="sm"
      >
        {{ recordingState.isPaused ? 'Paused' : 'Recording...' }}
      </q-chip>

      <q-chip
        v-if="recordingState.error"
        color="red"
        text-color="white"
        icon="error"
        size="sm"
      >
        {{ recordingState.error }}
      </q-chip>
    </div>

    <!-- Permission Dialog -->
    <q-dialog v-model="showPermissionDialog" persistent>
      <q-card>
        <q-card-section class="row items-center">
          <q-avatar icon="mic" color="primary" text-color="white" />
          <div class="q-ml-sm">
            <div class="text-h6">Microphone Access Required</div>
            <div class="text-caption">
              This app needs access to your microphone to record audio. Please grant permission when prompted.
            </div>
          </div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancel" color="grey" @click="cancelRecording" />
          <q-btn
            flat
            label="Grant Access"
            color="primary"
            @click="requestPermission"
            :loading="isRequestingPermission"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Permission Denied Dialog -->
    <q-dialog v-model="showPermissionDeniedDialog" persistent>
      <q-card>
        <q-card-section class="row items-center">
          <q-avatar icon="mic_off" color="negative" text-color="white" />
          <div class="q-ml-sm">
            <div class="text-h6">Microphone Access Denied</div>
            <div class="text-caption">
              Microphone access was denied. Please enable it in your browser settings to record audio.
            </div>
          </div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="OK" color="primary" @click="showPermissionDeniedDialog = false" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { audioService, AudioService } from 'src/services/audioService';
import type { AudioRecordingState } from 'src/types/audio';

// Define component name for ESLint
defineOptions({
  name: 'AudioRecorder'
});

// Props
interface Props {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showAudioLevel?: boolean;
  showDuration?: boolean;
  showStatus?: boolean;
  maxDuration?: number; // in seconds
  disabled?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  size: 'md',
  showAudioLevel: true,
  showDuration: true,
  showStatus: true,
  maxDuration: 120, // 2 minutes default
  disabled: false
});

// Emits
interface Emits {
  (e: 'recordingStarted'): void;
  (e: 'recordingStopped', audioBlob: Blob): void;
  (e: 'recordingPaused'): void;
  (e: 'recordingResumed'): void;
  (e: 'error', error: string): void;
}

const emit = defineEmits<Emits>();

// Reactive data
const recordingState = ref<AudioRecordingState>({
  isRecording: false,
  isPaused: false,
  duration: 0,
  audioLevel: 0,
  permissionGranted: false,
  permissionDenied: false
});

const recordingDuration = ref(0);
const showPermissionDialog = ref(false);
const showPermissionDeniedDialog = ref(false);
const isRequestingPermission = ref(false);
const updateInterval = ref<number | null>(null);

// Computed
const isDisabled = computed(() => {
  return props.disabled || !AudioService.isAudioSupported();
});

// Methods
async function toggleRecording(): Promise<void> {
  if (recordingState.value.isRecording) {
    await stopRecording();
  } else {
    await startRecording();
  }
}

async function startRecording(): Promise<void> {
  try {
    // Check if we have microphone permission
    const permissionState = await audioService.checkMicrophonePermission();

    if (permissionState === 'denied') {
      showPermissionDeniedDialog.value = true;
      return;
    }

    if (permissionState === 'prompt' || !recordingState.value.permissionGranted) {
      showPermissionDialog.value = true;
      return;
    }

    // Ensure we have microphone access before starting recording
    const hasMicrophoneAccess = await audioService.requestMicrophoneAccess();
    if (!hasMicrophoneAccess) {
      throw new Error('Microphone access denied');
    }

    // Start recording
    audioService.startRecording();
    recordingState.value = audioService.getRecordingState();
    recordingDuration.value = 0;

    emit('recordingStarted');
    startDurationTracking();
    startAudioLevelTracking();

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to start recording';
    recordingState.value.error = errorMessage;
    emit('error', errorMessage);
  }
}

async function stopRecording(): Promise<void> {
  try {
    stopDurationTracking();
    stopAudioLevelTracking();

    const audioBlob = await audioService.stopRecording();

    recordingState.value = audioService.getRecordingState();
    recordingDuration.value = 0;

    emit('recordingStopped', audioBlob);

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to stop recording';
    recordingState.value.error = errorMessage;
    emit('error', errorMessage);
  }
}

async function requestPermission(): Promise<void> {
  isRequestingPermission.value = true;

  try {
    const granted = await audioService.requestMicrophoneAccess();

    if (granted) {
      showPermissionDialog.value = false;
      recordingState.value.permissionGranted = true;
      recordingState.value.permissionDenied = false;

      // Auto-start recording after permission is granted
      await startRecording();
    } else {
      showPermissionDialog.value = false;
      showPermissionDeniedDialog.value = true;
      recordingState.value.permissionDenied = true;
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to request microphone access';
    recordingState.value.error = errorMessage;
    emit('error', errorMessage);
  } finally {
    isRequestingPermission.value = false;
  }
}

function cancelRecording(): void {
  showPermissionDialog.value = false;
}

function togglePause(): void {
  if (recordingState.value.isPaused) {
    audioService.resumeRecording();
    recordingState.value.isPaused = false;
    emit('recordingResumed');
    startDurationTracking();
  } else {
    audioService.pauseRecording();
    recordingState.value.isPaused = true;
    emit('recordingPaused');
    stopDurationTracking();
  }
}

function startDurationTracking(): void {
  stopDurationTracking(); // Clear any existing interval

  const startTime = Date.now() - (recordingDuration.value * 1000);

  updateInterval.value = window.setInterval(() => {
    recordingDuration.value = (Date.now() - startTime) / 1000;

    // Check max duration
    if (props.maxDuration && recordingDuration.value >= props.maxDuration) {
      void stopRecording();
    }

    // Update recording state
    recordingState.value.duration = recordingDuration.value;
  }, 100);
}

function stopDurationTracking(): void {
  if (updateInterval.value) {
    clearInterval(updateInterval.value);
    updateInterval.value = null;
  }
}

function startAudioLevelTracking(): void {
  const updateLevel = () => {
    if (recordingState.value.isRecording && !recordingState.value.isPaused) {
      recordingState.value.audioLevel = audioService.getAudioLevel();
    }

    if (recordingState.value.isRecording) {
      requestAnimationFrame(updateLevel);
    }
  };

  requestAnimationFrame(updateLevel);
}

function stopAudioLevelTracking(): void {
  recordingState.value.audioLevel = 0;
}

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

// Lifecycle
onMounted(async () => {
  // Check if audio is supported
  if (!AudioService.isAudioSupported()) {
    recordingState.value.error = 'Audio recording is not supported in this browser';
    emit('error', 'Audio recording is not supported in this browser');
    return;
  }

  // Check existing permission state
  try {
    const permissionState = await audioService.checkMicrophonePermission();
    recordingState.value.permissionGranted = permissionState === 'granted';
    recordingState.value.permissionDenied = permissionState === 'denied';
  } catch {
    // Permission check failed, assume prompt state
    recordingState.value.permissionGranted = false;
    recordingState.value.permissionDenied = false;
  }
});

onUnmounted(() => {
  stopDurationTracking();
  stopAudioLevelTracking();

  // Clean up audio service if recording
  if (recordingState.value.isRecording) {
    void stopRecording();
  }
});

// Watch for recording state changes from the service
watch(() => audioService.getRecordingState(), (newState) => {
  recordingState.value = { ...recordingState.value, ...newState };
}, { deep: true });
</script>

<style scoped>
.audio-recorder {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.audio-level-container {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 120px;
}

.audio-level-bar {
  flex: 1;
  height: 6px;
  background-color: #e0e0e0;
  border-radius: 3px;
  overflow: hidden;
  position: relative;
}

.audio-level-fill {
  height: 100%;
  background: linear-gradient(90deg, #4caf50, #ffc107, #f44336);
  transition: width 0.1s ease;
  border-radius: 3px;
}

.audio-level-text {
  font-size: 12px;
  color: #666;
  min-width: 35px;
  text-align: right;
}

.duration-text {
  font-family: 'Courier New', monospace;
  font-size: 14px;
  color: #666;
  min-width: 50px;
  text-align: center;
}

.status-container {
  display: flex;
  align-items: center;
  gap: 8px;
}

@media (max-width: 600px) {
  .audio-level-container {
    min-width: 80px;
  }

  .audio-level-text {
    display: none;
  }
}
</style>