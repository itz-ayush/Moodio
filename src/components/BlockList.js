import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

const BlockList = () => {
  const { workModes, currentMode, updateWorkModes } = useApp();
  const [newSite, setNewSite] = useState('');

  const addSite = () => {
    if (newSite) {
      const updatedModes = {
        ...workModes,
        [currentMode]: {
          ...workModes[currentMode],
          blockedSites: [...workModes[currentMode].blockedSites, newSite]
        }
      };
      updateWorkModes(updatedModes);
      setNewSite('');
    }
  };

  const removeSite = (siteToRemove) => {
    const updatedModes = {
      ...workModes,
      [currentMode]: {
        ...workModes[currentMode],
        blockedSites: workModes[currentMode].blockedSites.filter(
          site => site !== siteToRemove
        )
      }
    };
    updateWorkModes(updatedModes);
  };

  return (
    <div className="block-list">
      <h3>Blocked Sites for {workModes[currentMode].name}</h3>
      <div className="add-site">
        <input
          type="text"
          className="site-input"
          value={newSite}
          onChange={(e) => setNewSite(e.target.value)}
          placeholder="Enter website URL"
        />
        <button onClick={addSite}>Add Site</button>
      </div>
      <ul className="site-list">
        {workModes[currentMode].blockedSites.map((site, index) => (
          <li key={index} className="site-item">
            <span>{site}</span>
            <button
              className="remove-button"
              onClick={() => removeSite(site)}
            >
              Remove
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default BlockList;