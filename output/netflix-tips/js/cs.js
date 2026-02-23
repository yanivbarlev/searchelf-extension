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
    { title: "Secret Genre Codes", description: "Type netflix.com/browse/genre/XXXX with a code number to access hidden genre categories. For example, 11804 for Bollywood, 1365 for Action Comedies." },
    { title: "Keyboard Shortcut: Play/Pause", description: "Press Space or Enter to play or pause the current video without touching your mouse." },
    { title: "Skip Intro Shortcut", description: "Press S on your keyboard during a show intro to skip it instantly, same as clicking the Skip Intro button." },
    { title: "Toggle Fullscreen", description: "Press F to enter or exit fullscreen mode while watching any video on Netflix." },
    { title: "Mute/Unmute Quickly", description: "Press M to toggle audio mute on and off during playback without adjusting the volume slider." },
    { title: "Adjust Volume Easily", description: "Use the Up and Down arrow keys to raise or lower volume in small increments while watching." },
    { title: "Seek Forward/Back 10s", description: "Press the Left or Right arrow keys to jump back or forward 10 seconds in the current video." },
    { title: "Speed Up or Slow Down", description: "Click the speedometer icon during playback to watch at 0.5x, 0.75x, 1.25x, or 1.5x speed." },
    { title: "View Audio & Subtitles", description: "Click the speech bubble icon during playback to switch audio language or turn subtitles on/off." },
    { title: "Customize Subtitle Style", description: "Go to Account > Profile > Subtitle Appearance to change font, size, color, and background of subtitles." },
    { title: "Set Maturity Ratings", description: "Under Profile > Viewing Restrictions, set a maturity level to filter out content that exceeds your rating preference." },
    { title: "Lock Your Profile", description: "Go to Account > Profile & Parental Controls and set a 4-digit PIN to prevent others from using your profile." },
    { title: "Delete Viewing History", description: "Go to Account > Profile > Viewing Activity to hide individual titles or clear your entire watch history." },
    { title: "Remove Continue Watching", description: "In Viewing Activity, click the X next to a title to remove it from your Continue Watching row on the home screen." },
    { title: "Download for Offline", description: "On the Netflix mobile app, tap the download icon on a title to save it for watching without an internet connection." },
    { title: "Check Resolution Quality", description: "Press Ctrl+Shift+Alt+D during playback to see a debug overlay showing current streaming resolution and bitrate." },
    { title: "Force HD Streaming", description: "Go to Account > Profile > Playback Settings and set Data Usage to High to ensure maximum video quality." },
    { title: "Browse New Releases", description: "Visit netflix.com/latest to see all recently added titles organized by category." },
    { title: "My List Saves Titles", description: "Click the + icon on any title to add it to My List. Access it anytime from the left menu to find your saved picks." },
    { title: "Rate to Improve Picks", description: "Use the thumbs up/down buttons on titles to help Netflix learn your taste and improve its recommendations for you." },
    { title: "Double Thumbs Up", description: "Use the double thumbs up rating to tell Netflix you loved a title. This gives a stronger signal than a regular thumbs up." },
    { title: "Transfer a Profile", description: "Go to Account > Transfer Profile to move a profile (with its history, My List, and settings) to a new account." },
    { title: "Multiple Audio Tracks", description: "Many Netflix Originals offer audio in 10+ languages. Check the audio menu during playback to switch languages." },
    { title: "Turn Off Autoplay Previews", description: "Go to Account > Profile > Playback Settings and uncheck Autoplay Previews to stop trailers from playing on the browse screen." },
    { title: "Turn Off Next Episode", description: "In Playback Settings, uncheck Autoplay Next Episode to stop Netflix from automatically starting the next episode." },
    { title: "Search with Filters", description: "Use the search bar to find content by actor name, director, genre, or even a mood keyword like 'feel good' or 'dark'." },
    { title: "Check Data Usage", description: "Go to Account > Profile > Playback Settings to see and control how much data Netflix uses per hour of streaming." },
    { title: "Sign Out All Devices", description: "Go to Account > Security & Privacy > Sign Out of All Devices to log out every device connected to your account." },
    { title: "Manage Access & Devices", description: "Under Account > Security & Privacy > Manage Access and Devices, see which devices are using your account and revoke access." },
    { title: "Watch Party Extensions", description: "Use browser extensions like Teleparty (formerly Netflix Party) to sync playback with friends and chat while watching." },
    { title: "Ctrl+F to Find on Page", description: "Press Ctrl+F (Cmd+F on Mac) to search for text on any Netflix page, useful for finding a specific title in long lists." },
    { title: "Bookmark Your Favorites", description: "Press Ctrl+D (Cmd+D on Mac) to bookmark the current Netflix page for quick access later." },
    { title: "Open Link in New Tab", description: "Ctrl+Click (Cmd+Click on Mac) on any Netflix title link to open it in a new tab without losing your browse position." },
    { title: "Zoom In for Details", description: "Press Ctrl+Plus (Cmd+Plus on Mac) to zoom into Netflix pages. Useful for reading small description text." },
    { title: "Use Picture-in-Picture", description: "Right-click the video twice to get the browser menu, then select Picture in Picture to watch in a floating mini player." },
    { title: "Print Movie Details", description: "Press Ctrl+P (Cmd+P on Mac) on a title page to print or save a PDF of the show details, cast, and description." },
    { title: "Use Browser Dark Mode", description: "Netflix is already dark-themed, but you can use your browser's dark mode to darken other pages you browse alongside it." },
    { title: "Pin Netflix Tab", description: "Right-click the Netflix tab and select Pin Tab to keep it compact and always visible in your tab bar." },
    { title: "Create Browser Profiles", description: "Use separate Chrome profiles for different household members. Each gets their own bookmarks, extensions, and Netflix session." },
    { title: "Mute the Netflix Tab", description: "Right-click the Netflix tab and select Mute Tab to silence audio without pausing. Great for quickly answering a call." },
    { title: "Check Netflix Speed", description: "Visit fast.com (owned by Netflix) to test your internet speed and see if it's fast enough for HD or 4K streaming." },
    { title: "Screenshot a Scene", description: "Use the Snipping Tool (Win+Shift+S) or Screenshot (Cmd+Shift+4 on Mac) to capture a frame from a paused video." },
    { title: "Use Tab Groups", description: "Right-click a tab and choose Add to Group to organize your Netflix, review sites, and recommendation tabs together." },
    { title: "Reopen Closed Tabs", description: "Press Ctrl+Shift+T (Cmd+Shift+T on Mac) to reopen a recently closed tab, including Netflix pages you accidentally closed." },
    { title: "Cast to Your TV", description: "Click the Cast icon in Chrome's menu (three dots > Cast) to stream Netflix from your browser to a Chromecast device." },
    { title: "Session Restore on Crash", description: "If your browser crashes, reopen it and it will offer to restore all tabs including your Netflix session." },
    { title: "Manage Extensions Easily", description: "Click the puzzle icon in Chrome to manage extensions. Pin frequently used ones like Netflix tools for quick access." },
    { title: "Use Reading List", description: "Right-click any link and choose Add to Reading List to save Netflix articles or reviews for later." },
    { title: "Keyboard Navigate the UI", description: "Use Tab and arrow keys to navigate Netflix's interface without a mouse. Press Enter to select." },
    { title: "Clear Cache if Glitchy", description: "If Netflix loads slowly or glitches, clear your browser cache via Settings > Privacy > Clear Browsing Data." }
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
