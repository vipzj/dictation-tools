# add-dictation-review-system Design

## System Architecture

### Review Algorithm Design

#### Ebbinghaus Memory Curve Implementation
The system will implement the standard Ebbinghaus forgetting curve with the following review intervals:
- Level 0: Initial learning (from dictation)
- Level 1: 1 day after first correct review
- Level 2: 2 days after second correct review
- Level 3: 4 days after third correct review
- Level 4: 7 days after fourth correct review
- Level 5: 15 days after fifth correct review
- Level 6: 30 days after sixth correct review
- Level 7+: 30 days (maintenance level)

#### Memory State Model
Each vocabulary item maintains:
- **Memory Level**: Current mastery level (0-7)
- **Last Review Date**: When the item was last reviewed
- **Next Review Date**: Calculated based on memory level and performance
- **Error Count**: Total incorrect attempts in recent reviews
- **Success Streak**: Consecutive correct reviews
- **Difficulty Score**: Weighted score based on error patterns

#### Review Prioritization Algorithm
1. **Overdue Items**: Items past their next review date get highest priority
2. **Error Frequency**: Items with more errors get higher priority within same category
3. **Recently Learned**: New items (Level 0) get priority for initial learning
4. **Load Balancing**: Distribute review load across different units and difficulty levels

### Data Model Design

#### ReviewSession
```typescript
interface ReviewSession {
  id: string
  vocabularyItems: ReviewItem[]
  settings: ReviewSettings
  startedAt: Date
  completedAt?: Date
  accuracy?: number
  duration?: number
}
```

#### ReviewResult
```typescript
interface ReviewResult {
  id: string
  vocabularyItemId: string
  vocabularyText: string
  vocabularyType: 'chinese' | 'english'
  isCorrect: boolean
  audioSource: 'recorded' | 'tts'
  responseTime: number // milliseconds
  reviewSessionId: string
  memoryState: MemoryState
}
```

#### MemoryState
```typescript
interface MemoryState {
  vocabularyItemId: string
  memoryLevel: number // 0-7
  lastReviewDate: Date
  nextReviewDate: Date
  errorCount: number
  successStreak: number
  difficultyScore: number
  createdAt: Date
  updatedAt: Date
}
```

### Database Schema Extensions

#### New Tables
- **memoryStates**: Tracks memory state for each vocabulary item
- **reviewSessions**: Stores review session metadata
- **reviewResults**: Individual review attempt results

#### Indexes for Performance
- memoryStates: `vocabularyItemId`, `nextReviewDate`, `memoryLevel`
- reviewResults: `vocabularyItemId`, `reviewSessionId`
- reviewSessions: `startedAt`, `completedAt`

### Service Layer Architecture

#### ReviewService
```typescript
class ReviewService {
  // Generate review session based on memory states and settings
  generateReviewSession(settings: ReviewSettings): ReviewSession

  // Complete review session and update memory states
  completeReviewSession(sessionId: string, results: ReviewResult[]): void

  // Get overdue vocabulary items for review
  getOverdueItems(limit: number): VocabularyItem[]

  // Update memory state based on review result
  updateMemoryState(vocabularyItemId: string, isCorrect: boolean): void
}
```

#### MemoryAlgorithmService
```typescript
class MemoryAlgorithmService {
  // Calculate next review date based on memory level and performance
  calculateNextReviewDate(memoryState: MemoryState, isCorrect: boolean): Date

  // Calculate memory level progression
  calculateMemoryLevel(currentLevel: number, isCorrect: boolean, errorCount: number): number

  // Calculate difficulty score based on error patterns
  calculateDifficultyScore(memoryState: MemoryState): number
}
```

### UI Component Design

#### ReviewPage.vue
- **Review Queue Display**: Shows current and upcoming items
- **Audio Playback**: Integrated with existing audio infrastructure
- **Input Interface**: Similar to dictation but with review-specific features
- **Progress Tracking**: Real-time progress and memory level indicators
- **Performance Feedback**: Immediate feedback with memory state updates

#### ReviewHistoryPage.vue
- **Session List**: Similar to dictation history with review-specific metrics
- **Progress Analytics**: Memory level distribution and improvement trends
- **Filtering Options**: By date range, memory level, performance
- **Management Features**: Individual session deletion and bulk operations

#### Settings Integration
- **Review Configuration**: Word count, difficulty range, unit selection
- **Schedule Preferences**: Maximum daily reviews, reminder settings
- **Algorithm Options**: Memory curve parameters (advanced users)

### Performance Considerations

#### Efficient Querying
- Pre-calculate next review dates during session completion
- Use compound indexes for complex filtering operations
- Implement pagination for large review histories
- Cache frequently accessed memory states

#### Scalability
- Background processing for memory state updates
- Lazy loading of review history
- Optimized database queries for large vocabulary sets
- Efficient memory state synchronization

### Integration Points

#### Existing Systems
- **Dictation History**: Source for initial vocabulary items and error patterns
- **Vocabulary Service**: Audio playback and text-to-speech integration
- **Settings Service**: Configuration management for review preferences
- **Navigation System**: Integration with existing app navigation

#### Data Flow
1. **Initial Learning**: Dictation results create initial memory states (Level 0)
2. **Review Generation**: Algorithm analyzes memory states and history
3. **Review Execution**: Users complete review sessions with audio playback
4. **Memory Update**: Algorithm updates memory states based on performance
5. **History Tracking**: All review attempts recorded for analysis

### Error Handling and Edge Cases

#### Algorithm Edge Cases
- **No Overdue Items**: Generate review from lower priority items or new vocabulary
- **Large Vocabulary Sets**: Implement pagination and load balancing
- **Inconsistent Data**: Handle missing or corrupted memory state records
- **Performance Issues**: Fallback to simpler prioritization if algorithm too slow

#### User Experience Edge Cases
- **Empty Review Queue**: Provide alternative learning activities
- **Network Interruptions**: Save progress and allow session resumption
- **Audio Playback Failures**: Graceful fallback to text-only review
- **Session Interruption**: Save partial progress for later completion