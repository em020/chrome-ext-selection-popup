 # CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Chrome extension ("Selection Popup") that shows a floating action icon below text selections on any webpage. Built with React 18, TypeScript, Tailwind CSS, and Vite. Uses Chrome Extension Manifest V3.

## Commands

```bash
npm run dev          # Watch mode: rebuilds both popup and content script on changes
npm run build        # Production build of both popup and content script
npm run type-check   # TypeScript type checking (no emit)
npm run lint         # ESLint on src/
```

No test framework is configured.

## Build Architecture

The extension has **two independent Vite builds**, each with its own config:

| Config | Entry | Output | Format |
|--------|-------|--------|--------|
| `vite.popup.config.ts` | `src/popup/main.tsx` | `dist/popup.html` + assets | Standard web app |
| `vite.content.config.ts` | `src/content/index.tsx` | `dist/content.js` | **IIFE** (for Chrome content script injection) |

Both output to `dist/`. The root `manifest.json` is copied to `dist/` during the popup build. To load the extension in Chrome: go to `chrome://extensions`, enable Developer mode, and load the `dist/` directory.

## Extension Architecture

### Content Script (`src/content/`)
- Injected on all URLs at `document_idle` via manifest
- Mounts a React app inside a **Shadow DOM** for style isolation (prevents conflicts with host pages)
- `SelectionPopup.tsx` — listens for `mouseup`/`touchend` + `selectionchange`, calculates position below the selected text, and renders the floating icon
- Uses `all: unset` and Shadow DOM to ensure styles don't leak in or out
- Host element sits at `z-index: 2147483647`

### Popup (`src/popup/`)
- Simple informational UI shown when clicking the extension icon
- `App.tsx` — displays extension name, description, and active status badge
- Independent from the content script (no direct messaging between them)

### Shared (`src/lib/`)
- `utils.ts` — `cn()` helper combining `clsx` + `tailwind-merge`

## Key Technical Details

- The content script must build as **IIFE** (`vite.content.config.ts` sets `build.rollupOptions.output.format: 'iife'`) — Chrome content scripts don't support ES modules
- Tailwind config (`tailwind.config.js`) specifies content paths for both popup and content script CSS
- Content script styles (`src/content/content.css`) are inlined into the Shadow DOM rather than injected into the host page
- `@types/chrome` provides type definitions for Chrome extension APIs