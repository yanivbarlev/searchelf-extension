// Content Script — Canva tips widget
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

  // --- 50 Canva Tips ---
  const ALL_TIPS = [
    { title: "Duplicate elements fast", description: "Select any element and press Ctrl+D (Cmd+D on Mac) to instantly duplicate it on the canvas." },
    { title: "Undo and redo", description: "Press Ctrl+Z to undo and Ctrl+Shift+Z (Cmd+Shift+Z on Mac) to redo your last actions." },
    { title: "Select all on page", description: "Press Ctrl+A (Cmd+A on Mac) to select all elements on the current page at once." },
    { title: "Group elements together", description: "Select multiple elements, then press Ctrl+G (Cmd+G on Mac) to group them so they move and resize as one." },
    { title: "Ungroup elements", description: "Select a group and press Ctrl+Shift+G (Cmd+Shift+G on Mac) to ungroup them back into individual elements." },
    { title: "Copy and paste styles", description: "Select an element, press Ctrl+Alt+C to copy its style, then select another and press Ctrl+Alt+V to paste the style." },
    { title: "Zoom in and out", description: "Press Ctrl+Plus to zoom in and Ctrl+Minus to zoom out. Press Ctrl+0 to fit the design to screen." },
    { title: "Lock element position", description: "Right-click an element and select 'Lock' to prevent accidentally moving it while editing other parts." },
    { title: "Use the / search shortcut", description: "Press the / key to open Canva's quick search — find templates, elements, photos, and fonts instantly." },
    { title: "Add a text box quickly", description: "Press T on your keyboard to add a new text box to your design without using the sidebar." },
    { title: "Add a rectangle quickly", description: "Press R on your keyboard to add a rectangle shape to your canvas instantly." },
    { title: "Add a circle quickly", description: "Press C on your keyboard to add a circle shape to your canvas instantly." },
    { title: "Add a line quickly", description: "Press L on your keyboard to add a line to your canvas instantly." },
    { title: "Nudge elements precisely", description: "Use arrow keys to move selected elements 1 pixel at a time. Hold Shift+Arrow to nudge by 10 pixels." },
    { title: "Send element backward", description: "Select an element and press Ctrl+[ to send it one layer back, or Ctrl+Shift+[ to send it to the very back." },
    { title: "Bring element forward", description: "Select an element and press Ctrl+] to bring it one layer forward, or Ctrl+Shift+] to bring it to the very front." },
    { title: "Use brand colors consistently", description: "Go to Brand Kit in the sidebar to save your brand colors, fonts, and logos for quick access across all designs." },
    { title: "Resize for any platform", description: "Click 'Resize' at the top to instantly convert your design to Instagram, Facebook, Twitter, or any custom dimensions." },
    { title: "Use grids for photo layouts", description: "Search 'grid' in the Elements tab to find photo grid layouts that let you drag and drop multiple images neatly." },
    { title: "Find free elements easily", description: "When searching elements, look for items without a crown icon — those are free. The crown means Canva Pro only." },
    { title: "Use frames for cropping", description: "Search 'frame' in Elements to find shapes you can drag photos into — the photo auto-crops to fit the frame shape." },
    { title: "Adjust photo transparency", description: "Select any image or element and click the transparency icon (checkerboard) in the top toolbar to adjust its opacity." },
    { title: "Apply filters to photos", description: "Click on a photo, then select 'Edit image' to access filters, adjust brightness, contrast, saturation, and more." },
    { title: "Use Canva's background remover", description: "Click a photo, go to 'Edit image', and use 'Background Remover' to remove the background in one click (Pro feature)." },
    { title: "Align elements perfectly", description: "Select multiple elements, then use the 'Position' button in the top toolbar to align them (left, center, right, distribute)." },
    { title: "Save as template", description: "After creating a design you like, click Share > More > 'Save as template' to reuse it later." },
    { title: "Use magic resize", description: "Create one design, then use 'Resize' to instantly create versions for different platforms without redesigning from scratch." },
    { title: "Add clickable links", description: "Select any text or element, click the chain/link icon in the toolbar, and paste a URL to make it clickable in PDF exports." },
    { title: "Use Canva's color picker", description: "When choosing a color, click the rainbow-colored tile to open the color picker, or paste a hex code directly." },
    { title: "Match colors from a photo", description: "Upload a photo, and Canva will suggest a color palette extracted from it in the color picker panel." },
    { title: "Add page transitions", description: "In presentation mode, click between slides to add transitions like dissolve, slide, or fade between pages." },
    { title: "Present directly from Canva", description: "Click the Present button to run your slides as a full-screen presentation right from the browser." },
    { title: "Collaborate in real time", description: "Click Share and invite others by email — multiple people can edit the same design simultaneously." },
    { title: "Leave comments on designs", description: "Click the speech bubble icon to add comments on specific parts of the design for team feedback." },
    { title: "Use folders to organize", description: "Create folders in your Canva home page to organize designs by project, client, or category." },
    { title: "Download with transparent background", description: "When downloading as PNG, check 'Transparent background' to get an image with no background (Pro feature)." },
    { title: "Use Canva's built-in charts", description: "Search 'chart' in Elements to find bar charts, pie charts, and line graphs that you can edit with your own data." },
    { title: "Create animated designs", description: "Click 'Animate' in the top toolbar to add entrance animations to your entire page or individual elements." },
    { title: "Use the ruler and guides", description: "Go to File > Show rulers and guides to add alignment guides that help you position elements precisely." },
    { title: "Duplicate an entire page", description: "Click the duplicate icon next to a page thumbnail in the bottom bar to copy the entire page with all its elements." },
    { title: "Reorder pages by dragging", description: "In the bottom page bar, drag and drop page thumbnails to reorder your slides or multi-page designs." },
    { title: "Use consistency with spacing", description: "When you move elements, Canva shows pink alignment guides — use them to keep equal spacing between elements." },
    { title: "Upload your own fonts", description: "With Canva Pro, go to Brand Kit > Upload a font to use your own custom fonts across all designs." },
    { title: "Search for specific photo styles", description: "Use descriptive searches like 'flat lay coffee' or 'minimal workspace' in Photos to find exactly the style you need." },
    { title: "Use the Canva Print service", description: "Click 'Print with Canva' to order physical prints of your business cards, flyers, or posters delivered to your door." },
    { title: "Create a design from a photo", description: "Upload a photo and right-click > 'Use in a design' to start a new project with that image already placed." },
    { title: "Use the Styles tab for themes", description: "Click 'Styles' in the sidebar to apply pre-made color and font combinations to your entire design at once." },
    { title: "Flip elements horizontally", description: "Select an element, click 'Flip' in the top toolbar to mirror it horizontally or vertically." },
    { title: "Use Smart Mockups", description: "Place your design into realistic mockups (phone screens, t-shirts, frames) via the 'Mockups' app in Canva." },
    { title: "Bookmark Canva for quick access", description: "Press Ctrl+D (Cmd+D on Mac) in your browser to bookmark Canva so you can jump back to your designs instantly." },
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
