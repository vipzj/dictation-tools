import { reviewVocabularyService, dictationAudioService } from './index'

export class ReviewAudioService {
  /**
   * Play audio for review vocabulary
   * Reuses the existing audio service logic
   */
  async playAudioForReviewVocabulary(reviewVocabId: string): Promise<void> {
    try {
      const reviewVocab = await reviewVocabularyService.getById(reviewVocabId)
      if (!reviewVocab) {
        throw new Error(`Review vocabulary ${reviewVocabId} not found`)
      }

      if (reviewVocab.hasAudio) {
        // Try to get audio blob from review vocabulary first
        const audioBlob = await reviewVocabularyService.getAudioBlob(reviewVocabId)

        if (audioBlob) {
          await dictationAudioService.playAudioBlob(audioBlob)
          return
        }
      }

      // Fallback to TTS
      await dictationAudioService.playTextToSpeech(reviewVocab.text, reviewVocab.type)
    } catch (error) {
      console.error(`Error playing audio for review vocabulary ${reviewVocabId}:`, error)
      throw error
    }
  }

  /**
   * Get audio URL for review vocabulary (for UI display)
   */
  async getAudioUrlForReviewVocabulary(reviewVocabId: string): Promise<string | null> {
    try {
      const audioBlob = await reviewVocabularyService.getAudioBlob(reviewVocabId)
      if (!audioBlob) return null

      return URL.createObjectURL(audioBlob)
    } catch (error) {
      console.error(`Error getting audio URL for review vocabulary ${reviewVocabId}:`, error)
      return null
    }
  }

  /**
   * Check if review vocabulary has audio available
   */
  async hasAudioAvailable(reviewVocabId: string): Promise<boolean> {
    try {
      const reviewVocab = await reviewVocabularyService.getById(reviewVocabId)
      if (!reviewVocab) return false

      if (reviewVocab.hasAudio) {
        const audioBlob = await reviewVocabularyService.getAudioBlob(reviewVocabId)
        return audioBlob !== null
      }

      return false
    } catch (error) {
      console.error(`Error checking audio availability for review vocabulary ${reviewVocabId}:`, error)
      return false
    }
  }

  /**
   * Record audio for review vocabulary (reuse existing recording logic)
   */
  async recordAudioForReviewVocabulary(reviewVocabId: string): Promise<Blob | null> {
    try {
      // Reuse the audio service recording functionality
      return await dictationAudioService.recordAudio()
    } catch (error) {
      console.error(`Error recording audio for review vocabulary ${reviewVocabId}:`, error)
      return null
    }
  }

  /**
   * Set recorded audio for review vocabulary
   */
  async setRecordedAudioForReviewVocabulary(reviewVocabId: string, audioBlob: Blob): Promise<boolean> {
    try {
      return await reviewVocabularyService.setAudioBlob(reviewVocabId, audioBlob)
    } catch (error) {
      console.error(`Error setting recorded audio for review vocabulary ${reviewVocabId}:`, error)
      return false
    }
  }

  /**
   * Play audio multiple times for review (common in dictation/review scenarios)
   */
  async playAudioMultipleTimes(reviewVocabId: string, playCount: number = 2, interval: number = 1000): Promise<void> {
    for (let i = 0; i < playCount; i++) {
      await this.playAudioForReviewVocabulary(reviewVocabId)

      // Add interval between plays (except after the last play)
      if (i < playCount - 1) {
        await new Promise(resolve => setTimeout(resolve, interval))
      }
    }
  }

  /**
   * Stop any currently playing audio
   */
  stopAudio(): void {
    dictationAudioService.stop()
  }

  /**
   * Check if audio is currently playing
   */
  isAudioPlaying(): boolean {
    return dictationAudioService.getIsPlaying()
  }

  /**
   * Get audio duration for review vocabulary (if available)
   */
  async getAudioDuration(reviewVocabId: string): Promise<number | null> {
    try {
      const audioBlob = await reviewVocabularyService.getAudioBlob(reviewVocabId)
      if (!audioBlob) return null

      // Create audio element to get duration
      return new Promise((resolve) => {
        const audio = new Audio()
        audio.addEventListener('loadedmetadata', () => {
          resolve(audio.duration)
        })
        audio.addEventListener('error', () => {
          resolve(null)
        })
        audio.src = URL.createObjectURL(audioBlob)
      })
    } catch (error) {
      console.error(`Error getting audio duration for review vocabulary ${reviewVocabId}:`, error)
      return null
    }
  }
}

export const reviewAudioService = new ReviewAudioService()