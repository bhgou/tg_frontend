import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { BalanceCard } from '../components/ui/BalanceCard';
import { DailyReward } from '../components/DailyReward';
import { QuickActions } from '../components/QuickActions';
import { CasesGrid } from '../components/cases/CasesGrid';
import { CaseOpeningAnimation } from '../components/cases/CaseOpeningAnimation';
import { useUserStore } from '../store/user.store';
import { useCaseStore } from '../store/case.store';
import { caseAPI, userAPI } from '../services/api';
import { useTelegram } from '../services/telegram';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { user, balance, updateBalance } = useUserStore();
  const { cases, setCases, setSelectedCase } = useCaseStore();
  const [isOpeningCase, setIsOpeningCase] = useState(false);
  const [loading, setLoading] = useState(true);
  const { showAlert } = useTelegram();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [casesData, userData] = await Promise.all([
        caseAPI.getCases(),
        userAPI.getProfile()
      ]);
      
      setCases(casesData.cases || []);
      updateBalance(userData.user?.balance || 0);
    } catch (error) {
      console.error('Failed to load data:', error);
      showAlert('Ошибка загрузки данных');
    } finally {
      setLoading(false);
    }
  };

  const handleAdWatch = async () => {
    try {
      showAlert('Просмотр рекламы запущен...');
      // После просмотра рекламы:
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
      navigate(`/case/${caseItem.id}`);
    }
  };

  // Удаляем неиспользуемую функцию handleOpenCase или используем ее:
  const handleOpenCase = async (caseItem: any) => {
    try {
      setIsOpeningCase(true);
      const response = await caseAPI.openCase(caseItem.id);
      updateBalance(response.newBalance);
      // Показываем анимацию открытия
    } catch (error) {
      console.error('Open case error:', error);
      showAlert('Недостаточно средств для открытия кейса');
    } finally {
      setIsOpeningCase(false);
    }
  };

  const handleCaseComplete = (reward: any) => {
    console.log('Case opened! Reward:', reward);
    // Обновляем инвентарь и т.д.
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
            variant="glass" 
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
            <div className="text-2xl font-bold text-cyan-400">42</div>
            <div className="text-sm text-gray-400">Открыто кейсов</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-400">15</div>
            <div className="text-sm text-gray-400">Собрано скинов</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-purple-400">8</div>
            <div className="text-sm text-gray-400">Приглашено друзей</div>
          </div>
        </div>
      </div>

      {/* Case opening animation */}
      <CaseOpeningAnimation
        isOpen={isOpeningCase}
        onComplete={handleCaseComplete}
        caseType={useCaseStore.getState().selectedCase?.type || 'standard'}
      />
    </div>
  );
};