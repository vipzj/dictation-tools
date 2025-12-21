# Change: Add Dictation Page with Unit-based Audio Practice

## Why
Enable users to practice dictation using their existing vocabulary units with configurable audio playback settings, allowing them to test their listening comprehension and retention.

## What Changes
- Add new dictation page for unit search and selection
- Implement unit dictation dialog with configurable settings (play count, interval)
- Create dictation practice interface with progress tracking (no word display during practice)
- Implement audio playback system (prefer recorded audio, fallback to TTS)
- Add dictation results recording page with self-evaluation
- Store dictation results in IndexedDB with timestamps
- Add default dictation settings to system settings

## Impact
- Affected specs:
  - `dictation` (new capability)
  - `settings` (add dictation settings)
- Affected code:
  - New dictation page and components
  - Audio playback system
  - IndexedDB schema for dictation results
  - Settings page updates