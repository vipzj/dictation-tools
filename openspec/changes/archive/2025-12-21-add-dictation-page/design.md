## Context
The dictation feature builds upon the existing unit management system to provide an interactive practice experience. Users need to be able to search and select units based on tags and keywords, then engage in a focused dictation practice session with configurable audio playback settings.

## Goals / Non-Goals
- Goals:
  - Seamless integration with existing unit and tag systems
  - Configurable dictation experience with progress tracking
  - Audio-first practice using recorded audio when available, TTS fallback
  - Self-evaluation system with persistent results storage
- Non-Goals:
  - Speech recognition or automatic evaluation
  - Multi-user dictation sessions
  - Advanced audio processing or effects

## Decisions
- **Decision**: Use dedicated dictation page rather than modal for better UX
  - **Reasoning**: Dictation is a complete workflow requiring search, configuration, practice, and results
  - **Alternatives considered**: Modal-based flow (too complex for single modal)

- **Decision**: Separate audio playback system using Web Audio API + TTS fallback
  - **Reasoning**: Leverage existing audio recordings in units, ensure all words can be practiced
  - **Alternatives considered**: TTS-only (wastes existing recordings), Recording-only (incomplete coverage)

- **Decision**: Store dictation results in separate IndexedDB table
  - **Reasoning**: Keep dictation analytics separate from unit data, enable future reporting features
  - **Alternatives considered**: Store in unit table (mixes concerns), No persistence (loses valuable data)

- **Decision**: No word display during dictation practice
  - **Reasoning**: True listening comprehension test, prevents visual cheating
  - **Alternatives considered**: Show words after each audio (reduces difficulty), Show word hints (complicates interface)

## Risks / Trade-offs
- **Risk**: TTS quality varies across browsers and languages
  - **Mitigation**: Prioritize recorded audio, allow users to flag poor TTS quality
- **Risk**: Audio timing and interval management complexity
  - **Mitigation**: Use Web Audio scheduling APIs, provide clear visual feedback
- **Trade-off**: Simplicity vs advanced features
  - **Decision**: Start with core dictation flow, add advanced features in future iterations

## Migration Plan
1. Add new IndexedDB table for dictation results
2. Create dictation components and pages
3. Integrate with existing audio playback infrastructure
4. Update settings page with dictation preferences
5. Add navigation menu item for dictation page

## Open Questions
- Should dictation results support export/import like other data?
- How should dictation sessions handle interruption (page refresh, tab close)?
- Should there be different difficulty levels or modes?