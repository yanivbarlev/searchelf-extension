# Site-Specific Tips Extension — Build Recipe

## Goal
Generate a Chrome MV3 extension that shows a floating tips widget on ONE specific site. No API calls — all 50 tips are hardcoded. Each extension is a unique product for Chrome Web Store.

## Before You Start
- Read `lessons/LOG.md` for issues encountered in previous builds — avoid repeating mistakes
- Check `PORTFOLIO.md` — new extension must target a different category/tool/pattern than existing ones
- After building, add the extension to `PORTFOLIO.md`
- After submitting to Chrome Web Store, log lessons per `lessons/PROCESS.md`
- **After fixing ANY bug** (build, store upload, runtime): immediately update `lessons/LOG.md` with the issue and fix, then apply the lesson to the relevant recipe file. Don't wait for submission or for the user to remind you.

## File Structure
```
output/
  {extension-id}/          ← extension folder (load unpacked for local testing)
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
  "widgetLabel": "{WIDGET_LABEL}",  // Reflect the keyword angle, not always "Tips". E.g., "Bet Finder", "Filter Tips", "Background Tools"
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
- Left side: big headline leading with the target keyword outcome (e.g., "Find Sure Bets on Polymarket", "Master Gmail Filters", "Smart Tips for {SITE}" for general keywords) + subtitle about tip count
- Right side: mockup of the tips widget with a sample tip
- Use site's primaryColor for gradient

**slide2.html** — Features screenshot:
- 1280x800 viewport, dark background
- Headline: "Everything You Need to Master {SITE}"
- 3 feature cards in a row: Keyboard Shortcuts, Hidden Features, Instant Access
- Each card has icon, title, short description
- Badge at bottom: "Free · Works Instantly · 50+ Tips"

Both slides use `body { width: 1280px; height: 800px; overflow: hidden; }` so they render at exact Chrome Web Store dimensions.

**Render slides to PNG (MANDATORY)** — after creating the HTML slides, ALWAYS use Puppeteer to capture 1280x800 PNGs and place them in `marketing/`. Do NOT skip this step — the PNGs are the actual Chrome Web Store screenshots.
```js
// Run from project root (where puppeteer is installed)
const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });
  await page.goto('file:///ABSOLUTE_PATH/marketing/slide1.html', { waitUntil: 'networkidle0' });
  await page.screenshot({ path: 'ABSOLUTE_PATH/marketing/slide1.png' });
  await page.goto('file:///ABSOLUTE_PATH/marketing/slide2.html', { waitUntil: 'networkidle0' });
  await page.screenshot({ path: 'ABSOLUTE_PATH/marketing/slide2.png' });
  await browser.close();
})();
```
This produces pixel-perfect 1280x800 PNGs ready for Chrome Web Store upload. Install puppeteer once at the repo root with `npm install puppeteer` if not already present. **Verify both slide1.png and slide2.png exist in marketing/ before considering this step done.**

## Step 8: SVG Icons

Create SVG icons at 16/48/128px with a **sophisticated, product-relevant** design. Do NOT use a generic lightbulb-on-circle — make the icon visually distinctive and tied to the target site/tool.

**Design requirements:**
- **Rounded rectangle** background (rx="28" on 128 viewBox) with a gradient using the site's primaryColor
- **Lightbulb** as the central element with a warm gradient fill (#FFF3B0 to #FFD93D) and realistic screw base in silver/grey tones
- **Product-relevant decorative elements** — e.g., film strip borders for Netflix, pin shapes for Pinterest, grid lines for Sheets. These should be subtle (low opacity) so they don't overwhelm the lightbulb
- **Diamond-shaped sparkles** using SVG `<path>` (4-point stars), NOT text characters like ✦
- **Size-adaptive detail** — 16px gets simplified (fewer elements), 48px moderate detail, 128px full detail (filament lines, glow filters, extra sparkles)
- All three SVGs share the same viewBox="0 0 128 128" with different width/height attributes
- Use `<defs>` for gradients and filters to keep SVGs clean

Convert SVGs to PNGs: `npx sharp-cli -i icon-{size}.svg -o icon-{size}.png -- resize {size} {size}`

Also create `marketing/render-icons.html` — a canvas-based renderer that approximates the icon design with download buttons (useful if sharp-cli is unavailable).

## Step 9: STORE-LISTING.md

Generate a `STORE-LISTING.md` file with all Chrome Web Store submission fields:

- **Name**: from manifest
- **Summary**: from manifest description (132 chars max)
- **Description**: detailed store description with sections matching the target keyword (not hardcoded "KEYBOARD SHORTCUTS, HIDDEN FEATURES"). Section headers should use keyword-relevant language. Reinforce the target keyword naturally 3-5 times in the description. E.g., for "polymarket sure bet finder": WHAT YOU GET, FINDING SURE BETS, ODDS ANALYSIS TIPS, WHY THIS EXTENSION
- **Category**: Productivity
- **Permission justifications**:
  - `storage` → "Stores user preferences such as dismissed tip state and last viewed tip index. No personal data is collected or transmitted."
  - Host permission (`*://*.{hostname}/*`) → "The extension needs access to {hostname} pages to inject a floating tips widget that displays keyboard shortcuts and hidden features directly within the {SITE} interface."
- **Single purpose description**: "This extension displays helpful tips, keyboard shortcuts, and hidden features for {SITE} users while they browse {hostname}."
- **Privacy disclosures**: All "No" (no data collected)
- **Remote code**: No
- **Submission checklist**

## Step 10: Create Zip

**Extension folder location**: Place the extension folder at `output/{extension-id}/` (not the project root). This way both the loadable folder and the zip live together in `output/`.

```
output/
  {extension-id}/        ← load this as unpacked in Chrome for local testing
  {extension-id}.zip     ← upload this to Chrome Web Store
```

Create the zip at `output/{extension-id}.zip` by compressing the `output/{extension-id}/` folder directly. This makes the zip extract to a named subfolder, so the user can extract and immediately load it as an unpacked extension.

**CRITICAL**: Pass the full `output/{extension-id}` directory path to `Compress-Archive` (not individual files inside it). This preserves directory structure AND wraps everything in the named folder.

```powershell
$base = "C:\...\output\{extension-id}"
$out  = "C:\...\output\{extension-id}.zip"
if (Test-Path $out) { Remove-Item $out }
Compress-Archive -Path $base -DestinationPath $out
```

After creating the zip, **always verify** by listing its contents (extract to a temp dir) to confirm:
- `{extension-id}/manifest.json`
- `{extension-id}/imgs/icon-16.png`
- `{extension-id}/imgs/icon-48.png`
- `{extension-id}/imgs/icon-128.png`

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
