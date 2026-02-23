# Prompt — New Extension Workflow

This is the master prompt for creating a new extension. It starts with keyword exploration and ends with a built, zipped, store-ready extension.

**Copy-paste this entire prompt to Claude to start a new extension.**

---

I want to create a new site-specific tips Chrome extension.

**Use the TaskCreate tool at the start to create tasks for every step below. Update task status as you go (in_progress when starting, completed when done). Do not skip any task.**

## Phase 1: Keyword Exploration

Before building anything, help me find the right keyword to target.

1. Read `recipe/PORTFOLIO.md` to see what we've already built
2. Read `recipe/lessons/LOG.md` for past mistakes to avoid
3. Read `recipe/KEYWORD-RESEARCH.md` for selection criteria and evaluation workflow

Then suggest 4-6 candidate keywords/extensions. For each candidate provide:
- Target keyword and tool/site
- Category (must be different from recent portfolio entries)
- Keyword pattern (e.g. "{tool} tips", "{tool} shortcuts" — vary from recent entries)
- Quick competition assessment
- Proposed extension name

Prioritize maximum diversification from the existing portfolio — different categories, different tools, different keyword patterns. We're in exploration mode casting a wide net.

**Use the AskUserQuestion tool** to present the candidates and let me pick one (or suggest my own). Include a brief rationale for each option. Don't proceed until I've chosen.

## Phase 2: Build the Extension

Once I've picked a keyword, build the full extension:

Follow the recipe in `recipe/RECIPE.md` for architecture, code templates, and bug-avoidance rules.

**Write 50 site-specific tips** for the chosen site following the tip rules in `recipe/TIPS-GUIDE.md`.

Output the complete extension folder ready to load as unpacked in Chrome.

**Also generate:**
- SVG icons (16/48/128px) with lightbulb+sparkle design using the primary color, then convert to PNGs via `npx sharp-cli`
- 2 marketing slides (slide1.html hero + slide2.html features) at 1280x800
- `render-icons.html` canvas-based icon renderer with download buttons
- `STORE-LISTING.md` with all Chrome Web Store fields (name, summary ≤132 chars, description, privacy disclosures, permission justifications, submission checklist)
- Zip file at `output/{extension-id}.zip` (excluding marketing/ and .svg files)

## Phase 3: Update Tracking

After building:
- Add the new extension to `recipe/PORTFOLIO.md`
- Remind me to log lessons in `recipe/lessons/LOG.md` after I submit to Chrome Web Store

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
