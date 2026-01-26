import { useUserStore } from '../store/user.store';
import { authAPI } from './api';

declare global {
  interface Window {
    Telegram?: {
      WebApp: any;
    };
  }
}

export const initTelegram = async () => {
  // Если в окружении Telegram WebApp
  if (window.Telegram?.WebApp) {
    const tg = window.Telegram.WebApp;
    
    try {
      console.log('📱 Режим Telegram Mini App');
      
      tg.ready();
      tg.expand();
      
      // Получаем данные пользователя из Telegram
      const initData = tg.initData;
      const user = tg.initDataUnsafe?.user;
      
      if (user) {
        console.log('👤 Telegram пользователь:', user);
        
        const userData = {
          telegramId: user.id.toString(),
          username: user.username,
          firstName: user.first_name,
          lastName: user.last_name,
          photoUrl: user.photo_url,
          initData: initData // Для проверки на сервере
        };
        
        try {
          const response = await authAPI.login(userData);
          if (response.success) {
            useUserStore.getState().setUser(response.user);
            useUserStore.getState().setToken(response.token);
            console.log('✅ Авторизация через Telegram успешна');
            return response.user;
          }
        } catch (error) {
          console.error('Ошибка авторизации через Telegram:', error);
          return createFallbackUser();
        }
      }
    } catch (error) {
      console.error('Ошибка инициализации Telegram:', error);
      return createFallbackUser();
    }
  }
  
  // Режим тестирования в браузере
  return createFallbackUser();
};

const createFallbackUser = () => {
  console.log('💻 Режим тестирования в браузере');
  
  const fallbackUser = {
    id: 1,
    telegramId: '123456789',
    username: 'testuser',
    firstName: 'Тест',
    lastName: 'Пользователь',
    avatarUrl: null,
    balance: 5000,
    totalEarned: 10000,
    dailyStreak: 5,
    referralCode: 'test123',
    createdAt: new Date().toISOString()
  };
  
  useUserStore.getState().setUser(fallbackUser);
  useUserStore.getState().setToken('test-token-browser');
  
  return fallbackUser;
};

export const useTelegram = () => {
  const tg = window.Telegram?.WebApp;
  
  const showAlert = (message: string) => {
    if (tg?.showAlert) {
      try {
        tg.showAlert(message);
      } catch (error) {
        console.warn('showAlert не поддерживается, используем alert');
        alert(message);
      }
    } else {
      alert(message);
    }
  };
  
  const closeApp = () => {
    if (tg?.close) {
      tg.close();
    }
  };
  
  const sendData = (data: any) => {
    if (tg?.sendData) {
      tg.sendData(JSON.stringify(data));
    }
  };
  
  return {
    tg,
    showAlert,
    closeApp,
    sendData,
    isTelegram: !!tg
  };
};