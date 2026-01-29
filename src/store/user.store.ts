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
  premiumBalance: number; // Добавили
  totalEarned: number;
  totalSpentRub: number; // Добавили
  dailyStreak: number;
  referralCode: string;
  isAdmin: boolean; // Добавили
}

interface UserStore {
  user: User | null;
  balance: number;
  premiumBalance: number; // Добавили
  token: string | null;
  isAuthenticated: boolean;
  fragments: number;
  
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  updateBalance: (newBalance: number) => void;
  updatePremiumBalance: (newPremiumBalance: number) => void; // Добавили
  addBalance: (amount: number) => void;
  addPremiumBalance: (amount: number) => void; // Добавили
  updateFragments: (fragments: number) => void;
  addFragments: (amount: number) => void;
  logout: () => void;
}

export const useUserStore = create<UserStore>()(
  persist(
    (set) => ({
      user: null,
      balance: 0,
      premiumBalance: 0,
      token: null,
      isAuthenticated: false,
      fragments: 0,

      setUser: (user) => set({ 
        user, 
        balance: user?.balance || 0,
        premiumBalance: user?.premiumBalance || 0,
        isAuthenticated: !!user 
      }),
      
      setToken: (token) => set({ token }),
      
      updateBalance: (newBalance) => set({ balance: newBalance }),
      
      updatePremiumBalance: (newPremiumBalance) => set({ premiumBalance: newPremiumBalance }),
      
      addBalance: (amount) => set((state) => ({ 
        balance: state.balance + amount 
      })),
      
      addPremiumBalance: (amount) => set((state) => ({ 
        premiumBalance: state.premiumBalance + amount 
      })),
      
      updateFragments: (fragments) => set({ fragments }),
      
      addFragments: (amount) => set((state) => ({ 
        fragments: state.fragments + amount 
      })),
      
      logout: () => set({ 
        user: null, 
        token: null, 
        balance: 0, 
        premiumBalance: 0,
        fragments: 0,
        isAuthenticated: false 
      }),
    }),
    {
      name: 'skin-factory-storage',
    }
  )
);