import type { AppSettings } from '../types/settings'
import { DEFAULT_SETTINGS } from '../types/settings'

const SETTINGS_KEY = 'dictation-tools-settings'

export class SettingsService {
  private settings: AppSettings | null = null

  getSettings(): AppSettings {
    if (this.settings) {
      return this.settings
    }

    try {
      const stored = localStorage.getItem(SETTINGS_KEY)
      if (stored) {
        this.settings = JSON.parse(stored) as AppSettings
        // Ensure all default properties exist
        this.settings = this.mergeWithDefaults(this.settings)
      } else {
        this.settings = { ...DEFAULT_SETTINGS }
        this.saveSettings(this.settings)
      }
    } catch (error) {
      console.error('Failed to load settings:', error)
      this.settings = { ...DEFAULT_SETTINGS }
    }

    return this.settings
  }

  updateSettings(updates: Partial<AppSettings>): AppSettings {
    const current = this.getSettings()
    const updated = this.mergeSettings(current, updates)
    this.settings = updated
    this.saveSettings(updated)
    return updated
  }

  resetToDefaults(): AppSettings {
    this.settings = { ...DEFAULT_SETTINGS }
    this.saveSettings(this.settings)
    return this.settings
  }

  private saveSettings(settings: AppSettings): void {
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings))
    } catch (error) {
      console.error('Failed to save settings:', error)
      throw new Error('Failed to save settings')
    }
  }

  private mergeSettings(current: AppSettings, updates: Partial<AppSettings>): AppSettings {
    return {
      dictation: {
        ...current.dictation,
        ...updates.dictation
      }
    }
  }

  private mergeWithDefaults(settings: Partial<AppSettings>): AppSettings {
    return {
      dictation: {
        ...DEFAULT_SETTINGS.dictation,
        ...settings.dictation
      }
    }
  }
}

export const settingsService = new SettingsService()