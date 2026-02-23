// Content Script — site-specific tips widget
(async function () {
  if (
    window.location.protocol === "chrome-extension:" ||
    window.location.protocol === "chrome:"
  ) return;
  if (document.getElementById("searchelf-widget-root")) return;

  // --- Config ---
  const configUrl = chrome.runtime.getURL("config.json");
  let config;
  try {
    config = await (await fetch(configUrl)).json();
  } catch (e) {
    console.error("[CS] Failed to load config:", e);
    return;
  }

  const hostname = window.location.hostname;
  const DISMISS_KEY = "searchelf_dismissed_v2";
  const DISMISS_TTL = 48 * 60 * 60 * 1000;

  // Check if widget was dismissed
  const dismissCheck = await new Promise((resolve) => {
    chrome.storage.local.get([DISMISS_KEY], (result) => {
      const dismissed = result[DISMISS_KEY];
      if (dismissed && Date.now() - dismissed < DISMISS_TTL) {
        resolve(true);
      } else {
        resolve(false);
      }
    });
  });
  if (dismissCheck) return;

  // --- Tips (50 hardcoded) ---
  const ALL_TIPS = [
    { title: "Quick sum with status bar", description: "Select any range of cells and the bottom-right status bar instantly shows SUM, AVERAGE, COUNT, MIN, and MAX without writing any formula." },
    { title: "Freeze header rows", description: "Go to View > Freeze > 1 row to keep your header visible while scrolling through long spreadsheets." },
    { title: "Paint format tool", description: "Select a formatted cell, click the paint roller icon in the toolbar, then click another cell to copy the formatting. Double-click the roller to apply to multiple cells." },
    { title: "Insert current date", description: "Press Ctrl+; (semicolon) to instantly insert today's date into the selected cell." },
    { title: "Insert current time", description: "Press Ctrl+Shift+; (semicolon) to instantly insert the current time into the selected cell." },
    { title: "Absolute references with F4", description: "While editing a formula, press F4 to toggle a cell reference between relative (A1), absolute ($A$1), and mixed ($A1 or A$1)." },
    { title: "Select entire column", description: "Press Ctrl+Space to select the entire column of the active cell. Great for applying formatting to a whole column quickly." },
    { title: "Select entire row", description: "Press Shift+Space to select the entire row of the active cell." },
    { title: "Navigate to cell A1", description: "Press Ctrl+Home to jump back to cell A1 from anywhere in the spreadsheet." },
    { title: "Jump to edge of data", description: "Press Ctrl+Arrow key to jump to the last filled cell in that direction. Handy for navigating large datasets." },
    { title: "Explore menu with Alt+/", description: "Press Alt+/ (or Option+/ on Mac) to open the menu search box. Type any command name to find it without clicking through menus." },
    { title: "Wrap text in cells", description: "Select cells, then go to Format > Text wrapping > Wrap to make long text display on multiple lines within the cell." },
    { title: "Split text to columns", description: "Select a column with delimited data, then go to Data > Split text to columns. Sheets auto-detects the separator." },
    { title: "Remove duplicates", description: "Select your data range, then go to Data > Data cleanup > Remove duplicates. Choose which columns to check for duplicates." },
    { title: "Data validation dropdowns", description: "Select cells, go to Data > Data validation > Add rule, choose 'Dropdown' and enter your options to create a dropdown list in cells." },
    { title: "Conditional formatting", description: "Go to Format > Conditional formatting to color cells based on their values. Use color scales for numeric data or custom rules for text." },
    { title: "Alternating row colors", description: "Go to Format > Alternating colors to apply a zebra-stripe pattern to your table with one click." },
    { title: "ARRAYFORMULA for ranges", description: "Wrap a formula in ARRAYFORMULA() to apply it to an entire column at once instead of dragging it down row by row." },
    { title: "VLOOKUP basics", description: "Use =VLOOKUP(search_key, range, column_index, FALSE) to find and return data from another table. The FALSE ensures exact matches." },
    { title: "XLOOKUP over VLOOKUP", description: "XLOOKUP is more flexible than VLOOKUP: =XLOOKUP(search_key, lookup_range, result_range). It can look left and returns cleaner errors." },
    { title: "UNIQUE function", description: "Use =UNIQUE(range) to instantly extract all unique values from a column. No helper columns needed." },
    { title: "FILTER function", description: "Use =FILTER(range, condition) to extract rows matching criteria. Example: =FILTER(A:C, B:B>100) returns rows where column B exceeds 100." },
    { title: "SORT function", description: "Use =SORT(range, sort_column, is_ascending) to create a dynamically sorted copy of your data that updates automatically." },
    { title: "QUERY function", description: "Use =QUERY(range, \"SELECT * WHERE B > 100 ORDER BY C DESC\") to run SQL-like queries on your data directly in Sheets." },
    { title: "IMPORTRANGE for cross-sheets", description: "Use =IMPORTRANGE(\"spreadsheet_url\", \"Sheet1!A:C\") to pull data from another spreadsheet into your current one." },
    { title: "SPARKLINE in-cell charts", description: "Use =SPARKLINE(range) to create a tiny chart inside a cell. Add options like {\"charttype\",\"bar\"} for bar charts." },
    { title: "IMAGE function", description: "Use =IMAGE(\"url\") to embed an image directly into a cell from a URL." },
    { title: "Named ranges", description: "Go to Data > Named ranges to give a cell range a descriptive name like 'Revenue'. Then use that name in formulas instead of A2:A100." },
    { title: "Transpose data", description: "Use =TRANSPOSE(range) to flip rows into columns or columns into rows. Or use Paste Special > Paste transposed." },
    { title: "Paste values only", description: "Press Ctrl+Shift+V to paste only values without formulas or formatting. Great for cleaning up copied data." },
    { title: "Find and replace", description: "Press Ctrl+H to open Find and Replace. Use 'Search using regular expressions' for advanced pattern matching." },
    { title: "Protect sheets and ranges", description: "Right-click a sheet tab > Protect sheet, or go to Data > Protect sheets and ranges to prevent accidental edits to important data." },
    { title: "Version history", description: "Go to File > Version history > See version history (or Ctrl+Alt+Shift+H) to view and restore previous versions of your spreadsheet." },
    { title: "Create a chart instantly", description: "Select your data range and press Alt+F1 (or go to Insert > Chart) to create a chart. Sheets auto-suggests the best chart type." },
    { title: "Checkbox cells", description: "Select cells and go to Insert > Checkbox to add interactive checkboxes. They return TRUE/FALSE and work in formulas." },
    { title: "Custom number formats", description: "Go to Format > Number > Custom number format to create patterns like $#,##0.00 or 0.0% for exactly the display you want." },
    { title: "Group rows or columns", description: "Select rows/columns, then go to View > Group to create collapsible sections. Click the +/- button to expand or collapse." },
    { title: "Pivot tables", description: "Select your data and go to Insert > Pivot table. Drag fields into Rows, Columns, and Values to summarize large datasets." },
    { title: "Slicer for filtering", description: "Add a slicer (Data > Add a slicer) to create a visual filter button for pivot tables or regular data ranges." },
    { title: "IFERROR for clean output", description: "Wrap formulas in =IFERROR(formula, \"fallback\") to display a clean message instead of ugly error codes like #N/A or #REF!." },
    { title: "Ctrl+F to search the sheet", description: "Press Ctrl+F to quickly find text or numbers in your spreadsheet. Press Ctrl+H to also replace found values." },
    { title: "Zoom in and out", description: "Press Ctrl+Plus to zoom in or Ctrl+Minus to zoom out. Ctrl+0 resets to default zoom. Also available under View > Zoom." },
    { title: "Open links in new tab", description: "Hold Ctrl (or Cmd on Mac) and click any hyperlink in a cell to open it in a new browser tab instead of navigating away." },
    { title: "Keyboard shortcut list", description: "Press Ctrl+/ to open the full keyboard shortcuts reference panel inside Google Sheets." },
    { title: "Tab to auto-complete", description: "When typing a formula, Sheets suggests functions. Press Tab to accept the suggestion instead of typing the full function name." },
    { title: "Notification rules", description: "Go to Tools > Notification settings to get email alerts when someone makes changes to your spreadsheet." },
    { title: "Apps Script automation", description: "Go to Extensions > Apps Script to write custom functions and automations using JavaScript. Automate repetitive tasks with triggers." },
    { title: "Download as Excel or PDF", description: "Go to File > Download to export your spreadsheet as .xlsx, .pdf, .csv, or other formats for sharing outside of Google." },
    { title: "Comment with @mentions", description: "Right-click a cell and select Comment (or press Ctrl+Alt+M). Type @ followed by an email to notify collaborators directly." },
    { title: "Trim whitespace cleanup", description: "Go to Data > Data cleanup > Trim whitespace to remove leading, trailing, and extra spaces from all selected cells at once." }
  ];

  function getRandomTips() {
    const shuffled = [...ALL_TIPS].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 5);
  }

  // --- Inject CSS ---
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = chrome.runtime.getURL("css/widget.css");
  document.head.appendChild(link);

  // --- Build DOM ---
  const root = document.createElement("div");
  root.id = "searchelf-widget-root";
  root.innerHTML = `
    <div id="searchelf-widget" class="searchelf-collapsed">
      <div id="searchelf-toggle-wrap">
        <button id="searchelf-dismiss" aria-label="Dismiss widget">x</button>
        <button id="searchelf-toggle" aria-label="Open tips">
          <span class="searchelf-emoji">${config.widgetEmoji || "\uD83D\uDCA1"}</span>
          <span class="searchelf-label">${config.widgetLabel || "Tips"}</span>
        </button>
      </div>
      <div id="searchelf-panel">
        <div class="searchelf-panel-header">
          <span class="searchelf-panel-title">\u2728 ${config.name || "Tips"}</span>
          <button id="searchelf-close" aria-label="Close">&times;</button>
        </div>
        <div id="searchelf-content">
          <div id="searchelf-tip-card" class="searchelf-hidden">
            <div class="searchelf-tip-number"></div>
            <h3 class="searchelf-tip-title"></h3>
            <p class="searchelf-tip-desc"></p>
          </div>
        </div>
        <div id="searchelf-nav" class="searchelf-hidden">
          <button id="searchelf-prev">&larr; Prev</button>
          <span id="searchelf-counter"></span>
          <button id="searchelf-next">Next &rarr;</button>
        </div>
      </div>
    </div>
  `;
  document.body.appendChild(root);

  // Apply theme
  const widget = document.getElementById("searchelf-widget");
  widget.style.setProperty("--searchelf-primary", config.primaryColor || "#6C63FF");
  widget.style.setProperty("--searchelf-accent", config.accentColor || "#FF6584");

  // --- Element refs ---
  const $ = (id) => document.getElementById(id);
  const toggle = $("searchelf-toggle");
  const closeBtn = $("searchelf-close");
  const tipCard = $("searchelf-tip-card");
  const tipNumber = root.querySelector(".searchelf-tip-number");
  const tipTitle = root.querySelector(".searchelf-tip-title");
  const tipDesc = root.querySelector(".searchelf-tip-desc");
  const nav = $("searchelf-nav");
  const prevBtn = $("searchelf-prev");
  const nextBtn = $("searchelf-next");
  const counter = $("searchelf-counter");
  const dismissBtn = $("searchelf-dismiss");

  let tips = [];
  let currentIdx = 0;

  // --- Helpers ---
  function show(el) { el.classList.remove("searchelf-hidden"); }
  function hide(el) { el.classList.add("searchelf-hidden"); }

  function renderTip() {
    if (!tips.length) return;
    const tip = tips[currentIdx];
    tipNumber.textContent = `\uD83D\uDCA1 Tip ${currentIdx + 1} of ${tips.length}`;
    tipTitle.textContent = tip.title;
    tipDesc.textContent = tip.description;
    counter.textContent = `${currentIdx + 1} / ${tips.length}`;
    prevBtn.disabled = currentIdx === 0;
    nextBtn.disabled = currentIdx === tips.length - 1;
    show(tipCard);
    show(nav);
  }

  function loadTips() {
    tips = getRandomTips();
    currentIdx = 0;
    renderTip();
  }

  // --- Event Listeners ---
  dismissBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    chrome.storage.local.set({ [DISMISS_KEY]: Date.now() });
    root.remove();
  });

  toggle.addEventListener("click", () => {
    widget.classList.remove("searchelf-collapsed");
    widget.classList.add("searchelf-expanded");
    loadTips();
  });

  closeBtn.addEventListener("click", () => {
    widget.classList.remove("searchelf-expanded");
    widget.classList.add("searchelf-collapsed");
  });

  prevBtn.addEventListener("click", () => {
    if (currentIdx > 0) { currentIdx--; renderTip(); }
  });

  nextBtn.addEventListener("click", () => {
    if (currentIdx < tips.length - 1) { currentIdx++; renderTip(); }
  });
})();
