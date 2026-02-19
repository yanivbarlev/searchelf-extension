// [CS] Content Script - Widget injection + logic (has chrome.storage + DOM access)
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
  const CACHE_VERSION = "v3";
  const CACHE_KEY = `tips_${CACHE_VERSION}_${hostname}`;
  const CACHE_TTL = 24 * 60 * 60 * 1000; // 24h

  // --- Generic Fallback Tips (50) ---
  const GENERIC_TIPS = [
    { title: "Quick page search", description: "Press Ctrl+F (Cmd+F on Mac) to find any word or phrase on the current page instantly." },
    { title: "Bookmark this page", description: "Press Ctrl+D (Cmd+D on Mac) to bookmark the current page for easy access later." },
    { title: "Reopen closed tab", description: "Accidentally closed a tab? Press Ctrl+Shift+T (Cmd+Shift+T on Mac) to reopen it." },
    { title: "Zoom in for readability", description: "Press Ctrl+Plus (Cmd+Plus on Mac) to zoom in, Ctrl+Minus to zoom out, or Ctrl+0 to reset." },
    { title: "Open link in new tab", description: "Hold Ctrl (Cmd on Mac) and click any link to open it in a new background tab." },
    { title: "Navigate back and forward", description: "Use Alt+Left Arrow to go back and Alt+Right Arrow to go forward in your browsing history." },
    { title: "Scroll faster", description: "Press Spacebar to scroll down a full page, or Shift+Spacebar to scroll up." },
    { title: "Jump to address bar", description: "Press Ctrl+L (Cmd+L on Mac) to instantly select the URL bar and start typing." },
    { title: "Google site-specific search", description: "Search only this site by typing site:example.com your-query in Google's search bar." },
    { title: "Print or save as PDF", description: "Press Ctrl+P (Cmd+P on Mac) to print or save the current page as a PDF file." },
    { title: "View page source", description: "Press Ctrl+U (Cmd+Option+U on Mac) to view the raw HTML source of any webpage." },
    { title: "Hard refresh the page", description: "Press Ctrl+Shift+R (Cmd+Shift+R on Mac) to reload the page ignoring cached files." },
    { title: "Use Reader Mode", description: "In Firefox, Safari, or Edge, click the Reader icon in the address bar to strip ads and clutter." },
    { title: "Mute a noisy tab", description: "Right-click any tab and select 'Mute tab' to silence audio without closing it." },
    { title: "Pin important tabs", description: "Right-click a tab and select 'Pin' to shrink it and lock it to the left side of your tab bar." },
    { title: "Search open tabs", description: "In Chrome, press Ctrl+Shift+A to search through all your open tabs by title." },
    { title: "Duplicate a tab", description: "Right-click any tab and select 'Duplicate' to open an exact copy of the current page." },
    { title: "Drag text to search", description: "Select any text on a page and drag it to the address bar to search for it instantly." },
    { title: "Full-screen mode", description: "Press F11 to toggle full-screen mode for a distraction-free browsing experience." },
    { title: "Open DevTools console", description: "Press F12 or Ctrl+Shift+J to open browser developer tools for debugging." },
    { title: "Translate any page", description: "Right-click on a page in Chrome and select 'Translate to English' for instant translation." },
    { title: "Create a desktop shortcut", description: "In Chrome, go to Menu > More tools > Create shortcut to add a site to your desktop." },
    { title: "Open incognito window", description: "Press Ctrl+Shift+N (Cmd+Shift+N on Mac) to open a private browsing window." },
    { title: "View download history", description: "Press Ctrl+J (Cmd+Shift+J on Mac) to see all your recent downloads." },
    { title: "Jump to top of page", description: "Press the Home key to instantly scroll to the top of any page." },
    { title: "Jump to bottom of page", description: "Press the End key to instantly scroll to the bottom of any page." },
    { title: "Switch between tabs", description: "Press Ctrl+Tab to cycle forward through tabs, or Ctrl+Shift+Tab to go backwards." },
    { title: "Go to a specific tab", description: "Press Ctrl+1 through Ctrl+8 to jump directly to that numbered tab. Ctrl+9 goes to the last tab." },
    { title: "Open a new window", description: "Press Ctrl+N (Cmd+N on Mac) to open a fresh new browser window." },
    { title: "Close the current tab", description: "Press Ctrl+W (Cmd+W on Mac) to quickly close the tab you're viewing." },
    { title: "Select all text", description: "Press Ctrl+A (Cmd+A on Mac) to select all text on the page for easy copying." },
    { title: "Save a page offline", description: "Press Ctrl+S (Cmd+S on Mac) to save the complete webpage to your computer for offline viewing." },
    { title: "Use keyboard to navigate links", description: "Press Tab to move between clickable links and buttons, then Enter to activate them." },
    { title: "Check site security", description: "Click the padlock icon in the address bar to view the site's SSL certificate and security details." },
    { title: "Manage saved passwords", description: "Go to chrome://settings/passwords to view, edit, or delete passwords saved by your browser." },
    { title: "Clear browsing data", description: "Press Ctrl+Shift+Delete to open the dialog to clear your cache, cookies, and browsing history." },
    { title: "Take a screenshot", description: "On Windows press Win+Shift+S, on Mac press Cmd+Shift+4 to capture part of your screen." },
    { title: "Increase text contrast", description: "Enable High Contrast mode in your OS accessibility settings for easier reading on any site." },
    { title: "Block pop-ups", description: "Go to browser Settings > Privacy > Pop-ups to block unwanted pop-up windows on any site." },
    { title: "Add a search engine shortcut", description: "In Chrome Settings > Search engine, add custom site searches you can trigger from the address bar." },
    { title: "Use tab groups", description: "Right-click a tab and select 'Add to group' to color-code and organize related tabs together." },
    { title: "Restore your last session", description: "In Chrome Settings > On startup, choose 'Continue where you left off' to auto-restore tabs." },
    { title: "Share a page link quickly", description: "Click the address bar to select the URL, then Ctrl+C to copy it. Share it anywhere." },
    { title: "View cached version of a page", description: "If a page is down, search for it on Google and click the cached version link to see a saved copy." },
    { title: "Use multiple profiles", description: "Create separate browser profiles for work and personal use to keep bookmarks and history separate." },
    { title: "Disable notifications", description: "Go to browser Settings > Notifications to stop sites from sending you push notification requests." },
    { title: "Enable dark mode", description: "Many sites respect your OS dark mode setting. Enable it in your system preferences for easier night reading." },
    { title: "Copy link to text fragment", description: "Select text on a page, right-click, and choose 'Copy link to highlight' to share a link that scrolls directly to that text." },
    { title: "Use text-to-speech", description: "Select text, right-click, and look for 'Read aloud' (Edge) or use a screen reader extension." },
    { title: "Middle-click to open in new tab", description: "Click any link with the mouse middle button (scroll wheel click) to open it in a new tab." },
  ];

  function getRandomGenericTips() {
    const shuffled = [...GENERIC_TIPS].sort(() => Math.random() - 0.5);
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
      <button id="searchelf-toggle" aria-label="Open tips">
        <span class="searchelf-emoji">${config.widgetEmoji || "\uD83D\uDCA1"}</span>
        <span class="searchelf-label">${config.widgetLabel || "Tips"}</span>
      </button>
      <div id="searchelf-panel">
        <div class="searchelf-panel-header">
          <span class="searchelf-panel-title">\u2728 Tips for ${hostname}</span>
          <button id="searchelf-close" aria-label="Close">&times;</button>
        </div>
        <div id="searchelf-content">
          <div id="searchelf-loading" class="searchelf-hidden">
            <div class="searchelf-spinner"></div>
            <p>Fetching tips...</p>
          </div>
          <div id="searchelf-tip-card" class="searchelf-hidden">
            <div class="searchelf-tip-number"></div>
            <h3 class="searchelf-tip-title"></h3>
            <p class="searchelf-tip-desc"></p>
          </div>
          <div id="searchelf-error" class="searchelf-hidden">
            <p></p>
            <button id="searchelf-retry">Retry</button>
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
  const loading = $("searchelf-loading");
  const tipCard = $("searchelf-tip-card");
  const tipNumber = root.querySelector(".searchelf-tip-number");
  const tipTitle = root.querySelector(".searchelf-tip-title");
  const tipDesc = root.querySelector(".searchelf-tip-desc");
  const errorDiv = $("searchelf-error");
  const retryBtn = $("searchelf-retry");
  const nav = $("searchelf-nav");
  const prevBtn = $("searchelf-prev");
  const nextBtn = $("searchelf-next");
  const counter = $("searchelf-counter");

  let tips = [];
  let currentIdx = 0;
  let loaded = false;
  let isGeneric = false;

  // --- Helpers ---
  function show(el) { el.classList.remove("searchelf-hidden"); }
  function hide(el) { el.classList.add("searchelf-hidden"); }

  function renderTip() {
    if (!tips.length) return;
    const tip = tips[currentIdx];
    const label = isGeneric ? " (generic)" : "";
    tipNumber.textContent = `\uD83D\uDCA1 Tip ${currentIdx + 1} of ${tips.length}${label}`;
    tipTitle.textContent = tip.title;
    tipDesc.textContent = tip.description;
    counter.textContent = `${currentIdx + 1} / ${tips.length}`;
    prevBtn.disabled = currentIdx === 0;
    nextBtn.disabled = currentIdx === tips.length - 1;
    show(tipCard);
    show(nav);
    hide(loading);
    hide(errorDiv);
  }

  function showError(msg) {
    errorDiv.querySelector("p").textContent = msg;
    show(errorDiv);
    hide(loading);
    hide(tipCard);
    hide(nav);
  }

  function showGenericFallback(reason) {
    console.error("[CS] Falling back to generic tips. Reason:", reason);
    isGeneric = true;
    tips = getRandomGenericTips();
    currentIdx = 0;
    renderTip();
  }

  // --- Cache ---
  function getCached() {
    return new Promise((resolve) => {
      chrome.storage.local.get([CACHE_KEY], (result) => {
        const cached = result[CACHE_KEY];
        if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
          resolve(cached.tips);
        } else {
          resolve(null);
        }
      });
    });
  }

  function setCache(tipsData) {
    chrome.storage.local.set({
      [CACHE_KEY]: { tips: tipsData, timestamp: Date.now() },
    });
  }

  // --- Groq API ---
  async function fetchTips() {
    show(loading);
    hide(tipCard);
    hide(nav);
    hide(errorDiv);

    // Check cache first
    const cached = await getCached();
    if (cached && Array.isArray(cached) && cached.length > 0) {
      console.log("[CS] Tips loaded from cache for", hostname);
      isGeneric = false;
      tips = cached;
      currentIdx = 0;
      renderTip();
      return;
    }

    // Decode obfuscated API key
    let apiKey;
    try {
      apiKey = atob(config.groqApiKeyEncoded).split("").reverse().join("");
    } catch (e) {
      apiKey = null;
    }
    if (!apiKey) {
      showGenericFallback("No API key configured");
      return;
    }

    try {
      console.log("[CS] Calling Groq API for", hostname);
      const resp = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: config.groqModel || "groq/compound-mini",
          messages: [
            {
              role: "system",
              content: `You are a web browsing assistant. You MUST only share tips you are fully confident are true and currently working. NEVER guess or fabricate features. If you are unsure whether a feature exists, DO NOT include it.

Return ONLY a valid JSON array (no markdown, no code fences, no explanation) of exactly 5 objects with "title" and "description" keys.

Focus on these categories (pick what's relevant):
- Universal browser features that work on this type of site (Ctrl+F, Ctrl+D, etc.)
- Well-known, verified features of the site (only if you are 100% certain they exist)
- General productivity tips for this category of website
- URL tricks or search operators that are publicly documented
- Accessibility features built into browsers that help on this site

NEVER invent keyboard shortcuts, hidden menus, or secret features. If the site is not well-known, give general web browsing tips instead.`,
            },
            {
              role: "user",
              content: `The user is browsing ${hostname}. Give 5 genuinely useful and ACCURATE tips. Only include things you know for certain are real.`,
            },
          ],
          temperature: 0.7,
          max_tokens: 1024,
        }),
      });

      if (!resp.ok) {
        const errBody = await resp.text();
        throw new Error(`API error ${resp.status}: ${errBody}`);
      }

      const data = await resp.json();
      console.log("[CS] Groq response status: OK");

      const content = (data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content) || "";
      if (!content.trim()) {
        throw new Error("Empty response content from API");
      }

      // Parse JSON - handle possible markdown code fences
      let parsed;
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        parsed = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("Could not parse tips from response");
      }

      if (!Array.isArray(parsed) || parsed.length === 0) {
        throw new Error("Parsed tips array is empty");
      }

      isGeneric = false;
      tips = parsed;
      currentIdx = 0;
      setCache(tips);
      renderTip();
      console.log("[CS] Tips fetched from Groq for", hostname);
    } catch (err) {
      console.error("[CS] Groq API error:", err);
      showGenericFallback(err.message);
    }
  }

  // --- Event Listeners ---
  toggle.addEventListener("click", () => {
    widget.classList.remove("searchelf-collapsed");
    widget.classList.add("searchelf-expanded");
    if (!loaded) {
      loaded = true;
      fetchTips();
    }
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

  retryBtn.addEventListener("click", () => {
    loaded = false;
    loaded = true;
    fetchTips();
  });

  console.log("[CS] SearchElf widget injected on", hostname);
})();
