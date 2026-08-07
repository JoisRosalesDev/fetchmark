# Project Overview: fetchmark

## Summary
`fetchmark` is an Angular 22 web application featuring server-side rendering (SSR) via Express 5, responsive styling with Tailwind CSS v4, and TypeScript 6.

## Architecture
- **Frontend Framework**: Angular 22.1.0 (Standalone components, Signals, Reactive forms)
- **SSR / Backend Integration**: Express 5.1.0 (`src/server.ts`, `src/main.server.ts`)
- **Styling Layer**: Tailwind CSS 4.1.12 with PostCSS (`src/styles.css`, `.postcssrc.json`)
- **Testing Layer**: Vitest 4.0.8 via `@angular/build:unit-test` with jsdom 28.0.0
- **Code Quality**: Prettier 3.8.1 for formatting, `tsc` for static type safety

## Directory Structure
- `src/app`: Standalone Angular components, routes, and server configs
- `src/server.ts`: Node/Express SSR entry point
- `public/`: Static assets
- `.agents/skills/`: Repository design and developer capabilities
- `.atl/`: Agent Registry files (`skill-registry.md`)
- `openspec/`: OpenSpec project configuration and specifications
