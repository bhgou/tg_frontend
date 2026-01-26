import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  User, 
  Coins, 
  Award, 
  Calendar,
  Settings,
  LogOut,
  Share2,
  Shield
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { useUserStore } from '../store/user.store';
import { userAPI } from '../services/api';
import { useTelegram } from '../services/telegram';

export const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useUserStore();
  const { closeApp } = useTelegram();
  const [stats, setStats] = useState<any>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
  try {
    const response = await userAPI.getStats();
    // response.stats доступен благодаря типизации
    setStats(response.stats || {});
  } catch (error) {
    console.error('Failed to load stats:', error);
  } finally {
    setLoading(false);
  }
};

  const handleLogout = () => {
    logout();
    if (closeApp) {
      closeApp();
    } else {
      navigate('/');
    }
  };

  const menuItems = [
    { icon: <Coins className="w-5 h-5" />, label: 'Баланс', value: `${user?.balance || 0} CR`, color: 'text-yellow-400' },
    { icon: <Award className="w-5 h-5" />, label: 'Всего заработано', value: `${user?.totalEarned || 0} CR`, color: 'text-green-400' },
    { icon: <Calendar className="w-5 h-5" />, label: 'Стрик', value: `${user?.dailyStreak || 0} дней`, color: 'text-blue-400' },
    { icon: <Shield className="w-5 h-5" />, label: 'Статус', value: 'Новичок', color: 'text-purple-400' },
  ];

  const actions = [
    { icon: <Share2 className="w-5 h-5" />, label: 'Пригласить друзей', onClick: () => {} },
    { icon: <Settings className="w-5 h-5" />, label: 'Настройки', onClick: () => {} },
    { icon: <LogOut className="w-5 h-5" />, label: 'Выйти', onClick: handleLogout, variant: 'danger' as const },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Button
            variant="glass"
            size="sm"
            icon={<ArrowLeft className="w-4 h-4" />}
            onClick={() => navigate('/')}
          />
          <h1 className="text-2xl font-bold">Профиль</h1>
        </div>
      </div>

      {/* User info */}
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="glass-effect rounded-2xl p-6 mb-6 text-center"
      >
        <div className="w-24 h-24 mx-auto mb-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
          <User className="w-12 h-12 text-white" />
        </div>
        
        <h2 className="text-xl font-bold mb-1">
          {user?.firstName} {user?.lastName}
        </h2>
        <p className="text-gray-400 mb-4">@{user?.username || 'user'}</p>
        
        <div className="inline-block bg-blue-500/20 text-blue-400 px-4 py-1 rounded-full text-sm font-medium">
          ID: {user?.telegramId?.slice(0, 8)}...
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        {menuItems.map((item, index) => (
          <motion.div
            key={index}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: index * 0.1 }}
          >
            <div className="glass-effect rounded-xl p-4">
              <div className="flex items-center gap-3 mb-2">
                {item.icon}
                <span className="text-sm text-gray-400">{item.label}</span>
              </div>
              <div className={`text-lg font-bold ${item.color}`}>
                {item.value}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Detailed stats */}
      <div className="glass-effect rounded-2xl p-4 mb-6">
        <h3 className="font-bold mb-4">Статистика</h3>
        <div className="space-y-3">
          {[
            { label: 'Открыто кейсов', value: stats.totalCasesOpened || 0 },
            { label: 'Собрано скинов', value: stats.totalSkinsCollected || 0 },
            { label: 'Приглашено друзей', value: stats.totalReferrals || 0 },
            { label: 'Точность трейдов', value: `${stats.tradeAccuracy || 0}%` },
          ].map((stat, index) => (
            <div key={index} className="flex justify-between items-center">
              <span className="text-gray-400">{stat.label}</span>
              <span className="font-bold">{stat.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="space-y-3">
        {actions.map((action, index) => (
          <motion.div
            key={index}
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: index * 0.1 }}
          >
            <Button
              variant={action.variant || 'glass'}
              fullWidth
              className="justify-start h-14"
              icon={action.icon}
              onClick={action.onClick}
            >
              {action.label}
            </Button>
          </motion.div>
        ))}
      </div>
    </div>
  );
};