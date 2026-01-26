import { useUserStore } from '../store/user.store';
import { authAPI } from './api';

declare global {
  interface Window {
    Telegram?: any;
  }
}

export const initTelegram = async () => {
  if (window.Telegram?.WebApp) {
    const tg = window.Telegram.WebApp;
    
    // Инициализируем приложение
    tg.ready();
    tg.expand();
    
    // Получаем данные пользователя из Telegram
    const user = tg.initDataUnsafe?.user;
    
    if (user) {
      try {
        const response = await authAPI.login({
          telegramId: user.id.toString(),
          username: user.username,
          firstName: user.first_name,
          lastName: user.last_name,
          photoUrl: user.photo_url,
        });
        
        useUserStore.getState().setUser(response.user);
        useUserStore.getState().setToken(response.token);
        
        return response.user;
      } catch (error) {
        console.error('Telegram auth error:', error);
      }
    }
  }
  
  return null;
};

export const useTelegram = () => {
  const tg = window.Telegram?.WebApp;
  
  const sendData = (data: any) => {
    if (tg) {
      tg.sendData(JSON.stringify(data));
    }
  };
  
  const closeApp = () => {
    if (tg) {
      tg.close();
    }
  };
  
  const showAlert = (message: string) => {
    if (tg) {
      tg.showAlert(message);
    } else {
      alert(message);
    }
  };
  
  return {
    tg,
    sendData,
    closeApp,
    showAlert,
    isTelegram: !!window.Telegram?.WebApp,
  };
};