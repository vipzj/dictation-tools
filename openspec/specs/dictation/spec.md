# dictation Specification

## Purpose
TBD - created by archiving change add-dictation-page. Update Purpose after archive.
## Requirements
### Requirement: Dictation Page with Unit Search
The system SHALL provide a dedicated dictation page where users can search and select units for practice.

#### Scenario: Search units by keywords
- **WHEN** user types keywords in the search bar on dictation page
- **THEN** units list is filtered to show only units matching the search query in name or vocabulary content
- **AND** search is case-insensitive and works on partial matches

#### Scenario: Filter units by tags
- **WHEN** user selects one or more tags in the tag filter
- **THEN** units list shows only units associated with selected tags
- **AND** multiple tag filters use AND logic (unit must have all selected tags)

#### Scenario: Combined search and tag filtering
- **WHEN** user applies both keyword search and tag filters
- **THEN** units list shows units matching both criteria
- **AND** results update in real-time as user changes filters

### Requirement: Unit Dictation Dialog
The system SHALL provide a dialog for configuring dictation settings when a unit is selected.

#### Scenario: Open unit dictation dialog
- **WHEN** user clicks on a unit in the search results
- **THEN** a dialog opens showing unit name, vocabulary count, and dictation settings
- **AND** dialog includes configurable options for play count and interval between words

#### Scenario: Configure dictation settings
- **WHEN** user adjusts dictation settings in the dialog
- **THEN** play count defaults to 2 times per word
- **AND** interval between words defaults to 3 seconds
- **AND** settings can be customized from 1-5 play counts and 1-10 second intervals

#### Scenario: Start dictation session
- **WHEN** user clicks "Start Dictation" button in the dialog
- **THEN** dictation practice begins with the configured settings
- **AND** dialog closes and practice interface appears

### Requirement: Audio Playback System
The system SHALL play vocabulary audio with recorded audio preferred and TTS fallback.

#### Scenario: Play recorded audio
- **WHEN** a vocabulary item has recorded audio available
- **THEN** the system plays the recorded audio for the configured number of times
- **AND** recorded audio takes precedence over TTS

#### Scenario: TTS fallback for missing audio
- **WHEN** a vocabulary item has no recorded audio
- **THEN** the system uses browser's text-to-speech functionality to generate audio
- **AND** TTS is played for the configured number of times

#### Scenario: Mixed audio types in session
- **WHEN** a unit contains items with both recorded audio and TTS-only items
- **THEN** the system seamlessly plays appropriate audio type for each item
- **AND** user experience remains consistent regardless of audio source

### Requirement: Dictation Practice Interface
The system SHALL provide a focused practice interface without displaying the words being dictated.

#### Scenario: Progress tracking display
- **WHEN** dictation session is in progress
- **THEN** interface shows "Completed X of Y" progress indicator
- **AND** a visual progress bar shows completion percentage
- **AND** no vocabulary words are visible during playback

#### Scenario: Audio playback with intervals
- **WHEN** playing vocabulary audio
- **THEN** each word is played according to configured play count
- **AND** configured interval of silence occurs between different words
- **AND** visual indicator shows when audio is playing vs silent intervals

#### Scenario: Dictation session completion
- **WHEN** all vocabulary items have been played
- **THEN** dictation practice interface automatically closes
- **AND** dictation results recording page automatically opens

### Requirement: Dictation Results Recording
The system SHALL provide a results page for users to evaluate their dictation performance.

#### Scenario: Display all vocabulary items
- **WHEN** dictation results page opens
- **THEN** all vocabulary items from the practiced unit are listed
- **AND** each item shows the word text and a correctness toggle
- **AND** all items default to "correct" status

#### Scenario: Self-evaluation interface
- **WHEN** user reviews dictation results
- **THEN** user can toggle each item between correct and incorrect
- **AND** visual feedback clearly shows current status of each item
- **AND** summary shows total correct, incorrect, and accuracy percentage

#### Scenario: Save dictation results
- **WHEN** user clicks "Save Results" button
- **THEN** the dictation session data is saved to IndexedDB
- **AND** data includes unit ID, timestamp, results for each item, and overall score
- **AND** user is returned to the dictation page for next session

### Requirement: Dictation Results Storage
The system SHALL persist dictation session results in IndexedDB for tracking progress.

#### Scenario: Store session data
- **WHEN** dictation results are saved
- **THEN** session is stored with unique ID, unit reference, timestamp, and detailed results
- **AND** each vocabulary item result is stored with correctness status
- **AND** calculated metrics (accuracy, completion time) are stored

#### Scenario: Retrieve dictation history
- **WHEN** user views dictation statistics or history
- **THEN** all saved dictation sessions are available for analysis
- **AND** sessions can be filtered by unit, date range, or performance metrics

### Requirement: Dictation Settings Integration
The system SHALL integrate dictation settings with the existing settings system.

#### Scenario: Default dictation settings
- **WHEN** user opens settings page
- **THEN** dictation section shows default play count and interval settings
- **AND** users can modify defaults that apply to future dictation sessions

#### Scenario: Session-specific overrides
- **WHEN** user modifies settings in the dictation dialog
- **THEN** changes apply only to the current session
- **AND** default settings in settings page remain unchanged

