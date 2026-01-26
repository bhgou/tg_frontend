import axios from 'axios';
import { useUserStore } from '../store/user.store';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Базовый интерфейс для всех ответов API
interface BaseApiResponse {
  success: boolean;
  message?: string;
  error?: string;
}

// Интерфейс для ответа авторизации
interface AuthResponse extends BaseApiResponse {
  token: string;
  user: any;
}

// Интерфейс для ответа с пользователем
interface UserProfileResponse extends BaseApiResponse {
  user: any;
}

// Интерфейс для ответа со статистикой
interface StatsResponse extends BaseApiResponse {
  stats: any;
}

// Интерфейс для ответа с кейсами
interface CasesResponse extends BaseApiResponse {
  cases: any[];
}

// Интерфейс для ответа с инвентарем
interface InventoryResponse extends BaseApiResponse {
  items: any[];
  total: number;
}

// Интерфейс для ежедневной награды
interface DailyRewardResponse extends BaseApiResponse {
  reward: number;
  newBalance: number;
  streak: number;
  nextAvailable: string;
}

// Интерфейс для ответа на открытие кейса
interface OpenCaseResponse extends BaseApiResponse {
  item: any;
  case: {
    id: number;
    name: string;
    type: string;
  };
  newBalance: number;
  message: string;
}

// Интерфейс для ответа с лотами рынка
interface MarketListingsResponse extends BaseApiResponse {
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

// Интерцептор для обработки ошибок
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      useUserStore.getState().logout();
    }
    return Promise.reject(error.response?.data?.error || 'Network error');
  }
);

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
  
  getReferrals: (): Promise<BaseApiResponse> => 
    api.get('/user/referrals'),
  
  getTransactions: (params?: any): Promise<BaseApiResponse> => 
    api.get('/user/transactions', { params }),
};

export const caseAPI = {
  getCases: (): Promise<CasesResponse> => 
    api.get('/cases'),
  
  getCaseDrops: (caseId: number): Promise<BaseApiResponse> => 
    api.get(`/cases/${caseId}/drops`),
  
  openCase: (caseId: number): Promise<OpenCaseResponse> => 
    api.post('/cases/open', { caseId }),
  
  getCaseHistory: (): Promise<BaseApiResponse> => 
    api.get('/cases/history'),
};

export const inventoryAPI = {
  getInventory: (params?: any): Promise<InventoryResponse> => 
    api.get('/inventory', { params }),
  
  combineSkin: (skinId: number): Promise<BaseApiResponse> => 
    api.post('/inventory/combine', { skinId }),
  
  sellItem: (itemId: number, price: number): Promise<BaseApiResponse> => 
    api.post('/inventory/sell', { itemId, price }),
  
  cancelSale: (listingId: number): Promise<BaseApiResponse> => 
    api.post('/inventory/cancel-sale', { listingId }),
};

export const marketAPI = {
  getListings: (params?: any): Promise<MarketListingsResponse> => 
    api.get('/market', { params }),
  
  buyItem: (listingId: number): Promise<BaseApiResponse> => 
    api.post('/market/buy', { listingId }),
  
  getMarketHistory: (params?: any): Promise<BaseApiResponse> => 
    api.get('/market/history', { params }),
};

export default api;