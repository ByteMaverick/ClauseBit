// Background script for ClauseBit Chrome Extension

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === "GET_CURRENT_TAB") {
    // Get the current active tab
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) {
        sendResponse({ url: tabs[0].url });
      } else {
        sendResponse({ url: null });
      }
    });
    
    // Return true to indicate we will send a response asynchronously
    return true;
  }
});

// Optional: Log when extension is installed/started
chrome.runtime.onInstalled.addListener(() => {
  console.log('ClauseBit extension installed');
});

// Optional: Handle tab updates to refresh analysis
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  // Only trigger on complete page loads
  if (changeInfo.status === 'complete' && tab.url) {
    // You could send a message to content script here if needed
    console.log('Tab updated:', tab.url);
  }
});