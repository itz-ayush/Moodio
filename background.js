let timer;
let timeLeft = 0;
let isTimerActive = false;
let isPaused = false;
let currentMode = null;
let notificationShown = false;

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('Received message:', request);
  if (request.action === 'startTimer') {
    startTimer(request.duration, request.mode);
    sendResponse({success: true});
  } else if (request.action === 'pauseTimer') {
    pauseTimer();
    sendResponse({success: true});
  } else if (request.action === 'resumeTimer') {
    resumeTimer();
    sendResponse({success: true});
  } else if (request.action === 'stopTimer') {
    stopTimer();
    sendResponse({success: true});
  } else if (request.action === 'getTimerState') {
    sendResponse({timeLeft: timeLeft, isActive: isTimerActive, isPaused: isPaused, currentMode: currentMode});
  }
  return true;
});

function startTimer(duration, mode) {
  console.log('Starting timer:', duration, mode);
  isTimerActive = true;
  isPaused = false;
  timeLeft = duration * 60;
  currentMode = mode;
  notificationShown = false;
  openUrls(mode.urls);
  runTimer();
}

function pauseTimer() {
  console.log('Pausing timer');
  clearInterval(timer);
  isTimerActive = false;
  isPaused = true;
}

function resumeTimer() {
  console.log('Resuming timer');
  isTimerActive = true;
  isPaused = false;
  runTimer();
}

function runTimer() {
  console.log('Running timer');
  clearInterval(timer);
  timer = setInterval(() => {
    if (!isPaused) {
      timeLeft--;
      console.log('Time left:', timeLeft);
      if (timeLeft <= 0) {
        console.log('Timer ended');
        stopTimer();
        if (!notificationShown) {
          console.log('Showing notification');
          showTimerEndNotification();
          notificationShown = true;
        }
      }
    }
  }, 1000);
}

function stopTimer() {
  console.log('Stopping timer');
  clearInterval(timer);
  isTimerActive = false;
  isPaused = false;
  currentMode = null;
}

function showTimerEndNotification() {
    console.log('Creating notification');
    chrome.notifications.create({
      type: 'basic',
      iconUrl: chrome.runtime.getURL('moodio1.png'),
      title: 'Moodio Timer Ended',
      message: 'Your timer has ended!',
      priority: 2
    }, (notificationId) => {
      if (chrome.runtime.lastError) {
        console.error('Notification error:', chrome.runtime.lastError);
        // Fallback to alert if notification fails
        alert('Moodio Timer Ended: Your timer has ended!');
      } else {
        console.log('Notification created with ID:', notificationId);
      }
    });
  }

async function openUrls(urls) {
  if (urls && urls.length > 0) {
    const existingTabs = await chrome.tabs.query({});
    for (let url of urls) {
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = 'https://' + url;
      }
      const existingTab = existingTabs.find(tab => tab.url.includes(url));
      if (!existingTab) {
        await chrome.tabs.create({ url: url });
      }
    }
  }
}

chrome.webNavigation.onBeforeNavigate.addListener((details) => {
  if (isTimerActive && !isPaused && currentMode && currentMode.blockedSites) {
    const url = new URL(details.url);
    if (currentMode.blockedSites.some(site => {
      const blockedDomain = site.replace('http://', '').replace('https://', '').split('/')[0];
      return url.hostname.includes(blockedDomain);
    })) {
      chrome.tabs.update(details.tabId, { url: 'blocked.html' });
    }
  }
});