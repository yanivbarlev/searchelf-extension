# Lessons Process

How we learn from each extension we publish and improve the recipe over time.

## When to Capture

After each Chrome Web Store submission — before knowing the review result. Don't wait for approval/rejection; capture while the experience is fresh.

## What to Capture

Two categories:

### 1. Store Issues
- Listing problems (description rejected, icon issues, screenshot requirements)
- Permission justification wording that was unclear or insufficient
- Privacy disclosure mistakes
- Policy violations or warnings
- Anything that caused a re-submission

### 2. Technical Issues
- Bugs found during development or testing
- CSS/DOM conflicts with the target site
- Content script injection problems
- Build/packaging errors
- Tips quality issues (inaccurate, outdated, irrelevant)

## How to Record

After submitting an extension, add an entry to `recipe/lessons/LOG.md` using this format:

```
## {Extension Name} — {Date}

**Store issues:**
- {issue or "None"}

**Technical issues:**
- {issue or "None"}

**What took longer than expected:**
- {item or "Nothing"}

**Suggested recipe change:**
- File: {filename} | Change: {what to add/modify}
```

Every entry MUST include a "Suggested recipe change" section. If there are no issues, write "None — process worked as expected." This forces reflection even on smooth builds.

## How Lessons Feed Back

Every time the log is updated, immediately review the new entry and apply changes to recipe files:

1. Add the log entry
2. For each issue in the entry, update the relevant recipe file right away
3. Mark the entry as applied

| Lesson type | Update target |
|-------------|---------------|
| New bug avoidance rule | RECIPE.md → Bug Avoidance Rules table |
| Tip writing mistake | TIPS-GUIDE.md → quality checklist or rules |
| Store listing fix | RECIPE.md → Step 9 (STORE-LISTING.md section) |
| CSS/DOM fix | TEMPLATE-CSS.md or RECIPE.md bug table |
| Build/packaging fix | RECIPE.md → Step 10 or verification checklist |
| New required file/asset | RECIPE.md → File Structure + relevant step |
| Prompt improvement | PROMPT.md |

After updating recipe files, add a note at the bottom of the log entry:
```
**Applied to recipe:** {date} — updated {filename}
```

## Avoiding Bloat

The log and recipe files must stay lean. Follow these rules:

1. **Merge similar lessons** — if a new lesson covers the same area as an existing one, combine them into a single stronger rule instead of adding a second entry. Update the log entry to reference the merged rule.
2. **One rule, one line** — recipe rules should be a single row in a table or a single bullet. If it takes more than 2 lines, you're overexplaining.
3. **Replace, don't append** — when a lesson improves on an existing recipe rule, replace the old rule with the better version. Don't keep both.
4. **Delete "None" entries** — if an extension had zero issues across all sections, don't keep the entry. Just note "{Extension Name} — {Date} — clean build" as a single line.
5. **Cap the log at 20 entries** — when the log exceeds 20 entries, archive older applied entries to `lessons/ARCHIVE.md` keeping only the 20 most recent.

## Rules

1. Never skip the log entry — even if the build was flawless, record it (as a one-liner if clean)
2. One entry per extension, not per issue
3. Keep entries concise — 1-2 lines per bullet
4. Apply lessons to recipe files immediately on every log update — don't accumulate
5. Before adding a new recipe rule, check if an existing rule covers the same area and merge into it
