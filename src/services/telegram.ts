import { useUserStore } from '../store/user.store';
import { authAPI, userAPI } from './api';
import { jwtDecode } from 'jwt-decode'; // Изменено с import jwt_decode from 'jwt-decode'

declare global {
  interface Window {
    Telegram?: {
      WebApp: any;
    };
  }
}

export interface TelegramUser {
  id: number;
  username?: string;
  first_name?: string;
  last_name?: string;
  photo_url?: string;
}

// Whitelist для админ панели (добавьте свои Telegram ID)
const ADMIN_WHITELIST = [process.env.ID_TELEGRAM]; // Замените на реальные ID

export const initTelegram = async (): Promise<any> => {
  try {
    // Если в окружении Telegram WebApp
    if (window.Telegram?.WebApp) {
      const tg = window.Telegram.WebApp;
      
      console.log('📱 Режим Telegram Mini App');
      
      tg.ready();
      tg.expand();
      
      if (tg.enableClosingConfirmation) {
        tg.enableClosingConfirmation();
      }
      
      // Получаем данные пользователя
      const user = tg.initDataUnsafe?.user;
      const initData = tg.initData;
      
      if (user && initData) {
        console.log('👤 Telegram пользователь:', user);
        
        // Исправляем тип для ответа сервера
        const response = await authAPI.login({
          telegramId: user.id.toString(),
          username: user.username,
          firstName: user.first_name,
          lastName: user.last_name,
          photoUrl: user.photo_url,
          initData: initData,
          startParam: tg.initDataUnsafe?.start_param
        });
        
        if (response.success && response.token) {
          // Используем нашу функцию декодирования
          const decoded = jwtDecode(response.token);
          
          const userData = {
            ...response.user,
            telegramId: response.user.telegramId,
            firstName: response.user.firstName,
            lastName: response.user.lastName,
            avatarUrl: response.user.avatarUrl,
            isAdmin: response.user.isAdmin || false
          };
          
          useUserStore.getState().setUser(userData);
          useUserStore.getState().setToken(response.token);
          
          console.log('✅ Аутентификация через Telegram успешна');
          
          return userData;
        }
      }
    }
    
    // Проверяем localStorage токен
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const response = await authAPI.verify(token);
        if (response.success) {
          const userData = {
            ...response.user,
            telegramId: response.user.telegramId,
            firstName: response.user.firstName,
            lastName: response.user.lastName,
            avatarUrl: response.user.avatarUrl,
            isAdmin: response.user.isAdmin || false
          };
          
          useUserStore.getState().setUser(userData);
          useUserStore.getState().setToken(token);
          return userData;
        }
      } catch (error) {
        console.log('Токен невалиден, требуется новая аутентификация');
      }
    }
    
    throw new Error('Требуется аутентификация');
    
  } catch (error) {
    console.error('Ошибка инициализации:', error);
    useUserStore.getState().setError('Требуется аутентификация');
    return null;
  }
};

// Загружаем дополнительные данные пользователя
const loadUserData = async () => {
  try {
    const [profile, stats] = await Promise.all([
      userAPI.getProfile(),
      userAPI.getStats()
    ]);
    
    if (profile.success && stats.success) {
      useUserStore.getState().updateUserData({
        ...profile.user,
        stats: stats.stats
      });
    }
  } catch (error) {
    console.error('Ошибка загрузки данных пользователя:', error);
  }
};

export const useTelegram = () => {
  const tg = window.Telegram?.WebApp;
  
  const showAlert = (message: string) => {
    if (tg?.showAlert) {
      try {
        tg.showAlert(message);
      } catch (error) {
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