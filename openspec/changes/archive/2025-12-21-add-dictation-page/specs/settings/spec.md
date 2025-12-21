## ADDED Requirements
### Requirement: Dictation Settings Configuration
The system SHALL provide dictation-specific settings in the settings page for configuring default behavior.

#### Scenario: Default dictation playback settings
- **WHEN** user navigates to the dictation section in settings
- **THEN** default play count option is displayed with range 1-5 (default: 2)
- **AND** default interval between words option is displayed with range 1-10 seconds (default: 3)
- **AND** settings are immediately saved when changed

#### Scenario: Dictation preferences management
- **WHEN** user modifies dictation settings
- **THEN** changes are persisted to IndexedDB settings storage
- **AND** new defaults apply to all future dictation sessions
- **AND** current dictation sessions are not affected

#### Scenario: Reset dictation settings
- **WHEN** user resets dictation settings to defaults
- **THEN** play count returns to 2 and interval returns to 3 seconds
- **AND** user is shown confirmation message about reset completion