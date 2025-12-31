# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

AutoLink is a Chrome extension (Manifest V3) that auto-fills web forms with saved profile data. It detects form fields via heuristics and maps them to profile fields (name, email, description, etc.).

## Development Commands

```bash
npm run dev      # Start Vite dev server with HMR for extension development
npm run build    # TypeScript compile + Vite build (outputs to dist/)
npm run lint     # ESLint check
npm run preview  # Preview production build
```

## Loading the Extension

1. Run `npm run dev` or `npm run build`
2. Open Chrome → `chrome://extensions/` → Enable Developer Mode
3. Click "Load unpacked" → Select the `dist/` folder

## Architecture

### Extension Structure (MV3)

```
src/
├── manifest.ts          # Chrome extension manifest definition
├── background/index.ts  # Service worker (minimal, logs startup)
├── content/             # Content script injected into all pages
│   ├── index.tsx        # Entry: injects Shadow DOM + React overlay
│   ├── Overlay.tsx      # Floating UI for profile selection + auto-fill
│   ├── dom.ts           # DOM utilities (React-compatible value setting, Shadow DOM injection)
│   └── matcher.ts       # Field detection heuristics (keyword matching on input attrs)
├── popup/               # Extension popup UI
│   ├── App.tsx          # Main popup: toggle controls, profile list/editor views
│   └── components/      # ProfileList.tsx, ProfileEditor.tsx
├── storage/index.ts     # Chrome storage wrapper (profiles, settings, per-site disable)
└── types/index.ts       # Profile and FieldMapping TypeScript types
```

### Key Patterns

- **Shadow DOM Isolation**: Content script injects overlay into Shadow DOM to avoid CSS conflicts with host pages
- **React Value Setting**: `domUtils.setNativeValue()` uses prototype manipulation to trigger React's onChange handlers on form inputs
- **Field Detection**: `matcher.detectFields()` scans inputs for keyword matches in name/id/placeholder/aria-label/associated labels

### Data Flow

1. Profiles stored in `chrome.storage.local` via `storage` module
2. Content script's `Overlay.tsx` listens to storage changes for real-time updates
3. On "Auto Fill": matcher scans page → maps detected fields to active profile → sets values via `domUtils`

## Tech Stack

- Vite 7 + React 19 + TypeScript
- @crxjs/vite-plugin for Chrome extension bundling
- Tailwind CSS 4 (with @tailwindcss/postcss)
- Path alias: `@/` → `src/`
