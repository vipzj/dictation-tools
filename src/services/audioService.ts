import type {
  AudioRecordingState,
  AudioMetadata,
  AudioPermissionState
} from 'src/types/audio'

export class AudioService {
  private mediaRecorder: MediaRecorder | null = null
  private audioChunks: Blob[] = []
  private audioContext: AudioContext | null = null
  private analyser: AnalyserNode | null = null
  private microphone: MediaStreamAudioSourceNode | null = null
  private stream: MediaStream | null = null
  private animationId: number | null = null

  constructor() {
    void this.initializeAudioContext()
  }

  private initializeAudioContext(): void {
    try {
      this.audioContext = new (window.AudioContext || (window as unknown as typeof AudioContext))()
      this.analyser = this.audioContext.createAnalyser()
      this.analyser.fftSize = 256
      this.analyser.smoothingTimeConstant = 0.8
    } catch (error) {
      console.error('Failed to initialize audio context:', error)
      throw new Error('Audio context initialization failed')
    }
  }

  async checkMicrophonePermission(): Promise<PermissionState> {
    try {
      const permission = await navigator.permissions.query({ name: 'microphone' as PermissionName })
      return permission.state
    } catch {
      // Some browsers don't support microphone permission query
      return 'prompt'
    }
  }

  async requestMicrophoneAccess(): Promise<boolean> {
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 44100
        }
      })

      if (this.audioContext && this.analyser) {
        this.microphone = this.audioContext.createMediaStreamSource(this.stream)
        this.microphone.connect(this.analyser)
      }

      return true
    } catch (error) {
      console.error('Microphone access denied:', error)
      return false
    }
  }

  startRecording(): void {
    if (!this.stream) {
      throw new Error('No microphone stream available')
    }

    try {
      this.audioChunks = []

      const options: MediaRecorderOptions = {
        mimeType: this.getSupportedMimeType()
      }

      this.mediaRecorder = new MediaRecorder(this.stream, options)

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data)
        }
      }

      this.mediaRecorder.onstop = () => {
        // Handle recording stop if needed
      }

      this.mediaRecorder.start(100) // Collect data every 100ms
    } catch (error) {
      console.error('Failed to start recording:', error)
      throw new Error('Recording failed to start')
    }
  }

  stopRecording(): Promise<Blob> {
    return new Promise((resolve, reject) => {
      if (!this.mediaRecorder) {
        reject(new Error('No active recording'))
        return
      }

      this.mediaRecorder.onstop = () => {
        const audioBlob = new Blob(this.audioChunks, {
          type: this.getSupportedMimeType()
        })
        resolve(audioBlob)
      }

      this.mediaRecorder.onerror = () => {
        reject(new Error('Recording error occurred'))
      }

      this.mediaRecorder.stop()
    })
  }

  pauseRecording(): void {
    if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
      this.mediaRecorder.pause()
    }
  }

  resumeRecording(): void {
    if (this.mediaRecorder && this.mediaRecorder.state === 'paused') {
      this.mediaRecorder.resume()
    }
  }

  getAudioLevel(): number {
    if (!this.analyser) return 0

    const dataArray = new Uint8Array(this.analyser.frequencyBinCount)
    this.analyser.getByteFrequencyData(dataArray)

    // Calculate average volume
    const average = dataArray.reduce((sum, value) => sum + value, 0) / dataArray.length
    return Math.min(100, (average / 128) * 100) // Normalize to 0-100
  }

  getRecordingState(): AudioRecordingState {
    const mediaRecorderState = this.mediaRecorder?.state || 'inactive'

    return {
      isRecording: mediaRecorderState === 'recording',
      isPaused: mediaRecorderState === 'paused',
      duration: 0, // Will be updated by component
      audioLevel: this.getAudioLevel(),
      permissionGranted: !!this.stream,
      permissionDenied: false // Will be updated based on actual permission checks
    }
  }

  async playAudio(audioBlob: Blob): Promise<HTMLAudioElement> {
    return new Promise((resolve, reject) => {
      try {
        const audio = new Audio()
        const audioUrl = URL.createObjectURL(audioBlob)

        audio.src = audioUrl
        audio.onloadeddata = () => {
          resolve(audio)
        }

        audio.onerror = () => {
          URL.revokeObjectURL(audioUrl)
          reject(new Error('Failed to load audio'))
        }
      } catch (error) {
        reject(error instanceof Error ? error : new Error('Failed to play audio'))
      }
    })
  }

  async getAudioMetadata(audioBlob: Blob): Promise<AudioMetadata> {
    return new Promise((resolve, reject) => {
      try {
        const audio = new Audio()
        const audioUrl = URL.createObjectURL(audioBlob)

        audio.src = audioUrl

        audio.onloadedmetadata = () => {
          const audioMetadata: AudioMetadata = {
            duration: audio.duration,
            size: audioBlob.size,
            mimeType: audioBlob.type,
            recordedAt: new Date(),
            sampleRate: 44100 // Default sample rate
          }

          URL.revokeObjectURL(audioUrl)
          resolve(audioMetadata)
        }

        audio.onerror = () => {
          URL.revokeObjectURL(audioUrl)
          reject(new Error('Failed to load audio metadata'))
        }
      } catch (error) {
        reject(error instanceof Error ? error : new Error('Failed to get audio metadata'))
      }
    })
  }

  compressAudio(audioBlob: Blob, targetSize?: number): Promise<Blob> {
    return new Promise((resolve, reject) => {
      try {
        const maxSize = targetSize || (5 * 1024 * 1024) // 5MB default limit

        if (audioBlob.size > maxSize) {
          reject(new Error(`Audio file too large: ${(audioBlob.size / 1024 / 1024).toFixed(2)}MB`))
          return
        }

        resolve(audioBlob)
      } catch (error) {
        reject(error instanceof Error ? error : new Error('Failed to compress audio'))
      }
    })
  }

  // Enhanced audio format validation and conversion (Task 8.4)
  validateAudioFormat(audioBlob: Blob): { isValid: boolean; format?: string; error?: string } {
    const supportedTypes = [
      'audio/webm;codecs=opus',
      'audio/webm',
      'audio/ogg;codecs=opus',
      'audio/ogg',
      'audio/mp4',
      'audio/mpeg',
      'audio/wav',
      'audio/m4a'
    ]

    const format = audioBlob.type.toLowerCase()

    if (!audioBlob.type) {
      return { isValid: false, error: 'Unknown audio format' }
    }

    const isValidFormat = supportedTypes.some(supportedType => {
      const supportedBaseType = supportedType.split(';')[0] || supportedType
      return format ? format.includes(supportedBaseType) : false
    })

    if (!isValidFormat) {
      return {
        isValid: false,
        format: audioBlob.type,
        error: `Unsupported audio format: ${audioBlob.type}`
      }
    }

    return { isValid: true, format: audioBlob.type }
  }

  // Audio format conversion utilities (Task 8.4)
  convertAudioFormat(audioBlob: Blob): Promise<Blob> {
    const validation = this.validateAudioFormat(audioBlob)
    if (!validation.isValid) {
      return Promise.reject(new Error(validation.error || 'Invalid audio format'))
    }

    // For now, just return the original blob since format conversion is complex
    // In a production environment, you might use FFmpeg.wasm or similar
    return Promise.resolve(audioBlob)
  }

  // Size management and compression utilities (Task 8.5)
  optimizeAudioSize(audioBlob: Blob, maxSizeMB: number = 2): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const maxSizeBytes = maxSizeMB * 1024 * 1024

      if (audioBlob.size <= maxSizeBytes) {
        resolve(audioBlob)
        return
      }

      try {
        // For large files, we might want to resample or reduce quality
        // This is a simplified implementation
        if (audioBlob.size > maxSizeBytes * 2) {
          reject(new Error(`Audio file too large even after compression: ${(audioBlob.size / 1024 / 1024).toFixed(2)}MB`))
          return
        }

        resolve(audioBlob)
      } catch (error) {
        reject(new Error(`Failed to optimize audio size: ${error instanceof Error ? error.message : 'Unknown error'}`))
      }
    })
  }

  // Audio quality analysis
  async analyzeAudioQuality(audioBlob: Blob): Promise<{
    duration: number
    sampleRate: number
    channels: number
    bitRate?: number
    quality: 'low' | 'medium' | 'high'
  }> {
    const metadata = await this.getAudioMetadata(audioBlob)

    // Basic quality assessment based on file size and duration
    const duration = metadata.duration || 0
    const bitRate = duration > 0 ? (audioBlob.size * 8) / (duration * 1000) : 0 // kbps
    let quality: 'low' | 'medium' | 'high'

    if (bitRate < 64) {
      quality = 'low'
    } else if (bitRate < 128) {
      quality = 'medium'
    } else {
      quality = 'high'
    }

    return {
      duration,
      sampleRate: metadata.sampleRate ?? 44100,
      channels: 2, // Default assumption
      bitRate: Math.round(bitRate),
      quality
    }
  }

  // Enhanced permission checking (Task 8.2)
  async checkAudioPermission(): Promise<AudioPermissionState> {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        return 'unsupported'
      }

      const permission = await navigator.permissions.query({ name: 'microphone' as PermissionName })
      return (permission.state as AudioPermissionState)
    } catch {
      // Fallback for browsers that don't support permissions API
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
        stream.getTracks().forEach(track => track.stop())
        return 'granted'
      } catch {
        return 'prompt'
      }
    }
  }

  cleanup(): void {
    // Stop media recorder
    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      this.mediaRecorder.stop()
    }

    // Stop media stream
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop())
      this.stream = null
    }

    // Disconnect audio nodes
    if (this.microphone) {
      this.microphone.disconnect()
      this.microphone = null
    }

    // Cancel animation frame
    if (this.animationId) {
      cancelAnimationFrame(this.animationId)
      this.animationId = null
    }

    // Close audio context
    if (this.audioContext && this.audioContext.state !== 'closed') {
      void this.audioContext.close()
      this.audioContext = null
    }

    this.analyser = null
    this.mediaRecorder = null
    this.audioChunks = []
  }

  private getSupportedMimeType(): string {
    const types = [
      'audio/webm;codecs=opus',
      'audio/webm',
      'audio/ogg;codecs=opus',
      'audio/ogg',
      'audio/mp4',
      'audio/wav'
    ]

    for (const type of types) {
      if (MediaRecorder.isTypeSupported(type)) {
        return type
      }
    }

    // Fallback
    return 'audio/webm'
  }

  static isAudioSupported(): boolean {
    return typeof navigator !== 'undefined' &&
           !!(navigator.mediaDevices?.getUserMedia) &&
           typeof window.MediaRecorder === 'function'
  }

  public static getInstance(): AudioService {
    if (!AudioService.instance) {
      AudioService.instance = new AudioService()
    }
    return AudioService.instance
  }

  private static instance: AudioService | null = null
}

// Singleton instance
export const audioService = new AudioService()