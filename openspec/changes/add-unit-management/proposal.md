# Change: Add Unit Management with Multi-Language Vocabulary

## Why
Enable users to create and manage vocabulary units with Chinese words and English terms, complete with audio recording capabilities. This provides a comprehensive language learning tool where users can organize vocabulary by units, tag them for categorization, and record pronunciations for each term.

## What Changes
- Add new Unit Management page with full CRUD operations for units
- Implement unit data model with name, tags, and vocabulary items
- Add vocabulary item management (Chinese words and English terms) with audio recording
- Create audio recording and playback functionality using Web Audio API
- Implement search functionality by unit name and tag filtering
- Add unit list display with unit name, word count, and associated tags
- Extend IndexedDB schema to support units, vocabulary items, and audio blobs
- Create comprehensive unit-to-tag many-to-many relationship management

## Impact
- Affected specs: New capability `unit-management` (ADDED), Extended `tag-management` (MODIFIED)
- Affected code: New UnitManagement.vue page, enhanced IndexedDB service, navigation updates, audio recording components
- Dependencies: Web Audio API (browser native), MediaRecorder API (browser native)

**Benefits:**
- **Organized Learning**: Users can structure vocabulary learning by units and topics
- **Multi-Language Support**: Combined Chinese and English vocabulary management
- **Audio Learning**: Personal pronunciation recordings for better learning retention
- **Flexible Organization**: Tag-based categorization for customized learning paths
- **Search & Filter**: Quick access to specific units and vocabulary sets
- **Offline Capability**: All data stored locally with IndexedDB including audio

## Scope
- **In Scope**: Unit CRUD operations, vocabulary item management, audio recording/playback, search and filtering, tag management integration
- **In Scope**: Web Audio API integration for recording and playback
- **In Scope**: IndexedDB storage for units, vocabulary items, and audio blobs
- **In Scope**: Many-to-many relationship between units and tags
- **Out of Scope**: Server-side data synchronization or cloud storage
- **Out of Scope**: Advanced audio editing or processing features
- **Out of Scope**: AI-powered language learning features
- **Out of Scope**: Sharing or exporting units to other users