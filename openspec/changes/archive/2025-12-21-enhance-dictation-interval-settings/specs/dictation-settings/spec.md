# dictation-settings Specification Enhancement

## ADDED Requirements

### Requirement: Dual Interval Configuration System
The system SHALL support both inter-word and intra-word interval settings for dictation sessions.

#### Scenario: Configure intra-word interval in dictation dialog
- **WHEN** user opens dictation settings dialog
- **THEN** intra-word interval input field is displayed with range 0.5-5.0 seconds (default: 1.0)
- **AND** field is clearly labeled as "同一词语播放间隔" (Interval between same word plays)
- **AND** existing inter-word interval field remains labeled as "词语间隔时间" (Interval between words)
- **AND** both settings can be adjusted independently

#### Scenario: Default dual interval values
- **WHEN** dictation dialog opens for the first time or settings are reset
- **THEN** intra-word interval defaults to 1.0 seconds
- **AND** inter-word interval defaults to 3.0 seconds (existing default)
- **AND** play count defaults to 2 times (existing default)

### Requirement: Enhanced Audio Playback with Dual Intervals
The system SHALL implement audio playback that respects both inter-word and intra-word interval settings.

#### Scenario: Multi-play word with intra-word intervals
- **WHEN** a word is configured to play 3 times with 1.0 second intra-word interval
- **THEN** word plays first time
- **AND** 1.0 second pause occurs
- **AND** word plays second time
- **AND** 1.0 second pause occurs
- **AND** word plays third time
- **AND** no additional intra-word pause after final play

#### Scenario: Transition between words with inter-word intervals
- **WHEN** all plays of a word are completed and there are more words remaining
- **THEN** inter-word interval pause occurs (e.g., 3.0 seconds)
- **AND** next word begins playing after the inter-word interval
- **AND** no inter-word interval after the final word of the session

#### Scenario: Single play word behavior
- **WHEN** a word is configured to play only 1 time
- **THEN** no intra-word interval is applied
- **AND** playback proceeds directly to inter-word interval (if not last word)

### Requirement: Settings Page Dual Interval Configuration
The system SHALL provide comprehensive interval configuration in the settings page.

#### Scenario: Default interval settings management
- **WHEN** user navigates to dictation section in settings page
- **THEN** both interval settings are displayed with their current default values
- **AND** intra-word interval shows range 0.5-5.0 seconds with 0.1 second precision
- **AND** inter-word interval shows range 1-10 seconds with 1 second precision
- **AND** play count shows range 1-5 times

#### Scenario: Save and apply default intervals
- **WHEN** user modifies interval settings in settings page
- **THEN** changes are immediately saved to IndexedDB
- **AND** new defaults apply to all future dictation sessions
- **AND** existing in-progress dictation sessions are not affected
- **AND** dictation dialog shows updated default values on next open

### Requirement: Backward Compatibility and Migration
The system SHALL maintain compatibility with existing dictation sessions and settings.

#### Scenario: Load existing session without intra-word interval
- **WHEN** system loads a dictation session created before intra-word intervals existed
- **THEN** session uses default intra-word interval of 1.0 seconds
- **AND** existing inter-word interval setting is preserved
- **AND** session plays correctly with hybrid settings

#### Scenario: Settings migration for existing users
- **WHEN** user with existing settings first uses enhanced dictation system
- **THEN** intra-word interval is automatically added to settings with default value of 1.0
- **AND** all existing dictation settings remain unchanged
- **AND** user sees both interval options in settings page immediately

### Requirement: Input Validation and User Experience
The system SHALL provide clear validation and feedback for interval settings.

#### Scenario: Interval input validation
- **WHEN** user enters invalid intra-word interval value
- **THEN** input field shows validation error
- **AND** specific message explains valid range (0.5-5.0 seconds)
- **AND** save operation is blocked until valid value is provided
- **AND** field returns to last valid value on cancel

#### Scenario: User guidance for interval types
- **WHEN** user hovers over interval input fields
- **THEN** tooltip explains the purpose of each interval type
- **AND** intra-word interval tooltip describes "Pause between multiple plays of the same word"
- **AND** inter-word interval tooltip describes "Pause between different words"