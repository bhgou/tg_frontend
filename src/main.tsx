import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';

// Инициализация Telegram WebApp (просто проверяем наличие, без использования свойств)
if (window.Telegram?.WebApp) {
  const tg = window.Telegram.WebApp;
  
  tg.ready();
  tg.expand();
  
  if (tg.enableClosingConfirmation) {
    tg.enableClosingConfirmation();
  }
  
  // Устанавливаем тему
  if (tg.colorScheme === 'dark') {
    document.documentElement.classList.add('dark');
  }
  
  console.log('Telegram WebApp initialized');
}

const container = document.getElementById('root');
if (!container) throw new Error('Root element not found');

const root = createRoot(container);

root.render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);