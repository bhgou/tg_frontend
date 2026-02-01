import axios from 'axios';
import { useUserStore } from '../store/user.store';

const API_URL = process.env.REACT_APP_API_URL || 'https://api.skinfactory.com/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// ==================== TYPES ====================
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  pagination?: Pagination;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

// User Types
export interface User {
  id: number;
  telegramId: string;
  username: string;
  firstName: string;
  lastName: string;
  avatarUrl: string;
  balance: number;
  premiumBalance: number;
  totalEarned: number;
  totalSpentRub: number;
  dailyStreak: number;
  referralCode: string;
  isAdmin: boolean;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
  stats?: UserStats;
}

export interface UserStats {
  totalCasesOpened: number;
  totalSkinsCollected: number;
  totalReferrals: number;
  tradeAccuracy: number;
  totalGamesPlayed: number;
  totalGamesWon: number;
  winRate: number;
}

// Auth Responses
export interface AuthResponse extends ApiResponse {
  token: string;
  user: User;
}

export interface UserProfileResponse extends ApiResponse {
  user: User;
}

export interface UserStatsResponse extends ApiResponse {
  stats: UserStats;
}

// Case Types
export interface Case {
  id: number;
  name: string;
  type: 'free' | 'standard' | 'premium' | 'fragment' | 'gold';
  price: number | null;
  premiumPrice: number | null;
  imageUrl: string | null;
  description: string;
  minReward: number;
  maxReward: number;
  isActive: boolean;
  coolDownMinutes: number;
  totalOpened: number;
  createdAt: string;
}

export interface CaseDrop {
  id: number;
  caseId: number;
  skinId: number | null;
  name: string;
  rarity: string;
  probability: number;
  isFragment: boolean;
  fragments: number;
  price: number;
  imageUrl: string | null;
}

export interface CasesResponse extends ApiResponse {
  cases: Case[];
}

export interface CaseDetailResponse extends ApiResponse {
  case: Case;
  drops: CaseDrop[];
  canOpen: boolean;
  nextAvailable: string | null;
}

export interface OpenCaseResponse extends ApiResponse {
  item: InventoryItem;
  case: Case;
  newBalance: number;
  message: string;
}

// Inventory Types
export interface InventoryItem {
  id: number;
  userId: number;
  skinId: number | null;
  name: string;
  rarity: string;
  imageUrl: string | null;
  isFragment: boolean;
  fragments: number;
  price: number;
  createdAt: string;
  weapon?: string;
  fragmentsRequired?: number;
  isTradable: boolean;
  isMarketable: boolean;
}

export interface InventoryResponse extends ApiResponse {
  items: InventoryItem[];
  total: number;
}

// Market Types
export interface MarketListing {
  id: number;
  sellerId: number;
  sellerUsername: string;
  itemId: number;
  item: InventoryItem;
  price: number;
  isActive: boolean;
  createdAt: string;
  expiresAt: string;
  views: number;
}

export interface MarketResponse extends ApiResponse {
  listings: MarketListing[];
  pagination: Pagination;
  stats: MarketStats;
}

export interface MarketStats {
  totalListings: number;
  totalTrades: number;
  totalVolume: number;
  averagePrice: number;
}

// Game Types
export interface Game {
  id: number;
  name: string;
  type: 'dice' | 'roulette' | 'slots' | 'coinflip' | 'blackjack';
  minBet: number;
  maxBet: number;
  winMultiplier: number;
  isActive: boolean;
  playersOnline: number;
  description: string;
}

export interface GameMatch {
  id: number;
  gameId: number;
  gameName: string;
  bet: number;
  player1Id: number;
  player1Username: string;
  player2Id: number | null;
  player2Username: string | null;
  status: 'waiting' | 'playing' | 'finished' | 'cancelled';
  result: any;
  winnerId: number | null;
  createdAt: string;
  startedAt: string | null;
  finishedAt: string | null;
}

export interface GamesResponse extends ApiResponse {
  games: Game[];
}

export interface GameMatchResponse extends ApiResponse {
  match: GameMatch;
  queueId?: string;
}

// Payment Types
export interface PaymentPackage {
  id: number;
  rub: number;
  premium: number;
  bonus: number;
  popular: boolean;
  description: string;
}

export interface PackagesResponse extends ApiResponse {
  packages: PaymentPackage[];
}

export interface PaymentCreateResponse extends ApiResponse {
  payment?: {
    id: number;
    userId: number;
    amountRub: number;
    amountPremium: number;
    status: string;
    paymentUrl: string; // camelCase
    payment_url?: string; // snake_case (опционально для обратной совместимости)
    createdAt: string;
  };
  demo?: boolean;
}

// Real Skin Types
export interface RealSkin {
  id: number;
  name: string;
  weapon: string;
  rarity: string;
  exterior: string;
  floatValue: number;
  steamPrice: number;
  imageUrl: string;
  fragmentsRequired: number;
  premiumFee: number;
  isTradable: boolean;
  isStattrak: boolean;
  isSouvenir: boolean;
  totalWithdrawn: number;
}

// Admin Types
export interface AdminStatsResponse extends ApiResponse {
  stats: {
    totalUsers: number;
    newUsersToday: number;
    totalRevenue: number;
    totalPayments: number;
    totalBalance: number;
    totalPremiumBalance: number;
    transactionsToday: number;
    totalCaseOpens: number;
    gamesToday: number;
    pendingWithdrawals: number;
    completedWithdrawals: number;
  };
  revenueChart: any[];
  topSpenders: any[];
}

// ==================== INTERCEPTORS ====================
api.interceptors.request.use((config) => {
  const token = useUserStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  // Добавляем timestamp для предотвращения кеширования
  if (config.method === 'get') {
    config.params = {
      ...config.params,
      _t: Date.now()
    };
  }
  
  return config;
});

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
      window.location.href = '/auth';
    }
    
    if (error.response?.status === 429) {
      alert('Слишком много запросов. Подождите немного.');
    }
    
    return Promise.reject(error.response?.data || { 
      success: false, 
      error: 'Ошибка сети. Проверьте подключение к интернету.' 
    });
  }
);

// ==================== API METHODS ====================

// Проверка подключения
export const checkApiConnection = async () => {
  try {
    const response = await api.get('/health');
    return { success: true, data: response };
  } catch (error) {
    return { success: false, error };
  }
};

// Auth API
export const authAPI = {
  login: (data: any): Promise<AuthResponse> => 
    api.post('/auth/login', data),
  
  verify: (token: string): Promise<AuthResponse> => 
    api.post('/auth/verify', { token }),
  
  register: (data: any): Promise<AuthResponse> =>
    api.post('/auth/register', data),
  
  logout: (): Promise<ApiResponse> =>
    api.post('/auth/logout'),
};

// User API
export const userAPI = {
  getProfile: (): Promise<UserProfileResponse> =>
    api.get('/user/profile'),
  
  getStats: (): Promise<UserStatsResponse> =>
    api.get('/user/stats'),
  
  claimDaily: (): Promise<ApiResponse> =>
    api.post('/user/daily'),
  
  getReferrals: (): Promise<ApiResponse> =>
    api.get('/user/referrals'),
  
  getTransactions: (params?: any): Promise<ApiResponse> =>
    api.get('/user/transactions', { params }),
  
  updateProfile: (data: any): Promise<UserProfileResponse> =>
    api.put('/user/profile', data),
};

// Case API
export const caseAPI = {
  getCases: (): Promise<CasesResponse> =>
    api.get('/cases'),
  
  getCase: (id: number): Promise<CaseDetailResponse> =>
    api.get(`/cases/${id}`),
  
  getCaseDrops: (caseId: number): Promise<ApiResponse> =>
    api.get(`/cases/${caseId}/drops`),
  
  openCase: (caseId: number): Promise<OpenCaseResponse> =>
    api.post('/cases/open', { caseId }),
  
  checkCanOpen: (caseId: number): Promise<ApiResponse> =>
    api.get(`/cases/${caseId}/can-open`),
  
  getCaseHistory: (params?: any): Promise<ApiResponse> =>
    api.get('/cases/history', { params }),
};

// Inventory API
export const inventoryAPI = {
  getInventory: (params?: any): Promise<InventoryResponse> =>
    api.get('/inventory', { params }),
  
  combineSkin: (skinId: number): Promise<ApiResponse> =>
    api.post('/inventory/combine', { skinId }),
  
  getItem: (itemId: number): Promise<ApiResponse> =>
    api.get(`/inventory/${itemId}`),
};

// Market API
export const marketAPI = {
  getListings: (params?: any): Promise<MarketResponse> =>
    api.get('/market', { params }),
  
  createListing: (data: any): Promise<ApiResponse> =>
    api.post('/market/listings', data),
  
  buyItem: (listingId: number): Promise<ApiResponse> =>
    api.post('/market/buy', { listingId }),
  
  cancelListing: (listingId: number): Promise<ApiResponse> =>
    api.delete(`/market/listings/${listingId}`),
  
  getMarketHistory: (params?: any): Promise<ApiResponse> =>
    api.get('/market/history', { params }),
  
  searchItems: (params: any): Promise<MarketResponse> =>
    api.get('/market/search', { params }),
};

// Game API
export const gameAPI = {
  getGames: (): Promise<GamesResponse> =>
    api.get('/games'),
  
  searchMatch: (data: any): Promise<GameMatchResponse> =>
    api.post('/games/search-match', data),
  
  checkMatch: (queueId: string): Promise<GameMatchResponse> =>
    api.get(`/games/check-match/${queueId}`),
  
  getMatches: (gameId: number): Promise<ApiResponse> =>
    api.get(`/games/matches/${gameId}`),
  
  getMyMatches: (): Promise<ApiResponse> =>
    api.get('/games/my-matches'),
  
  joinMatch: (matchId: number): Promise<ApiResponse> =>
    api.post('/games/join-match', { matchId }),
  
  makeMove: (matchId: number, move: any): Promise<ApiResponse> =>
    api.post('/games/make-move', { matchId, move }),
  
  getMatch: (matchId: number): Promise<ApiResponse> =>
    api.get(`/games/match/${matchId}`),
  
  getGameHistory: (params?: any): Promise<ApiResponse> =>
    api.get('/games/history', { params }),
};

// Payment API
export const paymentAPI = {
  getPackages: (): Promise<PackagesResponse> =>
    api.get('/payments/packages'),
  
  createPayment: (data: any): Promise<PaymentCreateResponse> =>
    api.post('/payments/create', data),
  
  getPaymentStatus: (paymentId: string): Promise<ApiResponse> =>
    api.get(`/payments/status/${paymentId}`),
  
  getPaymentHistory: (params?: any): Promise<ApiResponse> =>
    api.get('/payments/history', { params }),
};

// Admin API (только для админов)
export const adminAPI = {
  getStats: (): Promise<AdminStatsResponse> =>
    api.get('/admin/stats'),
  
  getUsers: (params?: any): Promise<ApiResponse<{users: User[], pagination?: Pagination}>> =>
    api.get('/admin/users', { params }),
  
  updateUser: (userId: number, data: any): Promise<ApiResponse> =>
    api.put(`/admin/users/${userId}`, data),
  
  banUser: (userId: number, reason: string): Promise<ApiResponse> =>
    api.post(`/admin/users/${userId}/ban`, { reason }),
  
  getCases: (): Promise<ApiResponse> =>
    api.get('/admin/cases'),
  
  createCase: (data: any): Promise<ApiResponse> =>
    api.post('/admin/cases', data),
  
  updateCase: (caseId: number, data: any): Promise<ApiResponse> =>
    api.put(`/admin/cases/${caseId}`, data),
  
  getWithdrawals: (params?: any): Promise<ApiResponse> =>
    api.get('/admin/withdrawals', { params }),
  
  updateWithdrawal: (id: number, data: any): Promise<ApiResponse> =>
    api.put(`/admin/withdrawals/${id}`, data),
  
  getAuditLog: (params?: any): Promise<ApiResponse> =>
    api.get('/admin/audit-log', { params }),
};

// Rate limiting
class RateLimiter {
  private requests: Map<string, { count: number; timestamp: number }> = new Map();
  
  canMakeRequest(key: string, limit: number, windowMs: number): boolean {
    const now = Date.now();
    const entry = this.requests.get(key);
    
    if (!entry || now - entry.timestamp > windowMs) {
      this.requests.set(key, { count: 1, timestamp: now });
      return true;
    }
    
    if (entry.count >= limit) {
      return false;
    }
    
    entry.count++;
    return true;
  }
}

const rateLimiter = new RateLimiter();

// Обновленный interceptor
api.interceptors.request.use((config) => {
  const token = useUserStore.getState().token;
  const userId = useUserStore.getState().user?.id;
  
  // Rate limiting по пользователю или IP
  const key = userId ? `user_${userId}` : `ip_${window.location.hostname}`;
  
  if (!rateLimiter.canMakeRequest(key, 60, 60000)) { // 60 запросов в минуту
    throw new Error('Слишком много запросов. Подождите 1 минуту.');
  }
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
    config.headers['X-User-ID'] = userId;
  }
  
  // Добавляем уникальный идентификатор запроса
  config.headers['X-Request-ID'] = crypto.randomUUID();
  
  // Добавляем timestamp для предотвращения replay attacks
  if (config.method === 'post' || config.method === 'put' || config.method === 'delete') {
    config.headers['X-Timestamp'] = Date.now();
  }
  
  return config;
}, (error) => {
  return Promise.reject(error);
});
export default api;