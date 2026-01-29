import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { BalanceCard } from '../components/ui/BalanceCard';
import { DailyReward } from '../components/DailyReward';
import { QuickActions } from '../components/QuickActions';
import { CasesGrid } from '../components/cases/CasesGrid';
import { useUserStore } from '../store/user.store';
import { useCaseStore } from '../store/case.store';
import { caseAPI, userAPI } from '../services/api';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { user, balance, updateBalance } = useUserStore();
  const { cases, setCases, setSelectedCase } = useCaseStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [casesResponse, userResponse] = await Promise.all([
        caseAPI.getCases(),
        userAPI.getProfile()
      ]);
      
      if (casesResponse.success) {
        setCases(casesResponse.cases || []);
      }
      
      if (userResponse.success && userResponse.user) {
        updateBalance(userResponse.user.balance || 0);
      }
    } catch (error) {
      console.error('Failed to load data:', error);
      // Тестовые данные при ошибке
      setCases([
        { 
          id: 1, 
          name: 'Бесплатный кейс', 
          type: 'ad', 
          price: null, 
          imageUrl: null,
          description: 'Открывается после просмотра рекламы' 
        },
        { 
          id: 2, 
          name: 'Стандартный кейс', 
          type: 'standard', 
          price: 500, 
          imageUrl: null,
          description: 'Обычные и редкие скины' 
        },
        { 
          id: 3, 
          name: 'Премиум кейс', 
          type: 'premium', 
          price: 1500, 
          imageUrl: null,
          description: 'Редкие и легендарные скины' 
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleAdWatch = async () => {
    try {
      alert('🎬 Реклама запущена...\n\nПосле просмотра вы получите награду!');
      // Здесь должна быть логика просмотра рекламы
      // После успешного просмотра:
      // const reward = await api.post('/rewards/watch-ad');
      // updateBalance(reward.newBalance);
    } catch (error) {
      console.error('Ad watch error:', error);
    }
  };

  const handleCaseSelect = (caseItem: any) => {
    setSelectedCase(caseItem);
    if (caseItem.type === 'ad') {
      handleAdWatch();
    } else {
      // Для платных кейсов переходим на страницу кейса
      navigate(`/cases/${caseItem.id}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white p-4 pb-20">
      {/* Header with balance */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              Skin Factory
            </h1>
            <p className="text-gray-400">Добро пожаловать, {user?.username || 'Игрок'}!</p>
          </div>
          <BalanceCard balance={balance} />
        </div>
      </div>

      {/* Daily reward */}
      <DailyReward />

      {/* Quick actions */}
      <QuickActions onWatchAd={handleAdWatch} />

      {/* Available cases */}
      <div className="mt-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Доступные кейсы</h2>
          <Button 
            variant="secondary" 
            size="sm"
            onClick={() => navigate('/cases')}
          >
            Все кейсы
          </Button>
        </div>
        
        {loading ? (
          <div className="grid grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-48 rounded-2xl bg-gray-800/50 animate-pulse" />
            ))}
          </div>
        ) : (
          <CasesGrid cases={cases} onSelectCase={handleCaseSelect} />
        )}
      </div>

      {/* Stats */}
      <div className="mt-8 backdrop-blur-lg bg-white/10 border border-white/20 rounded-2xl p-4">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-cyan-400">0</div>
            <div className="text-sm text-gray-400">Открыто кейсов</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-400">0</div>
            <div className="text-sm text-gray-400">Собрано скинов</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-purple-400">0</div>
            <div className="text-sm text-gray-400">Приглашено друзей</div>
          </div>
        </div>
      </div>
    </div>
  );
};