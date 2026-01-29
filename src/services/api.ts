import axios from 'axios';
import { useUserStore } from '../store/user.store';

const API_URL = process.env.VITE_API_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Интерфейсы для ответов API
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface AuthResponse extends ApiResponse {
  token: string;
  user: any;
}

export interface UserProfileResponse extends ApiResponse {
  user: any;
}

export interface UserStatsResponse extends ApiResponse {
  stats: any;
}

export interface CasesResponse extends ApiResponse {
  cases: any[];
}

export interface DailyRewardResponse extends ApiResponse {
  reward: number;
  newBalance: number;
  streak: number;
  nextAvailable: string;
}

export interface InventoryResponse extends ApiResponse {
  items: any[];
  total: number;
}

export interface MarketResponse extends ApiResponse {
  listings: any[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// Интерцептор для добавления токена
api.interceptors.request.use((config) => {
  const token = useUserStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Интерцептор для обработки ответов
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    console.error('API Error:', {
      url: error.config?.url,
      status: error.response?.status,
      message: error.message,
    });
    
    if (error.response?.status === 401) {
      useUserStore.getState().logout();
    }
    
    return Promise.reject(error.response?.data || { error: 'Ошибка сети' });
  }
);

// Проверка подключения к API
export const checkApiConnection = async () => {
  try {
    const response = await api.get('/');
    return { success: true, data: response };
  } catch (error) {
    console.error('API connection error:', error);
    return { success: false, error };
  }
};

// API для аутентификации
export const authAPI = {
  login: (data: any): Promise<AuthResponse> => 
    api.post('/auth/login', data) as Promise<AuthResponse>,
  
  verify: (token: string): Promise<AuthResponse> => 
    api.post('/auth/verify', { token }) as Promise<AuthResponse>,
};

// API для пользователя
export const userAPI = {
  getProfile: (): Promise<UserProfileResponse> => 
    api.get('/user/profile') as Promise<UserProfileResponse>,
  
  getStats: (): Promise<UserStatsResponse> => 
    api.get('/user/stats') as Promise<UserStatsResponse>,
  
  claimDaily: (): Promise<DailyRewardResponse> => 
    api.post('/user/daily') as Promise<DailyRewardResponse>,
  
  getReferrals: (): Promise<ApiResponse> => 
    api.get('/user/referrals') as Promise<ApiResponse>,
  
  getTransactions: (params?: any): Promise<ApiResponse> => 
    api.get('/user/transactions', { params }) as Promise<ApiResponse>,
};

// API для кейсов
export const caseAPI = {
  getCases: (): Promise<CasesResponse> => 
    api.get('/cases') as Promise<CasesResponse>,
  
  getCaseDrops: (caseId: number): Promise<ApiResponse> => 
    api.get(`/cases/${caseId}/drops`) as Promise<ApiResponse>,
  
  openCase: (caseId: number): Promise<ApiResponse> => 
    api.post('/cases/open', { caseId }) as Promise<ApiResponse>,
  
  getCaseHistory: (): Promise<ApiResponse> => 
    api.get('/cases/history') as Promise<ApiResponse>,
};

// API для инвентаря
export const inventoryAPI = {
  getInventory: (params?: any): Promise<InventoryResponse> => 
    api.get('/inventory', { params }) as Promise<InventoryResponse>,
  
  combineSkin: (skinId: number): Promise<ApiResponse> => 
    api.post('/inventory/combine', { skinId }) as Promise<ApiResponse>,
  
  sellItem: (itemId: number, price: number): Promise<ApiResponse> => 
    api.post('/inventory/sell', { itemId, price }) as Promise<ApiResponse>,
  
  cancelSale: (listingId: number): Promise<ApiResponse> => 
    api.post('/inventory/cancel-sale', { listingId }) as Promise<ApiResponse>,
};

// API для рынка
export const marketAPI = {
  getListings: (params?: any): Promise<MarketResponse> => 
    api.get('/market', { params }) as Promise<MarketResponse>,
  
  buyItem: (listingId: number): Promise<ApiResponse> => 
    api.post('/market/buy', { listingId }) as Promise<ApiResponse>,
  
  getMarketHistory: (params?: any): Promise<ApiResponse> => 
    api.get('/market/history', { params }) as Promise<ApiResponse>,
};

export default api;