# BrandShuo Attribution Checker — Chrome Extension

Instantly decode affiliate attribution for any link. Identify the network, publisher, risk level, and incrementality — right from your browser.

## Features

- **One-click analysis**: Paste any link or click "Analyze Current Page"
- **Right-click context menu**: Right-click any link → "Analyze with BrandShuo"
- **Page scanner**: Content script detects affiliate links on every page and marks them
- **History**: Last 20 analyses saved locally
- **Full report**: Click through to the BrandShuo web app for complete details

## Installation (Development)

1. Open Chrome → `chrome://extensions`
2. Enable "Developer mode" (top right)
3. Click "Load unpacked"
4. Select the `chrome-extension/` folder
5. The extension icon appears in your toolbar

## Installation (Chrome Web Store)

Coming soon — submit via Chrome Web Store Developer Dashboard.

## Before Store Submission

1. Generate proper PNG icons (16×16, 48×48, 128×128)
   - The current `icons/` folder has placeholder PNGs
   - Use the SVG templates in `icons/*.svg` to generate high-quality PNGs
2. Create store screenshots (1280×800 or 640×400)
3. Write store listing copy (title, description, screenshots)

## Files

- `manifest.json` — Extension manifest (Manifest V3)
- `popup.html` — Popup UI
- `popup.js` — Popup logic (API calls, rendering, history)
- `popup.css` — Popup styles
- `background.js` — Service worker (context menu, API calls)
- `content.js` — Page scanner (detects affiliate links, adds badges)

## API

Uses the BrandShuo Attribution Intelligence API:
- `POST https://tools.brandshuo.com/api/analyze`
- `POST https://tools.brandshuo.com/api/batch` (bulk analysis)

## Privacy

- All analysis happens via the BrandShuo API
- No user data is collected by the extension
- Analysis history is stored locally in Chrome storage
