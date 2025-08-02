const tabUrlMap = new Map();
const classifierTimers = new Map();
const scannedDomains = new Set();

// 🔐 Get Clerk session cookie and pass JWT to callback
async function getSessionJWT() {
  return new Promise((resolve) => {
    chrome.cookies.get(
      { url: "http://localhost:5173", name: "__session" },
      (cookie) => {
        if (cookie) resolve(cookie.value);
        else resolve(null);
      }
    );
  });
}

// 🧠 Main listener for tab updates
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (changeInfo.status === "complete" && tab.url && /^https?:\/\//.test(tab.url)) {
    const currentUrl = new URL(tab.url).origin + "/";

    const previousUrl = tabUrlMap.get(tabId);
    if (previousUrl === currentUrl) return;

    if (classifierTimers.has(tabId)) {
      clearTimeout(classifierTimers.get(tabId));
      classifierTimers.delete(tabId);
    }

    tabUrlMap.set(tabId, currentUrl);

    const jwt = await getSessionJWT();
    if (!jwt) {
      console.warn("🔐 No Clerk session JWT found. Skipping protected endpoints.");
      return;
    }

    if (!scannedDomains.has(currentUrl)) {
      scannedDomains.add(currentUrl);
      console.log("🚨 New domain detected:", currentUrl);

      fetch("http://127.0.0.1:8080/collector", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${jwt}`
        },
        body: JSON.stringify({ company_name: currentUrl })
      })
        .then((res) => {
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          return res.json();
        })
        .then((data) => console.log("✅ Collector response:", data))
        .catch((err) => console.error("❌ Collector error:", err));
    } else {
      console.log("⚠️ Skipped duplicate collector for:", currentUrl);
    }

    const timerId = setTimeout(() => {
      chrome.tabs.get(tabId, async (updatedTab) => {
        if (chrome.runtime.lastError || !updatedTab?.url) return;

        const stillUrl = new URL(updatedTab.url).origin + "/";
        if (stillUrl === currentUrl) {
          console.log("🧠 Still on URL after 3s, fetching summary for:", currentUrl);

          const jwtAgain = await getSessionJWT();
          if (!jwtAgain) {
            console.warn("🔐 No Clerk session JWT for summary fetch.");
            return;
          }

          fetch("http://127.0.0.1:8080/summary", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${jwtAgain}`
            },
            body: JSON.stringify({ company_name: currentUrl })
          })
            .then((res) => res.json())
            .then((data) => {
              console.log("✅ Summary response:", data);
              chrome.storage.local.set({ [`summary_${currentUrl}`]: data });
              chrome.action.setBadgeText({ text: "!" });
              chrome.action.setBadgeBackgroundColor({ color: "#FF0000" });
            })
            .catch((err) => console.error("❌ Summary error:", err));
        }
      });
    }, 3000);

    classifierTimers.set(tabId, timerId);
  }
});

// 🧹 Cleanup
chrome.tabs.onRemoved.addListener((tabId) => {
  tabUrlMap.delete(tabId);
  if (classifierTimers.has(tabId)) {
    clearTimeout(classifierTimers.get(tabId));
    classifierTimers.delete(tabId);
  }
});

chrome.runtime.onInstalled.addListener(() => {
  scannedDomains.clear();
  tabUrlMap.clear();
  classifierTimers.clear();
  console.log("🔁 ClauseBit background script reloaded.");
});

// Allow popup.js to get current tab URL
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === "GET_CURRENT_TAB") {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const url = tabs?.[0]?.url || null;
      sendResponse({ url });
    });
    return true;
  }
});
