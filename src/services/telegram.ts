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
      tg.enableClosingConfirmation();
      
      // Показываем главную кнопку
      if (tg.MainButton) {
        tg.MainButton.show();
        tg.MainButton.setText('Открыть меню');
        tg.MainButton.onClick(() => {
          tg.showPopup({
            title: 'Меню',
            message: 'Выберите действие',
            buttons: [
              { id: 'profile', text: '👤 Профиль', type: 'default' },
              { id: 'inventory', text: '🎒 Инвентарь', type: 'default' },
              { type: 'cancel' }
            ]
          }, (buttonId: string) => {
            if (buttonId === 'profile') {
              window.location.href = '/profile';
            } else if (buttonId === 'inventory') {
              window.location.href = '/inventory';
            }
          });
        });
      }
      
      // Получаем данные пользователя
      const user = tg.initDataUnsafe?.user;
      
      if (user) {
        console.log('👤 Telegram пользователь:', user);
        
        const userData = {
          telegramId: user.id.toString(),
          username: user.username,
          firstName: user.first_name,
          lastName: user.last_name,
          photoUrl: user.photo_url,
          startParam: tg.initDataUnsafe?.start_param // Для рефералов
        };
        
        try {
          const response = await authAPI.login(userData);
          if (response.success) {
            useUserStore.getState().setUser(response.user);
            useUserStore.getState().setToken(response.token);
            console.log('✅ Авторизация через Telegram успешна');
            
            // Отправляем данные в бот
            if (tg.sendData) {
              tg.sendData(JSON.stringify({
                type: 'user_connected',
                userId: response.user.id
              }));
            }
            
            return response.user;
          }
        } catch (error) {
          console.error('Ошибка авторизации:', error);
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
  
  const isTelegram = () => !!tg;
  
  return {
    tg,
    showAlert,
    closeApp,
    sendData,
    isTelegram: isTelegram()
  };
};