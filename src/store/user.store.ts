import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: number;
  telegramId: string;
  username: string | null;
  firstName: string | null;
  lastName: string | null;
  avatarUrl: string | null;
  balance: number;
  totalEarned: number;
  dailyStreak: number;
  referralCode: string;
}

interface UserStore {
  user: User | null;
  balance: number;
  token: string | null;
  isAuthenticated: boolean;
  
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  updateBalance: (newBalance: number) => void;
  addBalance: (amount: number) => void;
  logout: () => void;
}

export const useUserStore = create<UserStore>()(
  persist(
    (set) => ({
      user: null,
      balance: 0,
      token: null,
      isAuthenticated: false,

      setUser: (user) => set({ 
        user, 
        balance: user?.balance || 0,
        isAuthenticated: !!user 
      }),
      
      setToken: (token) => set({ token }),
      
      updateBalance: (newBalance) => set({ balance: newBalance }),
      
      addBalance: (amount) => set((state) => ({ 
        balance: state.balance + amount 
      })),
      
      logout: () => set({ 
        user: null, 
        token: null, 
        balance: 0, 
        isAuthenticated: false 
      }),
    }),
    {
      name: 'user-storage',
    }
  )
);