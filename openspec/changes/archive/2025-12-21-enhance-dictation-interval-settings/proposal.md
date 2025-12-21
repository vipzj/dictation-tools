# enhance-dictation-interval-settings Proposal

## Summary
Enhance the dictation functionality by adding individual word playback interval settings (intra-word interval) and expanding the settings page with comprehensive interval configuration options.

## Problem Statement
Currently, the dictation system only supports interval settings between different words (inter-word interval). However, users need more granular control over timing, specifically:
1. The ability to set a pause between multiple plays of the same word (intra-word interval)
2. Centralized configuration of all interval defaults in the settings page

## Proposed Solution
Add a new interval type called `intraWordInterval` to the dictation settings, which controls the pause between multiple plays of the same individual word. This complements the existing `interval` (inter-word interval) that controls the pause between different words.

## Scope
### In Scope
- Add `intraWordInterval` setting to `DictationSettings` interface
- Update dictation dialog to show both interval settings
- Modify audio service to implement intra-word intervals
- Update settings page with default configuration for both intervals
- Maintain backward compatibility with existing sessions

### Out of Scope
- Changes to audio recording functionality
- Modifications to vocabulary management
- Changes to dictation results storage
- Mobile-specific adaptations

## User Value
- More precise control over dictation pacing
- Better learning experience with adjustable repetition timing
- Centralized configuration for consistent defaults
- Enhanced customization options for different learning styles

## Success Criteria
- Users can configure both inter-word and intra-word intervals in the dictation dialog
- Settings page provides default configuration for both interval types
- Audio playback respects both interval settings correctly
- Existing dictation sessions continue to work without issues
- Default values provide sensible starting points for new users

## Architecture Considerations
- Requires updates to TypeScript interfaces and database schema
- Audio service needs modification to handle two types of intervals
- Settings storage needs to accommodate the new configuration
- Backward compatibility must be maintained for existing data

## Dependencies
- Existing dictation system
- Settings service infrastructure
- Audio playback service
- IndexedDB storage for settings