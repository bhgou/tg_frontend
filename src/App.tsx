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

function App() {
  const { isAuthenticated, setUser, setToken } = useUserStore();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initApp = async () => {
      try {
        const user = await initTelegram();
        console.log('✅ Приложение инициализировано');
        
        // Для тестирования, если нужно принудительно установить токен
        if (user && !useUserStore.getState().token) {
          setToken('test-token');
        }
      } catch (error: any) {
        console.error('❌ Ошибка инициализации:', error);
        setError(error.message || 'Ошибка загрузки приложения');
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
          <p className="text-sm text-gray-500 mt-2">Подключение к серверу...</p>
        </div>
      </div>
    );
  }

  if (error && !isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-400 mb-4">Ошибка</h1>
          <p className="text-gray-300 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Перезагрузить
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
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
    </>
  );
}

export default App;