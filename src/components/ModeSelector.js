import React from 'react';
import { useApp } from '../context/AppContext';

const ModeSelector = () => {
  const { workModes, currentMode, updateMode } = useApp();

  return (
    <div className="mode-selector">
      {Object.entries(workModes).map(([key, mode]) => (
        <button
          key={key}
          className={`mode-button ${currentMode === key ? 'active' : ''}`}
          onClick={() => updateMode(key)}
        >
          {mode.name}
        </button>
      ))}
    </div>
  );
};

export default ModeSelector;