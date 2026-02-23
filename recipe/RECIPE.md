# Site-Specific Tips Extension — Build Recipe

## Goal
Generate a Chrome MV3 extension that shows a floating tips widget on ONE specific site. No API calls — all 50 tips are hardcoded. Each extension is a unique product for Chrome Web Store.

## Before You Start
- Read `lessons/LOG.md` for issues encountered in previous builds — avoid repeating mistakes
- After submitting to Chrome Web Store, log lessons per `lessons/PROCESS.md`

## File Structure
```
{extension-id}/
  manifest.json
  config.json
  popup.html
  popup.js
  css/widget.css
  js/cs.js
  imgs/icon-16.png
  imgs/icon-48.png
  imgs/icon-128.png
  imgs/icon-16.svg        (source SVGs for icons)
  imgs/icon-48.svg
  imgs/icon-128.svg
  marketing/
    slide1.html           (1280x800 hero screenshot — widget mockup)
    slide2.html           (1280x800 features screenshot — 3 feature cards)
    render-icons.html     (canvas icon renderer with download buttons)
  STORE-LISTING.md        (copy-paste guide for Chrome Web Store submission)
```

## Step 1: manifest.json
```json
{
  "manifest_version": 3,
  "name": "{EXTENSION_NAME}",
  "version": "1.0.0",
  "description": "{DESCRIPTION}",
  "permissions": ["storage"],
  "action": {
    "default_popup": "popup.html",
    "default_icon": {
      "16": "imgs/icon-16.png",
      "48": "imgs/icon-48.png",
      "128": "imgs/icon-128.png"
    }
  },
  "icons": {
    "16": "imgs/icon-16.png",
    "48": "imgs/icon-48.png",
    "128": "imgs/icon-128.png"
  },
  "content_scripts": [
    {
      "matches": ["{MATCH_PATTERNS}"],
      "js": ["js/cs.js"],
      "run_at": "document_end"
    }
  ],
  "web_accessible_resources": [
    {
      "resources": ["config.json", "css/widget.css"],
      "matches": ["{MATCH_PATTERNS}"]
    }
  ]
}
```

**CRITICAL**: Use site-specific match patterns, NOT `<all_urls>`.

## Step 2: config.json
```json
{
  "name": "{EXTENSION_NAME}",
  "description": "{DESCRIPTION}",
  "version": "1.0.0",
  "primaryColor": "{PRIMARY_COLOR}",
  "accentColor": "{ACCENT_COLOR}",
  "widgetLabel": "{WIDGET_LABEL}",
  "widgetEmoji": "{WIDGET_EMOJI}",
  "targetHostname": "{HOSTNAME}"
}
```

## Step 3: cs.js — Content Script

This is the core file. See `TEMPLATE-CS.md` for the full template.

Key architecture decisions (DO NOT deviate):
- **Single file** — all logic lives in cs.js (DOM, tips, events)
- **No API calls** — tips are hardcoded in the TIPS array
- **No service worker needed**
- **No injected page scripts** — cs.js is a content script with chrome.storage + DOM access
- Show 5 random tips from the 50 on each click
- 48h dismiss via chrome.storage.local
- `direction: ltr !important` on widget root to prevent RTL sites breaking layout

## Step 4: widget.css

See `TEMPLATE-CSS.md` for the full template. Copy as-is, no changes needed — theming is handled by CSS variables set in cs.js from config.json.

## Step 5: popup.html + popup.js

Minimal branded popup. See templates.

## Step 6: Icons

Generate simple colored circle PNGs at 16/48/128px using the site's primaryColor. Use Node.js script:
```js
const fs = require('fs'), zlib = require('zlib');
function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c ^= buf[i]; for (let j = 0; j < 8; j++) c = (c>>>1)^(c&1?0xedb88320:0);
  }
  return (c^0xffffffff)>>>0;
}
function makePNG(size, r, g, b) {
  const raw = [];
  const cx=size/2, cy=size/2, rad=size/2;
  for (let y=0;y<size;y++) {
    raw.push(0);
    for (let x=0;x<size;x++) {
      if (Math.sqrt((x-cx+.5)**2+(y-cy+.5)**2)<=rad) raw.push(r,g,b,255);
      else raw.push(0,0,0,0);
    }
  }
  const compressed = zlib.deflateSync(Buffer.from(raw));
  function chunk(type,data) {
    const t=Buffer.from(type),len=Buffer.alloc(4);len.writeUInt32BE(data.length);
    const crcBuf=Buffer.concat([t,data]),c=Buffer.alloc(4);c.writeUInt32BE(crc32(crcBuf));
    return Buffer.concat([len,t,data,c]);
  }
  const sig=Buffer.from([137,80,78,71,13,10,26,10]);
  const ihdr=Buffer.alloc(13);ihdr.writeUInt32BE(size,0);ihdr.writeUInt32BE(size,4);ihdr[8]=8;ihdr[9]=6;
  return Buffer.concat([sig,chunk('IHDR',ihdr),chunk('IDAT',compressed),chunk('IEND',Buffer.alloc(0))]);
}
// Usage: makePNG(128, 0x4C, 0xAF, 0x50) for #4CAF50
```

## Bug Avoidance Rules

These are hard-won lessons. Follow them exactly.

| Rule | Why |
|------|-----|
| `direction: ltr !important` on `#searchelf-widget` | RTL sites (Hebrew, Arabic) reverse flex layouts, breaking nav buttons |
| `all: initial` on root container | Prevents host page CSS from leaking into widget |
| Prefix ALL ids/classes with `searchelf-` | Prevents collisions with host page |
| No `<script src>` injection for widget logic | CSP on many sites blocks it; content script has everything it needs |
| `z-index: 2147483647` on root | Ensures widget stays on top of everything |
| Check `document.getElementById("searchelf-widget-root")` before injecting | Prevents double injection |
| Skip `chrome-extension:` and `chrome:` protocols | These pages break content script injection |
| Dismiss key must be versioned (`_v2`, `_v3`) | Old dismiss values persist in storage across extension updates |
| Don't use `&times;` for small dismiss buttons | Renders poorly at small sizes; use plain `x` |
| `run_at: "document_end"` in manifest | Ensures `document.body` exists when cs.js runs |

## Step 7: Marketing Slides (1280x800)

Create two HTML files in `marketing/` for Chrome Web Store screenshots.

**slide1.html** — Hero screenshot:
- 1280x800 viewport, purple/themed gradient background
- Left side: big headline "Smart Tips for {SITE}" + subtitle about tip count
- Right side: mockup of the tips widget with a sample tip
- Use site's primaryColor for gradient

**slide2.html** — Features screenshot:
- 1280x800 viewport, dark background
- Headline: "Everything You Need to Master {SITE}"
- 3 feature cards in a row: Keyboard Shortcuts, Hidden Features, Instant Access
- Each card has icon, title, short description
- Badge at bottom: "Free · Works Instantly · 50+ Tips"

Both slides use `body { width: 1280px; height: 800px; overflow: hidden; }` so they render at exact Chrome Web Store dimensions.

## Step 8: SVG Icons

Create SVG icons at 16/48/128px with a themed design:
- Purple gradient circle background (or site's primaryColor)
- Centered lightbulb shape (yellow #FFD93D body, teal #00C4CC base)
- White sparkle decorations
- All three SVGs share the same inner `<g>` design, just with different `transform scale()`

Convert SVGs to PNGs: `npx sharp-cli -i icon-{size}.svg -o icon-{size}.png -- resize {size} {size}`

Also create `marketing/render-icons.html` — a canvas-based renderer that draws the icons and has download buttons (useful if sharp-cli is unavailable).

## Step 9: STORE-LISTING.md

Generate a `STORE-LISTING.md` file with all Chrome Web Store submission fields:

- **Name**: from manifest
- **Summary**: from manifest description (132 chars max)
- **Description**: detailed store description with sections: WHAT YOU GET, KEYBOARD SHORTCUTS, HIDDEN FEATURES, WHY THIS EXTENSION
- **Category**: Productivity
- **Permission justifications**:
  - `storage` → "Stores user preferences such as dismissed tip state and last viewed tip index. No personal data is collected or transmitted."
  - Host permission (`*://*.{hostname}/*`) → "The extension needs access to {hostname} pages to inject a floating tips widget that displays keyboard shortcuts and hidden features directly within the {SITE} interface."
- **Single purpose description**: "This extension displays helpful tips, keyboard shortcuts, and hidden features for {SITE} users while they browse {hostname}."
- **Privacy disclosures**: All "No" (no data collected)
- **Remote code**: No
- **Submission checklist**

## Step 10: Create Zip

Create a zip file at `output/{extension-id}.zip` containing only the extension files (exclude `marketing/` folder and `.svg` source files). Use PowerShell on Windows or `zip` on Mac/Linux.

## Verification Checklist
- [ ] Extension loads in chrome://extensions without errors
- [ ] Widget appears ONLY on the target site
- [ ] Widget does NOT appear on other sites
- [ ] Click widget → 5 tips show instantly (no loading)
- [ ] Prev/Next navigation works
- [ ] Close button collapses panel back to pill
- [ ] Dismiss X hides widget; refresh page → still hidden
- [ ] On RTL sites: buttons are not reversed
- [ ] Different page reload → different random 5 tips
- [ ] Zip file created and contains only extension files (no marketing/)
- [ ] STORE-LISTING.md has all required fields
- [ ] Marketing slides render correctly at 1280x800
- [ ] SVG icons converted to PNGs at correct sizes
