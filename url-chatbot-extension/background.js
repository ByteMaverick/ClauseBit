chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  // Only proceed when the page is fully loaded and has a valid URL
  if (changeInfo.status === "complete" && tab.url && tab.url.startsWith("http")) {
    const url = tab.url;

    // You can extract domain here if needed (e.g., apple.com)
    const company_name = new URL(url).hostname;

    console.log("🔁 Sending to backend:", company_name);

    fetch("http://127.0.0.1:8080/classifier", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ company_name })
    }).then(res => {
      console.log("✅ Sent", company_name);
    }).catch(err => {
      console.error("❌ Failed to send URL", err);
    });
  }
});
