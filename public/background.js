chrome.runtime.onInstalled.addListener(() => {
  // Initialize default settings
  chrome.storage.sync.set({
    workModes: {
      focus: {
        name: 'Focus Mode',
        duration: 25,
        blockedSites: []
      },
      break: {
        name: 'Break Mode',
        duration: 5,
        blockedSites: []
      },
      custom: {
        name: 'Custom Mode',
        duration: 30,
        blockedSites: []
      }
    },
    currentMode: 'focus',
    isTimerActive: false,
    timeRemaining: 25 * 60
  });
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'UPDATE_SETTINGS') {
    chrome.storage.sync.set({ workModes: request.workModes });
  }
  if (request.type === 'SET_MODE') {
    chrome.storage.sync.set({ currentMode: request.mode });
  }
});
