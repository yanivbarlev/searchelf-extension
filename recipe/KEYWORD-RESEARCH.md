# Keyword Research & Extension Ideation

## Goal

Find search terms where a Chrome Web Store listing page can rank organically on Google, then build a lightweight Chrome extension targeting that term. We build extensions that deliver curated knowledge through a floating widget — but the CWS listing can target **any keyword** where a knowledge widget is relevant. Success = ranking on page 1 for the target term and converting searchers into installs.

## How Chrome Web Store Pages Rank

Chrome Web Store listing pages are indexed by Google like any other page. They rank based on:
- Extension name (strongest signal — exact keyword match matters)
- Short description (132 chars)
- Full description
- Category
- Install count and ratings (social proof, not direct ranking factor but affects CTR)

This means: an extension named "Polymarket Sure Bet Finder" can rank for searches like "polymarket sure bet finder", "polymarket sure bets", "polymarket arbitrage".

## Keyword Selection Criteria

### Must-have
1. **Some search volume** — the term has real monthly searches (even 100-500/mo is fine)
2. **Low-to-medium competition** — the SERP isn't dominated by high-authority pages or the results are weak/outdated
3. **Chrome Web Store can rank** — check if existing Chrome Web Store listings already appear in SERPs for similar terms (proves Google indexes and ranks them)

### Nice-to-have
4. **Broad appeal** — the target site/tool has a large user base
5. **No dominant incumbent** — no existing extension already owns this keyword with thousands of reviews
6. **Evergreen topic** — content doesn't go stale quickly

### Don't worry about
- Whether the searcher intended to download an extension — people searching "canva background remover" didn't plan to install an extension, but a free one-click install that delivers exactly what they searched for converts well
- Exact match volume thresholds — low volume + zero competition beats high volume + impossible competition

## Keyword Categories

These are the types of keywords our extensions can target. Replace {TOOL} with the target site/app:

| Category | Examples | Naming approach |
|----------|----------|-----------------|
| General tips | "figma tips", "notion shortcuts" | Tips for {Tool} - {Secondary} & {Secondary} |
| Feature-specific | "canva background remover", "gmail filters" | {Tool} {Feature} Guide, or outcome-driven: Canva Background Remover |
| Problem/outcome | "polymarket sure bet finder", "how to organize gmail" | Name = the outcome. Tips deliver the how. E.g., Polymarket Sure Bet Finder |
| Use-case | "canva for instagram", "notion for project management" | {Tool} for {Use Case} - Guide & Tips |
| Workflow | "gmail email templates", "trello automation" | {Tool} {Workflow} Toolkit |

### Creative Naming Philosophy

> The extension name should describe the **outcome** the user wants, not the mechanism (tips). A user searching "polymarket sure bet finder" wants to find sure bets — our tips teach them how to do exactly that. The name is honest because the tips deliver the promised outcome.
>
> Think like a marketer: what does the searcher WANT? Name the extension after that want. The tips are the vehicle, not the brand.
>
> **DO NOT** default to "Tips for X" naming. That's the lazy fallback. For every candidate keyword, first try to name the extension after the outcome/feature/problem. Only use "Tips for X" when the keyword literally is "{tool} tips."

## Finding Candidate Tools/Sites

Look for tools and sites that are:

1. **Web-based** — the extension can only run on websites, not desktop apps
2. **Complex enough** — must have at least 50 real tips worth sharing (rules out simple sites)
3. **Large user base** — more potential searchers
4. **Underserved** — check Chrome Web Store for existing extensions targeting this keyword. Fewer = better opportunity
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
- **Prediction/betting**: Polymarket, Kalshi, Metaculus

## Portfolio Awareness

Before researching new keywords, check `recipe/PORTFOLIO.md` for what we've already built or targeted. We are in an exploratory stage — cast a wide net to find what works.

**Diversification rules:**
- Each new extension must target a **materially different** tool, category, or audience than existing ones
- Don't cluster in one category (e.g. don't build 3 design-tool extensions in a row)
- Diversify across keyword **categories** (not just tool + "tips" synonym). Track keyword category in portfolio
- Avoid 2+ consecutive extensions in the same keyword category
- The goal is maximum spread across categories, tools, and keyword types to discover which combinations convert best
- Only double down on a winning category after data proves it works (installs, rankings)

After building each extension, immediately update `recipe/PORTFOLIO.md` with the new entry.

## Evaluation Workflow

### Step 0: Data-Driven Keyword Discovery (MANDATORY)

DO NOT brainstorm keywords from your own knowledge. Real search data is the ONLY source of candidates. This prevents convergence on obvious "{tool} tips" patterns.

**0a. Google Autocomplete Harvest (use WebFetch tool):**
Fetch autocomplete data from Google's suggest API:
`https://suggestqueries.google.com/complete/search?client=firefox&q={tool}+{suffix}`

Run these queries (each returns ~10 suggestions):
- `{tool} ` + every letter a-z (26 queries)
- `{tool} how`, `{tool} why`, `{tool} best`, `{tool} free`, `{tool} for`, `{tool} vs`, `{tool} not`, `{tool} without` (8 queries)
- `how to {tool}`, `best {tool}`, `why {tool}` (3 queries)

Total: ~37 WebFetch calls → ~370 raw suggestions from real user behavior.
Deduplicate and compile into a raw list.

**0b. "People Also Ask" + Related Searches (use WebSearch tool):**
For the top 3-5 most interesting autocomplete results, use the WebSearch tool and collect "People also ask" questions and related searches from the results.

**0c. Dream Outcome Layer:**
After collecting real data, ask: "What does a user of this tool DREAM of achieving?" (making money, going viral, inbox zero, etc.). Check if any dream-outcome keywords appear in the harvested data. If not, search Google for the dream-outcome phrase to check real volume.

**0d. Compile raw list:**
Merge all candidates into a single raw list (aim for 30+). Remove obvious duplicates. Do NOT filter or judge yet.

The AI's role is to SCORE and SELECT from real data — not to invent keywords from imagination.

### Step 1: Google it

Search the exact keyword. Look at page 1 results:
- Are there Chrome Web Store listings already ranking? (good sign for the category)
- How strong are the top results? (forums, blog posts, official docs)
- Is the content old/thin? (opportunity)

### Step 2: Check Chrome Web Store

Search CWS for the **specific target keyword** (not just "{tool} tips"):
- How many competing extensions exist for this exact keyword?
- What are their install counts and ratings?
- Are their listings well-optimized? (often they aren't)

### Step 3: Estimate volume

Use free tools:
- Google Keyword Planner (free with Google Ads account)
- Ubersuggest (limited free searches)
- Google Trends (relative volume, good for comparing candidates)
- "People also ask" and autocomplete suggestions (signals real demand)

### Step 4: Score it

Rate each keyword on a simple scale:

| Factor | 1 (bad) | 3 (okay) | 5 (great) |
|--------|---------|----------|-----------|
| Volume | <50/mo | 100-500/mo | 500+/mo |
| Competition | Page 1 is all high-DA sites | Mix of strong and weak | Weak/thin results |
| CWS competition | 5+ extensions, 1000+ installs each | A few extensions, <500 installs | None or very weak |
| Content feasibility | Hard to find 50 real tips | Doable with research | Easy, tool is feature-rich |
| Extension name fit | Keyword is awkward in a name | Workable | Natural, reads like a product name |
| Keyword specificity | Generic "{tool} tips" (crowded) | Moderate niche | Specific feature/problem/outcome |

**Target score: 18+ out of 30 to proceed.**

## Extension Naming

The extension name is the single most important ranking factor. Rules:

1. **Lead with the keyword** — "Polymarket Sure Bet Finder" not "SmartHelper - Polymarket Edition"
2. **Keep it under 45 chars** — Chrome Web Store truncates long names
3. **Include secondary keywords** — if room allows
4. **Don't stuff** — one primary keyword, one or two secondary. Must read naturally
5. **No brand conflicts** — don't use trademarked terms in ways that imply official affiliation
6. **Name the outcome, not the mechanism** — "Polymarket Sure Bet Finder" > "Tips for Polymarket - Sure Bet Tips"

### Examples across categories

- "Canva Background Remover Guide" (feature-specific)
- "Polymarket Sure Bet Finder" (outcome)
- "Gmail Inbox Organizer - Filters & Tips" (problem-based)
- "Notion for Project Management - Templates & Guide" (use-case)
- "Trello Automation Toolkit" (workflow)
- "Tips for Figma - Shortcuts & Hidden Features" (general — still valid when keyword literally is "figma tips")

## Output

After completing research, produce a shortlist in this format:

```
## Extension Shortlist — {Date}

Raw candidates harvested from autocomplete: {N}

| # | Keyword | Keyword Category | Volume | Competition | CWS gap | Score | Extension name |
|---|---------|-----------------|--------|-------------|---------|-------|---------------|
| 1 | {kw}    | {category}      | {est}  | {low/med/high} | {yes/no} | {/30} | {proposed name} |
```

Pick the highest-scoring keyword and build it using `RECIPE.md`.
