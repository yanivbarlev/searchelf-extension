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
    // A. Pinterest-specific features (~15)
    {
      title: "Search Inside a Board",
      description: "Open any of your boards and type in the search bar at the top to filter pins within that board. Great for finding a specific pin you saved months ago."
    },
    {
      title: "Filter by Format",
      description: "In search results, click the filter icon and choose Videos, Shopping, or People to narrow results to just that content type."
    },
    {
      title: "Secret Boards",
      description: "Create a secret board (toggle 'Keep this board secret' when creating) to save pins only you can see — perfect for gifts or private projects."
    },
    {
      title: "Pin to Multiple Boards",
      description: "When saving a pin, click 'More options' to save it to several boards at once instead of re-pinning it separately each time."
    },
    {
      title: "Edit Any Saved Pin",
      description: "Click a saved pin, then the pencil icon to edit the title, description, or destination link. Add your own notes so you remember why you saved it."
    },
    {
      title: "Board Sections",
      description: "Inside any board, click '+ Section' to create subsections. For example, a 'Home Decor' board can have sections for Living Room, Bedroom, and Kitchen."
    },
    {
      title: "Collaborate on a Board",
      description: "Open a board, click the pencil icon, and invite collaborators by email. They can add and re-arrange pins alongside you."
    },
    {
      title: "Try on with Pinterest Lens",
      description: "On mobile, tap the camera icon in search to use Pinterest Lens — point it at any object to find visually similar pins instantly."
    },
    {
      title: "Save from Any Website",
      description: "Install the Pinterest browser button (extensions.pinterest.com) to save images from any website directly to your boards with one click."
    },
    {
      title: "Visual Search Inside a Pin",
      description: "Open any pin and click the search icon that appears on the image to search for similar items within that specific photo."
    },
    {
      title: "Sort Your Boards",
      description: "On your profile, drag boards to rearrange them. Put your most-used boards at the top so they appear first."
    },
    {
      title: "Follow Specific Topics",
      description: "Instead of following an entire account, follow individual boards from creators whose whole feed doesn't interest you."
    },
    {
      title: "Download a Pin Image",
      description: "Open any pin and click the three-dot menu (…) then 'Download image' to save it directly to your device."
    },
    {
      title: "Pinterest Trends Tool",
      description: "Visit pinterest.com/trends to see what's trending by season or keyword — useful for planning content or discovering what's popular right now."
    },
    {
      title: "Link Pins to Exact URLs",
      description: "When editing a saved pin, update the destination link to point to the exact product page or article, not just the homepage."
    },

    // B. Browser features useful on Pinterest (~15)
    {
      title: "Ctrl+F to Search Visible Pins",
      description: "Press Ctrl+F (Cmd+F on Mac) to open browser find. It won't search all pins, but you can quickly highlight text in pin descriptions currently visible on screen."
    },
    {
      title: "Middle-Click to Open in New Tab",
      description: "Middle-click any pin to open it in a background tab. Browse through many pins without losing your place in the feed."
    },
    {
      title: "Zoom In on Small Images",
      description: "Press Ctrl++ (Cmd++ on Mac) to zoom into the page and see pin thumbnails more clearly. Press Ctrl+0 to reset zoom."
    },
    {
      title: "Bookmark Your Favorite Board",
      description: "Press Ctrl+D (Cmd+D on Mac) to bookmark a specific Pinterest board URL. Jump straight to it next visit without navigating through your profile."
    },
    {
      title: "Open Pinterest in a Tab Group",
      description: "Right-click a Pinterest tab and choose 'Add to new group' to color-code it. Keep all your inspiration tabs organized together."
    },
    {
      title: "Pin Tab to Always Keep Open",
      description: "Right-click the Pinterest tab and choose 'Pin tab' so it stays as a compact icon and doesn't get accidentally closed."
    },
    {
      title: "Use Reader Mode for Articles",
      description: "When a pin links to an article, click the reader mode icon in the address bar for a clean, ad-free reading experience."
    },
    {
      title: "Translate Foreign Pins",
      description: "If you find pins in another language, right-click the page and choose 'Translate to English' to read descriptions and comments."
    },
    {
      title: "Screenshot the Whole Feed",
      description: "Press Ctrl+Shift+S (Chrome) or use a screenshot extension to capture an entire Pinterest board as one scrolling image."
    },
    {
      title: "Dark Mode via Browser",
      description: "If Pinterest doesn't offer dark mode, enable it at the OS level (Windows: Settings > Personalization > Colors) — browsers and web apps often follow your system preference."
    },
    {
      title: "Multiple Chrome Profiles",
      description: "Create separate Chrome profiles for personal and work Pinterest accounts. Click the profile icon in the top-right corner to add a new profile."
    },
    {
      title: "Restore Accidentally Closed Tabs",
      description: "Press Ctrl+Shift+T (Cmd+Shift+T on Mac) to reopen the last closed tab, including any Pinterest board or pin you accidentally closed."
    },
    {
      title: "Right-Click to Copy Image",
      description: "Right-click any pin thumbnail and choose 'Copy image' to paste it directly into documents, emails, or design tools."
    },
    {
      title: "Focus Address Bar Quickly",
      description: "Press Ctrl+L (Cmd+L on Mac) to jump to the address bar. Type 'pinterest.com/search/pins/?q=' followed by your search term to navigate directly."
    },
    {
      title: "Inspect Colors with Eye Dropper",
      description: "Chrome has a built-in color picker: press F12, click the three-dot menu > More tools > Color picker to grab any hex color you see on a pin."
    },

    // C. Social media / discovery productivity tips (~10)
    {
      title: "Follow Hashtags Like Topics",
      description: "Click any hashtag in a pin description to see all pins tagged with it. You can follow that topic from the results page."
    },
    {
      title: "Use Specific Keywords",
      description: "Be precise in search — 'minimalist bedroom navy blue' beats 'bedroom ideas'. The more specific, the more relevant pins you'll discover."
    },
    {
      title: "Organize Boards Before They Grow",
      description: "Create board sections early rather than after saving 500 pins. Reorganizing large boards later is time-consuming."
    },
    {
      title: "Use Pinterest for Price Tracking",
      description: "Many shopping pins show live prices. If a pin links to a product, Pinterest sometimes notifies you when the price drops."
    },
    {
      title: "Save Recipes with Ingredients Visible",
      description: "When saving a recipe pin, add a note in the description like '—tried this 2024, swap sugar for honey' so future-you has context."
    },
    {
      title: "Follow Competitors' Boards",
      description: "If you use Pinterest for business, follow your competitors' boards to stay aware of what content resonates in your niche."
    },
    {
      title: "Use 'Tried It' on Recipes",
      description: "On recipe pins, click 'Tried it' to leave your own rating and notes. Pinterest surfaces well-tried recipes in your feed."
    },
    {
      title: "Clear Your Search History",
      description: "Go to Settings > Privacy and data > Clear search history to reset Pinterest's recommendation algorithm if your feed feels stale."
    },
    {
      title: "Mute Accounts You Dislike",
      description: "Click the three-dot menu on any pin and choose 'Hide pin' or 'Show fewer pins like this' to train your feed without unfollowing."
    },
    {
      title: "Share Boards via Link",
      description: "Copy a board's URL and share it with anyone — even people without a Pinterest account can browse public boards without logging in."
    },

    // D. General power-user tips (~10)
    {
      title: "Use a Password Manager",
      description: "A password manager like Bitwarden (free) auto-fills your Pinterest login on any device so you're never locked out."
    },
    {
      title: "Enable Two-Factor Authentication",
      description: "Go to Settings > Security > Two-factor authentication to add a second layer of protection to your Pinterest account."
    },
    {
      title: "Download Your Pinterest Data",
      description: "Go to Settings > Privacy and data > Request your data to download a full archive of everything you've ever saved."
    },
    {
      title: "Manage Notification Overload",
      description: "Go to Settings > Notifications to turn off email and push alerts for board activity, recommendations, and follower updates you don't need."
    },
    {
      title: "Check Linked Accounts",
      description: "In Settings > Social permissions, you can connect or disconnect Pinterest from Facebook, Google, and other accounts at any time."
    },
    {
      title: "Use Pinterest on Desktop for Power Features",
      description: "The desktop site has more keyboard navigation and editing tools than the mobile app. Open boards in a browser for bulk editing."
    },
    {
      title: "Tab Groups for Inspiration Sessions",
      description: "Open 10 inspiring pins in tabs, group them in Chrome with Ctrl+click > 'Add to new group', then work through them one by one."
    },
    {
      title: "Keyboard Navigation in Modals",
      description: "When a pin is open in a modal, press Escape to close it, or click outside the modal. No need to reach for the X button."
    },
    {
      title: "Reverse Image Search a Pin",
      description: "Right-click any pin image and choose 'Search image with Google' to find the original source, full resolution, or where it's sold."
    },
    {
      title: "Set Pinterest as Your New Tab",
      description: "Extensions like 'Pinterest New Tab' replace the default new tab with a Pinterest feed, so every new tab opens an inspiring board."
    }
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
  widget.style.setProperty("--searchelf-primary", config.primaryColor || "#E60023");
  widget.style.setProperty("--searchelf-accent", config.accentColor || "#AD081B");

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
