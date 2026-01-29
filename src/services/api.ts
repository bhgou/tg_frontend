import axios, { AxiosResponse } from 'axios';
import { useUserStore } from '../store/user.store';

const API_URL = process.env.VITE_API_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Типы для ответов API
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

export interface AuthResponse {
  success: boolean;
  token: string;
  user: any;
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
  (response: AxiosResponse) => {
    // Axios автоматически возвращает response.data
    // Нам нужно убедиться, что это наш формат ApiResponse
    return response.data;
  },
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    
    if (error.response?.status === 401) {
      useUserStore.getState().logout();
    }
    
    return Promise.reject(error.response?.data?.error || 'Ошибка сети');
  }
);

// API для аутентификации
export const authAPI = {
  login: (data: any): Promise<AuthResponse> => 
    api.post('/auth/login', data),
  
  verify: (token: string): Promise<AuthResponse> => 
    api.post('/auth/verify', { token }),
};

// API для пользователя
export const userAPI = {
  getProfile: (): Promise<ApiResponse> => 
    api.get('/user/profile'),
  
  getStats: (): Promise<ApiResponse> => 
    api.get('/user/stats'),
  
  claimDaily: (): Promise<DailyRewardResponse> => 
    api.post('/user/daily'),
  
  getReferrals: (): Promise<ApiResponse> => 
    api.get('/user/referrals'),
  
  getTransactions: (params?: any): Promise<ApiResponse> => 
    api.get('/user/transactions', { params }),
};

// API для кейсов
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

// API для инвентаря
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

// API для рынка
export const marketAPI = {
  getListings: (params?: any): Promise<MarketListingsResponse> => 
    api.get('/market', { params }),
  
  buyItem: (listingId: number): Promise<ApiResponse> => 
    api.post('/market/buy', { listingId }),
  
  getMarketHistory: (params?: any): Promise<ApiResponse> => 
    api.get('/market/history', { params }),
};

// API для каналов
export const channelsAPI = {
  getChannels: (): Promise<ApiResponse> => 
    api.get('/channels'),
  
  checkSubscriptions: (data: any): Promise<ApiResponse> => 
    api.post('/channels/check-subscriptions', data),
  
  claimReward: (channelId: number): Promise<ApiResponse> => 
    api.post('/channels/claim-reward', { channelId }),
  
  getChannelsStats: (): Promise<ApiResponse> => 
    api.get('/channels/stats'),
};

// API для реальных скинов
export const realSkinsAPI = {
  getRealSkins: (params?: any): Promise<ApiResponse> => 
    api.get('/real-skins', { params }),
  
  getRealSkin: (id: number): Promise<ApiResponse> => 
    api.get(`/real-skins/${id}`),
  
  withdrawSkin: (data: { skinId: number; steamTradeLink: string }): Promise<ApiResponse> => 
    api.post('/real-skins/withdraw', data),
  
  getWithdrawalsHistory: (): Promise<ApiResponse> => 
    api.get('/real-skins/withdrawals/history'),
  
  getFragmentsProgress: (): Promise<ApiResponse> => 
    api.get('/real-skins/fragments/progress'),
};

export default api;