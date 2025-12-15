# Project Context

## Purpose
Dictation Tools (dc) - A modern web application for dictation and transcription tools built with Quasar Framework. The project aims to provide a cross-platform solution for dictation workflows with support for multiple deployment targets (SPA, PWA, Electron, Mobile).

## Tech Stack
- **Frontend Framework**: Vue 3 with Composition API
- **UI Framework**: Quasar Framework v2.16
- **Language**: TypeScript (strict mode enabled)
- **Build Tool**: Vite
- **State Management**: Pinia v3
- **Routing**: Vue Router v4
- **HTTP Client**: Axios
- **Internationalization**: Vue I18n v11
- **Package Manager**: npm/yarn
- **Target Platforms**:
  - Single Page Application (SPA)
  - Progressive Web App (PWA)
  - Electron desktop app
  - Cordova mobile app
  - Capacitor mobile app
  - Browser Extension (BEX)

## Project Conventions

### Code Style
- **TypeScript**: Strict mode enabled, consistent type imports preferred
- **JavaScript**: Modern ES2022+ features, module system
- **Formatting**: Prettier with single quotes, 100 character line width
- **Linting**: ESLint with Vue 3 essential rules, TypeScript support
- **Vue 3**: Composition API with `<script setup>` syntax preferred
- **File Naming**:
  - Components: PascalCase (ExampleComponent.vue)
  - Files: kebab-case for most files
  - Types: Use `type` keyword where possible
- **Import Style**: Consistent type imports with `@typescript-eslint/consistent-type-imports` rule

### Architecture Patterns
- **Component Architecture**: Vue 3 Composition API
- **State Management**: Pinia stores for global state
- **Module System**: ES modules with type: "module"
- **File Organization**:
  - `/src/components/` - Reusable Vue components
  - `/src/pages/` - Route-level components
  - `/src/layouts/` - Layout components
  - `/src/stores/` - Pinia stores
  - `/src/boot/` - App initialization files
  - `/src/i18n/` - Internationalization files
  - `/src/css/` - Global styles
- **Routing**: Hash-based routing (vueRouterMode: 'hash')
- **Internationalization**: Vue I18n with unplugin integration

### Testing Strategy
- Currently no test framework configured (test script exits with code 0)
- Testing strategy to be defined as project grows

### Git Workflow
- Main branch: `main`
- Commit messages: Follow conventional commit format (recommended)
- No specific branching strategy defined yet

## Domain Context
This is a dictation tools application built with modern web technologies. The project is in early stages with basic Quasar setup and example components. The application is designed to be cross-platform, supporting web, desktop, and mobile deployments.

## Important Constraints
- **Node.js**: Requires Node.js versions 20, 22, 24, 26, or 28
- **Package Manager**: npm >= 6.13.4 or yarn >= 1.21.1
- **Browser Support**:
  - ES2022 compatible browsers
  - Firefox 115+, Chrome 115+, Safari 14+
- **TypeScript**: Strict mode enforced for type safety
- **Build Target**: Supports multiple deployment platforms

## External Dependencies
- **Quasar Framework**: Core UI framework and build system
- **Vue Ecosystem**: Vue 3, Vue Router, Vue I18n
- **Development Tools**: Vite, TypeScript, ESLint, Prettier
- **Icons**: Material Icons, Roboto Font
- **No external APIs or services currently configured**
