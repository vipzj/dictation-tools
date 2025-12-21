# add-dictation-history-page Design

## Architecture Overview

### Current State Analysis
The dictation system already stores comprehensive session data in IndexedDB through `DictationSession` entities. However, this data is only used for internal statistics and lacks a user interface for viewing and management.

### Proposed Architecture

#### 1. Data Access Layer
- **Enhanced dictationService**: Add methods for filtered history retrieval
- **Efficient querying**: Implement IndexedDB queries with sorting and filtering
- **Performance optimization**: Pagination or virtual scrolling for large datasets

#### 2. UI Component Structure
```
DictationHistoryPage
├── Search and Filter Section
│   ├── Keyword search input
│   ├── Unit filter dropdown
│   └── Tag filter multi-select
├── Session List
│   ├── SessionCard components
│   └── Loading states and pagination
└── Session Details
    ├── Performance metrics
    └── Delete confirmation dialog
```

#### 3. Data Flow
```
User Request → Filter Parameters → IndexedDB Query → Session Data → UI Rendering
              ↓
    Cache Management ← Pagination Logic ← Virtual Scrolling ← Large Dataset
```

## Component Design

### 1. DictationHistoryPage.vue
**Purpose**: Main page container with filtering and list management
**State Management**: Local reactive state for filters and pagination
**Responsibilities**:
- Manage search and filter state
- Handle session deletion
- Coordinate with data service
- Manage loading and error states

### 2. SessionCard.vue Component
**Purpose**: Individual session display component
**Props**: Session data, selection state
**Features**:
- Display key metrics (accuracy, duration, date)
- Visual indicators for performance
- Delete action with confirmation
- Navigation to detailed view

### 3. SessionFilters.vue Component
**Purpose**: Reusable filtering controls
**Emits**: Filter change events
**Components**:
- Search input with debouncing
- Unit selection dropdown
- Tag multi-select with chips

## Data Management Strategy

### Enhanced dictationService Methods
```typescript
interface DictationService {
  // Existing methods...

  // New history management methods
  getDictationHistory(filters?: HistoryFilters, pagination?: PaginationOptions): Promise<PaginatedSessions>
  deleteDictationSession(sessionId: string): Promise<void>
  getHistoryStatistics(filters?: HistoryFilters): Promise<HistoryStats>
}

interface HistoryFilters {
  keyword?: string
  unitIds?: string[]
  tagIds?: string[]
  dateRange?: [Date, Date]
  accuracyRange?: [number, number]
}

interface PaginationOptions {
  page: number
  pageSize: number
  sortBy: 'completedAt' | 'accuracy' | 'duration'
  sortOrder: 'asc' | 'desc'
}
```

### IndexedDB Query Optimization
- Create compound indexes for common query patterns
- Implement cursor-based pagination for efficiency
- Cache frequently accessed filter combinations
- Background query processing for UI responsiveness

## Performance Considerations

### Data Volume Strategy
- **Initial Load**: Load first 20-50 sessions immediately
- **Progressive Loading**: Load additional data as user scrolls
- **Caching**: Cache filtered results for quick navigation
- **Background Updates**: Refresh data in background without blocking UI

### Memory Management
- Virtual scrolling for large lists (>1000 sessions)
- Lazy loading of session details
- Cleanup of unused data from memory
- Efficient event handling and debouncing

## User Experience Design

### Visual Hierarchy
- **Primary Information**: Date, unit name, accuracy (large, prominent)
- **Secondary Information**: Duration, vocabulary count, settings (smaller)
- **Actions**: Delete button (clear but not intrusive)
- **Status Indicators**: Color-coded accuracy bands

### Responsive Design
- **Desktop**: 2-3 column layout with detailed information
- **Tablet**: Single column with compact cards
- **Mobile**: Stacked layout with essential info first

### Loading States
- **Initial Load**: Skeleton cards while loading first batch
- **Filter Changes**: Loading overlay during data refresh
- **Pagination**: Infinite scroll with loading indicator

## Error Handling Strategy

### Data Access Errors
- Network connectivity issues with IndexedDB
- Corrupted session data handling
- Graceful degradation for missing information

### User Action Errors
- Delete operation failures with retry options
- Filter validation and error messages
- Empty state handling with helpful guidance

## Accessibility Considerations

### Keyboard Navigation
- Tab order through filters and session list
- Keyboard shortcuts for common actions
- Screen reader compatibility for all elements

### Visual Accessibility
- High contrast color coding for accuracy bands
- Clear focus indicators
- Sufficient color contrast for text
- Semantic HTML structure

## Integration Points

### Navigation Integration
- Add new route: `/dictation-history`
- Add navigation menu item with appropriate icon
- Ensure breadcrumb navigation consistency
- Maintain app-wide navigation state

### Data Service Integration
- Extend existing `dictationService` class
- Maintain compatibility with existing methods
- Follow established error handling patterns
- Use existing type definitions and interfaces

### UI Component Reuse
- Leverage existing Quasar components
- Follow established design patterns
- Use common styling and theming
- Maintain responsive design consistency