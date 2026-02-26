// Content Script - Duolingo English Test practice tips widget
(async function () {
  if (
    window.location.protocol === "chrome-extension:" ||
    window.location.protocol === "chrome:"
  ) return;
  if (document.getElementById("searchelf-widget-root")) return;

  const configUrl = chrome.runtime.getURL("config.json");
  let config;
  try {
    config = await (await fetch(configUrl)).json();
  } catch (e) {
    console.error("[CS] Failed to load config:", e);
    return;
  }

  const DISMISS_KEY = "searchelf_dismissed_v3";
  const DISMISS_TTL = 48 * 60 * 60 * 1000;

  const dismissCheck = await new Promise((resolve) => {
    chrome.storage.local.get([DISMISS_KEY], (result) => {
      const dismissed = result[DISMISS_KEY];
      if (dismissed && Date.now() - dismissed < DISMISS_TTL) resolve(true);
      else resolve(false);
    });
  });
  if (dismissCheck) return;

  const ALL_TIPS = [
    { title: "Start with official practice", description: "Begin each week with the official Duolingo English Test practice experience to benchmark your level. Track improvements after every session." },
    { title: "Simulate test environment", description: "Practice at a desk in a quiet room with no background distractions. Build the same routine you will use on test day." },
    { title: "Check webcam framing", description: "Keep your face centered with good front lighting before every practice run. Stable framing helps you focus instead of adjusting mid-session." },
    { title: "Test microphone clarity", description: "Run a quick audio check before speaking drills. Clear input helps you evaluate pronunciation and pacing accurately." },
    { title: "Use timed writing drills", description: "Practice writing with strict timers so planning and typing happen under pressure. This builds fast structure without overthinking." },
    { title: "Practice concise responses", description: "Train yourself to answer directly and avoid long tangents. Clear, focused responses are easier to deliver consistently." },
    { title: "Rehearse spoken prompts daily", description: "Do short daily speaking sets while looking at your camera. Frequent repetition improves comfort and fluency." },
    { title: "Review your recordings", description: "Record practice answers and replay them for clarity, filler words, and pacing. One review pass often reveals easy fixes." },
    { title: "Train adaptive difficulty mindset", description: "Expect question difficulty to shift as you perform better. Stay calm and treat each item independently." },
    { title: "Plan writing before typing", description: "Use the first moments to outline your main point and support sentence. A quick structure reduces mid-answer edits." },
    { title: "Strengthen paraphrasing skill", description: "Practice rephrasing short ideas in two different ways. This helps when prompts require flexibility in wording." },
    { title: "Build transition phrase bank", description: "Memorize a small set of transitions like however, therefore, and for example. They improve coherence in timed writing." },
    { title: "Cut filler words", description: "Notice repeated fillers like um or like during speaking drills. Replace them with brief pauses to sound more controlled." },
    { title: "Practice one-sit stamina", description: "Complete full-length practice without breaks to build concentration endurance. Consistency matters as much as skill." },
    { title: "Rotate practice topics", description: "Rotate familiar and unfamiliar topics in practice so your responses stay flexible. This reduces surprises on test day." },
    { title: "Train listening one pass", description: "Listen carefully the first time and capture key words immediately. Build the habit of extracting meaning without replays." },
    { title: "Prioritize sentence accuracy", description: "In writing, prefer clean grammar over complex risky phrasing. Accurate simple sentences usually score better than error-heavy complexity." },
    { title: "Track weak skill patterns", description: "Keep a log of repeated issues like tense errors or vague examples. Practice targeted fixes instead of generic drills." },
    { title: "Review score feedback", description: "Use score feedback to choose the next study focus. Work weakest areas first to raise overall performance faster." },
    { title: "Warm up before sessions", description: "Do a 10-minute warm-up of reading and speaking before serious practice. Early activation improves first-answer quality." },
    { title: "Practice daily on Duolingo", description: "Short daily sessions build language reflexes that support test performance. Consistency beats occasional marathon study." },
    { title: "Review mistakes immediately", description: "After each lesson, revisit wrong answers while context is fresh. Quick correction helps prevent repeated errors." },
    { title: "Focus on accuracy first", description: "When practicing language basics, slow down enough to answer correctly. Speed improves naturally once accuracy is stable." },
    { title: "Read prompt details carefully", description: "Before responding, identify exactly what the instruction asks for. Precise prompt reading avoids off-topic answers." },
    { title: "Repeat grammar weak points", description: "Revisit grammar patterns that repeatedly cause mistakes. Targeted repetition improves retention better than random review." },
    { title: "Build themed vocabulary sets", description: "Group new words by topics like education, work, and travel. Themed sets are easier to recall during test prompts." },
    { title: "Shadow spoken examples", description: "Repeat model sentences out loud to match rhythm and intonation. This improves speaking smoothness over time." },
    { title: "Use sentence-level practice", description: "Practice full sentence responses rather than isolated words. Complete sentences better reflect test communication demands." },
    { title: "Write daily mini paragraph", description: "Produce one short paragraph each day on a random topic. Frequent writing strengthens structure and grammar control." },
    { title: "Review punctuation basics", description: "Correct punctuation improves readability and meaning in timed writing. Pay attention to commas and sentence boundaries." },
    { title: "Practice topic expansion", description: "Train adding one concrete example to each main idea. Specific examples make responses more convincing." },
    { title: "Alternate reading and speaking", description: "Switch between reading and speaking drills in the same session. Mixed practice mirrors varied exam demands." },
    { title: "Use weekly checkpoints", description: "Set one fixed day each week to review what improved and what stalled. Adjust your next plan based on evidence." },
    { title: "Keep correction notebook", description: "Write recurring language mistakes in one place with corrected versions. Review this list before each practice test." },
    { title: "Drill tricky sound pairs", description: "Practice commonly confused sounds in short word lists. Better sound distinction improves speaking clarity quickly." },
    { title: "Pin Duolingo tab", description: "Pin your Duolingo tab so it stays anchored and easy to reopen. Right-click the tab and choose Pin." },
    { title: "Bookmark key test pages", description: "Press Ctrl+D (Cmd+D on Mac) on key Duolingo pages for one-click return. Organize bookmarks into a dedicated study folder." },
    { title: "Reopen closed tab quickly", description: "Use Ctrl+Shift+T (Cmd+Shift+T on Mac) if you close the wrong tab. This restores your last page instantly." },
    { title: "Find text on page", description: "Press Ctrl+F (Cmd+F on Mac) to quickly locate words in long instructions. It saves time when reviewing guidance pages." },
    { title: "Reset browser zoom", description: "Press Ctrl+0 (Cmd+0 on Mac) to return Chrome zoom to default. Consistent zoom keeps interface elements predictable." },
    { title: "Hard refresh stale pages", description: "Use Ctrl+Shift+R (Cmd+Shift+R on Mac) to refresh when a page loads oddly. This clears cached assets for that reload." },
    { title: "Use separate study profile", description: "Create a dedicated Chrome profile for exam prep bookmarks and extensions. This keeps your study setup clean and focused." },
    { title: "Group prep tabs", description: "Put Duolingo, notes, and references in one tab group. Color-coding helps you reopen your workflow quickly." },
    { title: "Keep notes alongside practice", description: "Use a notes tab for quick reminders between practice sets. Keep it minimal to avoid distraction." },
    { title: "Use site search operator", description: "Use Google queries like site:duolingo.com \"english test\" to find official pages quickly. This surfaces relevant docs faster." },
    { title: "Enable do-not-disturb mode", description: "Silence phone and desktop notifications during practice blocks. Interruptions break speaking and writing rhythm." },
    { title: "Stabilize internet connection", description: "Use a reliable connection and avoid heavy downloads during sessions. Consistent connectivity reduces avoidable stress." },
    { title: "Prepare backup essentials", description: "Keep charger, water, and required documents ready before longer runs. Simple prep prevents avoidable interruptions." },
    { title: "Use fixed study schedule", description: "Practice at the same time daily so focus becomes automatic. Habit strength reduces procrastination." },
    { title: "Sleep before heavy practice", description: "Get adequate sleep before full simulations or real attempts. Fatigue hurts reading speed and verbal clarity." }
  ];

  function getRandomTips() {
    const shuffled = [...ALL_TIPS].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 5);
  }

  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = chrome.runtime.getURL("css/widget.css");
  document.head.appendChild(link);

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
          <button id="searchelf-close" aria-label="Close">x</button>
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

  const widget = document.getElementById("searchelf-widget");
  widget.style.setProperty("--searchelf-primary", config.primaryColor || "#58CC02");
  widget.style.setProperty("--searchelf-accent", config.accentColor || "#1CB0F6");

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

  function show(el) { el.classList.remove("searchelf-hidden"); }

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
