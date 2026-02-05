import React, { useState } from 'react';
import { Toaster } from 'sonner';
import './App.css';
import Generate from './components/Generate';
import Setting from './components/Setting';

type Page = 'generate' | 'setting';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>('generate');

  return (
    <>
      <Toaster 
        position="top-right" 
        duration={1000}
        richColors 
        toastOptions={{
          style: {
            width: 'fit-content',
            marginLeft: 'auto',
            minWidth: '200px',
            maxWidth: '400px',
          },
        }}
      />
      <div className="app-container">
        <div className="sidebar">
          <h1 className="app-title">URL Generator</h1>
          <nav className="nav-menu">
            <button
              className={`nav-item ${currentPage === 'generate' ? 'active' : ''}`}
              onClick={() => setCurrentPage('generate')}
            >
              Generate
            </button>
            <button
              className={`nav-item ${currentPage === 'setting' ? 'active' : ''}`}
              onClick={() => setCurrentPage('setting')}
            >
              Setting
            </button>
          </nav>
        </div>
        <div className="main-content">
          {currentPage === 'generate' ? <Generate /> : <Setting />}
        </div>
      </div>
    </>
  );
};

export default App;
