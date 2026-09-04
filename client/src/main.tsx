import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import { App } from './App';
import { PokerProvider } from './context/PokerContext';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <PokerProvider>
      <App />
    </PokerProvider>
  </StrictMode>,
);
