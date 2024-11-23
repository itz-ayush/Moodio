// src/context/AppContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import { storageGet, storageSet, sendMessage } from '../utils/chrome-api';

const AppContext = createContext();

export const useApp = () => useContext(AppContext);

export const AppProvider = ({ children }) => {
  const [workModes, setWorkModes] = useState({
    focus: { name: 'Focus Mode', duration: 25, blockedSites: [] },
    break: { name: 'Break Mode', duration: 5, blockedSites: [] },
    custom: { name: 'Custom Mode', duration: 30, blockedSites: [] }
  });
  const [currentMode, setCurrentMode] = useState('focus');
  const [isTimerActive, setIsTimerActive] = useState(false);

  useEffect(() => {
    // Load initial state
    const loadInitialState = async () => {
      const result = await storageGet(['workModes', 'currentMode', 'isTimerActive']);
      if (result.workModes) setWorkModes(result.workModes);
      if (result.currentMode) setCurrentMode(result.currentMode);
      if (result.isTimerActive) setIsTimerActive(result.isTimerActive);
    };

    loadInitialState();
  }, []);

  const updateMode = async (mode) => {
    setCurrentMode(mode);
    await storageSet({ currentMode: mode });
    await sendMessage({ type: 'SET_MODE', mode });
  };

  const updateWorkModes = async (newModes) => {
    setWorkModes(newModes);
    await storageSet({ workModes: newModes });
    await sendMessage({ type: 'UPDATE_SETTINGS', workModes: newModes });
  };

  return (
    <AppContext.Provider value={{
      workModes,
      currentMode,
      isTimerActive,
      setIsTimerActive,
      updateMode,
      updateWorkModes
    }}>
      {children}
    </AppContext.Provider>
  );
};