export interface AudioRecordingState {
  isRecording: boolean
  isPaused: boolean
  duration: number
  audioLevel: number
  permissionGranted: boolean
  permissionDenied: boolean
  error?: string
}

export interface AudioPlaybackState {
  isPlaying: boolean
  isPaused: boolean
  duration: number
  currentTime: number
  volume: number
  isLoading: boolean
  error?: string
}

export interface AudioRecorderOptions {
  mimeType?: string
  audioBitsPerSecond?: number
  sampleRate?: number
  maxDuration?: number // in seconds
}

export interface AudioPlayerOptions {
  volume?: number
  autoplay?: boolean
  loop?: boolean
}

export interface AudioMetadata {
  duration: number
  size: number
  mimeType: string
  recordedAt: Date
  sampleRate?: number
}

export type AudioPermissionState = 'prompt' | 'granted' | 'denied' | 'unsupported'

export interface RecordingConstraints {
  audio: {
    echoCancellation: boolean
    noiseSuppression: boolean
    autoGainControl: boolean
    sampleRate?: number
  }
}

export const DEFAULT_AUDIO_OPTIONS: AudioRecorderOptions = {
  mimeType: 'audio/webm;codecs=opus',
  audioBitsPerSecond: 128000,
  sampleRate: 44100,
  maxDuration: 300 // 5 minutes max
} as const;

export const DEFAULT_PLAYBACK_OPTIONS: AudioPlayerOptions = {
  volume: 1.0,
  autoplay: false,
  loop: false
} as const;

export const AUDIO_CONSTRAINTS: RecordingConstraints = {
  audio: {
    echoCancellation: true,
    noiseSuppression: true,
    autoGainControl: true,
    sampleRate: 44100
  }
} as const;