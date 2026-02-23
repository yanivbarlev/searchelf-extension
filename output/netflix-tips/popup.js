(async () => {
  const res = await fetch(chrome.runtime.getURL("config.json"));
  const config = await res.json();
  document.getElementById("popup-name").textContent = config.name;
  document.getElementById("popup-desc").textContent = config.description;
  document.getElementById("popup-badge").style.background = config.primaryColor || "#6C63FF";
})();
