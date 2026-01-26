import axios from 'axios';
import { useUserStore } from '../store/user.store';

// Базовый URL из переменных окружения
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:10000/api';

console.log('🔧 API URL:', API_URL);

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 секунд таймаут
});

// Интерцептор для добавления токена
api.interceptors.request.use((config) => {
  const token = useUserStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Интерцептор для обработки ошибок
api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    console.error('API Error:', {
      url: error.config?.url,
      status: error.response?.status,
      message: error.message,
      data: error.response?.data
    });
    
    if (error.response?.status === 401) {
      useUserStore.getState().logout();
      // Можно добавить редирект на логин
    }
    
    return Promise.reject(error.response?.data?.error || 'Ошибка сети');
  }
);

// Типы для ответов API
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface AuthResponse {
  success: boolean;
  token: string;
  user: any;
}

export interface UserProfileResponse {
  success: boolean;
  user: any;
}

export interface StatsResponse {
  success: boolean;
  stats: any;
}

export interface CasesResponse {
  success: boolean;
  cases: any[];
}

export interface InventoryResponse {
  success: boolean;
  items: any[];
  total: number;
}

export interface DailyRewardResponse {
  success: boolean;
  reward: number;
  newBalance: number;
  streak: number;
  nextAvailable: string;
}

export interface OpenCaseResponse {
  success: boolean;
  item: any;
  case: {
    id: number;
    name: string;
    type: string;
  };
  newBalance: number;
  message: string;
}

export interface MarketListingsResponse {
  success: boolean;
  listings: any[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// API методы
export const authAPI = {
  login: (telegramData: any): Promise<AuthResponse> => 
    api.post('/auth/login', telegramData),
  
  verify: (token: string): Promise<AuthResponse> => 
    api.post('/auth/verify', { token }),
};

export const userAPI = {
  getProfile: (): Promise<UserProfileResponse> => 
    api.get('/user/profile'),
  
  getStats: (): Promise<StatsResponse> => 
    api.get('/user/stats'),
  
  claimDaily: (): Promise<DailyRewardResponse> => 
    api.post('/user/daily'),
  
  getReferrals: (): Promise<ApiResponse> => 
    api.get('/user/referrals'),
  
  getTransactions: (params?: any): Promise<ApiResponse> => 
    api.get('/user/transactions', { params }),
};

export const caseAPI = {
  getCases: (): Promise<CasesResponse> => 
    api.get('/cases'),
  
  getCaseDrops: (caseId: number): Promise<ApiResponse> => 
    api.get(`/cases/${caseId}/drops`),
  
  openCase: (caseId: number): Promise<OpenCaseResponse> => 
    api.post('/cases/open', { caseId }),
  
  getCaseHistory: (): Promise<ApiResponse> => 
    api.get('/cases/history'),
};

export const inventoryAPI = {
  getInventory: (params?: any): Promise<InventoryResponse> => 
    api.get('/inventory', { params }),
  
  combineSkin: (skinId: number): Promise<ApiResponse> => 
    api.post('/inventory/combine', { skinId }),
  
  sellItem: (itemId: number, price: number): Promise<ApiResponse> => 
    api.post('/inventory/sell', { itemId, price }),
  
  cancelSale: (listingId: number): Promise<ApiResponse> => 
    api.post('/inventory/cancel-sale', { listingId }),
};

export const marketAPI = {
  getListings: (params?: any): Promise<MarketListingsResponse> => 
    api.get('/market', { params }),
  
  buyItem: (listingId: number): Promise<ApiResponse> => 
    api.post('/market/buy', { listingId }),
  
  getMarketHistory: (params?: any): Promise<ApiResponse> => 
    api.get('/market/history', { params }),
};

export default api;