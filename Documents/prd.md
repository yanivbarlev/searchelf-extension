# Meta Chrome Extension: AI-Powered Smart Tips

## Context
Build a single template chrome extension that can be rebranded (name, icon, description, colors) and published under different names to test which verticals convert best. The extension works on **all sites** — when the user clicks the floating widget, it sends the current site context to Groq AI and returns relevant tips/shortcuts/hidden features.

## Architecture

```
extension/
  manifest.json          ← all_urls permission, config-driven name/description
  config.json            ← brand name, colors, icon paths, Groq API key, description
  popup.html / popup.js  ← simple branded popup with extension info
  css/widget.css         ← themed via CSS variables from config
  js/
    cs.js                ← content script: injects widget into every page
    widget.js            ← floating panel: handles UI, calls Groq, shows tips
  imgs/
    icon-16.png
    icon-48.png
    icon-128.png
```

## How It Works

1. **Content script (`cs.js`)** injects on every page
2. Shows a **small floating icon + label** (e.g. "💡 Tips") in bottom-right corner
3. User clicks → widget expands into a panel
4. Panel sends request to **Groq API** (hardcoded key) with prompt:
   - "You are a power-user assistant. The user is on {site hostname}. Give 5 useful tips, shortcuts, or hidden features for this site. Return as JSON array of {title, description}."
5. Tips render as **cards** with "Next" / "Previous" navigation
6. Tips are **cached** in `chrome.storage.local` per hostname so repeat visits don't re-call API

## Config-Driven Rebranding

`config.json` controls:
- `name` — extension display name
- `description` — Chrome Web Store description
- `primaryColor` / `accentColor` — theme colors
- `widgetLabel` — text shown on the floating button (e.g. "Tips", "Pro Tips", "Shortcuts")
- `icon` — path prefix for icons
- `groqApiKey` — hardcoded Groq API key
- `groqModel` — model to use (default: `llama-3.3-70b-versatile`)

To rebrand: edit `config.json`, swap icon PNGs, publish.

## Key Files to Create

1. **`manifest.json`** — MV3, content_scripts on all_urls, permissions: storage
2. **`config.json`** — branding + API config
3. **`js/cs.js`** — content script, reads config, injects widget DOM + styles
4. **`js/widget.js`** — widget logic: expand/collapse, Groq API call, tip navigation, caching
5. **`css/widget.css`** — floating widget + panel styles, CSS variables for theming
6. **`popup.html` + `popup.js`** — minimal branded popup

## Groq API Integration

- Endpoint: `https://api.groq.com/openai/v1/chat/completions`
- Model: `llama-3.3-70b-versatile` (fast, free tier friendly)
- API key hardcoded in config.json, read by widget.js
- Request made directly from content script (no service worker needed)
- Response parsed as JSON array of tip objects

## Widget UI Flow

```
[Collapsed]  💡 Tips  (small pill, bottom-right, draggable optional)
     ↓ click
[Expanded]   ┌─────────────────────┐
             │ ✨ Tips for youtube.com │
             │─────────────────────│
             │ 💡 Tip 1 of 5       │
             │ Title here           │
             │ Description text...  │
             │                     │
             │  ← Prev    Next →   │
             │─────────────────────│
             │        ✕ Close      │
             └─────────────────────┘
```

## Caching Strategy

- Cache key: `tips_{hostname}` in `chrome.storage.local`
- Cache duration: 24 hours
- On click: check cache first, if valid show cached tips, otherwise call Groq

## Verification

1. Load unpacked extension in chrome://extensions
2. Navigate to any site (e.g. youtube.com)
3. Verify floating widget appears in bottom-right
4. Click widget → verify Groq API call fires and tips load
5. Navigate to same site again → verify tips load from cache (no API call)
6. Navigate to different site → verify new tips generated
7. Edit config.json colors/name → reload → verify branding changes

## Implementation Order

1. Create manifest.json + config.json
2. Build cs.js — inject floating widget
3. Build widget.js — expand/collapse UI + Groq API call + tip rendering
4. Style with widget.css — themed from config
5. Add popup.html/js — minimal branding page
6. Add caching layer
7. Test end-to-end
