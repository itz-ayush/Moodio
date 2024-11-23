// src/components/Timer.js
import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { createNotification } from '../utils/chrome-api';

const Timer = () => {
  const { workModes, currentMode, isTimerActive, setIsTimerActive } = useApp();
  const [timeRemaining, setTimeRemaining] = useState(workModes[currentMode].duration * 60);

  useEffect(() => {
    setTimeRemaining(workModes[currentMode].duration * 60);
  }, [currentMode, workModes]);

  useEffect(() => {
    let interval = null;
    if (isTimerActive && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining(time => time - 1);
      }, 1000);
    } else if (timeRemaining === 0) {
      setIsTimerActive(false);
      createNotification({
        type: 'basic',
        iconUrl: '/logo192.png',
        title: 'Timer Complete!',
        message: `${workModes[currentMode].name} session completed!`
      });
    }

    return () => clearInterval(interval);
  }, [isTimerActive, timeRemaining, currentMode, workModes]);

  const toggleTimer = () => {
    setIsTimerActive(!isTimerActive);
  };

  const minutes = Math.floor(timeRemaining / 60);
  const seconds = timeRemaining % 60;

  return (
    <div className="timer-container">
      <div className="time-display">
        {minutes}:{seconds.toString().padStart(2, '0')}
      </div>
      <button onClick={toggleTimer} className="timer-button">
        {isTimerActive ? 'Pause' : 'Start'}
      </button>
    </div>
  );
};

export default Timer;