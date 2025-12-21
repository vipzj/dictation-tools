# review-system Specification

## Purpose
Implement an intelligent review system using spaced repetition methodology to improve long-term vocabulary retention through scientifically-based review scheduling.

## ADDED Requirements

### Requirement: Review Session Generation
The system SHALL dynamically generate review sessions based on vocabulary memory states and user settings.

#### Scenario: Generate review session with Ebbinghaus algorithm
- **WHEN** user requests a review session
- **THEN** system analyzes vocabulary memory states to identify overdue items
- **AND** prioritizes items based on memory level, error frequency, and last review date
- **AND** generates review session with specified word count from settings (default: 15)
- **AND** includes vocabulary from multiple units to ensure balanced review
- **AND** excludes items recently reviewed within their memory interval

#### Scenario: Handle insufficient overdue items
- **WHEN** fewer overdue items exist than requested review count
- **THEN** system includes items from lower priority categories (new items, low error frequency)
- **AND** maintains minimum review session size of 5 items
- **AND** clearly indicates which items are priority vs. filler items
- **AND** logs session composition for algorithm improvement

### Requirement: Memory State Management
The system SHALL maintain and update memory states for each vocabulary item based on review performance.

#### Scenario: Update memory state after correct review
- **WHEN** user correctly reviews a vocabulary item
- **THEN** memory level increases by 1 (maximum level 7)
- **AND** next review date is calculated using Ebbinghaus intervals (1-2-4-7-15-30 days)
- **AND** success streak is incremented
- **AND** error count is reset to 0
- **AND** difficulty score is recalculated

#### Scenario: Update memory state after incorrect review
- **WHEN** user incorrectly reviews a vocabulary item
- **THEN** memory level decreases by 1 (minimum level 0)
- **AND** next review date is set to next day for immediate re-review
- **AND** success streak is reset to 0
- **AND** error count is incremented
- **AND** difficulty score increases based on consecutive errors

#### Scenario: Initialize memory state from dictation results
- **WHEN** vocabulary item is first encountered in dictation
- **THEN** initial memory level is set to 0 (newly learned)
- **AND** next review date is set to next day for initial review
- **AND** initial difficulty score is calculated based on dictation performance
- **AND** error count reflects dictation session errors

### Requirement: Review Session Workflow
The system SHALL provide a review interface similar to dictation but optimized for spaced repetition.

#### Scenario: Start review session with audio playback
- **WHEN** user begins review session
- **THEN** system displays current vocabulary item with audio playback
- **AND** plays audio according to user's dictation settings (play count, intervals)
- **AND** shows input interface for user response
- **AND** displays memory level and review history for context
- **AND** provides hint options if user struggles

#### Scenario: Process user response and provide feedback
- **WHEN** user submits response for vocabulary item
- **THEN** system evaluates response correctness immediately
- **AND** provides visual feedback (correct/incorrect indicators)
- **AND** shows correct answer if response was incorrect
- **AND** updates memory state based on performance
- **AND** moves to next vocabulary item in review queue

#### Scenario: Complete review session and save results
- **WHEN** user completes all items in review session
- **THEN** system calculates overall session accuracy and duration
- **THEN** saves complete review session to history
- **AND** updates all affected memory states
- **AND** provides session summary with performance insights
- **AND** suggests next review date based on algorithm

### Requirement: Review Settings Configuration
The system SHALL provide configurable review settings accessible through the settings page.

#### Scenario: Configure review word count
- **WHEN** user accesses review settings in settings page
- **THEN** option to set review session word count is available
- **AND** default value is 15 words
- **AND** valid range is 5-50 words
- **AND** setting persists across application restarts
- **AND** changes apply to next review session

#### Scenario: Configure review difficulty
- **WHEN** user accesses review settings
- **THEN** option to filter review by difficulty level is available
- **AND** options include: All levels, Easy only (levels 4-7), Hard only (levels 0-3)
- **AND** system prioritizes items matching selected difficulty
- **AND** setting affects algorithm's item selection logic

#### Scenario: Configure review schedule
- **WHEN** user accesses review settings
- **THEN** option to set maximum daily reviews is available
- **AND** default value is 30 reviews per day
- **AND** system respects this limit when generating sessions
- **AND** provides indicator when daily limit is reached

### Requirement: Review History Management
The system SHALL provide comprehensive review history viewing and management capabilities.

#### Scenario: View review history list
- **WHEN** user navigates to review history page
- **THEN** all review sessions are displayed chronologically
- **AND** each session shows date, accuracy, word count, and duration
- **AND** sessions are filterable by date range and performance
- **AND** memory level progression indicators are shown
- **AND** performance trends are visually represented

#### Scenario: Delete individual review session
- **WHEN** user deletes a review session from history
- **THEN** confirmation dialog warns about memory state recalculation
- **AND** upon confirmation, session is removed from history
- **AND** affected memory states are recalculated from remaining data
- **AND** recalculation process is indicated to user

#### Scenario: View vocabulary review details
- **WHEN** user clicks on a review session in history
- **THEN** detailed session information is displayed
- **AND** individual vocabulary items with their performance are shown
- **AND** memory level changes for each item are visible
- **AND** time spent on each item is displayed
- **AND** error patterns and improvement trends are highlighted

### Requirement: Review Algorithm Integration
The system SHALL integrate review algorithm seamlessly with existing dictation and vocabulary systems.

#### Scenario: Generate initial memory states from existing dictation history
- **WHEN** review system is first activated
- **THEN** system analyzes existing dictation sessions
- **AND** creates initial memory states for all vocabulary items
- **AND** calculates initial memory levels based on dictation performance
- **AND** schedules initial reviews for items needing attention
- **AND** provides summary of initialization process to user

#### Scenario: Handle vocabulary updates and changes
- **WHEN** vocabulary items are modified or deleted
- **THEN** corresponding memory states are updated or removed
- **AND** review schedules are recalculated as needed
- **AND** users are notified of significant changes to review queue
- **AND** orphaned memory states are cleaned up automatically

#### Scenario: Balance review distribution across units
- **WHEN** generating review sessions
- **THEN** algorithm ensures balanced distribution across different units
- **AND** prevents over-representation of single units in sessions
- **AND** maintains minimum diversity of at least 3 different units per session
- **AND** respects user preferences for specific unit focus

### Requirement: Performance and Scalability
The system SHALL handle large vocabulary sets efficiently and provide responsive user experience.

#### Scenario: Generate review sessions quickly
- **WHEN** user requests review session with large vocabulary set (>1000 items)
- **THEN** session generation completes within 2 seconds
- **AND** algorithm uses optimized database queries with appropriate indexes
- **AND** memory state calculations are cached for frequently accessed items
- **AND** user sees progress indicator during session generation

#### Scenario: Handle concurrent review sessions
- **WHEN** multiple review sessions are active (web tabs)
- **THEN** system prevents duplicate memory state updates
- **AND** implements optimistic locking for memory state modifications
- **AND** provides clear error messages for concurrent access conflicts
- **AND** automatically merges conflicting changes when possible

### Requirement: Error Handling and Recovery
The system SHALL provide robust error handling and data recovery mechanisms.

#### Scenario: Recover from interrupted review session
- **WHEN** review session is interrupted (browser crash, network issue)
- **THEN** partial progress is automatically saved
- **AND** user can resume session from point of interruption
- **AND** memory states for completed items remain updated
- **AND** session continues with remaining items

#### Scenario: Handle corrupted memory state data
- **WHEN** system detects corrupted or inconsistent memory state
- **THEN** item is flagged for manual review
- **AND** system attempts to reconstruct state from review history
- **AND** if reconstruction fails, item is reset to initial learning state
- **AND** user is notified of data recovery actions

#### Scenario: Validate algorithm calculations
- **WHEN** system performs memory state calculations
- **THEN** all calculations are validated for logical consistency
- **AND** invalid results trigger fallback to safe defaults
- **AND** calculation errors are logged for debugging
- **AND** system maintains data integrity throughout review process