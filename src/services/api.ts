import axios from 'axios';
import { useUserStore } from '../store/user.store';

const API_URL = 'https://backend-tg-i7mg.onrender.com/api';

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

export interface CaseDropsResponse extends ApiResponse {
  drops: any[];
}

export interface OpenCaseResponse extends ApiResponse {
  item: {
    id: number;
    name: string;
    rarity: string;
    price: number;
    is_fragment: boolean;
    fragments?: number;
    image_url?: string;
  };
  case: {
    id: number;
    name: string;
    type: string;
  };
  newBalance: number;
  message: string;
}

export interface AdminStatsResponse extends ApiResponse {
  stats: any;
  revenueChart?: any[];
  topSpenders?: any[];
}

export interface AdminUsersResponse extends ApiResponse {
  users: any[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface PackagesResponse extends ApiResponse {
  packages: any[];
}

export interface GamesResponse extends ApiResponse {
  games: any[];
}

export interface PaymentCreateResponse extends ApiResponse {
  payment: any;
  demo?: boolean;
  payment_url?: string;
  gateway_data?: any;
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
  
  getCaseDrops: (caseId: number): Promise<CaseDropsResponse> => 
    api.get(`/cases/${caseId}/drops`) as Promise<CaseDropsResponse>,
  
  openCase: (caseId: number): Promise<OpenCaseResponse> => 
    api.post('/cases/open', { caseId }) as Promise<OpenCaseResponse>,
  
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

// API для админ-панели
export const adminAPI = {
  getStats: (): Promise<AdminStatsResponse> => 
    api.get('/admin/stats') as Promise<AdminStatsResponse>,
  
  getUsers: (params?: any): Promise<AdminUsersResponse> => 
    api.get('/admin/users', { params }) as Promise<AdminUsersResponse>,
  
  updateUserBalance: (userId: number, data: any): Promise<ApiResponse> => 
    api.post(`/admin/users/${userId}/balance`, data) as Promise<ApiResponse>,
  
  getCases: (): Promise<ApiResponse> => 
    api.get('/admin/cases') as Promise<ApiResponse>,
  
  saveCase: (data: any): Promise<ApiResponse> => 
    api.post('/admin/cases', data) as Promise<ApiResponse>,
  
  getSkins: (params?: any): Promise<ApiResponse> => 
    api.get('/admin/skins', { params }) as Promise<ApiResponse>,
  
  getSponsors: (): Promise<ApiResponse> => 
    api.get('/admin/sponsors') as Promise<ApiResponse>,
  
  saveSponsor: (data: any): Promise<ApiResponse> => 
    api.post('/admin/sponsors', data) as Promise<ApiResponse>,
  
  getWithdrawals: (params?: any): Promise<ApiResponse> => 
    api.get('/admin/withdrawals', { params }) as Promise<ApiResponse>,
  
  updateWithdrawalStatus: (id: number, data: any): Promise<ApiResponse> => 
    api.post(`/admin/withdrawals/${id}/status`, data) as Promise<ApiResponse>,
  
  getSettings: (): Promise<ApiResponse> => 
    api.get('/admin/settings') as Promise<ApiResponse>,
  
  saveSettings: (settings: any[]): Promise<ApiResponse> => 
    api.post('/admin/settings', { settings }) as Promise<ApiResponse>,
  
  getPayments: (params?: any): Promise<ApiResponse> => 
    api.get('/admin/payments', { params }) as Promise<ApiResponse>,
  
  exportData: (type: string, params?: any): Promise<ApiResponse> => 
    api.get(`/admin/export/${type}`, { params }) as Promise<ApiResponse>,
};

// API для платежей
export const paymentAPI = {
  getPackages: (): Promise<PackagesResponse> => 
    api.get('/payments/packages') as Promise<PackagesResponse>,
  
  createPayment: (data: any): Promise<PaymentCreateResponse> => 
    api.post('/payments/create', data) as Promise<PaymentCreateResponse>,
  
  getPaymentStatus: (paymentId: string): Promise<ApiResponse> => 
    api.get(`/payments/status/${paymentId}`) as Promise<ApiResponse>,
  
  getPaymentHistory: (params?: any): Promise<ApiResponse> => 
    api.get('/payments/history', { params }) as Promise<ApiResponse>,
};

// API для мини-игр
export const gameAPI = {
  getGames: (): Promise<GamesResponse> => 
    api.get('/games/games') as Promise<GamesResponse>,
  
  playDice: (data: any): Promise<ApiResponse> => 
    api.post('/games/dice/play', data) as Promise<ApiResponse>,
  
  playRoulette: (data: any): Promise<ApiResponse> => 
    api.post('/games/roulette/play', data) as Promise<ApiResponse>,
  
  playSlots: (data: any): Promise<ApiResponse> => 
    api.post('/games/slots/play', data) as Promise<ApiResponse>,
  
  playCoinflip: (data: any): Promise<ApiResponse> => 
    api.post('/games/coinflip/play', data) as Promise<ApiResponse>,
  
  getGameHistory: (params?: any): Promise<ApiResponse> => 
    api.get('/games/history', { params }) as Promise<ApiResponse>,
};

export default api;