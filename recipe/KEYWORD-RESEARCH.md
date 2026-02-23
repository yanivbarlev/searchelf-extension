# Keyword Research & Extension Ideation

## Goal

Find search terms where a Chrome Web Store listing page can rank organically on Google, then build a lightweight tips extension targeting that term. The extension name and listing copy are optimized for the keyword. Success = ranking on page 1 for the target term and converting searchers into installs.

## How Chrome Web Store Pages Rank

Chrome Web Store listing pages are indexed by Google like any other page. They rank based on:
- Extension name (strongest signal — exact keyword match matters)
- Short description (132 chars)
- Full description
- Category
- Install count and ratings (social proof, not direct ranking factor but affects CTR)

This means: an extension named "Tips for Canva - Shortcuts & Hidden Features" can rank for searches like "canva tips", "canva shortcuts", "canva hidden features".

## Keyword Selection Criteria

### Must-have
1. **Some search volume** — the term has real monthly searches (even 100-500/mo is fine)
2. **Low-to-medium competition** — the SERP isn't dominated by high-authority pages or the results are weak/outdated
3. **Chrome Web Store can rank** — check if existing Chrome Web Store listings already appear in SERPs for similar terms (proves Google indexes and ranks them)

### Nice-to-have
4. **Broad appeal** — the target site/tool has a large user base
5. **No dominant incumbent** — no existing extension already owns this keyword with thousands of reviews
6. **Evergreen topic** — tips/shortcuts don't go stale quickly

### Don't worry about
- Whether the searcher intended to download an extension — people searching "canva shortcuts" didn't plan to install an extension, but a free one-click install that delivers exactly what they searched for converts well
- Exact match volume thresholds — low volume + zero competition beats high volume + impossible competition

## Keyword Patterns That Work

These are search patterns where a tips extension naturally fits. Replace {TOOL} with the target site/app:

| Pattern | Example | Why it works |
|---------|---------|-------------|
| `{TOOL} tips` | "figma tips" | Direct match to what we offer |
| `{TOOL} shortcuts` | "notion shortcuts" | Keyboard shortcuts are a core tip category |
| `{TOOL} hidden features` | "google docs hidden features" | Curiosity-driven, high engagement |
| `{TOOL} tricks` | "excel tricks" | Synonym of tips, often less competitive |
| `{TOOL} hacks` | "canva hacks" | Informal but high search volume |
| `{TOOL} cheat sheet` | "photoshop cheat sheet" | Implies a reference resource |
| `{TOOL} for beginners` | "trello for beginners" | Large audience, low intent to download but high conversion if useful |
| `{TOOL} productivity` | "slack productivity" | Broader keyword, harder to rank but high value |
| `how to use {TOOL}` | "how to use airtable" | Informational, huge volume, lower conversion but still viable |
| `{TOOL} power user` | "gmail power user" | Aspirational, targets engaged users |

## Finding Candidate Tools/Sites

Look for tools and sites that are:

1. **Web-based** — the extension can only run on websites, not desktop apps
2. **Complex enough** — must have at least 50 real tips worth sharing (rules out simple sites)
3. **Large user base** — more potential searchers
4. **Underserved** — check Chrome Web Store for existing tips/shortcuts extensions. Fewer = better opportunity
5. **Keyboard-shortcut-rich** — sites with many shortcuts make strong tip content

### High-potential categories
- **Design tools**: Canva, Figma, Photopea, Pixlr, Crello
- **Productivity/docs**: Notion, Airtable, Coda, Google Docs, Google Sheets, Quip
- **Project management**: Trello, Asana, Monday, ClickUp, Linear, Jira
- **Communication**: Slack, Discord, Teams, Zoom (web), Gmail
- **Dev tools**: GitHub, GitLab, VS Code (web), Replit, CodePen
- **Social/content**: YouTube Studio, WordPress, Medium, Substack, LinkedIn
- **E-commerce**: Shopify admin, Etsy seller, Amazon seller
- **Education**: Duolingo, Khan Academy, Coursera
- **Finance**: QuickBooks, Xero, Mint
- **No-code/low-code**: Webflow, Bubble, Zapier, Make

## Portfolio Awareness

Before researching new keywords, check `recipe/PORTFOLIO.md` for what we've already built or targeted. We are in an exploratory stage — cast a wide net to find what works.

**Diversification rules:**
- Each new extension must target a **materially different** tool, category, or audience than existing ones
- Don't cluster in one category (e.g. don't build 3 design-tool extensions in a row)
- Vary the keyword pattern too — if the last one was "{tool} tips", try "{tool} cheat sheet" or "{tool} for beginners" next
- The goal is maximum spread across categories, tools, and keyword types to discover which combinations convert best
- Only double down on a winning category after data proves it works (installs, rankings)

After building each extension, immediately update `recipe/PORTFOLIO.md` with the new entry.

## Evaluation Workflow

For each candidate keyword:

1. **Google it** — search the exact keyword. Look at page 1 results:
   - Are there Chrome Web Store listings already ranking? (good sign for the category)
   - How strong are the top results? (forums, blog posts, official docs)
   - Is the content old/thin? (opportunity)

2. **Check Chrome Web Store** — search for the tool name + "tips" or "shortcuts":
   - How many competing extensions exist?
   - What are their install counts and ratings?
   - Are their listings well-optimized? (often they aren't)

3. **Estimate volume** — use free tools:
   - Google Keyword Planner (free with Google Ads account)
   - Ubersuggest (limited free searches)
   - Google Trends (relative volume, good for comparing candidates)
   - "People also ask" and autocomplete suggestions (signals real demand)

4. **Score it** — rate each keyword on a simple scale:

| Factor | 1 (bad) | 3 (okay) | 5 (great) |
|--------|---------|----------|-----------|
| Volume | <50/mo | 100-500/mo | 500+/mo |
| Competition | Page 1 is all high-DA sites | Mix of strong and weak | Weak/thin results |
| CWS competition | 5+ extensions, 1000+ installs each | A few extensions, <500 installs | None or very weak |
| Content feasibility | Hard to find 50 real tips | Doable with research | Easy, tool is feature-rich |
| Extension name fit | Keyword is awkward in a name | Workable | Natural: "Tips for {X}" |

**Target score: 15+ out of 25 to proceed.**

## Extension Naming

The extension name is the single most important ranking factor. Rules:

1. **Lead with the keyword** — "Tips for Canva" not "SmartHelper - Canva Edition"
2. **Keep it under 45 chars** — Chrome Web Store truncates long names
3. **Include secondary keywords** — "Tips for Canva - Shortcuts & Hidden Features" covers 3 search patterns
4. **Don't stuff** — one primary keyword, one or two secondary. Must read naturally
5. **No brand conflicts** — don't use trademarked terms in ways that imply official affiliation

### Naming template
`Tips for {TOOL} - {Secondary Keyword} & {Secondary Keyword}`

Examples:
- "Tips for Notion - Shortcuts & Hidden Features"
- "Tips for Figma - Keyboard Shortcuts & Pro Tricks"
- "Tips for Trello - Productivity Tips & Hacks"

## Output

After completing research, produce a shortlist in this format:

```
## Extension Shortlist — {Date}

| # | Keyword | Volume | Competition | CWS gap | Score | Extension name |
|---|---------|--------|-------------|---------|-------|---------------|
| 1 | {kw}    | {est}  | {low/med/high} | {yes/no} | {/25} | {proposed name} |
```

Pick the highest-scoring keyword and build it using `PROMPT.md`.
