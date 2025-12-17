# unit-management Specification

## Purpose
TBD - created by archiving change add-unit-management. Update Purpose after archive.
## Requirements
### Requirement: Unit Data Model
The system SHALL store units with a unique identifier, name, and support for tag associations.

#### Scenario: Unit creation with valid data
- **WHEN** a user creates a new unit with valid name (2+ characters)
- **THEN** the unit is stored with a unique ID and creation timestamp
- **AND** the user can optionally associate multiple tags during creation

#### Scenario: Unit name validation
- **WHEN** a user attempts to create a unit with name length less than 2 characters
- **THEN** the system SHALL display an error message and prevent creation

### Requirement: Unit Storage with IndexedDB
The system SHALL persist all unit data using IndexedDB for offline functionality.

#### Scenario: Data persistence
- **WHEN** units are created, updated, or deleted
- **THEN** changes are immediately persisted to IndexedDB

#### Scenario: Data retrieval on app load
- **WHEN** the application starts
- **THEN** all existing units are loaded from IndexedDB into memory

### Requirement: Unit CRUD Operations
The system SHALL provide complete Create, Read, Update, and Delete operations for units.

#### Scenario: Create new unit
- **WHEN** user fills out unit form and submits
- **THEN** new unit is created and appears in unit list
- **AND** user can immediately add vocabulary items to the unit

#### Scenario: Update existing unit
- **WHEN** user edits unit name or tag associations and saves changes
- **THEN** unit is updated and changes are reflected immediately in the interface

#### Scenario: Delete unit
- **WHEN** user clicks delete button and confirms action
- **THEN** unit and all associated vocabulary items are permanently removed from storage
- **AND** all associated audio data is also cleaned up

#### Scenario: List all units
- **WHEN** user navigates to unit management page
- **THEN** all existing units are displayed in a responsive grid layout
- **AND** each unit shows name, vocabulary count, and associated tags

### Requirement: Vocabulary Item Management
The system SHALL allow users to add, edit, and delete Chinese words and English terms within each unit.

#### Scenario: Add Chinese vocabulary item
- **WHEN** user adds a new Chinese word to a unit
- **THEN** the word is stored with type 'chinese' and associated with the unit
- **AND** user can immediately record audio for the word

#### Scenario: Add English vocabulary item
- **WHEN** user adds a new English term to a unit
- **THEN** the term is stored with type 'english' and associated with the unit
- **AND** user can immediately record audio for the term

#### Scenario: Edit vocabulary item
- **WHEN** user modifies the text of a vocabulary item
- **THEN** the item is updated and changes are immediately reflected
- **AND** any existing audio recording remains associated with the item

#### Scenario: Delete vocabulary item
- **WHEN** user deletes a vocabulary item
- **THEN** the item and its associated audio recording are permanently removed
- **AND** unit vocabulary count is updated accordingly

### Requirement: Audio Recording Functionality
The system SHALL provide audio recording capabilities for each vocabulary item using Web Audio API.

#### Scenario: Record audio for vocabulary item
- **WHEN** user clicks record button for a vocabulary item
- **THEN** system requests microphone permission
- **AND** user can record audio using device microphone
- **AND** recording is stored as blob in IndexedDB associated with the item

#### Scenario: Play recorded audio
- **WHEN** user clicks play button for a vocabulary item with recorded audio
- **THEN** the associated audio blob is played using Web Audio API
- **AND** playback controls are available (play, pause, stop)

#### Scenario: Re-record audio
- **WHEN** user records new audio for an item that already has audio
- **THEN** previous audio recording is replaced with new recording
- **AND** user is warned before replacing existing audio

#### Scenario: Delete audio recording
- **WHEN** user deletes audio recording for a vocabulary item
- **THEN** audio blob is removed from storage
- **AND** vocabulary item remains without audio

### Requirement: Unit-Tag Many-to-Many Relationship
The system SHALL support many-to-many relationships between units and tags.

#### Scenario: Associate multiple tags with unit
- **WHEN** user selects multiple tags for a unit
- **THEN** all selected tag associations are stored in the relationship table
- **AND** unit can be filtered by any of its associated tags

#### Scenario: Remove tag association
- **WHEN** user removes a tag from a unit
- **THEN** the specific relationship is removed from storage
- **AND** unit remains associated with other selected tags

#### Scenario: Tag deletion impact
- **WHEN** a tag is deleted from the system
- **THEN** all unit-tag relationships for that tag are automatically cleaned up

### Requirement: Search and Filtering
The system SHALL provide search functionality by unit name and filtering by tags.

#### Scenario: Search units by name
- **WHEN** user types in the search bar
- **THEN** units list is filtered to show only units matching the search query
- **AND** search is case-insensitive and works on partial matches

#### Scenario: Filter units by tag
- **WHEN** user selects one or more tags in the filter
- **THEN** units list shows only units associated with selected tags
- **AND** multiple tag filters use AND logic (unit must have all selected tags)

#### Scenario: Combined search and filter
- **WHEN** user applies both name search and tag filters
- **THEN** units list shows units matching both criteria
- **AND** filters work together without conflicts

### Requirement: Unit List Display
The system SHALL display units in a responsive list format showing unit name, vocabulary count, and tags.

#### Scenario: Unit grid display
- **WHEN** user views the unit management page
- **THEN** units are displayed in a responsive grid layout
- **AND** each unit card shows name, total vocabulary count, and all associated tags

#### Scenario: Vocabulary count calculation
- **WHEN** displaying units
- **THEN** vocabulary count shows total number of Chinese words and English terms
- **AND** count updates immediately when vocabulary items are added or removed

#### Scenario: Tag display in unit list
- **WHEN** displaying units with associated tags
- **THEN** tags are shown as colored chips below the unit name
- **AND** tag colors match the tag management system colors

### Requirement: Audio Permission Handling
The system SHALL handle microphone permissions gracefully with proper user guidance.

#### Scenario: Microphone permission request
- **WHEN** user tries to record audio for the first time
- **THEN** system requests microphone permission with clear explanation
- **AND** provides guidance if permission is denied

#### Scenario: Permission denied handling
- **WHEN** user denies microphone permission
- **THEN** system displays helpful message explaining how to enable permission
- **AND** provides alternative access to browser settings

#### Scenario: Permission check before recording
- **WHEN** user clicks record button
- **THEN** system checks microphone permission status before attempting recording
- **AND** shows appropriate message if permission is not available

### Requirement: Error Handling and Validation
The system SHALL provide comprehensive error handling and input validation.

#### Scenario: Duplicate unit name handling
- **WHEN** user attempts to create unit with existing name
- **THEN** system displays error message and prevents creation
- **AND** suggests alternative names or edits

#### Scenario: Audio recording errors
- **WHEN** audio recording fails due to technical issues
- **THEN** system displays clear error message with troubleshooting guidance
- **AND** allows user to retry recording

#### Scenario: Storage quota exceeded
- **WHEN** IndexedDB storage limit is reached
- **THEN** system displays warning message with guidance to free up space
- **AND** provides options to delete old audio recordings

#### Scenario: Network connectivity
- **WHEN** application is offline
- **THEN** all unit and vocabulary operations continue to function normally
- **AND** data is synchronized when connectivity is restored

### Requirement: Responsive Design
The system SHALL provide responsive design that works on mobile and desktop devices.

#### Scenario: Mobile unit list
- **WHEN** viewing units on mobile device
- **THEN** unit grid adapts to single column layout
- **AND** touch interactions are optimized for mobile use

#### Scenario: Mobile vocabulary editing
- **WHEN** editing vocabulary on mobile device
- **THEN** interface is optimized for touch input
- **AND** audio recording controls are easily accessible

#### Scenario: Desktop unit management
- **WHEN** using unit management on desktop
- **THEN** interface takes advantage of larger screen space
- **AND** keyboard shortcuts are available for common operations

