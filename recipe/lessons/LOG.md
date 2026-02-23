# Lessons Log

<!-- Add new entries at the top. See LESSONS-PROCESS.md for format. -->

## Tips for Netflix — 2026-02-23

**Build issues:**
- Marketing slide PNGs (slide1.png, slide2.png) were not rendered — only the HTML files were created. The Puppeteer render step was skipped, leaving no actual screenshots for Chrome Web Store upload.
- Icons used a generic lightbulb-on-circle design with no visual connection to the product. Icons should be sophisticated with product-relevant decorative elements (e.g., film strips for Netflix).

**Applied to recipe:** 2026-02-23 — updated RECIPE.md Step 7 to mark PNG rendering as MANDATORY with verification step, and Step 8 to require product-relevant icon design with detailed design spec.

---

## Tips for Pinterest — 2026-02-23

**Build issues:**
- Extension folder was placed at the project root instead of inside `output/`. Both the folder and zip should live in `output/` so local testing and store upload are in the same place.
- Zip was initially created from individual file paths, which excluded the top-level folder name. Must compress the whole `output/{extension-id}/` directory so the zip extracts to a named folder the user can load directly as an unpacked extension.

**Applied to recipe:** 2026-02-23 — updated RECIPE.md Step 10 and file structure diagram.

---

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
