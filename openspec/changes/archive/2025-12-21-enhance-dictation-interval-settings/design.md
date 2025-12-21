# enhance-dictation-interval-settings Design

## Architecture Overview

### Current State Analysis
The existing dictation system has a single `interval` setting that controls the pause between different words. The audio service processes vocabulary items sequentially, applying this interval after completing all plays of a word.

### Proposed Architecture

#### 1. Dual Interval System
- **Inter-word Interval** (`interval`): Pause between different vocabulary words (existing)
- **Intra-word Interval** (`intraWordInterval`): Pause between multiple plays of the same word (new)

#### 2. Audio Playback Flow Enhancement
```
For each vocabulary word:
  - Play word (1st time)
  - [intraWordInterval pause]
  - Play word (2nd time, if playCount > 1)
  - [intraWordInterval pause]
  - Play word (3rd time, if playCount > 2)
  - ... (repeat for playCount)
  - [interWordInterval pause] → Move to next word
```

#### 3. Settings Hierarchy
```
AppSettings
└── dictation: DictationSettings
    ├── playCount: number (1-5)
    ├── interval: number (1-10s) - Inter-word interval
    └── intraWordInterval: number (0.5-5s) - Intra-word interval
```

## Component Changes

### 1. Type System Updates
- `DictationSettings` interface gains `intraWordInterval` field
- Default settings updated with new interval value
- Backward compatibility through optional properties

### 2. UI Component Updates
- **DictationDialog**: Add input field for intra-word interval
- **Settings Page**: Add dictation interval configuration section
- **DictationPracticeDialog**: Display both intervals during playback

### 3. Service Layer Updates
- **dictationAudioService**: Implement dual interval logic
- **settingsService**: Handle new setting persistence
- **indexeddb**: Schema migration for new field

## Data Migration Strategy

### Database Schema Evolution
1. Add `intraWordInterval` field to `AppSettings` with default value
2. Update existing `DictationSession` records to include the new setting
3. Maintain compatibility with sessions created before the change

### Default Values
- `intraWordInterval`: 1.0 seconds (sensible pause between repetitions)
- Existing `interval`: 3.0 seconds (unchanged for compatibility)

## Implementation Considerations

### Performance Impact
- Minimal performance overhead
- Additional timeout management in audio service
- No impact on database query performance

### User Experience
- Clear labeling to distinguish between interval types
- Sensible defaults that work for most users
- Input validation to prevent confusing configurations

### Error Handling
- Graceful degradation for corrupted settings
- Fallback to defaults for invalid values
- Clear error messages for configuration issues

## Testing Strategy

### Unit Tests
- Audio service interval timing accuracy
- Settings service persistence and retrieval
- Type safety and validation

### Integration Tests
- End-to-end dictation session with both intervals
- Settings page configuration flow
- Backward compatibility with existing data

### User Acceptance Tests
- Dialog configuration validation
- Audio playback timing verification
- Settings persistence across sessions