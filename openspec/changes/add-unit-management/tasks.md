## 1. Unit Management Infrastructure
- [x] 1.1 Create UnitManagement.vue page component
- [x] 1.2 Add Unit Management route to router configuration
- [x] 1.3 Add Unit Management navigation item to MainLayout
- [x] 1.4 Create basic page layout with search and filter controls
- [x] 1.5 Implement responsive design for mobile compatibility

## 2. Data Model and Types
- [x] 2.1 Create Unit, VocabularyItem, and UnitTag interfaces in types/unit.ts
- [x] 2.2 Create Audio-related interfaces in types/audio.ts
- [x] 2.3 Implement data validation schemas and type guards
- [x] 2.4 Add unit-related enums and constants

## 3. Enhanced IndexedDB Service
- [x] 3.1 Extend indexeddb.ts with units, vocabulary, and unitTags tables
- [x] 3.2 Add unit CRUD service methods (create, read, update, delete)
- [x] 3.3 Implement vocabulary item management methods
- [x] 3.4 Add unit-tag relationship management
- [x] 3.5 Implement search and filtering queries with proper indexing
- [ ] 3.6 Add audio blob storage and retrieval methods

## 4. Unit Form Component
- [x] 4.1 Create UnitForm.vue component for unit creation/editing
- [x] 4.2 Implement unit name validation (min 2 characters)
- [x] 4.3 Add TagSelector component for multi-tag selection
- [x] 4.4 Create modal/dialog workflow for unit operations
- [x] 4.5 Add form submission handling with error management

## 5. Unit List Component
- [ ] 5.1 Create UnitList.vue component for grid display
- [ ] 5.2 Implement responsive grid layout with card design
- [ ] 5.3 Add unit count calculation and display
- [ ] 5.4 Implement tag display with colored chips
- [ ] 5.5 Add unit action buttons (edit, delete, manage vocabulary)

## 6. Search and Filter Components
- [ ] 6.1 Create SearchBar component for unit name search
- [ ] 6.2 Create TagFilter component for tag-based filtering
- [ ] 6.3 Implement debounced search input handling
- [ ] 6.4 Add combined search and filter logic
- [ ] 6.5 Implement filter state management and URL synchronization

## 7. Vocabulary Management Components
- [ ] 7.1 Create VocabularyEditor.vue component for vocabulary item management
- [ ] 7.2 Implement separate sections for Chinese and English vocabulary
- [ ] 7.3 Add quick-add forms for both language types
- [ ] 7.4 Create vocabulary item list with inline editing
- [ ] 7.5 Implement vocabulary item validation and error handling

## 8. Audio Recording Service
- [ ] 8.1 Create audioService.ts with Web Audio API integration
- [ ] 8.2 Implement microphone permission handling
- [ ] 8.3 Add MediaRecorder API integration for audio capture
- [ ] 8.4 Create audio format validation and conversion utilities
- [ ] 8.5 Implement audio blob compression and size management

## 9. Audio Recording Components
- [ ] 9.1 Create AudioRecorder.vue component
- [ ] 9.2 Implement record/pause/stop controls with visual feedback
- [ ] 9.3 Add audio level monitoring and recording indicators
- [ ] 9.4 Create recording duration display and limits
- [ ] 9.5 Add recording error handling and retry mechanisms

## 10. Audio Playback Components
- [ ] 10.1 Create AudioPlayer.vue component
- [ ] 10.2 Implement play/pause/stop controls
- [ ] 10.3 Add volume control and progress indicators
- [ ] 10.4 Create audio waveform visualization (optional enhancement)
- [ ] 10.5 Implement audio playback state management

## 11. Vocabulary Item Audio Integration
- [ ] 11.1 Integrate AudioRecorder and AudioPlayer into vocabulary editor
- [ ] 11.2 Add audio recording buttons for each vocabulary item
- [ ] 11.3 Implement audio existence checking and display states
- [ ] 11.4 Add audio deletion and re-recording functionality
- [ ] 11.5 Create audio recording status indicators

## 12. Unit-Vocabulary Relationship Management
- [ ] 12.1 Implement unit-to-vocabulary item associations
- [ ] 12.2 Add vocabulary counting and statistics
- [ ] 12.3 Create vocabulary item migration when units are deleted
- [ ] 12.4 Implement vocabulary search within units
- [ ] 12.5 Add vocabulary export/import capabilities

## 13. Error Handling and User Feedback
- [ ] 13.1 Implement comprehensive error messages for all operations
- [ ] 13.2 Add toast notifications for operation feedback
- [ ] 13.3 Create loading states and progress indicators
- [ ] 13.4 Implement retry mechanisms for transient errors
- [ ] 13.5 Add audio permission handling with user guidance

## 14. Browser Compatibility and Fallbacks
- [ ] 14.1 Implement audio API feature detection
- [ ] 14.2 Create fallback UI for unsupported audio features
- [ ] 14.3 Add IndexedDB compatibility checking
- [ ] 14.4 Implement graceful degradation for older browsers
- [ ] 14.5 Add browser-specific audio format handling

## 15. Performance Optimization
- [ ] 15.1 Implement lazy loading for audio blobs
- [ ] 15.2 Add pagination for large vocabulary lists
- [ ] 15.3 Optimize IndexedDB queries with proper indexing
- [ ] 15.4 Implement audio blob cleanup for unused recordings
- [ ] 15.5 Add memory management for audio playback

## 16. Accessibility Features
- [ ] 16.1 Add ARIA labels for all interactive elements
- [ ] 16.2 Implement keyboard navigation for all controls
- [ ] 16.3 Add screen reader announcements for audio states
- [ ] 16.4 Create high contrast mode support
- [ ] 16.5 Add audio control accessibility features

## 17. Quality Assurance and Testing
- [ ] 17.1 Test unit CRUD operations with various data scenarios
- [ ] 17.2 Test vocabulary item management with edge cases
- [ ] 17.3 Test audio recording and playback across browsers
- [ ] 17.4 Test search and filtering functionality
- [ ] 17.5 Test responsive design on various screen sizes
- [ ] 17.6 Test error handling and user feedback flows
- [ ] 17.7 Test data integrity after complex operations
- [ ] 17.8 Test offline functionality and data persistence

## 18. Internationalization Support
- [ ] 18.1 Add translation keys for all unit management text
- [ ] 18.2 Implement error message translations
- [ ] 18.3 Add audio control labels in multiple languages
- [ ] 18.4 Create accessibility labels for screen readers
- [ ] 18.5 Test multi-language compatibility