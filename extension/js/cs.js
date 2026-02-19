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
  const CACHE_KEY = `tips_${hostname}`;
  const CACHE_TTL = 24 * 60 * 60 * 1000; // 24h

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
  const panel = $("searchelf-panel");
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
    if (cached) {
      console.log("[CS] Tips loaded from cache for", hostname);
      tips = cached;
      currentIdx = 0;
      renderTip();
      return;
    }

    if (!config.groqApiKey || config.groqApiKey === "YOUR_GROQ_API_KEY_HERE") {
      showError("Please set your Groq API key in config.json");
      return;
    }

    try {
      const resp = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${config.groqApiKey}`,
        },
        body: JSON.stringify({
          model: config.groqModel || "llama-3.3-70b-versatile",
          messages: [
            {
              role: "system",
              content:
                'You are a power-user assistant. Return ONLY a JSON array (no markdown, no explanation) of exactly 5 objects with "title" and "description" keys.',
            },
            {
              role: "user",
              content: `The user is on ${hostname}. Give 5 useful tips, shortcuts, or hidden features for this site.`,
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
      const content = data.choices[0].message.content.trim();

      // Parse JSON - handle possible markdown code fences
      let parsed;
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        parsed = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("Could not parse tips from response");
      }

      tips = parsed;
      currentIdx = 0;
      setCache(tips);
      renderTip();
      console.log("[CS] Tips fetched from Groq for", hostname);
    } catch (err) {
      console.error("[CS] Groq API error:", err);
      showError("Failed to fetch tips. " + err.message);
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
