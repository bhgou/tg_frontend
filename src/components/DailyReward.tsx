import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Gift, Flame } from 'lucide-react';
import { Button } from './ui/Button';
import { useUserStore } from '../store/user.store';
import { userAPI } from '../services/api';

export const DailyReward: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const { user, addBalance } = useUserStore();

  const handleClaim = async () => {
  try {
    setLoading(true);
    const response = await userAPI.claimDaily();
    // response.reward доступен
    addBalance(response.reward);
    // Можно показать уведомление об успехе
  } catch (error: any) {
    console.error('Claim daily error:', error);
    // Обработка ошибки
  } finally {
    setLoading(false);
  }
};

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="mb-6"
    >
      <div className="glass-effect rounded-2xl p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-400" />
            <h3 className="font-bold">Ежедневная награда</h3>
          </div>
          <div className="flex items-center gap-1 text-yellow-400">
            <Flame className="w-4 h-4" />
            <span className="text-sm font-bold">{user?.dailyStreak || 0} дней</span>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-2 mb-4">
          {[100, 120, 140, 160, 200, 240, 500].map((amount, index) => (
            <div
              key={index}
              className={`aspect-square rounded-lg flex flex-col items-center justify-center
                ${index < (user?.dailyStreak || 0) 
                  ? 'bg-gradient-to-br from-green-500 to-emerald-600' 
                  : 'bg-gray-800'
                }`}
            >
              <Gift className={`w-4 h-4 mb-1 ${index < (user?.dailyStreak || 0) ? 'text-white' : 'text-gray-500'}`} />
              <span className={`text-xs font-bold ${index < (user?.dailyStreak || 0) ? 'text-white' : 'text-gray-400'}`}>
                {amount}
              </span>
            </div>
          ))}
        </div>

        <Button
          variant="primary"
          fullWidth
          loading={loading}
          onClick={handleClaim}
        >
          Получить награду
        </Button>
      </div>
    </motion.div>
  );
};