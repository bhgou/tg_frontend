import React, { useState, useEffect } from 'react';
import { 
  BarChart3, Users, DollarSign, Package, 
  Settings, Download, TrendingUp, Award,
  Shield, Gift, Gamepad2, CreditCard
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useUserStore } from '../store/user.store';
import { adminAPI, AdminStatsResponse, AdminUsersResponse } from '../services/api';

const AdminPage: React.FC = () => {
  const { user } = useUserStore();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState<any>({});
  const [loading, setLoading] = useState(true);
  
  // Проверка прав администратора
  useEffect(() => {
    if (!user?.isAdmin) {
      window.location.href = '/';
      return;
    }
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getStats();
      setStats(response.stats || {});
    } catch (error) {
      console.error('Failed to load admin stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'dashboard', label: 'Дашборд', icon: <BarChart3 className="w-4 h-4" /> },
    { id: 'users', label: 'Пользователи', icon: <Users className="w-4 h-4" /> },
    { id: 'payments', label: 'Платежи', icon: <CreditCard className="w-4 h-4" /> },
    { id: 'cases', label: 'Кейсы', icon: <Package className="w-4 h-4" /> },
    { id: 'sponsors', label: 'Спонсоры', icon: <Award className="w-4 h-4" /> },
    { id: 'withdrawals', label: 'Выводы', icon: <DollarSign className="w-4 h-4" /> },
    { id: 'games', label: 'Игры', icon: <Gamepad2 className="w-4 h-4" /> },
    { id: 'settings', label: 'Настройки', icon: <Settings className="w-4 h-4" /> },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardContent stats={stats} />;
      case 'users':
        return <UsersContent />;
      case 'payments':
        return <PaymentsContent />;
      case 'cases':
        return <CasesContent />;
      case 'sponsors':
        return <SponsorsContent />;
      case 'withdrawals':
        return <WithdrawalsContent />;
      case 'games':
        return <GamesContent />;
      case 'settings':
        return <SettingsContent />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Sidebar */}
      <div className="fixed left-0 top-0 h-full w-64 bg-gray-800 border-r border-gray-700 p-4">
        <div className="mb-8">
          <h1 className="text-xl font-bold text-blue-400">Админ-панель</h1>
          <p className="text-sm text-gray-400">Skin Factory</p>
        </div>
        
        <div className="space-y-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:bg-gray-700'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        <div className="absolute bottom-4 left-4 right-4">
          <div className="flex items-center gap-3 p-3 bg-gray-700 rounded-lg">
            <Shield className="w-5 h-5 text-green-400" />
            <div>
              <div className="font-medium">{user?.username}</div>
              <div className="text-xs text-gray-400">Администратор</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="ml-64 p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold capitalize">
            {tabs.find(t => t.id === activeTab)?.label}
          </h2>
          <div className="flex gap-2">
            <Button variant="glass" icon={<Download className="w-4 h-4" />}>
              Экспорт
            </Button>
            <Button variant="primary" onClick={loadStats} loading={loading}>
              Обновить
            </Button>
          </div>
        </div>

        {renderContent()}
      </div>
    </div>
  );
};

// Компоненты для каждого таба
const DashboardContent: React.FC<{ stats: any }> = ({ stats }) => (
  <div className="space-y-6">
    {/* Статистика в карточках */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        title="Пользователи"
        value={stats.total_users || 0}
        change={stats.new_users_today || 0}
        icon={<Users className="w-6 h-6" />}
        color="blue"
      />
      <StatCard
        title="Доход"
        value={`${stats.total_revenue || 0} ₽`}
        change={`${stats.total_payments || 0} платежей`}
        icon={<DollarSign className="w-6 h-6" />}
        color="green"
      />
      <StatCard
        title="Выводы"
        value={stats.pending_withdrawals || 0}
        change={`${stats.completed_withdrawals || 0} завершено`}
        icon={<TrendingUp className="w-6 h-6" />}
        color="yellow"
      />
      <StatCard
        title="Активность"
        value={stats.transactions_today || 0}
        change={`${stats.games_today || 0} игр сегодня`}
        icon={<BarChart3 className="w-6 h-6" />}
        color="purple"
      />
    </div>

    {/* Графики */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card className="p-6">
        <h3 className="text-lg font-bold mb-4">Доходы по дням</h3>
        <div className="h-64 flex items-end gap-2">
          {[...Array(7)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ height: 0 }}
              animate={{ height: `${Math.random() * 80 + 20}%` }}
              className="flex-1 bg-gradient-to-t from-blue-600 to-cyan-400 rounded-t"
            />
          ))}
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-bold mb-4">Топ спонсоров</h3>
        <div className="space-y-3">
          {['CS:GO Empire', 'CSGORoll', 'HellCase', 'CSGOFast'].map((sponsor, i) => (
            <div key={i} className="flex items-center justify-between p-3 bg-gray-800 rounded">
              <div className="flex items-center gap-3">
                <Award className="w-5 h-5 text-yellow-400" />
                <span>{sponsor}</span>
              </div>
              <div className="text-right">
                <div className="font-bold">1,234 подписчика</div>
                <div className="text-sm text-gray-400">500 наград выдано</div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>

    {/* Быстрые действия */}
    <Card className="p-6">
      <h3 className="text-lg font-bold mb-4">Быстрые действия</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Button variant="glass" fullWidth icon={<Gift className="w-4 h-4" />}>
          Добавить кейс
        </Button>
        <Button variant="glass" fullWidth icon={<Users className="w-4 h-4" />}>
          Добавить спонсора
        </Button>
        <Button variant="glass" fullWidth icon={<Settings className="w-4 h-4" />}>
          Настройки
        </Button>
        <Button variant="glass" fullWidth icon={<Download className="w-4 h-4" />}>
          Экспорт данных
        </Button>
      </div>
    </Card>
  </div>
);

const StatCard: React.FC<{
  title: string;
  value: string | number;
  change: string | number;
  icon: React.ReactNode;
  color: string;
}> = ({ title, value, change, icon, color }) => {
  const colorClasses = {
    blue: 'bg-blue-500/20 text-blue-400',
    green: 'bg-green-500/20 text-green-400',
    yellow: 'bg-yellow-500/20 text-yellow-400',
    purple: 'bg-purple-500/20 text-purple-400',
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-lg ${colorClasses[color as keyof typeof colorClasses]}`}>
          {icon}
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold">{value}</div>
          <div className="text-sm text-gray-400">{title}</div>
        </div>
      </div>
      <div className="text-sm text-gray-300">
        <span className="text-green-400">+{change}</span> за сегодня
      </div>
    </Card>
  );
};

const UsersContent: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const response = await adminAPI.getUsers({ search });
      setUsers(response.users || []);
    } catch (error) {
      console.error('Failed to load users:', error);
    }
  };

  return (
    <div>
      <div className="mb-6 flex gap-4">
        <input
          type="text"
          placeholder="Поиск пользователей..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg"
        />
        <Button onClick={loadUsers}>Поиск</Button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-700">
              <th className="py-3 px-4 text-left">ID</th>
              <th className="py-3 px-4 text-left">Telegram</th>
              <th className="py-3 px-4 text-left">Баланс</th>
              <th className="py-3 px-4 text-left">Премиум</th>
              <th className="py-3 px-4 text-left">Траты</th>
              <th className="py-3 px-4 text-left">Дата регистрации</th>
              <th className="py-3 px-4 text-left">Действия</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-b border-gray-800 hover:bg-gray-800/50">
                <td className="py-3 px-4">{user.id}</td>
                <td className="py-3 px-4">
                  <div>
                    <div className="font-medium">@{user.username}</div>
                    <div className="text-sm text-gray-400">{user.telegram_id}</div>
                  </div>
                </td>
                <td className="py-3 px-4">
                  <div className="font-bold text-yellow-400">{user.balance} CR</div>
                </td>
                <td className="py-3 px-4">
                  <div className="font-bold text-blue-400">{user.premium_balance} GC</div>
                </td>
                <td className="py-3 px-4">
                  <div className="font-bold text-green-400">{user.total_spent_rub || 0} ₽</div>
                </td>
                <td className="py-3 px-4">
                  <div className="text-sm text-gray-400">
                    {new Date(user.created_at).toLocaleDateString()}
                  </div>
                </td>
                <td className="py-3 px-4">
                  <Button size="sm">Управление</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const PaymentsContent: React.FC = () => (
  <div>
    <h3 className="text-lg font-bold mb-4">Платежи</h3>
    <div className="space-y-3">
      {[1, 2, 3, 4, 5].map((i) => (
        <Card key={i} className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-bold">Пополнение 1000 GC</div>
              <div className="text-sm text-gray-400">@user{i} • 99 ₽</div>
            </div>
            <div className="text-right">
              <div className="font-bold text-green-400">Завершено</div>
              <div className="text-sm text-gray-400">5 минут назад</div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  </div>
);

const CasesContent: React.FC = () => (
  <div>
    <div className="flex justify-between items-center mb-6">
      <h3 className="text-lg font-bold">Управление кейсами</h3>
      <Button variant="primary">+ Добавить кейс</Button>
    </div>
    
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {['Бесплатный', 'Стандартный', 'Премиум', 'Фрагментный', 'Золотой'].map((name, i) => (
        <Card key={i} className="p-4">
          <div className="flex items-center gap-3 mb-3">
            <Package className="w-6 h-6 text-blue-400" />
            <div>
              <div className="font-bold">{name} кейс</div>
              <div className="text-sm text-gray-400">500 открытий</div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="glass">Редактировать</Button>
            <Button size="sm" variant="glass">Статистика</Button>
          </div>
        </Card>
      ))}
    </div>
  </div>
);

const SponsorsContent: React.FC = () => (
  <div>
    <div className="flex justify-between items-center mb-6">
      <h3 className="text-lg font-bold">Спонсоры</h3>
      <Button variant="primary">+ Добавить спонсора</Button>
    </div>

    <div className="space-y-4">
      {[
        { name: 'CS:GO Empire', subscribers: 1234, rewards: 500 },
        { name: 'CSGORoll', subscribers: 987, rewards: 300 },
        { name: 'HellCase', subscribers: 654, rewards: 200 },
        { name: 'CSGOFast', subscribers: 432, rewards: 150 },
      ].map((sponsor, i) => (
        <Card key={i} className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-lg flex items-center justify-center">
                <Award className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="font-bold">{sponsor.name}</div>
                <div className="text-sm text-gray-400">@csgoempire • Приоритет: {i + 1}</div>
              </div>
            </div>
            <div className="text-right">
              <div className="font-bold">{sponsor.subscribers} подписчиков</div>
              <div className="text-sm text-gray-400">{sponsor.rewards} наград выдано</div>
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <Button size="sm" variant="glass" fullWidth>Редактировать</Button>
            <Button size="sm" variant="glass" fullWidth>Статистика</Button>
          </div>
        </Card>
      ))}
    </div>
  </div>
);

const WithdrawalsContent: React.FC = () => (
  <div>
    <h3 className="text-lg font-bold mb-4">Заявки на вывод</h3>
    
    <div className="grid grid-cols-4 gap-4 mb-6">
      <Card className="p-4 text-center">
        <div className="text-2xl font-bold text-yellow-400">5</div>
        <div className="text-sm text-gray-400">Ожидают</div>
      </Card>
      <Card className="p-4 text-center">
        <div className="text-2xl font-bold text-blue-400">12</div>
        <div className="text-sm text-gray-400">В обработке</div>
      </Card>
      <Card className="p-4 text-center">
        <div className="text-2xl font-bold text-green-400">48</div>
        <div className="text-sm text-gray-400">Завершено</div>
      </Card>
      <Card className="p-4 text-center">
        <div className="text-2xl font-bold text-red-400">3</div>
        <div className="text-sm text-gray-400">Отклонено</div>
      </Card>
    </div>

    <div className="space-y-3">
      {[1, 2, 3].map((i) => (
        <Card key={i} className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-bold">AK-47 | Redline</div>
              <div className="text-sm text-gray-400">@user{i} • 45.50 $ • 5/5 фрагментов</div>
            </div>
            <div className="text-right">
              <div className={`font-bold ${
                i === 1 ? 'text-yellow-400' : 
                i === 2 ? 'text-blue-400' : 'text-green-400'
              }`}>
                {i === 1 ? 'Ожидает' : i === 2 ? 'В обработке' : 'Завершено'}
              </div>
              <div className="text-sm text-gray-400">2 часа назад</div>
            </div>
          </div>
          {i === 1 && (
            <div className="flex gap-2 mt-4">
              <Button size="sm" variant="success">Принять</Button>
              <Button size="sm" variant="danger">Отклонить</Button>
              <Button size="sm" variant="glass">Подробнее</Button>
            </div>
          )}
        </Card>
      ))}
    </div>
  </div>
);

const GamesContent: React.FC = () => (
  <div>
    <h3 className="text-lg font-bold mb-4">Мини-игры</h3>
    
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {[
        { name: 'Кости', plays: 1243, profit: 2450 },
        { name: 'Рулетка', plays: 876, profit: 4320 },
        { name: 'Слоты', plays: 1567, profit: 5670 },
        { name: 'Орёл/Решка', plays: 2345, profit: 1230 },
      ].map((game, i) => (
        <Card key={i} className="p-4">
          <div className="flex items-center gap-3 mb-3">
            <Gamepad2 className="w-6 h-6 text-purple-400" />
            <div>
              <div className="font-bold">{game.name}</div>
              <div className="text-sm text-gray-400">{game.plays} игр</div>
            </div>
          </div>
          <div className="text-right">
            <div className="font-bold text-green-400">+{game.profit} GC</div>
            <div className="text-sm text-gray-400">прибыль</div>
          </div>
        </Card>
      ))}
    </div>

    <Card className="p-6">
      <h4 className="font-bold mb-4">Статистика по играм</h4>
      <div className="space-y-4">
        {[
          { time: 'Сегодня', bets: 1234, wins: 456, profit: 2345 },
          { time: 'Неделя', bets: 8765, wins: 3210, profit: 15678 },
          { time: 'Месяц', bets: 34567, wins: 12345, profit: 67890 },
        ].map((stat, i) => (
          <div key={i} className="flex items-center justify-between p-3 bg-gray-800 rounded">
            <div className="font-medium">{stat.time}</div>
            <div className="text-right">
              <div>{stat.bets} ставок • {stat.wins} выигрышей</div>
              <div className="text-green-400 font-bold">+{stat.profit} GC прибыль</div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  </div>
);

const SettingsContent: React.FC = () => {
  const [settings, setSettings] = useState([
    { key: 'premium_currency_name', value: 'GC', label: 'Название валюты' },
    { key: 'exchange_rate', value: '10', label: 'Курс (1 GC = X RUB)' },
    { key: 'withdrawal_fee', value: '5', label: 'Комиссия за вывод (%)' },
    { key: 'referral_bonus', value: '200', label: 'Бонус за реферала' },
    { key: 'daily_reward_base', value: '100', label: 'Базовая ежедневная награда' },
  ]);

  return (
    <div>
      <h3 className="text-lg font-bold mb-4">Настройки приложения</h3>
      
      <Card className="p-6">
        <div className="space-y-4">
          {settings.map((setting, i) => (
            <div key={i} className="flex items-center justify-between">
              <div>
                <div className="font-medium">{setting.label}</div>
                <div className="text-sm text-gray-400">{setting.key}</div>
              </div>
              <input
                type="text"
                value={setting.value}
                onChange={(e) => {
                  const newSettings = [...settings];
                  newSettings[i].value = e.target.value;
                  setSettings(newSettings);
                }}
                className="w-32 px-3 py-2 bg-gray-800 border border-gray-700 rounded"
              />
            </div>
          ))}
        </div>
        
        <div className="flex gap-2 mt-6">
          <Button variant="primary">Сохранить настройки</Button>
          <Button variant="glass">Сбросить</Button>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <Card className="p-6">
          <h4 className="font-bold mb-4">Экспорт данных</h4>
          <div className="space-y-2">
            <Button variant="glass" fullWidth icon={<Download className="w-4 h-4" />}>
              Экспорт пользователей
            </Button>
            <Button variant="glass" fullWidth icon={<Download className="w-4 h-4" />}>
              Экспорт платежей
            </Button>
            <Button variant="glass" fullWidth icon={<Download className="w-4 h-4" />}>
              Экспорт выводов
            </Button>
          </div>
        </Card>

        <Card className="p-6">
          <h4 className="font-bold mb-4">Система</h4>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span>Статус базы данных</span>
              <span className="text-green-400">✓ Активна</span>
            </div>
            <div className="flex justify-between">
              <span>Версия API</span>
              <span>2.0.0</span>
            </div>
            <div className="flex justify-between">
              <span>Пользователей онлайн</span>
              <span>42</span>
            </div>
            <Button variant="danger" fullWidth className="mt-4">
              Очистить кеш
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AdminPage;