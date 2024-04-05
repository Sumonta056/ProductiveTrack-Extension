// Initialize variables
let urlStore = {}; // Stores visit count and time spent for each domain
let activeTabId = null; // ID of the currently active tab
let activeTabUrl = null; // URL of the currently active tab
let activeTabStartTime = null; // Start time of the current visit

// Load urlStore from local storage
chrome.storage.local.get(["urlStore"], function (result) {
  if (result.urlStore) {
    urlStore = result.urlStore;
  }
});

// Listen for messages from other scripts in the extension
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  // If the message is to clear urlStore, clear it
  if (request.action === "clearUrlStore") {
    urlStore = {};
  }
});

// Function to update the time spent on the current domain
function updateVisitTime(url) {
  if (activeTabUrl && activeTabStartTime) {
    // Calculate the time spent on the current domain
    const timeSpent = Date.now() - activeTabStartTime;
    // Extract the domain from the URL
    const domain = new URL(activeTabUrl).hostname;
    // If the domain is in urlStore, add the time spent to it
    if (urlStore[domain]) {
      urlStore[domain].time += timeSpent;
    }
    // Save urlStore to local storage
    chrome.storage.local.set({ urlStore: urlStore });
  }
}

// Function to count a visit to a domain
function countVisit(tab) {
  // Extract the domain from the tab's URL
  const domain = new URL(tab.url).hostname;
  // If the domain is in urlStore, increment its count
  // Otherwise, add it to urlStore with a count of 1 and a time of 0
  if (urlStore[domain]) {
    urlStore[domain].count += 1;
  } else {
    urlStore[domain] = { count: 1, time: 0 };
  }
}

// Listen for when a tab is updated
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  // If the tab has finished loading and is active
  if (changeInfo.status === "complete" && tab.active) {
    // Count the visit and update the time spent
    countVisit(tab);
    updateVisitTime(activeTabUrl);
    // Update the active tab variables
    activeTabId = tabId;
    activeTabUrl = tab.url;
    activeTabStartTime = Date.now();
  }
});

// Listen for when the active tab changes
chrome.tabs.onActivated.addListener((activeInfo) => {
  chrome.tabs.get(activeInfo.tabId, (tab) => {
    // Count the visit and update the time spent
    countVisit(tab);
    updateVisitTime(activeTabUrl);
    // Update the active tab variables
    activeTabId = tab.id;
    activeTabUrl = tab.url;
    activeTabStartTime = Date.now();
  });
});

// Listen for when the active window changes
chrome.windows.onFocusChanged.addListener((windowId) => {
  // If no window is focused
  if (windowId === chrome.windows.WINDOW_ID_NONE) {
    // Update the time spent and clear the active tab variables
    updateVisitTime(activeTabUrl);
    activeTabId = null;
    activeTabUrl = null;
    activeTabStartTime = null;
  } else {
    // If a window is focused, get the active tab
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) {
        // Count the visit and update the time spent
        countVisit(tabs[0]);
        updateVisitTime(activeTabUrl);
        // Update the active tab variables
        activeTabId = tabs[0].id;
        activeTabUrl = tabs[0].url;
        activeTabStartTime = Date.now();
      }
    });
  }
});