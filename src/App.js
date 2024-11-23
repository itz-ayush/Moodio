import React from 'react';
import Timer from './components/Timer';
import ModeSelector from './components/ModeSelector';
import BlockList from './components/BlockList';
import { AppProvider } from './context/AppContext';
import './App.css';

function App() {
  return (
    <AppProvider>
      <div className="app-container">
        <header className="header">
          <h1>MOODIO</h1>
          <p>Stay focused, be productive</p>
        </header>
        <main>
          <Timer />
          <ModeSelector />
          <BlockList />
        </main>
      </div>
    </AppProvider>
  );
}

export default App;