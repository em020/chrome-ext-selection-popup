# Selection Popup Chrome Extension

A Chrome extension that shows a floating action icon when text is selected on a webpage. The icon is positioned **below** the selected text so the browser or system context menu can still appear above the selection, especially on mobile.

Clicking the icon is the current first milestone: it logs the selected text to the page console.

## Features

- Shows an action icon when text is selected
- Works on desktop (`mouseup`) and mobile (`touchend`)
- Positions the icon below the selection without covering the text
- Uses a Shadow DOM content-script mount to avoid leaking styles into host pages
- Includes a simple extension popup UI

## Tech stack

- React 18
- TypeScript
- Tailwind CSS
- shadcn/ui-friendly utilities and dependencies
- Vite 5
- Chrome Extension Manifest V3

## Project structure

```text
src/
  content/   Content script React app and injected styles
  popup/     Extension popup page
  lib/       Shared utilities
```

## Getting started

### Install dependencies

```bash
npm install
```

### Build the extension

```bash
npm run build
```

### Development watch mode

```bash
npm run dev
```

## Load in Chrome

1. Run `npm run build`
2. Open `chrome://extensions`
3. Enable **Developer mode**
4. Click **Load unpacked**
5. Select `/Users/yiminsun/projects/chrome-ext-selection-popup/dist`

## Available scripts

| Script | Description |
| --- | --- |
| `npm run dev` | Rebuilds popup and content script in watch mode |
| `npm run build` | Builds the full extension into `dist/` |
| `npm run type-check` | Runs TypeScript without emitting files |
| `npm run lint` | Lints the source files with ESLint |

## Current milestone behavior

1. Select text on any webpage
2. A circular chat-style icon appears below the selection
3. Click the icon
4. The selected text is logged with `console.log`

## Notes

- The extension currently injects on `<all_urls>`
- The popup UI is informational; the main behavior lives in the content script
- The next milestone can replace the console log with a real action
