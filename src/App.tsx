import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Navigation } from './components/layout/Navigation';
import { HomePage } from './pages/HomePage';
import { CasesPage } from './pages/CasesPage';
import { InventoryPage } from './pages/InventoryPage';
import { MarketPage } from './pages/MarketPage';
import { ProfilePage } from './pages/ProfilePage';
import { initTelegram } from './services/telegram';
import { useUserStore } from './store/user.store';
import { checkApiConnection } from './services/api';

function App() {
  const { isAuthenticated } = useUserStore();
  const [loading, setLoading] = useState(true);
  const [apiStatus, setApiStatus] = useState<'checking' | 'connected' | 'error'>('checking');

  useEffect(() => {
    const initApp = async () => {
      try {
        console.log('🚀 Инициализация приложения...');
         setApiStatus('connected');

        // Инициализируем пользователя
        await initTelegram();
        console.log('✅ Приложение инициализировано');
        
      } catch (error: any) {
        console.error('❌ Ошибка инициализации:', error);
        setApiStatus('error');
      } finally {
        setLoading(false);
      }
    };
    
    initApp();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-300">Загрузка приложения...</p>
          {apiStatus === 'checking' && (
            <p className="text-sm text-gray-500 mt-2">Проверка подключения к серверу...</p>
          )}
        </div>
      </div>
    );
  }

  if (apiStatus === 'error') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="text-2xl font-bold text-yellow-400 mb-4">⚠️ Режим офлайн</div>
          <p className="text-gray-300 mb-6">
            Сервер временно недоступен. Вы можете использовать приложение в демо-режиме.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 mr-3"
          >
            Попробовать снова
          </button>
          <button
            onClick={() => setLoading(false)}
            className="px-6 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600"
          >
            Продолжить офлайн
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
      <div className="pb-16">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/cases" element={<CasesPage />} />
          <Route path="/inventory" element={<InventoryPage />} />
          <Route path="/market" element={<MarketPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
      <Navigation />
    </div>
  );
}

export default App;