# Prompt to Generate a Site-Specific Chrome Extension

Copy and paste this to Claude, filling in the bracketed values.

**Important:** Before building, read `recipe/lessons/LOG.md` to avoid past mistakes. After submitting to Chrome Web Store, add a lessons entry per `recipe/lessons/PROCESS.md`.

---

Create a Chrome extension called **[EXTENSION NAME]** that shows a floating tips widget on **[SITE URL]**.

Follow the recipe in `recipe/RECIPE.md` for architecture, code templates, and bug-avoidance rules.

**Site details:**
- Hostname: `[e.g. www.minecraft.net]`
- Match patterns: `[e.g. *://*.minecraft.net/*]`
- Category: `[e.g. gaming, news, social media, shopping, education]`
- Primary color: `[e.g. #4CAF50]`
- Accent color: `[e.g. #8BC34A]`
- Widget emoji: `[e.g. ⛏️]`
- Widget label: `[e.g. MC Tips]`

**Write 50 site-specific tips** for this site following the tip rules in `recipe/TIPS-GUIDE.md`.

Output the complete extension folder ready to load as unpacked in Chrome.

**Also generate:**
- SVG icons (16/48/128px) with lightbulb+sparkle design using the primary color, then convert to PNGs via `npx sharp-cli`
- 2 marketing slides (slide1.html hero + slide2.html features) at 1280x800
- `render-icons.html` canvas-based icon renderer with download buttons
- `STORE-LISTING.md` with all Chrome Web Store fields (name, summary ≤132 chars, description, privacy disclosures, permission justifications, submission checklist)
- Zip file at `output/{extension-id}.zip` (excluding marketing/ and .svg files)

---

## Quick-fire variant (multiple extensions)

To generate several at once:

---

Generate **[N] site-specific Chrome extensions** using `recipe/RECIPE.md`.

Sites:
1. [Name] — [hostname] — [color] — [emoji] — [category]
2. [Name] — [hostname] — [color] — [emoji] — [category]
3. ...

For each, write 50 tips per `recipe/TIPS-GUIDE.md` and output each as a separate folder under `output/`.

For each extension also generate: SVG+PNG icons, 2 marketing slides, STORE-LISTING.md, and a zip file. See Steps 7-10 in `recipe/RECIPE.md`.

---
