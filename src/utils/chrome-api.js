/*global chrome*/
// src/utils/chrome-api.js

// Helper to safely check if we're in extension context
const checkChromeRuntime = () => {
    try {
      return Boolean(chrome?.runtime?.id);
    } catch (e) {
      return false;
    }
  };
  
  export const isExtension = checkChromeRuntime();
  
  // Mock data for development environment
  const mockData = {
    workModes: {
      focus: { name: 'Focus Mode', duration: 25, blockedSites: [] },
      break: { name: 'Break Mode', duration: 5, blockedSites: [] },
      custom: { name: 'Custom Mode', duration: 30, blockedSites: [] }
    },
    currentMode: 'focus',
    isTimerActive: false
  };
  
  export const storageGet = (keys) => {
    if (!isExtension) {
      return Promise.resolve(mockData);
    }
  
    return new Promise((resolve, reject) => {
      try {
        chrome.storage.sync.get(keys, (result) => {
          if (chrome.runtime.lastError) {
            reject(chrome.runtime.lastError);
          } else {
            resolve(result);
          }
        });
      } catch (error) {
        console.error('Storage get error:', error);
        resolve(mockData);
      }
    });
  };
  
  export const storageSet = (data) => {
    if (!isExtension) {
      console.log('Development mode - would save:', data);
      return Promise.resolve();
    }
  
    return new Promise((resolve, reject) => {
      try {
        chrome.storage.sync.set(data, () => {
          if (chrome.runtime.lastError) {
            reject(chrome.runtime.lastError);
          } else {
            resolve();
          }
        });
      } catch (error) {
        console.error('Storage set error:', error);
        resolve();
      }
    });
  };
  
  export const sendMessage = (message) => {
    if (!isExtension) {
      console.log('Development mode - would send message:', message);
      return Promise.resolve();
    }
  
    return new Promise((resolve, reject) => {
      try {
        chrome.runtime.sendMessage(message, (response) => {
          if (chrome.runtime.lastError) {
            reject(chrome.runtime.lastError);
          } else {
            resolve(response);
          }
        });
      } catch (error) {
        console.error('Send message error:', error);
        resolve();
      }
    });
  };
  
  export const createNotification = (options) => {
    if (!isExtension) {
      console.log('Development mode - would show notification:', options);
      return;
    }
  
    try {
      chrome.notifications.create(options, () => {
        if (chrome.runtime.lastError) {
          console.error('Notification error:', chrome.runtime.lastError);
        }
      });
    } catch (error) {
      console.error('Create notification error:', error);
    }
  };