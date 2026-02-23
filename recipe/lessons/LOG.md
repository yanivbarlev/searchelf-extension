# Lessons Log

<!-- Add new entries at the top. See LESSONS-PROCESS.md for format. -->

## Tips for Google Sheets — 2026-02-23

**Store issues:**
- Icon PNGs missing from zip. PowerShell `Compress-Archive` with individual file paths like `imgs/icon-16.png` doesn't preserve directory structure — the PNGs end up at the root or get lost. Must include the whole `imgs` directory as a single path.

**Technical issues:**
- None

**What took longer than expected:**
- Debugging the zip structure — had to extract and verify contents to find the problem.

**Suggested recipe change:**
- File: RECIPE.md | Change: Update Step 10 zip command to include `imgs` as a directory (not individual files), and add a verification step to list zip contents before considering it done.

**Applied to recipe:** 2026-02-23 — updated RECIPE.md
