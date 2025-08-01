const tabUrlMap = new Map();            // tabId → current URL
const classifierTimers = new Map();     // tabId → setTimeout ID
const scannedDomains = new Set();       // Already scanned domains (across tabs)

// 🧠 Main listener for tab updates
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === "complete" && tab.url && /^https?:\/\//.test(tab.url)) {
    const currentUrl = new URL(tab.url).origin + "/"; // e.g., https://github.com/

    const previousUrl = tabUrlMap.get(tabId);
    if (previousUrl === currentUrl) return; // ✅ Already processed for this tab

    // 🧼 Cancel existing classifier timer if any
    if (classifierTimers.has(tabId)) {
      clearTimeout(classifierTimers.get(tabId));
      classifierTimers.delete(tabId);
    }

    // 🗺️ Update current URL for the tab
    tabUrlMap.set(tabId, currentUrl);

    // 🚀 Immediately trigger /collector if not already scanned
    if (!scannedDomains.has(currentUrl)) {
      scannedDomains.add(currentUrl);
      console.log("🚨 New domain detected:", currentUrl);

      fetch("http://127.0.0.1:8080/collector", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ company_name: currentUrl })  // ✅ Adjust this key if needed
      })
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then(data => console.log("✅ Collector response:", data))
      .catch(err => console.error("❌ Collector error:", err));
    } else {
      console.log("⚠️ Skipped duplicate collector for:", currentUrl);
    }

    // ⏳ Trigger /summary after 5 seconds if still on same URL
    const timerId = setTimeout(() => {
      chrome.tabs.get(tabId, (updatedTab) => {
        if (chrome.runtime.lastError || !updatedTab || !updatedTab.url) return;

        const stillUrl = new URL(updatedTab.url).origin + "/";
        if (stillUrl === currentUrl) {
          console.log("🧠 Still on URL after 5s, fetching summary for:", currentUrl);
          fetch("http://127.0.0.1:8080/summary", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ company_name: currentUrl })  // ✅ Adjust if needed
          })
          .then(res => res.json())
          .then(data => console.log("✅ Summary response:", data))
          .catch(err => console.error("❌ Summary error:", err));
        }
      });
    }, 1000 * 1000); // 5 seconds delay

    classifierTimers.set(tabId, timerId);
  }
});

// 🧹 Clean up when tab is closed
chrome.tabs.onRemoved.addListener((tabId) => {
  tabUrlMap.delete(tabId);
  if (classifierTimers.has(tabId)) {
    clearTimeout(classifierTimers.get(tabId));
    classifierTimers.delete(tabId);
  }
});

// 🔄 Optional: Clear cache on extension reload
chrome.runtime.onInstalled.addListener(() => {
  scannedDomains.clear();
  tabUrlMap.clear();
  classifierTimers.clear();
  console.log("🔁 ClauseBit background script reloaded.");
});

// ✅ Allow popup.js to get the current active tab's URL
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === "GET_CURRENT_TAB") {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const url = tabs?.[0]?.url || null;
      sendResponse({ url });
    });
    return true; // Important: keeps the message channel open for async response
  }
});
