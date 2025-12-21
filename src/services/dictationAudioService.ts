import { vocabularyService } from './indexeddb'
import type { VocabularyItem } from '../types/unit'
import type { DictationSettings } from '../types/dictation'

export class DictationAudioService {
  private audioQueue: Array<{
    item: VocabularyItem
    playCount: number
    interval: number
    onComplete: () => void
  }> = []

  private isPlaying = false
  private currentAudio: HTMLAudioElement | null = null
  private currentTimeout: NodeJS.Timeout | null = null
  private currentPlayCount = 0  // 当前词语的播放次数
  private currentTotalPlayCount = 0  // 当前词语的总播放次数
  private isInInterval = false
  private remainingInterval = 0

  async playDictationSession(
    vocabularyItems: VocabularyItem[],
    settings: DictationSettings,
    onProgress?: (current: number, total: number) => void,
    onComplete?: () => void
  ): Promise<void> {
    if (this.isPlaying) {
      this.stop()
    }

    this.isPlaying = true
    this.audioQueue = []

    // Create queue for all vocabulary items
    vocabularyItems.forEach((item, index) => {
      this.audioQueue.push({
        item,
        playCount: settings.playCount,
        interval: settings.interval,
        onComplete: () => {
          onProgress?.(index + 1, vocabularyItems.length)
        }
      })
    })

    // Process the queue
    await this.processQueue()
    onComplete?.()
    this.isPlaying = false
    this.currentPlayCount = 0
    this.currentTotalPlayCount = 0
    this.isInInterval = false
    this.remainingInterval = 0
  }

  private async processQueue(): Promise<void> {
    const queueLength = this.audioQueue.length

    for (let i = 0; i < queueLength; i++) {
      if (!this.isPlaying) break

      const queueItem = this.audioQueue[i]!

      // Reset counters only when starting a new word (not before the first word)
      if (i > 0) {
        this.currentPlayCount = 1  // Start with first play of next word
        this.currentTotalPlayCount = queueItem.playCount
      }

      await this.playVocabularyItem(queueItem)

      // Add interval between items (except for the last one)
      if (i < queueLength - 1) {
        this.isInInterval = true
        this.remainingInterval = queueItem.interval
        await this.wait(queueItem.interval * 1000)
        if (!this.isPlaying) break
      }
      this.isInInterval = false
      this.remainingInterval = 0

      queueItem.onComplete()
    }

    // Reset counters when entire queue is finished
    this.currentPlayCount = 0
    this.currentTotalPlayCount = 0
  }

  private async playVocabularyItem(queueItem: {
    item: VocabularyItem
    playCount: number
    interval: number
  }): Promise<void> {
    const { item, playCount } = queueItem

    // Set the total play count for current item (only if not already set by processQueue)
    if (this.currentTotalPlayCount === 0) {
      this.currentTotalPlayCount = playCount
      this.currentPlayCount = 1 // Start with 1 (first play)
    }

    // Try to get recorded audio first
    const recordedAudio = await vocabularyService.getAudioBlob(item.id)

    if (recordedAudio) {
      // Play recorded audio
      for (let i = 0; i < playCount; i++) {
        if (!this.isPlaying) break

        // Set current play count before each play (i + 1 because i starts from 0)
        this.currentPlayCount = i + 1
        await this.playAudioBlob(recordedAudio)

        // Add small interval between plays of the same item
        if (i < playCount - 1) {
          await this.wait(500) // 500ms between repeats
        }
      }
    } else {
      // Use TTS fallback
      for (let i = 0; i < playCount; i++) {
        if (!this.isPlaying) break

        // Set current play count before each play (i + 1 because i starts from 0)
        this.currentPlayCount = i + 1
        await this.playTTS(item.text, item.type)

        // Add small interval between plays of the same item
        if (i < playCount - 1) {
          await this.wait(500) // 500ms between repeats
        }
      }
    }

    // Keep the final state (playCount / playCount) during interval time
    // Don't reset counters here - let processQueue handle it when starting next item
  }

  private async playAudioBlob(blob: Blob): Promise<void> {
    return new Promise((resolve) => {
      if (!this.isPlaying) {
        resolve()
        return
      }

      try {
        // Create object URL for the blob
        const audioUrl = URL.createObjectURL(blob)
        this.currentAudio = new Audio(audioUrl)

        this.currentAudio.onended = () => {
          URL.revokeObjectURL(audioUrl)
          this.currentAudio = null
          resolve()
        }

        this.currentAudio.onerror = (error) => {
          URL.revokeObjectURL(audioUrl)
          this.currentAudio = null
          console.error('Audio playback error:', error)
          resolve() // Continue even if audio fails
        }

        this.currentAudio.play().catch(error => {
          console.error('Failed to play audio:', error)
          URL.revokeObjectURL(audioUrl)
          this.currentAudio = null
          resolve() // Continue even if audio fails
        })
      } catch (error) {
        console.error('Error playing audio blob:', error)
        resolve()
      }
    })
  }

  private async playTTS(text: string, language: 'chinese' | 'english'): Promise<void> {
    return new Promise((resolve) => {
      if (!this.isPlaying) {
        resolve()
        return
      }

      try {
        // Check if speech synthesis is supported
        if (!('speechSynthesis' in window)) {
          console.warn('Speech synthesis not supported')
          resolve()
          return
        }

        // Cancel any ongoing speech
        window.speechSynthesis.cancel()

        const utterance = new SpeechSynthesisUtterance(text)

        // Set language based on vocabulary type
        utterance.lang = language === 'chinese' ? 'zh-CN' : 'en-US'
        utterance.rate = 0.8 // Slightly slower for dictation
        utterance.pitch = 1.0
        utterance.volume = 1.0

        utterance.onend = () => {
          resolve()
        }

        utterance.onerror = (error) => {
          console.error('TTS error:', error)
          resolve()
        }

        window.speechSynthesis.speak(utterance)
      } catch (error) {
        console.error('Error playing TTS:', error)
        resolve()
      }
    })
  }

  private wait(ms: number): Promise<void> {
    return new Promise(resolve => {
      const startTime = Date.now()

      const updateInterval = setInterval(() => {
        const elapsed = Date.now() - startTime
        const remaining = Math.max(0, Math.ceil((ms - elapsed) / 1000))
        this.remainingInterval = remaining

        if (remaining === 0) {
          clearInterval(updateInterval)
          resolve()
        }
      }, 100) // Update every 100ms

      this.currentTimeout = setTimeout(() => {
        clearInterval(updateInterval)
        resolve()
      }, ms)
    })
  }

  stop(): void {
    this.isPlaying = false

    // Stop current audio
    if (this.currentAudio) {
      this.currentAudio.pause()
      this.currentAudio = null
    }

    // Stop current timeout
    if (this.currentTimeout) {
      clearTimeout(this.currentTimeout)
      this.currentTimeout = null
    }

    // Stop any ongoing TTS
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel()
    }

    // Clear the queue
    this.audioQueue = []

    // Reset counters
    this.currentPlayCount = 0
    this.currentTotalPlayCount = 0
    this.isInInterval = false
    this.remainingInterval = 0
  }

  getIsPlaying(): boolean {
    return this.isPlaying
  }

  getCurrentPlayCount(): number {
    return this.currentPlayCount
  }

  getCurrentTotalPlayCount(): number {
    return this.currentTotalPlayCount
  }

  getIsInInterval(): boolean {
    return this.isInInterval
  }

  getRemainingInterval(): number {
    return this.remainingInterval
  }
}

export const dictationAudioService = new DictationAudioService()