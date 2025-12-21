# enhance-dictation-interval-settings Implementation Tasks

## Phase 1: Core Infrastructure
- [x] **Task 1.1**: Update `DictationSettings` interface in `src/types/dictation.ts`
  - Add `intraWordInterval: number` field
  - Update `DEFAULT_DICTATION_SETTINGS` with default value of 1.0
  - Ensure TypeScript types are properly exported

- [x] **Task 1.2**: Update `AppSettings` interface in `src/types/settings.ts`
  - Add `intraWordInterval` to default settings
  - Update `DEFAULT_SETTINGS` constant
  - Verify type compatibility with existing code

- [x] **Task 1.3**: Update settings service in `src/services/settingsService.ts`
  - Add migration logic for existing settings without intra-word interval
  - Ensure backward compatibility when loading old settings
  - Test settings persistence and retrieval

## Phase 2: Audio Service Enhancement
- [x] **Task 2.1**: Modify `DictationAudioService` to support intra-word intervals
  - Update `playVocabularyItem` method to implement intra-word pauses
  - Modify audio queue processing to handle both interval types
  - Add proper timeout management for new intervals

- [x] **Task 2.2**: Update audio service progress tracking
  - Ensure progress callbacks work correctly with dual intervals
  - Update remaining interval calculations
  - Test accurate timing throughout playback

- [ ] **Task 2.3**: Add audio service unit tests
  - Test intra-word interval timing accuracy
  - Verify progress tracking with dual intervals
  - Test edge cases (single play, zero intervals, etc.)

## Phase 3: User Interface Updates
- [x] **Task 3.1**: Enhance `DictationDialog` component
  - Add intra-word interval input field with proper validation
  - Update layout to accommodate both interval settings
  - Add helpful tooltips and labels
  - Ensure responsive design

- [x] **Task 3.2**: Update settings page with dictation interval configuration
  - Add dictation settings section with both intervals
  - Implement proper input controls with validation
  - Add clear descriptions and user guidance
  - Test settings persistence and loading

- [x] **Task 3.3**: Update `DictationPracticeDialog` if needed
  - Check if any UI updates needed for dual interval display
  - Ensure progress indicators work correctly
  - Test with various interval combinations

## Phase 4: Database and Migration
- [x] **Task 4.1**: Update IndexedDB schema if needed
  - Verify settings storage supports new field
  - Add migration logic for existing data
  - Test data integrity after migration

- [x] **Task 4.2**: Test backward compatibility
  - Load and use existing dictation sessions
  - Verify settings loading for existing users
  - Test with various data states

## Phase 5: Testing and Validation
- [x] **Task 5.1**: End-to-end testing
  - Complete dictation workflow with dual intervals
  - Settings page configuration and persistence
  - Audio playback timing verification
  - Cross-browser compatibility testing

- [ ] **Task 5.2**: User experience validation
  - Test input validation and error handling
  - Verify tooltip and help text clarity
  - Test responsive design on various screen sizes
  - Check accessibility compliance

- [ ] **Task 5.3**: Performance testing
  - Verify no performance regression
  - Test with large vocabulary sets
  - Check memory usage during extended sessions

## Dependencies and Notes
- **Dependencies**: Tasks should be completed in sequential order within each phase
- **Parallel Work**: Phases 1-3 can be worked on simultaneously by different developers
- **Critical Path**: Audio service changes (Phase 2) depend on type updates (Phase 1)
- **Testing**: Continuous testing throughout development recommended
- **Documentation**: Update user documentation and component comments as needed