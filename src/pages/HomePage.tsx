import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  CreditCard, Gamepad2, Award, 
  TrendingUp, Gift, Users 
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { BalanceCard } from '../components/ui/BalanceCard';
import { DailyReward } from '../components/DailyReward';
import { CasesGrid } from '../components/cases/CasesGrid';
import { Card } from '../components/ui/Card';
import { useUserStore } from '../store/user.store';
import { useCaseStore } from '../store/case.store';
import { caseAPI, userAPI, paymentAPI, gameAPI } from '../services/api';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { user, balance, premiumBalance, updateBalance } = useUserStore();
  const { cases, setCases } = useCaseStore();
  const [premiumPackages, setPremiumPackages] = useState<any[]>([]);
  const [games, setGames] = useState<any[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [casesResponse, packagesResponse, gamesResponse] = await Promise.all([
        caseAPI.getCases(),
        paymentAPI.getPackages(),
        gameAPI.getGames()
      ]);
      
      if (casesResponse.success) {
        setCases(casesResponse.cases || []);
      }
      
      if (packagesResponse.success) {
        setPremiumPackages(packagesResponse.packages || []);
      }
      
      if (gamesResponse.success) {
        setGames(gamesResponse.games || []);
      }
    } catch (error) {
      console.error('Failed to load data:', error);
    }
  };

  const handleBuyPremium = (packageId: number) => {
    navigate(`/payment/${packageId}`);
  };

  const handlePlayGame = (gameType: string) => {
    navigate(`/games/${gameType}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white p-4 pb-20">
      {/* Балансы */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <BalanceCard 
          balance={balance} 
          title="Основной баланс"
          currency="CR"
          icon="💰"
        />
        <BalanceCard 
          balance={premiumBalance} 
          title="Премиум баланс"
          currency="GC"
          icon="💎"
          color="purple"
        />
      </div>

      {/* Быстрые действия */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <Button 
          variant="glass"
          className="h-20 flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-blue-600 to-cyan-500"
          onClick={() => navigate('/payment')}
        >
          <CreditCard className="w-6 h-6" />
          <span>Пополнить</span>
        </Button>
        
        <Button 
          variant="glass"
          className="h-20 flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-purple-600 to-pink-500"
          onClick={() => navigate('/games')}
        >
          <Gamepad2 className="w-6 h-6" />
          <span>Игры</span>
        </Button>
        
        <Button 
          variant="glass"
          className="h-20 flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-green-600 to-emerald-500"
          onClick={() => navigate('/sponsors')}
        >
          <Award className="w-6 h-6" />
          <span>Спонсоры</span>
        </Button>
        
        <Button 
          variant="glass"
          className="h-20 flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-yellow-600 to-orange-500"
          onClick={() => navigate('/referrals')}
        >
          <Users className="w-6 h-6" />
          <span>Рефералы</span>
        </Button>
      </div>

      {/* Ежедневная награда */}
      <DailyReward />

      {/* Популярные игры */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Быстрые игры</h2>
          <Button size="sm" onClick={() => navigate('/games')}>
            Все игры
          </Button>
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          {games.slice(0, 4).map((game) => (
            <Card 
              key={game.id}
              hoverable
              className="p-4 text-center"
              onClick={() => handlePlayGame(game.type)}
            >
              <Gamepad2 className="w-8 h-8 mx-auto mb-2 text-purple-400" />
              <h3 className="font-bold">{game.name}</h3>
              <p className="text-sm text-gray-400">Множитель: {game.win_multiplier}x</p>
              <div className="text-xs text-gray-500 mt-2">
                Ставка: {game.min_bet}-{game.max_bet} GC
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Кейсы */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Кейсы</h2>
          <Button size="sm" onClick={() => navigate('/cases')}>
            Все кейсы
          </Button>
        </div>
        
        <CasesGrid 
          cases={cases.slice(0, 4)} 
          onSelectCase={(caseItem) => navigate(`/cases/${caseItem.id}`)}
        />
      </div>

      {/* Пакеты премиум валюты */}
      <div className="mb-6">
        <h2 className="text-xl font-bold mb-4">Пополнение баланса</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {premiumPackages.map((pkg) => (
            <Card 
              key={pkg.id}
              className={`p-6 ${pkg.popular ? 'border-2 border-yellow-500' : ''}`}
            >
              {pkg.popular && (
                <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                  <span className="bg-yellow-500 text-black text-xs font-bold px-3 py-1 rounded-full">
                    ПОПУЛЯРНО
                  </span>
                </div>
              )}
              
              <div className="text-center mb-4">
                <div className="text-3xl font-bold text-blue-400">{pkg.premium + pkg.bonus} GC</div>
                <div className="text-lg font-bold">{pkg.rub} ₽</div>
                {pkg.bonus > 0 && (
                  <div className="text-sm text-green-400 mt-1">
                    +{pkg.bonus} GC бонус!
                  </div>
                )}
              </div>
              
              <Button 
                variant={pkg.popular ? 'primary' : 'glass'}
                fullWidth
                onClick={() => handleBuyPremium(pkg.id)}
              >
                Купить
              </Button>
            </Card>
          ))}
        </div>
      </div>

      {/* Статистика */}
      <Card className="p-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-cyan-400">0</div>
            <div className="text-sm text-gray-400">Открыто кейсов</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-400">0</div>
            <div className="text-sm text-gray-400">Выиграно в играх</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-purple-400">0</div>
            <div className="text-sm text-gray-400">Получено наград</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-yellow-400">0</div>
            <div className="text-sm text-gray-400">Приглашено друзей</div>
          </div>
        </div>
      </Card>
    </div>
  );
};