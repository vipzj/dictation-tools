## Context
The application currently has a basic tag management system but lacks comprehensive vocabulary learning features. Users need the ability to organize vocabulary into structured units, manage both Chinese and English terms, and record audio pronunciations for personalized learning.

## Goals / Non-Goals
**Goals:**
- Provide comprehensive unit management with full CRUD operations
- Enable vocabulary organization with Chinese words and English terms
- Implement audio recording and playback for each vocabulary item
- Create flexible search and filtering capabilities
- Maintain offline functionality with local IndexedDB storage
- Integrate with existing tag system for categorization
- Ensure responsive design for mobile and desktop use

**Non-Goals:**
- Advanced audio editing or processing capabilities
- AI-powered language learning or pronunciation analysis
- Server-side data synchronization or cloud backup
- Multi-user collaboration or sharing features
- Advanced learning analytics or progress tracking
- Voice recognition or automatic pronunciation scoring

## Decisions

**Decision: Unified Vocabulary Storage with Type Discrimination**
- **Why**: Simplifies data model, allows mixed vocabulary in units, easier to extend for other languages
- **Alternatives considered**:
  - Separate tables for Chinese and English (complex to manage, less flexible)
  - Language-specific unit types (restrictive, harder to mix languages)

**Decision: IndexedDB Blob Storage for Audio**
- **Why**: Complete offline functionality, no external dependencies, consistent with existing architecture
- **Alternatives considered**:
  - External audio files (requires file system management, less portable)
  - Cloud storage (breaks offline capability, adds external dependencies)

**Decision: Many-to-Many Unit-Tag Relationship**
- **Why**: Maximum flexibility in categorization, allows units to belong to multiple topics
- **Alternatives considered**:
  - Simple text tag storage (no tag reuse, inconsistent tagging)
  - One-to-many relationship (restrictive, limits categorization flexibility)

**Decision: Web Audio API for Recording**
- **Why**: Native browser support, no external libraries needed, good quality for voice recording
- **Alternatives considered**:
  - Third-party recording libraries (adds dependencies, larger bundle)
  - MediaStream Recording API only (less control over audio format)

## Architecture
```
src/
├── pages/
│   └── UnitManagement.vue           # Main unit management page
├── components/
│   ├── UnitForm.vue                # Unit creation/editing form
│   ├── UnitList.vue                # Units grid/list display
│   ├── VocabularyEditor.vue        # Vocabulary items management
│   ├── AudioRecorder.vue           # Audio recording component
│   ├── AudioPlayer.vue             # Audio playback component
│   └── TagSelector.vue             # Multi-tag selection component
├── services/
│   ├── indexeddb.ts                 # Enhanced with unit tables
│   └── audioService.ts             # Audio recording/playback utilities
├── types/
│   ├── unit.ts                     # Unit-related interfaces
│   └── audio.ts                    # Audio-related interfaces
└── utils/
    └── audioHelpers.ts             # Audio processing helpers
```

## Data Model

**Unit Structure:**
```typescript
interface Unit {
  id: string;
  name: string;           // 单元名称 (> 2 characters)
  createdAt: Date;
  updatedAt: Date;
}
```

**Vocabulary Item Structure:**
```typescript
interface VocabularyItem {
  id: string;
  unitId: string;
  type: 'chinese' | 'english';
  text: string;           // 中文词语或英文单词
  audioBlob?: Blob;      // 录制的声音 (optional)
  createdAt: Date;
  updatedAt: Date;
}
```

**Unit-Tag Relationship:**
```typescript
interface UnitTag {
  unitId: string;
  tagId: string;
  createdAt: Date;
}
```

## Audio Recording Architecture

**Recording Flow:**
1. User clicks record button → Request microphone permission
2. MediaRecorder API captures audio stream → Web Audio API processing
3. Audio stored as Blob in IndexedDB → Playback available immediately
4. Support for re-recording and deletion of existing audio

**Audio Format:**
- Input: MediaRecorder WebM/Opus format (browser standard)
- Storage: Original Blob for maximum compatibility
- Playback: Web Audio API for consistent cross-browser behavior
- Compression: Automatic blob size management for storage efficiency

## User Interface Design

**Unit Management Page Layout:**
1. **Header Section**: Search bar + tag filter controls
2. **Unit Grid**: Responsive cards showing unit name, word count, and tags
3. **Floating Action Button**: Create new unit
4. **Unit Details Modal/Drawer**: Vocabulary management interface

**Vocabulary Management Interface:**
1. **Unit Header**: Unit name, tag management
2. **Vocabulary List**: Two-column layout (Chinese/English) with audio controls
3. **Add Item Controls**: Quick add forms for both languages
4. **Audio Recording**: Inline record/play/delete buttons for each item

## Performance Considerations

**IndexedDB Optimization:**
- Separate tables for units, vocabulary items, and relationships
- Indexed queries for efficient search and filtering
- Blob storage with automatic cleanup for orphaned audio
- Pagination for large vocabulary lists

**Audio Management:**
- Lazy loading of audio blobs to reduce initial load time
- Audio compression for large recordings
- Cleanup of unused audio data when vocabulary items are deleted
- Memory-efficient audio playback with proper resource cleanup

**Search Performance:**
- Indexed search on unit names and vocabulary text
- Debounced search input to reduce database queries
- Efficient tag filtering with relationship table joins
- Caching of frequently accessed search results

## Browser Compatibility

**Audio Recording Requirements:**
- MediaRecorder API support (Chrome 47+, Firefox 25+, Safari 14+)
- Microphone permission handling for security
- Fallback messaging for unsupported browsers
- Progressive enhancement for basic functionality without audio

**IndexedDB Considerations:**
- Blob storage size limits across different browsers
- Transaction handling for audio data integrity
- Error handling for storage quota exceeded scenarios
- Graceful degradation when storage is limited

## Security Considerations

**Audio Data Privacy:**
- Local-only storage, no external audio transmission
- Secure microphone permission handling
- Audio blob validation to prevent malicious content
- User consent for microphone access with clear UI indicators

**Data Validation:**
- Input sanitization for unit names and vocabulary text
- Audio format validation before storage
- Size limits for audio recordings to prevent abuse
- SQL injection prevention in IndexedDB queries

## Accessibility Features

**Screen Reader Support:**
- Proper ARIA labels for all interactive elements
- Audio status announcements for recording/playback states
- Keyboard navigation for all unit and vocabulary operations
- High contrast mode support for audio controls

**Audio Accessibility:**
- Visual indicators for audio recording status
- Alternative text for audio-only content
- Volume controls with keyboard accessibility
- Clear error messages for audio permission issues