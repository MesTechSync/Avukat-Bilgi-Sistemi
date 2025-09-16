import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { assertProdEnv } from './lib/config';
import './index.css';

// Fail fast if required env vars are missing in production
try { assertProdEnv(); } catch (e) {
  // Surface the error early and prevent rendering an unusable app
  console.error(e);
  const el = document.getElementById('root');
  if (el) {
    el.innerHTML = `<div style="padding:16px;font-family:sans-serif;color:#b00020">${(e as Error).message}</div>`;
  }
  throw e;
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
