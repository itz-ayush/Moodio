document.addEventListener('DOMContentLoaded', function() {
    let currentMode = null;
    let editingMode = null;
    let isPaused = false;
    let currentView = 'homeView';
  
    function showView(viewId) {
      document.querySelectorAll('.view').forEach(view => view.style.display = 'none');
      document.getElementById(viewId).style.display = 'block';
      currentView = viewId;
      chrome.storage.local.set({ currentView: viewId });
    }
  
    function updateTimerDisplay(timeLeft) {
      const minutes = Math.floor(timeLeft / 60);
      const seconds = timeLeft % 60;
      document.getElementById('timer').textContent = 
        `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
  
    function updateButtonStates(isActive, isPaused) {
      document.getElementById('startTimer').style.display = isActive && !isPaused ? 'none' : 'flex';
      document.getElementById('startTimer').innerHTML = isPaused ? '<i class="material-icons">play_arrow</i>' : '<i class="material-icons">play_arrow</i>';
      document.getElementById('pauseTimer').style.display = isActive && !isPaused ? 'flex' : 'none';
      document.getElementById('stopTimer').disabled = !isActive;
    }
  
    function checkInitialSetup() {
      return new Promise((resolve) => {
        chrome.storage.local.get(['initialSetupComplete'], (result) => {
          resolve(result.initialSetupComplete === true);
        });
      });
    }
  
    function processWebsiteInput(input) {
      return input.split(',').map(site => {
        site = site.trim().toLowerCase();
        if (!site.startsWith('http://') && !site.startsWith('https://') && !site.includes('.')) {
          return site + '.com';
        }
        return site;
      });
    }
  
    document.getElementById('getStartedBtn').addEventListener('click', () => {
      chrome.storage.local.set({ initialSetupComplete: true }, () => {
        showView('homeView');
        updateModesList();
      });
    });
  
    document.getElementById('startTimer').addEventListener('click', () => {
      if (currentMode) {
        if (isPaused) {
          chrome.runtime.sendMessage({action: "resumeTimer"}, (response) => {
            if (response.success) {
              isPaused = false;
              updateButtonStates(true, false);
            }
          });
        } else {
          chrome.runtime.sendMessage({
            action: "startTimer", 
            duration: currentMode.duration, 
            mode: currentMode
          }, (response) => {
            if (response.success) {
              updateButtonStates(true, false);
            }
          });
        }
      } else {
        alert("Please select a mode before starting the timer.");
      }
    });
  
    document.getElementById('pauseTimer').addEventListener('click', () => {
      chrome.runtime.sendMessage({action: "pauseTimer"}, (response) => {
        if (response.success) {
          isPaused = true;
          updateButtonStates(true, true);
        }
      });
    });
  
    document.getElementById('stopTimer').addEventListener('click', () => {
      chrome.runtime.sendMessage({action: "stopTimer"}, (response) => {
        if (response.success) {
          isPaused = false;
          updateButtonStates(false, false);
          currentMode = null;
          updateModesList();
        }
      });
    });
  
    document.getElementById('addModeBtn').addEventListener('click', () => {
      editingMode = null;
      document.getElementById('modeFormTitle').textContent = 'Create New Mode';
      showView('modeForm');
      restoreFormData();
    });
  
    document.getElementById('saveModeBtn').addEventListener('click', () => {
      const name = document.getElementById('modeName').value;
      const duration = parseInt(document.getElementById('modeDuration').value);
      const urls = processWebsiteInput(document.getElementById('modeUrls').value);
      const blockedSites = processWebsiteInput(document.getElementById('modeBlockedSites').value);
  
      if (name && duration) {
        chrome.storage.local.get({ modes: {} }, (result) => {
          const updatedModes = {
            ...result.modes,
            [name]: { name, duration, urls, blockedSites }
          };
          chrome.storage.local.set({ modes: updatedModes, tempFormData: null }, () => {
            updateModesList();
            showView('homeView');
          });
        });
      }
    });
  
    document.getElementById('cancelModeBtn').addEventListener('click', () => {
      chrome.storage.local.remove('tempFormData', () => {
        showView('homeView');
      });
    });
  
    function updateModesList() {
      chrome.storage.local.get({ modes: {} }, (result) => {
        const modesList = document.getElementById('modesList');
        modesList.innerHTML = '';
        const modes = Object.values(result.modes);
        if (modes.length === 0) {
          const noModesMessage = document.createElement('p');
          noModesMessage.textContent = 'No modes created. Click "Add Mode" to create a new mode.';
          modesList.appendChild(noModesMessage);
        } else {
          modes.forEach((mode) => {
            const modeItem = document.createElement('div');
            modeItem.className = 'mode-item';
            modeItem.setAttribute('data-mode-name', mode.name);
            
            const modeName = document.createElement('span');
            modeName.textContent = mode.name;
            modeName.addEventListener('click', () => activateMode(mode));
            
            const editButton = document.createElement('button');
            editButton.innerHTML = '<i class="material-icons">edit</i>';
            editButton.className = 'btn btn-icon';
            editButton.addEventListener('click', (e) => {
              e.stopPropagation();
              editMode(mode);
            });
            
            const deleteButton = document.createElement('button');
            deleteButton.innerHTML = '<i class="material-icons">delete</i>';
            deleteButton.className = 'btn btn-icon';
            deleteButton.addEventListener('click', (e) => {
              e.stopPropagation();
              deleteMode(mode.name);
            });
            
            modeItem.appendChild(modeName);
            modeItem.appendChild(editButton);
            modeItem.appendChild(deleteButton);
            
            if (currentMode && currentMode.name === mode.name) {
              modeItem.classList.add('active');
            }
            
            modesList.appendChild(modeItem);
          });
        }
      });
    }
  
    function activateMode(mode) {
      currentMode = mode;
      updateTimerDisplay(mode.duration * 60);
      updateButtonStates(false, false);
      
      document.querySelectorAll('.mode-item').forEach(item => item.classList.remove('active'));
      
      const selectedModeItem = document.querySelector(`.mode-item[data-mode-name="${mode.name}"]`);
      if (selectedModeItem) {
        selectedModeItem.classList.add('active');
      }
      
      updateModesList();
    }
  
    function editMode(mode) {
      editingMode = mode.name;
      document.getElementById('modeFormTitle').textContent = 'Edit Mode';
      document.getElementById('modeName').value = mode.name;
      document.getElementById('modeDuration').value = mode.duration;
      document.getElementById('modeUrls').value = mode.urls.join(', ');
      document.getElementById('modeBlockedSites').value = mode.blockedSites.join(', ');
      showView('modeForm');
    }
  
    function deleteMode(name) {
      if (confirm(`Are you sure you want to delete the mode "${name}"?`)) {
        chrome.storage.local.get({ modes: {} }, (result) => {
          const { [name]: deletedMode, ...updatedModes } = result.modes;
          chrome.storage.local.set({ modes: updatedModes }, () => {
            if (currentMode && currentMode.name === name) {
              currentMode = null;
            }
            updateModesList();
          });
        });
      }
    }
  
    function updateTimerState() {
        chrome.runtime.sendMessage({action: "getTimerState"}, (response) => {
          updateTimerDisplay(response.timeLeft);
          updateButtonStates(response.isActive, response.isPaused);
          isPaused = response.isPaused;
          if (response.currentMode) {
            currentMode = response.currentMode;
            updateModesList();
          }
        });
      }
      
      // Add this function to your popup.js
    //   function showTimerEndNotification() {
    //     chrome.runtime.sendMessage({action: "showTimerEndNotification"}, (response) => {
    //       if (response.success) {
    //         console.log('Timer end notification sent');
    //       }
    //     });
    //   }
    function saveFormData() {
      const formData = {
        name: document.getElementById('modeName').value,
        duration: document.getElementById('modeDuration').value,
        urls: document.getElementById('modeUrls').value,
        blockedSites: document.getElementById('modeBlockedSites').value
      };
      chrome.storage.local.set({ tempFormData: formData });
    }
  
    function restoreFormData() {
      chrome.storage.local.get('tempFormData', (result) => {
        const formData = result.tempFormData || {};
        document.getElementById('modeName').value = formData.name || '';
        document.getElementById('modeDuration').value = formData.duration || '';
        document.getElementById('modeUrls').value = formData.urls || '';
        document.getElementById('modeBlockedSites').value = formData.blockedSites || '';
      });
    }
  
    ['modeName', 'modeDuration', 'modeUrls', 'modeBlockedSites'].forEach(id => {
      document.getElementById(id).addEventListener('input', saveFormData);
    });
  
    // Initial setup
    checkInitialSetup().then(setupComplete => {
      chrome.storage.local.get(['currentView', 'tempFormData'], (result) => {
        if (setupComplete) {
          if (result.currentView === 'modeForm' && result.tempFormData) {
            showView('modeForm');
            restoreFormData();
          } else {
            showView('homeView');
          }
          updateModesList();
        } else {
          showView('initialSetup');
        }
      });
    });
  
    updateTimerState();
    setInterval(updateTimerState, 1000);
  });