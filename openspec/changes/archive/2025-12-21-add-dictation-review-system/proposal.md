# add-dictation-review-system Proposal

## Summary
Add a comprehensive dictation review system that implements spaced repetition learning using the Ebbinghaus forgetting curve. The system will dynamically generate review word lists based on dictation and review history, with configurable review settings and a complete review history management interface.

## Problem Statement
Currently, users can practice dictation but there's no systematic way to review previously learned vocabulary for long-term retention. Users lack:
1. Scientifically-based review scheduling using spaced repetition
2. Automatic prioritization of words that need review
3. Tracking of review progress and performance over time
4. Configurable review settings (word count, difficulty, etc.)
5. Review history management and analysis

## Proposed Solution
Create a comprehensive review system that:
- Implements Ebbinghaus memory curve with standard intervals (1-2-4-7-15-30 days)
- Analyzes dictation and review history to identify words needing review
- Generates dynamic review sessions with configurable word count (default: 15)
- Provides dedicated review interface similar to dictation workflow
- Tracks review history with performance analytics
- Allows review history management and deletion

## Scope
### In Scope
- Create review algorithm engine with Ebbinghaus memory curve
- Implement ReviewSession data model and storage
- Add ReviewPage.vue with review workflow
- Add ReviewHistoryPage.vue with history management
- Enhance settings page with review configuration options
- Add navigation integration for review features
- Implement review prioritization based on error frequency and last review time
- Add review progress tracking and memory strength indicators

### Out of Scope
- Advanced adaptive algorithms beyond standard Ebbinghaus intervals
- Social features for sharing review progress
- Gamification elements (points, achievements, etc.)
- Multiple review modes (speed review, challenge mode, etc.)
- Export/import of review data
- Review analytics and charts

## User Value
- Scientific learning approach with proven spaced repetition methodology
- Improved long-term vocabulary retention
- Efficient review sessions focusing on high-priority words
- Progress tracking and motivation through visible improvement
- Customizable learning experience based on individual needs
- Reduced learning time through optimized review scheduling

## Success Criteria
- Review algorithm correctly identifies words needing review based on memory curve
- Review sessions are generated with appropriate difficulty and word count
- Users can complete reviews with familiar dictation-like interface
- Review history is accurately tracked and manageable
- Settings integration allows customization of review parameters
- System performs efficiently with large vocabulary datasets

## Architecture Considerations
- New data models required: ReviewSession, ReviewResult, MemoryState
- Complex algorithm implementation for spaced repetition calculations
- Integration with existing dictation history and vocabulary systems
- Performance optimization for large vocabulary sets
- Database schema extensions for review data storage
- Consistent UI/UX patterns with existing dictation workflow

## Dependencies
- Existing dictation session and result data structures
- Current vocabulary and unit management systems
- Audio playback infrastructure for review sessions
- Settings management system for review configuration
- Navigation and routing framework