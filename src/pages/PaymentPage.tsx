import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, CreditCard, Shield, Check, Gift } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { useUserStore } from '../store/user.store';
import { paymentAPI } from '../services/api';

const PaymentPage: React.FC = () => {
  const { packageId } = useParams<{ packageId: string }>();
  const navigate = useNavigate();
  const { addPremiumBalance } = useUserStore();
  const [packages, setPackages] = useState<any[]>([]);
  const [selectedPackage, setSelectedPackage] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');

  useEffect(() => {
    loadPackages();
  }, []);

  useEffect(() => {
    if (packageId && packages.length > 0) {
      const pkg = packages.find(p => p.id === Number(packageId));
      setSelectedPackage(pkg || packages[0]);
    }
  }, [packageId, packages]);

  const loadPackages = async () => {
    try {
      const response = await paymentAPI.getPackages();
      setPackages(response.packages || []);
      if (response.packages?.length > 0 && !packageId) {
        setSelectedPackage(response.packages[0]);
      }
    } catch (error) {
      console.error('Failed to load packages:', error);
      // Демо данные
      setPackages([
        { id: 1, rub: 99, premium: 1000, bonus: 100, popular: true },
        { id: 2, rub: 299, premium: 3500, bonus: 500, popular: false },
        { id: 3, rub: 599, premium: 7500, bonus: 1500, popular: true },
        { id: 4, rub: 1199, premium: 16000, bonus: 4000, popular: false },
        { id: 5, rub: 2999, premium: 45000, bonus: 15000, popular: true },
      ]);
    }
  };

  const handlePayment = async () => {
    if (!selectedPackage) return;
    
    try {
      setLoading(true);
      setPaymentStatus('processing');
      
      // Создаем платеж
      const response = await paymentAPI.createPayment({
        package_id: selectedPackage.id,
        payment_method: 'demo' // В демо режиме
      });
      
      if (response.success) {
        // В демо режиме сразу зачисляем
        if (response.demo) {
          addPremiumBalance(selectedPackage.premium + selectedPackage.bonus);
          setPaymentStatus('success');
          
          // Через 3 секунды возвращаемся
          setTimeout(() => {
            navigate('/');
          }, 3000);
        } else {
          // В реальном режиме перенаправляем на страницу оплаты
          window.location.href = response.payment_url;
        }
      }
    } catch (error) {
      console.error('Payment error:', error);
      setPaymentStatus('error');
    } finally {
      setLoading(false);
    }
  };

  const paymentMethods = [
    { id: 'card', name: 'Банковская карта', icon: '💳' },
    { id: 'qiwi', name: 'QIWI', icon: '🧡' },
    { id: 'yoomoney', name: 'ЮMoney', icon: '💰' },
    { id: 'crypto', name: 'Криптовалюта', icon: '₿' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white p-4">
      <Button
        variant="glass"
        size="sm"
        icon={<ArrowLeft className="w-4 h-4" />}
        onClick={() => navigate('/')}
        className="mb-6"
      >
        Назад
      </Button>

      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-2 text-center">Пополнение баланса</h1>
        <p className="text-gray-400 text-center mb-8">Выберите удобный способ оплаты</p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Левая колонка - пакеты */}
          <div>
            <h2 className="text-xl font-bold mb-4">Выберите сумму</h2>
            <div className="space-y-3">
              {packages.map((pkg) => (
                <Card
                  key={pkg.id}
                  className={`p-4 cursor-pointer transition-all ${
                    selectedPackage?.id === pkg.id
                      ? 'border-2 border-blue-500 bg-blue-500/10'
                      : 'hover:border-gray-600'
                  } ${pkg.popular ? 'relative' : ''}`}
                  onClick={() => setSelectedPackage(pkg)}
                >
                  {pkg.popular && (
                    <div className="absolute -top-2 -right-2">
                      <span className="bg-yellow-500 text-black text-xs font-bold px-2 py-1 rounded">
                        ПОПУЛЯРНО
                      </span>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-bold text-lg">
                        {pkg.premium + pkg.bonus} <Shield className="w-4 h-4 inline text-purple-400" /> GC
                      </div>
                      <div className="text-gray-400 text-sm">
                        {pkg.rub} ₽ {pkg.bonus > 0 && `(+${pkg.bonus} GC бонус)`}
                      </div>
                    </div>
                    {selectedPackage?.id === pkg.id && (
                      <Check className="w-5 h-5 text-green-400" />
                    )}
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Правая колонка - оплата */}
          <div>
            <h2 className="text-xl font-bold mb-4">Способ оплаты</h2>
            <div className="grid grid-cols-2 gap-3 mb-6">
              {paymentMethods.map((method) => (
                <Card
                  key={method.id}
                  className="p-4 text-center cursor-pointer hover:border-gray-600 transition-colors"
                >
                  <div className="text-2xl mb-2">{method.icon}</div>
                  <div className="text-sm">{method.name}</div>
                </Card>
              ))}
            </div>

            {/* Итог */}
            <Card className="p-6 mb-6">
              <h3 className="font-bold mb-4">Итог</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">Сумма:</span>
                  <span className="font-bold">{selectedPackage?.rub || 0} ₽</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Получите:</span>
                  <span className="font-bold text-blue-400">
                    {selectedPackage?.premium || 0} GC
                  </span>
                </div>
                {selectedPackage?.bonus > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Бонус:</span>
                    <span className="font-bold text-green-400">
                      +{selectedPackage?.bonus} GC
                    </span>
                  </div>
                )}
                <div className="border-t border-gray-700 pt-3">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Всего:</span>
                    <span className="text-yellow-400">
                      {(selectedPackage?.premium || 0) + (selectedPackage?.bonus || 0)} GC
                    </span>
                  </div>
                </div>
              </div>
            </Card>

            {/* Кнопка оплаты */}
            <Button
              variant="primary"
              size="xl"
              loading={loading}
              onClick={handlePayment}
              disabled={!selectedPackage || loading}
              className="w-full py-4"
              icon={<CreditCard className="w-5 h-5" />}
            >
              {loading ? 'Обработка...' : 'Перейти к оплате'}
            </Button>

            {/* Сообщения о статусе */}
            {paymentStatus === 'success' && (
              <Card className="mt-4 p-4 bg-green-900/30 border border-green-500/30">
                <div className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-green-400" />
                  <div>
                    <div className="font-bold">Оплата успешна!</div>
                    <div className="text-sm text-gray-300">
                      Баланс пополнен на {selectedPackage?.premium + selectedPackage?.bonus} GC
                    </div>
                  </div>
                </div>
              </Card>
            )}

            {paymentStatus === 'error' && (
              <Card className="mt-4 p-4 bg-red-900/30 border border-red-500/30">
                <div className="flex items-center gap-3">
                  <div className="text-red-400">⚠️</div>
                  <div>
                    <div className="font-bold">Ошибка оплаты</div>
                    <div className="text-sm text-gray-300">
                      Попробуйте еще раз или выберите другой способ оплаты
                    </div>
                  </div>
                </div>
              </Card>
            )}

            {/* Информация о безопасности */}
            <div className="mt-6 text-center text-sm text-gray-400">
              <p>💳 Оплата защищена SSL-шифрованием</p>
              <p>⚡ Мгновенное зачисление</p>
              <p>🛡️ Безопасная обработка платежей</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;